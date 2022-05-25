import React, {useEffect, useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';

import {deleteExpense, updateExpense} from '../firebase/firestore';
import {
  DARK_GRAY,
  Expense,
  FirestoreExpense,
  LIGHT_GRAY,
  OFF_WHITE,
  PURPLE,
} from '../Types';

type Props = {
  expense: Expense;
  total: number;
  editModalVisible: boolean;
  setEditModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const EditExpenseModal: React.FC<Props> = ({
  expense,
  total,
  editModalVisible,
  setEditModalVisible,
}) => {
  const {id, category, amount, debitCharges, creditCharges} = expense;

  const [categoryInput, setCategoryInput] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [tempDebitCharges, setTempDebitCharges] =
    useState<number[]>(debitCharges);
  const [tempCreditCharges, setTempCreditCharges] =
    useState<number[]>(creditCharges);
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

  const handleDelete = () => {
    deleteExpense(id)
      .then(res => {
        console.log(res);
        setEditModalVisible(false);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('An error occurred');
      });
  };

  const handleReset = () => {
    const firestoreExpense: FirestoreExpense = {
      category: category,
      amount: amount,
      debitCharges: [],
      creditCharges: [],
    };

    updateExpense(id, firestoreExpense)
      .then(res => {
        console.log(res);
        setEditModalVisible(false);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('An error occurred');
      });
  };

  const handleRollover = () => {
    const firestoreExpense: FirestoreExpense = {
      category: category,
      amount: amount,
      debitCharges: [total],
      creditCharges: [],
    };

    updateExpense(id, firestoreExpense)
      .then(res => {
        console.log(res);
        setEditModalVisible(false);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('An error occurred');
      });
  };

  const handleCancel = () => {
    setAmountInput(amount.toString());
    setCategoryInput(category);
    setEditModalVisible(false);
  };

  const handleSave = (newCategory: string, newAmount: string) => {
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
      debitCharges: tempDebitCharges,
      creditCharges: tempCreditCharges,
    };

    updateExpense(id, firestoreExpense)
      .then(res => {
        console.log(res);
        setEditModalVisible(false);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('An error occurred');
      });
  };

  useEffect(() => {
    setCategoryInput(category);
    setAmountInput(amount.toString());
    setTempDebitCharges(debitCharges);
    setTempCreditCharges(creditCharges);
  }, [category, amount, debitCharges, creditCharges]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => {
        setEditModalVisible(!editModalVisible);
      }}>
      <View style={styles.centeredView}>
        <Shadow
          distance={15}
          radius={20}
          viewStyle={styles.modalView}
          containerViewStyle={styles.modalShadowContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalHeaderText, themeColor]}>
              Edit: {category}
            </Text>
          </View>
          <View style={styles.modalBody}>
            <Text style={[styles.totalText, themeColor]}>Total: {total}</Text>
            <View style={styles.editOptions}>
              <Pressable
                style={[styles.optionPressable, {backgroundColor: 'red'}]}
                onPress={() => handleDelete()}>
                <Text style={[styles.modalBodyText, themeColor]}>Delete</Text>
              </Pressable>
              <Pressable
                style={[styles.optionPressable, {backgroundColor: 'green'}]}
                onPress={() => handleReset()}>
                <Text style={[styles.modalBodyText, themeColor]}>Reset</Text>
              </Pressable>
              <Pressable
                style={[styles.optionPressable, {backgroundColor: 'blue'}]}
                onPress={() => handleRollover()}>
                <Text style={[styles.modalBodyText, themeColor]}>Rollover</Text>
              </Pressable>
            </View>
            <View style={styles.updateExpenseContainer}>
              <View style={styles.updateLabelView}>
                <View style={{flexDirection: 'column'}}>
                  <View style={styles.updateCategoryLabel}>
                    <Text style={[styles.updateLabelText, themeColor]}>
                      Update Category Name:
                    </Text>
                  </View>
                  <View style={styles.updateAmountLabel}>
                    <Text style={[styles.updateLabelText, themeColor]}>
                      Update Initial Amount:
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.updateInputsView}>
                <TextInput
                  style={[
                    styles.updateExpenseTextInput,
                    themeColor,
                    categoryInputBorder,
                  ]}
                  onChangeText={setCategoryInput}
                  value={categoryInput}
                  keyboardType="default"
                  onFocus={() => setCategoryInputBorder({borderWidth: 1})}
                  onBlur={() => setCategoryInputBorder({borderWidth: 0.5})}
                />
                <TextInput
                  style={[
                    styles.updateExpenseTextInput,
                    themeColor,
                    amountInputBorder,
                  ]}
                  onChangeText={setAmountInput}
                  value={amountInput}
                  keyboardType="numeric"
                  onFocus={() => setAmountInputBorder({borderWidth: 1})}
                  onBlur={() => setAmountInputBorder({borderWidth: 0.5})}
                />
              </View>
            </View>
          </View>
          <View style={styles.modalFooter}>
            <Pressable
              style={[styles.footerPressables, styles.cancelPressable]}
              onPress={() => handleCancel()}>
              <Text style={[styles.textStyle, themeColor]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.footerPressables, styles.savePressable]}
              onPress={() => handleSave(categoryInput, amountInput)}>
              <Text style={[styles.textStyle, themeColor]}>Save</Text>
            </Pressable>
          </View>
        </Shadow>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalShadowContainer: {
    marginHorizontal: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalView: {
    width: '100%',
    borderRadius: 20,
  },
  modalHeader: {
    justifyContent: 'center',
    backgroundColor: PURPLE,
    height: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeaderText: {
    textAlign: 'center',
    fontSize: 20,
  },
  modalBody: {
    backgroundColor: LIGHT_GRAY,
    height: 500,
  },
  totalText: {
    fontSize: 30,
    alignSelf: 'center',
    marginTop: 30,
  },
  modalBodyText: {
    fontSize: 30,
    alignSelf: 'center',
  },
  editOptions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 30,
  },
  optionPressable: {
    backgroundColor: 'red',
    width: '30%',
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateExpenseContainer: {
    marginTop: 10,
    flexDirection: 'row',
    height: 120,
  },
  updateLabelView: {
    marginHorizontal: 10,
  },
  updateCategoryLabel: {
    height: 60,
    justifyContent: 'center',
  },
  updateAmountLabel: {
    height: 60,
    justifyContent: 'center',
  },
  updateLabelText: {
    fontSize: 20,
  },
  updateInputsView: {flex: 1, marginRight: 10, justifyContent: 'space-evenly'},
  updateExpenseTextInput: {
    fontSize: 20,
    paddingLeft: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    height: 55,
    backgroundColor: LIGHT_GRAY,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'space-evenly',
  },
  footerPressables: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPressable: {backgroundColor: 'gray', borderBottomLeftRadius: 20},
  savePressable: {backgroundColor: PURPLE, borderBottomRightRadius: 20},
  textStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditExpenseModal;
