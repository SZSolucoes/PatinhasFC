import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    Text,
    TouchableWithoutFeedback,
    Linking,
    Animated,
    FlatList,
    ActivityIndicator,
    Platform
} from 'react-native';
import b64 from 'base-64';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Card, ListItem } from 'react-native-elements';
import InfoActions from './InfoActions';
import Coment from './Coment';
import { 
    modificaStartUpOrDownAnim,
    modificaInfoMsgSelected,
    modificaAddNewRows,
    modificaLoadingFooter
} from '../../actions/InfoActions';
import {  
    modificaAnimatedHeigth,
} from '../../actions/JogosActions';

import firebase from '../../Firebase';
import imgAvatar from '../../imgs/patinhasfclogo.png';
import { colorAppF } from '../../utils/constantes';
import ShareModal from './ShareModal';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

class Informativos extends React.Component {

    constructor(props) {
        super(props);

        this.dbFbRef = firebase.database().ref();
        this.KeyboardIsOpened = false;
        this.scrollCurrentOffset = 0;
        this.scrollViewContentSize = 0;
        this.scrollViewHeight = 0;
        this.fixedNumberRows = 30;

        this.state = {
            maxOffSetScrollView: 0,
            scrollY: new Animated.Value(0),
            animTools: new Animated.Value(0)
        };

        this.renderInfos = this.renderInfos.bind(this);
        this.dataSourceControl = this.dataSourceControl.bind(this);
        this.flatListKeyExtractor = this.flatListKeyExtractor.bind(this);
        this.renderDots = this.renderDots.bind(this);
        this.addNewRows = this.addNewRows.bind(this);
        this.renderArticle = this.renderArticle.bind(this);
        this.renderActions = this.renderActions.bind(this);
        this.comentsUpOrDown = this.comentsUpOrDown.bind(this);
        this.onPressLikeBtn = this.onPressLikeBtn.bind(this);
        this.onScrollView = this.onScrollView.bind(this);
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

    onScrollView(currentOffset, direction) {
        if (!this.KeyboardIsOpened) {
            if (currentOffset <= 0 || direction === 'up') {
                this.props.modificaAnimatedHeigth(false);
            } else if (direction === 'down') {
                this.props.modificaAnimatedHeigth(true);
            } else {
                this.props.modificaAnimatedHeigth(false);
            }
        }
        //this.onScrollViewTools(currentOffset, direction);
    }

    addNewRows(numberAdd) {
        this.props.modificaAddNewRows(numberAdd);
        this.props.modificaLoadingFooter(false);
    }

    comentsUpOrDown(upOrDown = 'down', info) {
        if (upOrDown === 'up') {
            this.props.modificaInfoMsgSelected(info);
        } else {
            this.props.modificaInfoMsgSelected({});
        }
        this.props.modificaStartUpOrDownAnim(upOrDown);
    }

    dataSourceControl(infos) {
        let newInfos = infos;
        if (infos && infos.length > 0) {
            newInfos = _.reverse([...infos]);
            newInfos = newInfos.slice(0, this.props.maxRows);
            this.lastIndexListInfos = newInfos.length - 1;
            return newInfos;
        }

        return newInfos;
    }

    flatListKeyExtractor(item, index) {
        return index.toString();
    }

    renderActions(item) {
        return (
            <InfoActions 
                item={item} 
                comentsUpOrDown={(upOrDown, info) => this.comentsUpOrDown(upOrDown, info)}
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
        return (<View />);
        /* return (
            <TouchableOpacity
                onPress={() => false}
            >
                <Icon
                    name='dots-horizontal' 
                    type='material-community' 
                    size={24} color='green' 
                />   
            </TouchableOpacity>
        ); */
    }

    renderInfos({ item }) {
        const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
        const nomeUser = item.nomeUser ? item.nomeUser : 'Patinhas';
        const perfilUser = item.perfilUser ? item.perfilUser : 'Administrador';

        return (
            <View>
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
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <AnimatedFlatList
                    ref={(ref) => { this.scrollViewRef = ref; }}
                    data={this.dataSourceControl(this.props.listInfos)}
                    renderItem={this.renderInfos}
                    keyExtractor={this.flatListKeyExtractor}
                    style={styles.viewPrinc}
                    onEndReachedThreshold={0.01}
                    onEndReached={() => {
                        let rowsToShow = (this.lastIndexListInfos + 1) + this.fixedNumberRows;
                        const infosLength = this.props.listInfos.length;
                        if (rowsToShow > infosLength) {
                            rowsToShow = infosLength;
                        }

                        if (rowsToShow !== this.props.maxRows) {
                            if (rowsToShow !== (this.lastIndexListInfos + 1)) {
                                this.props.modificaLoadingFooter(true);
                            }
                            _.debounce(this.addNewRows, 2000)(rowsToShow);
                        } else {
                            this.props.modificaLoadingFooter(false);
                        }
                    }}
                    onContentSizeChange={(w, h) => { 
                        this.scrollViewContentSize = h;
                        const newOffSet = h - this.scrollViewHeight;
                        this.setState({ maxOffSetScrollView: newOffSet });
                    }}
                    onLayout={ev => { 
                        this.scrollViewHeight = ev.nativeEvent.layout.height;
                        const newOffSet = this.scrollViewContentSize - ev.nativeEvent.layout.height;
                        this.setState({ maxOffSetScrollView: newOffSet });
                    }}
                    onScroll={
                        Animated.event(
                            [{
                                nativeEvent: { contentOffset: { y: this.state.scrollY } }
                            }],
                            {
                                useNativeDriver: true,
                                listener: (event) => {
                                    const currentOffset = event.nativeEvent.contentOffset.y;
                                    const direction = currentOffset > 
                                                    this.scrollCurrentOffset ? 'down' : 'up';
                                    this.scrollCurrentOffset = currentOffset;
                                    this.onScrollView(currentOffset, direction);
                                }
                            }
                        )
                    }
                    ListHeaderComponent={
                        (<View style={{ ...Platform.select({ ios: { marginTop: 10 } }) }} />)
                    }
                    ListFooterComponent={(
                        <View style={{ marginBottom: 50, marginTop: 10 }} >
                        {
                            this.props.loadingFooter &&
                            <ActivityIndicator size={'large'} color={'white'} />
                        }
                        </View> 
                )}
                />
                <Coment />
                <ShareModal />
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
    loadingFooter: state.InfoReducer.loadingFooter,
    maxRows: state.InfoReducer.maxRows,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaStartUpOrDownAnim,
    modificaInfoMsgSelected,
    modificaAddNewRows,
    modificaLoadingFooter,
    modificaAnimatedHeigth
})(Informativos);
