import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import firebase from 'firebase';
import b64 from 'base-64';

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
        this.onPressDisableUser = this.onPressDisableUser.bind(this);
        this.onPressRemoveInfo = this.onPressRemoveInfo.bind(this);
    }

    onPressDisableUser() {
        const { itemUserSelected } = this.props;
        const userDisabled = itemUserSelected.userDisabled && 
                            itemUserSelected.userDisabled === 'false' ? 'true' : 'false';

        const dbUsuarioRef = firebase.database().ref()
        .child(`usuarios/${b64.encode(itemUserSelected.email)}`);

        dbUsuarioRef.update({
            userDisabled
        })
        .then(() => {
            this.setState({ loading: false });
            if (userDisabled === 'true') {
                Toast.show('Usuário desabilitado com sucesso.', Toast.LONG);
            } else {
                Toast.show('Usuário habilitado com sucesso.', Toast.LONG);
            }
        })
        .catch(() => {
            this.setState({ loading: false });
            if (userDisabled === 'true') {
                Toast.show('Falha ao desabilitar usuário.', Toast.LONG);
            } else {
                Toast.show('Falha ao habilitar usuário.', Toast.LONG);
            }
        });  

        store.dispatch({
            type: 'modifica_showalertscl_alertscl',
            payload: false
        });

        store.dispatch({
            type: 'modifica_itemselected_usuarios',
            payload: {}
        });
        
        setTimeout(() => {
            store.dispatch({
                type: 'modifica_remove_alertscl',
                payload: false
            });
            store.dispatch({
                type: 'modifica_flagdisableuser_usuarios',
                payload: false
            });
        }, 1000);
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
            type: 'modifica_itemselected_jogos',
            payload: {}
        }); 

        setTimeout(() => {
            store.dispatch({
                type: 'modifica_remove_alertscl',
                payload: false
            });
        }, 1000);
    }

    onPressRemoveInfo() {
        const { itemInfoSelected } = this.props;

        const dbItemRef = firebase.database().ref().child(`informativos/${itemInfoSelected.key}`);

        dbItemRef.remove()
        .then(() => {
            if (itemInfoSelected.imgArticle) {
                firebase.storage().refFromURL(itemInfoSelected.imgArticle).delete()
                .then(() => true)
                .catch(() => true);
            }
            Toast.show('Informativo removido com sucesso.', Toast.LONG);
        })
        .catch(() => Toast.show('Falha ao remover informativo.', Toast.LONG));
        
        store.dispatch({
            type: 'modifica_showalertscl_alertscl',
            payload: false
        });

        store.dispatch({
            type: 'modifica_itemselected_info',
            payload: {}
        }); 

        setTimeout(() => {
            store.dispatch({
                type: 'modifica_remove_alertscl',
                payload: false
            });
            store.dispatch({
                type: 'modifica_flagremoveinfo_info',
                payload: false
            });
        }, 1000);
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
                            onPress={() => { 
                                if (this.props.flagDisableUser) {
                                    return this.onPressDisableUser();
                                } else if (this.props.flagRemoveInfo) {
                                    return this.onPressRemoveInfo();
                                }
                                return this.onPressConfRemov(); 
                            }}
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
    itemSelected: state.JogosReducer.itemSelected,
    itemUserSelected: state.UsuariosReducer.itemSelected,
    flagDisableUser: state.UsuariosReducer.flagDisableUser,
    flagRemoveInfo: state.InfoReducer.flagRemoveInfo,
    itemInfoSelected: state.InfoReducer.itemSelected,
});

export default connect(mapStateToProps)(AlertScl);

