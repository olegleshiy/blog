// Instruments
const ArticleModel = require('../../models/article');

class Article {
    constructor(data) {
        this.models = {
            article: new ArticleModel(data),
        };
    }

    async create() {
        const data = await this.models.article.create();

        return data;
    }

    async getAll() {
        const data = await this.models.article.getAll();

        return data;
    }

    async getAllByPaginate() {
            const data = await this.models.article.getAllByPaginate();

            return data;
        }

    async getByHash() {
        const data = await this.models.article.getByHash();

        return data;
    }

    async updateByHash() {
        const data = await this.models.article.updateByHash();

        return data;
    }

    async updateByName() {
        const data = await this.models.article.updateByName();

        return data;
    }

    async removeByHash() {
        const data = await this.models.article.removeByHash();

        return data;
    }
}

module.exports = Article;