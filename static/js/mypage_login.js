var miInput = $('.mi_input');

var inBirth = $('[name="birth"]');
var inMobile = $('[name="mobile"]');
var inAuthCode = $('#authCode');
var email1 = $('.email1');
var email2 = $('.email2');
var emailSelect = $('.email2_changer');
var emailDomain;

var elAuthCode = $('#elAuthCode');
var isMobileAuth = true;
var btnGetAuthCodeMobile = $('#btnGetAuthCode');
var btnGetAuthCodeEmail = $('#btnGetAuthCodeEmail');

var btnSendAuthCode = $('#btnSendAuthCode');
var btnModeChange = $('.btn_confirm_modify');

var goTo = getQueryParam('goto');
var travels = getQueryParam('travel');
var traveler = getQueryParam('traveler');
var popType = getQueryParam('popType');
var isClaim = getQueryParam('isClaim');
var claimType = getQueryParam('type');
var isModPlan = $('[name="modPlan"]').val() === 'Y';
var returnUrl = '';



getInputOrd();
returnUrlFactory();

function returnUrlFactory (){

    if (isModPlan) returnUrl = '/mod_plan/detail' + window.location.search;
    else if (goTo) returnUrl = '/' + goTo;
    else if (isClaim) returnUrl = '/claim/type';
    else if (claimType) returnUrl = '/mypage/detail/share';
    else returnUrl = '/mypage' + ( travels ? '/detail/' + travels : '');

    returnUrl += popType ? '&popType=' + popType : '';
    returnUrl += claimType ? '&type=' + claimType : '';
    returnUrl += travels ? '&travel=' + travels : '';
    returnUrl += traveler ? '&traveler=' + traveler : '';
    returnUrl = returnUrl.replace("&", "?");
}



$('[name= isRep]').on('change', function(e){
    var isRep = $('[name= isRep]:checked').val() === 'Y';
    if (isRep) {
        $('.origin_area').removeClass('el_hidden')
        $('.id_area').addClass('el_hidden')
    } else {
        $('.id_area').removeClass('el_hidden');
        $('.origin_area').addClass('el_hidden')
    }
    getInputOrd();
});

$('input[type=tel]').on('keyup', function (e) {
    var targetLang = $(e.target).attr('name') === 'mobile' ? 'MOBILE' : 'NUM'
    cleanInput(e, targetLang, true);
}).on('blur', function (e) {
    var inputName = $(e.target).attr('name')
    var targetLang = inputName === 'mobile' ? 'MOBILE' : 'NUM'
    cleanInput(e, targetLang, true, function () {
        switch (inputName) {
            case 'birth':
                validateIdNum(inBirth);
                break;
            case 'mobile':
                validateMobile(inMobile);
                break;
        }
    });
});

btnGetAuthCodeMobile.on('click', getAuthCode);
btnGetAuthCodeEmail.on('click', getAuthCode);
btnModeChange.on('click', modeChange);
btnSendAuthCode.on('click', sendAuthCode);

function modeChange(e){
    var wrap_m = $('.input_group.mobile');
    var wrap_e = $('.input_group.email');

    isMobileAuth = btnModeChange.hasClass('mode_mobile');
    elAuthCode.addClass('el_hidden').find('input').val('');

    if (isMobileAuth) {
        btnModeChange.find('.type').text('휴대폰번호');
        btnModeChange.removeClass('mode_mobile').addClass('mode_email');
        wrap_e.removeClass('el_hidden');
        wrap_m.addClass('el_hidden').find('input,select').val('');
    } else {
        btnModeChange.find('.type').text('이메일');
        btnModeChange.removeClass('mode_email').addClass('mode_mobile');
        wrap_m.removeClass('el_hidden');
        wrap_e.addClass('el_hidden').find('input,select').val('');
        wrap_e.find('.email2').addClass('el_hidden');
    }

    isMobileAuth = btnModeChange.hasClass('mode_mobile');
}

function getAuthCode() {
    var url = isMobileAuth ? '/api/auth-code/send' : '/api/auth-email/send';

    inAuthCode.data('except', true);
    getInputOrd();

    var param = {
        birth: inBirth.val()
    }

    if (isMobileAuth) param.mobile =  inMobile.val().replace(/\-/g, '')
    else {
        emailDomainSet();
        param.email =  email1.val() + '@' + emailDomain;
    }

    validationPass()
    && fnSendPostAjax(url, param, {
        s: function () {
            if (isApp && isAndroid) {
                miAppProtocol.call('getAuthCode', '', 'setAuthCode');
            }

            inAuthCode.data('except', false);
            elAuthCode.removeClass('el_hidden');

            getInputOrd();

            miCommonPop.alert({
                dCopy: '인증번호가 발송되었습니다',
                dFirstAc: function () {
                    inAuthCode.focus();
                }
            });
        }
    }, {
        btn: btnGetAuthCodeMobile,
        able: 'C'
    });
}

function validationPass() {
    emailDomainSet();
    var a = validateRequired(false);
    var b = validateIdNum(inBirth);
    var c = isMobileAuth ? validateMobile(inMobile) : validateEmail(email1.val(), emailDomain);

    return a && b && c;
}

function emailDomainSet (){
    emailDomain = email2.is(':visible') ? email2.val() : emailSelect.val();
}
function setAuthCode(res) {
    res.success && inAuthCode.val(res.data.code);
}

function sendAuthCode() {
    inAuthCode.data('except', false);
    getInputOrd();
    var url =isMobileAuth ? '/api/auth-code/check' : '/api/auth-email/check';
    var param = {
            birth: inBirth.val(),
            authCode: inAuthCode.val()
        }


    if (isMobileAuth)  param.mobile =  inMobile.val().replace(/\-/g, '');
    else {
        emailDomainSet();
        param.email = email1.val() + '@' + emailDomain;
    }

    validationPass(isMobileAuth)
    && fnSendPostAjax(url, param , {
        s: function () {
            miCommonPop.alert({
                dCopy: '인증이 완료되었습니다',
                dFirstAc: function () {
                    location.replace(returnUrl)
                }
            });
        }
    }, {
        btn: btnSendAuthCode,
        able: 'F'
    });
}

$(function () {
    isModPlan || miBanners('#miBanners', ['travel']);
    miBanners('#miBanners', ['travel']);
});
