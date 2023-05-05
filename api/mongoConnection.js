const MongoClient = require("mongodb").MongoClient;
let _connection = undefined;
let _db = undefined;
module.exports = {
  dbConnection: async () => {
    if (!_connection) {
      try {
        _connection = await MongoClient.connect(process.env.MONGODB_URI);
        _db = _connection.db();
      } catch (error) {
        console.log(error);
      }
    }
    return _db;
  },
  closeConnection: () => {
    _connection.close();
  },
};
