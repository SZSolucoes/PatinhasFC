import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    Animated,
    Text,
    TouchableWithoutFeedback,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator
} from 'react-native';
import { Card, Icon, List, ListItem } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import * as Progress from 'react-native-progress';
import { Dialog } from 'react-native-simple-dialogs';
import firebase from '../../../Firebase';
import { colorAppF, colorAppP, colorAppS } from '../../../utils/constantes';
import { retrieveImgSource } from '../../../utils/imageStorage';
//import Campo from '../../campo/Campo';
import EscalacaoPadrao from '../../campo/EscalacaoPadrao';
import PlayersModal from './PlayersModal';
import { isPortrait } from '../../../utils/orientation';
import { getPosIndex, checkConInfo } from '../../../utils/jogosUtils';
import { 
    modificaShowPlayersModal,
    modificaIsSubstitute,
    modificaJogador,
    modificaMissedPlayers
} from '../../../actions/GerenciarActions';

import imgHomeShirt from '../../../imgs/homeshirt.png';
import imgVisitShirt from '../../../imgs/visitshirt.png';
import imgTeam from '../../../imgs/team.png';
import imgAvatar from '../../../imgs/perfiluserimg.png';

class EscalacaoG extends React.Component {

    constructor(props) {
        super(props);

        this.isFirstCasa = true;
        this.isFirstVisit = true;

        this.maxViewCasaHeight = 0;
        this.minViewCasaHeight = 0;

        this.maxViewVisitHeight = 0;
        this.minViewVisitHeight = 0;

        this.onLayoutTitleCasa = this.onLayoutTitleCasa.bind(this);
        this.onLayoutCasa = this.onLayoutCasa.bind(this);
        this.onToggleCasa = this.onToggleCasa.bind(this);
        this.onRemoveGols = this.onRemoveGols.bind(this);
        this.onRemoveCards = this.onRemoveCards.bind(this);
        this.onRemoveSubs = this.onRemoveSubs.bind(this);

        this.onLayoutTitleVisit = this.onLayoutTitleVisit.bind(this);
        this.onLayoutVisit = this.onLayoutVisit.bind(this);
        this.onToggleVisit = this.onToggleVisit.bind(this);

        this.onChangeDimensions = this.onChangeDimensions.bind(this);
        this.doInOrOut = this.doInOrOut.bind(this);
        this.onPressEscalConfirm = this.onPressEscalConfirm.bind(this);
        this.renderCasaJogadores = this.renderCasaJogadores.bind(this);
        this.renderVisitJogadores = this.renderVisitJogadores.bind(this);
        this.renderIcons = this.renderIcons.bind(this);
        this.renderConfirmados = this.renderConfirmados.bind(this);

        this.state = {
            heightDim: Dimensions.get('screen').height,
            animCasaValue: new Animated.Value(),
            animVisitValue: new Animated.Value(),
            isCasaExpanded: true,
            isVisitExpanded: true,
            loadingEscal: -1,
            loadingEscalSide: '',
            loadingEscalConfirmIdx: -1
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.onChangeDimensions);
        if (isPortrait()) {
            this.setState({ heightDim: Dimensions.get('screen').height / 2.5 });
        } else {
            this.setState({ heightDim: Dimensions.get('screen').height / 1.5 });
        }
    }

    shouldComponentUpdate(nextProps, nextStates) {
        const { itemSelected } = this.props;
        
        if (nextProps.listJogos) {
            const nj = _.filter(nextProps.listJogos, (item) => item.key === itemSelected)[0];
                
            if (!nj) {
                return false;
            }
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions(event) {
        if (isPortrait()) {
            this.setState({ heightDim: event.screen.height / 2.5 });
        }
    }

    onLayoutTitleCasa(event) {
        this.minViewCasaHeight = event.nativeEvent.layout.height;
        if (this.isFirstCasa) {
            this.onToggleCasa();
            this.isFirstCasa = false;
        }
    }

    onLayoutCasa(event) {
        this.maxViewCasaHeight = event.nativeEvent.layout.height;
        if (this.state.isCasaExpanded) {
            Animated.spring(     
                this.state.animCasaValue,
                {
                    toValue: this.maxViewCasaHeight + 50
                }
            ).start(); 
        }
    }

    onLayoutTitleVisit(event) {
        this.minViewVisitHeight = event.nativeEvent.layout.height;
        if (this.isFirstVisit) {
            this.onToggleVisit();
            this.isFirstVisit = false;
        }
    }

    onLayoutVisit(event) {
        this.maxViewVisitHeight = event.nativeEvent.layout.height;
        if (this.state.isVisitExpanded) {
            Animated.spring(     
                this.state.animVisitValue,
                {
                    toValue: this.maxViewVisitHeight + 50
                }
            ).start(); 
        }
    }

    onToggleCasa() {
        const initialValue = this.state.isCasaExpanded ? 
        this.maxViewCasaHeight + this.minViewCasaHeight : this.minViewCasaHeight;

        const finalValue = this.state.isCasaExpanded ? 
        this.minViewCasaHeight : this.maxViewCasaHeight + this.minViewCasaHeight;
    
        this.setState({ isCasaExpanded: !this.state.isCasaExpanded });

        this.state.animCasaValue.setValue(initialValue);
        Animated.spring(     
            this.state.animCasaValue,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    onToggleVisit() {
        const initialValue = this.state.isVisitExpanded ? 
        this.maxViewVisitHeight + this.minViewVisitHeight : this.minViewVisitHeight;

        const finalValue = this.state.isVisitExpanded ? 
        this.minViewVisitHeight : this.maxViewVisitHeight + this.minViewVisitHeight;
    
        this.setState({ isVisitExpanded: !this.state.isVisitExpanded });
    
        this.state.animVisitValue.setValue(initialValue);
        Animated.spring(     
            this.state.animVisitValue,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    onPressEscalConfirm(side, jogador, jogo) {
        const newJogador = _.find(this.props.listUsuarios, user => user.key === jogador.key);
        const nJog = {
            key: newJogador.key,
            nome: newJogador.nome,
            posicao: '',
            posvalue: 'default',
            imgAvatar: newJogador.imgAvatar,
            side,
            vitorias: newJogador.vitorias,
            derrotas: newJogador.derrotas,
            empates: newJogador.empates,
            jogosEscalados: newJogador.jogosEscalados
        };

        let alertMsg = '';

        if (side === 'casa') {
            alertMsg = 'Confirma a escalação do jogador:\n' +
            `(${nJog.nome}) para o time:\n(${jogo.timeCasa ? jogo.timeCasa.trim() : 'Casa'}) ?`;
        } else {
            alertMsg = 'Confirma a escalação do jogador:\n' +
            `(${nJog.nome}) para o time:\n(${
            jogo.timeVisit ? jogo.timeVisit.trim() : 'Visitantes'}) ?`;
        }

        Alert.alert(
            'Aviso', 
            alertMsg,
            [
              { text: 'Cancelar', onPress: () => false },
              { 
                  text: 'OK', 
                  onPress: () => checkConInfo(
                  () => this.doInOrOut(nJog, true, jogo, 'true')) 
            }
            ],
            { cancelable: false }
        );
    }

    async onRemoveGols(jogador, jogo) {
        const dbFirebaseRef = firebase.database().ref();
        const jogadorGols = [];
        const gols = _.filter(
            jogo.gols, jgG => {
                const noPlayer = !jgG.push && jgG.key !== jogador.key;
                if (!noPlayer) {
                    jogadorGols.push({ ...jgG });
                }

                return noPlayer;
            }
        );

        let placarCasa = parseInt(jogo.placarCasa, 10);
        let placarVisit = parseInt(jogo.placarVisit, 10);
        
        for (let indexOne = 0; indexOne < jogadorGols.length; indexOne++) {
            const jogGol = jogadorGols[indexOne];

            if (jogGol.side === 'casa') {
                placarCasa--;
            } else {
                placarVisit--;
            }
        }

        for (let i = 0; i < gols.length; i++) {
            if (!gols[i].push) {
                gols[i].indexKey = i.toString();
            }
        }

        const payload = { 
            gols, 
            placarCasa: `${placarCasa}`, 
            placarVisit: `${placarVisit}`
        };

        await dbFirebaseRef.child(`jogos/${jogo.key}`).update({
            ...payload
        })
        .then(async () => {
            await dbFirebaseRef
            .child(`usuarios/${jogador.key}/gols`).once('value', async (snapshot) => {
                const golsLess = parseInt(snapshot.val(), 10) - jogadorGols.length;
                await dbFirebaseRef
                .child(`usuarios/${jogador.key}`).update({
                    gols: golsLess.toString()
                })
                .then(() => true)
                .catch(() => true);
            });
        })
        .catch(() => false);
    }

    async onRemoveCards(jogador, jogo) {
        const dbFirebaseRef = firebase.database().ref();
        const jogadorCartoes = [];
        const cartoes = _.filter(
            jogo.cartoes, jgC => {
                const noPlayer = !jgC.push && jgC.key !== jogador.key;
                if (!noPlayer) {
                    jogadorCartoes.push({ ...jgC });
                }

                return noPlayer;
            }
        );

        const cartAmar = _.filter(jogadorCartoes, jogCart => jogCart.color === 'amarelo').length;
        const cartVerm = _.filter(jogadorCartoes, jogCart => jogCart.color === 'vermelho').length;
        
        for (let i = 0; i < cartoes.length; i++) {
            if (!cartoes[i].push) {
                cartoes[i].indexKey = i.toString();
            }
        }

        await dbFirebaseRef.child(`jogos/${jogo.key}`).update({
            cartoes
        })
        .then(async () => {
            await dbFirebaseRef.child(`usuarios/${jogador.key}`)
            .once('value', async (snapshot) => {
                const snapVal = snapshot.val();

                await dbFirebaseRef.child(`usuarios/${jogador.key}`).update({
                    cartoesAmarelos: `${parseInt(snapVal.cartoesAmarelos, 10) - cartAmar}`,
                    cartoesVermelhos: `${parseInt(snapVal.cartoesVermelhos, 10) - cartVerm}`
                })
                .then(() => true)
                .catch(() => true);
            });
        })
        .catch(() => false);
    }

    async onRemoveSubs(jogador, jogo) {
        const dbFirebaseRef = firebase.database().ref();
        const subs = _.filter(jogo.subs, subJog => {
            if (subJog.push) {
                return true;
            }

            const foundIn = subJog.jogadorIn.key === jogador.key;
            const foundOut = subJog.jogadorOut.key === jogador.key;

            if (foundIn || foundOut) {
                return false;
            }

            return true;
        });
        
        for (let i = 0; i < subs.length; i++) {
            if (!subs[i].push) {
                subs[i].indexKey = i.toString();
            }
        }

        await dbFirebaseRef.child(`jogos/${jogo.key}`).update({
            subs
        })
        .then(async () => {
            const { side } = jogador;

            if (side === 'casa') {
                const newCasaList = _.filter(
                    jogo.escalacao.casa, (item) => (item.key !== jogador.key) || !!item.push
                );
                const newBancoList = _.filter(
                    jogo.escalacao.banco, (item) => (item.key !== jogador.key) || !!item.push
                );
                await dbFirebaseRef.child(`jogos/${jogo.key}/escalacao`).update({
                    casa: newCasaList,
                    banco: newBancoList
                })
                .then(() => true)
                .catch(() => false);
            } else if (side === 'visit') {
                const newVisitList = _.filter(
                    jogo.escalacao.visit, (item) => (item.key !== jogador.key) || !!item.push
                );
                const newBancoList = _.filter(
                    jogo.escalacao.banco, (item) => (item.key !== jogador.key) || !!item.push
                );
                await dbFirebaseRef.child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList,
                    banco: newBancoList
                })
                .then(() => true)
                .catch(() => false);
            }
        })
        .catch(() => false);
    }

    async doInOrOut(jogador, inOrOut, jogo, showToast = false, lastToast = false) {
        const jogadores = jogador instanceof Array ? jogador : [jogador];
        const successT = `${jogadores.length > 1 ? 
            'Jogadores escalados' : 'Jogador escalado'} com sucesso`;
        const errorT = 'Falha ao escalar ' +
        `${jogadores.length > 1 ? 'jogadores' : 'jogador'}. Verifique a conexão`;

        if (inOrOut) {
            const { side } = jogadores[0];
            if (side === 'casa') {
                const newCasaList = [...jogo.escalacao.casa, ...jogadores];
                await firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    casa: newCasaList
                })
                .then(() =>
                    ((showToast && showToast === 'true') || lastToast) &&
                    Toast.show(successT, Toast.SHORT)
                )
                .catch(() => 
                    ((showToast && showToast === 'true') || lastToast) &&
                    Toast.show(errorT, Toast.SHORT)
                );
            } else if (side === 'visit') {
                const newVisitList = [...jogo.escalacao.visit, ...jogadores];
                await firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList
                })
                .then(() =>
                    ((showToast && showToast === 'true') || lastToast) &&
                    Toast.show(successT, Toast.SHORT)
                )
                .catch(() => 
                    ((showToast && showToast === 'true') || lastToast) &&
                    Toast.show(errorT, Toast.SHORT)
                );
            }
        } else {
            const { side } = jogadores[0];

            for (let index = 0; index < jogadores.length; index++) {
                const element = jogadores[index];
                const playerRemoveGols = _.findIndex(
                    jogo.gols, jgG => !jgG.push && jgG.key === element.key
                ) !== -1;
                const playerRemoveCards = _.findIndex(
                    jogo.cartoes, jgC => !jgC.push && jgC.key === element.key
                ) !== -1;
                const playerRemoveSubs = _.findIndex(
                    jogo.subs, jgS => {
                        if (jgS.push) {
                            return false;
                        }
            
                        const foundIn = jgS.jogadorIn.key === jogador.key;
                        const foundOut = jgS.jogadorOut.key === jogador.key;
            
                        if (foundIn || foundOut) {
                            return true;
                        }
            
                        return false;
                    }
                ) !== -1;

                if (playerRemoveGols) {
                    await this.onRemoveGols(element, jogo);
                }

                if (playerRemoveCards) {
                    await this.onRemoveCards(element, jogo);
                }

                if (playerRemoveSubs) {
                    await this.onRemoveSubs(element, jogo);
                }
            }
            
            if (side === 'casa') {
                const newCasaList = _.filter(
                    jogo.escalacao.casa, (item) => (item.key !== jogadores[0].key) || !!item.push
                );
                await firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    casa: newCasaList
                })
                .then(() =>
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Jogador escalado com sucesso', Toast.SHORT)
                )
                .catch(() => 
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Falha ao escalar jogador. Verifique a conexão', Toast.SHORT)
                );
            } else if (side === 'visit') {
                const newVisitList = _.filter(
                    jogo.escalacao.visit, (item) => (item.key !== jogadores[0].key) || !!item.push
                );
                await firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList
                })
                .then(() =>
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Jogador escalado com sucesso', Toast.SHORT)
                )
                .catch(() => 
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Falha ao escalar jogador. Verifique a conexão', Toast.SHORT)
                );
            }

            this.setState({ loadingEscal: -1, loadingEscalConfirmIdx: -1, loadingEscalSide: '' });
        }
    }

    renderIcons(item, jogo, index, side) {
        return (
            <View 
                style={{ 
                    flex: 0.5, 
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
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
                        onPress={() => checkConInfo(() => {
                            Alert.alert(
                                'Aviso',
                                `Confirma a remoção da escalação do jogador:\n${item.nome} ?`,
                                [
                                    { text: 'Cancelar', 
                                        onPress: () => true, 
                                        style: 'cancel' 
                                    },
                                    { 
                                        text: 'Ok', 
                                        onPress: () => checkConInfo(
                                            () => {
                                                this.setState({ 
                                                    loadingEscal: index, 
                                                    loadingEscalSide: side
                                                });
                                                this.doInOrOut(item, false, jogo);
                                            }
                                        )
                                    },
                                ]
                            );
                        })}
                    >
                        {
                            this.state.loadingEscal === index && 
                            this.state.loadingEscalSide === side ?
                            (
                                <ActivityIndicator size={'large'} color={colorAppS} />
                            )
                            :
                            (
                                <Icon
                                    name='delete' 
                                    type='material-community' 
                                    size={30} color='red' 
                                />   
                            )
                        }  
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderCasaJogadores(jogo) {
        const casaJogadores = _.filter(jogo.escalacao.casa, (item) => !item.push).sort(
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
        const numJogadores = casaJogadores.length;

        if (numJogadores === 0) {
            return false;
        }

        return (
            <List 
                containerStyle={{  
                    borderTopWidth: 0, 
                    borderBottomWidth: 0 
                }}
            >
                {
                    casaJogadores.map((item, index) => {
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                        return (
                            <ListItem
                                containerStyle={
                                    (index + 1) === numJogadores ? { borderBottomWidth: 0 } : null 
                                }
                                roundAvatar
                                avatar={retrieveImgSource(imgAvt)}
                                key={index}
                                title={item.nome}
                                subtitle={item.posicao}
                                rightIcon={(
                                    this.renderIcons(item, jogo, index, 'casa')
                                )}
                            />
                        );
                    })
                }
            </List>
        );
    }

    renderVisitJogadores(jogo) {
        const visitJogadores = _.filter(jogo.escalacao.visit, (item) => !item.push).sort(
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
        const numJogadores = visitJogadores.length;

        if (numJogadores === 0) {
            return false;
        }

        return (
            <List 
                containerStyle={{  
                    borderTopWidth: 0, 
                    borderBottomWidth: 0 
                }}
            >
                {
                    visitJogadores.map((item, index) => {
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                        return (
                            <ListItem
                                containerStyle={
                                    (index + 1) === numJogadores ? { borderBottomWidth: 0 } : null 
                                }
                                roundAvatar
                                avatar={retrieveImgSource(imgAvt)}
                                key={index}
                                title={item.nome}
                                subtitle={item.posicao}
                                rightIcon={(
                                    this.renderIcons(item, jogo, index, 'visit')
                                )}
                            />
                        );
                    })
                }
            </List>
        );
    }

    renderConfirmados(jogo) {
        const jogadoresConfirmados = _.filter(jogo.confirmados, (jgCasa) => !jgCasa.push);
        const numjogadoresConfirmados = jogadoresConfirmados.length;

        if (numjogadoresConfirmados === 0) {
            return false;
        }

        return (
            <Card
                containerStyle={styles.card}
            >
                <View 
                    style={styles.titleContainer} 
                    onLayout={this.onLayoutTitleCasa}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image 
                            style={{ height: 45, width: 45, marginRight: 10 }}
                            resizeMode={'stretch'}
                            source={imgTeam} 
                        /> 
                        <Text 
                            style={{ fontSize: 16, color: 'black' }}
                        >
                            Confirmados
                        </Text>
                    </View>
                </View>
                <List 
                    containerStyle={{
                        marginTop: 0, 
                        borderTopWidth: 0, 
                        borderBottomWidth: 0
                    }}
                >
                    {
                        jogadoresConfirmados.map((item, index) => {
                            let viewIcons = null;
                            let validIndex = -1;
                            let validItem = {};
                            const escalacaoCasa = _.findIndex(
                                jogo.escalacao.casa, 
                                (jgCasa) => !jgCasa.push && jgCasa.key === item.key
                            ); 

                            const escaladoVisit = _.findIndex(
                                jogo.escalacao.visit, 
                                (jgVisit) => !jgVisit.push && 
                                jgVisit.key === item.key
                            );

                            if (escalacaoCasa !== -1) {
                                validIndex = escalacaoCasa;
                                validItem = jogo.escalacao.casa[escalacaoCasa];
                            } else if (escaladoVisit !== -1) {
                                validIndex = escaladoVisit;
                                validItem = jogo.escalacao.visit[escaladoVisit];
                            }

                            const isMissed = _.findIndex(
                                this.props.missedPlayers, ms => ms === item.key
                            ) !== -1;
                            
                            if (this.state.loadingEscalConfirmIdx === index) {
                                viewIcons = (
                                    <View 
                                        style={{
                                            flexDirection: 'row',  
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            margin: 5
                                        }}
                                    >
                                        <ActivityIndicator size={'small'} color={colorAppS} />
                                    </View>
                                );
                            } else if (escalacaoCasa !== -1 || escaladoVisit !== -1) {
                                viewIcons = (
                                    <View style={{ flexDirection: 'row' }}>
                                        <View 
                                            style={{
                                                flexDirection: 'row',  
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                margin: 5
                                            }}
                                        >
                                            <Text style={{ color: colorAppS, fontWeight: '500' }}>
                                                Escalado
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={
                                                () => checkConInfo(() => {
                                                if (validIndex !== -1) {
                                                    Alert.alert(
                                                        'Aviso',
                                                        'Confirma a remoção da escalação do ' +
                                                        `jogador:\n${validItem.nome} ?`,
                                                        [
                                                            { text: 'Cancelar', 
                                                                onPress: () => true, 
                                                                style: 'cancel' 
                                                            },
                                                            { 
                                                                text: 'Ok', 
                                                                onPress: () => checkConInfo(
                                                                    () => {
                                                                        this.setState({ 
                                                                            loadingEscalConfirmIdx: 
                                                                            index 
                                                                        });
                                                                        this.doInOrOut(
                                                                            validItem, false, jogo
                                                                        );
                                                                    }
                                                                )
                                                            },
                                                        ]
                                                    ); 
                                                }
                                            })}
                                        >
                                            <View style={{ justifyContent: 'space-around' }}>
                                                <Icon
                                                    color={'black'}
                                                    name={'undo-variant'}
                                                    type='material-community'
                                                    size={32}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            } else if (isMissed) {
                                viewIcons = (
                                    <View style={{ flexDirection: 'row' }}>
                                        <View 
                                            style={{
                                                flexDirection: 'row',  
                                                alignItems: 'center',
                                                justifyContent: 'flex-end',
                                                margin: 5
                                            }}
                                        >
                                            <Text style={{ color: 'red', fontWeight: '500' }}>
                                                Faltou
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={
                                                () => {
                                                    const newMisseds = _.filter(
                                                        this.props.missedPlayers, 
                                                        mPlayerKey => mPlayerKey !== item.key
                                                    );

                                                    this.props.modificaMissedPlayers(newMisseds);
                                                }
                                            }
                                        >
                                            <View style={{ justifyContent: 'space-around' }}>
                                                <Icon
                                                    color={'black'}
                                                    name={'undo-variant'}
                                                    type='material-community'
                                                    size={32}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            } else {
                                viewIcons = (
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity
                                            onPress={
                                                () => 
                                                checkConInfo(() => this.onPressEscalConfirm(
                                                    'casa', item, jogo
                                                ))
                                            }
                                        >
                                            <View style={{ justifyContent: 'space-around' }}>
                                                <Image 
                                                    style={{ 
                                                        height: 35, width: 30, marginRight: 5 
                                                    }}
                                                    resizeMode={'stretch'}
                                                    source={imgHomeShirt} 
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={
                                                () => 
                                                checkConInfo(() => this.onPressEscalConfirm(
                                                    'visit', item, jogo
                                                ))
                                            }
                                        >
                                            <View style={{ justifyContent: 'space-around' }}>
                                                <Image 
                                                    style={{ 
                                                        height: 35, width: 30, marginRight: 5 
                                                    }}
                                                    resizeMode={'stretch'}
                                                    source={imgVisitShirt} 
                                                />
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={
                                                () => {
                                                    this.props.modificaMissedPlayers([
                                                        ...this.props.missedPlayers,
                                                        item.key
                                                    ]);
                                                }}
                                        >
                                            <View style={{ justifyContent: 'space-around' }}>
                                                <Icon
                                                    color={'black'}
                                                    name={'account-off'}
                                                    type='material-community'
                                                    size={32}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            }

                            const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                            return (
                                <ListItem
                                    containerStyle={
                                        (index + 1) === numjogadoresConfirmados ? 
                                        { borderBottomWidth: 0 } : null 
                                    }
                                    titleContainerStyle={{ marginLeft: 10 }}
                                    subtitleContainerStyle={{ marginLeft: 10 }}
                                    roundAvatar
                                    avatar={retrieveImgSource(imgAvt)}
                                    key={index}
                                    title={item.nome}
                                    rightIcon={viewIcons}
                                />
                            );
                        })
                    }
                </List>
            </Card>     
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
                    <Card
                        containerStyle={styles.card}
                    >
                        <Animated.View
                            style={{ height: this.state.animCasaValue }}
                        >
                            <View 
                                onLayout={this.onLayoutTitleCasa}
                            >
                                <TouchableWithoutFeedback
                                    onPress={() => this.onToggleCasa()}
                                >
                                    <View
                                        style={styles.titleContainer} 
                                    >
                                        <View 
                                            style={{ 
                                                flexDirection: 'row', 
                                                alignItems: 'center' 
                                            }}
                                        >
                                            <Image 
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={imgHomeShirt} 
                                            /> 
                                            <Text 
                                                onPress={() => this.onToggleCasa()}
                                                style={{ fontSize: 16, color: 'black' }}
                                            >
                                                { jogo.timeCasa ? jogo.timeCasa.trim() : 'Casa' }
                                            </Text>
                                        </View>
                                        <TouchableWithoutFeedback
                                            onPress={() => this.onToggleCasa()}
                                        >
                                            <Icon
                                                color={'black'}
                                                name={
                                                    this.state.isCasaExpanded ? 
                                                    'menu-up' : 'menu-down'
                                                }
                                                type='material-community'
                                                size={30}
                                            />
                                        </TouchableWithoutFeedback>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View 
                                onLayout={this.onLayoutCasa}
                            >
                                {/* <View style={{ height: this.state.heightDim }}>
                                    <Campo 
                                        enableTouch
                                        jogadores={jogadoresCasaFt} 
                                        side={'casa'}
                                        tatics={'4-4-2'}
                                        doInOrOut={
                                            (jogador, inOrOut) => 
                                            checkConInfo(
                                                () => this.doInOrOut(jogador, inOrOut, jogo)
                                            )
                                        }
                                    />
                                </View>
                                <View style={{ marginVertical: 20 }} />
                                { this.renderCasaJogadores(jogo) }
                                <View style={{ marginVertical: 20 }} /> */}
                                
                                <EscalacaoPadrao side={'casa'} />
                                { this.renderCasaJogadores(jogo) }
                                <View style={{ marginVertical: 20 }} />
                            </View>
                        </Animated.View>
                    </Card>
                    <Card
                        containerStyle={styles.card}
                    >
                        <Animated.View
                            style={{ height: this.state.animVisitValue }}
                        >
                            <View onLayout={this.onLayoutTitleVisit}>
                                <TouchableWithoutFeedback
                                    onPress={() => this.onToggleVisit()}
                                >
                                    <View
                                        style={styles.titleContainer}
                                    >
                                        <View 
                                            style={{ 
                                                flexDirection: 'row', 
                                                alignItems: 'center' 
                                            }}
                                        >
                                            <Image 
                                                style={{ height: 40, width: 35, marginRight: 5 }}
                                                resizeMode={'stretch'}
                                                source={imgVisitShirt} 
                                            />
                                            <Text 
                                                onPress={() => this.onToggleVisit()}
                                                style={{ fontSize: 16, color: 'black' }}
                                            >
                                                { 
                                                    jogo.timeVisit ? 
                                                    jogo.timeVisit.trim() 
                                                    : 
                                                    'Visitantes' 
                                                }
                                            </Text>
                                        </View>
                                        <TouchableWithoutFeedback
                                            onPress={() => this.onToggleVisit()}
                                        >
                                            <Icon
                                                color={'black'}
                                                name={
                                                    this.state.isVisitExpanded ? 
                                                    'menu-up' : 'menu-down'
                                                }
                                                type='material-community'
                                                size={30}
                                            />
                                        </TouchableWithoutFeedback>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                            <View onLayout={this.onLayoutVisit}>
                                {/* <View style={{ height: this.state.heightDim }}>
                                    <Campo 
                                        jogadores={jogadoresVisitFt}
                                        side={'visit'}
                                        tatics={'4-4-2'}
                                        doInOrOut={
                                            (jogador, inOrOut) => 
                                            checkConInfo(
                                                () => this.doInOrOut(jogador, inOrOut, jogo)
                                            )
                                        }
                                        enableTouch
                                    />
                                </View>
                                <View style={{ marginVertical: 20 }} />
                                { this.renderVisitJogadores(jogo) }
                                <View style={{ marginVertical: 20 }} /> */}

                                <EscalacaoPadrao side={'visit'} />
                                { this.renderVisitJogadores(jogo) }
                                <View style={{ marginVertical: 20 }} />
                            </View>
                        </Animated.View>
                    </Card>
                    { this.renderConfirmados(jogo) }
                    <View style={{ marginVertical: 60 }} />
                </ScrollView>
                <PlayersModal
                    showPlayersModal={this.props.showPlayersModal} 
                    doInOrOut={
                        (jogador, inOrOut, lastToast) => 
                        checkConInfo(() => this.doInOrOut(jogador, inOrOut, jogo, false, lastToast))
                    }
                    jogadoresCasaFt={jogadoresCasaFt}
                    jogadoresVisitFt={jogadoresVisitFt}
                />
                <Dialog
                    animationType={'fade'}
                    visible={this.props.endGameModal && Actions.currentScene === '_escalacaoTabG'}
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
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        flex: 1,
        padding: 5,
        margin: 0,
        marginHorizontal: 5,
        marginVertical: 15,
        borderRadius: 5,
        overflow: 'hidden'
    },
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

const mapStateToProps = (state) => ({
    showPlayersModal: state.GerenciarReducer.showPlayersModal,
    endGameModal: state.GerenciarReducer.endGameModal,
    missedPlayers: state.GerenciarReducer.missedPlayers,
    endGameModalPerc: state.GerenciarReducer.endGameModalPerc,
    itemSelected: state.GerenciarReducer.itemSelected,
    listJogos: state.JogosReducer.listJogos,
    listUsuarios: state.UsuariosReducer.listUsuarios
});

export default connect(mapStateToProps, {
    modificaShowPlayersModal,
    modificaMissedPlayers,
    modificaIsSubstitute,
    modificaJogador
})(EscalacaoG);
