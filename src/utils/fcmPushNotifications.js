import Axios from 'axios';

const key = 'AIzaSyBMDciOH6bmSk9LLPeZ0fgGbW_2HSCTOwk';

export const sendCadJogoPushNotifForAll = (jogo) => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/all',
        notification: {
            title: `Jogo (${jogo}) foi criado`,
            body: 'Aproveite e já confirme a sua presença',
            show_in_foreground: 'true'
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
            show_in_foreground: 'true',
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

