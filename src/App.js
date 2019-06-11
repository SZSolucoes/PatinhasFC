
import React from 'react';
import { YellowBox, AsyncStorage, NetInfo, AppState, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import Axios from 'axios';
import FCM, { FCMEvent, NotificationType, WillPresentNotificationResult } from 'react-native-fcm';
import { Actions } from 'react-native-router-flux';
import { decode, encode } from 'base-64';

import Routes from './Routes';
import reducers from './reducers';
import { startFbListener } from './utils/firebaseListeners';
import { mappedKeyStorage } from './utils/store';

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
            AsyncStorage.getItem(mappedKeyStorage('username'))
            .then((userName) => {
                if (userName) {
                    AsyncStorage.getItem(mappedKeyStorage('password'))
                    .then(async (password) => {
                        if (password) {
                            let loginAutomaticoEnabled = '';
                            try {
                                loginAutomaticoEnabled = await AsyncStorage.getItem(
                                    mappedKeyStorage('loginAutomaticoEnabled')
                                );
                            } catch (e) {
                                console.error(e);
                                AsyncStorage
                                .setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'yes');
                            }
                            if (loginAutomaticoEnabled && loginAutomaticoEnabled === 'yes') {
                                store.dispatch({
                                    type: 'modifica_username_login',
                                    payload: userName
                                });
                                store.dispatch({
                                    type: 'modifica_password_login',
                                    payload: password
                                });
                            }

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
        await FCM.createNotificationChannel({
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

        try {
            const firstNotif = await FCM.getInitialNotification();

            if (firstNotif && firstNotif.opened_from_tray) {
                const localAndTitle = (firstNotif.local_notification && !!firstNotif.title);

                const enquetesNotif = (
                    firstNotif.targetScreen && firstNotif.targetScreen === 'enquetes'
                );

                const muralNotif = (
                    firstNotif.targetScreen && firstNotif.targetScreen === 'mural'
                );

                if (enquetesNotif || (localAndTitle && firstNotif.title.includes('enquete'))) {
                    store.dispatch({
                        type: 'modifica_jumpscene_jogos',
                        payload: 'enquetes'
                    }); 
                } else if (muralNotif || (localAndTitle && firstNotif.title.includes('Mural'))) {
                    store.dispatch({
                        type: 'modifica_jumpscene_jogos',
                        payload: 'mural'
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }

        FCM.on(FCMEvent.Notification, notif => {
                if (notif && notif.opened_from_tray) {
                    if ((notif.targetScreen && notif.targetScreen === 'enquetes') ||
                    (
                        notif.local_notification && 
                        notif.title && 
                        notif.title.includes('enquete')
                    )) {
                        if (!store.getState().JogosReducer.jumpScene) {
                            setTimeout(() => {
                                if (Actions.currentScene !== 'profileEnquetes') {
                                    Actions.profileEnquetes();
                                }
                            }, 500);
                        }
                    } else if ((notif.targetScreen && notif.targetScreen === 'mural') ||
                    (
                        notif.local_notification && 
                        notif.title && 
                        notif.title.includes('Mural')
                    )) {
                        if (!store.getState().JogosReducer.jumpScene) {
                            setTimeout(() => {
                                if (Actions.currentScene !== 'mural') {
                                    Actions.mural();
                                }
                            }, 500);
                        }
                    }
                }
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
                            big_text: notif.fcm.body,
                            id: new Date().valueOf().toString(),
                            priority: 'high',
                            sound: 'default',
                            title: notif.fcm.title,
                            icon: 'ic_launcher',
                            large_icon: 'ic_launcher',
                            show_in_foreground: true,
                            vibrate: 300, 
                            lights: true,
                            targetScreen: notif.fcm.targetScreen
                        });
                    }
                }
            }
        );

        FCM.on(FCMEvent.RefreshToken, (newToken) => {
            if (newToken) {
                AsyncStorage.setItem(mappedKeyStorage('userNotifToken'), newToken); 
            }
        });

        try {
            const loginAutomaticoEnabled = await AsyncStorage.getItem(
                mappedKeyStorage('loginAutomaticoEnabled')
            );

            if (!loginAutomaticoEnabled) {
                AsyncStorage.setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'yes');
            }
        } catch (e) {
            console.error(e);
            AsyncStorage.setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'yes');
        }

        await FCM.getFCMToken().then(token => {
            if (token) {
                AsyncStorage.setItem(mappedKeyStorage('userNotifToken'), token); 
            }
        });

        try {
            const notifAllTopicEnabled = await AsyncStorage.getItem(
                mappedKeyStorage('notifAllTopicEnabled')
            );
            const notifEnquetesEnabled = await AsyncStorage.getItem(
                mappedKeyStorage('notifEnquetesEnabled')
            );
            const notifMuralEnabled = await AsyncStorage.getItem(
                mappedKeyStorage('notifMuralEnabled')
            );
            const notifInformativosEnabled = await AsyncStorage.getItem(
                mappedKeyStorage('notifInformativosEnabled')
            );

            if (notifAllTopicEnabled && notifAllTopicEnabled === 'yes') {
                FCM.subscribeToTopic('all');
            } else if (notifAllTopicEnabled && notifAllTopicEnabled === 'no') {
                FCM.unsubscribeFromTopic('all');
            } else {
                FCM.subscribeToTopic('all'); 
                AsyncStorage.setItem(mappedKeyStorage('notifAllTopicEnabled'), 'yes');
            }

            if (notifEnquetesEnabled && notifEnquetesEnabled === 'yes') {
                FCM.subscribeToTopic('enquetes');
            } else if (notifEnquetesEnabled && notifEnquetesEnabled === 'no') {
                FCM.unsubscribeFromTopic('enquetes');
            } else {
                FCM.subscribeToTopic('enquetes'); 
                AsyncStorage.setItem(mappedKeyStorage('notifEnquetesEnabled'), 'yes');
            }

            if (notifMuralEnabled && notifMuralEnabled === 'yes') {
                FCM.subscribeToTopic('mural');
            } else if (notifMuralEnabled && notifMuralEnabled === 'no') {
                FCM.unsubscribeFromTopic('mural');
            } else {
                FCM.subscribeToTopic('mural'); 
                AsyncStorage.setItem(mappedKeyStorage('notifMuralEnabled'), 'yes');
            }

            if (notifInformativosEnabled && notifInformativosEnabled === 'yes') {
                FCM.subscribeToTopic('informativos');
            } else if (notifInformativosEnabled && notifInformativosEnabled === 'no') {
                FCM.unsubscribeFromTopic('informativos');
            } else {
                FCM.subscribeToTopic('informativos');
                AsyncStorage.setItem(mappedKeyStorage('notifInformativosEnabled'), 'yes');
            }
        } catch (e) {
            console.error(e);
            FCM.subscribeToTopic('all'); 
            FCM.subscribeToTopic('enquetes');
            FCM.subscribeToTopic('mural');
            FCM.subscribeToTopic('informativos');
            AsyncStorage.setItem(mappedKeyStorage('notifAllTopicEnabled'), 'yes');
            AsyncStorage.setItem(mappedKeyStorage('notifEnquetesEnabled'), 'yes');
            AsyncStorage.setItem(mappedKeyStorage('notifMuralEnabled'), 'yes');
            AsyncStorage.setItem(mappedKeyStorage('notifInformativosEnabled'), 'yes');
        }
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
