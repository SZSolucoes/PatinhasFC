import React from 'react';
import {
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Image,
    Text
} from 'react-native';
import { connect } from 'react-redux';
import { Card, ListItem, Icon } from 'react-native-elements';
import InfoActions from './InfoActions';
import Coment from './Coment';
import { modificaStartUpOrDownAnim } from '../../actions/InfoActions';

import imgAvatar from '../../imgs/patinhasfclogo.png';
import { colorAppF } from '../../utils/constantes';

class Informativos extends React.Component {

    constructor(props) {
        super(props);

        this.renderInfos = this.renderInfos.bind(this);
        this.renderDots = this.renderDots.bind(this);
        this.renderArticle = this.renderArticle.bind(this);
        this.renderActions = this.renderActions.bind(this);
        this.comentsUpOrDown = this.comentsUpOrDown.bind(this);
    }

    comentsUpOrDown(upOrDown = 'down') {
        this.props.modificaStartUpOrDownAnim(upOrDown);
    }

    renderActions(item) {
        return (
            <InfoActions 
                item={item} 
                comentsUpOrDown={(upOrDown) => this.comentsUpOrDown(upOrDown)}
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
                    item.imgArticle && 
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
                    item.textArticle &&
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
                        <Text style={styles.textArticle}>
                            { item.textArticle }
                        </Text>
                    </View>
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
                            item.descArticle &&
                            <View style={{ marginHorizontal: 10 }}>
                                <Text>
                                    { item.descArticle }
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
    listInfos: state.InfoReducer.listInfos
});

export default connect(mapStateToProps, {
    modificaStartUpOrDownAnim
})(Informativos);
