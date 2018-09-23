import React from 'react';
import { 
    View, 
    StyleSheet,
    Animated,
    Easing,
    Dimensions
} from 'react-native';

import imgBall from '../../imgs/bolaanim.png';

export default class LoadingBallAnim extends React.Component {
    constructor(props) {
        super(props);
        
        this.ballAnimOne = new Animated.Value(0);
        this.ballAnimTwo = new Animated.Value(0);
        this.ballAnimThree = new Animated.Value(0);
        this.ballAnimFour = new Animated.Value(0);
        this.ballAnimFive = new Animated.Value(0);

        this.ballOneTime = null;
        this.ballTwoTime = null;
        this.ballThreeTime = null;
        this.ballFourTime = null;
        this.ballFiveTime = null;
        
        this.doAnim = this.doAnim.bind(this);
        this.animBallOne = this.animBallOne.bind(this);
        this.animBallTwo = this.animBallTwo.bind(this);
        this.animBallThree = this.animBallThree.bind(this);
        this.animBallFour = this.animBallFour.bind(this);
        this.animBallFive = this.animBallFive.bind(this);
    }

    componentDidMount() {
        this.doAnim(
            -100,
            Dimensions.get('screen').height
        );
    }

    componentWillUnmount() {
        this.ballOneTime.stop();
        this.ballTwoTime.stop();
        this.ballThreeTime.stop();
        this.ballFourTime.stop();
        this.ballFiveTime.stop();
    }

    doAnim(initValue, toValue) {
        this.animBallOne(initValue, toValue, 1000);
        this.animBallTwo(initValue, toValue, 3000);
        this.animBallThree(initValue, toValue, 1500);
        this.animBallFour(initValue, toValue, 5000);
        this.animBallFive(initValue, toValue, 6000);
    }

    animBallOne(initValue, toValue, duration) {
        this.ballAnimOne.setValue(initValue);

        this.ballOneTime = Animated.timing(this.ballAnimOne, {
            toValue,
            duration,
            easing: Easing.linear
        });
        this.ballOneTime.start(() => { this.animBallOne(initValue, toValue, duration); });
    }

    animBallTwo(initValue, toValue, duration) {
        this.ballAnimTwo.setValue(initValue);

        this.ballTwoTime = Animated.timing(this.ballAnimTwo, {
            toValue,
            duration,
            easing: Easing.linear
        });
        this.ballTwoTime.start(() => { this.animBallTwo(initValue, toValue, duration); });
    }

    animBallThree(initValue, toValue, duration) {
        this.ballAnimThree.setValue(initValue);

        this.ballThreeTime = Animated.timing(this.ballAnimThree, {
            toValue,
            duration,
            easing: Easing.linear
        });
        this.ballThreeTime.start(() => { this.animBallThree(initValue, toValue, duration); });
    }

    animBallFour(initValue, toValue, duration) {
        this.ballAnimFour.setValue(initValue);

        this.ballFourTime = Animated.timing(this.ballAnimFour, {
            toValue,
            duration,
            easing: Easing.linear
        });
        this.ballFourTime.start(() => { this.animBallFour(initValue, toValue, duration); });
    }

    animBallFive(initValue, toValue, duration) {
        this.ballAnimFive.setValue(initValue);

        this.ballFiveTime = Animated.timing(this.ballAnimFive, {
            toValue,
            duration,
            easing: Easing.linear
        });
        this.ballFiveTime.start(() => { this.animBallFive(initValue, toValue, duration); });
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <Animated.Image 
                    source={imgBall} 
                    style={{ 
                        width: 50,
                        height: 50,
                        transform: [{ translateY: this.ballAnimOne }]
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
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between'
    }
});

