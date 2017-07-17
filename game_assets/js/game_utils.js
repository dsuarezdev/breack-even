/**
 * Removes all child nodes from a given node
 * @method clearNode
 * @param {String} node
 */
function clearNode( node ){
    var myNode = document.getElementById(node);
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}


/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}




function getRandomFloat(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

/**
* Formats a number in comma separated for thousands
* @method currencyFormat
* @param {String} nStr
* @return {String} string
*/
function currencyFormat( nStr ) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}


/**
* Generates the data for item graph
* @method generateGraphData
* @param {Object} leveldata
* @return {Object} gamedata
*/
function generateGraphData( range, slope, intercept, formula ){

    var graphData = new Array();
    var gchData = new Array();

    // ChartJS format
    var item = {
        labels: [],
        datasets: [{
            data: [],
            fillColor: "rgba(24,177,139,0.2)",
            strokeColor: "rgba(24,177,139,0.5)",
            pointColor: "rgba(24,177,139,0.9)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(24,177,139,1)"
        }]
    };
    for ( price = range.min; price <= range.max; price = price + range.step ) {

        gchData.push(['Price', 'Revenue']);
        var revenue = eval( formula );
        //if( revenue >= 0 ){
            item.labels.push( price );
            item.datasets[0].data.push( revenue );
            gchData.push([price, revenue]);
        //}

    }

    console.log( item );
    //return item;
    return gchData;

}


/**
* Generates the in-game datasets to be used in the game logic
* @method generateLevelItem
* @param {Object} leveldata
* @return {Object} gamedata
*/
function generateItemData( revenue_info ){

    console.log('*** Generating item data ***');

    var item = {};
    item.correct    = false;
    item.selected   = false;

    item.a      = getRandomInt(revenue_info.a.min, revenue_info.a.max);
    item.b      = getRandomInt(revenue_info.b.min, revenue_info.b.max);
    item.c      = getRandomInt(revenue_info.c.min, revenue_info.c.max);

    // Create the data to use in the item graph
    var graphData  = generateRevenueGraphData( item.a, item.b, item.c, revenue_info.range, revenue_info.formula );
    item.formula    = revenue_info.formula;
    item.graphData  = graphData.data;
    item.price = graphData.optimalPrice;
    item.revenue = graphData.revenue;
    item.formula_text = 'f(p) = ' + item.a.toString().replace('1', '') + 'p<sup>3</sup> + ' + item.b + 'p<sup>2</sup> + ' + item.c + 'p';

    console.log(item);
    return item;

}

/**
* Generates the data for item graph
* @method generateCostGraphData
* @param {Object} leveldata
* @return {Object} gamedata
*/
function generateRevenueGraphData( a, b, c, range, formula ){


    var gchData = [];

    var optimalPrice = 0;
    var maxRev = 0;
    for ( price = range.min; price <= range.max; price = price + range.step ) {

        var rev = eval( formula );
        if (rev > maxRev){
            optimalPrice = price;
            maxRev = rev;
        }

        gchData.push([price, rev]);

    }

    var graphData = {
        data : gchData,
        optimalPrice : optimalPrice,
        revenue: maxRev
    }

    return graphData;

}



/**
* Generates the in-game datasets to be used in the game logic
* @method generateLevelItem
* @param {Object} leveldata
* @return {Object} gamedata
*/
function getCostPerUnit(cost_data, days, formula){

    var a = cost_data.a;
    var b = cost_data.b;
    var c = cost_data.c;

    return (Math.round(100 * eval( formula )) / 100);
}

/**
* Generates the in-game datasets to be used in the game logic
* @method generateLevelItem
* @param {Object} leveldata
* @return {Object} gamedata
*/
function generateCostData( cost_info, name ){

    var a = getRandomFloat(cost_info.a.min, cost_info.a.max);
    var b = getRandomFloat(cost_info.b.min, cost_info.b.max);
    var c = getRandomFloat(cost_info.c.min, cost_info.c.max);

    // Create the data to use in the item graph
    var graphData  = generateCostGraphData( a, b, c, cost_info.range, cost_info.formula );
    var formulaText = '';
    if (name == "retail"){
        formulaText = "f(d) = " + a + "d<sup>2</sup> + " + b + "ln(d) + " + c;
    } else if (name == "kitchenware"){
        formulaText = "f(d) = " + a + "d<sup>2</sup>e<sup>d</sup> + " + b + "d + " + c;
    } else if (name == "electronics"){
        formulaText = "f(d) = " + a + "d(" + b + ")<sup>d</sup> + " + c;
    }


    console.log(graphData);

    return {a: a, b: b, c: c, graphData: graphData.data, optimalDays: graphData.optimalDays, formulaText: formulaText};
}

/**
* Generates the average of a given list of numbers
* @method getAvg
* @param [int] values
* @return int averageVal
*/
function getAvg(values) {
    var total = 0;
    var avg = 0;
    values.forEach(function(val){
        total += val;
    })
    if (values.length != 0){
        avg = total / values.length;
    }
    return avg;
}

/**
* Generates the data for item graph
* @method generateCostGraphData
* @param {Object} leveldata
* @return {Object} gamedata
*/
function generateCostGraphData( a, b, c, range, formula ){


    var gchData = [];
    var optimalDays = 0;
    var minCost = 10000;
    for ( days = range.min; days <= range.max; days = days + range.step ) {
        var roundedDays = parseFloat(days).toFixed(2);
        var cost = (Math.round(100 * eval( formula )) / 100);
        if (cost < minCost && ( roundedDays % 1 == 0)){
            roundedDays = parseInt(roundedDays);
            optimalDays = roundedDays;
            minCost = cost;
        }

        if ( roundedDays % 1 == 0){
            roundedDays = parseInt(roundedDays);
        } else {
            roundedDays = parseFloat(roundedDays);
        }

        gchData.push([roundedDays, cost]);

    }

    var graphData = {
        data : gchData,
        optimalDays : optimalDays
    }

    return graphData;

}


/**
* Calculates this simcase main formula
* @method mainFormula
* @param {Object} intercept
* @return {Object} slope
* @return {Object} price
*/
function mainFormula(a, b, c, price, formula){
    return Math.floor( eval(formula) );
}



/**
* Evaluate item selection
* @method evaluateItemSelection
* @param {Object} simResult
* @return {Object} slope
* @return {Object} price
*/
function evaluateItemSelection( simResult ){

    // Calculate max
    var max = 0;
    var maxIdx = 0;
    simResult.items.forEach(function(it, idx){
        if(it.revenue > max){
            max = it.revenue;
            maxIdx = idx;
        }
    });

    simResult.items[maxIdx].correct = true;

    // Right answer?
    return ( simResult.items[maxIdx].selected ) ? true : false;
}


/**
* Calculate item max revenue
* @method calculateMaxRevenue
* @param {Object} item
* @return {Object} item
*/
function calculateMaxRevenue( item ){



}


/**
* Clears all tables, forms and objects data after a round
* @method clearRoundData
*/
function clearRoundData( simResult ){

    // Clear the result object
    simResult = {};

    // Clear the screen-1 items grid
    clearNode('items-grid');

    // Clear the screen-1 data table
//    document.getElementById('price_val').innerHTML = '-';
    document.getElementById('formula_val').innerHTML = '-';
//    document.getElementById('inventory_val').innerHTML = '-';

    // Clear the screen-2 data table
//    document.getElementById('s2_price_val').innerHTML = '-';
    document.getElementById('s2_formula_val').innerHTML = '-';
//    document.getElementById('s2_inventory_val').innerHTML = '-';
    // Clear the projected revenue field
//    document.getElementById('projected-revenue').value = '';

    // Clear the restult-screen items grid
    document.getElementById('final-revenue').innerHTML = '';
    //document.getElementById('result-item-name').innerHTML = '';
    document.getElementById('result-rc-correct').innerHTML = '';
    document.getElementById('result-rc-calculation').innerHTML = '';
    document.getElementById('result-rcal-icon').classList.remove('glyphicon-ok');
    document.getElementById('result-rcal-icon').classList.remove('glyphicon-remove');
    clearNode('result-item-grid');

}
