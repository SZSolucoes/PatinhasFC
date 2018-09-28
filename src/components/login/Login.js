import React from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    Keyboard,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Text,
    Platform,
    ImageBackground
} from 'react-native';
import { connect } from 'react-redux';
import { showAlert } from '../../utils/store';

import imgLogo from '../../imgs/patinhasfclogo.png';
import imgCampoLogo from '../../imgs/campologo.jpg';
import key from '../../imgs/keypass.png';
import { colorAppP } from '../../utils/constantes';

import {
    modificaUsername,
    modificaPassword,
    modificaHidePw,
    modificaModalVisible,
    modificaCleanLogin,
    modificaShowLogoLogin,
    modificaUserToken,
    doLogin
} from '../../actions/LoginActions';

class Login extends React.Component {

    constructor(props) {
        super(props);

        this.onTouchLogin = this.onTouchLogin.bind(this);
        this.onPressEnterBtn = this.onPressEnterBtn.bind(this);
        this.renderAnimLogin = this.renderAnimLogin.bind(this);
        this.keyboardShow = this.keyboardShow.bind(this);
        this.keyboardHide = this.keyboardHide.bind(this);
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardHide);

        this.state = { marginTop: 0, marginBottom: 0 };
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    onTouchLogin() {
        Keyboard.dismiss();
    }

    onPressEnterBtn() {
        const { username, password } = this.props;

        Keyboard.dismiss();

        if (username && password) {
            this.props.doLogin({ email: username, password });
        } else {
            showAlert('warning', 'Aviso!', 'É necessário informar usuário e senha válidos.');
        }
    }

    keyboardShow(e) {
        this.props.modificaShowLogoLogin(false);
        if (Platform.OS === 'ios') {
            this.setState({ 
                ...this.state, 
                marginTop: 60, 
                marginBottom: e.endCoordinates.height - 60 
            });
        } else {
            this.setState({ ...this.state, marginTop: 50, marginBottom: 0 });
        }
    }
    
    keyboardHide() {
        this.props.modificaShowLogoLogin(true);
        this.setState({ ...this.state, marginTop: 0, marginBottom: 0 });
    }

    renderAnimLogin() {
        if (this.props.indicator) {
            return (
                <View style={styles.loading}>
                    <ActivityIndicator size='large' color='white' />
                </View>
            );
        }
        return (
            <Text style={styles.txtMenu}>Entrar</Text>
        );
    }

    render() {
        return (
            <TouchableWithoutFeedback
                onPress={() => this.onTouchLogin()}
            >
                <ImageBackground
                    source={imgCampoLogo}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain'
                    }}
                >
                    <ScrollView 
                        style={styles.viewMain}
                        keyboardShouldPersistTaps={'handled'}
                    >
                        {
                        this.props.showLogoLogin &&
                        <View style={styles.viewLogo}>
                            <Image 
                                style={styles.imgLogo}
                                source={imgLogo}
                                resizeMode='stretch'
                            />
                        </View>
                        }
                        <View style={{ flex: 2 }}>
                            <View 
                                style={{ 
                                    marginTop: this.state.marginTop, 
                                    marginBottom: this.state.marginBottom 
                                }}
                            >
                                <View style={styles.sectionStyle}>
                                    <TextInput
                                        placeholder='E-mail'
                                        autoCorrect={false}
                                        placeholderTextColor='#f16636'
                                        returnKeyType='next'
                                        autoCapitalize='none'
                                        style={styles.input}
                                        onChangeText={username => 
                                            this.props.modificaUsername(username)}
                                        value={this.props.username}
                                        underlineColorAndroid='transparent'
                                        onSubmitEditing={() => this.txtPassword.focus()}
                                        blurOnSubmit={false}
                                    />
                                </View>
                                <View style={styles.sectionStyle}>
                                    <TextInput 
                                        ref={(input) => { this.txtPassword = input; }}
                                        placeholder='Senha'
                                        placeholderTextColor='#f16636'
                                        returnKeyType='next'
                                        autoCapitalize='none'
                                        autoCorrect={false}
                                        style={[styles.input, { marginLeft: 33 }]}
                                        secureTextEntry={this.props.hidePw}
                                        underlineColorAndroid='transparent'
                                        onChangeText={password => 
                                            this.props.modificaPassword(password)}
                                        value={this.props.password}
                                        onSubmitEditing={() => this.onPressEnterBtn()}
                                    />
                                    <TouchableOpacity
                                        onPressIn={() => this.props.modificaHidePw(false)}
                                        onPressOut={() => this.props.modificaHidePw(true)}
                                    >
                                        <Image source={key} style={styles.imageStyle} />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.loginBtn}>
                                    <TouchableOpacity 
                                        onPress={() => this.onPressEnterBtn()}
                                    >
                                        <View style={styles.menu}>
                                            {this.renderAnimLogin()}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    viewMain: {
        flex: 1
    },
    viewLogo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    imgLogo: {
        width: 300,
        height: 290,
        marginBottom: 10,
        resizeMode: 'stretch'
    },
    loginBtn: {
        marginLeft: 50,
        marginRight: 50,
        marginTop: 15
    },
    input: {
        flex: 1,
        textAlign: 'center'
    },
    sectionStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#000',
        height: 40,
        borderRadius: 5,
        marginHorizontal: 50,
        marginVertical: 10
    },
    imageStyle: {
        padding: 10,
        margin: 5,
        height: 25,
        width: 25,
        resizeMode: 'stretch',
        alignItems: 'center'
    },
    loading: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    menu: {
        flexDirection: 'row',
        backgroundColor: colorAppP,
        margin: 5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        borderRadius: 10
    },
    txtMenu: {
        fontSize: 16,
        fontWeight: 'bold',
        padding: 5,
        color: 'white'
    }
});

const mapStateToProps = state => ({
    showLogoLogin: state.LoginReducer.showLogoLogin,
    username: state.LoginReducer.username,
    password: state.LoginReducer.password,
    userToken: state.LoginReducer.userToken,
    hidePw: state.LoginReducer.hidePw,
    indicator: state.LoginReducer.indicator
});

export default connect(mapStateToProps, {
    modificaUsername,
    modificaPassword,
    modificaHidePw,
    modificaModalVisible,
    modificaCleanLogin,
    modificaShowLogoLogin,
    modificaUserToken,
    doLogin
})(Login);
