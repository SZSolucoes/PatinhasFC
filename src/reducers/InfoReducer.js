const INITIAL_STATE = {
    listInfos: [],
    startUpOrDownAnim: 'down',
    numLikes: '0'
};

export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'modifica_listinfos_info':
            return { 
                ...state, 
                listInfos: [...action.payload] 
            };
        case 'modifica_startupordownanim_info':
            return { 
                ...state, 
                startUpOrDownAnim: action.payload 
            };
        case 'modifica_numlikes_info':
            return { 
                ...state, 
                numLikes: action.payload 
            };
        case 'modifica_clean_info':
            return {
                ...state,
                listInfos: [],
                startUpOrDownAnim: 'down',
                numLikes: '0'
            };
        default:
            return state;
    }
};
