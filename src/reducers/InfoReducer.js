const INITIAL_STATE = {
    listInfos: [],
    itemSelected: {},
    startUpOrDownAnim: 'down',
    filterStr: '',
    filterLoad: false,
    flagRemoveInfo: false,
    infoMsgSelected: {},
    loadingFooter: false,
    maxRows: 30
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
        case 'modifica_filterstr_info':
            return { 
                ...state, 
                filterStr: action.payload
            };
        case 'modifica_filterload_info':
            return { 
                ...state, 
                filterLoad: action.payload
            };
        case 'modifica_itemselected_info':
            return { 
                ...state, 
                itemSelected: { ...action.payload }
            };
        case 'modifica_flagremoveinfo_info':
            return { 
                ...state, 
                flagRemoveInfo: action.payload
            };
        case 'modifica_loadingfooter_info':
            return { 
                ...state, 
                loadingFooter: action.payload
            };
        case 'modifica_maxrows_info':
            return { 
                ...state, 
                maxRows: action.payload
            };
        case 'modifica_infomsgselected_info':
            return { 
                ...state, 
                infoMsgSelected: { ...action.payload }
            };
        case 'modifica_clean_info':
            return {
                ...state,
                listInfos: [],
                itemSelected: {},
                startUpOrDownAnim: 'down',
                filterStr: '',
                filterLoad: false,
                flagRemoveInfo: false,
                infoMsgSelected: {},
                loadingFooter: false,
                maxRows: 30
            };
        default:
            return state;
    }
};
