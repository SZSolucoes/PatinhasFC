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
import { connect } from 'react-redux';
import _ from 'lodash';
import firebase from '../../../Firebase';
import { colorAppF } from '../../../utils/constantes';
import { retrieveImgSource } from '../../../utils/imageStorage';
import Campo from '../../campo/Campo';
import PlayersModal from './PlayersModal';
import { isPortrait } from '../../../utils/orientation';
import { 
    modificaShowPlayersModal,
    modificaIsSubstitute,
    modificaJogador
} from '../../../actions/GerenciarActions';

import imgHomeShirt from '../../../imgs/homeshirt.png';
import imgVisitShirt from '../../../imgs/visitshirt.png';
import imgAvatar from '../../../imgs/perfiluserimg.png';
import imgInOut from '../../../imgs/inout.png';

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
        this.onPressSubs = this.onPressSubs.bind(this);
        this.doInOrOut = this.doInOrOut.bind(this);
        this.renderCasaJogadores = this.renderCasaJogadores.bind(this);
        this.renderVisitJogadores = this.renderVisitJogadores.bind(this);
        this.renderIcons = this.renderIcons.bind(this);
        this.renderConfirmados = this.renderConfirmados.bind(this);

        this.state = {
            heightDim: Dimensions.get('screen').height / 2.5,
            animCasaValue: new Animated.Value(),
            animVisitValue: new Animated.Value(),
            isCasaExpanded: true,
            isVisitExpanded: true
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    shouldComponentUpdate(nextProps, nextStates) {
        if (nextProps.listJogos && nextProps.listJogos.length === 0) {
            return false;
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

    onPressSubs(jogador) {
        const newJogador = {
            key: jogador.key,
            nome: jogador.nome,
            posicao: jogador.posicao,
            posvalue: jogador.posvalue,
            imgAvatar: jogador.imgAvatar,
            side: jogador.side
        };

        this.props.modificaJogador(newJogador);
        this.props.modificaIsSubstitute(true);
        this.props.modificaShowPlayersModal(true);
        return;
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

    doInOrOut(jogador, inOrOut, jogo, newJogador = false) {
        if (newJogador) {
            const { side } = jogador;
            if (side === 'casa') {
                const newCasaList = _.filter(
                    jogo.escalacao.casa, (item) => (item.key !== jogador.key) || !!item.push
                );
                newCasaList.push(newJogador);
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    casa: newCasaList
                })
                .then(() => true)
                .catch(() => true);
            } else if (side === 'visit') {
                const newVisitList = _.filter(
                    jogo.escalacao.visit, (item) => (item.key !== jogador.key) || !!item.push
                );
                newVisitList.push(newJogador);
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList
                })
                .then(() => true)
                .catch(() => true);
            }
        } else if (inOrOut) {
            const { side } = jogador;
            if (side === 'casa') {
                const newCasaList = [...jogo.escalacao.casa, jogador];
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    casa: newCasaList
                })
                .then(() => true)
                .catch(() => true);
            } else if (side === 'visit') {
                const newVisitList = [...jogo.escalacao.visit, jogador];
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList
                })
                .then(() => true)
                .catch(() => true);
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
                .then(() => true)
                .catch(() => true);
            } else if (side === 'visit') {
                const newVisitList = _.filter(
                    jogo.escalacao.visit, (item) => (item.key !== jogador.key) || !!item.push
                );
                firebase.database().ref().child(`jogos/${jogo.key}/escalacao`).update({
                    visit: newVisitList
                })
                .then(() => true)
                .catch(() => true);
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
                        onPress={() => this.onPressSubs(item, jogo)}
                    >
                        <Image 
                            source={imgInOut}
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
                        onPress={() => {
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
                                        onPress: () => this.doInOrOut(item, false, jogo) 
                                    },
                                ]
                            );
                        }}
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
        const casaJogadores = _.filter(jogo.escalacao.casa, (item) => !item.push);
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
        const visitJogadores = _.filter(jogo.escalacao.visit, (item) => !item.push);
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
                            style={{ height: 40, width: 35, marginRight: 5 }}
                            resizeMode={'stretch'}
                            source={imgHomeShirt} 
                        /> 
                        <Text 
                            onPress={() => this.onToggleCasa()}
                            style={{ fontSize: 16, color: 'black' }}
                        >
                            Confirmados
                        </Text>
                    </View>
                </View>
                <List 
                    containerStyle={{ 
                        marginTop: 0, 
                        borderTopWidth: 1, 
                        borderBottomWidth: 1 
                    }}
                >
                    {
                        jogadoresConfirmados.map((item, index) => {
                            const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                            return (
                                <ListItem
                                    titleContainerStyle={{ marginLeft: 10 }}
                                    subtitleContainerStyle={{ marginLeft: 10 }}
                                    roundAvatar
                                    avatar={retrieveImgSource(imgAvt)}
                                    key={index}
                                    title={item.nome}
                                    rightIcon={(<View />)}
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
                                        Casa
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
                                <View style={{ height: this.state.heightDim }}>
                                    <Campo 
                                        enableTouch
                                        jogadores={jogadoresCasaFt} 
                                        side={'casa'}
                                        tatics={'4-4-2'}
                                        doInOrOut={
                                            (jogador, inOrOut) => 
                                            this.doInOrOut(jogador, inOrOut, jogo)
                                        }
                                    />
                                </View>
                                <View style={{ marginVertical: 20 }} />
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
                                        Visitantes
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
                                <View style={{ height: this.state.heightDim }}>
                                    <Campo 
                                        jogadores={jogadoresVisitFt}
                                        side={'visit'}
                                        tatics={'4-4-2'}
                                        doInOrOut={
                                            (jogador, inOrOut) => 
                                            this.doInOrOut(jogador, inOrOut, jogo)
                                        }
                                        enableTouch
                                    />
                                </View>
                                <View style={{ marginVertical: 20 }} />
                                { this.renderVisitJogadores(jogo) }
                                <View style={{ marginVertical: 20 }} />
                            </View>
                        </Animated.View>
                    </Card>
                    { this.renderConfirmados(jogo) }
                    <View style={{ marginVertical: 60 }} />
                </ScrollView>
                <PlayersModal 
                    doInOrOut={
                        (jogador, inOrOut, newJogador = false) => 
                        this.doInOrOut(jogador, inOrOut, jogo, newJogador)
                    }
                    jogadoresCasaFt={jogadoresCasaFt}
                    jogadoresVisitFt={jogadoresVisitFt}
                />
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
    itemSelected: state.GerenciarReducer.itemSelected,
    listJogos: state.JogosReducer.listJogos
});

export default connect(mapStateToProps, {
    modificaShowPlayersModal,
    modificaIsSubstitute,
    modificaJogador
})(EscalacaoG);