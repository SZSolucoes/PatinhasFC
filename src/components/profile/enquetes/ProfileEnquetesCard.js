import React from 'react';
import { 
    View, 
    StyleSheet,
    Dimensions,
    Animated,
    Easing
} from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { Circle, G, Line, Text, Svg } from 'react-native-svg';

import { connect } from 'react-redux';
import Toast from 'react-native-simple-toast';
import _ from 'lodash';
import { Card, CheckBox, Button, Text as RNEText } from 'react-native-elements';
import { checkConInfo } from '../../../utils/jogosUtils';
import { colorAppS, colorAppP } from '../../../utils/constantes';
import firebase from '../../../Firebase';

class ProfileEnquetesCard extends React.Component {
    constructor(props) {
        super(props);

        this.opacityValue = new Animated.Value(1);

        this.onChangeDimensions = this.onChangeDimensions.bind(this);
        this.onPressVotar = this.onPressVotar.bind(this);
        this.renderEnqueteWithOpts = this.renderEnqueteWithOpts.bind(this);
        this.renderEnqueteWithResult = this.renderEnqueteWithResult.bind(this);

        this.state = {
            loading: false,
            optSelected: -1
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions() {
        this.onAnimChartOpacity();
    }

    onAnimChartOpacity() {
        this.opacityValue.setValue(0);
        setTimeout(() => {
            Animated.timing(
                this.opacityValue,
                {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.linear
                }
            ).start();
        }, 1000);
    }

    onPressVotar(enquete, userKey) {
        const { optSelected } = this.state;
        const { votos } = enquete;
        const newVotos = [
            ...votos,
            {
                key: userKey,
                optVal: `${optSelected}`
            }
        ];

        if (optSelected === -1) {
            return;
        }

        this.setState({ loading: true });

        const databaseRef = firebase.database().ref();
        const dbEnquetes = databaseRef.child(`enquetes/${enquete.key}`);

        dbEnquetes.update({
            votos: newVotos
        })
        .then(() => {
            Toast.show('Voto efetuado com sucesso', Toast.SHORT);
            this.setState({ loading: false });
        })
        .catch(() => {
            Toast.show('Ocorreu um erro na votação. Verifique a conexão', Toast.SHORT);
            this.setState({ loading: false });
        });
    }

    renderEnqueteWithOpts(enquete, userKey) {
        const titulo = enquete.titulo || '';
        let viewOpts = [];

        viewOpts = _.map(enquete.opcoes, (opt, index) => (
            <CheckBox
                key={index}
                left
                title={opt}
                checkedIcon='dot-circle-o'
                uncheckedIcon='circle-o'
                checked={this.state.optSelected === index}
                onPress={() => this.setState({ optSelected: index })}
            />
        ));

        return (
            <Card 
                containerStyle={styles.card}
                title={titulo}
                titleStyle={{ color: 'black', fontSize: 14 }}
            >
                <View style={{ padding: 5 }}>
                    { viewOpts }
                </View>
                <View 
                    style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'center',
                        marginTop: 5 
                    }}
                >
                    <Button 
                        small
                        rounded
                        loading={this.state.loading}
                        disabled={this.state.loading}
                        loadingProps={{ size: 'large', color: 'rgba(111, 202, 186, 1)' }}
                        title={this.state.loading ? ' ' : 'Votar'} 
                        buttonStyle={{ 
                            width: '100%', 
                            marginVertical: 10, 
                            backgroundColor: colorAppS 
                        }}
                        onPress={
                            () => checkConInfo(() => this.onPressVotar(enquete, userKey))
                        }
                    />
                </View>
            </Card>
        );
    }

    renderEnqueteWithResult(enquete, userKey) {
        const titulo = enquete.titulo || '';
        const votos = _.groupBy(_.filter(enquete.votos, vts => !vts.push), 'optVal');
        const colors = [];
        const newOpcs = [];
        const numTotalVts = _.reduce(votos, (sum, item) => sum + item.length, 0);
        const userVote = _.find(enquete.votos, vtU => vtU.key && vtU.key === userKey);

        let newViewOpcs = null;

        const randomColor = () => 
        (`#${(Math.random() * 0xFFFFFF << 0).toString(16)}000000`).slice(0, 7);

        for (let index = 0; index < enquete.opcoes.length; index++) {
            let colorRd = randomColor();
            if (colors.includes(colorRd)) {
                while (colors.includes(colorRd)) {
                    colorRd = randomColor();
                }
            } 

            colors.push(colorRd);
        }

        for (let index = 0; index < enquete.opcoes.length; index++) {
            const indexKey = _.find(Object.keys(votos), vtIdx => `${vtIdx}` === `${index}`);
            if (indexKey) {
                newOpcs.push(
                    { 
                        idxKey: index, 
                        vtCount: votos[`${indexKey}`].length, 
                        color: colors[index],
                        text: enquete.opcoes[index]
                    }
                );
            } else {
                newOpcs.push({ 
                    idxKey: index, 
                    vtCount: 0, 
                    color: colors[index], 
                    text: enquete.opcoes[index] 
                });
            }
        }

        const pieData = newOpcs
            .filter(value => value.vtCount > 0)
            .map((value, index) => ({
                value: value.vtCount,
                svg: { fill: value.color },
                key: `pie-${index}`,
                amount: value.vtCount
        }));

        const Labels = ({ slices }) => slices.map((slice, index) => {
            const { labelCentroid, pieCentroid, data } = slice;
            return (
                <G key={index}>
                    <Line
                        x1={labelCentroid[0]}
                        y1={labelCentroid[1]}
                        x2={pieCentroid[0]}
                        y2={pieCentroid[1]}
                        stroke={data.svg.fill}
                    />
                    <Circle
                        cx={labelCentroid[0]}
                        cy={labelCentroid[1]}
                        r={19}
                        fill={data.svg.fill}
                    />
                    <Text
                        key={index}
                        x={labelCentroid[0]}
                        y={labelCentroid[1]}
                        fill={'white'}
                        textAnchor={'middle'}
                        alignmentBaseline={'middle'}
                        fontSize={18}
                        fontWeight={'bold'}
                        stroke={'black'}
                        strokeWidth={0.2}
                    >
                        {data.amount}
                    </Text>
                </G>
            );
        });

        newViewOpcs = _.map(newOpcs, (opcItem, index) => (
            <View
                style={{
                    marginBottom: 10 
                }}
                key={index}
            >
                <View 
                    style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center',
                        marginBottom: 5 
                    }}
                >
                    <Svg
                        height="20"
                        width="20"
                    >
                        <G>
                            <Circle
                                cx={10}
                                cy={10}
                                r={10}
                                fill={opcItem.color}
                            />
                        </G>
                    </Svg>
                    <View 
                        style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            paddingHorizontal: 10 
                        }}
                    >
                        <RNEText
                            style={{
                                textAlign: 'left',
                                color: 'black',
                                fontWeight: 'bold'
                            }}
                        >
                            {
                                `${opcItem.vtCount} ${opcItem.vtCount === 1 ? 'Voto' : 'Votos'}` +
                                ` ( ${(opcItem.vtCount / numTotalVts) * 100} % )`
                            }
                        </RNEText>
                        {
                            userVote && userVote.optVal === `${index}` &&
                            (   
                                <View
                                    style={{
                                        padding: 5
                                    }}
                                >
                                    <View
                                        style={{
                                            backgroundColor: colorAppP,
                                            borderRadius: 10,
                                            paddingHorizontal: 9,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <RNEText
                                            style={{ 
                                                color: 'white', 
                                                fontWeight: '500' 
                                            }}
                                        >
                                            Seu voto
                                        </RNEText>
                                    </View>
                                </View>
                            )
                        }
                    </View>
                </View>
                <View
                    style={{ paddingHorizontal: 9 }}
                >
                    <RNEText
                        style={{
                            textAlign: 'left',
                            fontWeight: '600'
                        }}
                    >
                        {opcItem.text}
                    </RNEText>
                </View>
            </View>
        ));

        return (
            <Card 
                containerStyle={styles.card}
                title={titulo}
                titleStyle={{ color: 'black', fontSize: 14 }}
            >
                <Animated.View
                    style={{
                        opacity: this.opacityValue
                    }}
                >
                    <View 
                        style={{ 
                            padding: 5,
                            height: 200,
                        }}
                    >
                        <PieChart
                            style={{ height: 200, flex: 1 }}
                            data={pieData}
                            innerRadius={20}
                            outerRadius={50}
                            labelRadius={80}
                            startAngle={90}
                        >
                            <Labels />
                        </PieChart>
                    </View>
                </Animated.View>
                {newViewOpcs}
            </Card>
        );
    }

    render() {
        return (
            this.props.isResult ? 
            this.renderEnqueteWithResult(this.props.enquete, this.props.userKey) 
            : 
            this.renderEnqueteWithOpts(this.props.enquete, this.props.userKey)
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    },
    card: {
        paddingHorizontal: 10
    }
});

const mapStateToProps = () => ({
});

export default connect(mapStateToProps, {})(ProfileEnquetesCard);
