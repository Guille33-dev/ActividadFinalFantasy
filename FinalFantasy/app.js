const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


const personajes= [
  { id: 1, name: "Cloud Strife", job: "Soldier", weapon: "Buster sword", level: 25 },
  { id: 2, name: "Tifa Lockhart", job: "Fighter", weapon: "Leather gloves", level: 22 },
  { id: 3, name: "Aerith Gainsborough", job: "Mage", weapon: "Magic staff", level: 20 }
];

let characters = JSON.parse(JSON.stringify(personajes));


function isEmpty(obj) {
  return !obj || Object.keys(obj).length === 0;
}

function toNumber(value) {
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function isLevelValid(level) {
  const n = toNumber(level);
  return n !== null && n >= 1 && n <= 99;
}

function existsById(id) {
  return characters.some(c => c.id == id);
}

function existsByName(name) {
  return characters.some(c => c.name === name);
}


app.get("/characters", (req, res) => {
  res.json(characters);
});

app.get("/characters/:id", (req, res) => {
  const char = characters.find(c => c.id == req.params.id);
  if (!char) return res.status(404).send("Character not found");
  res.json(char);
});

// nuevo personaje
app.post("/characters", (req, res) => {
  const body = req.body;

  if (isEmpty(body)) return res.status(400).send("Empty body");

  let { id, name, job, weapon, level } = body;

  const numericId = toNumber(id);
  const numericLevel = toNumber(level);

  if (numericId === null) return res.status(400).send("ID must be a number");
  if (!name) return res.status(400).send("Name is required");

  if (existsById(numericId)) return res.status(400).send("ID already exists");
  if (existsByName(name)) return res.status(400).send("Name already exists");

  if (!isLevelValid(numericLevel))
    return res.status(400).send("Level must be between 1 and 99");

  characters.push({ id: numericId, name, job, weapon, level: numericLevel });

  res.status(201).send("Created");
});

// Actualizar personaje
app.put("/characters/:id", (req, res) => {
  const body = req.body;

  if (isEmpty(body)) return res.status(400).send("Empty body");

  const index = characters.findIndex(c => c.id == req.params.id);
  if (index === -1)
    return res.status(404).send("Character does not exist");

  let { id, name, job, weapon, level } = body;

  const numericBodyId = toNumber(id);
  const numericParamId = toNumber(req.params.id);
  const numericLevel = toNumber(level);

  if (numericBodyId === null) return res.status(400).send("ID must be a number");
  if (!name) return res.status(400).send("Name is required");

  if (!isLevelValid(numericLevel))
    return res.status(400).send("Level must be between 1 and 99");

  if (existsById(numericBodyId) && numericBodyId !== numericParamId)
    return res.status(400).send("ID already exists");


  if (existsByName(name) && characters[index].name !== name)
    return res.status(400).send("Name already exists");

  characters[index] = {
    id: numericBodyId,
    name,
    job,
    weapon,
    level: numericLevel
  };

  res.status(204).send();
});

// Borrar personaje
app.delete("/characters/:id", (req, res) => {
  const index = characters.findIndex(c => c.id == req.params.id);

  if (index === -1)
    return res.status(404).send("Character does not exist");

  characters.splice(index, 1);

  res.status(204).send();
});

app.post("/reset-data", (req, res) => {
  characters = JSON.parse(JSON.stringify(personajes));
  res.status(204).send();
});


// index 
app.get("/index", (req, res) => {
  res.render("index", { title: "Welcome" });
});

// list 
app.get("/list", (req, res) => {
  res.render("list", { title: "Character list", characters });
});

// new
app.get("/new", (req, res) => {
  res.render("new", { title: "New character" });
});

app.post("/new", (req, res) => {
  const { id, name, job, weapon, level } = req.body;
  const numericId = toNumber(id);
  const numericLevel = toNumber(level);

  characters.push({
    id: numericId,
    name,
    job,
    weapon,
    level: numericLevel
  });
  res.redirect("/list");
});

app.listen(8080, () => console.log("Server running on port 8080"));
