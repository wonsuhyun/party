var elConfirm = $('.confirm_wrap');

var btnNo = $('#btnNo');
var btnYes = $('#btnYes');
var btnCopyAcc = $('#btnCopyAcc');

var isModify = $('[name="flowType"]').val() === 'MODIFY';

btnNo.on('click', confirmNo);
btnYes.on('click', confirmYes);

function confirmNo() {
    var copy = isModify ? '플랜선택 페이지로 이동합니다\n이동시 선택하신 플랜설정이' : '간편계산 페이지로 이동합니다<br>이동시 입력하신 정보가';

    miCommonPop.alert({
        dType: 'confirm',
        dCopy: copy + ' 초기화됩니다<br>그래도 이동하시겠습니까?',
        dButtonSetText: ['예', '아니요'],
        dFirstAc: function () {
            if (isModify) location.replace('/modify');
            else resetApply();
        }
    });
}

function confirmYes() {
    fnSendPostAjax('/api/confirm-info/confirm', {
        travelSeq: travelSeq
    }, {
        s: function (res) {
            if (!res.data) {
                miCommonPop.alert('사용하실 수 있는 쿠폰이 없습니다<br>변경된 보험료를 확인해주세요');

                $('.premium .total').html($('.premium .origin em').html());
                $('.premium .origin, .save_info').remove();
            }

            elConfirm.add($('.btn_prev')).remove();
            elPayType.removeClass('el_hidden');

            scrollTo(0, elPayType.offset().top);
        }, f: function (res) {
            switch (res.code) {
                case 'ERR_APPLY_0033':
                    goApply();
                    break;
                case 'ERR_COUPON_0004':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: goApply
                    });
                    break;
                case 'ERR_MODIFY_0004':
                case 'ERR_MODIFY_0006':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/mypage';
                        }
                    });
                    break;
                case 'ERR_MODIFY_0001':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/';
                        }
                    });
                    break;
                default:
                    miCommonPop.alert(res.display);
            }
        }
    }, {
        btn: btnYes,
        able: 'F'
    }, 'application/x-www-form-urlencoded');
}

function setAccInfo(res) {
    var data = res.data;

    $.each(data, function (k, v) {
        var text;

        switch (k) {
            case 'amount':
                text = miUtil.numComma(v) + '원';
                break;
            default :
                text = v;
        }

        $('#' + k).text(text);
    });

    btnCopyAcc.attr('data-clipboard-text', data.account);

    $('.mi_check.card').add('.mi_check.payco').addClass('disabled');
    inPayType.prop('disabled', true);
    inVBankList.closest('.input_group').remove();
    elAccountInfo.removeClass('el_hidden');

    $('html, body').animate({
        scrollTop: elAccountInfo.offset().top
    }, 1000);
}
