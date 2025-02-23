const { executeQuery } = require("../util/sql");
require("dotenv").config();

/**
 * Helper function to check if a user exists in the database
 */
exports.getUser = async function (username) {
  const query = "SELECT * FROM tms.user WHERE user_username = ?;";
  const result = await executeQuery(query, [username]);
  return result;
};

/**
 * Helper function to add a group row into the database. This is used in at least three different places.
 * @param {*} username
 * @param {*} groupname
 * @returns
 */
exports.addGroupRow = async function (username, groupname) {
  const query = "INSERT INTO user_group (user_group_username, user_group_groupName) VALUES (?, ?);";
  const user = await exports.getUser(username);
  // by right this should never happen from the user side, but I am still going to blame the user because i can
  if (user.length === 0 && username !== process.env.DUMMY_USER) {
    throw new Error("Cannot assign a group to a user that does not exist.");
  }
  // user exists and we can execute the query
  try {
    const result = await executeQuery(query, [username, groupname]);
    return result;
  } catch (err) {
    if (err.message.includes("Duplicate entry")) {
      throw new Error("User is already assigned to this group!");
    } else {
      throw new Error("Error assigning user to a group");
    }
  }
};

exports.getDistinctGroups = async function () {
  const query = "SELECT DISTINCT user_group_groupName FROM user_group;";
  try {
    const result = await executeQuery(query);
    const distinctGroups = result.map((row) => {
      return row["user_group_groupName"];
    });
    return distinctGroups;
  } catch (err) {
    throw new Error("Error fetching groups: " + err.message);
  }
};

exports.getAppPermissions = async function (acronym, permission) {
  // idk why using wildcard did not work
  const getPermissionsQuery = `SELECT ${permission} FROM application WHERE (App_Acronym=?)`;
  // "SELECT App_permit_Create, App_permit_Open, App_permit_toDoList, App_permit_Doing, App_permit_Done FROM application WHERE (App_Acronym=?)";
  try {
    const result = await executeQuery(getPermissionsQuery, [acronym]);
    return result[0][permission];
  } catch (err) {
    throw new Error(err.message);
  }
};
