const collection = require('../config/collection');
const connection = require('../config/connection');
const bcrypt = require('bcrypt');


module.exports = {
    doSignup: (userData, callback) => {
        bcrypt.hash(userData.password, 10, (err, hash) => {
            if (err) {
                callback(false)
            } else {
                userData.password = hash;
                connection.connect((db) => {
                    db.collection(collection.USER_COLLECTION).insertOne(userData).then((doc) => {
                        callback(doc)
                    }).catch((err) => {
                        callback(false)
                    })
                })
            }
        })
    },
    doLogin: (userData, callback) => {
        connection.connect((db) => {
            db.collection(collection.USER_COLLECTION).findOne({ email: userData.email }).then((doc) => {
                bcrypt.compare(userData.password, doc.password, (err, result) => {
                    if (result) {
                        callback(doc)
                    } else {
                        callback(false)
                    }
                })
            }).catch((err) => {
                console.log(err);
                callback(false)
            })
        })
    }
}