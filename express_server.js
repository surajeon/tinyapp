const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({extended: true}));  //middleware
app.use(cookieParser());
app.set('view engine', 'ejs');

const generateRandomString = function(length, arr) {
  let random = '';
  for (let i = length; i > 0; i--) {
    random += arr[Math.floor(Math.random() * arr.length)];
  }
  return random;
};

const newRandomId = function(length, arr) {
  let random = '';
  for (let i = length; i > 0; i--) {
    random += arr[Math.floor(Math.random() * arr.length)];
  }
  return random;
};
const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

const findUserIdByEmail = function(email) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return null;
};

const userId = newRandomId(6, chars);

const findExistingEmail = function(email) {
  for (let user in users) {
    // console.log('user', users[user])
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
};

const urlsForUser = function(id) {
  let result = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;
};

const urlDatabase = {
  'b2xVn2': { longURL: 'https://www.tsn.ca', userID: 'aJ48lW' },
  '9sm5xK': { longURL: 'https://www.google.ca', userID: 'aJ48lW' }
};

const users = {
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

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/users.json', (req, res) => {
  res.json(users);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls', (req, res) => { // home page - urls_index
  let userId = req.cookies['user_id'];
  // console.log('users', users);
  // console.log(users[userId]);
  const templateVars = {
    urls: urlsForUser(userId),
    user: users[userId],
    error: users[userId] ? null : 'Please Login or Register first'
  };
  // console.log('error', userId);
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => { 
  const newString = generateRandomString(6, chars);
  urlDatabase[newString] = {longURL: req.body.longURL, userID: req.cookies['user_id']};
  res.redirect('/urls');
});
// root path '/'; JSON string representing the entire urlDatabase object can see
// '/sth' --> route



// if we place this route after the /urls/:id definition, any calls to /urls/new will be handled by app.get('/urls/:id', ...) because Express will think that new is a route parameter.

app.get('/urls/new', (req, res) => { // display new url create page
  let userId = req.cookies['user_id'];
  const templateVars = { user: users[userId] };
  if (userId) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => { // display register page
  const templateVars = {user: null};
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => { // register with email and password, check duplication
  // const password = "purple-monkey-dinosaur"; // found in the req.params object
  // const hashedPassword = bcrypt.hashSync(password, 10);
  const password = req.body.password;
  if (req.body.email === '' || req.body.password === '' || findExistingEmail(req.body.email)) {
    const status = 400;
    res
      .status(status)
      .send('error');
  } else {
    users[userId] = {
      id: userId,
      email: req.body.email,
      password: bcrypt.hashSync(password, 10)
    };
  }
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.get('/login', (req, res) => { // display login page
  let userId = req.cookies['user_id'];
  const templateVars = {user: users[userId]};
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => { // login and redirect to either /urls or 403
  const email = req.body.email;
  const password = req.body.password;
  const userId = findUserIdByEmail(email);
  // if (!userId) {
  // }
  // if (users[userId] && password === users[userId].password) {
  if(email.length === 0 || password.length === 0){
    res.status(403).send('Email or Password is invalid');
  } else if (!userId && !bcrypt.compareSync(password, userId.password)){
    res.status(403).send("User or Password doesn't match");
  }
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => { // logout and direct to main page
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/urls/:shortURL', (req, res) => { // short URL page, you can long url here edit here
  let userId = req.cookies['user_id'];
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId],
    error: users[userId] ? null : 'Please Login or Register first' };
  if (userId) {
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL', (req, res) => { // change to long url and go back to my urls
  let userId = req.cookies['user_id'];
  if (!users[userId]) {
    res.status(403).send('Not Found');
  } else {
    const shortURL = req.params.shortURL;
    const newLongURL = req.body.longURL;
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect('/urls');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => { // deleting urls from my urls
  let userId = req.cookies['user_id'];
  if (!users[userId]) {
    res.status(403).send('Not Found');
  } else {
    const deleteToggle = req.params.shortURL;
    delete urlDatabase[deleteToggle];
    res.redirect('/urls');
  }
});

app.listen(PORT, () => { // my port
  console.log(`Example app listening on port ${PORT}!`);
});