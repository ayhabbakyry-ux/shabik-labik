
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
import { Transaction } from '@/lib/types';

/**
 * @fileOverview أفعال الإدارة السحابية - مع جلب شامل للبيانات لضمان عدم ضياع أي إيداع زبون.
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
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const snap = await getDocs(q);
    const deletions = snap.docs.map(d => deleteDoc(doc(db, "users", d.id)));
    await Promise.all(deletions);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function processAdminAction(txId: string, action: 'approve' | 'reject') {
  try {
    const txRef = doc(db, "transactions", txId);
    const txSnap = await getDoc(txRef);
    if (!txSnap.exists()) return { success: false, message: "الطلب غير موجود." };
    
    const txData = txSnap.data();
    if (txData.status !== 'Pending') return { success: false, message: "تمت المعالجة مسبقاً." };

    if (action === 'approve') {
      const userQ = query(collection(db, "users"), where("phone", "==", txData.userPhone));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const currentBalance = Number(userDoc.data().balance || 0);
        await updateDoc(doc(db, "users", userDoc.id), { balance: currentBalance + Number(txData.amount) });
      }
      await updateDoc(txRef, { status: 'Completed' });
    } else {
      await updateDoc(txRef, { status: 'Rejected' });
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateTransactionStatusServer(orderId: string, status: 'Completed' | 'Rejected', amount: number, phone: string) {
  try {
    const txRef = doc(db, "transactions", orderId);
    await updateDoc(txRef, { status });
    
    if (status === 'Rejected') {
      const userQ = query(collection(db, "users"), where("phone", "==", phone));
      const userSnap = await getDocs(userQ);
      if (!userSnap.empty) {
        const userDoc = userSnap.docs[0];
        const currentBal = Number(userDoc.data().balance || 0);
        await updateDoc(doc(db, "users", userDoc.id), { balance: currentBal + amount });
      }
    }
    return { success: true };
  } catch (error) {
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

export async function updateUserBalanceDirectlyAction(phone: string, amount: number, operation: 'add' | 'subtract') {
  try {
    const userQ = query(collection(db, "users"), where("phone", "==", phone));
    const userSnap = await getDocs(userQ);
    if (!userSnap.empty) {
      const userDoc = userSnap.docs[0];
      const currentBalance = Number(userDoc.data().balance || 0);
      const newBalance = operation === 'add' ? currentBalance + amount : Math.max(0, currentBalance - amount);
      await updateDoc(doc(db, "users", userDoc.id), { balance: newBalance });
      return { success: true };
    }
    return { success: false };
  } catch (error) {
    return { success: false };
  }
}
