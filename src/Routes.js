import React from 'react';
import { Router, Scene } from 'react-native-router-flux';
import { 
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    Animated,
    Dimensions,
    Keyboard,
    BackHandler
} from 'react-native';
import { Icon } from 'react-native-elements';
import { connect } from 'react-redux';

import { isPortrait, isLandscape } from './utils/orientation';
import AlertScl from './components/tools/AlertScl';
import Login from './components/login/Login';
import Jogos from './components/jogos/Jogos';
import Informativos from './components/informativos/Informativos';
import Profile from './components/profile/Profile';
import Admin from './components/admin/Admin';
import CadastroJogos from './components/admin/cadastrojogos/CadastroJogos';
import Usuarios from './components/admin/usuarios/Usuarios';
import Info from './components/admin/informativos/Info';
import { colorAppS } from './utils/constantes';

import { store } from './App';
import SplashScreenAnim from './components/animations/SplashScreenAnim';
import AnimScene from './components/tools/AnimatedScene';

const AnimatedScene = Animated.createAnimatedComponent(AnimScene);

class Routes extends React.Component {

    constructor(props) {
        super(props);

        this.onBackAndroidHdl = this.onBackAndroidHdl.bind(this);
        this.renderRouter = this.renderRouter.bind(this);
        this.doTabAnimation = this.doTabAnimation.bind(this);
        this.renderAdminTab = this.renderAdminTab.bind(this);
        this.onChangeDimension = this.onChangeDimension.bind(this);

        this.state = {
            logged: false,
            loading: true,
            timingNotEnd: true,
            animHeigth: new Animated.Value(0)
        };
    }

    componentDidMount() {
        setTimeout(() => this.setState({ timingNotEnd: false }), 10000);
        AsyncStorage.getItem('username')
        .then((userName) => {
            if (userName) {
                AsyncStorage.getItem('password')
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

                        this.setState({
                            logged: true,
                            loading: false,
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
        }
        );

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

        return true;
    }

    onChangeDimension() {
        if (isLandscape()) {
            const toValue = Dimensions.get('screen').height;
            Animated.timing(
                this.state.animHeigth, 
                {
                    toValue,
                    useNativeDriver: true,
                    delay: 200
                }
            ).start();
        } else {
            const isComentUp = store.getState().InfoReducer.startUpOrDownAnim === 'up';
            if (!isComentUp) {
                this.doTabAnimation(false);
            }
        }
    }

    doTabAnimation(animatedHeigth) {
        if (isPortrait()) {
            if (animatedHeigth === 1) {
                Animated.timing(
                    this.state.animHeigth, 
                    {
                        toValue: 100,
                        useNativeDriver: true,
                        delay: 200
                    }
                ).start();
            } else {
                const toValue = animatedHeigth ? Dimensions.get('screen').height : 0;
                Animated.spring(
                    this.state.animHeigth, 
                    {
                        toValue,
                        useNativeDriver: true,
                        bounciness: 2
                    }
                ).start();
            }
        }  
    }

    renderAdminTab() {
        const { userLevel } = this.props;
        if (userLevel && userLevel === '0') {
            return (
                <AnimatedScene 
                    key='mainTabBar' 
                    tabs 
                    hideNavBar
                    swipeEnabled
                    initial={this.state.logged}
                    showLabel={false}
                    tabBarStyle={
                        [styles.mainTabBar, 
                        { transform: [{ translateY: this.state.animHeigth }] }]
                    }
                    lazy={false}
                >
                    <Scene 
                        key='jogos' 
                        component={Jogos} 
                        hideNavBar
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
                swipeEnabled
                initial={this.state.logged}
                showLabel={false}
                tabBarStyle={
                    [styles.mainTabBar, 
                    { transform: [{ translateY: this.state.animHeigth }] }]
                }
                lazy={false}
            >
                <Scene 
                    key='jogos' 
                    component={Jogos} 
                    hideNavBar
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
                        key={'cadastroInfos'}
                        title={'Informativos'} 
                        component={Info}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
                        //initial
                    />
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
        backgroundColor: colorAppS
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
        elevation: 4,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.3)',
        position: 'absolute',
        height: 50,
        left: 0,
        right: 0,
        bottom: 0
    }
});

const mapStateToProps = (state) => ({
    animatedHeigth: state.JogosReducer.animatedHeigth,
    userLevel: state.LoginReducer.userLevel
});

export default connect(mapStateToProps)(Routes);

