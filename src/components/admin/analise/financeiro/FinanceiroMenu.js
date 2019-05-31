import React from 'react';
import { 
    View, 
    StyleSheet,
    TouchableOpacity
} from 'react-native';

import { connect } from 'react-redux';
import { Actions } from 'react-native-router-flux';
import ListItem from '../../../tools/ListItem';
import Card from '../../../tools/Card';
import { colorAppS } from '../../../../utils/constantes';

class FinanceiroMenu extends React.Component {
    render() {
        return (
            <View style={styles.mainView}>
                <TouchableOpacity
                    onPress={
                        () => Actions.analiseFinanceiro(
                            { onBack: () => Actions.popTo('adminFinanceiroMenu') }
                        )
                    }
                >
                    <Card>
                        <ListItem
                            title='Clube'
                            chevronColor={colorAppS}
                            leftIcon={{ 
                                name: 'cash-multiple', 
                                type: 'material-community', 
                                size: 35, 
                                color: colorAppS 
                            }}
                            titleStyle={{ fontSize: 20, fontWeight: '400' }}
                            containerStyle={{ borderBottomWidth: 0 }}
                        />
                    </Card>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={
                        () => Actions.adminFinanceiroJogadores()
                    }
                >
                    <Card>
                        <ListItem
                            title='Jogadores'
                            chevronColor={colorAppS}
                            leftIcon={{ 
                                name: 'account-multiple', 
                                type: 'material-community', 
                                size: 35, 
                                color: colorAppS 
                            }}
                            titleStyle={{ fontSize: 20, fontWeight: '400' }}
                            containerStyle={{ borderBottomWidth: 0 }}
                        />
                    </Card>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={
                        () => Actions.adminFinanceiroParametros()
                    }
                >
                    <Card>
                        <ListItem
                            title='Parâmetros'
                            chevronColor={colorAppS}
                            leftIcon={{ 
                                name: 'settings', 
                                type: 'material-community', 
                                size: 35, 
                                color: colorAppS 
                            }}
                            titleStyle={{ fontSize: 20, fontWeight: '400' }}
                            containerStyle={{ borderBottomWidth: 0 }}
                        />
                    </Card>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainView: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {})(FinanceiroMenu);
