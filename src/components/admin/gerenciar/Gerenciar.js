import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { 
    Card,
    SearchBar
} from 'react-native-elements';
import _ from 'lodash';

import { colorAppS, colorAppF } from '../../../utils/constantes';
import Versus from '../../jogos/Versus';
import { 
    modificaFilterStr, 
    modificaFilterLoad, 
    modificaItemSelected,
    modificaClean
} from '../../../actions/GerenciarActions';

class Gerenciar extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            itemEdit: {}
        };

        this.scrollView = null;

        this.renderEditar = this.renderEditar.bind(this);
        this.renderListJogos = this.renderListJogos.bind(this);
        this.onFilterJogos = this.onFilterJogos.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.checkConInfo = this.checkConInfo.bind(this);
        this.onPressCardGame = this.onPressCardGame.bind(this);
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    onFilterJogos(jogos, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(jogos, (jogo) => (
                (jogo.titulo && jogo.titulo.toLowerCase().includes(lowerFilter)) ||
                (jogo.descricao && jogo.descricao.toLowerCase().includes(lowerFilter)) ||
                (jogo.data && jogo.data.toLowerCase().includes(lowerFilter)) ||
                `${jogo.placarCasa}x${jogo.placarVisit}`.includes(lowerFilter)
        ));
    }

    onPressCardGame(item) {
        this.props.modificaItemSelected(item.key);
        Actions.gerenciarJogoTab();
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

    renderListJogos(jogos) {
        const reverseJogos = _.reverse([...jogos]);
        const jogosView = reverseJogos.map((item, index) => {
            if ((index + 1) > 30) {
                return false;
            }
            const titulo = item.titulo ? item.titulo : ' ';
            const data = item.data ? item.data : ' ';
            const placarCasa = item.placarCasa ? item.placarCasa : '0'; 
            const placarVisit = item.placarVisit ? item.placarVisit : '0';
            let tituloConcat = '';

            if (titulo) {
                tituloConcat = titulo;
            }
            if (data) {
                tituloConcat += ` - ${data}`;
            }

            return (
                <View key={index}>
                    <TouchableOpacity
                        onPress={() => this.onPressCardGame(item)}
                    >
                        <Card 
                            title={tituloConcat} 
                            containerStyle={styles.card}
                        >
                            <Versus
                                placarCasa={placarCasa} 
                                placarVisit={placarVisit}  
                            />
                        </Card>
                    </TouchableOpacity>
                    <View style={{ marginBottom: 10 }} />
                </View>
            );
        });
        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return jogosView;
    }

    renderBasedFilterOrNot() {
        const { listJogos, filterStr } = this.props;
        let jogosView = null;
        if (listJogos) {
            if (filterStr) {
                jogosView = this.renderListJogos(
                    this.onFilterJogos(listJogos, filterStr)
                );
            } else {
                jogosView = this.renderListJogos(listJogos);
            }
        }
        return jogosView;
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
                    placeholder='Buscar jogo...' 
                />
                { this.renderBasedFilterOrNot() }
            </Card>
        );
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <ScrollView 
                    style={{ flex: 1 }} 
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    { this.renderEditar() }
                    <View style={{ marginVertical: 20 }} />
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
        marginVertical: 8,
        marginRight: 5
    }
});

const mapStateToProps = (state) => ({
    listJogos: state.JogosReducer.listJogos,
    filterStr: state.GerenciarReducer.filterStr,
    filterLoad: state.GerenciarReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaFilterStr, 
    modificaFilterLoad, 
    modificaItemSelected,
    modificaClean 
})(Gerenciar);
