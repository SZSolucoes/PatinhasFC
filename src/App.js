
import React from 'react';
import { YellowBox, AsyncStorage, NetInfo, AppState, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import Axios from 'axios';
import FCM, { FCMEvent, NotificationType, WillPresentNotificationResult } from 'react-native-fcm';
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

    async componentDidMount() {
        FCM.createNotificationChannel({
            id: 'default',
            name: 'Default',
            description: 'used for example',
            priority: 'high'
        });
        
        try {
            await FCM.requestPermissions({
                badge: true,
                sound: true,
                alert: true
            });
        } catch (e) {
            console.error(e);
        }

        FCM.getFCMToken().then(token => {
            if (token) {
                AsyncStorage.setItem('userNotifToken', token); 
            }
        });  
        FCM.on(FCMEvent.Notification, notif => {
                if (AppState.currentState === 'active') {
                    if (Platform.OS === 'ios' && 
                    notif._notificationType === NotificationType.WillPresent && 
                    !notif.local_notification) {
                        // Bloco de customização para a notificação local ios
                        /*FCM.presentLocalNotification({
                            channel: 'default', 
                            title: 'Test Notification with action', 
                            body: notif.fcm.body, 
                            sound: 'default', 
                            priority: 'high', 
                            show_in_foreground: true,
                        });*/
                        notif.finish(WillPresentNotificationResult.All);
                    } else if (Platform.OS === 'android') {
                        FCM.presentLocalNotification({
                            channel: 'default',
                            body: notif.fcm.body,
                            id: new Date().valueOf().toString(),
                            priority: 'high',
                            sound: 'default',
                            title: notif.fcm.title,
                            icon: 'ic_launcher',
                            large_icon: 'ic_launcher',
                            show_in_foreground: true,
                            vibrate: 300, 
                            lights: true
                        });
                    }
                }
            }
        );
        FCM.on(FCMEvent.RefreshToken, (newToken) => {
            if (newToken) {
                AsyncStorage.setItem('userNotifToken', newToken); 
            }
        });

        AsyncStorage.getItem('notifAllTopicEnabled').then((enabled) => {
            if (enabled && enabled === 'true') {
                FCM.subscribeToTopic('all');
            } else if (enabled && enabled === 'false') {
                FCM.unsubscribeFromTopic('all');
            } else {
                FCM.subscribeToTopic('all');
                setTimeout(() => AsyncStorage.setItem('notifAllTopicEnabled', 'true'), 500);
            }
        });
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
