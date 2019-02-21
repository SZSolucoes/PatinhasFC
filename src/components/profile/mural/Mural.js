/* eslint-disable max-len */
import React from 'react';
import {
    ScrollView,
    Text,
    View,
    Animated,
    Dimensions,
    Platform,
    TouchableOpacity
} from 'react-native';
import { Icon, CheckBox } from 'react-native-elements';
import { connect } from 'react-redux';
import Moment from 'moment';
import _ from 'lodash';
import Card from '../../tools/Card';
import MonthSelector from '../../tools/MonthSelector';
import { colorAppT } from '../../../utils/constantes';
import { normalize } from '../../../utils/strComplex';

const textAll = 'Todo o Período';

class Mural extends React.Component {
    constructor(props) {
        super(props);

        this.animCalendarWidth = new Animated.Value();
        this.animCalendarHeight = new Animated.Value();
        this.animCalendarTranslateX = new Animated.Value(Dimensions.get('window').width);

        this.calendarDims = {
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').width
        };
        this.isCalendarOpened = false;
        this.isAnimating = false;

        this.state = {
            month: Moment(),
            monthText: textAll,
            yearsmonthsAllowed: [
                { 
                    moment: Moment('18/12/2018 15:23:02', 'DD-MM-YYYY'), 
                    formated: Moment('18/12/2018 15:23:02', 'DD-MM-YYYY').format('MM/YYYY')
                },
               { 
                    moment: Moment('18/12/2019 15:23:02', 'DD-MM-YYYY'), 
                    formated: Moment('18/12/2019 15:23:02', 'DD-MM-YYYY').format('MM/YYYY')
                }
            ]
        };
    }

    componentDidMount = () => {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount = () => {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions = ({ window }) => {
        this.calendarDims.width = window.width;
        this.calendarDims.height = window.width;

        if (this.isCalendarOpened) this.onPressDateBtn(true);
    }

    onPressDateBtn = (showCalendar = false, brokeAnim = false) => {
        if (!this.isAnimating || brokeAnim) {
            this.isAnimating = true;

            if (showCalendar) {
                if (!this.isCalendarOpened) {
                    this.animCalendarWidth.setValue(0);
                    this.animCalendarHeight.setValue(0);
                    this.animCalendarTranslateX.setValue(0);
                }
        
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
                ]).start(() => {
                    this.isCalendarOpened = true;
                    this.isAnimating = false;
                });
            } else {
                Animated.parallel([
                    Animated.spring(
                        this.animCalendarWidth,
                        {
                            toValue: 0,
                            bounciness: 0
                        }
                    ),
                    Animated.spring(
                        this.animCalendarHeight,
                        {
                            toValue: 0,
                            bounciness: 0
                        }
                    )
                ]).start(() => {
                    this.animCalendarTranslateX.setValue(this.calendarDims.width);
                    this.isCalendarOpened = false;
                    this.isAnimating = false;
                });
            }
        }
    }

    onMonthSelected = (date) => {
        this.setState({ month: date, monthText: date.format('MM/YYYY') });
        this.onPressDateBtn(false, true);
    }

    render = () => (
        <View
            style={{ flex: 1 }}
        >
            <View 
                style={{
                    height: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center', 
                    backgroundColor: colorAppT,
                    ...Platform.select({
                        ios: {
                            shadowColor: 'rgba(0,0,0, .2)',
                            shadowOffset: { height: 0, width: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 1
                        },
                        android: {
                            elevation: 2
                        }
                    })
                }}
            >
                <View style={{ flex: 1 }}>
                    <CheckBox
                        title={'Tudo'}
                        checked={this.state.monthText === textAll}
                        onPress={() => false}
                        size={20}
                        textStyle={{ fontSize: normalize(14), color: 'white' }}
                        checkedColor={'white'}
                        containerStyle={{
                            padding: 5,
                            backgroundColor: 'transparent'
                        }}
                    />
                </View>
                <View 
                    style={{ 
                        flex: 1.5,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text
                        style={{
                            textAlign: 'center',
                            color: 'white',
                            fontSize: normalize(16),
                            fontWeight: '500'
                        }}
                    >
                        {this.state.monthText}
                    </Text>
                </View>
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'flex-end', 
                        justifyContent: 'center',
                        paddingRight: 10
                    }}
                >
                    <TouchableOpacity
                        onPress={() => this.onPressDateBtn(!this.isCalendarOpened, true)}
                    >
                        <Icon 
                            name={'calendar'}
                            type={'material-community'}
                            size={34}
                            color={'white'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ flex: 1 }}>
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
                        right: 0,
                        width: this.animCalendarWidth,
                        height: this.animCalendarHeight,
                        zIndex: 400,
                        overflow: 'hidden',
                        transform: [
                            { translateX: this.animCalendarTranslateX }, 
                            /* { 
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
                            } */
                        ]
                    }}
                >
                    <View>
                        <MonthSelector
                            selectedDate={this.state.month}
                            minDate={_.minBy(this.state.yearsmonthsAllowed, 'formated').moment}
                            maxDate={_.maxBy(this.state.yearsmonthsAllowed, 'formated').moment}
                            initialView={_.maxBy(this.state.yearsmonthsAllowed, 'formated').moment}
                            onMonthTapped={(date) => this.onMonthSelected(date)}
                            yearsmonthsAllowed={this.state.yearsmonthsAllowed}
                        />
                    </View>
                </Animated.View>
            </View>
        </View>
    );
}

export default connect()(Mural);
