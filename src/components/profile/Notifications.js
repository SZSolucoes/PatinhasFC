/* eslint-disable max-len */
import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage
} from 'react-native';

import { connect } from 'react-redux';
import { CheckBox, List } from 'react-native-elements';
import FCM from 'react-native-fcm';
import { checkConInfo } from '../../utils/jogosUtils';
import { mappedKeyStorage } from '../../utils/store';
import ListItem from '../tools/ListItem';

class Notifications extends React.Component {

    constructor(props) {
        super(props);

        this.onPressCheck = this.onPressCheck.bind(this);

        this.state = {
            notifAllTopicEnabled: false,
            notifEnquetesEnabled: false,
            notifMuralEnabled: false,
            notifInformativosEnabled: false
        };
    }

    componentDidMount() {
        AsyncStorage.getItem(mappedKeyStorage('notifAllTopicEnabled')).then((value) => {
            if (value && value === 'yes') {
                this.setState({ notifAllTopicEnabled: true });
            }
        });
        AsyncStorage.getItem(mappedKeyStorage('notifEnquetesEnabled')).then((value) => {
            if (value && value === 'yes') {
                this.setState({ notifEnquetesEnabled: true });
            }
        });
        AsyncStorage.getItem(mappedKeyStorage('notifMuralEnabled')).then((value) => {
            if (value && value === 'yes') {
                this.setState({ notifMuralEnabled: true });
            }
        });
        AsyncStorage.getItem(mappedKeyStorage('notifInformativosEnabled')).then((value) => {
            if (value && value === 'yes') {
                this.setState({ notifInformativosEnabled: true });
            }
        });
    }

    onPressCheck(checkName) {
        if (checkName === 'notifAllTopicEnabled') {
            if (this.state.notifAllTopicEnabled) {
                AsyncStorage.setItem(mappedKeyStorage('notifAllTopicEnabled'), 'no').then(() => {
                    FCM.unsubscribeFromTopic('all');
                    this.setState({ notifAllTopicEnabled: false });
                });
            } else {
                AsyncStorage.setItem(mappedKeyStorage('notifAllTopicEnabled'), 'yes').then(() => {
                    FCM.subscribeToTopic('all');
                    this.setState({ notifAllTopicEnabled: true });
                });
            }
        } else if (checkName === 'notifEnquetesEnabled') {
            if (this.state.notifEnquetesEnabled) {
                AsyncStorage.setItem(mappedKeyStorage('notifEnquetesEnabled'), 'no').then(() => {
                    FCM.unsubscribeFromTopic('enquetes');
                    this.setState({ notifEnquetesEnabled: false });
                });
            } else {
                AsyncStorage.setItem(mappedKeyStorage('notifEnquetesEnabled'), 'yes').then(() => {
                    FCM.subscribeToTopic('enquetes');
                    this.setState({ notifEnquetesEnabled: true });
                });
            }
        } else if (checkName === 'notifMuralEnabled') {
            if (this.state.notifMuralEnabled) {
                AsyncStorage.setItem(mappedKeyStorage('notifMuralEnabled'), 'no').then(() => {
                    FCM.unsubscribeFromTopic('mural');
                    this.setState({ notifMuralEnabled: false });
                });
            } else {
                AsyncStorage.setItem(mappedKeyStorage('notifMuralEnabled'), 'yes').then(() => {
                    FCM.subscribeToTopic('mural');
                    this.setState({ notifMuralEnabled: true });
                });
            }
        } else if (checkName === 'notifInformativosEnabled') {
            if (this.state.notifInformativosEnabled) {
                AsyncStorage.setItem(mappedKeyStorage('notifInformativosEnabled'), 'no').then(() => {
                    FCM.unsubscribeFromTopic('informativos');
                    this.setState({ notifInformativosEnabled: false });
                });
            } else {
                AsyncStorage.setItem(mappedKeyStorage('notifInformativosEnabled'), 'yes').then(() => {
                    FCM.subscribeToTopic('informativos');
                    this.setState({ notifInformativosEnabled: true });
                });
            }
        }
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <List>
                    <ListItem
                        title='Jogos'
                        subtitle={'Receber notificações quando um jogo for criado.'}
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <CheckBox
                                title={this.state.notifAllTopicEnabled ? 'Ativo  ' : 'Inativo'}
                                checked={this.state.notifAllTopicEnabled}
                                onPress={() => 
                                    checkConInfo(this.onPressCheck, ['notifAllTopicEnabled'])
                                }
                            />
                        )}
                    />
                </List>
                <List>
                    <ListItem
                        title='Enquetes'
                        subtitle={'Receber notificações quando uma enquete for criada.'}
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <CheckBox
                                title={this.state.notifEnquetesEnabled ? 'Ativo  ' : 'Inativo'}
                                checked={this.state.notifEnquetesEnabled}
                                onPress={() => 
                                    checkConInfo(this.onPressCheck, ['notifEnquetesEnabled'])
                                }
                            />
                        )}
                    />
                </List>
                <List>
                    <ListItem
                        title='Mural'
                        subtitle={'Receber notificações quando uma publicação for criada.'}
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <CheckBox
                                title={this.state.notifMuralEnabled ? 'Ativo  ' : 'Inativo'}
                                checked={this.state.notifMuralEnabled}
                                onPress={() => 
                                    checkConInfo(this.onPressCheck, ['notifMuralEnabled'])
                                }
                            />
                        )}
                    />
                </List>
                <List>
                    <ListItem
                        title='Informativos'
                        subtitle={'Receber notificações quando um informativo for publicado.'}
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <CheckBox
                                title={this.state.notifInformativosEnabled ? 'Ativo  ' : 'Inativo'}
                                checked={this.state.notifInformativosEnabled}
                                onPress={() => 
                                    checkConInfo(this.onPressCheck, ['notifInformativosEnabled'])
                                }
                            />
                        )}
                    />
                </List>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {})(Notifications);
