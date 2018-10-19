import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage
} from 'react-native';

import { connect } from 'react-redux';
import { CheckBox } from 'react-native-elements';
import Toast from 'react-native-simple-toast';
import FCM from 'react-native-fcm';

class Notifications extends React.Component {

    constructor(props) {
        super(props);

        this.checkConInfo = this.checkConInfo.bind(this);
        this.onPressCheck = this.onPressCheck.bind(this);

        this.state = {
            notifAllTopicEnabled: false
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('notifAllTopicEnabled').then((value) => {
            if (value && value === 'true') {
                this.setState({ notifAllTopicEnabled: true });
            }
        });
    }

    onPressCheck(checkName) {
        if (checkName === 'notifAllTopicEnabled') {
            if (this.state.notifAllTopicEnabled) {
                AsyncStorage.setItem('notifAllTopicEnabled', 'false').then(() => {
                    FCM.unsubscribeFromTopic('all');
                    this.setState({ notifAllTopicEnabled: false });
                });
            } else {
                AsyncStorage.setItem('notifAllTopicEnabled', 'true').then(() => {
                    FCM.subscribeToTopic('all');
                    this.setState({ notifAllTopicEnabled: true });
                });
            }
        }
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
            <View style={styles.viewPrinc}>
                <CheckBox
                    center
                    title='Notificar quando jogos são criados.'
                    iconRight
                    checked={this.state.notifAllTopicEnabled}
                    onPress={() => this.onPressCheck('notifAllTopicEnabled')}
                />
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
