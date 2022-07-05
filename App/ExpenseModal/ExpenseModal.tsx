import React, {useEffect, useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';

import {updateCharges} from '../firebase/firestore';
import {DARK_GRAY, Expense, LIGHT_GRAY, OFF_WHITE, PURPLE} from '../Types';

type Props = {
  expense: Expense;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  modalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const ExpenseModal: React.FC<Props> = ({
  expense,
  setTotal,
  modalVisible,
  setModalVisible,
}) => {
  const {id, category, amount, debitCharges, creditCharges} = expense;

  const [calculationText, setCalculationText] = useState<JSX.Element>(
    <Text></Text>,
  );
  const [isDecimal, setIsDecimal] = useState<boolean>(false);
  const [operation, setOperation] = useState<string>('-');
  const [isDebit, setIsDebit] = useState<boolean>(false);
  const [calculatorInputString, setCalculatorInputString] =
    useState<string>('0');
  const [tempDebitCharges, setTempDebitCharges] = useState<number[]>([
    ...debitCharges,
  ]);
  const [tempCreditCharges, setTempCreditCharges] = useState<number[]>([
    ...creditCharges,
  ]);

  const isDarkMode = useColorScheme() === 'dark';
  const themeBackgroundColor = {
    backgroundColor: isDarkMode ? DARK_GRAY : OFF_WHITE,
  };
  const themeColor = {
    color: isDarkMode ? 'white' : 'black',
  };

  function handleChargeEdit(
    i: number,
    setChargeFunction: React.Dispatch<React.SetStateAction<number[]>>,
  ) {
    Alert.alert('Delete Entry', 'Are you sure you want to delete?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () =>
          setChargeFunction(prev =>
            prev.filter((_value: number, index: number) => index !== i),
          ),
      },
    ]);
  }

  useEffect(() => {
    let total: number = amount;
    let debitTextComponents: JSX.Element[] = [];
    let creditTextComponents: JSX.Element[] = [];

    for (let i = 0; i < tempDebitCharges.length; i++) {
      total += tempDebitCharges[i];

      if (total.toString().includes('.')) {
        const totalDecimalLen = total.toString().split('.')[1].length;
        if (totalDecimalLen > 2) {
          total = Number(total.toFixed(2));
        }
      }

      if (tempDebitCharges[i] < 0) {
        debitTextComponents.push(
          <Text
            key={i}
            onLongPress={() => handleChargeEdit(i, setTempDebitCharges)}>{` - ${
            tempDebitCharges[i] * -1
          } = ${total}`}</Text>,
        );
      } else {
        debitTextComponents.push(
          <Text
            key={i}
            onLongPress={() => handleChargeEdit(i, setTempDebitCharges)}>
            {` + ${tempDebitCharges[i]} = ${total}`}
          </Text>,
        );
      }
    }

    for (let i = 0; i < tempCreditCharges.length; i++) {
      total += tempCreditCharges[i];

      if (total.toString().includes('.')) {
        const totalDecimalLen = total.toString().split('.')[1].length;
        if (totalDecimalLen > 2) {
          total = Number(total.toFixed(2));
        }
      }

      if (tempCreditCharges[i] < 0) {
        creditTextComponents.push(
          <Text
            key={i}
            onLongPress={() =>
              handleChargeEdit(i, setTempCreditCharges)
            }>{` - ${tempCreditCharges[i] * -1} = ${total}`}</Text>,
        );
      } else {
        creditTextComponents.push(
          <Text
            key={i}
            onLongPress={() => handleChargeEdit(i, setTempCreditCharges)}>
            {` + ${tempCreditCharges[i]} = ${total}`}
          </Text>,
        );
      }
    }

    setTotal(total);

    const calcText: JSX.Element = (
      <Text style={styles.calculationText}>
        <Text style={themeColor}>{amount}</Text>
        <Text style={{color: 'green'}}>{debitTextComponents}</Text>

        {isDebit ? (
          <>
            <Text> </Text>
            <Text
              style={[
                styles.currentPosition,
                {textDecorationColor: 'green'},
                themeColor,
              ]}>
              {`${operation} ${calculatorInputString}`}
            </Text>
          </>
        ) : (
          <></>
        )}

        <Text style={{color: 'red'}}>{creditTextComponents}</Text>

        {!isDebit ? (
          <>
            <Text> </Text>
            <Text
              style={[
                styles.currentPosition,
                {textDecorationColor: 'red'},
                themeColor,
              ]}>
              {`${operation} ${calculatorInputString}`}
            </Text>
          </>
        ) : (
          <></>
        )}
      </Text>
    );

    setCalculationText(calcText);
  }, [
    tempDebitCharges,
    tempCreditCharges,
    operation,
    calculatorInputString,
    isDebit,
    amount,
    isDarkMode,
  ]);

  useEffect(() => {
    setTempDebitCharges(debitCharges);
    setTempCreditCharges(creditCharges);
  }, [debitCharges, creditCharges]);

  const appendNum = (num: number) => {
    let calculatorInputNum = Number(calculatorInputString);

    if (isDecimal) {
      const decimalLen = calculatorInputString.split('.')[1].length;

      if (decimalLen === 0) {
        setCalculatorInputString(
          (calculatorInputNum + num / Math.pow(10, decimalLen + 1)).toFixed(1),
        );
        return;
      }
      if (decimalLen === 1) {
        setCalculatorInputString(
          (calculatorInputNum + num / Math.pow(10, decimalLen + 1)).toFixed(2),
        );
        return;
      }
    } else {
      setCalculatorInputString((calculatorInputNum * 10 + num).toString());
    }
  };

  const backSpace = () => {
    const newCalculatorInputString = calculatorInputString.slice(0, -1);

    if (!newCalculatorInputString.includes('.')) {
      setIsDecimal(false);
    }

    if (newCalculatorInputString.length === 0) {
      setCalculatorInputString('0');
    } else {
      setCalculatorInputString(newCalculatorInputString);
    }
  };

  const addDecimal = () => {
    if (isDecimal) {
      return;
    }

    setCalculatorInputString(prev => prev + '.');
    setIsDecimal(true);
  };

  const calculate = () => {
    setCalculatorInputString('0');
    setIsDecimal(false);

    if (isDebit) {
      setTempDebitCharges(prev => [
        ...prev,
        Number(operation + calculatorInputString),
      ]);
    } else {
      setTempCreditCharges(prev => [
        ...prev,
        Number(operation + calculatorInputString),
      ]);
    }
  };

  const handleCancel = () => {
    setTempDebitCharges([...debitCharges]);
    setTempCreditCharges([...creditCharges]);
    setModalVisible(false);
  };

  const handleSave = () => {
    updateCharges(id, tempDebitCharges, tempCreditCharges)
      .then(() => setModalVisible(false))
      .catch(err => console.error(err));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => handleCancel()}>
      <View style={styles.centeredView}>
        <Shadow
          distance={15}
          radius={20}
          viewStyle={styles.modalView}
          containerViewStyle={styles.modalShadowContainer}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalHeaderText, themeColor]}>{category}</Text>
          </View>
          <View style={styles.modalBody}>
            <ScrollView style={styles.calculationScrollView}>
              {calculationText}
            </ScrollView>
            <View style={styles.calculator}>
              <View style={styles.calculatorRow}>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(1)}>
                    <Text style={[styles.calculatorText, themeColor]}>1</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(2)}>
                    <Text style={[styles.calculatorText, themeColor]}>2</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(3)}>
                    <Text style={[styles.calculatorText, themeColor]}>3</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => setOperation('+')}>
                    <Text style={[styles.calculatorText, themeColor]}>+</Text>
                  </Pressable>
                </Shadow>
              </View>
              <View style={styles.calculatorRow}>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(4)}>
                    <Text style={[styles.calculatorText, themeColor]}>4</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(5)}>
                    <Text style={[styles.calculatorText, themeColor]}>5</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(6)}>
                    <Text style={[styles.calculatorText, themeColor]}>6</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => setOperation('-')}>
                    <Text style={[styles.calculatorText, themeColor]}>-</Text>
                  </Pressable>
                </Shadow>
              </View>
              <View style={styles.calculatorRow}>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(7)}>
                    <Text style={[styles.calculatorText, themeColor]}>7</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(8)}>
                    <Text style={[styles.calculatorText, themeColor]}>8</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(9)}>
                    <Text style={[styles.calculatorText, themeColor]}>9</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => backSpace()}>
                    <Text style={[styles.calculatorText, themeColor]}>
                      {'<-'}
                    </Text>
                  </Pressable>
                </Shadow>
              </View>
              <View style={styles.calculatorRow}>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => setIsDebit(!isDebit)}>
                    <Text
                      style={[
                        styles.calculatorText,
                        isDebit ? {color: 'green'} : {color: 'red'},
                      ]}>
                      {isDebit ? 'Debit' : 'Credit'}
                    </Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => appendNum(0)}>
                    <Text style={[styles.calculatorText, themeColor]}>0</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => addDecimal()}>
                    <Text style={[styles.calculatorText, themeColor]}>.</Text>
                  </Pressable>
                </Shadow>
                <Shadow
                  distance={10}
                  radius={20}
                  viewStyle={{width: '100%'}}
                  containerViewStyle={styles.calculatorShadowContainer}>
                  <Pressable
                    style={({pressed}) =>
                      pressed
                        ? [styles.calculatorPressable]
                        : [styles.calculatorPressable, themeBackgroundColor]
                    }
                    onPress={() => calculate()}>
                    <Text style={[styles.calculatorText, themeColor]}>=</Text>
                  </Pressable>
                </Shadow>
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
              onPress={() => handleSave()}>
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
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeaderText: {
    textAlign: 'center',
    fontSize: 20,
  },
  modalBody: {
    justifyContent: 'space-evenly',
    backgroundColor: LIGHT_GRAY,
    height: 500,
  },
  calculationScrollView: {
    margin: 10,
  },
  calculationText: {
    fontSize: 20,
  },
  currentPosition: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  calculator: {
    alignContent: 'space-between',
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginHorizontal: 10,
  },
  calculatorShadowContainer: {
    width: '22%',
    margin: 10,
  },
  calculatorPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 20,
  },
  calculatorText: {fontSize: 30},
  modalFooter: {
    flexDirection: 'row',
    height: 60,
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

export default ExpenseModal;
