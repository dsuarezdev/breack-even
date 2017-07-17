var hundredMinus = function (element) {
    if (element){
       return round(100 - element, 2);
    } else {
        return 0;
    }
}

function displayPercentCorrectChart(container, title, subtitle, correctArray){
    //console.log(revenue_data);

    Highcharts.chart(container, {
    chart: {
        type: 'column'
    },
    title: {
        text: title
    },
    subtitle: {
        text: subtitle
    },
    credits: {
          enabled: false
        },
    xAxis: {
        categories: [
            'Retail',
            'Kitchenware',
            'Electronics'
        ],
        crosshair: true
    },
    yAxis: {
        min: 0,
        max: 100,
        title: {
            text: '% of answers'
        }
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f}%</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    plotOptions: {
        column: {
            stacking: 'normal',
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: {
                enabled: true,
                color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                format: "{y}%"
            }
        }
    },
    series: [{
        name: 'Correct',
        data: correctArray,
        color: '#5cb85c',
        index:1

    }, {
        name: 'Incorrect',
        data: correctArray.map(hundredMinus),
        color: '#d9534f',
        index:0

        }
    ]});

}

function displayPieChart(container, title, data){
    // Build the chart
    var initializeChart = Highcharts.chart(container, {
        chart: {
            type: 'pie',
        },
        title: {
            text: title
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    distance: -100,
                    format: "{y}%"
                },
                showInLegend: true
            }
        },
        credits: {
          enabled: false,
        },

        series: [{
            name: 'Answers',
            colorByPoint: true,
            data: [{
                name: data.answer1.answer,
                y: data.answer1.value
            }, {
                name: data.answer2.answer,
                y: data.answer2.value,
            }, {
                name: data.answer3.answer,
                y: data.answer3.value
            }]
        }]
    });

}


function getResultData(results){
    // Revenue % Correct [Retail, Kitchenware, Electronics]
            var retailRevCorrectPercents = [];
            var kitchenwareRevCorrectPercents = [];
            var electronicsRevCorrectPercents = [];
            var revCorrectPercents = [0, 0, 0];
            // Cost % Correct [Retail, Kitchenware, Electronics]
            var retailCostCorrectPercents = [];
            var kitchenwareCostCorrectPercents = [];
            var electronicsCostCorrectPercents = [];
            var costCorrectPercents = [0, 0, 0];

            //LeaderBoards
            var retailLeaders = [];
            var kitchenwareLeaders = [];
            var electronicsLeaders = [];
            var overallLeaders = [];
            var averageResults = {};

            var retailRes = {}
            retailRes.answer1 = {answer: "Raise Price", value: 0};
            retailRes.answer2 = {answer: "Maintain Price", value: 0};
            retailRes.answer3 = {answer: "Pull Item", value: 0};
            var retailFactors = [];

            var kitchenwareRes = {}
            kitchenwareRes.answer1 = {answer: "Raise Price", value: 0};
            kitchenwareRes.answer2 = {answer: "Maintain Price", value: 0};
            kitchenwareRes.answer3 = {answer: "Pull Item", value: 0};
            var kitchenwareFactors = [];

            var electronicsRes = {}
            electronicsRes.answer1 = {answer: "Pull Item", value: 0};
            electronicsRes.answer2 = {answer: "Maintain Price", value: 0};
            electronicsRes.answer3 = {answer: "Lower Price", value: 0};
            var electronicsFactors = [];


            results.forEach(function(res){

                var averagePercentIdeal = (res.result.revData.percentIdeal + res.result.costData.percentIdeal)/2;

                if (!averageResults[res.user_id]){
                    averageResults[res.user_id] = [];
                }
                averageResults[res.user_id].push(averagePercentIdeal);

                if (res.scenario_type == 'retail'){

                    retailRevCorrectPercents.push(res.result.revData.percentIdeal);
                    retailCostCorrectPercents.push(res.result.costData.percentIdeal);

                    retailFactors.push({action: res.result.revData.freeResponse.action, answer: res.result.revData.freeResponse.answer });

                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.one) {retailRes.answer1.value += 1};
                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.two) {retailRes.answer2.value += 1};
                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.three) {retailRes.answer3.value += 1};

                    retailLeaders.push({user: res.user_id, value: averagePercentIdeal});

                } if (res.scenario_type == 'kitchenware'){

                    kitchenwareRevCorrectPercents.push(res.result.revData.percentIdeal);
                    kitchenwareCostCorrectPercents.push(res.result.costData.percentIdeal);

                    kitchenwareFactors.push({action: res.result.revData.freeResponse.action, answer: res.result.revData.freeResponse.answer });

                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.one) {kitchenwareRes.answer1.value += 1};
                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.two) {kitchenwareRes.answer2.value += 1};
                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.three) {kitchenwareRes.answer3.value += 1};

                    kitchenwareLeaders.push({user: res.user_id, value: averagePercentIdeal});

                } if (res.scenario_type == 'electronics'){

                    electronicsRevCorrectPercents.push(res.result.revData.percentIdeal);
                    electronicsCostCorrectPercents.push(res.result.costData.percentIdeal);

                    electronicsFactors.push({action: res.result.revData.freeResponse.action, answer: res.result.revData.freeResponse.answer });

                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.one) {electronicsRes.answer1.value += 1};
                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.two) {electronicsRes.answer2.value += 1};
                    if (res.result.revData.freeResponse.action == res.result.scenario.free_response.options.three) {electronicsRes.answer3.value += 1};

                    electronicsLeaders.push({user: res.user_id, value: averagePercentIdeal});
                }

            });


        getAverageResponses(retailRes, retailRevCorrectPercents.length, retailFactors);
        getAverageResponses(kitchenwareRes, kitchenwareRevCorrectPercents.length, kitchenwareFactors);
        getAverageResponses(electronicsRes, electronicsRevCorrectPercents.length, electronicsFactors);

        revCorrectPercents[0] = round(getAvg(retailRevCorrectPercents), 2);
        revCorrectPercents[1] = round(getAvg(kitchenwareRevCorrectPercents), 2);
        revCorrectPercents[2] = round(getAvg(electronicsRevCorrectPercents), 2);

        costCorrectPercents[0] = round(getAvg(retailCostCorrectPercents), 2);
        costCorrectPercents[1] = round(getAvg(kitchenwareCostCorrectPercents), 2);
        costCorrectPercents[2] = round(getAvg(electronicsCostCorrectPercents), 2);


        jQuery.each(averageResults, function(i, val) {
            var averageIdeal = round(val.reduce(add, 0) / val.length, 1);
            overallLeaders.push({user: i, value: averageIdeal});
        });

        function add(a, b) {
            return a + b;
        }

        var getProfit = function(leaderOne, leaderTwo){return leaderOne.value < leaderTwo.value};
        retailLeaders.sort(getProfit);
        kitchenwareLeaders.sort(getProfit);
        electronicsLeaders.sort(getProfit);
        overallLeaders.sort(getProfit);



        var resultData = {
            revCorrect : revCorrectPercents,
            costCorrect : costCorrectPercents,
            retailRes : retailRes,
            kitchenwareRes : kitchenwareRes,
            electronicsRes : electronicsRes,
            retailLeaders : retailLeaders,
            kitchenwareLeaders : kitchenwareLeaders,
            electronicsLeaders : electronicsLeaders,
            overallLeaders : overallLeaders
        }

        return resultData;
}


function getAverageResponses(responses, length, factors){
    if (length){
        responses.answer1.value = round((responses.answer1.value / length) * 100, 2);
        responses.answer2.value = round((responses.answer2.value / length) * 100, 2);
        responses.answer3.value = round((responses.answer3.value / length) * 100, 2);
    } else {
        responses.answer1.value = 0;
        responses.answer2.value = 0;
        responses.answer3.value = 0;
    }
    responses.factors = factors;
}

function addFactors(container, factors){
    factors.forEach(function(factor){
        $('#' + container ).append('<tr><td>'+ factor.action +'</td><td>'+ factor.answer +'</td></tr>');
    });
}

function addLeaders(container, leaders){
    console.log('leaders', leaders);
    leaders.forEach(function(leader){
        $('#' + container ).append('<tr><td>'+ leader.user +'</td><td>'+ leader.value +'%</td></tr>');
    });
}

function clearRows(container){
    console.log("clearing", container);
    $('#' + container).empty();
    console.log("cleared");
}

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    console.log(Math.round(value * multiplier) / multiplier);
    return Math.round(value * multiplier) / multiplier;
}
