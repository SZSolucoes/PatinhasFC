import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    Image
} from 'react-native';

import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage, 
    Card, 
    Button, 
    Icon
} from 'react-native-elements';
import Moment from 'moment';
import b64 from 'base-64';
import RNFetchBlob from 'rn-fetch-blob';
import ImagePicker from 'react-native-image-crop-picker';

import firebase from '../../../Firebase';
import { showAlert } from '../../../utils/store';
import { colorAppF } from '../../../utils/constantes';
import { checkPerfil } from '../../../utils/userUtils';

class UsuarioEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isTitValid: props.isTitValid ? props.isTitValid : false,
            contentType: props.contentType ? props.contentType : '',
            imgArticleUri: props.imgArticleUri ? props.imgArticleUri : null,
            imgPath: props.imgPath ? props.imgPath : '',
            titulo: props.titulo ? props.titulo : '',
            descricao: props.descricao ? props.descricao : '',
            linkExt: props.linkExt ? props.linkExt : '',
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null
        };

        this.b64Str = props.b64Str ? props.b64Str : '';
        this.contentType = props.contentType ? props.contentType : '';

        this.onPressSelectImg = this.onPressSelectImg.bind(this);
        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.setImgProperties = this.setImgProperties.bind(this);
        this.checkConInfo = this.checkConInfo.bind(this);
        this.clearContentImg = this.clearContentImg.bind(this);
    }

    onPressSelectImg() {
        ImagePicker.openPicker({
            width: 600,
            height: 400,
            cropping: true,
            includeBase64: true,
            mediaType: 'photo'
          }).then(image => {
            if (image) {
                let contentType = '';
                if (image.mime) {
                    contentType = image.mime;
                }
               
                if (this.props.keyItem) {
                    this.setImgProperties(image.data, contentType);
                    this.setState({ 
                        imgArticleUri: `data:${image.mime};base64,${image.data}`
                    });
                } else {
                    this.setImgProperties(image.data, contentType);
                    this.setState({ 
                        imgArticleUri: `data:${image.mime};base64,${image.data}`
                    });
                    this.props.onChangeSuperState({ 
                        imgArticleUri: `data:${image.mime};base64,${image.data}`,
                        b64Str: image.data,
                        contentType
                    });
                }
            }
          }).catch(() => false);
    }

    onPressConfirmar() {
        this.setState({ loading: true });

        const { titulo, descricao, linkExt, scrollView } = this.state;
        const { keyItem, imgArticleUri, userLogged } = this.props;
        const b64File = this.b64Str;
        const contentTp = this.contentType;
        const protocol = linkExt.substr(0, 4);
        let linkArticle = linkExt;
        let dataStr = '';

        if (!(titulo)) {
            this.setState({
                isTitValid: !titulo,
                loading: false
            });
            if (scrollView) {
                scrollView().scrollTo({
                y: 0,
                duration: 2000,
                animated: true
              });
            }
            return;
        }

        // Tratamento para o protocolo
        if (protocol.trim() && protocol.toLowerCase() !== 'http') {
            linkArticle = `http://${linkExt}`;        
        }

        dataStr = Moment().format('DD/MM/YYYY HH:mm:ss');

        // Upload de imagem e dados
        if (b64File) {
            const metadata = {
                contentType: contentTp
            };

            const storageRef = firebase.storage().ref();
            const databaseRef = firebase.database().ref();

            const Blob = RNFetchBlob.polyfill.Blob;

            const glbXMLHttpRequest = global.XMLHttpRequest;
            const glbBlob = global.Blob;

            let uploadBlob = null;

            global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
            global.Blob = Blob;

            const fileName = b64.encode(new Date().getTime().toString());
            const imgExt = contentTp.slice(contentTp.indexOf('/') + 1);
            const imgRef = storageRef.child(`informativos/${fileName}.${imgExt}`);
            const dbInfosRef = keyItem ? 
            databaseRef.child(`informativos/${keyItem}`) : databaseRef.child('informativos');

            Blob.build(b64File, { type: `${contentTp};BASE64` })
                .then((blob) => { 
                    uploadBlob = blob;
                    return imgRef.put(blob, metadata);
                })
                .then(() => {
                    if (uploadBlob) {
                        uploadBlob.close();
                        uploadBlob = null;
                    }
                    return imgRef.getDownloadURL();
                })
                .then((url) => {
                    if (keyItem) {
                        return dbInfosRef.update({
                            descPost: titulo, 
                            imgArticle: url, 
                            textArticle: descricao,
                            linkArticle });
                    }
                    return dbInfosRef.push({
                            descPost: titulo, 
                            imgArticle: url, 
                            textArticle: descricao,
                            linkArticle,
                            emailUser: userLogged.email,
                            nomeUser: userLogged.nome,
                            perfilUser: checkPerfil(userLogged.tipoPerfil),
                            imgAvatar: userLogged.imgAvatar,
                            listComents: [{ push: 'push' }],
                            listLikes: [{ push: 'push' }],
                            dataPost: dataStr
                        });
                })
                .then(() => {
                    this.setState({ loading: false, isTitValid: false });
                    if (keyItem && imgArticleUri) {
                        firebase.storage().refFromURL(imgArticleUri).delete()
                        .then(() => true)
                        .catch(() => true);
                    }
                    if (keyItem) {
                        showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');    
                    } else {
                        showAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso.');
                    }
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;
                })
                .catch(() => {
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;

                    if (uploadBlob) {
                        uploadBlob.close();
                    }

                    this.setState({ loading: false, isTitValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao cadastrar o informativo.'
                    );
                });  
        } else {
            const databaseRef = firebase.database().ref();
            const dbInfosRef = keyItem ? 
            databaseRef.child(`informativos/${keyItem}`) : databaseRef.child('informativos');

            if (keyItem) {
                dbInfosRef.update({
                    descPost: titulo, 
                    textArticle: descricao,
                    linkArticle
                })
                .then(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');
                })
                .catch(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao editar o informativo.'
                    );
                });  
            } else {
                dbInfosRef.push({
                    descPost: titulo, 
                    imgArticle: '', 
                    textArticle: descricao,
                    linkArticle,
                    emailUser: userLogged.email,
                    nomeUser: userLogged.nome,
                    perfilUser: checkPerfil(userLogged.tipoPerfil),
                    imgAvatar: userLogged.imgAvatar,
                    listComents: [{ push: 'push' }],
                    listLikes: [{ push: 'push' }],
                    dataPost: dataStr
                })
                .then(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso.');
                })
                .catch(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao cadastrar o informativo.'
                    );
                });  
            }
        }
    }
    
    setImgProperties(b64Str, mime) {
        this.b64Str = b64Str;
        this.contentType = mime;
    }

    clearContentImg() {
        this.b64Str = '';
        this.contentType = '';
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
        return (
            <View>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.text}>TÍTULO</FormLabel>
                    <FormInput
                        ref={(ref) => {
                            this.inputTitulo = ref;
                        }}
                        selectTextOnFocus
                        containerStyle={[styles.inputContainer, { height: 80 }]}
                        inputStyle={[styles.text, styles.input, { height: 80 }]} 
                        value={this.state.titulo}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ titulo: value });
                            } else {
                                this.setState({ titulo: value });
                                this.props.onChangeSuperState({ titulo: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                        multiline 
                    />
                    { 
                        this.state.isTitValid &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>IMAGEM DO ARTIGO</FormLabel>
                    <View style={{ marginVertical: 20, marginHorizontal: 10 }}>
                        <TouchableOpacity
                            onPress={() => this.onPressSelectImg()}
                        >
                            <View style={styles.viewImageSelect}>
                                <Icon 
                                    name='folder-image' 
                                    type='material-community' 
                                    size={34} color='#9E9E9E' 
                                />
                                <FormLabel 
                                    labelStyle={[styles.text, { marginTop: 0, marginBottom: 0 }]}
                                >
                                    Selecionar imagem
                                </FormLabel> 
                            </View>
                            <View style={[styles.viewImageSelect, { height: 200 }]}>
                                { 
                                    !!this.state.imgArticleUri && 
                                    (<Image 
                                        source={{ uri: this.state.imgArticleUri }}
                                        style={{
                                            flex: 1,
                                            alignSelf: 'stretch',
                                            resizeMode: 'stretch',
                                            width: undefined,
                                            height: undefined
                                            }}
                                    />)
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                    <FormLabel labelStyle={styles.text}>DESCRIÇÃO DO ARTIGO</FormLabel>
                    <FormInput
                        ref={(ref) => {
                            this.inputDesc = ref;
                        }}
                        selectTextOnFocus
                        containerStyle={[styles.inputContainer, { height: 80 }]}
                        inputStyle={[styles.text, styles.input, { height: 80 }]} 
                        value={this.state.descricao}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ descricao: value });
                            } else {
                                this.setState({ descricao: value });
                                this.props.onChangeSuperState({ descricao: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                        multiline 
                    />
                    <FormLabel labelStyle={styles.text}>LINK EXTERNO DO ARTIGO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        ref={(ref) => { this.inputLinkExt = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.linkExt}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ linkExt: value });
                            } else {
                                this.setState({ linkExt: value });
                                this.props.onChangeSuperState({ linkExt: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                    />
                    <Button 
                        small
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginTop: 30 }}
                        onPress={() => this.checkConInfo(() => this.onPressConfirmar())}
                    />
                    <Button 
                        small
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={'Limpar'} 
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => {
                            this.clearContentImg();
                            this.setState({
                            isTitValid: false,
                            contentType: '',
                            imgArticleUri: null,
                            imgPath: '',
                            titulo: '',
                            descricao: '',
                            linkExt: '',
                            loading: false
                        });
                        }}
                    />
                </Card>
                <View style={{ marginBottom: 30 }} />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    text: {
        fontSize: 14,
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 45 : 40,
    },
    input: {
        paddingBottom: 0, 
        width: null,
        color: 'black',
        height: 35
    },
    card: {
        paddingHorizontal: 10,
    },
    viewImageSelect: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, 
        borderColor: '#EEEEEE',
        borderRadius: 0.9
    }
});

const mapStateToProps = (state) => ({
    conInfo: state.LoginReducer.conInfo,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {})(UsuarioEdit);
