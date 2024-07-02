require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(express.static("dist"));

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

const customMorganFormat =
  ":method :url :status :res[content-length] - :response-time ms :body";
app.use(morgan(customMorganFormat));

app.get("/", (request, response) => {
  response.send("<h1>Personbook</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  const date = new Date();
  Person.find({}).then((persons) => {
    response.send(
      `<p>Phonebook has info for ${persons.length} people.</p> </br> <p>${date}</p>`
    );
  });
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id).then((person) => {
    response.json(person);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateID = () => {
  const maxID =
    persons.length > 0 ? Math.max(...persons.map((n) => Number(n.id))) : 0;

  return String(maxID + 1); //not recommended but still
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const nameFound = persons.find(
    (person) => person.name.toLowerCase() === body.name.toLowerCase()
  );

  if (!body.name || !body.number) {
    return response.status(404).json({
      error: "name or number missing",
    });
  }
  if (nameFound) {
    return response.status(404).json({
      error: "name must be unique",
    });
  }
  const person = {
    name: body.name,
    number: body.number,
    id: generateID(),
  };
  persons = persons.concat(person);

  response.json(person);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
