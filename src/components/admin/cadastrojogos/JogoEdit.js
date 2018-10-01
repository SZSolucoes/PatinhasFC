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
import firebase from 'firebase';
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
import { showAlert } from '../../../utils/store';
import { colorAppF } from '../../../utils/constantes';

class JogoEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isTitValid: props.isTitValid ? props.isTitValid : false,
            contentType: props.contentType ? props.contentType : '',
            imgJogoUri: props.imgJogoUri ? props.imgJogoUri : null,
            imgPath: props.imgPath ? props.imgPath : '',
            titulo: props.titulo ? props.titulo : '',
            data: props.data ? props.data : new Date(),
            descricao: props.descricao ? props.descricao : '',
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null
        };

        this.b64Str = props.b64Str ? props.b64Str : '';
        this.contentType = props.contentType ? props.contentType : '';

        this.onPressSelectImg = this.onPressSelectImg.bind(this);
        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.setImgProperties = this.setImgProperties.bind(this);
        this.checkConInfo = this.checkConInfo.bind(this);
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

        const { titulo, data, descricao, scrollView } = this.state;
        const { keyItem, imgUrl } = this.props;
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

        if (data instanceof Date) {
            dataStr = data.toLocaleDateString();
            dataStr = Moment(dataStr).format('DD/MM/YYYY');
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
                    uploadBlob.close();
                    return imgRef.getDownloadURL();
                })
                .then((url) => {
                    if (keyItem) {
                        return dbJogosRef.update({
                            titulo, 
                            data: dataStr, 
                            descricao,
                            imagem: url });
                    }
                    return dbJogosRef.push({
                            titulo, 
                            data: dataStr, 
                            descricao,
                            imagem: url,
                            placarCasa: '0',
                            placarVisit: '0' 
                        });
                })
                .then(() => {
                    this.setState({ loading: false });
                    if (keyItem && imgUrl) {
                        firebase.storage().refFromURL(imgUrl).delete()
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

                    this.setState({ loading: false });
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
                    descricao 
                })
                .then(() => {
                    this.setState({ loading: false });
                    showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');
                })
                .catch(() => {
                    this.setState({ loading: false });
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
                    imagem: '',
                    placarCasa: '0',
                    placarVisit: '0'  
                })
                .then(() => {
                    this.setState({ loading: false });
                    showAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso.');
                })
                .catch(() => {
                    this.setState({ loading: false });
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
                                this.descricao.focus();
                            } else {
                                this.setState({ data: date }); 
                                this.props.onChangeSuperState({ data: date });
                                this.descricao.focus();
                            }
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
                        onPress={() => this.checkConInfo(() => this.onPressConfirmar())}
                />
                <Button 
                    small
                    loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                    title={'Limpar'} 
                    buttonStyle={{ width: '100%', marginVertical: 10 }}
                    onPress={() => {
                        this.b64Str = '';
                        this.contentType = '';
                        this.setState({
                            contentType: '',
                            imgJogoUri: null,
                            imgPath: '',
                            titulo: '',
                            data: new Date(),
                            descricao: '',
                        });
                    }}
                />
            </Card>
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
