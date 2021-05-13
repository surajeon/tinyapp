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
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
}

app.set("view engine", "ejs");

app.get("/", (req, res) => { // home
  res.send("Hello!");
});

app.get("/urls", (req, res) => { // Load to My URLs page
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
  const templateVars = { user: user }
  res.render("urls_new", templateVars);
});
//A good rule of thumb to follow is that routes should be ordered from most specific to least specific.

app.get("/urls/:shortURL", (req, res) => { // urls_show.ejs - Retrieve the URL with shortURL that was created already.
  const shortURL = req.params.shortURL;
  const user = users[req.cookies["user_id"]];
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL], user: user };
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
app.get("/login",(req, res) => {
  const user = users[req.cookies["user_id"]]; // user to userInfo?
  const templateVars = { user: user };
  res.render('urls_login', templateVars)
})

app.post("/login",(req,res) => { // _header.ejs - login and create cookies
  // const userInfo = users[] // new random ID
  const emailPassword = { userEmail: req.body.email, userPassword: req.body.password}
  for (let userInfo in users) {
    if (emailPassword[userEmail] === userInfo[email]) {
      // email provided and email in "users" are the same 
    } 
  }
  const userID = req.body.user;
  // console.log(user);
  res.cookie('username',username);
  const user = req.body
  res.redirect('/urls',users);
});

app.post("/logout", (req, res)=> { // _header.ejs - logout button 
  res.clearCookie('user_id');
  res.redirect('/urls');
})

app.get("/register", (req, res) => { // display registeration page
  const templateVars = { user: undefined};
  res.render('urls_register',templateVars)
})

app.post("/register", (req, res) => { // register email and password and redirect to /urls
  if (req.body.email === "" || req.body.password === "") { // email/password with empty string - 400 status code
    res.send(400)
  } 
  let duplicateEmail = false; // On/Off switch?
  for (let userInfo in users) { // loop inside "users" to check if the email already exists
    console.log(users[userInfo])
    // console.log("user: ",user);
    // console.log("users[user]: ",users[user].email)
    if (req.body.email === users[userInfo].email) {
      // console.log("New email: ",req.body.email)
      duplicateEmail = true;
    } 
  }
  if (duplicateEmail === true) { // 
    res.sendStatus(400);
  } else {  
    const rString = generateRandomString(6, chars);
    users[rString] = { id: rString, email: req.body.email, password: req.body.password }
    // console.log("req.body: ", req.body) //  {email: newEmail , password: newPassword}
    const usersInfo = users[rString];
    // console.log(usersInfo);
    res.cookie('user_id', usersInfo['id']);
    res.redirect('/urls');
  }
})

app.listen(PORT, () => { // my port 8080
  console.log(`Example app listening on port ${PORT}!`);
});



