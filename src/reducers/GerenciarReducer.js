const INITIAL_STATE = {
    filterStr: '',
    filterLoad: false,
    itemSelected: {}
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_filterstr_gerenciar':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_gerenciar':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_itemselected_gerenciar':
            return { 
                ...state, 
                itemSelected: { ...action.payload }
            };
        case 'modifica_clean_gerenciar':
            return {
                ...state,
                filterStr: '',
                filterLoad: false,
                itemSelected: {}
            };
        default:
            return state;
    }
};
