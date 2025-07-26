// 'import' key word eka use krann package.json file eke type eka set krann oninput. ehema naththam
// 'requir' key word eka use krann oni

import express from "express";
import mysql from "mysql2";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
const salt = 10;

// create app
const app = express();
// use the app that we created
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"], // front end eka run wen link eka
    methods: ["POST", "GET"],
    credentials: true,
  })
);
app.use(cookieParser());

// connect the mysql data base
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  // database: 'signup'
  database: "login_and_register",
});

// test the data base connection
db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully!");
  }
});


//register API
app.post("/register", (req, res) => {
  const sql = "INSERT INTO signup (`name`, `email`, `password`) VALUES (?)";
  // hash the passqord with salt value
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json({ Error: "Error for hashing password" });
    const values = [req.body.name, req.body.email, hash];
    db.query(sql, [values], (err, result) => {
      if (err) return res.json({ Error: "Inserting data Error in server" });
      return res.json({ Status: "Success" });
    });
  });
});

// Login API
app.post("/login", (req, res) => {
  const sql = "SELECT * FROM signup WHERE email = ?";
  db.query(sql, [req.body.email], (err, data) => {
    if (err) return res.json({ Error: "Login error in server" });
    if (data.length > 0) {
      bcrypt.compare(
        req.body.password.toString(),
        data[0].password,
        (err, response) => {
          // data[0] kiyane email eka match wena palaweni data eka gannwa data base ekena
          if (err) return res.json({ Error: "Password compare error" });
          if (response) {
            const name = data[0].name;
            // token ekak hadanwa.  "jwt-secret-key"- meka private keya eka. meka use kranwa user verify krnwkot.uda function ekak thiynwa
            const token = jwt.sign({ name }, "jwt-secret-key", {
              expiresIn: "1d",
            });
            res.cookie("token", token); // the generated token store in the cookie
            return res.json({ Status: "Success", token });
          } else {
            return res.json({ Error: "Password not matched" });
          }
        }
      );
    } else {
      return res.json({ Error: "No email existed" });
    }
  });
});



// verify user function 
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if(!token) {
        return res.json({Error: "You are not authenticated"});
    } else {
        jwt.verify(token, "jwt-secret-key", (err, decoded) => {
            if(err) {
                // token eka generate kranot use krapu private keya eka
                return res.json({Error: "Token is not okay"});
            } else {
                // name ekaencrypt krapu eka dcrypt kral gannwa
                req.name = decoded.name;
                next();
            }
        });
    }
};


// useEffect eken autherization eka check krann gahpu route eka 
app.get('/', verifyUser, (req, res) => {
    return res.json({Status: "Success", name: req.name});
});

// Log-out function ( clear cookie in the browser )
app.get('/logout', (req, res) => {
    res.clearCookie('token'); // token kiyanne api generate krapu token eke nama. eka api generate krankot dena eka 
    return res.json({Status: "Success"});
});



// listen the app
app.listen(8081, () => {
  console.log("Running ...");
});
