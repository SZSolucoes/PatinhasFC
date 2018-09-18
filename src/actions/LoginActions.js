import firebase from 'firebase';
import { Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';

export const modificaUsername = (value) => ({
    type: 'modifica_username_login',
    payload: value
});

export const modificaPassword = (value) => ({
    type: 'modifica_password_login',
    payload: value
});

export const modificaHidePw = (value) => ({
    type: 'modifica_hidepw_login',
    payload: value
});

export const modificaShowLogoLogin = (value) => ({
    type: 'modifica_showlogologin_login',
    payload: value
});

export const modificaModalVisible = (value) => ({
    type: 'modifica_modalvisible_login',
    payload: value
});

export const modificaUserToken = (value) => ({
    type: 'modifica_usertoken_login',
    payload: value
});

export const modificaCleanLogin = () => ({
    type: 'modifica_clean_login'
});

export const doLogin = (params) => dispatch => {
    dispatch({
        type: 'modifica_indicator_login',
        payload: true
    });
    firebase.auth().signInWithEmailAndPassword(params.email, params.password)
    .then(() => onLoginSuccess(dispatch))
    .catch((error) => onLoginError(dispatch, error));
};

const onLoginSuccess = (dispatch) => {
    dispatch({
        type: 'modifica_indicator_login',
        payload: false
    });
    Actions.mainTabBar();
};

const onLoginError = (dispatch, error) => {
    dispatch({
        type: 'modifica_indicator_login',
        payload: false
    });
    switch (error.code) {
        case 'auth/invalid-email':
            Alert.alert('Patinhas FC', 'E-mail inválido.');
            break;
        case 'auth/user-disabled':
            Alert.alert('Patinhas FC', 'E-mail informado não existe.');
            break;
        case 'auth/user-not-found':
            Alert.alert('Patinhas FC', 'E-mail não cadastrado.');
            break;
        case 'auth/wrong-password':
            Alert.alert('Patinhas FC', 'E-mail ou senha incorretos.');
            break;
        default:
    }
};

