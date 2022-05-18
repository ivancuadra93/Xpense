export type StackParamsList = {
  HomeScreen: {
    welcomeMessage: string;
  };
};

export type Expense = {
  id: string;
  category: string;
  amount: string;
  debitCharges: number[];
  creditCharges: number[];
};

export type FirestoreExpense = {
  category: string;
  amount: string;
  debitCharges: number[];
  creditCharges: number[];
};
