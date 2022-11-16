import React from 'react';
import {Button, useColorScheme} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './App/HomeScreen/HomeScreen';
import LoginScreen from './App/LoginScreen/LoginScreen';
import {PURPLE, StackParamsList, TAN} from './App/Types';
import {UserAuthProvider} from './App/contexts/UserContext';

const Stack = createNativeStackNavigator<StackParamsList>();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const themeColor = {
    color: isDarkMode ? 'white' : 'black',
  };

  return (
    <UserAuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="LoginScreen"
            component={LoginScreen}
            options={{
              headerTitle: 'Log In',
              headerStyle: {backgroundColor: PURPLE},
              headerTintColor: themeColor.color,
            }}
          />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              headerTitle: 'Xpense',
              headerStyle: {backgroundColor: PURPLE},
              headerTintColor: themeColor.color,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </UserAuthProvider>
  );
};

export default App;
