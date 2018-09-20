import React from 'react';
import { 
    View,
    ScrollView,
    StyleSheet,
    ImageBackground,
    Platform,
    TouchableOpacity
} from 'react-native';
import firebase from 'firebase';
import _ from 'lodash';

import { connect } from 'react-redux';
import { Card } from 'react-native-elements';
import Versus from './Versus';
import imgCampoJogos from '../../imgs/campojogos.jpg';
import imgEstadio from '../../imgs/estadio.jpg';

class Jogos extends React.Component {

    constructor(props) {
        super(props);

        this.startOrStopFBJogosListener = this.startOrStopFBJogosListener.bind(this);

        this.state = { listJogos: [] };
    }

    componentDidMount() {
        setTimeout(() => this.startOrStopFBJogosListener(true), 1000);
    }

    componentWillUnmount() {
        setTimeout(() => this.startOrStopFBJogosListener(false), 1000);
    }

    startOrStopFBJogosListener(startOrStop) {
        if (startOrStop) {
            const databaseRef = firebase.database().ref();
            this.dbJogosRef = databaseRef.child('jogos').on('value', (snapshot) => {
                this.setState({ listJogos: _.values(snapshot.val()) });
            });
        } else {
            const databaseRef = firebase.database().ref();
            databaseRef.child('jogos').off('value', this.dbJogosRef);
        }
    }

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
                        { 
                            this.state.listJogos.map((item, index) => {
                                return (
                                    <View key={index}>
                                        <TouchableOpacity
                                            onPress={() => false}
                                        >
                                            <Card 
                                                title={item.titulo} 
                                                containerStyle={[styles.card, styles.shadowCard]}
                                                image={item.imagem ? 
                                                    { uri: item.imagem } : imgEstadio}
                                                featuredSubtitle={item.descricao}
                                            >
                                                <Versus />
                                            </Card>   
                                        </TouchableOpacity>
                                        <View style={{ marginBottom: 10 }} />
                                    </View>
                                );
                            })
                        }
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
