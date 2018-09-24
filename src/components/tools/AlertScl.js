import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import firebase from 'firebase';

import {
  SCLAlert,
  SCLAlertButton
} from 'react-native-scl-alert';
import Toast from 'react-native-simple-toast';


import { store } from '../../App';

class AlertScl extends React.Component {

    constructor(props) {
        super(props);

        this.onPressConfRemov = this.onPressConfRemov.bind(this);
    }

    onPressConfRemov() {
        const { itemSelected } = this.props;

        const dbItemRef = firebase.database().ref().child(`jogos/${itemSelected.key}`);

        dbItemRef.remove()
        .then(() => {
            if (itemSelected.imagem) {
                firebase.storage().refFromURL(itemSelected.imagem).delete()
                .then(() => true)
                .catch(() => true);
            }
            Toast.show('Jogo removido com sucesso.', Toast.LONG);
        })
        .catch(() => Toast.show('Falha ao remover jogo.', Toast.LONG));
        
        store.dispatch({
            type: 'modifica_showalertscl_alertscl',
            payload: false
        });
        store.dispatch({
            type: 'modifica_remove_alertscl',
            payload: false
        });
        store.dispatch({
            type: 'modifica_itemselected_jogos',
            payload: {}
        }); 
    }

    render() {
        return (
            <SCLAlert
                theme={this.props.theme}
                show={this.props.showAlertScl}
                title={this.props.title}
                subtitle={this.props.subtitle}
                onRequestClose={() => {
                    store.dispatch({
                        type: 'modifica_showalertscl_alertscl',
                        payload: false
                    });
                    store.dispatch({
                        type: 'modifica_remove_alertscl',
                        payload: false
                    });
                }}
            >
                {
                    !this.props.remove ?
                    (
                    <SCLAlertButton 
                        theme={this.props.theme} 
                        onPress={() => {
                            store.dispatch({
                                type: 'modifica_showalertscl_alertscl',
                                payload: false
                            });
                            store.dispatch({
                                type: 'modifica_remove_alertscl',
                                payload: false
                            });
                        }}
                    >
                        Ok
                    </SCLAlertButton>
                    )
                    :
                    (
                    <View>
                        <SCLAlertButton 
                            theme={this.props.theme} 
                            onPress={() => this.onPressConfRemov()}
                        >
                            Confirmar
                        </SCLAlertButton>
                        <SCLAlertButton 
                            theme={this.props.theme}
                            onPress={() => {
                                store.dispatch({
                                    type: 'modifica_showalertscl_alertscl',
                                    payload: false
                                });
                                store.dispatch({
                                    type: 'modifica_remove_alertscl',
                                    payload: false
                                });
                            }}
                        >
                            Cancelar
                        </SCLAlertButton>
                    </View>
                    )
                }
                
            </SCLAlert>  
        );
    }

}

const mapStateToProps = (state) => ({
    showAlertScl: state.AlertSclReducer.showAlertScl,
    theme: state.AlertSclReducer.theme,
    title: state.AlertSclReducer.title,
    subtitle: state.AlertSclReducer.subtitle,
    remove: state.AlertSclReducer.remove,
    itemSelected: state.JogosReducer.itemSelected
});

export default connect(mapStateToProps)(AlertScl);

