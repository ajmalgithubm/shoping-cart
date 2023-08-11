function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart/' + proId,
        method: 'get',
        success: (response) => {  
            if (typeof (response) === 'number') {
                $('#cart-count').html(response)
            }
        }
    })
}
 
// function deleteProduct(proId){
//     $.ajax({
//         url:'/delete-cart-product/'+proId,
//         method:'get',
//         success:(response)=> {
//             // response from server give here
//             console.log(response);
//             if(response){
//                 const productDiv = document.getElementById(`productDiv${proId}`);
//                 productDiv.style.display = 'none';
//             }
//         }
//     })
// }

function changeProductQuantity(proId, count) {
    let currentCount = parseInt($(`#${proId}`).val())
    $.ajax({
        url: '/change-quantity',
        data: {
            proId: proId,
            count: count,
            currentCount: currentCount
        },
        method: 'post',
        success: (response) => {
            console.log(response);
 
            if (response.quantity == 1) {
                $(`#increment${proId}`).hide();
                $(`#${proId}`).val(response.quantity);
                $(`#totalPrice${proId}`).html('$' + formatNumber(response.totalPrice));
                $('#totalCartPrice').html(formatNumber(response.totalCartAmount))
                //totalPrice
                console.log(response.totalPrice);
            } else { 
                $(`#increment${proId}`).show();
                $(`#${proId}`).val(response.quantity); 
                $(`#totalPrice${proId}`).html('$' + formatNumber(response.totalPrice));
                $('#totalCartPrice').html(formatNumber(response.totalCartAmount));
                console.log(response.totalPrice);
            }

        }
    })
}

function deleteProduct(proId){
    $.ajax({
        url:'/delete-cart-product/'+proId,
        method:'get',
        success:(response)=> { 
            // response from server give here
            console.log(response);
            if(response){
                if(response.status){
                    const productDiv = document.getElementById(`productDiv${proId}`);
                    productDiv.style.display = 'none';
                    $('#totalCartPrice').html(formatNumber(response.totalCartPrice));
                }
            } 
        }
    })
}

function formatNumber(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



