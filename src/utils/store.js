
import { store } from '../App';

export const showAlert = (theme = 'success', title = '', subtitle = '') => {
    store.dispatch({
        type: 'modifica_theme_alertscl',
        payload: theme
    });
    store.dispatch({
        type: 'modifica_title_alertscl',
        payload: title
    });
    store.dispatch({
        type: 'modifica_subtitle_alertscl',
        payload: subtitle
    });
    store.dispatch({
        type: 'modifica_showalertscl_alertscl',
        payload: true
    });
};

export const showAlertDesenv = () => {
    store.dispatch({
        type: 'modifica_theme_alertscl',
        payload: 'info'
    });
    store.dispatch({
        type: 'modifica_title_alertscl',
        payload: 'Aviso'
    });
    store.dispatch({
        type: 'modifica_subtitle_alertscl',
        payload: 'Em desenvolvimento...'
    });
    store.dispatch({
        type: 'modifica_showalertscl_alertscl',
        payload: true
    });
};

