//middleware for the authentification check

const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  //getting the data from the header
  const token = req.header("Authorization").replace("Bearer ", "");

  //checking wheather the token is there or not
  if (!token) {
    res.status(401).send("please authenticate");
  }

  try {
    //verifying the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    console.log(decoded);
    //checking wheather the user id is same or not
    if (decoded.user_id != req.body.id) {
      res.status(401).send("please authenticate");
    } else {
      //if the user id is same then we will move to the next middleware
      return next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).send("please authenticate");
  }
  //if the token is there then we will move to the next middleware
};

module.exports = auth;
