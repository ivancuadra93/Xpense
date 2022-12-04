import React, {useEffect, useState} from 'react';
import {
  Alert,
  View,
  ActivityIndicator,
  SafeAreaView,
  Text,
  StyleSheet,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {
  User,
  GoogleSignin,
  statusCodes,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';
import {useTheme} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import {StackParamsList} from '../Types';

type Props = NativeStackScreenProps<StackParamsList, 'LoginScreen'>;

const LoginScreen: React.FC<Props> = ({route, navigation}: Props) => {
  const [gettingLoginStatus, setGettingLoginStatus] = useState<boolean>(true);

  const myTheme = useTheme().colors;
  const isDarkMode = useTheme().dark;

  useEffect(() => {
    // Initial configuration
    GoogleSignin.configure({
      // Mandatory method to call before calling signIn()
      scopes: ['https://www.googleapis.com/auth/cloud-platform.read-only'],
      // Repleace with your webClientId
      // Generated from Firebase console
      webClientId:
        '1074270359253-nhors9unr6ur2a4um66nqstened0vct4.apps.googleusercontent.com',
    });
    // Check if user is already signed in
    _isSignedIn();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Log In',
      headerStyle: {backgroundColor: myTheme.primary},
      headerTintColor: myTheme.text,
    });
  }, [myTheme]);

  const _isSignedIn = async () => {
    const isSignedIn = await GoogleSignin.isSignedIn();
    if (isSignedIn) {
      console.log('User is already signed in');

      // Set User Info if user is already signed in
      _getCurrentUserInfo();

      navigation.replace('HomeScreen', {welcomeMessage: ''});
    } else {
      console.log('Please Login');
    }

    setGettingLoginStatus(false);
  };

  const _getCurrentUserInfo = async () => {
    try {
      const userInfo: User = await GoogleSignin.signInSilently();
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken,
      );

      auth().signInWithCredential(googleCredential);

      console.log('User Info --> ', userInfo);
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

      const userInfo: User = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(
        userInfo.idToken,
      );

      auth().signInWithCredential(googleCredential);

      console.log('User Info --> ', userInfo);

      navigation.replace('HomeScreen', {welcomeMessage: ''});
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

  if (gettingLoginStatus) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  } else {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={[styles.container, {backgroundColor: myTheme.background}]}>
          <Text style={[styles.titleText, {color: myTheme.text}]}>
            Google Sign-In
          </Text>
          <View style={styles.container}>
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
          </View>
        </View>
      </SafeAreaView>
    );
  }
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

export default LoginScreen;
