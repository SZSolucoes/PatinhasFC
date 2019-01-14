import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import { 
    Card,
    SearchBar,
    Icon,
    FormLabel,
    Divider
} from 'react-native-elements';
import _ from 'lodash';

import { colorAppS, colorAppF } from '../../../utils/constantes';
import Versus from '../../jogos/Versus';
import { 
    modificaFilterStr, 
    modificaFilterLoad, 
    modificaItemSelected,
    modificaOnItemRender,
    modificaClean
} from '../../../actions/GerenciarActions';

class Gerenciar extends React.Component {

    constructor(props) {
        super(props);

        this.scrollView = null;

        this.renderEditar = this.renderEditar.bind(this);
        this.renderListJogos = this.renderListJogos.bind(this);
        this.onFilterJogos = this.onFilterJogos.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.onPressCardGame = this.onPressCardGame.bind(this);
        this.onItemRender = this.onItemRender.bind(this);

        this.state = {
            loading: false
        };
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
        this.props.modificaOnItemRender(this.onItemRender);
        this.setState({ loading: true });
        setTimeout(() => 
            Actions.gerenciarJogoTab({ 
                onBack: () => Actions.popTo('gerenciar') 
            })
        , 1000);
        
    }

    onItemRender() {
        this.setState({ loading: false });
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
                            <View style={{ marginVertical: 10 }} >
                                <Divider />
                            </View>
                            <TouchableOpacity
                                onPress={() => Actions.imagens({ jogo: item, enableButtons: true })}
                            >
                                <View style={styles.viewImageSelect}>
                                    <Icon 
                                        name='folder-image' 
                                        type='material-community' 
                                        size={32} color='white' 
                                    />
                                    <FormLabel 
                                        labelStyle={{ 
                                            color: 'white',
                                            fontSize: 14, 
                                            fontWeight: '500',
                                            marginTop: 0, 
                                            marginBottom: 0 
                                        }}
                                    >
                                        Imagens
                                    </FormLabel> 
                                </View>
                            </TouchableOpacity>
                            {
                                this.state.loading &&
                                (
                                    <TouchableOpacity
                                        style={{ 
                                            flex: 1,
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)'
                                        }}
                                    >
                                        <ActivityIndicator size={'large'} color={colorAppS} />
                                    </TouchableOpacity>
                                )
                            }
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
                    showLoadingIcon={
                        this.props.listJogos &&
                        this.props.listJogos.length > 0 && 
                        this.props.filterLoad
                    }
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
    },
    viewImageSelect: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9E9E9E',
        borderRadius: 5
    }
});

const mapStateToProps = (state) => ({
    listJogos: state.JogosReducer.listJogos,
    filterStr: state.GerenciarReducer.filterStr,
    filterLoad: state.GerenciarReducer.filterLoad
});

export default connect(mapStateToProps, {
    modificaFilterStr, 
    modificaFilterLoad, 
    modificaItemSelected,
    modificaOnItemRender,
    modificaClean 
})(Gerenciar);
