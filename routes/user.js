const express = require('express')
const router = express.Router();
const products = [
    { name: 'Samsung', image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm_3hRPHJHkB-0At9kFInSWPiH1zusqbkjX9F2GzRexRokVboC4hiRQNI0XAXc3umb6x4&usqp=CAU'},
    { name: 'Ralme', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfYhz956tW3eRjph34xnmOD2sxiy1-bB33Sg&usqp=CAU' },
    { name: 'Oppo', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUwSWaz1NYBViVEhqAnyoAK6P3ijTnOCAX2Q&usqp=CAU' },
    { name: 'Iphone', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe4LhkEVth4qzxUPYxd0GCeTkO0ZDJtT8Iug&usqp=CAU' }
]


router.get('/', (req,res) => {
    res.render('user/products', {admin:false, title:'shoping cart', products})
})

module.exports = router