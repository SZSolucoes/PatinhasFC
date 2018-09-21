import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { Button, List, ListItem } from 'react-native-elements';
import ParallaxScrollView from 'react-native-parallax-scrollview';
import { showAlertDesenv } from '../../utils/store';

import perfilUserImg from '../../imgs/perfiluserimg.png';
import perfilBgUserImg from '../../imgs/backgrounduserimg.jpg';

class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.onPressLogout = this.onPressLogout.bind(this);
    }

    onPressLogout() {
        AsyncStorage.removeItem('username');
        AsyncStorage.removeItem('password');

        Actions.replace('login');
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <ParallaxScrollView
                    onPressBackgroundImg={() => showAlertDesenv()}
                    onPressUserImg={() => showAlertDesenv()}
                    userImage={perfilUserImg}
                    backgroundSource={perfilBgUserImg}
                    userName='Roney Maia'
                    userTitle='Desenvolvedor'
                    navBarHeight={0.1}
                    navBarTitle={' '}
                >
                    <List>
                        <ListItem
                            key={'Amigos'}
                            title={'Amigos'}
                            leftIcon={{ name: 'account-multiple', type: 'material-community' }}
                            onPress={() => showAlertDesenv()}
                        />
                        <ListItem
                            key={'Notificações'}
                            title={'Notificações'}
                            leftIcon={{ name: 'bell', type: 'material-community' }}
                            onPress={() => showAlertDesenv()}
                        />
                        <ListItem
                            key={'Editar Perfil'}
                            title={'Editar Perfil'}
                            leftIcon={{ name: 'account', type: 'material-community' }}
                            onPress={() => showAlertDesenv()}
                        />
                        <ListItem
                            key={'Configurações'}
                            title={'Configurações'}
                            leftIcon={{ name: 'settings', type: 'material-community' }}
                            onPress={() => showAlertDesenv()}
                        />
                    </List>
                    <Button 
                        small 
                        title={'Sair'} 
                        buttonStyle={{ width: '100%', marginVertical: 20 }}
                        onPress={() => this.onPressLogout()}
                    />
                </ParallaxScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(Profile);
