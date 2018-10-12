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
import { Card, List, ListItem } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import firebase from '../../../Firebase';
import { colorAppF, colorAppP, colorAppS, colorAppW } from '../../../utils/constantes';
import { retrieveImgSource } from '../../../utils/imageStorage';
import { limitDotText, formattedSeconds, formatJogoSeconds } from '../../../utils/strComplex';
import { modificaClean, modificaCurrentTime } from '../../../actions/JogoActions';

import imgHomeShirt from '../../../imgs/homeshirt.png';
import imgVisitShirt from '../../../imgs/visitshirt.png';
import imgBola from '../../../imgs/bolaanim.png';
import imgYellowCard from '../../../imgs/yellowcard.png';
import imgRedCard from '../../../imgs/redcard.png';
import imgCartoes from '../../../imgs/cards.png';
import imgAvatar from '../../../imgs/perfiluserimg.png';
import Jogos from '../../jogos/Jogos';

class JogoG extends React.Component {

    constructor(props) {
        super(props);

        this.intervalIncrementer = null;

        this.fbDatabaseRef = firebase.database().ref();

        this.renderCardPlacar = this.renderCardPlacar.bind(this);
        this.renderGoals = this.renderGoals.bind(this);
        this.renderCartoes = this.renderCartoes.bind(this);
        this.textJogoProgress = this.textJogoProgress.bind(this);
        this.textPlacar = this.textPlacar.bind(this);
        this.onPressPlayerGol = this.onPressPlayerGol.bind(this);
        this.onPressCard = this.onPressCard.bind(this);
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
    }

    shouldComponentUpdate(nextProps, nextStates) {
        const { listJogos, itemSelected } = this.props;

        if (nextProps.listJogos && nextProps.listJogos.length === 0) {
            return false;
        }

        if (nextProps !== this.props) {
            setTimeout(() => {
                const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];
                const nj = _.filter(nextProps.listJogos, (item) => item.key === itemSelected)[0];
                if (jogo.currentTime !== nj.currentTime) {
                    this.setState({ currentTime: parseInt(nj.currentTime, 10) });
                }
                if (jogo.status !== nj.status) {
                    if (nj.status === '0') {
                        clearInterval(this.intervalIncrementer);
                    } else if (nj.status === '1') {
                        this.intervalIncrementer = setInterval(() =>
                            this.setState({
                                seconds: this.state.seconds + 1
                            })
                        , 1000);
                    } else if (nj.status === '2') {
                        clearInterval(this.intervalIncrementer);
                        this.setState({
                            seconds: 0
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
        this.props.modificaClean();
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
                Toast.show('Falha ao iniciar a partida, verifique a conexão.', Toast.SHORT)
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
                Toast.show('Falha ao pausar a partida, verifique a conexão.', Toast.SHORT)
            );
        }  
    }

    onResetTimer(enabled, jogo) { 
        if (enabled) {
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
                Toast.show('Falha ao reiniciar a partida, verifique a conexão.', Toast.SHORT)
            ); 
        } 
    }

    onPressPlayerGol(jogador, jogo) {
        const gols = [
            ...jogo.gols, 
            { 
                side: jogador.side,
                nome: jogador.nome,
                time: this.state.seconds.toString()
            }
        ];

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
                    onPress: () => {
                        this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                            gols
                        })
                        .then(() => {
                            Toast.show('Gol marcado.', Toast.SHORT);
                            this.fbDatabaseRef
                            .child(`usuarios/${jogador.key}/gols`).once('value', (snapshot) => {
                                const golsPlus = parseInt(snapshot.val(), 10) + 1;
                                this.fbDatabaseRef
                                .child(`usuarios/${jogador.key}`).update({
                                    gols: golsPlus.toString()
                                })
                                .then(() => true)
                                .catch(() => true);
                            });
                        })
                        .catch(() => 
                            Toast.show('Falha ao marcar o gol. Verifique a conexão.', Toast.SHORT)
                        );
                    }
                }
            ]
        );
    }

    onPressCard(jogador, jogo, color) {
        const cartoes = [
            ...jogo.cartoes, 
            { 
                side: jogador.side,
                nome: jogador.nome,
                time: this.state.seconds.toString(),
                color
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
                    onPress: () => {
                        this.fbDatabaseRef.child(`jogos/${jogo.key}`).update({
                            cartoes
                        })
                        .then(() => {
                            const keyCard = color === 'amarelo' ? 
                            'cartoesAmarelos' : 'cartoesVermelhos';
                            Toast.show(`Cartão ${color} aplicado.`, Toast.SHORT);
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
                            Toast.show('Falha ao aplicar cartão. Verifique a conexão.', Toast.SHORT)
                        );
                    }
                }
            ]
        );
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
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image 
                            style={{ height: 80, width: 70 }}
                            resizeMode={'stretch'}
                            source={imgHomeShirt} 
                        />
                        <Text
                            style={{
                                fontWeight: '500'
                            }}
                        >
                            Casa
                        </Text>
                    </View>
                    <View 
                        style={{ 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderRadius: 3
                        }}
                    >
                            <View
                                style={{ 
                                    marginHorizontal: 30,
                                    marginVertical: 5,
                                    alignItems: 'center',
                                    justifyContent: 'center' 
                                }}
                            >
                                <View style={{ marginBottom: 10 }}>
                                    <Text
                                        style={{ 
                                            fontSize: 18, 
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
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image 
                            style={{ height: 80, width: 70 }}
                            resizeMode={'stretch'}
                            source={imgVisitShirt}
                        />
                        <Text
                            style={{
                                fontWeight: '500'
                            }}
                        >
                            Visitantes
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
                            onPress={() => this.onStartTimer(btnStartEnabled, jogo)}
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
                                        Iniciar
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.centerFlex, { opacity: btnPauseEnabled ? 1 : 0.5 }]}>
                        <TouchableOpacity
                            onPress={() => this.onPauseTimer(btnPauseEnabled, jogo)}
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
                            onPress={() => this.onResetTimer(btnResetEnabled, jogo)}
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
                            { this.renderGolJogador(jogo.gols) }
                        </List>
                    </View>
                </View>
            </View>
        );
    }

    renderGolJogador(gols) {
        const golsCasa = _.filter(gols, (item) => item.side && item.side === 'casa');
        const golsVisit = _.filter(gols, (item) => item.side && item.side === 'visit');
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
                            <Text>
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
                            <Text>
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
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    <View style={{ marginHorizontal: 3 }} />
                                    { timeText }
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(golsCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(golsVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text>
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
                            <Text>
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
                            <Text>
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
                            <Text>
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
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    <View style={{ marginHorizontal: 3 }} />
                                    { timeTextCasa }
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    { timeTextVisit }
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
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
                            <Text>
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
                            <Text>
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
                                    { timeText }
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(golsVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(golsCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text>
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
                            <Text>
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
                            <Text>
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
                            <Text>
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
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    <View style={{ marginHorizontal: 3 }} />
                                    { timeTextVisit }
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    { timeTextCasa }
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
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
                            { this.renderCartaoJogador(jogo.cartoes) }
                        </List>
                    </View>
                </View>
            </View>
        );
    }

    renderCartaoJogador(cartoes) {
        const cartoesCasa = _.filter(cartoes, (item) => item.side && item.side === 'casa');
        const cartoesVisit = _.filter(cartoes, (item) => item.side && item.side === 'visit');
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
                            <Text>
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
                            <Text>
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
                                    <Image 
                                        source={
                                            cartoesCasa[i].color === 'amarelo' ?
                                            imgYellowCard : imgRedCard
                                        }
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                    <View style={{ marginHorizontal: 3 }} />
                                    { timeText }
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextCasa = formatJogoSeconds(cartoesCasa[i].time);
                    let timeTextVisit = formatJogoSeconds(cartoesVisit[i].time);
                    if (timeTextCasa.length > 1) {
                        timeTextCasa = (
                            <Text>
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
                            <Text>
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
                            <Text>
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
                            <Text>
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
                                    <Image 
                                        source={
                                            cartoesCasa[i].color === 'amarelo' ?
                                            imgYellowCard : imgRedCard
                                        }
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                    <View style={{ marginHorizontal: 3 }} />
                                    { timeTextCasa }
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    { timeTextVisit }
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image 
                                        source={
                                            cartoesVisit[i].color === 'amarelo' ?
                                            imgYellowCard : imgRedCard
                                        }
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
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
                            <Text>
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
                            <Text>
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
                                    { timeText }
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image 
                                        source={
                                            cartoesVisit[i].color === 'amarelo' ?
                                            imgYellowCard : imgRedCard
                                        }
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    let timeTextVisit = formatJogoSeconds(cartoesVisit[i].time);
                    let timeTextCasa = formatJogoSeconds(cartoesCasa[i].time);
                    if (timeTextVisit.length > 1) {
                        timeTextVisit = (
                            <Text>
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
                            <Text>
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
                            <Text>
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
                            <Text>
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
                                    <Image 
                                        source={
                                            cartoesCasa[i].color === 'amarelo' ?
                                            imgYellowCard : imgRedCard
                                        }
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                    <View style={{ marginHorizontal: 3 }} />
                                    { timeTextCasa }
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    { timeTextVisit }
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image 
                                        source={
                                            cartoesVisit[i].color === 'amarelo' ?
                                            imgYellowCard : imgRedCard
                                        }
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewCartoes;
    }

    renderEscalados(jogo) {
        const jogadoresCasaFt = _.filter(jogo.escalacao.casa, (jgCasa) => !jgCasa.push);
        const jogadoresVisitFt = _.filter(jogo.escalacao.visit, (jgVisit) => !jgVisit.push);
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
        return (
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
                        onPress={() => this.onPressPlayerGol(jogador, jogo)}
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
                        onPress={() => this.onPressCard(jogador, jogo, 'amarelo')}
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
                        onPress={() => this.onPressCard(jogador, jogo, 'vermelho')}
                    >
                        <Image 
                            source={imgRedCard}
                            style={{ 
                                width: 20, height: 25 
                            }} 
                        />   
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    render() {
        const { listJogos, itemSelected } = this.props;
        const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];

        return (
            <ScrollView style={styles.viewP}>
                { this.renderCardPlacar(jogo) }
                <View style={{ marginVertical: 2 }} />
                { this.renderGoals(jogo) }
                { this.renderCartoes(jogo) }
                { this.renderEscalados(jogo) }
                <View style={{ marginVertical: 20 }} />
            </ScrollView>
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
    }
});

const mapStateToProps = (state) => ({
    itemSelected: state.GerenciarReducer.itemSelected,
    listJogos: state.JogosReducer.listJogos
});

export default connect(mapStateToProps, { 
    modificaClean,
    modificaCurrentTime 
})(JogoG);
