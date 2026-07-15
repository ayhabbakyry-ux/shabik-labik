
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
import { Transaction } from '@/lib/types';

/**
 * @fileOverview محرك العمليات المالية السحابي - يضمن حفظ البيانات حتى لو تعثرت الشبكة في السامسونج.
 */

export async function syncBalanceAction(phone: string, newBalance: number) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone.trim()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        balance: newBalance
      });
      return { success: true };
    }
    return { success: false, message: "المستخدم غير موجود" };
  } catch (error: any) {
    console.error("Sync Balance Error:", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function recordTransactionAction(tx: Omit<Transaction, 'id'>) {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "transactions"), {
      ...tx,
      userPhone: tx.userPhone?.trim(),
      date: tx.date || now,
      createdAt: tx.createdAt || now, 
      userName: tx.userName || "مستخدم"
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Critical Server Error (recordTransactionAction):", error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function getUserTransactionsAction(phone: string) {
  try {
    const phoneClean = phone.trim();
    // جلب كافة المعاملات لضمان عدم ضياع السجل
    const q = query(
      collection(db, "transactions"), 
      where("userPhone", "==", phoneClean)
    );
    const querySnapshot = await getDocs(q);
    const txs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    
    return txs.sort((a, b) => {
      const dateA = a.createdAt || a.date || "";
      const dateB = b.createdAt || b.date || "";
      return dateB.localeCompare(dateA);
    });
  } catch (error) {
    console.error("Fetch Txs Error:", error);
    return [];
  }
}
