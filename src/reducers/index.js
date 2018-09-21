import { combineReducers } from 'redux';

import LoginReducer from './LoginReducer';
import AlertSclReducer from './AlertSclReducer';

export default combineReducers({
    LoginReducer,
    AlertSclReducer
});
