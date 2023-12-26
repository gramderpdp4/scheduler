import { f7 } from 'framework7-vue'

const userId = () => {
    return localStorage.getItem('user-id')
};

const generateUserId = () => {
    const id = f7.utils.id('xxxx-xxxx-xxxx')

    localStorage.setItem('user-id', id);

    return id;
}

export { userId, generateUserId }