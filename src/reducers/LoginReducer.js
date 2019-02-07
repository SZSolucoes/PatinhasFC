const INITIAL_STATE = {
    username: '',
    password: '',
    userToken: '',
    modalVisible: false,
    urlServer: '',
    hidePw: true,
    showLogoLogin: true,
    indicator: false,
    userLogged: {},
    userLevel: '1',
    conInfo: '',
    hideTabBar: false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_username_login':
            return { 
                ...state, 
                username: action.payload 
            };
        case 'modifica_password_login':
            return { 
                ...state, 
                password: action.payload 
            };
        case 'modifica_hidepw_login':
            return { 
                ...state, 
                hidePw: action.payload 
            };
        case 'modifica_modalvisible_login':
            return { 
                ...state, 
                modalVisible: action.payload 
            };
        case 'modifica_usertoken_login':
            return { 
                ...state, 
                userToken: action.payload 
            };
        case 'modifica_urlserver_login':
            return {
                ...state,
                urlServer: action.payload,
            };
        case 'modifica_showlogologin_login':
            return {
                ...state,
                showLogoLogin: action.payload,
            };
        case 'modifica_indicator_login':
            return {
                ...state,
                indicator: action.payload,
            };
        case 'modifica_userlogged_login':
            return {
                ...state,
                userLogged: { ...action.payload },
            };
        case 'modifica_userlevel_login':
            return {
                ...state,
                userLevel: action.payload
            };
        case 'modifica_coninfo_login':
            return {
                ...state,
                conInfo: action.payload
            };
        case 'modifica_hidetabbar_login':
            return {
                ...state,
                hideTabBar: action.payload
            };
        case 'modifica_clean_login':
            return {
                ...state,
                username: '',
                password: '',
                userToken: '',
                modalVisible: false,
                urlServer: '',
                hidePw: true,
                showLogoLogin: true,
                indicator: false,
                userLogged: {},
                userLevel: '1',
                conInfo: '',
                hideTabBar: false
            };
        case 'modifica_safeclean_login':
            return {
                ...state,
                username: '',
                password: '',
                userToken: '',
                modalVisible: false,
                urlServer: '',
                hidePw: true,
                showLogoLogin: true,
                indicator: false,
                conInfo: '',
                hideTabBar: false
            };
        
        default:
            return state;
    }
};
