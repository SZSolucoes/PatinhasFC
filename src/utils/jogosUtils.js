import _ from 'lodash';
import { Alert } from 'react-native';
import { roundTo } from './numComplex';

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

    _.remove(jogadores, (item) => !!item.push);

    if (jogadores.length === 0) {
        Alert.alert('Aviso', 'Não há jogadores escalados para finalizar o jogo.');
        return false;
    }

    store.dispatch({
        type: 'modifica_endgamemodal_gerenciar',
        payload: true
    });
    
    // Timeout utilizado para dar tempo de renderizar o modal de loading
    setTimeout(() => {
        // Altera o status do jogo para encerrado
        dbFirebaseRef.child(`jogos/${jogo.key}`).update({
            status: '3'
        })
        .then(() => true)
        .catch(() => true);
    
        // Inicia a atualizacao dos usuarios para vitorias derrotas e escalacao
        if (placarCasa > placarVisit) {
            const jogadoresVit = _.filter(jogadores, (jogv) => jogv.side === 'casa');
            const jogadoresDer = _.filter(jogadores, (jogd) => jogd.side === 'visit');
            let numJogs = jogadoresVit.length + jogadoresDer.length;
    
            iFix = 1 / (jogadoresVit.length + jogadoresDer.length);
    
            // Jogadores vitoriosos atualizados primeiro
            jogadoresVit.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        vitorias: (parseInt(snapshot.val().vitorias, 10) + 1).toString(),
                        jogosEscalados: (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString()
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(jogo, store, firebase, Actions, Toast), 2000);
                        }
                    })
                    .catch(() => {
                        Toast.show(
                            'Falha ao contabilizar dados. Verifique a conexão.',
                                Toast.SHORT
                        );
                        closeEndGameModal(store);
                    });
                });
            });
    
            // Jogadores vitoriosos atualizados primeiro
            jogadoresDer.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        derrotas: (parseInt(snapshot.val().derrotas, 10) + 1).toString(),
                        jogosEscalados: (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString()
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(jogo, store, firebase, Actions, Toast), 2000);
                        }
                    })
                    .catch(() => {
                        Toast.show(
                            'Falha ao contabilizar dados. Verifique a conexão.',
                                Toast.SHORT
                        );
                        closeEndGameModal(store);
                    });
                });
            });
        } else if (placarVisit > placarCasa) {
            const jogadoresVit = _.filter(jogadores, (jogv) => jogv.side === 'visit');
            const jogadoresDer = _.filter(jogadores, (jogd) => jogd.side === 'casa');
            let numJogs = jogadoresVit.length + jogadoresDer.length;
    
            iFix = 1 / (jogadoresVit.length + jogadoresDer.length);
    
            // Jogadores vitoriosos atualizados primeiro
            jogadoresVit.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        vitorias: (parseInt(snapshot.val().vitorias, 10) + 1).toString(),
                        jogosEscalados: (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString()
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(jogo, store, firebase, Actions, Toast), 2000);
                        }
                    })
                    .catch(() => {
                        Toast.show(
                            'Falha ao contabilizar dados. Verifique a conexão.',
                                Toast.SHORT
                        );
                        closeEndGameModal(store);
                    });
                });
            });
    
            // Jogadores vitoriosos atualizados primeiro
            jogadoresDer.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`).once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        derrotas: (parseInt(snapshot.val().derrotas, 10) + 1).toString(),
                        jogosEscalados: (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString()
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(jogo, store, firebase, Actions, Toast), 2000);
                        }
                    })
                    .catch(() => {
                        Toast.show(
                            'Falha ao contabilizar dados. Verifique a conexão.',
                                Toast.SHORT
                        );
                        closeEndGameModal(store);
                    });
                });
            });
        } else {
            iFix = 1 / jogadores.length;
            let numJogs = jogadores.length;
    
            jogadores.forEach((jogador) => {
                dbFirebaseRef.child(`usuarios/${jogador.key}`)
                .once('value', (snapshot) => {
                    dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                        empates: (parseInt(snapshot.val().empates, 10) + 1).toString(),
                        jogosEscalados: (parseInt(snapshot.val().jogosEscalados, 10) + 1).toString()
                    })
                    .then(() => {
                        i += iFix;
                        numJogs--;
    
                        store.dispatch({
                            type: 'modifica_endgamemodalperc_gerenciar',
                            payload: roundTo(i, 2)
                        });
    
                        if (numJogs <= 0) {
                            setTimeout(() => 
                            changeStsEndGame(jogo, store, firebase, Actions, Toast), 2000);
                        }
                    })
                    .catch(() => {
                        Toast.show(
                            'Falha ao contabilizar dados. Verifique a conexão.',
                                Toast.SHORT
                        );
                        closeEndGameModal(store);
                    });
                });  
            });
        }
    }, 500);
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

const changeStsEndGame = (jogo, store, firebase, Actions, Toast) => {
    const dbFirebaseRef = firebase.database().ref();

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

