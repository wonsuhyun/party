var goNext = $('#goNext');
var param = {
    travelSeq : $('[name=travelSeq]').val(),
    travelerList : []
}
var targetIp;
$('.mi_check').on('change', function(){
    var all = $('[name=otherTraveler]:checked').length === $('[name=otherTraveler]').length
    $('[name=allCheck]').prop('checked', all);
    ableNext();
})

$('[name=allCheck]').on('change', function(){
    var checked = $(this).prop('checked');
    $('[name=otherTraveler]').prop('checked', checked)
})

$('.mi_input[type=tel]').on('keyup', function(e){
    cleanInput(e, 'MOBILE', true, function(){
        ableNext()
    });
    ableNext();
})

$('.get_mobile').on('click', function(){
    targetIp = $(this).siblings('.mi_input');
    var appData = {
        toastMessage : '',
        popup : {
            title : '',
            message : '문구미정',
            useTopCloseButton : true,
            buttons : [
                {title:'네', type :'color', titleColor : 'ffffff', color : '5c8cca', positive :'Y'},
                {title:'아니오', type :'border', titleColor : '5c8cca', color : '5c8cca', positive :'N'}
            ]
        }
    }

    miAppProtocol.call('getContactPhoneNum', appData , 'setMobile');
})

function setMobile(res) {
    var phone = res.data.phone.toString();
    phone = phone.replaceAll(' ','');
    phone = phone.replaceAll('-','');
    phone = phone.replace(/^\+82/,'0');
    phone = phone.replace(/^(\d{0,3})(\d{0,3}|\d{0,4})(\d{0,4})$/g, '$1-$2-$3');

    res.success && targetIp.val(phone);
    ableNext();
}
goNext.on('click', function(){
    validateCheck()
    && sendTalk()
})
function ableNext (){
    var disabledFlag = false;
    var checkedEl = $('[name=otherTraveler]:checked');

    if (!checkedEl.length) disabledFlag = true;
    checkedEl.each(function(i,v){
        if (!$(v).parents('tr').find('input[type=tel]').val()) disabledFlag = true;
    });
    goNext.prop('disabled',disabledFlag)
}

function validateCheck(){
    var passFlag = true;
    var checkedEl = $('[name=otherTraveler]:checked');
    param.travelerList = [];

    checkedEl.each(function(i,v){
        var el = $(v).parents('tr').find('input[type=tel]');
        var obj = {};
        if (!validateMobile(el)) {
            passFlag = false;
            param.travelerList = [];
            return false;
        } else {
            obj.mobile = el.val();
            obj.travelerSeq = $(v).val();
            param.travelerList.push(obj)
        }
    });
    return passFlag;
}
function sendTalk (){
    fnSendPostAjax('/api/claim/share', param , {
        s: function(){
            miCommonPop.alert('카카오톡이 발송되었습니다')
        }
    })
}
