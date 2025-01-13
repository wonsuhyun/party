var caSeq = $('[name=caSeq]').val();
var ipFile = $('#fileElement');
var pop = $('#popFileUpload');
var goNext = $('#goNext');
var tempSave = $('#tempSave');
var imgArr = ['jpeg','jpg','png'];
ableNext();
$('.mi_check input[type=checkbox]').on('change', function(){
    var fileBox =  $(this).parents('.mi_check').siblings('.file_list');
    var _this = $(this);
    if (_this.prop('checked')){
        fileBox.removeClass('el_hidden');
        ableNext()
    } else {
        if (fileBox.find('.done').length) {
            miCommonPop.setting({
                dCopy : '선택을 해제하시면<br>해당 항목의 업로드 내역이 삭제됩니다<br>그래도 진행하시겠습니까?',
                dType : 'confirm',
                dCopyAlign : 't__center',
                dFirstAc : function(){
                    _this.prop('checked',true);
                },
                dLastAc : function(){
                    deleteFile({cate :fileBox.data('cate'), cb : function (){
                            fileBox.find('.done').removeClass('done');
                            fileBox.addClass('el_hidden');
                            ableNext()
                        }});
                }
            })
        } else {
            fileBox.addClass('el_hidden');
            ableNext()
        }
    }
});

// dropArea.on('dragenter', function(e){
//     e.preventDefault();
//     e.stopPropagation();
// })
//
// dropArea.on('dragover', function(e){
//     e.preventDefault();
//     e.stopPropagation();
// })
//
// dropArea.on('drop', function(e){
//     e.preventDefault();
//     e.stopPropagation();
//
//     var file =   e.originalEvent.dataTransfer.files[0]
//
//     if (!validatedFile(file)) {
//         ipFile.val('');
//         return false;
//     }
//
//     uploadFile(file);
// })


goNext.on('click', function(){
    location.href = '/claim/agreement';
})

tempSave.on('click', function(){
    saveClaimTempData({caSeq : caSeq});
});
ipFile.on('change', function(e){
    var file =  e.target.files[0];
    var reSizeAble = ['jpg','jpeg','png']
    if (!validatedFile(file)) {
        ipFile.val('');
        return false;
    }

    if ( reSizeAble.indexOf(file.name.split('.').pop().toLowerCase()) > -1 ) resizingImg(file);
    else uploadFile(file);

})

$(document).on('click','#popFileUpload .btn_delete_img', function(){
    var file = $(this).parents('.file_item');
    deleteFile({
        seq : file.data('seq'),
        cb : function(){
            file.remove();
            fileLengthCheck()
            ableNext();
        }
    })
});

function deleteFile(obj){
    var param = {caSeq: caSeq, fileCate: obj.cate,fileSeq :obj.seq }
    fnSendPostAjax('/api/claim/file-delete', param,{
        s: function(){
            if (obj.cb) obj.cb();
        }
    })
}

function uploadFile(file) {
    var fileKey;
    var fileExt = file.name.split('.').pop().toLowerCase();

    getPreSignedURL();
    function getPreSignedURL (){
        fnSendPostAjax('/api/claim/pre-signed-url' ,{fileExt :fileExt}, {
            s: function(res){
                uploadS3(res.data.preSignedUrl, fileExt)
                fileKey = res.data.fileKey;
            },
            f: function(res){
                ipFile.val('');
                miCommonPop.alert(res.display);
            }
        })
    }

    function uploadS3 (url, fileExt){
        var ct = imgArr.indexOf(fileExt) > -1 ? 'image/' + fileExt : 'application/' + fileExt;

        $.ajax({
            type: "put",
            url: url,
            contentType: ct,
            processData: false,
            data: file,
            success: function (response) {
                console.log("success :", response);
                sendResult();
            },
            error: function (error) {
                console.error("error :", error);
                ipFile.val('');
            }
        });
    }

    function sendResult (){
        var param = {
            caSeq : caSeq ,
            fileType:  ipFile.data('file-type') ,
            fileKey : fileKey
        }

        fnSendPostAjax('/api/claim/file-upload-result', param , {
            s:function (res){
                appendDiv(file, fileExt, res.data.fileSeq);
                ipFile.val('');
                $('.btn_file_pop[data-type="' + ipFile.data('file-type') + '"]').parents('li').addClass('done');
                fileLengthCheck()
                ableNext();
            }
        })
    }

    function appendDiv (file, fileExt , seq){
        var wrap = $('#popFileUpload .img_area');
        var div = $('<div class="file_item" data-seq="'+seq+'"><div class="img_item"><div class="img_wrap"></div><button class="btn_delete_img" type="button"></button></div></div>');
        var idx = wrap.find('.file_item').length -1;
        var img = new Image();


        if (imgArr.indexOf(fileExt) > -1) {
            var reader = new FileReader();
            reader.onload = function(){
                img.src = reader.result;
                div.find('.img_wrap').append(img);
            };
            reader.readAsDataURL(file);
        } else {
            img.src = '/images/'+fileExt+'_uploaded.png'
            div.find('.img_wrap').append(img);
        }

        if (idx < 0) {
            wrap.prepend(div);
        } else {
            wrap.find('.file_item:eq('+idx+')').after(div);
        }

        img.onload = function(e){
            if (img.width > img.height*0.9)  $(img).addClass('wd');
            else $(img).addClass('he');
        }

    }


}
function validatedFile (file){
    var acceptFile = ["jpg","jpeg","png","pdf"];
    var extFile = file.name.split('.').pop().toLowerCase();
    var str = '';

    if (!file) return false;

    if (acceptFile.indexOf(extFile) === -1 ) {
        str = 'jpg, jpeg, png, pdf 확장자만 업로드 가능합니다'
    } else if (file.size > ( 10 * 1024 * 1024 )) {
        str = '파일당 10MB를 초과할 수 없습니다'
    }

    if (str) {
        miCommonPop.alert(str);
        return false;
    } else {
        return true;
    }
}

$('.btn_file_pop').on('click', function (){
    var type =  $(this).data('type');
    var title = $(this).siblings('span.title').text();
    fnSendPostAjax('/api/claim/file-list', {caSeq: caSeq, fileType: type },{
        s: function (res){
            pop.find('.img_area .file_item').remove();
            ipFile.data('file-type',type);
            pop.find('.active_title').text(title);

            if (res.data.length) {
                var imgArr = sortArr(res.data);

                $.each(imgArr, function(i,v){
                    var divEl = $('<div class="file_item" data-seq="'+v.fileSeq+'"><div class="img_item"><div class="img_wrap"></div><button class="btn_delete_img"></button></div></div>');
                    var img = new Image();
                    var errorFlag = false;
                    img.onerror= function(){
                        if (!errorFlag) img.src = '/images/' + v.fileExt +'_uploaded.png'
                        errorFlag = true;
                    }
                    img.src = v.filePath;

                    img.onload = function(){
                        if (img.width > img.height* 0.9)  $(img).addClass('wd');
                        else $(img).addClass('he');
                    }
                    divEl.find('.img_wrap').append(img);
                    pop.find('.img_area').prepend(divEl);
                })
            }

            fileLengthCheck()
            miCommonPop.setting({
                dTarget : 'popFileUpload',
                dFirstAc : function(){
                    ipFile.val('');
                }
            })
        }
    });
});

function fileLengthCheck(){
    if (!pop.find('.file_item').length) {
        pop.find('.img_area').addClass('el_hidden');
        pop.find('.no_list').removeClass('el_hidden');
        $('.btn_file_pop[data-type="' + ipFile.data('file-type') + '"]').parents('li').removeClass('done');
    }  else {
        pop.find('.img_area').removeClass('el_hidden');
        pop.find('.no_list').addClass('el_hidden');
    }

    if (pop.find('.file_item').length === 20 ) $('.more_wrap').addClass('el_hidden');
    else $('.more_wrap').removeClass('el_hidden');

    miCommonPop.rePosition('popFileUpload');
}

function sortArr (arr){
    arr.sort(function (a, b) {
        if (a.order < b.order) {
            return 1;
        }
        if (a.order > b.order) {
            return -1;
        }
        return 0;
    });
    return arr
}

function ableNext(){
    var disabledFlag = false;

    $('.file_list:visible').each(function(i,v){
        if (!$(v).find('.done').length) {
            disabledFlag = true;
            return false;
        }
    });

    if (!$('[data-type="common_1"]').parents('li').hasClass('done')) disabledFlag = true;

    $('.case:visible').each(function(i,v){
        var name = $(v).find('[type=checkbox]').attr('name');

        if (!$('[name='+name+']:checked').length) {
            disabledFlag = true;
            return false;
        }
    })

    goNext.prop('disabled', disabledFlag);
}

function resizingImg(file){
    var reader = new FileReader();
    var compressedFile;
    var image;

    reader.onload = function(ee) {
        var dataUrl = reader.result;

        if (!dataUrl || typeof dataUrl !== 'string') {
            return;
        }

        image = new Image();

        image.onload = function(ee) {
            var canvas = document.createElement("canvas");
            var MAX_HEIGHT = 800;
            var MAX_WIDTH = 800;
            var ratio = Math.min(MAX_WIDTH/image.width, MAX_HEIGHT/image.height, 1);

            newWidth = image.width * ratio;
            newHeight = image.height * ratio;

            canvas.width = newWidth;
            canvas.height = newHeight;

            var canvasContext = canvas.getContext("2d");
            canvasContext.drawImage(image, 0, 0, newWidth, newHeight);

            canvas.toBlob(function(blob){
                if (!blob) {
                    return;
                }
                compressedFile = new File([blob], file.name , {
                    type: blob.type,
                });
                if (compressedFile.size > file.size) uploadFile(file);
                else uploadFile(compressedFile);

            }, 'image/jpg' , 0.3);
        };

        image.src = dataUrl;
    };
    reader.readAsDataURL(file);
};
