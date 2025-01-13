var inputOrd = [];
var labelArr = [];
var requiredArr = [];

$('.email2_changer').on('change', handleEmail2);

function getInputOrd() {
    var targets = $('.mi_input, .check_group, .mi_textarea');

    inputOrd = [];
    labelArr = [];
    requiredArr = [];

    var idx = 0;
    targets.each(function (i, v) {
        var el = $(v);
        var elLabel = el.data('label') || el.closest('.input_box').siblings('.input_label').text() || el.attr('placeholder') || el.find('option[hidden]').text();

        if (el.is(':visible')) {
            if (!el.data('except')) {
                requiredArr[idx] = v;
                labelArr[idx] = elLabel;
                idx++;
            }

            if (el.hasClass('datepicker') || !el.is('[readonly]') && !el.is('[disabled]')) {
                inputOrd.push(v);
            }
        }
    });
}

/**
 * 입력된 input value 조건에 따라 제거
 * @param e: event
 * @param targetLang: 제거하거나 남길 구문 유형
 * @param isOnly: targetLang만 남길 경우 true
 * @param cb: callback
 * @param ordArr: auto focus 순서 담은 배열 - 특정 범위 지정할 경우 사용 (ex. popup), 기본값은 inputOrd
 */
function cleanInput(e, targetLang, isOnly, cb, ordArr) {
    if (!targetLang) return false;

    var targetInput = $(e.target);
    var val = targetInput.val();
    var maxLength = Number(targetInput.attr('maxlength'));

    if (targetLang === 'MOBILE') {
        val = val.replace(/[^0-9]/g, '')
            .replace(/^(\d{0,3})(\d{0,3}|\d{0,4})(\d{0,4})$/g, '$1-$2-$3')
            .replace(/(\-{1,2})$/g, '');
    } else if (typeof targetLang === 'string') {
        val = miValidate.deleteLang(val, targetLang, isOnly);
    } else {
        $.each(targetLang, function (i, v) {
            val = miValidate.deleteLang(val, v, isOnly);
        });
    }

    targetInput.val(val);
    if (!ordArr) ordArr = inputOrd;

    // auto focus
    var a = ordArr.length;
    var b = a - ordArr.indexOf(e.target) > 1;
    var c = e.type === 'keyup';
    var d = val.length === maxLength;
    var s = !$(ordArr[ordArr.indexOf(e.target) + 1]).is('select');

    if (a && b && c && d && s) {
        $(ordArr[ordArr.indexOf(e.target) + 1]).focus();
    }

    if (!!val && !!cb) cb(val);

    return true;
}

/**
 * 필수입력 항목에 빈값이 있는지 체크 후 alert
 * getInputOrd에서 만들어진 배열 항목들 체크
 * @param onlyEmpty: 오류 팝업 없이 빈값만 체크할 경우 true
 * @returns {boolean}
 */
function validateRequired(onlyEmpty, isAddRed) {
    var result = true;

    $.each(requiredArr, function (i, v) {
        var el = $(v);
        var label = labelArr[i];
        var josa = miUtil.makeJosa(label, '을를');
        var elName = el.data('name');
        var value = el.hasClass('check_group') && !!elName ? el.find('[name=' + elName + ']:checked').val() : el.val();

        if (!value) {
            result = false;
            if (!onlyEmpty) {
                var inType = el.prop('tagName') === 'INPUT' && !el.hasClass('datepicker') && !el.hasClass('select') ? ' 입력' : ' 선택';
                miCommonPop.alert(label + josa + inType + '해주세요');
            }
            if (isAddRed) {
                el.addClass('error')
            } else {
                return false;
            }
        }
    });

    return result;
}

/**
 * 사용자 이름 유효성 체크
 * @param target input || value(string)
 * @param birth 내국인 주민번호에 영문이름 체크시 필요
 * @param ssn 내국인 주민번호에 영문이름 체크시 필요
 * @param copy 오류 팝업 문구
 * @param cb
 * @returns {boolean}
 */
function validateName(target, birth, ssn, copy, cb) {
    var isVal = typeof target === 'string';
    var name = isVal ? target : target.val();

    if (!name.length) return false;

    var isNameKR = miValidate.isLangOnly(name, 'KR');
    var isNameENG = miValidate.isLangOnly(name, 'name_eng');

    if (isNameENG && !!birth && !!ssn) {
        return validateNative(target, birth, ssn, cb);
    } else if (name.length < 2 || (!isNameKR && !isNameENG)) {
        miCommonPop.alert({
            dCopy: copy || '이름을 정확하게 입력해주세요',
            dFirstAc: function () {
                !!cb && cb();
            }
        });

        return false;
    } else {
        return true;
    }
}

/**
 * 내국인 주민번호에 영문이름인지 체크
 * @param targetName input || value(string)
 * @param birth
 * @param ssn
 * @param copy 오류 팝업 문구
 * @param cb
 * @returns {boolean}
 */
function validateNative(targetName, birth, ssn, copy, cb) {
    var isVal = typeof targetName === 'string';
    var name = isVal ? targetName : targetName.val();

    if (!name || name.length < 2 || !birth || birth.length < 6 || !ssn || ssn.length < 7) return false;

    var sid = ssn.charAt(0);
    var isFrn = sid === '5' || sid === '6' || sid === '7' || sid === '8';
    var isNameENG = miValidate.isLangOnly(name, 'name_eng');

    if (isNameENG && !isFrn) {
        miCommonPop.alert({
            dCopy: copy || '한글 이름을 입력해주세요',
            dFirstAc: function () {
                !!cb && cb();
            }
        });

        return false;
    } else {
        return true;
    }
}

/**
 * 주민번호 유효성
 * @param targetBirth: input || value(string)
 * @param targetSsn: input || value(string)
 * @param objKr: 내국인만 가입가능할 때 사용 { isOnly(boolean), copy - 오류 문구 }
 * @param copy 오류 팝업 문구
 * @param cb
 * @returns {boolean}
 */
function validateIdNum(targetBirth, targetSsn, objKr, copy, cb) {
    var isBirthVal = typeof targetBirth === 'string';
    var birth = isBirthVal ? targetBirth : targetBirth.val();

    if (!birth) return false;

    if (birth.length !== 6 || !miValidate.isBirth(birth)) {
        miCommonPop.alert({
            dCopy: copy || '생년월일을 정확하게 입력해주세요',
            dFirstAc: function () {
                !!cb && cb();
            }
        });
        return false;
    }

    if (targetSsn === undefined) return true;

    var isSsnVal = typeof targetSsn === 'string';
    var ssn = isSsnVal ? targetSsn : targetSsn.val();

    if (!ssn) return false;

    var chkMemNum = miValidate.chkMemNum(birth + ssn);

    if (chkMemNum && !miValidate.isMemBirth(birth, ssn)) {
        miCommonPop.alert({
            dCopy: copy || '생년월일을 정확하게 입력해주세요',
            dFirstAc: function () {
                !!cb && cb();
            }
        });
        return false;
    }

    if (!chkMemNum) {
        miCommonPop.alert({
            dCopy: copy || '주민번호를 정확하게 입력해주세요',
            dFirstAc: function () {
                !!cb && cb();
            }
        });
        return false;
    } else if (objKr && objKr.isOnly && chkMemNum === 'foreigner') {
        miCommonPop.alert({
            dCopy: objKr.copy || '외국인은 가입대상이 아닙니다',
            dFirstAc: function () {
                !!cb && cb();
            }
        });
        return false;
    }

    return true;
}

/**
 * 휴대폰번호 유효성
 * @param target: input || value(string)
 * @param cb
 * @returns {boolean}
 */
function validateMobile(target, cb) {
    var isVal = typeof target === 'string';
    var val = isVal ? target : target.val();

    if (!val) return false;

    if (!miValidate.isHp(val)) {
        miCommonPop.alert({
            dCopy: '휴대폰번호를 정확하게 입력해주세요',
            dFirstAc: function () {
                !!cb && cb();
            }
        });

        return false;
    } else {
        return true;
    }
}

/**
 * 이메일 유효성
 * @param emailId
 * @param emailDomain
 * @param cb
 * @returns {boolean}
 */
function validateEmail(emailId, emailDomain, cb) {

    if (!emailId || !emailDomain) return false;

    if (!miValidate.isEmail(emailId + '@' + emailDomain)) {
        miCommonPop.alert({
            dCopy: '이메일을 정확하게 입력해주세요',
            dFirstAc: function () {
                !!cb && cb();
            }
        });
        return false;
    } else {
        return true;
    }
}

/**
 * 이메일 도메인 select 제어
 * - 직접입력 value: 'mibank'
 * @param e
 */
function handleEmail2(e) {
    var target = $(e.target);
    var targetInput = target.siblings('input');
    var val = target.val();

    if (val === 'mibank') targetInput.removeClass('el_hidden');
    else targetInput.addClass('el_hidden').val('');

    $('.mi_common_pop:visible').length || getInputOrd();
}

var miValidate = {
    langType: {
        ENG: /[a-zA-Z]/g,
        KR: /[ㄱ-ㅎㅏ-ㅣ가-힣]/g,
        KR_CON: /[ㄱ-ㅎㅏ-ㅣ]/g,
        NUM: /[0-9]/g,
        SPC: /[\[\]{}()<>?|`~!@#$%^&*-_+=,.;:\"'\\\₩]/g,
        SP: /\s/g,
        EMOJI: /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g
    },
    langTypeExcept: { // 해당 언어 제외 언이들을 선택
        ENG: /[^a-zA-Z]/g,
        KR: /[^가-힣]/g,
        KR_CON: /[^ㄱ-ㅎㅏ-ㅣ가-힣]/g,
        NUM: /[^0-9]/g,
        name:/^[ -]|[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣ㆍᆢᆞᆢ - ᄀᆞᄂᆞᄃᆞᄅᆞᄆᆞᄇᆞᄉᆞᄋᆞᄌᆞᄎᆞᄏᆞᄐᆞᄑᆞᄒᆞ ]|[ -]+(?= |-)/g,
        name_eng: /^[ -]|[^a-zA-Z -]|[ -]+(?= |-)/g
    },
    chkLangTypeExcept: {
        ENG: /[^a-zA-Z]/,
        KR: /[^가-힣]/,
        NUM: /[^0-9]/,
        name_eng: /[^a-zA-Z -]/
    },
    deleteLang: function (data, lang, isExcept) {
        var reg = isExcept ? this.langTypeExcept[lang] : this.langType[lang] || lang;
        return String(data).replace(reg, '');
    },
    isLangOnly: function (data, lang) { //해당 언어만 있냐를 체크
        return !this.chkLangTypeExcept[lang].test(data);
    },
    isBirth: function (data) {
        if (data.length !== 6) return false;

        var mm = Number(data.slice(2, 4));
        var dd = Number(data.slice(4, 6));
        var lastDayList = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var lastDay = lastDayList[mm - 1];

        return mm >= 1 && mm <= 12 && dd >= 1 && dd <= lastDay;
    },
    chkMemNum: function (data) { // 주민등록번호 및 외국인등록번호 체크
        if (data.length !== 13 || data.split('')[6] === 0) {
            return false;
        }

        var arr_ssn = data.split('').map(Number);
        var yy = parseInt(arr_ssn.slice(0, 2).join(''));
        var mm = parseInt(arr_ssn.slice(2, 4).join(''));
        var dd = parseInt(arr_ssn.slice(4, 6).join(''));
        var sid = arr_ssn[6];
        var yyyy = Number(new Date().getUTCFullYear().toString().slice(2, 4)) < yy ? parseInt('19' + arr_ssn.slice(0, 2).join('')) : parseInt('20' + arr_ssn.slice(0, 2).join(''));

        if (yyyy >= 2000) {
            if (sid !== 3 && sid !== 4 && sid !== 7 && sid !== 8) {
                return false;
            }
        } else {
            if (sid !== 1 && sid !== 2 && sid !== 5 && sid !== 6) {
                return false;
            }
        }

        if (sid === 5 || sid === 6 || sid === 7 || sid === 8) {
            return 'foreigner'
        }

        var isRandomSsn = new Date(yyyy + '-' + ( '0' + mm ).slice(-2) + '-' + ( '0' + dd ).slice(-2)) >= new Date('2020-10-01')
        if (isRandomSsn) {
            return 'kr'
        }

        var compare = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5], // 공식에 필요한 넘버
            sum = 0 // 합산할 숫자 초기화

        // 공식: M = (11 - ((2×A + 3×B + 4×C + 5×D + 6×E + 7×F + 8×G + 9×H + 2×I + 3×J + 4×K + 5×L) % 11)) % 11
        for (var i = 0; i < 12; i++) { // 주민등록번호를 공식넘버를 곱해서 합산
            sum = sum + (arr_ssn[i] * compare[i]);
        }

        //sum = (11 - (sum % 11)) % 10; // 주민등록번호 마지막 번호 공식
        if ((11 - (sum % 11)) % 10 === Number(arr_ssn[12])) { // 주민등록번호 마지막 번호 공식 과 실제 주민등록번호 마지막이 같은지 체크
            return 'kr';
        } else {
            return false;
        }
    },
    isMemBirth: function (birth, sid) {
        return this.oMemBirth({
            strBirth: birth,
            endBirth: sid
        }).birthCheck;
    },
    oMemBirth: function (data) { // 생년월일 앞에 년도 두자리 추가 and 주민번호 앞자리 유효성
        var defaults = {
            nowDate: '', // 현재년도
            strBirth: '', // 주민번호 앞자리
            endBirth: '', // 주민번호 뒷자리
            gender: '', // 성별 M,F = 남, 여
            birthCheck: true // 생일 유효성
        };
        var nData = $.extend(defaults, data);
        var memYearsLa = nData.strBirth.substr(0, 2); // 생일년도 뒷자리2
        var memBirthMonth = nData.strBirth.substr(2, 2); // 생일 달
        var memBirthDay = nData.strBirth.substr(4, 2); // 생일 일
        var nowYears = String(nData.nowDate).substr(2, 2); // 현재년도 뒷자리2
        if (!nData.endBirth) { // 주민번호 뒷자리가 없을경우
            if (nData.gender === 'M') { // 남
                if (Number(memYearsLa) <= Number(nowYears)) {
                    nData.endBirth = '3333333';
                } else {
                    nData.endBirth = '1111111';
                }
            } else if (nData.gender === 'F') { // 여
                if (Number(memYearsLa) <= Number(nowYears)) {
                    nData.endBirth = '4444444';
                } else {
                    nData.endBirth = '2222222';
                }
            }
        }
        var endBirthFr = nData.endBirth.substr(0, 1), // 주민번호 뒷자리 앞번호1자리
            memYearsFr = '00'; // 생일년도 앞자리2
        switch (Number(endBirthFr)) {
            //1900년대(남자:1, 여자:2)
            case 1:
            case 2:
            case 5:
            case 6:
                memYearsFr = '19';
                break;
            //2000년대(남자:3, 여자:4)
            case 3:
            case 4:
            case 7:
            case 8:
                memYearsFr = '20';
                break;
            //1800년대(남자:9, 여자:0)
            case 9:
            case 0:
                memYearsFr = '18';
                break;
            default:
                return false;
                break;
        }
        var splitBirthYear = Number(memYearsFr + memYearsLa); // 생년
        var splitBirthMonth = Number(memBirthMonth); // 월
        var splitBirthDay = Number(memBirthDay); // 일
        var monthDayArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 월별 마지막 일수
        var monthLastDay = monthDayArr[splitBirthMonth - 1];
        if (splitBirthMonth === 2) {
            if ((splitBirthYear % 4 === 0 && splitBirthYear % 100 !== 0) || splitBirthYear % 400 === 0) { // 윤년 체크
                monthLastDay = 29;
            }
        }
        if (splitBirthMonth < 1 || splitBirthMonth > 12 || splitBirthDay < 1 || splitBirthDay > monthLastDay) { // 생일(월 일 - 윤년포함) 체크
            nData.birthCheck = false;
        }
        nData.fullDate = memYearsFr + memYearsLa + '-' + memBirthMonth + '-' + memBirthDay; // 생일 년-월-일
        return nData;
    },
    isHpFrCheck: function (data) { // 전화번호 앞자리 체크
        data = String(data); // 문자로 변환
        return /01([0|1|6|7|8|9]?)/.test(data);
    },
    isHp: function (str) {
        var data = str.replace(/\-/g, '');

        var a = /^(01[016789])(\d{4}|\d{3})\d{4}$/g.test(data);
        var b = data.charAt(2) === '0' ? data.length === 11 : data.length >= 10;

        return a && b;
    },
    isEmail: function (data) { //메일 주소 체크
        return /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+[\.A-Za-z0-9\-]*$/.test(data);
    }
};

var miUtil = {
    numComma: function (data) { //콤마 추가
        data = miValidate.deleteLang(data, 'NUM', true);
        return data.replace(/\B(?=(\d{3})+(?!\d))/g, ','); //숫정의 경우만 3자리수마다 콤마 추가
    },
    numToKo: function (data) {
        var inputNumber = data < 0 ? false : data;
        var unitWords = ['', '만', '억', '조', '경', '해'];
        var splitUnit = 10000;
        var splitCount = unitWords.length;
        var resultArray = [];
        var resultString = '';

        for (var i = 0; i < splitCount; i++) {
            var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
            unitResult = Math.floor(unitResult);
            if (unitResult > 0) {
                resultArray[i] = unitResult;
            }
        }

        for (var i = 0; i < resultArray.length; i++) {
            if (!resultArray[i]) continue;
            resultString = String('' + this.numComma(resultArray[i])) + unitWords[i] + resultString;
        }

        return resultString;
    },
    numTwoDigit: function (num) {
        return num >= 10 ? num : '0' + num;
    },
    bizRegNoHyphen: function (data) {
        data = miValidate.deleteLang(data, 'NUM', true);
        return data.replace(/(\d{3})(\d{2})?(\d{5})?/, '$1-$2-$3').replace('--', '-');
    },
    mobileHyphen: function (data) {
        return data.replace(/(\d{3})(\d+)(\d{4})/, '$1-$2-$3');
    },
    makeJosa: function (data, type) {
        var lastCharCode = data.charCodeAt(data.length - 1);
        var langType = miValidate.isLangOnly(data.charAt(data.length - 1), 'KR') ? (lastCharCode - 44032) % 28 : 'ETC';

        switch (type) {
            case '은는':
                return langType === 'ETC' ? '(은)는' : langType > 0 ? '은' : '는';
            case '을를':
                return langType === 'ETC' ? '(을)를' : langType > 0 ? '을' : '를';
        }
    },
    time24to12KR: function (hh, mm, ss) {
        var isAM = hh - 12 < 0
        var ampmKR = isAM ? '오전' : '오후'
        var hh12 = hh % 12 || 12

        var sHH = ampmKR + ' ' + hh12 + '시'
        var sMM = Number(mm) >= 0 ? ' ' + mm.toString().padStart(2, '0') + '분' : ''
        var sSS = Number(ss) >= 0 ? ' ' + ss.toString().padStart(2, '0') + '초' : ''

        return sHH + sMM + sSS
    },
    time12KRto24: function (time) {
        var arrTime = time.split(' ')
        var numHH = Number(arrTime[1].replace('시', '') % 12)
        var strMM = arrTime.length === 3 ? arrTime[2].replace('분', '') : '00'
        var strSS = arrTime.length === 4 ? arrTime[3].replace('초', '') : '00'

        var numHH24 = arrTime[0] === '오전' ? numHH : numHH + 12

        return numHH24.toString().padStart(2, '0') + ':' + strMM + ':' + strSS
    }
};
