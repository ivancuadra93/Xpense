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

export const getExpenses = (observer: {
  next?: ((snapshot: QuerySnapshot) => void) | undefined;
  error?: ((error: any) => void) | undefined;
  complete?: (() => void) | undefined;
}) => {
  const user = getUser();

  return firestore()
    .collection('Users')
    .doc(user?.uid)
    .collection('Expenses')
    .onSnapshot(observer);
};
