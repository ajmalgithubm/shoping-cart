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
    addToCart: (userId, proId) => {
        return new Promise((resolve, reject) => {
            connection.connect(client => {
                client.db(database.databaseName).collection(collection.CART_COLLECTION).findOne({ userId: userId }).then((user) => {
                    if (user) {
                        // if user is exist
                        const productArray = user.productList;
                        let productExist = false
                        for (let product of productArray) {
                            if (product.proId === proId) {
                                productExist = true;
                                break;
                            }
                        }
                        if (productExist) {
                            /* product already exist*/
                            connection.connect(client => {
                                client.db(database.databaseName).collection(collection.CART_COLLECTION)
                                    .updateOne({
                                        userId: userId
                                    }, {
                                        $inc: {
                                            'productList.$[outer].quantity': 1
                                        }
                                    }, {
                                        arrayFilters: [
                                            { 'outer.proId': proId }
                                        ]
                                    }).then((doc) => {
                                        resolve(doc)
                                        client.close()
                                    }).catch(err => {
                                        reject(err)
                                    })
                            })
                        } else {
                            /* this product does notexist but user is already exist */
                            const productArray = {
                                proId: proId,
                                quantity: 1
                            }
                            connection.connect(client => {
                                client.db(database.databaseName).collection(collection.CART_COLLECTION)
                                    .updateOne(
                                        {
                                            userId: userId
                                        }, {
                                        $push: {
                                            'productList': productArray
                                        }
                                    }
                                    ).then(doc => {
                                        resolve(doc)
                                        client.close()
                                    }).catch(err => {
                                        reject(err)
                                    })
                            })
                        }
                    } else {
                        const proObj = {
                            proId: proId,
                            quantity: 1
                        }
                        const documentObj = {
                            userId: userId,
                            productList: [proObj]
                        }
                        connection.connect(client => {
                            client.db(database.databaseName).collection(collection.CART_COLLECTION)
                                .insertOne(documentObj).then((doc) => {
                                    resolve(doc)
                                    client.close()
                                }).catch(err => {
                                    reject(err)
                                })
                        })
                    }
                })
            })
        })
    },
    getCartItems:(userId) => {
        return new Promise(async (resolve, reject) => {
            connection.connect(client => {
                const aggregatePipeline = [
                    {
                        $match:{
                            userId:userId
                        }
                    },{
                        $unwind:'$productList'
                    },{
                        $lookup:{
                            from:'product',
                            localField:'proId',
                            foreignField:'_id',
                            as:'productList'
                        }
                    }
                ]
                const doc = client.db(database.databaseName).collection(collection.CART_COLLECTION).aggregate(aggregatePipeline).toArray();
                resolve(doc)
            })
        })
    }
}