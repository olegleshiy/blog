const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Article = require('../models/article');
const User = require('../models/user');
const Categories = require('../models/categories');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { articleValidators } = require('../utils/validators');
const slugger = require('../utils/slugger');
const { encode_base64, decode_base64 } = require('../utils/img-converter');
const router = Router();


/** Get all articles **/
router.get('/articles', [auth], async (req, res) => {
    try {
        let articles = await Article.find().populate('categories');

        res.render('admin/articles', {
            layout: 'admin',
            title: 'Articles',
            isArticles: true,
            articles,
            error: req.flash('error')
        });
    } catch (e) {
        console.log(e);
    }
});

/** Form add article **/
router.get('/articles/add', [auth], async (req, res) => {
    try {
        const categories = await Categories.find({});
        res.render('admin/article-add', {
            layout: 'admin',
            title: 'Add new article',
            isArticles: true,
            categories,
            error: req.flash('error')
        });
    } catch (e) {
        console.log(e);
    }
});

/** Create article **/
router.post('/articles/add', [auth], async (req, res) => {
    try {
        const {
            title,
            description,
            img,
            body,
            categories,
            metatitle,
            metakeywords,
            metadescription
        } = req.body;
        const errors = validationResult(req);
        const imgName = `image-${new Date().toISOString()}.jpg`;
        let imgBase64 = img.split(';base64,').pop();
        const savedImage = await decode_base64(imgBase64, imgName);
        let categoriesOfArray = categories.split(', ')

        if (!errors.isEmpty()) {
            return res.status(422).render('admin/article-add', {
                title: 'Add new article',
                isArticles: true,
                error: errors.array()[0].msg,
                data: {
                    title: title,
                    description: description,
                    img: `images/${savedImage}`,
                    body: body,
                    categories: categoriesOfArray,
                    slug: slugger(title),
                    meta: {
                        title: metatitle,
                        keywords: metakeywords,
                        descriptions: metadescription
                    }
                }
            });
        }
        // Find ID of category
        const categoriesId = await Categories.find({name: { $in : categoriesOfArray}}).select('_id');
        // Create new article
        const article = new Article({
            title: title,
            description: description,
            img: `images/${savedImage}`,
            body: body,
            slug: slugger(title),
            meta: {
                title: metatitle,
                keywords: metakeywords,
                descriptions: metadescription
            }
        });
        // Find everyone category on name and set ID article
        const categoriesUpdate = await Categories.updateMany({name: { $in: categoriesOfArray }}, {$push: {articles: article._id}});

        // Set ID the all selected category in array article.categories
        categoriesId.forEach(category => {
            article.categories.push(category._id);
        })

        const articleItem = await article.save();
        res.send({id: articleItem._id});
    } catch (e) {
        console.log(e);
    }
});

/** Get form edit article **/
router.get('/articles/:slug/edit', [auth], async (req, res) => {
    try {
        if (!req.query.allow) {
            return req.redirect('/');
        }
        const categories = await Categories.find({});
        const article = await Article.findOne({ slug: req.params.slug }).populate('categories');

        res.render('admin/article-add', {
            layout: 'admin',
            title: `Edit ${ article.title }`,
            isArticles: true,
            article,
            isEdit: true,
            categories
        });
    } catch (e) {
        console.log(e);
    }
});

/** Edit article **/
router.put('/articles/edit', [auth], async (req, res) => {
    try {
        let {
            id,
            title,
            img,
            categories,
        } = req.body;

        let savedImage = '';
        let categoriesId = [];
        let categoriesOfArray = [];

        if (img) {
            const imgName = `image-${new Date().toISOString()}.jpg`;
            let imgBase64 = img.split(';base64,').pop();
            savedImage = await decode_base64(imgBase64, imgName);
        }
        req.body.img = `images/${savedImage}`;

        if(title) {
            req.body.slug = slugger(title);
        }

        if(categories && categories.length > 0) {
            categoriesOfArray = categories.split(', ')

            // Find ID of category
            categoriesId = await Categories.find({name: { $in : categoriesOfArray}}).select('_id');

            // Find everyone category on name and set ID article
            await Categories.updateMany({}, {$pull: {articles: id}});

            // Find everyone category on name and set ID article
            await Categories.updateMany({name: { $in: categoriesOfArray }}, {$push: {articles: id}});

            req.body.categories = categoriesId;

        } else {
            delete req.body.categories;
        }

        const updatedArticle = await Article.findOneAndUpdate({ _id: id }, req.body);

        res.send({id: updatedArticle._id});

    } catch (e) {
        console.log(e);
    }
});

/** Publish article **/
router.put('/articles/publish', [auth], async (req, res) => {
    try {
        let { id, status } = req.body;
        console.log("req", req.body);
        const article = await Article.updateOne({_id: id}, { status: status });
        //const articles = await Article.find({}).populate('categories');

        //articles.forEach(post => post.status ? post.status : post.status = '' );
        if (article) {
            //article.status = !article.status;

            console.log("SAVE", article);
            res.status(200).json({ status: JSON.parse(status) });
        }

        // res.render('admin/articles', {
        //     layout: 'admin',
        //     title: 'Add new article',
        //     isArticles: true,
        //     articles
        // });
        //res.status(200).json({ status: article.status });
    } catch (e) {
        console.log(e);
    }
});

/** Delete article **/
router.post('/articles/remove', [auth], async (req, res) => {
    try {
        await Article.findOneAndRemove({ _id: req.body.id });
        await Categories.updateMany({$pull: { 'articles': req.body.id }});
        res.redirect('/admin/articles');
    } catch (e) {
        console.log(e);
    }
});

/** Get all users **/
router.get('/users', [auth, role], async (req, res) => {
    try {
        const users = await User.find({});
        res.render('admin/users', {
            layout: 'admin',
            title: 'Users',
            isUsers: true,
            users,
            error: req.flash('error')
        });
    } catch (e) {
        console.log(e);
    }
});

/** Get form add user **/
router.get('/users/add', [auth, role], async (req, res) => {
    try {
        res.render('admin/user', {
            layout: 'admin',
            title: 'Add user',
            isUsers: true,
            registerError: req.flash('registerError')
        });
    } catch (e) {
        console.log(e);
    }
});

/** Get user by ID **/
router.get('/users/:id', [auth, role], async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ _id: id });
        res.render('admin/user', {
            layout: 'admin',
            title: 'Edit user',
            isUsers: true,
            isEdit: true,
            user,
            registerError: req.flash('registerError')
        });
    } catch (e) {
        console.log(e);
    }
});

/** Edit user **/
router.post('/users/edit', [auth, role], async (req, res) => {
    try {
        const { id, password, confirm } = req.body;
        console.log('BODY', req.body);
        if (password.trim() && (password.trim().length > 6 && password.trim().length <= 56)) {

            if (password.trim() !== confirm.trim()) {
                req.flash('registerError', 'Passwords should be match');
                const { referer } = req.headers;
                res.redirect(referer);
            }

            const hashPassword = await bcrypt.hash(password, 12);
            req.body.password = hashPassword;
        } else {
            delete req.body.password;
        }
        const result = await User.findOneAndUpdate({ _id: id }, req.body, { new: true });

        if (!result) {
            throw new Error(`can not find document with id ${ id }`);
        }

        res.redirect('/admin/users');
    } catch (e) {
        console.log(e);
    }
});

/** Get form for edit user **/
router.get('/users/:id/edit', [auth, role], async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findOne({ _id: id });
        res.render('admin/user', {
            layout: 'admin',
            title: 'Edit user',
            user,
            isEdit: true,
            isUsers: true,
            registerError: req.flash('registerError')
        });
    } catch (e) {
        console.log(e);
    }
});

/** Delete user **/
router.post('/users/delete', [auth, role], async (req, res) => {
    try {
        await User.findOneAndRemove({
            _id: req.body.id
        });
        res.redirect('/admin/users');
    } catch (e) {
        console.log(e);
    }
});

/** Get all images **/
router.get('/gallery', [auth], (req, res) => {
    const getFiles = function (dir, files_) {

        files_ = files_ || [];
        const files = fs.readdirSync(dir);
        for (const i in files) {
            const name = dir + '/' + files[i];
            if (fs.statSync(name).isDirectory()) {
                getFiles(name, files_);
            } else {
                files_.push(name);
            }
        }
        return files_;
    };

    const images = getFiles(path.join('./', 'images'));

    res.render('admin/gallery', {
        layout: 'admin',
        title: 'Gallery',
        isGallery: true,
        images,
        error: req.flash('error')
    });
});

/** Remove image **/
router.post('/gallery/remove', [auth], async (req, res) => {
    try {
        if (req.body.id) {
            fs.unlink(req.body.id, (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log('REMOVED');
            });
            res.redirect('/admin/gallery');
        }

    } catch (e) {
        console.log(e);
    }
});

/** Get all categories **/
router.get('/categories', [auth], async (req, res) => {
    const categories = await Categories.find({});
    res.render('admin/categories', {
        layout: 'admin',
        title: 'Add new category',
        isCategories: true,
        categories,
        error: req.flash('error')
    });
});

/** Create category **/
router.post('/categories', [auth], async (req, res) => {
    try {
        const { categories } = req.body;
        console.log('CAT', categories);
        const categoryItem = new Categories({
            name: categories,
            slug: slugger(categories)
        });

        await categoryItem.save();
        res.redirect('/admin/categories');
    } catch (e) {
        console.log(e);
    }
});

/** Update category **/
router.post('/categories/edit', [auth], async (req, res) => {
    try {
        const { id, name } = req.body;
        const payload = {
            name: name,
            slug: slugger(name)
        }

        const result = await Categories.findOneAndUpdate({ _id: id }, payload, { new: true });

        if (!result) {
            throw new Error(`can not find document with id ${ id }`);
        }
        res.status(200).json(result);
    } catch (e) {
        console.log(e);
    }
});

/** Remove category **/
router.post('/categories/remove', [auth], async (req, res) => {
    try {
        await Categories.deleteOne({
            _id: req.body.id
        });
        await Article.updateMany({$pull: { 'categories': req.body.id }});
        res.redirect('/admin/categories');
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
