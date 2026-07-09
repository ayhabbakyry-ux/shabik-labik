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
 * @fileOverview أفعال الإدارة السحابية - تنفذ من السيرفر حصراً لتخطي الحظر الإقليمي.
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

export async function deleteUserAction(phone: string) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snap = await getDocs(q);
    const deletions = snap.docs.map(d => deleteDoc(doc(db, "users", d.id)));
    await Promise.all(deletions);
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
    if (!txSnap.exists()) return { success: false, message: "العملية غير موجودة" };
    
    const txData = txSnap.data();
    if (txData.status !== 'Pending') return { success: false, message: "تمت معالجة الطلب مسبقاً" };

    if (action === 'approve') {
      const userQ = query(collection(db, "users"), where("phone", "==", txData.userPhone));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const currentBalance = userDoc.data().balance || 0;
        await updateDoc(doc(db, "users", userDoc.id), { balance: currentBalance + txData.amount });
      }
      await updateDoc(txRef, { status: 'Completed' });
    } else {
      await updateDoc(txRef, { status: 'Rejected' });
    }
    return { success: true };
  } catch (error) {
    console.error("Admin: Action Error", error);
    return { success: false };
  }
}

export async function updateTransactionStatusServer(orderId: string, status: 'Completed' | 'Rejected', amount: number, phone: string) {
  try {
    const txRef = doc(db, "transactions", orderId);
    const txSnap = await getDoc(txRef);
    
    if (!txSnap.exists()) return { success: false, message: "الطلب غير موجود" };
    const txData = txSnap.data();
    
    if (txData.status !== 'Pending') {
      return { success: false, message: "الطلب تمت معالجته مسبقاً" };
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
    // 1. تحديث كلمة المرور لـ 123456
    const userQ = query(collection(db, "users"), where("phone", "==", phone));
    const userSnap = await getDocs(userQ);
    if (!userSnap.empty) {
      await updateDoc(doc(db, "users", userSnap.docs[0].id), { password: "123456" });
    }

    // 2. حذف الطلب
    await deleteDoc(doc(db, "password_requests", requestId));
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
