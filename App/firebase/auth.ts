import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

export function getUser() {
  return auth().currentUser;
}

export async function signOut() {
  try {
    auth().signOut();
    await GoogleSignin.signOut();
  } catch (error) {
    console.error(error);
  }
}
