import { pets } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import helpers from "../helpers.js";
import userFn from "./users.js";

const exportedMethods = {
  async createPet(
    creatorId,
    name,
    age,
    gender,
    breed,
    description,
    typeOfAnimal,
    zip,
    picture,
    adoptionStatus
  ) {
    name = helpers.checkString(name, "pet name");
    age = helpers.checkStringisNumber(age);
    gender = helpers.checkString(gender, "gender"); //implement as drop down menu
    breed = helpers.checkString(breed, "breed"); //implement as drop down menu
    description = helpers.checkString(description, "description");
    typeOfAnimal = helpers.checkString(typeOfAnimal, "typeOfAnimal"); //implement as drop down menu
    zip = helpers.checkZip(zip);
    // TODO: picture file validation
    adoptionStatus = helpers.checkAdoptedStatus(adoptionStatus);
    picture = '\\' + picture;

    const petCollection = await pets();

    let newPet = {
      _id: new ObjectId(),
      creatorId: creatorId,
      name: name,
      age: age,
      gender: gender,
      breed: breed,
      description: description,
      typeOfAnimal: typeOfAnimal,
      zip: zip,
      picture: picture,
      adoptionStatus: adoptionStatus,
      lastUpdated: new Date().toLocaleDateString(),
      comments: [],
    };

    let insertInfo = await petCollection.insertOne(newPet);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
      throw "Error: could not add pet to database";

    return newPet;
  },

  async getAllPets() {
    const petsCollection = await pets();
    let petList = await petsCollection.find({}).toArray();
    if (!petList) throw "Error: Could not get all pets";

    return petList;
  },

  async getPetById(id) {
    id = helpers.checkId(id, "pet id");
    const petsCollection = await pets();
    const user = await petsCollection.findOne({ _id: new ObjectId(id) });
    if (!user) throw "Error: no pet with that id exist";

    return user;
  },

  async getPetByCreator(id) {
    id = helpers.checkId(id, "creator id");
    const petsCollection = await pets();
    const pet = await petsCollection.findOne({ creatorId: new ObjectId(id) });
    if (!pet) throw "Error: no pet with that id exist";

    return pet;
  },

  async createComment(petId, userId, comment) {
    petId = helpers.checkId(petId, "pet id");
    userId = helpers.checkId(userId, "user id");
    comment = helpers.checkString(comment, "comment");

    let userName = await userFn.getUserById(userId)

    let newComment = {
      _id: new ObjectId(),
      userId: userId,
      userName: userName.firstName + " " + userName.lastName,
      commentContent: comment,
    };

    const petsCollection = await pets();

    const updatedInfo = await petsCollection.updateOne(
      { _id: new ObjectId(petId) },
      { $push: { comments: newComment } }
    );

    if (!updatedInfo) {
      throw "Error: could not create comment successfully";
    }

    return { commentId: newComment._id };
  },

  async updatePet(
    id,
    name,
    age,
    gender,
    breed,
    description,
    typeOfAnimal,
    zip,
    picture,
    adoptionStatus
  ) {
    name = helpers.checkString(name, "pet name");
    age = helpers.checkStringisNumber(age);
    gender = helpers.checkString(gender, "gender");
    breed = helpers.checkString(breed, "breed");
    description = helpers.checkString(description, "description");
    typeOfAnimal = helpers.checkString(typeOfAnimal, "typeOfAnimal");
    zip = helpers.checkZip(zip);
    // TODO: picture file validation
    adoptionStatus = helpers.checkAdoptedStatus(adoptionStatus);

    const petsCollection = await pets();

    let setPet = {
      name: name,
      age: age,
      gender: gender,
      breed: breed,
      description: description,
      typeOfAnimal: typeOfAnimal,
      zip: zip,
      picture: picture,
      adoptionStatus: adoptionStatus,
      lastUpdated: new Date().toLocaleDateString(),
    };

    const updatedInfo = await petsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: setPet }
    );

    if (!updatedInfo) {
      throw "Error: could not update pet successfully";
    }

    return getPetById(id);
  },

  // method to delete pet need to make changes
//   async remove(eventId) {
//     if (!eventId) throw "You must provide an id to search for";
//     if (typeof eventId !== "string") throw "Id must be a string";
//     if (eventId.trim().length === 0)
//       throw "id cannot be an empty string or just spaces";
//     eventId = eventId.trim();
//     if (!ObjectId.isValid(eventId)) throw "invalid object ID";
//     const eventCollection = await events();
//     const deletionInfo = await eventCollection.findOneAndDelete({
//       _id: new ObjectId(eventId),
//     });

//     if (!deletionInfo) {
//       throw `Could not delete event with id of ${eventId}`;
//     }

//     return {
//       eventName: deletionInfo.eventName,
//       deleted: true,
//     };
//   },

  async removeComment(commentId) {
    commentId = helpers.checkId(commentId, "comment id");
    const petsCollection = await pets();

    const deletionInfo = await petsCollection.findOneAndUpdate(
      { "comments._id": commentId },
      { $pull: { comments: { _id: commentId } } },
      { returnDocument: "after" }
    );

    if (!deletionInfo) {
      throw `Error: Could not delete comment with id of ${commentId}`;
    }

    return deletionInfo;
  },
};

export default exportedMethods;