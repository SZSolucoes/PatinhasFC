
import React from 'react';
import { YellowBox, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import Axios from 'axios';
import { decode, encode } from 'base-64';
import firebase from 'firebase';

import Routes from './Routes';
import reducers from './reducers';
import { startFbListener } from './utils/firebaseListeners';

if (!global.btoa) {
    global.btoa = encode;
}

if (!global.atob) {
    global.atob = decode;
}

export const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));

class App extends React.Component {

    constructor(props) {
        super(props);

        Axios.defaults.timeout = 120000; // Timeout default para o Axios

        YellowBox.ignoreWarnings([
            'Warning: isMounted(...) is deprecated', 
            'Module RCTImageLoader',
            'Setting a timer',
            'Deprecation warning: value provided is not in a recognized',
            'Require cycle:'
        ]);
    }

    render() {
        firebase.initializeApp({
            apiKey: 'AIzaSyBlCoHh_en9YwIGB2HRVQ4oWxjw3613jf4',
            authDomain: 'patinhasfc-46efc.firebaseapp.com',
            databaseURL: 'https://patinhasfc-46efc.firebaseio.com',
            projectId: 'patinhasfc-46efc',
            storageBucket: 'patinhasfc-46efc.appspot.com',
            messagingSenderId: '982612165762'
        });
        setTimeout(() => 
            AsyncStorage.getItem('username')
            .then((userName) => {
                if (userName) {
                    AsyncStorage.getItem('password')
                    .then((password) => {
                        if (password) {
                            store.dispatch({
                                type: 'modifica_username_login',
                                payload: userName
                            });
                            store.dispatch({
                                type: 'modifica_password_login',
                                payload: password
                            });

                            startFbListener('usuario', { email: userName });
                        } 
                    });
                } 
            }
        ), 1000);
        return (
            <Provider store={store}>
                <Routes />
            </Provider>
        );
    }
}

export default App;
