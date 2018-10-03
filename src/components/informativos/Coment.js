
import React from 'react';
import {
    View,
    ScrollView,
    Animated,
    StyleSheet,
    Dimensions,
    Text,
    TouchableWithoutFeedback,
    TextInput,
    Keyboard,
    TouchableOpacity
} from 'react-native';
import firebase from 'firebase';
import _ from 'lodash';
import b64 from 'base-64';
import { Icon, Divider, Avatar } from 'react-native-elements';
import { connect } from 'react-redux';
import { modificaStartUpOrDownAnim, modificaInfoMsgSelected } from '../../actions/InfoActions';
import { modificaAnimatedHeigth } from '../../actions/JogosActions';
import perfilUserImg from '../../imgs/perfiluserimg.png';

class Coment extends React.Component {

    constructor(props) {
        super(props);

        this.scrollView = null;
        this.listenerDimensions = null;
        this.dbFbRef = firebase.database().ref();
        this.maxTextHeight = 120;
        this.onChangeDimension = this.onChangeDimension.bind(this);
        this.startUpOrDownAnim = this.startUpOrDownAnim.bind(this);
        this.onPressSendMessage = this.onPressSendMessage.bind(this);
        this.renderComents = this.renderComents.bind(this);
        this.removeComent = this.removeComent.bind(this);

        this.state = {
            maxHeight: Dimensions.get('window').height,
            animScreenT: new Animated.Value(Dimensions.get('window').height),
            comentario: '',
            maxWidthText: Dimensions.get('window').width / 1.3
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.onChangeDimension);
    }

    shouldComponentUpdate(nextProps, nextStates) {
        if (nextProps.startUpOrDownAnim !== this.props.startUpOrDownAnim) {
            this.startUpOrDownAnim(nextProps.startUpOrDownAnim); 
        }
        if (nextProps.infoMsgSelected && 
            nextProps.infoMsgSelected.key !== this.props.infoMsgSelected.key) {
            this.infoKeyListener = this.dbFbRef
            .child(`informativos/${nextProps.infoMsgSelected.key}`);
            this.infoKeyListener.on('value', (snapshot) => {
                this.props.modificaInfoMsgSelected({ ...snapshot.val(), key: snapshot.key });
            });
        } else if (nextProps.infoMsgSelected === {}) {
            this.infoKeyListener.off();
        }

        if (nextProps.infoMsgSelected !== this.props.infoMsgSelected) {
            if (this.scrollView) {
                setTimeout(() => this.scrollView.scrollToEnd({ animated: true }), 1000);
            }
        }
        return nextProps !== this.props || nextStates !== this.state;
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangeDimension);
    }

    onChangeDimension(event) {
        this.setState({ maxHeight: event.window.heigth });
        this.setState({ maxWidthText: event.window.width });
    }

    onPressSendMessage() {
        const { infoMsgSelected, userLogged } = this.props;
        const b64UserKey = b64.encode(userLogged.email);
        const { comentario } = this.state;
        const newInfoMsgSelectedList = infoMsgSelected.listComents ? 
        [...infoMsgSelected.listComents] : [];
        let newInfoMsgSelected = {};

        if (!comentario.trim()) {
            this.setState({ comentario: '' });
            return;
        }

        newInfoMsgSelectedList.push({
            key: b64UserKey,
            imgAvatar: userLogged.imgAvatar,
            nome: userLogged.nome,
            comentario: comentario.trim()
        });

        newInfoMsgSelected = { ...infoMsgSelected, listComents: newInfoMsgSelectedList };

        this.dbFbRef.child(`informativos/${infoMsgSelected.key}`).update({
            listComents: newInfoMsgSelectedList
        })
        .then(() => this.props.modificaInfoMsgSelected(newInfoMsgSelected))
        .catch(() => true); 

        this.setState({ comentario: '' });
    }

    startUpOrDownAnim(startUpOrDownAnim) {
        if (startUpOrDownAnim === 'up') {
            Animated.spring(
                this.state.animScreenT, 
                {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 2
                }
            ).start();
            this.props.modificaAnimatedHeigth(true);
        } else {
            Animated.spring(
                this.state.animScreenT, 
                {
                    toValue: this.state.maxHeight,
                    useNativeDriver: true,
                    bounciness: 2
                }
            ).start();
            this.props.modificaAnimatedHeigth(false);
        }
    }

    removeComent(item) {
        console.log(item);
    }

    renderComents() {
        const { infoMsgSelected, userLogged } = this.props;
        const b64UserKey = b64.encode(userLogged.email);
        const newListComents = [...infoMsgSelected.listComents];
        const isPushed = _.findIndex(
            newListComents, (coment) => coment.push && coment.push === 'push'
        );
        let viewComents = null;

        if (isPushed !== -1) {
            newListComents.splice(isPushed, 1);
        }

        if (newListComents.length === 0) {
            return viewComents;
        }

        viewComents = newListComents.map((item, index) => {
            const userImg = item.imgAvatar ? { uri: item.imgAvatar } : perfilUserImg;
            const isMsgUser = item.key && item.key === b64UserKey;
            return (
                <View key={index}>
                    <View style={styles.coments}>
                        <Avatar
                            medium
                            rounded
                            source={userImg}
                            onPress={() => Keyboard.dismiss()}
                            activeOpacity={0.7}
                        />
                        <View 
                            style={[
                                styles.viewComent,
                                {
                                    maxWidth: this.state.maxWidthText
                                }
                            ]}   
                        >
                            <Text style={{ fontWeight: 'bold', color: 'black' }}>
                                {item.nome}
                            </Text>
                            <Text style={{ color: 'black' }}>
                                {item.comentario}
                            </Text>
                        </View>
                    </View>
                    <View 
                        style={{ 
                            marginHorizontal: 75, marginVertical: 2, flexDirection: 'row' 
                        }}
                    >
                        <View>
                            <Text style={{ color: '#B4B4B4' }}>
                                {'6 min'}
                            </Text>
                        </View>
                        {
                            isMsgUser &&
                            <View style={{ marginLeft: 10 }}>
                                <Text 
                                    style={{ fontWeight: 'bold', color: '#B4B4B4' }}
                                    onPress={() => this.removeComent(item)}
                                >
                                    Remover
                                </Text>
                            </View>
                        }
                    </View>
                </View>
            );
        });

        return viewComents;
    }

    render() {
        const { infoMsgSelected } = this.props;
        let qtdLikes = infoMsgSelected && infoMsgSelected.listLikes ? 
        infoMsgSelected.listLikes.length : 0;

        if (qtdLikes === 0 || (qtdLikes === 1 && infoMsgSelected.listLikes[0].push)) {
            qtdLikes = 0;
        }

        return (
            <TouchableWithoutFeedback 
                styles={styles.viewPrincip}
                onPress={() => Keyboard.dismiss()}
            >
                <Animated.View 
                    style={{ 
                        backgroundColor: 'black', 
                        width: '100%',
                        height: '100%',
                        transform: [{ translateY: this.state.animScreenT }]
                    }} 
                >
                    <View style={styles.containerPrincip}>
                        <View
                            style={{ 
                                flexDirection: 'row', 
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                margin: 15
                            }}
                        >
                            <View
                                style={{ 
                                    flexDirection: 'row', 
                                    alignItems: 'center'
                                }}
                            >
                                <Icon
                                    name='thumb-up' 
                                    type='material-community' 
                                    size={18} color='green'
                                />
                                <View style={{ marginHorizontal: 3 }} />
                                <Text
                                    style={{ fontWeight: 'bold' }}
                                >
                                    { qtdLikes }
                                </Text>
                            </View>
                            <TouchableWithoutFeedback
                                style={{ alignSelf: 'flex-end' }}
                                onPress={() => {
                                    Keyboard.dismiss();
                                    this.props.modificaStartUpOrDownAnim('down');
                                }}
                            >   
                                <View>
                                    <Icon
                                        name='close-box-outline' 
                                        type='material-community' 
                                        size={28} color='black'
                                        iconStyle={{ opacity: 0.8, margin: 5 }}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <Divider />
                        <ScrollView
                            ref={(ref) => { this.scrollView = ref; }}
                            onContentSizeChange={
                                () => this.scrollView.scrollToEnd({ animated: true })
                            }
                        >
                            {
                                !!this.props.infoMsgSelected &&
                                !!this.props.infoMsgSelected.listComents &&
                                this.renderComents()
                            }
                            <View style={{ marginVertical: 40 }} />
                        </ScrollView>
                        <View style={styles.inputMsg}>
                            <Divider />
                            <View style={styles.viewTextInput}>
                                <View style={styles.inputSend}>
                                    <TextInput
                                        placeholder='Escreva um comentário...'
                                        multiline
                                        value={this.state.comentario}
                                        onChangeText={
                                            (value) => this.setState({ comentario: value })
                                        }
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={() => this.onPressSendMessage()}
                                    style={{ flex: 0.5 }}
                                >
                                    <Icon
                                        name='send' 
                                        type='material-community' 
                                        size={30} color='green'
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    viewPrincip: {
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 0
    },
    containerPrincip: {
        backgroundColor: 'white', 
        width: '100%', 
        height: '100%',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    inputMsg: {
        backgroundColor: 'white',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20
    },
    viewTextInput: {
        backgroundColor: '#EEEEEE',
        borderRadius: 20,
        margin: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputSend: { 
        flex: 3, 
        maxHeight: 100,
        paddingHorizontal: 15
    },
    coments: {
        flexDirection: 'row',
        marginVertical: 5,
        marginHorizontal: 10
    },
    viewComent: {
        backgroundColor: '#EEEEEE',
        borderRadius: 15,
        marginHorizontal: 10,
        padding: 10
    },
});

const mapStateToProps = (state) => ({
    startUpOrDownAnim: state.InfoReducer.startUpOrDownAnim,
    infoMsgSelected: state.InfoReducer.infoMsgSelected,
    userLogged: state.LoginReducer.userLogged
});

export default connect(mapStateToProps, {
    modificaStartUpOrDownAnim,
    modificaAnimatedHeigth,
    modificaInfoMsgSelected
})(Coment);

