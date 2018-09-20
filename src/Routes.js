import React from 'react';
import { Router, Scene } from 'react-native-router-flux';
import { 
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Icon } from 'react-native-elements';

import Login from './components/login/Login';
import Jogos from './components/jogos/Jogos';
import Informativos from './components/informativos/Informativos';
import Profile from './components/profile/Profile';
import Admin from './components/admin/Admin';
import CadastroJogos from './components/admin/cadastrojogos/CadastroJogos';
import { colorAppS } from './utils/constantes';

export default class Routes extends React.Component {

    constructor(props) {
        super(props);

        this.onBackAndroidHdl = this.onBackAndroidHdl.bind(this);
    }

    onBackAndroidHdl() {
        return true;
    }

    render() {
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
                        //initial
                        hideNavBar
                    />
                    {/*   Activity Principal de Tabs   */}
                    <Scene 
                        key='mainTabBar' 
                        tabs 
                        hideNavBar
                        swipeEnabled
                        //initial
                        showLabel={false}
                        tabBarStyle={styles.mainTabBar}
                        lazy={false}
                    >  
                        <Scene 
                            key='Jogos' 
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
                            key='Informativos' 
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
                            key='Perfil' 
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
                            key='Admin'
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
                        initial
                    />
                </Scene>
            </Router>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#EE8215'
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

