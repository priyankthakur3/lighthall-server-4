const { users, words } = require("./mongoCollections");
const { ObjectId } = require("mongodb");

const validations = require("./validations");

const exportedMethods = {
  async initWords(wordsList) {
    let science = [
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
      "Astronomy",
      "Geology",
      "Ecology",
      "Zoology",
      "Botany",
      "Genetics",
      "Neuroscience",
      "Microbiology",
      "Paleontology",
      "Meteorology",
      "Oceanography",
      // "Computer Science",
      "Engineering",
      // "Materials Science",
      // "Environmental Science",
      // "Social Science",
    ];
    let cities = [
      "New York",
      "London",
      "Paris",
      "Tokyo",
      "Sydney",
      "Beijing",
      "Dubai",
      "Mumbai",
      // "Rio de Janeiro",
      "Moscow",
      "Cairo",
      // "Los Angeles",
      "Berlin",
      "Madrid",
      "Rome",
      "Bangkok",
      "Toronto",
      "Istanbul",
      "Singapore",
      "Amsterdam",
    ];
    let initVegtablesWords = [
      "Carrot",
      "Tomato",
      "Potato",
      "Onion",
      "Broccoli",
      "Cauliflower",
      "Cabbage",
      "Lettuce",
      "Spinach",
      "Peppers",
      "Squash",
      "Zucchini",
      "Eggplant",
      "Radish",
      "Celery",
      "Kale",
      "Corn",
      "Artichoke",
      "Pumpkin",
      "Asparagus",
      // "Green beans",
      // "Brussels sprouts",
      "Cucumber",
      "Beets",
      "Garlic",
    ];
    let initMovies = [
      // "The Godfather",
      // "Star Wars",
      // "The Shawshank Redemption",
      // "The Dark Knight",
      // "Forrest Gump",
      "Titanic",
      // "Jurassic Park",
      // "The Lion King",
      // "Pulp Fiction",
      // "The Matrix",
      "Goodfellas",
      // "The Silence of the Lambs",
      // "Saving Private Ryan",
      // "Fight Club",
      // "The Lord of the Rings",
      // "The Avengers",
      // "The Terminator",
      // "Back to the Future",
      "Jaws",
      // "E.T. the Extra-Terrestrial",
      "Ghostbusters",
      // "Die Hard",
      // "Indiana Jones and the Raiders of the Lost Ark",
      "Rocky",
      // "The Exorcist",
      "Alien",
      // "Blade Runner",
    ];

    let insertDocuments = [];

    initVegtablesWords.forEach((word) =>
      insertDocuments.push({ _id: new ObjectId(), topic: "Vegetables", word })
    );
    cities.forEach((word) =>
      insertDocuments.push({ _id: new ObjectId(), topic: "Cities", word })
    );

    science.forEach((word) =>
      insertDocuments.push({ _id: new ObjectId(), topic: "science", word })
    );

    initMovies.forEach((word) =>
      insertDocuments.push({ _id: new ObjectId(), topic: "Movies", word })
    );

    let wordsCollection = await words();

    let dbinfo = await wordsCollection.insertMany(insertDocuments);
    if (!dbinfo.acknowledged)
      throw new Error(`Error getting data into database`);
    return { inserted: true, insertCount: dbinfo.insertedCount };
  },

  async getTopics() {
    let wordsCollection = await words();
    let uniqueTopics = await wordsCollection.distinct("topic");
    return uniqueTopics;
  },

  async getByID(id) {
    id = validations.checkId(id);
    let wordsCollection = await words();

    let word = await wordsCollection.findOne({ _id: new ObjectId(id) });
    if (!word) throw new Error("No Word exists for ID");

    word.word = word.word.toLowerCase();
    return word;
  },

  async getRandomWord() {
    const min = 1;
    let wordsCollection = await words();
    const wordsCount = await wordsCollection.count();

    let randomNumber = Math.floor(Math.random() * (wordsCount - min + 1)) + min;

    let randomWord = await wordsCollection
      .find({})
      .skip(randomNumber % wordsCount)
      .limit(1)
      .toArray();
    return randomWord[0];
  },

  async pushWord(word) {
    word = validations.checkString(word);
    let wordsCollection = await words();
    let wordsExists = await wordsCollection.findOne({ word });

    if (wordsExists) return { id: wordsExists._id.toString() };
    else {
      let newWordDoc = { _id: new ObjectId(), word: word };
      let newWordinfo = await wordsCollection.insertOne(newWordDoc);
      if (!newWordinfo.acknowledged) throw new Error(`Error creating new word`);

      return { id: newWordDoc._id.toString() };
    }
  },

  async getTopicWord(topic) {
    let wordsCollection = await words();
    const min = 1;

    let wordsList = await wordsCollection
      .find({
        topic: { $regex: new RegExp(`^${topic}$`, "i") },
      })
      .toArray();
    let randomNumber =
      Math.floor(Math.random() * (wordsList.length - min + 1)) + min;

    return wordsList[randomNumber % wordsList.length];
  },
};

module.exports = exportedMethods;
