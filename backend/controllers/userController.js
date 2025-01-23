const { executeQuery } = require("../util/sql");
const bcrypt = require("bcryptjs");

exports.getAllUsers = async function (req, res) {
  const query = "SELECT * FROM user";
  try {
    const result = await executeQuery(query);
    // convert the boolean value in the database to a form that is readable by the user.
    result.map((e) => {
      if (e.user_enabled === 1) {
        e.user_enabled = "enabled";
      } else {
        e.user_enabled = "disabled";
      }
      return e;
    });
    res.send(result);
    return result;
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
};

exports.login = async function (req, res) {
  // first check if username exists in the database.
  const query = "SELECT * FROM tms.user WHERE user_username = ?;";
  const { username, password } = req.body;
  const result = await executeQuery(query, [username]);
  // query returns nothing, user does not exist, invalid username
  if (result.length === 0) {
    res.status(401).send("Invalid username and password");
    return;
  }
  // check if password hash matches
  const userPassword = result[0].user_password;
  const isPasswordMatch = bcrypt.compareSync(password, userPassword);
  if (!isPasswordMatch) {
    res.status(401).send("Invalid username and password");
    return;
  }
  // if we reach here, this is a valid login
  res.status(200).send("Login successful");
};

exports.createUser = async function (req, res) {
  try {
    // do username validation here?
    const { username, password, email } = req.body;
    const query = `INSERT INTO user (user_username, user_password, user_email) VALUES (?, ?, ?)`;
    // hash the password before storing it into database
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    const result = executeQuery(query, [username, hash, email]);
    res.status(200).send("User successfully created");
  } catch (err) {
    res.status(500).send("Error creating users");
  }
};
