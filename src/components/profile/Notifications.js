import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage
} from 'react-native';

import { connect } from 'react-redux';
import { CheckBox, List, ListItem } from 'react-native-elements';
import FCM from 'react-native-fcm';
import { checkConInfo } from '../../utils/jogosUtils';
import { mappedKeyStorage } from '../../utils/store';

class Notifications extends React.Component {

    constructor(props) {
        super(props);

        this.onPressCheck = this.onPressCheck.bind(this);

        this.state = {
            notifAllTopicEnabled: false
        };
    }

    componentDidMount() {
        AsyncStorage.getItem(mappedKeyStorage('notifAllTopicEnabled')).then((value) => {
            if (value && value === 'yes') {
                this.setState({ notifAllTopicEnabled: true });
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
        }
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <List>
                    <ListItem
                        title='Criação de jogos'
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
