
var goNext = $('#goNext');
var tempSave = $('#tempSave');
var caSeq = $('[name=caSeq]').val();
var pop = $('#popClaimPaper')

function ableNext(){
    getInputOrd()
    var flag = validateRequired(true);
    goNext.prop('disabled', !flag);
}

tempSave.on('click', function(){
    var param = paramFactory();
    saveClaimTempData(param);
})

goNext.on('click', function(){
    pop.find('.optional').hide();
    var arr = JSON.parse($('[name=accidentCodeList]').val())

    $.each(arr,function(i,v){
        pop.find('.optional[data-type='+v+']').show();
    })

    miCommonPop.setting({
        dTarget : 'popClaimPaper',
        dOpenAc : function(){
            pop.find('.cs_scroll').scrollTop(0);
        },
        dCloseAc : function(){
            pop.find('[name=talkRequiredFile]').prop('checked',false);
        },
        dFirstAc : function(){
            goSaveData('/claim/insured-info')
        }
    })
})

$('#popClaimPaper .cs_scroll').scroll(function(){
    if ($(this).scrollTop() > 0) $('#popClaimPaper .pop_bottom').addClass('shadow_up')
    else $('#popClaimPaper .pop_bottom').removeClass('shadow_up')
})


$('[name=isNewClaim]').on('change', function(){
    if ($('[name=isNewClaim]:checked').val() === 'N') {
        $('.add_accident').removeClass('el_hidden');
        $('.noti_box').addClass('el_hidden');
        $('.mi_check').addClass('tooltip_hide')
    } else {
        $('.add_accident input:checked').prop('checked', false);
        $('.add_accident').addClass('el_hidden');
        $('.noti_box').removeClass('el_hidden');
        $('.mi_check').removeClass('tooltip_hide');
    }
    ableNext()
})

$('.mi_check').on('change', function (){
    ableNext()
})

function goSaveData (){

    var param = paramFactory()

    if ($('#popClaimPaper [name=talkRequiredFile]').prop('checked')) {
        fnSendPostAjax('/api/claim/document', param , {
            s: function(){
                saveClaimData(param,'/claim/insured-info')
            }
        });
    } else {
        saveClaimData(param,'/claim/insured-info')
    }
}

function paramFactory(){
    var obj = {
        caSeq : caSeq
    };
    if ($('[name=isNewClaim]:checked').val() === 'N') obj.prevMedicalCiSeq =  $('[name=prevMedicalCiSeq]:checked').val();

    return obj
}
