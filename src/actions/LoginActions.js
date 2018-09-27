import firebase from 'firebase';
import Moment from 'moment';
import b64 from 'base-64';
import { AsyncStorage } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { showAlert } from '../utils/store';

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

    const authRef = firebase.auth();
    
    authRef.signInWithEmailAndPassword(params.email, params.password)
    .then(() => onLoginSuccess(dispatch, params, authRef))
    .catch((error) => onLoginError(dispatch, error));
};

const onLoginSuccess = (dispatch, params, authRef) => {
    const dbUsuarioRef = firebase.database().ref().child(`usuarios/${b64.encode(params.email)}`);
    const dataAtual = Moment(new Date().toLocaleString()).format('DD/MM/YYYY HH:mm:ss');
    dbUsuarioRef.once('value', (snapshot) => { 
        if (!snapshot.val()) {
            dbUsuarioRef.set({
                uid: authRef.currentUser.uid,
                userDisabled: 'false',
                email: params.email,
                senha: params.password,
                nome: '',
                dtnasc: '', 
                tipoPerfil: 'socio',
                imgAvatar: '',
                imgBackground: '',
                level: '1',
                telefone: '',
                endereco: '',
                dataCadastro: dataAtual,
                dataHoraUltimoLogin: '',
                jogosParticipados: '',
                jogosEscalados: '',
                vitorias: '',
                derrotas: '',
                gols: '',
                faltas: '',
                cartoesAmarelos: '',
                cartoesVermelhos: '',
                posicao: ''
            })
            .then(() => true)
            .catch(() => true);
        }

        if (snapshot.val() && 
            snapshot.val().userDisabled && 
            snapshot.val().userDisabled === 'true') {
            dispatch({
                type: 'modifica_indicator_login',
                payload: false
            });
            showAlert('warning', 'Aviso!', 'Usuário desativado.');
        } else {
            dispatch({
                type: 'modifica_indicator_login',
                payload: false
            });
        
            AsyncStorage.setItem('username', params.email);
            AsyncStorage.setItem('password', params.password);
        
            Actions.mainTabBar();
        }
    });
};

const onLoginError = (dispatch, error) => {
    dispatch({
        type: 'modifica_indicator_login',
        payload: false
    });
    switch (error.code) {
        case 'auth/invalid-email':
            showAlert('warning', 'Aviso!', 'Email inválido.');
            break;
        case 'auth/user-disabled':
            showAlert('warning', 'Aviso!', 'Email informado não existe.');
            break;
        case 'auth/user-not-found':
            showAlert('warning', 'Aviso!', 'Email não cadastrado.');
            break;
        case 'auth/wrong-password':
            showAlert('warning', 'Aviso!', 'Email ou senha incorretos.');
            break;
        default:
    }
};

