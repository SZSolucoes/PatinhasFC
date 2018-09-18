
import React from 'react';
import { YellowBox } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import Axios from 'axios';
import firebase from 'firebase';

import Routes from './Routes';
import reducers from './reducers';

export const store = createStore(reducers, {}, applyMiddleware(ReduxThunk));

class App extends React.Component {

    constructor(props) {
        super(props);

        Axios.defaults.timeout = 120000; // Timeout default para o Axios

        YellowBox.ignoreWarnings([
            'Warning: isMounted(...) is deprecated', 
            'Module RCTImageLoader'
        ]);
    }

    componentDidMount() {
        firebase.initializeApp({
        apiKey: 'AIzaSyBlCoHh_en9YwIGB2HRVQ4oWxjw3613jf4',
        authDomain: 'patinhasfc-46efc.firebaseapp.com',
        databaseURL: 'https://patinhasfc-46efc.firebaseio.com',
        projectId: 'patinhasfc-46efc',
        storageBucket: 'patinhasfc-46efc.appspot.com',
        messagingSenderId: '982612165762'
        });
    }

    render() {
        return (
            <Provider store={store}>
                <Routes />
            </Provider>
        );
    }
}

export default App;
