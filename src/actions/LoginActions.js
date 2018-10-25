
import { AsyncStorage } from 'react-native';
import Moment from 'moment';
import b64 from 'base-64';
import { Actions } from 'react-native-router-flux';
import firebase from '../Firebase';
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

export const modificaUserLogged = (value) => ({
    type: 'modifica_userlogged_login',
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
    .then(() => onLoginSuccess(dispatch, params))
    .catch((error) => onLoginError(dispatch, error));
};

const onLoginSuccess = (dispatch, params) => {
    const dbUsuarioRef = firebase.database().ref().child(`usuarios/${b64.encode(params.email)}`);
    const dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');
    let usuarioLogged = {};
    dbUsuarioRef.once('value', (snapshot) => {
        const snapVal = snapshot.val();
        if (!snapVal) {
            usuarioLogged = {
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
                dataHoraUltimoLogin: dataAtual,
                jogosParticipados: '0',
                jogosEscalados: '0',
                vitorias: '0',
                derrotas: '0',
                empates: '0',
                gols: '0',
                faltas: '0',
                cartoesAmarelos: '0',
                cartoesVermelhos: '0',
                posicao: '',
                userNotifToken: '',
                infoImgUpdated: 'true', 
                jogosImgUpdated: 'true'
            };

            dbUsuarioRef.set({ ...usuarioLogged })
            .then(() => true)
            .catch(() => true);
        }

        if (snapVal && 
            snapVal.userDisabled && 
            snapVal.userDisabled === 'true') {
            dispatch({
                type: 'modifica_indicator_login',
                payload: false
            });
            showAlert('warning', 'Aviso!', 'Usuário desativado.');
        } else {
            dispatch({
                type: 'modifica_userlogged_login',
                payload: snapVal || {}
            });
            dispatch({
                type: 'modifica_userlevel_login',
                payload: snapVal && snapVal.level ? snapVal.level : '1'
            });
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
            showAlert('warning', 'Aviso!', 'Falha de conexão.');
    }
};

