
module.exports = {

  santizeUserObjects: function(users) {
    var cleanUsers = [];
    for (i = 0; i < users.length; i++) {
      var cleanUser = {
        displayName: users[i].local.displayName,
      }
      cleanUsers.push(cleanUser);
    }
    return cleanUsers;
  },

  santizeUserObject: function(user) {
    return santizeUserObjects([user])[0];
  }


};