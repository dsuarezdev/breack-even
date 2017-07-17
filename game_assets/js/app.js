/*
 * General javascript file
 * By @davoscript v.1
 */

var appbox = document.getElementById('appbox');

function appinit(o){


    // URL PARAMS
    var gameId      = getQueryVariable('i');
    var playerEmail = getQueryVariable('e');
    var playerToken = getQueryVariable('t');


    var item_type = '';
    var item_title = '';
    var result = {};
    var gameResult = {};
    var _max;
    var _chart;
    var chart;
    var _xaxis;
    var _yaxis;
    var _color;
    var scenario;

    // GLOBALS
    var gameData = {};
    var currentPlayerResults = [];
    var socket;
    var hubURL = '';
    var appURL = o.site_url;
    var clientID  = '';
    var debriefData;

    // ELEMENTS
    var loader = document.getElementById('loader');
    var popup = document.getElementById('popup');


    // Chart
    _chart;

    makeNavigable( appbox, document.getElementById('splash') );


    // ******************************
    // CONNECT & GET GAME INFO
    // ******************************

        // Init & Connect Socket
        socket = io.connect(o.io_domain, {path: o.io_path});

        // Enter the Game
        socket.emit('enter', {game_id: gameId, email: playerEmail, token: playerToken}, function(game){

            // Any errors?
            if( game.error )
                return console.log(game.error);

            // Nice, the game exists and we've joined!
            if( game._id ){

                gameData = game;
                console.log('gameData', gameData);

                // If game is "finalized", then *return* and move to the summary
                if( game.status == 'finalized' ){
                    toFrame(appbox, 'debrief-1', 'R', 'L', 300, false );
                    loader.classList.add('loading');
                }

                // If game is launched & started
                if( game.status == 'launched' ){

                     /* Screen 1 - WALKTHROUGH */
                    document.getElementById('begin').addEventListener('click', function(){
                        toFrame(appbox, 'item-type-selection', 'R', 'L', 300, false );
                        loader.classList.add('loading');
                    });

                }

            }

        });

        socket.on('finalize', function(){

            toFrame(appbox, 'debrief-1', 'R', 'L', 300, false );

        });

    // ******************************
    // END: CONNECT & GET GAME INFO
    // ******************************

    var menuAbout = document.getElementById('about');
    menuAbout.addEventListener('click', function(){
        document.getElementById('popup').innerHTML = 'About';

       var aboutHTML = '';
        aboutHTML += '<div class="text-center" style="padding:0 20px 0 20px;">';
        aboutHTML +=    '<p class="mt30"><i>Author: Maurice Schweitzer</i></p>';
        aboutHTML +=    '<div class="mt40" style="margin-left:-20px; margin-right:-20px;">';
        aboutHTML +=        '<img src="assets/wharton-simcase.png" class="img-responsive" alt="Logo"></div>';
        aboutHTML +=    '</div>';
        aboutHTML +=    '<p class="mt40">Copyright © 2016, The Wharton School, The University of Pennsylvania</p>';
        aboutHTML += '</div>';

       alertModal('About', aboutHTML);

    });

    /**********************************************/
    /**************** GAME SCREENS ****************/
    /**********************************************/

    /* Screen 2 - ITEM TYPE SELECTION */
    var screen2 = document.getElementById('item-type-selection');
    screen2.sreadyin = function(){

        $('#item-type-options').children().each(function () {
            $(this).find("span").click(function(){
                item_type = $(this).attr('id');
                startScenario(item_type);
                toFrame(appbox, 'level-selection', 'R', 'L', 300, false );
                loader.classList.add('loading');
            });
        });

        getCurrentResults();

    }


    /* Screen 3 - LEVEL SELECTION */
    var screen3 = document.getElementById('level-selection');
    screen3.sreadyin = function(){
        console.log(result);
        // Cost Active
        if (result.revenue_complete && result.cost_complete){
            $("#total-cost").html("Total Cost: $" + formatNumber(result.costData.totalCost));
            $("#cost-per-unit").html("Shipping Cost/Unit: $" + formatNumber(result.costData.costPerUnit));
            $("#cost-start").removeClass('active');
            $("#profit-icon").addClass('active');
            $("#cost-progress").addClass('complete');
            $("#total-profits").html("Total Profit: $" + formatNumber(result.calculations.profit));

            var profitContainer = document.getElementById('profit-container');
            var menuButton = document.createElement('button');
            menuButton.setAttribute('id', 'menuButton');
            menuButton.classList.add('btn');
            menuButton.classList.add('btn-success');
            menuButton.classList.add('btn-lg');
            menuButton.classList.add('btn-block');
            menuButton.classList.add('mt20');
            menuButton.innerHTML = "Select Next Item";
            profitContainer.appendChild(menuButton);

            $('#menuButton').click(function(){
                toFrame(appbox, 'item-type-selection', 'R', 'L', 300, false );
                loader.classList.add('loading');
            })

        } else if (result.revenue_complete){

            $("#total-revenue").html("Total Revenue: $" + formatNumber(result.revData.finalRevenue));
            $("#revenue-price").html("Optimal Price: $" + result.revData.price.value);
            $("#revenue-units-sold").html("Units Sold: " + currencyFormat(result.calculations.unitsSold.value));
            $("#cost-units-sold").html("Units Sold: " + currencyFormat(result.calculations.unitsSold.value));
            $("#revenue-start").off('click');
            $("#revenue-start").removeClass('active');
            $("#revenue-progress").addClass('complete');
            $("#cost-start").click(function(){
                toFrame(appbox, 'cost-selection', 'R', 'L', 300, false );
                loader.classList.add('loading');
            });
            $("#cost-start").addClass('active');

        }
        else {
            //RESET Data
            resetLevelSelection();
            resetRevenueSelection();
            $("#revenue-start").click(function(){

                toFrame(appbox, 'revenue-selection', 'R', 'L', 300, false );
                loader.classList.add('loading');

            });
        }

        loader.classList.remove('loading');

    }


    /* Screen 4 - REVENUE SELECTION */
    var screen4 = document.getElementById('revenue-selection');
    screen4.sreadyin = function(){

        _chart = 'chart_div';
        _xaxis = 'Price';
        _yaxis = 'Revenue';
        _data = [];
        displayChart(true);

        result.revData = {};
        result.items = [];

        result.items[0] = generateItemData( scenario.revenue_info );
        result.items[1] = generateItemData( scenario.revenue_info );
        result.items[2] = generateItemData( scenario.revenue_info );

        setCorrectItem();

        result.revData.selectedItem = -1;

        _max = Math.max(result.items[0].revenue, result.items[1].revenue, result.items[2].revenue) + 500;

        // Show item on screen
        var itemsGrid = document.getElementById('items-grid');
        result.items.forEach(function(item, item_idx){

            var itemDiv = document.createElement('div');
            itemDiv.classList.add('item-wrap');
            itemDiv.classList.add('col3');

            var itemImg = document.createElement('img');
            itemImg.classList.add('img-responsive');
            itemImg.src = appURL + '/game_assets/assets/content/'+ scenario.name + '_item_' + (item_idx+1) + '.jpg';

            itemDiv.appendChild(itemImg);
            itemsGrid.appendChild(itemDiv);

            // When item is selected
            itemDiv.addEventListener('click', function(){

                // Mark item div and object as selected
                [].forEach.call(itemsGrid.querySelectorAll('.item-wrap'), function(it, itx) {
                    it.classList.remove('selected');
                });
                itemDiv.classList.add('selected');

                // Set the graph color
                if( item_idx == 0 ) _color = 'blue';
                if( item_idx == 1 ) _color = 'red';
                if( item_idx == 2 ) _color = 'green';

                // Display the graph
                _data = item.graphData;
                displayChart(true);


                // Fill the table data
                document.getElementById('formula_val').innerHTML = item.formula_text ;
                document.getElementById('s2_formula_val').innerHTML = item.formula_text;

                result.revData.selectedItem = item_idx;

            });

        });

        loader.classList.remove('loading');

        // Confirm selection
        var confirmItemSelection = document.getElementById('confirm-item-selection');
        confirmItemSelection.addEventListener('click', function(){

            if( hasSelectedItem( result ) ){
                result.items[result.revData.selectedItem].selected = true;
                toFrame(appbox, 'set-price', 'R', 'L', 300, false );
                loader.classList.add('loading');
            }else{
                alertModal('Select an Item', 'You must select an item to advance.');
            }

        });

    };


    /* SCREEN-5 - SET PRICE */
    var screen5 = document.getElementById('set-price');
    screen5.sreadyin = function(){

        loader.classList.remove('loading');

        $("#help-1").click(function(){
            var title = "Set Optimal Price";
            var body = "<strong>Remember</strong>, you want to find the optimal price to maximize revenue.  Mathematically, this means you want to know the value of p when the slope of the tangent line at p is zero.  In other words, you will need to set the derivative of the revenue function to 0 and solve for p.";
            alertModal(title, body);
        });

        $("#help-2").click(function(){
            var title = "Math Cheat Sheet";
            var body = '';
            var imgElement = document.createElement('img');
            imgElement.src = appURL + '/game_assets/assets/content/cheat_sheet.png';
            imgElement.setAttribute("width" ,'100%');
            alertModal(title, body);
            document.getElementById('alertModalBody').appendChild(imgElement);

        });

        // Confirm revenue calculation
        var confirmRevenueCalculation = document.getElementById('confirm-revenue-calc');
        confirmRevenueCalculation.addEventListener('click', function(){

            var myRevCalc = document.getElementById('calculation-price');
            if( myRevCalc.value.trim() == '' || isNaN(myRevCalc.value.trim())  ){
                document.getElementById('calculation-price').focus();
                return false;
            }


            var calcCorrect = (result.items[result.revData.selectedItem].price == myRevCalc.value) ? true : false;
            result.calculations = {};
            result.revData.finalRevenue = mainFormula( result.items[result.revData.selectedItem].a, result.items[result.revData.selectedItem].b, result.items[result.revData.selectedItem].c, myRevCalc.value, result.items[result.revData.selectedItem].formula );
            result.revData.price = { value: myRevCalc.value, correct: calcCorrect };
            result.calculations.unitsSold = { value: (result.revData.finalRevenue/result.revData.price.value) }

            toFrame(appbox, 'revenue-result', 'R', 'L', 300, false );
            loader.classList.add('loading');

        });
    };


     /* SCREEN-6 - REVENUE RESULT */
    var screen6 = document.getElementById('revenue-result');
    screen6.sreadyin = function(){

        // Result header
        var idealRevenue = result.items[result.revData.selectedItem].revenue;

        // Populate the Items
        populateResultItems();

        $("#help-7").click(function(){
            var title = "";
            var body = 'We solve for the number of units sold by dividing total revenue (f(p)) by the price (p).';
            alertModal(title, body);
        });

        // Box: Revenue calculation
        document.getElementById('result-rc-correct').innerHTML = currencyFormat( result.items[result.revData.selectedItem].price );
        document.getElementById('result-rc-calculation').innerHTML = currencyFormat( result.revData.price.value );
        if( result.revData.price.correct )
            document.getElementById('result-rcal-icon').classList.add('glyphicon-ok');
        else
            document.getElementById('result-rcal-icon').classList.add('glyphicon-remove');

        result.revData.idealRevenue = idealRevenue;
        result.revData.percentIdeal = Math.round((result.revData.finalRevenue / idealRevenue) * 100);
        if ( result.revData.percentIdeal < 0 ){ result.revData.percentIdeal = 0; } else {
            console.log("not negative", result.revData.percentIdeal);
        }

        _chart = 'rev_result_chart_div';
        displayChart(true);
        if ( chart.series[0].points[result.revData.price.value] ){
            chart.series[0].points[result.revData.price.value].update({ color: '#F79361', marker: {
                        enabled: true,
                        radius: 5
                    } }, true, false);
        }

        $("#rev-formula-result").html(result.items[result.revData.selectedItem].formula_text);
        $("#rev-total-result").html('$' + currencyFormat(idealRevenue));
        $("#units-total-result").html(currencyFormat(result.calculations.unitsSold.value));
        // Finish Button
        $("#finish-revenue").click(function(){
            toFrame(appbox, 'revenue-response', 'R', 'L', 300, false );
        })

        loader.classList.remove('loading');
    };

    /* SCREEN-7 - REVENUE RESPONSE */
    var screen7 = document.getElementById('revenue-response');
    screen7.sreadyin = function(){
        result.revData.freeResponse = {};
        $(".response-button").removeClass('active');
        $(".response-button").removeClass('btn-primary');
        $(".response-button").addClass('btn-info');
        $("#rb1").html( scenario.free_response.options.one );
        $("#rb2").html( scenario.free_response.options.two );
        $("#rb3").html( scenario.free_response.options.three );
        $("#response-question").html( scenario.free_response.question);
        $("#response-info").html( scenario.free_response.info);
        $("#revenue-response-text").val("");

        $("#revenue-response-buttons").children().each(function () {
            $(this).click(function(){
                $(".response-button").removeClass('active');
                $(".response-button").removeClass('btn-primary');
                $(".response-button").addClass('btn-info');
                $(this).removeClass('btn-info');
                $(this).addClass('btn-primary');
                $(this).addClass('active');
                result.revData.freeResponse.action = $(this).html();
            });
        });

        // Finish Button
        $("#finish-revenue-response").click(function(){
            if (result.revData.freeResponse.action && $("#revenue-response-text").val() != ''){
                result.revData.freeResponse.answer = $("#revenue-response-text").val();
                result.revenue_complete = true;
                toFrame(appbox, 'level-selection', 'R', 'L', 300, false );
                loader.classList.add('loading');
            } else {
                alertModal("Complete Response", 'Please select an action and complete the free response.');
            }
        })

        loader.classList.remove('loading');

    };


    /* Screen 8 - COST SELECTION */
    var screen8 = document.getElementById('cost-selection');
    screen8.sreadyin = function(){

        $("#help-3").click(function(){
            var title = "Set Optimal Cost";
            var body = "<strong>Remember</strong>, you want to find the optimal number of days (d) to minimize costs.  Mathematically, this means you want to know the value of d when the slope of the tangent line at d is zero.  In other words, you will need to set the derivative of the cost function to 0 and solve for d..";
            body += "<br><br><strong>Why does the cost curve look like this?</strong><br>Faster shipping naturally incurs a variety of costs (priority mail, air freight vs ground etc.) which is why smaller d are more expensive.  Slower shipping options accrue inventory holding costs that can be particularly high for larger items.  Additionally, you may induce a penalty to your customer satisfaction which may impact future sales.";
            alertModal(title, body);
        });

        $("#help-4").click(function(){
            var title = "Math Cheat Sheet";
            var body = '';
            var imgElement = document.createElement('img');
            imgElement.src = appURL + '/game_assets/assets/content/cheat_sheet2.png';
            imgElement.setAttribute("width" ,'100%');
            alertModal(title, body);
            document.getElementById('alertModalBody').appendChild(imgElement);

        });

        var costData = generateCostData(scenario.cost_info, scenario.name);
        result.costData = costData;

        _max = 50;
        _yaxis = "Cost Per Unit";
        _xaxis = "Days";
        _chart = 'cost_chart_div';
        _data = costData.graphData;
        displayChart(false);

        $("#cost_formula_val").html(result.costData.formulaText);

        // Confirm selection
        var confirmCostSelection = document.getElementById('confirm-cost-selection');
        confirmCostSelection.addEventListener('click', function(){
            var myCalc = document.getElementById('calculation-days');
            if( myCalc.value.trim() == '' || isNaN(myCalc.value.trim()) ){
                document.getElementById('calculation-days').focus();
                return false;
            }
            result.costData.daysChosen = $("#calculation-days").val();
            result.costData.correct = (result.costData.optimalDays == result.costData.daysChosen);

            result.costData.costPerUnit = getCostPerUnit(result.costData, result.costData.daysChosen,  scenario.cost_info.formula);
            result.costData.idealCostPerUnit = getCostPerUnit(result.costData, result.costData.optimalDays, scenario.cost_info.formula);
            result.costData.totalCost = result.costData.costPerUnit * result.calculations.unitsSold.value;
            result.costData.idealCost = result.costData.idealCostPerUnit * result.calculations.unitsSold.value;
            result.costData.percentIdeal = Math.round((result.costData.idealCost / result.costData.totalCost) * 100);
            if (result.costData.percentIdeal < 0){ result.costData.percentIdeal = 0; }

            console.log(result);
            toFrame(appbox, 'cost-result', 'R', 'L', 300, false );
            loader.classList.add('loading');
        });

        loader.classList.remove('loading');
    };


    /* SCREEN-9 - COST RESULT */
    var screen9 = document.getElementById('cost-result');
    screen9.sreadyin = function(){

        _chart = 'cost_result_chart_div';
        displayChart(true);
        var index = (1 / scenario.cost_info.range.step) * (result.costData.daysChosen-1);
        if(chart.series[0].points[index]){
            chart.series[0].points[index].update({ color: '#F79361', marker: {
                        enabled: true,
                        radius: 5
                    } }, true, false);
        }
        // Box: Revenue calculation
        document.getElementById('result-cost-correct').innerHTML = result.costData.optimalDays;
        document.getElementById('result-cost-calculation').innerHTML = result.costData.daysChosen;
        if( result.costData.correct )
            document.getElementById('result-cost-icon').classList.add('glyphicon-ok');
        else
            document.getElementById('result-cost-icon').classList.add('glyphicon-remove');

        $("#cost-formula-result").html(result.costData.formulaText);
        $("#cost-unit-result").html('$' + result.costData.costPerUnit);

        // Finish Button
        $("#finish-cost").click(function(){
            if(!result.cost_complete){
                result.cost_complete = true;
                result.calculations.profit = result.revData.finalRevenue - result.costData.totalCost;

                gameResult = {game_id: gameId, user_id: playerEmail, result: result, scenario_type: result.item_type};

                socket.emit('result', gameResult, function(insertedResult){
                    console.log('Inserted Result', insertedResult);
                    gameResult = {};
                    // Any errors?
                    if( insertedResult.error )
                        return console.log(insertedResult.error);

                    // Nice, the game exists and we've joined!
                    if( insertedResult.game_id ){

                        toFrame(appbox, 'level-selection', 'R', 'L', 300, false );
                        resetRevenueSelection();
                        loader.classList.add('loading');

                    }

                });
            }
        });

        loader.classList.remove('loading');
    };


    /**********************************************/
    /**************** /GAME SCREENS ***************/
    /**********************************************/

    /**********************************************/
    /**************** HELPERS *********************/
    /**********************************************/

    function startScenario(item_type){

        jQuery.ajax({
                method: 'get',
                url: appURL + '/scenario/' + item_type,
                success: function(scn){

                    console.log(scn);
                    // Store the simcase complete data
                    scenario = scn[0];

                    // Set the scenario result name
                    result = {};
                    result.item_type = scenario.name;
                    result.scenario = scenario;
                    result.revenue_complete = false;
                    result.cost_complete = false;

                },
                error: function(data, status){
                    // If request was rejected (401 = Unauthorized)
                    if( data.status == 401){
                        window.location = serverAPI + 'oauth/authorize?client_id=' + clientID + '&response_type=token&redirect_uri=' + serverURL + 'menu/&scope=student';
                    }
                }
            });

            loader.classList.remove('loading');
    }



    function getCurrentResults(){

        socket.emit('getPlayerResults', { game_id: gameId, user_id: playerEmail, token: playerToken }, function(currentResults){
                console.log('Current Player Results', currentResults);

                // Any errors?
                if( currentResults.error ){
                    return console.log(currentResults.error);
                }
                setItemSelections(currentResults);

            });

    }


    function setItemSelections(currentResults){
        currentResults.forEach(function(curResult){
           if (curResult.scenario_type == "retail"){
               $("#retail-icon").addClass("complete");
                $("#retail").addClass("disabled");
                $("#retail").off("click");
            } if (curResult.scenario_type == "kitchenware"){
                $("#kitchenware-icon").addClass("complete");
                $("#kitchenware").addClass("disabled");
                $("#kitchenware").off("click");
            } if (curResult.scenario_type == "electronics"){
                $("#electronics-icon").addClass("complete");
                $("#electronics").addClass("disabled");
                $("#electronics").off("click");
            }
        });

        if (currentResults.length >= 3 ){
            $('#debriefButton').removeClass('disabled');

            $('#debriefButton').click(function(){
                toFrame(appbox, 'debrief-1', 'R', 'L', 300, false );
                loader.classList.add('loading');
            })
        }

        loader.classList.remove('loading');

    }

    function populateResultItems(){
        // Box: Items
        var resultItemsGrid = document.getElementById('result-item-grid');
        console.log('populating');
        result.items.forEach(function(item, n){
            console.log(item);
            var col3 = document.createElement('div');
            col3.classList.add('col3');

            var itemWrap = document.createElement('div');
            itemWrap.classList.add('item-wrap');
            // Mark selected
            if( item.selected )
                itemWrap.classList.add('selected');

            var itemImg = document.createElement('img');
            itemImg.classList.add('img-responsive');
            itemImg.src = appURL + '/game_assets/assets/content/'+ scenario.name + '_item_' + (n+1) + '.jpg';

            var itemRevenue = document.createElement('div');
            itemRevenue.classList.add('item-over-text');
            itemRevenue.classList.add('v-center');
            itemRevenue.innerHTML = '$ ' + currencyFormat(item.revenue);

            var ticket = document.createElement('span');
            ticket.className = 'glyphicon glyphicon-ok mt10';

            var cross = document.createElement('span');
            cross.className = 'glyphicon glyphicon-remove mt10';


            // Nest the elements
            itemWrap.appendChild(itemImg);
            itemWrap.appendChild(itemRevenue);
            col3.appendChild(itemWrap);

            if( item.correct ){
                col3.appendChild( ticket );
            }else{
                if( item.selected ){
                    col3.appendChild( cross );
                }
            }

            resultItemsGrid.appendChild(col3);

        });
    }


    function setCorrectItem(){
        var maxRev = 0;
        var correctIndex = -1;

        console.log(result.items);

        result.items.forEach(function(item, n){
            if (item.revenue > maxRev){
                maxRev = item.revenue;
                correctIndex = n;
            }
        })

        result.items[correctIndex].correct = true;
    }

    function resetLevelSelection(){

        $("#total-cost").html("Calculate Total Cost" );
        $("#total-revenue").html("Calculate Net Revenue");
        $("#total-profits").html("Calculate Profit");
        $("#revenue-price").html("Optimal Price:");
        $("#revenue-units-sold").html("Units Sold:");
        $("#cost-units-sold").html("Units Sold:");
        $("#cost-per-unit").html("Shipping Cost/Unit:");
        $("#revenue-start").addClass('active');
        $("#cost-start").removeClass('active');
        $("#profit-icon").removeClass('active');
        $('#menuButton').remove();
        $("#revenue-progress").removeClass('complete');
        $("#cost-progress").removeClass('complete');

    }

    function resetRevenueSelection(){

        $("#items-grid").html('');
        $("#result-item-grid").html('');
        $("#formula_val").html('--');
        $("#calculation-price").val('');
        $("#calculation-days").val('');
        $("#result-rcal-icon").removeClass("glyphicon-ok");
        $("#result-rcal-icon").removeClass("glyphicon-remove");
        $("#result-cost-icon").removeClass("glyphicon-ok");
        $("#result-cost-icon").removeClass("glyphicon-remove");

    }

    function hasSelectedItem(result){
        return (result.revData.selectedItem == 0 || result.revData.selectedItem == 1 || result.revData.selectedItem == 2 );
    }

    function hasSelectedItem(result){
        return (result.revData.selectedItem == 0 || result.revData.selectedItem == 1 || result.revData.selectedItem == 2 );
    }

    function displayChart(revChart){
        console.log(_data);

        Highcharts.chart(_chart, {

            plotOptions: {
                series: {
                    pointStart: 1
                },
                line: {
                    marker: {
                        enabled: false
                    }
                }
            },
            credits: {
              enabled: false
            },

            tooltip: { enabled: revChart,
                        formatter: function() {
                            if (this.x % 1 == 0) {
                                return "<strong>" + _xaxis + ":</strong> " + currencyFormat(this.x) + "<br><strong>" + _yaxis + ":</strong> " + currencyFormat(this.y);
                            }
                            else return false;
                        }
                     },

            xAxis: {
                title: {
                    text: _xaxis
                },
                labels: {
                    formatter: function(){
                        if (!revChart){
                            if (this.value == 1 || this.value == 10 || this.value == 20){
                                return this.value;
                            }
                        } else {
                            return this.value;
                        }
                    }
                }
            },

            yAxis: {
                title: {
                    text: _yaxis
                },
                min: 0,
                max: _max
            },

            title:{
                text:''
            },

            legend: {
                enabled: false
            },

            series: [
                {
                name: _yaxis,
                data: _data,
                color: _color
                }
            ]


        });
        chart = $('#' + _chart).highcharts();
    }

    ////////////////////////////
    //////// DEBRIEF ///////////
    ///////////////////////////

    var debriefScreen1 = document.getElementById('debrief-1');
    debriefScreen1.sreadyin = function(){

        socket.emit('getGameResults', {game_id: gameId}, function(results){
            console.log("Game Results", results);

            updateDebrief(results);
        });

        socket.on("updateDebrief", function(results, ack){
            clearDebrief();
            updateDebrief(results);
        })

        $("#help-5").click(function(){
            var title = "";
            var body = "The game asks students to find the optimal price for an item by deriving its revenue function.  All such revenue functions are power functions (ie. quadratic or cubic.)  It may be helpful to review derivatives of this type if students are making errors here.";
            body += '<br><br><strong>Sample Formulas:</strong><br>ax<sup>3</sup> + bx<sup>2</sup> + cx'
            alertModal(title, body);
        });

        $("#help-6").click(function(){
            var title = "";
            var body = "The game asks students to find the optimal # of days (d) for shipping for an item by deriving its cost function.  All such cost functions are exponential or logarithmic functions.  In addition many formulas include either the product rule or chain rule.  It may be helpful to review derivatives of this type if students are making errors here.";
            body += '<br><br><strong>Sample Formulas:</strong><br>ax<sup>2</sup>e<sup>x</sup> + bx<sup>2</sup> + cx'
            alertModal(title, body);
        });

        $("#help-8").click(function(){
            var title = "";
            var body = "This percentage represents a student's score out of the possible maximum for revenue or minimum for cost. The lower the score, the further from the correct answer a student is.<br><br>For example: If Student A achieved $100K for total revenue on the retail item and the maximum total revenue possible was $125K, Student A would receive a score of 80% ($100K/$125K).";
            alertModal(title, body);
        });

        $('#response-btn').click(function(){
            setTimeout(function(){ displayPies() }, 1);
        });

        $('#retail-btn').click(function(){
            setTimeout(function(){ displayPies() }, 1);
        });

        $('#kitchenware-btn').click(function(){
            setTimeout(function(){ displayPies() }, 1);
        });

        $('#electronics-btn').click(function(){
            setTimeout(function(){ displayPies() }, 1);
        });

        $('#breakdown-btn').click(function(){
            setTimeout(function(){ displayBars() }, 1);
        });

        loader.classList.remove('loading');
    }

    function updateDebrief(results){
        debriefData = getResultData(results);

        displayBars();
        displayPies();

        addFactors('retail-factors', debriefData.retailRes.factors);
        addFactors('kitchenware-factors', debriefData.kitchenwareRes.factors);
        addFactors('electronics-factors', debriefData.electronicsRes.factors);

        addLeaders('retail-leaders', debriefData.retailLeaders);
        addLeaders('kitchenware-leaders', debriefData.kitchenwareLeaders);
        addLeaders('electronics-leaders', debriefData.electronicsLeaders);
        addLeaders('overall-leaders', debriefData.overallLeaders);

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
        displayPieChart('retail-pie', '', debriefData.retailRes);
        displayPieChart('kitchenware-pie', '', debriefData.kitchenwareRes);
        displayPieChart('electronics-pie', '', debriefData.electronicsRes);
    };


    function displayBars(){
        displayPercentCorrectChart('revenue-chart','Maximize Revenue', '(Power Functions)', debriefData.revCorrect);
        displayPercentCorrectChart('cost-chart', 'Minimize Cost', '(Exponential/Logarithmic Functions)', debriefData.costCorrect);
    };

}
