const express = require("express");
const router = express.Router();
const productHelpers = require('../helpers/productHelpers');


const products = [
    { name: 'Samsung', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm_3hRPHJHkB-0At9kFInSWPiH1zusqbkjX9F2GzRexRokVboC4hiRQNI0XAXc3umb6x4&usqp=CAU' },
    { name: 'Ralme', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfYhz956tW3eRjph34xnmOD2sxiy1-bB33Sg&usqp=CAU' },
    { name: 'Oppo', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUwSWaz1NYBViVEhqAnyoAK6P3ijTnOCAX2Q&usqp=CAU' },
    { name: 'Iphone', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe4LhkEVth4qzxUPYxd0GCeTkO0ZDJtT8Iug&usqp=CAU' }
]


router.get('/', (req, res) => {
    res.render('admin/view-product', {admin:true, title:"admin panel", products})
})

router.get('/add-product', (req, res) => {
   res.render('admin/add-product', {admin:true, title:"admin panel"})
})

router.post('/add-product', (req, res) => {
    productHelpers.addProduct(req.body, (result) => {
        if(result){
            res.send("Product added SuccessFully")
        }else{
            console.log("Some error occur when insert product into database");
        }
    })
})


module.exports = router