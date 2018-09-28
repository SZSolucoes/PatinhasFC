import React from 'react';
import { 
    View, 
    StyleSheet,
    Text
} from 'react-native';

import { connect } from 'react-redux';
import Campo from '../campo/Campo';

class Informativos extends React.Component {

    render() {
        return (
            <View style={styles.viewPrinc}>
                <Campo />
                <Campo renderSide='visitantes' />
                <View style={{ marginBottom: 100 }} />
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

export default connect(mapStateToProps, {})(Informativos);
