const admin =require('firebase-admin');
var serviceAccount = require('./react-firebae-curd-firebase.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://react-firebae-curd.firebaseio.com"
});


const db=admin.firestore();

module.exports = {admin, db};