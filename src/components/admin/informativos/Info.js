import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Text
} from 'react-native';

import Toast from 'react-native-simple-toast';
import { connect } from 'react-redux';
import { 
    Card, 
    Icon,
    SearchBar,
    Divider,
    ListItem
} from 'react-native-elements';
import ModalDropdown from 'react-native-modal-dropdown';
import _ from 'lodash';
import InfoEdit from './InfoEdit';

import { colorAppS, colorAppF } from '../../../utils/constantes';
import { retrieveImgSource } from '../../../utils/imageStorage';
import { showAlert } from '../../../utils/store';
import { limitDotText } from '../../../utils/strComplex';
import imgAvatar from '../../../imgs/perfiluserimg.png';
import {
    modificaFilterLoad,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveInfo,
    modificaClean
} from '../../../actions/InfoActions';
import { modificaRemocao } from '../../../actions/AlertSclActions';

class Info extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            dropWidth: 0,
            modalOpt: 'Cadastrar',
            itemEdit: {},
            idxMdl: 0,
            titulo: '',
            imgArticleUri: '',
            descricao: '',
            linkExt: '',
            b64Str: '',
            contentType: ''
        };

        this.scrollView = null;

        this.renderEditar = this.renderEditar.bind(this);
        this.renderSwitchType = this.renderSwitchType.bind(this);
        this.onPressEditRemove = this.onPressEditRemove.bind(this);
        this.onChangeSuperState = this.onChangeSuperState.bind(this);
        this.renderListInfosEdit = this.renderListInfosEdit.bind(this);
        this.onFilterInfosEdit = this.onFilterInfosEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
        this.renderIcons = this.renderIcons.bind(this);
        this.checkConInfo = this.checkConInfo.bind(this);
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    onPressEditRemove(item) {
        this.props.modificaItemSelected(item);
        this.props.modificaFlagRemoveInfo(true);
        this.props.modificaRemocao(true);
        showAlert('danger', 'Remover!', 'Deseja remover o informativo selecionado ?');
    }

    onChangeSuperState(newState) {
        this.setState({ ...newState });
    }

    onFilterInfosEdit(infos, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(infos, (usuario) => (
                (usuario.descPost && usuario.descPost.toLowerCase().includes(lowerFilter)) ||
                (usuario.nomeUser && usuario.nomeUser.toLowerCase().includes(lowerFilter)) ||
                (usuario.perfilUser && usuario.perfilUser.toLowerCase().includes(lowerFilter)) ||
                (usuario.textArticle && usuario.textArticle.toLowerCase().includes(lowerFilter)) ||
                (usuario.dataPost && usuario.dataPost.toLowerCase().includes(lowerFilter))
        ));
    }

    checkConInfo(funExec) {
        if (this.props.conInfo.type === 'none' ||
            this.props.conInfo.type === 'unknown'
        ) {
            Toast.show('Sem conexão.', Toast.SHORT);
            return false;
        }

        return funExec();
    }

    renderIcons(item) {
        return (
            <View 
                style={{ 
                    flex: 1, 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'flex-end' 
                }}
            >
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                    }}
                >
                    <TouchableOpacity
                        onPress={() => {
                            this.scrollView.scrollTo({
                                y: 0,
                                duration: 0,
                                animated: false
                            });
                            this.setState({ 
                                modalOpt: 'Em Edição', 
                                itemEdit: item 
                            });
                        }}
                    >
                        <Icon
                            name='square-edit-outline' 
                            type='material-community' 
                            size={34} color='green' 
                        />   
                    </TouchableOpacity>
                </View>
                <View 
                    style={{ 
                        flex: 1, 
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                    }}
                >
                    <TouchableOpacity
                        onPress={() => this.checkConInfo(
                            () => this.onPressEditRemove(item)
                        )}
                    >
                        <Icon
                            name='delete' 
                            type='material-community' 
                            size={34} color='red' 
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderListInfosEdit(infos) {
        const reverseInfos = _.reverse([...infos]);
        let infosView = null;

        if (infos.length) {
            infosView = (
                reverseInfos.map((item, index) => {
                    if ((index + 1) > 30) {
                        return false;
                    }
                    const imgAvt = item.imgAvatar ? { uri: item.imgAvatar } : imgAvatar;
                    const nomeUser = item.nomeUser ? item.nomeUser : 'Patinhas';
                    const perfilUser = item.perfilUser ? item.perfilUser : 'Administrador';
                    return (
                        <View key={index}>
                            <Card containerStyle={styles.card}>
                                <View style={{ marginVertical: 5 }}>
                                    <ListItem
                                        containerStyle={{ borderBottomWidth: 0 }}
                                        avatar={retrieveImgSource(imgAvt)}
                                        title={nomeUser}
                                        subtitle={perfilUser}
                                        rightIcon={(this.renderIcons(item))}
                                    />
                                </View>
                                { 
                                    !!item.descPost &&
                                    <View style={{ marginHorizontal: 10 }}>
                                        <Text>
                                            { limitDotText(item.descPost, 150) }
                                        </Text>
                                    </View>
                                }
                                {
                                    !!item.textArticle &&
                                    <View
                                        style={{
                                            paddingVertical: 5,
                                            paddingHorizontal: 10
                                        }}
                                    >
                                        <Text 
                                            style={{
                                                color: 'black',
                                                fontWeight: '400'
                                            }}
                                        >
                                            { limitDotText(item.textArticle, 40) }
                                        </Text>
                                    </View>
                                }
                                <View style={{ marginVertical: 5 }} />
                            </Card>
                        </View>
                    );
                })
            );
        }

        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return infosView;
    }

    renderBasedFilterOrNot() {
        const { listInfos, filterStr } = this.props;
        let infosView = null;
        if (listInfos) {
            if (filterStr) {
                infosView = this.renderListInfosEdit(
                    this.onFilterInfosEdit(listInfos, filterStr)
                );
            } else {
                infosView = this.renderListInfosEdit(listInfos);
            }
        }
        return infosView;
    }

    renderEditar() {
        return (
            <Card containerStyle={styles.card}>
                <SearchBar
                    round
                    lightTheme
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    clearIcon={!!this.props.filterStr}
                    showLoadingIcon={
                        this.props.listInfos &&
                        this.props.listInfos.length > 0 && 
                        this.props.filterLoad
                    }
                    containerStyle={{ 
                        backgroundColor: 'transparent',
                        borderTopWidth: 0, 
                        borderBottomWidth: 0
                    }}
                    searchIcon={{ size: 26 }}
                    value={this.props.filterStr}
                    onChangeText={(value) => {
                        this.props.modificaFilterStr(value);
                        this.props.modificaFilterLoad(true);
                    }}
                    onClear={() => this.props.modificaFilterStr('')}
                    placeholder='Buscar informativo...' 
                />
                { this.renderBasedFilterOrNot() }
            </Card>
        );
    }

    renderSwitchType(modalOpt) {
        switch (modalOpt) {
            case 'Cadastrar':
                return (
                    <InfoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.titulo}
                        imgArticleUri={this.state.imgArticleUri}
                        descricao={this.state.descricao}
                        linkExt={this.state.linkExt}
                        b64Str={this.state.b64Str}
                        contentType={this.state.contentType}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
            case 'Editar':
                return this.renderEditar();
            case 'Em Edição':
                return (
                    <InfoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.itemEdit.descPost}
                        imgArticleUri={this.state.itemEdit.imgArticle}
                        descricao={this.state.itemEdit.textArticle}
                        linkExt={this.state.itemEdit.linkArticle}
                        keyItem={this.state.itemEdit.key}
                    />);
            default:
                return (
                    <InfoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.titulo}
                        imgArticleUri={this.state.imgArticleUri}
                        descricao={this.state.descricao}
                        linkExt={this.state.linkExt}
                        b64Str={this.state.b64Str}
                        contentType={this.state.contentType}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
        }
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <View style={{ flexDirection: 'row' }}>
                    <View 
                        style={{ flex: 1 }}
                        onLayout={
                            (event) =>
                                this.setState({
                                    dropWidth: event.nativeEvent.layout.width
                        })}
                    />
                    <Card
                        containerStyle={
                            this.state.modalOpt !== 'Em Edição' ?
                            styles.dropCard : styles.dropCardRed
                        }
                    >
                        { 
                            this.state.dropWidth && this.state.modalOpt !== 'Em Edição' ?
                            (
                                <View style={{ flexDirection: 'row' }}>
                                    <ModalDropdown
                                        ref={(ref) => { this.modalDropRef = ref; }}
                                        style={{
                                            width: this.state.dropWidth - 1
                                        }}
                                        textStyle={styles.dropModalBtnText}
                                        dropdownTextStyle={{ fontSize: 16 }}
                                        options={['Cadastrar', 'Editar']}
                                        onSelect={(index, value) => {
                                            this.scrollView.scrollTo({
                                                y: 0,
                                                duration: 0,
                                                animated: false
                                            });
                                            this.setState({
                                                modalOpt: value,
                                                idxMdl: parseInt(index, 10)
                                            });
                                        }}
                                        defaultIndex={this.state.idxMdl}
                                        defaultValue={this.state.modalOpt}
                                    />
                                    <Icon
                                        pointerEvents={'none'}
                                        containerStyle={{
                                            left: 0,
                                            top: 0,
                                            right: 0,
                                            bottom: 0, 
                                            position: 'absolute', 
                                            zIndex: 1,
                                            alignItems: 'flex-end',
                                            paddingRight: 5

                                        }}
                                        name='arrow-down-thick' 
                                        type='material-community' 
                                        size={26} color='white' 
                                    />
                                </View>
                            )
                            :
                            (
                                <TouchableOpacity 
                                    onPress={() => {
                                        this.scrollView.scrollTo({
                                            y: 0,
                                            duration: 0,
                                            animated: false
                                        });
                                        this.setState({
                                        modalOpt: 'Editar',
                                        idxMdl: 1
                                    }); 
                                }}
                                >
                                    <Text 
                                        style={[styles.dropModalBtnText, { marginHorizontal: 40 }]}
                                    >
                                        {this.state.modalOpt !== 'Em Edição' ? ' ' : 'Voltar'}
                                    </Text>
                                    {
                                        this.state.modalOpt === 'Em Edição' && 
                                        <Icon
                                            pointerEvents={'none'}
                                            containerStyle={{
                                                left: 0,
                                                top: 0,
                                                right: 0,
                                                bottom: 0, 
                                                position: 'absolute', 
                                                zIndex: 1,
                                                alignItems: 'flex-start',
                                                paddingRight: 5

                                            }}
                                            name='arrow-left-thick' 
                                            type='material-community' 
                                            size={26} color='white' 
                                        />
                                    }
                                </TouchableOpacity>
                            )
                        }
                    </Card>
                </View>
                <Divider
                    style={{
                        marginTop: 10,
                        marginHorizontal: 15,
                        height: 2,
                        backgroundColor: colorAppS,
                    }}
                />
                <ScrollView 
                    style={{ flex: 1 }} 
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    { this.renderSwitchType(this.state.modalOpt) }
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
    },
    card: {
        paddingHorizontal: 10,
    },
    dropCard: { 
        backgroundColor: colorAppS,
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        padding: 0,
    },
    dropCardRed: { 
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
    },
    dropModalBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 8,
        marginRight: 5
    }
});

const mapStateToProps = (state) => ({
    listInfos: state.InfoReducer.listInfos,
    filterStr: state.InfoReducer.filterStr,
    filterLoad: state.InfoReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaFilterLoad,
    modificaFilterStr,
    modificaItemSelected,
    modificaFlagRemoveInfo,
    modificaClean,
    modificaRemocao
})(Info);
