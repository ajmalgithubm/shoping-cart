const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://127.0.0.1:27017'; 
const databaseName = 'shopping';

function connect(done){
    
    MongoClient.connect(url).then((client) => {
        const db = client.db(databaseName);
        done(db)
    }).catch(err => {
        console.log("error when connecting",err);
        done(false)
    })
        
} 




module.exports = {
    connect
}