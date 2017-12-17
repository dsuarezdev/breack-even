/*
 * General javascript file
 * By @davoscript v.1
 */

var appbox = document.getElementById('appbox');

function appinit(o) {
  // URL PARAMS
  var gameId = getQueryVariable('i');
  var playerEmail = getQueryVariable('e');
  var playerToken = getQueryVariable('t');

  // GLOBALS
  var gameData = {};
  var gameResult = {};
  var socket;
  var socketLayer = document.getElementById('connection-popup');
  var pauseLayer = document.getElementById('pause-popup');

  // ELEMENTS
  var loader = document.getElementById('loader');
  var popup = document.getElementById('popup');

  // TOUR
  var tour = new Tour({
    name: 'baseapp',
    storage: window.localStorage,
    steps: [
      {
        element: '#menu-btn-right',
        title: 'Menu',
        content: 'Use the menu bar to navigate through additional resources.',
        placement: 'left'
      },
      {
        element: '#tour-2',
        title: 'Items',
        content: 'You can use this tool to guide the users through the app.',
        placement: 'top'
      },
      {
        element: '#to-screen-4',
        title: 'Next',
        content: 'Use this buttons to navigate through screens.',
        placement: 'top'
      }
    ]
  });

  // This functions enable the navigation between screens
  makeNavigable(appbox, document.getElementById('splash'));

  // ******************************
  // CONNECT & GET GAME INFO
  // ******************************

  // Init & Connect Socket
  socket = io.connect(o.io_domain, { path: o.io_path });

  // Enter the Game
  socket.emit(
    'enter',
    { game_id: gameId, email: playerEmail, token: playerToken },
    function(game) {
      // Any errors?
      if (game.error) return console.log(game.error);

      // Nice, the game exists and we've joined!
      if (game._id) {
        gameData = game;
        console.log('gameData', gameData);

        // If game is "finalized", then *return* and move to the summary
        if (game.status == 'finalized') {
          toFrame(appbox, 'screen6', 'R', 'L', 300, false);
          loader.classList.add('loading');
        }

        // If game is launched & started
        if (game.status == 'launched') {
        }
      }
    }
  );

  socket.on('finalize', function() {
    toFrame(appbox, 'debrief-1', 'R', 'L', 300, false);
  });

  // ******************************
  // END: CONNECT & GET GAME INFO
  // ******************************

  /**********************************************/
  /**************** GAME SCREENS ****************/
  /**********************************************/

  /* Screen 1 - SPLASH SCREEN */
  var beginBtn = document.getElementById('begin');
  var screen1 = document.getElementById('screen1');
  screen1.sreadyin = function() {
    loader.classList.remove('loading');
  };

  beginBtn.addEventListener('click', function(e) {
    loader.classList.add('loading');
    toFrame(appbox, 'screen3', 'R', 'L', 300, false);
  });

  /* Screen 2 */
  var iQ1 = document.getElementById('iq-1');
  var iQ2 = document.getElementById('iq-2');
  var ageSlider = new Slider('#age-slider');
  var btnToScreen3 = document.getElementById('to-screen-3');
  var screen2 = document.getElementById('screen2');
  screen2.sreadyin = function() {
    loader.classList.remove('loading');
    jQuery('#role-modal').modal('show');
  };

  btnToScreen3.addEventListener('click', function() {
    // Validate if the user answered the question
    if (iQ1.value.length && iQ2.value.length && ageSlider.getValue() > 0) {
      loader.classList.add('loading');

      gameResult.quiz1 = {
        name: iQ1.value,
        age: ageSlider.getValue(),
        livesin: iQ2.value
      };

      toFrame(appbox, 'screen3', 'R', 'L', 300, false);
    } else {
      bootbox.alert('Complete the answers before continuing.');
    }
  });

  /* Screen 3 */
  var item1 = document.getElementById('item-1');
  var item2 = document.getElementById('item-2');
  var item3 = document.getElementById('item-3');
  var itemsAbout = document.querySelectorAll('.about-item');
  var btnToScreen4 = document.getElementById('to-screen-4');
  var screen3 = document.getElementById('screen3');
  screen3.sreadyin = function() {
    loader.classList.remove('loading');

    tour.setCurrentStep(0);
    tour.start();
  };

  // btnToScreen4.addEventListener('click', function(e) {
  //   // Validate if the user answered the question
  //   if (item1.checked || item2.checked || item3.checked) {
  //     loader.classList.add('loading');

  //     if (item1.checked) gameResult.selectedItem = item1.value;
  //     if (item2.checked) gameResult.selectedItem = item2.value;
  //     if (item3.checked) gameResult.selectedItem = item3.value;

  //     toFrame(appbox, 'screen4', 'R', 'L', 300, false);
  //   } else {
  //     bootbox.alert('Select an item before continuing.');
  //   }
  // });

  itemsAbout = [].slice.call(itemsAbout);
  itemsAbout.forEach(function(a) {
    a.addEventListener('click', function(e) {
      bootbox.dialog({
        title: 'A custom dialog',
        message:
          '<p>We are using a library called Bootbox to create fancy alerts, dialogs, confirms & prompts based on Bootstrap elements.</p>' +
          '<p>In some cases it is better to use native Bootstrap modals, which allow more customization (check Admin Area > Game > User Management).</p>'
      });
    });
  });

  /* Screen 4 */
  var animalCount = document.getElementById('animal-count');
  var btnToScreen5 = document.getElementById('to-screen-5');
  var screen4 = document.getElementById('screen4');
  screen4.sreadyin = function() {
    loader.classList.remove('loading');

    Highcharts.chart('chart-1', {
      chart: { type: 'column', height: 250 },
      creadits: { enabled: false },
      title: { text: '' },
      xAxis: {
        categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total animals'
        }
      },
      legend: {
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      },
      series: [
        {
          name: 'John',
          data: [5, 3, 4, 7, 2]
        },
        {
          name: 'Jane',
          data: [2, 2, 3, 2, 1]
        },
        {
          name: 'Joe',
          data: [3, 4, 4, 2, 5]
        }
      ]
    });
  };

  btnToScreen5.addEventListener('click', function(e) {
    if (animalCount.value.length > 0 && animalCount.value > 0) {
      loader.classList.add('loading');
      gameResult.animalCount = animalCount.value;
      toFrame(appbox, 'screen5', 'R', 'L', 300, false);
    } else {
      bootbox.alert('Please enter a valid integer.');
    }
  });

  /* Screen 5 */
  var finalRadio1 = document.getElementById('final-radio-1');
  var finalRadio2 = document.getElementById('final-radio-2');
  var submitBtn = document.getElementById('submit-btn');
  var screen5 = document.getElementById('screen5');
  screen5.sreadyin = function() {
    loader.classList.remove('loading');
  };

  /* Screen 6 */
  var fbName = document.getElementById('fb-name');
  var fbAge = document.getElementById('fb-age');
  var fbLive = document.getElementById('fb-live');
  var fbItem = document.getElementById('fb-item');
  var fbAnimals = document.getElementById('fb-animals');
  var fbEnjoy = document.getElementById('fb-enjoy');
  var screen6 = document.getElementById('screen6');
  screen6.sreadyin = function() {
    loader.classList.remove('loading');
    console.log(gameResult);

    Highcharts.chart('chart-2', {
      chart: { type: 'column', height: 250 },
      creadits: { enabled: false },
      title: { text: '' },
      xAxis: {
        categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
      },
      yAxis: {
        min: 0,
        title: { text: 'Total animals' }
      },
      legend: {
        style: {
          fontWeight: 'bold',
          color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
        }
      },
      series: [
        {
          name: 'John',
          data: [5, 3, 4, 7, 2]
        },
        {
          name: 'Jane',
          data: [2, 2, 3, 2, 1]
        },
        {
          name: 'Joe',
          data: [3, 4, 4, 2, 5]
        }
      ]
    });

    fbName.innerHTML = gameResult.quiz1.name;
    fbAge.innerHTML = gameResult.quiz1.age;
    fbLive.innerHTML = gameResult.quiz1.livesin;
    fbItem.innerHTML = gameResult.selectedItem;
    fbAnimals.innerHTML = gameResult.animalCount;
    fbEnjoy.innerHTML = gameResult.quiz2.enjoy;
  };

  /**********************************************/
  /**************** SOCKET EVENTS ***************/
  /**********************************************/

  // Pause
  socket.on('pause', function() {
    pauseLayer.classList.add('show');
  });

  // Unpause
  socket.on('unpause', function() {
    pauseLayer.classList.remove('show');
  });

  // Disconnection! :(
  socket.on('disconnect', function() {
    socketLayer.classList.add('show');
  });

  // Refresh on connection issue
  document.getElementById('refresh-btn').addEventListener('click', function() {
    window.onbeforeunload = undefined;
    location.reload();
  });

  /**********************************************/
  /*************** /SOCKET EVENTS ***************/
  /**********************************************/

  /**********************************************/
  /**************** HELPERS *********************/
  /**********************************************/

  var menuRole = document.getElementById('role-menu-item');
  menuRole.addEventListener('click', function() {
    jQuery('#role-carousel').carousel(0);
    jQuery('#role-modal').modal('show');
  });

  var menuWalk = document.getElementById('walk-menu-item');
  menuWalk.addEventListener('click', function() {
    console.log('walk clicked');
    jQuery('#walk-carousel').carousel(0);
    jQuery('#walk-modal').modal('show');
  });

  var menuAbout = document.getElementById('about');
  menuAbout.addEventListener('click', function() {
    document.getElementById('popup').innerHTML = 'About';

    var aboutHTML = '';
    aboutHTML += '<div class="text-center" style="padding:0 20px 0 20px;">';
    aboutHTML +=
      '<p class="mt20"><i><strong>Author:</strong> Eric T. Anderson<br>Hartmarx Professor of Marketing<br>Director of the Center for Marketing Practice</i></p>';
    aboutHTML += '<p><strong>Powered by SimCase</strong></p>';
    aboutHTML += '<div>';
    aboutHTML += '<img src="game_assets/assets/k-logop.png" alt="Logo"></div>';
    aboutHTML += '</div>';
    aboutHTML +=
      '<p class="mt20">Copyright © 2017, Northwestern university, Kellogg School of Management</p>';
    aboutHTML += '</div>';

    alertModal('About', aboutHTML);
  });

  // Added by dsuarez (tk)
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
      },
      canBack: false
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
      onTabClick: function(tab, navigation, index) {
        return game.canBack;
      }
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
        $('#ma-opt').text() === 'Fixed Cost'
          ? game.cost.abs.markAdv
          : game.cost.unit.markAdv;
      appendToPlCostTable(
        'ma',
        'Marketing & Advertising',
        cost,
        $('#ma-opt').text()
      );
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
        $('#rd-opt').text() === 'Fixed Cost'
          ? game.cost.abs.reseDev
          : game.cost.unit.reseDev;
      appendToPlCostTable(
        'rd',
        'Research & Development',
        cost,
        game.opt.reseDev
      );
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
        $('#sbi-opt').text() === 'Fixed Cost'
          ? game.cost.abs.shiBreIn
          : game.cost.unit.shiBreIn;
      appendToPlCostTable(
        'sbi',
        'Shipping, Breakage, Insurance, etc.',
        cost,
        game.opt.shiBreIn
      );
    });

    $('#pl-modal-btn').click(function() {
      if (
        validation.cost.btn1Clicked &&
        validation.cost.btn2Clicked &&
        validation.cost.btn3Clicked
      ) {
        $('#cost-confirm-btn').prop('disabled', false);
        $('#pl-alert').remove();
      }
    });

    $('#cost-confirm-btn').click(function() {
      $('#rootwizard').bootstrapWizard('next');

      Object.keys(game.opt).map(function(prop) {
        if (game.opt[prop] === 'Fixed Cost')
          game.cost.fixed += game.cost.abs[prop];
        else game.cost.variable += game.cost.unit[prop];
      });
    });

    function appendToPlCostTable(id, description, cost, costType) {
      var elementDes = '<span id="' + id + '-des">' + description + '</span>';
      var elementVal =
        '<span id="' + id + '-val">' + formatter.format(cost) + '</span>';

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

    $(
      '#retail-cost-input, #dist-cost-input, #sc-cost-input, #con-cost-input'
    ).jStepper({
      minValue: 0,
      maxValue: 30,
      allowDecimals: true,
      maxDecimals: 2
    });

    $('#retail-cost-btn').addClass('vc-btn-bg');
    document.getElementById('retail-cost-input').focus();

    $('#retail-cost-input').keyup(function(e) {
      $('#price-cost').text(
        parseFloat($('#retail-cost-input').val()).toFixed(2)
      );
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

      $('#dist-cost-btn').addClass('vc-btn-bg');
      $('#retail-cost-btn, #mfg-cost-btn').removeClass('vc-btn-bg');

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
      $('#mfg-cost-btn').addClass('vc-btn-bg');
      $('#retail-cost-btn, #dist-cost-btn').removeClass('vc-btn-bg');

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

    $('#dist-back-btn').click(function() {
      $('#retail-cost-btn').addClass('vc-btn-bg');
      $('#mfg-cost-btn, #dist-cost-btn').removeClass('vc-btn-bg');
      $('#retail-wrapper').removeClass('hide');
      $('#mfg-wrapper, #dist-wrapper, #con-wrapper').addClass('hide');
    });

    $('#sc-next-btn').click(function() {
      game.valueChain.saleCom = parseFloat($('#price-cost').text());

      $('#con-wrapper').removeClass('hide');
      $('#retail-wrapper, #dist-wrapper, #mfg-wrapper').addClass('hide');

      document.getElementById('con-cost-input').focus();
    });

    $('#sc-back-btn').click(function() {
      $('#dist-cost-btn').addClass('vc-btn-bg');
      $('#retail-cost-btn, #mfg-cost-btn').removeClass('vc-btn-bg');
      $('#dist-wrapper').removeClass('hide');
      $('#mfg-wrapper, #retail-wrapper, #con-wrapper').addClass('hide');
    });

    $('#con-next-btn').click(function() {
      game.valueChain.profit = parseFloat($('#con-cost-input').val());
      game.cost.variable += game.valueChain.saleCom;
      breakEvenChart();
    });

    $('#con-back-btn').click(function() {
      $('#mfg-wrapper').removeClass('hide');
      $('#dist-wrapper, #retail-wrapper, #con-wrapper').addClass('hide');
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
      breakEvenChart2();
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
          categories: [
            'Unit Contribution',
            'Variable Cost',
            'Fixed Cost',
            'Last year Profit'
          ],
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
          categories: [
            'Break-even Units',
            'LY Market Sales',
            'LY Market Units'
          ],
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

    /**********************************************/
    /**************** SUBMIT LOGIC ****************/
    /**********************************************/

    $('#share-next-btn').click(function() {
      game.canBack = true;
      $('#cost-retail').text(formatter.format(game.valueChain.retail));
      $('#cost-retail')
        .parent()
        .css('background', '#ebeacb');
      $('#cost-dist').text(formatter.format(game.valueChain.dist));
      $('#cost-dist')
        .parent()
        .css('background', '#ebeacb');
      $('#cost-profit').text(formatter.format(game.valueChain.profit));
      $('#cost-profit')
        .parent()
        .css('background', '#ebeacb');
      $('#sale-com').text(formatter.format(game.valueChain.saleCom));

      $('#be-units, #be-units2').text(game.breakEven.quantity);
      $('#be-shares, #be-shares2').text(game.breakEven.marketShare);
      $('#submit-pl-wrapper').append($('#pl-costs-table'));
      $('#sales-val').text(formatter.format(game.valueChain.saleCom));
      $('#sales-val').css('color', '#445360');
    });

    $('#submit-btn').click(function() {
      saveBeResults({
        gameStep: 1,
        variableCost: game.cost.variable,
        fixedCost: game.cost.fixed,
        valueChain: game.valueChain,
        breakEven: game.breakEven
      });
      if (game.valueChain.retail === 20.1) {
        $('#cost-retail')
          .parent()
          .css('border', '1px solid green');

        $('#icon-retail')
          .addClass('glyphicon glyphicon-ok')
          .css('color', 'green');
      } else {
        $('#cost-retail')
          .append(
            '<br><span style="color: red">' + formatter.format(20.1) + '<span>'
          )
          .parent()
          .css('border', '1px solid red');

        $('#icon-retail')
          .addClass('glyphicon glyphicon-remove')
          .css('color', 'red');
      }
      if (game.valueChain.dist === 11) {
        $('#cost-dist')
          .parent()
          .css('border', '1px solid green');

        $('#icon-dist')
          .addClass('glyphicon glyphicon-ok')
          .css('color', 'green');
      } else {
        $('#cost-dist')
          .append(
            '<br><span style="color: red">' + formatter.format(11) + '<span>'
          )
          .parent()
          .css('border', '1px solid red');

        $('#icon-dist')
          .addClass('glyphicon glyphicon-remove')
          .css('color', 'red');
      }
      if (game.valueChain.profit === 5.55) {
        $('#cost-profit')
          .parent()
          .css('border', '1px solid green');

        $('#icon-mfg')
          .addClass('glyphicon glyphicon-ok')
          .css('color', 'green');
      } else {
        $('#cost-profit')
          .append(
            '<br><span style="color: red">' + formatter.format(5.55) + '<span>'
          )
          .parent()
          .css('border', '1px solid red');

        $('#icon-mfg')
          .addClass('glyphicon glyphicon-remove')
          .css('color', 'red');
      }
      if (game.valueChain.saleCom === 0.16) {
        $('#icon-sale')
          .addClass('glyphicon glyphicon-ok')
          .css('color', 'green');
      } else {
        $('#icon-sale')
          .addClass('glyphicon glyphicon-remove')
          .css('color', 'red');
        $('#sale-com').append(
          '<br><span style="color: red">' + formatter.format(0.16) + '<span>'
        );
      }

      // Break Even Analysis Feedback
      if (game.breakEven.quantity === 115340) {
        $('#be-units')
          .parent()
          .css('border', '1px solid green');
      } else {
        $('#be-units')
          .parent()
          .css('border', '1px solid red');

        $('#correct-ans-beu')
          .text('115,340')
          .css('color', 'red');
      }
      if (game.breakEven.marketShare === 15) {
        $('#be-shares')
          .parent()
          .css('border', '1px solid green');
      } else {
        $('#be-shares')
          .parent()
          .css('border', '1px solid red');

        $('#correct-ans-bes')
          .text('15%')
          .css('color', 'red');
      }

      if (game.breakEven.quantity === 115340) {
        $('#be-units')
          .parent()
          .css('border', '1px solid green');
      } else {
        $('#be-units')
          .parent()
          .css('border', '1px solid red');
      }
    });

    /**********************************************/
    /**************** /SUBMIT LOGIC ***************/
    /**********************************************/
  });

  //save results for game (Added by dsuarez)
  function saveBeResults(beResults) {
    bootbox.confirm({
      title: 'System Message',
      message: 'Please confirm your assessment.',
      callback: function(result) {
        if (result) {
          console.log('saving!!');
          socket.emit(
            'result',
            {
              game_id: gameId,
              email: playerEmail,
              token: playerToken,
              result: beResults
            },
            function(gres) {
              console.log('socketRes', gres);

              // Any errors?
              if (gres.error) return console.log(gres.error);

              // return toFrame(appbox, 'screen6', 'R', 'L', 300, false);
              bootbox.hideAll();
            }
          );
        }
      }
    });
  }
}
