const INITIAL_STATE = {
    jogoSelected: {},
    showImageView: false
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_jogoselected_imagens':
            return { 
                ...state, 
                jogoSelected: { ...action.payload }
            };
        case 'modifica_showimageview_imagens':
            return { 
                ...state, 
                showImageView: action.payload
            };
        case 'modifica_clean_imagens':
            return {
                ...state,
                jogoSelected: {},
                showImageView: false
            };
        default:
            return state;
    }
};
