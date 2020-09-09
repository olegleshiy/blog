// Instruments
const AuthModel = require('../../models/user');

class Auth {
    constructor(data) {
        this.models = {
            auth: new AuthModel(data),
        };
    }

    async login() {
        const data = await this.models.auth.login();

        return data;
    }

    async register() {
        const data = await this.models.auth.register();

        return data;
    }
}

module.exports = Auth;
