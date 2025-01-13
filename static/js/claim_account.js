
var caSeq = $('[name=caSeq]').val();
var goNext = $('#goNext');
var tempSave = $('#tempSave');
var btnAccHolder = $('#btnAccHolder');
var acc = $('[name=bankAcct]');
var bank = $('[name=bankCd]');
var holder = $('[name=bankHolder]');
var insuredName= $('[name=insuredName]').val();
var holderAddInfo = $('.holder_add')

ableNext()
acc.on('keyup', function(e){
    cleanInput(e, 'NUM', true , function(){
        holder.val('');
        holderAddInfo.addClass('el_hidden').find('.mi_input').val('');
        ableCallAccount();
    })
    ableCallAccount();
});

tempSave.on('click', function(){
    var param = paramFactory();
    saveClaimTempData(param);
})

$('input[type=tel]').on('keyup', function(e){
    cleanInput(e, 'NUM', true , function(){
        ableNext();
    })
})

bank.on('change', function(){
    holder.val('');
    holderAddInfo.addClass('el_hidden').find('.mi_input').val('');
    ableCallAccount();
    ableNext();
})
btnAccHolder.on('click',function(){
    fnSendPostAjax('/api/claim/bank-acct', {bankCd : bank.val() , bankAcct : acc.val()}, {
        s: function(res){
            holder.val(res.data.bankAcctHolder);

            btnAccHolder.prop('disabled',true);

            if (res.data.bankAcctHolder !== insuredName) holderAddInfo.removeClass('el_hidden');
            else holderAddInfo.addClass('el_hidden').find('.mi_input').val('');

            ableNext()
        }
    })
})

goNext.on('click',function(){
    var pass = true;
    if (holderAddInfo.is(':visible')){
        pass = validateIdNum($('[name=birth]') ,$('[name=ssn]'))
    }

    pass
    && goSaveData()

})

function ableCallAccount (){
    if ( acc.val().trim().length > 0 && bank.val() )  btnAccHolder.prop('disabled',false)
    else btnAccHolder.prop('disabled',true);
}

function ableNext(){
    getInputOrd();
    goNext.prop('disabled',!validateRequired(true));
}

function goSaveData(){
    var param = paramFactory();
    saveClaimData(param,'/claim/accident-detail')
}

function paramFactory (){
    var obj = {
        caSeq : caSeq,
        bankCd : bank.val(),
        bankAcct : acc.val(),
        bankAcctHolder : holder.val()
    }

    if (holderAddInfo.is(':visible')) {
        obj.bankAcctBirth =  $('[name=birth]').val();
        obj.bankAcctSsn = $('[name=ssn]').val();
    }

    return obj;
}
