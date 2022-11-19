import {useTheme} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';

import {deleteExpense, updateExpense} from '../firebase/firestore';
import {Expense, FirestoreExpense} from '../Types';

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

  const myTheme = useTheme().colors;
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

  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Press DELETE to delete this entire expense.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Delete'),
        },
        {
          text: 'DELETE',
          onPress: () => {
            deleteExpense(id)
              .then(res => {
                console.log(res);
                setEditModalVisible(false);
              })
              .catch(err => {
                console.error(err);
                Alert.alert('An error occurred');
              });
          },
        },
      ],
    );
  };

  const handleReset = () => {
    Alert.alert('Confirm Reset', 'Press RESET to reset your total.', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Reset'),
      },
      {
        text: 'RESET',
        onPress: () => {
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
        },
      },
    ]);
  };

  const handleRollover = () => {
    Alert.alert('Confirm Rollover', 'Press ROLLOVER to rollover your total.', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Rollover'),
      },
      {
        text: 'ROLLOVER',
        onPress: () => {
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
        },
      },
    ]);
  };

  const handleCancel = () => {
    setAmountInput(amount.toString());
    setCategoryInput(category);
    setEditModalVisible(false);
  };

  const handleUpdate = (newCategory: string, newAmount: string) => {
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
          style={styles.modalView}
          containerStyle={styles.modalShadowContainer}>
          <View
            style={[styles.modalHeader, {backgroundColor: myTheme.primary}]}>
            <Text style={[styles.modalHeaderText, {color: myTheme.text}]}>
              Edit: {category}
            </Text>
          </View>
          <View style={[styles.modalBody, {backgroundColor: myTheme.card}]}>
            <Text style={[styles.totalText, {color: myTheme.text}]}>
              Total: {total}
            </Text>
            <View style={styles.editOptions}>
              <Pressable
                style={[styles.optionPressable, {backgroundColor: 'red'}]}
                onPress={() => handleDelete()}>
                <Text style={[styles.modalBodyText, {color: myTheme.text}]}>
                  Delete
                </Text>
              </Pressable>
              <Pressable
                style={[styles.optionPressable, {backgroundColor: 'green'}]}
                onPress={() => handleReset()}>
                <Text style={[styles.modalBodyText, {color: myTheme.text}]}>
                  Reset
                </Text>
              </Pressable>
              <Pressable
                style={[styles.optionPressable, {backgroundColor: 'blue'}]}
                onPress={() => handleRollover()}>
                <Text style={[styles.modalBodyText, {color: myTheme.text}]}>
                  Rollover
                </Text>
              </Pressable>
            </View>
            <View style={styles.updateExpenseContainer}>
              <View style={styles.updateLabelView}>
                <View style={{flexDirection: 'column'}}>
                  <View style={styles.updateCategoryLabel}>
                    <Text
                      style={[styles.updateLabelText, {color: myTheme.text}]}>
                      Update Category Name:
                    </Text>
                  </View>
                  <View style={styles.updateAmountLabel}>
                    <Text
                      style={[styles.updateLabelText, {color: myTheme.text}]}>
                      Update Initial Amount:
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.updateInputsView}>
                <TextInput
                  style={[
                    styles.updateExpenseTextInput,
                    {color: myTheme.text},
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
                    {color: myTheme.text},
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
          <View style={[styles.modalFooter, {backgroundColor: myTheme.card}]}>
            <Pressable
              style={[styles.footerPressables, styles.cancelPressable]}
              onPress={() => handleCancel()}>
              <Text style={[styles.textStyle, {color: myTheme.text}]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.footerPressables,
                styles.savePressable,
                {backgroundColor: myTheme.primary},
              ]}
              onPress={() => handleUpdate(categoryInput, amountInput)}>
              <Text style={[styles.textStyle, {color: myTheme.text}]}>
                Update
              </Text>
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
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeaderText: {
    textAlign: 'center',
    fontSize: 20,
  },
  modalBody: {
    height: 350,
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
    height: 60,
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
  savePressable: {borderBottomRightRadius: 20},
  textStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditExpenseModal;
