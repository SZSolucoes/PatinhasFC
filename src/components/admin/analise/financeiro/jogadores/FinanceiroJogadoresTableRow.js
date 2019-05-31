/* eslint-disable max-len */
import React, { PureComponent } from 'react';
import { 
    View, 
    Text,
    StyleSheet,
    ScrollView
} from 'react-native';
import { CheckBox, Divider } from 'react-native-elements';

import ListItem from '../../../../tools/ListItem';
import Card from '../../../../tools/Card';
import { colorAppField } from '../../../../../utils/constantes';

export default class FinanceiroJogadoresTableRow extends PureComponent {
    renderHeader = () => {
        const headerView = (
            <View style={styles.header}>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Janeiro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Fevereiro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Março
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Abril
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Maio
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Junho
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Julho
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Agosto
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Setembro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Outubro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Novembro
                    </Text>
                </View>
                <View style={styles.monthHeader}>
                    <Text style={styles.textHeader}> 
                        Dezembro
                    </Text>
                </View>
            </View>
        );

        return headerView;
    };

    render = () => {
        const imgAvt = this.props.item.jogador.imgAvatar ? 
        { uri: this.props.item.jogador.imgAvatar } : { uri: '' };

        const nome = this.props.item.jogador.nome;
        let janHasPayDescCheck = false;
        let janHasPayCheck = false;
        let fevHasPayDescCheck = false;
        let fevHasPayCheck = false;
        let marHasPayDescCheck = false;
        let marHasPayCheck = false;
        let abrHasPayDescCheck = false;
        let abrHasPayCheck = false;
        let maiHasPayDescCheck = false;
        let maiHasPayCheck = false;
        let junHasPayDescCheck = false;
        let junHasPayCheck = false;
        let julHasPayDescCheck = false;
        let julHasPayCheck = false;
        let agoHasPayDescCheck = false;
        let agoHasPayCheck = false;
        let setHasPayDescCheck = false;
        let setHasPayCheck = false;
        let outHasPayDescCheck = false;
        let outHasPayCheck = false;
        let novHasPayDescCheck = false;
        let novHasPayCheck = false;
        let dezHasPayDescCheck = false;
        let dezHasPayCheck = false;
        
        const jan = this.props.item.jan;
        if (jan) {
            janHasPayDescCheck = jan.typePay === 'desc';
            janHasPayCheck = !janHasPayDescCheck;
        }

        const fev = this.props.item.fev;
        if (fev) {
            fevHasPayDescCheck = fev.typePay === 'desc';
            fevHasPayCheck = !fevHasPayDescCheck;
        }
        const mar = this.props.item.mar;
        if (mar) {
            marHasPayDescCheck = mar.typePay === 'desc';
            marHasPayCheck = !marHasPayDescCheck;
        }

        const abr = this.props.item.abr;
        if (abr) {
            abrHasPayDescCheck = abr.typePay === 'desc';
            abrHasPayCheck = !abrHasPayDescCheck;
        }

        const mai = this.props.item.mai;
        if (mai) {
            maiHasPayDescCheck = mai.typePay === 'desc';
            maiHasPayCheck = !maiHasPayDescCheck;
        }

        const jun = this.props.item.jun;
        if (jun) {
            junHasPayDescCheck = jun.typePay === 'desc';
            junHasPayCheck = !junHasPayDescCheck;
        }

        const jul = this.props.item.jul;
        if (jul) {
            julHasPayDescCheck = jul.typePay === 'desc';
            julHasPayCheck = !julHasPayDescCheck;
        }

        const ago = this.props.item.ago;
        if (ago) {
            agoHasPayDescCheck = ago.typePay === 'desc';
            agoHasPayCheck = !agoHasPayDescCheck;
        }

        const set = this.props.item.set;
        if (set) {
            setHasPayDescCheck = set.typePay === 'desc';
            setHasPayCheck = !setHasPayDescCheck;
        }

        const out = this.props.item.out;
        if (out) {
            outHasPayDescCheck = out.typePay === 'desc';
            outHasPayCheck = !outHasPayDescCheck;
        }

        const nov = this.props.item.nov;
        if (nov) {
            novHasPayDescCheck = nov.typePay === 'desc';
            novHasPayCheck = !novHasPayDescCheck;
        }

        const dez = this.props.item.dez;
        if (dez) {
            dezHasPayDescCheck = dez.typePay === 'desc';
            dezHasPayCheck = !dezHasPayDescCheck;
        }

        return (
            <Card>
                <View style={styles.jogadorCell}>
                    <ListItem
                        avatar={imgAvt}
                        hideChevron
                        title={nome}
                        titleStyle={{
                            fontWeight: '500',
                            fontSize: 16
                        }}
                        titleContainerStyle={{ marginLeft: 10 }}
                        containerStyle={{
                            borderBottomWidth: 0
                        }}
                    />
                </View>
                <Divider style={{ marginBottom: 5 }} />
                <ScrollView
                    horizontal
                    contentContainerStyle={{
                        flexGrow: 1,
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginVertical: 5
                    }}
                >
                    <View style={{ width: this.props.width + 2000 }}>
                        {this.renderHeader()}
                        <View
                            style={styles.row} 
                        >
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%'
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={janHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: janHasPayCheck,
                                                month: 'jan', 
                                                monthName: 'Janeiro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%'
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={janHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: janHasPayDescCheck,
                                                month: 'jan', 
                                                monthName: 'Janeiro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={fevHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: fevHasPayCheck,
                                                month: 'fev', 
                                                monthName: 'Fevereiro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%'
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={fevHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: fevHasPayDescCheck,
                                                month: 'fev', 
                                                monthName: 'Fevereiro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={marHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: marHasPayCheck,
                                                month: 'mar', 
                                                monthName: 'Março', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={marHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: marHasPayDescCheck,
                                                month: 'mar', 
                                                monthName: 'Março', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%'
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={abrHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: abrHasPayCheck,
                                                month: 'abr', 
                                                monthName: 'Abril', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%'
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={abrHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: abrHasPayDescCheck,
                                                month: 'abr', 
                                                monthName: 'Abril', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={maiHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: maiHasPayCheck,
                                                month: 'mai', 
                                                monthName: 'Maio', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={maiHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: maiHasPayDescCheck,
                                                month: 'mai', 
                                                monthName: 'Maio', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={junHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: junHasPayCheck,
                                                month: 'jun', 
                                                monthName: 'Junho', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={junHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: junHasPayDescCheck,
                                                month: 'jun', 
                                                monthName: 'Junho', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={julHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: julHasPayCheck,
                                                month: 'jul', 
                                                monthName: 'Julho', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={julHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: julHasPayDescCheck,
                                                month: 'jul', 
                                                monthName: 'Julho', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={agoHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: agoHasPayCheck,
                                                month: 'ago', 
                                                monthName: 'Agosto', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={agoHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: agoHasPayDescCheck,
                                                month: 'ago', 
                                                monthName: 'Agosto', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={setHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: setHasPayCheck,
                                                month: 'set', 
                                                monthName: 'Setembro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={setHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: setHasPayDescCheck,
                                                month: 'set', 
                                                monthName: 'Setembro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={outHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: outHasPayCheck,
                                                month: 'out', 
                                                monthName: 'Outubro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={outHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: outHasPayDescCheck,
                                                month: 'out', 
                                                monthName: 'Outubro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={novHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: novHasPayCheck,
                                                month: 'nov', 
                                                monthName: 'Novembro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={novHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: novHasPayDescCheck,
                                                month: 'nov', 
                                                monthName: 'Novembro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                            <View style={styles.monthCell}>
                                <CheckBox
                                    title={'Pago'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={dezHasPayCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: dezHasPayCheck,
                                                month: 'dez', 
                                                monthName: 'Dezembro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'norm'
                                            }
                                        )
                                    }
                                />
                                <CheckBox
                                    title={'Pago com desconto'}
                                    size={22}
                                    containerStyle={{ 
                                        margin: 5, 
                                        marginLeft: 5, 
                                        marginRight: 5,
                                        width: '100%' 
                                    }}
                                    textStyle={{ margin: 0 }}
                                    checked={dezHasPayDescCheck}
                                    onPress={() => this.props.onPressItem(
                                            { ...this.props.item }, 
                                            this.props.index,
                                            {
                                                hasCheck: dezHasPayDescCheck,
                                                month: 'dez', 
                                                monthName: 'Dezembro', 
                                                yearNumber: this.props.yearNumber, 
                                                playerName: nome,
                                                playerKey: this.props.item.jogador.key,
                                                checkType: 'desc'
                                            }
                                        )
                                    }
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <Divider style={{ marginTop: 5, marginBottom: 10 }} />
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'OpenSans-Bold' }}>
                        {'Total: '}
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'OpenSans-SemiBold' }}>
                         R$ {parseFloat(Math.round(this.props.item.total * 100) / 100).toFixed(2)}
                    </Text>
                </View>
            </Card>
        );
    }
}

const headerAndCells = {
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 10
};

const styles = StyleSheet.create({
    monthHeader: {
        flex: 1,
        ...headerAndCells
    },
    monthCell: {
        flex: 1.5,
        ...headerAndCells,
        height: 125,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15
    },
    textHeader: {
        fontSize: 14,
        textAlign: 'center',
        color: 'white',
        fontFamily: 'OpenSans-SemiBold',
    },
    header: {
        width: '100%',
        backgroundColor: colorAppField, 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1
    },
    row: {
        width: '100%',
        backgroundColor: '#20293F',
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'row',
        flex: 1
    }
});

