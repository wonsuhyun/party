var btnCancelCovid = $('#btnCancelCovid');
var btnCancel = $('#btnCancel');

var applyType = $('[name="applyType"]').val();
var payMethod = $('[name="payMethod"]').val();
var travelerName = $('#travelerName').text();
var travelerCount = $('#travelerCount').text();

travelSeq = $('[name="seq"]').val();

btnCancelCovid.on('click', function () {
    miCommonPop.alert({
        dCopy: '<span class="c__point">COVID-19 격리비/항공료 보장만 빼실 경우,\n' +
            '<strong class="c__red">' + miUtil.numComma(totalDiscountAmt) + '원(보험료의 10%)이 환불</strong>됩니다</span>',
        dCloseX: true,
        dFirstAc: cancelCovid
    });
});

btnCancel.on('click', function () {
    var copy = (applyType === '1' || Number(travelerCount) === 1) ? '가입하신 보험을 취소하시겠습니까?'
        : travelerName + '님 외 ' + (Number(travelerCount) - 1) + '명의 보험가입을\n취소하시겠습니까?';

    miCommonPop.alert({
        dType: 'confirm',
        dCopy: '가입이 취소되면 보험료가 전액환불됩니다\n' + copy,
        dButtonSet: '<button type="button" class="mi_btn white btn_first">예</button>' +
            '<button type="button" class="mi_btn white btn_last">아니요</button>',
        dFirstAc: cancel
    });
});

function reload() {
    location.reload()
}

function goIntro() {
    location.replace('/')
}

function goMyDetail() {
    location.replace('/mypage/detail/' + travelSeq)
}

function cancelCovid() {
    fnSendPostAjax('/api/cancel/covid', { travelSeq: travelSeq }, {
        s: function (res) {
            var data = res.data;
            var payMethodCopy = data.payMethod === 'CARD' ? '환불금액은 카드결제취소되었고, 카드사 반영시까지 2~3일 정도 소요될 수 있습니다'
                : '환불금액은 방금 보내드린 카카오톡 메시지를 통해 계좌를 입력해주시면 다음 영업일까지 입금해드립니다';

            miCommonPop.alert({
                dCopy: '<ul class="bullet_list">' +
                    '<li><strong class="c__point">환불금액은 ' + miUtil.numComma(data.totalDiscAmt) + '원</strong>입니다</li>' +
                    '<li>' + payMethodCopy + '</li>' +
                    '<li>COVID-19 격리비/항공료 보장만 빠진 새로운 보험가입증명서가 <span class="c__point">' + data.email + '</span>로 발송되었습니다</li>' +
                    '</ul>',
                dFirstAc: goMyDetail
            });
        },
        f: function (res) {
            var cb;

            switch (res.code) {
                case 'ERR_MODIFY_0004':
                case 'ERR_MODIFY_0006':
                    cb = function () {
                        location.replace = '/mypage';
                    }
                    break;
                case 'ERR_MODIFY_0001':
                case 'E0002':
                    cb = goIntro
                    break;
            }

            miCommonPop.alert({
                dCopy: res.display,
                dFirstAc: function () {
                    if (!!cb) cb()
                }
            });
        }
    }, {
        btn: btnCancelCovid,
        able: 'F'
    }, 'application/x-www-form-urlencoded');
}

function cancel() {
    fnSendPostAjax('/api/cancel/' + payMethod.toLowerCase(), { travelSeq: travelSeq }, {
        s: function () {
            var copy = payMethod === 'VBANK' ? '\n방금 보내드린 카카오톡 메시지를 통해 \n환불받으실 계좌를 입력해주세요' : ''
            miCommonPop.alert({
                dCopy: '가입이 취소되었습니다' + copy,
                dFirstAc: goMyDetail
            })
        },
        f: function (res) {
            var cb;

            if (res.code === 'ERR_MODIFY_0001' || res.code === 'ERR_MODIFY_0005') {
                cb = goMyDetail
            }

            miCommonPop.alert({
                dCopy: res.display,
                dFirstAc: function () {
                    if (!!cb) cb()
                }
            });
        }
    }, {
        btn: btnCancel,
        able: 'F'
    })
}
