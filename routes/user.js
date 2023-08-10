const express = require('express')
const router = express.Router();
const productHelpers = require('../helpers/productHelpers')
const userhelpers = require('../helpers/userhelpers');
const { ObjectId } = require('mongodb');


function userLogedIn(req, res, next) {
    if (req.session.status) {
        next()
    } else {
        res.redirect('/login')
    }
}



router.get('/', async (req, res) => {

    const status = req.session.status;
    const userName = req.session.userName;
    var totalQuantity = null;
    if (status) {
        totalQuantity = await userhelpers.getTotalProduct(req.session.user._id)
    }
    productHelpers.getAllProduct((products) => {
        if (products) {
            res.render('user/products', { title: "Shopping cart", products, status, userName, totalQuantity });
        } else {
            res.send("<h1>Error Occur</h1>")
        }
    })
})

router.get('/login', (req, res) => {
    if (req.session.status) {
        res.redirect('/')
    } else {
        res.render('user/login', { error: req.session.loginError })
        req.session.loginError = false
    }
})


router.get('/signup', (req, res) => {
    res.render('user/signup')
})

router.post('/login', (req, res) => {
    userhelpers.doLogin(req.body, (result) => {
        if (result) {
            req.session.userName = result.fname + ' ' + result.lname;
            req.session.status = true;
            req.session.user = result
            res.redirect('/')
        } else {
            req.session.loginError = true
            res.redirect('/login')
        }
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})

router.post('/signup', (req, res) => {
    userhelpers.doSignup(req.body, (result) => {
        if (result) {
            userhelpers.getUserDetails(result.insertedId.toString(), (result) => {
                if (result) {
                    req.session.status = true
                    req.session.userName = result.fname + ' ' + result.lname
                    req.session.user = result
                    res.redirect('/')
                } else {
                    res.redirect('/signup')
                }
            })

        } else {
            res.redirect('/signup')
        }
    })
})

router.get('/add-to-cart/:id', userLogedIn, (req, res) => {
    console.log("api call");
    const userId = req.session.user._id
    const proId = new ObjectId(req.params.id)
    console.log(proId);
    console.log(userId);
    userhelpers.addToCart(userId, proId).then((result) => {
        userhelpers.getTotalProduct(userId).then((quantity) => {
            res.json(quantity)
        })
    }).catch(err => {
        res.send(err)
    })
})


router.get('/cart', userLogedIn, async(req, res) => {
    const status = req.session.status
    const userName = req.session.userName
    const userId = req.session.user
    const totalCartAmount = await userhelpers.totalCartAmount(userId._id);
    let totalCartPrice = 0;
    if(!(totalCartAmount.length === 0)){
        totalCartPrice = totalCartAmount[0].totalCartPrice;
    }
    totalCartPrice = formatNum(totalCartPrice)
    console.log('Total',totalCartAmount);
    // res.render('user/cart', {status, userName, userId})
    userhelpers.getCartItems(req.session.user._id).then((productArray) => {
        console.log(productArray);
        res.render('user/cart', {
            status,
            userName,
            userId,
            productArray,
            totalCartPrice
        })
    })
 

})

router.get('/delete-cart-product/:id', async (req, res) => {
    console.log("delete product request recived at server");
    const result = await userhelpers.deleteCartItem(req.session.user._id, req.params.id)
    if (result) {
        res.redirect('/cart')
    } else {
        res.redirect('/')
    }
})


router.post('/change-quantity',async (req, res) => {
    const result = await userhelpers.changeProductQuantity(req.session.user._id, new ObjectId(req.body.proId), parseInt(req.body.count), parseInt(req.body.currentCount));
    const totalPrice = await userhelpers.totalProductPrice(req.session.user._id, new ObjectId(req.body.proId))
    const productQuantity = await userhelpers.getProductQuantity(req.session.user._id, new ObjectId(req.body.proId))
    const totalCartAmount = await userhelpers.totalCartAmount(req.session.user._id);
    console.log(totalCartAmount);
    res.json({totalPrice:totalPrice, quantity:productQuantity[0].quantity , totalCartAmount:totalCartAmount[0].totalCartPrice})
    // if(result.productBecomeZero){
    //     console.log("product become zero is called");
    //     res.json({quantity:1, productNonZero:true, totalPrice:doc})
    // }else{
    //     console.log("product no zero is called");
    //     const doc = await userhelpers.getProductQuantity(req.session.user._id, new ObjectId(req.body.proId))
    //     res.json({ quantity: doc[0].quantity, totalPrice:doc })
    // }
    //const doc = await userhelpers.getProductQuantity(req.session.user._id, new ObjectId(req.body.proId))
 
}) 
function formatNum(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = router