'use strict';
    
var consoleFix = {
    init: function() {
        if (!(window.console && console.log)) {
            (function() {
                var noop = function() {};
                var methods = ['assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error', 'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'markTimeline', 'profile', 'profileEnd', 'markTimeline', 'table', 'time', 'timeEnd', 'timeStamp', 'trace', 'warn'];
                var length = methods.length;
                var console = window.console = {};
                while (length--) {
                    console[methods[length]] = noop;
                }
            }());
        }
    }
};

function isTouch() {
    try {
        document.createEvent("TouchEvent");
        return true;
    }
    catch (e) { return false; }
}

var $document = $(document);

function randomInteger(min, max) {
    var rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}

var Drum = function() {
    var _this = this;
    var deg = 0;
    var cockies = Cookies.get('rx-land');
    var count = cockies || 0;
    var drum = $(".main-block__drum");
    var contentBlock = $(".content");

    var cRefer = (Cookies.get('rx-land-refer') && Cookies.get('rx-land-refer') != 'undefined') ? Cookies.get('rx-land-refer') : ''
    var cCtag  = (Cookies.get('rx-land-ctag') &&  Cookies.get('rx-land-ctag')  != 'undefined')  ? Cookies.get('rx-land-ctag')  : '';
    var cBtag  = (Cookies.get('rx-land-btag') &&  Cookies.get('rx-land-btag')  != 'undefined')  ? Cookies.get('rx-land-btag')  : '';

    $("#refer").val(cRefer);
    $("#ctag").val(cCtag);
    $("#btag").val(cBtag);

    if(count == 1) {
        contentBlock.attr("class", "content");
        contentBlock.addClass("step-2");
    }
    else if(count == 2) {
        contentBlock.attr("class", "content");
        contentBlock.addClass("step-3");
        $("#reg, .overlay").fadeIn();
    }
    _this.twist = function() {
        if(!drum.hasClass("disabled")) {
            if(count == 0) {
                deg = 3 * 360 / 8 + 360 * randomInteger(2, 3);
            }
            else if(count == 1) {
                deg = deg + 6 * 360 / 8 + 360 * randomInteger(2, 3);
            }
            else {
                deg = deg;
            }
            count++;
            drum.addClass("disabled");
            drum.css({
                transform: "rotate(" + deg  + "deg)"
            });
            if(count == 1) {
                setTimeout(function() {
                    Cookies.set('rx-land', 1);
                    $("#congr-1, .overlay").fadeIn();
                }, 4000);
            }
            if(count == 2) {
                setTimeout(function() {
                    Cookies.set('rx-land', 2);
                    $("#reg, .overlay").fadeIn();
                }, 4000);
            }
        }
    };
    $document.on("click", ".js-main-block__drum-center-but", function() {
        _this.twist();
    });
    $document.on("click", ".js-step1-go", function() {
        contentBlock.attr("class", "content");
        contentBlock.addClass("step-2");
        $("#congr-1, .overlay").fadeOut();
        drum.removeClass("disabled");
    });
    $document.on("click", ".js-stepreg-go", function() {
        contentBlock.attr("class", "content");
        contentBlock.addClass("step-3");
        $("#congr-2").fadeOut(function() {
            $("#reg").fadeIn();
        });
        drum.removeClass("disabled");
    });
};

var setHiddenParams = {
    init: function() {
        var params = window
            .location
            .search
            .replace('?','')
            .split('&')
            .reduce(
                function(p,e){
                    var a = e.split('=');
                    p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
                    return p;
                },
                {}
            );

        if (params['refer']) Cookies.set('rx-land-refer', params['refer']);
        if (params['ctag'])  Cookies.set('rx-land-ctag', params['ctag']);
        if (params['btag'])  Cookies.set('rx-land-btag', params['btag']);
    }
};

//document ready
$(function() {

    // fix console bug for old browsers
    consoleFix.init();

    setHiddenParams.init();

    var drum = new Drum();

});