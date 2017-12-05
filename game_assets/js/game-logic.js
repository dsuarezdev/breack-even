$(document).ready(function() {
  var game = {
    unitCost: {
      markAdv: 1.5,
      saleCom: 0.16,
      reseDev: 1.5,
      otherFix: 0.06,
      shiBreIn: 0.6,
      varMfg: 2.7
    },
    absCost: {
      markAdv: 900000,
      saleCom: 1620000,
      reseDev: 900000,
      otherFix: 35000,
      shiBreIn: 360000,
      varMfg: 96000
    },
    opt: {
      markAdv: '',
      reseDev: '',
      shiBreIn: ''
    },
    valid: {
      cost: false,
      valuec: false,
      submit: false
    }
  };

  $('#rootwizard').bootstrapWizard({
    tabClass: 'nav nav-tabs',
    nextSelector: '.wz-next',
    onTabChange: function(tab, navigation, index) {
      return true;
    }
  });

  $('#des-next').click(function() {
    $('#des-tab > a > span').css('transform', 'rotate(90deg)');
    game.valid.cost = true;
  });
  $('#cost-next').click(function() {
    $('#cost-tab > a > span').css('transform', 'rotate(90deg)');
  });
  $('#valuec-next').click(function() {
    $('#valuec-tab > a > span').css('transform', 'rotate(90deg)');
  });

  /**********************************************/
  /**************** COST LOGIC ******************/
  /**********************************************/

  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });

  $('#unit-btn').click(function(e) {
    e.preventDefault();

    $('#ma-cost').text(formatter.format(game.unitCost.markAdv));
    $('#sc-cost').text(formatter.format(game.unitCost.saleCom));
    $('#rd-cost').text(formatter.format(game.unitCost.reseDev));
    $('#of-cost').text(formatter.format(game.unitCost.otherFix));
    $('#sbi-cost').text(formatter.format(game.unitCost.shiBreIn));
    $('#vm-cost').text(formatter.format(game.unitCost.varMfg));
  });

  $('#abs-btn').click(function(e) {
    e.preventDefault();

    $('#ma-cost').text(formatter.format(game.absCost.markAdv));
    $('#sc-cost').text(formatter.format(game.absCost.saleCom));
    $('#rd-cost').text(formatter.format(game.absCost.reseDev));
    $('#of-cost').text(formatter.format(game.absCost.otherFix));
    $('#sbi-cost').text(formatter.format(game.absCost.shiBreIn));
    $('#vm-cost').text(formatter.format(game.absCost.varMfg));
  });

  $('#cost-btn1').click(function() {
    $('#cost-btn1').css('border-color', '#37b5bd');
    if ($('#ma-opt').text() === 'Fixed Cost') {
      $('#ma-opt').text('Variable Cost');
    } else {
      $('#ma-opt').text('Fixed Cost');
    }
    game.opt.markAdv = $('#ma-opt').text();
  });

  $('#cost-btn2').click(function() {
    $('#cost-btn2').css('border-color', '#37b5bd');
    if ($('#rd-opt').text() === 'Fixed Cost') {
      $('#rd-opt').text('Variable Cost');
    } else {
      $('#rd-opt').text('Fixed Cost');
    }
    game.opt.reseDev = $('#rd-opt').text();
  });

  $('#cost-btn3').click(function() {
    $('#cost-btn3').css('border-color', '#37b5bd');
    if ($('#sbi-opt').text() === 'Fixed Cost') {
      $('#sbi-opt').text('Variable Cost');
    } else {
      $('#sbi-opt').text('Fixed Cost');
    }
    game.opt.shiBreIn = $('#sbi-opt').text();
  });

  /**********************************************/
  /**************** /COST LOGIC ******************/
  /**********************************************/
});
