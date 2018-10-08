import { combineReducers } from 'redux';

import LoginReducer from './LoginReducer';
import JogosReducer from './JogosReducer';
import AlertSclReducer from './AlertSclReducer';
import CadastroJogosReducer from './CadastroJogosReducer';
import UsuariosReducer from './UsuariosReducer';
import InfoReducer from './InfoReducer';
import JogoReducer from './JogoReducer';

export default combineReducers({
    LoginReducer,
    JogosReducer,
    AlertSclReducer,
    CadastroJogosReducer,
    UsuariosReducer,
    InfoReducer,
    JogoReducer
});
