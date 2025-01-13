
var caSeq = $('[name=caSeq]').val();
var goNext = $('#goNext');
var ipSelect = $('.drop_select');
var dropConts = $('.drop_down_conts');
var medicalEl = $('.add_medical');
var isBeforeClaim = $('[name=beforeClaimInfo]').val() === 'true';

init();

$(document).on('click','.drop_select .close', function(e){
    e.stopPropagation();
    e.preventDefault();

    var name = $(this).parents('.checked_item').data('name')

    $('input[name=claimType][value='+name+']').prop('checked',false);
    $(this).parents('.checked_item').remove();

    if ($('[name=claimType][value=medical]').prop('checked')) medicalEl.removeClass('el_hidden');
    else  medicalEl.addClass('el_hidden');

    toggleDefault();
    setPosition();
    ableNext();
});

ipSelect.on('click', function(e){
    if (!$(e.target).hasClass('close')) {
        if (!$(this).hasClass('active')) {
            $(this).addClass('active');
            dropConts.slideDown(200);
        } else {
            ipSelect.removeClass('active');
            dropConts.stop().slideUp(200);
        }
    }
});

$('#goPrev').on('click', function(){
    history.back();
})

$(document).on('click', function(e){
    var tg = $(e.target);
    var a = !!tg.parents('.drop_select').length || tg.hasClass('drop_select');
    var b = !!tg.parents('.drop_down_conts').length || tg.hasClass('drop_down_conts');
    var c = tg.hasClass('close');

    if (!a && !b && !c) {
        ipSelect.removeClass('active');
        dropConts.stop().slideUp(200);
    }
})

$('.drop_down_conts input[type=checkbox]').on('change', function(e){
    var wrap = $(this).parents('.drop_select_wrap');
    if ($(this).prop('checked')) {
        var checkedItem = $('<span class="checked_item" data-name="'+$(this).val()+'">'+$(this).siblings('.text').text()+'<button class="close"></button></span>');
        ipSelect.append(checkedItem);
    } else ipSelect.find('[data-name = '+$(this).val()+']').remove();

    if ($('[name=claimType][value=medical]').prop('checked')) medicalEl.removeClass('el_hidden');
    else  medicalEl.addClass('el_hidden');

    ableNext();
    toggleDefault();
    setPosition();
})

goNext.on('click', function(){
    checkChangeType()
    && popBeforeSave()
})

$('#popClaimPaper .cs_scroll').scroll(function(){
    if ($(this).scrollTop() > 0) $('#popClaimPaper .pop_bottom').addClass('shadow_up')
    else $('#popClaimPaper .pop_bottom').removeClass('shadow_up')
})

$('[type=checkbox],[type=radio]').on('change', function(){
    ableNext()
});

function checkChangeType(){
    var changeFlag = false;

    $('[name="claimType"]').each(function(i,v){
        if ($(v).prop('checked') && $(v).data('asis') === 'N') changeFlag = true;
        if (!$(v).prop('checked') && $(v).data('asis') === 'Y') changeFlag = true;
    });

    if (changeFlag) {
        miCommonPop.setting({
            dType : 'confirm',
            dCopy: '보상유형 변경시 <strong class="c__red">작성했던 내용이 삭제</strong>됩니다 <br>그래도 변경하시겠습니까?',
            dCopyAlign : 't__center',
            dFirstAc : function(){
                $('[name="claimType"][data-asis = Y]').prop('checked',true);
                $('[name="claimType"][data-asis = N]').prop('checked',false);

                if ($('[name=claimType][value=medical]').prop('checked')) medicalEl.removeClass('el_hidden');
                else  medicalEl.addClass('el_hidden');

                setCheckedItem();
                ableNext();
            },
            dLastAc : function(){
                popBeforeSave()
            }
        })
    }
    return !changeFlag;
}

function popBeforeSave(){
    var pop =  $('#popClaimPaper');

    if (isBeforeClaim && $('[name=claimType][value=medical]').prop('checked')) {
        goSaveData('/claim/addition');
    } else {
        pop.find('.optional').hide();

        $('.checked_item').each(function(i,v){
            var selectedAcc = $(v).data('name');
            pop.find('.optional[data-type='+selectedAcc+']').show();
        })

        miCommonPop.setting({
            dTarget : 'popClaimPaper',
            dOpenAc : function(){
                pop.find('.cs_scroll').scrollTop(0);
            },
            dCloseAc : function(){
                pop.find('[name=talkRequiredFile]').prop('checked',false)
            },
            dFirstAc : function(){
                goSaveData('/claim/insured-info')
            }
        })
    }
}
function init (){
    setCheckedItem();
    ableNext();
    setPosition($('.drop_select_wrap'));
}
function ableNext(){
    getInputOrd()
    var flag = validateRequired(true) && $('[name=agreement]').prop('checked') && $('.checked_item').length;
    goNext.prop('disabled', !flag);
}

function setCheckedItem (){

    ipSelect.find('.checked_item').remove();
    $('[name=claimType]:checked').each(function(i,v){
        var el = $(v);
        var checkedItem = $('<span class="checked_item" data-name="'+el.val()+'">'+el.siblings('.text').text()+'<button class="close"></button></span>');
        ipSelect.append(checkedItem);
    })
    toggleDefault()

}
function toggleDefault(){
    if (!ipSelect.find('.checked_item').length) ipSelect.find('.default').removeClass('el_hidden');
    else ipSelect.find('.default').addClass('el_hidden');
}

function setPosition(){
    dropConts.css({top: (ipSelect.outerHeight() + 4) + 'px'})
}

function goSaveData (url){
    var param = {
        caSeq : caSeq,
        accidentList : []
    };

    if ($('[name=medicalBenefit]:checked:visible').length) param.medicalBenefit =  $('[name=medicalBenefit]:checked').val()

    $('.checked_item').each(function(i,v){
        param.accidentList.push($(v).data('name'));
    });

    if ($('#popClaimPaper [name=talkRequiredFile]').prop('checked')) {
        fnSendPostAjax('/api/claim/document', param , {
            s: function(){
                saveClaimData(param,url)
            }
        });
    } else {
        saveClaimData(param,url)
    }
}
