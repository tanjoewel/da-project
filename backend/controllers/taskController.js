const { executeQuery, createQueryBuilder, withTransaction } = require("../util/sql");
const { isValueEmpty } = require("../util/validation");
const { getApplication } = require("./applicationController");
const { STATE_OPEN } = require("../util/enums");

exports.createTask = async function (req, res) {
  // subject to many, many changes down the line. task creator to be passed down from the frontend
  const { task_name, task_description, task_plan, task_creator, task_owner } = req.body;
  const { acronym } = req.params;
  // get the app and the running number
  const app = await getApplication(acronym);
  const oldRNumber = app[0].App_Rnumber;
  const task_id = `${acronym}_${oldRNumber}`;
  const task_app_acronym = acronym;

  const task_state = STATE_OPEN;
  const columnsArray = ["task_id", "task_name", "task_description", "task_notes", "task_plan", "task_app_acronym", "task_state", "task_creator", "task_owner"];
  const date = new Date();

  const localeTime = date.toLocaleTimeString();

  let anyEmptyFields = false;
  // system generate task notes
  // type is 0 for system generated, 1 for user generated
  const task_notes = [{ text: "CREATE >> OPEN", date_posted: localeTime, creator: task_creator, type: 0 }];
  const argsArray = [task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner];
  // validation
  const mandatoryFields = ["task_name", "task_creator"];
  for (let i = 0; i < mandatoryFields.length; i++) {
    const field = mandatoryFields[i];
    if (isValueEmpty(req.body[field])) {
      res.status(400).json({ message: `${field} must not be empty` });
      anyEmptyFields = true;
      break;
    }
  }
  if (anyEmptyFields) {
    return;
  }

  if (task_name.length === 0 || task_name.length > 50) {
    res.status(400).json({ message: "Task name must be between 1 and 50 characters inclusive" });
    return;
  }

  const query = createQueryBuilder("task", columnsArray);
  const newRNumber = oldRNumber + 1;
  try {
    await withTransaction(async (connection) => {
      // increment the running number. by incrementing after the task_id is generated, we ensure that the first task created will be the number specified by the user
      const incrementQuery = "UPDATE application SET App_Rnumber = ? WHERE (App_Acronym = ?);";
      await connection.execute(incrementQuery, [newRNumber, acronym]);
      await connection.execute(query, argsArray);
    });
    res.send("Task successfully created");
  } catch (err) {
    res.status(err.code || 500).json({ message: "Error creating task: " + err.message });
  }
};

exports.getTasksForApp = async function (req, res) {
  // the app will be in the params
  const { acronym } = req.params;
  const query = "SELECT * FROM task WHERE (task_app_acronym=?)";
  try {
    const result = await executeQuery(query, [acronym]);
    res.send(result);
  } catch (err) {
    res.status(500).json({ message: "Error getting tasks" + err.message });
  }
};

// this should only be called when user wants to add a note. Other notes being added should be part of their respective APIs
exports.addNotesRoute = async function (req, res) {
  const { body, task_creator } = req.body;
  const { taskId } = req.params;
  // get the note from this particular task
  const getQuery = "SELECT task_notes FROM task WHERE (task_id = ?)";
  const mandatoryFields = ["body", "task_creator"];
  let anyEmptyFields = false;
  for (let i = 0; i < mandatoryFields.length; i++) {
    const field = mandatoryFields[i];
    if (isValueEmpty(req.body[field])) {
      res.status(400).json({ message: `${field} must not be empty` });
      anyEmptyFields = true;
      break;
    }
  }
  if (anyEmptyFields) {
    return;
  }
  try {
    const getResult = await executeQuery(getQuery, [taskId]);
    if (getResult.length === 0) {
      res.status(400).json({ message: "Task with specified task ID does not exist" });
      return;
    }
    const oldNotes = JSON.parse(getResult[0].task_notes);
    const newNote = { text: body, date_posted: new Date().toLocaleTimeString(), creator: task_creator, type: 1 };
    oldNotes.push(newNote);
    const updateQuery = "UPDATE task SET task_notes = ? WHERE (task_id = ?);";
    const updateResult = await executeQuery(updateQuery, [oldNotes, taskId]);
    res.send("Notes updated successfully");
  } catch (err) {
    const error = new Error(err.message);
    error.code = err.code || 500;
    throw error;
  }
};
