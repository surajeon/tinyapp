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

const users = { 
  "test": {
    id: "banana",
    email: "b@b.com",
    password: "1234"
  },
  "apple": {
    id: "orange", 
    email: "user@example.com", 
    password: "1234"
  },
  "sura": {
    id: "a",
    email: "a@a.com",
    password: "1234"
  }
}

app.set("view engine", "ejs");

app.get("/", (req, res) => { // home
  res.send("Hello!");
});

app.get("/urls", (req, res) => { // Load to My URLs page
  const cookie = req.cookies["user_id"]
  const userIdFunc = (cookie) => {
    for (let user in users) {
      if(users[user].id === cookie) {
        return users[user];
      }
    }
    return null;
  }
  const user = userIdFunc(cookie);

  const templateVars = { 
    urls: urlDatabase,
    user: user 
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
  const cookie = req.cookies["user_id"]
  const userIdFunc = (cookie) => {
    for (let user in users) {
      if(users[user].id === cookie) {
        return users[user];
      }
    }
    return null;
  }
  const user = userIdFunc(cookie);
  const templateVars = { user: user }
  res.render("urls_new", templateVars);
});
//A good rule of thumb to follow is that routes should be ordered from most specific to least specific.

app.get("/urls/:shortURL", (req, res) => { // urls_show.ejs - Retrieve the URL with shortURL that was created already.
  const cookie = req.cookies["user_id"]
  const userIdFunc = (cookie) => {
    for (let user in users) {
      if(users[user].id === cookie) {
        return users[user];
      }
    }
    return null;
  }
  const user = userIdFunc(cookie);

  const shortURL = req.params.shortURL;

  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], user: user };
  res.cookie('user_id', user['id']);
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

// /login - it would go to the /login GET route.
// in the /login get route we need to degign a page which asks for an email and pw, just like a registration
// When the user submits the info, w eneed to verufy whetehr that user is existing or not with the password check
// If the user is there and password is ok then we write the cookie, the way we wrote in regstration POST, and redierect it to the /urls

app.get("/register", (req, res) => { // display registeration page
  const templateVars = { user: undefined};
  res.render('urls_register',templateVars)
})

app.post("/register", (req, res) => { // register email and password and redirect to /urls
  if (req.body.email === "" || req.body.password === "") { // email/password with empty string - 400 status code
    res.status(400)
    res.end();
  } 
  let duplicateEmail = false; // On/Off switch?
  for (let userInfo in users) { // loop inside "users" to check if the email already exists
    // console.log(users[userInfo])
    // console.log("user: ",user);
    // console.log("users[user]: ",users[user].email)
    if (req.body.email === users[userInfo].email) {
      // console.log("New email: ",req.body.email)
      duplicateEmail = true;
    } 
  }
  if (duplicateEmail === true) { // 
    res.status(400);
    res.end();
  } else {  
    const rString = generateRandomString(6, chars);
    users[rString] = { id: rString, email: req.body.email, password: req.body.password }
    res.cookie('user_id', rString); //ERROR --------------------------
    res.redirect('/urls');
    res.end();
  }
})

app.get("/login",(req, res) => {
  const user = users[req.cookies["user_id"]]; // user to userInfo?
  const templateVars = { user: user };
  res.render('urls_login', templateVars)
});

app.post("/login",(req,res) => { // _header.ejs - login and create cookies
  console.log(users)
  const email = req.body.email;
  const password = req.body.password;
  const userObj = (email, password) => {
    for (let userInfo in users) {
      if(users[userInfo].email === email && users[userInfo].password === password) {
        return users[userInfo];
      } 
    }
    return false;
  }
  const userData = userObj(email, password);
  if(userData) {
    const templateVars = { user: users, urls: urlDatabase };
    res.cookie('user_id', userData.id);
    res.render("urls_index", templateVars);
    // res.redirect('/urls');
    res.end();
  } else {
    res.status(400);
    res.end();
  }

});

app.post("/logout", (req, res)=> { // _header.ejs - logout button 
  res.clearCookie('user_id');
  res.redirect('/urls');
})
app.listen(PORT, () => { // my port 8080
  console.log(`Example app listening on port ${PORT}!`);
});



