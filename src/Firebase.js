import * as firebase from 'firebase';

const config = {
    apiKey: 'AIzaSyBlCoHh_en9YwIGB2HRVQ4oWxjw3613jf4',
    authDomain: 'patinhasfc-46efc.firebaseapp.com',
    databaseURL: 'https://patinhasfc-46efc.firebaseio.com',
    projectId: 'patinhasfc-46efc',
    storageBucket: 'patinhasfc-46efc.appspot.com',
    messagingSenderId: '982612165762'
};

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();

