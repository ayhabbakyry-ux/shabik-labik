const fs = require('fs');
const file = 'src/app/api/orders/route.ts';
let code = fs.readFileSync(file, 'utf8');

let start = code.indexOf("if (outerStatus");
if (start === -1) start = code.indexOf("console.log('Final Decision");
let end = code.indexOf("} catch", start);

if (start !== -1 && end !== -1 && code.includes('export async function')) {
    const newLogic = `
    const exactStatus = String(innerStatus || outerStatus || "").trim();
    console.log('API_DEBUG -> Status:', exactStatus);

    if (exactStatus === 'قبول' || exactStatus === 'مكتمل' || exactStatus === 'نجاح') {
        return NextResponse.json({ success: true, status_type: 'completed', message: 'تم تنفيذ الطلب بنجاح', order_id: data?.order_id || (innerData ? innerData['رقم_الطلب'] : "") });
    } else if (exactStatus === 'انتظار') {
        return NextResponse.json({ success: true, status_type: 'pending', message: 'الطلب قيد الانتظار، تم حجز الرصيد', order_id: data?.order_id || (innerData ? innerData['رقم_الطلب'] : "") });
    } else if (exactStatus === 'رفض') {
        return NextResponse.json({ success: false, message: message || 'تم رفض الطلب من السيرفر وعاد الرصيد' });
    } else {
        // حجز الرصيد كأمان في حال أرسل السيرفر حالة غير مفهومة
        return NextResponse.json({ success: true, status_type: 'pending', message: 'الطلب قيد المعالجة (حالة غير معروفة: ' + exactStatus + ')' });
    }
    `;
    fs.writeFileSync(file, code.substring(0, start) + newLogic + "\n    " + code.substring(end));
    console.log("✅ تم استرجاع الملف وإصلاح الكود بنجاح يا أيهم!");
} else {
    console.log("⚠️ تم استرجاع الملف لنسخته السليمة، لكن لم يتم تطبيق التعديل التلقائي.");
}
