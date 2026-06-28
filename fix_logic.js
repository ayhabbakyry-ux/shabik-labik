const fs = require('fs');
const file = 'src/app/api/orders/route.ts';
let code = fs.readFileSync(file, 'utf8');

const startIdx = code.indexOf("const statusText =");
const catchIdx = code.indexOf("} catch");

if (startIdx !== -1 && catchIdx !== -1) {
    const freshLogic = `const statusText = String(innerStatus || outerStatus || "").trim();
    console.log('API_DEBUG -> Final Clean Status:', statusText);

    if (statusText === 'قبول' || statusText === 'موافق' || statusText === 'مكتمل') {
        return NextResponse.json({ success: true, status_type: 'completed', message: 'تم تنفيذ الطلب بنجاح', order_id: data?.order_id || (innerData ? innerData['رقم_الطلب'] : "") });
    } else if (statusText === 'انتظار' || statusText === '') {
        return NextResponse.json({ success: true, status_type: 'pending', message: 'الطلب قيد الانتظار في سيرفر الراغب، تم حجز الرصيد بنجاح', order_id: data?.order_id || (innerData ? innerData['رقم_الطلب'] : "") });
    } else if (statusText === 'رفض') {
        return NextResponse.json({ success: false, message: message || 'تم رفض الطلب من السيرفر وعاد الرصيد' });
    } else {
        return NextResponse.json({ success: true, status_type: 'pending', message: 'جاري معالجة الطلب (حالة: ' + statusText + ')', order_id: data?.order_id || (innerData ? innerData['رقم_الطلب'] : "") });
    }
    `;
    code = code.substring(0, startIdx) + freshLogic + "\n" + code.substring(catchIdx);
    fs.writeFileSync(file, code);
    console.log("✅ تم تحديث الكود بنجاح يا معلم!");
} else {
    console.log("❌ لم يتم تحديد موقع الكود بدقة لتعديله.");
}
