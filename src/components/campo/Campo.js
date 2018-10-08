import React from 'react';
import { 
    View,
    StyleSheet,
    ImageBackground
} from 'react-native';
import { connect } from 'react-redux';
import { Avatar } from 'react-native-elements';

import imgCampo from '../../imgs/campo.jpg';

class Campo extends React.Component {

    constructor(props) {
        super(props);

        this.renderLeftToRigth = this.renderLeftToRigth.bind(this);
        this.renderRigthToLeft = this.renderRigthToLeft.bind(this);
    }

    renderLeftToRigth() {
        return (
            <View style={styles.viewMain}>
                <ImageBackground
                    source={imgCampo}
                    style={styles.campo}
                >
                    <View style={styles.viewGridRow}>
                        <View style={[styles.viewGridColumn, { flex: 0.7 }]}>
                            <Avatar
                                medium
                                rounded
                                title={'GO'}
                                //source={{ uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg' }}
                                onPress={() => console.log('Works!')}
                                activeOpacity={0.7}
                            />
                        </View>
                        <View style={styles.viewGridColumn}>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'LE'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-start' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'ZA'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-start' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'ZA'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'LD'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View>
                        <View style={styles.viewGridColumn}>
                            <View />
                            <Avatar
                                medium
                                rounded
                                title={'MD'}
                                //source={{ uri: '' }}
                                onPress={() => console.log('Works!')}
                                activeOpacity={0.7}
                            />
                            <Avatar
                                medium
                                rounded
                                title={'MD'}
                                //source={{ uri: '' }}
                                onPress={() => console.log('Works!')}
                                activeOpacity={0.7}
                            />
                            <View />
                        </View>
                        <View style={styles.viewGridColumn}>
                            <Avatar
                                medium
                                rounded
                                title={'MO'}
                                //source={{ uri: '' }}
                                onPress={() => console.log('Works!')}
                                activeOpacity={0.7}
                            />
                            <Avatar
                                medium
                                rounded
                                title={'MO'}
                                //source={{ uri: '' }}
                                onPress={() => console.log('Works!')}
                                activeOpacity={0.7}
                            />
                        </View>
                        <View style={styles.viewGridColumn}>
                            <Avatar
                                medium
                                rounded
                                title={'AT'}
                                //source={{ uri: '' }}
                                onPress={() => console.log('Works!')}
                                activeOpacity={0.7}
                            />
                            <Avatar
                                medium
                                rounded
                                title={'AT'}
                                //source={{ uri: '' }}
                                onPress={() => console.log('Works!')}
                                activeOpacity={0.7}
                            />
                        </View>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    renderRigthToLeft() {
        return (
            <View style={styles.viewMain}>
                <ImageBackground
                    source={imgCampo}
                    style={styles.campo}
                >
                    <View style={styles.viewGridRow}>
                        <View style={styles.viewGridColumn}>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'AT'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'AT'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View>
                        <View style={styles.viewGridColumn}>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'MO'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'MO'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View>
                        <View style={styles.viewGridColumn}>
                            <View />
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'MD'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'MD'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View />
                        </View>
                        <View style={styles.viewGridColumn}>
                            <View style={{ alignSelf: 'flex-start' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'LD'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'ZA'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'ZA'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                            <View style={{ alignSelf: 'flex-start' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'LE'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View>
                        <View style={[styles.viewGridColumn, { flex: 0.7 }]}>
                            <View style={{ alignSelf: 'flex-end' }}>
                                <Avatar
                                    medium
                                    rounded
                                    title={'GO'}
                                    //source={{ uri: '' }}
                                    onPress={() => console.log('Works!')}
                                    activeOpacity={0.7}
                                />
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        );
    }

    render() {
        const { renderSide } = this.props;

        if (renderSide && renderSide === 'visitantes') {
            return this.renderRigthToLeft();
        }

        return this.renderLeftToRigth(); 
    }
}

const styles = StyleSheet.create({
    viewMain: {
        flex: 3
    },
    campo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    viewGridRow: {
        flex: 1,
        flexDirection: 'row'
    },
    viewGridColumn: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    circle: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 100
    }
});

const mapStateToProps = state => ({
});

export default connect(mapStateToProps, {})(Campo);
