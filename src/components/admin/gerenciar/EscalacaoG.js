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
    Alert
} from 'react-native';
import { Card, Icon, List, ListItem } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import _ from 'lodash';
import * as Progress from 'react-native-progress';
import { Dialog } from 'react-native-simple-dialogs';
import firebase from '../../../Firebase';
import { colorAppF, colorAppP } from '../../../utils/constantes';
import { retrieveImgSource } from '../../../utils/imageStorage';
//import Campo from '../../campo/Campo';
import EscalacaoPadrao from '../../campo/EscalacaoPadrao';
import PlayersModal from './PlayersModal';
import { isPortrait } from '../../../utils/orientation';
import { getPosIndex, checkConInfo } from '../../../utils/jogosUtils';
import { 
    modificaShowPlayersModal,
    modificaIsSubstitute,
    modificaJogador
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
            isVisitExpanded: true
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
            posicao: newJogador.posicao,
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

    doInOrOut(jogador, inOrOut, jogo, showToast = false) {
        if (inOrOut) {
            const { side } = jogador;
            if (side === 'casa') {
                const newCasaList = [...jogo.escalacao.casa, jogador];
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    casa: newCasaList
                })
                .then(() =>
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Jogador escalado com sucesso.', Toast.SHORT)
                )
                .catch(() => 
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Falha ao escalar jogador. Verifique a conexão.', Toast.SHORT)
                );
            } else if (side === 'visit') {
                const newVisitList = [...jogo.escalacao.visit, jogador];
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList
                })
                .then(() =>
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Jogador escalado com sucesso.', Toast.SHORT)
                )
                .catch(() => 
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Falha ao escalar jogador. Verifique a conexão.', Toast.SHORT)
                );
            }
        } else {
            const { side } = jogador;
            if (side === 'casa') {
                const newCasaList = _.filter(
                    jogo.escalacao.casa, (item) => (item.key !== jogador.key) || !!item.push
                );
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    casa: newCasaList
                })
                .then(() =>
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Jogador escalado com sucesso.', Toast.SHORT)
                )
                .catch(() => 
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Falha ao escalar jogador. Verifique a conexão.', Toast.SHORT)
                );
            } else if (side === 'visit') {
                const newVisitList = _.filter(
                    jogo.escalacao.visit, (item) => (item.key !== jogador.key) || !!item.push
                );
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList
                })
                .then(() =>
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Jogador escalado com sucesso.', Toast.SHORT)
                )
                .catch(() => 
                    showToast &&
                    showToast === 'true' &&
                    Toast.show('Falha ao escalar jogador. Verifique a conexão.', Toast.SHORT)
                );
            }
        }
    }

    renderIcons(item, jogo) {
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
                                `Confirma a remoção do jogador:\n${item.nome} ?`,
                                [
                                    { text: 'Cancelar', 
                                        onPress: () => true, 
                                        style: 'cancel' 
                                    },
                                    { 
                                        text: 'Ok', 
                                        onPress: () => checkConInfo(
                                            () => this.doInOrOut(item, false, jogo)
                                        )
                                    },
                                ]
                            );
                        })}
                    >
                        <Icon
                            name='delete' 
                            type='material-community' 
                            size={30} color='red' 
                        />   
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
                                    this.renderIcons(item, jogo)
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
                                    this.renderIcons(item, jogo)
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
                            const escalacaoCasa = _.findIndex(
                                jogo.escalacao.casa, 
                                (jgCasa) => !jgCasa.push && jgCasa.key === item.key
                            ) !== -1; 

                            const escaladoVisit = _.findIndex(
                                jogo.escalacao.visit, 
                                (jgVisit) => !jgVisit.push && 
                                jgVisit.key === item.key
                            ) !== -1;

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
                                    rightIcon={
                                        escalacaoCasa || escaladoVisit
                                        ?
                                        (
                                            <View 
                                                style={{
                                                    flexDirection: 'row',  
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-end',
                                                    margin: 5
                                                }}
                                            >
                                                <Text style={{ color: 'red', fontWeight: '500' }}>
                                                    Escalado
                                                </Text>
                                            </View>
                                        )
                                        :
                                        (
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
                                                            height: 40, width: 35, marginRight: 5 
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
                                                            height: 40, width: 35, marginRight: 5 
                                                        }}
                                                        resizeMode={'stretch'}
                                                        source={imgVisitShirt} 
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )}
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
                                style={styles.titleContainer} 
                                onLayout={this.onLayoutTitleCasa}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
                                            this.state.isCasaExpanded ? 'menu-up' : 'menu-down'
                                        }
                                        type='material-community'
                                        size={30}
                                    />
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
                            <View style={styles.titleContainer} onLayout={this.onLayoutTitleVisit}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image 
                                        style={{ height: 40, width: 35, marginRight: 5 }}
                                        resizeMode={'stretch'}
                                        source={imgVisitShirt} 
                                    />
                                    <Text 
                                        onPress={() => this.onToggleVisit()}
                                        style={{ fontSize: 16, color: 'black' }}
                                    >
                                        { jogo.timeVisit ? jogo.timeVisit.trim() : 'Visitantes' }
                                    </Text>
                                </View>
                                <TouchableWithoutFeedback
                                    onPress={() => this.onToggleVisit()}
                                >
                                    <Icon
                                        color={'black'}
                                        name={this.state.isVisitExpanded ? 'menu-up' : 'menu-down'}
                                        type='material-community'
                                        size={30}
                                    />
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
                        (jogador, inOrOut) => 
                        checkConInfo(() => this.doInOrOut(jogador, inOrOut, jogo))
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
    endGameModalPerc: state.GerenciarReducer.endGameModalPerc,
    itemSelected: state.GerenciarReducer.itemSelected,
    listJogos: state.JogosReducer.listJogos,
    listUsuarios: state.UsuariosReducer.listUsuarios
});

export default connect(mapStateToProps, {
    modificaShowPlayersModal,
    modificaIsSubstitute,
    modificaJogador
})(EscalacaoG);
