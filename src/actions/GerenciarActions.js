
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

export const modificaShowPlayersModal = (value) => ({
    type: 'modifica_showplayersmodal_gerenciar',
    payload: value
});

export const modificaFilterModalLoad = (value) => ({
    type: 'modifica_filtermodalload_gerenciar',
    payload: value
});

export const modificaFilterModalStr = (value) => ({
    type: 'modifica_filtermodalstr_gerenciar',
    payload: value
});

export const modificaJogador = (value) => ({
    type: 'modifica_jogador_gerenciar',
    payload: value
});

export const modificaClean = () => ({
    type: 'modifica_clean_gerenciar'
});

