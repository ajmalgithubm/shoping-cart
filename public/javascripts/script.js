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
    let currentCount = parseInt($(`#${proId}`).val())
    $.ajax({
        url:'/change-quantity',
        data:{
            proId:proId,
            count:count,
            currentCount: currentCount
        },
        method:'post',
        success:(response)=> {
            console.log(response);
            if (response.productNonZero){
                alert('Minimum One product')
            }else{
                if (response.quantity == 1){
                    $(`#increment${proId}`).hide();
                    $(`#${proId}`).val(response.quantity)
                }else{
                    $(`#increment${proId}`).show();
                    $(`#${proId}`).val(response.quantity)
                }
            }
           
        }
    })
}



