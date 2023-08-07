const express = require("express");
const router = express.Router();
const productHelpers = require('../helpers/productHelpers');


// const products = [
//     { name: 'Samsung', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm_3hRPHJHkB-0At9kFInSWPiH1zusqbkjX9F2GzRexRokVboC4hiRQNI0XAXc3umb6x4&usqp=CAU' },
//     { name: 'Ralme', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfYhz956tW3eRjph34xnmOD2sxiy1-bB33Sg&usqp=CAU' },
//     { name: 'Oppo', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUwSWaz1NYBViVEhqAnyoAK6P3ijTnOCAX2Q&usqp=CAU' },
//     { name: 'Iphone', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe4LhkEVth4qzxUPYxd0GCeTkO0ZDJtT8Iug&usqp=CAU' }
// ]


router.get('/', (req, res) => {
    productHelpers.getAllProduct((products) =>{
        if(products){
            res.render('admin/view-product', { admin: true, title: "admin panel", products })
        }else{
            console.log("error occur when fetching data")
        }
    })
    // 
})

router.get('/add-product', (req, res) => {
   res.render('admin/add-product', {admin:true, title:"admin panel"})
})

router.post('/add-product', (req, res) => {
    productHelpers.addProduct(req.body, (result) => {
        if(result){
            const id = result.insertedId.toString();
            req.files.image.mv('./public/images/'+id+'.jpg', (err, done) => {
                if(!err){
                    res.redirect('/admin')
                }else{
                    console.log("error occur when image storing");
                }
            })
        }else{
            console.log("Some error occur when insert product into database");
        }
    })
})

router.get('/delete-product/:id', (req, res) => {
    const id = req.params.id
    productHelpers.deleteProduct(id, (result) => {
        if(result){
            res.redirect('/admin')
        }else{
            res.send("canot delte product")
        }
    })
} )


module.exports = router