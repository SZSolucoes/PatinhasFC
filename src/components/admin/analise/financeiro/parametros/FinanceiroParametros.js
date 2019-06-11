/* eslint-disable max-len */
import React from 'react';
import {
    View,
    Text,
    Platform,
    StyleSheet,
    ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { 
    Button,
    FormLabel, 
    FormInput
} from 'react-native-elements';
import { TextInputMask } from 'react-native-masked-text';

import Card from '../../../../tools/Card';
import { colorAppF } from '../../../../../utils/constantes';
import { checkConInfo } from '../../../../../utils/jogosUtils';
import firebase from '../../../../../Firebase';
import { showAlert } from '../../../../../utils/store';

class FinanceiroParametros extends React.Component {
    constructor(props) {
        super(props);

        this.dbFirebaseRef = firebase.database().ref();

        this.state = {
            socioPatrimValor: 0,
            socioPatrimValorDesc: 0,
            socioContribValor: 0,
            socioContribValorDesc: 0,
            financeiroParametros: {
                socioPatrimValor: 0,
                socioPatrimValorDesc: 0,
                socioContribValor: 0,
                socioContribValorDesc: 0
            },
            loading: false
        };
    }

    componentDidMount = () => {
        const dbFinaJogadoresRef = this.dbFirebaseRef.child('analise/financeiroParametros');

        dbFinaJogadoresRef.once('value', (snapshot) => {
            if (snapshot) {
                const snapVal = snapshot.val();

                if (snapVal) {
                    this.setState({
                        socioPatrimValor: snapVal.socioPatrimValor,
                        socioPatrimValorDesc: snapVal.socioPatrimValorDesc,
                        socioContribValor: snapVal.socioContribValor,
                        socioContribValorDesc: snapVal.socioContribValorDesc,
                        financeiroParametros: { ...snapVal } 
                    });
                }
            }
        });
    }

    onPressResetButton = () => {
        this.setState({
            socioPatrimValor: this.state.financeiroParametros.socioPatrimValor,
            socioPatrimValorDesc: this.state.financeiroParametros.socioPatrimValorDesc,
            socioContribValor: this.state.financeiroParametros.socioContribValor,
            socioContribValorDesc: this.state.financeiroParametros.socioContribValorDesc,
            loading: false
        });
    }

    onPressConfirmButton = () => {
        const dbFinaJogadoresRef = this.dbFirebaseRef.child('analise/financeiroParametros');

        const socioPatrimValor = this.inputSocioPatrimValorRef.getRawValue();
        const socioPatrimValorDesc = this.inputSocioPatrimValorDescRef.getRawValue();
        const socioContribValor = this.inputSocioContribValorRef.getRawValue();
        const socioContribValorDesc = this.inputSocioContribValorDescRef.getRawValue();

        
        const payload = {
            socioPatrimValor,
            socioPatrimValorDesc,
            socioContribValor,
            socioContribValorDesc
        };
        
        this.setState({ loading: true, ...payload });
        
        dbFinaJogadoresRef.update(payload)
        .then(() => {
            this.setState({ loading: false, financeiroParametros: payload });

            showAlert('success', 'Sucesso!', 'Parâmetros salvos com sucesso.');    
        }).catch(() => {
            this.setState({ loading: false });

            showAlert('danger', 'Ops!', 'Ocorreu um erro ao salvar os parâmetros.');
        });
    }

    render = () => (
        <ScrollView 
            style={{ flex: 1 }} 
            ref={(ref) => { this.scrollView = ref; }}
            keyboardShouldPersistTaps={'handled'}
        >
            <View>
                <Card containerStyle={styles.card}>
                    <FormLabel labelStyle={styles.text}>SÓCIO PATRIMONIAL</FormLabel>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
                        <View style={{ flex: 1.8, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                            <Text numberOfLines={1}>Valor: </Text>
                        </View>
                        <View style={{ flex: 4, justifyContent: 'center' }}>
                            <TextInputMask
                                ref={ref => { this.inputSocioPatrimValorRef = ref; }}
                                type={'money'}
                                style={styles.input}
                                customTextInput={FormInput}
                                customTextInputProps={{
                                    containerStyle: styles.inputContainer,
                                    inputStyle: [styles.text, styles.input]
                                }}
                                options={{
                                    unit: 'R$ '
                                }}
                                underlineColorAndroid={'transparent'}
                                value={this.state.socioPatrimValor}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
                        <View style={{ flex: 1.8, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                            <Text numberOfLines={1}>Desconto: </Text>
                        </View>
                        <View style={{ flex: 4, justifyContent: 'center' }}>
                            <TextInputMask
                                ref={ref => { this.inputSocioPatrimValorDescRef = ref; }}
                                type={'money'}
                                style={styles.input}
                                customTextInput={FormInput}
                                customTextInputProps={{
                                    containerStyle: styles.inputContainer,
                                    inputStyle: [styles.text, styles.input]
                                }}
                                options={{
                                    unit: 'R$ '
                                }}
                                underlineColorAndroid={'transparent'}
                                value={this.state.socioPatrimValorDesc}
                            />
                        </View>
                    </View>

                    <View style={{ marginTop: 10 }} />

                    <FormLabel labelStyle={styles.text}>SÓCIO CONTRIBUINTE</FormLabel>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
                        <View style={{ flex: 1.8, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                            <Text numberOfLines={1}>Valor: </Text>
                        </View>
                        <View style={{ flex: 4, justifyContent: 'center' }}>
                            <TextInputMask
                                ref={ref => { this.inputSocioContribValorRef = ref; }}
                                type={'money'}
                                style={styles.input}
                                customTextInput={FormInput}
                                customTextInputProps={{
                                    containerStyle: styles.inputContainer,
                                    inputStyle: [styles.text, styles.input]
                                }}
                                options={{
                                    unit: 'R$ '
                                }}
                                underlineColorAndroid={'transparent'}
                                value={this.state.socioContribValor}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
                        <View style={{ flex: 1.8, alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                            <Text numberOfLines={1}>Desconto: </Text>
                        </View>
                        <View style={{ flex: 4, justifyContent: 'center' }}>
                            <TextInputMask
                                ref={ref => { this.inputSocioContribValorDescRef = ref; }}
                                type={'money'}
                                style={styles.input}
                                customTextInput={FormInput}
                                customTextInputProps={{
                                    containerStyle: styles.inputContainer,
                                    inputStyle: [styles.text, styles.input]
                                }}
                                options={{
                                    unit: 'R$ '
                                }}
                                underlineColorAndroid={'transparent'}
                                value={this.state.socioContribValorDesc}
                            />
                        </View>
                    </View>
                    <Button 
                        small
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Confirmar'} 
                        buttonStyle={{ width: '100%', marginTop: 30 }}
                        onPress={() => checkConInfo(() => this.onPressConfirmButton())}
                    />
                    <Button 
                        small
                        title={'Restaurar'}
                        buttonStyle={{ width: '100%', marginVertical: 10 }}
                        onPress={this.onPressResetButton}
                    />
                </Card>
                <View style={{ marginBottom: 30 }} />
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: colorAppF
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
    eye: { 
        position: 'absolute', 
        right: 0, 
        marginHorizontal: 20,
        marginTop: 5,
        zIndex: 1
    }
});

const mapStateToProps = () => ({});

export default connect(mapStateToProps)(FinanceiroParametros);
