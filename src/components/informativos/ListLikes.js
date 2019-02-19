import React from 'react';
import {
    ScrollView,
    View
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import ListItem from '../tools/ListItem';
import { colorAppP } from '../../utils/constantes';

import perfilUserImg from '../../imgs/perfiluserimg.png';

class ListLikes extends React.Component {
    render = () => {
        const { infoMsgSelected, listUsuarios } = this.props;
        let usuarios = [];
        
        if (!infoMsgSelected) return null;

        const { listLikes } = infoMsgSelected;

        if (!listLikes || listLikes.length <= 0) return null;

        for (let index = 0; index < listLikes.length; index++) {
            const element = listLikes[index];
            const findedUser = _.find(listUsuarios, it => it.key === element.key);

            if (findedUser) usuarios.push(findedUser);
        }

        if (!usuarios.length) return null;

        usuarios = _.orderBy(usuarios, ['nome'], ['asc']);

        return (
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, padding: 2 }}
            >
                {
                    _.map(usuarios, (ita, index) => (
                        <ListItem
                            key={index}
                            avatar={ita.imgAvatar || perfilUserImg}
                            title={ita.nome}
                            titleStyle={{
                                fontWeight: '500'
                            }}
                            containerStyle={{
                                borderBottomWidth: 0
                            }}
                            hideChevron
                            avatarProps={{
                                width: 50,
                                height: 50,
                                borderRadius: 50 / 2,
                                showEditButton: true,
                                editButton: {
                                    size: 20,
                                    iconName: 'thumb-up',
                                    iconType: 'material',
                                    iconColor: 'white',
                                    underlayColor: colorAppP,
                                    style: {
                                        backgroundColor: 'green'
                                    }
                                }
                            }}
                        />
                    ))
                }
                <View style={{ marginBottom: 50 }} />
            </ScrollView>
        );
    }
}

const mapStateToProps = state => ({
    listUsuarios: state.UsuariosReducer.listUsuarios
});

export default connect(mapStateToProps)(ListLikes);
