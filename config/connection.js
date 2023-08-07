const {MongoClient} = require('mongodb')

const url = 'mongodb://127.0.0.1:27017'; 

function connect(done){
    
    MongoClient.connect(url).then((client) => {
        done(client)
    }).catch(err => {
        console.log("error when connecting",err);
        done(false)
    })
            
}     

module.exports = {
    connect
}