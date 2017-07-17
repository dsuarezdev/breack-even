var data;

socket.emit('getGameResults', {game_id: gameObj._id}, function(results){
    console.log("Game Results", results);
    updateDebrief(results);
});

socket.on("updateDebrief", function(results, ack){
    clearDebrief();
    updateDebrief(results);
})

$('#response-btn').click(function(){
    setTimeout(function(){ displayPies() }, 1);
});

$('#breakdown-btn').click(function(){
    setTimeout(function(){ displayBars() }, 1);
});

$("#help-1").click(function(){
    var title = "";
    var body = "The game asks students to find the optimal price for an item by deriving its revenue function.  All such revenue functions are power functions (ie. quadratic or cubic.)  It may be helpful to review derivatives of this type if students are making errors here.";
    body += '<br><br><strong>Sample Formulas:</strong><br>ax<sup>3</sup> + bx<sup>2</sup> + cx'
    alertModal(title, body);
});

$("#help-2").click(function(){
    var title = "";
    var body = "The game asks students to find the optimal # of days (d) for shipping for an item by deriving its cost function.  All such cost functions are exponential or logarithmic functions.  In addition many formulas include either the product rule or chain rule.  It may be helpful to review derivatives of this type if students are making errors here.";
    body += '<br><br><strong>Sample Formulas:</strong><br>ax<sup>2</sup>e<sup>x</sup> + bx<sup>2</sup> + cx'
    alertModal(title, body);
});

$("#help-3").click(function(){
    var title = "";
    var body = "This percentage represents a student's score out of the possible maximum for revenue or minimum for cost. The lower the score, the further from the correct answer a student is.<br><br>For example: If Student A achieved $100K for total revenue on the retail item and the maximum total revenue possible was $125K, Student A would receive a score of 80% ($100K/$125K).";
    alertModal(title, body);
});

function updateDebrief(results){
    data = getResultData(results);
    displayBars();
    displayPies();

    addFactors('retail-factors', data.retailRes.factors);
    addFactors('kitchenware-factors', data.kitchenwareRes.factors);
    addFactors('electronics-factors', data.electronicsRes.factors);

    addLeaders('retail-leaders', data.retailLeaders);
    addLeaders('kitchenware-leaders', data.kitchenwareLeaders);
    addLeaders('electronics-leaders', data.electronicsLeaders);
    addLeaders('overall-leaders', data.overallLeaders);

}

function clearDebrief(){

    clearRows('retail-factors');
    clearRows('kitchenware-factors');
    clearRows('electronics-factors');
    clearRows('retail-leaders');
    clearRows('kitchenware-leaders');
    clearRows('electronics-leaders');
    clearRows('overall-leaders');

}

function displayPies(){
    displayPieChart('retail-pie', '', data.retailRes);
    displayPieChart('kitchenware-pie', '', data.kitchenwareRes);
    displayPieChart('electronics-pie', '', data.electronicsRes);
};

function displayBars(){
    displayPercentCorrectChart('revenue-chart','Maximize Revenue', '(Power Functions)', data.revCorrect);
    displayPercentCorrectChart('cost-chart', 'Minimize Cost', '(Exponential/Logarithmic Functions)', data.costCorrect);
};
