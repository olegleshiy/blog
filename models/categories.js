const {Schema, model} = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const optionsSchema = {
    timestamps: { createdAt: 'created', updatedAt: 'modified' },
};

const categoriesSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    slug: {
        type: String,
        trim: true
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: "Article"
    }]
}, optionsSchema);
categoriesSchema.plugin(mongoosePaginate);

module.exports = model('Categories', categoriesSchema);
