
'use server';

import { db } from '@/lib/firebase-config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  orderBy,
  limit
} from 'firebase/firestore';
import { Transaction } from '@/lib/store';

/**
 * @fileOverview محرك العمليات المالية السحابي - يضمن تسجيل كل ليرة في Firestore.
 */

export async function syncBalanceAction(phone: string, newBalance: number) {
  try {
    const q = query(collection(db, "users"), where("phone", "==", phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        balance: newBalance
      });
      return { success: true };
    }
    return { success: false, message: "المستخدم غير موجود" };
  } catch (error) {
    console.error("Sync Balance Error:", error);
    return { success: false };
  }
}

export async function recordTransactionAction(tx: Omit<Transaction, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, "transactions"), {
      ...tx,
      createdAt: new Date().toISOString()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Record Tx Error:", error);
    return { success: false };
  }
}

export async function getUserTransactionsAction(phone: string) {
  try {
    const q = query(
      collection(db, "transactions"), 
      where("userPhone", "==", phone)
    );
    const querySnapshot = await getDocs(q);
    const txs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    
    // ترتيب يدوي لأن الفايربيز يحتاج Index للترتيب المعقد
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Fetch Txs Error:", error);
    return [];
  }
}
