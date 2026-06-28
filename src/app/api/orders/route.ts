
    // قراءة الردود بالحرف حسب توثيق الراغب
    const apiSuccess = data["الحالة"] === "موافق" || (innerData && innerData["الحالة"] === "موافق");
    const exactStatus = (innerStatus || outerStatus || "").trim();

    console.log('API_DEBUG -> Success:', apiSuccess, 'Status:', exactStatus);

    if (exactStatus === 'قبول') {
        return NextResponse.json({ 
            success: true, 
            status_type: 'completed', 
            message: 'تم تنفيذ الطلب بنجاح',
            order_id: data.order_id || (innerData ? innerData['رقم_الطلب'] : "")
        });
    } else if (exactStatus === 'انتظار') {
        return NextResponse.json({ 
            success: true, 
            status_type: 'pending', 
            message: 'الطلب قيد الانتظار، تم حجز الرصيد',
            order_id: data.order_id || (innerData ? innerData['رقم_الطلب'] : "")
        });
    } else if (exactStatus === 'رفض') {
        return NextResponse.json({ 
            success: false, 
            message: message || 'تم رفض الطلب من السيرفر وعاد الرصيد' 
        });
    } else {
        // احتياط: إذا كانت الحالة غير معروفة بس الخصم شغال بنعتبرها انتظار عشان ما يضيع الرصيد
        return NextResponse.json({ 
            success: true, 
            status_type: 'pending', 
            message: 'الطلب قيد المعالجة (حالة غير معروفة: ' + exactStatus + ')'
        });
    }
} catch (error: any) {
        console.error("Critical Order API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
