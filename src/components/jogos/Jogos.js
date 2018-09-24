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
import { Actions } from 'react-native-router-flux';
import { Card, Divider } from 'react-native-elements';
import LoadingBallAnim from '../animations/LoadingBallAnim';
import Versus from './Versus';
import imgCampoJogos from '../../imgs/campojogos.png';
import imgEstadio from '../../imgs/estadio.jpg';
import { modificaListJogos } from '../../actions/JogosActions';

class Jogos extends React.Component {

    constructor(props) {
        super(props);

        this.startOrStopFBJogosListener = this.startOrStopFBJogosListener.bind(this);
        this.renderListItens = this.renderListItens.bind(this);
        this.removeImagem = this.removeImagem.bind(this);
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
        const user = firebase.auth().currentUser;

        if (!user) {
            Actions.replace('login');
            return;
        }

        if (startOrStop) {
            const databaseRef = firebase.database().ref();
            this.dbJogosRef = databaseRef.child('jogos').on('value', (snapshot) => {
                this.props.modificaListJogos(
                    _.map(snapshot.val(), (value, key) => ({ key, ...value }))
                ); 
            });
            databaseRef.child('jogos').once('value', (snapshot) => {
                if (!this.props.listJogos.length) {
                    this.props.modificaListJogos(
                        _.map(snapshot.val(), (value, key) => ({ key, ...value }))
                    ); 
                }
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
                    this.props.listJogos.map((item, index) => (
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
                        this.props.listJogos.length ?
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
        padding: 0,
        margin: 0,
        marginHorizontal: 10,
        marginVertical: 15
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
    password: state.LoginReducer.password,
    listJogos: state.JogosReducer.listJogos
});

export default connect(mapStateToProps, {
    modificaListJogos
})(Jogos);
