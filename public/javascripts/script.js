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