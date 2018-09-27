const INITIAL_STATE = {
    listUsuarios: [],
    itemSelected: {},
    filterStr: '',
    filterLoad: false,
    userDisabled: false,
    flagDisableUser: false,
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_listusuarios_usuarios':
            return { 
                ...state, 
                listUsuarios: [...action.payload] 
            };
        case 'modifica_itemselected_usuarios':
            return { 
                ...state, 
                itemSelected: { ...action.payload }
            };
        case 'modifica_filterstr_usuarios':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_usuarios':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_userdisabled_usuarios':
            return { 
                ...state, 
                userDisabled: action.payload
            };
        case 'modifica_flagdisableuser_usuarios':
            return { 
                ...state, 
                flagDisableUser: action.payload
            };
        case 'modifica_clean_usuarios':
            return {
                ...state,
                listUsuarios: [],
                itemSelected: {},
                filterStr: '',
                filterLoad: false,
                userDisabled: false,
                flagDisableUser: false
            };
        default:
            return state;
    }
};
