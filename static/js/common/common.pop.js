/*
마이뱅크
write : gray
since : 2019-10-18
edit : Jinn
lase edit : 2020-01-21 info 타입 추가
*/

var modulPop = new function () {
    this.set = function (options) {
        var defaults = {
            dWidth: null,
            dConHe: null, 
            dType: 'basic', 
            dClass: '', 
            dTarget: 'popDefault', 
            dTitle: null, 
            dTitleAlign: 't__left', 
            dCopy: null,
            dCopyAlign: 't__left',
            dOpenAc: null,
            dCloseAc: null, 
            dFirstAc: null, 
            dLastAc: null, 
            dButtonText: '확인',
            dButtonSet: false, 
            dButtonSetText: ['아니요', '예'], 
            dCloseX: false, 
            dShowTime: null
        };

        return $.extend(defaults, options);
    };

    this.setting = function (options) {
        var opts = this.set(options);
        var _Target = $('#' + opts.dTarget),
            _TargetCon = _Target.find('.pop_wrap'),
            _closeBt = '#' + opts.dTarget + ' .btn_close',
            _firstBt = '#' + opts.dTarget + ' .btn_first',
            _lastBt = '#' + opts.dTarget + ' .btn_last';

        if (!!opts.dShowTime) {
            var _showTime = opts.dShowTime || 2000;

            setTimeout(function () {
                dPopClose();
                if (!!opts.dFirstAc) {
                    opts.dFirstAc(opts);
                }
            }, _showTime);
        }

        openAc();

        $(document).on('click', _closeBt, function () {
            if (opts.dCloseAc) {
                opts.dCloseAc();
            }
            dPopClose();
        });

        $(document).on('click', _firstBt, function () {
            if (opts.dFirstAc) {
                opts.dFirstAc(opts);
            }
            dPopClose();
        });

        $(document).on('click', _lastBt, function () {
            if (opts.dLastAc) {
                opts.dLastAc(opts);
            }
            dPopClose();
        });

        $(window).on('resize', function () {
            if ($('.mi_common_pop:visible').length !== 0) {
                dPopResize();
                $('html').addClass('mi_scroll_none');
            }
        }).resize();

        function openAc() {
            if (_Target.length === 0) {
                var popWidthMax = '';
                var popConHeight = '';
                var popClass = opts.dType;
                var btnCloseX = '';
                var title = '';
                var contents = '';
                var buttonSet = '';

                if (opts.dWidth) {
                    popWidthMax = ' max-width:' + opts.dWidth + 'px;';
                }

                if (opts.dConHe) {
                    popConHeight = 'min-height:' + opts.dConHe + 'px';
                }

                if (opts.dClass) {
                    popClass = popClass + ' ' + opts.dClass
                }

                if (opts.dCloseX) {
                    btnCloseX = '<button type="button" class="btn_close"></button>';
                }

                if (opts.dTitle) {
                    title = '<h2 class="pop_title ' + opts.dTitleAlign + '">' + opts.dTitle + '</h2>';
                }

                if (opts.dCopy) {
                    contents = opts.dCopy.replace(/\n/g, '<br>');
                }

                if (opts.dButtonSet) {
                    buttonSet = opts.dButtonSet;
                } else if (opts.dType === 'confirm') {
                    buttonSet = '<button type="button" class="mi_btn white btn_first">' + opts.dButtonSetText[0] + '</button>' +
                        '<button type="button" class="mi_btn color btn_last">' + opts.dButtonSetText[1] + '</button>';
                } else {
                    buttonSet = '<button type="button" class="mi_btn color btn_first">' + opts.dButtonText + '</button>';
                }

                var html = '<div class="mi_common_pop ' + popClass + '" id="' + opts.dTarget + '">' +
                        '<div class="inner">' +
                            '<div class="pop_wrap" style="' + popWidthMax + '">' +
                                '<div class="pop_body ' + opts.dCopyAlign + '" style="' + popConHeight + '">' +
                                    btnCloseX +
                                    title +
                                    '<div class="pop_contents">' + contents + '</div>' +
                                '</div>' +
                                '<div class="pop_bottom' + (opts.dType === 'confirm' ? ' btn_wrap' : '') + '">' + buttonSet + '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';

                $('body').append(html);
            }
            dPopOpen();
        }

        function dPopOpen() {
            _Target = $('#' + opts.dTarget);
            _TargetCon = _Target.find('.pop_wrap');
            _closeBt = '#' + opts.dTarget + ' .btn_close';

            setTimeout(function () {
                $('html').addClass('mi_scroll_none');
                _Target.show();
                _Target.find('.inner').css({ opacity: 1 });

                dPopResize();

                if (opts.dOpenAc) {
                    opts.dOpenAc();
                }

                _Target.attr({ 'tabindex': 0 }).css({ 'z-index': 99999 + $('.mi_common_pop:visible').length }).focus();
            }, 10);
        }

        function dPopClose() {
            $(document).off('click', _closeBt);
            $(document).off('click', _firstBt);
            $(document).off('click', _lastBt);

            _Target.hide();

            if (opts.dType !== 'basic') {
                _Target.remove();
            }

            if ($('.mi_common_pop:visible').length === 0) {
                $('html').removeClass('mi_scroll_none');
            }
        }

        function dPopResize() {
            var TargetPadding = parseFloat(_Target.css('padding-left')),
                cWidth = _TargetCon.outerWidth(),
                cHeight = _TargetCon.outerHeight(),
                wWidth = $(document).width(),
                wHeight = $(window).height(),
                cTop = (wHeight / 2) - (cHeight / 2),
                cLeft = (wWidth / 2) - (cWidth / 2) - TargetPadding;


            if (cTop <= 0) cTop = 0;
            if (cLeft <= 0) cLeft = 0;

            _TargetCon.css({
                'top': cTop + 'px',
                'left': cLeft + 'px'
            });
        }
    };

    this.alert = function (data) {
        var dataType = typeof data;
        var dOpts = {
            dType: 'alert',
            dCopyAlign: 't__center'
        };
        var ddOpts;

        if (dataType === 'object') {
            ddOpts = $.extend(dOpts, data);
        } else if (dataType === 'string') {
            ddOpts = dOpts;
            ddOpts.dCopy = data;
        }
        this.setting(ddOpts);
    };

    this.close = function (target) {
        var _closeBt = '#' + target + ' .btn_close';
        var _firstBt = '#' + target + ' .btn_first';
        var _lastBt = '#' + target + ' .btn_last';

        $(document).off('click', _closeBt);
        $(document).off('click', _firstBt);
        $(document).off('click', _lastBt);

        $('#' + target).attr('style', '');

        if ($('.mi_common_pop:visible').length === 0) {
            $('html').removeClass('mi_scroll_none');
        }
    };

    this.rePosition = function (target) {
        var _target = $('#' + target)
        var _targetCon = _target.find('.pop_wrap');

        var targetPadding = parseFloat(_target.css('padding-left')),
            cWidth = _targetCon.outerWidth(),
            cHeight = _targetCon.outerHeight(),
            wWidth = $(document).width(),
            wHeight = $(window).height(),
            cTop = (wHeight / 2) - (cHeight / 2),
            cLeft = (wWidth / 2) - (cWidth / 2) - targetPadding;


        if (cTop <= 0) cTop = 0;
        if (cLeft <= 0) cLeft = 0;

        _targetCon.css({
            'top': cTop + 'px',
            'left': cLeft + 'px'
        });
    }
};
