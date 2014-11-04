// can also contain host and port (default localhost / 27017)
var databaseUrl = 'cloud'; // "username:password@example.com/mydb"
var collections = ['media'];
var db = require('mongojs').connect(databaseUrl, collections);

module.exports = db;


