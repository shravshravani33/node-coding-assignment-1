const express = require("express");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
var isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);

    process.exit(1);
  }
};

initializeDbAndServer();

const hasToDoStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasPriorityAnsStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasSearch = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const convertDataIntoResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const outPutResult = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;

  switch (true) {
    case hasToDoStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const todoListQuery = `
      SELECT 
        *
      FROM
        todo
      WHERE 
        status = '${status}';`;
        const todoListR = await db.all(todoListQuery);
        response.send(
          todoListR.map((each) => convertDataIntoResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasPriority(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const priorityQuery = `
        SELECT 
          *
        FROM
          todo
        WHERE
          priority = '${priority}';`;
        const priorityR = await db.all(priorityQuery);
        response.send(
          priorityR.map((each) => convertDataIntoResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasPriorityAnsStatus(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          const priorAndStatusQuery = `
          SELECT 
            *
          FROM
            todo
          WHERE
            priority = '${priority}' AND
            status = '${status}';`;
          const priorAndStatusR = await db.all(priorAndStatusQuery);
          response.send(
            priorityR.map((each) => convertDataIntoResponseObject(each))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasSearch(request.query):
      const searchQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          todo LIKE '%${search_q}%';`;
      const searchR = await db.all(searchQuery);
      response.send(searchR.map((each) => convertDataIntoResponseObject(each)));
      break;

    case hasCategoryAndStatus(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          const catStatusQuery = `
                      SELECT
                          *
                      FROM
                         todo
                      WHERE
                         category = '${category}' AND status = '${status}';`;
          const catStatusR = await db.all(catStatusQuery);
          response.send(
            catStatusR.map((each) => convertDataIntoResponseObject(each))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case hasCategory(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const categoryQuery = `
          SELECT
            *
          FROM
            todo
          WHERE
            category = '${category}';`;
        const categoryR = await db.all(categoryQuery);
        response.send(
          categoryR.map((each) => convertDataIntoResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case hasCategoryAndPriority(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          const catPriorityQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          category = '${category}' AND priority = '${priority}';`;
          const catPriorR = await db.all(catPriorityQuery);
          response.send(
            catPriorR.map((each) => convertDataIntoResponseObject(each))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
  }
});

///API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getToDoQuery = `
      SELECT
        *
      FROM 
        todo
      WHERE 
        id = '${todoId}';`;
  const getToDoR = await db.get(getToDoQuery);
  response.send(convertDataIntoResponseObject(getToDoR));
});

///API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    console.log(newDate);
    const dateQuery = `
      SELECT
        *
      FROM
        todo
      WHERE
        due_date = '${newDate}';`;
    const getDateR = await db.all(dateQuery);
    response.send(getDateR.map((each) => outPutResult(each)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

///API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");

          const createToDOQuery = `
    INSERT INTO
      todo(id,todo,priority,status,category,due_date)
    VALUES('${id}','${todo}','${priority}','${status}','${category}','${postNewDueDate}');`;
          const createTODOR = await db.run(createToDOQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

///API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const previousQueryT = `SELECT * FROM todo WHERE id = '${todoId}';`;
  const previousQuery = await db.get(previousQueryT);
  const requestBody = request.body;
  const {
    status = previousQuery.status,
    priority = previousQuery.priority,
    category = previousQuery.category,
    todo = previousQuery.todo,
    dueDate = previousQuery.dueDate,
  } = request.body;

  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const statusQuery = `
           UPDATE 
             todo
           SET
              todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date  = '${dueDate}'
           WHERE id = '${todoId}';`;
        await db.run(statusQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const priorityQuery = `
          UPDATE
            todo
          SET
             todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date  = '${dueDate}'
          WHERE id = '${todoId}';`;
        await db.run(priorityQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case requestBody.todo !== undefined:
      const todoQuery = `
            UPDATE
              todo
            SET
               todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date  = '${dueDate}'
            WHERE id = '${todoId}';`;
      await db.run(todoQuery);
      response.send("Todo Updated");
      break;

    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        const categoryQuery = `
            UPDATE
              todo
            SET
               todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date  = '${dueDate}'
            WHERE id = '${todoId}';`;
        await db.run(categoryQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        const dateQuery = `
            UPDATE
              todo
            SET
              todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date  = '${newDueDate}'
            WHERE id = '${todoId}';`;
        await db.run(dateQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }

      break;
  }
});

///API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const delQuery = `
    DELETE FROM todo WHERE id = '${todoId}';`;
  await db.run(delQuery);
  response.send("Todo Deleted");
});

module.exports = app;
