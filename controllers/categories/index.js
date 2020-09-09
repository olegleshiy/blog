// Instruments
const CategoryModel = require('../../models/categories');

class Category {
    constructor(data) {
        this.models = {
            category: new CategoryModel(data),
        };
    }

    async create() {
        const data = await this.models.category.create();

        return data;
    }

    async getAll() {
        const data = await this.models.category.getAll();

        return data;
    }

    async getAllByPaginate() {
            const data = await this.models.category.getAllByPaginate();

            return data;
        }

    async getByHash() {
        const data = await this.models.category.getByHash();

        return data;
    }

    async updateByHash() {
        const data = await this.models.category.updateByHash();

        return data;
    }

    async updateByName() {
        const data = await this.models.category.updateByName();

        return data;
    }

    async removeByHash() {
        const data = await this.models.category.removeByHash();

        return data;
    }
}

module.exports = Category;