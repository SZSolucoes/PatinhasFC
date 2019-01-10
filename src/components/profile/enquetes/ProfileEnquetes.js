import React from 'react';
import { 
    View, 
    StyleSheet,
    AsyncStorage,
    Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { connect } from 'react-redux';
import { CheckBox, List, ListItem } from 'react-native-elements';
import { checkConInfo } from '../../../utils/jogosUtils';
import { mappedKeyStorage } from '../../../utils/store';

class ProfileEnquetes extends React.Component {

    constructor(props) {
        super(props);

        this.onPressCheck = this.onPressCheck.bind(this);

        this.state = {
            loginAutomaticoEnabled: false
        };
    }

    componentDidMount() {
        AsyncStorage
        .getItem(mappedKeyStorage('loginAutomaticoEnabled')).then((value) => {
            if (value && value === 'yes') {
                this.setState({ loginAutomaticoEnabled: true });
            }
        });
    }

    onPressCheck(checkName) {
        if (checkName === 'loginautomatico') {
            if (this.state.loginAutomaticoEnabled) {
                AsyncStorage
                .setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'no').then(() => {
                    this.setState({ loginAutomaticoEnabled: false });
                });
            } else {
                AsyncStorage
                .setItem(mappedKeyStorage('loginAutomaticoEnabled'), 'yes').then(() => {
                    this.setState({ loginAutomaticoEnabled: true });
                });
            }
        }
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <List>
                    <ListItem
                        title='Login automático'
                        subtitle={
                            'Salvar usuário e senha para entrada automática.'
                        }
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <CheckBox
                                title={this.state.loginAutomaticoEnabled ? 'Ativo  ' : 'Inativo'}
                                checked={this.state.loginAutomaticoEnabled}
                                onPress={() => 
                                    checkConInfo(() => this.onPressCheck('loginautomatico'))
                                }
                            />
                        )}
                    />
                </List>
                <View>
                    <LineChart
                        data={{
                        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
                        datasets: [{
                            data: [
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100,
                            Math.random() * 100
                            ]
                        }]
                        }}
                        width={Dimensions.get('window').width} // from react-native
                        height={220}
                        chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: '#fb8c00',
                        backgroundGradientTo: '#ffa726',
                        decimalPlaces: 2, // optional, defaults to 2dp
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16
                        }
                        }}
                        bezier
                        style={{
                        marginVertical: 8,
                        borderRadius: 16
                        }}
                    />
                    </View>
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

export default connect(mapStateToProps, {})(ProfileEnquetes);
