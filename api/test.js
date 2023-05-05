const { createTask } = require("./tasksData");
const mainfunction = async () => {
  let myTask = await createTask(
    "64416c1e705dc3d9c8b7c2cb",
    "My First Task",
    "wlhgowir",
    "todo",
    "bgiewrburiu"
  );
  return myTask;
};

mainfunction();
