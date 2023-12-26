import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import app from './firebase';
import { userId } from './user' 
import { ref, push, getDatabase } from 'firebase/database';

const messaging = getMessaging(app);
const db = getDatabase(app);

onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    // ...
  });

const notificationsCheckPermission = (f7) => {
    if( "Notification" in window ) {
        if (Notification.permission != "granted") {
            f7.dialog.create({
                title: 'Receber notificações?',
                text: 'Deseja receber notificações sobre os eventos?',
                buttons: [
                    {
                        text: 'Não, obrigado',
                    },
                    {
                        text: 'Sim',
                        onClick: () => {
                            notificationsRequestPermission(f7)
                        }
                    }
                ]
            }).open()
        } else {
            notificationsListener()
        }
    }
};

const notificationsRequestPermission = (f7) => {
    Notification.requestPermission()
    .then((permission) => {
        if (permission == "granted") {
            notificationsListener()
            notificationsGetToken(f7)
        }
    })
    .catch((error) => {
        console.log(error)
    })
};

const notificationsGetToken = (f7) => {
    getToken(messaging, { vapidKey: 'BPgQnR4xeRAdgOKZE_TPBnIQlq85cwCUjuy0aqhSHNGOM8MCs0ZNhgHBiA9VsDPSoPR7x0wyeDxlPUXes5pdoF4' }).then((currentToken) => {
        const path = ref(db, `events/${userId()}/configs`);

        const obj_token = {
            token: currentToken
        };

        push(path, obj_token)
        .then(() => {
            f7.toast.create({ text: 'Token salvo', closeTimeout: 2000 }).open()
        })
        .catch(() => {
            f7.toast.create({ text: 'Erro ao salvar o token', closeTimeout: 2000 }).open()
        })
      }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
        f7.toast.create({ text: `Erro ao coletar token ${JSON.stringify(err)}`, closeTimeout: 2000 }).open()
      });
}

export { notificationsCheckPermission }