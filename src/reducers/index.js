import { combineReducers } from 'redux';

import LoginReducer from './LoginReducer';
import JogosReducer from './JogosReducer';
import AlertSclReducer from './AlertSclReducer';
import CadastroJogosReducer from './CadastroJogosReducer';

export default combineReducers({
    LoginReducer,
    JogosReducer,
    AlertSclReducer,
    CadastroJogosReducer
});
