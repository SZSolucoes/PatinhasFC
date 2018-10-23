import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';

import { connect } from 'react-redux';
import { 
    Card,
    Icon,
    Divider,
    FormLabel
} from 'react-native-elements';
import _ from 'lodash';
import { Actions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-crop-picker';
import RNFetchBlob from 'rn-fetch-blob';
import b64 from 'base-64';
import ImageView from 'react-native-image-view';

import firebase from '../../Firebase';
import { colorAppS, colorAppF } from '../../utils/constantes';
import { retrieveImgSource } from '../../utils/imageStorage';
import { 
    modificaJogoSelected,
    modificaClean 
} from '../../actions/ImagensActions';

class Imagens extends React.Component {

    constructor(props) {
        super(props);

        this.scrollView = null;

        this.renderImagensCard = this.renderImagensCard.bind(this);
        this.rightButtonImagens = this.rightButtonImagens.bind(this);
        this.onPressSelectImgCamera = this.onPressSelectImgCamera.bind(this);
        this.onPressSelectImgGallery = this.onPressSelectImgGallery.bind(this);
        this.onPressRemoveImage = this.onPressRemoveImage.bind(this);

        this.state = {
            jogo: props.jogo,
            showImageView: false,
            imgSelected: 0
        };
    }

    componentDidMount() {
        this.props.modificaJogoSelected(this.props.jogo);
        if (this.props.enableButtons) {
            setTimeout(() => Actions.refresh({ right: this.rightButtonImagens }), 500);
        }
    }

    componentWillUnmount() {
        this.props.modificaClean();
    }

    onPressSelectImgCamera() {
        ImagePicker.openCamera({
            width: 600,
            height: 400,
            cropping: true,
            includeBase64: true,
            mediaType: 'photo',
          }).then(image => {
              if (image) {
                const storageRef = firebase.storage().ref();
                const databaseRef = firebase.database().ref();
    
                const Blob = RNFetchBlob.polyfill.Blob;
    
                const glbXMLHttpRequest = global.XMLHttpRequest;
                const glbBlob = global.Blob;
    
                let uploadBlob = null;
    
                global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
                global.Blob = Blob;

                let contentType = '';
                
                if (image.mime) {
                    contentType = image.mime;
                }

                const metadata = {
                    contentType
                };
    
                const fileName = b64.encode(new Date().getTime().toString());
                const imgExt = contentType.slice(contentType.indexOf('/') + 1);
                const imgRef = storageRef.child(`jogos/${fileName}.${imgExt}`);
                const dbJogosRef = databaseRef.child(`jogos/${this.props.jogo.key}`);
    
                Blob.build(image.data, { type: `${contentType};BASE64` })
                .then((blob) => { 
                    uploadBlob = blob;
                    return imgRef.put(blob, metadata);
                })
                .then(() => {
                    if (uploadBlob) {
                        uploadBlob.close();
                        uploadBlob = null;
                    }
                    return imgRef.getDownloadURL();
                })
                .then((url) => {
                    const newImgs = [...this.state.jogo.imagens, url];
                    const newJogo = { ...this.state.jogo, imagens: newImgs };
                    this.setState({ jogo: newJogo });
                    return dbJogosRef.update({ imagens: newImgs });
                })
                .then(() => {
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;
                })
                .catch(() => {
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;
                
                    if (uploadBlob) {
                        uploadBlob.close();
                    }
                });
            }
        }).catch(() => false);
    }

    onPressSelectImgGallery() {
        ImagePicker.openPicker({
            width: 600,
            height: 400,
            cropping: true,
            includeBase64: true,
            mediaType: 'photo',
            multiple: true
          })
          .then(images => {
              if (images && images.length > 0) {
                const storageRef = firebase.storage().ref();
                const databaseRef = firebase.database().ref();
    
                const Blob = RNFetchBlob.polyfill.Blob;
    
                const glbXMLHttpRequest = global.XMLHttpRequest;
                const glbBlob = global.Blob;
    
                let uploadBlob = null;
    
                global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
                global.Blob = Blob;

                images.forEach(async (image, index) => {
                    let contentType = '';
                    
                    if (image.mime) {
                        contentType = image.mime;
                    }

                    const metadata = {
                        contentType
                    };
        
                    const fileName = b64.encode(new Date().getTime().toString());
                    const imgExt = contentType.slice(contentType.indexOf('/') + 1);
                    const imgRef = storageRef.child(`jogos/${fileName}.${imgExt}`);
                    const dbJogosRef = databaseRef.child(`jogos/${this.props.jogo.key}`);
        
                    await Blob.build(image.data, { type: `${contentType};BASE64` })
                    .then((blob) => { 
                        uploadBlob = blob;
                        return imgRef.put(blob, metadata);
                    })
                    .then(() => {
                        if (uploadBlob) {
                            uploadBlob.close();
                            uploadBlob = null;
                        }
                        return imgRef.getDownloadURL();
                    })
                    .then((url) => {
                        const newImgs = [...this.state.jogo.imagens, url];
                        const newJogo = { ...this.state.jogo, imagens: newImgs };
                        this.setState({ jogo: newJogo });
                        return dbJogosRef.update({ imagens: newImgs });
                    })
                    .then(() => {
                        if (images.length === index + 1) {
                            global.XMLHttpRequest = glbXMLHttpRequest;
                            global.Blob = glbBlob;
                        }
                    })
                    .catch(() => {
                        if (images.length === index + 1) {
                            global.XMLHttpRequest = glbXMLHttpRequest;
                            global.Blob = glbBlob;
                        }

                        if (uploadBlob) {
                            uploadBlob.close();
                        }
                    });
                });
            }
        })
        .catch(() => false);
    }

    onPressRemoveImage(image) {
        const databaseRef = firebase.database().ref();
        const dbJogosRef = databaseRef.child(`jogos/${this.props.jogo.key}`);

        const newImages = _.filter(
            this.state.jogo.imagens, (img) => !typeof img === 'string' || img !== image
        );

        dbJogosRef.update({
            imagens: newImages
        })
        .then(() => {
            const newJogo = { ...this.state.jogo, imagens: newImages };
            this.setState({ jogo: newJogo });
            firebase.storage().refFromURL(image).delete()
            .then(() => true)
            .catch(() => true);
        })
        .catch(() => false);
    }

    rightButtonImagens() {
        return (
            <View 
                style={{
                    flexDirection: 'row',
                    marginHorizontal: 5,
                    paddingHorizontal: 10,
                    justifyContent: 'space-between'
                }}
            >
                <TouchableOpacity
                    onPress={() => this.onPressSelectImgCamera()}
                >
                    <Icon
                        iconStyle={{ marginHorizontal: 5 }}
                        color={'white'}
                        name='camera'
                        type='material-community'
                        size={26}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => this.onPressSelectImgGallery()}
                >
                    <Icon
                        iconStyle={{ marginHorizontal: 5 }}
                        color={'white'}
                        name='folder-multiple-image'
                        type='material-community'
                        size={26}
                    />
                </TouchableOpacity>
            </View>
        );
    }

    renderImagensCard() {
        const { jogo } = this.state;
        const filteredImgs = _.filter(jogo.imagens, (img) => !img.push);

        if (filteredImgs.length > 0) {
            const imagensView = filteredImgs.map((item, index) => (
                    <View key={index}>
                        <TouchableOpacity
                            onPress={() => 
                                this.setState({ imgSelected: index, showImageView: true })
                            }
                        >
                            <Card 
                                containerStyle={styles.card}
                            >
                                <Image
                                    style={{ width: null, height: 200 }}
                                    source={retrieveImgSource({ uri: item })} 
                                />
                                {
                                    this.props.enableButtons &&
                                    <View>
                                        <View style={{ marginVertical: 10 }} >
                                            <Divider />
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => this.onPressRemoveImage(item)}
                                        >
                                            <View style={styles.viewImageSelect}>
                                                <FormLabel 
                                                    labelStyle={{ 
                                                        color: 'white',
                                                        fontSize: 16, 
                                                        fontWeight: '500',
                                                        marginTop: 0, 
                                                        marginBottom: 0 
                                                    }}
                                                >
                                                    Remover
                                                </FormLabel> 
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                }
                            </Card>
                        </TouchableOpacity>
                        <View style={{ marginBottom: 5 }} />
                    </View>
                )
            );
            return imagensView;
        }

        return null;
    }

    render() {
        let imagesForView = _.filter(this.state.jogo.imagens, (img) => !img.push);
        imagesForView = imagesForView.map((item) => ({ source: { uri: item } }));

        return (
            <View style={styles.viewPrinc}>
                <ScrollView 
                    style={{ flex: 1 }} 
                    ref={(ref) => { this.scrollView = ref; }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    { this.renderImagensCard() }
                    <View style={{ marginVertical: 20 }} />
                </ScrollView>
                <ImageView
                    images={imagesForView}
                    imageIndex={this.state.imgSelected}
                    isVisible={this.state.showImageView}
                    renderFooter={() => (<View />)}
                    onClose={() => this.setState({ showImageView: false })}
                />
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
    },
    viewImageSelect: {
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#9E9E9E',
        borderRadius: 5,
        padding: 5
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {
    modificaJogoSelected,
    modificaClean
})(Imagens);
