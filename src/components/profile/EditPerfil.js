import React from 'react';
import { 
    View, 
    StyleSheet,
    ScrollView,
    Platform,
    TouchableOpacity
} from 'react-native';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage, 
    Card, 
    Button, 
    Icon
} from 'react-native-elements';
import DatePicker from 'react-native-datepicker';

import { connect } from 'react-redux';
import { checkConInfo } from '../../utils/jogosUtils';

class EditPerfil extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            userLogged: { ...this.props.userLogged }
        };
    }

    render() {
        return (
            <ScrollView style={styles.viewPrinc}>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.text}>NOME</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.userLogged.nome}
                        onChangeText={(value) => this.setState(
                            { userLogged: { ...this.state.userLogged, nome: value } }
                        )}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputSenha.focus()}
                    />
                    <FormLabel labelStyle={styles.text}>DATA NASCIMENTO</FormLabel>
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
                    <FormLabel labelStyle={styles.text}>ENDEREÇO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.userLogged.endereco}
                        onChangeText={(value) => this.setState(
                            { userLogged: { ...this.state.userLogged, endereco: value } }
                        )}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputSenha.focus()}
                    />
                    <FormLabel labelStyle={styles.text}>TELEFONE</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]}
                        value={this.state.userLogged.telefone}
                        onChangeText={(value) => this.setState(
                            { userLogged: { ...this.state.userLogged, telefone: value } }
                        )}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.inputSenha.focus()}
                    />
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
                <Card containerStyle={styles.card}>
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
                    <FormLabel labelStyle={styles.text}>NOVA SENHA</FormLabel>
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
            </ScrollView>
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

const mapStateToProps = (state) => ({
    userLogged: state.LoginReducer.userLogged,
    username: state.LoginReducer.username
});

export default connect(mapStateToProps, {})(EditPerfil);
