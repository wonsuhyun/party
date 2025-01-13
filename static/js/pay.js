var elPayType = $('.pay_type_wrap');
var elGetAccInfo = $('#elGetAccInfo');
var elAccountInfo = $('.account_info_wrap');
var elAccount = $('#account');

var inPayType = $('[name="payType"]');
var inVBankList = $('#vBankList');

var btnGetAccInfo = $('#btnGetAccInfo');
var btnChkPay = $('#btnChkPay');

var firstYn = $('#firstYn').val() || 'Y';

inPayType.on('click', setPayType);

inVBankList.on('change', function () {
    btnGetAccInfo.prop('disabled', false);
});

btnGetAccInfo.on('click', getAccInfo);
btnChkPay.on('click', chkConfirm);

if (elAccountInfo.length) {
    var clipboard = new ClipboardJS('#btnCopyAcc');

    clipboard.on('success', function () {
        miCommonPop.alert('계좌번호가 복사되었습니다');
    });
}


function setPayType() {
    if (elAccount.text()) {
        return;
    }

    var payType = $('[name="payType"]:checked').val();

    if (payType === 'card' || payType === 'payco') {
        elGetAccInfo.addClass('el_hidden');
        inVBankList.val('');

        var isPayCo = payType === 'payco';
        payStart(isPayCo);

    } else {
        elGetAccInfo.removeClass('el_hidden');

        // ios safari 버그 픽스
        var userAgent = window.navigator.userAgent.toLowerCase();
        var scrollFlag = true;

        if (userAgent.indexOf('mibankios') > -1) scrollFlag = false;
        if (userAgent.indexOf('safari/') > -1 && (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1 || userAgent.indexOf('ipod') > -1)) scrollFlag = false;

        if (scrollFlag) {
            $('html, body').animate({
                scrollTop: elGetAccInfo.offset().top
            }, 1000);

            setTimeout(function(){
                inVBankList.focus();
            },300);
        } else {
            inVBankList.focus();
        }
    }
}

function getAccInfo() {
    var bankCode = $('#vBankList').val();
    var bankName = $('#vBankList option:selected').text();

    if (!bankCode) {
        miCommonPop.alert({
            dCopy: '은행을 선택해주세요',
            dFirstAc: function () {
                inVBankList.focus();
            }
        });
    }

    var param = {
        travelSeq: travelSeq,
        bankCode: bankCode,
        bankName: bankName,
        firstYn: firstYn
    };

    fnSendPostAjax('/api/pay/vbank/open', param, {
        s: function (res) {
            setAccInfo(res);
        },
        f: function (res) {
            switch (res.code) {
                case 'ERR_PAYMENT_0001':
                case 'ERR_PAYMENT_0003':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/mypage/detail/' + res.data
                        }
                    });
                    break;
                case 'ERR_PAYMENT_0002':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.reload();
                        }
                    });
                    break;
                case 'ERR_PAYMENT_0005':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: goApply
                    });
                    break;
                case 'ERR_PAYMENT_0006':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: goApply
                    });
                    break;
                case 'ERR_EXT_0009':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/extend/' + document.order_info.travel_seq.value
                        }
                    });
                    break;
                case 'ERR_EXT_0010':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/extend/' + document.order_info.travel_seq.value
                        }
                    });
                    break;
                default:
                    miCommonPop.alert(res.display);
            }
        }
    }, {
        btn: btnGetAccInfo,
        able: 'F'
    });
}

function chkConfirm() {
    $.get('/api/pay/vbank/confirm?seq=' + travelSeq, function (res) {
        if (!res.success) {
            switch (res.code) {
                case 'ERR_PAYMENT_0005':
                case 'ERR_PAYMENT_0006':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: goApply
                    });
                    break;
                case 'ERR_MODIFY_0008':
                case 'ERR_MODIFY_0009':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/'
                        }
                    });
                    break;
                default:
                    miCommonPop.alert(res.display);
            }
        } else if (res.data === 'FAIL') {
            miCommonPop.alert('아직 입금이 확인되지 않았습니다 <br>은행 사정에 따라 입금확인시까지 5분정도 소요될 수 있습니다');
        } else if (res.data === 'SUCCESS_MODIFY'){
            location.href = '/mod_plan/close/' + travelSeq;
        } else {
            if (firstYn==='N')  location.href = '/pay/ext/close/' + travelSeq;
            else location.href = '/pay/close/' + travelSeq;
        }
    });
}


var ajax_flag = true;
var PayUrl = '';

function payStart(isPayco) {
    var ajaxData = new Object();
    ajaxData.travelSeq = document.order_info.travel_seq.value;
    ajaxData.firstYn = firstYn;

    var url = isPayco ? '/api/pay/payco' : '/api/pay/add_card';
    var paycoOnly = isPayco ? 'Y' : 'N';

    fnSendPostAjax(url, ajaxData, {
        s: function (res) {
            var data = res.data;
            if(data.pgCompany == 'KCP'){
                $('input[name="req_tx"]').val('pay');
                $('input[name="ordr_idxx"]').val(data.oid);
                $('input[name="good_name"]').val(data.good_name);
                $('input[name="good_mny"]').val(data.amt);
                $('input[name="buyr_name"]').val(data.name);
                $('input[name="buyr_mail"]').val(data.email);
                $('input[name="buyr_tel2"]').val(data.hp);
                $('input[name="site_cd"]').val(data.site_cd);
                $('input[name="site_name"]').val(data.site_name);
                $('input[name="payco_direct"]').val(paycoOnly);
                $('input[name="Ret_URL"]').val(data.response_url);
                document.order_info.action = data.response_url;

                if (isMobile) {
                    kcp_AJAX();
                } else {
                    $('input[name="pay_method"]').val(data.pay_method);
                    $('input[name="module_type"]').val(data.module_type);
                    $('input[name="currency"]').val('WON');
                    KCP_Pay_Execute(document.order_info);
                }
            }else if(data.pgCompany == 'SMTR'){
                smartroPay(data);
            }

        },
        f: function (res) {
            switch (res.code) {
                case 'ERR_PAYMENT_0001':
                case 'ERR_PAYMENT_0003':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/mypage/detail/' + res.data
                        }
                    });
                    break;
                case 'ERR_PAYMENT_0002':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.reload();
                        }
                    });
                    break;
                case 'ERR_PAYMENT_0005':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: goApply
                    });
                    break;
                case 'ERR_PAYMENT_0006':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: goApply
                    });
                    break;
                case 'ERR_EXT_0009':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/extend/' + document.order_info.travel_seq.value
                        }
                    });
                    break;
                case 'ERR_EXT_0010':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/extend/' + document.order_info.travel_seq.value
                        }
                    });
                    break;
                default:
                    miCommonPop.alert(res.display);
            }
        }
    });
}

function kcp_AJAX() {
    if (ajax_flag) {
        var url = '/api/pay/auth';
        var form = document.order_info;

        $.post(url, {
            site_cd: form.site_cd.value,
            ordr_idxx: form.ordr_idxx.value,
            good_mny: form.good_mny.value,
            pay_method: form.pay_method.value,
            escw_used: form.escw_used.value,
            good_name: form.good_name.value,
            response_type: form.response_type.value,
            Ret_URL: form.Ret_URL.value
        }, 'application/json')
            .done(function (jqXHR) {
                var json = JSON.parse(jqXHR);

                if (json.Code === '0000') {
                    document.getElementById('approval').value = json.approvalKey;
                    PayUrl = json.PayUrl;
                    document.getElementById('PayUrl').value = json.request_URI;
                    document.getElementById('traceNo').value = json.traceNo;
                    call_pay_form();
                } else {
                    ajax_flag = true;
                    miCommonPop.alert(json.Message);
                }
            })
            .fail(function (jqXHR) {
                miCommonPop.alert('장애 발생');
            });

        ajax_flag = false;
    } else {
        miCommonPop.alert('통신 중입니다. 잠시만 기다려 주세요.');
    }
}

function call_pay_form() {
    var v_frm = document.order_info;

    v_frm.action = PayUrl;

    if (v_frm.Ret_URL.value == '') {
        miCommonPop.alert('연동시 Ret_URL을 반드시 설정하셔야 됩니다.');
        return false;
    } else {
        v_frm.submit();
    }
}

function smartroPay(data) {
    var tranMgr = document.tranMgr;

    try {
        if (win == null || win.closed || typeof win.closed == 'undefined' || win.screenLeft == 0) {
            alert('브라우저 팝업이 차단으로 설정되었습니다.\n 팝업 차단 해제를 설정해 주시기 바랍니다.');
            return false;
        }
    } catch (e) {

    }

    smartropay.init({
        mode: document.tranMgr.mode.value
    });

    $('#tranMgr [name="PayMethod"]').val(data.PayMethod);
    $('#tranMgr [name="GoodsCnt"]').val(data.GoodsCnt);
    $('#tranMgr [name="GoodsName"]').val(data.GoodsName);
    $('#tranMgr [name="Amt"]').val(data.Amt);
    $('#tranMgr [name="Moid"]').val(data.Moid);
    $('#tranMgr [name="Mid"]').val(data.Mid);
    $('#tranMgr [name="ReturnUrl"]').val(data.ReturnUrl);
    $('#tranMgr [name="StopUrl"]').val(data.StopUrl);
    $('#tranMgr [name="BuyerName"]').val(data.BuyerName);
    $('#tranMgr [name="BuyerTel"]').val(data.BuyerTel);
    $('#tranMgr [name="BuyerEmail"]').val(data.BuyerEmail);
    $('#tranMgr [name="UserIp"]').val(data.UserIp);
    $('#tranMgr [name="MallIp"]').val(data.MallIp);
    $('#tranMgr [name="EdiDate"]').val(data.EdiDate);
    $('#tranMgr [name="Forward"]').val(data.Forward);
    $('#tranMgr [name="EncryptData"]').val(data.EncryptData);
    $('#tranMgr [name="TaxFreeAmt"]').val(data.Amt);

    if (isMobile) {
        smartropay.payment({
                FormId : 'tranMgr'
            }
        );
    } else {
        smartropay.payment({
            FormId: 'tranMgr',
            Callback: function (res) {
                var approvalForm = document.approvalForm;
                approvalForm.Tid.value = res.Tid;
                approvalForm.TrAuthKey.value = res.TrAuthKey;
                approvalForm.action = document.tranMgr.ReturnUrl.value;
                approvalForm.submit();
            }
        });
    }
}
