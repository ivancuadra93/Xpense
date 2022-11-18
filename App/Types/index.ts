export const LIST_HEIGHT = 40;

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
