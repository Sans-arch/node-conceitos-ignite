const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username: usernameHeaders } = request.headers;
  const { username: usernameBody } = request.body;

  let userExists = false;

  if (usernameHeaders && !usernameBody) {
    userExists = users.find(user => user.username === usernameHeaders);
  } else if (usernameBody && !usernameHeaders) {
    userExists = users.find(user => user.username === usernameBody);
  } else {
    userExists = users.find(user => user.username === usernameHeaders);
  }

  if (userExists) {
    request.userExists = userExists;
  }

  next();
}

// Cria um novo usuário - username passado pelo body
app.post('/users', checksExistsUserAccount, (request, response) => {
  const { name, username } = request.body;
  const { userExists } = request;

  const userModel = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  if (userExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  users.push(userModel);

  return response.status(201).json(userModel);
});

// Visualiza todas as tarefas de um usuário - username passado pelo headers
app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const userTodos = users.find(user => user.username === username ? user.todos : null);

  return response.json(userTodos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.header;

  const user = users.find(user => user.username === username);

  const todoModel = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todoModel);

  return response.status(201).json(user.todos);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const userTodos = users.find(user => user.username === username ? user.todos : null);
  const specificTodo = userTodos.find(todo => todo.id === id);

  specificTodo = {
    ...specificTodo,
    title,
    deadline
  };

  return response.json(specificTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});


/**
 * Rotas para testes
 */
app.get('/users', (request, response) => {
  response.json(users);
});

app.get('/users/:username', (request, response) => {
  const { username } = request.params;

  const userFound = users.find(user => user.username === username);

  response.json(userFound);
});

module.exports = app;