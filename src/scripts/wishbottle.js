/**
 * Created by shuding on 9/12/15.
 * <ds303077135@gmail.com>
 */
(function (window, docuemnt, $, undefined) {
    var el = {};
    var st = {};
    var va = {};

    var dataCache = [];
    var dataQueue = [];
    var queueSt   = 0;
    var queueEd   = 0;
    var queueLn   = 20;

    var api = new window.API($);

    function addCache(data) {
        [].forEach.call(data, function (item) {
            if (typeof dataCache[item._id] === 'undefined') {
                dataCache[item._id] = true;
                var wish            = new window.Wish(item, el.$canvasElements, va, function () {
                    editorCompile(item);
                    editorShow();
                });
                dataQueue.push(wish);
            }
        });
    }

    function queuePush(callback) {
        api.get({
            offset: queueEd
        }, function (err, data) {
            if (!err) {
                addCache(data);
            }
            callback && callback(err);
        });
    }

    function queueInit() {
        queuePush(function (err) {
            if (!err) {
                console.log(dataQueue);
                while (queueEd - queueSt < queueLn) {
                    if (queueEd < dataQueue.length) {
                        dataQueue[queueEd].play();
                        queueEd++;
                    } else {
                        queueInit();
                        break;
                    }
                }
            }
        });
    }

    function modernizrInit(callback) {
        el.$copyright = $('#copyright');
        el.$container = $('#container');

        if (window.devicePixelRatio >= 2.0) {
            el.$copyright.find('img').attr('src', 'stu_logo@2x.png');
        }
        va.width    = window.innerWidth;
        va.height   = window.innerHeight;
        va.bindSize = function (element) {
            if (typeof va.elements === 'undefined') {
                va.elements = [];
            }
            element.width  = va.width;
            element.height = va.height;
            va.elements.push(element);
        };
        $(window).on('resize', function () {
            va.width  = window.innerWidth;
            va.height = window.innerHeight;
            va.elements && va.elements.forEach(function (element) {
                element.width  = va.width;
                element.height = va.height;
            });
        });

        el.$container.addClass('gradient-' + (~~(Math.random() * 5)));

        if (window.Modernizr.canvas) {
            callback();
        }
    }

    function backgroundMusicInit() {
        el.$bgMusic    = $('#bg-music');
        el.$muteButton = $('#mute-button');

        el.$bgMusic.on('play', function () {
            st.bgMusicPlay = true;
            el.$muteButton.find('i').html('&#xE050;');
        }).on('pause', function () {
            st.bgMusicPlay = false;
            el.$muteButton.find('i').html('&#xE04F;');
        });

        el.$muteButton.click(function () {
            if (st.bgMusicPlay) {
                backgroundMusicMute();
            } else {
                backgroundMusicPlay();
            }
        });
    }

    function backgroundMusicPlay() {
        el.$bgMusic[0].play();
    }

    function backgroundMusicMute() {
        el.$bgMusic[0].pause();
    }

    function backgroundCanvasInit() {
        el.$canvasElements   = $('#canvas-elements');
        el.$canvasBackground = $('#canvas-background');
        el.bgCtx             = el.$canvasBackground[0].getContext('2d');
        va.bindSize(el.$canvasBackground[0]);

        var fireflies = [];
        for (var i = 0; i < 30; ++i) {
            fireflies.push(new window.Firefly(i / 30));
        }

        var drawFrame = function () {
            el.bgCtx.clearRect(0, 0, va.width, va.height);
            fireflies.forEach(function (ff) {
                ff.blink();
                ff.move();
                ff.draw(el.bgCtx, va.width, va.height);
            });
            requestAnimationFrame(drawFrame);
        };

        drawFrame();
    }

    function editorLock(name) {
        el.$editorHeading.text((name || '无名氏') + ' 说：');
        el.$editorBox.addClass('submitted');
        el.$editorBox.find('input').attr('disabled', 'disabled');
        el.$editorBox.find('textarea').attr('disabled', 'disabled');
    }

    function editorUnlock() {
        el.$editorHeading.text('写下你的祝福');
        el.$editorBox.removeClass('submitted');
        el.$editorBox.find('input').attr('disabled', null);
        el.$editorBox.find('textarea').attr('disabled', null);
        el.$editorBox.find('input').val('');
        el.$editorBox.find('textarea').val('');
    }

    function editorShow() {
        el.$canvas.addClass('scaled');
        el.$editor.addClass('expanded');
        st.canvasBackgroundScaled = true;
    }

    function editorHide() {
        setTimeout(editorUnlock, 1000);
        el.$canvas.removeClass('scaled');
        el.$editor.removeClass('expanded');
        st.canvasBackgroundScaled = false;
    }

    function editorInit() {
        el.$editorBox       = $('#editor-box');
        el.$editorHeading   = el.$editorBox.find('h3');
        el.$buttonClose     = $('#button-close');
        el.$buttonSubmit    = $('#button-submit');
        el.$buttonShare     = $('#button-share');
        el.$buttonContainer = $('#button-container');

        el.$buttonClose.click(function () {
            editorHide();
        });
        el.$editor.click(function (event) {
            if ([].indexOf.call(event.originalEvent.path, el.$editorBox[0]) == -1) {
                editorHide();
                event.preventDefault();
            }
        });

        el.$buttonSubmit.click(function () {
            // TODO: get data
            var data = {
                name:    el.$editorBox.find('input').val(),
                content: el.$editorBox.find('textarea').val()
            };

            api.post(data, function (err, data) {
                if (err) {
                    alert(err);
                } else {
                    console.log(data);
                    editorLock(data.name);
                }
            });
        });

        el.$buttonShare.click(function () {

        });
    }

    function editorCompile(data) {
        el.$editorBox.find('input').val(data.name);
        el.$editorBox.find('textarea').val(data.content);
        window.location.hash = data._id;
        editorLock(data.name);
    }

    function bottleInit() {
        el.$bottle = $('#bottle');
        el.$editor = $('#editor');

        el.$bottle.click(function () {
            if (st.canvasBackgroundScaled) {
                editorHide();
            } else {
                editorShow();
            }
        });
    }

    function orientationInit() {
        el.$canvas = $('#canvas');

        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', function (event) {
                var x = Math.floor(event.beta);
                var y = Math.floor(event.gamma);
                el.$canvas.css({
                    'margin-left': y + 'px',
                    'margin-top':  x + 'px'
                });
            });
        }
    }

    function touchmovePrevent() {
        $('body').on('touchmove', function (event) {
            event.preventDefault();
        });
        $('textarea').on('blur', function () {
            $('body').scrollTop(0); // Wechat auto-scrolling hack
        });
        $('input').on('blur', function () {
            $('body').scrollTop(0); // Wechat auto-scrolling hack
        });
    }

    function detectHash() {

        var hash = window.location.hash;
        if (hash && hash !== '#') {
            try {
                hash = hash.split('#')[1];
            } catch (err) {
                return;
            }
        } else {
            return;
        }

        api.get({
            type: '_id',
            _id:  hash
        }, function (err, data) {
            if (err) {
                alert(err);
            } else {
                addCache(data);
                editorCompile(data[0]);
                editorShow();
            }
        });
    }

    function init() {
        backgroundMusicInit();
        backgroundMusicPlay();
        touchmovePrevent();
        modernizrInit(function () {
            // Canvas valid
            backgroundCanvasInit();
            bottleInit();
            editorInit();
            orientationInit();
            queueInit();

            detectHash();
        });
    }

    init();

})(window, document, jQuery);
