export const LIST_HEIGHT = 40;
export const OFF_WHITE = '#e5e3f3';
export const LIGHT_GRAY = '#b5b5b5';
export const DARK_GRAY = '#5c5a5b';
export const PURPLE = '#a49afc';
export const TAN = '#a5a180';

export type StackParamsList = {
  HomeScreen: {
    welcomeMessage: string;
  };
  LoginScreen: {
    welcomeMessage: string;
  };
};

export type Expense = {
  id: string;
  category: string;
  amount: number;
  debitCharges: number[];
  creditCharges: number[];
};

export type FirestoreExpense = {
  category: string;
  amount: number;
  debitCharges: number[];
  creditCharges: number[];
};
