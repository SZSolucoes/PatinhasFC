import React from 'react';
import { 
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    Animated,
    Text,
    TouchableWithoutFeedback,
    Image
} from 'react-native';
import { Card, Icon } from 'react-native-elements';
import { connect } from 'react-redux';
import { colorAppF } from '../../../utils/constantes';
import Campo from '../../campo/Campo';
import { isPortrait } from '../../../utils/orientation';

import imgHomeShirt from '../../../imgs/homeshirt.png';
import imgVisitShirt from '../../../imgs/visitshirt.png';

class Escalacao extends React.Component {

    constructor(props) {
        super(props);

        this.maxViewCasaHeight = 0;
        this.minViewCasaHeight = 0;

        this.maxViewVisitHeight = 0;
        this.minViewVisitHeight = 0;

        this.onLayoutTitleCasa = this.onLayoutTitleCasa.bind(this);
        this.onLayoutCasa = this.onLayoutCasa.bind(this);
        this.onToggleCasa = this.onToggleCasa.bind(this);

        this.onLayoutTitleVisit = this.onLayoutTitleVisit.bind(this);
        this.onLayoutVisit = this.onLayoutVisit.bind(this);
        this.onToggleVisit = this.onToggleVisit.bind(this);

        this.onChangeDimensions = this.onChangeDimensions.bind(this);

        this.state = {
            heightDim: Dimensions.get('screen').height / 2.5,
            animCasaValue: new Animated.Value(),
            animVisitValue: new Animated.Value(),
            isCasaExpanded: true,
            isVisitExpanded: true
        };
    }

    componentDidMount() {
        Dimensions.addEventListener('change', this.onChangeDimensions);
    }

    componentWillUnmount() {
        Dimensions.removeEventListener('change', this.onChangeDimensions);
    }

    onChangeDimensions(event) {
        if (isPortrait()) {
            this.setState({ heightDim: event.screen.height / 2.5 });
        }
    }

    onLayoutTitleCasa(event) {
        this.minViewCasaHeight = event.nativeEvent.layout.height;
    }

    onLayoutCasa(event) {
        this.maxViewCasaHeight = event.nativeEvent.layout.height;
    }

    onLayoutTitleVisit(event) {
        this.minViewVisitHeight = event.nativeEvent.layout.height;
    }

    onLayoutVisit(event) {
        this.maxViewVisitHeight = event.nativeEvent.layout.height;
    }

    onToggleCasa() {
        const initialValue = this.state.isCasaExpanded ? 
        this.maxViewCasaHeight + this.minViewCasaHeight : this.minViewCasaHeight;

        const finalValue = this.state.isCasaExpanded ? 
        this.minViewCasaHeight : this.maxViewCasaHeight + this.minViewCasaHeight;
    
        this.setState({ isCasaExpanded: !this.state.isCasaExpanded });

        this.state.animCasaValue.setValue(initialValue);
        Animated.spring(     
            this.state.animCasaValue,
            {
                toValue: finalValue
            }
        ).start(); 
    }

    onToggleVisit() {
        const initialValue = this.state.isVisitExpanded ? 
        this.maxViewVisitHeight + this.minViewVisitHeight : this.minViewVisitHeight;

        const finalValue = this.state.isVisitExpanded ? 
        this.minViewVisitHeight : this.maxViewVisitHeight + this.minViewVisitHeight;
    
        this.setState({ isVisitExpanded: !this.state.isVisitExpanded });
    
        this.state.animVisitValue.setValue(initialValue);
        Animated.spring(     
            this.state.animVisitValue,
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
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image 
                                    style={{ height: 40, width: 35, marginRight: 5 }}
                                    resizeMode={'stretch'}
                                    source={imgHomeShirt} 
                                /> 
                                <Text 
                                    onPress={() => this.onToggleCasa()}
                                    style={{ fontSize: 16, color: 'black' }}
                                >
                                    Casa
                                </Text>
                            </View>
                            <TouchableWithoutFeedback
                                onPress={() => this.onToggleCasa()}
                            >
                                <Icon
                                    color={'black'}
                                    name={this.state.isCasaExpanded ? 'menu-up' : 'menu-down'}
                                    type='material-community'
                                    size={30}
                                />
                            </TouchableWithoutFeedback>
                        </View>
                        <View onLayout={this.onLayoutCasa}>
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
                    <Animated.View
                        style={{ height: this.state.animVisitValue }}
                    >
                        <View style={styles.titleContainer} onLayout={this.onLayoutTitleVisit}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image 
                                    style={{ height: 40, width: 35, marginRight: 5 }}
                                    resizeMode={'stretch'}
                                    source={imgVisitShirt} 
                                />
                                <Text 
                                    onPress={() => this.onToggleVisit()}
                                    style={{ fontSize: 16, color: 'black' }}
                                >
                                    Visitantes
                                </Text>
                            </View>
                            <TouchableWithoutFeedback
                                onPress={() => this.onToggleVisit()}
                            >
                                <Icon
                                    color={'black'}
                                    name={this.state.isVisitExpanded ? 'menu-up' : 'menu-down'}
                                    type='material-community'
                                    size={30}
                                />
                            </TouchableWithoutFeedback>
                        </View>
                        <View onLayout={this.onLayoutVisit}>
                            <View style={{ height: this.state.heightDim }}>
                                <Campo />
                            </View>
                            <View style={{ marginVertical: 5 }} />
                        </View>
                    </Animated.View>
                </Card>
                <View style={{ marginVertical: 30 }} />
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
        borderRadius: 5,
        overflow: 'hidden'
    },
    titleContainer: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

const mapStateToProps = () => ({
    
});

export default connect(mapStateToProps, {})(Escalacao);
