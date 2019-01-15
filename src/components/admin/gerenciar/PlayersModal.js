import React from 'react';
import {
    Modal, 
    View,
    TouchableWithoutFeedback,
    StyleSheet,
    Animated,
    ScrollView,
    TouchableOpacity,
    Keyboard,
    Text,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SearchBar, Card, List, ListItem, Icon, CheckBox } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    modificaShowPlayersModal,
    modificaShowPlayersModalJ,
    modificaIsSubstitute,
    modificaFilterModalLoad,
    modificaFilterModalStr
} from '../../../actions/GerenciarActions';
import { retrieveImgSource } from '../../../utils/imageStorage';
import { checkConInfo } from '../../../utils/jogosUtils';

import perfilUserImg from '../../../imgs/perfiluserimg.png';
import { colorAppS } from '../../../utils/constantes';

class PlayersModal extends React.Component {

    constructor(props) {
        super(props);

        this.closeModal = this.closeModal.bind(this);
        this.onFilterUsuarios = this.onFilterUsuarios.bind(this);
        this.renderListUsuarios = this.renderListUsuarios.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.onChoosePlayer = this.onChoosePlayer.bind(this);
        this.onChoosePlayersLote = this.onChoosePlayersLote.bind(this);

        this.state = {
            fadeAnimValue: new Animated.Value(0),
            checkeds: [],
            loading: false
        };
    }

    onChoosePlayer(item) {
        const { jogador, isSubstitute } = this.props;
        const newJogador = { ...jogador };
        newJogador.key = item.key;
        newJogador.nome = item.nome;
        newJogador.imgAvatar = item.imgAvatar;
        newJogador.vitorias = item.vitorias;
        newJogador.derrotas = item.derrotas;
        newJogador.empates = item.empates;
        newJogador.jogosEscalados = item.jogosEscalados;

        if (isSubstitute) {
            this.props.doInOrOut(jogador, false, newJogador);
        } else {
            this.props.doInOrOut(newJogador, true);
        }

        this.closeModal();
    }

    async onChoosePlayersLote() {
        const { jogador } = this.props;
        const { checkeds } = this.state;
        const newJogadores = [];

        if (!checkeds.length) {
            Alert.alert(
                'Aviso', 
                'Para confirmar a escalação é necessário selecionar ao menos um usuário.'
            );
            return;
        }

        this.setState({ loading: true });

        for (let index = 0; index < checkeds.length; index++) {
            const element = checkeds[index].item;
            const newJogador = { ...jogador };

            newJogador.key = element.key;
            newJogador.nome = element.nome;
            newJogador.imgAvatar = element.imgAvatar;
            newJogador.vitorias = element.vitorias;
            newJogador.derrotas = element.derrotas;
            newJogador.empates = element.empates;
            newJogador.jogosEscalados = element.jogosEscalados;
                
            newJogadores.push(newJogador);
        }
        
        await this.props.doInOrOut(newJogadores, true, true);

        this.closeModal();
    }

    onFilterUsuarios(usuarios, filterModalStr) {
        const lowerFilter = filterModalStr.toLowerCase();
        return _.filter(usuarios, (usuario) => (
                (usuario.email && usuario.email.toLowerCase().includes(lowerFilter)) ||
                (usuario.dtnasc && usuario.dtnasc.toLowerCase().includes(lowerFilter)) ||
                (usuario.tipoPerfil && usuario.tipoPerfil.toLowerCase().includes(lowerFilter)) ||
                (usuario.nome && usuario.nome.toLowerCase().includes(lowerFilter)) ||
                (usuario.nomeForm && usuario.nomeForm.toLowerCase().includes(lowerFilter))
        ));
    }

    closeModal() {
        Animated.timing(
            this.state.fadeAnimValue,
            {
                toValue: 0,
                duration: 200
            }
        ).start(() => {
            setTimeout(() => this.props.modificaShowPlayersModal(false), 100);
            setTimeout(() => this.props.modificaShowPlayersModalJ(false), 100);
            setTimeout(() => this.props.modificaIsSubstitute(false), 100);
            setTimeout(() => this.props.modificaFilterModalStr(''), 100);
            setTimeout(() => this.setState({ checkeds: [], loading: false }), 100);
        });
    }

    renderListUsuarios(usuarios, jogadoresCasaFt, jogadoresVisitFt) {
        const { isSubstitute } = this.props;
        let usuariosView = null;

        if (usuarios.length) {
            const filterInPlayers = _.filter(usuarios, (user) => {
                const indexCasa = _.findIndex(
                    jogadoresCasaFt, (jogador) => jogador.key === user.key
                );
                const indexVisit = _.findIndex(
                    jogadoresVisitFt, (jogador) => jogador.key === user.key
                );

                return !(indexCasa !== -1 || indexVisit !== -1);
            });
            const newSortedUsers = _.orderBy(filterInPlayers, ['nome', 'emai'], ['asc', 'asc']);
            usuariosView = (
                <List containerStyle={{ marginBottom: 20 }}>
                {
                    newSortedUsers.map((item, index) => {
                        if ((index + 1) > 30) {
                            return false;
                        }
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : perfilUserImg;
                        const checkedIdx = _.findIndex(
                            this.state.checkeds, itc => itc.key === item.key
                        );

                        let leftIcon = (<View />);

                        if (!isSubstitute) {
                            leftIcon = (
                                <View
                                    style={{
                                        width: 50,
                                        height: 50
                                    }}
                                >
                                    <CheckBox
                                        center
                                        containerStyle={{
                                            marginLeft: 0,
                                            marginRight: 0,
                                            position: 'absolute'
                                        }}
                                        title={(<View />)}
                                        checked={checkedIdx !== -1}
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            if (checkedIdx !== -1) {
                                                const newCheckeds = [...this.state.checkeds];
                                                newCheckeds.splice(checkedIdx, 1);
                                                this.setState({ 
                                                    checkeds: newCheckeds
                                                });
                                            } else {
                                                this.setState({ 
                                                    checkeds: [
                                                        ...this.state.checkeds, 
                                                        { key: item.key, item }
                                                    ]
                                                });
                                            }
                                        }}
                                    />
                                </View>
                            );
                        }
                        
                        return (
                            <ListItem
                                roundAvatar
                                avatar={retrieveImgSource(imgAvt)}
                                avatarContainerStyle={{ marginRight: 5 }}
                                key={index}
                                title={item.nome}
                                subtitle={item.email}
                                leftIcon={leftIcon}
                                rightIcon={(<View />)}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    if (isSubstitute) {
                                        checkConInfo(() => this.onChoosePlayer(item));
                                        return;
                                    }

                                    if (checkedIdx !== -1) {
                                        const newCheckeds = [...this.state.checkeds];
                                        newCheckeds.splice(checkedIdx, 1);
                                        this.setState({ 
                                            checkeds: newCheckeds
                                        });
                                    } else {
                                        this.setState({ 
                                            checkeds: [
                                                ...this.state.checkeds, 
                                                { key: item.key, item }
                                            ]
                                        });
                                    }
                                }}
                            />
                        );
                    })
                }
                </List>
            );
        }

        setTimeout(() => this.props.modificaFilterModalLoad(false), 1000);
        return usuariosView;
    }

    renderBasedFilterOrNot() {
        const { listUsuarios, filterModalStr, jogadoresCasaFt, jogadoresVisitFt } = this.props;
        let usuariosView = null;
        if (listUsuarios) {
            if (filterModalStr) {
                usuariosView = this.renderListUsuarios(
                    this.onFilterUsuarios(listUsuarios, filterModalStr),
                    jogadoresCasaFt,
                    jogadoresVisitFt
                );
            } else {
                usuariosView = this.renderListUsuarios(
                    listUsuarios, jogadoresCasaFt, jogadoresVisitFt
                );
            }
        }
        return usuariosView;
    }

    render() {
        let confirmBtn = (<View />);

        if (!this.props.isSubstitute) {
            if (this.state.loading) {
                confirmBtn = (
                    <View
                        style={{ 
                            justifyContent: 'center', 
                            paddingLeft: 15,
                            paddingVertical: 5
                        }}
                    >
                        <ActivityIndicator size={'small'} color={colorAppS} />
                    </View>
                );
            } else {
                confirmBtn = (
                    <View
                        style={{ 
                            justifyContent: 'center', 
                            paddingLeft: 15,
                            paddingVertical: 5
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                Keyboard.dismiss();
                                checkConInfo(
                                    () => this.onChoosePlayersLote()
                                );
                            }}
                        >
                            <Text 
                                style={{ 
                                    color: colorAppS,
                                    fontWeight: '500',
                                    fontSize: 18 
                                }}
                            >
                                Confirmar
                            </Text>
                        </TouchableOpacity>
                    </View>
                );
            }
        }
        return (
            <Modal
                animationType="slide"
                transparent
                visible={this.props.showPlayersModal}
                supportedOrientations={['portrait']}
                onRequestClose={() => this.closeModal()}
                onShow={() =>
                    Animated.timing(
                        this.state.fadeAnimValue,
                        {
                            toValue: 0.5,
                            duration: 800
                        }
                    ).start()
                }
            >
                <TouchableWithoutFeedback
                    onPress={() => this.closeModal()}
                >
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: this.state.fadeAnimValue.interpolate({
                                inputRange: [0, 0.5],
                                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
                            })
                        }}
                    >
                        <TouchableWithoutFeedback
                            onPress={() => {
                                Keyboard.dismiss();
                                this.closeModal();
                            }}
                        >
                            <View style={styles.viewPricinp} >
                                <TouchableWithoutFeedback
                                    onPress={() => Keyboard.dismiss()}
                                >  
                                    <Card containerStyle={styles.card}>
                                        <View 
                                            style={{ 
                                                flexDirection: 'row', 
                                                justifyContent: 'space-between' 
                                            }}
                                        >
                                            {confirmBtn}
                                            <TouchableOpacity
                                                onPress={() => {
                                                    Keyboard.dismiss();
                                                    this.closeModal();
                                                }}
                                            >   
                                                <View 
                                                    style={{  
                                                        alignItems: 'flex-end',  
                                                    }}
                                                >
                                                    <Icon
                                                        name='close-box-outline' 
                                                        type='material-community' 
                                                        size={28} color='black'
                                                        iconStyle={{ opacity: 0.8, margin: 5 }}
                                                    />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        <SearchBar
                                            round
                                            lightTheme
                                            autoCapitalize={'none'}
                                            autoCorrect={false}
                                            clearIcon={!!this.props.filterModalStr}
                                            showLoadingIcon={
                                                this.props.listUsuarios &&
                                                this.props.listUsuarios.length > 0 && 
                                                this.props.filterModalLoad
                                            }
                                            containerStyle={{ 
                                                backgroundColor: 'transparent',
                                                borderTopWidth: 0, 
                                                borderBottomWidth: 0
                                            }}
                                            searchIcon={{ size: 26 }}
                                            value={this.props.filterModalStr}
                                            onChangeText={(value) => {
                                                this.props.modificaFilterModalStr(value);
                                                this.props.modificaFilterModalLoad(true);
                                            }}
                                            onClear={() => this.props.modificaFilterModalStr('')}
                                            placeholder='Buscar usuário...' 
                                        />
                                        <ScrollView
                                            style={{ height: '72%' }}
                                        >
                                            { this.renderBasedFilterOrNot() }
                                        </ScrollView>
                                    </Card>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    viewPricinp: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },
    card: {
        width: '90%',
        height: '70%',
        borderRadius: 5,
        overflow: 'hidden',
        padding: 5,
    }
});

const mapStateToProps = (state) => ({
    isSubstitute: state.GerenciarReducer.isSubstitute,
    listUsuarios: state.UsuariosReducer.listUsuarios,
    filterModalStr: state.GerenciarReducer.filterModalStr,
    filterModalLoad: state.GerenciarReducer.filterModalLoad,
    jogador: state.GerenciarReducer.jogador
});

export default connect(mapStateToProps, { 
    modificaShowPlayersModal,
    modificaShowPlayersModalJ,
    modificaIsSubstitute,
    modificaFilterModalLoad,
    modificaFilterModalStr 
})(PlayersModal);

