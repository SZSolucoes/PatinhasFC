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
import { 
    FormLabel, 
    FormInput, 
    FormValidationMessage, 
    Card, 
    Button, 
    Icon
} from 'react-native-elements';

import ImagePicker from 'react-native-image-crop-picker';
import DatePicker from 'react-native-datepicker';
//import { Buffer } from 'buffer';

class CadastroJogos extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            isTitValid: false,
            isDescValid: false,
            imgJogoUri: null,
            data: ''
        };

        this.onPressSelectImg = this.onPressSelectImg.bind(this);
    }

    onPressSelectImg() {
        ImagePicker.openPicker({
            cropping: true,
            writeTempFile: false,
            includeBase64: true,
            mediaType: 'photo'
          }).then(image => {
            if (image) {
                //const buf64 = new Buffer(image.data, 'binary').toString('base64');
                this.setState({ imgJogoUri: `data:${image.mime};base64,${image.data}` });
            }
          });
    }

    render() {
        return (
            <ScrollView style={styles.viewPrinc}>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.text}>TÍTULO</FormLabel>
                    <FormInput
                        selectTextOnFocus
                        containerStyle={styles.inputContainer}
                        inputStyle={[styles.text, styles.input]} 
                        onChangeText={() => console.log('oi')}
                        underlineColorAndroid={'transparent'} 
                    />
                    { 
                        this.state.isTitValid &&
                        <FormValidationMessage>Error message</FormValidationMessage> 
                    }
                    <FormLabel labelStyle={styles.text}>DATA</FormLabel>
                    <View style={[styles.inputContainer, { marginHorizontal: 15 }]}>
                        <DatePicker
                            style={styles.inputContainer}
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
                                <Image 
                                    source={{ uri: this.state.imgJogoUri }}
                                    style={{
                                        flex: 1,
                                        alignSelf: 'stretch',
                                        width: undefined,
                                        height: undefined
                                        }}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Button 
                        small 
                        title={'Confirmar'} 
                        buttonStyle={{ width: '100%', marginVertical: 30 }}
                        onPress={() => console.log('Confirmar')}
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
        height: Platform.OS === 'android' ? 45 : 40
    },
    input: {
        paddingBottom: 0, 
        width: null,
        color: 'black'
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
        paddingLeft: 5,
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
    },
    dateText: {
        fontSize: 14,
        width: null,
        color: 'black',
        textAlign: 'left'
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(CadastroJogos);
