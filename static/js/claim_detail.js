
var caSeq = $('[name=caSeq]').val();
var goNext = $('#goNext');
var tempSave = $('#tempSave');
var startDate = $('[name=startDate]').val();
var endDate = $('[name=endDate]').val();
var startTime = $('[name=startTime]').val();
var endTime = $('[name=endTime]').val();
var maxAccLength = Number($('[name=totalSize]')) || 7;
var maxItemLength = Number($('[name=itemSize]')) || 3;
var datepickerOption = {
    prevText: '',
    nextText: '',
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
    showMonthAfterYear: true,
    yearSuffix: '년',
    dateFormat: 'yy-mm-dd',
    minDate : startDate,
};

selectStandTime();
ableAdd();


$(document).on('click','.mi_input.datepicker', function(){
    setDatepicker($(this));
}).on('click','.btn_delete_acc', function(){
    var _this = $(this);
    miCommonPop.setting({
        dType : 'confirm',
        dCopy : '정말로 삭제하시겠습니까?',
        dCopyAlign : 't__center',
        dLastAc : function(){
            var itemList = _this.parents('.item_list');
            _this.parents('.acc_item').remove();
            reNumber(itemList);
            ableAdd();
        }
    })


}).on('keyup', '.mi_input, .mi_textarea', function(e){
    cleanInput(e, ['EMOJI'],false);
}).on('click','.btn_add_item', function(){
    var group = $(this).parents('.data_group');
    var el = group.find('.data_item:first-child').clone();

    el.find('.direct_input').addClass('el_hidden').find('.data_group_input').val('');
    el.find('.mi_input.select').val('').removeClass('direct');

    group.children('.lost_item_list').append(el);
    maxMinItem(group);

}).on('click','.btn_delete_item', function(){
    var group = $(this).parents('.data_group');
    $(this).parents('.data_item').remove();
    maxMinItem(group);
}).on('change','.data_item .data_group_input.select', function(){
    if ($(this).val() === 'other')  $(this).addClass('direct').siblings('.direct_input').removeClass('el_hidden').find('input').focus()
    else $(this).removeClass('direct').siblings('.direct_input').addClass('el_hidden').val('');
})

$('.btn_add').on('click', function(){
    var itemList = $(this).parents('.accident_type').children('.item_list');
    var cloneItem = cleanEl(itemList.find('.acc_item:first-child').clone());

    cloneItem.find('.part_title .acc_num').addClass('el_hidden');

    itemList.append(cloneItem);
    reNumber(itemList);
    ableAdd()
});
function ableAdd (){
    if ($('.acc_item').length >= maxAccLength )  {
        $('.btn_add').addClass('el_hidden');
        return false;
    } else  $('.btn_add').removeClass('el_hidden');

    $('.item_list').each(function(i,v){
        if ($(v).find('.acc_item').length >= maxItemLength) $(v).siblings('.add_wrap').find('.btn_add').addClass('el_hidden')
        else $(v).siblings('.add_wrap').find('.btn_add').removeClass('el_hidden')
    })
}

function selectStandTime (){
    var endDateCompare = new Date(endDate + 'T' + ('0'+(Number(endTime) + 1)).slice(-2) + ':00:00');
    var today = new Date();

    if (endDateCompare > today) {
        endDate = today.getFullYear() + '-';
        endDate += ('0' + (today.getMonth()+1)).slice(-2) + '-'
        endDate += ('0' + today.getDate()).slice(-2);
        endTime = today.getHours();
    }

    datepickerOption.maxDate = endDate
}

function maxMinItem (group){
    max = 10;
    var maxFlag = group.find('.data_item').length >= max;
    var minFlag = group.find('.data_item').length > 1;

    group.find('.btn_add_item').prop('disabled', maxFlag);
    group.find('.btn_delete_item').prop('disabled', !minFlag);
}

goNext.on('click',function(){
    getInputOrd();
    validateRequired(true, true)
    && goSaveData();

    $('html, body').scrollTop($('.error').eq(0).offset().top - 200)
});

$(document).on('focus', '.mi_input , .mi_textarea',function(){
    $(this).removeClass('error');
});

tempSave.on('click', function(){
    var param = paramFactory();
    saveClaimTempData(param);
})

function cleanEl(el) {
    el.find('.mi_input.select').find('option').not(':eq(0)').prop({hidden:false, disabled:false});
    el.find('.mi_input.select').find('option:eq(0)').prop({hidden:true, disabled:true});

    el.find('.mi_input, .mi_textarea').each(function(i,v){
        $(v).val($(v).data('default'));
    });

    el.find('.data_item').not(':eq(0)').remove();
    el.find('.direct_input').addClass('el_hidden');
    el.find('.data_group_input ').removeClass('direct');
    el.find('.btn_delete_item').prop('disabled',true);
    el.find('.error').removeClass('error');

    return el
}

function reNumber(list){
    list.find('.acc_item').each(function(i,v){
        var num = (i+1);
        if ( list.find('.acc_item').length === 1 && i === 0 ) {
            $(v).find('.num').text('').addClass('el_hidden');
            $(v).find('.btn_delete_acc').addClass('el_hidden');
        } else {
            $(v).find('.num').text(num).removeClass('el_hidden');
            $(v).find('.btn_delete_acc').removeClass('el_hidden');
        }
        if (i === 0) {
            $(v).find('.part_title .acc_num').removeClass('el_hidden')
        }
    })
}

function goSaveData(){
    var param = paramFactory();
    saveClaimData(param,'/claim/upload-doc');
}

function setDatepicker(ip){
    var elDatepicker = $('#datepicker');
    var timeSelect = ip.siblings('.time_select');

    datepickerOption.onSelect = function (res) {
        timeSelect.val('');
        if (res === startDate && res === endDate) setTimeSelect({start: startTime, end: endTime} ,timeSelect);
        else if (res === startDate) setTimeSelect({start: startTime, end: 23} ,timeSelect);
        else if (res === endDate) setTimeSelect({start: 0, end: endTime},timeSelect);
        else setTimeSelect(null,timeSelect);

        ip.val(res);
        miCommonPop.close('popDatepicker')
    };

    datepickerOption.defaultDate = ip.val();
    elDatepicker.datepicker('destroy');
    elDatepicker.datepicker(datepickerOption);

    miCommonPop.setting({
        dTarget : 'popDatepicker'
    })
}
function setTimeSelect(obj,select) {
    select.find('option').not(':eq(0)').prop({hidden:false, disabled:false});

    if (obj) {
        var start = Number(obj.start);
        var end = Number(obj.end);
        select.find('option').not(':eq(0)').prop({hidden:true, disabled:true});
        for (var i = start; i <= end; i++) {
            select.find('[value=' + i + ']').prop({hidden:false, disabled:false});
        }
    }

    return true;
}

// 임시저장을 위한 param 셋팅
function paramFactory (){
    var obj = {
        caSeq : caSeq
    };

    obj.accidentDetail = [];

    $('.acc_item').each(function(i,v){
        var wrap = $(v);
        var accObj = {
            accident : wrap.data('accident-type')
        };

        wrap.find('.data_input').each(function(i,v){
            var el = $(v)
            accObj[el.attr('name')] = el.val()
        });

        wrap.find('.data_group').each(function(i,v){
            var group= $(v)
            accObj[group.data('name')] = [];
            $(v).find('.data_item').each(function(ii,vv){
                var item = {};
                var itemWrap = $(vv);
                item['itemCd'] = itemWrap.find('[name=itemCd]').val();
                item['item'] = itemWrap.find('[name=item]').val();
                accObj[group.data('name')].push(item);
            })
        });

        obj.accidentDetail.push(accObj);
    })

    return obj;
}
