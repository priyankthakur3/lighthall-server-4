const { ObjectId } = require("mongodb");
const { users } = require("./mongoCollections");
const validations = require("./validations");
const bcrypt = require("bcrypt");
const passwordEncryptRounds = 10;

const exportedMethods = {
  async createUser(username, password) {
    username = validations.isStringName(username, "User Name");
    password = validations.checkString(password, "Password");
    let hashpassword = await bcrypt.hash(password, passwordEncryptRounds);
    const usersCollection = await users();
    let newUser = {
      username,
      password: hashpassword,
      friends: [],
      sendRequest: [],
      receivedRequest: [],
    };
    let userInsertedInfo = await usersCollection.insertOne(newUser);
    if (!userInsertedInfo.acknowledged || !userInsertedInfo.insertedId)
      throw new Error(`Could not Create User`);

    return {
      usercreated: true,
    };
  },

  async checkUser(username, password) {
    username = validations.isStringName(username, "User Name");
    password = validations.checkString(password);
    const usersCollection = await users();

    let dbUser = await usersCollection.findOne(
      { username },
      { projection: { _id: 1, username: 1, password: 1 } }
    );
    if (!dbUser) throw new Error(`Either email or password is invalid`);

    if (!(await bcrypt.compare(password, dbUser.password)))
      throw new Error(`Either email or password is invalid`);
    return {
      _id: dbUser._id.toString(),
      username: dbUser.username,
    };
  },

  async checkIfUserExists(username) {
    username = validations.isStringName(username, "User Name");

    const usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { username },
      { projection: { _id: 1, username: 1 } }
    );
    if (dbUser) return true;
    return false;
  },

  async getUser(userid) {
    userid = validations.checkId(userid, "User ID");
    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { password: 0 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);
    return dbUser;
  },

  async getFriends(userid) {
    userid = validations.checkId(userid, "User ID");
    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { _id: 1, username: 1, friends: 1 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);
    return dbUser.friends;
  },

  async addFriend(userid, friendid) {
    userid = validations.checkId(userid, "User ID");
    friendid = validations.checkId(userid, "User ID");

    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);

    let friendUser = await usersCollection.findOne(
      { _id: new ObjectId(friendid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!friendUser) throw new Error(`No User Exists for ID ${friendid}`);

    let dbUserInfo = await usersCollection.updateOne(
      {
        _id: new ObjectId(userid),
      },
      {
        $push: { friends: friendid },
        $pull: { receivedRequest: friendid },
      }
    );
    if (!dbUserInfo.acknowledged) throw new Error(`Error Creating new Game`);
    return { inserted: true };
  },

  async removeFriend(userid, friendid) {
    userid = validations.checkId(userid, "User ID");
    friendid = validations.checkId(userid, "User ID");

    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);

    let friendUser = await usersCollection.findOne(
      { _id: new ObjectId(friendid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!friendUser) throw new Error(`No User Exists for ID ${friendid}`);

    let dbUserInfo = await usersCollection.updateOne(
      {
        _id: new ObjectId(userid),
      },
      {
        $pul: { friends: friendid },
      }
    );

    if (!dbUserInfo.acknowledged) throw new Error(`Error Removing User`);

    return { removed: true };
  },

  async addSendFriendRequest(userid, friendid) {
    userid = validations.checkId(userid, "User ID");
    friendid = validations.checkId(userid, "User ID");

    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);

    let friendUser = await usersCollection.findOne(
      { _id: new ObjectId(friendid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!friendUser) throw new Error(`No User Exists for ID ${friendid}`);

    let dbUserInfo = await usersCollection.updateOne(
      {
        _id: new ObjectId(userid),
      },
      {
        $push: { sendRequest: friendid },
      }
    );
    if (!dbUserInfo.acknowledged) throw new Error(`Error Creating new Game`);
    return { inserted: true };
  },

  async removeSendFriendRequest(userid, friendid) {
    userid = validations.checkId(userid, "User ID");
    friendid = validations.checkId(userid, "User ID");

    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);

    let friendUser = await usersCollection.findOne(
      { _id: new ObjectId(friendid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!friendUser) throw new Error(`No User Exists for ID ${friendid}`);

    let dbUserInfo = await usersCollection.updateOne(
      {
        _id: new ObjectId(userid),
      },
      {
        $pull: { sendRequest: friendid },
      }
    );
    if (!dbUserInfo.acknowledged) throw new Error(`Error Creating new Game`);
    return { removed: true };
  },
};

module.exports = exportedMethods;
