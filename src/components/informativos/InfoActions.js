
import React from 'react';
import {
    View,
    Text,
    TouchableWithoutFeedback,
    Animated
} from 'react-native';
import { Icon, Divider } from 'react-native-elements';

export default class InfoActions extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            curtirAnimValue: new Animated.Value(1),
            comentAnimValue: new Animated.Value(1),
            compartAnimValue: new Animated.Value(1)
        };
    }

    render() {
        const { item } = this.props;
        const qtdComents = item.listComents.length;
        let txtQtdComent = '';

        if (qtdComents === 0) {
            txtQtdComent = '0 comentários';
        } else if (qtdComents === 1) {
            txtQtdComent = `${qtdComents.toString()} comentou`;
        } else {
            txtQtdComent = `${qtdComents.toString()} comentaram`;
        }

        if (qtdComents > 0) {
            return (
                <View style={{ marginHorizontal: 10 }}>
                    <Text style={{ color: '#A2A2A2' }}>
                        { txtQtdComent }
                    </Text>
                    <Divider style={{ marginVertical: 10 }} />
                    <View 
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            justifyContent: 'space-between' 
                        }}
                    >
                        <TouchableWithoutFeedback
                            onPressIn={() => {
                                Animated.spring(
                                    this.state.curtirAnimValue, 
                                    {
                                        toValue: 0.7,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPressOut={() => {
                                Animated.spring(
                                    this.state.curtirAnimValue, 
                                    {
                                        toValue: 1,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                        >
                            <Animated.View 
                                style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    transform: [{ scale: this.state.curtirAnimValue }]
                                }}
                            >
                                <Icon
                                    name='thumb-up-outline' 
                                    type='material-community' 
                                    size={24} color='green'
                                />
                                <View style={{ marginHorizontal: 4 }} />
                                <Text style={{ color: '#A2A2A2' }}>
                                    Curtir
                                </Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                            onPressIn={() => {
                                Animated.spring(
                                    this.state.comentAnimValue, 
                                    {
                                        toValue: 0.7,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPressOut={() => {
                                Animated.spring(
                                    this.state.comentAnimValue, 
                                    {
                                        toValue: 1,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                                this.props.comentsUpOrDown('up');
                            }}
                        >
                            <Animated.View 
                                style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transform: [{ scale: this.state.comentAnimValue }] 
                                }}
                            >
                                <Icon
                                    name='comment-text-outline' 
                                    type='material-community' 
                                    size={24} color='green'
                                />
                                <View style={{ marginHorizontal: 4 }} />
                                <Text style={{ color: '#A2A2A2' }}>
                                    Comentar
                                </Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                            onPressIn={() => {
                                Animated.spring(
                                    this.state.compartAnimValue, 
                                    {
                                        toValue: 0.7,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                            onPressOut={() => {
                                Animated.spring(
                                    this.state.compartAnimValue, 
                                    {
                                        toValue: 1,
                                        useNativeDriver: true,
                                        bounciness: 2
                                    }
                                ).start();
                            }}
                        >
                            <Animated.View 
                                style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center', 
                                    justifyContent: 'space-between',
                                    transform: [{ scale: this.state.compartAnimValue }]
                                }}
                            >
                                <Icon
                                    name='share-outline' 
                                    type='material-community' 
                                    size={24} color='green'
                                />
                                <View style={{ marginHorizontal: 4 }} />
                                <Text style={{ color: '#A2A2A2' }}>
                                    Compartilhar
                                </Text>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            );
        }
    }
}

