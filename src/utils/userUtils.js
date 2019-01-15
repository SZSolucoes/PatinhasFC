import _ from 'lodash';
import firebase from '../Firebase';

export const usuarioAttr = {
    userDisabled: 'false',
    email: '',
    senha: '',
    nome: '',
    nomeForm: '',
    dtnasc: '', 
    tipoPerfil: 'socio',
    imgAvatar: '',
    imgBackground: '',
    level: '1',
    telefone: '',
    endereco: '',
    dataCadastro: '',
    dataHoraUltimoLogin: '',
    jogosParticipados: '0',
    jogosEscalados: '0',
    vitorias: '0',
    derrotas: '0',
    empates: '0',
    gols: '0',
    faltas: '0',
    faltasHistorico: [{ push: 'push' }],
    cartoesAmarelos: '0',
    cartoesVermelhos: '0',
    posicao: '',
    userNotifToken: '',
    infoImgUpdated: 'true', 
    jogosImgUpdated: 'true'
};

export const checkPerfil = (perfil) => {
    switch (perfil) {
        case 'socio':
            return 'Sócio';
        case 'sociopatrim':
            return 'Sócio Patrimonial';
        case 'sociocontrib':
            return 'Sócio Contribuinte';
        case 'visitante':
            return 'Visitante';
        case '0':
            return 'Administrador';
        case '255':
            return 'Administrador Geral';
        default:
            return perfil;
    }
};

export const updateUserDB = (
    informativos = 'true', 
    jogos = 'true', 
    emailUser, 
    keyUser, 
    newImg,
    newNome
) => {
    const dbFbRef = firebase.database().ref();
    const dbUserRef = dbFbRef.child(`usuarios/${keyUser}`);

    const mainUpdate = async () => {
        // UPDATE DE IMAGEM E NOME DO USUARIO PARA OS INFORMATIVOS
        if (informativos === 'false') {
            const dbInfoRef = dbFbRef.child('informativos');
            await dbInfoRef.once('value', async (snapshot) => {
                if (snapshot) {
                    let childFailed = false;
                    let lastIndex = 0;
                    const numChilds = snapshot.numChildren();
        
                    await snapshot.forEach((child) => {
                        const funExec = async () => {
                            const childVal = child.val();

                            let hasUpdated = false;
                            let hasUpdatedListComents = false;
                            
                            let updatedImgUser = {};
                            let hasUpdatedImgUser = false;

                            let updatedNomeUser = {};
                            let hasUpdatedNomeUser = false;
                            
                            if (
                                childVal.emailUser === emailUser && 
                                childVal.imgAvatar !== newImg
                                ) {
                                    hasUpdated = true;
                                    hasUpdatedImgUser = true;
                                    updatedImgUser = { imgAvatar: newImg };
                            }

                            if (
                                childVal.emailUser === emailUser && 
                                childVal.nomeUser !== newNome
                                ) {
                                    hasUpdated = true;
                                    hasUpdatedNomeUser = true;
                                    updatedNomeUser = { nomeUser: newNome };
                            }
            
                            const comentsUpdated = _.map(childVal.listComents, (comentUser) => {
                                if (!comentUser.push && 
                                    comentUser.key === keyUser && 
                                    (comentUser.imgAvatar !== newImg || 
                                    childVal.nome !== newNome)
                                    ) {
                                        hasUpdated = true;
                                        hasUpdatedListComents = true;
                                        return { 
                                            ...comentUser, 
                                            imgAvatar: newImg, 
                                            nome: newNome 
                                        };
                                }
                                
                                return comentUser;
                            });
            
                            if (hasUpdated) {
                                let updates = {};
            
                                if (hasUpdatedImgUser || hasUpdatedNomeUser) {
                                    updates = { ...updatedImgUser, ...updatedNomeUser };
                                }
    
                                if (hasUpdatedListComents) {
                                    updates = { ...updates, listComents: comentsUpdated };
                                }
                
                                await child.ref.update({
                                    ...updates
                                })
                                .then(async () => { 
                                    lastIndex++;
                                    
                                    /* Caso o update não falhou em nenhum caso entao 
                                    atualiza o status do usuarios de update */
                                    if (numChilds === lastIndex && !childFailed) {
                                        dbUserRef.update({
                                            infoImgUpdated: 'true'
                                        })
                                        .then(() => true)
                                        .catch(() => true);
                                    } 
                                    await true; 
                                })
                                .catch(async () => {
                                     childFailed = true;
                                     await true; 
                                });
                            }
                        };
                        
                        funExec();
                        return false;
                    });
                }
            });
        }
        // FIM DO UPDATE INFORMATIVOS

        if (jogos === 'false') {
            // UPDATE DE IMAGEM E NOME DO USUARIO PARA OS JOGOS
            const dbJogosRef = dbFbRef.child('jogos');
            await dbJogosRef.once('value', async (snapshot) => {
                if (snapshot) {
                    let childFailed = false;
                    let lastIndex = 0;
                    const numChilds = snapshot.numChildren();
        
                    await snapshot.forEach((child) => {
                        const funExec = async () => {
                            let hasUpdated = false;
                            let hasUpdatedGols = false;
                            let hasUpdatedCartoes = false;
                            let hasUpdatedConfirmados = false;
                            let hasUpdatedEscalacao = false;
                            let hasUpdatedSubs = false;
                            
                            const golsUpdated = _.map(
                                child.val().gols, (gol) => {
                                if (!gol.push && 
                                    gol.key === keyUser && 
                                    gol.nome !== newNome
                                    ) {
                                        hasUpdated = true;
                                        hasUpdatedGols = true;
                                        return { ...gol, nome: newNome };
                                }

                                return gol;
                            });

                            const cartoesUpdated = _.map(
                                child.val().cartoes, (cartao) => {
                                if (!cartao.push && 
                                    cartao.key === keyUser && 
                                    (cartao.imgAvatar !== newImg ||
                                    cartao.nome !== newNome)
                                    ) {
                                        hasUpdated = true;
                                        hasUpdatedCartoes = true;
                                        return { ...cartao, nome: newNome };
                                }

                                return cartao;
                            });

                            const confirmadosUpdated = _.map(
                                child.val().confirmados, (confirmado) => {
                                if (!confirmado.push && 
                                    confirmado.key === keyUser && 
                                    (confirmado.imgAvatar !== newImg ||
                                    confirmado.nome !== newNome)
                                    ) {
                                        hasUpdated = true;
                                        hasUpdatedConfirmados = true;
                                        return { ...confirmado, imgAvatar: newImg, nome: newNome };
                                }

                                return confirmado;
                            });
            
                            const escalacaoUpdated = _.map(child.val().escalacao, (sides, key) => {
                                let hasChangedSide = false;
                                const newSides = _.map(sides, (side) => {
                                    if (!side.push && 
                                        side.key === keyUser && 
                                        (side.imgAvatar !== newImg || side.nome !== newNome)
                                        ) {
                                            hasUpdated = true;
                                            hasUpdatedEscalacao = true;
                                            hasChangedSide = true;
                                            return { ...side, imgAvatar: newImg, nome: newNome };
                                    }

                                    return side;
                                });

                                if (hasChangedSide) {
                                    return { [key]: newSides };
                                }

                                return { [key]: sides };
                            });

                            let copyEscalacao = {};
                            for (const side of escalacaoUpdated) {
                                copyEscalacao = { ...copyEscalacao, ...side };
                            }
                            
                            const subsUpdated = _.map(child.val().subs, (subs) => {
                                if (!subs.push) {
                                    let hasChangedSub = false;
                                    let newSub = {};

                                    if (!subs.jogadorIn.push && 
                                        subs.jogadorIn.key === keyUser && 
                                        (subs.jogadorIn.imgAvatar !== newImg || 
                                            subs.jogadorIn.nome !== newNome)
                                        ) {
                                            hasUpdated = true;
                                            hasUpdatedSubs = true;
                                            hasChangedSub = true;
                                            newSub = { 
                                                ...subs, 
                                                jogadorIn: { 
                                                    ...subs.jogadorIn, 
                                                    imgAvatar: newImg,
                                                    nome: newNome
                                                } 
                                            };
                                    }

                                    if (hasChangedSub) {
                                        return newSub;
                                    }

                                    if (!subs.jogadorOut.push && 
                                        subs.jogadorOut.key === keyUser && 
                                        (subs.jogadorOut.imgAvatar !== newImg || 
                                        subs.jogadorOut.nome !== newNome)
                                        ) {
                                            hasUpdated = true;
                                            hasUpdatedSubs = true;
                                            hasChangedSub = true;
                                            newSub = { 
                                                ...newSub, 
                                                jogadorOut: { 
                                                    ...subs.jogadorOut, 
                                                    imgAvatar: newImg,
                                                    nome: newNome 
                                                } 
                                            };
                                    }

                                    if (hasChangedSub) {
                                        return newSub;
                                    }
                                }

                                return subs;
                            });
            
                            if (hasUpdated) {
                                let updates = {};
                            
                                if (hasUpdatedGols) {
                                    updates = { ...updates, gols: golsUpdated };
                                }

                                if (hasUpdatedCartoes) {
                                    updates = { ...updates, cartoes: cartoesUpdated };
                                }

                                if (hasUpdatedConfirmados) {
                                    updates = { ...updates, confirmados: confirmadosUpdated };
                                }

                                if (hasUpdatedEscalacao) {
                                    updates = { ...updates, escalacao: copyEscalacao };
                                }

                                if (hasUpdatedSubs) {
                                    updates = { ...updates, subs: subsUpdated };
                                }
                
                                await child.ref.update({
                                    ...updates
                                })
                                .then(async () => { 
                                    lastIndex++;
                                    
                                    /* Caso o update não falhou em nenhum caso entao 
                                    atualiza o status do usuarios de update */
                                    if (numChilds === lastIndex && !childFailed) {
                                        dbUserRef.update({
                                            jogosImgUpdated: 'true'
                                        })
                                        .then(() => true)
                                        .catch(() => true);
                                    } 
                                    await true; 
                                })
                                .catch(async () => {
                                    childFailed = true;
                                    await true; 
                                });
                            }
                        };
                        
                        funExec();
                        return false;
                    });
                }
            });
        }
        // FIM DO UPDATE JOGOS
    };

    mainUpdate();

    return true;
};
