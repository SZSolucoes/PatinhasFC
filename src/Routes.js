import React from 'react';
import { Router, Scene } from 'react-native-router-flux';
import { 
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    StatusBar
} from 'react-native';
import { Icon } from 'react-native-elements';

import AlertScl from './components/tools/AlertScl';
import Login from './components/login/Login';
import Jogos from './components/jogos/Jogos';
import Informativos from './components/informativos/Informativos';
import Profile from './components/profile/Profile';
import Admin from './components/admin/Admin';
import CadastroJogos from './components/admin/cadastrojogos/CadastroJogos';
import { colorAppS, colorAppP } from './utils/constantes';

import { store } from './App';
import SplashScreenAnim from './components/animations/SplashScreenAnim';

export default class Routes extends React.Component {

    constructor(props) {
        super(props);

        this.onBackAndroidHdl = this.onBackAndroidHdl.bind(this);
        this.renderRouter = this.renderRouter.bind(this);

        this.state = {
            logged: false,
            loading: true,
            timingNotEnd: true
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
    }

    onBackAndroidHdl() {
        return true;
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
                    <Scene 
                        key='mainTabBar' 
                        tabs 
                        hideNavBar
                        swipeEnabled
                        initial={this.state.logged}
                        showLabel={false}
                        tabBarStyle={styles.mainTabBar}
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
                    </Scene>
                    {/* ####################################### */}
                    <Scene 
                        key={'cadastroJogos'}
                        title={'Cadastro de Jogos'} 
                        component={CadastroJogos}
                        titleStyle={styles.title}
                        leftButtonTextStyle={styles.btLeft}
                        backButtonTintColor={'white'}
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
    }
});

