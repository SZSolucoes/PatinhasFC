const INITIAL_STATE = {
    filterStr: '',
    filterLoad: false,
    itemSelected: '',
    showPlayersModal: false,
    filterModalStr: '',
    filterModalLoad: false,
    jogador: {}
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
                itemSelected: action.payload
            };
        case 'modifica_showplayersmodal_gerenciar':
            return { 
                ...state, 
                showPlayersModal: action.payload
            };
        case 'modifica_filtermodalstr_gerenciar':
            return { 
                ...state, 
                filterModalStr: action.payload
            };
        case 'modifica_filtermodalload_gerenciar':
            return { 
                ...state, 
                filterModalLoad: action.payload
            };
        case 'modifica_jogador_gerenciar':
            return { 
                ...state, 
                jogador: { ...action.payload }
            };
        case 'modifica_clean_gerenciar':
            return {
                ...state,
                filterStr: '',
                filterLoad: false,
                itemSelected: '',
                showPlayersModal: false,
                filterModalStr: '',
                filterModalLoad: false,
                jogador: {}
            };
        default:
            return state;
    }
};
