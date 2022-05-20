import React, {useEffect, useState} from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {updateCharges} from '../firebase/firestore';
import {
  DARK_GRAY,
  Expense,
  LIGHT_GRAY,
  OFF_WHITE,
  PURPLE,
  SHADOW,
  TAN,
} from '../Types';

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

  const [calculationText, setCalculationText] = useState<JSX.Element>();
  const [isDecimal, setIsDecimal] = useState<boolean>(false);
  const [operation, setOperation] = useState<string>('-');
  const [isDebit, setIsDebit] = useState<boolean>(true);
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

  generateBoxShadowStyle(-2, 4, SHADOW, 0.2, 3, 4, SHADOW);

  useEffect(() => {
    let total: number = amount;
    let debitString: string = '';
    let creditString: string = '';

    for (let i = 0; i < tempDebitCharges.length; i++) {
      total += tempDebitCharges[i];

      if (tempDebitCharges[i] < 0) {
        debitString += ` - ${tempDebitCharges[i] * -1}  = ${total}`;
      } else {
        debitString += ` + ${tempDebitCharges[i]} = ${total}`;
      }
    }

    for (let i = 0; i < tempCreditCharges.length; i++) {
      total += tempCreditCharges[i];

      if (tempCreditCharges[i] < 0) {
        creditString += ` - ${tempCreditCharges[i] * -1}  = ${total}`;
      } else {
        creditString += ` + ${tempCreditCharges[i]} = ${total}`;
      }
    }

    setTotal(total);

    setCalculationText(
      <>
        <Text style={[styles.calculationText, themeColor]}>{amount}</Text>
        <Text style={[styles.calculationText, {color: 'green'}]}>
          {debitString}
        </Text>
        <Text style={[styles.calculationText, {color: 'red'}]}>
          {creditString}
        </Text>
      </>,
    );
  }, [tempDebitCharges, tempCreditCharges]);

  const appendNum = (num: number) => {
    let calculatorInputNum = Number(calculatorInputString);

    if (isDecimal) {
      const decimalLen = calculatorInputString.split('.')[1].length;
      if (decimalLen >= 2) {
        return;
      }
      setCalculatorInputString(
        (calculatorInputNum + num / Math.pow(10, decimalLen + 1)).toString(),
      );
    } else {
      setCalculatorInputString((calculatorInputNum * 10 + num).toString());
    }
  };

  const backSpace = () => {
    const newCalculatorInputString = calculatorInputString
      .toString()
      .slice(0, -1);
    if (!newCalculatorInputString.includes('.')) {
      setIsDecimal(false);
    }
    setCalculatorInputString(calculatorInputString.toString().slice(0, -1));
  };

  const addDecimal = () => {
    if (isDecimal) {
      return;
    }

    setCalculatorInputString(prev => prev + '.');
    setIsDecimal(true);
  };

  const calculate = () => {
    setIsDecimal(false);
    setOperation('-');
    setCalculatorInputString('0');

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
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        setModalVisible(!modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text
              style={[styles.modalHeaderText, styles.boxShadow, themeColor]}>
              {category}
            </Text>
          </View>
          <View style={styles.modalBody}>
            <View style={styles.calculationView}>{calculationText}</View>
            <View style={styles.calculatorInput}>
              <Text style={[styles.calculatorInputText, themeColor]}>
                {operation + ' ' + calculatorInputString}
              </Text>
            </View>
            <View style={styles.calculator}>
              <View style={styles.calculatorRow}>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(1)}>
                  <Text style={[styles.calculatorText, themeColor]}>1</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(2)}>
                  <Text style={[styles.calculatorText, themeColor]}>2</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(3)}>
                  <Text style={[styles.calculatorText, themeColor]}>3</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => setOperation('+')}>
                  <Text style={[styles.calculatorText, themeColor]}>+</Text>
                </Pressable>
              </View>
              <View style={styles.calculatorRow}>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(4)}>
                  <Text style={[styles.calculatorText, themeColor]}>4</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(5)}>
                  <Text style={[styles.calculatorText, themeColor]}>5</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(6)}>
                  <Text style={[styles.calculatorText, themeColor]}>6</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => setOperation('-')}>
                  <Text style={[styles.calculatorText, themeColor]}>-</Text>
                </Pressable>
              </View>
              <View style={styles.calculatorRow}>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(7)}>
                  <Text style={[styles.calculatorText, themeColor]}>7</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(8)}>
                  <Text style={[styles.calculatorText, themeColor]}>8</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(9)}>
                  <Text style={[styles.calculatorText, themeColor]}>9</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => backSpace()}>
                  <Text style={[styles.calculatorText, themeColor]}>
                    {'<-'}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.calculatorRow}>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => setIsDebit(!isDebit)}>
                  <Text style={[styles.calculatorText, themeColor]}>
                    {isDebit ? 'Debit' : 'Credit'}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => appendNum(0)}>
                  <Text style={[styles.calculatorText, themeColor]}>0</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => addDecimal()}>
                  <Text style={[styles.calculatorText, themeColor]}>.</Text>
                </Pressable>
                <Pressable
                  style={styles.calculatorPressable}
                  onPress={() => calculate()}>
                  <Text style={[styles.calculatorText, themeColor]}>=</Text>
                </Pressable>
              </View>
              <View style={styles.calculatorRow}></View>
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalView: {
    flex: 0.5,
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 10,
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
    height: '100%',
  },
  calculationView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 10,
  },
  calculationText: {fontSize: 20},
  calculator: {
    // flex: 1,
    alignContent: 'space-between',
    backgroundColor: 'yellow',
  },
  calculatorRow: {flexDirection: 'row', justifyContent: 'space-evenly'},
  calculatorInput: {
    alignItems: 'center',
    backgroundColor: 'green',
    height: 40,
  },
  calculatorInputText: {fontSize: 20},
  calculatorPressable: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    width: '22%',
    height: 50,
    backgroundColor: 'red',
  },
  calculatorText: {fontSize: 30},
  modalFooter: {
    flexDirection: 'row',
    height: 55,
    backgroundColor: LIGHT_GRAY,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'space-evenly',
  },
  boxShadow: {},
  footerPressables: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelPressable: {backgroundColor: 'red', borderBottomLeftRadius: 20},
  savePressable: {backgroundColor: 'green', borderBottomRightRadius: 20},
  pressableOpen: {
    backgroundColor: '#F194FF',
  },
  pressableClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ExpenseModal;
