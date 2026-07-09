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
 * @fileOverview محرك المصادقة السحابي المدرع - يدعم كود الإحالة ونظام استعادة الحساب.
 */

const ADMIN_PHONE = "0939549573";

export async function signInAction(phone: string, pass: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone), where("password", "==", pass));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      return { 
        success: true, 
        message: "مرحباً بك يا غالي، نورت المنصة", 
        user: { 
          phone: userData.phone, 
          name: userData.name, 
          balance: userData.balance || 0 
        } 
      };
    }
    return { success: false, message: "فشل الدخول، تأكد من الرقم أو كلمة السر" };
  } catch (error) {
    console.error("Auth Error:", error);
    return { success: false, message: "فشل في عملية الاتصال، يرجى المحاولة مجدداً" };
  }
}

export async function signUpAction(phone: string, name: string, pass: string, refCode?: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, message: "هذا الرقم مسجل من قبل يا شهم" };
    }

    let initialBalance = 0;
    const cleanRefCode = refCode?.trim().toUpperCase();

    if (cleanRefCode) {
      let referrerPhone = "";
      
      if (cleanRefCode === "ADMEN") {
        referrerPhone = ADMIN_PHONE;
      } else if (cleanRefCode.length === 5) {
        const allUsers = await getDocs(collection(db, "users"));
        const match = allUsers.docs.find(d => d.data().phone.endsWith(cleanRefCode));
        if (match) referrerPhone = match.data().phone;
      }

      if (referrerPhone && referrerPhone !== phone) {
        const refQ = query(collection(db, "users"), where("phone", "==", referrerPhone));
        const refSnapshot = await getDocs(refQ);
        if (!refSnapshot.empty) {
          const referrerDoc = refSnapshot.docs[0];
          const currentRefBalance = referrerDoc.data().balance || 0;
          await updateDoc(doc(db, "users", referrerDoc.id), {
            balance: currentRefBalance + 25
          });
          initialBalance += 25;
        }
      }
    }

    const newUser = {
      phone,
      name,
      password: pass,
      balance: initialBalance,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, "users"), newUser);
    return { success: true, message: "تم إنشاء الحساب بنجاح يا غالي، سجل دخولك الآن" };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, message: "فشل في عملية الاتصال بالسيرفر، يرجى المحاولة مجدداً" };
  }
}

export async function requestPasswordResetAction(phone: string) {
  try {
    const userQ = query(collection(db, "users"), where("phone", "==", phone));
    const userSnap = await getDocs(userQ);
    
    if (userSnap.empty) {
      return { success: false, message: "هذا الرقم غير موجود بالنظام يا غالي." };
    }

    const userData = userSnap.docs[0].data();
    
    // تسجيل الطلب للمدير
    await addDoc(collection(db, "password_requests"), {
      phone,
      userName: userData.name || "مستخدم",
      balance: userData.balance || 0,
      status: 'Pending',
      date: new Date().toLocaleString('ar-SY')
    });

    return { success: true, message: "تم إرسال طلبك للمدير. تواصل مع الإدارة عبر واتساب لاستلام كلمة المرور الجديدة." };
  } catch (error) {
    return { success: false, message: "حدث خطأ أثناء إرسال الطلب." };
  }
}
