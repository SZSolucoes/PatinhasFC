import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Text
} from 'react-native';

import { connect } from 'react-redux';
import { 
    Card, 
    Icon,
    SearchBar,
    Divider,
    ButtonGroup
} from 'react-native-elements';
import _ from 'lodash';

import { colorAppS, colorAppF } from '../../../utils/constantes';
import { showAlert } from '../../../utils/store';
import { checkConInfo } from '../../../utils/jogosUtils';
import Versus from '../../jogos/Versus';
import JogoEdit from './JogoEdit';
import { modificaItemSelected } from '../../../actions/JogosActions';
import { modificaRemocao } from '../../../actions/AlertSclActions';
import { 
    modificaFilterStr, 
    modificaFilterLoad, 
    modificaClean
 } from '../../../actions/CadastroJogosActions';

class CadastroJogos extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            modalOpt: 'Cadastrar',
            itemEdit: {},
            idxMdl: 0,
            titulo: '',
            data: '',
            descricao: '',
            timeCasa: '',
            timeVisit: '',
            imagem: '',
            b64Str: '',
            contentType: '',
            imgJogoUri: ''
        };

        this.scrollView = null;

        this.renderEditar = this.renderEditar.bind(this);
        this.renderSwitchType = this.renderSwitchType.bind(this);
        this.onPressEditRemove = this.onPressEditRemove.bind(this);
        this.onChangeSuperState = this.onChangeSuperState.bind(this);
        this.renderListJogosEdit = this.renderListJogosEdit.bind(this);
        this.onFilterJogosEdit = this.onFilterJogosEdit.bind(this);
        this.renderBasedFilterOrNot = this.renderBasedFilterOrNot.bind(this);
    }
    
    componentWillUnmount() {
        this.props.modificaClean();
    }

    onPressEditRemove(item) {
        this.props.modificaRemocao(true);
        this.props.modificaItemSelected(item);
        showAlert('danger', 'Remover!', 'Confirma a remoção do jogo selecionado ?');
    }

    onChangeSuperState(newState) {
        this.setState({ ...newState });
    }

    onFilterJogosEdit(jogos, filterStr) {
        const lowerFilter = filterStr.toLowerCase();
        return _.filter(jogos, (jogo) => (
                (jogo.titulo && jogo.titulo.toLowerCase().includes(lowerFilter)) ||
                (jogo.descricao && jogo.descricao.toLowerCase().includes(lowerFilter)) ||
                (jogo.data && jogo.data.toLowerCase().includes(lowerFilter)) ||
                `${jogo.placarCasa}x${jogo.placarVisit}`.includes(lowerFilter)
        ));
    }

    renderListJogosEdit(jogos) {
        const reverseJogos = _.reverse([...jogos]);
        const jogosView = reverseJogos.map((item, index) => {
            if ((index + 1) > 30) {
                return false;
            }
            const titulo = item.titulo ? item.titulo : ' ';
            const data = item.data ? item.data : ' ';
            const placarCasa = item.placarCasa ? item.placarCasa : '0'; 
            const placarVisit = item.placarVisit ? item.placarVisit : '0';
            let tituloConcat = '';

            if (titulo) {
                tituloConcat = titulo;
            }
            if (data) {
                tituloConcat += ` - ${data}`;
            }

            return (
                <View key={index}>
                    <Card 
                        title={tituloConcat} 
                        containerStyle={styles.card}
                    >
                        <Versus
                            placarCasa={placarCasa} 
                            placarVisit={placarVisit}  
                        />
                        <Divider
                            style={{
                                marginVertical: 10
                            }}
                        />
                        <View 
                            style={{ 
                                flex: 1, 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                            }}
                        >
                            <View 
                                style={{ 
                                    flex: 1, 
                                    alignItems: 'center',
                                    justifyContent: 'center'
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
                                    justifyContent: 'center'
                                }}
                            >
                                <TouchableOpacity
                                    onPress={() => checkConInfo(
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
                    </Card>
                    <View style={{ marginBottom: 10 }} />
                </View>
            );
        });
        setTimeout(() => this.props.modificaFilterLoad(false), 1000);
        return jogosView;
    }

    renderBasedFilterOrNot() {
        const { listJogos, filterStr } = this.props;
        let jogosView = null;
        if (listJogos) {
            if (filterStr) {
                jogosView = this.renderListJogosEdit(
                    this.onFilterJogosEdit(listJogos, filterStr)
                );
            } else {
                jogosView = this.renderListJogosEdit(listJogos);
            }
        }
        return jogosView;
    }

    renderEditar() {
        return (
            <View>
                <Card containerStyle={styles.card}>
                    <SearchBar
                        round
                        lightTheme
                        autoCapitalize={'none'}
                        autoCorrect={false}
                        clearIcon={!!this.props.filterStr}
                        showLoadingIcon={
                            this.props.listJogos &&
                            this.props.listJogos.length > 0 && 
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
                        placeholder='Buscar jogo...' 
                    />
                    { this.renderBasedFilterOrNot() }
                </Card>
                <View style={{ marginBottom: 30 }} />
            </View>
        );
    }

    renderSwitchType(modalOpt) {
        switch (modalOpt) {
            case 'Cadastrar':
                return (
                    <JogoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.titulo}
                        data={this.state.data}
                        descricao={this.state.descricao}
                        timeCasa={this.state.timeCasa}
                        timeVisit={this.state.timeVisit}
                        b64Str={this.state.b64Str}
                        contentType={this.state.contentType}
                        imgJogoUri={this.state.imgJogoUri}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
            case 'Editar':
                return this.renderEditar();
            case 'Em Edição':
                return (
                    <JogoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.itemEdit.titulo}
                        data={this.state.itemEdit.data}
                        descricao={this.state.itemEdit.descricao}
                        timeCasa={this.state.itemEdit.timeCasa}
                        timeVisit={this.state.itemEdit.timeVisit}
                        imgJogoUri={this.state.itemEdit.imagem}
                        keyItem={this.state.itemEdit.key}
                    />);
            default:
                return (
                    <JogoEdit 
                        scrollView={() => this.scrollView}
                        titulo={this.state.titulo}
                        data={this.state.data}
                        descricao={this.state.descricao}
                        timeCasa={this.state.timeCasa}
                        timeVisit={this.state.timeVisit}
                        b64Str={this.state.b64Str}
                        contentType={this.state.contentType}
                        imgJogoUri={this.state.imgJogoUri}
                        onChangeSuperState={(value) => this.onChangeSuperState(value)}
                    />
                );
        }
    }

    render() {
        const buttonsGroup = ['Cadastrar', 'Editar'];
        return (
            <View style={styles.viewPrinc}>
                <View style={{ flexDirection: 'row' }}>
                    {
                        this.state.modalOpt !== 'Em Edição' ?
                        null : (<View style={{ flex: 1 }} />)
                    }
                    {
                        this.state.modalOpt !== 'Em Edição' ?
                        (
                            <View
                                style={styles.viewGroupBtn}
                            >
                                <ButtonGroup
                                    onPress={(index) => {
                                        this.scrollView.scrollTo({
                                            y: 0,
                                            duration: 0,
                                            animated: false
                                        });
                                        this.setState({
                                            modalOpt: buttonsGroup[index],
                                            idxMdl: index
                                        });
                                    }}
                                    selectedIndex={this.state.idxMdl}
                                    containerStyle={{ 
                                        width: '100%',
                                        backgroundColor: 'transparent',
                                        height: 40,
                                        borderRadius: 5
                                    }}
                                    buttons={buttonsGroup}
                                    textStyle={{
                                        color: 'gray',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        marginVertical: 8,
                                        marginRight: 5
                                    }}
                                    buttonStyle={{
                                        backgroundColor: 'transparent',
                                        borderColor: colorAppS,
                                        borderWidth: 2,
                                    }}
                                    selectedButtonStyle={{
                                        backgroundColor: colorAppS,
                                        borderColor: colorAppS,
                                        borderWidth: 2,
                                    }}
                                    selectedTextStyle={{
                                        color: 'white',
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        marginVertical: 8,
                                        marginRight: 5
                                    }}
                                />
                            </View>
                        )
                        :
                        (
                            <TouchableOpacity
                                style={styles.viewGroupBtnRed}
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
                                <View>
                                    <Text 
                                        style={[styles.dropModalBtnText, { marginHorizontal: 40 }]}
                                    >
                                        Voltar
                                    </Text>
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
                                            paddingRight: 8

                                        }}
                                        name='arrow-left-thick' 
                                        type='material-community' 
                                        size={25} color='white' 
                                    /> 
                                </View>
                            </TouchableOpacity>
                        )
                    }
                </View>
                <Divider
                    style={{
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
                    {this.renderSwitchType(this.state.modalOpt)}
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
    viewGroupBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 15
    },
    viewGroupBtnRed: { 
        backgroundColor: 'red',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginVertical: 20,
        height: 40,
        borderRadius: 4
    },
    dropModalBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginRight: 5
    }
});

const mapStateToProps = (state) => ({
    listJogos: state.JogosReducer.listJogos,
    filterStr: state.CadastroJogosReducer.filterStr,
    filterLoad: state.CadastroJogosReducer.filterLoad,
    conInfo: state.LoginReducer.conInfo
});

export default connect(mapStateToProps, {
    modificaItemSelected,
    modificaRemocao,
    modificaFilterStr, 
    modificaFilterLoad,
    modificaClean
})(CadastroJogos);
