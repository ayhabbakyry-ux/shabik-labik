'use server';

import { db } from '@/lib/firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc,
  addDoc
} from 'firebase/firestore';

/**
 * @fileOverview أفعال الملف الشخصي - تحديث البيانات بشكل رسمي.
 */

export async function changePasswordAction(phone: string, currentPass: string, newPass: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone), where("password", "==", currentPass));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { success: false, message: "كلمة المرور الحالية غير صحيحة." };
    }

    const userDoc = snap.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), { password: newPass });

    return { success: true, message: "تم تحديث كلمة المرور بنجاح." };
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
      await updateDoc(doc(db, "users", snap.docs[0].id), { profileImage: imageData });
      return { success: true };
    } else {
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
    if (error.message?.includes('too large') || error.code === 'out-of-range') {
      return { success: false, message: "حجم الصورة كبير جداً، يرجى اختيار ملف أصغر." };
    }
    return { success: false, message: "حدث خطأ أثناء حفظ الصورة." };
  }
}
