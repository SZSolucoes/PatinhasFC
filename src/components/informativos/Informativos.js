import React from 'react';
import {
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Image,
    Text,
    TouchableWithoutFeedback,
    Linking
} from 'react-native';
import firebase from 'firebase';
import b64 from 'base-64';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Card, ListItem, Icon } from 'react-native-elements';
import InfoActions from './InfoActions';
import Coment from './Coment';
import { modificaStartUpOrDownAnim } from '../../actions/InfoActions';

import imgAvatar from '../../imgs/patinhasfclogo.png';
import { colorAppF } from '../../utils/constantes';

class Informativos extends React.Component {

    constructor(props) {
        super(props);

        this.dbFbRef = firebase.database().ref();

        this.renderInfos = this.renderInfos.bind(this);
        this.renderDots = this.renderDots.bind(this);
        this.renderArticle = this.renderArticle.bind(this);
        this.renderActions = this.renderActions.bind(this);
        this.comentsUpOrDown = this.comentsUpOrDown.bind(this);
        this.onPressLikeBtn = this.onPressLikeBtn.bind(this);
    }
    
    onPressLikeBtn(likeOrDeslike, item) {
        const { userLogged } = this.props;
        const b64UserKey = b64.encode(userLogged.email);
        const itemListLikes = item.listLikes ? item.listLikes : [];
        if (likeOrDeslike === 'like') {
            const isPushed = _.findIndex(
                itemListLikes, (itemInfo) => itemInfo.push && itemInfo.push === 'push'
            );
            let newArray = [];
            if (isPushed !== -1) {
                const auxArr = [...itemListLikes];
                if (isPushed !== -1) {
                    auxArr.splice(isPushed, 1);
                }
                newArray = [...auxArr, { key: b64UserKey }];
            } else {
                newArray = [...itemListLikes, { key: b64UserKey }];
            }
            this.dbFbRef.child(`informativos/${item.key}`).update({
                listLikes: newArray
            })
            .then(() => true)
            .catch(() => true); 
        } else {
            const newArray = [...itemListLikes];
            const indexPushed = _.findIndex(
                itemListLikes, (itemInfo) => itemInfo.key === b64UserKey
            );
            if (indexPushed !== -1) {
                newArray.splice(indexPushed, 1);
                if (newArray.length === 0) {
                    newArray.push({ push: 'push' });
                }
                this.dbFbRef.child(`informativos/${item.key}`).update({
                    listLikes: newArray
                })
                .then(() => true)
                .catch(() => true); 
            }
        }
    }

    comentsUpOrDown(upOrDown = 'down') {
        this.props.modificaStartUpOrDownAnim(upOrDown);
    }

    renderActions(item) {
        return (
            <InfoActions 
                item={item} 
                comentsUpOrDown={(upOrDown) => this.comentsUpOrDown(upOrDown)}
                onPressLikeBtn={
                    (likeOrDeslike, itemInfo) => this.onPressLikeBtn(likeOrDeslike, itemInfo)
                }
                userLogged={this.props.userLogged}
            />
        );
    }

    renderArticle(item) {
        return (
            <View 
                style={{
                    margin: 10
                }}
            >
                { 
                    !!item.imgArticle && 
                    <Image
                        resizeMode="cover"
                        style={{ 
                            width: null, 
                            height: 160,
                            borderWidth: 1,
                            borderRadius: 2
                        }}
                        source={{ uri: item.imgArticle }}
                    />
                }
                {
                    (!!item.textArticle || !!item.linkArticle) &&
                        <TouchableWithoutFeedback
                            onPress={
                                () => !!item.linkArticle && Linking.openURL(item.linkArticle) 
                            }
                        >
                            <View
                                style={{
                                    paddingVertical: 10,
                                    paddingHorizontal: 5,
                                    borderLeftWidth: 1,
                                    borderRightWidth: 1,
                                    borderBottomWidth: 1,
                                    borderColor: colorAppF
                                }}
                            >
                                {
                                    !!item.textArticle &&
                                    <Text style={styles.textArticle}>
                                        { item.textArticle }
                                    </Text>
                                }
                                {
                                    !!item.linkArticle &&
                                    <Text style={{ color: '#A2A2A2' }}>
                                        { item.linkArticle }
                                    </Text>
                                }
                            </View>
                        </TouchableWithoutFeedback>
                }
               
            </View>
        );
    }

    renderDots() {
        return (
            <TouchableOpacity
                onPress={() => false}
            >
                <Icon
                    name='dots-horizontal' 
                    type='material-community' 
                    size={24} color='green' 
                />   
            </TouchableOpacity>
        );
    }

    renderInfos(infos) {
        return infos.map((item, index) => {
            const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
            const nomeUser = item.nomeUser ? item.nomeUser : 'Patinhas';
            const perfilUser = item.perfilUser ? item.perfilUser : 'Administrador';
            return (
                <View key={index}>
                    <Card containerStyle={styles.card}>
                        <View style={{ marginVertical: 5 }}>
                            <ListItem
                                containerStyle={{ borderBottomWidth: 0 }}
                                avatar={imgAvt}
                                title={nomeUser}
                                subtitle={perfilUser}
                                rightIcon={(this.renderDots())}
                            />
                        </View>
                        { 
                            !!item.descPost &&
                            <View style={{ marginHorizontal: 10 }}>
                                <Text>
                                    { item.descPost }
                                </Text>
                            </View>
                        }
                        { this.renderArticle(item) }
                        { this.renderActions(item) }
                        <View style={{ marginVertical: 5 }} />
                    </Card>
                </View>
            );
        });
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <ScrollView 
                    style={styles.viewPrinc}
                >
                    { this.renderInfos(this.props.listInfos) }
                    <View style={{ marginVertical: 40 }} />
                </ScrollView>
                <Coment />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF,
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
    },
    card: {
        padding: 0,
        margin: 0,
        marginVertical: 15,
        marginHorizontal: 10
    },
    textArticle: {
        fontSize: 16,
        color: 'black',
        fontWeight: '400'
    }
});

const mapStateToProps = (state) => ({
    listInfos: state.InfoReducer.listInfos,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaStartUpOrDownAnim
})(Informativos);
