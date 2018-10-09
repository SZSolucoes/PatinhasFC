import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    Text,
    Image,
    View
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Card, List } from 'react-native-elements';
import { colorAppF, colorAppP } from '../../../utils/constantes';
import { limitDotText } from '../../../utils/strComplex';
import { modificaClean } from '../../../actions/JogoActions';

import imgHomeShirt from '../../../imgs/homeshirt.png';
import imgVisitShirt from '../../../imgs/visitshirt.png';
import imgBola from '../../../imgs/bolaanim.png';
import imgYellowCard from '../../../imgs/yellowcard.png';
import imgRedCard from '../../../imgs/redcard.png';

class Jogo extends React.PureComponent {

    constructor(props) {
        super(props);

        this.renderCardPlacar = this.renderCardPlacar.bind(this);
        this.renderGoals = this.renderGoals.bind(this);
        this.renderCartoes = this.renderCartoes.bind(this);
        this.textJogoProgress = this.textJogoProgress.bind(this);
        this.textPlacar = this.textPlacar.bind(this);
        this.renderGolJogador = this.renderGolJogador.bind(this);
        this.renderCartaoJogador = this.renderCartaoJogador.bind(this);
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    textJogoProgress(jogo) {
        switch (jogo.status) {
            case '0':
                return 'Em espera';
            case '1':
                return 'Ao vivo';
            case '2':
                return 'Encerrado';
            default:
                return 'Encerrado';
        }
    }

    textPlacar(jogo) {
        return `${jogo.placarCasa} - ${jogo.placarVisit}`;
    }

    renderCardPlacar(jogo) {
        return (
            <Card
                containerStyle={styles.card}
            >
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                    <View style={styles.topViewPlacar} />
                    <View style={{ position: 'absolute', alignSelf: 'center' }}>
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>
                            { limitDotText(jogo.titulo, 25) }
                        </Text>
                    </View>
                </View>
                <View style={{ marginTop: 20 }} />
                <View style={styles.viewPlacar}>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image 
                            style={{ height: 80, width: 70 }}
                            resizeMode={'stretch'}
                            source={imgHomeShirt} 
                        />
                        <Text
                            style={{
                                fontWeight: '500'
                            }}
                        >
                            Casa
                        </Text>
                    </View>
                    <View 
                        style={{ 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderRadius: 3
                        }}
                    >
                            <View
                                style={{ 
                                    marginHorizontal: 30,
                                    marginVertical: 5,
                                    alignItems: 'center',
                                    justifyContent: 'center' 
                                }}
                            >
                                <View style={{ marginBottom: 10 }}>
                                    <Text
                                        style={{ 
                                            fontSize: 18, 
                                            fontWeight: 'bold', 
                                            color: 'red' 
                                        }}
                                    >
                                        { this.textJogoProgress(jogo) }
                                    </Text>
                                </View>
                                <View>
                                    <Text
                                        style={{ 
                                            fontSize: 26, 
                                            fontWeight: 'bold', 
                                            color: 'black' 
                                        }}
                                    >
                                        { this.textPlacar(jogo) }
                                    </Text>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <Text
                                        style={{ fontSize: 16, fontWeight: '500' }}
                                    >
                                    {'09:13'}
                                    </Text>
                                </View>
                            </View>
                    </View>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image 
                            style={{ height: 80, width: 70 }}
                            resizeMode={'stretch'}
                            source={imgVisitShirt}
                        />
                        <Text
                            style={{
                                fontWeight: '500'
                            }}
                        >
                            Visitantes
                        </Text>
                    </View>
                </View>
                <View style={{ marginBottom: 30 }} />
            </Card>
        );
    }

    renderGoals(jogo) {
        return (
            <View>
                <View style={{ padding: 5 }}>
                    <View style={{ margin: 5 }}>
                        <Text
                            style={{ 
                                color: 'black', 
                                fontWeight: 'bold',
                                fontSize: 16 
                            }}
                        >
                            Gols
                        </Text>
                    </View>
                    <View>
                        <List 
                            containerStyle={{
                                marginTop: 0,
                                paddingHorizontal: 5,
                                paddingVertical: 10
                            }}
                        >
                            { this.renderGolJogador(jogo.gols) }
                        </List>
                    </View>
                </View>
            </View>
        );
    }

    renderGolJogador(gols) {
        const golsCasa = _.filter(gols, (item) => item.side && item.side === 'casa');
        const golsVisit = _.filter(gols, (item) => item.side && item.side === 'visit');
        const numGolsCasa = golsCasa.length;
        const numGolsVisit = golsVisit.length;
        const viewsGols = [];

        if (numGolsCasa === 0 && numGolsVisit === 0) {
            return false;
        }

        if (numGolsCasa > numGolsVisit) {
            let i = 0;
            for (i = 0; i < numGolsCasa; i++) {
                if ((i + 1) > numGolsVisit || numGolsVisit === 0) {
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numGolsVisit; i++) {
                if ((i + 1) > numGolsCasa || numGolsCasa === 0) {
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    viewsGols.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image source={imgBola} style={{ width: 25, height: 25 }} />
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewsGols;
    }

    renderCartoes(jogo) {
        return (
            <View>
                <View style={{ padding: 5 }}>
                    <View style={{ margin: 5 }}>
                        <Text
                            style={{ 
                                color: 'black', 
                                fontWeight: 'bold',
                                fontSize: 16 
                            }}
                        >
                            Cartões
                        </Text>
                    </View>
                    <View>
                        <List 
                            containerStyle={{ 
                                marginTop: 0,
                                paddingHorizontal: 5,
                                paddingVertical: 10
                            }}
                        >
                            { this.renderCartaoJogador(jogo.cartoes) }
                        </List>
                    </View>
                </View>
            </View>
        );
    }

    renderCartaoJogador(cartoes) {
        const cartoesCasa = _.filter(cartoes, (item) => item.side && item.side === 'casa');
        const cartoesVisit = _.filter(cartoes, (item) => item.side && item.side === 'visit');
        const numCartoesCasa = cartoesCasa.length;
        const numCartoesVisit = cartoesVisit.length;
        const viewCartoes = [];

        if (numCartoesCasa === 0 && numCartoesVisit === 0) {
            return false;
        }

        if (numCartoesCasa > numCartoesVisit) {
            let i = 0;
            for (i = 0; i < numCartoesCasa; i++) {
                if ((i + 1) > numCartoesVisit || numCartoesVisit === 0) {
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start'
                                    }}
                                >
                                    <Image 
                                        source={imgRedCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <Image 
                                        source={imgRedCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flex: 1, 
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image 
                                        source={imgRedCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        } else {
            let i = 0;
            for (i = 0; i < numCartoesVisit; i++) {
                if ((i + 1) > numCartoesCasa || numCartoesCasa === 0) {
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center' 
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image 
                                        source={imgRedCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                </View>
                            </View>
                        </View>
                    );
                } else {
                    viewCartoes.push(
                        <View key={i}>
                            {
                                i !== 0 &&
                                <View style={styles.separator} />
                            }
                            <View 
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start' 
                                    }}
                                >
                                    <Image 
                                        source={imgRedCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                </View>
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: 'row', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-end' 
                                    }}
                                >
                                    <Text>
                                        45' Roney Maia
                                    </Text>
                                    <View style={{ marginHorizontal: 3 }} />
                                    <Image 
                                        source={imgRedCard}
                                        style={{ 
                                            width: 20, height: 25 
                                        }} 
                                    />
                                </View>
                            </View>
                        </View>
                    );
                }
            }
        }

        return viewCartoes;
    }

    render() {
        const { listJogos, jogoSelected } = this.props;
        const jogo = _.filter(listJogos, (item) => item.key === jogoSelected)[0];
        return (
            <ScrollView style={styles.viewP}>
                { this.renderCardPlacar(jogo) }
                <View style={{ marginVertical: 2 }} />
                { this.renderGoals(jogo) }
                { this.renderCartoes(jogo) }
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        backgroundColor: colorAppF
    },
    viewPlacar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        padding: 0,
        margin: 0,
        marginHorizontal: 10,
        marginVertical: 15,
        borderRadius: 5
    },
    topViewPlacar: {
        width: '80%',
        height: 0,
        borderTopWidth: 40,
        borderTopColor: colorAppP,
        borderLeftWidth: 20,
        borderLeftColor: 'transparent',
        borderRightWidth: 20,
        borderRightColor: 'transparent',
        borderStyle: 'solid'
    },
    separator: { 
        width: '100%', 
        borderTopWidth: 0.5, 
        borderTopColor: 'black',
        marginVertical: 5
    }
});

const mapStateToProps = (state) => ({
    jogoSelected: state.JogoReducer.jogoSelected,
    listJogos: state.JogosReducer.listJogos
});

export default connect(mapStateToProps, { modificaClean })(Jogo);
