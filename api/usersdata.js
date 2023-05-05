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
      sentRequest: [],
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
      {
        projection: {
          _id: 1,
          username: 1,
          friends: 1,
          sentRequest: 1,
          receivedRequest: 1,
        },
      }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);

    let friendArr = dbUser.friends;
    let sendArr = dbUser.sentRequest;
    let receivedArr = dbUser.receivedRequest;

    if (friendArr.length > 0)
      for (let i = 0; i < friendArr.length; i++) {
        friendArr[i] = new ObjectId(friendArr[i]);
      }

    if (sendArr.length > 0)
      for (let i = 0; i < sendArr.length; i++) {
        sendArr[i] = new ObjectId(sendArr[i]);
      }

    if (receivedArr.length > 0)
      for (let i = 0; i < receivedArr.length; i++) {
        receivedArr[i] = new ObjectId(receivedArr[i]);
      }
    let friendsList = await usersCollection
      .find(
        { _id: { $in: friendArr } },
        { projection: { _id: 1, username: 1 } }
      )
      .toArray();
    let sendList = await usersCollection
      .find({ _id: { $in: sendArr } }, { projection: { _id: 1, username: 1 } })
      .toArray();
    let receivedList = await usersCollection
      .find(
        { _id: { $in: receivedArr } },
        { projection: { _id: 1, username: 1 } }
      )
      .toArray();

    return {
      friends: friendsList,
      receivedRequest: receivedList,
      sentRequest: sendList,
    };
  },

  async addFriend(userid, friendusername) {
    userid = validations.checkId(userid, "User ID");
    friendusername = validations.checkString(friendusername, "User Name");

    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);

    let friendUser = await usersCollection.findOne(
      { username: friendusername },
      { projection: { _id: 1, username: 1 } }
    );
    if (!friendUser) throw new Error(`No User Exists for ID ${friendid}`);

    let dbFriendUserInfo = await usersCollection.updateOne(
      {
        username: friendusername,
      },
      {
        $push: { friends: dbUser._id.toString() },
        $pull: {
          receivedRequest: dbUser._id.toString(),
          sentRequest: dbUser._id.toString(),
        },
        $pull: {},
      }
    );
    if (!dbFriendUserInfo.acknowledged) throw new Error(`Error`);

    let dbCurrentUserInfo = await usersCollection.updateOne(
      {
        _id: new ObjectId(userid),
      },
      {
        $push: { friends: friendUser._id.toString() },
        $pull: {
          receivedRequest: friendUser._id.toString(),
          sentRequest: friendUser._id.toString(),
        },
      }
    );
    if (!dbCurrentUserInfo.acknowledged) throw new Error(`Error`);
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

  async addSendFriendRequest(userid, friendusername) {
    userid = validations.checkId(userid, "User ID");
    friendusername = validations.checkString(friendusername, "User ID");

    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);

    let friendUser = await usersCollection.findOne(
      { username: friendusername },
      { projection: { _id: 1, username: 1 } }
    );
    if (!friendUser)
      throw new Error(`No User Exists for username ${friendusername}`);
    if (userid === friendUser._id)
      throw new Error(`You cannot send friend Request to self`);
    let dbUserInfo = await usersCollection.updateOne(
      {
        _id: new ObjectId(userid),
      },
      {
        $push: { sentRequest: friendUser._id.toString() },
      }
    );
    if (!dbUserInfo.acknowledged) throw new Error(`Error Creating new Game`);

    let dbUserFriendInfo = await usersCollection.updateOne(
      {
        username: friendusername,
      },
      {
        $push: { receivedRequest: userid },
      }
    );
    if (!dbUserFriendInfo.acknowledged)
      throw new Error(`Error Creating new Game`);
    return { requestSent: true };
  },

  async removeSendFriendRequest(userid, friendusername) {
    userid = validations.checkId(userid, "User ID");
    friendusername = validations.checkString(friendusername, "Friend name");

    let usersCollection = await users();
    let dbUser = await usersCollection.findOne(
      { _id: new ObjectId(userid) },
      { projection: { _id: 1, username: 1 } }
    );
    if (!dbUser) throw new Error(`No User Exists for ID ${userid}`);

    let friendUser = await usersCollection.findOne(
      { username: friendusername },
      { projection: { _id: 1, username: 1 } }
    );
    if (!friendUser) throw new Error(`No User Exists for ID ${friendid}`);

    let dbUserInfo = await usersCollection.updateOne(
      {
        _id: new ObjectId(userid),
      },
      {
        $pull: {
          receivedRequest: friendUser._id.toString(),
          sentRequest: friendUser._id.toString(),
        },
      }
    );
    if (!dbUserInfo.acknowledged) throw new Error(`Error Creating new Game`);

    let dbFriendUserInfo = await usersCollection.updateOne(
      {
        _id: friendUser._id,
      },
      {
        $pull: {
          receivedRequest: dbUser._id.toString(),
          sentRequest: dbUser._id.toString(),
        },
      }
    );
    if (!dbFriendUserInfo.acknowledged)
      throw new Error(`Error Creating new Game`);

    return { removed: true };
  },
};

module.exports = exportedMethods;
