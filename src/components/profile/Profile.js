import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage,
    Dimensions
} from 'react-native';

import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';
import firebase from 'firebase';
import RNFetchBlob from 'rn-fetch-blob';
import b64 from 'base-64';
import { Button, List, ListItem } from 'react-native-elements';
import ParallaxScrollView from 'react-native-parallax-scrollview';
import ImagePicker from 'react-native-image-crop-picker';
import { showAlert, showAlertDesenv } from '../../utils/store';
import { colorAppP } from '../../utils/constantes';

import perfilUserImg from '../../imgs/perfiluserimg.png';
import perfilBgUserImg from '../../imgs/backgrounduserimg.jpg';

class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.onPressLogout = this.onPressLogout.bind(this);
        this.onPressUserImg = this.onPressUserImg.bind(this);
        this.checkConInfo = this.checkConInfo.bind(this);

        this.state = {
            progress: 0
        };
    }

    onPressLogout() {
        AsyncStorage.removeItem('username');
        AsyncStorage.removeItem('password');

        Actions.replace('login');
    }

    onPressUserImg(type) {
        const width = type === 'userImg' ? 400 : 600;
        const height = type === 'userImg' ? 400 : 400;
        const cropperCircleOverlay = type === 'userImg';
        ImagePicker.openPicker({
            width,
            height,
            cropping: true,
            cropperCircleOverlay,
            includeBase64: true,
            mediaType: 'photo'
          }).then(image => {
            if (image) {
                const metadata = {
                    contentType: image.mime
                };
    
                const storageRef = firebase.storage().ref();
                const databaseRef = firebase.database().ref();
    
                const Blob = RNFetchBlob.polyfill.Blob;
    
                const glbXMLHttpRequest = global.XMLHttpRequest;
                const glbBlob = global.Blob;
    
                let uploadBlob = null;
    
                global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
                global.Blob = Blob;
    
                const { userLogged, username } = this.props;
                const imgUrl = type === 'userImg' ? userLogged.imgAvatar : userLogged.imgBackground;
                const usuariob64 = b64.encode(username);
                const fileName = b64.encode(new Date().getTime().toString());
                const imgExt = image.mime.slice(image.mime.indexOf('/') + 1);
                const imgRef = storageRef
                    .child(`usuarios/${usuariob64}/${fileName}.${imgExt}`);
    
                Blob.build(image.data, { type: `${image.mime};BASE64` })
                .then((blob) => { 
                    uploadBlob = blob;
                    const uploadTask = imgRef.put(blob, metadata);
                    uploadTask.on('state_changed', (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        if (progress === 1) {
                            this.setState({ progress: 0.85 }); 
                        } else if (progress === 0) {
                            this.setState({ progress: 0.10 }); 
                        } else {
                            this.setState({ progress }); 
                        }
                    });
                    return uploadTask;
                })
                .then(() => {
                    uploadBlob.close();
                    return imgRef.getDownloadURL();
                })
                .then((url) => {
                    const imgUpd = type === 'userImg' ? { imgAvatar: url } : { imgBackground: url };
                    databaseRef.child(`usuarios/${usuariob64}`).update(imgUpd);
                })
                .then(() => {
                    if (imgUrl) {
                        firebase.storage().refFromURL(imgUrl).delete()
                        .then(() => true)
                        .catch(() => true);
                    }
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;

                    this.setState({ progress: 1 });
                    setTimeout(() => this.setState({ progress: 0 }), 1500);
                })
                .catch(() => {
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;

                    if (uploadBlob) {
                        uploadBlob.close();
                    }
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Falha no upload de imagem.'
                    );
                    this.setState({ progress: 1 });
                    setTimeout(() => this.setState({ progress: 0 }), 1500);
                }); 
            }
          }).catch(() => false);
    }

    checkConInfo(funExec) {
        if (this.props.conInfo.type === 'none' ||
            this.props.conInfo.type === 'unknown'
        ) {
            Toast.show('Sem conexão.', Toast.SHORT);
            return false;
        }

        return funExec();
    }

    render() {
        const { userLogged } = this.props;
        const userImg = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : perfilUserImg;
        const imgBg = userLogged.imgBackground ? 
            { uri: userLogged.imgBackground } : perfilBgUserImg;
        const username = userLogged.nome ? userLogged.nome : 'Patinhas';
        const posicao = userLogged.posicao ? userLogged.posicao : 'Técnico';
        return (
            <View style={styles.viewPrinc}>
                <ParallaxScrollView
                    onPressBackgroundImg={() => this.checkConInfo(
                        () => this.onPressUserImg('userBg')
                    )}
                    onPressUserImg={() => this.checkConInfo(
                        () => this.onPressUserImg('userImg')
                    )}
                    userImage={userImg}
                    backgroundSource={imgBg}
                    userName={username}
                    userTitle={posicao}
                    navBarHeight={0.1}
                    navBarTitle={' '}
                >
                    {
                        this.state.progress > 0 &&
                        <View
                            style={{ 
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Progress.Bar 
                                progress={this.state.progress} 
                                width={Dimensions.get('screen').width} 
                                color={colorAppP}
                                borderRadius={0}
                                borderWidth={0}
                            />
                        </View>
                    }
                    <List>
                        <ListItem
                            key={'Amigos'}
                            title={'Amigos'}
                            leftIcon={{ name: 'account-multiple', type: 'material-community' }}
                            onPress={() => this.checkConInfo(
                                () => showAlertDesenv()
                            )}
                        />
                        <ListItem
                            key={'Notificações'}
                            title={'Notificações'}
                            leftIcon={{ name: 'bell', type: 'material-community' }}
                            onPress={() => this.checkConInfo(
                                () => showAlertDesenv()
                            )}
                        />
                        <ListItem
                            key={'Editar Perfil'}
                            title={'Editar Perfil'}
                            leftIcon={{ name: 'account', type: 'material-community' }}
                            onPress={() => this.checkConInfo(
                                () => showAlertDesenv()
                            )}
                        />
                        <ListItem
                            key={'Configurações'}
                            title={'Configurações'}
                            leftIcon={{ name: 'settings', type: 'material-community' }}
                            onPress={() => this.checkConInfo(
                                () => showAlertDesenv()
                            )}
                        />
                    </List>
                    <Button 
                        small 
                        title={'Sair'} 
                        buttonStyle={{ width: '100%', marginVertical: 20 }}
                        onPress={() => this.onPressLogout()}
                    />
                    <View style={{ marginBottom: 100 }} />
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

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    username: state.LoginReducer.username,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {})(Profile);
