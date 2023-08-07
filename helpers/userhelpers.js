const collection = require('../config/collection');
const connection = require('../config/connection');
const bcrypt = require('bcrypt');
const database = require('../config/database');
const { ObjectId } = require('mongodb');


module.exports = {
    doSignup: (userData, callback) => {
        bcrypt.hash(userData.password, 10, (err, hash) => {
            if (err) {
                callback(false)
            } else {
                userData.password = hash;
                connection.connect((client) => {
                    client.db(database.databaseName).collection(collection.USER_COLLECTION).insertOne(userData).then((doc) => {
                        callback(doc)
                        client.close()
                    }).catch((err) => {
                        console.log("error when add user", err);
                        callback(false)
                        client.close()
                    })
                })
            }
        })
    },
    doLogin: (userData, callback) => {
        connection.connect((client) => {
            client.db(database.databaseName).collection(collection.USER_COLLECTION).findOne({ email: userData.email }).then((doc) => {
                bcrypt.compare(userData.password, doc.password, (err, result) => {
                    if (result) {
                        callback(doc)
                        client.close()
                    } else {
                        callback(false)
                        client.close()
                    }
                })
            }).catch((err) => {
                console.log(err);
                callback(false)
                client.close()
            })
        })
    },
    getUserDetails: (userId, callback) => {
        connection.connect(client => {
            if (client) {
                client.db(database.databaseName).collection(collection.USER_COLLECTION).findOne({ _id: new ObjectId(userId) }).then((doc) => {
                    callback(doc)
                }).catch(err => {
                    callback(false)
                })
            } else {
                callback(false)
            }
        })
    },
    addTocart: (proId, userId, callback) => {
        connection.connect(client => {
            if (client) {
                client.db(database.databaseName).collection(collection.CART_COLLECTION).findOne({ userId: userId }).then((doc) => {
                    if (doc) {
                        client.db(database.databaseName).collection(collection.CART_COLLECTION).updateOne({ userId: userId }, {
                            $push: {
                                productList: proId
                            }
                        }).then((doc) => {
                            // successs pushed product into database
                            callback(doc)
                            client.close()
                        }).catch(err => {
                            console.log("eerror when product is pushing into database", err)
                            callback(false)
                            client.close()
                        })
                    } else {
                        const productList = []
                        productList.push(proId)
                        client.db(database.databaseName).collection(collection.CART_COLLECTION).insertOne({ userId: userId, productList: productList }).then((doc) => {
                            // new usercart is added
                            callback(doc)
                            client.close()
                        }).catch(err => {
                            // error when ne w usercart is adding
                            callback(false)
                            console.log('error when new usercart is creatind', err);
                            client.close()
                        })
                    }
                }).catch(err => {
                    callback(false)
                })
            } else {
                // error
                callback(false)

            }
        })
    },
    getCartItems:(userId, callback)=>{
        connection.connect(client => {
            if(client){
                client.db(database.databaseName).collection(collection.CART_COLLECTION).findOne({ userId: userId }).then((doc) => {
                    callback(doc)
                }).catch(err => {
                    console.log('error occur when retriving data', err);
                    callback(false)
                })
            }else{
                callback(false)
            }
        })
    }
}