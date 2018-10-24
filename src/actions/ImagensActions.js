
export const modificaJogoSelected = (jogo) => ({
    type: 'modifica_jogoselected_imagens',
    payload: jogo
});

export const modificaShowImageView = (value) => ({
    type: 'modifica_showimageview_imagens',
    payload: value
});

export const modificaClean = () => ({
    type: 'modifica_clean_imagens'
});

