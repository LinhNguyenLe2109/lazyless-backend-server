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
const { v4: uuidv4 } = require("uuid");

app.use(bodyParser.json());
app.use(
  cors({
    origin: ["https://linhnguyenle2109.github.io", "http://localhost:5000"],
    methods: "GET,HEAD,PUT,PATCH,DELETE",
  })
);

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
app.use(passport.initialize());

// Router configuration
app.use(
  "/dailyTable",
  passport.authenticate("jwt", { session: false }),
  require("./routes/dailyTableAPI")
);

app.use(
  "/dailyLog",
  passport.authenticate("jwt", { session: false }),
  require("./routes/dailyLogAPI")
);

// App routes

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
          dailyTableList: [],
        });
        const savedUser = await newUser.save();

        res.json({ message: "ok", user: { userName: savedUser.userName } });
      }
    } catch (err) {
      res.status(401).json({ message: "Error registering user", err: err });
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
