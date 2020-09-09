const {Schema, model} = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const fs = require('fs');

const optionsSchema = {
    timestamps: { createdAt: 'created', updatedAt: 'modified' },
};

const articleSchema = new Schema({
    title: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    img: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    },
    body: {
        type: String,
        trim: true,
        required: true
    },
    categories: [{
        type:     Schema.Types.ObjectId,
        ref:      "Categories",
        required: true,
    }],
    slug: {
        type: String,
        unique: true,
        required: true
    },
    meta: {
        title: {
            type: String,
            trim: true
        },
        keywords: {
            type: String,
            trim: true
        },
        descriptions: {
            type: String,
            trim: true
        },
    },
    date: {
        type: Date,
        default: Date.now(),
    }
}, optionsSchema);

articleSchema.plugin(mongoosePaginate);

articleSchema.post('findOneAndRemove', function(doc) {
    fs.unlink(doc.img, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Image REMOVED');
    });
});

articleSchema.pre('findOneAndUpdate', async function() {
    const docToUpdate = await this.model.findOne(this.getQuery()).select('img');

    fs.unlink(docToUpdate.img, (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log('REMOVED IMAGE BEFORE SAVE');
    });
});

// articleSchema.statics.publish = function publish (id, cb) {
//     return this.where('id', id).exec(cb);
// }

module.exports = model('Article', articleSchema);
