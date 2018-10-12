import React from 'react';
import { 
    View,
    StyleSheet,
    ImageBackground,
    Platform,
    TouchableOpacity,
    Text,
    Animated,
    Keyboard,
    TouchableWithoutFeedback,
    FlatList,
    ActivityIndicator
} from 'react-native';
import _ from 'lodash';
import b64 from 'base-64';

import Toast from 'react-native-simple-toast';
import Moment from 'moment';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Card, Divider, SearchBar, Avatar } from 'react-native-elements';
import { startFbListener, stopFbListener } from '../../utils/firebaseListeners';
import LoadingBallAnim from '../animations/LoadingBallAnim';
import Versus from './Versus';
import imgCampoJogos from '../../imgs/campojogos.png';
import imgEstadio from '../../imgs/estadio.jpg';
import { 
    modificaListJogos, 
    modificaAnimatedHeigth,
    modificaFilterStr,
    modificaFilterLoad,
    modificaUserLogged,
    modificaLoadingFooter,
    modificaAddNewRows
} from '../../actions/JogosActions';
import { modificaJogoSelected } from '../../actions/JogoActions';
import firebase from '../../Firebase';
import { modificaListUsuarios } from '../../actions/UsuariosActions';
import { colorAppT } from '../../utils/constantes';
import { retrieveImgSource } from '../../utils/imageStorage';
import perfilUserImg from '../../imgs/perfiluserimg.png';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class Jogos extends React.Component {

    constructor(props) {
        super(props);

        this.startOrStopFBJogosListener = this.startOrStopFBJogosListener.bind(this);
        this.renderListItens = this.renderListItens.bind(this);
        this.renderCardFooter = this.renderCardFooter.bind(this);
        this.onPressConfirmP = this.onPressConfirmP.bind(this);
        this.onPressRemoveP = this.onPressRemoveP.bind(this);
        this.addNewRows = this.addNewRows.bind(this);
        this.flatListKeyExtractor = this.flatListKeyExtractor.bind(this);
        this.dataSourceControl = this.dataSourceControl.bind(this);
        this.onScrollView = this.onScrollView.bind(this);
        this.onScrollViewTools = this.onScrollViewTools.bind(this);
        this.onFilterJogos = this.onFilterJogos.bind(this);
        this.onPressCardGame = this.onPressCardGame.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderCardsJogos = this.renderCardsJogos.bind(this);
        this.onKeyboardShow = this.onKeyboardShow.bind(this);
        this.onKeyboardHide = this.onKeyboardHide.bind(this);
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onKeyboardShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onKeyboardHide);

        this.KeyboardIsOpened = false;
        this.scrollCurrentOffset = 0;
        this.scrollViewContentSize = 0;
        this.scrollViewHeight = 0;
        this.lastIndexListJogos = -1;
        this.fixedNumberRows = 30;

        this.state = {
            maxOffSetScrollView: 0,
            scrollY: new Animated.Value(0),
            animTools: new Animated.Value(0)
        };
    }

    componentDidMount() {
        this.startOrStopFBJogosListener(true);
        const dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');
        firebase
        .database()
        .ref()
        .child(`usuarios/${b64.encode(this.props.username)}`).update({
            dataHoraUltimoLogin: dataAtual
        })
        .then(() => true)
        .catch(() => true);
    }

    componentWillUnmount() {
        this.startOrStopFBJogosListener(false);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    onKeyboardShow() {
        this.KeyboardIsOpened = true;
    }
    
    onKeyboardHide() {
        this.KeyboardIsOpened = false;
    }

    onPressCardGame(item) {
        this.props.modificaJogoSelected(item.key);
        Actions.jogoTabBar({ onBack: () => Actions.replace('mainTabBar') });
    }

    onPressConfirmP(item, b64UserKey) {
        const { userLogged } = this.props;
        const newConfirmadosList = item.confirmados ? 
        [...item.confirmados] : [];
        const dataAtual = Moment().format('YYYY-MM-DD HH:mm:ss');

        newConfirmadosList.push({
            key: b64UserKey,
            imgAvatar: userLogged.imgAvatar,
            nome: userLogged.nome,
            horaConfirm: dataAtual
        });

        firebase.database().ref().child(`jogos/${item.key}`).update({
            confirmados: newConfirmadosList
        })
        .then(() => true)
        .catch(() => true);
    }

    onPressRemoveP(item, b64UserKey) {
        const indexFound = _.findIndex(
            item.confirmados, (usuario) => usuario.key === b64UserKey
        );
        let newConfirmadosList = [];

        if (newConfirmadosList !== -1) {
            newConfirmadosList = [...item.confirmados];
            newConfirmadosList.splice(indexFound, 1);
            firebase.database().ref().child(`jogos/${item.key}`).update({
                confirmados: newConfirmadosList
            })
            .then(() => true)
            .catch(() => true);
        }
    }

    onScrollView(currentOffset, direction) {
        if (!this.KeyboardIsOpened) {
            if (currentOffset <= 0 || direction === 'up') {
                this.props.modificaAnimatedHeigth(false);
            } else if (direction === 'down') {
                this.props.modificaAnimatedHeigth(true);
            } else {
                this.props.modificaAnimatedHeigth(false);
            }
        }
        //this.onScrollViewTools(currentOffset, direction);
    }

    onScrollViewTools(currentOffset, direction) {
        if (currentOffset <= 0 || direction === 'up') {
            Animated.timing(
                this.state.animTools, 
                {
                    toValue: 0,
                    useNativeDriver: true,
                    duration: 200
                }
            ).start();
        } else if (direction === 'down') {
            Animated.timing(
                this.state.animTools, 
                {
                    toValue: 1,
                    useNativeDriver: true,
                    duration: 200
                }
            ).start();
        } else {
            Animated.timing(
                this.state.animTools, 
                {
                    toValue: 0,
                    useNativeDriver: true,
                    duration: 200
                }
            ).start();
        }
    }

    onFilterJogos(jogos, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(jogos, (jogo) => (
                (jogo.titulo && jogo.titulo.toLowerCase().includes(lowerFilter)) ||
                (jogo.descricao && jogo.descricao.toLowerCase().includes(lowerFilter)) ||
                (jogo.data && jogo.data.toLowerCase().includes(lowerFilter)) ||
                `${jogo.placarCasa}x${jogo.placarVisit}`.includes(lowerFilter)
        ));
    }

    addNewRows(numberAdd) {
        this.props.modificaAddNewRows(numberAdd);
        this.props.modificaLoadingFooter(false);
    }

    dataSourceControl(jogos, filterStr) {
        let newJogos = _.reverse([...jogos]);
        newJogos = newJogos.slice(0, this.props.maxRows);
        return this.renderBasedFilterOrNot(newJogos, filterStr);
    }

    flatListKeyExtractor(item, index) {
        return index.toString();
    }

    startOrStopFBJogosListener(startOrStop) {
        const { username } = this.props;
        const user = firebase.auth().currentUser;

        if (!user) {
            Actions.replace('login');
            return;
        }

        if (startOrStop) {
            startFbListener('jogos');
            startFbListener('infos');
            startFbListener('usuarios');
            startFbListener('usuario', { email: username });
        } else {
            stopFbListener('jogos');
            stopFbListener('infos');
            stopFbListener('usuarios');
            stopFbListener('usuario');
        }
    }

    renderBasedFilterOrNot(jogos, filterStr) {
        let newJogos = jogos;
        if (jogos) {
            if (filterStr) {
                newJogos = this.onFilterJogos(jogos, filterStr);
            }
            this.lastIndexListJogos = newJogos.length - 1;
        }

        return newJogos;
    }

    renderCardFooter(item) {
        if (item.status && item.status === '3') {
            const b64UserKey = b64.encode(this.props.userLogged.email);
            return (
                <View>
                    <Divider
                        style={{
                            marginTop: 5,
                            marginBottom: 5,
                            height: 2
                        }}
                    />
                    {
                        _.findIndex(
                            item.confirmados, 
                            (usuario) => usuario.key && usuario.key === b64UserKey) !== -1 ?
                            (
                                <TouchableOpacity
                                    onPress={() => this.onPressRemoveP(item, b64UserKey)}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 5,
                                            backgroundColor: 'red',
                                            padding: 5,
                                            marginTop: 5
                                        }}
                                    >
                                        <Text
                                            style={{ 
                                                color: 'white',
                                                fontSize: 18, 
                                                fontWeight: '500' 
                                            }}
                                        >
                                            Retirar presença !
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )
                            :
                            (
                                <TouchableOpacity
                                    onPress={() => this.onPressConfirmP(item, b64UserKey)}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            borderRadius: 5,
                                            backgroundColor: 'green',
                                            padding: 5,
                                            marginTop: 5
                                        }}
                                    >
                                        <Text
                                            style={{ 
                                                color: 'white', 
                                                fontSize: 18, 
                                                fontWeight: '500' 
                                            }}
                                        >
                                            Confirmar presença !
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )
                    }
                </View>
            );
        }

        return false;
    }

    renderCardsJogos({ item, index }) {
        const titulo = item.titulo ? item.titulo : ' ';
        const data = item.data ? item.data : ' ';
        const imagem = item.imagem ? { uri: item.imagem } : imgEstadio;
        const descricao = item.descricao ? item.descricao : ' ';
        const placarCasa = item.placarCasa ? item.placarCasa : '0'; 
        const placarVisit = item.placarVisit ? item.placarVisit : '0';

        if (this.lastIndexListJogos === index) {
            setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        }

        return (
            <View>
                <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={() => {
                        if (this.props.conInfo.type === 'none' ||
                            this.props.conInfo.type === 'unknown'
                        ) {
                            Toast.show('Sem conexão.', Toast.SHORT);
                            return false;
                        }

                        return this.onPressCardGame(item);
                    }}
                >
                    <Card 
                        title={titulo} 
                        containerStyle={[styles.card, styles.shadowCard]}
                        image={retrieveImgSource(imagem)}
                        featuredSubtitle={descricao}
                    >
                        <Text style={styles.textData}>
                            {data}
                        </Text>
                        <Divider
                            style={{
                                marginTop: 5,
                                marginBottom: 5,
                                height: 2
                            }}
                        />
                        <Versus
                            placarCasa={placarCasa} 
                            placarVisit={placarVisit}  
                        />
                        { this.renderCardFooter(item) }  
                    </Card>   
                </TouchableOpacity>
                <View style={{ marginBottom: 10 }} />
            </View>
        );
    }

    renderListItens() {
        return (
            <View>
                <AnimatedFlatList
                    ref={(ref) => { this.scrollViewRef = ref; }}
                    data={this.dataSourceControl(this.props.listJogos, this.props.filterStr)}
                    renderItem={this.renderCardsJogos}
                    keyExtractor={this.flatListKeyExtractor}
                    onEndReachedThreshold={0.01}
                    onEndReached={() => {
                        let rowsToShow = (this.lastIndexListJogos + 1) + this.fixedNumberRows;
                        const jogosLength = this.props.listJogos.length;
                        if (rowsToShow > jogosLength) {
                            rowsToShow = jogosLength;
                        }

                        if (rowsToShow !== this.props.maxRows) {
                            if (rowsToShow !== (this.lastIndexListJogos + 1)) {
                                this.props.modificaLoadingFooter(true);
                            }
                            _.debounce(this.addNewRows, 2000)(rowsToShow);
                        } else {
                            this.props.modificaLoadingFooter(false);
                        }
                    }}
                    onContentSizeChange={(w, h) => { 
                        this.scrollViewContentSize = h;
                        const newOffSet = h - this.scrollViewHeight;
                        this.setState({ maxOffSetScrollView: newOffSet });
                    }}
                    onLayout={ev => { 
                        this.scrollViewHeight = ev.nativeEvent.layout.height;
                        const newOffSet = this.scrollViewContentSize - ev.nativeEvent.layout.height;
                        this.setState({ maxOffSetScrollView: newOffSet });
                    }}
                    onScroll={
                        Animated.event(
                            [{
                                nativeEvent: { contentOffset: { y: this.state.scrollY } }
                            }],
                            {
                                useNativeDriver: true,
                                listener: (event) => {
                                    const currentOffset = event.nativeEvent.contentOffset.y;
                                    const direction = currentOffset > 
                                                    this.scrollCurrentOffset ? 'down' : 'up';
                                    this.scrollCurrentOffset = currentOffset;
                                    this.onScrollView(currentOffset, direction);
                                }
                            }
                        )
                    }
                    ListHeaderComponent={(<View style={{ marginTop: 60 }} />)}
                    ListFooterComponent={(
                            <View style={{ marginBottom: 50 }} >
                            {
                                this.props.loadingFooter &&
                                <ActivityIndicator size={'large'} color={'white'} />
                            }
                            </View> 
                    )}
                />
            </View>
        );
    }

    render() {
        const { userLogged } = this.props;
        const userImg = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : perfilUserImg;
        return (
            <View style={styles.viewPrinc}>
                <ImageBackground
                    source={imgCampoJogos}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain'
                    }}
                >
                    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                        <Animated.View 
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                right: 0,
                                zIndex: 1,
                                paddingHorizontal: 15,
                                backgroundColor: colorAppT
                            }}
                        >
                            {
                                Platform.OS === 'ios' &&
                                <View 
                                    style={{ 
                                        height: getStatusBarHeight(true), 
                                        backgroundColor: colorAppT 
                                    }} 
                                />
                            }
                            <View 
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}
                            >
                                <View style={{ flex: 0.5 }}>
                                    <Avatar
                                        small
                                        rounded
                                        title={'GO'}
                                        source={retrieveImgSource(userImg)}
                                        onPress={() => Keyboard.dismiss()}
                                        activeOpacity={0.7}
                                    /> 
                                </View>
                                <View style={{ flex: 2.5 }}>
                                    <SearchBar
                                        autoCapitalize={'none'}
                                        autoCorrect={false}
                                        onFocus={() => this.props.modificaAnimatedHeigth(1)}
                                        onBlur={() => this.props.modificaAnimatedHeigth(false)}
                                        clearIcon={!!this.props.filterStr}
                                        showLoadingIcon={this.props.filterLoad}
                                        containerStyle={{ 
                                            backgroundColor: 'transparent',
                                            borderTopWidth: 0, 
                                            borderBottomWidth: 0
                                        }}
                                        searchIcon={{ size: 24 }}
                                        value={this.props.filterStr}
                                        onChangeText={(value) => {
                                            this.props.modificaFilterStr(value);
                                            this.props.modificaFilterLoad(true);
                                        }}
                                        onClear={() => this.props.modificaFilterStr('')}
                                        placeholder='Buscar jogo...'
                                    />
                                </View>
                                <View style={{ flex: 0.5 }} />
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                    { 
                        this.props.listJogos.length ?
                        (this.renderListItens())
                        :
                        (<LoadingBallAnim />)
                    }
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: 'white'
    },
    card: {
        padding: 0,
        margin: 0,
        marginHorizontal: 10,
        marginVertical: 15,
        borderRadius: 3
    },
    shadowCard: {
        ...Platform.select({
            ios: {
                elevation: 2
            },
            android: {
                elevation: 2
            }
        })
    },
    textData: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    },
    viewTopTools: {
        position: 'relative'
    }
});

const mapStateToProps = (state) => ({
    username: state.LoginReducer.username,
    password: state.LoginReducer.password,
    listJogos: state.JogosReducer.listJogos,
    listUsuarios: state.UsuariosReducer.listUsuarios,
    filterStr: state.JogosReducer.filterStr,
    loadingFooter: state.JogosReducer.loadingFooter,
    maxRows: state.JogosReducer.maxRows,
    filterLoad: state.JogosReducer.filterLoad,
    userLogged: state.LoginReducer.userLogged,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaListJogos,
    modificaAnimatedHeigth,
    modificaFilterStr,
    modificaFilterLoad,
    modificaListUsuarios,
    modificaUserLogged,
    modificaLoadingFooter,
    modificaAddNewRows,
    modificaJogoSelected
})(Jogos);
