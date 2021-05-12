const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
// const morgan = require('morgan');

function generateRandomString(length, arr) { // randomize shortURL function
    var random = '';
    for (var i = length; i > 0; i--) {
        random += arr[Math.floor(Math.random() * arr.length)];
    }
    return random;
}

const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

const urlDatabase = { // url database
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs");

app.get("/", (req, res) => { // home
  res.send("Hello!");
});

app.get("/urls", (req, res) => { // Load to My URLs page
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
  }; 
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => { // new shortURL from /urls/new to /urls and redirect to /urls
  const rString = generateRandomString(6, chars);
  urlDatabase[rString] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => { // urls_show.ejs - display long URL and Short URL created.
  const newLongURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
})

app.get("/urls/new", (req, res) => { // urls_new - webpage to creat shortURL. it needs to be placed before shortURL get route. Because Express will think that new is a route parameter.  
  const templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});
//A good rule of thumb to follow is that routes should be ordered from most specific to least specific.

app.get("/urls/:shortURL", (req, res) => { // urls_show.ejs - Retrieve the URL with shortURL that was created already.
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => { // JSON file
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => { // localhost:8080/hello => Hello World
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/u/:shortURL", (req, res) => { // direct to longURL(actual website)
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});


app.post("/urls/:shortURL/delete", (req, res) => { // urls_index.ejs - delete button from my URLs
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res)=>{ // urls_index.ejs - edit button from my URLs
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
  // const longURL = urlDatabase[shortURL];
  // res.redirect(longURL);  
});


app.post("/login",(req,res) => { // _header.ejs - login and create cookies
  const username = req.body.username;
  res.cookie('username',username);
  res.redirect('/urls');
});



app.post("/logout", (req, res)=> { // _header.ejs - logout button 
  res.clearCookie('username');
  res.redirect('/urls');
})


app.listen(PORT, () => { // my port 8080
  console.log(`Example app listening on port ${PORT}!`);
});



