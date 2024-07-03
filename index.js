const express = require("express");
const app = express();
require("dotenv").config();

const morgan = require("morgan");

const Person = require("./models/person");

app.use(express.static("dist"));

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

const customMorganFormat =
  ":method :url :status :res[content-length] - :response-time ms :body";

const errorHandler = (error, response, request, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(404).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(404).json({ error: error.message });
  }

  next(error);
};

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(morgan(customMorganFormat));

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.get("/", (request, response) => {
  response.send("<h1>Personbook</h1>");
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response) => {
  Person.findById(request.params.id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response, next) => {
  const date = new Date();
  Person.find({})
    .then((persons) => {
      response.send(
        `<p>Phonebook has info for ${persons.length} people.</p> </br> <p>${date}</p>`
      );
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
