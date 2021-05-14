const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail, newRandomId } = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));  //middleware

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set('view engine', 'ejs');

const urlsForUser = (id) => {
  let result = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;
};

const urlDatabase = {};

const users = { // Example users infos
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

app.get('/', (req, res) => { // Home page
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.get('/urls.json', (req, res) => { // Display urls JSON on client
  res.json(urlDatabase);
});

app.get('/users.json', (req, res) => { // Display users JSON on client
  res.json(users);
});

app.get('/hello', (req, res) => { // /hello displays "Hello World" message
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => { // /urls : Displays different page depends on cookie's existence
  const userId = req.session.user_id;

  const templateVars = {
    urlDatabase,
    urls: urlsForUser(userId),
    user: users[userId],
    error: users[userId] ? null : 'Please Login or Register first' // if no user info(no cookie), display the message
  };

  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => { // generates a short URL, saves it, and associates it with the user
  const newString = newRandomId();
  urlDatabase[newString] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => { // Display new url create page
  const userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  if (!userId) {
    return res.redirect('/login');
  }
  res.render('urls_new', templateVars);
});

app.get('/register', (req, res) => { // Display account register page
  const templateVars = { user: null };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => { // Register with email and password, check duplication
  const email = req.body.email;
  const password = req.body.password;
  if (!password || !email) {
    return res.status(400).send('Please enter your new email and password to create your account');
  }

  const userCheck = getUserByEmail(email, users);
  if (userCheck) {
    return res.status(404).send("User already exists");
  }

  const id = newRandomId();
  const user = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  console.log("user:", user);

  users[id] = user;
  req.session.user_id = id;
  res.redirect('/urls');
});

app.get('/login', (req, res) => { // Display login page
  const userId = req.session.user_id;
  const templateVars = { user: users[userId] };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => { // Login and redirects to either /urls or 403
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!email.length || !password.length) {
    return res.status(403).send('Email or Password is invalid');
  }

  if (!user) {
    return res.status(403).send("User or Password doesn't match");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("User or Password doesn't match");
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => { // Logout and redirect to main page, delete cookies
  req.session = null;
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => { // short URL page, able to edit existing short URL with new longURL
  const userId = req.session.user_id;
  const shortURL = req.params.shortURL;

  if (urlDatabase[shortURL].userID !== userId) {
    return res.status(400).send("You don't have permission to edit this URL");
  }

  if (!userId) {
    return res.redirect('/urls');
  }

  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId],
    error: users[userId] ? null : 'Please Login or Register first' 
  };
  res.render('urls_show', templateVars);

});

app.post('/urls/:shortURL', (req, res) => { // Change the existing long url and go back to my urls
  const userId = req.session.user_id;
  if (!users[userId]) {
    return res.status(403).send('Not Found');
  }

  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => { // deleting urls from my urls
  const userId = req.session.user_id;
  if (!users[userId]) {
    return res.status(403).send('Not Found');
  }

  const deleteToggle = req.params.shortURL;
  delete urlDatabase[deleteToggle];
  res.redirect('/urls');

});

app.get('/u/:shortURL', (req, res) => { // Redirects to the corresponding long URL
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    return res.status(404).send('not found');
  }

  res.redirect(url.longURL);

});

app.listen(PORT, () => { // my port
  console.log(`Example app listening on port ${PORT}!`);
});