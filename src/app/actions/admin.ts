'use server';

import { db } from '@/lib/firebase-config';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc 
} from 'firebase/firestore';

/**
 * @fileOverview أفعال الإدارة السحابية - تنفيذ العمليات من جهة الخادم لضمان الأمان.
 */

export async function getAllUsersAction() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    return usersSnap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (error) {
    console.error("Admin: Fetch Users Error", error);
    return [];
  }
}

export async function getAllTransactionsAction() {
  try {
    const txSnap = await getDocs(collection(db, "transactions"));
    return txSnap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (error) {
    console.error("Admin: Fetch All Transactions Error", error);
    return [];
  }
}

export async function deleteUserAction(phone: string) {
  try {
    // 1. حذف سجل المستخدم الأساسي من مجموعة users
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snap = await getDocs(q);
    const deletions = snap.docs.map(d => deleteDoc(doc(db, "users", d.id)));
    await Promise.all(deletions);

    // 2. حذف أي طلبات استعادة كلمة مرور معلقة لهذا الرقم لضمان نظافة النظام تماماً
    const reqQ = query(collection(db, "password_requests"), where("phone", "==", phone));
    const reqSnap = await getDocs(reqQ);
    const reqDeletions = reqSnap.docs.map(d => deleteDoc(doc(db, "password_requests", d.id)));
    await Promise.all(reqDeletions);

    // 3. حذف سجل العمليات المالية لهذا الرقم لضمان حذف الحساب نهائياً من كافة السجلات
    const txQ = query(collection(db, "transactions"), where("userPhone", "==", phone));
    const txSnap = await getDocs(txQ);
    const txDeletions = txSnap.docs.map(d => deleteDoc(doc(db, "transactions", d.id)));
    await Promise.all(txDeletions);

    console.log(`تم مسح الحساب ${phone} وكل بياناته المرتبطة من النظام نهائياً.`);
    return { success: true };
  } catch (error) {
    console.error("Admin: Delete User Error", error);
    return { success: false };
  }
}

export async function processAdminAction(txId: string, action: 'approve' | 'reject') {
  try {
    const txRef = doc(db, "transactions", txId);
    const txSnap = await getDoc(txRef);
    if (!txSnap.exists()) return { success: false, message: "العملية المطلوبة غير موجودة في النظام." };
    
    const txData = txSnap.data();
    if (txData.status !== 'Pending') return { success: false, message: "لقد تمت معالجة هذا الطلب مسبقاً." };

    if (action === 'approve') {
      const userQ = query(collection(db, "users"), where("phone", "==", txData.userPhone));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const currentBalance = Number(userDoc.data().balance || 0);
        const addedAmount = Number(txData.amount);
        await updateDoc(doc(db, "users", userDoc.id), { balance: currentBalance + addedAmount });
      }
      await updateDoc(txRef, { status: 'Completed' });
    } else {
      await updateDoc(txRef, { status: 'Rejected' });
    }
    return { success: true };
  } catch (error) {
    console.error("Admin: Action Error", error);
    return { success: false, message: "حدث خطأ أثناء معالجة الطلب." };
  }
}

export async function updateTransactionStatusServer(orderId: string, status: 'Completed' | 'Rejected', amount: number, phone: string) {
  try {
    const txRef = doc(db, "transactions", orderId);
    const txSnap = await getDoc(txRef);
    
    if (!txSnap.exists()) return { success: false, message: "الطلب غير موجود في السجلات." };
    const txData = txSnap.data();
    
    if (txData.status !== 'Pending') {
      return { success: false, message: "الطلب تمت معالجته مسبقاً." };
    }

    await updateDoc(txRef, { status });
    
    if (status === 'Rejected') {
      const userQ = query(collection(db, "users"), where("phone", "==", phone));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const currentBal = Number(userDoc.data().balance || 0);
        const refundAmt = Number(amount);
        const restoredBalance = currentBal + refundAmt;
        
        await updateDoc(doc(db, "users", userDoc.id), { balance: restoredBalance });
        return { success: true, newBalance: restoredBalance };
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Server: Update Status Error", error);
    return { success: false };
  }
}

export async function getUserDataAction(phone: string) {
  try {
    const userQ = query(collection(db, "users"), where("phone", "==", phone));
    const userSnap = await getDocs(userQ);
    if (!userSnap.empty) {
      return { success: true, data: userSnap.docs[0].data() };
    }
    return { success: false };
  } catch (error) {
    return { success: false };
  }
}

export async function getPasswordRequestsAction() {
  try {
    const snap = await getDocs(collection(db, "password_requests"));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  } catch (error) {
    return [];
  }
}

export async function completePasswordResetAction(phone: string, requestId: string) {
  try {
    const userQ = query(collection(db, "users"), where("phone", "==", phone));
    const userSnap = await getDocs(userQ);
    if (!userSnap.empty) {
      await updateDoc(doc(db, "users", userSnap.docs[0].id), { password: "123456" });
    }
    await deleteDoc(doc(db, "password_requests", requestId));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
