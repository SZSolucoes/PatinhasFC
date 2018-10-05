
import React from 'react';
import { YellowBox, AsyncStorage, NetInfo } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import Axios from 'axios';
import { decode, encode } from 'base-64';

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

        this.onNetInfoChanged = this.onNetInfoChanged.bind(this);

        Axios.defaults.timeout = 80000; // Timeout default para o Axios

        YellowBox.ignoreWarnings([
            'Warning: isMounted(...) is deprecated', 
            'Module RCTImageLoader',
            'Setting a timer',
            'Deprecation warning: value provided is not in a recognized',
            'Require cycle:'
        ]);

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
        
        NetInfo.addEventListener(
            'connectionChange',
            this.onNetInfoChanged
        );
    }

    onNetInfoChanged(conInfo) {
        if (conInfo.type === 'none' || 
            conInfo.type === 'unknown' || 
            conInfo.type === 'wifi' || 
            conInfo.type === 'cellular' || 
            conInfo.effectiveType === 'unknown') {
                store.dispatch({
                    type: 'modifica_coninfo_login',
                    payload: conInfo
                });
            }
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
