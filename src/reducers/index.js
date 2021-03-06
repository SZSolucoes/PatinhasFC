import { combineReducers } from 'redux';

import LoginReducer from './LoginReducer';
import JogosReducer from './JogosReducer';
import AlertSclReducer from './AlertSclReducer';
import CadastroJogosReducer from './CadastroJogosReducer';
import UsuariosReducer from './UsuariosReducer';
import InfoReducer from './InfoReducer';
import FinanceiroReducer from './FinanceiroReducer';
import JogoReducer from './JogoReducer';
import GerenciarReducer from './GerenciarReducer';
import HistoricoReducer from './HistoricoReducer';
import ImagensReducer from './ImagensReducer';
import PainelAdminReducer from './PainelAdminReducer';
import AnaliseJogadores from './AnaliseJogadores';
import ProfileReducer from './ProfileReducer';
import EnquetesReducer from './EnquetesReducer';
import SearchBarReducer from '../components/tools/searchbar/SearchBarReducer';

export default combineReducers({
    LoginReducer,
    JogosReducer,
    AlertSclReducer,
    CadastroJogosReducer,
    UsuariosReducer,
    InfoReducer,
    JogoReducer,
    GerenciarReducer,
    HistoricoReducer,
    ImagensReducer,
    PainelAdminReducer,
    AnaliseJogadores,
    ProfileReducer,
    EnquetesReducer,
    FinanceiroReducer,
    SearchBarReducer
});
