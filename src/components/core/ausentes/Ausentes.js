/* eslint-disable max-len */
import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    View,
    Text,
    Image,
    Alert,
    TouchableOpacity
} from 'react-native';
import { List, Badge, Icon } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import _ from 'lodash';
import Moment from 'moment';
import { colorAppF } from '../../../utils/constantes';
import ListItem from '../../tools/ListItem';
import Card from '../../tools/Card';
//import Campo from '../../campo/Campo';
import imgTeam from '../../../imgs/team.png';
import imgAvatar from '../../../imgs/perfiluserimg.png';
import firebase from '../../../Firebase';
import { checkConInfo } from '../../../utils/jogosUtils';

class Ausentes extends React.Component {
    shouldComponentUpdate = (nextProps, nextStates) => {
        const { itemSelectedAusente } = this.props;

        if (nextProps.listJogos) {
            const nj = _.filter(nextProps.listJogos, (item) => item.key === itemSelectedAusente.key)[0];
                
            if (!nj) {
                return false;
            }
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    onPressConfirmA = (jogo, user) => {
        const funExec = () => {
            const newAusentesList = jogo.ausentes ? 
            [...jogo.ausentes] : [];
            const dataAtual = Moment().format('YYYY-MM-DD HH:mm:ss');
    
            newAusentesList.push({
                key: user.key,
                imgAvatar: user.imgAvatar,
                nome: user.nome,
                horaConfirm: dataAtual
            });
    
            firebase.database().ref().child(`jogos/${jogo.key}`).update({
                ausentes: newAusentesList,
            })
            .then(() => Toast.show('Ausência confirmada', Toast.SHORT))
            .catch(() => Toast.show('Falha ao confirmar ausência', Toast.SHORT));
        };

        Alert.alert(
            'Aviso', 
            `Deseja confirmar a ausência do jogador "${user.nome}" ?`,
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(
                    () => funExec())
                }
            ],
            { cancelable: true }
        );
    }

    onPressConfirmP = (jogo, user) => {
        const userAusenteIndex = _.findIndex(
            jogo.ausentes, 
            (usuario) => usuario.key && usuario.key === user.key);

        const funExec = (newAusentesList = false, noGameKey = 'no') => {
            const newConfirmadosList = jogo.confirmados ? 
            [...jogo.confirmados] : [];
            const dataAtual = Moment().format('YYYY-MM-DD HH:mm:ss');
            const ausentes = newAusentesList ? { ausentes: newAusentesList } : {};
    
            newConfirmadosList.push({
                key: user.key,
                imgAvatar: user.imgAvatar,
                nome: user.nome,
                horaConfirm: dataAtual,
                noGame: noGameKey
            });
    
            firebase.database().ref().child(`jogos/${jogo.key}`).update({
                confirmados: newConfirmadosList,
                ...ausentes
            })
            .then(() => Toast.show('Confirmação efetuada', Toast.SHORT))
            .catch(() => Toast.show('Falha ao confirmar jogador', Toast.SHORT));
        };

        if (userAusenteIndex !== -1) {
            let newAusentesList = [];
            newAusentesList = [...jogo.ausentes];
            newAusentesList.splice(userAusenteIndex, 1);

            Alert.alert(
                'Aviso', 
                `Deseja confirmar a presença do jogador "${user.nome}" ?`,
                [
                    { text: 'Cancelar', onPress: () => false },
                    { 
                        text: 'Sem Jogar', 
                        onPress: () => checkConInfo(
                        () => funExec(newAusentesList, 'yes')) 
                    },
                    { 
                        text: 'Jogar', 
                        onPress: () => checkConInfo(
                        () => funExec(newAusentesList, 'no')) 
                    }
                ],
                { cancelable: true }
            );
        } else {
            Alert.alert(
                'Aviso', 
                `Deseja confirmar a presença do jogador "${user.nome}" ?`,
                [
                    { text: 'Cancelar', onPress: () => false },
                    { 
                        text: 'Sem Jogar', 
                        onPress: () => checkConInfo(
                        () => funExec(false, 'yes'))
                    },
                    { 
                        text: 'Jogar', 
                        onPress: () => checkConInfo(
                        () => funExec(false, 'no'))
                    }
                ],
                { cancelable: true }
            );
        }
    }

    onRemoveAusente = (jogo, item) => {
        const asyncFunExec = async () => {
            const dbFirebaseRef = firebase.database().ref().child(`jogos/${jogo.key}`);
            dbFirebaseRef.once('value', snap => {
                if (snap) {
                    const snapVal = snap.val();
                    if (snapVal) {
                        const ausentes = snapVal.ausentes;

                        if (ausentes instanceof Array && ausentes.length) {
                            const filtredNewAusentes = _.filter(
                                ausentes, ita => ita.push || (ita.key && (ita.key !== item.key))
                            );
                            dbFirebaseRef.update({
                                ausentes: filtredNewAusentes
                            })
                            .then(() => Toast.show('Ausência removida', Toast.SHORT))
                            .catch(
                                () => Toast.show('Falha ao remover jogador ausente', Toast.SHORT)
                            );

                            return;
                        }
                    }
                }

                Toast.show('Falha ao remover jogador ausente', Toast.SHORT);
                return;
            }, 
                () => Toast.show('Falha ao remover jogador ausente', Toast.SHORT)
            );
        };

        Alert.alert(
            'Aviso',
            `Confirma a remoção do jogador\n( ${item.nome} ) da lista de ausentes ?`,
            [
                { 
                    text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(
                        () => asyncFunExec()
                    )
                }
            ]
        );
    }

    renderRightConfirm = (jogo, userKey, type = '') => (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            { 
                type === 'pendentes' && (
                    <TouchableOpacity
                        onPress={() => this.onPressConfirmA(jogo, userKey)}
                    >
                        <View
                            style={{
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Icon 
                                name='wallet-travel'
                                type='material-community'
                                size={26} 
                            />
                        </View>
                    </TouchableOpacity>
                )
            }
            <View style={{ marginLeft: 10 }} />
            <TouchableOpacity
                onPress={() => this.onPressConfirmP(jogo, userKey)}
            >
                <View
                    style={{
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Icon 
                        name='account-convert'
                        type='material-community'
                        size={26} 
                    />
                </View>
            </TouchableOpacity>
        </View>
    )

    render = () => {
        const { listJogos, listJogosH, listUsuarios, itemSelectedAusente } = this.props;
        const jogoA = _.find(listJogos, (item) => item.key === itemSelectedAusente.key);
        const jogoH = _.find(listJogosH, (itema) => itema.key === itemSelectedAusente.key);
        let jogo = null;

        if (jogoA) {
            jogo = jogoA;
        } else if (jogoH) {
            jogo = jogoH;
        }

        if (!jogo) {
            return false;
        }

        let jogadoresAusentes = _.filter(jogo.ausentes, (jg) => !jg.push);
        jogadoresAusentes = _.orderBy(jogadoresAusentes, ['nome'], ['asc']);

        const numjogadoresAusentes = jogadoresAusentes.length;

        // ############ NAO CONFIRMADOS ################
        let naoConfirmados = [];
        const totalConfirmed = _.uniqBy([
            ...jogadoresAusentes,
            ...jogo.confirmados
        ], 'key');

        for (let index = 0; index < listUsuarios.length; index++) {
            const element = listUsuarios[index];

            if (_.findIndex(totalConfirmed, ita => ita.key === element.key) === -1) {
                naoConfirmados.push(element);
            }
        }

        naoConfirmados = _.orderBy(naoConfirmados, ['nome'], ['asc']);

        const numNaoConfirmados = naoConfirmados.length;

        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={styles.viewP}>
                    {
                        numjogadoresAusentes !== 0 &&
                        (
                            <Card
                                containerStyle={styles.card}
                            >
                                <View 
                                    style={styles.titleContainer}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image 
                                            style={{ height: 45, width: 45, marginRight: 10 }}
                                            resizeMode={'stretch'}
                                            source={imgTeam} 
                                        /> 
                                        <Text 
                                            style={{ fontSize: 16, color: 'black' }}
                                        >
                                            Ausentes
                                        </Text>
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Badge value={numjogadoresAusentes} />
                                        </View>
                                    </View>
                                </View>
                                <List 
                                    containerStyle={{
                                        marginTop: 0, 
                                        borderTopWidth: 0, 
                                        borderBottomWidth: 0
                                    }}
                                >
                                    {
                                        jogadoresAusentes.map((item, index) => {
                                            const imgAvt = item.imgAvatar ? 
                                            { uri: item.imgAvatar } : imgAvatar;
                                            return (
                                                <ListItem
                                                    containerStyle={
                                                        (index + 1) === numjogadoresAusentes ? 
                                                        { borderBottomWidth: 0 } : null 
                                                    }
                                                    titleContainerStyle={{ marginLeft: 10 }}
                                                    subtitleContainerStyle={{ marginLeft: 10 }}
                                                    roundAvatar
                                                    avatar={imgAvt}
                                                    key={index}
                                                    title={item.nome}
                                                    onLongPress={() => this.onRemoveAusente(jogo, item)}
                                                    rightIcon={
                                                        itemSelectedAusente.isGerenc ?
                                                        this.renderRightConfirm(jogo, item, 'ausentes')
                                                        :
                                                        <View />
                                                    }
                                                />
                                            );
                                        })
                                    }
                                </List>
                            </Card>  
                        )
                    }
                    {
                        numNaoConfirmados !== 0 &&
                        (
                            <Card
                                containerStyle={styles.card}
                            >
                                <View 
                                    style={styles.titleContainer}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Image 
                                            style={{ height: 45, width: 45, marginRight: 10 }}
                                            resizeMode={'stretch'}
                                            source={imgTeam} 
                                        /> 
                                        <Text 
                                            style={{ fontSize: 16, color: 'black' }}
                                        >
                                            Confirmação Pendente
                                        </Text>
                                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                            <Badge value={numNaoConfirmados} />
                                        </View>
                                    </View>
                                </View>
                                <List 
                                    containerStyle={{
                                        marginTop: 0, 
                                        borderTopWidth: 0, 
                                        borderBottomWidth: 0,
                                    }}
                                >
                                    {
                                        naoConfirmados.map((item, index) => {
                                            const imgAvt = item.imgAvatar ? 
                                            { uri: item.imgAvatar } : imgAvatar;
                                            return (
                                                <ListItem
                                                    containerStyle={
                                                        (index + 1) === numNaoConfirmados ? 
                                                        { borderBottomWidth: 0 } : null 
                                                    }
                                                    titleContainerStyle={{ marginLeft: 10 }}
                                                    subtitleContainerStyle={{ marginLeft: 10 }}
                                                    roundAvatar
                                                    avatar={imgAvt}
                                                    key={index}
                                                    title={item.nome}
                                                    rightIcon={
                                                        itemSelectedAusente.isGerenc ?
                                                        this.renderRightConfirm(jogo, item, 'pendentes')
                                                        :
                                                        <View />
                                                    }
                                                />
                                            );
                                        })
                                    }
                                </List>
                            </Card>
                        )
                    }
                    <View style={{ marginVertical: 60 }} />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        backgroundColor: colorAppF
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        flex: 1,
        padding: 5,
        margin: 0,
        marginHorizontal: 5,
        marginVertical: 15,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'white'
    },
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    }
});

const mapStateToProps = (state) => ({
    itemSelectedAusente: state.JogosReducer.itemSelectedAusente,
    listJogos: state.JogosReducer.listJogos,
    listUsuarios: state.UsuariosReducer.listUsuarios,
    listJogosH: state.HistoricoReducer.listJogos
});

export default connect(mapStateToProps, {})(Ausentes);
