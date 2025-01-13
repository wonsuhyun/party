var caSeq = $('[name=caSeq]').val();

$('.btn_delete_claim').on('click', function(){
    fnSendPostAjax('/api/claim/discard', {caSeq : $(this).parents('.claim_progress_box').find('[name=caSeq]').val()},{
        s: function(){
            miCommonPop.alert({
                dCopy : '삭제되었습니다',
                dFirstAc : function(){
                    location.reload()
                }
            })
        }
    })
});

$('.btn_pop_paper').on('click', function(){
    var box = $(this).parents('.claim_progress_box');
    var ciSeq = box.find('[name=ciSeq]').val()
    var pop = $('#popClaimPaperSubmit');

    pop.find('.file_name').text(box.find('.box_title').text());
    pop.find('.pop_contents').empty();

    fnSendPostAjax('/api/claim/file-detail', { ciSeq : ciSeq }, {
        s: function(res){
            $.each(res.data , function(i,v){
                var box = $('<div class="file_list"><p>'+v.fileCate+'</p></div>')
                var ul = $('<ul>');

                $.each(v.fileList, function(ii,vv){
                    var li = $('<li class="'+( vv.exist ? 'done' : '' )+'">'+ vv.fileName+'</li>');
                    ul.append(li);
                })

                box.append(ul);
                pop.find('.pop_contents').append(box);
            })
            miCommonPop.setting({
                dTarget : 'popClaimPaperSubmit'
            })
        }
    } )

})
