import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    Animated,
    Text
} from 'react-native';
import { Card } from 'react-native-elements';
import { connect } from 'react-redux';
import { colorAppF } from '../../../utils/constantes';
import Campo from '../../campo/Campo';


class Escalacao extends React.PureComponent {

    constructor(props) {
        super(props);

        this.maxViewCasaHeight = 0;
        this.minViewCasaHeight = 0;
        this.isCasaExpanded = true;

        this.maxViewVisitHeight = 0;

        this.onLayoutTitleCasa = this.onLayoutTitleCasa.bind(this);
        this.onLayoutCasa = this.onLayoutCasa.bind(this);
        this.onToggleCasa = this.onToggleCasa.bind(this);

        this.onLayoutVisit = this.onLayoutVisit.bind(this);
        this.onChangeDimensions = this.onChangeDimensions.bind(this);

        this.state = {
            heightDim: Dimensions.get('screen').height / 2.5,
            animCasaValue: new Animated.Value()
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions(event) {
        this.setState({ heightDim: event.screen.height / 2.5 });
    }

    onLayoutTitleCasa(event) {
        this.minViewCasaHeight = event.nativeEvent.layout.height;
    }

    onLayoutCasa(event) {
        this.maxViewCasaHeight = event.nativeEvent.layout.height;
    }

    onLayoutVisit(event) {
        this.maxViewVisitHeight = event.nativeEvent.layout.height;
    }

    onToggleCasa() {
        const initialValue = this.isCasaExpanded ? 
        this.maxViewCasaHeight + this.minViewCasaHeight : this.minViewCasaHeight;

        const finalValue = this.isCasaExpanded ? 
        this.minViewCasaHeight : this.maxViewCasaHeight + this.minViewCasaHeight;
    
        /* this.setState({
            expanded : !this.state.expanded 
        }); */

        this.isCasaExpanded = !this.isCasaExpanded;
    
        this.state.animCasaValue.setValue(initialValue);
        Animated.spring(     
            this.state.animCasaValue,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    render() {
        return (
            <ScrollView style={styles.viewP}>
                <Card
                    containerStyle={styles.card}
                >
                    <Animated.View
                        style={{ height: this.state.animCasaValue }}
                    >
                        <View style={styles.titleContainer} onLayout={this.onLayoutTitleCasa}> 
                            <Text onPress={() => this.onToggleCasa()}>Sucesso</Text>
                        </View>
                        <View onLayout={this.onLayoutCasa}>
                            <View style={{ marginVertical: 15 }} />
                            <View style={{ height: this.state.heightDim }}>
                                <Campo />
                            </View>
                            <View style={{ marginVertical: 5 }} />
                        </View>
                    </Animated.View>
                </Card>
                <Card
                    containerStyle={styles.card}
                >
                    <Animated.View>
                        <View style={{ marginVertical: 5 }} />
                        <View style={{ height: this.state.heightDim }}>
                            <Campo renderSide={'visitantes'} />
                        </View>
                        <View style={{ marginVertical: 5 }} />
                    </Animated.View>
                </Card>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    viewP: {
        flex: 1,
        backgroundColor: colorAppF
    },
    viewPrinc: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white'
    },
    text: { 
        fontSize: 28, 
        fontWeight: 'bold',
        color: 'black' 
    },
    card: {
        flex: 1,
        padding: 5,
        margin: 0,
        marginHorizontal: 5,
        marginVertical: 15,
        borderRadius: 5
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(Escalacao);
