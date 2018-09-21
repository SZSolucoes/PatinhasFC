const INITIAL_STATE = {
    showAlertScl: false,
    theme: 'success',
    title: '',
    subtitle: '',
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_showalertscl_alertscl':
            return { 
                ...state, 
                showAlertScl: action.payload 
            };
        case 'modifica_theme_alertscl':
            return { 
                ...state, 
                theme: action.payload 
            };
        case 'modifica_title_alertscl':
            return { 
                ...state, 
                title: action.payload 
            };
        case 'modifica_subtitle_alertscl':
            return { 
                ...state, 
                subtitle: action.payload 
            };
        case 'modifica_clean_login':
            return {
                ...state,
                showAlertScl: false,
                theme: 'info',
                title: '',
                subtitle: ''
            };
        default:
            return state;
    }
};
