const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://127.0.0.1:27017'; 
const databaseName = 'shoppingCart';
const data = {
    db:null
}
function connect(done){
    
    MongoClient.connect(url).then((client) => {
        const db = client.db(databaseName);
        data.db = db;
        done(true)
    }).catch(err => {
        console.log(err);
        done(false)
    })
        
} 

function get(){
    return data.db
}
 


module.exports = {
    connect:connect,
    get:get
}