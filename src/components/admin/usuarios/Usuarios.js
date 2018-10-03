import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Text,
    Switch
} from 'react-native';

import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { 
    Card, 
    Icon,
    SearchBar,
    Divider,
    List,
    ListItem
} from 'react-native-elements';
import _ from 'lodash';
import b64 from 'base-64';

import ModalDropdown from 'react-native-modal-dropdown';
import { colorAppS, colorAppF } from '../../../utils/constantes';
import { showAlert } from '../../../utils/store';
import UsuarioEdit from './UsuarioEdit';
import {
    modificaFilterStr,
    modificaFilterLoad,
    modificaItemSelected,
    modificaFlagDisableUser
} from '../../../actions/UsuariosActions';
import { modificaRemocao } from '../../../actions/AlertSclActions';
import imgAvatar from '../../../imgs/perfiluserimg.png';

class Usuarios extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dropWidth: 0,
            modalOpt: 'Cadastrar',
            itemEdit: {},
            idxMdl: 0,
            email: '',
            senha: '',
            nome: '',
            data: '',
            tipoPerfil: ''
        };

        this.scrollView = null;

        this.renderEditar = this.renderEditar.bind(this);
        this.renderSwitchType = this.renderSwitchType.bind(this);
        this.onPressEditRemove = this.onPressEditRemove.bind(this);
        this.onChangeSuperState = this.onChangeSuperState.bind(this);
        this.renderListUsuariosEdit = this.renderListUsuariosEdit.bind(this);
        this.onFilterUsuariosEdit = this.onFilterUsuariosEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderIcons = this.renderIcons.bind(this);
        this.checkConInfo = this.checkConInfo.bind(this);
    }

    onPressEditRemove(item) {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagDisableUser(true);
        this.props.modificaRemocao(true);
        if (item.userDisabled && item.userDisabled === 'true') {
            showAlert('danger', 'Habilitar!', 'Deseja habilitar o usuário selecionado ?');
        } else {
            showAlert('danger', 'Desabilitar!', 'Deseja desabilitar o usuário selecionado ?');
        }
    }

    onChangeSuperState(newState) {
        this.setState({ ...newState });
    }

    onFilterUsuariosEdit(usuarios, filterStr) {
        return _.filter(usuarios, (usuario) => (
                usuario.email.includes(filterStr) ||
                usuario.dtnasc.includes(filterStr) ||
                usuario.tipoPerfil.includes(filterStr) ||
                usuario.nome.includes(filterStr)
        ));
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

    renderIcons(item) {
        return (
            <View 
                style={{ 
                    flex: 0.5, 
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            this.scrollView.scrollTo({
                                y: 0,
                                duration: 0,
                                animated: false
                            });
                            this.setState({ 
                                modalOpt: 'Em Edição', 
                                itemEdit: item 
                            });
                        }}
                    >
                        <Icon
                            name='square-edit-outline' 
                            type='material-community' 
                            size={30} color='green' 
                        />   
                    </TouchableOpacity>
                </View>
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >     
                    <Switch 
                        value={item.userDisabled === 'false'}
                        onValueChange={() => this.checkConInfo(() => this.onPressEditRemove(item))}
                    />
                </View>
            </View>
        );
    }

    renderListUsuariosEdit(usuarios) {
        let usuariosView = null;

        if (usuarios.length) {
            const newSortedUsers = _.orderBy(usuarios, ['nome', 'emai'], ['asc', 'asc']);
            usuariosView = (
                <List containerStyle={{ marginBottom: 20 }}>
                {
                    newSortedUsers.map((item, index) => {
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                        return (
                            <ListItem
                                roundAvatar
                                avatar={imgAvt}
                                key={index}
                                title={item.nome}
                                subtitle={item.email}
                                rightIcon={(
                                    this.renderIcons(item)
                                )}
                            />
                        );
                    })
                }
                </List>
            );
        }

        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return usuariosView;
    }

    renderBasedFilterOrNot() {
        const { listUsuarios, filterStr } = this.props;
        let usuariosView = null;
        if (listUsuarios) {
            if (filterStr) {
                usuariosView = this.renderListUsuariosEdit(
                    this.onFilterUsuariosEdit(listUsuarios, filterStr)
                );
            } else {
                usuariosView = this.renderListUsuariosEdit(listUsuarios);
            }
        }
        return usuariosView;
    }

    renderEditar() {
        return (
            <Card containerStyle={styles.card}>
                <SearchBar
                    round
                    lightTheme
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    clearIcon={!!this.props.filterStr}
                    showLoadingIcon={this.props.filterLoad}
                    containerStyle={{ 
                        backgroundColor: 'transparent',
                        borderTopWidth: 0, 
                        borderBottomWidth: 0
                    }}
                    searchIcon={{ size: 26 }}
                    value={this.props.filterStr}
                    onChangeText={(value) => {
                        this.props.modificaFilterStr(value);
                        this.props.modificaFilterLoad(true);
                    }}
                    onClear={() => this.props.modificaFilterStr('')}
                    placeholder='Buscar usuário...' 
                />
                { this.renderBasedFilterOrNot() }
            </Card>
        );
    }

    renderSwitchType(modalOpt) {
        switch (modalOpt) {
            case 'Cadastrar':
                return (
                    <UsuarioEdit 
                        scrollView={() => this.scrollView}
                        email={this.state.email}
                        senha={this.state.senha}
                        nome={this.state.nome}
                        data={this.state.data}
                        tipoPerfil={this.state.tipoPerfil}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
            case 'Editar':
                return this.renderEditar();
            case 'Em Edição':
                return (
                    <UsuarioEdit 
                        scrollView={() => this.scrollView}
                        email={this.state.itemEdit.email}
                        senha={this.state.itemEdit.senha}
                        nome={this.state.itemEdit.nome}
                        data={this.state.itemEdit.data}
                        tipoPerfil={this.state.itemEdit.tipoPerfil}
                        keyItem={b64.encode(this.state.itemEdit.email)}
                    />);
            default:
                return (
                    <UsuarioEdit 
                        scrollView={() => this.scrollView}
                        email={this.state.email}
                        senha={this.state.senha}
                        nome={this.state.nome}
                        data={this.state.data}
                        tipoPerfil={this.state.tipoPerfil}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
        }
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <View style={{ flexDirection: 'row' }}>
                    <View 
                        style={{ flex: 1 }}
                        onLayout={
                            (event) =>
                                this.setState({
                                    dropWidth: event.nativeEvent.layout.width
                        })}
                    />
                    <Card
                        containerStyle={
                            this.state.modalOpt !== 'Em Edição' ?
                            styles.dropCard : styles.dropCardRed
                        }
                    >
                        { 
                            this.state.dropWidth && this.state.modalOpt !== 'Em Edição' ?
                            (
                                <View style={{ flexDirection: 'row' }}>
                                    <ModalDropdown
                                        ref={(ref) => { this.modalDropRef = ref; }}
                                        style={{
                                            width: this.state.dropWidth - 1
                                        }}
                                        textStyle={styles.dropModalBtnText}
                                        dropdownTextStyle={{ fontSize: 16 }}
                                        options={['Cadastrar', 'Editar']}
                                        onSelect={(index, value) => {
                                            this.scrollView.scrollTo({
                                                y: 0,
                                                duration: 0,
                                                animated: false
                                            });
                                            this.setState({
                                                modalOpt: value,
                                                idxMdl: parseInt(index, 10)
                                            });
                                        }}
                                        defaultIndex={this.state.idxMdl}
                                        defaultValue={this.state.modalOpt}
                                    />
                                    <Icon
                                        pointerEvents={'none'}
                                        containerStyle={{
                                            left: 0,
                                            top: 0,
                                            right: 0,
                                            bottom: 0, 
                                            position: 'absolute', 
                                            zIndex: 1,
                                            alignItems: 'flex-end',
                                            paddingRight: 5

                                        }}
                                        name='arrow-down-thick' 
                                        type='material-community' 
                                        size={26} color='white' 
                                    />
                                </View>
                            )
                            :
                            (
                                <TouchableOpacity 
                                    onPress={() => {
                                        this.scrollView.scrollTo({
                                            y: 0,
                                            duration: 0,
                                            animated: false
                                        });
                                        this.setState({
                                        modalOpt: 'Editar',
                                        idxMdl: 1
                                    }); 
                                }}
                                >
                                    <Text 
                                        style={[styles.dropModalBtnText, { marginHorizontal: 40 }]}
                                    >
                                        {this.state.modalOpt !== 'Em Edição' ? ' ' : 'Voltar'}
                                    </Text>
                                    {
                                        this.state.modalOpt === 'Em Edição' && 
                                        <Icon
                                            pointerEvents={'none'}
                                            containerStyle={{
                                                left: 0,
                                                top: 0,
                                                right: 0,
                                                bottom: 0, 
                                                position: 'absolute', 
                                                zIndex: 1,
                                                alignItems: 'flex-start',
                                                paddingRight: 5

                                            }}
                                            name='arrow-left-thick' 
                                            type='material-community' 
                                            size={26} color='white' 
                                        />
                                    }
                                </TouchableOpacity>
                            )
                        }
                    </Card>
                </View>
                <Divider
                    style={{
                        marginTop: 10,
                        marginHorizontal: 15,
                        height: 2,
                        backgroundColor: colorAppS,
                    }}
                />
                <ScrollView 
                    style={{ flex: 1 }} 
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    { this.renderSwitchType(this.state.modalOpt) }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    card: {
        paddingHorizontal: 10,
    },
    dropCard: { 
        backgroundColor: colorAppS,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 0,
    },
    dropCardRed: { 
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
    },
    dropModalBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 8
    }
});

const mapStateToProps = (state) => ({
    listUsuarios: state.UsuariosReducer.listUsuarios,
    filterStr: state.UsuariosReducer.filterStr,
    filterLoad: state.UsuariosReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaFilterStr,
    modificaFilterLoad,
    modificaItemSelected,
    modificaRemocao,
    modificaFlagDisableUser
})(Usuarios);
