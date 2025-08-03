import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface User {
  wallet: string;
  joinedAt: Timestamp;
}

export interface Transaction {
  id?: string;
  wallet: string;
  type: 'deposit' | 'withdraw' | 'transfer_in' | 'transfer_out';
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
  metadata?: {
    destinationWallet?: string;
    sourceWallet?: string;
    txHash?: string;
    cowrieReference?: string;
    bankDetails?: {
      accountNumber: string;
      bankName: string;
      accountName: string;
    };
  };
}

export class FirebaseService {
  async saveUser(wallet: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', wallet);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          wallet,
          joinedAt: Timestamp.now(),
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async getUser(wallet: string): Promise<User | null> {
    try {
      const userRef = doc(db, 'users', wallet);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(query(usersRef, orderBy('joinedAt', 'desc')));
      
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async saveTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    try {
      const transactionsRef = collection(db, 'transactions');
      const docRef = doc(transactionsRef);
      
      const transactionData: Transaction = {
        ...transaction,
        id: docRef.id,
        createdAt: Timestamp.now(),
      };
      
      await setDoc(docRef, transactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, updates);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  async getTransactionsByWallet(wallet: string, limitCount = 20): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('wallet', '==', wallet),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Transaction);
    } catch (error) {
      console.error('Error getting transactions by wallet:', error);
      throw error;
    }
  }

  async getAllTransactions(limitCount = 50): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Transaction);
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw error;
    }
  }

  async getTransactionsByType(type: Transaction['type'], limitCount = 50): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Transaction);
    } catch (error) {
      console.error('Error getting transactions by type:', error);
      throw error;
    }
  }

  async getTransactionsByStatus(status: Transaction['status'], limitCount = 50): Promise<Transaction[]> {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef,
        where('status', '==', status),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Transaction);
    } catch (error) {
      console.error('Error getting transactions by status:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();