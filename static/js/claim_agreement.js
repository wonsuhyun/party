
var caSeq = $('[name=caSeq]').val();
var tarPopResetBt = $('.btn_reset'); // 서명받기 팝업 리셋 버튼

// STR signature_pad-master
var wrapper = document.getElementById("signaturePad");
var canvas = wrapper.querySelector("canvas");
var goNext = $('#goNext');
// loader interval
var clearInterval1;
var clearInterval2;
var setTime1;
var setTime2;
var setTime3;

signPopOpenAc();
function signPopOpenAc(){
    var placeholder = $('[name=signName]').val().length > 4 ? $('[name=signName]').val().substring(0,4) :  $('[name=signName]').val();
    $('.img_placeholder').text(placeholder)
    canvas.setAttribute("width", $('#signaturePad').innerWidth());
    var signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255,0)',
        onBegin : function(){
            goNext.prop('disabled',false);
            tarPopResetBt.prop('disabled',false);
            $('.img_placeholder').hide();
        }
    });

    var elCanvas = document.getElementById("canvas1");

    tarPopResetBt.on('click',function(){
        signaturePad.clear();
        goNext.prop('disabled',true);
        tarPopResetBt.prop('disabled',true);
        $('.img_placeholder').show();
    });

    goNext.on('click',function(){
        var dataURL = signaturePad.toDataURL() // 이미지 src

        activeLoader()
        fnSendPostAjax('/api/claim/save',{caSeq :  caSeq,sign : dataURL},{
            s: function(){
                location.href = '/claim/submit';
            },
            c: function () {
                clearTimeout(setTime1);
                clearTimeout(setTime2);
                clearTimeout(setTime3);
                clearInterval(clearInterval1);
                clearInterval(clearInterval2);
                hideMiLoader();
            }
        },{
            btn: $(this),
            able : 'C'
        });
    });
}


function activeLoader (){
    showMiLoader();

    setTime1 = setTimeout(function(){
        showMiLoader('제출하신 서류를 <br>확인하고 있습니다');
    },5000);

    setTime2 =  setTimeout(function(){
        showMiLoader('고객님의 소중한 정보를 <br>안전하게 처리하고 있습니다');
    },20000)

    setTime3 =  setTimeout(function(){
        startInterval1();
    },40000)

    function startInterval1 (){
        var rollNum1 = 0;
        clearInterval1 = setInterval(function(){
            if (rollNum1%2 === 0) {
                showMiLoader('보험사에 접수를 <br>요청하는 중입니다');
            } else {
                showMiLoader('시간이 조금 <br>소요될 수 있습니다');
            }
            rollNum1++;
            if (rollNum1 === 6) {
                clearInterval(clearInterval1)
                startInterval2()
                return false;
            }
        },5000)
    }

    function startInterval2 (){
        var rollNum2 = 0;
        clearInterval2 = setInterval(function(){
            switch (rollNum2%5) {
                case 0 :
                    showMiLoader('보험사로부터 응답을<br> 기다리는 중입니다');
                    break;
                case 1 :
                    showMiLoader('접수 요청이 곧 완료됩니다');
                    break;
                case 2 :
                    showMiLoader('잠시만 기다려주세요');
                    break;
                case 3 :
                    showMiLoader('정상적으로 처리중입니다');
                    break;
                case 4 :
                    showMiLoader('잠시만 기다려주세요');
                    break;
            }
            rollNum2++
        },5000);
    }
}
