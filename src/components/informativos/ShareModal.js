import React from 'react';
import {
    Modal, 
    Text, 
    View,
    TouchableWithoutFeedback,
    TouchableHighlight,
    StyleSheet,
    Clipboard,
    Animated,
    ActivityIndicator
} from 'react-native';
import { Icon, Avatar } from 'react-native-elements';
import { connect } from 'react-redux';
import Toast from 'react-native-simple-toast';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import {
    modificaShowShareModal
} from '../../actions/InfoActions';
import { colorAppP } from '../../utils/constantes';

import perfilUserImg from '../../imgs/perfiluserimg.png';

class ShareModal extends React.Component {

    constructor(props) {
        super(props);

        this.onShareImage = this.onShareImage.bind(this);
        this.closeModal = this.closeModal.bind(this);

        this.state = {
            fadeAnimValue: new Animated.Value(0),
            enablePress: true
        };
    }

    onShareImage(item) {
        const fs = RNFetchBlob.fs;
        let imagePath = null;
        let contentType = '';

        this.setState({ enablePress: false });

        RNFetchBlob.config({
            fileCache: true
        })
        .fetch('GET', item.imgArticle)
        .then(res => {
            this.setState({ enablePress: true });
            this.closeModal();
            imagePath = res.path();
            contentType = res.info().headers['content-type'];
            return res.readFile('base64');
        })
        .then(base64Data => {
            const shareImageBase64 = {
                title: 'Escolha um App para compartilhar',
                message: item.textArticle,
                url: `data:${contentType};base64,${base64Data}`,
            };

            Share.open(shareImageBase64)
            .then((res) => console.log(res))
            .catch((err) => console.log(err));

            return fs.unlink(imagePath);
        });
    }

    closeModal() {
        this.setState({ enablePress: true });
        Animated.timing(
            this.state.fadeAnimValue,
            {
                toValue: 0,
                duration: 200
            }
        ).start(() => {
            setTimeout(() => this.props.modificaShowShareModal(false), 100);
        });
    }

    render() {
        const { userLogged, itemShareSelected } = this.props;
        const userImg = userLogged.imgAvatar ? { uri: userLogged.imgAvatar } : perfilUserImg;
        const userNome = userLogged.nome ? userLogged.nome : ' ';
        return (
            <Modal
                animationType="slide"
                transparent
                visible={this.props.showShareModal}
                onRequestClose={() => this.closeModal()}
                onShow={() =>
                    Animated.timing(
                        this.state.fadeAnimValue,
                        {
                            toValue: 0.5,
                            duration: 800
                        }
                    ).start()
                }
            >
                <TouchableWithoutFeedback
                    onPress={() => this.closeModal()}
                >
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: this.state.fadeAnimValue.interpolate({
                                inputRange: [0, 0.5],
                                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']
                            })
                        }}
                    >
                        <View style={{ flex: 1 }} />
                        <TouchableWithoutFeedback>
                            <View style={styles.viewPricinp} >
                                <View style={styles.viewTop}>
                                    <View style={styles.viewUser}>
                                        <Avatar
                                            small
                                            rounded
                                            title={'avatar'}
                                            source={userImg}
                                            onPress={() => false}
                                        />
                                        <View style={{ marginHorizontal: 5 }} />
                                        <Text 
                                            style={{ 
                                                fontWeight: '400', fontSize: 14, color: 'black' 
                                            }}
                                        >
                                            { userNome }
                                        </Text>
                                        {
                                            !this.state.enablePress &&
                                            <View 
                                                style={{ 
                                                    alignItems: 'flex-end', 
                                                    justifyContent: 'center' 
                                                }}
                                            >
                                                <ActivityIndicator 
                                                    size={'large'} 
                                                    color={colorAppP} 
                                                />
                                            </View>
                                        }
                                    </View>
                                </View>
                                <View style={styles.viewBottom}>
                                    <TouchableHighlight
                                        underlayColor={'#EEEEEE'}
                                        style={{ flex: 1 }}
                                        onPress={() => console.log('Compartilhar imagem')}
                                    >
                                        <View
                                            style={[
                                                styles.itemMenu,
                                                { 
                                                    backgroundColor: this.state.enablePress 
                                                    ? 'white' : '#EEEEEE' 
                                                }
                                            ]}
                                        >
                                            <Icon
                                                name='comment-text-multiple-outline' 
                                                type='material-community' 
                                                size={28} color='green'
                                            />
                                            <View style={{ marginHorizontal: 5 }} />
                                            <Text style={styles.itemMenuText}>
                                                Enviar como mensagem
                                            </Text>
                                        </View>
                                    </TouchableHighlight>
                                    {
                                        !!itemShareSelected.imgArticle &&
                                        <TouchableHighlight
                                            underlayColor={'#EEEEEE'}
                                            style={{ flex: 1 }}
                                            onPress={
                                                () => this.state.enablePress && 
                                                this.onShareImage(itemShareSelected)
                                            }
                                        >
                                            <View
                                                style={[
                                                    styles.itemMenu,
                                                    { 
                                                        backgroundColor: this.state.enablePress 
                                                        ? 'white' : '#EEEEEE' 
                                                    }
                                                ]}
                                            >
                                                <Icon
                                                    name='image-move' 
                                                    type='material-community' 
                                                    size={28} color='green'
                                                />
                                                <View style={{ marginHorizontal: 5 }} />
                                                <Text style={styles.itemMenuText}>
                                                    Compartilhar imagem
                                                </Text>
                                            </View>
                                        </TouchableHighlight>
                                    }
                                    {
                                        !!itemShareSelected.linkArticle &&
                                        <TouchableHighlight
                                            underlayColor={'#EEEEEE'}
                                            style={{ flex: 1 }}
                                            onPress={() => {
                                                if (this.state.enablePress) {
                                                    Clipboard.setString(
                                                        itemShareSelected.linkArticle
                                                    );
                                                    this.closeModal();
                                                    setTimeout(
                                                        () => Toast.show(
                                                            'Link copiado.', Toast.SHORT
                                                            )
                                                    , 500);
                                                }
                                            }}
                                        >
                                            <View
                                                style={[
                                                    styles.itemMenu,
                                                    { 
                                                        backgroundColor: this.state.enablePress 
                                                        ? 'white' : '#EEEEEE' 
                                                    }
                                                ]}
                                            >
                                                <Icon
                                                    name='link-variant' 
                                                    type='material-community' 
                                                    size={28} color='green'
                                                />
                                                <View style={{ marginHorizontal: 5 }} />
                                                <Text style={styles.itemMenuText}>
                                                    Copiar link
                                                </Text>
                                            </View>
                                        </TouchableHighlight>
                                    }
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Animated.View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    viewPricinp: {
        flex: 0.5,
        backgroundColor: 'white',
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5
    },
    viewTop: {
        flex: 0.5,
        justifyContent: 'center'
    },
    viewBottom: {
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: '#707070'
    },
    itemMenu: {
        flexDirection: 'row', 
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10
    },
    itemMenuText: {
        fontSize: 16,
        color: 'black'
    },
    viewUser: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 10
    }
});

const mapStateToProps = (state) => ({
    showShareModal: state.InfoReducer.showShareModal,
    userLogged: state.LoginReducer.userLogged,
    itemShareSelected: state.InfoReducer.itemShareSelected
});

export default connect(mapStateToProps, { modificaShowShareModal })(ShareModal);

