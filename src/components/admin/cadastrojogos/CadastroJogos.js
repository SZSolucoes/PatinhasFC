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
    Divider
} from 'react-native-elements';
import _ from 'lodash';

import ModalDropdown from 'react-native-modal-dropdown';
import { colorAppS, colorAppF } from '../../../utils/constantes';
import { showAlert } from '../../../utils/store';
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
            dropWidth: 0,
            modalOpt: 'Cadastrar',
            itemEdit: {},
            idxMdl: 0,
            titulo: '',
            data: '',
            descricao: '',
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
        this.checkConInfo = this.checkConInfo.bind(this);
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

    checkConInfo(funExec) {
        if (this.props.conInfo.type === 'none' ||
            this.props.conInfo.type === 'unknown'
        ) {
            Toast.show('Sem conexão.', Toast.SHORT);
            return false;
        }

        return funExec();
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
            <Card containerStyle={styles.card}>
                <SearchBar
                    round
                    lightTheme
                    autoCapitalize={'none'}
                    autoCorrect={false}
                    clearIcon={!!this.props.filterStr}
                    showLoadingIcon={this.props.filterLoad}
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
                        b64Str={this.state.b64Str}
                        contentType={this.state.contentType}
                        imgJogoUri={this.state.imgJogoUri}
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
