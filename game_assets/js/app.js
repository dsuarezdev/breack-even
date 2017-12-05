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
  socket.emit('enter', { game_id: gameId, email: playerEmail, token: playerToken }, function(game) {
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
  });

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

      gameResult.quiz1 = { name: iQ1.value, age: ageSlider.getValue(), livesin: iQ2.value };

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

  btnToScreen4.addEventListener('click', function(e) {
    // Validate if the user answered the question
    if (item1.checked || item2.checked || item3.checked) {
      loader.classList.add('loading');

      if (item1.checked) gameResult.selectedItem = item1.value;
      if (item2.checked) gameResult.selectedItem = item2.value;
      if (item3.checked) gameResult.selectedItem = item3.value;

      toFrame(appbox, 'screen4', 'R', 'L', 300, false);
    } else {
      bootbox.alert('Select an item before continuing.');
    }
  });

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
  var btnToScreen6 = document.getElementById('to-screen-6');
  var screen5 = document.getElementById('screen5');
  screen5.sreadyin = function() {
    loader.classList.remove('loading');
  };

  btnToScreen6.addEventListener('click', function(e) {
    // Validate if the user answered the question
    if (finalRadio1.checked || finalRadio2.checked) {
      loader.classList.add('loading');

      if (finalRadio1.checked) gameResult.quiz2 = { enjoy: finalRadio1.value };
      if (finalRadio2.checked) gameResult.quiz2 = { enjoy: finalRadio2.value };

      // Send the gameResult object
      socket.emit(
        'result',
        { game_id: gameId, email: playerEmail, token: playerToken, result: gameResult },
        function(gres) {
          console.log(gres);

          // Any errors?
          if (gres.error) return console.log(gres.error);

          return toFrame(appbox, 'screen6', 'R', 'L', 300, false);
        }
      );
    } else {
      bootbox.alert('You must answer the question in order to proceed.');
    }
  });

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

  // Added by dsuarez (TK)
  $(document).ready(function() {

  });
  // Added by dsuarez (TK)

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
    aboutHTML += '<p class="mt20"><i>Author: Author Name<br>Author Title</i></p>';
    aboutHTML += '<div>';
    aboutHTML += '<img src="game_assets/assets/logo_wide.png" alt="Logo"></div>';
    aboutHTML += '</div>';
    aboutHTML += '<p class="mt20">Copyright © 2017, SimCase Co.</p>';
    aboutHTML += '</div>';

    alertModal('About', aboutHTML);
  });
}
