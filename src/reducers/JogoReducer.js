const INITIAL_STATE = {
    jogoSelected: {},
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_jogoselected_jogo':
            return { 
                ...state, 
                jogoSelected: { ...action.payload }
            };
        case 'modifica_clean_login':
            return {
                ...state,
                jogoSelected: {}
            };
        default:
            return state;
    }
};
