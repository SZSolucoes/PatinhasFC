
import React from 'react';
import {
    View, 
    Animated,
    StyleSheet,
    Dimensions,
    Text,
    TouchableWithoutFeedback
} from 'react-native';
import { Icon, Divider } from 'react-native-elements';
import { connect } from 'react-redux';
import { modificaStartUpOrDownAnim } from '../../actions/InfoActions';

class Coment extends React.Component {

    constructor(props) {
        super(props);

        this.listenerDimensions = null;
        this.onChangeDimension = this.onChangeDimension.bind(this);
        this.startUpOrDownAnim = this.startUpOrDownAnim.bind(this);

        this.state = {
            maxHeight: Dimensions.get('window').height,
            animScreenT: new Animated.Value(Dimensions.get('window').height)
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.onChangeDimension);
    }

    shouldComponentUpdate(nextProps, nextStates) {
        if (nextProps.startUpOrDownAnim !== this.props.startUpOrDownAnim) {
            this.startUpOrDownAnim(nextProps.startUpOrDownAnim); 
        }    
        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangeDimension);
    }

    onChangeDimension(event) {
        this.setState({ maxHeight: event.window.heigth });
    }

    startUpOrDownAnim(startUpOrDownAnim) {
        if (startUpOrDownAnim === 'up') {
            Animated.spring(
                this.state.animScreenT, 
                {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 2
                }
            ).start();
        } else {
            Animated.spring(
                this.state.animScreenT, 
                {
                    toValue: this.state.maxHeight,
                    useNativeDriver: true,
                    bounciness: 2
                }
            ).start();
        }
    }

    render() {
        return (
            <View styles={styles.viewPrincip}>
                <Animated.View 
                    style={{ 
                        backgroundColor: 'black', 
                        width: '100%',
                        height: '100%',
                        transform: [{ translateY: this.state.animScreenT }]
                    }} 
                >
                    <View style={styles.containerPrincip}>
                        <View
                            style={{ 
                                flexDirection: 'row', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: 15
                            }}
                        >
                            <View
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <Icon
                                    name='thumb-up' 
                                    type='material-community' 
                                    size={18} color='green'
                                />
                                <View style={{ marginHorizontal: 3 }} />
                                <Text
                                    style={{ fontWeight: 'bold' }}
                                >
                                    {
                                        !!this.props.listInfos &&
                                        this.props.listInfos.listLikes ?
                                        this.props.listInfos.listLikes.length
                                        :
                                        0
                                    }
                                </Text>
                            </View>
                            <TouchableWithoutFeedback
                                style={{ alignSelf: 'flex-end' }}
                                onPress={() => this.props.modificaStartUpOrDownAnim('down')}
                            >
                                <Icon
                                    name='arrow-collapse-down' 
                                    type='material-community' 
                                    size={24} color='black'
                                    iconStyle={{ opacity: 0.8 }}
                                />
                            </TouchableWithoutFeedback>
                        </View>
                        <Divider />
                    </View>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrincip: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
    },
    containerPrincip: {
        backgroundColor: 'white', 
        width: '100%', 
        height: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    }
});

const mapStateToProps = (state) => ({
    startUpOrDownAnim: state.InfoReducer.startUpOrDownAnim,
    listInfos: state.InfoReducer.listInfos
});

export default connect(mapStateToProps, {
    modificaStartUpOrDownAnim
})(Coment);

