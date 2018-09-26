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
    TouchableWithoutFeedback
} from 'react-native';
import firebase from 'firebase';
import _ from 'lodash';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Card, Divider, SearchBar, Avatar } from 'react-native-elements';
import LoadingBallAnim from '../animations/LoadingBallAnim';
import Versus from './Versus';
import imgCampoJogos from '../../imgs/campojogos.png';
import imgEstadio from '../../imgs/estadio.jpg';
import { 
    modificaListJogos, 
    modificaAnimatedHeigth,
    modificaFilterStr,
    modificaFilterLoad
} from '../../actions/JogosActions';
import { colorAppT } from '../../utils/constantes';

class Jogos extends React.Component {

    constructor(props) {
        super(props);

        this.startOrStopFBJogosListener = this.startOrStopFBJogosListener.bind(this);
        this.renderListItens = this.renderListItens.bind(this);
        this.onScrollView = this.onScrollView.bind(this);
        this.onScrollViewTools = this.onScrollViewTools.bind(this);
        this.onFilterJogos = this.onFilterJogos.bind(this);
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

        this.state = {
            maxOffSetScrollView: 0,
            scrollY: new Animated.Value(0),
            animTools: new Animated.Value(0)
        };
    }

    componentDidMount() {
        this.startOrStopFBJogosListener(true);
    }

    componentWillUnmount() {
        this.startOrStopFBJogosListener(false);
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    onKeyboardShow() {
        this.KeyboardIsOpened = true;
        this.props.modificaAnimatedHeigth(1);
    }
    
    onKeyboardHide() {
        this.KeyboardIsOpened = false;
        this.props.modificaAnimatedHeigth(false);
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
        return _.filter(jogos, (jogo) => (
                jogo.titulo.includes(filterStr) ||
                jogo.descricao.includes(filterStr) ||
                jogo.data.includes(filterStr) ||
                `${jogo.placarCasa}x${jogo.placarVisit}`.includes(filterStr)
        ));
    }

    startOrStopFBJogosListener(startOrStop) {
        const user = firebase.auth().currentUser;

        if (!user) {
            Actions.replace('login');
            return;
        }

        if (startOrStop) {
            const databaseRef = firebase.database().ref();
            this.dbJogosRef = databaseRef.child('jogos').on('value', (snapshot) => {
                this.props.modificaListJogos(
                    _.map(snapshot.val(), (value, key) => ({ key, ...value }))
                ); 
            });
            databaseRef.child('jogos').once('value', (snapshot) => {
                if (!this.props.listJogos.length) {
                    this.props.modificaListJogos(
                        _.map(snapshot.val(), (value, key) => ({ key, ...value }))
                    ); 
                }
            });
        } else {
            const databaseRef = firebase.database().ref();
            databaseRef.child('jogos').off('value', this.dbJogosRef);
        }
    }

    renderBasedFilterOrNot() {
        const { listJogos, filterStr } = this.props;
        let jogosView = null;
        if (listJogos) {
            if (filterStr) {
                jogosView = this.renderCardsJogos(
                    this.onFilterJogos(listJogos, filterStr)
                );
            } else {
                jogosView = this.renderCardsJogos(listJogos);
            }
        }
        return jogosView;
    }

    renderCardsJogos(jogos) {
        const jogosView = jogos.map((item, index) => {
            const titulo = item.titulo ? item.titulo : ' ';
            const data = item.data ? item.data : ' ';
            const imagem = item.imagem ? { uri: item.imagem } : imgEstadio;
            const descricao = item.descricao ? item.descricao : ' ';
            const placarCasa = item.placarCasa ? item.placarCasa : '0'; 
            const placarVisit = item.placarVisit ? item.placarVisit : '0';

            return (
                <View key={index}>
                    <TouchableOpacity
                        onPress={() => true}
                    >
                        <Card 
                            title={titulo} 
                            containerStyle={[styles.card, styles.shadowCard]}
                            image={imagem}
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
                        </Card>   
                    </TouchableOpacity>
                    <View style={{ marginBottom: 10 }} />
                </View>
            );
        });

        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return jogosView;
    }

    renderListItens() {
        return (
            <View>
                <Animated.ScrollView
                    ref={(ref) => { this.scrollViewRef = ref; }}
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
                >
                    <View style={{ marginTop: 60 }}>
                        { this.renderBasedFilterOrNot() }
                    </View>
                    <View style={{ marginBottom: 100 }} />
                </Animated.ScrollView>
            </View>
        );
    }

    render() {
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
                                height: 50,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 15,
                                backgroundColor: colorAppT
                            }}
                        >
                            <View style={{ flex: 0.5 }}>
                                <Avatar
                                    small
                                    rounded
                                    title={'GO'}
                                    source={{ uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg' }}
                                    onPress={() => Keyboard.dismiss()}
                                    activeOpacity={0.7}
                                /> 
                            </View>
                            <View style={{ flex: 2.5 }}>
                                <SearchBar 
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
        marginVertical: 15
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
    filterStr: state.JogosReducer.filterStr,
    filterLoad: state.JogosReducer.filterLoad
});

export default connect(mapStateToProps, {
    modificaListJogos,
    modificaAnimatedHeigth,
    modificaFilterStr,
    modificaFilterLoad
})(Jogos);
