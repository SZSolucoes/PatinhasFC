
import firebase from 'firebase';
import _ from 'lodash';
import b64 from 'base-64';
import { store } from '../App';

let jogosListener = null;
let usuariosListener = null;
let usuarioListener = null;

let jogosListenerOn = false;
let usuariosListenerOn = false;
let usuarioListenerOn = false;

export const startFbListener = (name, params) => {
    const databaseRef = firebase.database().ref();

    switch (name) {
        case 'jogos':
            // LISTENER FIREBASE JOGOS
            if (!jogosListener || (jogosListener && !jogosListenerOn)) {
                jogosListener = databaseRef.child('jogos');
                jogosListener.on('value', (snapshot) => {
                    store.dispatch({
                        type: 'modifica_listjogos_jogos',
                        payload: _.map(snapshot.val(), (value, key) => ({ key, ...value }))
                    });      
                });
                jogosListenerOn = true;
            }
            break;
        case 'usuarios':
            // LISTENER FIREBASE USUARIOS
            if (!usuariosListener || (usuariosListener && !usuariosListenerOn)) {
                usuariosListener = databaseRef.child('usuarios');
                usuariosListener.on('value', (snapshot) => {
                    store.dispatch({
                        type: 'modifica_listusuarios_usuarios',
                        payload: _.map(snapshot.val(), (value, key) => ({ key, ...value }))
                    });
                });
                usuariosListenerOn = true;
            }
            break;
        case 'usuario':
            // LISTENER FIREBASE USUARIO
            if (!usuarioListener || (usuarioListener && !usuarioListenerOn)) {
                usuarioListener = databaseRef.child(`usuarios/${b64.encode(params.email)}`);
                usuarioListener.on('value', (snapshot) => {
                    if (snapshot.val()) {
                        if (snapshot.val().level !== store.getState().LoginReducer.userLevel) {
                            store.dispatch({
                                type: 'modifica_userlevel_login',
                                payload: snapshot.val().level
                            });
                        }
                        store.dispatch({
                            type: 'modifica_userlogged_login',
                            payload: snapshot.val()
                        }); 
                    }
                });
                usuarioListenerOn = true;
            }
            break;
        default:
    }
};

export const stopFbListener = (name) => {
    switch (name) {
        case 'jogos':
            if (jogosListener) {
                jogosListener.off();
                jogosListenerOn = false;
            }
            break;
        case 'usuarios':
            if (usuariosListener) {
                usuariosListener.off();
                usuariosListenerOn = false;
            }
            break;
        case 'usuario':
            if (usuarioListener) {
                usuarioListener.off();
                usuarioListenerOn = false;
            }
            break;
        default:
    }
};

