import React from 'react';
import { 
    View,
    ScrollView, 
    StyleSheet,
    Platform,
    TouchableOpacity,
    Image
} from 'react-native';

import { connect } from 'react-redux';
import firebase from 'firebase';
import RNFetchBlob from 'rn-fetch-blob';
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage, 
    Card, 
    Button, 
    Icon
} from 'react-native-elements';
import b64 from 'base-64';

import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-datepicker';
//import { Buffer } from 'buffer';

class CadastroJogos extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isTitValid: false,
            isDescValid: false,
            contentType: '',
            imgJogoUri: null,
            imgPath: '',
            data: '',
            loading: false
        };

        this.b64Str = '';
        this.contentType = '';

        this.onPressSelectImg = this.onPressSelectImg.bind(this);
        this.onPressConfirmar = this.onPressConfirmar.bind(this);
        this.setImgProperties = this.setImgProperties.bind(this);
        this.focusInField = this.focusInField.bind(this);
    }

    onPressSelectImg() {
        ImagePicker.openPicker({
            cropping: true,
            includeBase64: true,
            mediaType: 'photo'
          }).then(image => {
            if (image) {
                //const buf64 = new Buffer(image.data, 'binary').toString('base64');
                let contentType = '';
                if (image.mime) {
                    contentType = image.mime;
                }
                this.setImgProperties(image.data, contentType);
                this.setState({ 
                    imgJogoUri: `data:${image.mime};base64,${image.data}`
                }); 
            }
          }).catch(() => false);
    }

    onPressConfirmar() {
        this.setState({ loading: true });

        const b64File = this.b64Str;
        const contentTp = this.contentType;

        // Upload de imagem e dados
        if (b64File) {
            const metadata = {
                contentType: contentTp
            };

            const storageRef = firebase.storage().ref();
            const Blob = RNFetchBlob.polyfill.Blob;

            const glbXMLHttpRequest = global.XMLHttpRequest;
            const glbBlob = global.Blob;

            let uploadBlob = null;

            global.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
            global.Blob = Blob;

            const fileName = b64.encode(new Date().getTime().toString());
            const imgExt = contentTp.slice(contentTp.indexOf('/') + 1);
            const imgRef = storageRef.child(`jogos/${fileName}.${imgExt}`);

            Blob.build(b64File, { type: `${contentTp};BASE64` })
                .then((blob) => { 
                    uploadBlob = blob;
                    return imgRef.put(blob, metadata);
                })
                .then(() => {
                    uploadBlob.close();
                    return imgRef.getDownloadURL();
                })
                .then((url) => {
                    console.log(url); 
                    this.setState({ loading: false });
                })
                .catch((error) => {
                    console.log(error);
                    global.XMLHttpRequest = glbXMLHttpRequest;
                    global.Blob = glbBlob;

                    if (uploadBlob) {
                        uploadBlob.close();
                    }

                    this.setState({ loading: false });
                });  
        } else {
            this.setState({ loading: false });
        }
    }
    
    setImgProperties(b64Str, mime) {
        this.b64Str = b64Str;
        this.contentType = mime;
    }
    
    focusInField(field) {
        switch (field) {
            case 'data':
                this.data.focus();
                break;
            case 'descricao':
                this.descricao.focus();
                break;
            default:
        }
    }

    render() {
        return (
            <ScrollView style={styles.viewPrinc}>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.text}>TÍTULO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        returnKeyType={'next'}
                        inputStyle={[styles.text, styles.input]} 
                        onChangeText={() => console.log('oi')}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.focusInField('descricao')}
                    />
                    { 
                        this.state.isTitValid &&
                        <FormValidationMessage>Error message</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>DATA</FormLabel>
                    <View 
                        style={[styles.inputContainer, { 
                            flex: 1, 
                            flexDirection: 'row',
                            ...Platform.select({
                            android: {
                                marginHorizontal: 16
                            },
                            ios: {
                                marginHorizontal: 20
                            }
                        }) }]}
                    >
                        <DatePicker
                            style={[styles.inputContainer, { flex: 1 }]}
                            date={this.state.data}
                            mode='date'
                            format='DD/MM/YYYY'
                            confirmBtnText='Ok'
                            cancelBtnText='Cancelar'
                            placeholder=' '
                            showIcon={false}
                            customStyles={{
                                dateInput: StyleSheet.flatten(styles.dateInput),
                                dateText: StyleSheet.flatten(styles.dateText)
                            }}
                            onDateChange={(date) => { this.setState({ data: date }); }}
                        />
                    </View>
                    { 
                        this.state.isDescValid && 
                        <FormValidationMessage>Error message</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>DESCRIÇÃO</FormLabel>
                    <FormInput
                        ref={(ref) => {
                            this.descricao = ref;
                        }}
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        inputStyle={[styles.text, styles.input]} 
                        onChangeText={() => console.log('oi')}
                        underlineColorAndroid={'transparent'}
                        multiline 
                    />
                    { 
                        this.state.isDescValid && 
                        <FormValidationMessage>Error message</FormValidationMessage> 
                    }
                    <View style={{ marginVertical: 20, marginHorizontal: 10 }}>
                        <TouchableOpacity
                            onPress={() => this.onPressSelectImg()}
                        >
                            <View style={styles.viewImageSelect}>
                                <Icon 
                                    name='folder-image' 
                                    type='material-community' 
                                    size={34} color='#9E9E9E' 
                                />
                                <FormLabel 
                                    labelStyle={[styles.text, { marginTop: 0, marginBottom: 0 }]}
                                >
                                    Selecionar imagem
                                </FormLabel> 
                            </View>
                            <View style={[styles.viewImageSelect, { height: 150 }]}>
                                { 
                                    this.state.imgJogoUri && 
                                    (<Image 
                                        source={{ uri: this.state.imgJogoUri }}
                                        style={{
                                            flex: 1,
                                            alignSelf: 'stretch',
                                            width: undefined,
                                            height: undefined
                                            }}
                                    />)
                                }
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Button 
                        small
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginVertical: 30 }}
                        onPress={() => this.onPressConfirmar()}
                    />
                </Card>
            </ScrollView>
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
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(CadastroJogos);
