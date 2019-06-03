/* eslint-disable max-len */
import React, { Component } from 'react';
import { 
    View,
    Text,
    Alert,
    FlatList,
    Platform,
    Animated,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { Icon, Button } from 'react-native-elements';
import Moment from 'moment';
import _ from 'lodash';
import { connect } from 'react-redux';

import firebase from '../../../../../Firebase';
import FinanceiroJogadoresTableRows from './FinanceiroJogadoresTableRow';
import { checkConInfo } from '../../../../../utils/jogosUtils';
import { normalize } from '../../../../../utils/strComplex';
import { colorAppT, colorAppP } from '../../../../../utils/constantes';
import { modifySearchValue } from '../../../../tools/searchbar/SearchBarActions';
import MonthSelector from '../../../../tools/MonthSelector';

class FinanceiroJogadoresTable extends Component {
    constructor(props) { 
        super(props);

        this.dbFirebaseRef = firebase.database().ref();
        this.dbFinaParametrosRef = this.dbFirebaseRef.child('analise/financeiroParametros');
        this.dbFinaJogadoresRef = this.dbFirebaseRef.child('analise/financeiroJogadores');

        this.animCalendarWidth = new Animated.Value();
        this.animCalendarHeight = new Animated.Value();
        this.animCalendarTranslateX = new Animated.Value(Dimensions.get('window').width);

        this.calendarDims = {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height
        };
        this.isCalendarOpened = false;
        this.isAnimating = false;

        this.dateAll = null;

        this.yearNow = new Date().getFullYear();
        this.lengthUsers = 0;
        this.lengthUsersMax = 0;
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
            pageLength: 10,
            month: Moment(),
            loadingPag: false,
            loadingPagDesc: false
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

        this.dbFinaParametrosRef.on('value', (snapshotA) => {
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

        this.dbFinaParametrosRef.off();
        this.dbFinaJogadoresRef.off();

        this.props.modifySearchValue('');
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
                dbCobrancaRef.child(params.month).remove().then(() => true).catch(() => false);
            } else {
                dbCobrancaRef.update({
                    [params.month]: { value: valorIndividual, typePay: params.checkType }
                }).then(() => true).catch(() => false);
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

    onPressDateBtn = (showCalendar = false, brokeAnim = false) => {
        if (!this.isAnimating || brokeAnim) {
            this.isAnimating = true;

            if (showCalendar) {
                if (!this.isCalendarOpened) {
                    this.animCalendarWidth.setValue(0);
                    this.animCalendarHeight.setValue(0);
                    this.animCalendarTranslateX.setValue(0);
                }
        
                Animated.parallel([
                    Animated.spring(
                        this.animCalendarWidth,
                        {
                            toValue: this.calendarDims.width
                        }
                    ),
                    Animated.spring(
                        this.animCalendarHeight,
                        {
                            toValue: this.calendarDims.height
                        }
                    )
                ]).start(() => {
                    this.isCalendarOpened = true;
                    this.isAnimating = false;
                });
            } else {
                Animated.parallel([
                    Animated.spring(
                        this.animCalendarWidth,
                        {
                            toValue: 0,
                            bounciness: 0
                        }
                    ),
                    Animated.spring(
                        this.animCalendarHeight,
                        {
                            toValue: 0,
                            bounciness: 0
                        }
                    )
                ]).start(() => {
                    this.animCalendarTranslateX.setValue(this.calendarDims.width);
                    this.isCalendarOpened = false;
                    this.isAnimating = false;
                });
            }
        }
    }

    onPressConfirmarPagAll = () => {
        const yearNumber = parseInt(this.state.month.format('YYYY'), 10);
        const monthName = this.state.month.format('MMMM');

        const message = `Confirma o pagamento referente a "${monthName}" de "${yearNumber}" para todos os usuários ?`;

        console.log(message);
        /* const funExec = () => {
            const dbCobrancaRef = this.dbFirebaseRef
            .child(`analise/financeiroJogadores/${yearNumber}`);



            dbCobrancaRef.update({
                [params.month]: { value: valorIndividual, typePay: params.checkType }
            }).then(() => true).catch(() => false);
            
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
        ); */
    }

    onPressConfirmarPagAllDesc = () => {
        console.log(this.state.month);
        /* const funExec = () => {
            const dbCobrancaRef = this.dbFirebaseRef
            .child(`analise/financeiroJogadores/${params.yearNumber}/${params.playerKey}`);

            if (params.hasCheck) {
                dbCobrancaRef.child(params.month).remove().then(() => true).catch(() => false);
            } else {
                dbCobrancaRef.update({
                    [params.month]: { value: valorIndividual, typePay: params.checkType }
                }).then(() => true).catch(() => false);
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
        ); */
    }

    onMonthSelected = (date) => {
        this.setState({ month: date });
    }

    changedOrientation = ({ window }) => {
        this.calendarDims.width = window.width;
        this.calendarDims.height = window.height;

        if (this.isCalendarOpened) this.onPressDateBtn(true);
        
        this.setState({ width: window.width });
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
        const validLength = this.lengthUsersMax >= (this.state.pageLength + 10);
        if (!this.onEndReachedCalledDuringMomentum && !this.state.loading && validLength) { 
            this.setState({
                loading: true
            }, 
                () => setTimeout(() => this.setState({
                    pageLength: this.state.pageLength + 10,
                    loading: false
                }), 1000)
            );
        }

        this.onEndReachedCalledDuringMomentum = true;
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

    renderItem = ({ item, index }) => (
        <FinanceiroJogadoresTableRows 
            key={index} 
            index={index} 
            item={item} 
            onPressItem={this.onPressItem}
            width={this.state.width}
            yearNumber={this.state.yearNumber}
        />
    )

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
                        onPress={() => this.onPressDateBtn(!this.isCalendarOpened)}
                    >
                        <Icon
                            name='calendar-multiple-check' 
                            type='material-community' 
                            size={28} color='white' 
                        />   
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )

    renderMonthBatch = () => {
        const minDate = Moment(`01-01-${parseInt(this.yearNow, 10) - 2}`, 'DD-MM-YYYY');
        const maxDate = Moment(`31-12-${parseInt(this.yearNow, 10)}`, 'DD-MM-YYYY');

        const monthProps = 
        ({ 
            minDate,
            maxDate,
            initialView: maxDate
        });
        
        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: this.animCalendarWidth,
                    height: this.animCalendarHeight,
                    zIndex: 400,
                    overflow: 'hidden',
                    transform: [
                        { translateX: this.animCalendarTranslateX }, 
                        /* { 
                            scaleX: this.animCalendarWidth.interpolate({
                                inputRange: [0, this.calendarDims.width],
                                outputRange: [0.1, 1],
                                extrapolate: 'clamp'
                            }) 
                        },
                        { 
                            scaleY: this.animCalendarHeight.interpolate({
                                inputRange: [0, this.calendarDims.height],
                                outputRange: [0.1, 1],
                                extrapolate: 'clamp'
                            }) 
                        } */
                    ]
                }}
            >
                <View style={{ backgroundColor: 'white', flex: 1 }}>
                    <MonthSelector
                        selectedDate={this.state.month}
                        onMonthTapped={(date) => this.onMonthSelected(date)}
                        {...monthProps}
                    />
                    <Button 
                        small
                        loading={this.state.loadingPag}
                        disabled={this.state.loadingPag}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loadingPag ? ' ' : 'Pagar todos'} 
                        buttonStyle={{ width: '100%', marginTop: 10 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmarPagAll())}
                    />
                    <Button 
                        small
                        loading={this.state.loadingPagDesc}
                        disabled={this.state.loadingPagDesc}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loadingPagDesc ? ' ' : 'Pagar todos com desconto'} 
                        buttonStyle={{ width: '100%', marginTop: 10 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmarPagAllDesc())}
                    />
                </View>
            </Animated.View>
        );
    }

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
                    zIndex: 10,
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
        listUsuarios = _.filter(listUsuarios, (item) => {
            const validPerfil = item.tipoPerfil && 'sociopatrim|sociocontrib'.includes(item.tipoPerfil);
            if (!validPerfil) return false;
            
            const playerName = this.props.searchValue.trim();
            if (!playerName) return true;

            return item.nome.toLowerCase().includes(playerName.toLowerCase());
        });
        
        this.lengthUsersMax = listUsuarios.length;

        listUsuarios = _.orderBy(listUsuarios, ['nome'], ['asc']);
        listUsuarios = _.slice(listUsuarios, 0, this.state.pageLength);

        this.lengthUsers = listUsuarios.length;

        return (
            <View style={{ flex: 1 }}>
                {this.renderYearBar()}
                <View style={{ flex: 1 }}>
                    <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 }}>
                        <FlatList
                            data={this.parsePlayersList(listUsuarios, this.state.financeiroJogadores, this.state.yearNumber)}
                            extraData={this.state}
                            style={{ 
                                flex: 1,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                width: this.state.width 
                            }}
                            keyExtractor={this.keyExtractor}
                            renderItem={this.renderItem}
                            ListFooterComponent={(
                                <View style={{ opacity: this.state.loading ? 1 : 0, marginVertical: 25, alignItems: 'center', justifyContent: 'center' }} >
                                    <ActivityIndicator />
                                </View>
                            )}
                            onEndReached={this.loadMore}
                            onEndReachedThreshold={0.1}
                            onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                        />
                        <View style={{ marginVertical: 25 }} />
                        {this.renderTotal(listUsuarios, this.state.financeiroJogadores, this.state.yearNumber)}
                    </View>
                    {this.renderMonthBatch()}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    listUsuarios: state.UsuariosReducer.listUsuarios,
    searchValue: state.SearchBarReducer.searchValue
});

export default connect(mapStateToProps, {
    modifySearchValue
})(FinanceiroJogadoresTable);

