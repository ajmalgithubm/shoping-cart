const express = require('express')
const router = express.Router();
const productHelpers = require('../helpers/productHelpers')
const userhelpers = require('../helpers/userhelpers');


function userLogedIn(req, res, next){
    if (req.session.status){
        next()
    }else{
        res.redirect('/login')
    }
}



router.get('/', (req,res) => {

    const status = req.session.status;
    const userName = req.session.userName;
    productHelpers.getAllProduct((products) => { 
        if (products) {
            res.render('user/products', {  title: "Shopping cart", products, status, userName});
        } else {
            res.send("<h1>Error Occur</h1>")
        }
    })
})

router.get('/login', (req, res) => {
    if(req.session.status){
        res.redirect('/')
    }else{
        res.render('user/login',{error:req.session.loginError})
        req.session.loginError = false
    }
})


router.get('/signup', (req, res) => {
        res.render('user/signup')
})

router.post('/login', (req, res) => {
    userhelpers.doLogin(req.body, (result) => {
        if(result){
            req.session.userName = result.fname+' '+result.lname;
            req.session.status = true;
            req.session.user = result
            res.redirect('/')
        }else{
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
                if(result){
                    req.session.status = true
                    req.session.userName = result.fname+' '+result.lname
                    req.session.user = result
                    res.redirect('/')
                }else{
                    res.redirect('/signup')
                }
            })
            
        } else {
            res.redirect('/signup')
        }
    })
})

router.get('/add-to-cart/:id',userLogedIn ,(req, res)=>{
    const userId = req.session.user._id
    const proId = req.params.id
    userhelpers.addToCart(userId, proId).then((result) => {
        res.redirect('/')
    }).catch(err => {
        res.send(err)
    })
})


router.get('/cart', userLogedIn, (req, res) => {
    const status = req.session.status
    const userName = req.session.userName
    const userId = req.session.user._id
    
   
})


module.exports = router