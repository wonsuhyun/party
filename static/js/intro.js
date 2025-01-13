var goS = $('#goS');
var isContinuable = $('[name="continuableYn"]').val() === 'Y';
var referral = $('[name="referral"]').val();

init();

goS.on('click', function () {
    if (isContinuable) {
        miCommonPop.alert({
            dType: 'confirm',
            dCopy: '진행중인 내역이 있습니다<br>이어서 진행하시겠습니까?',
            dFirstAc: function () {
                resetApply();
            },
            dLastAc: function () {
                goApply();
            }
        });
    } else {
        goApply();
    }
});

function init() {
    $('.data_wrap li').length > 5 && rolling();
    if (referral === 'TY-BCpaybooc' || referral === 'bcpaybooc') miCommonPop.alert('[BC카드 페이북 이벤트]<br>고객님은 <span class="c__point">보험료 10%</span> 할인대상입니다');
}

function rolling() {
    var target = $('.data_wrap');
    var ul = target.find('ul');
    var li = target.find('li');
    var liLen = li.length;
    var liHe = li.outerHeight();

    var cnt = 5;
    var speed = 1000;
    var tp = 0;

    var time = setInterval(function () {
        tp++;

        ul.animate({ top: -liHe }, 300, function () {
            ul.append(ul.find(':first')).css({ top: 0 });
        });

        if (liLen - cnt === tp) {
            clearInterval(time);
        }
    }, speed);
}
