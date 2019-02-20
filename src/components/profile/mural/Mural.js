/* eslint-disable max-len */
import React from 'react';
import {
    ScrollView,
    Text,
    View,
    Animated,
    Dimensions,
    TouchableWithoutFeedback
} from 'react-native';
import { connect } from 'react-redux';
import Moment from 'moment';
import Card from '../../tools/Card';
import MonthSelector from '../../tools/MonthSelector';

class Mural extends React.Component {
    constructor(props) {
        super(props);

        this.animCalendarWidth = new Animated.Value(0);
        this.animCalendarHeight = new Animated.Value(0);
        this.animCalendarTranslateX = new Animated.Value(Dimensions.get('screen').width);

        this.calendarDims = {
            width: Dimensions.get('screen').width,
            height: 300
        };

        this.state = {
            month: Moment()
        };
    }

    componentDidMount = () => {
        setTimeout(() => console.log(this.calendarDims), 2000);
    }

    onPressDateBtn = () => {
        this.animCalendarWidth.setValue(0);
        this.animCalendarHeight.setValue(0);
        this.animCalendarTranslateX.setValue(0);

        Animated.parallel([
            Animated.spring(
                this.animCalendarWidth,
                {
                    toValue: this.calendarDims.width
                }
            ),
            Animated.spring(
                this.animCalendarHeight,
                {
                    toValue: this.calendarDims.height
                }
            )
        ]).start();
    }

    render = () => (
        <View
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback
                onPress={() => this.onPressDateBtn()}
            >
                <View style={{ height: 100, backgroundColor: 'yellow' }} />
            </TouchableWithoutFeedback>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1
                }}
            >
                <Card
                    containerStyle={{
                        padding: 0
                    }}
                >
                    <Text>
                        Mural
                    </Text>
                </Card>
            </ScrollView>
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 200,
                    overflow: 'hidden',
                    transform: [
                        { translateX: this.animCalendarTranslateX }, 
                        { 
                            scaleX: this.animCalendarWidth.interpolate({
                                inputRange: [0, this.calendarDims.width],
                                outputRange: [0.1, 1],
                                extrapolate: 'clamp'
                            }) 
                        },
                        { 
                            scaleY: this.animCalendarHeight.interpolate({
                                inputRange: [0, this.calendarDims.height],
                                outputRange: [0.1, 1],
                                extrapolate: 'clamp'
                            }) 
                        }
                    ]
                }}
            >
                <View>
                    <MonthSelector
                        selectedDate={this.state.month}
                        onMonthTapped={(date) => this.setState({ month: date })}
                    />
                </View>
            </Animated.View>
        </View>
    );
}

export default connect()(Mural);
