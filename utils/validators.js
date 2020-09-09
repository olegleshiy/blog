const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.registerValidators = [
    body('email', 'Enter correct email')
        .isEmail()
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value });
                if (user) {
                    return Promise.reject('Email already exists');
                }
            } catch (e) {
                console.log(e);
            }
        })
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password should be min 6 characters')
        .isLength({ max: 60 }).withMessage('Password should be max 60 characters')
        .trim(),
    body('confirm')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords should be match');
            }
            return true;
        })
        .trim(),
    body('name', 'Name should be min 2 characters')
        .isLength({ min: 3 })
        .trim()
];

exports.loginValidators = [
    body('email', 'Enter correct email')
        .isEmail()
        .custom(async (value, { req }) => {
            try {
                const user = await User.findOne({ email: value });
                if (!user) {
                    return Promise.reject('Credentials are not valid');
                }
            } catch (e) {
                console.log(e);
            }
        }),
    body('password')
        .custom(async (value, { req }) => {
            try {
                const { email } = req.body;
                const candidate = await User.findOne({ email: email });

                if (candidate) {
                    const areSame = await bcrypt.compare(value, candidate.password);

                    if (areSame) {
                        req.session.user = candidate;
                        req.session.isAuthenticated = true;
                        req.session.save(err => {
                            if (err) {
                                throw err;
                            }
                        });
                    } else {
                        return Promise.reject('Credentials are not valid');
                    }
                } else {
                    return Promise.reject('Credentials are not valid');
                }
            } catch (e) {
                console.log(e);
            }
        })
];

exports.articleValidators = [
    body('title', 'Length name should be min 3 and max 100 characters')
        .isLength({ min: 3, max: 100 })
        .trim(),
    body('description', 'Length description should be min 3 and max 150 characters')
        .isLength({ min: 3, max: 150 })
        .trim(),
    body('metatitle', 'Meta title should be min 2 and max 70 characters')
        .isLength({ min: 3, max: 70 })
        .trim(),
    body('metakeywords', 'Meta keywords should be min 2 and max 60 characters')
        .isLength({ min: 3, max: 60 })
        .trim(),
    body('metadescription', 'Meta description should be min 2 and max 160 characters')
        .isLength({ min: 3, max: 160 })
        .trim(),
];