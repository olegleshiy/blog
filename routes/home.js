const  { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('admin/articles');
        return;
    }
    res.redirect('articles');
});

module.exports = router;