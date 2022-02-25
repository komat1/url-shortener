const express = require("express");
const app = express();
require('dotenv').config()
const bodyParser = require("body-parser");
const { Deta } = require("deta");
const deta = Deta(process.env.DETA);
const db = deta.Base("shortener");
const PORT = 8080;


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.post("/", async (req, res) => {
  const databaseFetch = await db.fetch({ shortlink: req.body.short });
  if (databaseFetch.count === 0) {
    db.put({
      longlink: req.body.long,
      shortlink: req.body.short,
    });
    res.redirect("/")
  } else {
    res.send(`  <p>Tento link už existuje!</p>
  <a href="/">naspäť</a>`);
  }
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/link/:id", async (req, res) => {
  const { id } = req.params;
  const user = await db.fetch({ shortlink: id });
  console.log(user)

  if (user.count === 0) {
    res.send(`  <p>Tento link neexistuje!</p>
    <a href="/">naspäť</a>`);
  } else {
      console.log(user);
    res.redirect(user.items[0].longlink);
  }
});
// Place to edit the links
// app.get("/edit", async (req, res) => {
//     const linksList = await db.fetch({});
//     console.log(linksList.items[1]
//     // app.render("edit", {results: linksList[0]})ß;
// })

app.listen(PORT);

module.exports = app;
