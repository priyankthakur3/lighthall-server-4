const { users, outings } = require("./mongoCollections");
const { ObjectId } = require("mongodb");

const validations = require("./validations");

const exportedMethods = {
  async initOuting(creatorUserID, friendUserID, creatorUserRole, friendRole) {
    creatorUserID = validations.checkId(creatorUserID);
    friendUserID = validations.checkId(friendUserID);

    let outingDoc = {
      _id: new ObjectId(),
      creatorUserID,
      isFinalized: false,
      friendUserID,
      creatorUserRole,
      friendRole,
      logs: [],
      providerComment: "",
      approverComment: "",
    };
    let outingCollections = await outings();

    let dbinfo = await outingCollections.insertOne(outingDoc);
    if (!dbinfo.acknowledged)
      throw new Error(`Error getting data into database`);
    return { inserted: true, outingID: outingDoc._id.toString() };
  },

  async addLogs(id, data) {
    id = validations.checkId(id, "Collection ID");
    let outingCollections = await outings();

    if (data && typeof data !== "object")
      throw new Error(`Error: Expected object`);
    let dbinfo = await outingCollections.updateOne(
      { _id: new ObjectId(id) },
      { $push: { logs: data } }
    );
    if (!dbinfo.acknowledged)
      throw new Error(`Error getting data into database`);
    return { inserted: true, outingID: outingDoc._id.toString() };
  },

  async delete(id) {
    id = validations.checkId(id);
    let outingCollections = await outings();
    let outing = await outingCollections.findOne({ _id: new ObjectId(id) });
    if (!outing) throw new Error("No Word exists for ID");

    let deleteinfo = outing.deleteOne({ _id: new ObjectId(id) });

    if (!deleteinfo.acknowledged)
      throw new Error(`Error getting data into database`);

    return { deleted: true };
  },

  async getByID(id) {
    id = validations.checkId(id);
    let outingCollections = await outings();
    let usersCollection = await users();

    let outing = await outingCollections.findOne({ _id: new ObjectId(id) });
    if (!outing) throw new Error("No Word exists for ID");

    let user = await usersCollection.findOne(
      {
        _id: new ObjectId(outing.creatorUserID),
      },
      { projection: { _id: 1, name: 1 } }
    );
    if (!user) throw new Error("No User exists for ID");
    user._id = user._id.toString();
    outing.creator = user;

    user = await usersCollection.findOne(
      {
        _id: new ObjectId(outing.friendUserID),
      },
      { projection: { _id: 1, name: 1 } }
    );
    if (!user) throw new Error("No User exists for ID");
    user._id = user._id.toString();
    outing.friend = user;

    return outing;
  },
};

module.exports = exportedMethods;
