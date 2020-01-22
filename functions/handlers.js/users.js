const {admin,db} = require('../Utils/admin');

const config = require('../Utils/config');
const firebase = require('firebase');
firebase.initializeApp(config);
const {validateSignupData, validateLoginData} = require('../Utils/validators')
//signup
exports.signup = (req,res)=>{
    var newUser={
        email: req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirmPassword,
        handle:req.body.handle,
    };

const {valid, errors} = validateSignupData(newUser);    

if(!valid) return res.status(400).json(errors)
let noimage = "no_image.png";
// validate data
let token, userId;
db.doc(`/users/${newUser.handle}`).get()
   .then(data=>{
       if(data.exists){
           return res.status(400).json({handle:"this handle is taken"})
       }
       else{
       return  firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password)
       }
   })
   .then((data) =>{
       userId=data.user.uid
    return data.user.getIdToken();
   })    
   
   .then(idtoken=>{
       token=idtoken;
    const userCredenetials = {
        handle:newUser.handle,
        email:newUser.email,
        createdAt:new Date().toISOString(),
        imageUrl:`https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noimage}?alt=media`,
        userId
    }     
    return db.collection("users").doc(`${newUser.handle}`).set(userCredenetials);
   })

   .then(()=>{
       return res.status(201).json({token})
   })

    .catch((err)=>{
    console.error(err);
    if(err.code=="auth/email-already-in-use"){
        return res.status(500).json({ email:"email is already in use"});
    }
    else{

        return res.status(500).json({ error: err.code });
    }
}) 
}
//login
exports.login = (req, res) => {
    const user = {
        email:req.body.email,
        password:req.body.password
    };

    const {valid, errors} = validateLoginData(user);    

    if(!valid) return res.status(400).json(errors)

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
        return data.user.getIdToken();
    })
    .then(token => {
        return res.json({token});
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error:err.code});
    })

}
//uploadImage
exports.uploadImage = (req, res) => {
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busboy = new BusBoy({headers: req.headers});
    let imageFileName;
    let imageTobeUploaded = {};
    const fileBucket = config.storageBucket;
    busboy.on('file',(fieldname, file, filename, encoding, mimeType) => {
        if(mimeType !== 'image/jpeg' && mimeType !== 'image/png') {
            return res.status(400).json({error : "wrong file type submitted"})
        }
        //my.image.png
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        //12345678900.png
        imageFileName = `${Math.round(Math.random()*100000000000)}.${imageExtension}`;
        const filepath = path.join(os.tmpdir(), imageFileName);
        imageTobeUploaded = {filepath, mimeType};
        file.pipe(fs.createWriteStream(filepath)); 
    })
    busboy.on('finish', () => {
        admin.storage().bucket(fileBucket).upload(imageTobeUploaded.filepath, {
            resumable: false,
            metadata:{
                metadata:{
                    contentType:imageTobeUploaded.mimeType
                }
            }
        })
        .then( () => {
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
           return db.doc(`/users/${req.user.handle}`).update({imageUrl});
        })
        .then( () => {
            return res.json({message: "Image Uploaded Successfully"});
        })
        .catch(err => {
            console.error(err);
            return res.status(400).json({ error : err.code});
        })
    });
    busboy.end(req.rawBody);
};