import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import {Shadow} from 'react-native-shadow-2';
import {LIGHT_GRAY, LIST_HEIGHT} from '../Types';

type Props = {
  category: string;
  id: string;
  amount: string;
  debitCharges: number[];
  creditCharges: number[];
};
const ExpenseList: React.FC<Props> = ({
  category,
  id,
  amount,
  debitCharges,
  creditCharges,
}) => {
  // const [modalVisible, setModalVisible] = useState<boolean>(false);

  const isDarkMode = useColorScheme() === 'dark';
  const themeColor = {
    color: isDarkMode ? 'white' : 'black',
  };

  const handleListPress = (_event: GestureResponderEvent) => {};

  return (
    <Shadow
      distance={5}
      startColor={'#b5b5b5'}
      radius={8}
      viewStyle={{width: '100%'}}
      containerViewStyle={styles.shadowContainer}>
      <Pressable
        style={({pressed}) =>
          pressed ? styles.listPressed : styles.listNotPressed
        }
        onPress={handleListPress}>
        <Text style={[styles.itemText, themeColor]}>
          {category}: {amount}
        </Text>
      </Pressable>
    </Shadow>
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
