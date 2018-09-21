import React from 'react';
import { 
    View,
    ScrollView,
    StyleSheet,
    ImageBackground,
    Platform,
    TouchableOpacity,
    Text
} from 'react-native';
import firebase from 'firebase';
import _ from 'lodash';

import { connect } from 'react-redux';
import { Card, Divider } from 'react-native-elements';
import LoadingBallAnim from '../animations/LoadingBallAnim';
import Versus from './Versus';
import imgCampoJogos from '../../imgs/campojogos.jpg';
import imgEstadio from '../../imgs/estadio.jpg';

class Jogos extends React.Component {

    constructor(props) {
        super(props);

        this.startOrStopFBJogosListener = this.startOrStopFBJogosListener.bind(this);
        this.renderListItens = this.renderListItens.bind(this);
        this.removeImagem = this.removeImagem.bind(this);

        this.state = { listJogos: [] };
    }

    componentDidMount() {
        this.startOrStopFBJogosListener(true);
    }

    componentWillUnmount() {
        this.startOrStopFBJogosListener(false);
    }

    removeImagem(url) {
        console.log(url);
        //const imgRef = firebase.storage().refFromURL(url);
        //imgRef.delete();
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

    renderListItens() {
        return (
            <ScrollView style={{ flex: 1 }}>
                { 
                    this.state.listJogos.map((item, index) => (
                        <View key={index}>
                            <TouchableOpacity
                                onPress={() => this.removeImagem(item.imagem)}
                            >
                                <Card 
                                    title={item.titulo ? item.titulo : ' '} 
                                    containerStyle={[styles.card, styles.shadowCard]}
                                    image={item.imagem ? 
                                        { uri: item.imagem } : imgEstadio}
                                    featuredSubtitle={
                                        item.descricao ? item.descricao : ' '}
                                >
                                    <Text style={styles.textData}>
                                        {item.data ? item.data : ' '}
                                    </Text>
                                    <Divider
                                        style={{
                                            marginTop: 5,
                                            marginBottom: 5,
                                            height: 2
                                        }}
                                    />
                                    <Versus />
                                </Card>   
                            </TouchableOpacity>
                            <View style={{ marginBottom: 10 }} />
                        </View>
                    ))
                }
            </ScrollView>
        );
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
                    { 
                        this.state.listJogos.length ?
                        (this.renderListItens())
                        :
                        (<LoadingBallAnim />)
                    }
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
    },
    textData: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    }
});

const mapStateToProps = (state) => ({
    username: state.LoginReducer.username,
    password: state.LoginReducer.password
});

export default connect(mapStateToProps, {})(Jogos);
