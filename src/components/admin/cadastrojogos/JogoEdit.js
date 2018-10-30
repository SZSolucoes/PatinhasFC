import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    Image
} from 'react-native';

import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
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

import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-datepicker';
import firebase from '../../../Firebase';
import { showAlert } from '../../../utils/store';
import { colorAppF } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';
import { sendCadJogoPushNotifForAll } from '../../../utils/fcmPushNotifications';

class JogoEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isTitValid: props.isTitValid ? props.isTitValid : false,
            contentType: props.contentType ? props.contentType : '',
            imgJogoUri: props.imgJogoUri ? props.imgJogoUri : null,
            imgPath: props.imgPath ? props.imgPath : '',
            titulo: props.titulo ? props.titulo : '',
            data: props.data ? props.data : Moment().format('DD/MM/YYYY'),
            descricao: props.descricao ? props.descricao : '',
            timeCasa: props.timeCasa ? props.timeCasa : '',
            timeVisit: props.timeVisit ? props.timeVisit : '',
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null
        };

        this.b64Str = props.b64Str ? props.b64Str : '';
        this.contentType = props.contentType ? props.contentType : '';

        this.onPressSelectImg = this.onPressSelectImg.bind(this);
        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.setImgProperties = this.setImgProperties.bind(this);
        this.clearContentImg = this.clearContentImg.bind(this);
        this.limitNomeTime = this.limitNomeTime.bind(this);
    }

    onPressSelectImg() {
        ImagePicker.openPicker({
            width: 600,
            height: 400,
            cropping: true,
            includeBase64: true,
            cropperCircleOverlay: false,
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
                        imgJogoUri: `data:${image.mime};base64,${image.data}`
                    });
                } else {
                    this.setImgProperties(image.data, contentType);
                    this.setState({ 
                        imgJogoUri: `data:${image.mime};base64,${image.data}`
                    });
                    this.props.onChangeSuperState({ 
                        imgJogoUri: `data:${image.mime};base64,${image.data}`,
                        b64Str: image.data,
                        contentType
                    });
                }
            }
          }).catch(() => false);
    }

    onPressConfirmar() {
        this.setState({ loading: true });

        const { titulo, data, descricao, scrollView, timeCasa, timeVisit } = this.state;
        const { keyItem, imgJogoUri } = this.props;
        const b64File = this.b64Str;
        const contentTp = this.contentType;
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

        if (data instanceof Moment) {
            dataStr = Moment(data).format('DD/MM/YYYY');
        } else {
            dataStr = data;
        }

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
            const imgRef = storageRef.child(`jogos/${fileName}.${imgExt}`);
            const dbJogosRef = keyItem ? 
            databaseRef.child(`jogos/${keyItem}`) : databaseRef.child('jogos');

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
                        return dbJogosRef.update({
                            titulo, 
                            data: dataStr, 
                            descricao,
                            timeCasa,
                            timeVisit,
                            imagem: url });
                    }
                    return dbJogosRef.push({
                            titulo, 
                            data: dataStr, 
                            descricao,
                            timeCasa,
                            timeVisit,
                            imagem: url,
                            placarCasa: '0',
                            placarVisit: '0',
                            confirmados: [{ push: 'push' }],
                            gols: [{ push: 'push' }],
                            cartoes: [{ push: 'push' }],
                            subs: [{ push: 'push' }],
                            escalacao: { 
                                casa: [{ push: 'push' }], 
                                visit: [{ push: 'push' }], 
                                banco: [{ push: 'push' }] 
                            },
                            status: '0',
                            currentTime: '0',
                            endStatus: '0',
                            imagens: [{ push: 'push' }]
                        });
                })
                .then(() => {
                    this.setState({ loading: false, isTitValid: false });
                    if (keyItem && imgJogoUri) {
                        firebase.storage().refFromURL(imgJogoUri).delete()
                        .then(() => true)
                        .catch(() => true);
                    }
                    if (keyItem) {
                        showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');    
                    } else {
                        sendCadJogoPushNotifForAll(titulo);
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
                        'Ocorreu um erro ao cadastrar o jogo.'
                    );
                });  
        } else {
            const databaseRef = firebase.database().ref();
            const dbJogosRef = keyItem ? 
            databaseRef.child(`jogos/${keyItem}`) : databaseRef.child('jogos');

            if (keyItem) {
                dbJogosRef.update({
                    titulo, 
                    data: dataStr, 
                    descricao,
                    timeCasa,
                    timeVisit 
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
                        'Ocorreu um erro ao editar o jogo.'
                    );
                });  
            } else {
                dbJogosRef.push({
                    titulo, 
                    data: dataStr, 
                    descricao,
                    timeCasa,
                    timeVisit,
                    imagem: '',
                    placarCasa: '0',
                    placarVisit: '0',
                    confirmados: [{ push: 'push' }],
                    gols: [{ push: 'push' }],
                    cartoes: [{ push: 'push' }],
                    subs: [{ push: 'push' }],
                    escalacao: { 
                        casa: [{ push: 'push' }], 
                        visit: [{ push: 'push' }], 
                        banco: [{ push: 'push' }] 
                    },
                    status: '0',
                    currentTime: '0',
                    endStatus: '0',
                    imagens: [{ push: 'push' }]
                })
                .then(() => {
                    sendCadJogoPushNotifForAll(titulo);
                    this.setState({ loading: false, isTitValid: false });
                    showAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso.');
                })
                .catch(() => {
                    this.setState({ loading: false, isTitValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao cadastrar o jogo.'
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

    limitNomeTime(value, type) {
        if (value.length > 16) {
            return;
        }
        if (type === 'casa') {
            if (this.props.keyItem) {
                this.setState({ timeCasa: value });
            } else {
                this.setState({ timeCasa: value });
                this.props.onChangeSuperState({ timeCasa: value });
            }
        } else if (type === 'visit') {
            if (this.props.keyItem) {
                this.setState({ timeVisit: value });
            } else {
                this.setState({ timeVisit: value });
                this.props.onChangeSuperState({ timeVisit: value });
            }
        }
    }
    
    render() {
        return (
            <View>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.text}>TÍTULO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
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
                        onSubmitEditing={() => this.inputDate.onPressDate()}
                    />
                    { 
                        this.state.isTitValid &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>DATA</FormLabel>
                    <View 
                        style={[styles.inputContainer, { 
                            flex: 1, 
                            flexDirection: 'row',
                            ...Platform.select({
                            android: {
                                marginHorizontal: 16
                            },
                            ios: {
                                marginHorizontal: 20
                            }
                        }) }]}
                    >
                        <DatePicker
                            ref={(ref) => { this.inputDate = ref; }}
                            style={[styles.inputContainer, { flex: 1 }]}
                            date={this.state.data}
                            mode='date'
                            format='DD/MM/YYYY'
                            minDate={Moment().format('DD/MM/YYYY')}
                            confirmBtnText='Ok'
                            cancelBtnText='Cancelar'
                            placeholder=' '
                            showIcon={false}
                            customStyles={{
                                dateInput: StyleSheet.flatten(styles.dateInput),
                                dateText: StyleSheet.flatten(styles.dateText)
                            }}
                            onDateChange={(date) => {
                                if (this.props.keyItem) {
                                    this.setState({ data: date }); 
                                } else {
                                    this.setState({ data: date }); 
                                    this.props.onChangeSuperState({ data: date });
                                }
                                this.descricao.focus();
                            }}
                        />
                    </View>
                    <FormLabel labelStyle={styles.text}>DESCRIÇÃO</FormLabel>
                    <FormInput
                        ref={(ref) => {
                            this.descricao = ref;
                        }}
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        inputStyle={[styles.text, styles.input]} 
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
                        onSubmitEditing={() => this.timeCasa.focus()}
                    />
                    <FormLabel labelStyle={styles.text}>TIME CASA (NOME)</FormLabel>
                    <FormInput
                        ref={(ref) => {
                            this.timeCasa = ref;
                        }}
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.timeCasa}
                        onChangeText={(value) => {
                            this.limitNomeTime(value, 'casa');
                        }}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.timeVisit.focus()}
                    />
                    <FormLabel labelStyle={styles.text}>TIME VISITANTES (NOME)</FormLabel>
                    <FormInput
                        ref={(ref) => {
                            this.timeVisit = ref;
                        }}
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.timeVisit}
                        onChangeText={(value) => {
                            this.limitNomeTime(value, 'visit');
                        }}
                        underlineColorAndroid={'transparent'}
                    />
                    <FormLabel labelStyle={styles.text}>IMAGEM DE EXIBIÇÃO</FormLabel>
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
                                    this.state.imgJogoUri && 
                                    (<Image 
                                        source={{ uri: this.state.imgJogoUri }}
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
                    <Button 
                        small
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginTop: 30 }}
                            onPress={() => checkConInfo(() => this.onPressConfirmar())}
                    />
                    <Button 
                        small
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.props.keyItem ? 'Restaurar' : 'Limpar'} 
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => {
                            this.clearContentImg();
                            this.setState({
                                isTitValid: this.props.isTitValid ? this.props.isTitValid : false,
                                contentType: this.props.contentType ? this.props.contentType : '',
                                imgJogoUri: this.props.imgJogoUri ? this.props.imgJogoUri : null,
                                imgPath: this.props.imgPath ? this.props.imgPath : '',
                                titulo: this.props.titulo ? this.props.titulo : '',
                                data: this.props.data ? 
                                this.props.data : Moment().format('DD/MM/YYYY'),
                                descricao: this.props.descricao ? this.props.descricao : '',
                                timeCasa: this.props.timeCasa ? this.props.timeCasa : '',
                                timeVisit: this.props.timeVisit ? this.props.timeVisit : '',
                                loading: this.props.loading ? this.props.loading : false
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
    },
    dateInput: {
        borderWidth: 0,
        alignItems: 'flex-start',
        height: 35,
        ...Platform.select({
            android: {
                paddingLeft: 3,
                justifyContent: 'flex-end'
            },
            ios: {
                paddingLeft: 0,
                justifyContent: 'center'
            }
        })
    }
});

const mapStateToProps = (state) => ({
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {})(JogoEdit);
