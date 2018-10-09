import React from 'react';
import { 
    View,
    StyleSheet,
    Image
} from 'react-native';

import { connect } from 'react-redux';
import { Text } from 'react-native-elements';
import imgHomeShirt from '../../imgs/homeshirt.png';
import imgVisitShirt from '../../imgs/visitshirt.png';
import imgX from '../../imgs/imgx.png';

class Versus extends React.PureComponent {

    render() {
        return (
            <View style={styles.viewPrinc}>
                <Image 
                    source={imgHomeShirt} 
                    style={styles.imgBrasao} 
                />
                <Text h1 style={styles.text}>
                    {this.props.placarCasa ? this.props.placarCasa : '0'}
                </Text>
                <Image 
                    source={imgX} 
                    style={{ resizeMode: 'contain', flex: 0.7, width: 20, height: 20 }} 
                />
                <Text h1 style={styles.text}>
                    {this.props.placarVisit ? this.props.placarVisit : '0'}
                </Text>
                <Image 
                    source={imgVisitShirt} 
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
        width: 50, 
        height: 60 
    },
    text: { 
        color: 'black',
        fontWeight: '400' 
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(Versus);
