var btnSend = $('.btn_send, .btn_invite'),
    inMobile = $('[name="userMobile"]'),
    goNext = $('#goNext'),
    counponSeq,
    selectedCoupon;

var btnGuide = $('.btn_guide');
var isTravel = false;

inMobile.on({
    'focus keyup': function (e) {
        cleanInput(e, 'MOBILE', true);
    },
    'blur': function (e) {
        cleanInput(e, 'MOBILE', true);
    }
});

btnSend.on('click', function () {
    var elPopTitle = $('#popCoupon .pop_title');

    selectedCoupon = $(this).parents('.coupon');
    counponSeq = $(this).data('seq');
    isTravel = $(this).data('insu') === 'TR';

    miCommonPop.setting({
        dTarget: 'popCoupon',
        dOpenAc: function () {
            if (isTravel) $('#popCoupon').removeClass('golf_type');
            else $('#popCoupon').addClass('golf_type');

            inMobile.val('');
            getInputOrd();

            elPopTitle.text(isTravel ? '쿠폰 선물하기' : '홀인원보험 초대하기');

            setTimeout(function () {
                inMobile.focus();
            });
        }
    });
});

goNext.on('click', sendCoupon);

btnGuide.on('click', function () {
    var insuType = $(this).data('insu');
    var title, copy;

    switch (insuType) {
        case 'TR':
            title = '해외여행자보험 쿠폰';
            copy = '<li>해외여행자보험 가입자에게 제공되는 사은쿠폰입니다</li>' +
                '<li>마이뱅크 해외여행자보험 가입시, 보험료의 10%(가입자 1인당 3만원 한도)가 쿠폰으로 결제됩니다</li>' +
                '<li>쿠폰 1매로 동반가입자 <strong>모두에게 함께 적용</strong>됩니다</li>' +
                '<li><strong>선물하기</strong>도 가능합니다</li>' +
                '<li>보험가입시 쿠폰보유자의 휴대폰번호가 입력되면 쿠폰이 <strong>자동적용</strong>됩니다</li>';
            break;
        case 'GF':
            title = '홀인원보험 초대장';
            copy = '<li>마이뱅크 홀인원보험 페이지에 <strong>입장할 수 있는</strong> 초대장입니다(최초 1회만 인증)</li>' +
                '<li><strong>초대장 인증이 완료된 휴대폰번호로 가입</strong>하시면 동반가입자 모두에게 <strong>할인된 보험료가 적용</strong>됩니다</li>' +
                '<li><strong>선물하기</strong>도 가능합니다</li>';
    }

    miCommonPop.setting({
        dTarget: 'popCouponGuide' + insuType,
        dTitle: title + ' 사용방법',
        dCloseX: true,
        dCopy: '<ol class="ol_count">' + copy + '</ol>'
    });
});

function sendCoupon() {
    var path = isTravel ? 'coupon' : 'golf';
    var type = isTravel ? '쿠폰' : '초대장';
    var golfClass = isTravel ? '' : 'golf_type';

    fnSendPostAjax('/api/' + path + '/gift', {
        couponSeq: counponSeq,
        toMobile: inMobile.val()
    }, {
        s: function () {
            selectedCoupon.addClass('used');
            selectedCoupon.find('.btn_send, .btn_invite').prop('disabled', true);


            miCommonPop.alert({
                dCopy: '<div class="icon_box success">' + type + '이 발송되었습니다</div>',
                dClass: golfClass,
                dOpenAc: function () {
                    miCommonPop.close('popCoupon');
                }
            });
        },
        f: function (res) {
            var copy;
            var isClosePop = false;

            switch (res.code) {
                case 'ERR_COUPON_0001':
                    copy = '본인에게 선물하실 수 없습니다\n다른사람의 휴대폰번호를 입력해주세요';
                    break;
                case 'ERR_COUPON_0002' :
                    copy = '이미 사용하셨거나 유효기간이 만료되어\n쿠폰을 선물하실 수 없습니다';
                    isClosePop = true;
                    break;
                default :
                    copy = res.display;
                    break;
            }

            miCommonPop.alert({
                dCopy: copy,
                dClass: golfClass,
                dFirstAc: function () {
                    if (isClosePop) {
                        miCommonPop.close('popCoupon');
                    }
                }
            });
        }
    }, {
        btn: goNext,
        able: 'C'
    });
}
