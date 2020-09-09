const keys = require('../keys');

module.exports = function (email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Registration completed successfully',
        html: `
            <h1>Welcome</h1>
            <p>You have successfully crested an account with email - ${email}</p>
            <hr />
            <a href='${keys.BASE_URL}'>Blast blog</a>
        `
    };
};