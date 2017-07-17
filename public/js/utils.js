function clearNode(node){
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
    }
}

function formatNumber(x){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatPrice(x){
    x = x.toFixed(2);
    x = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return x.replace(/[,]00$/, "");
}

function getNameFromEmail( emailAddress ){
    var string = emailAddress.substring(0, emailAddress.indexOf("@"));
    string = (string.length > 0) ? string : emailAddress;
    return string;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function range10percent(a, b){

    var bigger = Math.max(a, b);
    var smaller = Math.min(a, b);

    var delta = smaller - bigger;
    var coef = Math.abs(delta/smaller);
    var percentage = coef * 100;

    //console.log(percentage + '% : ' + smaller + ' vs ' + bigger);

    if( percentage <= 10 )
        return true;
    else
        return false;

}

function isValidEmailAddress(emailAddress) {
    var pattern = new RegExp(/^(("[\w-+\s]+")|([\w-+]+(?:\.[\w-+]+)*)|("[\w-+\s]+")([\w-+]+(?:\.[\w-+]+)*))(@((?:[\w-+]+\.)*\w[\w-+]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][\d]\.|1[\d]{2}\.|[\d]{1,2}\.))((25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\.){2}(25[0-5]|2[0-4][\d]|1[\d]{2}|[\d]{1,2})\]?$)/i);
    return pattern.test(emailAddress);
};

function containsEmailAddress(text) {
    var re = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;
    return re.test(text);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function hasDuplicates(array) {
    var valuesSoFar = Object.create(null);
    for (var i = 0; i < array.length; ++i) {
        var value = array[i];
        if (value in valuesSoFar) {
            return value;
        }
        valuesSoFar[value] = true;
    }
    return false;
}

function secondsToHms(d) {
    d = (d < 0) ? 0 : d;
    d = Number(d);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return ( (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s);
}
