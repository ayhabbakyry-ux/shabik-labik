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
 * @fileOverview أفعال الملف الشخصي - تغيير كلمة المرور وتحديث صورة البروفيل.
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

export async function updateProfileImageAction(phone: string, imageData: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(doc(db, "users", snap.docs[0].id), { profileImage: imageData });
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    console.error("Update Profile Image Error:", error);
    return { success: false };
  }
}
