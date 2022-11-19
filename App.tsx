import React from 'react';
import {useColorScheme} from 'react-native';

import {
  DefaultTheme,
  DarkTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './App/HomeScreen/HomeScreen';
import LoginScreen from './App/LoginScreen/LoginScreen';
import {StackParamsList} from './App/Types';
import {UserAuthProvider} from './App/contexts/UserContext';

const Stack = createNativeStackNavigator<StackParamsList>();

const App = () => {
  const scheme = useColorScheme();

  const MyDefaultTheme: Theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#a49afc', // purple
      background: '#e5e3f3', // off-white
      text: 'black',
      card: '#b5b5b5', // light-gray
      border: 'gray',
    },
    dark: false,
  };

  const MyDarkTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#a49afc', // purple
      background: '#5c5a5b', // dark-gray
      text: 'white',
      card: '#b5b5b5', // light-gray
      border: 'gray',
    },
    dark: true,
  };

  return (
    <UserAuthProvider>
      <NavigationContainer
        theme={scheme === 'dark' ? MyDarkTheme : MyDefaultTheme}>
        <Stack.Navigator>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserAuthProvider>
  );
};

export default App;
