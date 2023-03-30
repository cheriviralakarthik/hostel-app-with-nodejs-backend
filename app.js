require("dotenv").config();
express = require("express");
require("./config/database").connect();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const usertest = require("./models/usertest");
var cors = require("cors");

//creating the server
app = express();

//adding the json middleware
app.use(express.json());

var coroptions = {
  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Methods": "POST, PUT, PATCH, GET, DELETE, OPTIONS",

  "Access-Control-Allow-Headers": "*",
};

app.use(cors());

//adding the morgan middleware for query time
app.use(morgan("tiny"));

//home route
app.get("/", (req, res) => {
  res.send("hello world");
});

//register route
app.post("/register", async (req, res) => {
  try {
    //Getting the information from the user

    const { email, password } = req.body;

    // checking wheather fields are there or not in requested body

    if (!(email && password)) {
      res.status(401).send("Fill all the fields compulsory");
    }

    //checking the user in database wheather registered or not

    const existinguser = await usertest.findOne({ email });

    if (existinguser) {
      res.status(401).send("user already existed");
    }

    // encrpting the password
    const encryptedpassword = await bcrypt.hash(password, 10);

    // creating the user in the database
    const cuser = await usertest.create({
      email: email.toLowerCase(),
      password: encryptedpassword,
    });

    //creating or signing the jwt token
    const token = await jwt.sign(
      { cuser_id: cuser._id, email },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    const result = {
      token: token,
      id: cuser._id,
    };
    //sending the token to the frontend
    res.status(201).json(result);
  } catch (error) {
    console.log("error in register route ");
    console.log(error);
  }
});

//login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(401).send("enter the fileds ");
    }

    const exists = await usertest.findOne({ email });

    if (exists && (await bcrypt.compare(password, exists.password))) {
      const token = await jwt.sign(
        { user_id: exists._id, email },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      //sending the token to the frontend
      const result = {
        token: token,
        id: exists._id,
      };
      //sending the token to the frontend
      res.status(201).json(result);
    } else {
      res.status(401).send("check the email or password correctly");
    }
  } catch (error) {
    console.log(error);
    console.log("error in login");
  }
});

//dashboard route
app.post("/dashboard", auth, (req, res) => {
  res.send("dashboard accessed successfully");
});

//getting floors
app.post("/getfloors", async (req, res) => {
  //getting params from the frontend
  const { id } = req.body;
  try {
    const user = await usertest.findOne({ _id: id });
    const arr = [];
    if (user) {
      for (let i in user.floors) {
        arr.push(user.floors[i]["floorno"]);
      }
    }
    res.status(200).send(arr);
  } catch (error) {
    console.log(error);
    res.status(500).send("error in getting floors");
  }
});

//adding floors
app.post("/addfloor", async (req, res) => {
  //getting params from the frontend
  const { id, floorno } = req.body;
  var floor = {
    floorno: floorno,
  };
  try {
    const user = await usertest.updateOne(
      {
        _id: id,
      },
      {
        $push: {
          floors: floor,
        },
      }
    );
    if (user.acknowledged) {
      res.status(200).send("floor added successfully");
    } else {
      res.status(500).send("error in adding floor");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("error in adding floor");
  }
});

//getting rooms
app.post("/getrooms", async (req, res) => {
  const { id, floorno } = req.body;

  try {
    const user = await usertest.findOne({ _id: id });
    const result = [];

    if (user) {
      const arr = user.floors.filter((floor) => floor.floorno == floorno)[0]
        .rooms;
      for (let i in arr) {
        result.push(arr[i].roomno);
      }
      res.status(200).send(result);
    } else {
      res.status(500).send("error in getting rooms");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("error in getting rooms");
  }
});

//adding rooms
app.post("/addroom", async (req, res) => {
  const { id, floorno, roomno, capacity } = req.body;
  var room = {
    roomno: roomno,
    capacity: capacity,
  };
  try {
    const user = await usertest.updateOne(
      {
        _id: id,
        "floors.floorno": floorno,
      },
      {
        $push: {
          "floors.$.rooms": room,
        },
      }
    );
    if (user.acknowledged) {
      res.status(200).send("room added successfully");
    } else {
      res.status(500).send("error in adding room");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("error in adding room");
  }
});

//getting beds
app.post("/getbeds", async (req, res) => {
  const { id, floorno, roomno } = req.body;
  try {
    const user = await usertest.findOne({ _id: id });
    const result = [];

    if (user) {
      const arr = user.floors.filter((floor) => floor.floorno == floorno)[0]
        .rooms;
      const arr1 = arr.filter((room) => room.roomno == roomno)[0].beds;
      for (let i in arr1) {
        result.push(arr1[i].bedno);
      }
      res.status(200).send(result);
    } else {
      res.status(500).send("error in getting beds");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("error in getting beds");
  }
});

//adding beds
app.post("/addbed", async (req, res) => {
  const {
    id,
    floorno,
    roomno,
    bedno,
    name,
    address,
    aadhar,
    amountpaid,
    typeofamountpaid,
  } = req.body;
  bed = {
    bedno: bedno,
    name: name,
    address: address,
    aadhar: aadhar,
    amountpaid: amountpaid,
    typeofamountpaid: typeofamountpaid,
  };

  try {
    const user = await usertest.findOne({ _id: id });

    if (user) {
      const room = user.floors
        .filter((floor) => floor.floorno == floorno)[0]
        .rooms.filter((room) => room.roomno == roomno)[0];

      var responcecapacity = room.capacity;
    } else {
      res.status(500).send("error in adding bed");
    }

    if (responcecapacity - 1 > 0) {
      const responce = await usertest.updateOne(
        {
          _id: id,
        },
        {
          $push: {
            "floors.$[i].rooms.$[j].beds": bed,
          },
        },
        {
          arrayFilters: [
            {
              "i.floorno": floorno,
            },
            {
              "j.roomno": roomno,
            },
          ],
        }
      );
      if (responce.acknowledged) {
        const user = await usertest.updateOne(
          {
            _id: id,
          },
          {
            $set: { "floors.$[i].rooms.$[j].capacity": responcecapacity - 1 },
          },
          {
            arrayFilters: [
              {
                "i.floorno": floorno,
              },
              {
                "j.roomno": roomno,
              },
            ],
          }
        );
        if (user.acknowledged) {
          res.status(200).send("bed added ,capacity updated successfully");
        } else {
          res.status(500).send("error in capacity update");
        }
      } else {
        res.status(500).send("error in adding room");
      }
    } else {
      res.status(500).send("capacity exceeded");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("error in adding room");
  }
});

app.post("/thebeddetails", async (req, res) => {
  const { id, floorno, roomno, bedno } = req.body;
  try {
    const user = await usertest.findOne({ _id: id });
    const result = [];

    if (user) {
      const arr = user.floors.filter((floor) => floor.floorno == floorno)[0]
        .rooms;
      const arr1 = arr.filter((room) => room.roomno == roomno)[0].beds;
      for (let i in arr1) {
        if (arr1[i].bedno == bedno) {
          result.push(arr1[i]);
        }
      }
      res.status(200).send(result[0]);
    } else {
      res.status(500).send("error in getting beddetails");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("error in getting beddetails");
  }
});

app.post("/getroomcapacity", async (req, res) => {
  const { id, floorno, roomno } = req.body;

  try {
    const user = await usertest.findOne({ _id: id });
    const result = [];

    if (user) {
      const arr = user.floors.filter((floor) => floor.floorno == floorno)[0]
        .rooms;
      for (let i in arr) {
        if (arr[i].roomno == roomno) {
          result.push(arr[i].capacity);
        }
      }
      res.status(200).send(result);
    } else {
      res.status(500).send("error in getting room capacity");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("error in getting room capacity");
  }
});

app.post("/getthehome", async (req, res) => {
  const { id } = req.body;
  try {
    const user = await usertest.findOne({ _id: id });

    if (user) {
      var mainresult = [];
      for (let i in user.floors) {
        flrobj = {};
        flrobj.floorno = user.floors[i].floorno;
        flrobj.room = [];
        for (let j in user.floors[i].rooms) {
          let paid = 0;
          let notpaid = 0;
          let pp = 0;
          roomobj = {};
          roomobj.roomno = user.floors[i].rooms[j].roomno;
          roomobj.capacity = user.floors[i].rooms[j].capacity;
          for (let k in user.floors[i].rooms[j].beds) {
            if (user.floors[i].rooms[j].beds[k].typeofamountpaid == "paid") {
              paid++;
            } else if (
              user.floors[i].rooms[j].beds[k].typeofamountpaid == "notpaid"
            ) {
              notpaid++;
            } else if (
              user.floors[i].rooms[j].beds[k].typeofamountpaid == "pp"
            ) {
              pp++;
            }
          }
          roomobj.paid = paid;
          roomobj.notpaid = notpaid;
          roomobj.pp = pp;
          flrobj.room.push(roomobj);
        }
        mainresult.push(flrobj);
      }
      res.status(200).send(mainresult);
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
