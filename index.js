const express = require("express");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

// app use json
app.use(express.json());

// define the port to listen for connections
const PORT = 8080;

app.get("/api", verifyToken, (req, res) => {
  jwt.verify(req.token, "thl2015", (err, authData) => {
    if (err) {
      console.log(req.token);
      res.sendStatus(403);
    } else {
      res.json({
        message: "Welcome to the THL Reports Automated System API",
        authData,
      });
    }
  });
});

app.get("/api/ac", verifyToken, (req, res) => {
  jwt.verify(req.token, "thl2015", (err, authData) => {
    if (err) {
      console.log(req.token);
      res.sendStatus(403);
    } else {
      const query = `SELECT * FROM ac`;
      pool.query(query, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: err.message });
        } else {
          res.json(results);
        }
      });
    }
  });
});

// route to get a list of all the sites
app.get(`/api/sites`, verifyToken, (req, res) => {
  jwt.verify(req.token, "thl2015", (err, authData) => {
    if (err) {
      console.log(req.token);
      res.sendStatus(403);
    } else {
      const query = `SELECT * FROM site`;
      pool.query(query, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: err.message });
        } else {
          res.json(results);
        }
      });
    }
  });
});

// route to get all floors in a particular site
app.get(`/api/sites/:id`, verifyToken, (req, res) => {
  jwt.verify(req.token, "thl2015", (err, authData) => {
    if (err) {
      console.log(req.token);
      res.sendStatus(403);
    } else {
      // get a list of distinct floor ids in a site
      // use the floor id to get the floor name and id
      const query = `SELECT * FROM floor_level WHERE id IN (SELECT DISTINCT room_floor_level FROM room WHERE room_site=?);`;
      pool.query(query, [req.params.id], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: err.message });
        } else {
          res.json(results);
        }
      }); // end of query
    }
  });
});

// route to get the rooms in a floor at a particular site
app.get(`/api/sites/:id/:floor`, verifyToken, (req, res) => {
  jwt.verify(req.token, "thl2015", (err, authData) => {
    if (err) {
      console.log(req.token);
      res.sendStatus(403);
    } else {
      const query = `SELECT * FROM room WHERE room_site=? AND room_floor_level=?`;
      pool.query(query, [req.params.id, req.params.floor], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: err.message });
        } else {
          res.json(results);
        }
      });
    }
  });
});

// route to get the AC in a particular room
app.get(`/api/ac/:room`, verifyToken, (req, res) => {
  jwt.verify(req.token, "thl2015", (err, authData) => {
    if (err) {
      console.log(req.token);
      res.sendStatus(403);
    } else {
      const query = `SELECT * FROM ac WHERE ac_room=?`;
      pool.query(query, [req.params.room], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: err.message });
        } else {
          res.json(results);
        }
      });
    }
  });
});

/*
    IMPLEMENT USER AUTHENTICATION
    - create a new user
    - login a user
    - logout a user
    - get a user's info
    - update a user's info
    - delete a user
*/

// get user token from login
app.post("/api/login", (req, res) => {
  const query = "SELECT * FROM users WHERE username=? AND password=?";
  pool.query(query, [req.body.username, req.body.password], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    } else {
      if (results.length === 0) {
        res.status(401).json({ error: "Invalid username or password" });
      } else {
        hashed = bcrypt.hashSync(req.body.password, 10);
        console.log(hashed);
        bcrypt.compare(hashed, results[0].password, (err, result) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
          } else {
            if (result) {
              const token = jwt.sign(
                {
                  username: results[0].username,
                  id: results[0].id,
                },
                "thl2015",
                { expiresIn: "1h" }
              );
              res.json({
                token: token,
                user: results[0],
              });
            } else {
              res.status(401).json({ error: "Invalid username or password" });
            }
          }
        });
        // const token = jwt.sign({ username: req.body.username }, "thl2015");
        // res.json({ token });
      }
    }
  });
});

// create a new user
app.post(`/api/signup`, (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const query =
    "INSERT INTO users (firstname, lastname, username, phone, password) VALUES (?, ?, ? ,?, ?)";
  pool.query(
    query,
    [
      req.body.firstname,
      req.body.lastname,
      req.body.username,
      req.body.phone,
      hashedPassword,
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "User created successfully" });
      }
    }
  );
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    res.sendStatus(403);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "Franc15@comffff",
  database: "thl_reports",
  port: "3306",
});
