/* eslint-disable max-len */
import React, { Component } from 'react';
import { 
    View,
    Text,
    Alert,
    FlatList,
    Platform, 
    ScrollView,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { Icon } from 'react-native-elements';
import Moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import firebase from '../../../../../Firebase';
import FinanceiroJogadoresTableRows from './FinanceiroJogadoresTableRow';
import { checkConInfo } from '../../../../../utils/jogosUtils';
import { normalize } from '../../../../../utils/strComplex';
import { colorAppT, colorAppP } from '../../../../../utils/constantes';

class FinanceiroJogadoresTable extends Component {
    constructor(props) { 
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.dbFinaParametrosRef = this.dbFirebaseRef.child('analise/financeiroParametros');
        this.dbFinaJogadoresRef = this.dbFirebaseRef.child('analise/financeiroJogadores');

        this.yearNow = new Date().getFullYear();
        this.lengthUsers = 0;
        this.onEndReachedCalledDuringMomentum = true;

        this.state = { 
            width: Dimensions.get('window').width,
            yearNumber: this.yearNow,
            years: [this.yearNow.toString()],
            dropWidth: 0,
            financeiroJogadores: {},
            financeiroParametros: {},
            listUsers: [],
            loading: false,
            pageLength: 10
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.changedOrientation);

        const dtYearGroup = parseInt(Moment().format('YYYY'), 10) - 2;

        const yearsCount = this.yearNow - dtYearGroup;
        const newYears = [this.yearNow.toString()];

        for (let index = 1; index <= yearsCount; index++) {
            newYears.push((this.yearNow - index).toString());
        }

        this.dbFinaParametrosRef.once('value', (snapshotA) => {
            if (snapshotA) {
                const snapValA = snapshotA.val();

                if (snapValA) {
                    this.dbFinaJogadoresRef.on('value', (snapshotB) => {
                        if (snapshotB) {
                            const snapValB = snapshotB.val();
            
                            if (snapValB) {
                                this.setState({
                                    years: newYears,
                                    financeiroParametros: { ...snapValA },
                                    financeiroJogadores: { ...snapValB },
                                    listUsers: { ...this.props.listUsuarios }
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.changedOrientation);

        this.dbFinaJogadoresRef.off();
    }

    onPressItem = (item, index, params) => {
        let valorIndividual = 0;

        if (item.jogador.tipoPerfil === 'sociopatrim') {
            if (params.checkType === 'desc') {
                valorIndividual = this.state.financeiroParametros.socioPatrimValor - this.state.financeiroParametros.socioPatrimValorDesc;
            } else {
                valorIndividual = this.state.financeiroParametros.socioPatrimValor;
            }
        } else if (item.jogador.tipoPerfil === 'sociocontrib') {
            if (params.checkType === 'desc') {
                valorIndividual = this.state.financeiroParametros.socioContribValor - this.state.financeiroParametros.socioContribValorDesc;
            } else {
                valorIndividual = this.state.financeiroParametros.socioContribValor;
            }
        }

        if (!valorIndividual) {
            Alert.alert('Aviso', 'Parâmetros financeiros não configurados.');
            return;
        }

        if (typeof valorIndividual === 'number' && valorIndividual < 0) {
            Alert.alert('Aviso', 'Parâmetros financeiros com configuração negativa.');
            return;
        }

        let message = '';

        if (params.hasCheck) {
            if (params.checkType === 'desc') {
                message = `Confirma a remoção do pagamento com desconto referente a "${params.monthName}" de "${params.yearNumber}" para o jogador: "${params.playerName}" ?`;
            } else {
                message = `Confirma a remoção do pagamento referente a "${params.monthName}" de "${params.yearNumber}" para o jogador: "${params.playerName}" ?`;
            }
        } else if (params.checkType === 'desc') {
            message = `Confirma o pagamento com desconto referente a "${params.monthName}" de "${params.yearNumber}" para o jogador: "${params.playerName}" ?`;
        } else {
            message = `Confirma o pagamento referente a "${params.monthName}" de "${params.yearNumber}" para o jogador: "${params.playerName}" ?`;
        }

        const funExec = () => {
            const dbCobrancaRef = this.dbFirebaseRef
            .child(`analise/financeiroJogadores/${params.yearNumber}/${params.playerKey}`);

            if (params.hasCheck) {
                dbCobrancaRef.child(params.month).remove().then(() => true).catch((e) => console.log(e));
            } else {
                dbCobrancaRef.update({
                    [params.month]: { value: valorIndividual, typePay: params.checkType }
                }).then(() => true).catch((e) => console.log(e));
            }
        };

        Alert.alert(
            'Aviso', 
            message,
            [
                { text: 'Cancelar', onPress: () => false },
                { 
                    text: 'Sim', 
                    onPress: () => checkConInfo(() => funExec()) 
                }
            ],
            { cancelable: true }
        );
    }

    onEndReached = ({ distanceFromEnd }) => {
        if (!this.onEndReachedCalledDuringMomentum) {
            console.log('gatilhou');
            this.onEndReachedCalledDuringMomentum = true;
        }
    }

    changedOrientation = (e) => {
        this.setState({ width: e.window.width });
    }
 
    keyExtractor = (item, index) => index.toString()

    parsePlayersList = (listUsuarios, financeiroJogadores, year) => {
        const listPlayers = listUsuarios || [];
        const yearNode = financeiroJogadores && financeiroJogadores[year] ? financeiroJogadores[year] : null;
        const parsedArray = [];

        listPlayers.forEach((player) => {
            const hasPlayerCob = yearNode && yearNode[player.key];
            let playerTotal = 0;

            if (hasPlayerCob) {
                const arrPlayerCob = _.values(yearNode[player.key]);
                for (let index = 0; index < arrPlayerCob.length; index++) {
                    const element = arrPlayerCob[index].value;
                    playerTotal += element;
                }
            }

            parsedArray.push({
                jogador: player,
                total: playerTotal,
                jan: hasPlayerCob && yearNode[player.key].jan ? yearNode[player.key].jan : null,
                fev: hasPlayerCob && yearNode[player.key].fev ? yearNode[player.key].fev : null,
                mar: hasPlayerCob && yearNode[player.key].mar ? yearNode[player.key].mar : null,
                abr: hasPlayerCob && yearNode[player.key].abr ? yearNode[player.key].abr : null,
                mai: hasPlayerCob && yearNode[player.key].mai ? yearNode[player.key].mai : null,
                jun: hasPlayerCob && yearNode[player.key].jun ? yearNode[player.key].jun : null,
                jul: hasPlayerCob && yearNode[player.key].jul ? yearNode[player.key].jul : null,
                ago: hasPlayerCob && yearNode[player.key].ago ? yearNode[player.key].ago : null,
                set: hasPlayerCob && yearNode[player.key].set ? yearNode[player.key].set : null,
                out: hasPlayerCob && yearNode[player.key].out ? yearNode[player.key].out : null,
                nov: hasPlayerCob && yearNode[player.key].nov ? yearNode[player.key].nov : null,
                dez: hasPlayerCob && yearNode[player.key].dez ? yearNode[player.key].dez : null
            });
        });

        return parsedArray;
    }

    loadMore = () => {
        console.log('loadmore');
        if (!this.state.loading) {
            this.setState({
                pageLength: this.state.pageLength + 10,
                loading: true
            });
        }
    }

    renderSeparator = () => (
        <View
            style={{
            height: 1,
            width: '100%',
            backgroundColor: '#607D8B',
            }}
        />
    )

    renderItem = ({ item, index }) => {
        if (index === this.lengthUsers - 1) {
            console.log('renderizou o ultimo');
        }

        return (
            <FinanceiroJogadoresTableRows 
                key={index} 
                index={index} 
                item={item} 
                onPressItem={this.onPressItem}
                width={this.state.width}
                yearNumber={this.state.yearNumber}
            />
        );
    }

    renderYearBar = () => (
        <View 
            style={{
                paddingHorizontal: 15,
                backgroundColor: colorAppT,
                borderBottomWidth: 0.1,
                borderBottomColor: 'black',
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.5,
                        shadowRadius: 1,
                    },
                    android: {
                        elevation: 1
                    }
                })
            }}
        >
            <View 
                style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
            >
                <View style={{ flex: 0.7 }} />
                <View 
                    style={{ 
                        flex: 2.3, 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: 5
                    }}
                    onLayout={
                        (event) =>
                            this.setState({
                                dropWidth: event.nativeEvent.layout.width
                    })}
                >
                    <ModalDropdown
                        ref={(ref) => { this.modalDropRef = ref; }}
                        textStyle={{
                            color: 'white',
                            fontSize: normalize(16),
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                        style={{
                            width: this.state.dropWidth / 1.5,
                            justifyContent: 'center',
                            height: 36
                        }}
                        dropdownTextStyle={{ 
                            fontSize: normalize(16), 
                            textAlign: 'center'
                        }}
                        dropdownStyle={{
                            width: this.state.dropWidth / 1.5
                        }}
                        options={this.state.years}
                        onSelect={
                            (index, value) => this.setState({ yearNumber: value })
                        }
                        defaultIndex={0}
                        defaultValue={this.state.years[0]}
                    />
                </View>
                <View 
                    style={{ 
                        flex: 0.7, 
                        flexDirection: 'row', 
                        justifyContent: 'flex-end' 
                    }}
                >
                    <TouchableOpacity
                        onPress={() => this.modalDropRef.show()}
                    >
                        <Icon
                            name='calendar-search' 
                            type='material-community' 
                            size={28} color='white' 
                        />   
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )

    renderTotal = (listUsuarios, financeiroJogadores, year) => {
        const listPlayers = listUsuarios || [];
        const yearNode = financeiroJogadores && financeiroJogadores[year] ? financeiroJogadores[year] : null;
        let playerTotal = 0;

        listPlayers.forEach((player) => {
            const hasPlayerCob = yearNode && yearNode[player.key];
            
            if (hasPlayerCob) {
                const arrPlayerCob = _.values(yearNode[player.key]);
                for (let index = 0; index < arrPlayerCob.length; index++) {
                    const element = arrPlayerCob[index].value;
                    playerTotal += element;
                }
            }
        });

        return (
            <View 
                style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    left: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 15,
                    backgroundColor: colorAppT,
                    borderBottomWidth: 0.1,
                    borderBottomColor: 'black',
                    ...Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.5,
                            shadowRadius: 1,
                        },
                        android: {
                            elevation: 1
                        }
                    })
                }}
            >
                <Text style={{ color: 'white', fontSize: 14, fontFamily: 'OpenSans-Bold' }}>
                    {'Total arrecadado: '}
                </Text>
                <Text style={{ color: 'white', fontSize: 14, fontFamily: 'OpenSans-SemiBold' }}>
                    R$ {parseFloat(Math.round(playerTotal * 100) / 100).toFixed(2)}
                </Text>
            </View>
        );
    }
 
    render = () => {
        if (this.state.listUsers.length === 0) {
            return (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colorAppP} />
                </View>
            );
        }
        let listUsuarios = this.state.listUsers || [];
        listUsuarios = _.filter(listUsuarios, (item) => item.tipoPerfil && 'sociopatrim|sociocontrib'.includes(item.tipoPerfil));
        listUsuarios = _.orderBy(listUsuarios, ['nome'], ['asc']);
        listUsuarios = _.slice(listUsuarios, 0, this.state.pageLength);

        this.lengthUsers = listUsuarios.length;

        return (
            <View style={{ flex: 1 }}>
                {this.renderYearBar()}
                <ScrollView>
                    <FlatList
                        data={this.parsePlayersList(listUsuarios, this.state.financeiroJogadores, this.state.yearNumber)}
                        extraData={this.state}
                        style={{ 
                            flex: 1,
                            marginVertical: 10,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            width: this.state.width 
                        }}
                        keyExtractor={this.keyExtractor}
                        renderItem={this.renderItem}
                        ListFooterComponent={(
                            <View style={{ marginBottom: 50 }} >
                                {
                                    this.state.loading && <ActivityIndicator style={{ color: '#000' }} />
                                }
                            </View>
                        )}
                        onEndReached={this.onEndReached}
                        onEndReachedThreshold={0.5}
                        onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                    />
                </ScrollView>
                <View style={{ marginVertical: 25 }} />
                {this.renderTotal(listUsuarios, this.state.financeiroJogadores, this.state.yearNumber)}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    listUsuarios: state.UsuariosReducer.listUsuarios,
});

export default connect(mapStateToProps)(FinanceiroJogadoresTable);

