module.exports = function (req, res, next) {
    if (req.session.user.role !== "moderator") {
        req.flash('error', "Permission denied!");
        return res.status(403).redirect('/admin/articles');
    }
    next();
};