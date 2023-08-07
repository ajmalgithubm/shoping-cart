const express = require('express')
const router = express.Router();
const productHelpers = require('../helpers/productHelpers')
const userhelpers = require('../helpers/userhelpers');

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
    if(req.session.status){
        res.redirect('/')
    }else{
        res.render('user/signup')
    }
})

router.post('/login', (req, res) => {
    userhelpers.doLogin(req.body, (result) => {
        if(result){
            req.session.userName = result.fname+' '+result.lname;
            req.session.status = true;
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
            res.redirect('/login')
        } else {
            res.redirect('/signup')
        }
    })
})


module.exports = router