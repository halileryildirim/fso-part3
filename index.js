const express = require("express");
const app = express();
const morgan = require("morgan");

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
  {
    id: 5,
    name: "delete this person",
    number: "39-23-4314222",
  },
];

app.use(express.json());
app.use(morgan("tiny"));

app.get("/", (request, response) => {
  response.send("<h1>Hello Personbook</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  const personCount = persons.length;
  const date = new Date();
  response.send(
    `<p>Phonebook has info for ${personCount} people.</p> </br> <p>${date}</p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
