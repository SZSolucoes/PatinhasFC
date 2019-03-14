import Axios from 'axios';

const key = '';

export const sendCadJogoPushNotifForAll = (jogo) => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
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
    );
};

export const sendReminderJogoPushNotifForAll = (jogo) => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/all',
        notification: {
            title: 'Lembrete',
            body: 
            `Jogo (${jogo}) está chegando. Aproveite e confirme sua presença o quanto antes`,
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
            body: 'Foi realizado uma nova publicação no mural',
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

