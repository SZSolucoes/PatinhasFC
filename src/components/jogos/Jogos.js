import React from 'react';
import { 
    View,
    ScrollView,
    StyleSheet,
    ImageBackground,
    Platform,
    TouchableOpacity
} from 'react-native';

import { connect } from 'react-redux';
import { Card } from 'react-native-elements';
import Versus from './Versus';
import imgCampoJogos from '../../imgs/campojogos.jpg';
import imgEstadio from '../../imgs/estadio.jpg';

class Jogos extends React.Component {

    render() {
        return (
            <View style={styles.viewPrinc}>
                <ImageBackground
                    source={imgCampoJogos}
                    style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain'
                    }}
                >
                    <ScrollView style={{ flex: 1 }}>
                        <TouchableOpacity
                            onPress={() => false}
                        >
                            <Card 
                                title='Partida 1 - 14/09/2018' 
                                containerStyle={[styles.card, styles.shadowCard]}
                                image={imgEstadio}
                                featuredSubtitle={'O clima está previsto para chuva de gols.'}
                            >
                                <Versus />
                            </Card>   
                        </TouchableOpacity>
                        <View style={{ marginBottom: 10 }} />
                    </ScrollView>
                </ImageBackground>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: 'white'
    },
    card: {
        padding: 0
    },
    shadowCard: {
        ...Platform.select({
            ios: {
                elevation: 2
            },
            android: {
                elevation: 2
            }
        })
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(Jogos);
