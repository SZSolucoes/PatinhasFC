import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage,
    Dimensions,
    Text
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import * as Progress from 'react-native-progress';
import RNFetchBlob from 'rn-fetch-blob';
import b64 from 'base-64';
import { Button, List, ListItem } from 'react-native-elements';
import ParallaxScrollView from 'react-native-parallax-scrollview';
import ImagePicker from 'react-native-image-crop-picker';
import { Dialog } from 'react-native-simple-dialogs';
import { showAlert, mappedKeyStorage } from '../../utils/store';
import { colorAppP, colorAppS } from '../../utils/constantes';
import { retrieveImgSource } from '../../utils/imageStorage';
import { checkConInfo } from '../../utils/jogosUtils';
import { updateUserImages, checkPerfil } from '../../utils/userUtils';

import firebase from '../../Firebase';
import perfilUserImg from '../../imgs/perfiluserimg.png';
import perfilBgUserImg from '../../imgs/backgrounduserimg.jpg';

class Profile extends React.Component {

    constructor(props) {
        super(props);

        this.onPressLogout = this.onPressLogout.bind(this);
        this.onPressUserImg = this.onPressUserImg.bind(this);
        this.doUploadUserImg = this.doUploadUserImg.bind(this);

        this.state = {
            progress: 0,
            showAbout: false
        };
    }

    onPressLogout() {
        AsyncStorage.removeItem(mappedKeyStorage('username'));
        AsyncStorage.removeItem(mappedKeyStorage('password'));

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
          }).then(image => checkConInfo(() => this.doUploadUserImg(image, type)))
          .catch(() => false);
    }

    doUploadUserImg(image, type) {
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
                if (uploadBlob) {
                    uploadBlob.close();
                    uploadBlob = null;
                }
                return imgRef.getDownloadURL();
            })
            .then((url) => {
                const imgUpd = type === 'userImg' ? 
                { imgAvatar: url, infoImgUpdated: 'false', jogosImgUpdated: 'false' } : 
                { imgBackground: url };
                if (type === 'userImg') {
                    setTimeout(() => updateUserImages(
                        'false',
                        'false',
                        userLogged.email, 
                        userLogged.key, 
                        url
                    ), 2000);
                }
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
    }

    render() {
        const { userLogged } = this.props;
        const userImg = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : perfilUserImg;
        const imgBg = userLogged.imgBackground ? 
            { uri: userLogged.imgBackground } : perfilBgUserImg;
        const username = userLogged.nome ? userLogged.nome : 'Patinhas';
        let enqueteProps = {};
        let posicao = userLogged.tipoPerfil ? checkPerfil(userLogged.tipoPerfil) : 'Visitante';

        if ('0|255'.includes(userLogged.level)) {
            posicao = checkPerfil(userLogged.level);
        }
        
        if (this.props.enqueteProps && 
            this.props.enqueteProps.badge &&
            this.props.enqueteProps.badge.value) {
            enqueteProps = { ...this.props.enqueteProps };
        }

        return (
            <View style={styles.viewPrinc}>
                <ParallaxScrollView
                    onPressBackgroundImg={() => checkConInfo(() => this.onPressUserImg('userBg'))}
                    onPressUserImg={() => checkConInfo(() => this.onPressUserImg('userImg'))}
                    userImage={retrieveImgSource(userImg)}
                    backgroundSource={retrieveImgSource(imgBg)}
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
                            key={'Enquetes'}
                            title={'Enquetes'}
                            leftIcon={{ name: 'poll', type: 'material-community' }}
                            onPress={() => Actions.profileEnquetes()}
                            {...enqueteProps}
                        />
                        <ListItem
                            key={'Editar Perfil'}
                            title={'Editar Perfil'}
                            leftIcon={{ name: 'account', type: 'material-community' }}
                            onPress={() => Actions.profileEditPerfil()}
                        />
                        <ListItem
                            key={'Financeiro'}
                            title={'Financeiro'}
                            leftIcon={{ name: 'cash-multiple', type: 'material-community' }}
                            onPress={() => Actions.profileFinanceiro()}
                        />
                        <ListItem
                            key={'Histórico de Enquetes'}
                            title={'Histórico de Enquetes'}
                            leftIcon={{ name: 'chart-pie', type: 'material-community' }}
                            onPress={() => Actions.profileEnquetesHistorico()}
                        />
                        <ListItem
                            key={'Histórico de Faltas'}
                            title={'Histórico de Faltas'}
                            leftIcon={{ name: 'account-alert', type: 'material-community' }}
                            onPress={
                                () => Actions.analisejogadores({ title: 'Histórico de Faltas' })
                            }
                        />
                        <ListItem
                            key={'Histórico de Jogos'}
                            title={'Histórico de Jogos'}
                            leftIcon={{ name: 'history', type: 'material-community' }}
                            onPress={() => Actions.historico()}
                        />
                        <ListItem
                            key={'Notificações'}
                            title={'Notificações'}
                            leftIcon={{ name: 'bell', type: 'material-community' }}
                            onPress={() => Actions.profileNotifiations()}
                        />
                        {
                            this.props.userLevel && this.props.userLevel === '255' &&
                            (
                                <ListItem
                                    key={'Painel Administrativo'}
                                    title={'Painel Administrativo'}
                                    leftIcon={{ name: 'webpack', type: 'material-community' }}
                                    onPress={() => Actions.profilePainelAdmin()}
                                />
                            )
                        }
                        <ListItem
                            key={'Preferências'}
                            title={'Preferências'}
                            leftIcon={{ name: 'settings', type: 'material-community' }}
                            onPress={() => Actions.profilePreferencias()}
                        />
                        <ListItem
                            key={'Sobre'}
                            title={'Sobre'}
                            leftIcon={{ name: 'information-outline', type: 'material-community' }}
                            onPress={() => this.setState({ showAbout: true })}
                            hideChevron
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
                <Dialog
                    animationType={'fade'}
                    visible={this.state.showAbout}
                    title={'Patinhas FC'}
                    onTouchOutside={() => this.setState({ showAbout: false })}
                >
                    <View 
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%' 
                        }}
                    >
                        <View style={{ marginVertical: 20, flexDirection: 'row' }}>
                            <View style={{ marginHorizontal: 10 }}>
                                <Text style={{ fontSize: 16, color: 'black' }}>
                                    Versão:
                                </Text>
                            </View>
                            <View style={{ marginHorizontal: 10 }}>
                                <Text style={{ fontSize: 16, color: 'black' }}>
                                    1.0.5
                                </Text>
                            </View>
                        </View>
                        <View style={{ marginTop: 5 }}>
                            <Button 
                                small 
                                title={'Fechar'}
                                backgroundColor={colorAppS}
                                textStyle={{ color: 'white' }}
                                buttonStyle={{ width: '100%' }}
                                onPress={() => this.setState({ showAbout: false })}
                            />
                        </View>
                    </View>
                </Dialog>
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
    userLevel: state.LoginReducer.userLevel,
    username: state.LoginReducer.username,
    enqueteProps: state.ProfileReducer.enqueteProps
});

export default connect(mapStateToProps, {})(Profile);
