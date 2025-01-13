var isMobile = false;
var isApp = sessionStorage.getItem('mi_device') === 'app' || localStorage.getItem('mi_device') === 'app';
var isIOS = navigator.userAgent.match(/iPhone|iPod|iPad/i) != null;
var isAndroid = navigator.userAgent.match(/Android/i) != null;

var travelSeq = $('[name="travelSeq"]').val();
var travelerSeq = $('[name="travelerSeq"]').val();

init();

function init() {
    tabAc();
    inputAc();

    if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) {
        isMobile = true;
        isIOS = true;
    }

    if (navigator.userAgent.match(/iPhone|iPod|iPad|Android|android|IEMobile|BlackBerry|Kindle|Windows CE|LG|MOT|SAMSUNG|Samsung/i) != null) {
        isMobile = true;
    }

    if (isMobile) mobileAc();
}

function goApply(qs) {
    var str = $.param(qs);
    location.href = '/apply?' + str;
}

function resetApply(cb) {
    fnSendPostAjax('/api/reset', { travelSeq: travelSeq }, {
        s: function () {
            if (!!cb) cb();
            else goApply();
        },
        f: function (res) {
            switch (res.code) {
                case 'ERR_APPLY_0001':
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.href = '/pay/close/' + travelSeq;
                        }
                    });
                    break;
                default:
                    miCommonPop.alert(res.display);
            }
        }
    });
}

function tabAc() {
    var tabWrapper = $('.header_tab');

    if (!tabWrapper.length) return false;

    var isGoSimple = $('[name="tSimpleAccessYn"]').val() === 'Y';
    var isGoApply = $('[name="tApplyAccessYn"]').val() === 'Y';

    var tab1 = $('#tab1');
    var tab2 = $('#tab2');

    var currentIdx = tabWrapper.find('.active').index();

    tab1.on('click', function (e) {
        if (!isGoSimple) {
            e.preventDefault();

            if (currentIdx === 1) {
                miCommonPop.alert({
                    dType: 'confirm',
                    dCopy: '간편계산을 다시 시작하시면<br>모든 정보가 초기화됩니다<br><br>그래도 진행하시겠습니까?',
                    dButtonSetText: ['예', '아니요'],
                    dFirstAc: function () {
                        resetApply();
                    }
                });
            } else {
                miCommonPop.alert({
                    dCopy: '진행중인 신청내역이 있습니다',
                    dFirstAc: goApply
                });
            }
        }
    });

    tab2.on('click', function (e) {
        if (!isGoApply) {
            e.preventDefault();

            miCommonPop.alert({
                dCopy: '간편계산을 먼저 진행해주세요',
                dFirstAc: function () {
                    if (currentIdx !== 0) goApply({
                        type: 'tab'
                    });
                }
            });
        }
    });
}

$('.btn_info').on('click', function () {
    var idx = $(this).data('index');
    var title, copy, cvrgLimit;

    switch (idx) {
        case 'n2':
            title = '위험한 운동이나 전문적인 체육활동';
            copy = '직업, 직무 또는 동호회 활동으로 행하는 전문등반, 글라이더조종, 스카이다이빙, 스쿠버다이빙, 행글라이딩, 수상보트, 패러글라이딩 등';
            break;
        case 'n3':
            title = '기왕증';
            copy = '암, 백혈병, 간경화증, 당뇨병, 에이즈 및 HIV 보균, 충치, 습관성 탈구 등 과거의 질병이나 부상이 완치되지 않아 현재까지도 치료, 관리가 필요한 질병 및 상해를 말합니다';
            break;
        case 'p1':
            title = '긴급구조/송환';
            copy = '해외에서 14일 이상 입원하는 등의 경우나, 여행중 사고로 긴급수색구조 등이 필요하다고 확인된 경우, 환자의 귀국송환비, 친지 2명의 항공운임/교통비/숙박비, 수색구조비용 등을 보상합니다<br><br>' +
                '보상사례로는 ① 그랜드캐년 추락사고, ② 헝가리 유람선 전복사고 등을 포함한 많은 사례가 있습니다';
            break;
        case 'p2':
            title = '항공기 지연/결항(4시간)';
            copy = '항공편의 갑작스런 결항으로 예정출발시간으로부터 4시간 내에 대체항공편이 제공되지 못한 경우 또는 4시간 이상 지연될 경우에, 대체항공편 탑승을 위해 예정출발시간 이후 공항에서 대기하시는 동안 발생한 식사비, 간식비, 전화통화비를 보상합니다<br><br>' +
                '숙박이 필요한 경우 숙박비, 공항에서 대기중 숙박시설로 이동하는 경우, 공항과 숙박시설간 왕복교통비도 보상됩니다<br><br>' +
                '위 보상항목의 총 보상한도는 가입금액으로 정하며, 귀국시까지 적용됩니다' +
                '<h2 class="pop_title">항공위탁수하물 지연도착(6시간)</h2>' +
                '항공위탁수하물이 예정도착시간으로부터 6시간 이내에 도착하지 못하는 경우, 예정된 도착지에 도착후 120시간내에 지출한 비상의복 및 필수품 구입비용을 보상합니다<br><br>' +
                '위 보상항목의 총 보상한도는 가입금액으로 정하며, 귀국시까지 적용됩니다';
            break;
        case 'p3':
            cvrgLimit = $(this).siblings('.price').text();
            title = '항공위탁수하물 파손/도난/분실';
            copy = '여행중 항공사에 위탁한 수하물이 항공사 과실로 파손, 도난, 분실될 경우, 물품당 20만원 한도(자기부담금 1만원)로 피해금액을 보상합니다' +
                '<h2 class="pop_title">휴대물품 파손/도난</h2>' +
                '여행중 휴대물품 도난 또는 파손될 경우, 물품당 20만원 한도(자기부담금 1만원)로 피해금액을 보상합니다<br><br>' +
                '항공위탁수하물 파손/도난/분실 및 휴대물품 파손/도난의 총 보상한도는 ' + cvrgLimit + '입니다';
            break;
        case 'p4':
            title = '배상책임';
            copy = '다른 사람의 물품을 파손/유실되게 하거나, 다른 사람을 다치게 한 경우에 부담하게 된 손해배상금과 변호사비용, 소송비용을 보상합니다<br><br>' +
                '자주 발생하는 보상사례로는 ① 호텔의 물품을 깨뜨린 경우, ② 쇼핑중 전시된 물품에 피해를 입힌 경우, ③ 실수로 다른 사람에게 골절상을 입혀 고액의 의료비를 부담하게 된 경우 등이 있습니다<br><br>' +
                '그러나, ① 함께 여행하는 친족에 대한 손해배상, ② 자동차(오토바이 포함)의 사용, 관리로 인한 손해배상 등에 대해서는 보상하지 않습니다';
            break;
        case 'p5':
            title = '긴급귀국';
            copy = '보험기간 중 ① 가입자 및 여행동반가족의 상해 또는 질병으로 3일 이상 입원시, ② 지진, 분화, 해일과 같은 천재지변, ③ 전쟁, 테러, 내란, 폭등, ④ 3촌 이내의 친족 또는 여행동반자의 사망 등으로 여행을 중단하게 되어 귀국하게될 경우 보상합니다<br><br>' +
                '보상금액은 가입금액 한도내에서 ① 기지불한 항공 또는 선박운임비용을 초과하여 가입자가 추가로 부담하는 항공 또는 선박운임비용, ② 여행중단 후 귀국으로 인해 기지불한 숙박비용을 초과하여 가입자가 추가로 부담하는 2박 이내의 숙박비용입니다';
            break;
        case 'p6':
            cvrgLimit = $(this).siblings('.price').text();
            title = '특정전염병치료';
            copy = '특정전염병 감염으로 치료를 받는 경우, 위로금 ' + cvrgLimit + '을 별도로 지급합니다<br><br>특정전염병은 일본뇌염, 홍역, 풍진, 볼거리, 성홍열, 콜레라, 장티푸스. 말라리아, 페스트, 파상풍, 광견병 등입니다';
            break;
        case 'p7':
            cvrgLimit = $(this).siblings('.price').text();
            title = '식중독입원';
            copy = '식중독으로 2일 이상 입원한 경우, 위로금 ' + cvrgLimit + '을 별도로 지급합니다';
            break;
        case 'p8':
            title = '여권분실';
            copy = '여행중 여권분실 또는 도난으로 재외공관에 여권분실신고 및 여행증명서 발급을 받은 경우, 여행증명서 발급비용과 여권재발급비용을 실비 보상합니다<br><br>' +
                '교통비 및 사진발급비용은 보상되지 않습니다';
            break;
        case 'p9':
            cvrgLimit = $(this).siblings('.price').text();
            title = '휴대품 파손/도난';
            copy = '여행중 휴대물품 도난 또는 파손피해가 발생한 경우, 물품당 20만원 한도(자기부담금 1만원)로 피해금액을 보상하며, 총 보상한도는 ' + cvrgLimit + '입니다';
            break;
        case 'p10':
            title = '<strong class="c__point">COVID-19 격리비/항공료 보장 서비스</strong>';
            copy = '귀국전 코로나 양성 판정을 받아, 격리 혹은 국내 입국이 불가능하게 된 경우 보장됩니다 (신속항원 24시간 이내, PCR 48시간 이내)\n' +
                '<h2 class="pop_title">격리비</h2>' +
                '1박당 10만원씩 정액 지급하며, 최대 100만원까지 받게 됩니다' +
                '<h2 class="pop_title">귀국 항공료</h2>' +
                '귀국 항공권 변경으로 추가비용 발생시 최대 50만원까지 받게 됩니다\n\n' +
                '단, 병원 또는 병원과 연계된 호스피텔에 격리되어 입원 치료를 받는 경우는 의료비로 청구 가능하므로 격리비 지급대상이 아니며,  귀국 항공료만 보상됩니다';
            break;
        case 'p11':
            title = '추가청구';
            copy = '이미 보험금을 수령한 적이 있는 사고 또는 질병에 대해 보험금을 추가로 청구하시는 것을 말합니다' +
                '<br><br>' +
                '추가청구로 진행하면 사고내용을 다시 입력하지 않고, 추가서류를 제출하는 것만으로 간편하게 청구하실 수 있습니다'
            break;
        case 'p12':
            copy = '<h2 class="pop_title t__bold">의료수급권자</h2>' +
                '<p class="indent">생활이 어려운 저소득 국민의 의료비를 국가가 보장하는 공공부조제도</p>' +
                '<h2 class="pop_title t__bold">수급권자 자격</h2>' +
                '<p class="indent">[1종] 국민기초생활보장 수급자(근로무능력가구, 희귀난치성질환, 중증질환 등록자, 시설수급자 등), 행려환자, 타법적용자(이재민, 의상자, 입양아동, 북한이탈주민 등)</p>' +
                '<p class="indent">[2종] 국민기초생활보장 수급자 중 의료급여 1종 수급권자 기준에 해당되지 않는 자</p>';
            break;
        case 'p13':
            title = '출입국증명자료';
            copy = '출입국에 관한 사실 증명서, 비행기 티켓, 여권출입국도장 등'
            break;
        case 'p14':
            title = '의료비 추가서류';
            copy = '진료내역과 진료비용이 제출서류에서 확인되지 않는 경우,추가 증빙서류 요청이 있을 수 있습니다'
            break;
        case 'p15':
            title = '진료비세부내역서';
            copy = 'Detailed statement of medical expenses, Payment Details, Detail bill 등'
            break;
        case 'p16':
            title = '처방전(약품구입시)';
            copy = '의사의 처방없이 약국에서 구매한 약품은 보상 대상이 아닙니다'
            break;
        case 'p17':
            title = '통신사 가입확인서류';
            copy = '통신사 홈페이지 또는 대리점에서 발급<br><span class="sm">*SKT: 이용계약등록사항 증명서 <br>*KT: 가입원부증명서<br>*LGU+: 가입확인서 또는 해지확인서</span>'
            break;
        case 'p18':
            title = '피해물품 구입영수증';
            copy = '구입영수증이 없을 경우, 피해물품 정보(모델명 등), 소유관계, 구입시기, 금액 등을 확인할 수 있는 자료<br><span class="sm">*휴대폰은 통신사 가입확인서류로 대체합니다</span>'
            break;
        case 'p19':
            title = '비용지출 영수증';
            copy = '지출내역 및 시간이 표시되어야 합니다'
            break;
        case 'p20':
            title = '항공위탁수하물 지연 확인서';
            copy = '항공사에서 발급 받을 수 있으며, 지연사유 및 항공위탁수하물 발송시간이 표시되어야 합니다'
            break;
        case 'p20-1':
            title = '항공위탁수하물 지연/분실';
            copy = '항공사에서 발급 받을 수 있으며, 지연사유 및 항공위탁수하물 발송시간이 표시되어야 합니다'
            break;
        case 'p21':
            title = '주민등록등본';
            copy = '주민등록번호 뒷자리를 포함하여 발급 필요'
            break;
        case 'p22':
            title = '보험금수령인의 신분증 및 통장사본';
            copy = '미성년자의 경우 법정대리인의 가족관계확인서류 및 신분증, 통장사본'
            break;
        case 'p23':
            title = '합의서 및 합의금 지급내역';
            copy = '법률상 손해배상액을 보상합니다'
            break;
    }

    miCommonPop.alert({
        dType: 'info',
        dTitle: title,
        dCopy: copy
    });
});

// 가입자명단 보기 & 개인 플랜 팝업
var popCompanion = $('#popCompanion');
var btnGetCompanion = $('#btnGetCompanion');
var btnGetPlan = $('#btnGetPlan');

var elUnder15 = $('.under15');
var elOver15 = $('.over15');
var elActMedExp = $('.act_med_exp');

btnGetCompanion.on('click', getCompanion);
btnGetPlan.on('click', function () {
    getPlan(travelerSeq);
});

popCompanion.on('click', '.btn_get_cvrg', function () {
    getPlan($(this).data('seq'));
});

function getCompanion() {
    $.get('/api/traveler-list?travelSeq=' + travelSeq, function (res) {
        if (res.success) {
            var data = res.data;
            var elList = popCompanion.find('tbody');
            elList.empty();

            $.each(data, function (k, v) {
                switch (k) {
                    case 'detailList':
                        $.each(v, function (i, obj) {
                            var isRefund = obj.refundYn === 'Y';
                            var getCvrg = isRefund ? '가입취소' : '<button type="button" class="mi_btn white sm btn_get_cvrg" data-seq="' + obj.travelerSeq + '">보기</button>';

                            var tpl = '<tr' + (isRefund ? ' class="refund"' : '') + '>' +
                                '        <td>' + obj.seq + '</td>' +
                                '        <td class="t__left">' + obj.name + '</td>' +
                                '        <td>' + obj.birth + '-' + obj.ssn + '</td>' +
                                '        <td><span class="t__right">' + miUtil.numComma(obj.premium) + '</span></td>' +
                                '        <td>' + getCvrg + '</td>' +
                                '    </tr>';

                            elList.append(tpl);
                        });
                        break;
                    default:
                        popCompanion.find('.' + k).text(miUtil.numComma(v));
                }
            });

            miCommonPop.setting({
                dTarget: 'popCompanion',
                dOpenAc: function () {
                    if (popCompanion.find('.pop_body').height() < popCompanion.find('.pop_contents').innerHeight()) popCompanion.find('.pop_bottom').addClass('shadow_up');
                    else popCompanion.find('.pop_bottom').removeClass('shadow_up');

                    popCompanion.find('.pop_body').scrollTop(0);
                }
            });
        } else {
            miCommonPop.alert(res.display);
        }
    });
}

function getPlan(seq) {
    var wrapper = $('#popPlan .plan');
    var planWrap;

    $.get('/api/coverage-detail?travelersSeq=' + seq, function (res) {
        if (res.success) {
            var data = res.data;
            var isLangEn = data.planCurrency === 'USD';

            var isAC04 = data.ac04Yn === 'Y';
            var isDZ04 = data.dz04Yn === 'Y';

            $('#planTypeNm').html(data.planTypeNm.replace('플랜', '<span>플랜</span>'));
            $('#popPlan .pop_title').addClass(data.planTypeCd);

            wrapper.find('[class^="tpl_"]').addClass('el_hidden');
            wrapper.find('.cvrg_group:not(.act_med_exp) > ul > li').addClass('el_hidden').removeClass('c__red');
            if (data.insuCompany === 'carrot' && data.planTypeCd === 'A') planWrap = $('.tpl_carrot_a');
            else if (data.insuCompany === 'carrot')  planWrap = $('.tpl_carrot_b');
            else if (data.domMedExp4thYn === 'N') planWrap = $('.tpl_3rd');
            else if (data.afterRenewalYn === 'N') planWrap = $('.tpl_4th');
            else planWrap = $('.tpl_4re');

            planWrap.add($('.added')).removeClass('el_hidden');

            if (data.planTypeCd !== 'C') $('.covid_group').addClass('el_hidden');
            else $('.covid_group').removeClass('el_hidden');

            if (data.under15Yn === 'Y') {
                elUnder15.removeClass('el_hidden');
                elOver15.addClass('el_hidden');
            } else {
                elUnder15.addClass('el_hidden');
                elOver15.removeClass('el_hidden');
            }

            if (data.dz03MinYn === 'Y') $('.DZ03').closest('li').addClass('c__red');

            if (!isAC04 && !isDZ04) elActMedExp.addClass('el_hidden');
            else if (!isDZ04) elActMedExp.find('.ac_title').removeClass('el_hidden').siblings('h5').addClass('el_hidden');
            else elActMedExp.find('.ac_title').addClass('el_hidden').siblings('h5').removeClass('el_hidden');

            $.each(data.coverage, function (i, obj) {
                if (!!obj.cvrgLimit) {
                    var limit = obj.cvrgLimit;
                    var adj = obj.cvrgLimitAdj;

                    var el = planWrap.find('.' + obj.cvrgCd);

                    var cvrgLimit = isLangEn && el.hasClass('US')  ? 'US ' + miUtil.numToKo(limit) + '달러' : miUtil.numToKo(limit) + '원';
                    var cvrgLimitText;

                    if (limit !== adj) {
                        var cvrgLimitAdj = adj ? miUtil.numToKo(adj) + '원' : '0';

                        el.closest('li').addClass('c__red').find('.added').addClass('el_hidden');
                        cvrgLimitText = '<span class="origin">' + cvrgLimit + '</span>' + cvrgLimitAdj;
                    }

                    el.html(cvrgLimitText || cvrgLimit).closest('li').removeClass('el_hidden');
                }
            });

            miCommonPop.setting({
                dTarget: 'popPlan',
                dOpenAc: function () {
                    $('#popPlan').find('.pop_body').scrollTop(0);
                }
            });
        } else {
            miCommonPop.alert(res.display);
        }
    });
}

// 서비스 이용을 위한 동의
var chkAgreeAll = $('#agreeAll');
var chkAgree = $('.agree_child').find('[type="checkbox"]');
var elAgreeWrap = $('.agree_child');

chkAgreeAll.on('change', function () {
    var isChecked = $(this).prop('checked');
    chkAgree.prop('checked', isChecked);
});

elAgreeWrap.on('change', [type = 'checkbox'], function () {
    var isChecked = chkAgree.length === $('.agree_child [type="checkbox"]:checked').length;
    chkAgreeAll.prop('checked', isChecked);
});

// 이메일 관련 등등
$('.email1, .email2').on({
    'keyup blur': function (e) {
        cleanInput(e, ['KR', 'EMOJI', 'SP']);
    }
});

function getValidEmail(wrapper) {
    var a = wrapper.find('.email1').val();
    var b = wrapper.find('.email2_changer').val();
    var c = wrapper.find('.email2').val();
    var d = b === 'mibank' ? c : b;

    var isEmpty = false;

    $.each([a, d], function (i, val) {
        if (!val) {
            isEmpty = true;

            miCommonPop.alert('이메일을 입력해주세요');
            return false;
        }
    });

    if (!isEmpty && validateEmail(a, d)) return a + '@' + d;
}

// 이메일 약관 발송
var elPopEmail = $('#popEmail');
var btnPopEmail = $('#btnPopEmail');
var btnSendEmail = $('#btnSendEmail');

btnPopEmail.on('click', showPopEmail);
btnSendEmail.on('click', sendEmailTerms);

function showPopEmail() {
    var email = $('[name="email"]').val();

    var inPopEmail1 = elPopEmail.find('.email1');
    var inPopEmail2Change = elPopEmail.find('.email2_changer');
    var inPopEmail2 = elPopEmail.find('.email2');

    miCommonPop.setting({
        dTarget: 'popEmail',
        dOpenAc: function () {
            if (miValidate.isEmail(email)) {
                var aEmail = email.split('@');

                inPopEmail1.val(aEmail[0]);
                inPopEmail2Change.val(aEmail[1]).removeClass('init');

                if (!inPopEmail2Change.val()) {
                    inPopEmail2Change.val('mibank');
                    inPopEmail2.val(aEmail[1]).removeClass('el_hidden');
                } else {
                    inPopEmail2.addClass('el_hidden');
                }
            } else {
                inPopEmail1.add(inPopEmail2).add(inPopEmail2Change).val('');
                inPopEmail2.addClass('el_hidden');
                inPopEmail2Change.addClass('init');

                setTimeout(function () {
                    inPopEmail1.focus();
                });
            }
        }
    });
}

function sendEmailTerms() {
    var email = getValidEmail(elPopEmail);
    var travelSeqFromFlow = null;
    if (termSendPage !== 'qna') {
        travelSeqFromFlow = travelSeq
    }

    if (email) {
        fnSendPostAjax('/api/mail-send', {
            travelSeq : travelSeqFromFlow,
            email: email,
            mailType: 'T'
        }, {
            s: function () {
                miCommonPop.close('popEmail');
                miCommonPop.alert('<div class="icon_box success">이메일로 약관을 보내드렸습니다</div>');
            }
        }, {
            btn: btnSendEmail,
            able: 'C'
        });
    }
}

// loader
function showMiLoader(loaderTxt) {
    if (!loaderTxt) loaderTxt = '';

    $('body').find('.loader').remove();

    var html = '<div class="loader">' +
        '           <div class="inner">' +
        '               <div class="visual"><span class="rect1"></span><span class="rect2"></span><span class="rect3"></span><span class="rect4"></span></div>' + loaderTxt +
        '           </div>' +
        '       </div>';

    $('body').append(html);
}

function hideMiLoader() {
    $('body').find('.loader').remove();
}

function twinkle(target, times) {
    var count = 0;

    if (target.length === 0) return false;

    ac();

    var set1Times = setInterval(function () {
        ac();

        if (times === count) {
            clearInterval(set1Times);
        }
    }, 600);

    function ac() {
        count++;
        target.stop().animate({
            'opacity': '0'
        }, 300, function () {
            target.stop().animate({
                'opacity': '1'
            }, 300);
        });
    }
}

/**
 * ajax call - post
 * @param url
 * @param params
 * @param objCb callback - { b: beforeSend, s: response success, f: response fail, c: complete }
 * @param objBtn button disabled - { btn: button jQuery selector, able: F (fail) || C (complete) }
 * @param contentType
 */
function fnSendPostAjax(url, params, objCb, objBtn, contentType) {
    var csrf = {
        header: $('[name="_csrf_header"]').val(),
        token: $('[name="_csrf"]').val()
    };

    if (!objCb) objCb = '';

    if (!contentType) {
        contentType = 'application/json; charset=utf-8';
        params = JSON.stringify(params);
    }

    $.ajax({
        url: url,
        type: 'POST',
        contentType: contentType,
        data: params,
        async: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader(csrf.header, csrf.token);

            if (!!objCb.b) objCb.b();

            if (!!objBtn) {
                objBtn.btn.prop('disabled', true);
            }
        },
        success: function (res) {
            if (res.success) {
                if (!!objCb.s) objCb.s(res);
            } else {
                console.log(res.code);
                if (res.code === 'ERR_APPLY_9999') {
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.replace('/mypage')
                        }
                    })

                    return false
                } else if (res.code === 'E0000') {
                    miCommonPop.alert({
                        dCopy: res.display,
                        dFirstAc: function () {
                            location.replace('/')
                        }
                    })
                    return false
                }

                if (!!objCb.f) objCb.f(res);
                else errorHandle(res)

                if (!!objBtn && objBtn.able === 'F') objBtn.btn.prop('disabled', false);
            }
        },
        error: function () {
            if (!!objBtn && objBtn.able === 'F') objBtn.btn.prop('disabled', false);
        },
        complete: function () {
            if (!!objCb.c) objCb.c();
            if (!!objBtn && objBtn.able === 'C') objBtn.btn.prop('disabled', false);
        }
    });
}

function errorHandle (res){
    var display = '';
    switch (res.code) {
        case 'ERR_CLAIM_0001':
        case 'ERR_CLAIM_0007':
            break;
        default :
            display = res.display
    }

    if (display) {
        miCommonPop.alert({
            dCopy : display,
            dFirstAc : function(){
                if (res.url) location.href = res.url;
            }
        })
    } else {
        if (res.url) location.href = res.url;
    }
}

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');

    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);

    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}


// =========== UI

function inputAc() {
    $(document).on('change', '.check_group input, select.init', function (e) {
        $(this).closest('.init').add(this).removeClass('init');

        if (e.target.tagName === 'INPUT') {
            $(this).closest('.mi_check').addClass('checked').siblings().removeClass('checked');
        }
    });

    $('input.select').on('click', function () {
        var dTarget = $(this).data('pop');
        var name = $(this).data('name');

        if (!dTarget || !name) return false;

        miCommonPop.setting({
            dTarget: dTarget,
            dOpenAc: function () {
                var elBody = $('#' + dTarget + ' .pop_body');
                var inChecked = elBody.find(':checked:first');
                var value = inChecked.val();

                elBody.scrollTop(0);

                if (value) {
                    var targetLabel = inChecked.closest('.mi_check');
                    var targetLabelH = targetLabel.position().top;

                    elBody.scrollTop(targetLabelH - 280);
                }
            }
        });
    });

    $('.check_group.capsule .mi_check').on('click', function (e) {
        e.preventDefault();

        var target = $(this).find('input');
        var sibling = $(this).siblings('.mi_check').find('input');
        var bChecked = target.prop('checked');

        sibling.prop('checked', bChecked);
        target.prop('checked', !bChecked).change();
    });

    $('.mi_common_pop.select .mi_check').on('click', function () {
        var dTarget = $(this).closest('.mi_common_pop').attr('id');
        var name = $(this).find('input').attr('name');
        var value = $(this).find('input').val();

        if (!dTarget || !name) return false;

        $('#' + dTarget + ' :checked').prop('checked', false);
        $('#' + dTarget + ' [value="' + value + '"]').prop('checked', true);

        var linkedInput = $('[data-pop="' + dTarget + '"]');
        var text = $('[name="' + name + '"]:checked').siblings('.text').text();

        linkedInput.val() === text || linkedInput.change();
        linkedInput.val(text);

        miCommonPop.close(dTarget);
    });
}

function mobileAc() {
    var _html = $('html');
    var _headerTitle = $('.header_title');
    var _headerTab = $('.header_tab');
    var _contentsStep = $('.contents_step');

    var _lnbWrap = $('.lnb_wrap');
    var _btnLnb = _lnbWrap.find('.btn_lnb');

    _btnLnb.click(function (e) {
        _lnbWrap.toggleClass('active');
        _html.toggleClass('mi_scroll_none');
        e.stopPropagation();

        if (!_lnbWrap.hasClass('active')) {
            _html.removeClass('mi_scroll_none');
        }
    });

    _lnbWrap.on('click', function (e) {
        if ($(e.target).hasClass('lnb_wrap')) {
            _lnbWrap.removeClass('active');
            _html.removeClass('mi_scroll_none');
        }
    });

    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 0) {
            if (_contentsStep.length) {
                _contentsStep.addClass('shadow');
            } else if (_headerTab.length) {
                _headerTab.addClass('shadow');
            } else {
                _headerTitle.addClass('shadow');
            }
        } else {
            _headerTitle.add(_headerTab).add(_contentsStep).removeClass('shadow');
        }
    }).scroll();
}

$(function () {
    $('.btn_toggler, .btn_slider').on('click', function () {
        var isSliding = $(this).hasClass('btn_slider');
        var target = $(this).siblings('.togglee');

        $(this).toggleClass('open');

        if (isSliding) target.slideToggle();
        else target.toggle();
    });

    $('.btn_toggler_target').on('click', function () {
        var targetClass = $(this).data('target');
        $('.' + targetClass).toggle();
    });
});

function getQueryParam (key) {
    var queryParam = (location.href).split('?')[1];
    var paramVal = '';

    if(queryParam){
        var paramsArr = queryParam.split('&');
        for(var i = 0; i < paramsArr.length; i++){
            if(paramsArr[i].split('=')[0].trim() === key){
                paramVal= paramsArr[i].split('=')[1];
            }
        }
    }
    return paramVal;
}

function saveClaimData(param, url) {
    fnSendPostAjax('/api/claim/save', param , {
        s: function(){
            location.href = url
        },
        f : function(res){
            if (res.code === 'ERR_CLAIM_0009') {
                miCommonPop.setting({
                    dCopy:res.display,
                    dType:'confirm',
                    dCopyAlign : 't__center',
                    dLastAc : function(){
                        fnSendPostAjax('/api/claim/discard', { caSeq : $('[name=caSeq]').val()},{
                            s: function(){
                                if (res.url) location = res.url;
                            }
                        })
                    },
                    dFirstAc : function(){
                        var ips = $('.info_person').find('.mi_input');
                        ips.each(function(i,v){
                            $(v).val($(v).data('as-is'));
                        })
                    }
                });
            } else {
                miCommonPop.alert({
                    dCopy:res.display,
                    dFirstAc : function(){
                        if (res.url) location = res.url
                    }
                });
            }
        }
    })
}

function  saveClaimTempData(param) {
    fnSendPostAjax('/api/claim/temp-save', param , {
        s: function(){
            miCommonPop.alert('임시저장 되었습니다');
        },
        f : function(res){
            miCommonPop.alert({
                dCopy:res.display,
                dFirstAc : function(){
                    if (res.url) location = res.url
                }
            });
        }
    })
}

$('.policy_docs .mi_check input').on('change', function(){
    var name = $(this).attr('name');
    var checkedVal = $('[name='+name+']:checked').val();
    $(this).parents('.check_group').siblings('div').hide();
    $(this).parents('.check_group').siblings('.'+checkedVal).show();
})
