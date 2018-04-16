console.log('It is for separate database tests for the application');

const env = process.env.NODE_ENV || 'development';

console.log('1. process.env.*****', env);

if (env === 'development') {

    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/User-Profile-Data';

} else if (env === 'test') {

    process.env.PORT = 3000;
    process.env.MONGODB_URI = `mongodb://localhost:27017/User-Profile-Test`;

}
