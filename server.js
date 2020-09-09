const express = require('express');
const path = require('path');
const csurf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');
const connectMongo = require('connect-mongo');
const { home,  auth, articles, admin } = require('./routes');
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const errorHandler = require('./middleware/error');
//const fileImage = require('./middleware/file');
const keys = require('./keys');

const app = express();

const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

//Instruments
app.engine('hbs', exphbs({
        defaultLayout: 'main',
        extname: 'hbs',
        handlebars: allowInsecurePrototypeAccess(Handlebars),
        helpers: require('./utils/hbs-helpers'),
    })
);
app.set('view engine', 'hbs');
app.set('views', 'views');

const MongoStore = connectMongo(session);
const sessionOptions = {
    key:               'user',
    secret:            keys.SESSION_SECRET,
    resave:            false,
    rolling:           true,
    saveUninitialized: false,
    store:             new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie:            {
        httpOnly: true,
        maxAge:   15 * 60 * 1000,
    },
};

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(
    bodyParser.json({
        //limit: '5kb',
        limit: '20mb',
    })
);
app.use(bodyParser.urlencoded({
    limit: '20mb',
    extended: false
}));

//Middleware
app.use(helmet());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionOptions));
//app.use(fileImage.single('banner'));
//app.use(csurf());
app.use(flash());

app.use(varMiddleware);
app.use(userMiddleware);

// Routs
app.use('/', home);
app.use('/articles', articles);
app.use('/admin', admin);
app.use('/auth', auth);

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

//Options mongoose connections
const mongooseOptions = {
    promiseLibrary:     global.Promise,
    poolSize:           10,
    keepAlive:          30000,
    connectTimeoutMS:   5000,
    useNewUrlParser:    true,
    useFindAndModify:   false,
    useCreateIndex:     true,
    useUnifiedTopology: true,
};

//Start server and connect DB
async function start() {
    try {
        await mongoose.connect(keys.MONGO_URI, mongooseOptions);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${ PORT }`);
        });
    } catch (e) {
        console.log(e);
    }
}
start();

