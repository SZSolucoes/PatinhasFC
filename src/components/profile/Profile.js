import React from 'react';
import { 
    View, 
    StyleSheet,
    Text,
    Dimensions
} from 'react-native';

import { connect } from 'react-redux';
import { Button, List, ListItem } from 'react-native-elements';
import ParallaxScrollView from 'react-native-parallax-scrollview';

import perfilUserImg from '../../imgs/perfiluserimg.png';
import perfilBgUserImg from '../../imgs/backgrounduserimg.jpg';

class Profile extends React.Component {

    render() {
        return (
            <View style={styles.viewPrinc}>
                <ParallaxScrollView
                    onPressBackgroundImg={() => console.log('background image')}
                    onPressUserImg={() => console.log('user image')}
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
                            onPress={() => console.log('Amigos')}
                        />
                        <ListItem
                            key={'Notificações'}
                            title={'Notificações'}
                            leftIcon={{ name: 'bell', type: 'material-community' }}
                            onPress={() => console.log('Notificações')}
                        />
                        <ListItem
                            key={'Editar Perfil'}
                            title={'Editar Perfil'}
                            leftIcon={{ name: 'account', type: 'material-community' }}
                            onPress={() => console.log('Editar Perfil')}
                        />
                        <ListItem
                            key={'Configurações'}
                            title={'Configurações'}
                            leftIcon={{ name: 'settings', type: 'material-community' }}
                            onPress={() => console.log('Configurações')}
                        />
                    </List>
                    <Button 
                        small 
                        title={'Sair'} 
                        buttonStyle={{ width: '100%', marginVertical: 20 }}
                        onPress={() => console.log('Sair')}
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
