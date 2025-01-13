var btnCancel = $('.btn_cancel'),
    btnClaim = $('.btn_claim'),
    btnPay = $('#btnPay'),
    btnChgEmailPop = $('#btnChgEmailPop'),
    userEmail = $('[name="email"]'),
    email1 = $('#emailId'),
    email2 = $('#emailDomain'),
    email2Change = $('#emailSelect'),
    btnChgEmail = $('#btnChgEmail'),
    btnChgNationPop = $('#openChgNationPop'),
    btnChgNation = $('#btnChgNation'),
    originNation = $('[name="originNationCd"]'),
    popPeriod = $('#popPeriod'),
    travelerSeq = $('[name="travelerSeq"]').val(),
    btnExtension = $('#btnExtension'),
    btnPeriodPop = $('.btn_period'),
    btnPaper = $('.btn_paper'),
    btnSendPaper = $('#btnSendPaper'),
    isReq = $('[name=repYn]').val() === 'Y'


var elPopCertificate = $('#popCertificate');
var elCertTitle = elPopCertificate.find('.pop_title');
var elCertBody = elPopCertificate.find('.pop_body');
var elCertBottom = elPopCertificate.find('.pop_bottom');
var elCertEmailWrap = elPopCertificate.find('.email_wrap');
var elCertNameSpace = elPopCertificate.find('.name_space');

var btnCert = $('.btn_cert');
var btnGetCert = $('#btnGetCert');

var inNameEn = $('[name="nameEn"]');
var inCertType = $('[name="certType"]');
var inCertAction = $('[name="actionType"]');
var inCertAll = $('#certAll');

var popClaimOther = $('#popClaimOther');

var certBodyH, certContentsH, certAction;
var certType = 'kc';

var popType = getUrlParameter('popType');

travelSeq = $('[name="seq"]').val();

setAccInfo = reload;

init();

btnCancel.on('click', cancel);
btnChgNation.on('click', changNation);
btnExtension.on('click', checkPossible);
btnChgNationPop.on('click', showPopNation);
btnGetCert.on('click', getCert);
btnClaim.on('click', function(){


    if ($('[name=possibleClaimYn]').val() === 'N') {
        miCommonPop.alert('보험개시 이후부터 이용가능합니다');
        return false;
    }

    if ($('[name=lastCaSeq]').val()) {
        miCommonPop.setting({
            dCopy : '<strong class="c__point">작성중인 보상청구서류가 있습니다<br>이어서 작성하시겠습니까?</strong>',
            dCopyAlign: 't__center',
            dType: 'confirm',
            dFirstAc: function(){
                movePage();
            },
            dLastAc : function(){
                location.href = '/claim/type?caSeq=' + $('[name=lastCaSeq]').val();
            }
        });
        return  false;
    }

    movePage();
    function movePage (){
        var param = '?travel=' + travelSeq;
        if (isReq) {
            if (!travelerSeq) {
                showPopTraveler();
            } else {
                param += '&traveler=' + travelerSeq;
                location.href = '/claim/type' + param;
            }
        } else {
            miCommonPop.setting({
                dTarget : 'popClaimOther',
                dCloseAc : function(){
                    getInputOrd();
                    popClaimOther.find('.mi_input').val('');
                    popClaimOther.find('.mi_check input[value=self]').prop('checked',true);
                    popClaimOther.find('.other_info').addClass('el_hidden');
                }
            })
        }
    }
})

function showPopTraveler (){
    $.get('/api/traveler-list?travelSeq=' + travelSeq, function (res) {
        if (res.success) {
            var data = res.data;
            var elList = $('#popClaimPeople').find('tbody');
            elList.empty();
            $.each(data, function (k, v) {
                switch (k) {
                    case 'detailList':
                        $.each(v, function (i, obj) {
                            var isRefund = obj.refundYn === 'Y';
                            if (!isRefund) {
                                var tpl =
                                    '    <tr>' +
                                    '        <td class="t__center"><label class="mi_check"><input type="radio" value="'+ obj.travelerSeq +'" name="travelerSelect" '+(isRefund ? 'disabled' : '' )+'><i class="ico_circle_inner"></i></label></td>' +
                                    '        <td class="t__center">' + obj.name + '</td>' +
                                    '        <td class="t__center">' + obj.birth + '-' + obj.ssn + '</td>' +
                                    '    </tr>';
                                elList.append(tpl);
                            }
                        });
                        break;
                }
            });

            miCommonPop.setting({
                dTarget: 'popClaimPeople',
                dLastAc: function () {
                    var tSeq = $('#popClaimPeople [name=travelerSelect]:checked');
                    if (tSeq.length) {
                        var param = '?travel=' + travelSeq;
                        param += '&traveler=' +  tSeq.val();
                        location.href = '/claim/type' + param;
                    }
                }
            });
        } else {
            miCommonPop.alert(res.display);
        }
    });
}

popClaimOther.on('change','.mi_check', function(e){
    if (popClaimOther.find('input:checked').val() === 'other') popClaimOther.find('.other_info').removeClass('el_hidden')
    else popClaimOther.find('.other_info').addClass('el_hidden').find('input').val('')

    miCommonPop.rePosition('popClaimOther');
    getInputOrd();

}).on('click', '#sendClaimOther',function(e){
    if (popClaimOther.find('input:checked').val() === 'self') {
        location.href = '/claim/type?travel=' + travelSeq + '&traveler=' +  travelerSeq;
    } else {
        var name = popClaimOther.find('[name=claim_name]')
        var birth = popClaimOther.find('[name=claim_birth]')
        var ssn = popClaimOther.find('[name=claim_ssn]')
        var param = {
            travelSeq : travelSeq,
            name : name.val(),
            birth : birth.val(),
            ssn : ssn.val()
        }

        getInputOrd();

        validateRequired()
        && validateName(name,birth.val(),ssn.val())
        && validateIdNum(birth,ssn)
        && fnSendPostAjax('/api/claim/traveler', param , {
            s: function(res){
                location.href = '/claim/type?travel=' + travelSeq + '&traveler=' +  res.data;
            }
        })
    }
}).on('keyup','input[type=tel]', function(e){
    cleanInput(e,'NUM',true)
})

btnPeriodPop.on('click', function () {
    getPeriodList();
    miCommonPop.setting({
        dTarget: 'popPeriod',
        dOpenAc: function () {
            if (popPeriod.find('.pop_body').height() < popPeriod.find('.pop_contents').innerHeight()) popPeriod.find('.pop_bottom').addClass('shadow');
            else popPeriod.find('.pop_bottom').removeClass('shadow');
            popPeriod.find('.pop_body').scrollTop(0);
        }
    });
});

btnPaper.on('click', function(){
    miCommonPop.setting({
        dTarget : 'popPaper',
        dCloseAc : function(){
            reload();
        }
    })
});

btnSendPaper.on('click', function(){
    var emailWrap = $('#popPaper .email_wrap')
    var email
    email = getValidEmail(emailWrap);

    if (email) {
        fnSendPostAjax('/api/mail-send', {
            mailType : 'D',
            email : email,
            travelSeq : travelSeq
        },{
            s: function (){
                miCommonPop.setting({
                    dCopyAlign : 't__center',
                    dCopy : '<p class="icon_box success"> 보상청구서류를<br> <span class="c__point">'+email+'</span>로 <br>보내드렸습니다</p>',
                    dFirstAc : function () {
                        reload()
                    }
                })
            }
        })
    }

});

btnChgEmailPop.on('click', function () {
    miCommonPop.setting({
        dTarget: 'popChangeEmail',
        dOpenAc: function () {
            getInputOrd();
            userEmailSet();
        }
    });
});

btnChgEmail.on('click', changeEmail);

btnPay.on('click', function () {
    $(this).remove();
    $('.common_wrap.f__item').removeClass('f__item');
    elPayType.removeClass('el_hidden').closest('.common_wrap').addClass('f__item');
    scrollTo(0, elPayType.offset().top);
});

btnCert.on('click', function () {
    certAction = 'email';
    showPopCertificate();
});

elCertBody.on('scroll', function () {
    var docTop = elCertBody.scrollTop() + certBodyH;

    if (docTop > certBodyH) elCertTitle.addClass('shadow_down');
    else elCertTitle.removeClass('shadow_down');

    if (docTop < certContentsH) elCertBottom.addClass('down');
    else elCertBottom.removeClass('down');
});

inCertType.on('change', function () {
    certType = $('[name="certType"]:checked').val();

    if (certType === 'ec') elCertNameSpace.removeClass('el_hidden');
    else elCertNameSpace.addClass('el_hidden');

    miCommonPop.rePosition('popCertificate');
    resetPopCert();
});

inCertAction.on('change', function () {
    certAction = $('[name="actionType"]:checked').val();

    if (certAction === 'email') elCertEmailWrap.removeClass('el_hidden');
    else elCertEmailWrap.addClass('el_hidden');
});

inCertAll.on('change', function () {
    var elText = inCertAll.siblings('.text');
    var val = inCertAll.prop('checked');

    elCertNameSpace.find('[name="checkbox"]').prop('checked', val);

    if (val) elText.text('전체해제');
    else elText.text('전체선택');
});

elCertNameSpace.on('change', '[name="checkbox"]', function () {
    var isChecked = elCertNameSpace.find('[name="checkbox"]').length === elCertNameSpace.find('[name="checkbox"]:checked').length;
    var elAllText = inCertAll.siblings('.text');

    inCertAll.prop('checked', isChecked);

    if (isChecked) elAllText.text('전체해제');
    else elAllText.text('전체선택');
});

inNameEn.on({
    'keyup': function (e) {
        cleanInput(e, 'name_eng', true);
    },
    'blur': function (e) {
        cleanInput(e, [/[ |-]$/], false, function (val) {
            var el = $(e.target);
            var newV = val.toUpperCase();

            el.val(newV);
        });
    }
});

function init() {
    if (elPopCertificate.length) {
        elCertNameSpace.find('.mi_input').each(function (i, curr) {
            var el = $(curr);
            el.val(miValidate.deleteLang(el.val(), miValidate.langType['KR']));
        });
    }

    if (popType) {
        switch (popType) {
            case 'kor':
            case 'eng':
                certType = popType === 'kor' ? 'kc' : 'ec';
                // certAction = 'view';

                elPopCertificate.length && showPopCertificate();
                break;
            case 'nation':
                showPopNation();
                break;
            case 'claim':
                showPopTraveler();
                break;
        }
    }
}

function reload() {
    location.replace(location.origin + location.pathname);
}

function cancel() {
    miCommonPop.alert({
        dType: 'confirm',
        dCopy: '신청내역을 취소하시겠습니까?',
        dButtonSetText: ['예', '아니요'],
        dFirstAc: function () {
            resetApply(function () {
                miCommonPop.alert({
                    dCopy: '신청내역이 취소되었습니다',
                    dFirstAc: function () {
                        location.href = '/mypage';
                    }
                });
            });
        }
    });
}

function checkPossible() {
    fnSendPostAjax('/api/extend/possible', { travelSeq: travelSeq }, {
        s: function () {
            location.href = '/extend/' + travelSeq;
        }
    });
}

function userEmailSet() {
    var mailType = userEmail.val().split('@');

    email2.addClass('el_hidden').val('');
    email1.val(mailType[0]);

    if (email2Change.find('option[value="' + mailType[1] + '"]').length > 0) {
        email2Change.val(mailType[1]);
    } else {
        email2Change.val('mibank');
        email2.removeClass('el_hidden');
        email2.val(mailType[1]);
    }
}

function changeEmail() {
    var emailParam = getValidEmail($('#popChangeEmail .email_renew'));

    !!emailParam && fnSendPostAjax('/api/change-email', { travelSeq: travelSeq, email: emailParam }, {
        s: function () {
            miCommonPop.close('popChangeEmail');
            miCommonPop.alert({
                dCopy: '이메일이 변경되었습니다',
                dFirstAc: function () {
                    reload();
                }
            });
        }
    });
}

// 보험기간 팝업
function getPeriodList() {
    $.get('/api/travelers-date?travelSeq=' + travelSeq, function (res) {
        if (res.success) {
            var data = res.data;
            var elList = popPeriod.find('tbody');
            elList.empty();

            $.each(data, function (k, v) {
                var isExtension = v.extensionYn === 'Y';

                var tpl = '<tr>' +
                    '        <td>' + v.name + '</td>' +
                    '        <td>' + v.birth + '</td>' +
                    '        <td ' + (isExtension ? ' class="c__point"' : '') + '>' + v.endDateTime + '</td>' +
                    '     </tr>>';
                elList.append(tpl);
            });

            miCommonPop.setting({
                dTarget: 'popPeriod',
                dOpenAc: function () {
                    if (popPeriod.find('.pop_body').height() < popPeriod.find('.pop_contents').innerHeight()) popPeriod.find('.pop_bottom').addClass('shadow_up');
                    else popPeriod.find('.pop_bottom').removeClass('shadow_up');
                    popPeriod.find('.pop_body').scrollTop(0);
                }
            });

        } else {
            miCommonPop.alert(res.display);
        }
    });
}

function showPopNation() {
    miCommonPop.setting({
        dTarget: 'popChangeCountry',
        dOpenAc: function () {
            $('#popChangeCountry [data-name="nationCd"]').val(originNation.data('nationnmkr'));
            $('[value="' + originNation.val() + '"]').prop('checked', true);
        },
        dCloseAc: function () {
            reload();
        }
    });
}

function changNation() {
    var nationCd = $('#popNation [name=nationCd]:checked').val();

    fnSendPostAjax('/api/change-nation', { travelSeq: travelSeq, nationCd: nationCd }, {
        s: function () {
            miCommonPop.close('popChangeCountry');
            miCommonPop.alert({
                dCopy: '여행국가가 변경되었습니다<br><span class="c__point">가입증명서를 다시 다운로드 받아주세요</span>',
                dFirstAc: function () {
                    reload();
                }
            });
        }
    });
}

function getEmailData() {
    var domain = email2Change.val() === 'mibank' ? email2.val() : email2Change.val();
    return email1.val() + '@' + domain;
}

function showPopCertificate() {
    miCommonPop.setting({
        dTarget: 'popCertificate',
        dOpenAc: function () {
            $('[name="certType"][value="' + certType + '"]').prop('checked', true).change();
            $('[name="actionType"][value="' + certAction + '"]').prop('checked', true).change();
            inCertAll.prop('checked', true).change();

            elPopCertificate.find('.pop_body').scrollTop(0);
            resetPopCert();

            if (isApp) miAppProtocol.call('showTabBar', { isShow: 'N' });
        },
        dCloseAc: function () {
            reload();
        }
    });
}

function resetPopCert() {
    certBodyH = elPopCertificate.find('.pop_body').height();
    certContentsH = elPopCertificate.find('.pop_contents').innerHeight();

    if (certBodyH < certContentsH) elCertBottom.addClass('down');
    else elCertBottom.removeClass('down');
}

function getCert() {
    certAction = 'email'
    var url = certAction === 'email' ? '/api/mail-send' : '/api/cert-url';
    var param = {
        travelSeq: travelSeq,
        certType: certType.toUpperCase(),
        mailType: certType.toUpperCase(),
        actionType: certAction
    };

    if (certAction === 'email') {
        var email = getValidEmail(elCertEmailWrap);

        if (email) param.email = email;
        else return false;
    }

    var isValid = true;
    if (certType === 'ec') {
        var travelers = [];

        elCertNameSpace.find('.input_group').each(function (i, curr) {
            var wrapper = $(curr);
            var checkbox = wrapper.find('[name="checkbox"]');
            var isChecked = checkbox.prop('checked');

            if (isChecked) {
                var inNameEn = wrapper.find('[name="nameEn"]');
                var nameEn = inNameEn.val();
                var name = wrapper.find('.text').text();
                var cb = function () {
                    inNameEn.focus();
                };

                if (!nameEn) {
                    miCommonPop.alert({
                        dCopy: name + '님의 영문이름을 입력해주세요',
                        dFirstAc: cb
                    });

                    isValid = false;
                    return isValid;
                }

                if (validateName(nameEn, null, null, name + '님의 영문이름을 정확하게 입력해주세요', cb)) {
                    var traveler = {
                        travelerSeq: checkbox.val(),
                        nameEn: nameEn
                    };

                    travelers.push(traveler);
                } else {
                    isValid = false;
                    return isValid;
                }
            }
        });

        if (!travelers.length) {
            isValid = false;
            miCommonPop.alert('1명 이상의 가입자를 선택해주세요');
        } else {
            param.travelers = travelers;
        }
    }

    if (!isValid) return false;

    showMiLoader();
    fnSendPostAjax(url, param, {
        s: function (res) {
            var data = res.data;

            switch (certAction) {
                case 'email':
                    var sub = /(gmail.com|hotmail.com)$/.test(param.email) ? '<p class="sub">간혹 스팸 메일로 인식하는 경우가 있으니\n<span class="c__red">스팸함을 확인</span>해주세요</p>' : '';
                    var dCopy = '<div class="icon_box success">가입증명서가 발송되었습니다' + sub + '</div>';

                    miCommonPop.close('popCertificate');
                    miCommonPop.alert({
                        dCopy: dCopy,
                        dFirstAc: reload
                    });
                    break;
                case 'down':
                    if (isApp) {
                        miAppProtocol.call('downloadFile', { url: encodeURIComponent(data) }, 'reload');
                    } else {
                        $.fileDownload(data);
                    }
                    break;
                case 'view':
                    if (isApp) {
                        miAppProtocol.call('showPdfViewer', { url: encodeURIComponent(data) }, 'reload');
                    } else {
                        var popup = window.open(data, '_blank');
                        // winOpen.location = data;
                        if (isPopupBlockActivated(popup)) {
                            hideMiLoader();
                            alert('팝업이 차단되어있습니다\n팝업 차단을 해제하신후 다시 시도해주세요');
                        } else {
                            reload();
                        }
                    }
                    break;
            }
        },
        c: function () {
            hideMiLoader();
        }
    }, {
        btn: btnGetCert,
        able: 'C'
    });
}

function isPopupBlockActivated(popupWindow) {
    if (popupWindow) {
        if (/chrome/.test(navigator.userAgent.toLowerCase())) {
            try {
                popupWindow.focus();
            } catch (e) {
                return true;
            }
        } else {
            popupWindow.onload = function () {
                return (popupWindow.innerHeight > 0) === false;
            };
        }
    } else {
        return true;
    }
    return false;
};
