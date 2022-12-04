import {useTheme} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  VirtualizedList,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {useUserContext} from '../contexts/UserContext';
import ExpenseList from '../ExpenseList/ExpenseList';
import {signOut} from '../firebase/auth';
import {addExpense, getExpenses} from '../firebase/firestore';

import {
  Expense,
  FirestoreExpense,
  LIST_HEIGHT,
  StackParamsList,
} from '../Types';

type Props = NativeStackScreenProps<StackParamsList, 'HomeScreen'>;

const HomeScreen: React.FC<Props> = ({navigation, route}) => {
  const {user} = useUserContext();
  const [listData, setListData] = useState<Expense[]>();
  const [categoryInput, setCategoryInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [totals, setTotals] = useState<Map<string, number>>(new Map());
  const [categoryInputBorder, setCategoryInputBorder] = useState<{
    borderWidth: number;
  }>({borderWidth: 0.5});
  const [amountInputBorder, setAmountInputBorder] = useState<{
    borderWidth: number;
  }>({borderWidth: 0.5});

  const myTheme = useTheme().colors;

  const getItem = (data: Expense[], index: number) => ({
    id: data[index].id,
    category: data[index].category,
    amount: data[index].amount,
    debitCharges: data[index].debitCharges,
    creditCharges: data[index].creditCharges,
  });

  const getItemCount = (data: Expense[]) => (data ? data.length : 0);

  const EmtpyItem = () => (
    <Shadow
      distance={5}
      startColor={useTheme().colors.border}
      style={{width: '100%', borderRadius: 8}}
      containerStyle={styles.shadowContainer}>
      <View style={styles.listItem}>
        <Text style={[styles.itemText, {color: myTheme.text}]}>
          Enter a new expense below...
        </Text>
      </View>
    </Shadow>
  );
  const renderEmptyItem = () => <EmtpyItem></EmtpyItem>;

  const keyExtractor = (_item: Expense, index: number) => {
    return index.toString();
  };

  function createExpense(newCategory: string, newAmount: string) {
    const amountRegex = new RegExp(
      '(?=.*?\\d)^\\$?(([1-9]\\d{0,2}(,\\d{3})*)|\\d+)?(\\.\\d{1,2})?$',
      'gm',
    );

    if (newCategory.length === 0) {
      return Alert.alert('Category may not be empty');
    }

    if (!amountRegex.test(newAmount)) {
      return Alert.alert('Please enter a valid amount');
    }

    const firestoreExpense: FirestoreExpense = {
      category: newCategory,
      amount: Number(newAmount),
      debitCharges: [],
      creditCharges: [],
    };

    addExpense(firestoreExpense)
      .then(res => {
        console.log(res);
        setCategoryInput('');
        setAmountInput('');
      })
      .catch(err => {
        console.error(err);
        Alert.alert('An error occurred');
      });
  }

  const total = useMemo(() => {
    let sum: number = 0;

    totals.forEach(total => {
      sum += total;
    });

    return Number(sum.toFixed(2));
  }, [totals]);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Xpense',
      headerStyle: {backgroundColor: myTheme.primary},
      headerTintColor: myTheme.text,
      headerRight: () => (
        <Button
          color={myTheme.card}
          onPress={() => {
            // DeviceEventEmitter.emit('signOut');
            signOut();
            navigation.replace('LoginScreen', {welcomeMessage: ''});
          }}
          title="Sign Out"
        />
      ),
    });
  }, [myTheme]);

  useEffect(() => {
    if (user) {
      const subscriber = getExpenses(user.uid, {
        next: expensesSnapshot => {
          setListData(
            expensesSnapshot.docs.map(doc => {
              return {...doc.data(), ...{id: doc.id}};
            }) as Expense[],
          );
        },
      });

      return subscriber;
    }
  }, [user]);

  return (
    <View style={[styles.container, {backgroundColor: myTheme.background}]}>
      <SafeAreaView
        style={[styles.container, {backgroundColor: myTheme.background}]}>
        <View style={styles.listContainer}>
          <VirtualizedList
            data={listData}
            getItemCount={getItemCount}
            getItem={getItem}
            initialNumToRender={0}
            renderItem={({item}) => (
              <ExpenseList expense={item} setTotals={setTotals} />
            )}
            ListEmptyComponent={renderEmptyItem}
            keyExtractor={keyExtractor}
          />
          <View style={styles.totalView}>
            <Text selectable style={[styles.totalText, {color: myTheme.text}]}>
              Total: ${total}
            </Text>
          </View>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={100}
          style={styles.newExpenseView}>
          <Shadow distance={10} style={{width: '100%', borderRadius: 20}}>
            <View
              style={[
                styles.newExpenseHeaderView,
                {backgroundColor: myTheme.primary},
              ]}>
              <Text
                style={[styles.newExpenseHeaderText, {color: myTheme.text}]}>
                Enter a New Expense
              </Text>
            </View>
            <View
              style={[
                styles.newExpenseInputsView,
                {backgroundColor: myTheme.card},
              ]}>
              <TextInput
                style={[
                  styles.newExpenseInput,
                  {backgroundColor: myTheme.background, color: myTheme.text},
                  categoryInputBorder,
                ]}
                onChangeText={setCategoryInput}
                value={categoryInput}
                placeholder="Category"
                placeholderTextColor={myTheme.text}
                keyboardType="default"
                onFocus={() => setCategoryInputBorder({borderWidth: 1})}
                onBlur={() => setCategoryInputBorder({borderWidth: 0.5})}
              />
              <TextInput
                style={[
                  styles.newExpenseInput,
                  {backgroundColor: myTheme.background, color: myTheme.text},
                  amountInputBorder,
                ]}
                onChangeText={setAmountInput}
                value={amountInput}
                placeholder="Amount"
                placeholderTextColor={myTheme.text}
                keyboardType="numeric"
                onFocus={() => setAmountInputBorder({borderWidth: 1})}
                onBlur={() => setAmountInputBorder({borderWidth: 0.5})}
              />
              <Shadow distance={10} style={{width: '100%', borderRadius: 0}}>
                <Pressable
                  onPress={() => createExpense(categoryInput, amountInput)}
                  style={({pressed}) => [
                    pressed
                      ? styles.newExpenseSubmitPressed
                      : styles.newExpenseSubmitNotPressed,
                    {backgroundColor: myTheme.card},
                  ]}>
                  <Text
                    style={[
                      styles.newExpenseSubmitText,
                      {color: myTheme.text},
                    ]}>
                    Submit
                  </Text>
                </Pressable>
              </Shadow>
            </View>
          </Shadow>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

let styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: StatusBar.currentHeight,
  },
  shadowContainer: {
    marginHorizontal: 10,
    marginVertical: 8,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    height: LIST_HEIGHT,
    justifyContent: 'center',
    borderRadius: 8,
    paddingLeft: 8,
  },
  itemText: {
    fontSize: 15,
  },
  totalView: {
    margin: 10,
  },
  totalText: {
    fontSize: 30,
  },
  newExpenseView: {
    flex: 0,
    height: 100,
    borderRadius: 20,
    margin: 10,
  },
  newExpenseHeaderView: {
    justifyContent: 'center',
    height: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  newExpenseHeaderText: {
    textAlign: 'center',
    fontSize: 20,
  },
  newExpenseInputsView: {
    flex: -1,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  newExpenseInput: {
    height: 40,
    width: '33%',
    paddingLeft: 10,
  },
  newExpenseSubmitNotPressed: {
    height: 40,
    padding: 5,
    borderWidth: 1,
    justifyContent: 'center',
  },
  newExpenseSubmitPressed: {
    height: 40,
    padding: 5,
    borderWidth: 1,
    justifyContent: 'center',
    opacity: 0.5,
  },
  newExpenseSubmitText: {
    textAlign: 'center',
    fontSize: 20,
  },
});

export default HomeScreen;
