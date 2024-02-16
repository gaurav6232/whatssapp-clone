var express = require('express');
var router = express.Router();
var users = require('./users')
const passport = require('passport');
var localStrategy = require('passport-local');
var mongoose = require('mongoose')
const multer = require('multer')
const fs = require('fs');
const path = require('path');




 

  

// ... other setup ...

 

var msgModel = require('./msg')
passport.use(new localStrategy(users.authenticate()))


mongoose.connect('mongodb://0.0.0.0/whatsappR11').then(result =>{
  console.log("connect to database")
  
}).catch((err) =>{
  console.log(err) 
})



 


// Handle file uploads


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Handle file uploads
 


// Handle chat messages
 

/* GET home page. */
router.get('/', isloggedin, function(req, res, next) {
  users.findOne({
    username: req.session.passport.user
  }).then(loggedInUser =>{
    res.render('index', {user: loggedInUser});
  })
});
 
router.post('/uploadImage', async (req, res) => {
  try {
      const { fromUser, toUser, imageData } = req.body;

      const newMsg = await msgModel.create({
          fromUser,
          toUser,
          messageType: 'image',
          file: {
              data: Buffer.from(imageData, 'base64'),
              contentType: 'image/png', // Change based on the actual image type
          },
      });

      res.status(201).json({ message: 'Image uploaded successfully', newMsg });
  } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/getImage/:msgId', async (req, res) => {
    try {
        const { msgId } = req.params;

        const message = await msgModel.findById(msgId);

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        if (message.messageType !== 'image') {
            return res.status(400).json({ error: 'Not an image message' });
        }

        res.set('Content-Type', message.file.contentType);
        res.send(message.file.data);
    } catch (error) {
        console.error('Error retrieving image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/register',(req, res, next) =>{
  var newUser = {
    username: req.body.username,
    pic: req.body.pic

  };

   users.register(newUser, req.body.password)
   .then((result) => {
    passport.authenticate('local')(req, res, () =>{
      res.redirect('/');
    });
   })
   .catch((err) =>{
    res.send(err);
   });
   
});

router.get('/register',(req, res, next) =>{
  res.render('register')
})




router.get('/login', (req, res, next) =>{
  res.render('login')
})
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log('User logged in:', user.username); // Log to check if user is logged in

      // Call to set user online only when logged in
      setUserOnlineStatus(user.username);

      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated()) {
    // Call to set user offline when logged out
    setUserOfflineStatus(req.user.username);

    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});



const userModel = require('./users'); // Assuming 'user' model file

 router.post('/getUserInfo', async (req, res) => {
    const { username } = req.body;
    try {
        // Fetch user information based on the username
        const user = await userModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming 'online' and 'lastSeen' are fields in your user schema
        const { online, lastSeen } = user;

        // Send the user information as a response
        res.status(200).json({ userInfo: { online, lastSeen } });
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


function isloggedin (req, res, next){
  if(req.isAuthenticated()) return next();
  else res.redirect('/login');
}

router.post('/findUser', async (req, res, next) =>{
 var fundUsername = req.body.username
 var findUser = await users.findOne({
  username: fundUsername
 })

 if (findUser) {
  res.status(200).json({
    user: findUser
  })
 }
 else{
  res.status(404).json({
    message: 'User not found'
  })
 }
})

router.post('/findChats', isloggedin, async (req,res, next) =>{
  var oppositeUser = await users.findOne({
    username: req.body.oppositeUser
  })
  var chats = await msgModel.find({
    $or:[
      {
        toUser: req.user.username,
        fromUser: oppositeUser.username
      },
      {
        toUser: oppositeUser.username,
        fromUser: req.user.username
      }
    ]
  })
  res.json({ chats })
})

// Assuming Mongoose is used for MongoDB interactions

// Update user status when a user logs in
const setUserOnlineStatus = async (username) => {
  try {
      await userModel.findOneAndUpdate(
          { username: username },
          { online: true } // Set user as online
      );
      console.log(`${username} is online`);
  } catch (error) {
      console.error('Error setting user online:', error);
  }
};

// Update user status when a user logs out
const setUserOfflineStatus = async (username) => {
  try {
      await userModel.findOneAndUpdate(
          { username: username },
          { online: false, lastSeen: new Date() } // Set user as offline and update last seen time
      );
      console.log(`${username} is offline`);
  } catch (error) {
      console.error('Error setting user offline:', error);
  }
};

// Retrieve user's online status and last seen time
const getUserInfo = async (username) => {
  try {
      const user = await userModel.findOne({ username: username });
      if (user) {
          if (user.online) {
              // If user is online, return online status
              return { online: true };
          } else {
              // If user is offline, return last seen time
              return { online: false, lastSeen: user.lastSeen };
          }
      } else {
          return { online: false, lastSeen: null }; // User not found
      }
  } catch (error) {
      console.error('Error fetching user info:', error);
      return { online: false, lastSeen: null };
  }
};



module.exports = router;
