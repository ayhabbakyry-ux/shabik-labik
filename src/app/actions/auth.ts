'use server';

import { db } from '@/lib/firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc
} from 'firebase/firestore';

/**
 * @fileOverview محرك المصادقة - تم إضافة نظام "الجلسة الواحدة" لمنع تعدد الأجهزة.
 */

const ADMIN_PHONE = "0939549573";

export async function signInAction(phone: string, pass: string) {
  try {
    const phoneClean = phone.trim();
    const q = query(collection(db, "users"), where("phone", "==", phoneClean), where("password", "==", pass));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // نظام حصر الجهاز الواحد (باستثناء المدير)
      if (phoneClean !== ADMIN_PHONE && userData.isOnline === true) {
        return { 
          success: false, 
          message: "هذا الحساب مفتوح حالياً من جهاز آخر. يرجى تسجيل الخروج من الجهاز الأول للمتابعة." 
        };
      }

      // تحديث حالة الاتصال
      await updateDoc(doc(db, "users", userDoc.id), {
        isOnline: true,
        lastLoginAt: new Date().toISOString()
      });

      return { 
        success: true, 
        message: "تم تسجيل الدخول بنجاح.", 
        user: { 
          phone: userData.phone, 
          name: userData.name, 
          balance: userData.balance || 0 
        } 
      };
    }
    return { success: false, message: "فشل الدخول، يرجى التأكد من البيانات المدخلة." };
  } catch (error) {
    console.error("Auth Error:", error);
    return { success: false, message: "حدث خطأ أثناء الاتصال بالسيرفر." };
  }
}

export async function signOutAction(phone: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone.trim()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      await updateDoc(doc(db, "users", snap.docs[0].id), { isOnline: false });
      return { success: true };
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
}

export async function signUpAction(phone: string, name: string, pass: string, refCode?: string) {
  try {
    const phoneClean = phone.trim();
    const q = query(collection(db, "users"), where("phone", "==", phoneClean));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, message: "هذا الرقم مسجل مسبقاً في النظام." };
    }

    let initialBalance = 0;
    const cleanRefCode = refCode?.trim().toUpperCase();

    if (cleanRefCode === "ADMIN") {
      const referrerPhone = ADMIN_PHONE;
      if (referrerPhone !== phoneClean) {
        const refQ = query(collection(db, "users"), where("phone", "==", referrerPhone));
        const refSnapshot = await getDocs(refQ);
        if (!refSnapshot.empty) {
          const referrerDoc = refSnapshot.docs[0];
          const currentRefBalance = Number(referrerDoc.data().balance || 0);
          await updateDoc(doc(db, "users", referrerDoc.id), { balance: currentRefBalance + 25 });
          initialBalance = 25;
        }
      }
    }

    const newUser = {
      phone: phoneClean,
      name,
      password: pass,
      balance: initialBalance,
      isOnline: false,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, "users"), newUser);
    return { success: true, message: "تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن." };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, message: "حدث خطأ أثناء الاتصال بالسيرفر." };
  }
}

export async function requestPasswordResetAction(phone: string) {
  try {
    const userQ = query(collection(db, "users"), where("phone", "==", phone.trim()));
    const userSnap = await getDocs(userQ);
    if (userSnap.empty) return { success: false, message: "رقم الهاتف غير مسجل." };
    const userData = userSnap.docs[0].data();
    await addDoc(collection(db, "password_requests"), {
      phone: phone.trim(),
      userName: userData.name || "مستخدم",
      balance: userData.balance || 0,
      status: 'Pending',
      date: new Date().toLocaleString('ar-SY')
    });
    return { success: true, message: "تم إرسال الطلب للإدارة." };
  } catch (error) {
    return { success: false, message: "حدث خطأ فني." };
  }
}