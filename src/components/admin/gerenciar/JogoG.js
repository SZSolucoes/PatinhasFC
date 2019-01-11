import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    Text,
    Image,
    View,
    Platform,
    TouchableOpacity,
    Alert
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Card, List, ListItem } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import * as Progress from 'react-native-progress';
import { Dialog } from 'react-native-simple-dialogs';
import ModalInput from '../../tools/ModalInput';
import PlayersModal from './PlayersModal';
import firebase from '../../../Firebase';
import { colorAppF, colorAppP, colorAppS, colorAppW } from '../../../utils/constantes';
import { retrieveImgSource } from '../../../utils/imageStorage';
import { getPosIndex, checkConInfo } from '../../../utils/jogosUtils';
import { limitDotText, formattedSeconds, formatJogoSeconds } from '../../../utils/strComplex';
import { 
    modificaClean, 
    modificaCurrentTime,
    modificaShowTimerModal 
} from '../../../actions/JogoActions';
import { 
    modificaShowPlayersModalJ,
    modificaIsSubstitute,
    modificaMissedPlayers,
    modificaJogador
} from '../../../actions/GerenciarActions';

import imgHomeShirt from '../../../imgs/homeshirt.png';
import imgVisitShirt from '../../../imgs/visitshirt.png';
import imgBola from '../../../imgs/bolaanim.png';
import imgYellowCard from '../../../imgs/yellowcard.png';
import imgRedCard from '../../../imgs/redcard.png';
import imgCartoes from '../../../imgs/cards.png';
import imgAvatar from '../../../imgs/perfiluserimg.png';
import imgInOut from '../../../imgs/inout.png';
import Jogos from '../../jogos/Jogos';

class JogoG extends React.Component {

    constructor(props) {
        super(props);

        this.intervalIncrementer = null;
        this.intervalUpdTimeFb = null;

        this.fbDatabaseRef = firebase.database().ref();

        this.renderCardPlacar = this.renderCardPlacar.bind(this);
        this.renderGoals = this.renderGoals.bind(this);
        this.renderCartoes = this.renderCartoes.bind(this);
        this.renderSubs = this.renderSubs.bind(this);
        this.doInOrOut = this.doInOrOut.bind(this);
        this.textJogoProgress = this.textJogoProgress.bind(this);
        this.textPlacar = this.textPlacar.bind(this);
        this.onPressPlayerGol = this.onPressPlayerGol.bind(this);
        this.onPressCard = this.onPressCard.bind(this);
        this.onPressRemoveGol = this.onPressRemoveGol.bind(this);
        this.onAddPressRemoveGol = this.onAddPressRemoveGol.bind(this);
        this.onPressRemoveCard = this.onPressRemoveCard.bind(this);
        this.onAddPressRemoveCard = this.onAddPressRemoveCard.bind(this);
        this.onConfirmManualTimer = this.onConfirmManualTimer.bind(this);
        this.onPressSubs = this.onPressSubs.bind(this);
        this.onAddPressRemoveSubs = this.onAddPressRemoveSubs.bind(this);
        this.onPressRemoveSubs = this.onPressRemoveSubs.bind(this);
        this.renderGolJogador = this.renderGolJogador.bind(this);
        this.renderCartaoJogador = this.renderCartaoJogador.bind(this);
        this.renderEscalados = this.renderEscalados.bind(this);
        this.renderIcons = this.renderIcons.bind(this);
        this.onStartTimer = this.onStartTimer.bind(this);
        this.onPauseTimer = this.onPauseTimer.bind(this);
        this.onResetTimer = this.onResetTimer.bind(this);

        this.state = {
            seconds: 0,
            btnStartEnabled: true,
            btnPauseEnabled: false,
            btnResetEnabled: false
        };
    }

    componentDidMount() {
        const { listJogos, itemSelected } = this.props;
        const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];
        const currentTime = parseInt(jogo.currentTime, 10);
        this.setState({ seconds: currentTime });
        if (jogo.status === '0') {
            this.setState({
                btnStartEnabled: true,
                btnPauseEnabled: false,
                btnResetEnabled: currentTime > 0
            });
        } else if (jogo.status === '1') {
            this.setState({
                btnStartEnabled: false,
                btnPauseEnabled: true,
                btnResetEnabled: false
            });
            this.intervalIncrementer = setInterval(() =>
                this.setState({
                    seconds: this.state.seconds + 1
                })
            , 1000);
        } else if (Jogos.status === '2') {
            this.setState({
                btnStartEnabled: true,
                btnPauseEnabled: false,
                btnResetEnabled: false
            });
        }

        this.props.modificaMissedPlayers([]);
    }

    shouldComponentUpdate(nextProps, nextStates) {
        const { listJogos, itemSelected } = this.props;

        if (nextProps.listJogos) {
            const nj = _.filter(nextProps.listJogos, (item) => item.key === itemSelected)[0];
                
            if (!nj) {
                return false;
            }
        }

        if (nextProps !== this.props) {
            setTimeout(() => {
                const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];
                const nj = _.filter(nextProps.listJogos, (item) => item.key === itemSelected)[0];
                
                if (!nj) {
                    return false;
                }

                if (jogo.currentTime !== nj.currentTime) {
                    this.setState({ seconds: parseInt(nj.currentTime, 10) });
                }
                if (jogo.status !== nj.status) {
                    if (nj.status === '0') {
                        clearInterval(this.intervalIncrementer);
                        clearInterval(this.intervalUpdTimeFb);
                        this.setState({
                            btnStartEnabled: true,
                            btnPauseEnabled: false,
                            btnResetEnabled: nj.currentTime > 0
                        });
                    } else if (nj.status === '1') {
                        this.setState({
                            btnStartEnabled: false,
                            btnPauseEnabled: true,
                            btnResetEnabled: false
                        });
                        this.intervalIncrementer = setInterval(() =>
                            this.setState({
                                seconds: this.state.seconds + 1
                            })
                        , 1000);
                        this.intervalUpdTimeFb = setInterval(() => {
                            this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                                currentTime: this.state.seconds.toString()
                            })
                            .then(() => true)
                            .catch(() => true);
                        }, 1000 * 60);
                    } else if (nj.status === '2') {
                        clearInterval(this.intervalIncrementer);
                        clearInterval(this.intervalUpdTimeFb);
                        this.setState({
                            seconds: 0,
                            btnStartEnabled: true,
                            btnPauseEnabled: false,
                            btnResetEnabled: false
                        }); 
                    }
                }
            }, 500);
        }

        if (nextStates.seconds !== this.state.seconds) {
            this.props.modificaCurrentTime(nextStates.seconds);
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount() {
        const { listJogos, itemSelected } = this.props;
        const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];

        this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
            status: '0',
            currentTime: this.state.seconds.toString()
        })
        .then(() => true)
        .catch(() => true);

        if (this.intervalIncrementer) {
            clearInterval(this.intervalIncrementer);
        }

        if (this.intervalUpdTimeFb) {
            clearInterval(this.intervalUpdTimeFb);
        }
        
        this.props.modificaClean();
        this.props.modificaMissedPlayers([]);
    }

    onConfirmManualTimer(value) {
        if (value) {
            const newValue = parseInt(value, 10) * 60;
            this.setState({ seconds: newValue });
        }
    }

    onPressSubs(jogador) {
        const newJogador = {
            key: jogador.key,
            nome: jogador.nome,
            posicao: jogador.posicao,
            posvalue: jogador.posvalue,
            imgAvatar: jogador.imgAvatar,
            side: jogador.side,
            vitorias: jogador.vitorias,
            derrotas: jogador.derrotas,
            empates: jogador.empates,
            jogosEscalados: jogador.jogosEscalados
        };

        this.props.modificaJogador(newJogador);
        this.props.modificaIsSubstitute(true);
        this.props.modificaShowPlayersModalJ(true);
        return;
    }

    onStartTimer(enabled, jogo) {
        if (enabled) {
            this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                status: '1',
                currentTime: this.state.seconds.toString()
            })
            .then(() => {
                this.setState({
                    btnStartEnabled: false,
                    btnPauseEnabled: true,
                    btnResetEnabled: false
                });  
            })
            .catch(() => 
                Toast.show('Falha ao iniciar a partida, verifique a conexão', Toast.SHORT)
            );
        } 
    }

    onPauseTimer(enabled, jogo) { 
        if (enabled) {
            this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                status: '0',
                currentTime: this.state.seconds.toString()
            })
            .then(() => {
                this.setState({
                    btnStartEnabled: true,
                    btnPauseEnabled: false,
                    btnResetEnabled: true
                });
            })
            .catch(() => 
                Toast.show('Falha ao pausar a partida, verifique a conexão', Toast.SHORT)
            );
        }  
    }

    onResetTimer(enabled, jogo) { 
        if (enabled) {
            Alert.alert(
                'Aviso',
                'Confirma o reinício do jogo ?',
                [
                    { text: 'Cancelar', 
                        onPress: () => true, 
                        style: 'cancel' 
                    },
                    { 
                        text: 'Ok', 
                        onPress: () => checkConInfo(() => {
                            this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                                status: '2',
                                currentTime: '0'
                            })
                            .then(() => {
                                this.setState({
                                    btnStartEnabled: true,
                                    btnPauseEnabled: false,
                                    btnResetEnabled: false
                                }); 
                            })
                            .catch(() => 
                                Toast.show(
                                    'Falha ao reiniciar a partida, verifique a conexão', 
                                    Toast.SHORT
                                )
                            );
                        })
                    }
                ]
            ); 
        } 
    }

    onPressPlayerGol(jogador, jogo) {
        const gols = [
            ...jogo.gols, 
            {
                key: jogador.key, 
                side: jogador.side,
                nome: jogador.nome,
                time: this.state.seconds.toString(),
                indexKey: jogo.gols.length.toString()
            }
        ];
        const placarCasa = parseInt(jogo.placarCasa, 10) + 1;
        const placarVisit = parseInt(jogo.placarVisit, 10) + 1;

        Alert.alert(
            'Aviso',
            `Confirma o gol para o jogador:\n${jogador.nome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        let payload = {};
                        if (jogador.side === 'casa') {
                            payload = { gols, placarCasa };
                        } else {
                            payload = { gols, placarVisit };
                        }
                        this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                            ...payload
                        })
                        .then(() => {
                            Toast.show('Gol marcado', Toast.SHORT);
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/gols`).once('value', (snapshot) => {
                                const golsPlus = parseInt(snapshot.val(), 10) + 1;
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    gols: golsPlus.toString(),
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() => 
                            Toast.show('Falha ao marcar o gol. Verifique a conexão', Toast.SHORT)
                        );
                    })
                }
            ]
        );
    }

    onAddPressRemoveGol(jogador, jogo) {
        return () => checkConInfo(() => this.onPressRemoveGol(jogador, jogo));
    }

    onPressRemoveGol(jogador, jogo) {
        const gols = [
            ...jogo.gols
        ];
        let i = 0;
        
        gols.splice(parseInt(jogador.indexKey, 10), 1);

        for (i = 0; i < gols.length; i++) {
            if (!gols[i].push) {
                gols[i].indexKey = i.toString();
            }
        }

        const placarCasa = parseInt(jogo.placarCasa, 10) - 1;
        const placarVisit = parseInt(jogo.placarVisit, 10) - 1;

        Alert.alert(
            'Aviso',
            `Confirma a remoção do gol para o jogador:\n${jogador.nome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        let payload = {};
                        if (jogador.side === 'casa') {
                            payload = { gols, placarCasa };
                        } else {
                            payload = { gols, placarVisit };
                        }
                        this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                            ...payload
                        })
                        .then(() => {
                            Toast.show('Gol removido', Toast.SHORT);
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/gols`).once('value', (snapshot) => {
                                const golsLess = parseInt(snapshot.val(), 10) - 1;
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    gols: golsLess.toString()
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() => 
                            Toast.show('Falha ao remover o gol. Verifique a conexão', Toast.SHORT)
                        );
                    })
                }
            ]
        );
    }

    onPressCard(jogador, jogo, color) {
        const cartoes = [
            ...jogo.cartoes, 
            { 
                key: jogador.key, 
                side: jogador.side,
                nome: jogador.nome,
                time: this.state.seconds.toString(),
                color,
                indexKey: jogo.cartoes.length.toString()
            }
        ];

        Alert.alert(
            'Aviso',
            `Confirma o cartão ${color} para o jogador:\n${jogador.nome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                            cartoes
                        })
                        .then(() => {
                            const keyCard = color === 'amarelo' ? 
                            'cartoesAmarelos' : 'cartoesVermelhos';
                            Toast.show(`Cartão ${color} aplicado`, Toast.SHORT);
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/${keyCard}`)
                            .once('value', (snapshot) => {
                                const cartaoPlus = parseInt(snapshot.val(), 10) + 1;
                                const keyCardJson = color === 'amarelo' ? 
                                { cartoesAmarelos: cartaoPlus.toString() } 
                                :
                                { cartoesVermelhos: cartaoPlus.toString() };
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    ...keyCardJson
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() => 
                            Toast.show('Falha ao aplicar cartão. Verifique a conexão', Toast.SHORT)
                        );
                    })
                }
            ]
        );
    }

    onAddPressRemoveCard(jogador, jogo) {
        return () => checkConInfo(() => this.onPressRemoveCard(jogador, jogo));
    }

    onPressRemoveCard(jogador, jogo) {
        const cartoes = [
            ...jogo.cartoes
        ];
        let i = 0;
        
        cartoes.splice(parseInt(jogador.indexKey, 10), 1);

        for (i = 0; i < cartoes.length; i++) {
            if (!cartoes[i].push) {
                cartoes[i].indexKey = i.toString();
            }
        }

        Alert.alert(
            'Aviso',
            `Confirma a remoção do cartão ${jogador.color} para o jogador:\n${jogador.nome} ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                            cartoes
                        })
                        .then(() => {
                            const keyCard = jogador.color === 'amarelo' ? 
                            'cartoesAmarelos' : 'cartoesVermelhos';
                            Toast.show(`Cartão ${jogador.color} removido`, Toast.SHORT);
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/${keyCard}`)
                            .once('value', (snapshot) => {
                                const cartaoLess = parseInt(snapshot.val(), 10) - 1;
                                const keyCardJson = jogador.color === 'amarelo' ? 
                                { cartoesAmarelos: cartaoLess.toString() } 
                                :
                                { cartoesVermelhos: cartaoLess.toString() };
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    ...keyCardJson
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() => 
                            Toast.show('Falha ao remover cartão. Verifique a conexão', Toast.SHORT)
                        );
                    })
                }
            ]
        );
    }

    onAddPressRemoveSubs(sub, jogo) {
        return () => checkConInfo(() => this.onPressRemoveSubs(sub, jogo));
    }

    onPressRemoveSubs(sub, jogo) {
        const subs = [
            ...jogo.subs
        ];
        let i = 0;
        
        subs.splice(parseInt(sub.indexKey, 10), 1);

        for (i = 0; i < subs.length; i++) {
            if (!subs[i].push) {
                subs[i].indexKey = i.toString();
            }
        }

        Alert.alert(
            'Aviso',
            'Confirma a remoção da substituição ?',
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => checkConInfo(() => {
                        this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                            subs
                        })
                        .then(() =>
                            this.doInOrOut(sub.jogadorIn, false, jogo, sub.jogadorOut, true)
                        )
                        .catch(() => 
                            Toast.show(
                                'Falha ao remover substituição. Verifique a conexão', Toast.SHORT
                            )
                        );
                    })
                }
            ]
        );
    }

    doInOrOut(jogador, inOrOut, jogo, newJogador = false, isRemove = false) {
        if (newJogador) {
            const { side } = jogador;
            let fSubs = [];
            let inc = 0;

            if (isRemove) {
                fSubs = jogo.subs;
            } else {
                fSubs = _.filter(
                    jogo.subs, 
                    (sub) => 
                        sub.push || (!sub.push &&
                        !((sub.jogadorIn.key === jogador.key && 
                        sub.jogadorOut.key === newJogador.key) ||
                        (sub.jogadorIn.key === newJogador.key && 
                        sub.jogadorOut.key === jogador.key)))
                );

                fSubs = _.filter(fSubs, (sub) => {
                    if (sub.push) {
                        return true;
                    }
                    const players = [];

                    if (sub.jogadorIn.key === newJogador.key || 
                        sub.jogadorOut.key === newJogador.key) {
                        players.push(1);
                    }

                    for (inc = 0; inc < jogo.escalacao.casa.length; inc++) {
                        const player = jogo.escalacao.casa[inc];
                        if (sub.jogadorIn.key === player.key || sub.jogadorOut.key === player.key) {
                            players.push(1);
                        }
                    }
                    for (inc = 0; inc < jogo.escalacao.visit.length; inc++) {
                        const player = jogo.escalacao.visit[inc];
                        if (sub.jogadorIn.key === player.key || sub.jogadorOut.key === player.key) {
                            players.push(1);
                        }
                    }

                    return !(players.length >= 2);
                });
            }

            for (inc = 0; inc < fSubs.length; inc++) {
                if (!fSubs[inc].push) {
                    fSubs[inc].indexKey = inc.toString();
                }
            }

            const subs = [
                ...fSubs, 
                { 
                    jogadorIn: newJogador,
                    jogadorOut: jogador, 
                    side: jogador.side,
                    time: this.state.seconds.toString(),
                    indexKey: fSubs.length.toString()
                }
            ];

            if (side === 'casa') {
                const newCasaList = _.filter(
                    jogo.escalacao.casa, (item) => (item.key !== jogador.key) || !!item.push
                );
                const newBancoList = _.filter(
                    jogo.escalacao.banco, (item) => (item.key !== newJogador.key) || !!item.push
                );
                newCasaList.push(newJogador);
                newBancoList.push(jogador);
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    casa: newCasaList,
                    banco: newBancoList
                })
                .then(() => {
                    if (isRemove) {
                        Toast.show('Substituição removida', Toast.SHORT);
                        return true;
                    }
                    firebase.database().ref().child(`jogos/${jogo.key}`).update({
                        subs
                    })
                    .then(() =>
                        Toast.show('Substituição efetuada', Toast.SHORT)
                    )
                    .catch(() =>
                        Toast.show(
                            'Falha ao substituir jogador. Verifique a conexão', Toast.SHORT
                        )
                    );
                })
                .catch(() => {
                    if (isRemove) {
                        Toast.show(
                            'Falha ao remover substituição. Verifique a conexão', Toast.SHORT
                        );
                    } else {
                        Toast.show(
                            'Falha ao substituir jogador. Verifique a conexão', Toast.SHORT
                        );
                    }
                });
            } else if (side === 'visit') {
                const newVisitList = _.filter(
                    jogo.escalacao.visit, (item) => (item.key !== jogador.key) || !!item.push
                );
                const newBancoList = _.filter(
                    jogo.escalacao.banco, (item) => (item.key !== newJogador.key) || !!item.push
                );
                newVisitList.push(newJogador);
                newBancoList.push(jogador);
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList,
                    banco: newBancoList
                })
                .then(() => {
                    if (isRemove) {
                        Toast.show('Substituição removida', Toast.SHORT);
                        return true;
                    }
                    firebase.database().ref().child(`jogos/${jogo.key}`).update({
                        subs
                    })
                    .then(() =>
                        Toast.show('Substituição efetuada', Toast.SHORT)
                    )
                    .catch(() =>
                        Toast.show(
                            'Falha ao substituir jogador. Verifique a conexão', Toast.SHORT
                        )
                    );
                })
                .catch(() => {
                    if (isRemove) {
                        Toast.show(
                            'Falha ao remover substituição. Verifique a conexão', Toast.SHORT
                        );
                    } else {
                        Toast.show(
                            'Falha ao substituir jogador. Verifique a conexão', Toast.SHORT
                        );
                    }
                });
            }
        } 
    }

    textJogoProgress(jogo) {
        switch (jogo.status) {
            case '0':
                return 'Em espera';
            case '1':
                return 'Ao vivo';
            case '2':
                return 'Em espera';
            case '3':
                return 'Encerrado';
            default:
                return 'Encerrado';
        }
    }

    textPlacar(jogo) {
        return `${jogo.placarCasa} - ${jogo.placarVisit}`;
    }

    renderCardPlacar(jogo) {
        const { 
            btnStartEnabled,
            btnPauseEnabled,
            btnResetEnabled
        } = this.state;
        return (
            <Card
                containerStyle={styles.card}
            >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.topViewPlacar} />
                    <View style={{ position: 'absolute', alignSelf: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            { limitDotText(jogo.titulo, 25) }
                        </Text>
                    </View>
                </View>
                <View style={{ marginTop: 20 }} />
                <View style={styles.viewPlacar}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1.1 }}>
                        <Image 
                            style={{ height: 80, width: 70 }}
                            resizeMode={'stretch'}
                            source={imgHomeShirt} 
                        />
                        <Text
                            style={{
                                fontWeight: '500',
                                fontSize: 14,
                                textAlign: 'center'
                            }}
                        >
                            { jogo.timeCasa ? jogo.timeCasa.trim() : 'Casa' }
                        </Text>
                    </View>
                    <View 
                        style={{
                            paddingHorizontal: 5,
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderRadius: 3,
                            flex: 0.8
                        }}
                    >
                            <View
                                style={{ 
                                    alignItems: 'center',
                                    justifyContent: 'center' 
                                }}
                            >
                                <View style={{ marginBottom: 10 }}>
                                    <Text
                                        style={{ 
                                            fontSize: 14,
                                            textAlign: 'center', 
                                            fontWeight: 'bold', 
                                            color: 'red' 
                                        }}
                                    >
                                        { this.textJogoProgress(jogo) }
                                    </Text>
                                </View>
                                <View>
                                    <Text
                                        style={{ 
                                            fontSize: 26, 
                                            fontWeight: 'bold', 
                                            color: 'black' 
                                        }}
                                    >
                                        { this.textPlacar(jogo) }
                                    </Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text
                                        style={{ fontSize: 16, fontWeight: '500' }}
                                    >
                                    { formattedSeconds(this.state.seconds) }
                                    </Text>
                                </View>
                            </View>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1.1 }}>
                        <Image 
                            style={{ height: 80, width: 70 }}
                            resizeMode={'stretch'}
                            source={imgVisitShirt}
                        />
                        <Text
                            style={{
                                fontWeight: '500',
                                fontSize: 14,
                                textAlign: 'center'
                            }}
                            
                        >
                            { jogo.timeVisit ? jogo.timeVisit.trim() : 'Visitantes' }
                        </Text>
                    </View>
                </View>
                <View 
                    style={{ 
                        flex: 1,
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginTop: 15 
                    }}
                >
                    <View style={[styles.centerFlex, { opacity: btnStartEnabled ? 1 : 0.5 }]}>
                        <TouchableOpacity
                            onPress={() => checkConInfo(
                                () => this.onStartTimer(btnStartEnabled, jogo)
                            )}
                        >
                            <View 
                                style={[
                                    styles.circleBtn, 
                                    styles.centerAlign, 
                                    { backgroundColor: colorAppS }
                                ]}
                            >
                                <View
                                    style={[
                                        styles.circleBtnTwo, 
                                        styles.centerAlign
                                    ]}
                                >
                                    <Text style={styles.textCircle}>
                                        { this.state.seconds > 0 ? 'Retomar' : 'Iniciar'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.centerFlex, { opacity: btnPauseEnabled ? 1 : 0.5 }]}>
                        <TouchableOpacity
                            onPress={() => checkConInfo(
                                () => this.onPauseTimer(btnPauseEnabled, jogo)
                            )}
                        >
                            <View 
                                style={[
                                    styles.circleBtn, 
                                    styles.centerAlign, 
                                    { backgroundColor: colorAppW }
                                ]}
                            >
                                <View
                                    style={[
                                        styles.circleBtnTwo, 
                                        styles.centerAlign
                                    ]}
                                >
                                    <Text style={styles.textCircle}>
                                        Pausar
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.centerFlex, { opacity: btnResetEnabled ? 1 : 0.5 }]}>
                        <TouchableOpacity
                            onPress={() => checkConInfo(
                                () => this.onResetTimer(btnResetEnabled, jogo)
                            )}
                        >
                            <View 
                                style={[
                                    styles.circleBtn, 
                                    styles.centerAlign, 
                                    { backgroundColor: colorAppP }
                                ]}
                            >
                                <View
                                    style={[
                                        styles.circleBtnTwo, 
                                        styles.centerAlign
                                    ]}
                                >
                                    <Text style={styles.textCircle}>
                                        Reiniciar
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ marginBottom: 20 }} />
            </Card>
        );
    }

    renderGoals(jogo) {
        return (
            <View>
                <View style={{ padding: 5 }}>
                    <View style={{ margin: 5 }}>
                        <Text
                            style={{ 
                                color: 'black', 
                                fontWeight: 'bold',
                                fontSize: 16 
                            }}
                        >
                            Gols
                        </Text>
                    </View>
                    <View style={styles.cardEffect}>
                        <List 
                            containerStyle={{
                                marginTop: 0,
                                paddingHorizontal: 5,
                                paddingVertical: 10,
                                borderTopWidth: 0,
                                borderBottomWidth: 0
                            }}
                        >
                            { this.renderGolJogador(jogo.gols, jogo) }
                        </List>
                    </View>
                </View>
            </View>
        );
    }

    renderGolJogador(gols, jogo) {
        const golsCasa = _.filter(gols, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const golsVisit = _.filter(gols, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numGolsCasa = golsCasa.length;
        const numGolsVisit = golsVisit.length;
        const viewsGols = [];

        if (numGolsCasa === 0 && numGolsVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center', marginLeft: 3 }} 
                >
                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                </View>
            );
        }

        if (numGolsCasa > numGolsVisit) {
            let i = 0;
            for (i = 0; i < numGolsCasa; i++) {
                if ((i + 1) > numGolsVisit || numGolsVisit === 0) {
                    let timeText = formatJogoSeconds(golsCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    { golsCasa[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    { golsCasa[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={this.onAddPressRemoveGol(golsCasa[i], jogo)}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(golsCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(golsVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    { golsCasa[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    { golsCasa[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    { golsVisit[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    { golsVisit[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={this.onAddPressRemoveGol(golsCasa[i], jogo)}
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveGol(golsVisit[i], jogo)
                                        }
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numGolsVisit; i++) {
                if ((i + 1) > numGolsCasa || numGolsCasa === 0) {
                    let timeText = formatJogoSeconds(golsVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    { golsVisit[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    { golsVisit[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeText }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveGol(golsVisit[i], jogo)
                                        }
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(golsVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(golsCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    { golsVisit[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    { golsVisit[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    { golsCasa[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    { golsCasa[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveGol(golsCasa[i], jogo)
                                        }
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveGol(golsVisit[i], jogo)
                                        }
                                    >
                                        <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewsGols;
    }

    renderCartoes(jogo) {
        return (
            <View>
                <View style={{ padding: 5 }}>
                    <View style={{ margin: 5 }}>
                        <Text
                            style={{ 
                                color: 'black', 
                                fontWeight: 'bold',
                                fontSize: 16 
                            }}
                        >
                            Cartões
                        </Text>
                    </View>
                    <View style={styles.cardEffect}>
                        <List 
                            containerStyle={{ 
                                marginTop: 0,
                                paddingHorizontal: 5,
                                paddingVertical: 10,
                                borderTopWidth: 0,
                                borderBottomWidth: 0
                            }}
                        >
                            { this.renderCartaoJogador(jogo.cartoes, jogo) }
                        </List>
                    </View>
                </View>
            </View>
        );
    }

    renderCartaoJogador(cartoes, jogo) {
        const cartoesCasa = _.filter(cartoes, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const cartoesVisit = _.filter(cartoes, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numCartoesCasa = cartoesCasa.length;
        const numCartoesVisit = cartoesVisit.length;
        const viewCartoes = [];

        if (numCartoesCasa === 0 && numCartoesVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center' }} 
                >
                    <Image source={imgCartoes} style={{ width: 30, height: 30 }} />
                </View>
            );
        }

        if (numCartoesCasa > numCartoesVisit) {
            let i = 0;
            for (i = 0; i < numCartoesCasa; i++) {
                if ((i + 1) > numCartoesVisit || numCartoesVisit === 0) {
                    let timeText = formatJogoSeconds(cartoesCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    { cartoesCasa[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    { cartoesCasa[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(cartoesCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(cartoesVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    { cartoesCasa[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    { cartoesCasa[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    { cartoesVisit[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    { cartoesVisit[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numCartoesVisit; i++) {
                if ((i + 1) > numCartoesCasa || numCartoesCasa === 0) {
                    let timeText = formatJogoSeconds(cartoesVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                                <Text>
                                    { cartoesVisit[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeText[0] }
                                </Text>
                                <Text>
                                    { cartoesVisit[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeText }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(cartoesVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(cartoesCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                                <Text>
                                    { cartoesVisit[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text style={{ textAlign: 'right' }}>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                                <Text>
                                    { cartoesVisit[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                                <Text>
                                    { cartoesCasa[i].nome }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text style={{ textAlign: 'left' }}>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                                <Text>
                                    { cartoesCasa[i].nome }
                                </Text>
                            </Text>
                        );
                    }
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesCasa[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeTextCasa }
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        { timeTextVisit }
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveCard(cartoesVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={
                                                cartoesVisit[i].color === 'amarelo' ?
                                                imgYellowCard : imgRedCard
                                            }
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewCartoes;
    }

    renderSubs(jogo) {
        return (
            <View>
                <View style={{ padding: 5 }}>
                    <View style={{ margin: 5 }}>
                        <Text
                            style={{ 
                                color: 'black', 
                                fontWeight: 'bold',
                                fontSize: 16 
                            }}
                        >
                            Substituições
                        </Text>
                    </View>
                    <View style={styles.cardEffect}>
                        <List 
                            containerStyle={{ 
                                marginTop: 0,
                                paddingHorizontal: 5,
                                paddingVertical: 10,
                                borderTopWidth: 0,
                                borderBottomWidth: 0
                            }}
                        >
                            { this.renderSubsJogador(jogo.subs, jogo) }
                        </List>
                    </View>
                </View>
            </View>
        );
    }

    renderSubsJogador(subs, jogo) {
        const subsCasa = _.filter(subs, (item) => item.side && item.side === 'casa').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const subsVisit = _.filter(subs, (item) => item.side && item.side === 'visit').sort(
            (a, b) => {
                const aTime = parseInt(a.time, 10);
                const bTime = parseInt(b.time, 10);
                if (aTime > bTime) {
                    return 1;
                } 
                if (aTime < bTime) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numSubsCasa = subsCasa.length;
        const numSubsVisit = subsVisit.length;
        const viewSubs = [];

        if (numSubsCasa === 0 && numSubsVisit === 0) {
            return (
                <View 
                    style={{ alignContent: 'center' }} 
                >
                    <Image source={imgInOut} style={{ width: 30, height: 30 }} />
                </View>
            );
        }

        if (numSubsCasa > numSubsVisit) {
            let i = 0;
            for (i = 0; i < numSubsCasa; i++) {
                if ((i + 1) > numSubsVisit || numSubsVisit === 0) {
                    let timeText = formatJogoSeconds(subsCasa[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text>
                                <Text>
                                    { timeText[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View style={{ flex: 1, flexDirection: 'row' }}>
                                        { timeText }
                                        <View>
                                            <Text style={styles.textOut}>
                                                { subsCasa[i].jogadorOut.nome }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { subsCasa[i].jogadorIn.nome }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(subsCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(subsVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        { timeTextCasa }
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.textOut}>
                                                { subsCasa[i].jogadorOut.nome }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { subsCasa[i].jogadorIn.nome }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeTextVisit }
                                                <Text style={styles.textOut}>
                                                    { subsVisit[i].jogadorOut.nome }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { subsVisit[i].jogadorIn.nome }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numSubsVisit; i++) {
                if ((i + 1) > numSubsCasa || numSubsCasa === 0) {
                    let timeText = formatJogoSeconds(subsVisit[i].time);
                    if (timeText.length > 1) {
                        timeText = (
                            <Text>
                                { timeText[0] }
                                <Text style={styles.extraTime}>
                                    { timeText[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeText = (
                            <Text>
                                <Text>
                                    { timeText[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeText }
                                                <Text style={styles.textOut}>
                                                    { subsVisit[i].jogadorOut.nome }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { subsVisit[i].jogadorIn.nome }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(subsVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(subsCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text>
                                { timeTextVisit[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextVisit[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextVisit = (
                            <Text>
                                <Text>
                                    { timeTextVisit[0] }
                                </Text>
                            </Text>
                        );
                    }
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text>
                                { timeTextCasa[0] }
                                <Text style={styles.extraTime}>
                                    { timeTextCasa[1] }
                                </Text>
                            </Text> 
                        );
                    } else {
                        timeTextCasa = (
                            <Text>
                                <Text>
                                    { timeTextCasa[0] }
                                </Text>
                            </Text>
                        );
                    }
                    viewSubs.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsCasa[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-start'
                                        }}
                                    >
                                        { timeTextCasa }
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.textOut}>
                                                { subsCasa[i].jogadorOut.nome }
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { subsCasa[i].jogadorIn.nome }
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <View
                                        style={{ 
                                            flex: 1, 
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end'
                                        }}
                                    >
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Text style={{ textAlign: 'right' }}>
                                                { timeTextVisit }
                                                <Text style={styles.textOut}>
                                                    { subsVisit[i].jogadorOut.nome }
                                                </Text>
                                            </Text>
                                            <Text style={styles.textIn}>
                                                { subsVisit[i].jogadorIn.nome }
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <TouchableOpacity
                                        onPress={
                                            this.onAddPressRemoveSubs(subsVisit[i], jogo)
                                        }
                                    >
                                        <Image 
                                            source={imgInOut}
                                            style={{ 
                                                width: 20, height: 25 
                                            }} 
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewSubs;
    }

    renderEscalados(jogo) {
        const jogadoresCasaFt = _.filter(jogo.escalacao.casa, (jgCasa) => !jgCasa.push).sort(
            (a, b) => {
                if (getPosIndex(a.posvalue) > getPosIndex(b.posvalue)) {
                    return 1;
                } 
                if (getPosIndex(a.posvalue) < getPosIndex(b.posvalue)) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const jogadoresVisitFt = _.filter(jogo.escalacao.visit, (jgVisit) => !jgVisit.push).sort(
            (a, b) => {
                if (getPosIndex(a.posvalue) > getPosIndex(b.posvalue)) {
                    return 1;
                } 
                if (getPosIndex(a.posvalue) < getPosIndex(b.posvalue)) {
                    return -1;
                } 
               
                return 0;  
            }
        );
        const numJogadoresCasa = jogadoresCasaFt.length;
        const numjogadoresVisit = jogadoresVisitFt.length;

        if (numJogadoresCasa === 0 && numjogadoresVisit === 0) {
            return false;
        }

        return (
            <View style={{ padding: 5 }}>
                <View style={{ margin: 5 }}>
                    <Text
                        style={{ 
                            color: 'black', 
                            fontWeight: 'bold',
                            fontSize: 16 
                        }}
                    >
                        Jogadores
                    </Text>
                </View>
                <View style={[styles.cardEffect, { paddingVertical: 5, paddingHorizontal: 1 }]}>
                    <List 
                        containerStyle={{ 
                            marginTop: 0, 
                            borderTopWidth: 0, 
                            borderBottomWidth: 0 
                        }}
                    >
                        {
                            jogadoresCasaFt.map((item, index) => {
                                const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                                return (
                                    <ListItem
                                        containerStyle={
                                            (index + 1) === numJogadoresCasa && 
                                            numjogadoresVisit === 0 ? 
                                            { borderBottomWidth: 0 } : null 
                                        }
                                        titleContainerStyle={{ marginLeft: 10 }}
                                        subtitleContainerStyle={{ marginLeft: 10 }}
                                        roundAvatar
                                        avatar={retrieveImgSource(imgAvt)}
                                        key={index}
                                        title={item.nome}
                                        subtitle={item.posicao}
                                        rightIcon={this.renderIcons(item, jogo)}
                                        leftIcon={(
                                            <Image 
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={imgHomeShirt} 
                                            />)
                                        }
                                    />
                                );
                            })
                        }
                        {
                            jogadoresVisitFt.map((item, index) => {
                                const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                                return (
                                    <ListItem
                                        containerStyle={
                                            (index + 1) === numjogadoresVisit ?
                                            { borderBottomWidth: 0 } : null 
                                        }
                                        titleContainerStyle={{ marginLeft: 10 }}
                                        subtitleContainerStyle={{ marginLeft: 10 }}
                                        roundAvatar
                                        avatar={retrieveImgSource(imgAvt)}
                                        key={index}
                                        title={item.nome}
                                        subtitle={item.posicao}
                                        rightIcon={this.renderIcons(item, jogo)}
                                        leftIcon={(
                                            <Image 
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={imgVisitShirt} 
                                            />)
                                        }
                                    />
                                );
                            })
                        }
                    </List>
                </View>
            </View>
        );
    }

    renderIcons(jogador, jogo) {
        let i = 0;
        let yellow = 0;
        let red = 0;
        let disabled = false;

        for (i = 0; i < jogo.cartoes.length; i++) {
            if (!jogo.cartoes[i].push && jogo.cartoes[i].key === jogador.key) {
                if (jogo.cartoes[i].color === 'amarelo') {
                    yellow++;
                }
                if (jogo.cartoes[i].color === 'vermelho') {
                    red++;
                }
            }
        }

        if (yellow >= 2 || red >= 1) {
            disabled = true;
        }

        return (
            <View 
                style={{ 
                    flex: 1
                }}
            >
                {
                    disabled ?
                    (
                        <View 
                            style={{ 
                                flex: 1, 
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Text style={{ color: 'red', fontWeight: '500' }}>
                                Jogador Expulso
                            </Text>
                        </View>
                    )
                    :
                    (
                        <View 
                            style={{ 
                                flex: 0.8, 
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => checkConInfo(
                                        () => this.onPressPlayerGol(jogador, jogo)
                                    )}
                                >
                                    <Image 
                                        source={imgBola}
                                        style={{ 
                                            width: 25, height: 25 
                                        }} 
                                    />   
                                </TouchableOpacity>
                            </View>
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => checkConInfo(
                                        () => this.onPressCard(jogador, jogo, 'amarelo')
                                    )}
                                >
                                    <Image 
                                        source={imgYellowCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />   
                                </TouchableOpacity>
                            </View>
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => checkConInfo(
                                        () => this.onPressCard(jogador, jogo, 'vermelho')
                                    )}
                                >
                                    <Image 
                                        source={imgRedCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />   
                                </TouchableOpacity>
                            </View>
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => checkConInfo(
                                        () => this.onPressSubs(jogador)
                                    )}
                                >
                                    <Image 
                                        source={imgInOut}
                                        style={{ 
                                            width: 25, height: 25 
                                        }} 
                                    />   
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                }
            </View>

        );
    }

    render() {
        const { listJogos, itemSelected } = this.props;
        const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];

        if (!jogo) {
            return false;
        }

        const jogadoresCasaFt = _.filter(jogo.escalacao.casa, (jgCasa) => !jgCasa.push);
        const jogadoresVisitFt = _.filter(jogo.escalacao.visit, (jgVisit) => !jgVisit.push);

        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.viewP}>
                    { this.renderCardPlacar(jogo) }
                    <View style={{ marginVertical: 2 }} />
                    { this.renderGoals(jogo) }
                    { this.renderCartoes(jogo) }
                    { this.renderSubs(jogo) }
                    { this.renderEscalados(jogo) }
                    <View style={{ marginVertical: 20 }} />
                </ScrollView>
                <ModalInput
                        isDialogVisible={this.props.showTimerModal}
                        title={'Tempo de Jogo'}
                        message={'Altere em minutos o tempo de jogo desejado.'}
                        submitInput={(value) => this.onConfirmManualTimer(value)}
                        closeDialog={() => this.props.modificaShowTimerModal(false)}
                        hint={this.state.seconds}
                        cancelText={'Cancelar'}
                        submitText={'Ok'} 
                />
                <PlayersModal
                    showPlayersModal={this.props.showPlayersModalJ}  
                    doInOrOut={
                        (jogador, inOrOut, newJogador = false) => 
                        checkConInfo(() => this.doInOrOut(jogador, inOrOut, jogo, newJogador))
                    }
                    jogadoresCasaFt={jogadoresCasaFt}
                    jogadoresVisitFt={jogadoresVisitFt}
                />
                <Dialog
                    animationType={'fade'} 
                    visible={this.props.endGameModal && Actions.currentScene === '_jogoTabG'}
                    title='Gravando dados...'
                    onTouchOutside={() => true}
                >
                    <View 
                        style={{ 
                            alignItems: 'center',
                            justifyContent: 'center' 
                        }}
                    >
                        <Progress.Circle 
                            progress={this.props.endGameModalPerc}
                            size={100}
                            showsText
                            color={colorAppP}
                        />
                    </View>
                </Dialog>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        backgroundColor: colorAppF
    },
    viewPlacar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        padding: 0,
        margin: 0,
        marginHorizontal: 10,
        marginVertical: 15,
        borderRadius: 5
    },
    cardEffect: {
        backgroundColor: 'white',
        borderColor: '#e1e8ee',
        borderRadius: 5,
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0, .2)',
                shadowOffset: { height: 0, width: 0 },
                shadowOpacity: 1,
                shadowRadius: 1,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    topViewPlacar: {
        width: '80%',
        height: 0,
        borderTopWidth: 40,
        borderTopColor: colorAppP,
        borderLeftWidth: 20,
        borderLeftColor: 'transparent',
        borderRightWidth: 20,
        borderRightColor: 'transparent',
        borderStyle: 'solid'
    },
    separator: { 
        width: '100%', 
        borderTopWidth: 0.5, 
        borderTopColor: 'black',
        marginVertical: 5
    },
    circleBtn: { 
        width: 70, 
        height: 70, 
        borderRadius: 70 / 2,
        borderColor: '#e1e8ee',
        ...Platform.select({
            ios: {
                shadowColor: 'rgba(0,0,0, .2)',
                shadowOffset: { height: 0, width: 0 },
                shadowOpacity: 1,
                shadowRadius: 1,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    circleBtnTwo: { 
        width: 60, 
        height: 60, 
        borderRadius: 60 / 2,
        borderWidth: 2,
        borderColor: 'white'
    },
    centerFlex: { 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    centerAlign: {
        alignItems: 'center', 
        justifyContent: 'center'
    },
    textCircle: {
        fontSize: 12, 
        color: 'white', 
        fontWeight: 'bold' 
    },
    extraTime: { 
        fontSize: 12, 
        fontWeight: 'bold', 
        color: 'red' 
    },
    textIn: {
        fontWeight: '600',
        color: '#4AD940'
    },
    textOut: {
        fontWeight: '600',
        color: '#E44545'
    }
});

const mapStateToProps = (state) => ({
    showPlayersModalJ: state.GerenciarReducer.showPlayersModalJ,
    endGameModal: state.GerenciarReducer.endGameModal,
    endGameModalPerc: state.GerenciarReducer.endGameModalPerc,
    itemSelected: state.GerenciarReducer.itemSelected,
    listJogos: state.JogosReducer.listJogos,
    showTimerModal: state.JogoReducer.showTimerModal
});

export default connect(mapStateToProps, { 
    modificaClean,
    modificaCurrentTime,
    modificaShowTimerModal,
    modificaMissedPlayers,
    modificaShowPlayersModalJ,
    modificaIsSubstitute,
    modificaJogador
})(JogoG);
