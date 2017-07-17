jQuery(document).ready(function(){

    jQuery('[data-toggle="popover"]').popover();

    jQuery(".switch").bootstrapSwitch();

    var deletes = document.querySelectorAll('.delete');
    [].forEach.call(deletes, function(deleteBtn, idx) {

        deleteBtn.addEventListener('click', function(){
            return confirm('Are you sure you want to delete this item?');
        })
    });

    var disables = document.querySelectorAll(':disabled');
    [].forEach.call(disables, function(disable, idx) {
        disable.setAttribute('href', "#");
    });

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

});
