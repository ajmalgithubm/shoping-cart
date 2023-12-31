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
            console.log("add to cart function is called");
            connection.connect(client => {
                client.db(database.databaseName).collection(collection.CART_COLLECTION).findOne({ userId: userId }).then((user) => {
                    if (user) {
                        // if user is exist
                        const productArray = user.productList;
                        let productExist = false
                        for (let product of productArray) {
                            if (product.proId.equals(proId)) {
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
            connection.connect(async client => {
                const aggregatePipeline = [
                    {
                        $match: {
                            userId: userId
                        }
                    }, {
                        $unwind: '$productList'
                    }, {
                        $set: {
                            quantity: '$productList.quantity',
                            proId: '$productList.proId'
                        }
                    }, {
                        $project: {

                            productList: 0,

                        }
                    }, {
                        $lookup: {
                            from: 'product',
                            localField: 'proId',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    }, {
                        $unwind: '$productDetails'
                    }, {
                        $set: {
                            name: '$productDetails.name',
                            price:'$productDetails.price'
                        }
                    }, {
                        $project: {
                            productDetails: 0
                        }
                    },{
                        $set:{
                            price:{
                                $toInt:'$price'
                            }
                        }
                    },{
                        $set:{
                            totalPrice:{
                                $multiply:['$price', '$quantity']
                            }
                        }
                    },{
                        $set:{
                            proIdString:{
                                $toString:'$proId'
                            }                      
                        }
                    }
                ];
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).aggregate(aggregatePipeline).toArray();
                client.close()
                resolve(doc)
            })
        })
    },
    getTotalQuantity:(userId)=>{
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                var totalQuantity = 0;
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).findOne({userId:userId});
                if(doc){
                    for(let product of doc.productList){
                        totalQuantity += product.quantity;
                    }
                }
                resolve(totalQuantity)
            })
        })
    },
    getTotalProduct:(userId)=>{
        return new Promise((resolve, reject) => {
            connection.connect(async client =>{
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).findOne({userId:userId});
                if(doc){
                    client.close()
                    resolve(doc.productList.length)
                }else{
                    resolve(null)
                }
            })
        })
    },
    deleteCartItem:(userId, proId)=>{
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).updateOne({
                    userId: userId
                }, {
                    $pull: {
                        productList: {
                            'proId': new ObjectId(proId)
                        }
                    }
                });
                client.close()
                resolve(doc)

            })
        })
    },
    changeProductQuantity:(userId, proId, count, currentCount)=>{
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                if(count === -1 && currentCount===1){
                    client.close()
                    resolve([{
                        quantity:1,
                        productBecomeZero:true
                    }])
                }else{
                    const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).updateOne(
                        { userId: userId }, {
                        $inc: {
                            'productList.$[outer].quantity': count
                        }
                    }, {
                        arrayFilters: [
                            { 'outer.proId': proId }
                        ]
                    }
                    );
                    client.close()
                    resolve(doc)
                }
            })
        })
    },
    getProductQuantity:(userId, proId)=> {
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match:{
                            userId:userId
                        }
                    },{
                        $unwind:'$productList'
                    },{
                        $set:{
                            proId: '$productList.proId',
                            quantity:'$productList.quantity'
                        }
                    },{
                        $match:{
                            proId:proId
                        }
                    },{
                        $unwind:'$productList'
                    }
                ]).toArray()
                resolve(doc)
            })
        })
    },
    totalProductPrice:(userId, proId)=>{
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: {
                            userId: userId
                        }
                    }, {
                        $unwind: '$productList'
                    }, {
                        $set: {
                            quantity: '$productList.quantity',
                            proId: '$productList.proId'
                        }
                    }, {
                        $project: {

                            productList: 0,

                        }
                    }, {
                        $lookup: {
                            from: 'product',
                            localField: 'proId',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    }, {
                        $unwind: '$productDetails'
                    }, {
                        $set: {
                            name: '$productDetails.name',
                            price: '$productDetails.price'
                        }
                    }, {
                        $project: {
                            productDetails: 0
                        }
                    }, {
                        $set: {
                            price: {
                                $toInt: '$price'
                            }
                        }
                    }, {
                        $set: {
                            totalPrice: {
                                $multiply: ['$price', '$quantity']
                            }
                        }
                    },{
                        $match:{
                            proId:proId
                        }
                    }
                ]).toArray()
                resolve(doc[0].totalPrice)
            })
             
        })
    },
    totalCartAmount:(userId)=>{
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: {
                            userId: userId
                        }
                    }, {
                        $unwind: '$productList'
                    }, {
                        $set: {
                            quantity: '$productList.quantity',
                            proId: '$productList.proId'
                        }
                    }, {
                        $project: {

                            productList: 0,

                        }
                    }, {
                        $lookup: {
                            from: 'product',
                            localField: 'proId',
                            foreignField: '_id',
                            as: 'productDetails'
                        }
                    }, {
                        $unwind: '$productDetails'
                    }, {
                        $set: {
                            name: '$productDetails.name',
                            price: '$productDetails.price'
                        }
                    }, {
                        $project: {
                            productDetails: 0
                        }
                    }, {
                        $set: {
                            price: {
                                $toInt: '$price'
                            }
                        }
                    }, {
                        $set: {
                            totalPrice: {
                                $multiply: ['$price', '$quantity']
                            }
                        }
                    },{
                        $group:{
                            _id:'cart',
                            totalCartPrice:{
                                $sum:"$totalPrice"
                            }
                        }
                    }
                ]).toArray()
                resolve(doc)
            })
        })
    },
    productExistInCart:(userId) => {
        return new Promise((resolve, reject) => {
            console.log("user id is", userId);
            connection.connect(async client => {
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).findOne({ userId: userId })
                if(!doc){
                    resolve(false)
                }else{
                    resolve(true)
                }
            })
        })
    },
    getCartProducts:(userId) =>{
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).findOne({ userId: userId });
                if (doc) {
                    resolve(doc.productList)
                }
            })
        })
    },
    placeOrder:(userId, data)=> {
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                const user =await client.db(database.databaseName).collection(collection.ORDER_COLLECTION).findOne({userId:userId})
                const doc = await client.db(database.databaseName).collection(collection.ORDER_COLLECTION).insertOne({
                    userId: userId,
                    orders: data
                });
                resolve(doc)
            })
        })
    },
    deleteCollection :(userId) => {
        console.log('ID', userId);
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                const doc = await client.db(database.databaseName).collection(collection.CART_COLLECTION).deleteOne({userId:userId});
                client.close()
                resolve(doc)
            })
        })
    },
    getOrderList:(userId) => {
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
               const order = await client.db(database.databaseName).collection(collection.ORDER_COLLECTION).find({userId:userId}).toArray()
               client.close()
               console.log("orders is", order[0]);
               resolve(order)
            })
        })
    },
    getOrderProduct: (orderId) => {
        return new Promise((resolve, reject) => {
            connection.connect(async client => {
                const doc = await client.db(database.databaseName).collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: {
                            _id: new ObjectId(orderId),
                        }
                    },{
                        $unwind:'$orders.productList'
                    },{
                        $set:{
                            proId:'$orders.productList.proId',
                            quantity:'$orders.productList.quantity'
                        }
                    },{
                        $lookup:{
                            from:'product',
                            localField:'proId',
                            foreignField:'_id',
                            as:'productDetails'
                        }
                    },{
                        $unwind:'$productDetails'
                    },{
                        $project:{
                            orders:0
                        }
                    }
                ]).toArray()
                resolve(doc)
            })
        })
    }

}