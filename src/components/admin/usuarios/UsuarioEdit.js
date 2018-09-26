import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    Picker
} from 'react-native';

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

import DatePicker from 'react-native-datepicker';
import { showAlert } from '../../../utils/store';

class UsuarioEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isEmailValid: props.isEmailValid ? props.isEmailValid : false,
            email: props.email ? props.email : '',
            senha: props.senha ? props.senha : '',
            data: props.data ? props.data : new Date(),
            tipoPerfil: props.tipoPerfil ? props.tipoPerfil : '',
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null,
            secureOn: true,
        };

        this.onPressConfirmar = this.onPressConfirmar.bind(this);
    }

    onPressConfirmar() {
        this.setState({ loading: true });

        const { titulo, data, scrollView } = this.state;
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
                            imagem: url });
                    }
                    return dbJogosRef.push({
                            titulo, 
                            data: dataStr,
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
                    data: dataStr
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
    
    render() {
        return (
            <Card containerStyle={styles.card}>
                <FormLabel labelStyle={styles.text}>EMAIL</FormLabel>
                <FormInput
                    selectTextOnFocus
                    containerStyle={styles.inputContainer}
                    returnKeyType={'next'}
                    inputStyle={[styles.text, styles.input]}
                    value={this.state.email}
                    onChangeText={(value) => {
                        if (this.props.keyItem) {
                            this.setState({ email: value });
                        } else {
                            this.setState({ email: value });
                            this.props.onChangeSuperState({ email: value });
                        }
                    }}
                    underlineColorAndroid={'transparent'}
                    onSubmitEditing={() => this.inputSenha.focus()}
                />
                { 
                    this.state.isEmailValid &&
                    <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                }
                <FormLabel labelStyle={styles.text}>SENHA</FormLabel>
                <View>
                    <FormInput
                        selectTextOnFocus
                        autoCorrect={false}
                        secureTextEntry={this.state.secureOn}
                        ref={(ref) => { this.inputSenha = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.senha}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ senha: value });
                            } else {
                                this.setState({ senha: value });
                                this.props.onChangeSuperState({ senha: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputDate.onPressDate()}
                    />
                    <TouchableOpacity 
                        style={styles.eye}
                        onPressIn={() => this.setState({ secureOn: false })}
                        onPressOut={() => this.setState({ secureOn: true })}
                    >
                        <Icon
                            name='eye' 
                            type='material-community' 
                            size={24} color='#9E9E9E' 
                        />
                    </TouchableOpacity>
                </View>
                <FormLabel labelStyle={styles.text}>DATA ANIVERSÁRIO</FormLabel>
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
                            } else {
                                this.setState({ data: date }); 
                                this.props.onChangeSuperState({ data: date });
                            }
                        }}
                    />
                </View>
                <FormLabel labelStyle={styles.text}>PERFIL</FormLabel>
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
                    <Picker
                        ref={(ref) => { this.inputTipoPerfil = ref; }}
                        selectedValue={this.state.tipoPerfil}
                        style={{ height: 50, width: '105%', marginLeft: -4 }}
                        onValueChange={(value) => this.setState({ tipoPerfil: value })}
                    >
                        <Picker.Item label={'Sócio'} value={'socio'} />
                        <Picker.Item label={'Sócio Patrimonial'} value={'sociopatrim'} />
                        <Picker.Item label={'Sócio Contribuinte'} value={'sociocontrib'} />
                    </Picker>
                </View>
                <Button 
                    small
                    loading={this.state.loading}
                    disabled={this.state.loading}
                    loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                    title={this.state.loading ? ' ' : 'Confirmar'} 
                    buttonStyle={{ width: '100%', marginVertical: 30 }}
                    onPress={() => this.onPressConfirmar()}
                />
            </Card>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
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
    },
    eye: { 
        position: 'absolute', 
        right: 0, 
        marginHorizontal: 20,
        marginTop: 5,
        zIndex: 1
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(UsuarioEdit);
