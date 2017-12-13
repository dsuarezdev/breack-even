$(document).ready(function() {
  var game = {
    cost: {
      unit: {
        markAdv: 1.5,
        saleCom: 0.16,
        reseDev: 1.5,
        otherFix: 0.06,
        shiBreIn: 0.6,
        varMfg: 2.7
      },
      abs: {
        markAdv: 900000,
        saleCom: 1620000,
        reseDev: 900000,
        otherFix: 35000,
        shiBreIn: 360000,
        varMfg: 96000
      },
      fixed: 35000,
      variable: 2.86
    },
    valueChain: {
      retail: 0,
      dist: 0,
      saleCom: 0,
      profit: 0
    },
    breakEven: {
      lastyProfit: 0,
      quantity: 0,
      marketShare: 0
    },
    opt: {
      markAdv: '',
      reseDev: '',
      shiBreIn: ''
    }
  };

  var validation = {
    cost: {
      btn1Clicked: false,
      btn2Clicked: false,
      btn3Clicked: false
    }
  };

  $('#game-step').text('1. Assess');

  $('#rootwizard').bootstrapWizard({
    tabClass: 'nav nav-tabs',
    nextSelector: '.wz-next',
    onTabShow: function(tab, navigation, index) {
      if (index == 1) $('#des-tab > a').addClass('visited');
      if (index == 2) $('#cost-tab > a').addClass('visited');
      if (index == 3) $('#valuec-tab > a').addClass('visited');
      if (index == 4) $('#break-tab > a').addClass('visited');
    },
    onTabChange: function(tab, navigation, index) {}
  });

  /**********************************************/
  /**************** COST LOGIC ******************/
  /**********************************************/

  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  });

  $('#unit-btn').click(function(e) {
    e.preventDefault();

    $('#ma-cost').text(formatter.format(game.cost.unit.markAdv));
    $('#sc-cost').text(formatter.format(game.cost.unit.saleCom));
    $('#rd-cost').text(formatter.format(game.cost.unit.reseDev));
    $('#of-cost').text(formatter.format(game.cost.unit.otherFix));
    $('#sbi-cost').text(formatter.format(game.cost.unit.shiBreIn));
    $('#vm-cost').text(formatter.format(game.cost.unit.varMfg));
  });

  $('#abs-btn').click(function(e) {
    e.preventDefault();

    $('#ma-cost').text(formatter.format(game.cost.abs.markAdv));
    $('#sc-cost').text(formatter.format(game.cost.abs.saleCom));
    $('#rd-cost').text(formatter.format(game.cost.abs.reseDev));
    $('#of-cost').text(formatter.format(game.cost.abs.otherFix));
    $('#sbi-cost').text(formatter.format(game.cost.abs.shiBreIn));
    $('#vm-cost').text(formatter.format(game.cost.abs.varMfg));
  });

  $('#cost-btn1').click(function() {
    if ($('#ma-opt').text() === 'Fixed Cost') {
      $('#ma-opt').text('Variable Cost');
      $('#cost-btn1').css('border-color', '#6a52ff');
    } else {
      $('#ma-opt').text('Fixed Cost');
      $('#cost-btn1').css('border-color', '#37b5bd');
    }
    validation.cost.btn1Clicked = true;
    game.opt.markAdv = $('#ma-opt').text();
    var cost =
      $('#ma-opt').text() === 'Fixed Cost' ? game.cost.abs.markAdv : game.cost.unit.markAdv;
    appendToPlCostTable('ma', 'Marketing & Advertising', cost, $('#ma-opt').text());
  });

  $('#cost-btn2').click(function() {
    if ($('#rd-opt').text() === 'Fixed Cost') {
      $('#rd-opt').text('Variable Cost');
      $('#cost-btn2').css('border-color', '#6a52ff');
    } else {
      $('#rd-opt').text('Fixed Cost');
      $('#cost-btn2').css('border-color', '#37b5bd');
    }
    validation.cost.btn2Clicked = true;
    game.opt.reseDev = $('#rd-opt').text();
    var cost =
      $('#rd-opt').text() === 'Fixed Cost' ? game.cost.abs.reseDev : game.cost.unit.reseDev;
    appendToPlCostTable('rd', 'Research & Development', cost, game.opt.reseDev);
  });

  $('#cost-btn3').click(function() {
    if ($('#sbi-opt').text() === 'Fixed Cost') {
      $('#sbi-opt').text('Variable Cost');
      $('#cost-btn3').css('border-color', '#6a52ff');
    } else {
      $('#sbi-opt').text('Fixed Cost');
      $('#cost-btn3').css('border-color', '#37b5bd');
    }
    validation.cost.btn3Clicked = true;
    game.opt.shiBreIn = $('#sbi-opt').text();
    var cost =
      $('#sbi-opt').text() === 'Fixed Cost' ? game.cost.abs.shiBreIn : game.cost.unit.shiBreIn;
    appendToPlCostTable('sbi', 'Shipping, Breakage, Insurance, etc.', cost, game.opt.shiBreIn);
  });

  $('#pl-modal-btn').click(function() {
    if (validation.cost.btn1Clicked && validation.cost.btn2Clicked && validation.cost.btn3Clicked) {
      $('#cost-confirm-btn').prop('disabled', false);
      $('#pl-alert').remove();
    }
  });

  $('#cost-confirm-btn').click(function() {
    $('#rootwizard').bootstrapWizard('next');

    Object.keys(game.opt).map(function(prop) {
      if (game.opt[prop] === 'Fixed Cost') game.cost.fixed += game.cost.abs[prop];
      else game.cost.variable += game.cost.unit[prop];
    });
  });

  function appendToPlCostTable(id, description, cost, costType) {
    var elementDes = '<span id="' + id + '-des">' + description + '</span>';
    var elementVal = '<span id="' + id + '-val">' + formatter.format(cost) + '</span>';

    $('#' + id + '-des').remove();
    $('#' + id + '-val').remove();

    if (costType === 'Variable Cost') {
      $('#var-cost-des').append(elementDes);
      $('#var-cost-value').append(elementVal);
    }
    if (costType === 'Fixed Cost') {
      $('#fixed-cost-des').append(elementDes);
      $('#fixed-cost-value').append(elementVal);
    }
  }

  /**********************************************/
  /**************** /COST LOGIC ******************/
  /**********************************************/

  /**********************************************/
  /**************** VALUE CHAIN LOGIC ***********/
  /**********************************************/

  $('#retail-cost-input, #dist-cost-input, #sc-cost-input, #con-cost-input').jStepper({
    minValue: 0,
    maxValue: 30,
    allowDecimals: true,
    maxDecimals: 2
  });

  $('#retail-cost-btn').addClass('vc-btn-back');
  document.getElementById('retail-cost-input').focus();

  $('#retail-cost-input').keyup(function(e) {
    $('#price-cost').text(parseFloat($('#retail-cost-input').val()).toFixed(2));
    $('#retail-next-btn').removeClass('hide');
    errorAlert(e);
  });

  $('#dist-cost-input').keyup(function(e) {
    $('#price-cost').text(parseFloat($('#dist-cost-input').val()).toFixed(2));
    $('#dist-next-btn').removeClass('hide');
  });

  $('#sc-cost-input').keyup(function(e) {
    $('#price-cost').text(parseFloat($('#sc-cost-input').val()).toFixed(2));
    $('#sc-next-btn').removeClass('hide');
    $('#price-cost').css('color', 'inherit');
  });

  $('#con-cost-input').keyup(function(e) {
    $('#con-next-btn').removeClass('hide');
  });

  $('#retail-next-btn').click(function() {
    $('#dist-cost-input').focus();

    $('#dist-cost-btn').addClass('vc-btn-back');
    $('#retail-cost-btn, #mfg-cost-btn').removeClass('vc-btn-back');

    $('#dist-wrapper').removeClass('hide');
    $('#retail-wrapper, #mfg-wrapper, #con-wrapper').addClass('hide');
    document.getElementById('dist-cost-input').focus();

    game.valueChain.retail = parseFloat($('#price-cost').text());

    $('#last-price h4:first').text('Dist. Price');
    $('#last-price h4:last').text('€' + $('#price-cost').text());
    $('#margin-unit h4:last').text('15%');
    $('#next-price h4:first').text('Mfg. Price');
    $('#price-cost').text('');
  });

  $('#dist-next-btn').click(function() {
    $('#mfg-cost-btn').addClass('vc-btn-back');
    $('#retail-cost-btn, #dist-cost-btn').removeClass('vc-btn-back');

    $('#mfg-wrapper').removeClass('hide');
    $('#retail-wrapper, #dist-wrapper, #con-wrapper').addClass('hide');
    document.getElementById('sc-cost-input').focus();

    game.valueChain.dist = parseFloat($('#price-cost').text());

    $('#last-price h4:first').text('Mfg. Price');
    $('#last-price h4:last').text('€' + $('#price-cost').text());
    $('#margin-unit h4:first').text('Unit *');
    $('#margin-unit h4:last').text('€');
    $('#next-price h4:first').text('Var. Cost');
    $('#price-cost')
      .text('[Pending]')
      .css('color', 'red');
  });

  $('#sc-next-btn').click(function() {
    game.valueChain.saleCom = parseFloat($('#price-cost').text());

    $('#con-wrapper').removeClass('hide');
    $('#retail-wrapper, #dist-wrapper, #mfg-wrapper').addClass('hide');

    document.getElementById('con-cost-input').focus();
  });

  $('#con-next-btn').click(function() {
    game.valueChain.profit = parseFloat($('#con-cost-input').val());
    game.cost.variable += game.valueChain.saleCom;
    breakEvenChart();
  });

  function errorAlert(e) {
    var sum = parseFloat($('#retail-cost-input').val()) + parseFloat(e.key);

    var alert = `<div id="valuec-alert" class="alert alert-info">
                  <strong>Too high Icarus!</strong> Our product retails at €30.00 so that is our input ceiling. Revisit you calculations and try again.
                </div>`;

    if (sum > 30 || sum < 0) {
      $('#screen3').append(alert);
      setTimeout(function() {
        $('#valuec-alert').remove('');
      }, 3000);
    }
  }

  /**********************************************/
  /**************** /VALUE CHAIN LOGIC **********/
  /**********************************************/

  /**********************************************/
  /**************** BREAK-EVEN LOGIC ************/
  /**********************************************/

  $('#lasty-profit-input, #be-qty-input').jStepper({
    minValue: 0,
    maxValue: 1000000,
    allowDecimals: false,
    maxDecimals: 2
  });

  $('#be-share-btn').click(function() {
    $('#units-wrapper').addClass('hide');
    $('#share-wrapper').removeClass('hide');
  });

  $('#be-unit-btn').click(function() {
    $('#units-wrapper').removeClass('hide');
    $('#share-wrapper').addClass('hide');
  });

  $('#lasty-profit-input').keyup(function() {
    $('#lasty-next-btn').removeClass('hide');
  });

  $('#lasty-next-btn').click(function() {
    game.breakEven.lastyProfit = parseFloat($('#lasty-profit-input').val());
    breakEvenChart();
    $('#lasty-profit-wrapper').addClass('hide');
    $('#be-qty-wrapper').removeClass('hide');
  });

  $('#be-qty-input').keyup(function() {
    $('#qty-next-btn').removeClass('hide');
  });

  $('#qty-next-btn').click(function() {
    game.breakEven.quantity = parseFloat($('#be-qty-input').val());
    breakEvenChart2();
    $('#be-share-btn').click();
  });

  $('#be-share-input').keyup(function() {
    $('#share-next-btn').removeClass('hide');
  });
  $('#share-next-btn').click(function() {
    game.breakEven.marketShare = parseFloat($('#be-share-input').val());
  });

  function breakEvenChart() {
    $('#be-chart1').highcharts({
      chart: {
        type: 'bar',
        width: 340
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: ['Unit Contribution', 'Variable Cost', 'Fixed Cost', 'Last year Profit'],
        allowDecimals: false
      },
      yAxis: {
        allowDecimals: false
      },
      legend: {
        enabled: false
      },
      exporting: { enabled: false },
      tooltip: {
        enabled: false
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            format: '€{y}'
          }
        }
      },

      series: [
        {
          name: 'Amount',
          data: [
            {
              y: game.valueChain.profit,
              name: 'First',
              color: 'blue'
            },
            {
              y: game.cost.variable,
              name: 'Second',
              color: 'green'
            },
            {
              y: game.cost.fixed,
              name: 'Third',
              color: 'yellow'
            },
            {
              y: game.breakEven.lastyProfit,
              name: 'Fourth',
              color: 'orange'
            }
          ]
        }
      ]
    });
  }
  function breakEvenChart2() {
    $('#be-chart2').highcharts({
      chart: {
        type: 'bar',
        width: 340
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: ['Break-even Units', 'LY Market Sales', 'LY Market Units'],
        allowDecimals: false
      },
      yAxis: {
        allowDecimals: false
      },
      legend: {
        enabled: false
      },
      exporting: { enabled: false },
      tooltip: {
        enabled: false
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
            format: '€{y}'
          }
        }
      },

      series: [
        {
          name: 'Amount',
          data: [
            {
              y: game.breakEven.quantity,
              name: 'First',
              color: 'blue'
            },
            {
              y: 600000,
              name: 'Second',
              color: 'green'
            },
            {
              y: 800000,
              name: 'Third',
              color: 'yellow'
            }
          ]
        }
      ]
    });
  }
  /**********************************************/
  /**************** /BREAK-EVEN LOGIC ***********/
  /**********************************************/
});
