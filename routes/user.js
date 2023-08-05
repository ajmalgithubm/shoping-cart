const express = require('express')
const router = express.Router()

router.get('/', (req,res) => {
    res.render('user/products', {admin:false, title:'shoping cart'})
})

module.exports = router