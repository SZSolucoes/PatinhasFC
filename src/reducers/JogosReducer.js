const INITIAL_STATE = {
    listJogos: [],
    itemSelected: {}
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
        case 'modifica_clean_jogos':
            return {
                ...state,
                listJogos: [],
                itemSelected: {}
            };
        default:
            return state;
    }
};
