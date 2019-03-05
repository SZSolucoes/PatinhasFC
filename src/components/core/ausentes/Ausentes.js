import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    View,
    Text,
    Image
} from 'react-native';
import { List, Badge } from 'react-native-elements';
import { connect } from 'react-redux';
import _ from 'lodash';
import { colorAppF } from '../../../utils/constantes';
import ListItem from '../../tools/ListItem';
import Card from '../../tools/Card';
//import Campo from '../../campo/Campo';
import imgTeam from '../../../imgs/team.png';
import imgAvatar from '../../../imgs/perfiluserimg.png';

class Ausentes extends React.Component {
    shouldComponentUpdate(nextProps, nextStates) {
        const { itemSelectedAusente } = this.props;

        if (nextProps.listJogos) {
            const nj = _.filter(nextProps.listJogos, (item) => item.key === itemSelectedAusente)[0];
                
            if (!nj) {
                return false;
            }
        }

        return nextProps !== this.props || nextStates !== this.state;
    }

    render() {
        const { listJogos, listJogosH, listUsuarios, itemSelectedAusente } = this.props;
        const jogoA = _.find(listJogos, (item) => item.key === itemSelectedAusente);
        const jogoH = _.find(listJogosH, (itema) => itema.key === itemSelectedAusente);
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
                                                    rightIcon={(<View />)}
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
                                        borderBottomWidth: 0
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
                                                    rightIcon={(<View />)}
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
        overflow: 'hidden'
    },
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

const mapStateToProps = (state) => ({
    itemSelectedAusente: state.JogosReducer.itemSelectedAusente,
    listJogos: state.JogosReducer.listJogos,
    listUsuarios: state.UsuariosReducer.listUsuarios,
    listJogosH: state.HistoricoReducer.listJogos
});

export default connect(mapStateToProps, {})(Ausentes);
