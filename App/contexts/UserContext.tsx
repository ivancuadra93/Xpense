import React, {createContext, useState, useEffect, useContext} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

const UserContext = createContext<FirebaseAuthTypes.User | null>(null);

export const UserAuthProvider: React.FC<{children: any}> = ({children}) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(setUser);
    return () => subscriber();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUserContext = (): {user: FirebaseAuthTypes.User | null} => {
  const user = useContext(UserContext);
  if (user === undefined) {
    throw new Error(
      'useUserContext hook must be used within an UserAuthProvider',
    );
  }
  return {user};
};
