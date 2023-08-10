function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
           if(typeof(response) ==='number'){
             $('#cart-count').html(response)
           }
        }
    })
}

function changeProductQuantity(proId, count){
    $.ajax({
        url:'/change-quantity',
        data:{
            proId:proId,
            count:count
        },
        method:'post',
        success:(quantity)=> {
            $(`#${proId}`).val(quantity)
        }
    })
}



