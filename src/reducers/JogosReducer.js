const INITIAL_STATE = {
    listJogos: []
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_listjogos_jogos':
            return { 
                ...state, 
                listJogos: [...action.payload] 
            };
        case 'modifica_clean_jogos':
            return {
                ...state,
                listJogos: []
            };
        default:
            return state;
    }
};
