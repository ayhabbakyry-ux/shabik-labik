'use server';

import { db } from '@/lib/firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';

/**
 * @fileOverview أفعال الملف الشخصي - تغيير كلمة المرور بأمان.
 */

export async function changePasswordAction(phone: string, currentPass: string, newPass: string) {
  try {
    // 1. التحقق من صحة كلمة المرور الحالية
    const q = query(collection(db, "users"), where("phone", "==", phone), where("password", "==", currentPass));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, message: "عذراً يا غالي، كلمة المرور الحالية غير صحيحة." };
    }

    // 2. تحديث كلمة المرور
    const userDoc = snap.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), { password: newPass });

    return { success: true, message: "تم تغيير كلمة المرور بنجاح ✅" };
  } catch (error) {
    console.error("Change Pass Error:", error);
    return { success: false, message: "حدث خطأ أثناء الاتصال بالسيرفر." };
  }
}
