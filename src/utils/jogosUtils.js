
const deParaPos = {
    go: { name: 'Goleiro', index: 0 },
    le: { name: 'Lateral Esquerdo', index: 1 },
    ld: { name: 'Lateral Direito', index: 2 },
    za1: { name: 'Zagueiro', index: 3 },
    za2: { name: 'Zagueiro', index: 4 },
    za3: { name: 'Zagueiro', index: 5 },
    za4: { name: 'Zagueiro', index: 6 },
    md1: { name: 'Meio Defensivo', index: 7 },
    md2: { name: 'Meio Defensivo', index: 8 },
    md3: { name: 'Meio Defensivo', index: 9 },
    md4: { name: 'Meio Defensivo', index: 10 },
    mo1: { name: 'Meio Ofensivo', index: 11 },
    mo2: { name: 'Meio Ofensivo', index: 12 },
    mo3: { name: 'Meio Ofensivo', index: 13 },
    mo4: { name: 'Meio Ofensivo', index: 14 },
    ale: { name: 'Ala Esquerdo', index: 15 }, 
    ald: { name: 'Ala Direito', index: 16 },
    at1: { name: 'Atacante', index: 17 }, 
    at2: { name: 'Atacante', index: 18 }, 
    at3: { name: 'Atacante', index: 19 }, 
    at4: { name: 'Atacante', index: 20 } 
};

export const getPosName = (posvalue) => deParaPos[posvalue].name;
export const getPosIndex = (posvalue) => deParaPos[posvalue].index;

export const doEndGame = (jogo, store, firebase, Actions, Toast) => {
    const dbFirebaseRef = firebase.database().ref();
    store.dispatch({
        type: 'modifica_endgamemodal_gerenciar',
        payload: true
    });


    dbFirebaseRef.child(`jogos/${jogo.key}`).update({
        endStatus: '1'
    })
    .then(() => {
        store.dispatch({
            type: 'modifica_endgamemodal_gerenciar',
            payload: false
        });
        Actions.popTo('gerenciar');
        Toast.show(
            'Jogo finalizado.',
            Toast.SHORT
        );
    })
    .catch(() => {
        store.dispatch({
            type: 'modifica_endgamemodal_gerenciar',
            payload: false
        });
        Toast.show(
            'Falha ao finalizar jogo. Verifique a conexão.',
                Toast.SHORT
        );
    });
};

