var inBankCd = $('[name="bankCd"]')
var inBankAcct = $('[name="bankAcct"]')
var inBankAcctHolder = $('[name="bankAcctHolder"]')

var btnChkAcc = $('#btnChkAcc')
var btnSend = $('#btnSend')

var bankCd, bankAcct, bankAcctHolder, bankNm

var refundBankSeq = $('[name="refundBankSeq"]').val()
var bankCheckYn = inBankAcctHolder.is(':visible') ? 'N' : ''
var isBtnChkLock = inBankAcctHolder.is(':visible')

inBankCd.add(inBankAcct).on('keyup change', function (e) {
    if (!isBtnChkLock) {
        btnChkAcc.prop('disabled', false)
        btnSend.prop('disabled', true)

        inBankAcctHolder.val('').prop('disabled', false).closest('.input_group').addClass('el_hidden')

        bankCheckYn = ''
        getInputOrd()
    }
});

inBankAcct.on('keyup', function(e){
    cleanInput(e,'NUM',true, function(){
        ableNext()
    })
    ableNext()
})

inBankCd.add(inBankAcctHolder).on('keyup change', ableNext)
btnChkAcc.on('click', chkAcc)
btnSend.on('click', sendAcc)

getInputOrd()

function getData() {
    bankCd = inBankCd.val()
    bankAcct = inBankAcct.val()
    bankAcctHolder = inBankAcctHolder.val()

    return true
}

function ableNext() {
    var a = bankCheckYn || isBtnChkLock
    var b = validateRequired(true)

    if (a && b) btnSend.prop('disabled', false)
    else btnSend.prop('disabled', true)
}

function chkAcc() {
    getData() && validateRequired() && fnSendPostAjax('/api/account/check', {
        bankCd: bankCd,
        bankAcct: bankAcct
    }, {
        b: function () {
            btnChkAcc.addClass('on')
            inBankCd.add(inBankAcct).prop('disabled', true)

            bankCheckYn = ''
        },
        s: function (res) {
            var data = res.data

            inBankAcctHolder.val(data.bankAcctHolder).closest('.input_group').removeClass('el_hidden')

            if (data.bankAcctHolder) {
                inBankAcctHolder.prop('disabled', true);
            } else {
                inBankAcctHolder.prop('disabled', false);
                isBtnChkLock = true
            }

            bankNm = data.bankNm
            bankCheckYn = data.bankCheckYn

            getInputOrd()
            ableNext()
        },
        c: function () {
            btnChkAcc.removeClass('on')
            inBankCd.add(inBankAcct).prop('disabled', false)
        }
    }, {
        btn: btnChkAcc,
        able: 'F'
    })
}

function sendAcc() {
    getData() && validateRequired() && fnSendPostAjax('/api/account/save', {
        refundBankSeq: refundBankSeq,
        bankNm: bankNm || inBankCd.find(':selected').text(),
        bankCd: bankCd,
        bankAcct: bankAcct,
        bankAcctHolder: bankAcctHolder,
        bankCheckYn: bankCheckYn
    }, {
        s: function () {
            miCommonPop.alert({
                dCopy: '환불계좌 등록이 완료되었습니다',
                dFirstAc: function () {
                    location.reload()
                }
            })
        }
    })
}
