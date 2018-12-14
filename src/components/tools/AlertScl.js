import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import b64 from 'base-64';

import {
    SCLAlert,
    SCLAlertButton
} from 'react-native-scl-alert';
import Toast from 'react-native-simple-toast';

import firebase from '../../Firebase';
import { store } from '../../App';

class AlertScl extends React.Component {

    constructor(props) {
        super(props);

        this.onPressConfRemov = this.onPressConfRemov.bind(this);
        this.onPressDisableUser = this.onPressDisableUser.bind(this);
        this.onPressRemoveInfo = this.onPressRemoveInfo.bind(this);
        this.onPressRemoveFina = this.onPressRemoveFina.bind(this);
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
                setTimeout(
                    () => Toast.show('Usuário desabilitado com sucesso.', Toast.LONG)
                , 1000);
            } else {
                setTimeout(
                    () => Toast.show('Usuário habilitado com sucesso.', Toast.LONG)
                , 1000);
            }
        })
        .catch(() => {
            this.setState({ loading: false });
            if (userDisabled === 'true') {
                setTimeout(
                    () => Toast.show('Falha ao desabilitar usuário.', Toast.LONG)
                , 1000);
            } else {
                setTimeout(
                    () => Toast.show('Falha ao habilitar usuário.', Toast.LONG)
                , 1000);
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
            setTimeout(
                () => Toast.show('Jogo removido com sucesso.', Toast.LONG)
            , 1000);
        })
        .catch(() => 
            setTimeout(
                () => Toast.show('Falha ao remover jogo.', Toast.LONG)
            , 1000)
        );
        
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
            setTimeout(
                () => Toast.show('Informativo removido com sucesso.', Toast.LONG)
            , 1000);
        })
        .catch(() => 
            setTimeout(
                () => Toast.show('Falha ao remover informativo.', Toast.LONG)
            , 1000)
        );
        
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

    onPressRemoveFina() {
        const { itemFinaSelected } = this.props;

        const dbItemRef = firebase.database().ref()
        .child(`analise/financeiro/${itemFinaSelected.key}`);

        dbItemRef.remove()
        .then(() => {
            setTimeout(
                () => Toast.show('Remoção efetuada com sucesso.', Toast.LONG)
            , 1000);
        })
        .catch(() => 
            setTimeout(
                () => Toast.show('Falha durante a remoção.', Toast.LONG)
            , 1000)
        );
        
        store.dispatch({
            type: 'modifica_showalertscl_alertscl',
            payload: false
        });

        store.dispatch({
            type: 'modifica_itemselected_analisefina',
            payload: {}
        }); 

        setTimeout(() => {
            store.dispatch({
                type: 'modifica_remove_alertscl',
                payload: false
            });
            store.dispatch({
                type: 'modifica_flagremoveanalisefina_analisefina',
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
                                } else if (this.props.flagRemoveAnaliseFina) {
                                    return this.onPressRemoveFina();
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
    flagRemoveAnaliseFina: state.FinanceiroReducer.flagRemoveAnaliseFina,
    itemFinaSelected: state.FinanceiroReducer.itemSelected,
});

export default connect(mapStateToProps)(AlertScl);

