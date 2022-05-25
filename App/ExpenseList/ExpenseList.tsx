import React, {useState} from 'react';
import {
  Alert,
  GestureResponderEvent,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import EditExpenseModal from '../EditExpenseModal/EditExpenseModal';

import ExpenseModal from '../ExpenseModal/ExpenseModal';
import {Expense, LIGHT_GRAY, LIST_HEIGHT} from '../Types';

type Props = {
  expense: Expense;
};

const ExpenseList: React.FC<Props> = ({expense}) => {
  const {id, category, amount, debitCharges, creditCharges} = expense;

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  const [total, setTotal] = useState<number>(amount);

  const isDarkMode = useColorScheme() === 'dark';
  const themeColor = {
    color: isDarkMode ? 'white' : 'black',
  };

  const handleListPress = (_event: GestureResponderEvent) => {
    setModalVisible(true);
  };

  const handleListLongPress = () => {
    setEditModalVisible(true);
  };

  return (
    <>
      <ExpenseModal
        expense={expense}
        setTotal={setTotal}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <EditExpenseModal
        expense={expense}
        total={total}
        setTotal={setTotal}
        editModalVisible={editModalVisible}
        setEditModalVisible={setEditModalVisible}
      />
      <Shadow
        distance={5}
        startColor={LIGHT_GRAY}
        radius={8}
        viewStyle={{width: '100%'}}
        containerViewStyle={styles.shadowContainer}>
        <Pressable
          style={({pressed}) =>
            pressed ? styles.listPressed : styles.listNotPressed
          }
          onPress={handleListPress}
          onLongPress={handleListLongPress}>
          <Text style={[styles.itemText, themeColor]}>
            {category}: {total}
          </Text>
        </Pressable>
      </Shadow>
    </>
  );
};

const styles = StyleSheet.create({
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
  listPressed: {
    height: LIST_HEIGHT,
    justifyContent: 'center',
    borderRadius: 8,
    paddingLeft: 8,
    backgroundColor: LIGHT_GRAY,
  },
  listNotPressed: {
    height: LIST_HEIGHT,
    justifyContent: 'center',
    borderRadius: 8,
    paddingLeft: 8,
  },
  itemText: {
    fontSize: 15,
  },
});

export default ExpenseList;
