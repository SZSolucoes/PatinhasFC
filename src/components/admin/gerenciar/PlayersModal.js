import React from 'react';
import {
    Modal, 
    View,
    TouchableWithoutFeedback,
    StyleSheet,
    Animated,
    ScrollView,
    TouchableOpacity,
    Keyboard
} from 'react-native';
import { SearchBar, Card, List, ListItem, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import Toast from 'react-native-simple-toast';
import _ from 'lodash';
import {
    modificaShowPlayersModal,
    modificaIsSubstitute,
    modificaFilterModalLoad,
    modificaFilterModalStr
} from '../../../actions/GerenciarActions';
import { retrieveImgSource } from '../../../utils/imageStorage';

import perfilUserImg from '../../../imgs/perfiluserimg.png';

class PlayersModal extends React.Component {

    constructor(props) {
        super(props);

        this.closeModal = this.closeModal.bind(this);
        this.onFilterUsuarios = this.onFilterUsuarios.bind(this);
        this.renderListUsuarios = this.renderListUsuarios.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.onChoosePlayer = this.onChoosePlayer.bind(this);
        this.checkConInfo = this.checkConInfo.bind(this);

        this.state = {
            fadeAnimValue: new Animated.Value(0)
        };
    }

    onChoosePlayer(item) {
        const { jogador, isSubstitute } = this.props;
        const newJogador = { ...jogador };
        newJogador.key = item.key;
        newJogador.nome = item.nome;
        newJogador.imgAvatar = item.imgAvatar;

        if (isSubstitute) {
            this.props.doInOrOut(jogador, false, newJogador);
        } else {
            this.props.doInOrOut(newJogador, true);
        }

        this.closeModal();
    }

    onFilterUsuarios(usuarios, filterModalStr) {
        const lowerFilter = filterModalStr.toLowerCase();
        return _.filter(usuarios, (usuario) => (
                (usuario.email && usuario.email.toLowerCase().includes(lowerFilter)) ||
                (usuario.dtnasc && usuario.dtnasc.toLowerCase().includes(lowerFilter)) ||
                (usuario.tipoPerfil && usuario.tipoPerfil.toLowerCase().includes(lowerFilter)) ||
                (usuario.nome && usuario.nome.toLowerCase().includes(lowerFilter))
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

    closeModal() {
        Animated.timing(
            this.state.fadeAnimValue,
            {
                toValue: 0,
                duration: 200
            }
        ).start(() => {
            setTimeout(() => this.props.modificaShowPlayersModal(false), 100);
            setTimeout(() => this.props.modificaIsSubstitute(false), 100);
        });
    }

    renderListUsuarios(usuarios, jogadoresCasaFt, jogadoresVisitFt) {
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
                        return (
                            <ListItem
                                roundAvatar
                                avatar={retrieveImgSource(imgAvt)}
                                key={index}
                                title={item.nome}
                                subtitle={item.email}
                                rightIcon={(<View />)}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    this.onChoosePlayer(item);
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
        return (
            <Modal
                animationType="slide"
                transparent
                visible={this.props.showPlayersModal}
                supportedOrientations={['portrait', 'landscape']}
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
                                                justifyContent: 'flex-end' 
                                            }}
                                        >
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
                                            showLoadingIcon={this.props.filterModalLoad}
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
        width: '80%',
        height: '70%',
        borderRadius: 5,
        overflow: 'hidden',
        padding: 5,
    }
});

const mapStateToProps = (state) => ({
    showPlayersModal: state.GerenciarReducer.showPlayersModal,
    isSubstitute: state.GerenciarReducer.isSubstitute,
    listUsuarios: state.UsuariosReducer.listUsuarios,
    filterModalStr: state.GerenciarReducer.filterModalStr,
    filterModalLoad: state.GerenciarReducer.filterModalLoad,
    jogador: state.GerenciarReducer.jogador,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, { 
    modificaShowPlayersModal,
    modificaIsSubstitute,
    modificaFilterModalLoad,
    modificaFilterModalStr 
})(PlayersModal);

