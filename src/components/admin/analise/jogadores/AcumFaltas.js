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
    Text
} from 'react-native';
import { SearchBar, Card, List, ListItem, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
import {
    modificaShowModal,
    modificaFilterModalLoad,
    modificaFilterModalStr
} from '../../../../actions/AnaliseJogadores';
import { retrieveImgSource } from '../../../../utils/imageStorage';
//import { checkConInfo } from '../../../../utils/jogosUtils';

import perfilUserImg from '../../../../imgs/perfiluserimg.png';
import { colorAppS } from '../../../../utils/constantes';

class AcumFaltas extends React.Component {

    constructor(props) {
        super(props);

        this.closeModal = this.closeModal.bind(this);
        this.onFilterUsuarios = this.onFilterUsuarios.bind(this);
        this.renderListUsuarios = this.renderListUsuarios.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);

        this.state = {
            fadeAnimValue: new Animated.Value(0)
        };
    }

    onFilterUsuarios(usuarios, filterModalStr) {
        const lowerFilter = filterModalStr.toLowerCase();
        return _.filter(usuarios, (usuario) => (
                (usuario.email && usuario.email.toLowerCase().includes(lowerFilter)) ||
                (usuario.dtnasc && usuario.dtnasc.toLowerCase().includes(lowerFilter)) ||
                (usuario.tipoPerfil && usuario.tipoPerfil.toLowerCase().includes(lowerFilter)) ||
                (usuario.nome && usuario.nome.toLowerCase().includes(lowerFilter)) ||
                (usuario.faltas && usuario.faltas.toLowerCase().includes(lowerFilter)) ||
                (usuario.faltasHistorico &&
                usuario.faltasHistorico[usuario.faltasHistorico.length - 1] && 
                usuario.faltasHistorico[usuario.faltasHistorico.length - 1].data && 
                usuario.faltasHistorico[usuario.faltasHistorico.length - 1].data
                .toLowerCase().includes(lowerFilter))
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
            setTimeout(() => this.props.modificaShowModal(false), 100);
        });
    }

    renderListUsuarios(usuarios) {
        let usuariosView = null;

        if (usuarios.length) {
            const filtredByUserLogged = _.filter(
                usuarios, (usr) => parseInt(usr.faltas, 10) > 0
            );
            const newSortedUsers = _.orderBy(filtredByUserLogged, ['faltas'], ['desc']);
            usuariosView = (
                <List containerStyle={{ marginBottom: 20 }}>
                {
                    newSortedUsers.map((item, index) => {
                        if ((index + 1) > 30) {
                            return false;
                        }
                        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : perfilUserImg;
                        return (
                            <View
                                key={index}
                            >
                                <ListItem
                                    roundAvatar
                                    avatar={retrieveImgSource(imgAvt)}
                                    title={item.nome}
                                    subtitle={item.email}
                                    rightIcon={(<View />)}
                                    onPress={() => {
                                        Keyboard.dismiss();
                                    }}
                                    containerStyle={{ borderBottomWidth: 0 }}
                                />
                                <View 
                                    style={{ 
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <View 
                                        style={{ 
                                            flex: 0.5,
                                            alignItems: 'center', 
                                            justifyContent: 'space-around'
                                        }}
                                    >
                                        <Text 
                                            style={{ 
                                                color: colorAppS, 
                                                fontWeight: '500',
                                                textAlign: 'center' 
                                            }}
                                        >
                                            Faltas
                                        </Text>
                                        <Text 
                                            style={{ 
                                                fontWeight: '500',
                                                textAlign: 'center' 
                                            }}
                                        >
                                            {item.faltas}
                                        </Text>
                                    </View>
                                    <View 
                                        style={{ 
                                            flex: 1,
                                            alignItems: 'center', 
                                            justifyContent: 'space-around'
                                        }}
                                    >
                                        <Text 
                                            style={{ 
                                                color: colorAppS, 
                                                fontWeight: '500',
                                                textAlign: 'center' 
                                            }}
                                        >
                                            Falta mais recente
                                        </Text>
                                        <Text 
                                            style={{ 
                                                fontWeight: '500',
                                                textAlign: 'center' 
                                            }}
                                        >
                                            {item.faltasHistorico[
                                                item.faltasHistorico.length - 1
                                            ].data}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={{ borderBottomWidth: 1, borderBottomColor: '#bbb' }} />
                            </View>
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
        const { listUsuarios, filterModalStr } = this.props;
        let usuariosView = null;
        if (listUsuarios) {
            if (filterModalStr) {
                usuariosView = this.renderListUsuarios(
                    this.onFilterUsuarios(listUsuarios, filterModalStr)
                );
            } else {
                usuariosView = this.renderListUsuarios(listUsuarios);
            }
        }
        return usuariosView;
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent
                visible={this.props.showModal}
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
                                            placeholder='Buscar jogador...' 
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
    listUsuarios: state.UsuariosReducer.listUsuarios,
    filterModalStr: state.AnaliseJogadores.filterModalStr,
    filterModalLoad: state.AnaliseJogadores.filterModalLoad,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, { 
    modificaShowModal,
    modificaFilterModalLoad,
    modificaFilterModalStr 
})(AcumFaltas);
