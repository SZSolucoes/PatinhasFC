const INITIAL_STATE = {
    listJogos: [],
    itemSelected: {},
    animatedHeigth: false,
    filterStr: '',
    filterLoad: false,
    loadingFooter: false,
    maxRows: 30
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_listjogos_jogos':
            return { 
                ...state, 
                listJogos: [...action.payload] 
            };
        case 'modifica_itemselected_jogos':
            return { 
                ...state, 
                itemSelected: { ...action.payload }
            };
        case 'modifica_animatedheight_jogos':
            return { 
                ...state, 
                animatedHeigth: action.payload
            };
        case 'modifica_filterstr_jogos':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_jogos':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_loadingfooter_jogos':
            return { 
                ...state, 
                loadingFooter: action.payload
            };
        case 'modifica_addnewrows_jogos':
            return { 
                ...state, 
                maxRows: action.payload
            };
        case 'modifica_clean_jogos':
            return {
                ...state,
                listJogos: [],
                itemSelected: {},
                animatedHeigth: false,
                filterStr: '',
                filterLoad: false,
                loadingFooter: false,
                maxRows: 30
            };
        default:
            return state;
    }
};
