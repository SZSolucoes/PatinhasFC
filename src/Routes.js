import React from 'react';
import { Router, Scene, Actions } from 'react-native-router-flux';
import { 
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    Animated,
    Dimensions,
    Keyboard,
    BackHandler,
    Platform,
    Image,
    TouchableOpacity,
    Alert,
    StatusBar
} from 'react-native';
import { Icon, normalize } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';

import { isPortrait, isLandscape } from './utils/orientation';
import AlertScl from './components/tools/AlertScl';
import Login from './components/login/Login';
import Jogos from './components/jogos/Jogos';
import Jogo from './components/core/jogo/Jogo';
import JogoG from './components/admin/gerenciar/JogoG';
import JogoP from './components/profile/historico/JogoP';
import Escalacao from './components/core/escalacao/Escalacao';
import EscalacaoG from './components/admin/gerenciar/EscalacaoG';
import EscalacaoP from './components/profile/historico/EscalacaoP';
import EscalacaoH from './components/admin/historico/EscalacaoH';
import Informativos from './components/informativos/Informativos';
import Profile from './components/profile/Profile';
import Notifications from './components/profile/Notifications';
import EditPerfil from './components/profile/EditPerfil';
import Preferencias from './components/profile/Preferencias';
import PainelAdmin from './components/profile/PainelAdmin';
import Admin from './components/admin/Admin';
import CadastroJogos from './components/admin/cadastrojogos/CadastroJogos';
import Usuarios from './components/admin/usuarios/Usuarios';
import Analise from './components/admin/analise/Analise';
import FinanceiroEditar from './components/admin/analise/financeiro/FinanceiroEditar';
import FinanceiroCadastrar from './components/admin/analise/financeiro/FinanceiroCadastrar';
import Info from './components/admin/informativos/Info';
import Gerenciar from './components/admin/gerenciar/Gerenciar';
import Historico from './components/admin/historico/Historico';
import HistoricoP from './components/profile/historico/HistoricoP';
import ProfileEnquetes from './components/profile/enquetes/ProfileEnquetes';
import ProfileEnquetesHistorico from './components/profile/enquetes/ProfileEnquetesHistorico';
import ProfileFinanceiro from './components/profile/ProfileFinanceiro';
import JogoH from './components/admin/historico/JogoH';
import AnaliseJogadores from './components/admin/analise/jogadores/AnaliseJogadores';
import EnqueteCadastrar from './components/admin/enquetes/EnqueteCadastrar';
import EnqueteEditar from './components/admin/enquetes/EnqueteEditar';
import Imagens from './components/imagens/Imagens';
import { colorAppS } from './utils/constantes';

import { store } from './App';
import firebase from './Firebase';
import SplashScreenAnim from './components/animations/SplashScreenAnim';
import AnimScene from './components/tools/AnimatedScene';
import { doEndGame, checkConInfo } from './utils/jogosUtils';
import { mappedKeyStorage } from './utils/store';

import imgFinishFlag from './imgs/finishflag.png';
import Ausentes from './components/core/ausentes/Ausentes';

const AnimatedScene = Animated.createAnimatedComponent(AnimScene);

class Routes extends React.Component {

    constructor(props) {
        super(props);

        this.animHeigth = new Animated.Value(0);

        this.onBackAndroidHdl = this.onBackAndroidHdl.bind(this);
        this.renderRouter = this.renderRouter.bind(this);
        this.doTabAnimation = this.doTabAnimation.bind(this);
        this.renderAdminTab = this.renderAdminTab.bind(this);
        this.onChangeDimension = this.onChangeDimension.bind(this);
        this.rightButtonGerenciarTab = this.rightButtonGerenciarTab.bind(this);
        this.rightButtonImagens = this.rightButtonImagens.bind(this);

        this.state = {
            logged: false,
            loading: true,
            timingNotEnd: true
        };
    }

    componentDidMount() {
        setTimeout(() => this.setState({ timingNotEnd: false }), 6000);

        AsyncStorage.getItem(mappedKeyStorage('loginAutomaticoEnabled'))
        .then((loginAutomaticoEnabled) => {
            if (loginAutomaticoEnabled && loginAutomaticoEnabled === 'yes') {
                AsyncStorage.getItem(mappedKeyStorage('username'))
                .then((userName) => {
                    if (userName) {
                        AsyncStorage.getItem(mappedKeyStorage('password'))
                        .then((password) => {
                            if (password) {
                                store.dispatch({
                                    type: 'modifica_username_login',
                                    payload: userName
                                });
                                store.dispatch({
                                    type: 'modifica_password_login',
                                    payload: password
                                });

                                const authRef = firebase.auth();
    
                                authRef.signInWithEmailAndPassword(userName, password)
                                .then(() => this.setState({
                                    logged: true,
                                    loading: false,
                                }))
                                .catch(() => this.setState({
                                    loading: false,
                                }));
                            } else {
                                this.setState({
                                    loading: false,
                                });
                            }
                        });
                    } else {
                        this.setState({
                            loading: false,
                        });
                    }
                });
            } else {
                this.setState({
                    loading: false,
                });
            }
        })
        .catch(() => {
            this.setState({
                loading: false,
            });
        });

        BackHandler.addEventListener('hardwareBackPress', () => {
            Keyboard.dismiss();
            store.dispatch({
                type: 'modifica_startupordownanim_info',
                payload: 'down'
            });
            store.dispatch({
                type: 'modifica_showimageview_info',
                payload: false
            });
            store.dispatch({
                type: 'modifica_showimageview_imagens',
                payload: false
            });

            const asyncFunExec = async () => {
                store.dispatch({
                    type: 'modifica_startupordownanim_info',
                    payload: 'down'
                });
                store.dispatch({
                    type: 'modifica_showsharemodal_info',
                    payload: false
                });
                store.dispatch({
                    type: 'modifica_showimageview_info',
                    payload: false
                });
                store.dispatch({
                    type: 'modifica_showimageview_imagens',
                    payload: false
                });
            };

            asyncFunExec();

            if ('|mainTabBar|_jogos|_informativos|_perfil|_admin|'.includes(Actions.currentScene)) {
                return true;
            }

            if (!('_'.includes(Actions.currentScene[0]))) {
                Actions.pop();
                return true;
            }
    
            if (
                Actions.currentScene.includes('jogo') || 
                Actions.currentScene.includes('escalacao') ||
                Actions.currentScene.includes('ausentes')
            ) {
                if ('|_jogoTab|_escalacaoTab|_ausentesTab|'.includes(Actions.currentScene)) {
                    Actions.popTo('_jogos');
                    return true;
                }
                if ('|_jogoTabG|_escalacaoTabG|_ausentesTabG|'.includes(Actions.currentScene)) {
                    Actions.popTo('gerenciar');
                    return true;
                }
                if ('|_jogoTabH|_escalacaoTabH|_ausentesTabH|'.includes(Actions.currentScene)) {
                    Actions.popTo('historico');
                    return true;
                }
                if ('|_jogoTabP|_escalacaoTabP|_ausentesTabP|'.includes(Actions.currentScene)) {
                    Actions.popTo('profileHistorico');
                    return true;
                }
            }

            if ('|_financeiroCadastrar|_financeiroEditar|'.includes(Actions.currentScene)) {
                Actions.popTo('analise');
                return true;
            }

            if ('|_enqueteCadastrar|_enqueteEditar|'.includes(
                Actions.currentScene)
                ) {
                Actions.popTo('_admin');
                return true;
            }
            
            return true;
        });
        Dimensions.addEventListener('change', this.onChangeDimension);
    }

    shouldComponentUpdate(nextProps, nextStates) {
        if (nextProps.animatedHeigth !== this.props.animatedHeigth) {
            this.doTabAnimation(nextProps.animatedHeigth);
            return false;
        }
        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangeDimension);
    }

    onBackAndroidHdl() {
        Keyboard.dismiss();
        store.dispatch({
            type: 'modifica_startupordownanim_info',
            payload: 'down'
        });
        store.dispatch({
            type: 'modifica_showimageview_info',
            payload: false
        });
        store.dispatch({
            type: 'modifica_showimageview_imagens',
            payload: false
        });

        const asyncFunExec = async () => {
            store.dispatch({
                type: 'modifica_startupordownanim_info',
                payload: 'down'
            });
            store.dispatch({
                type: 'modifica_showsharemodal_info',
                payload: false
            });
            store.dispatch({
                type: 'modifica_showimageview_info',
                payload: false
            });
            store.dispatch({
                type: 'modifica_showimageview_imagens',
                payload: false
            });
        };

        asyncFunExec();

        if ('|mainTabBar|_jogos|_informativos|_perfil|_admin|'.includes(Actions.currentScene)) {
            return true;
        }

        if (!('_'.includes(Actions.currentScene[0]))) {
            Actions.pop();
            return true;
        }

        if (
            Actions.currentScene.includes('jogo') || 
            Actions.currentScene.includes('escalacao') ||
            Actions.currentScene.includes('ausentes')
        ) {
            if ('|_jogoTab|_escalacaoTab|_ausentesTab|'.includes(Actions.currentScene)) {
                Actions.popTo('_jogos');
                return true;
            }
            if ('|_jogoTabG|_escalacaoTabG|_ausentesTabG|'.includes(Actions.currentScene)) {
                Actions.popTo('gerenciar');
                return true;
            }
            if ('|_jogoTabH|_escalacaoTabH|_ausentesTabH|'.includes(Actions.currentScene)) {
                Actions.popTo('historico');
                return true;
            }
            if ('|_jogoTabP|_escalacaoTabP|_ausentesTabP|'.includes(Actions.currentScene)) {
                Actions.popTo('profileHistorico');
                return true;
            }
        }

        if ('|_financeiroCadastrar|_financeiroEditar|'.includes(Actions.currentScene)) {
            Actions.popTo('analise');
            return true;
        }

        if ('|_enqueteCadastrar|_enqueteEditar|'.includes(
            Actions.currentScene)
            ) {
            Actions.popTo('_admin');
            return true;
        }

        return true;
    }

    onChangeDimension() {
        if (isLandscape()) {
            const toValue = Dimensions.get('screen').height;
            
            if (!this.state.timingNotEnd) {
                StatusBar.setHidden(true);
            }
            
            Animated.timing(
                this.animHeigth, 
                {
                    toValue,
                    useNativeDriver: true,
                    delay: 200
                }
            ).start();
        } else {
            const isComentUp = store.getState().InfoReducer.startUpOrDownAnim === 'up';
            if (!this.state.timingNotEnd) {
                StatusBar.setHidden(false);
            }

            if (!isComentUp) {
                this.doTabAnimation(false);
            }
        }
    }

    doTabAnimation(animatedHeigth) {
        if (isPortrait()) {
            if (animatedHeigth === 1) {
                Animated.timing(
                    this.animHeigth, 
                    {
                        toValue: 100,
                        useNativeDriver: true,
                        delay: 200
                    }
                ).start();
            } else {
                const toValue = animatedHeigth ? Dimensions.get('screen').height : 0;
                Animated.spring(
                    this.animHeigth, 
                    {
                        toValue,
                        useNativeDriver: true,
                        bounciness: 2
                    }
                ).start();
            }
        }  
    }

    rightButtonGerenciarTab() {
        return (
            <View 
                style={{
                    flexDirection: 'row',
                    marginHorizontal: 5,
                    paddingHorizontal: 10,
                    justifyContent: 'space-between'
                }}
            >
                <TouchableOpacity
                    onPress={() => {
                        const { listJogos } = store.getState().JogosReducer;
                        const { itemSelected } = store.getState().GerenciarReducer;
                        const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];
                        if (jogo.status === '1') {
                            Alert.alert(
                                'Aviso',
                                'Para alterar o tempo de jogo manualmente' +
                                ' é necessário que o jogo esteja pausado.'
                            );
                            return;
                        }
                        store.dispatch({
                            type: 'modifica_showtimermodal_jogo',
                            payload: true
                        });
                    }}
                >
                    <Icon
                        iconStyle={{ marginHorizontal: 5 }}
                        color={'white'}
                        name='timer'
                        type='material-community'
                        size={26}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => checkConInfo(() => {
                        const { listJogos } = store.getState().JogosReducer;
                        const { itemSelected, missedPlayers } = store.getState().GerenciarReducer;
                        const jogo = _.filter(listJogos, (item) => item.key === itemSelected)[0];
                        if (jogo.status === '1') {
                            Alert.alert(
                                'Aviso',
                                'Para finalizar o jogo' +
                                ' é necessário que o jogo não esteja em andamento.'
                            );
                            return;
                        }
                        Alert.alert(
                            'Atenção',
                            'Ao finalizar o jogo, o mesmo estará disponível' +
                            ' apenas em histórico. Deseja continuar ?',
                            [
                                { text: 'Cancelar', 
                                    onPress: () => true, 
                                    style: 'cancel' 
                                },
                                { 
                                    text: 'Ok', 
                                    onPress: () => checkConInfo(
                                        () => doEndGame(
                                            jogo, firebase, Actions, missedPlayers
                                        ), [], 500
                                    )
                                }
                            ]
                        );
                    })}
                >
                    <Image
                        source={imgFinishFlag}
                        style={{ 
                            width: 20, 
                            height: 25, 
                            tintColor: 'white',
                            marginHorizontal: 5
                        }}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    rightButtonImagens() {
        return (
            <View 
                style={{
                    flexDirection: 'row',
                    marginHorizontal: 5,
                    paddingHorizontal: 10,
                    justifyContent: 'space-between'
                }}
            >
                <TouchableOpacity
                    onPress={() => {
                        const { jogoSelected } = store.getState().ImagensReducer;
                        Actions.imagens({ jogo: jogoSelected });
                    }}
                >
                    <Icon
                        iconStyle={{ marginHorizontal: 5 }}
                        color={'white'}
                        name='folder-image'
                        type='material-community'
                        size={26}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    renderAdminTab() {
        const { userLevel } = this.props;
        if (userLevel && (userLevel === '0' || userLevel === '255')) {
            return (
                <AnimatedScene 
                    key='mainTabBar' 
                    tabs 
                    hideNavBar
                    initial={this.state.logged}
                    showLabel={false}
                    tabBarStyle={
                        [styles.mainTabBar, 
                        { transform: [{ translateY: this.animHeigth }] }]
                    }
                    lazy={false}
                >
                    <Scene 
                        key='jogos' 
                        component={Jogos} 
                        hideNavBar
                        onEnter={() => this.doTabAnimation(false)}
                        icon={({ focused }) => (
                            <View>
                                <Icon
                                    color={focused ? 'white' : 'black'}
                                    name='soccer'
                                    type='material-community'
                                />
                                { focused && 
                                <Text
                                    style={{
                                        color: focused ? 'white' : 'black',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Jogos
                                </Text>}
                            </View>
                        )} 
                    />
                    <Scene 
                        key='informativos' 
                        component={Informativos} 
                        hideNavBar
                        onEnter={() => this.doTabAnimation(false)}
                        icon={({ focused }) => (
                            <View>
                                <Icon
                                    color={focused ? 'white' : 'black'}
                                    name='clipboard'
                                    type='font-awesome'
                                    size={22}
                                />
                                { focused && 
                                <Text
                                    style={{
                                        color: focused ? 'white' : 'black',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Info
                                </Text>}
                            </View>
                        )} 
                    /> 
                    <Scene 
                        key='perfil' 
                        component={Profile} 
                        hideNavBar
                        onEnter={() => this.doTabAnimation(false)}
                        icon={({ focused }) => (
                            <View>
                                <Icon
                                    color={focused ? 'white' : 'black'}
                                    name='user'
                                    type='font-awesome'
                                />
                                { focused && 
                                <Text
                                    style={{
                                        color: focused ? 'white' : 'black',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Perfil
                                </Text>}
                            </View>
                        )} 
                    /> 
                    <Scene 
                        key='admin'
                        component={Admin} 
                        hideNavBar
                        onEnter={() => this.doTabAnimation(false)}
                        icon={({ focused }) => (
                            <View>
                                <Icon
                                    color={focused ? 'white' : 'black'}
                                    name='lock'
                                    type='font-awesome'
                                />
                                { focused && 
                                <Text
                                    style={{
                                        color: focused ? 'white' : 'black',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Admin
                                </Text>}
                            </View>
                        )} 
                    />
                </AnimatedScene>
            );
        }

        return (
            <AnimatedScene 
                key='mainTabBar' 
                tabs 
                hideNavBar
                initial={this.state.logged}
                showLabel={false}
                tabBarStyle={
                    [styles.mainTabBar, 
                    { transform: [{ translateY: this.animHeigth }] }]
                }
                lazy={false}
            >
                <Scene 
                    key='jogos' 
                    component={Jogos} 
                    hideNavBar
                    onEnter={() => this.doTabAnimation(false)}
                    icon={({ focused }) => (
                        <View>
                            <Icon
                                color={focused ? 'white' : 'black'}
                                name='soccer'
                                type='material-community'
                            />
                            { focused && 
                            <Text
                                style={{
                                    color: focused ? 'white' : 'black',
                                    fontWeight: 'bold'
                                }}
                            >
                                Jogos
                            </Text>}
                        </View>
                    )} 
                />
                <Scene 
                    key='informativos' 
                    component={Informativos} 
                    hideNavBar
                    onEnter={() => this.doTabAnimation(false)}
                    icon={({ focused }) => (
                        <View>
                            <Icon
                                color={focused ? 'white' : 'black'}
                                name='clipboard'
                                type='font-awesome'
                                size={22}
                            />
                            { focused && 
                            <Text
                                style={{
                                    color: focused ? 'white' : 'black',
                                    fontWeight: 'bold'
                                }}
                            >
                                Info
                            </Text>}
                        </View>
                    )} 
                /> 
                <Scene 
                    key='perfil' 
                    component={Profile} 
                    hideNavBar
                    onEnter={() => this.doTabAnimation(false)}
                    icon={({ focused }) => (
                        <View>
                            <Icon
                                color={focused ? 'white' : 'black'}
                                name='user'
                                type='font-awesome'
                            />
                            { focused && 
                            <Text
                                style={{
                                    color: focused ? 'white' : 'black',
                                    fontWeight: 'bold'
                                }}
                            >
                                Perfil
                            </Text>}
                        </View>
                    )} 
                />
            </AnimatedScene>
        );
    }

    renderRouter() {
        return (
            <Router backAndroidHandler={this.onBackAndroidHdl}>
                <Scene 
                    key='root'
                    navigationBarStyle={styles.header}
                >
                    <Scene 
                        key='login' 
                        component={Login}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft} 
                        initial={!this.state.logged}
                        hideNavBar
                    />
                    {/*   Activity Principal de Tabs   */}
                    
                    { this.renderAdminTab() } 
                    
                    {/* ####################################### */}
                    <Scene 
                        key={'cadastroJogos'}
                        title={'Jogos'} 
                        component={CadastroJogos}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'usuarios'}
                        title={'Usuários'} 
                        component={Usuarios}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'analise'}
                        title={'Análise'} 
                        component={Analise}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'analisejogadores'}
                        title={'Jogadores'} 
                        component={AnaliseJogadores}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'cadastroInfos'}
                        title={'Informativos'} 
                        component={Info}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'gerenciar'}
                        title={'Gerenciar Jogos'} 
                        component={Gerenciar}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'historico'}
                        title={'Histórico de Jogos'} 
                        component={Historico}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'profileNotifiations'}
                        title={'Notificações'} 
                        component={Notifications}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'profileEditPerfil'}
                        title={'Editar Perfil'} 
                        component={EditPerfil}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'profileHistorico'}
                        title={'Histórico de Jogos'} 
                        component={HistoricoP}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'profilePreferencias'}
                        title={'Preferências'}
                        component={Preferencias}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'profilePainelAdmin'}
                        title={'Painel Administrativo'}
                        component={PainelAdmin}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'profileEnquetes'}
                        title={'Enquetes'}
                        component={ProfileEnquetes}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'profileEnquetesHistorico'}
                        title={'Histórico de Enquetes'}
                        component={ProfileEnquetesHistorico}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'profileFinanceiro'}
                        title={'Financeiro'}
                        component={ProfileFinanceiro}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'imagens'}
                        title={'Imagens'}
                        component={Imagens}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
                    <Scene 
                        key={'jogoTabBar'}
                        tabs
                        showLabel
                        tabBarPosition={'top'}
                        lazy={false}
                        swipeEnabled
                        title={'Jogo'} 
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        tabBarStyle={{ backgroundColor: colorAppS }}
                        labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
                        renderRightButton={() => this.rightButtonImagens()}
                    >
                        <Scene 
                            key={'jogoTab'}
                            hideNavBar 
                            component={Jogo}
                            initial
                            tabBarLabel={'Jogo'}
                            activeTintColor={'white'} 
                        />
                        <Scene 
                            key={'escalacaoTab'}
                            hideNavBar 
                            component={Escalacao}
                            tabBarLabel={'Escalação'}
                            activeTintColor={'white'} 
                        />
                        <Scene 
                            key={'ausentesTab'}
                            hideNavBar 
                            component={Ausentes}
                            tabBarLabel={'Ausentes'}
                            activeTintColor={'white'} 
                        />
                    </Scene>
                    <Scene 
                        key={'gerenciarJogoTab'}
                        tabs
                        showLabel
                        tabBarPosition={'top'}
                        lazy={false}
                        swipeEnabled
                        title={'Gerenciar Jogo'} 
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        tabBarStyle={{ backgroundColor: colorAppS }}
                        labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
                        renderRightButton={() => this.rightButtonGerenciarTab()}
                    >
                        <Scene 
                            key={'jogoTabG'}
                            hideNavBar 
                            component={JogoG}
                            initial
                            tabBarLabel={'Jogo'}
                            activeTintColor={'white'}
                        />
                        <Scene 
                            key={'escalacaoTabG'}
                            hideNavBar 
                            component={EscalacaoG}
                            tabBarLabel={'Escalação'}
                            activeTintColor={'white'}
                        />
                        <Scene 
                            key={'ausentesTabG'}
                            hideNavBar 
                            component={Ausentes}
                            tabBarLabel={'Ausentes'}
                            activeTintColor={'white'}
                        />
                    </Scene>
                    { /* HISTORICO E TABS */}
                    <Scene 
                        key={'historicoJogoTab'}
                        tabs
                        showLabel
                        tabBarPosition={'top'}
                        lazy={false}
                        swipeEnabled
                        title={'Histórico de Jogo'} 
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        tabBarStyle={{ backgroundColor: colorAppS }}
                        labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
                        renderRightButton={() => this.rightButtonImagens()}
                    >
                        <Scene 
                            key={'jogoTabH'}
                            hideNavBar 
                            component={JogoH}
                            initial
                            tabBarLabel={'Jogo'}
                            activeTintColor={'white'}
                        />
                        <Scene 
                            key={'escalacaoTabH'}
                            hideNavBar 
                            component={EscalacaoH}
                            tabBarLabel={'Escalação'}
                            activeTintColor={'white'}
                        />
                        <Scene 
                            key={'ausentesTabH'}
                            hideNavBar 
                            component={Ausentes}
                            tabBarLabel={'Ausentes'}
                            activeTintColor={'white'}
                        />
                    </Scene>
                    <Scene 
                        key={'historicoJogoTabP'}
                        tabs
                        showLabel
                        tabBarPosition={'top'}
                        lazy={false}
                        swipeEnabled
                        title={'Histórico de Jogo'} 
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        tabBarStyle={{ backgroundColor: colorAppS }}
                        labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
                        renderRightButton={() => this.rightButtonImagens()}
                    >
                        <Scene 
                            key={'jogoTabP'}
                            hideNavBar 
                            component={JogoP}
                            initial
                            tabBarLabel={'Jogo'}
                            activeTintColor={'white'}
                        />
                        <Scene 
                            key={'escalacaoTabP'}
                            hideNavBar 
                            component={EscalacaoP}
                            tabBarLabel={'Escalação'}
                            activeTintColor={'white'}
                        />
                        <Scene 
                            key={'ausentesTabP'}
                            hideNavBar 
                            component={Ausentes}
                            tabBarLabel={'Ausentes'}
                            activeTintColor={'white'}
                        />
                    </Scene>
                    <Scene 
                        key={'analiseFinanceiro'}
                        tabs
                        showLabel
                        tabBarPosition={'top'}
                        lazy={false}
                        swipeEnabled
                        title={'Financeiro'} 
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        tabBarStyle={{ backgroundColor: colorAppS }}
                        labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
                        //renderRightButton={() => this.rightButtonGerenciarTab()}
                    >
                        <Scene 
                            key={'financeiroCadastrar'}
                            hideNavBar 
                            component={FinanceiroCadastrar}
                            initial
                            tabBarLabel={'Cadastro'}
                            activeTintColor={'white'}
                        />
                        <Scene 
                            key={'financeiroEditar'}
                            hideNavBar 
                            component={FinanceiroEditar}
                            tabBarLabel={'Lista'}
                            activeTintColor={'white'}
                        />
                    </Scene>
                    <Scene 
                        key={'adminEnquetes'}
                        tabs
                        showLabel
                        tabBarPosition={'top'}
                        lazy={false}
                        swipeEnabled
                        title={'Enquetes'} 
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        tabBarStyle={{ backgroundColor: colorAppS }}
                        labelStyle={{ fontSize: normalize(12), fontWeight: 'bold' }}
                        //renderRightButton={() => this.rightButtonGerenciarTab()}
                    >
                        <Scene 
                            key={'enqueteCadastrar'}
                            hideNavBar 
                            component={EnqueteCadastrar}
                            initial
                            tabBarLabel={'Cadastrar'}
                            activeTintColor={'white'}
                        />
                        <Scene 
                            key={'enqueteEditar'}
                            hideNavBar 
                            component={EnqueteEditar}
                            tabBarLabel={'Editar'}
                            activeTintColor={'white'}
                        />
                    </Scene>
                </Scene>
            </Router>
        );
    }

    render() {
        if (this.state.loading || this.state.timingNotEnd) {
            return (
                <SplashScreenAnim />
            );
        }
        return (
            <View style={{ flex: 1 }}>
                <AlertScl />
                {this.renderRouter()}
            </View>
            
        );
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: colorAppS,
        borderBottomWidth: 0,
        ...Platform.select({
            android: {
                elevation: 0
            },
            ios: {
                shadowOpacity: 0
            }
        })
    },
    title: {
        color: 'white',
        fontSize: 18,
        textAlign: 'center'
    },
    btLeft: {
        color: 'white'
    },
    mainTabBar: {
        backgroundColor: colorAppS,
        position: 'absolute',
        height: 50,
        left: 0,
        right: 0,
        bottom: 0,
        ...Platform.select({
            android: {
                elevation: 8,
                borderTopWidth: 1,
                borderTopColor: 'rgba(0, 0, 0, 0.4)',
            }
        })
    }
});

const mapStateToProps = (state) => ({
    animatedHeigth: state.JogosReducer.animatedHeigth,
    userLevel: state.LoginReducer.userLevel
});

export default connect(mapStateToProps)(Routes);

