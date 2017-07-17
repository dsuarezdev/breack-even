jQuery(document).ready(function(){

    var menuBtn     = document.getElementById('menu-btn-right');
    var menuModal   = jQuery('#menu-modal');
    var slideMenuLi = menuModal[0].querySelectorAll('li');
    var closeMenu   = document.getElementById('close-menu');

    menuBtn.addEventListener('click', function(){
        menuModal.modal('show');
    });

    closeMenu.addEventListener('click', function(){
        menuModal.modal('hide');
    });

    [].forEach.call(slideMenuLi, function(li) {

        if( li.id == 'close-menu' )
            return;

        li.addEventListener('click', function(){
            menuModal.modal('hide');
            document.body.classList.add('modal-open');
        });

    });

});
