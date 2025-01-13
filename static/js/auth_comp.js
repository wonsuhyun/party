var btnGetAuthCodeComp = $('#btnGetAuthCodeComp');
var btnSendAuthCodeComp = $('#btnSendAuthCodeComp');
var wrap = $('.component_id');
var authParam ;
var ipAuthCodeComp = wrap.find('[name=authCodeComp]')
var timer= $('#timer'); //스코어 기록창-분
var playTime;
var confirmArea = $('.auth_comp .confirm');

getInputOrd();
ableAuth();
wrap.on('keyup' , '.mi_input', function(){
    if (!$(this).parents('.confirm ').length) toggleHideConfirmArea(false);
    ableAuth();
}).on('change' , '.mi_input.select, [name=agreement]', function(){
    toggleHideConfirmArea(false);
    ableAuth();
}).on('keyup','input[type=tel]', function(e){
    cleanInput(e,'NUM',true , function(){
        ableAuth();
    })
});


btnGetAuthCodeComp.on('click', function(){
    var mobile = $('[name=mobile]:visible');
    var birth = $('[name=birth]:visible');
    var ssn=$('[name=ssn]:visible');
    var name = $('[name=name]:visible');

    authParam = {
        name : name.val(),
        birth : birth.val(),
        ssn : ssn.val(),
        telecom : $('[name=telecom]').val(),
        mobile : mobile.val(),
        requestNo : $('[name=requestNo]').val()
    }

    validateIdNum(birth, ssn)
    && validateMobile(mobile)
    && validateName(name, birth.val(), ssn.val())
    && getAuthCodeComp(authParam)
});

btnSendAuthCodeComp.on('click', function(){
    sendAuthCodeComp()
})

function getAuthCodeComp(param){
    fnSendPostAjax('/api/traveler-auth/send', param,{
        s: function(res){
            if (res.data) $('[name=requestNo]').val(res.data);
            miCommonPop.alert({
                dCopy : '인증번호가 발송되었습니다',
                dFirstAc : function(){
                    toggleHideConfirmArea(true);
                }
            });
        },
        f: function(res){
            if (res.code === 'ERR_SCI_0001' || res.code === 'ERR_SCI_0002') $('[name=requestNo]').val(res.data);
            miCommonPop.alert(res.display)
        }
    })
}

function setAuthCodeComp (res){
    res.success && ipAuthCodeComp.val(res.data.code);
}

function ableAuth(){
    var flag = validateRequired(true) && $('[name=agreement]').prop('checked')
    btnGetAuthCodeComp.prop('disabled',!flag)
}

function sendAuthCodeComp(){
    authParam.authCode = ipAuthCodeComp.val();
    fnSendPostAjax('/api/traveler-auth/check', authParam ,{
        s: function(){
            clearInterval(playTime);
            miCommonPop.alert({
                dCopy : '인증이 완료되었습니다',
                dFirstAc : function(){
                    location.href = '/mypage';
                }
            })
        },
        f: function(res){
            if (res.code === 'ERR_SCI_0004' || res.code === 'ERR_SCI_0005') $('[name=requestNo]').val(res.data);
            if (res.code === 'ERR_SCI_0006') location.href = res.url;

            miCommonPop.alert({
                dCopy : res.display,
                dFirstAc : function(){
                    if (res.code !== 'ERR_SCI_0003') {
                        toggleHideConfirmArea(false);
                    }
                }
            })
        }
    })
}

function timerFn(){
    clearInterval(playTime);
    timer.text( "03:00");

    var time= 180000;
    var min=3;
    var sec=60;

    playTime = setInterval(function(){
        time = time-1000; //1초씩 줄어듦
        min = time/(60*1000); //초를 분으로 나눠준다.

        if(sec>0){ //sec=60 에서 1씩 빼서 출력해준다.
            sec=sec-1;
            timer.text('0' + Math.floor(min)+':' + ('0' + sec).slice(-2))
        }

        if(sec===0){
            sec=60;
            timer.text('0' + Math.floor(min)+':00' )
        }

        if (time === 0) {
            clearInterval(playTime);
        }

    },1000);
}


function toggleHideConfirmArea (isShow){
    if (isShow) {
        confirmArea.removeClass('el_hidden');
        btnGetAuthCodeComp.text('재요청');
        timerFn();
        if (isApp && isAndroid) miAppProtocol.call('getAuthCode', '', 'setAuthCodeComp');
    } else {
        confirmArea.addClass('el_hidden').find('input').val('');
        clearInterval(playTime);
        btnGetAuthCodeComp.text('인증요청');
    }
    getInputOrd();
}
