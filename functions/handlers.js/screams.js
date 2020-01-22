const {db} = require('../Utils/admin');

exports.getAllScreams = (req, res) => {
    db
    .collection('Screams')
    .orderBy('createdAt','desc')
    .get()
    .then(data =>{
        let screams =[];
        data.forEach(che=>{
            screams.push({
                ScreamId: che.id,
                ...che.data()
            })
        });
        return res.json(screams);
    })
    .catch(err=> console.error(err))
}

exports.postScreams = (req,res) => {
    const newStreams = {
        body:req.body.body,
        userHandle:req.user.handle,
        createdAt: new Date().toISOString()
    };
    db
    .collection('Screams')
    .add(newStreams)
    .then(data=>{
        res.json({message:`doument ${data.id} created succesfully`});
    })
    .catch(err => {
        res.status(500).json({message:'Something went wrong'});
        console.error(err);
    })
}