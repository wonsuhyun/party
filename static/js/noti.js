var inYes = $('.mi_check [value="yes"]');
var inNotiYn = $('.noti_yn');
var inPurpose = $('[name="purpose"]');
var inNotiCheck = $('[name="noti_check"]');

var elRequiredAgree = $('#requiredAgree');
var btnNext = $('#btnNext');
var frmMain = $('#frmMain');

var applyType = $('#applyType').val();

getInputOrd();

inYes.on('click', function () {
    var _this = $(this);

    miCommonPop.alert({
        dCopy: '보험가입대상이 아닙니다',
        dFirstAc: function () {
            _this.prop('checked', false).closest('.mi_check').removeClass('checked');
        }
    });
});

inNotiYn.on('change', function () {
    var isY = $(this).find('input:checked').val() === 'Y';
    var elNoti = $(this).siblings('.noti');

    if (isY) elNoti.removeClass('el_hidden');
    else elNoti.addClass('el_hidden');
});

inPurpose.on('change', function () {
    var el = $(this);

    el.val() === 'mitravelj' && miCommonPop.alert({
        dCopy: '마이뱅크 <strong class="c__point">해외장기체류보험</strong>을<br>이용해주세요',
        dFirstAc: function () {
            el.val('').addClass('init');
        }
    });
});

btnNext.on('click', function () {
    var a = validateRequired(true);
    var b = applyType === '2' || elRequiredAgree.find('input').prop('checked');
    var c = $('#exEC06').val() === 'N';
    var d = inNotiCheck.prop('checked')

    if (!a) miCommonPop.alert('선택되지 않은 사항이 있습니다');
    else if (!d) miCommonPop.alert('보험가입을 위해<br>확인사항에 체크해주세요');
    else if (!b) miCommonPop.alert('보험가입을 위해 동의가 필요합니다');
    else if (!c) miCommonPop.alert({
        dCopy: '항공위탁수하물 파손/도난/분실 및 \n휴대물품 파손/도난은 \n보장에서 제외됩니다',
        dFirstAc: function () {
            frmMain.submit()
        }
    });
    else frmMain.submit()
});
