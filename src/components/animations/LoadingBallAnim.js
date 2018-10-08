import React from 'react';
import { 
    View, 
    StyleSheet,
    Animated,
    Easing,
    Dimensions,
} from 'react-native';

import imgBall from '../../imgs/bolaanim.png';

export default class LoadingBallAnim extends React.Component {
    constructor(props) {
        super(props);

        this.viewAnim = new Animated.Value(0);
        this.animViewTimeout = null;
        
        this.ballAnimOne = new Animated.Value(0);
        this.ballAnimOneRotX = new Animated.Value(0);

        this.ballAnimTwo = new Animated.Value(0);
        this.ballAnimThree = new Animated.Value(0);
        this.ballAnimFour = new Animated.Value(0);
        this.ballAnimFive = new Animated.Value(0);


        this.ballOneTime = null;
        this.ballOneTimeRotX = null;

        this.ballTwoTime = null;
        this.ballThreeTime = null;
        this.ballFourTime = null;
        this.ballFiveTime = null;
        
        this.doAnim = this.doAnim.bind(this);
        this.renderBalls = this.renderBalls.bind(this);
        this.renderNetDown = this.renderNetDown.bind(this);

        this.animBallOne = this.animBallOne.bind(this);
        this.animBallOneRotX = this.animBallOneRotX.bind(this);

        this.animBallTwo = this.animBallTwo.bind(this);
        this.animBallThree = this.animBallThree.bind(this);
        this.animBallFour = this.animBallFour.bind(this);
        this.animBallFive = this.animBallFive.bind(this);

        this.state = {
            animsOn: true
        };
    }

    componentDidMount() {
        this.doAnim(
            -100,
            Dimensions.get('screen').height
        );
        this.animViewTimeout = setTimeout(() => {
            this.ballOneTime.stop();
            this.ballTwoTime.stop();
            this.ballThreeTime.stop();
            this.ballFourTime.stop();
            this.ballFiveTime.stop();
            this.setState({ animsOn: false });
            this.animNetView(-100, Dimensions.get('window').height / 2, 3000);
        }, 15000);
    }

    componentWillUnmount() {
        this.ballOneTime.stop();
        this.ballTwoTime.stop();
        this.ballThreeTime.stop();
        this.ballFourTime.stop();
        this.ballFiveTime.stop();
        clearTimeout(this.animViewTimeout);
    }

    doAnim(initValue, toValue) {
        this.animBallOne(initValue, toValue, 2000);
        //this.animBallOneRotX(0, 1, 1000);

        this.animBallTwo(initValue, toValue, 3000);
        this.animBallThree(initValue, toValue, 1500);
        this.animBallFour(initValue, toValue, 5000);
        this.animBallFive(initValue, toValue, 6000);
    }

    animNetView(initValue, toValue, duration) {
        this.viewAnim.setValue(initValue);

        Animated.timing(this.viewAnim, {
            toValue,
            duration,
            easing: Easing.linear
        }).start();
    }

    animBallOne(initValue, toValue, duration) {
        this.ballAnimOne.setValue(initValue);

        this.ballOneTime = Animated.timing(this.ballAnimOne, {
            toValue,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
        });
        this.ballOneTime.start(() => { this.animBallOne(initValue, toValue, duration); });
    }

    animBallOneRotX(initValue, toValue, duration) {
        this.ballAnimOneRotX.setValue(initValue);

        this.ballOneTimeRotX = Animated.timing(this.ballAnimOneRotX, {
            toValue,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
        });
        this.ballOneTimeRotX.start(() => { this.animBallOneRotX(initValue, toValue, duration); });
    }

    animBallTwo(initValue, toValue, duration) {
        this.ballAnimTwo.setValue(initValue);

        this.ballTwoTime = Animated.timing(this.ballAnimTwo, {
            toValue,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
        });
        this.ballTwoTime.start(() => { this.animBallTwo(initValue, toValue, duration); });
    }

    animBallThree(initValue, toValue, duration) {
        this.ballAnimThree.setValue(initValue);

        this.ballThreeTime = Animated.timing(this.ballAnimThree, {
            toValue,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
        });
        this.ballThreeTime.start(() => { this.animBallThree(initValue, toValue, duration); });
    }

    animBallFour(initValue, toValue, duration) {
        this.ballAnimFour.setValue(initValue);

        this.ballFourTime = Animated.timing(this.ballAnimFour, {
            toValue,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
        });
        this.ballFourTime.start(() => { this.animBallFour(initValue, toValue, duration); });
    }

    animBallFive(initValue, toValue, duration) {
        this.ballAnimFive.setValue(initValue);

        this.ballFiveTime = Animated.timing(this.ballAnimFive, {
            toValue,
            duration,
            easing: Easing.linear,
            useNativeDriver: true
        });
        this.ballFiveTime.start(() => { this.animBallFive(initValue, toValue, duration); });
    }

    renderBalls() {
        return (
            <View style={styles.viewPrinc}>
                <Animated.Image 
                    source={imgBall} 
                    style={{ 
                        width: 50,
                        height: 50,
                        transform: [
                            { translateY: this.ballAnimOne }
                        ]
                    }}
                />
                <Animated.Image 
                    source={imgBall} 
                    style={{ 
                        width: 50,
                        height: 50,
                        transform: [{ translateY: this.ballAnimTwo }]
                    }}
                />
                <Animated.Image 
                    source={imgBall} 
                    style={{ 
                        width: 50,
                        height: 50,
                        transform: [{ translateY: this.ballAnimThree }]
                    }}
                />
                <Animated.Image 
                    source={imgBall} 
                    style={{ 
                        width: 50,
                        height: 50,
                        transform: [{ translateY: this.ballAnimFour }]
                    }}
                />
                <Animated.Image 
                    source={imgBall} 
                    style={{ 
                        width: 50,
                        height: 50,
                        transform: [{ translateY: this.ballAnimFive }]
                    }}
                />
            </View>
        );
    }

    renderNetDown() {
        return (
            <Animated.View
                style={{ 
                    flex: 1, 
                    alignItems: 'center', 
                    transform: [{ translateY: this.viewAnim }]
                }}
            >
                <Animated.Image 
                    source={imgBall} 
                    style={{ 
                        width: 50,
                        height: 50
                    }}
                />
                <Animated.Text 
                    style={{ 
                        color: 'white',
                        fontSize: 24,
                        fontWeight: 'bold',
                        opacity: this.viewAnim.interpolate({
                            inputRange: [
                                Dimensions.get('screen').height / 5, 
                                Dimensions.get('screen').height / 2.5
                            ],
                            outputRange: [0, 1]
                        }) 
                    }}
                >
                    Sem conexão
                </Animated.Text>
            </Animated.View>
        ); 
    }

    render() {
        const viewChoosed = this.state.animsOn ? this.renderBalls() : this.renderNetDown();
        return viewChoosed;
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    }
});

