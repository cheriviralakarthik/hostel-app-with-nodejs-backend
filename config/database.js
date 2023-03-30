const mongoose = require("mongoose");

const { MONGODB_URL } = process.env;

// connecting to the database using the url
exports.connect = () => {
  mongoose
    .connect(MONGODB_URL, {
      // these options are used for the new mongodb version
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("db connected successfully"))
    .catch((err) => {
      console.log(err);
      console.log("error in db connection");
      process.exit(1);
    });
};
