import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    Text,
    Image,
    View
} from 'react-native';
import { connect } from 'react-redux';
import { Card } from 'react-native-elements';
import { colorAppF, colorAppP } from '../../../utils/constantes';
import { limitDotText } from '../../../utils/strComplex';

import imgHomeShirt from '../../../imgs/homeshirt.png';
import imgVisitShirt from '../../../imgs/visitshirt.png';

class Jogo extends React.PureComponent {

    render() {
        return (
            <ScrollView style={styles.viewP}>
                <Card
                    containerStyle={styles.card}
                >
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={styles.topViewPlacar} />
                        <View style={{ position: 'absolute', alignSelf: 'center' }}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                { limitDotText(this.props.jogoSelected.titulo, 25) }
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
                                            {'Ao vivo'}
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
                                            {'0 - 0'}
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
    }
});

const mapStateToProps = (state) => ({
    jogoSelected: state.JogoReducer.jogoSelected
});

export default connect(mapStateToProps, {})(Jogo);
