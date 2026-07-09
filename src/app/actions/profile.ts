'use server';

import { db } from '@/lib/firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  addDoc,
  setDoc
} from 'firebase/firestore';

/**
 * @fileOverview أفعال الملف الشخصي - تغيير كلمة المرور وتحديث صورة البروفيل مع دعم الإنشاء التلقائي.
 */

export async function changePasswordAction(phone: string, currentPass: string, newPass: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone), where("password", "==", currentPass));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, message: "عذراً يا غالي، كلمة المرور الحالية غير صحيحة." };
    }

    const userDoc = snap.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), { password: newPass });

    return { success: true, message: "تم تغيير كلمة المرور بنجاح ✅" };
  } catch (error) {
    console.error("Change Pass Error:", error);
    return { success: false, message: "حدث خطأ أثناء الاتصال بالسيرفر." };
  }
}

export async function updateProfileImageAction(phone: string, imageData: string, name: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      // تحديث إذا كان موجود
      await updateDoc(doc(db, "users", snap.docs[0].id), { profileImage: imageData });
      return { success: true };
    } else {
      // إنشاء سجل جديد في حال كان المدير أو مستخدم غير مسجل بقاعدة البيانات (Fallback)
      await addDoc(collection(db, "users"), {
        phone,
        name,
        profileImage: imageData,
        balance: 0,
        createdAt: new Date().toISOString()
      });
      return { success: true };
    }
  } catch (error: any) {
    console.error("Update Profile Image Error:", error);
    // إذا كان الخطأ بسبب الحجم الكبير
    if (error.message?.includes('too large') || error.code === 'out-of-range') {
      return { success: false, message: "الصورة حجمها كبير جداً، حاول اختيار صورة أصغر." };
    }
    return { success: false, message: "حدث خطأ أثناء حفظ الصورة." };
  }
}
