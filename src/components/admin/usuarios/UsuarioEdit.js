import React from 'react';
import { 
    View,
    StyleSheet,
    Platform,
    TouchableOpacity,
    Picker,
    TouchableWithoutFeedback,
    Text,
    ActionSheetIOS
} from 'react-native';

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

import DatePicker from 'react-native-datepicker';
import firebase from '../../../Firebase';
import { showAlert } from '../../../utils/store';
import { colorAppF } from '../../../utils/constantes';
import { checkConInfo } from '../../../utils/jogosUtils';

class UsuarioEdit extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isEmailValid: props.isEmailValid ? props.isEmailValid : false,
            isSenhaValid: props.isSenhaValid ? props.isSenhaValid : false,
            email: props.email ? props.email : '',
            senha: props.senha ? props.senha : '',
            nome: props.nome ? props.nome : '',
            data: props.data ? props.data : Moment().format('DD/MM/YYYY'),
            tipoPerfil: props.tipoPerfil ? props.tipoPerfil : '',
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null,
            secureOn: true,
            tipoPerfilIos: 'Sócio'
        };

        this.onPressConfirmar = this.onPressConfirmar.bind(this);
    }

    onPressConfirmar() {
        this.setState({ loading: true });

        const { email, senha, nome, data, tipoPerfil, scrollView } = this.state;
        const { keyItem } = this.props;
        let dataAtual = '';
        let dataStr = '';
        const isValid = { isEmailValid: true, isSenhaValid: true };
        isValid.isEmailValid = !email;
        isValid.isSenhaValid = !senha;

        if (isValid.isEmailValid || isValid.isSenhaValid) {
            this.setState({
                ...isValid,
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

        const databaseRef = firebase.database().ref();
        const auth = firebase.auth();
        dataAtual = Moment().format('DD/MM/YYYY HH:mm:ss');
        const emailUser64 = b64.encode(email);

        if (data instanceof Moment) {
            dataStr = Moment(dataStr).format('DD/MM/YYYY');
        } else {
            dataStr = data;
        }

        const dbUsuariosRef = keyItem ? 
        databaseRef.child(`usuarios/${keyItem}`) 
        : 
        databaseRef.child(`usuarios/${emailUser64}`);

        if (keyItem) {
            dbUsuariosRef.update({
                email,
                senha,
                nome,
                dtnasc: dataStr, 
                tipoPerfil
            })
            .then(() => {
                this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                showAlert('success', 'Sucesso!', 'Edição realizada com sucesso.');
            })
            .catch(() => {
                this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                showAlert(
                    'danger', 
                    'Ops!', 
                    'Ocorreu um erro ao editar o usuário.'
                );
            });  
        } else {
            auth.createUserWithEmailAndPassword(email, senha)
            .then(() => {
                const newUser = {
                    userDisabled: 'false',
                    email,
                    senha,
                    nome,
                    dtnasc: dataStr, 
                    tipoPerfil,
                    imgAvatar: '',
                    imgBackground: '',
                    level: '1',
                    telefone: '',
                    endereco: '',
                    dataCadastro: dataAtual,
                    dataHoraUltimoLogin: '',
                    jogosParticipados: '0',
                    jogosEscalados: '0',
                    vitorias: '0',
                    derrotas: '0',
                    empates: '0',
                    gols: '0',
                    faltas: '0',
                    cartoesAmarelos: '0',
                    cartoesVermelhos: '0',
                    posicao: '',
                    userNotifToken: ''
                };
                dbUsuariosRef.set({ ...newUser })
                .then(() => {
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                    showAlert('success', 'Sucesso!', 'Cadastro realizado com sucesso.');
                })
                .catch(() => {
                    this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                    showAlert(
                        'danger', 
                        'Ops!', 
                        'Ocorreu um erro ao cadastrar o usuário.'
                    );
                });
            })
            .catch((error) => {
                this.setState({ loading: false, isEmailValid: false, isSenhaValid: false });
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        showAlert('danger', 'Erro!', 'Email já cadastrado.');
                        break;
                    case 'auth/invalid-email':
                        showAlert('danger', 'Erro!', 'Email informado não é válido..');
                        break;
                    case 'auth/operation-not-allowed':
                        showAlert(
                            'danger', 
                            'Erro!', 
                            'Cadastro de usuários desabilitado no firebase.'
                        );
                        break;
                    case 'auth/weak-password':
                        showAlert('danger', 'Erro!', 'A senha informada é insegura.');
                        break;
                    default:
                }
            }); 
        }
    }

    render() {
        return (
            <View>
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
                            onSubmitEditing={() => this.inputNome.focus()}
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
                    { 
                        this.state.isSenhaValid &&
                        <FormValidationMessage>Campo obrigatório</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>NOME</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        ref={(ref) => { this.inputNome = ref; }}
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.nome}
                        onChangeText={(value) => {
                            if (this.props.keyItem) {
                                this.setState({ nome: value });
                            } else {
                                this.setState({ nome: value });
                                this.props.onChangeSuperState({ nome: value });
                            }
                        }}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputDate.onPressDate()}
                    />
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
                        {
                            Platform.OS === 'android' ?
                            (
                            <Picker
                                ref={(ref) => { this.inputTipoPerfil = ref; }}
                                selectedValue={this.state.tipoPerfil}
                                style={{ height: 50, width: '105%', marginLeft: -4 }}
                                onValueChange={(value) => {
                                    if (this.props.keyItem) {
                                        this.setState({ tipoPerfil: value });
                                    } else {
                                        this.setState({ tipoPerfil: value });
                                        this.props.onChangeSuperState({ tipoPerfil: value });
                                    }
                                }}
                            >
                                <Picker.Item label={'Sócio'} value={'socio'} />
                                <Picker.Item label={'Sócio Patrimonial'} value={'sociopatrim'} />
                                <Picker.Item label={'Sócio Contribuinte'} value={'sociocontrib'} />
                            </Picker>
                            )
                            :
                            (
                                <TouchableWithoutFeedback
                                    onPress={() =>
                                        ActionSheetIOS.showActionSheetWithOptions({
                                            options: [
                                                'Sócio',
                                                'Sócio Patrimonial', 
                                                'Sócio Contribuinte'
                                            ]
                                          },
                                          (buttonIndex) => {
                                            let value = '';
                                            let label = '';
                                            switch (buttonIndex) {
                                                case 2:
                                                    value = 'sociocontrib';
                                                    label = 'Sócio Contribuinte';
                                                    break;
                                                case 1:
                                                    value = 'sociopatrim';
                                                    label = 'Sócio Patrimonial';
                                                    break;
                                                case 0:
                                                    value = 'socio';
                                                    label = 'Sócio';
                                                    break;
                                                default:
                                            }
                                            if (this.props.keyItem) {
                                                this.setState({ 
                                                    tipoPerfil: value, 
                                                    tipoPerfilIos: label 
                                                });
                                            } else {
                                                this.setState({ 
                                                    tipoPerfil: value, 
                                                    tipoPerfilIos: label 
                                                });
                                                this.props.onChangeSuperState(
                                                    { tipoPerfil: value }
                                                );
                                            }
                                        })
                                    }
                                >
                                    <View style={{ height: 50, width: '105%', marginTop: 9 }} >
                                        <Text style={styles.text}>{this.state.tipoPerfilIos}</Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }
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
                        title={'Limpar'} 
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={() => this.setState({
                            email: '',
                            senha: '',
                            nome: '',
                            data: new Date(),
                            tipoPerfil: '',
                            tipoPerfilIos: 'Sócio'
                        })}
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
