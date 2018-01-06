var dbName = 'cloud';
var databaseUrl = process.env.OPENSHIFT_MONGODB_DB_URL || 'mongodb://127.0.0.1:27017/';
var collections = ['media'];
var db = require('mongojs').connect(databaseUrl + '' + dbName, collections);

module.exports = db;


