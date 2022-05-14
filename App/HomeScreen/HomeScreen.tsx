import {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {StackParamsList} from '../Types';

type Props = NativeStackScreenProps<StackParamsList, 'HomeScreen'>;

const HomeScreen: React.FC<Props> = ({navigation, route}) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <View style={{...styles.container, ...backgroundStyle}}>
      <Pressable
        onPress={() => Alert.alert('pressed!')}
        style={styles.expensePressable}>
        <Text style={styles.buttonText}>Enter new expense</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  expensePressable: {
    flex: 0,
    height: 100,
    backgroundColor: 'gray',
    justifyContent: 'center',
    borderRadius: 25,
    margin: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 25,
  },
});

export default HomeScreen;
