const functions = require('firebase-functions');

const app = require('express')();

const { getAllScreams , postScreams} = require('./handlers.js/screams');
const {signup, login, uploadImage} = require('./handlers.js/users');
const FBAuth = require('./Utils/FBAuth');

//Scream routes
app.get('/Screams', getAllScreams );
app.post("/Screams", FBAuth, postScreams);

//users route(signup, login)
app.post('/signup', signup);
app.post('/login', login);
app.post('/image', FBAuth, uploadImage);
exports.api = functions.region('asia-east2').https.onRequest(app);
