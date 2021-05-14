const checkUserByEmail = function(email, database) {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return undefined;      
};

const newRandomId = function() {
  const arr = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let random = '';
  for (let i = 0; i <= 5; i++) {
    random += arr[Math.floor(Math.random() * arr.length)];
  }
  return random;
}

module.exports = { checkUserByEmail , newRandomId };
