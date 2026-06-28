const { execSync } = require('child_process');
const fs = require('fs');

const file = 'src/app/api/orders/route.ts';

// 1. البحث عن آخر نسخة سليمة من الملف في Git
console.log("جارٍ البحث عن نسخة سليمة للملف في السجل...");
const commits = execSync(`git rev-list HEAD -- ${file}`).toString().trim().split('\n');
let restored = false;

for (const commit of commits) {
    try {
        const content = execSync(`git show ${commit}:${file}`).toString();
        // التأكد أن النسخة تحتوي على الأقواس السليمة
        if (content.includes('try {') && content.includes('} catch')) {
            execSync(`git checkout ${commit} -- ${file}`);
            console.log("✅ تم استرجاع النسخة السليمة بنجاح!");
            restored = true;
            break;
        }
    } catch (e) {}
}

if (!restored) {
    console.log("❌ لم أتمكن من العثور على نسخة سليمة. يرجى التراجع يدوياً.");
    process.exit(1);
}

// 2. تطبيق حالات الراغب بدقة عالية
let code = fs.readFileSync(file, 'utf8');
let startIdx = code.indexOf("console.log('Final Decision");
if (startIdx === -1) startIdx = code.indexOf("if (outerStatus");
let catchIdx = code.lastIndexOf("} catch");

if (startIdx !== -1 && catchIdx !== -1 && catchIdx > startIdx) {
    const newLogic = `
        const exactStatus = String((typeof innerStatus !== 'undefined' && innerStatus) ? innerStatus : ((typeof outerStatus !== 'undefined' && outerStatus) ? outerStatus : "")).trim();
        const responseMsg = typeof message !== 'undefined' ? message : "";
        const orderId = (typeof data !== 'undefined' && data?.order_id) ? data.order_id : ((typeof innerData !== 'undefined' && innerData) ? innerData['رقم_الطلب'] : "");

        console.log('API_DEBUG -> Status:', exactStatus);

        if (exactStatus === 'قبول' || exactStatus === 'موافق') {
            return NextResponse.json({ success: true, status_type: 'completed', message: 'تم تنفيذ الطلب بنجاح', order_id: orderId });
        } else if (exactStatus === 'انتظار') {
            return NextResponse.json({ success: true, status_type: 'pending', message: 'الطلب قيد الانتظار، تم حجز الرصيد', order_id: orderId });
        } else if (exactStatus === 'رفض') {
            return NextResponse.json({ success: false, message: responseMsg || 'تم رفض الطلب من السيرفر وعاد الرصيد' });
        } else {
            return NextResponse.json({ success: true, status_type: 'pending', message: 'الطلب قيد المعالجة (حالة غير معروفة: ' + exactStatus + ')', order_id: orderId });
        }
    \n    `;
    
    code = code.substring(0, startIdx) + newLogic + code.substring(catchIdx);
    fs.writeFileSync(file, code);
    console.log("✅ تم حقن كود حالات الراغب (قبول، انتظار، رفض) بنجاح!");
} else {
    console.log("⚠️ تم استرجاع الملف، لكن لم يتم حقن التعديل. الملف سليم الآن على الأقل.");
}
