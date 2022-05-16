import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import {
  Alert,
  Modal,
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
import DropShadow from 'react-native-drop-shadow';
import {Shadow} from 'react-native-shadow-2';

import {Expense, StackParamsList} from '../Types';

type Props = NativeStackScreenProps<StackParamsList, 'HomeScreen'>;

const HomeScreen: React.FC<Props> = ({navigation, route}) => {
  // const [modalVisible, setModalVisible] = useState<boolean>(false);
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
    backgroundColor: isDarkMode ? '#5c5a5b' : '#e5e3f3',
  };
  const themeColor = {
    color: isDarkMode ? 'white' : 'black',
  };

  const generateBoxShadowStyle = (
    xOffset: number,
    yOffset: number,
    shadowColorIos: string,
    shadowOpacity: number,
    shadowRadius: number,
    elevation: number,
    shadowColorAndroid: string,
  ) => {
    if (Platform.OS === 'ios') {
      styles.boxShadow = {
        shadowColor: shadowColorIos,
        shadowOffset: {width: xOffset, height: yOffset},
        shadowOpacity,
        shadowRadius,
      };
    } else if (Platform.OS === 'android') {
      styles.boxShadow = {
        elevation,
        shadowColor: shadowColorAndroid,
      };
    }
  };

  generateBoxShadowStyle(-2, 4, '#171717', 0.2, 3, 4, '#171717');

  const getItem = (data: Expense[], index: number) => ({
    id: data[index].id,
    category: data[index].category,
    amount: data[index].amount,
  });

  const getItemCount = (data: Expense[]) => (data ? data.length : 0);

  const Item = ({category, amount}: Expense) => (
    <Shadow
      distance={5}
      startColor={'#b5b5b5'}
      radius={8}
      viewStyle={{width: '100%'}}
      containerViewStyle={styles.shadowContainer}>
      <View style={styles.listItem}>
        <Text style={[styles.itemText, themeColor]}>
          {category}: {amount}
        </Text>
      </View>
    </Shadow>
  );
  const renderItem = ({item}: any) => (
    <Item category={item.category} id={item.id} amount={item.amount} />
  );

  const EmtpyItem = () => (
    <Shadow
      distance={5}
      startColor={'#b5b5b5'}
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

    setListData(prev => [
      ...(prev ?? []),
      {
        id: Math.random().toString(12).substring(0),
        category: newCategory,
        amount: newAmount,
      },
    ]);
    setCategoryInput('');
    setAmountInput('');
  }

  return (
    <View style={[styles.container, themeBackgroundColor]}>
      <SafeAreaView style={styles.listContainer}>
        <VirtualizedList
          data={listData}
          initialNumToRender={0}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          getItemCount={getItemCount}
          getItem={getItem}
          ListEmptyComponent={renderEmptyItem}
        />
      </SafeAreaView>
      <View style={styles.newExpenseView}>
        <Shadow distance={10} radius={20} viewStyle={{width: '100%'}}>
          <View style={styles.newExpenseHeaderView}>
            <Text
              style={[
                styles.newExpenseHeaderText,
                styles.boxShadow,
                themeColor,
              ]}>
              Enter a New Expense
            </Text>
          </View>
          <View style={styles.newExpenseInputsView}>
            <TextInput
              style={[styles.newExpenseInput, categoryInputBorder]}
              onChangeText={setCategoryInput}
              value={categoryInput}
              placeholder="Category"
              placeholderTextColor={themeColor.color}
              keyboardType="default"
              onFocus={() => setCategoryInputBorder({borderWidth: 1})}
              onBlur={() => setCategoryInputBorder({borderWidth: 0.5})}
            />
            <TextInput
              style={[styles.newExpenseInput, amountInputBorder]}
              onChangeText={setAmountInput}
              value={amountInput}
              placeholder="Amount"
              placeholderTextColor={themeColor.color}
              keyboardType="numeric"
              onFocus={() => setAmountInputBorder({borderWidth: 1})}
              onBlur={() => setAmountInputBorder({borderWidth: 0.5})}
            />
            <DropShadow style={styles.shadowProp}>
              <Pressable
                onPress={() => createExpense(categoryInput, amountInput)}
                style={styles.newExpenseSubmitPressable}>
                <Text style={[styles.newExpenseSubmitText, themeColor]}>
                  Submit
                </Text>
              </Pressable>
            </DropShadow>
          </View>
        </Shadow>
      </View>
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
    height: 40,
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
    backgroundColor: '#a49afc',
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
    backgroundColor: '#b5b5b5',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  newExpenseInput: {
    height: 40,
    width: '33%',
    paddingLeft: 10,
  },
  newExpenseSubmitPressable: {
    height: 40,
    padding: 5,
    borderWidth: 1,
    justifyContent: 'center',
    backgroundColor: '#a5a180',
  },
  newExpenseSubmitText: {
    textAlign: 'center',
    fontSize: 20,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  boxShadow: {},
});

export default HomeScreen;
