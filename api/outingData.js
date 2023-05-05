const { users, outings } = require("./mongoCollections");
const { ObjectId } = require("mongodb");

const validations = require("./validations");

const exportedMethods = {
  async initOuting(friend, currUser, userRole, friendRole, date) {
    let outingId = new ObjectId();
    let outingDocForCurrentUser = {
      id: outingId,
      role: userRole, // role of current user
      isFinalized: false,
      date: date,
      friend: {id: friend._id, username : friend.username},
      step1: {
          isFinalized: false,
          data: {}
      },
      step2: {
          isFinalized: false,
          data: {}
      },
      providerComment: '',
      approverComment: ''
    }

    let outingDocForFriend = {
      id: outingId,
      role: friendRole, // role of current user
      isFinalized: false,
      date: date,
      friend: {id: currUser._id, username : currUser.username},
      step1: {
          isFinalized: false,
          data: {}
      },
      step2: {
          isFinalized: false,
          data: {}
      },
      providerComment: '',
      approverComment: ''
    }

    let userCollection = await users();

    let userOutingsExists = await userCollection.findOne(
      { _id: currUser._id, outings: { $exists: true }}
    )

    let friendOutingsExists = await userCollection.findOne(
      { _id: friend._id, outings: { $exists: true }}
    )

    if(userOutingsExists){
      let dbinfo = await userCollection.updateOne(
        { _id: new ObjectId(currUser._id) },
        { $push: { outings: outingDocForCurrentUser } }
      );
      if(!dbinfo.acknowledged) throw new Error(`Error getting data into database`);
    }else{
      let dbinfo = await userCollection.updateOne(
        { _id: new ObjectId(currUser._id) },
        { $set: { outings: [outingDocForCurrentUser] } }
      )
      if(!dbinfo.acknowledged) throw new Error(`Error getting data into database`);
    }

    if(friendOutingsExists){
      let dbinfo = await userCollection.updateOne(
        { _id: new ObjectId(friend._id) },
        { $push: { outings: outingDocForFriend } }
      );
      if(!dbinfo.acknowledged) throw new Error(`Error getting data into database`);
    }else{
      let dbinfo = await userCollection.updateOne(
        { _id: new ObjectId(friend._id) },
        { $set: { outings: [outingDocForFriend] } }
      )
      if(!dbinfo.acknowledged) throw new Error(`Error getting data into database`);
    }
    return { inserted: true };
  },

  async getAllOutings(user) {
    try{
      let userCollection = await users();
      let userOutings = await userCollection.findOne(
        { _id: user._id, outings: { $exists: true }}
      )
      let outings = []
      if(userOutings) outings = userOutings.outings
      return { outings: outings};
    }catch(e){
      throw new Error(`Unable to get outings`);
    }
  },

  async getOutingById(user, outingId) {
    try{
      let userCollection = await users();
      let userOutings = await userCollection.findOne(
        { _id: user._id, outings: { $exists: true }}
      )
      let outings = []
      if(userOutings) {
        let allOutings = userOutings.outings;
        outings = userOutings.outings.filter(outing => outing.id == outingId);
      }

      return { outings: outings};
    }catch(e){
      throw new Error(`Unable to get outings`);
    }
  },

  async updateOuting(user, outingData) {
    try{
      let userCollection = await users();
      let userOutings = await userCollection.findOne(
        { _id: user._id, outings: { $exists: true }}
      )
      if(!userOutings) return {"message": "No outings found!"}
      let existing_outing = userOutings.outings.filter(outing => outing.id == outingData.outingId)[0];

      let new_outing = {
        ...outingData.data,
        role: existing_outing.role,
        friend: existing_outing.friend
      }

      userOutings = userOutings.outings.filter(outing => outing.id != outingData.outingId);
      userOutings.push(new_outing);

      let dbinfo = await userCollection.updateOne(
        { _id: new ObjectId(user._id) },
        { $set: { outings: userOutings } }
      )
      if(!dbinfo.acknowledged) throw new Error(`Error updating outings`);

      let friendOutings = await userCollection.findOne(
        { _id: existing_outing.friend.id, outings: { $exists: true }}
      )

      if(!friendOutings) return {"message": "No Friend outings found!"}

      let existing_frd_outing = friendOutings.outings.filter(outing => outing.id == outingData.outingId)[0];

      let new_frd_outing = {
        ...outingData.data,
        role: existing_frd_outing.role,
        friend: existing_frd_outing.friend
      }

      friendOutings = friendOutings.outings.filter(outing => outing.id != outingData.outingId);
      friendOutings.push(new_frd_outing);

      let frddbinfo = await userCollection.updateOne(
        { _id: new ObjectId(existing_outing.friend.id) },
        { $set: { outings: friendOutings } }
      )
      if(!frddbinfo.acknowledged) throw new Error(`Error updating friend outings`);

      return { "message": "Outing successfully updated!"};
    }catch(e){
      throw new Error(`Unable to get outings`);
    }
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
