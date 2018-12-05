const INITIAL_STATE = {
    showUsersModal: false,
    filterModalStr: '',
    filterModalLoad: false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_showusersmodal_paineladmin':
            return { 
                ...state, 
                showUsersModal: action.payload
            };
        case 'modifica_filtermodalstr_paineladmin':
            return { 
                ...state, 
                filterModalStr: action.payload
            };
        case 'modifica_filtermodalload_paineladmin':
            return { 
                ...state, 
                filterModalLoad: action.payload
            };
        case 'modifica_clean_paineladmin':
            return {
                ...state,
                showUsersModal: false,
                filterModalStr: '',
                filterModalLoad: false
            };
        default:
            return state;
    }
};
