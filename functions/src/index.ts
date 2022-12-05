import * as admin from 'firebase-admin';
import {UserRecord} from 'firebase-admin/lib/auth/user-record';
import * as functions from 'firebase-functions';

admin.initializeApp();

type UserDoc = {
  firstName: string;
  lastName: string;
  email: string;
  photoURL: string;
};

exports.createUserRecord = functions.auth
  .user()
  .onCreate((user: UserRecord, context: functions.EventContext) => {
    const [firstName, lastName] =
      user.displayName != null ? user.displayName.split(' ') : '';

    const userData: UserDoc = {
      firstName: firstName || '',
      lastName: lastName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
    };

    return admin.firestore().collection('Users').doc(user.uid).set(userData);
  });

exports.deleteUserRecord = functions.auth
  .user()
  .onDelete((user: UserRecord) => {
    return [
      admin.firestore().collection('Users').doc(user.uid).delete(),
      admin
        .firestore()
        .collection('Users')
        .doc(user.uid)
        .collection('Expenses')
        .listDocuments()
        .then(docs => docs.forEach(doc => doc.delete())),
    ];
  });
