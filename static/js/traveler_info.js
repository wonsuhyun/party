var inNameRep = $('[name="nameRep"]');
var inBirthRep = $('[name="birthRep"]');
var inSsnRep = $('[name="ssnRep"]');
var inMobile = $('[name="mobile"]');
var inEmail = $('[name="email"]');
var inEmail1 = $('#email1');
var inEmail2Changer = $('#email2Changer');
var inEmail2 = $('#email2');

var nameRep, birthRep, ssnRep, mobile, email, email1, email2Changer, email2, emailDomain;

var frmMain = $('#frmMain');
var elCardWrap = $('.card_wrap');
var btnCardAdd = $('.btn_add');
var btnApply = $('#btnApply');
var btnGetPremium = $('#btnGetPremium');

var elAfterPremium = $('.after_premium').add($('.fix_wrap'));
var elBeforePremium = $('.el_companion .noti');
var elRequiredAgree = $('#requiredAgree');
var elRequired = $('.required_wrap');

var applyType = $('#applyType').val();
var planTypeCd = $('#planTypeCd').val();
var referral = $('[name="referral"]').val();
var isChkCoupon = planTypeCd !== 'C';
var targetBtn = applyType === '1' ? btnApply : btnGetPremium;

init();

elRequired.on('keyup change', '.mi_input', function () {
    ableNext();
});

frmMain.on({
    'keyup': function (e) {
        cleanInput(e, 'name', true);
    },
    'blur': function (e) {
        cleanInput(e, ['KR_CON', /[ |-]$/], false, function (val) {
            var el = $(e.target);
            var isEng = miValidate.langType['ENG'].test(val);
            var newV;

            if (isEng) newV = val.toUpperCase();
            else newV = miValidate.deleteLang(val, 'KR', true);

            el.val(newV);

            var wrapper = el.closest('.card');
            var isRep = !wrapper.length;

            var _birth = isRep ? inBirthRep.val() : wrapper.find('[name^="birth"]').val();
            var _ssn = isRep ? inSsnRep.val() : wrapper.find('[name^="ssn"]').val();

            validateName(newV, _birth, _ssn);
        });
    }
}, '[name^="name"]');

frmMain.on({
    'keyup': function (e) {
        cleanInput(e, 'NUM', true);
    },
    'blur': function (e) {
        var wrapper = $(e.target).closest('.card');
        var isRep = !wrapper.length;

        var _birth = isRep ? inBirthRep.val() : wrapper.find('[name^="birth"]').val();
        var _ssn = isRep ? inSsnRep.val() : wrapper.find('[name^="ssn"]').val();
        var _name = isRep ? inNameRep.val() : wrapper.find('[name^="name"]').val();

        cleanInput(e, 'NUM', true, function () {
            validateIdNum(_birth, _ssn) && validateName(_name, _birth, _ssn);
        });
    }
}, '[name="birth"], [name^="ssn"]');

inMobile.on({
    'focus keyup': function (e) {
        cleanInput(e, 'MOBILE', true);
    },
    'blur': function (e) {
        cleanInput(e, 'MOBILE', true, function () {
            var val = inMobile.val();
            validateMobile(val) && !referral && chkCoupon(val);
        });
    }
});

inEmail1.add(inEmail2).on({
    'keyup': function (e) {
        cleanInput(e, ['KR', 'EMOJI', 'SP']);
    },
    'blur': function (e) {
        cleanInput(e, 'SP', false, function () {
            var a = getData() && validateEmail(email1, emailDomain)

            if (a) inEmail.val(email1 + '@' + emailDomain);
            else inEmail.val('')
        });
    }
});

inEmail2Changer.on('change', function () {
    var a = getData() && validateEmail(email1, emailDomain)

    if (a) inEmail.val(email1 + '@' + emailDomain);
    else inEmail.val('')
});

elCardWrap.on({
    'focus': function () {
        $(this).closest('.card').addClass('active').siblings().removeClass('active');
    },
    'blur': function () {
        $(this).closest('.card').removeClass('active');
    }
}, '.mi_input');

elCardWrap.on('click', '.btn_delete', function () {
    $(this).closest('.card').remove();
    setCard();
});

btnCardAdd.on('click', addCard);

btnGetPremium.on('click', validateData);

btnApply.on('click', goNext);

elRequiredAgree.add($('.policy_header')).on('change', '[type="checkbox"]', function () {
    var isChecked = elRequiredAgree.find('[type="checkbox"]').length === elRequiredAgree.find('[type="checkbox"]:checked').length;
    btnApply.prop('disabled', !isChecked);
});

function init() {
    getData() && !isChkCoupon && mobile && chkCoupon(mobile, true);

    getInputOrd();
    ableNext(true);
}

function getData() {
    nameRep = inNameRep.val();
    birthRep = inBirthRep.val();
    ssnRep = inSsnRep.val();
    mobile = inMobile.val().replace(/-/g, '');
    email1 = inEmail1.val();
    email2Changer = inEmail2Changer.val();
    email2 = inEmail2.val();
    emailDomain = email2Changer === 'mibank' ? email2 : email2Changer;
    email = inEmail.val()

    return true;
}

function chkCoupon(mobile, isOnlyChk) {
    fnSendPostAjax('/api/coupon/use', {
        travelSeq: travelSeq,
        mobile: mobile
    }, {
        s: function (res) {
            if (res.data) {
                if (!isOnlyChk) {
                    var copy = planTypeCd === 'C' ? '<div class="icon_box success"><strong class="c__point">쿠폰이 확인되었습니다</strong>' +
                        '<p class="mt_10">보유중인 쿠폰은\n' +
                        '<strong class="c__red">COVID-19 격리비/항공료 보장</strong>\n' +
                        '무료가입' + (applyType === '2' ? '(동반가입자 포함)' : '') + '에 사용됩니다\n' +
                        '(보험료 10% 할인 미적용)</p></div>'
                        : '<strong><span class="c__point">보험료의 10%</span>는\n보유하고 계신 쿠폰으로 결제됩니다</strong>' + (applyType === '2' ? '<br><span class="c__point">(동반가입자 포함)</span>' : '');

                    miCommonPop.alert(copy);
                }

                isChkCoupon = true;
            } else {
                if (planTypeCd === 'C') {
                    popCouponFalse();
                    isChkCoupon = false;
                }
            }
        }
    });
}

function popCouponFalse() {
    miCommonPop.alert('<div class="icon_box warning"><strong class="c__red">쿠폰이 확인되지 않습니다</strong><p class="mt_10">쿠폰 보유자의 휴대폰번호를 \n정확하게 입력해주세요</p></div>');
}

function addCard() {
    var el = $('.card:last').clone();

    el.find('input').val('');

    elCardWrap.append(el);
    el.find('[name="name"]').focus();

    setCard();
}

function setCard() {
    var card = $('.card');
    var cntCard = card.length;

    if (cntCard === 1) $('.btn_delete').addClass('el_hidden');
    else $('.btn_delete').removeClass('el_hidden');

    if (cntCard === 20) btnCardAdd.addClass('el_hidden');
    else btnCardAdd.removeClass('el_hidden');

    card.each(function (i, v) {
        var el = $(v);
        var idx = i + 1;

        el.find('.card_idx').text(idx);
    });

    getInputOrd();
    ableNext();
}

function ableNext(isInit) {
    if (!isInit && applyType === '2') {
        elAfterPremium.addClass('el_hidden');
        elBeforePremium.removeClass('el_hidden');
    }

    var a = validateRequired(true);
    var b = !$('.after_premium:visible').length;

    if (a && b) targetBtn.prop('disabled', false);
    else targetBtn.prop('disabled', true);
}

function validateData() {
    var positionTop = isApp ? 170 : isMobile ? 235 : 116;

    var copyPreRep = '<strong>대표 가입자</strong>의 ';
    var copySuffix = '<br>정확하게 입력해주세요';
    var repPosition = $('#contents').offset().top - positionTop + 30;
    var cbRep = function () {
        scrollTo(0, repPosition);
    };

    var isSingle = applyType === '1';
    var copyName = isSingle ? null : copyPreRep + '이름을' + copySuffix;
    var copyNative = isSingle ? null : copyPreRep + '경우, 한글 이름을 입력해주세요';
    var copyId = isSingle ? null : copyPreRep + '주민번호를' + copySuffix;

    var a = getData()
        && validateName(nameRep, null, null, copyName, cbRep)
        && validateIdNum(birthRep, ssnRep, null, copyId, cbRep)
        && validateNative(nameRep, birthRep, ssnRep, copyNative, cbRep)
        && validateMobile(mobile, cbRep)
        && validateEmail(email1, emailDomain, cbRep);

    var b = applyType === '1';
    var members = [];

    if (!isChkCoupon) {
        popCouponFalse();
        return false;
    }

    a && applyType === '2' && $('.card:visible').length && $('.card').each(function (i, v) {
        var el = $(v);

        var name = el.find('[name="name"]').val();
        var birth = el.find('[name="birth"]').val();
        var ssn = el.find('[name="ssn"]').val();

        var copyPrefix = '<strong>동반' + (i + 1) + '</strong>의 ';
        var cb = function () {
            scrollTo(0, el.offset().top - positionTop);
        };

        b = validateName(name, null, null, copyPrefix + '이름을' + copySuffix, cb)
            && validateNative(name, birth, ssn, copyPrefix + '경우, 한글 이름을 입력해주세요', cb)
            && validateIdNum(birth, ssn, null, copyPrefix + '주민번호를' + copySuffix, cb);

        if (b) {
            members[i] = {
                name: name,
                birth: birth,
                ssn: ssn
            };
        } else {
            return false;
        }
    });

    applyType === '2' && b && showMiLoader();
    a && b && fnSendPostAjax('/api/duplicate/confirm', {
        travelSeq: travelSeq,
        nameRep: nameRep,
        ssnRep: ssnRep,
        mobile: mobile,
        email: email,
        members: members
    }, {
        s: function () {
            applyType === '1' ? frmMain.submit() : getPremium();
        },
        f: function (res) {
            hideMiLoader();

            var btnText = '확인';
            var goTo, idx, target;

            switch (res.code) {
                case 'ERR_APPLY_0010':
                    target = 'popDupCompanion';
                    break;
                case 'ERR_APPLY_0011':
                case 'ERR_APPLY_0012':
                    idx = res.data;
                    break;
                case 'ERR_APPLY_0013':
                    goTo = '/apply';
                    break;
            }

            miCommonPop.alert({
                dCopy: res.display,
                dButtonText: btnText,
                dTarget: target || 'popDefault',
                dFirstAc: function () {
                    if (!!goTo) location.href = goTo;

                    if (idx !== undefined) {
                        var card = $('.card').eq(res.data);
                        scrollTo(0, card.offset().top - positionTop);
                    }
                }
            });
        }
    }, {
        btn: targetBtn,
        able: 'F'
    });
}

function getPremium() {
    fnSendPostAjax('/api/traveler-info/plan-quote', {
        travelSeq: travelSeq
    }, {
        s: function (res) {
            var listWrap = $('.companion_agree');
            $.each(res.data, function (k, v) {
                if (k === 'travelerList') {
                    listWrap.empty();

                    $.each(v, function (i2, v2) {
                        var tpl = '<li>' +
                            '          <span class="companion_info">' + v2.name + ' [' + v2.birth + '-' + v2.ssn + ']</span>' +
                            '          <label class="mi_check">' +
                            '              <span class="text">동의</span>' +
                            '              <input type="checkbox" name="checkbox">' +
                            '              <i class="ico_check"></i>' +
                            '          </label>' +
                            '      </li>';

                        listWrap.append(tpl);

                        $('.policy_body .togglee,.policy_body .dp1_body ').hide();
                        $('.policy_body .btn_toggler').removeClass('open');
                    });

                    chkAgree = $('.agree_child').find('[type="checkbox"]');
                } else {
                    $('#' + k).text(miUtil.numComma(v));
                }
            });

            chkAgree.prop('checked', false).change();
            elAfterPremium.removeClass('el_hidden');
            elBeforePremium.addClass('el_hidden');

            listWrap.scrollTop(0);

            var top = $('.after_premium').offset().top - 100; // - gnb 100
            if (isApp) top = top + 64;
            $('html, body').animate({ scrollTop: top }, 600);
        },
        c: function () {
            hideMiLoader();
        }
    }, {
        btn: btnGetPremium,
        able: 'F'
    }, 'application/x-www-form-urlencoded');
}

function goNext() {
    applyType === '1' ? validateData() : frmMain.submit();
}
