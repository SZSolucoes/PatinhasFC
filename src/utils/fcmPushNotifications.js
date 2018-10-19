import Axios from 'axios';

const key = 'AIzaSyBMDciOH6bmSk9LLPeZ0fgGbW_2HSCTOwk';

export const sendCadJogoPushNotifForAll = (jogo) => {
    Axios.post('https://fcm.googleapis.com/fcm/send',
      {
        to: '/topics/all',
        notification: {
            title: `Jogo (${jogo}) foi criado.`,
            body: 'Aproveite e já confirme sua presença.',
            show_in_foreground: 'true'
        }, 
        data: {
            jogo
        }
      },
      {
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `key=${key}`
        }
      });
};

