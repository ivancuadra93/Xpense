import firestore from '@react-native-firebase/firestore';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

type QuerySnapshot = FirebaseFirestoreTypes.QuerySnapshot;

import {FirestoreExpense} from '../Types';
import {getUser} from './auth';

export const addExpense = (expense: FirestoreExpense): Promise<any> => {
  const user = getUser();

  return firestore()
    .collection('Users')
    .doc(user?.uid)
    .collection('Expenses')
    .add(expense);
};

export const updateExpense = (
  docId: string,
  expense: FirestoreExpense,
): Promise<any> => {
  const user = getUser();

  return firestore()
    .collection('Users')
    .doc(user?.uid)
    .collection('Expenses')
    .doc(docId)
    .update(expense);
};

export const deleteExpense = (docId: string): Promise<any> => {
  const user = getUser();
  return firestore()
    .collection('Users')
    .doc(user?.uid)
    .collection('Expenses')
    .doc(docId)
    .delete();
};

export const getExpenses = (
  userId: string,
  observer: {
    next?: ((snapshot: QuerySnapshot) => void) | undefined;
    error?: ((error: any) => void) | undefined;
    complete?: (() => void) | undefined;
  },
) => {
  // const user = getUser();

  return firestore()
    .collection('Users')
    .doc(userId)
    .collection('Expenses')
    .onSnapshot(observer);
};

export const updateCharges = (
  docId: string,
  debitCharges: number[],
  creditCharges: number[],
): Promise<any> => {
  const user = getUser();

  const chargesRef = firestore()
    .collection('Users')
    .doc(user?.uid)
    .collection('Expenses')
    .doc(docId);

  return firestore().runTransaction(async transaction => {
    transaction.update(chargesRef, {
      debitCharges: debitCharges,
      creditCharges: creditCharges,
    });
  });
};
