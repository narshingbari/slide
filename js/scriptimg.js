(function($, window, undefined) {

    var iView = function(el, options) {
        //Get slider holder
        var iv = this;

        iv.options = options;

        iv.sliderContent = el, iv.sliderInner = iv.sliderContent.html();

        iv.sliderContent.html("<div class='iviewSlider'>" + iv.sliderInner + "</div>");


        //Get slider
        iv.slider = $('.iviewSlider', iv.sliderContent);
        iv.slider.css('position', 'relative');

        //Necessary variables.
        iv.defs = {
            slide: 0,
            total: 0,
            image: '',
            images: [],
            //width: iv.sliderContent.width(),
            width: 100 + '%',
            height: iv.sliderContent.height(),
            timer: options.timer.toLowerCase(),
            lock: false,
            paused: (options.autoAdvance) ? false : true,
            time: options.pauseTime,
            easing: options.easing
        };

        //Disable slider text selection
        iv.disableSelection(iv.slider[0]);

        //Find slides
        iv.slides = iv.slider.children();
        iv.slides.each(function(i) {
            var slide = $(this);

            //Find images & thumbnails
            iv.defs.images.push(slide.data("iview:image"));

            iv.defs.total++;
        }).css({
            width: iv.defs.width,
            height: iv.defs.height
        });

        //Set Preloader Element
        iv.sliderContent.append('<div id="iview-preloader"><div></div></div>');
        var iviewPreloader = $('#iview-preloader', iv.sliderContent);
        var preloaderBar = $('div', iviewPreloader);
        iviewPreloader.css({
            top: ((iv.defs.height / 2) - (iviewPreloader.height() / 2)) + 'px',
            left: ((iv.defs.width / 2) - (iviewPreloader.width() / 2)) + 'px'
        });

        //Set Timer Element
        iv.sliderContent.append('<div id="iview-timer"><div></div></div>');
        iv.iviewTimer = $('#iview-timer', iv.sliderContent);
        iv.iviewTimer.hide();


        //If randomStart
        options.startSlide = (options.randomStart) ? Math.floor(Math.random() * iv.defs.total) : options.startSlide;

        //Set startSlide
        options.startSlide = (options.startSlide > 0 && options.startSlide >= iv.defs.total) ? iv.defs.total - 1 : options.startSlide;
        iv.defs.slide = options.startSlide;

        //Set first image
        iv.defs.image = iv.slides.eq(iv.defs.slide);

        //Set pauseTime
        iv.defs.time = (iv.defs.image.data('iview:pausetime')) ? iv.defs.image.data('iview:pausetime') : options.pauseTime;

        //Set easing
        iv.defs.easing = (iv.defs.image.data('iview:easing')) ? iv.defs.image.data('iview:easing') : options.easing;

        iv.pieDegree = 0;
        var padding = options.timerPadding,
            diameter = options.timerDiameter,
            stroke = options.timerStroke;

        if (iv.defs.total > 1 && iv.defs.timer != "bar") {
            //Start the Raphael
            stroke = (iv.defs.timer == "360bar") ? options.timerStroke : 0;
            var width = (diameter + (padding * 2) + (stroke * 2)),
                height = width,
                r = Raphael(iv.iviewTimer[0], width, height);

            iv.R = (diameter / 2);

            var param = {
                    stroke: options.timerBg,
                    "stroke-width": (stroke + (padding * 2))
                },
                param2 = {
                    stroke: options.timerColor,
                    "stroke-width": stroke,
                    "stroke-linecap": "round"
                },
                param3 = {
                    fill: options.timerColor,
                    stroke: 'none',
                    "stroke-width": 0
                },
                bgParam = {
                    fill: options.timerBg,
                    stroke: 'none',
                    "stroke-width": 0
                };

            // Custom Segment Attribute
            r.customAttributes.segment = function(angle, R) {
                var a1 = -90;
                R = R - 1;
                angle = (a1 + angle);
                var flag = (angle - a1) > 180,
                    x = ((diameter / 2) + padding),
                    y = ((diameter / 2) + padding);
                a1 = (a1 % 360) * Math.PI / 180;
                angle = (angle % 360) * Math.PI / 180;
                return {
                    path: [
                        ["M", x, y],
                        ["l", R * Math.cos(a1), R * Math.sin(a1)],
                        ["A", R, R, 0, +flag, 1, x + R * Math.cos(angle), y + R * Math.sin(angle)],
                        ["z"]
                    ]
                };
            };

            if (iv.defs.total > 1 && iv.defs.timer == "pie") {
                r.circle(iv.R + padding, iv.R + padding, iv.R + padding - 1).attr(bgParam);
            }
            iv.timerBgPath = r.path().attr(param), iv.timerPath = r.path().attr(param2), iv.pieTimer = r.path().attr(param3);
        }

        iv.barTimer = $('div', iv.iviewTimer);

        if (iv.defs.total > 1 && iv.defs.timer == "360bar") {
            iv.timerBgPath.attr({
                arc: [359.9, iv.R]
            });
        }

        //Set Timer Styles
        if (iv.defs.timer == "bar") {
            iv.iviewTimer.css({
                opacity: options.timerOpacity,
                width: diameter,
                height: stroke,
                border: options.timerBarStroke + 'px ' + options.timerBarStrokeColor + ' ' + options.timerBarStrokeStyle,
                padding: padding,
                background: options.timerBg
            });
            iv.barTimer.css({
                width: 0,
                height: stroke,
                background: options.timerColor,
                'float': 'left'
            });
        } else {
            iv.iviewTimer.css({
                opacity: options.timerOpacity,
                width: width,
                height: height
            });
        }

        //Set Timer Position
        iv.setTimerPosition();

        // Run Preloader
        new ImagePreload(iv.defs.images, function(i) {
            var percent = (i * 10);
            preloaderBar.stop().animate({
                width: percent + '%'
            });
        }, function() {
            preloaderBar.stop().animate({
                width: '100%'
            }, function() {
                iviewPreloader.remove();
                iv.startSlider();

                //Trigger the onAfterLoad callback
                options.onAfterLoad.call(this);
            });
        });

        //Touch navigation
        iv.sliderContent.bind('swipeleft', function() {
            if (iv.defs.lock) return false;
            iv.cleanTimer();
            iv.goTo('next');
        }).bind('swiperight', function() {
            if (iv.defs.lock) return false;
            iv.cleanTimer();
            iv.defs.slide -= 2;
            iv.goTo('prev');
        });


        //Bind the goSlide action
        iv.sliderContent.bind('iView:goSlide', function(event, slide) {
            if (iv.defs.lock || iv.defs.slide == slide) return false;
            if ($(this).hasClass('active')) return false;
            iv.cleanTimer();
            iv.slider.css('background', 'url("' + iv.defs.image.data('iview:image') + '") no-repeat');
            iv.defs.slide = slide - 1;
            iv.goTo('control');
        });

        //Bind the resize action
        iv.sliderContent.bind('resize', function() {

            t = $(this),
                tW = t.width(),
                tH = t.height(),
                width = iv.slider.width(),
                height = iv.slider.height();

            if (iv.defs.width != tW) {
                var ratio = (tW / width),
                    newHeight = Math.round(iv.defs.height * ratio);
                iv.slider.css({
                    '-webkit-transform-origin': '0 0',
                    '-moz-transform-origin': '0 0',
                    '-o-transform-origin': '0 0',
                    '-ms-transform-origin': '0 0',
                    'transform-origin': '0 0',
                    '-webkit-transform': 'scale(' + ratio + ')',
                    '-moz-transform': 'scale(' + ratio + ')',
                    '-o-transform': 'scale(' + ratio + ')',
                    '-ms-transform': 'scale(' + ratio + ')',
                    'transform': 'scale(' + ratio + ')'
                });
                t.css({
                    height: newHeight
                });
                iv.defs.width = tW;

                //Set Timer Position
                iv.setTimerPosition();
            }
        });


    };

    //iView helper functions
    iView.prototype = {
        timer: null,

        //Start Slider
        startSlider: function() {
            var iv = this;

            var img = new Image();
            img.src = iv.slides.eq(0).data('iview:image');
            imgWidth = img.width;
            if (imgWidth != iv.defs.width) {
                iv.defs.width = imgWidth;
                iv.sliderContent.trigger('resize');
            }

            iv.iviewTimer.show();

            //Show slide
            iv.slides.eq(iv.defs.slide).css('display', 'block');

            //Set first background
            iv.slider.css('background', 'url("' + iv.defs.image.data('iview:image') + '") no-repeat');


        },

        // setCaption function
        setCaption: function() {

        },

        //Process the timer
        processTimer: function() {

        },

        //When Animation finishes
        transitionEnd: function(iv) {

        },

        // Add strips
        addStrips: function(vertical, opts) {

        },

        // Add blocks
        addBlocks: function() {

        },

        runTransition: function(fx) {
            var iv = this;

            switch (fx) {

            }
        },

        // Shuffle an array
        shuffle: function(oldArray) {

        },

        // Timer interval caller
        timerCall: function(iv) {

        },

        //Set the timer function
        setTimer: function() {

        },

        //Clean the timer function
        cleanTimer: function() {

        },


        // goTo function
        goTo: function(action) {

        },


        //Set Timer Position function
        setTimerPosition: function() {
            var iv = this,
                position = iv.options.timerPosition.toLowerCase().split('-');
            for (var i = 0; i < position.length; i++) {
                if (position[i] == 'top') {
                    iv.iviewTimer.css({
                        top: iv.options.timerY + 'px',
                        bottom: ''
                    });
                } else if (position[i] == 'middle') {
                    iv.iviewTimer.css({
                        top: (iv.options.timerY + (iv.defs.height / 2) - (iv.options.timerDiameter / 2)) + 'px',
                        bottom: ''
                    });
                } else if (position[i] == 'bottom') {
                    iv.iviewTimer.css({
                        bottom: iv.options.timerY + 'px',
                        top: ''
                    });
                } else if (position[i] == 'left') {
                    iv.iviewTimer.css({
                        left: iv.options.timerX + 'px',
                        right: ''
                    });
                } else if (position[i] == 'center') {
                    iv.iviewTimer.css({
                        left: (iv.options.timerX + (iv.defs.width / 2) - (iv.options.timerDiameter / 2)) + 'px',
                        right: ''
                    });
                } else if (position[i] == 'right') {
                    iv.iviewTimer.css({
                        right: iv.options.timerX + 'px',
                        left: ''
                    });
                }
            }
        },

        disableSelection: function(target) {
            if (typeof target.onselectstart != "undefined") target.onselectstart = function() {
                return false;
            };
            else if (typeof target.style.MozUserSelect != "undefined") target.style.MozUserSelect = "none";
            else if (typeof target.style.webkitUserSelect != "undefined") target.style.webkitUserSelect = "none";
            else if (typeof target.style.userSelect != "undefined") target.style.userSelect = "none";
            else target.onmousedown = function() {
                return false;
            };
            target.unselectable = "on";
        },

        //touch
        isTouch: function() {
            return !!('ontouchstart' in window);
        }
    };

    //Image Preloader Function
    var ImagePreload = function(p_aImages, p_pfnPercent, p_pfnFinished) {
        this.m_pfnPercent = p_pfnPercent;
        this.m_pfnFinished = p_pfnFinished;
        this.m_nLoaded = 0;
        this.m_nProcessed = 0;
        this.m_aImages = new Array;
        this.m_nICount = p_aImages.length;
        for (var i = 0; i < p_aImages.length; i++) this.Preload(p_aImages[i])
    };

    ImagePreload.prototype = {
        Preload: function(p_oImage) {
            var oImage = new Image;
            this.m_aImages.push(oImage);
            oImage.onload = ImagePreload.prototype.OnLoad;
            oImage.onerror = ImagePreload.prototype.OnError;
            oImage.onabort = ImagePreload.prototype.OnAbort;
            oImage.oImagePreload = this;
            oImage.bLoaded = false;
            oImage.source = p_oImage;
            oImage.src = p_oImage
        },
        OnComplete: function() {
            this.m_nProcessed++;
            if (this.m_nProcessed == this.m_nICount) this.m_pfnFinished();
            else this.m_pfnPercent(Math.round((this.m_nProcessed / this.m_nICount) * 10))
        },
        OnLoad: function() {
            this.bLoaded = true;
            this.oImagePreload.m_nLoaded++;
            this.oImagePreload.OnComplete()
        },
        OnError: function() {
            this.bError = true;
            this.oImagePreload.OnComplete()
        },
        OnAbort: function() {
            this.bAbort = true;
            this.oImagePreload.OnComplete()
        }
    }



    // Begin the iView plugin
    $.fn.iView = function(options) {

        // Default options. Play carefully.
        options = jQuery.extend({
            fx: 'random',
            easing: 'easeOutQuad',
            strips: 20,
            blockCols: 10,
            blockRows: 5,
            animationSpeed: 500,
            pauseTime: 5000,
            startSlide: 0,
            directionNav: true,
            directionNavHoverOpacity: 0.6,
            controlNav: false,
            controlNavNextPrev: true,
            controlNavHoverOpacity: 0.6,
            controlNavThumbs: false,
            controlNavTooltip: true,
            captionSpeed: 500,
            captionEasing: 'easeInOutSine',
            captionOpacity: 1,
            autoAdvance: true,
            keyboardNav: true,
            touchNav: true,
            pauseOnHover: false,
            nextLabel: "Next",
            previousLabel: "Previous",
            playLabel: "Play",
            pauseLabel: "Pause",
            closeLabel: "Close",
            randomStart: false,
            timer: 'Pie',
            timerBg: '#000',
            timerColor: '#EEE',
            timerOpacity: 0.5,
            timerDiameter: 30,
            timerPadding: 4,
            timerStroke: 3,
            timerBarStroke: 1,
            timerBarStrokeColor: '#EEE',
            timerBarStrokeStyle: 'solid',
            timerPosition: 'top-right',
            timerX: 10,
            timerY: 10,
            tooltipX: 5,
            tooltipY: -5,
            onBeforeChange: function() {},
            onAfterChange: function() {},
            onAfterLoad: function() {},
            onLastSlide: function() {},
            onSlideShowEnd: function() {},
            onPause: function() {},
            onPlay: function() {}
        }, options);

        $(this).each(function() {
            var el = $(this);
            new iView(el, options);
        });

    };

    $.fn.reverse = [].reverse;

    var elems = $([]),
        jq_resize = $.resize = $.extend($.resize, {}),
        timeout_id, str_setTimeout = "setTimeout",
        str_resize = "resize",
        str_data = str_resize + "-special-event",
        str_delay = "delay",
        str_throttle = "throttleWindow";
    jq_resize[str_delay] = 250;
    jq_resize[str_throttle] = true;
    $.event.special[str_resize] = {
        setup: function() {
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false
            }
            var elem = $(this);
            elems = elems.add(elem);
            $.data(this, str_data, {
                w: elem.width(),
                h: elem.height()
            });
            if (elems.length === 1) {
                loopy()
            }
        },
        teardown: function() {
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false
            }
            var elem = $(this);
            elems = elems.not(elem);
            elem.removeData(str_data);
            if (!elems.length) {
                clearTimeout(timeout_id)
            }
        },
        add: function(handleObj) {
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false
            }
            var old_handler;

            function new_handler(e, w, h) {
                var elem = $(this),
                    data = $.data(this, str_data);
                data.w = w !== undefined ? w : elem.width();
                data.h = h !== undefined ? h : elem.height();
                old_handler.apply(this, arguments)
            }
            if ($.isFunction(handleObj)) {
                old_handler = handleObj;
                return new_handler
            } else {
                old_handler = handleObj.handler;
                handleObj.handler = new_handler
            }
        }
    };

    function loopy() {
        timeout_id = window[str_setTimeout](function() {
            elems.each(function() {
                var elem = $(this),
                    width = elem.width(),
                    height = elem.height(),
                    data = $.data(this, str_data);
                if (width !== data.w || height !== data.h) {
                    elem.trigger(str_resize, [data.w = width, data.h = height])
                }
            });
            loopy()
        }, jq_resize[str_delay])
    }


    var supportTouch = !!('ontouchstart' in window),
        touchStartEvent = supportTouch ? "touchstart" : "mousedown",
        touchStopEvent = supportTouch ? "touchend" : "mouseup",
        touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
    // also handles swipeleft, swiperight
    $.event.special.swipe = {
        scrollSupressionThreshold: 10, // More than this horizontal displacement, and we will suppress scrolling.

        durationThreshold: 1000, // More time than this, and it isn't a swipe.

        horizontalDistanceThreshold: 30, // Swipe horizontal displacement must be more than this.

        verticalDistanceThreshold: 75, // Swipe vertical displacement must be less than this.

        setup: function() {
            var thisObject = this,
                $this = $(thisObject);

            $this.bind(touchStartEvent, function(event) {
                var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event,
                    start = {
                        time: (new Date()).getTime(),
                        coords: [data.pageX, data.pageY],
                        origin: $(event.target)
                    },
                    stop;

                function moveHandler(event) {

                    if (!start) {
                        return;
                    }

                    var data = event.originalEvent.touches ? event.originalEvent.touches[0] : event;

                    stop = {
                        time: (new Date()).getTime(),
                        coords: [data.pageX, data.pageY]
                    };

                    // prevent scrolling
                    if (Math.abs(start.coords[0] - stop.coords[0]) > $.event.special.swipe.scrollSupressionThreshold) {
                        event.preventDefault();
                    }
                }

                $this.bind(touchMoveEvent, moveHandler).one(touchStopEvent, function(event) {
                    $this.unbind(touchMoveEvent, moveHandler);

                    if (start && stop) {
                        if (stop.time - start.time < $.event.special.swipe.durationThreshold && Math.abs(start.coords[0] - stop.coords[0]) > $.event.special.swipe.horizontalDistanceThreshold && Math.abs(start.coords[1] - stop.coords[1]) < $.event.special.swipe.verticalDistanceThreshold) {

                            start.origin.trigger("swipe").trigger(start.coords[0] > stop.coords[0] ? "swipeleft" : "swiperight");
                        }
                    }
                    start = stop = undefined;
                });
            });
        }
    };


    $.each({
        swipeleft: "swipe",
        swiperight: "swipe"
    }, function(event, sourceEvent) {

        $.event.special[event] = {
            setup: function() {
                $(this).bind(sourceEvent, $.noop);
            }
        };
    });

})(jQuery, this);