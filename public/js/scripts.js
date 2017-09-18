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
            bootbox.confirm("Are you sure you want to delete this item?", function(result){
                if(result) location.href = link;
            });
        });

    });

    // Remove href from links
    var disables = document.querySelectorAll(':disabled');
    [].forEach.call(disables, function(disable, idx) {
        disable.setAttribute('href', "#");
    });

});




Highcharts.theme = {
    colors: ['#715aff', '#47d0d8', '#e1dcff', '#505f6b', '#188b92',
             '#ffb8ea', '#bcf4f7', '#27979e', '#c55ff0'],
    chart: {
        backgroundColor: {
            linearGradient: [0, 0, 500, 500],
            stops: [
                [0, 'rgb(255, 255, 255)'],
                [1, 'rgb(240, 240, 255)']
            ]
        },
    },
    title: {
        style: {
            color: '#000',
            font: 'bold 16px "Lato", Verdana, sans-serif'
        }
    },
    subtitle: {
        style: {
            color: '#666666',
            font: 'bold 12px "Lato", Verdana, sans-serif'
        }
    },

    legend: {
        itemStyle: {
            font: '9pt "Lato", Verdana, sans-serif',
            color: 'black'
        },
        itemHoverStyle:{
            color: 'gray'
        }
    }
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);
