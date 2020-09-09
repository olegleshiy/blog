const { Router } = require('express');
const Article = require('../models/article');
const Categories = require('../models/categories');
const router = Router();
const getItems = require('../utils/getWithPagination');
const slugger = require('../utils/slugger');


router.get('/', async (req, res) => {

    try {
        let categories = await Categories.find({});
        req.query.limit = 3;
        const articles = await getItems(req, Article, {status: true}, 'categories');

        categories.forEach(el => {
            el.link = slugger(el.name);
        })

        res.render('articles', {
            layout: 'main',
            title: 'Articles',
            isArticles: true,
            currentPage: articles.page,
            pageCount:  articles.totalPages,
            size: articles.totalDocs,
            hasPrevPage: articles.hasPrevPage,
            hasNextPage: articles.hasNextPage,
            nextPage: articles.nextPage,
            prevPage: articles.prevPage,
            articles: articles.docs,
            categories,
            isPreview: req.session.user ? true : false
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:slug', async (req, res) => {

    try {
        const article = await Article.findOne({slug: req.params.slug}).populate('categories');
        res.render('article', {
            layout: 'main',
            title: `${ article.meta.title }`,
            article,
            body: article.body,
            date: article.date,
            isPreview: req.query.preview
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/category/:slug', async (req, res) => {
    try {
        const categories = await Categories.find({}).select('-__v');
        const category = await Categories.findOne({slug: req.params.slug}).populate('articles');

        res.render('articles', {
            layout: 'main',
            title: 'Articles',
            isArticles: true,
            articles: category.articles,
            categories
        });
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;
