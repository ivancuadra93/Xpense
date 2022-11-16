import {NativeStackScreenProps} from '@react-navigation/native-stack';

import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  DeviceEventEmitter,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
  VirtualizedList,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {useUserContext} from '../contexts/UserContext';
import ExpenseList from '../ExpenseList/ExpenseList';
import {addExpense, getExpenses} from '../firebase/firestore';

import {
  DARK_GRAY,
  Expense,
  FirestoreExpense,
  LIGHT_GRAY,
  LIST_HEIGHT,
  OFF_WHITE,
  PURPLE,
  StackParamsList,
  TAN,
} from '../Types';

type Props = NativeStackScreenProps<StackParamsList, 'HomeScreen'>;

const HomeScreen: React.FC<Props> = ({navigation, route}) => {
  const {user} = useUserContext();
  const [listData, setListData] = useState<Expense[]>();
  const [categoryInput, setCategoryInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [categoryInputBorder, setCategoryInputBorder] = useState<{
    borderWidth: number;
  }>({borderWidth: 0.5});
  const [amountInputBorder, setAmountInputBorder] = useState<{
    borderWidth: number;
  }>({borderWidth: 0.5});

  const isDarkMode = useColorScheme() === 'dark';
  const themeBackgroundColor = {
    backgroundColor: isDarkMode ? DARK_GRAY : OFF_WHITE,
  };
  const themeColor = {
    color: isDarkMode ? 'white' : 'black',
  };

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
      startColor={LIGHT_GRAY}
      radius={8}
      viewStyle={{width: '100%'}}
      containerViewStyle={styles.shadowContainer}>
      <View style={styles.listItem}>
        <Text style={[styles.itemText, themeColor]}>
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

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          color={TAN}
          onPress={() => {
            DeviceEventEmitter.emit('signOut');
            navigation.replace('LoginScreen', {welcomeMessage: ''});
          }}
          title="Sign Out"
        />
      ),
    });
  });

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
    <View style={[styles.container, themeBackgroundColor]}>
      <SafeAreaView style={styles.listContainer}>
        <VirtualizedList
          data={listData}
          getItemCount={getItemCount}
          getItem={getItem}
          initialNumToRender={0}
          renderItem={({item}) => <ExpenseList expense={item} />}
          ListEmptyComponent={renderEmptyItem}
          keyExtractor={keyExtractor}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={100}
          style={styles.newExpenseView}>
          <Shadow distance={10} radius={20} viewStyle={{width: '100%'}}>
            <View style={styles.newExpenseHeaderView}>
              <Text style={[styles.newExpenseHeaderText, themeColor]}>
                Enter a New Expense
              </Text>
            </View>
            <View style={styles.newExpenseInputsView}>
              <TextInput
                style={[
                  styles.newExpenseInput,
                  themeColor,
                  categoryInputBorder,
                ]}
                onChangeText={setCategoryInput}
                value={categoryInput}
                placeholder="Category"
                placeholderTextColor={themeColor.color}
                keyboardType="default"
                onFocus={() => setCategoryInputBorder({borderWidth: 1})}
                onBlur={() => setCategoryInputBorder({borderWidth: 0.5})}
              />
              <TextInput
                style={[styles.newExpenseInput, themeColor, amountInputBorder]}
                onChangeText={setAmountInput}
                value={amountInput}
                placeholder="Amount"
                placeholderTextColor={themeColor.color}
                keyboardType="numeric"
                onFocus={() => setAmountInputBorder({borderWidth: 1})}
                onBlur={() => setAmountInputBorder({borderWidth: 0.5})}
              />
              <Shadow distance={10} radius={0} viewStyle={{width: '100%'}}>
                <Pressable
                  onPress={() => createExpense(categoryInput, amountInput)}
                  style={({pressed}) =>
                    pressed
                      ? styles.newExpenseSubmitPressed
                      : styles.newExpenseSubmitNotPressed
                  }>
                  <Text style={[styles.newExpenseSubmitText, themeColor]}>
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
  container: {flex: 1},
  shadowContainer: {
    marginHorizontal: 10,
    marginVertical: 8,
  },
  listContainer: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
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
  newExpenseView: {
    flex: 0,
    height: 100,
    borderRadius: 20,
    margin: 10,
  },
  newExpenseHeaderView: {
    justifyContent: 'center',
    backgroundColor: PURPLE,
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
    backgroundColor: LIGHT_GRAY,
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
    backgroundColor: TAN,
  },
  newExpenseSubmitPressed: {
    height: 40,
    padding: 5,
    borderWidth: 1,
    justifyContent: 'center',
    backgroundColor: TAN,
    opacity: 0.5,
  },
  newExpenseSubmitText: {
    textAlign: 'center',
    fontSize: 20,
  },
});

export default HomeScreen;
