import React from 'react';
import { 
    View,
    StyleSheet,
    Text
} from 'react-native';

import { connect } from 'react-redux';

class GerenciarJogo extends React.Component {

    render() {
        return (
            <View style={styles.viewP}>
                <Text>
                    { JSON.stringify(this.props.itemSelected) }
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white'
    },
    imgBrasao: { 
        resizeMode: 'contain', 
        flex: 1, 
        width: 50, 
        height: 60 
    },
    text: { 
        color: 'black',
        fontWeight: '400' 
    }
});

const mapStateToProps = (state) => ({
    itemSelected: state.GerenciarReducer.itemSelected
});

export default connect(mapStateToProps, {})(GerenciarJogo);
