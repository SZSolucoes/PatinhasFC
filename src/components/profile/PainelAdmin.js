import React from 'react';
import { 
    View, 
    StyleSheet,
    Alert
} from 'react-native';

import { connect } from 'react-redux';
import { List, ListItem, Button } from 'react-native-elements';
import Toast from 'react-native-simple-toast';

import firebase from '../../Firebase';
import { checkConInfo } from '../../utils/jogosUtils';

import PlayersModal from './PlayersModal';
import {
    modificaShowUsersModal
} from '../../actions/PainelAdminActions';

class PainelAdmin extends React.Component {

    constructor(props) {
        super(props);

        this.fbDatabaseRef = firebase.database().ref();

        this.onChooseUserTransfAdmin = this.onChooseUserTransfAdmin.bind(this);
        this.onConfirmTransfer = this.onConfirmTransfer.bind(this);
    }

    componentDidMount() {
        
    }

    async onConfirmTransfer(usuario, funCloseModal) {
        const { userLogged } = this.props;
        let lRet = false;
        
        const updatedUserLogged = await this.fbDatabaseRef.child(`usuarios/${userLogged.key}`)
        .update({
            level: '0'
        })
        .then(() => true) 
        .catch(() => false);

        if (updatedUserLogged) {
            const updatedUserTransf = await this.fbDatabaseRef.child(`usuarios/${usuario.key}`)
            .update({
                level: '255'
            })
            .then(() => true) 
            .catch(() => false);

            if (updatedUserTransf) {
                lRet = true;
            } else {
                lRet = false;
            }
        } else {
            lRet = false;
        }

        if (lRet) {
            funCloseModal();
            Toast.show(
                'Transferência realizada com sucesso.', 
                Toast.SHORT
            );
        } else {
            Toast.show(
                'Falha ao transferir administração, verifique a conexão.', 
                Toast.SHORT
            );

            const rolledUserLogged = await this.fbDatabaseRef.child(`usuarios/${userLogged.key}`)
            .update({
                level: '255'
            })
            .then(() => true) 
            .catch(() => false);

            const rolledUserTransf = this.fbDatabaseRef.child(`usuarios/${usuario.key}`).update({
                level: usuario.level
            })
            .then(() => true) 
            .catch(() => false);

            if (!(rolledUserLogged && rolledUserTransf)) {
                Alert.alert('Erro', 'Falha ao desfazer transferência.');
            }
        }
    }

    onChooseUserTransfAdmin(usuario, funCloseModal) {
        Alert.alert(
            'Aviso',
            'Confirma a transferência de administração geral ' +
            `para o usuário:\n( ${usuario.nome} ) ?`,
            [
                { text: 'Cancelar', 
                    onPress: () => true, 
                    style: 'cancel' 
                },
                { 
                    text: 'Ok', 
                    onPress: () => 
                        checkConInfo(() => this.onConfirmTransfer(usuario, funCloseModal))
                }
            ]
        ); 
        
        //funCloseModal();
    }

    render() {
        return (
            <View style={styles.viewPrinc}>
                <List>
                    <ListItem
                        title='Transferir Administração'
                        subtitle={
                            'Transferir administração geral para outro usuário.'
                        }
                        subtitleNumberOfLines={5}
                        rightIcon={(
                            <Button 
                                title='Listar usuários' 
                                onPress={() => this.props.modificaShowUsersModal(true)} 
                            />
                        )}
                    />
                </List>
                <PlayersModal
                    showUsersModal={this.props.showUsersModal}  
                    onChooseUserTransfAdmin={
                        (usuario, funCloseModal) => 
                        checkConInfo(() => this.onChooseUserTransfAdmin(usuario, funCloseModal))
                    }
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    viewPrinc: {
        flex: 1,
        backgroundColor: '#EEEEEE'
    }
});

const mapStateToProps = (state) => ({
    showUsersModal: state.PainelAdminReducer.showUsersModal,
    userLogged: state.LoginReducer.userLogged 
});

export default connect(mapStateToProps, { modificaShowUsersModal })(PainelAdmin);
