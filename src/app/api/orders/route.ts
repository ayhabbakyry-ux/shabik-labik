
    console.log('API_DEBUG: outerStatus=', outerStatus, 'innerStatus=', innerStatus, 'message=', message);
    
    // تصنيف الحالة بناءً على ما يصل فعلياً
    const fullText = (String(outerStatus) + String(innerStatus) + String(message)).toLowerCase();
    
    if (fullText.includes('مكتمل') || fullText.includes('نجاح') || fullText.includes('مقبول')) {
        return NextResponse.json({ success: true, status_type: 'completed', message: 'تم التنفيذ' });
    } else if (fullText.includes('انتظار') || fullText.includes('قيد')) {
        return NextResponse.json({ success: true, status_type: 'pending', message: 'قيد الانتظار' });
    } else {
        return NextResponse.json({ success: false, message: 'رفض: ' + (message || 'غير معروف') });
    }
} catch (error: any) {
        console.error("Critical Order API Error:", error);
        return NextResponse.json({ 
            success: false, 
            message: 'حدث خطأ في الاتصال بسيرفر الشحن.' 
        }, { status: 200 });
    }
}
