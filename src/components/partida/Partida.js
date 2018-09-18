import React from 'react';
import { 
    View,
    StyleSheet,
    Image,
    Text
} from 'react-native';

import { connect } from 'react-redux';
import imgBrasaoCasa from '../../imgs/brasaocasa.png';
import imgBrasaoVisit from '../../imgs/brasaovisit.png';
import imgX from '../../imgs/imgx.png';

class Partida extends React.PureComponent {

    render() {
        return (
            <View style={styles.viewPrinc}>
                <Image 
                    source={imgBrasaoCasa} 
                    style={styles.imgBrasao} 
                />
                <Text style={styles.text}>0</Text>
                <Image 
                    source={imgX} 
                    style={{ resizeMode: 'contain', flex: 1, width: 30, height: 30 }} 
                />
                <Text style={styles.text}>0</Text>
                <Image 
                    source={imgBrasaoVisit} 
                    style={styles.imgBrasao} 
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white'
    },
    imgBrasao: { 
        resizeMode: 'contain', 
        flex: 1, 
        width: 70, 
        height: 70 
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(Partida);
