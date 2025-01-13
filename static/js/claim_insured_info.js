
var caSeq = $('[name=caSeq]').val();
var goNext = $('#goNext');
var tempSave = $('#tempSave');
var sendEmailChk = $('.send_email');
var chkFixInfo = $('[name=fixInfo]');
var insuredName= $('[name=insuredName]');
var insuredBirth = $('[name=insuredBirth]');
var insuredSsn =$('[name=insuredSsn]')


ableNext();
sendEmailChk.on('change', function(){
    if ($(this).prop('checked')) $('.input_group.email').removeClass('el_hidden')
    else  $('.input_group.email').addClass('el_hidden');
});

insuredName.on('blur', function(){
    $(this).val($(this).val().toUpperCase())
})
chkFixInfo.on('change', function(e){
    var checked = $(this).prop('checked');
    var _this = $(this);
    var ips = _this.parents('.part').find('.mi_input');
    if (!checked) {
        ips.each(function(i,v){
            $(v).val($(v).data('as-is'));
        })
    }
    ips.prop('disabled', !checked);
})

insuredSsn.add(insuredBirth).on('keyup', function(e){
    cleanInput(e,'NUM',true,function(){
        ableNext()
    })
})

tempSave.on('click', function(){
    var param = paramFactory();
    saveClaimTempData(param);
})
$('.mi_input').on('keyup', function(){
    ableNext()
});

$('[name="mobile"]').on('keyup', function(e){
    cleanInput(e,'MOBILE',true,function(){
        ableNext()
    })
});

$('.mi_check').on('change', function(){
    ableNext()
})

$('.mi_input.select').on('change', function(){
    ableNext()
})

goNext.on('click', function(){
    validationCheck()
    && goSaveData()
})

function ableNext(){
    getInputOrd();
    var flag = validateRequired(true);
    goNext.prop('disabled',!flag)
}
function validationCheck(){
    var a = validateMobile($('[name=mobile]'));
    var domain =$('.email2_changer').val() !== 'mibank' ? $('.email2_changer').val() : $('.email2').val();
    var b = true;

    if (sendEmailChk.prop('checked')) {
        b = validateEmail( $('.email1').val(), domain );
    }

    if (sendEmailChk.prop('checked')) {
        b = validateEmail( $('.email1').val(), domain );
    }

    return a && b;
}

function goSaveData(){
    var param = paramFactory();
    saveClaimData(param, '/claim/bank-account');
}

function paramFactory(){
    var obj = {
        caSeq : caSeq,
        mobile : $('[name=mobile]').val()
    }

    if (sendEmailChk.prop('checked')) obj.email =  $('.email1').val() + '@' +  ($('.email2_changer').val() !== 'mibank' ? $('.email2_changer').val() : $('.email2').val());

    if (chkFixInfo.prop('checked')) {
        obj.infoChangeYn = 'Y'
        obj.chgName =  insuredName.val()
        obj.chgBirth = insuredBirth.val()
        obj.chgSsn = insuredSsn.val()
    }

    return obj
}


