const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
require("dotenv").config();
const bodyParser = require("body-parser");
const { Deta } = require("deta");
const deta = Deta(process.env.DETA);
const db = deta.Base("shortener");
const PORT = 8080;

const date = new Date();
const datetime =
  "Created: " +
  date.getDate() +
  "/" +
  (date.getMonth() + 1) +
  "/" +
  date.getFullYear() +
  " at " +
  date.getHours() +
  ":" +
  date.getMinutes() +
  ":" +
  date.getSeconds();

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/", async (req, res) => {
  const databaseFetch = await db.fetch({ shortlink: req.body.short });
  if (databaseFetch.count === 0) {
    db.put({
      longlink: req.body.long,
      shortlink: req.body.short,
      date: datetime,
    });
    res.redirect("/");
  } else {
    res.send(`  <p>This link has already been used!</p>
  <a href="/">naspäť</a>`);
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/link/:id", async (req, res) => {
  const { id } = req.params;
  const user = await db.fetch({ shortlink: id });
  console.log(user);

  if (user.count === 0) {
    res.send(`  <p>This link doesn't exist!</p>
    <a href="/">Go back</a>`);
  } else {
    console.log(user);
    res.redirect(user.items[0].longlink);
  }
});
// Place to edit the links
app.get("/edit", async (req, res) => {
  const linksList = await db.fetch({});
  res.render("edit", { results: linksList.items });
});

app.delete("/edit/:id", async (req, res) => {
  const { id } = req.params;
  await db.delete(id);
  res.redirect("/edit");
});

app.listen(PORT);

module.exports = app;
