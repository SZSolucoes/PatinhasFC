
import React from 'react';
import {
    View,
    Text,
    TouchableWithoutFeedback,
    Animated
} from 'react-native';
import { Icon, Divider } from 'react-native-elements';
import _ from 'lodash';
import b64 from 'base-64';

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
        const { item, userLogged } = this.props;
        const b64UserKey = b64.encode(userLogged.email);
        const qtdLikes = item.listLikes ? item.listLikes.length : 0;
        const qtdComents = item.listComents ? item.listComents.length : 0;
        const likeFound = _.findIndex(
            item.listLikes, 
            (itemLike) => itemLike.key && (itemLike.key === b64UserKey)
        );
        let txtQtdLikes = '';
        let txtQtdComent = '';
        let likeIconType = 'thumb-up-outline';
        let likeOrDeslike = 'like';

        if (likeFound !== -1) {
            likeIconType = 'thumb-up';
            likeOrDeslike = 'deslike';
        }

        if (qtdLikes === 0 || (qtdLikes === 1 && item.listLikes[0].push)) {
            txtQtdLikes = '0 curtidas';
        } else if (qtdLikes === 1) {
            txtQtdLikes = `${qtdLikes.toString()} curtiu`;
        } else {
            txtQtdLikes = `${qtdLikes.toString()} curtiram`;
        }

        if (qtdComents === 0 || (qtdComents === 1 && item.listComents[0].push)) {
            txtQtdComent = '0 comentários';
        } else if (qtdComents === 1) {
            txtQtdComent = `${qtdComents.toString()} comentou`;
        } else {
            txtQtdComent = `${qtdComents.toString()} comentaram`;
        }

        return (
            <View style={{ marginHorizontal: 10 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: '#A2A2A2' }}>
                        { txtQtdLikes }
                    </Text>
                    <View style={{ marginHorizontal: 5 }}>
                        <Text style={{ textAlign: 'center' }}>-</Text>
                    </View>
                    <Text style={{ color: '#A2A2A2' }}>
                        { txtQtdComent }
                    </Text>
                </View>
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
                        onPress={() => this.props.onPressLikeBtn(likeOrDeslike, item)}
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
                                name={likeIconType}
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
                        }}
                        onPress={() => this.props.comentsUpOrDown('up')}
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
                        onPress={() => false}
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

