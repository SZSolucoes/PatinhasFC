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
import { usuarioAttr } from '../../../utils/userUtils';

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
            tipoPerfilIos: this.getPerfilIOS(props.tipoPerfil ? props.tipoPerfil : ''),
            tipoUsuario: props.tipoUsuario ? props.tipoUsuario : '1',
            tipoUsuarioIos: this.getTipoUsuarioIOS(props.tipoUsuario ? props.tipoUsuario : ''),
            loading: props.loading ? props.loading : false,
            scrollView: props.scrollView ? props.scrollView : null,
            secureOn: true
        };

        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.renderUserType = this.renderUserType.bind(this);
        this.getPerfilIOS = this.getPerfilIOS.bind(this);
        this.getTipoUsuarioIOS = this.getTipoUsuarioIOS.bind(this);
    }

    onPressConfirmar() {
        this.setState({ loading: true });

        const { email, senha, nome, data, tipoPerfil, tipoUsuario, scrollView } = this.state;
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
            dataStr = Moment(data).format('DD/MM/YYYY');
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
                tipoPerfil,
                level: tipoUsuario
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
                    ...usuarioAttr,
                    userDisabled: 'false',
                    email,
                    senha,
                    nome,
                    dtnasc: dataStr, 
                    tipoPerfil,
                    level: tipoUsuario,
                    dataCadastro: dataAtual
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

    getPerfilIOS(value) {
        switch (value) {
            case 'visitante':
                return 'Visitante';
            case 'sociocontrib':
                return 'Sócio Contribuinte';
            case 'sociopatrim':
                return 'Sócio Patrimonial';
            case 'socio':
                return 'Sócio';
            default:
                return 'Sócio';
        }
    }

    getTipoUsuarioIOS(value) {
        switch (value) {
            case '0':
                return 'Administrador';
            case '1':
                return 'Comum';
            default:
                return 'Comum';
        }
    }

    renderUserType() {
        let renderField = false;
        
        if (this.props.userLevel === '255') {
            renderField = this.props.tipoUsuario !== '255';
        } 
        
        if (renderField) {
            return (
                <View>
                    <FormLabel labelStyle={styles.text}>TIPO DE USUÁRIO</FormLabel>
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
                                ref={(ref) => { this.inputTipoUsuario = ref; }}
                                selectedValue={this.state.tipoUsuario}
                                style={{ height: 50, width: '105%', marginLeft: -4 }}
                                onValueChange={(value) => {
                                    if (this.props.keyItem) {
                                        this.setState({ tipoUsuario: value });
                                    } else {
                                        this.setState({ tipoUsuario: value });
                                        this.props.onChangeSuperState({ 
                                            tipoUsuario: value 
                                        });
                                    }
                                }}
                            >
                                <Picker.Item label={'Comum'} value={'1'} />
                                <Picker.Item label={'Administrador'} value={'0'} />
                            </Picker>
                            )
                            :
                            (
                                <TouchableWithoutFeedback
                                    onPress={() =>
                                        ActionSheetIOS.showActionSheetWithOptions({
                                            options: [
                                                'Comum',
                                                'Administrador'
                                            ]
                                        },
                                        (buttonIndex) => {
                                            let value = '';
                                            let label = '';
                                            switch (buttonIndex) {
                                                case 0:
                                                    value = '1';
                                                    label = 'Comum';
                                                    break;
                                                case 1:
                                                    value = '0';
                                                    label = 'Administrador';
                                                    break;
                                                default:
                                            }
                                            if (this.props.keyItem) {
                                                this.setState({ 
                                                    tipoUsuario: value, 
                                                    tipoUsuarioIos: label 
                                                });
                                            } else {
                                                this.setState({ 
                                                    tipoUsuario: value, 
                                                    tipoUsuarioIos: label 
                                                });
                                                this.props.onChangeSuperState(
                                                    { tipoUsuario: value }
                                                );
                                            }
                                        })
                                    }
                                >
                                    <View 
                                        style={{ height: 50, width: '105%', marginTop: 9 }}
                                    >
                                        <Text style={styles.text}>
                                            {this.state.tipoUsuarioIos}
                                        </Text>
                                    </View>
                                </TouchableWithoutFeedback>
                            )
                        }
                    </View>
                </View>
            );
        }

        return false;
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
                        autoCapitalize={'none'}
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
                            maxDate={Moment().format('DD/MM/YYYY')}
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
                                <Picker.Item label={'Visitante'} value={'visitante'} />
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
                                                'Sócio Contribuinte',
                                                'Visitante',
                                            ]
                                          },
                                          (buttonIndex) => {
                                            let value = '';
                                            let label = '';
                                            switch (buttonIndex) {
                                                case 3:
                                                    value = 'visitante';
                                                    label = 'Visitante';
                                                    break;
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
                    {this.renderUserType()}
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
                            if (this.props.keyItem) {
                                this.setState({
                                    isEmailValid: this.props.isEmailValid ? 
                                    this.props.isEmailValid : false,
                                    isSenhaValid: this.props.isSenhaValid ? 
                                    this.props.isSenhaValid : false,
                                    email: this.props.email ? this.props.email : '',
                                    senha: this.props.senha ? this.props.senha : '',
                                    nome: this.props.nome ? this.props.nome : '',
                                    data: this.props.data ? 
                                    this.props.data : Moment().format('DD/MM/YYYY'),
                                    tipoPerfil: this.props.tipoPerfil ? this.props.tipoPerfil : '',
                                    tipoPerfilIos: this.getPerfilIOS(
                                        this.props.tipoPerfil ? this.props.tipoPerfil : ''
                                    ),
                                    tipoUsuario: this.props.tipoUsuario ? 
                                    this.props.tipoUsuario : '1',
                                    tipoUsuarioIos: this.getTipoUsuarioIOS(
                                        this.props.tipoUsuario ? this.props.tipoUsuario : ''
                                    ),
                                    loading: this.props.loading ? this.props.loading : false,
                                });
                            } else {
                                this.setState({
                                    isEmailValid: false,
                                    isSenhaValid: false,
                                    email: '',
                                    senha: '',
                                    nome: '',
                                    data: Moment().format('DD/MM/YYYY'),
                                    tipoPerfil: '',
                                    tipoPerfilIos: this.getPerfilIOS(''),
                                    tipoUsuario: '1',
                                    tipoUsuarioIos: this.getTipoUsuarioIOS(''),
                                    loading: false
                                });
                            }
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
    },
    eye: { 
        position: 'absolute', 
        right: 0, 
        marginHorizontal: 20,
        marginTop: 5,
        zIndex: 1
    }
});

const mapStateToProps = (state) => ({
    userLevel: state.LoginReducer.userLevel
});

export default connect(mapStateToProps, {})(UsuarioEdit);
