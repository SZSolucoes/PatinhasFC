import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    Text,
    Platform,
    TouchableOpacity
} from 'react-native';

import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { Card, Icon } from 'react-native-elements';
import { Actions } from 'react-native-router-flux';
import { colorAppF } from '../../utils/constantes';

class Admin extends React.Component {

    constructor(props) {
        super(props);

        this.checkConInfo = this.checkConInfo.bind(this);
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

    render() {
        return (
            <ScrollView style={styles.viewPrinc}>
                <View style={{ marginTop: 20 }} />
                <View style={styles.viewLinha}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.cadastroJogos()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon name='soccer-field' type='material-community' size={34} />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Jogos</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.gerenciar()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <View style={{ marginTop: 2 }} />
                                <Icon name='users' type='font-awesome' size={26} />
                                <View style={{ marginTop: 15 }} />
                                <Text style={styles.text}>Gerenciar</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewLinha}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.usuarios()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon 
                                    name='account-card-details' 
                                    type='material-community' 
                                    size={34} 
                                />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Usuários</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => false}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon name='finance' type='material-community' size={34} />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Análise</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>
                <View style={styles.viewLinha}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.cadastroInfos()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <View style={{ marginTop: 2 }} />
                                <Icon name='clipboard' type='font-awesome' size={26} />
                                <View style={{ marginTop: 15 }} />
                                <Text style={styles.text}>Informativos</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => Actions.historico()}
                    >
                        <Card 
                            containerStyle={{ flex: 1 }}
                            wrapperStyle={{ flex: 1 }}
                        >
                            <View style={styles.viewIconText}>
                                <Icon name='history' type='material-community' size={34} />
                                <View style={{ marginTop: 10 }} />
                                <Text style={styles.text}>Histórico</Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 100 }} />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    viewLinha: {
        flex: 1,
        flexDirection: 'row',
        ...Platform.select({
            ios: {
                elevation: 2
            },
            android: {
                elevation: 2
            }
        })
    },
    viewIconText: { 
        flex: 1, 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    text: {
        color: 'black',
        fontWeight: '400',
        alignSelf: 'center'
    }
});

const mapStateToProps = (state) => ({
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {})(Admin);
