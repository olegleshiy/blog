const User = require('../models/user');
module.exports = async function (req, res, next) {

    if(!req.session.user) {
        return next();
    }
    res.locals.isAuth = req.session.isAuthenticated;
    res.locals.hasRole = await User.findOne({ role: req.session.user.role});
    //res.locals.csrf = req.csrfToken();
    next();
};