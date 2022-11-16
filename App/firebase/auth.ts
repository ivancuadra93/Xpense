import auth from '@react-native-firebase/auth';

export function getUser() {
  return auth().currentUser;
}
