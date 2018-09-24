import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    Platform,
    TouchableOpacity,
    Text
} from 'react-native';

import { connect } from 'react-redux';
import { 
    Card, 
    Icon,
    SearchBar,
    Divider
} from 'react-native-elements';

import ModalDropdown from 'react-native-modal-dropdown';
import { colorAppS } from '../../../utils/constantes';
import { showAlert } from '../../../utils/store';
import Versus from '../../jogos/Versus';
import JogoEdit from './JogoEdit';
import { modificaItemSelected } from '../../../actions/JogosActions';
import { modificaRemocao } from '../../../actions/AlertSclActions';

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
    }

    onPressEditRemove(item) {
        this.props.modificaRemocao(true);
        this.props.modificaItemSelected(item);
        showAlert('danger', 'Remover!', 'Confirma a remoção do jogo selecionado ?');
    }

    onChangeSuperState(newState) {
        this.setState({ ...newState });
    }

    renderEditar() {
        return (
            <Card containerStyle={styles.card}>
                <SearchBar
                    round
                    lightTheme
                    containerStyle={{ 
                        backgroundColor: 'transparent',
                        borderTopWidth: 0, 
                        borderBottomWidth: 0
                    }}
                    searchIcon={{ size: 26 }}
                    onChangeText={() => true}
                    onClear={() => true}
                    placeholder='Buscar jogo...' 
                />
                { 
                    this.props.listJogos.map((item, index) => {
                        const titulo = item.titulo ? item.titulo : ' ';
                        const data = item.data ? item.data : ' ';
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
                                    <Versus />
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
                                                onPress={() => this.setState({ 
                                                    modalOpt: 'Em Edição', 
                                                    itemEdit: item 
                                                })}
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
                                                onPress={() => this.onPressEditRemove(item)}
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
                    })
                }
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
                        imgUrl={this.state.itemEdit.imagem}
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
        backgroundColor: '#EEEEEE'
    },
    text: {
        fontSize: 14,
    },
    inputContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#9E9E9E',
        height: Platform.OS === 'android' ? 45 : 40,
    },
    input: {
        paddingBottom: 0, 
        width: null,
        color: 'black',
        height: 35
    },
    card: {
        paddingHorizontal: 10,
    },
    viewImageSelect: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2, 
        borderColor: '#EEEEEE',
        borderRadius: 0.9
    },
    dateInput: {
        borderWidth: 0,
        alignItems: 'flex-start',
        height: 35,
        ...Platform.select({
            android: {
                paddingLeft: 3,
                justifyContent: 'flex-end'
            },
            ios: {
                paddingLeft: 0,
                justifyContent: 'center'
            }
        })
    },
    dateText: {
        fontSize: 14,
        color: 'black',
        textAlign: 'left'
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
        marginVertical: 8
    },
    textData: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black'
    }
});

const mapStateToProps = (state) => ({
    listJogos: state.JogosReducer.listJogos
});

export default connect(mapStateToProps, {
    modificaItemSelected,
    modificaRemocao
})(CadastroJogos);
