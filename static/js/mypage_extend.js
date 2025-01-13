var elList = $('.mi_table tbody'),
    goNext = $('#goNext'),
    btnSelectDate = $('#btnSelectDate'),
    elDatepicker = $('#datepicker'),
    selectTime = $('#selectTime'),
    chgPeriod = $('#chgPeriod'),
    checkedArr,
    elAfterPremium = $('.after_premium'),
    payNo = $('#payNo'),
    payYes = $('#payYes'),
    elBottom = $('.bottom_wrap'),
    payType = $('.pay_type_wrap'),
    payConfirm = $('.confirm_wrap'),
    elAccountInfo = $('.account_info_wrap'),
    payWrap = $('.pay_wrap'),
    payCancel = $('#payCancel'),
    btnCopyAcc = $('#btnCopyAcc'),
    saveInfoCmt = $('.save_info'),
    allCheck = $('#allCheck'),
    insuStartDate = $('[name=startDate]').val(),
    insuStartTime = $('[name=startTime]').val(),
    extendMaxDate = setDate(insuStartDate, [3, 0]),
    datepickerOption = {
        prevText: '',
        nextText: '',
        monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
        dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
        showMonthAfterYear: true,
        yearSuffix: '년',
        dateFormat: 'yy-mm-dd'
    },
    tableTitle = $('.table_title'),
    payFlag = false;

travelSeq = $('[name="seq"]').val();

activeNext();
activeSelect();

allCheck.on('change', function () {
    var isChecked = $(this).prop('checked');
    elList.find('[name="checkbox"]').prop('checked', isChecked);
    activeSelect();
});
payNo.on('click', function () {
    location.reload();
});

elList.on('change', '.mi_check', function () {
    var isChecked = elList.find('[name="checkbox"]').length === elList.find('[name="checkbox"]:checked').length;

    if (isChecked) allCheck.prop('checked', true);
    else allCheck.prop('checked', false);

    activeSelect();
});

payYes.on('click', function(){
    if (payFlag) {
        payConfirm.addClass('el_hidden');
        payType.removeClass('el_hidden');
        payWrap.removeClass('el_hidden');

    } else extendConfirm()
});

goNext.on('click', checkDuplicate);
chgPeriod.on('click', chgPeriodFromPop);
payCancel.on('click', cancel);

btnSelectDate.on('click', function () {
    var standEl = elList.find(':checked:first').parents('tr');
    var stand = {
        standTime: standEl.data('possible-time'),
        standDate: standEl.data('possible-date'),
        startDate: standEl.data('start-date'),
        startTime: standEl.data('start-time'),
    }

    var startTime = (stand.standDate === stand.startDate || !stand.startDate) && stand.standTime !== 23 ? stand.standTime + 1 : 0;
    var endTime = stand.standDate === extendMaxDate || stand.startDate === extendMaxDate ? insuStartTime : 23;

    checkPossible(stand)
    && setDatePicker(stand)
    && setTimeSelect({start: startTime, end: endTime})
    && miCommonPop.setting({
        dTarget: 'popExtendDatepicker',
        dOpenAc: function () {
            selectTime.val(stand.startTime);
        }
    })
})

function extendConfirm() {
    fnSendPostAjax('/api/extend/confirm?travelSeq=' + travelSeq, {}, {
        s: function (res) {
            location.href = '/pay/ext/close/' + travelSeq;
        }
    })
}

function checkDuplicate() {
    var changedArr = elList.find('.extended');
    var arr = [];

    elList.find(':checked').prop('checked', false);
    allCheck.prop('checked', false);

    $.each(changedArr, function (i, v) {
        var obj = {};
        obj.travelerSeq = $(v).find('.seq').text();
        obj.endDate = $(v).data('start-date');
        obj.endTime = $(v).data('start-time');
        arr.push(obj);
    });
    showMiLoader()
    fnSendPostAjax('/api/extend/duplicate', {
        travelSeq: travelSeq,
        travelerList: arr
    }, {
        s: function (res) {
            hideMiLoader();
            getChgPeriodPay(arr);
        },
        f: function (res){
            hideMiLoader();
            miCommonPop.alert(res.display);
        }
    })
}

function getChgPeriodPay(arr) {
    fnSendPostAjax('/api/extend/quote', {
        travelSeq: travelSeq,
        travelerList: arr
    }, {
        s: function (res) {

            elAfterPremium.find('.total').text(miUtil.numComma(res.data));
            tableTitle.find('p').text('보험기간 연장 대상자');
            tableTitle.find('a').addClass('el_hidden');
            showExtendRowOnly();

            elBottom.addClass('el_hidden');
            elAfterPremium.removeClass('el_hidden');
            payConfirm.removeClass('el_hidden');

            if(res.data > 0) {
                saveInfoCmt.addClass('el_hidden');
                payFlag = true;
            } else {
                saveInfoCmt.removeClass('el_hidden');
                payFlag = false;
            }

        }
    })
}

function chgPeriodFromPop() {
    var value = selectTime.val();
    var txt = selectTime.find(':selected').text();
    var date = elDatepicker.datepicker({dateFormat: 'yyyy-mm-dd'}).val();
    var str = date + ' ' + txt
    if (!value) {
        miCommonPop.alert('연장일시를 선택해주세요');
    } else {
        miCommonPop.alert({
            dCopy: '연장일시가 선택되었습니다',
            dFirstAc: function () {
                miCommonPop.close('popExtendDatepicker');
                elList.find(':checked').prop('checked',false);
                allCheck.prop('checked',false);
                activeSelect();
                activeNext();
            }
        });

        $.each(checkedArr, function (i, v) {
            var tr = $(v).parents('tr');
            tr.find('td:last').text(str);
            tr.data('start-date', date);
            tr.data('start-time', value);
            tr.addClass('extended');
        })
    }
}

function checkPossible(stand) {
    checkedArr = elList.find(':checked');
    flag = true;

    $.each(checkedArr, function (i, v) {
        var dataTr = $(v).parents('tr');
        var stD = stand.startDate ? stand.startDate : stand.standDate;
        var stT = stand.startTime ? stand.startTime : stand.standTime;
        var cpT = dataTr.data('start-time') ? dataTr.data('start-time') : dataTr.data('possible-time');
        var cpD = dataTr.data('start-date') ? dataTr.data('start-date') : dataTr.data('possible-date');

        if (cpT !== stT || cpD !== stD) {
            flag = false;
            return false;
        }
    })

    if (!flag) {
        miCommonPop.alert('선택하신 가입자의<br>보험 만료일시가 동일해야합니다');
        return false;
    }

    return true;
}

function setTimeSelect(obj) {
    selectTime.find('option').not(':eq(0)').prop({hidden:false, disabled:false});
    if (obj) {
        var start = Number(obj.start);
        var end = Number(obj.end);
        selectTime.find('option').not(':eq(0)').prop({hidden:true, disabled:true});
        for (var i = start; i <= end; i++) {
            selectTime.find('[value=' + i + ']').prop({hidden:false, disabled:false});
        }
    }
    return true;
}

function setDate(date, period) {
    var newDate = new Date(date);
    var mm = newDate.getMonth();
    var dd = newDate.getDate();
    newDate.setMonth(mm + period[0], dd + period[1]);
    return newDate.toISOString().split('T')[0];
}

function setDatePicker(stand) {
    var possibleStartDate = stand.standTime === 23 ? setDate(stand.standDate, [0, 1]) : stand.standDate;
    var startDate = stand.startDate ? stand.startDate : stand.standDate;


    datepickerOption.defaultDate = startDate;
    datepickerOption.minDate = possibleStartDate;
    datepickerOption.maxDate = setDate(insuStartDate, [3, 0]);

    datepickerOption.onSelect = function (res) {
        selectTime.val('');
        if (res === possibleStartDate) setTimeSelect({start: stand.standTime === 23 ? 0 : stand.standTime , end: 23});
        else if (res === extendMaxDate) setTimeSelect({start: 0, end: insuStartTime});
        else setTimeSelect();
    };

    elDatepicker.datepicker('destroy');
    elDatepicker.datepicker(datepickerOption);
    return true;
}

function cancel() {
    miCommonPop.alert({
        dType: 'confirm',
        dCopy: '신청내역을 취소하시겠습니까?',
        dButtonSetText: ['예', '아니요'],
        dFirstAc: function () {
            resetExtendApply(function () {
                miCommonPop.alert({
                    dCopy: '신청내역이 취소되었습니다',
                    dFirstAc: function () {
                        location.href = '/mypage/detail/' + travelSeq;
                    }
                })
            })
        }
    })
}

function resetExtendApply(cb) {
    fnSendPostAjax('/api/extend/reset', {travelSeq: travelSeq}, {
        s: function () {
            if (!!cb) cb();
        },
        f: function (res) {
            var url;
            switch (res.code) {
                case 'ERR_EXT_0006':
                    url = '/pay/ext/close/' + travelSeq;
                    break;
                case 'ERR_EXT_0007' :
                    url = '/mypage/detail/' + travelSeq;
                    break;
            }

            if (!url) {
                miCommonPop.alert(res.display);
            } else {
                miCommonPop.alert({
                    dCopy: res.display,
                    dFirstAc: function () {
                        location.href = url;
                    }
                });
            }
        }
    });
}

function activeSelect() {
    if (elList.find(':checked').length > 0) btnSelectDate.removeClass('el_hidden');
    else btnSelectDate.addClass('el_hidden');
}

function activeNext() {
    var activeFlag = elList.find('.extended').length;
    var str = activeFlag ? '변경된 연장일시' : '보험 만료일시';

    goNext.prop('disabled', !activeFlag);
    $('.date_title').text(str);

    if (activeFlag) $('.btn_reset').show();
    else $('.btn_reset').hide();
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

        elAccountInfo.removeClass('el_hidden');
        btnCopyAcc.attr('data-clipboard-text', data.account);

        $('.mi_check.card').addClass('disabled');
        inPayType.prop('disabled', true);
        inVBankList.closest('.input_group').remove();
        elAccountInfo.removeClass('el_hidden');
        payWrap.find('.btn_cancel').removeClass('el_hidden');

        $('html, body').animate({
            scrollTop: elAccountInfo.offset().top
        }, 1000);
    })
}

function showExtendRowOnly (){
    elList.find('input[type=checkbox]').prop({disabled:true,checked:false});
    allCheck.prop({disabled:true,checked:false});
    $('.mi_table tbody tr').each(function(i,v){
        var el = $(v);
        if (!el.hasClass('extended')) el.remove();
    });
}
