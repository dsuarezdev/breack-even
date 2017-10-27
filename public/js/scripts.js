jQuery(document).ready(function(){

    // Enable tooltips
    jQuery('[data-toggle="tooltip"]').tooltip();

    // Enable popovers
    jQuery('[data-toggle="popover"]').popover();

    // Enable switches
    jQuery(".switch").bootstrapSwitch();

    // Validate buttons
    var confirmLinks = document.querySelectorAll('.confirm-link');
    [].forEach.call(confirmLinks, function(confirmLink, idx){

        confirmLink.addEventListener('click', function(e){
            e.preventDefault();
            var link = this.href;
            var warning = this.dataset.warning;
            bootbox.confirm(warning, function(result){
                if(result) location.href = link;
            });
        });

    });

    // Validate delete buttons
    var deletes = document.querySelectorAll('.delete');
    [].forEach.call(deletes, function(deleteBtn, idx){

        deleteBtn.addEventListener('click', function(e){

            e.preventDefault();
            var link = this.href;

            bootbox.confirm({
                message: "Are you sure you want to delete this item?",
                buttons: {
                    confirm: { label: 'Yes', className: 'btn-success' },
                    cancel: { label: 'No', className: 'btn-danger' }
                },
                callback: function (result) {
                    if(result) location.href = link;
                }
            });

        });

    });

    // Remove href from links
    var disables = document.querySelectorAll(':disabled');
    [].forEach.call(disables, function(disable, idx) {
        disable.setAttribute('href', "#");
    });

});
