
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
import { Transaction } from '@/lib/store';

/**
 * @fileOverview محرك العمليات المالية السحابي - يضمن تسجيل كل ليرة في Firestore بدقة متناهية.
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
  } catch (error) {
    console.error("Sync Balance Error:", error);
    return { success: false };
  }
}

export async function recordTransactionAction(tx: Omit<Transaction, 'id'>) {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "transactions"), {
      ...tx,
      userPhone: tx.userPhone?.trim(),
      date: tx.date || now,
      createdAt: now
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Record Tx Error:", error);
    return { success: false };
  }
}

export async function getUserTransactionsAction(phone: string) {
  try {
    const phoneClean = phone.trim();
    const q = query(
      collection(db, "transactions"), 
      where("userPhone", "==", phoneClean)
    );
    const querySnapshot = await getDocs(q);
    const txs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
    
    // الترتيب الصارم: الأحدث فوق دائماً
    return txs.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  } catch (error) {
    console.error("Fetch Txs Error:", error);
    return [];
  }
}
