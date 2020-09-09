const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const optionsSchema = {
    timestamps: { createdAt: 'created', updatedAt: 'modified' }
};

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase:true,
        required: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    role: {
        type: String,
        enum: ['moderator', 'admin', 'writer'],
        default: () => 'writer'
    },
    resetToken: String,
    resetTokenExp: Date,
}, optionsSchema);
userSchema.plugin(mongoosePaginate);

module.exports = model('User', userSchema);