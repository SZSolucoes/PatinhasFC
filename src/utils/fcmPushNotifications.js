/* eslint-disable max-len */
import Axios from 'axios';
import _ from 'lodash';
import { pushKey } from '../Firebase';

const key = pushKey;

export const sendCadJogoPushNotifForAll = (jogo) => {
    /* Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/all',
        notification: {
            title: `Jogo (${jogo}) foi criado`,
            body: 'Aproveite e já confirme a sua presença',
            show_in_foreground: true
        }, 
        data: {
            targetScreen: 'main'
        }
      },
        {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `key=${key}`
            }
        }
    ); */
};

export const sendReminderJogoPushNotifForAll = (titulo, jogo, listUsuarios, userLogged) => {
    const messageBody = `Jogo (${titulo}) está chegando. Aproveite e confirme sua presença o quanto antes`;
    
    const totalConfirmed = _.uniqBy([
        ..._.filter(jogo.ausentes, (jg) => !jg.push),
        ..._.filter(jogo.confirmados, (jg) => !jg.push)
    ], 'key');

    for (let index = 0; index < listUsuarios.length; index++) {
        const element = listUsuarios[index];

        if ((_.findIndex(totalConfirmed, ita => ita.key === element.key) === -1) ||
            element.key === userLogged.key
        ) {
            if (element.userNotifToken) {
                Axios.post('https://fcm.googleapis.com/fcm/send',
                {
                    to: element.userNotifToken,
                    notification: {
                        title: 'Lembrete',
                        body: messageBody,
                        show_in_foreground: true
                    }, 
                    data: {
                        targetScreen: 'main'
                    }
                },
                    {
                        headers: { 
                            'Content-Type': 'application/json',
                            Authorization: `key=${key}`
                        }
                    }
                );
            }
        }
    }
};

export const sendEnquetePushNotifForTopic = () => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/enquetes',
        notification: {
            title: 'Nova enquete disponível',
            body: 'Aproveite e já confirme o seu voto',
            show_in_foreground: true,
            targetScreen: 'enquetes'
        }, 
        data: {
            targetScreen: 'enquetes'
        }
      },
        {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `key=${key}`
            }
        }
    );
};

export const sendMuralPushNotifForTopic = () => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/mural',
        notification: {
            title: 'Mural',
            body: 'Foi realizada uma nova publicação no mural',
            show_in_foreground: true,
            targetScreen: 'mural'
        }, 
        data: {
            targetScreen: 'mural'
        }
      },
        {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `key=${key}`
            }
        }
    );
};

export const sendInformativosPushNotifForTopic = () => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/informativos',
        notification: {
            title: 'Informativos',
            body: 'Foi realizada uma nova publicação em informativos',
            show_in_foreground: true,
            targetScreen: 'informativos'
        }, 
        data: {
            targetScreen: 'informativos'
        }
      },
        {
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `key=${key}`
            }
        }
    );
};

