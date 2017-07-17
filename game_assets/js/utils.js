function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function dslog(str){
    console.log(str);
}

function clearNode(node){
    var myNode = document.getElementById(node);
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

function showPopup(popup, msj){
    popup.innerHTML = msj;
    popup.classList.add('alert');

    prefixedEventListener(popup, 'AnimationEnd', function(e){
        popup.innerHTML = '';
        popup.classList.remove('alert');
    });
}

function formatNumber(x) {
    x = x.toFixed(2);
    x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return x.replace(/[,]00$/, "");
}

function removeCommas(num) {
    var txt = num.replace(/,/g, "");
    if( isNaN(txt) )
        return 0;
    else
        return parseFloat(txt);
}

function formatPrice(price){
    price = price.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    if (price.indexOf('.') == -1){
        price = price + '.00';
    }
    return price;
}

function scrollTo(element, to, duration) {
    if (duration <= 0) return;
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 10;

    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to) return;
        scrollTo(element, to, duration - 10);
    }, 10);
}


function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
};

function containsEmailAddress(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}

/* OAuth URL Parse */
function getToken(){

    var tokens = {
        access_token: localStorage.getItem("stk"),
        token_type: localStorage.getItem("stktyp")
    }

    return tokens;

}

function storeToken( data ){
    console.log( 'Storing data: ' + data );
    if(typeof(Storage) !== "undefined") {
        // Code for localStorage/sessionStorage.
        localStorage.setItem("stk", data.access_token );
        localStorage.setItem("stktyp", data.token_type );
    } else {
        // Sorry! No Web Storage support..
        alert('Can\'t save your credentials.');
    }
}

/* Check if token exists and if it is valid */
function validToken( hubURL, clientID, appURL ){

    var token = false;

    // Logout?
    var getParams = queryString();
    console.log( getParams );

    if( getParams.logout ){

        localStorage.removeItem("stk");
        localStorage.removeItem("stktyp");
        // Clear the hash in URL
        //window.location = window.location.href.replace( /#.*/, "");
        window.location = hubURL + 'logout';
        //location.reload();

        return false;

    }else{

        // Check if there's a URL token
        if( location.hash.length > 1 ){

            console.log('Getting tokens from URL');
            var params = {},
                queryStrings = location.hash.substring(1),
                regex = /([^&=]+)=([^&]*)/g,
                m;

            while (m = regex.exec(queryStrings)) {
                params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
            }

            storeToken(params);
            token = params.access_token;

            // Clear the hash in URL
            window.location = window.location.href.replace( /#.*/, "");

            return true;

        // No URL token, try to get it from localStorage
        }else{

            // Get from localStorate
            token = localStorage.getItem("stk");

            if( token )
                return true;
            else
                window.location = hubURL + 'oauth/authorize?client_id=' + clientID + '&response_type=token&redirect_uri=' + appURL + 'menu/&scope=student'; //console.log('anda a ' + hubURL + 'oauth/authorize?client_id=' + clientID + '&response_type=token&redirect_uri=' + appURL + 'menu/&scope=student'); //

        }

    }


//    if( token ){
//        return true;
//    }else{
//        return false;
//    }

}


/* Get the ? variables from the URL */
function queryString() {
  // This function is anonymous, is executed immediately and
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  }
    return query_string;
};


/* Get specific query variables */
function getQueryVariable(variable){
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}


/* Prefix listeners for different browsers */
var pfx = ["webkit", "moz", "MS", "o", ""];
function prefixedEventListener(element, type, callback) {
    for (var p = 0; p < pfx.length; p++) {
        if (!pfx[p]) type = type.toLowerCase();
        element.addEventListener(pfx[p]+type, callback, false);
    }
}


/* Get User Data */
function getMe( hubURL, appURL, cb ){
    var tokens = getToken();

    jQuery.ajax({
        method: 'get',
        url: appURL + '/api/me',
        //headers: {"Authorization": "Bearer " + tokens.access_token},
        success: function(data, status){

            if( typeof cb == 'function'){
                cb( data );
            }

        },
        error: function(data, status){
            // If request was rejected (401 = Unauthorized)
            if( data.status == 401){
                //window.location = hubURL + 'oauth/authorize?client_id=' + clientID + '&response_type=token&redirect_uri=' + appURL + 'menu/&scope=student';
            }
        }
    });

}


/* Alert Modal */
function alertModal(title, body){
    if( jQuery('#alertModal') ){
        jQuery('#alertModalTitle').html(title);
        jQuery('#alertModalBody').html(body);
        jQuery('#alertModal').modal('show');
    }
}

/* Alert Modal */
function showAlertModal(modal, title, body){
    if( modal ){
        modal.find('.modal-title').html(title);
        modal.find('.modal-body').html(body);
        modal.modal('show');
    }
}


/* Common needed scripts */
document.addEventListener("DOMContentLoaded", function(event) {

    // SIDEMENU


    // MODAL: QUIT
    jQuery('#quitModal').on('show.bs.modal', function (event) {
        var button = jQuery(event.relatedTarget); // Button that triggered the modal
        var title = button.data('title');
        var body = button.data('body');
        var modal = jQuery(this);
        modal.find('.modal-title').text(title);
        modal.find('.modal-body').text(body);
    });

});
