
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
 * @fileOverview محرك المصادقة - تم حصر نظام الإحالة بكود المدير (ADMIN) لضمان توزيع المكافآت.
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
        message: "تم تسجيل الدخول بنجاح، مرحباً بك في المنصة.", 
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
    return { success: false, message: "حدث خطأ أثناء الاتصال، يرجى المحاولة لاحقاً." };
  }
}

export async function signUpAction(phone: string, name: string, pass: string, refCode?: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: false, message: "هذا الرقم مسجل مسبقاً في النظام." };
    }

    let initialBalance = 0;
    const cleanRefCode = refCode?.trim().toUpperCase();

    // نظام الإحالة الحصري للمدير (ADMIN) - يمنح 25 ليرة للمدير و 25 ليرة للجديد
    if (cleanRefCode === "ADMIN") {
      const referrerPhone = ADMIN_PHONE;
      
      // لا يمكن للمدير إحالة نفسه
      if (referrerPhone !== phone) {
        const refQ = query(collection(db, "users"), where("phone", "==", referrerPhone));
        const refSnapshot = await getDocs(refQ);
        
        if (!refSnapshot.empty) {
          const referrerDoc = refSnapshot.docs[0];
          const currentRefBalance = Number(referrerDoc.data().balance || 0);
          
          // إضافة 25 ليرة للمدير (المُحيل)
          await updateDoc(doc(db, "users", referrerDoc.id), {
            balance: currentRefBalance + 25
          });
          
          // منح 25 ليرة رصيد ترحيبي للمستخدم الجديد
          initialBalance = 25;
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
    return { success: true, message: "تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن." };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, message: "حدث خطأ أثناء الاتصال بالسيرفر." };
  }
}

export async function requestPasswordResetAction(phone: string) {
  try {
    const userQ = query(collection(db, "users"), where("phone", "==", phone));
    const userSnap = await getDocs(userQ);
    
    if (userSnap.empty) {
      return { success: false, message: "رقم الهاتف المدخل غير مسجل لدينا." };
    }

    const userData = userSnap.docs[0].data();
    
    await addDoc(collection(db, "password_requests"), {
      phone,
      userName: userData.name || "مستخدم",
      balance: userData.balance || 0,
      status: 'Pending',
      date: new Date().toLocaleString('ar-SY')
    });

    return { success: true, message: "تم إرسال طلبك للإدارة. يرجى التواصل عبر واتساب لاستلام بيانات الدخول الجديدة." };
  } catch (error) {
    return { success: false, message: "حدث خطأ أثناء إرسال الطلب." };
  }
}
