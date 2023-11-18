require("dotenv").config();
const express = require("express");
const dbHelper = require("./dbHelper");
const testFile = require("./testFile");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportJWT = require("passport-jwt");
const User = require("./schema/userSchema");

app.use(bodyParser.json());
app.use(cors());

// Passport configuration
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// Passport strategy
const strategy = new JwtStrategy(jwtOptions, async (jwt_payload, next) => {
  console.log("payload received", jwt_payload);
  try {
    const user = await User.findOne({ userName: jwt_payload.userName });
    if (user) {
      next(null, user);
    } else {
      next(null, null);
    }
  } catch (err) {
    next(err, null);
  }
});

passport.use(strategy);

// Passport initialization
app.use(passport.initialize({ session: false }));

// Router configuration
app.use("/dailyTable", require("./routes/dailyTableAPI"));

// App routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", async (req, res) => {
  if (req.body.userName && req.body.password) {
    const userName = req.body.userName;
    const password = req.body.password;
    try {
      const user = await User.findOne({ userName: userName });
      if (!user) {
        res.status(401).json({ message: "No such user found" });
      }
      if (user.password === password) {
        // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
        let payload = { id: user.id, userName: user.userName };
        let token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({ message: "ok", token: token });
      } else {
        res.status(401).json({ message: "Password is incorrect" });
      }
    } catch (err) {
      res.status(401).json({ message: "Error logging in" });
    }
  }
});

app.post("/register", async (req, res) => {
  if (req.body.userName && req.body.password) {
    const userName = req.body.userName;
    const password = req.body.password;
    try {
      const user = await User.findOne({ userName: userName });
      if (user) {
        res.status(401).json({ message: "User already exists" });
      } else {
        const newUser = new User({
          id: uuidv4(),
          userName: userName,
          password: password,
        });
        const savedUser = await newUser.save();
        res.json(savedUser);
      }
    } catch (err) {
      res.status(401).json({ message: "Error registering user" });
    }
  }
});

// test application
testFile.env();
testFile.dbHelper();

// Start the program
(async () => {
  try {
    const db = await dbHelper.connect();
    const collections = await dbHelper.listTables();

    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`);
      console.log("Collections in the database:", collections);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB database", err);
  }
})();
