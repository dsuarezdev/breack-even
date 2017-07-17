// prefixer helper function
var pfx = ["webkit", "moz", "MS", "o", ""];
function prefixedEventListener(element, type, callback) {
    for (var p = 0; p < pfx.length; p++) {
        if (!pfx[p]) type = type.toLowerCase();
        element.addEventListener(pfx[p]+type, callback, false);
    }
}


function toFrame(box, show, slidefrom, slideto, delay, reset, back){

    dslog('toFrame: ' + box.current.id + ' -> ' + show);

       window.setTimeout(function(){

           // Get the entering screen parent
           var slideInParent = document.getElementById(show).parentElement;

           // Get the leaving (current) screen parent
           var slideOutParent = box.current.parentElement;

           // Get the leaving screen
           var slideout = slideInParent.querySelector(':scope > .screen.current');
           //slideout.setAttribute('class', 'screen slideOut' + slideto);
           slideout.classList.remove('current', 'slideInR', 'slideInL', 'slideOutR', 'slideOutL');
           slideout.classList.add('screen', 'slideOut'+slideto);

           // Get the entering screen
           var slidein = document.querySelector('#' + show);
           //slidein.setAttribute('class', 'screen slideIn' + slidefrom + ' current');
           slidein.classList.remove('current', 'slideInR', 'slideInL', 'slideOutR', 'slideOutL');
           slidein.classList.add('screen', 'slideIn'+slidefrom, 'current');
           // Set prev
           slidein.prev = ( slidein.prev != box.current.id ) ? box.current.id : slidein.prev;

           // Set the previous
           box.prevscreen = box.current;
           // If not comming back -> Store ID of the screen to be shown
           if( !back ){
               box.history.push( box.current.id );
               console.log( box.history );
           }

           // Set the current
           box.current = slidein;

           // Set the screen to be reset when the animation ends
           if( reset ){
               slideout.dataset.reset = "true";
           }

           // Show next screen from the top
           slidein.scrollTop = 0;
           box.scrollTop = 0;
           document.body.scrollTop = 0;

       }, delay);

}


function makeNavigable( element, initial ){

    // Set first screen
    if( initial ){
        document.querySelector('.current.initial').classList.remove('current', 'initial');
        initial.classList.add('current', 'initial');
    }

    // Get the current (first) screen
    element.current = element.querySelector('.screen.current');
    element.history = new Array();


    // Get the buttons
    var gotos = [].slice.call( element.querySelectorAll('.goto') );

    // Loop the buttons and add the logic
    gotos.forEach(function(g,i){

       // Get the GOTO attributes
       var show = g.getAttribute('data-goto');
       var slidefrom = g.getAttribute('data-from');
       slidefrom = (slidefrom && slidefrom.length > 0) ? slidefrom : 'R';
       var slideto = (slidefrom == 'R') ? 'L' : 'R';
       var reset = g.getAttribute('data-reset');
       var delay = g.getAttribute('data-delay');
       delay = (delay && delay.length > 0) ? delay : 0;

       var back = g.getAttribute('data-back');

       // The click
       g.addEventListener('click', function(){

            if( back ){
                var backto = element.history.pop(); // Get the last screen in history and removes it from the stack
                if( typeof backto == 'undefined' )
                    window.history.back();
                else
                    toFrame(element, backto, slidefrom, slideto, delay, reset, back);
            }else{
                toFrame(element, show, slidefrom, slideto, delay, reset);
            }

       });

    });


    // Get the screens
    var screens = [].slice.call( element.querySelectorAll('.screen') );

    // Loop the screens
    screens.forEach(function(sc, k){

        sc.sreadyin = (typeof sc.sreadyin == 'function') ? sc.sreadyin : function(){ dslog('Ready in ' + sc.id ); };
        sc.sreadyout = (typeof sc.sreadyout == 'function') ? sc.sreadyout : function(){ dslog('Ready out ' + sc.id ); };

        // When a screen ends its animation
        prefixedEventListener(sc, 'AnimationEnd', function(e){

            // If the inner screens must be reset
            if( sc.dataset.reset == "true"){

                // Apply the classes to reset the inner screens
                var toreset = [].slice.call( sc.querySelectorAll(':scope .screen') );

                // Loop && reset the inner screens
                toreset.forEach(function(t,j){
                    if( j == 0){
                        t.classList.remove('current', 'slideInR', 'slideInL', 'slideOutR', 'slideOutL');
                        t.classList.add('screen', 'slideInL', 'current', 'noResetAnim');
                        //t.setAttribute('class', 'screen slideInL current noResetAnim');
                    }else{
                        t.classList.remove('current', 'slideInR', 'slideInL', 'slideOutR', 'slideOutL', 'noResetAnim');
                        t.classList.add('screen', 'slideOutR');
                        //t.setAttribute('class', 'screen slideOutR');
                    }
                });

                // Set the reset property back to false
                sc.dataset.reset = "false";

            }

            // Screen ready events
            if( sc.classList.contains('current') && !sc.classList.contains('noResetAnim') ){
                sc.sreadyin();
            }else{
                sc.sreadyout();
            }

        });

        sc.nextScreen = function(index, current, from, slide, delay, reset){
          toFrame(index, current, from, slide, delay, reset);
        }

    });

}
