import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  User,
} from 'react-native-google-signin';
import auth from '@react-native-firebase/auth';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './App/HomeScreen/HomeScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState();

  const [userInfo, setUserInfo] = useState<User>();
  const [gettingLoginStatus, setGettingLoginStatus] = useState<boolean>(true);

  const isDarkMode = useColorScheme() === 'dark';
  const themeBackgroundColor = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const themeColor = {
    color: isDarkMode ? 'white' : 'black',
  };

  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    // Initial configuration
    GoogleSignin.configure({
      // Mandatory method to call before calling signIn()
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      // Repleace with your webClientId
      // Generated from Firebase console
      webClientId:
        '1074270359253-nhors9unr6ur2a4um66nqstened0vct4.apps.googleusercontent.com',
    });
    // Check if user is already signed in
    _isSignedIn();

    return subscriber; // unsubscribe on unmount
  }, []);

  const _isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      Alert.alert('User is already signed in');
      // Set User Info if user is already signed in
      _getCurrentUserInfo();
    } else {
      console.log('Please Login');
    }
    setGettingLoginStatus(false);
  };

  const _getCurrentUserInfo = async () => {
    try {
      let info: User = await GoogleSignin.signInSilently();
      console.log('User Info --> ', info);
      setUserInfo(info);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        Alert.alert('User has not signed in yet');
        console.log('User has not signed in yet');
      } else {
        Alert.alert("Unable to get user's info");
        console.log("Unable to get user's info");
      }
    }
  };

  const _signIn = async () => {
    // It will prompt google Signin Widget
    try {
      await GoogleSignin.hasPlayServices({
        // Check if device has Google Play Services installed
        // Always resolves to true on iOS
        showPlayServicesUpdateDialog: true,
      });

      const userInfo = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken,
      );

      auth().signInWithCredential(googleCredential);

      console.log('User Info --> ', userInfo);
      setUserInfo(userInfo);
    } catch (error: any) {
      console.log('Message', JSON.stringify(error));

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('User Cancelled the Login Flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Signing In');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play Services Not Available or Outdated');
      } else {
        Alert.alert(error.message);
      }
    }
  };

  const _signOut = async () => {
    setGettingLoginStatus(true);
    // Remove user session from the device.
    try {
      auth().signOut();
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      // Removing user Info
      setUserInfo(undefined);
    } catch (error) {
      console.error(error);
    }
    setGettingLoginStatus(false);
  };

  if (initializing) return null;

  if (!user) {
    if (gettingLoginStatus) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    } else {
      return (
        <SafeAreaView style={{flex: 1}}>
          <View style={{...styles.container, ...themeBackgroundColor}}>
            <Text style={styles.titleText}>Google Sign-In</Text>
            <View style={styles.container}>
              {userInfo ? (
                <></>
              ) : (
                <GoogleSigninButton
                  style={{width: 312, height: 48}}
                  size={GoogleSigninButton.Size.Wide}
                  color={
                    isDarkMode
                      ? GoogleSigninButton.Color.Dark
                      : GoogleSigninButton.Color.Light
                  }
                  onPress={_signIn}
                />
              )}
            </View>
          </View>
        </SafeAreaView>
      );
    }
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{
            headerTitle: 'Xpense',
            headerRight: () => (
              <Button color={'#a5a180'} onPress={_signOut} title="Sign Out" />
            ),
            headerStyle: {backgroundColor: '#a49afc'},
            headerTintColor: themeColor.color,
          }}
          initialParams={{welcomeMessage: 'Hello World!'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  imageStyle: {
    width: 200,
    height: 300,
    resizeMode: 'contain',
  },
});

export default App;
