import _ from 'lodash';
import { Alert } from 'react-native';

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
    const placarCasa = parseInt(jogo.placarCasa, 10);
    const placarVisit = parseInt(jogo.placarVisit, 10);
    const jogadores = _.uniqBy([
        ...jogo.escalacao.casa,
        ...jogo.escalacao.visit,
        ...jogo.escalacao.banco,
    ], 'key');
    let i = 0;
    let iFix = 0;
    let ret = true;

    _.remove(jogadores, (item) => !!item.push);

    if (jogadores.length === 0) {
        Alert.alert('Aviso', 'Não há jogadores escalados para finalizar o jogo.');
        return false;
    }

    if (placarCasa > placarVisit) {
        const jogadoresVit = _.filter(jogadores, (jogv) => jogv.side === 'casa');
        const jogadoresDer = _.filter(jogadores, (jogv) => jogv.side === 'visit');

        iFix = 1 / (jogadoresVit.length + jogadoresDer);

        // Jogadores vitoriosos atualizados primeiro
        jogadoresVit.forEach(async (jogador) => {
            await dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', async (snapshot) => {
                await dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                    vitorias: (parseInt(snapshot.val().vitorias, 10) + 1).toString()
                })
                .then(() => {
                    i += iFix;
                    store.dispatch({
                        type: 'modifica_endgamemodalperc_gerenciar',
                        payload: i
                    });
                })
                .catch(() => {
                    Toast.show(
                        'Falha ao contabilizar dados. Verifique a conexão.',
                            Toast.SHORT
                    );
                    ret = false;
                });
            });
        });

        // Jogadores vitoriosos atualizados primeiro
        jogadoresDer.forEach(async (jogador) => {
            await dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', async (snapshot) => {
                await dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                    derrotas: (parseInt(snapshot.val().derrotas, 10) + 1).toString()
                })
                .then(() => {
                    i += iFix;
                    store.dispatch({
                        type: 'modifica_endgamemodalperc_gerenciar',
                        payload: i
                    });
                })
                .catch(() => {
                    Toast.show(
                        'Falha ao contabilizar dados. Verifique a conexão.',
                            Toast.SHORT
                    );
                    ret = false;
                });
            });
        });
    } else if (placarVisit > placarCasa) {
        const jogadoresVit = _.filter(jogadores, (jogv) => jogv.side === 'visit');
        const jogadoresDer = _.filter(jogadores, (jogv) => jogv.side === 'casa');

        iFix = 1 / (jogadoresVit.length + jogadoresDer);

        // Jogadores vitoriosos atualizados primeiro
        jogadoresVit.forEach(async (jogador) => {
            await dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', async (snapshot) => {
                await dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                    vitorias: (parseInt(snapshot.val().vitorias, 10) + 1).toString()
                })
                .then(() => {
                    i += iFix;
                    store.dispatch({
                        type: 'modifica_endgamemodalperc_gerenciar',
                        payload: i
                    });
                })
                .catch(() => {
                    Toast.show(
                        'Falha ao contabilizar dados. Verifique a conexão.',
                            Toast.SHORT
                    );
                    ret = false;
                });
            });
        });

        // Jogadores vitoriosos atualizados primeiro
        jogadoresDer.forEach(async (jogador) => {
            await dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', async (snapshot) => {
                await dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                    derrotas: (parseInt(snapshot.val().derrotas, 10) + 1).toString()
                })
                .then(() => {
                    i += iFix;
                    store.dispatch({
                        type: 'modifica_endgamemodalperc_gerenciar',
                        payload: i
                    });
                })
                .catch(() => {
                    Toast.show(
                        'Falha ao contabilizar dados. Verifique a conexão.',
                            Toast.SHORT
                    );
                    ret = false;
                });
            });
        });
    } else {
        iFix = 1 / jogadores.length;
        jogadores.forEach(async (jogador) => {
            await dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', async (snapshot) => {
                await dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                    empates: (parseInt(snapshot.val().empates, 10) + 1).toString()
                })
                .then(() => {
                    i += iFix;
                    store.dispatch({
                        type: 'modifica_endgamemodalperc_gerenciar',
                        payload: i
                    });
                    console.log(i);
                })
                .catch(() => {
                    Toast.show(
                        'Falha ao contabilizar dados. Verifique a conexão.',
                            Toast.SHORT
                    );
                    ret = false;
                });
            });
        });
    }

    console.log(i);

    if (!ret) {
        closeEndGameModal(store);
        Toast.show(
            'Falha ao finalizar jogo. Verifique a conexão.',
                Toast.SHORT
        ); 
        return false;
    }

    dbFirebaseRef.child(`jogos/${jogo.key}`).update({
        endStatus: '1'
    })
    .then(() => {
        closeEndGameModal(store);
        Actions.popTo('gerenciar');
        Toast.show(
            'Jogo finalizado.',
            Toast.SHORT
        );
    })
    .catch(() => {
        closeEndGameModal(store);
        Toast.show(
            'Falha ao finalizar jogo. Verifique a conexão.',
                Toast.SHORT
        );
    });
};

const closeEndGameModal = (store) => {
    store.dispatch({
        type: 'modifica_endgamemodal_gerenciar',
        payload: false
    });
    store.dispatch({
        type: 'modifica_endgamemodalperc_gerenciar',
        payload: 0
    });
};

