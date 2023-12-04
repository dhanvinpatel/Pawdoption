import {pets} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import helpers from '../helpers.js';

export async function createPet(creatorId, 
        name, 
        age, 
        gender, 
        breed, 
        description,
        typeOfAnimal,
        zip,
        picture,
        adoptionStatus) {
    name = helpers.checkString(name, "pet name");
    age = helpers.checkStringisNumber(age);
    gender = helpers.checkString(gender, "gender");  //implement as drop down menu
    breed = helpers.checkString(breed, "breed");  //implement as drop down menu
    description = helpers.checkString(description, "description");
    typeOfAnimal = helpers.checkString(typeOfAnimal, "typeOfAnimal");  //implement as drop down menu
    zip = helpers.checkZip(zip);
    // TODO: picture file validation 
    adoptionStatus = helpers.checkAdoptedStatus(adoptionStatus);

    const petCollection = await pets();

    let newPet = {
        _id : new ObjectId(),
        creatorId : creatorId,
        name : name, 
        age : age, 
        gender : gender, 
        breed : breed, 
        description : description,
        typeOfAnimal : typeOfAnimal,
        zip : zip,
        picture : picture,
        adoptionStatus : adoptionStatus,
        lastUpdated : new Date().toLocaleDateString(),
        comments : []
    };

    let insertInfo = await petCollection.insertOne(newPet);
    if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Error: could not add pet to database";
        
    return newPet;
};

export async function getAllPets() {
    const petsCollection = await pets();
    let petList = await petsCollection.find({}).toArray();
    if (!petList) throw "Error: Could not get all pets";

    return petList;
};

export async function getPetById(id) {
    id = helpers.checkId(id, "pet id");
    const petsCollection = await pets();
    const user = await petsCollection.findOne({ _id: id});
    if (!user) throw "Error: no pet with that id exist";

    return user;
};

export async function getPetByCreator(id) {
    id = helpers.checkId(id, "creator id");
    const petsCollection = await pets();
    //const pet = await petsCollection.find({ creatorId: id});
    let petList = await petsCollection.find({ creatorId: id}).toArray();

    if (!petList) throw "Error: no pet with that creator id exists";

    return petList;
};

export async function createComment(petId, userId, comment){
    petId = helpers.checkId(petId, "pet id");
    userId = helpers.checkId(userId, "user id");
    comment = helpers.checkString(comment, "comment");

    let newComment = {
        _id: new ObjectId(),
        userId: userId,
        commentContent: comment
    };

    const petsCollection = await pets();

    const updatedInfo = await petsCollection.updateOne(
        {_id: petId}, {$push: {comments: newComment}});

    if (!updatedInfo) {
        throw 'Error: could not create comment successfully';
    }
    return newComment;
};

export async function updatePet(id,
        name, 
        age, 
        gender, 
        breed, 
        description,
        typeOfAnimal,
        zip,
        picture,
        adoptionStatus) {   
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
        name : name, 
        age : age, 
        gender : gender, 
        breed : breed, 
        description : description,
        typeOfAnimal : typeOfAnimal,
        zip : zip,
        picture : picture,
        adoptionStatus : adoptionStatus,
        lastUpdated : new Date().toLocaleDateString()
    };

    const updatedInfo = await petsCollection.updateOne(
        {_id: id},
        {$set: setPet});

    if (!updatedInfo) {
        throw 'Error: could not update pet successfully';
    }

    return getPetById(id);
};

export async function removeComment(commentId) {
    commentId = helpers.checkId(commentId, "comment id");
    const petsCollection = await pets();

    const deletionInfo = await petsCollection.findOneAndUpdate(
        {"comments._id": commentId},
        {$pull: {comments: {_id: commentId}}},
        {returnDocument: "after"}
    );

    if (!deletionInfo) {
        throw `Error: Could not delete comment with id of ${commentId}`;
    }

    return deletionInfo;      
};

export async function getComment(commentId) {
    commentId = helpers.checkId(commentId, "comment id");
    const petsCollection = await pets();

    let petComment = await petsCollection.find({ "comments._id": commentId}).toArray();
    if (!petComment) {
        throw `Error: Could not get comment with id of ${commentId}`;
    }

    return petComment[0].comments[0];     
};