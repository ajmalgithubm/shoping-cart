const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.render('admin/admin', {admin:true, title:"admin panel"})
})


module.exports = router