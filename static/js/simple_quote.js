var inStartDate = $('[name="startDate"]');
var inStartTime = $('[name="startTime"]');
var inEndDate = $('[name="endDate"]');
var inEndTime = $('[name="endTime"]');
var inBirth = $('[name="birthRep"]');
var inGender = $('[name="genderRep"]');
var inPlanTypeCd = $('[name="planTypeCd"]');
var inApplyType = $('[name="applyType"]');
var inChanger = $('.plan').find('select, .check_group');

var startDate, startTime, endDate, endTime, birth, gender, nationCd;

var frmMain = $('#frmMain');
var btnGuide = $('#btnGuide');
var btnEstimate = $('.btn_estimate');
var btnModify = $('#btnModify');

var elDatepicker = $('#datepicker');
var elEstimate = $('.estimate_wrap');
var elPlanWrap = $('.plan_wrap');
var elPlanTab = $('.plan_tab');
var elDatePickerTitle = $('#popDatepicker .pop_title span');
var elNationNm = $('.js_nation_nm');

var isModify = $('[name="flowType"]').val() === 'MODIFY';
var referral = $('[name="referral"]').val();
var possibleStartDate = $('[name="possibleStartDate"]').val();
var possibleStartTime = $('[name="possibleStartTime"]').val();
var planTypeCd = $('[name="planTypeCd"]:checked').val();

var possibleEndDateMax;

var datepickerOption = {
    prevText: '',
    nextText: '',
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
    showMonthAfterYear: true,
    yearSuffix: '년',
    dateFormat: 'yy-mm-dd'
};

var btnConvert = $('.btn_convert');
var countFn;
var convertFlag = false;

init();

$('.travel_info .mi_input').on('keyup change', function () {
    btnEstimate.prop('disabled', false);
    elEstimate.addClass('el_hidden');
});

$('.not_yet').on('click', function () {
    var name = $(this).data('name');

    if (name === 'startTime') chkPrevVal(0);
    else chkPrevVal(2);
});

inStartDate.on('click', function () {
    showStartDatepicker();
});

inStartDate.add(inStartTime).add(inEndDate).add(inEndTime).on('change', function (e) {
    var curr = e.target;
    var idx = requiredArr.indexOf(curr);

    for (var i = idx + 1; i <= 3; i++) {
        $(requiredArr[i]).val('');
    }

    if (idx === 0) makeTime('start');
    else if (idx === 2) makeTime('end');
});

inEndDate.on('click', function () {
    showEndDatepicker();
});

inBirth.on({
    'keyup': function (e) {
        cleanInput(e, 'NUM', true);
    },
    'blur': function (e) {
        cleanInput(e, 'NUM', true, function () {
            validateIdNum(inBirth);
        });
    }
});

btnGuide.on('click', function () {
    miCommonPop.setting({
        dType: 'default',
        dTarget: 'popGuide',
        dTitle: '여러국가 여행시 국가선택',
        dCopy: '<ol class="ol_count">' +
            '    <li>여러국가 여행시 국가 선택은 <span class="c__point">첫번째 체류할 국가를 선택</span>하시면 됩니다</li>' +
            '    <li>여러국가를 여행하셔도 보험기간 동안은 모두 보장됩니다(단, 여행금지국가 등 3단계 이상의 여행경보지역 제외)</li>' +
            '    <li><span class="t__underline">여행지에 체코, 쿠바가 포함된 경우</span> 여행국가를 <span class="c__red">체코, 쿠바</span>로 선택해주세요</li>' +
            '    <li>가입증명서에 기재된 여행국가는 언제든지 마이페이지에서 변경 가능하며, 이 경우 변경된 국가가 반영된 가입증명서를 이메일로 다시 받으실 수 있습니다</li>' +
            '</ol>'
    });
});

btnEstimate.on('click', estimate);

inPlanTypeCd.on('change', function () {
    planTypeCd = $('[name="planTypeCd"]:checked').val();

    convertReset();

    $('.plan_' + planTypeCd).removeClass('el_hidden').siblings('div').addClass('el_hidden');

    var elShadow = elPlanTab.find('.shadow_down');
    if (elShadow.length) {
        elShadow.removeClass('shadow_down');
        $(this).closest('.mi_check').addClass('shadow_down');
    }
});

inChanger.on('change', function () {
    modifyPlan($(this));
});

inApplyType.on('change', function () {
    frmMain.submit();
});

btnConvert.on('click', function(){
    modifyKrEn('kr');
    if (countFn) clearTimeout(countFn);

    countFn = setTimeout(function(){
        modifyKrEn('en');
    },2000)
});

$('.price_box').on('click', function(){
    if (convertFlag) {
        convertReset();
    }
});

btnModify.on('click', function () {
    showMiLoader();
    fnSendPostAjax('/api/change/covid', { travelSeq: travelSeq, planTypeCd: planTypeCd }, {
        s: function (res) {
            var data = res.data;
            var payMethodCopy = data.payMethod === 'CARD' ? '환불금액은 카드결제취소되었고, 카드사 반영시까지 2~3일 정도 소요될 수 있습니다'
                : '환불금액은 방금 보내드린 카카오톡 메시지를 통해 계좌를 입력해주시면 다음 영업일까지 입금해드립니다';

            miCommonPop.alert({
                dCopy: '<ul class="bullet_list">' +
                    '<li><strong class="c__point">환불금액은 ' + miUtil.numComma(data.totalDiscAmt) + '원</strong>입니다</li>' +
                    '<li>' + payMethodCopy + '</li>' +
                    '<li>새로운 보험가입증명서가 <span class="c__point">' + data.email + '</span>로 발송되었습니다</li>' +
                    '</ul>',
                dFirstAc: function () {
                    location.replace('/mypage/detail/' + travelSeq)
                }
            });
        },
        f: function (res) {
            var goTo;

            switch (res.code) {
                case 'ERR_MODIFY_0004':
                case 'ERR_MODIFY_0006':
                    goTo = '/mypage';
                    break;
                case 'ERR_MODIFY_0001':
                case 'E0002':
                    goTo = '/';
                    break;
            }

            miCommonPop.alert({
                dCopy: res.display,
                dFirstAc: function () {
                    if (!!goTo) location.replace(goTo);
                }
            });
        },
        c: function () {
            hideMiLoader()
        }
    }, {
        btn: btnModify,
        able: 'F'
    }, 'application/x-www-form-urlencoded');
});

function init() {
    isModify && twinkle($('.mod_heading'), 3);
    referral &&  referralAc();

    getData();
    getInputOrd();
}

function getData() {
    startDate = inStartDate.val();
    startTime = inStartTime.val();
    endDate = inEndDate.val();
    endTime = inEndTime.val();
    birth = inBirth.val();
    gender = inGender.val();
    nationCd = $('[name="nationCd"]:checked').val();

    possibleEndDateMax = setDate(startDate || possibleStartDate, [3, 0]);
}

function chkPrevVal(idx) {
    var result = true;

    for (var i = 0; i <= idx; i++) {
        var el = $(requiredArr[i]);
        var label = labelArr[i];
        var value = el.val();

        if (!value) {
            miCommonPop.alert(label + '을 먼저 선택해주세요');

            result = false;
            return false;
        }
    }

    return result;
}

function setDate(date, period) {
    var newDate = new Date(date);
    var mm = newDate.getMonth();
    var dd = newDate.getDate();

    newDate.setMonth(mm + period[0], dd + period[1]);

    return newDate.toISOString().split('T')[0];
}

function makeTime(type) {
    getData();

    var start, end, targetSelect, typeText;

    switch (type) {
        case 'start':
            start = startDate === possibleStartDate ? Number(possibleStartTime) : 0;
            end = 23;
            targetSelect = inStartTime;
            typeText = '출발';

            break;
        case 'end':
            start = startDate === endDate ? Number(startTime) + 1 : 0;
            end = endDate === possibleEndDateMax ? Number(startTime) : 23;
            targetSelect = inEndTime;
            typeText = '도착';

            break;
    }

    targetSelect.empty();
    targetSelect.append('<option value="" selected disabled hidden>자택 ' + typeText + '시간</option>');

    for (var i = start; i <= end; i++) {
        var className = '';
        var text = '낮 12시';

        if (i === 12) {
            className = ' class="c__red"';
        } else if (i < 12) {
            className = ' class="c__point"';
            text = '오전 ' + i + '시';
        } else {
            text = '오후 ' + (i - 12) + '시';
        }

        targetSelect.append('<option value="' + i + '"' + className + '>' + text + '</option>');
    }
}

function showStartDatepicker() {
    getData();

    datepickerOption.defaultDate = startDate;
    datepickerOption.minDate = possibleStartDate;
    datepickerOption.maxDate = setDate(possibleStartDate, [0, 90]);
    datepickerOption.onSelect = function (res) {
        inStartDate.val(res);
        startDate === res || inStartDate.change();

        inStartTime.closest('.input_box').removeClass('not_yet');
        miCommonPop.close('popDatepicker');

        possibleEndDateMax = setDate(res, [3, 0]);
    };

    elDatepicker.datepicker('destroy');
    elDatepicker.datepicker(datepickerOption);

    miCommonPop.setting({
        dTarget: 'popDatepicker',
        dOpenAc: function () {
            elDatePickerTitle.text('출발일');
        }
    });
}

function showEndDatepicker() {
    if (!chkPrevVal(1)) return false;

    getData();

    var minDate = startTime === '23' ? setDate(startDate, [0, 1]) : startDate;

    datepickerOption.defaultDate = endDate;
    datepickerOption.minDate = minDate;
    datepickerOption.maxDate = possibleEndDateMax;
    datepickerOption.onSelect = function (res) {
        inEndDate.val(res);
        endDate === res || inEndDate.change();

        inEndTime.closest('.input_box').removeClass('not_yet');
        miCommonPop.close('popDatepicker');
    };

    elDatepicker.datepicker('destroy');
    elDatepicker.datepicker(datepickerOption);

    miCommonPop.setting({
        dTarget: 'popDatepicker',
        dOpenAc: function () {
            elDatePickerTitle.text('귀국일');
        }
    });
}

function estimate() {
    getInputOrd();
    getData();

    validateRequired() && validateIdNum(inBirth) && fnSendPostAjax('/api/simple-quote/estimate', {
        travelSeq: travelSeq,
        startDate: startDate,
        startTime: startTime,
        endDate: endDate,
        endTime: endTime,
        birth: birth,
        gender: gender,
        nationCd: nationCd,
        covidEndedYn: 'Y'
    }, {
        s: function (res) {
            var data = res.data;
            //$('.plan select').find('option:first').prop('selected', true);
            $('.plan option').prop({ 'disabled': false, 'hidden': false });
            $('.plan option[data-default=Y]').prop('selected', true);

            $.each(data, function (k, v) {
                switch (k) {
                    case 'ageKor':
                        if (v === 14 && data.ageInsu === 15) $('#ageKor').text('(만' + v + '세)').removeClass('el_hidden');
                        else $('#ageKor').text('').addClass('el_hidden');
                        break;
                    case 'gender':
                        $('#gender').text(v === 'M' ? '남자' : '여자');
                        break;
                    case 'dz03Min':
                        var planBInput = $('.plan_B .DZ03 .input_box, .plan_B .AC03 .input_box');
                        var planBPrice = $('.plan_B .DZ03 .price, .plan_B .AC03 .price');
                        var planBLastSelect = $('.plan_B .AC03');

                        if (v) {
                            var minV = v / 10000;

                            $('.plan_A .DZ03 option').each(cutOpt);
                            $('.plan_A .AC03 option').each(cutOpt);

                            function cutOpt(i, el) {
                                var optV = Number($(el).text().replace(/\D/g, ''));

                                if (optV < minV) {
                                    $(el).prop({ 'disabled': true, 'hidden': true });
                                } else if (optV === minV) {
                                    $(el).prop('selected', true);
                                    return false;
                                }
                            }

                            planBInput.addClass('el_hidden');

                            if (data.planCurrency === 'USD')  planBPrice.text('US ' + miUtil.numToKo(v) + '달러').removeClass('el_hidden');
                            else planBPrice.text(miUtil.numToKo(v) + '원').removeClass('el_hidden');

                            if (res.data.insuCompany !== 'carrot') planBLastSelect.next('li').removeClass('mt_12').closest('ul').removeClass('mt_10');

                            $('.DZ03').closest('li').addClass('c__red');
                            elNationNm.addClass('c__point');
                        } else {
                            $('.plan_A .DZ03 option').each(function (i, el) {
                                $(el).prop({'disabled': false, 'hidden': false });
                            });

                            planBInput.removeClass('el_hidden');
                            planBPrice.addClass('el_hidden');

                            if (res.data.insuCompany !== 'carrot') planBLastSelect.next('li').addClass('mt_12').closest('ul').addClass('mt_10');

                            $('.DZ03').closest('li').removeClass('c__red');
                            elNationNm.removeClass('c__point');
                        }

                        break;
                    case 'under15Yn':
                        if (v === 'Y') {
                            elUnder15.removeClass('el_hidden');
                            elOver15.addClass('el_hidden');
                        } else {
                            elUnder15.addClass('el_hidden');
                            elOver15.removeClass('el_hidden');
                        }
                        break;
                    case 'ac04Yn':
                        if (v === 'Y') {
                            elActMedExp.removeClass('off');
                            $('[name="domMedExpChgY"][value="Y"]').prop('checked', true);
                        } else {
                            elActMedExp.addClass('off');
                            $('[name="domMedExpChgY"][value="N"]').prop('checked', true);
                        }
                        break;
                    case 'planList':

                        $.each(v, function (i2, v2) {
                            var targetTab = $('[name="planTypeCd"][value="' + v2.planTypeCd + '"]').closest('.mi_check');
                            var targetPlan = $('.plan_' + v2.planTypeCd);

                            // 든든플랜 default
                            if (v2.planTypeCd === 'A') {
                                targetTab.addClass('checked').find('input').prop('checked', true).data('seq', v2.estimateSeq);
                                targetPlan.removeClass('el_hidden');
                                $('#planTypeASeq').val(v2.estimateSeq);
                            } else {
                                targetTab.removeClass('checked').find('input').prop('checked', false).data('seq', v2.estimateSeq);
                                targetPlan.addClass('el_hidden');
                                $('#planTypeBSeq').val(v2.estimateSeq);
                            }
                            targetTab.find('.premium em').text(miUtil.numComma(v2.totalPremium));
                        });
                        break;
                    default:
                        $('#' + k).text(v);
                }
            });

            elEstimate.removeClass('el_hidden');
            scrollAnimation();
            convertReset();
        },
        f: function (res) {
            var copy, cb;

            switch (res.code) {
                case 'ERR_PLAN_0007':
                    cb = function () {
                        inStartTime.val('').change();
                        $('html, body').animate({ scrollTop: 0 }, 600);
                    };
                    break;
                case 'ERR_APPLY_8888':
                    location.reload();
                    break;
                default:
                    copy = res.display;
            }

            if (!!copy || !!cb) {
                miCommonPop.alert({
                    dCopy: copy || res.display,
                    dFirstAc: function () {
                        !!cb && cb();
                    }
                });
            }
        }
    }, {
        btn: btnEstimate,
        able: 'F'
    });
}

function modifyPlan(_this) {
    var param = {
        travelSeq: travelSeq,
        estimateSeq: $('[name="planTypeCd"]:checked').data('seq')
    };


    if (_this.data('name') === 'ac03' || _this.data('name') === 'dz03') {
        param['ac03'] = _this.val();
        param['dz03'] = _this.val();
    } else {
        param[_this.data('name')] = _this.val() || 'Y';
    }

    showMiLoader();
    fnSendPostAjax('/api/simple-quote/modify-plan', param, {
        s: function (res) {
            var data = res.data;

            $.each(data.planList, function (i, v) {
                var inPlanType = $('[name="planTypeCd"][value="' + v.planTypeCd + '"]');
                var el = inPlanType.siblings('.text').find('em');
                var start = Number(el.text().replace(/,/g, ''));
                var end = v.totalPremium;

                inPlanType.data('seq', v.estimateSeq);
                start === end || flipNum(start, end, el);
            });

            inChanger.each(function (i, el) {
                var _el = $(el);
                var name = _el.data('name');
                var planIdx = _el.closest('[class^="plan_"]').index();

                if (name === 'domMedExpChgY') {
                    _el.find('[value="' + data.ac04Yn + '"]').prop('checked', true);

                    if (data.ac04Yn === 'N') elActMedExp.addClass('off');
                    else elActMedExp.removeClass('off');
                } else {
                    _el.val(data.planList[planIdx].coverage[name.toUpperCase()]);
                }
            });
        },
        c: function () {
            hideMiLoader();
        }
    });
}

function referralAc() {
    if (planTypeCd) return false;

    var refList = ['triple_d', 'lottedfs'];
    var refIdx = refList.indexOf(referral) + 1;

    if (refIdx) {
        var dCopy;

        if (refIdx === 1) dCopy = '[트리플 특별혜택]\n';
        else if (refIdx === 2) dCopy = '[롯데인터넷면세점 특별혜택]\n';

        miCommonPop.alert(dCopy + '고객님은 <span class="c__point">보험료 10%</span> 할인대상입니다');
    }
}

// 보험료 확인 스크롤애니메이션
function scrollAnimation() {
    var top = elEstimate.offset().top - 122; // max(pc: gnb 100, mw: title + tab 106) + 버퍼 16
    if (isApp) top = top + 64; // title 64 빼주기

    $('.plan_tab .shadow_down').removeClass('shadow_down');
    $('html, body').animate({ scrollTop: top }, 600);
}

function flipNum(start, end, el) {
    $({ val: start }).animate({ val: end }, {
        duration: 500,
        step: function () {
            var num = miUtil.numComma(Math.floor(this.val));
            $(el).text(num);
        },
        complete: function () {
            var num = miUtil.numComma(Math.floor(this.val));
            $(el).text(num);
        }
    });
}

$(window).on('scroll', function () {
    if (!elPlanWrap.length) return false;

    var target = $('.plan_tab .checked');
    var docTop = $(document).scrollTop() + 100;
    var elTop = elPlanWrap.offset().top;

    if (isApp) docTop -= 64;

    if (docTop > elTop) target.addClass('shadow_down');
    else target.removeClass('shadow_down');
});

function modifyKrEn (type) {
    convertFlag = type === 'kr'
    var el = $('.plan_' + $('.plan_tab input:checked').val()).find('.el_convert');

    $.each(el, function(i,v){
        var isSelect = $(v).is('select');
        var el = isSelect ?  $(v).find('option:selected') : $(v);
        var val = convertFlag ? miUtil.numComma(el.data(type)) + '원': el.data(type);

        if (isSelect && convertFlag) {
            $(v).siblings('.price_box').removeClass('el_hidden').html(val);
        } else if (isSelect){
            $(v).siblings('.price_box').addClass('el_hidden');
        } else {
            el.text(val);
        }
    })
}

function convertReset (){
    if (countFn) clearTimeout(countFn);
    modifyKrEn('en');
}
