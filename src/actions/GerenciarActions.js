
export const modificaItemSelected = (value) => ({
    type: 'modifica_itemselected_gerenciar',
    payload: value
});

export const modificaFilterStr = (value) => ({
    type: 'modifica_filterstr_gerenciar',
    payload: value
});

export const modificaFilterLoad = (value) => ({
    type: 'modifica_filterload_gerenciar',
    payload: value
});

export const modificaClean = () => ({
    type: 'modifica_clean_gerenciar'
});

