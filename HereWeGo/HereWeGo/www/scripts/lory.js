(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();
    else if (typeof define === 'function' && define.amd)
        define([], factory);
    else {
        var a = factory();
        for (var i in a)
            (typeof exports === 'object' ? exports : root)[i] = a[i];
    }
})(this, function () {
    return (function (modules) {
        var installedModules = {};
        function __webpack_require__(moduleId) {
            if (installedModules[moduleId])
                return installedModules[moduleId].exports;
            var module = installedModules[moduleId] = {
                exports: {},
                id: moduleId,
                loaded: false
            };
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.loaded = true;
            return module.exports;
        }
        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.p = "";
        return __webpack_require__(0);
    })([
        function (module, exports, __webpack_require__) {
            module.exports = __webpack_require__(1);
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            } return target; };
            exports.lory = lory;
            var _detectPrefixes = __webpack_require__(2);
            var _detectPrefixes2 = _interopRequireDefault(_detectPrefixes);
            var _dispatchEvent = __webpack_require__(3);
            var _dispatchEvent2 = _interopRequireDefault(_dispatchEvent);
            var _defaults = __webpack_require__(5);
            var _defaults2 = _interopRequireDefault(_defaults);
            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
            var slice = Array.prototype.slice;
            function lory(slider, opts) {
                var position = void 0;
                var slidesWidth = void 0;
                var frameWidth = void 0;
                var slides = void 0;
                var frame = void 0;
                var slideContainer = void 0;
                var prevCtrl = void 0;
                var nextCtrl = void 0;
                var prefixes = void 0;
                var transitionEndCallback = void 0;
                var indicators = new Array();
                var index = 0;
                var options = {};
                if (typeof jQuery !== 'undefined' && slider instanceof jQuery) {
                    slider = slider[0];
                }
                function setActiveElement(slides, currentIndex) {
                    slides.forEach(function (element, index) {
                        if (element.classList.contains(options.classNameActiveSlide)) {
                            element.classList.remove(options.classNameActiveSlide);
                        }
                    });
                    slides[currentIndex].classList.add(options.classNameActiveSlide);
                }
                function dispatchSliderEvent(phase, type, detail) {
                    (0, _dispatchEvent2.default)(slider, phase + '.lory.' + type, detail);
                }
                function translate(to, duration, ease) {
                    var style = slideContainer && slideContainer.style;
                    if (style) {
                        style[prefixes.transition + 'TimingFunction'] = ease;
                        style[prefixes.transition + 'Duration'] = duration + 'ms';
                        indicators.forEach(function (obj) {
                            obj.element.style[prefixes.transition + 'TimingFunction'] = ease;
                            obj.element.style[prefixes.transition + 'Duration'] = duration + 'ms';
                        });
                        if (prefixes.hasTranslate3d) {
                            style[prefixes.transform] = 'translate3d(' + to + 'px, 0, 0)';
                            indicators.forEach(function (obj) {
                                var translateNum;
                                if (obj.reverse) {
                                    if (obj.maxSlide && to < -frameWidth * obj.maxSlide)
                                        translateNum = 0;
                                    else if (obj.maxSlide)
                                        translateNum = (frameWidth * obj.maxSlide - to) * obj.speedRatio;
                                    else
                                        translateNum = (to + frameWidth * (slides.length - 1)) * obj.speedRatio;
                                }
                                else {
                                    if (obj.maxSlide && to < -frameWidth * obj.maxSlide)
                                        translateNum = -frameWidth * obj.maxSlide * obj.speedRatio;
                                    else
                                        translateNum = to * obj.speedRatio;
                                }
                                if (obj.style)
                                    obj.element.style[obj.style] = translateNum;
                                else if (obj.axis === 'x')
                                    obj.element.style[prefixes.transform] = 'translate3d(' + translateNum + 'px, 0, 0)';
                                else
                                    obj.element.style[prefixes.transform] = 'translate3d(0,' + translateNum + 'px,0)';
                            });
                        }
                        else {
                            style[prefixes.transform] = 'translate(' + to + 'px, 0)';
                            indicators.forEach(function (obj) {
                                var translateNum;
                                if (obj.reverse) {
                                    if (obj.maxSlide && to < -frameWidth * obj.maxSlide)
                                        translateNum = 0;
                                    else if (obj.maxSlide)
                                        translateNum = (frameWidth * obj.maxSlide - to) * obj.speedRatio;
                                    else
                                        translateNum = (to + frameWidth * (slides.length - 1)) * obj.speedRatio;
                                }
                                else {
                                    if (obj.maxSlide && to < -frameWidth * obj.maxSlide)
                                        translateNum = -frameWidth * obj.maxSlide * obj.speedRatio;
                                    else
                                        translateNum = to * obj.speedRatio;
                                }
                                if (obj.style)
                                    obj.element.style[obj.style] = translateNum;
                                else if (obj.axis === 'x')
                                    obj.element.style[prefixes.transform] = 'translate(' + translateNum + 'px, 0)';
                                else
                                    obj.element.style[prefixes.transform] = 'translate(0,' + translateNum + 'px)';
                            });
                        }
                    }
                }
                function slide(nextIndex, direction) {
                    var _options3 = options;
                    var slideSpeed = _options3.slideSpeed;
                    var slidesToScroll = _options3.slidesToScroll;
                    var infinite = _options3.infinite;
                    var rewind = _options3.rewind;
                    var rewindSpeed = _options3.rewindSpeed;
                    var ease = _options3.ease;
                    var classNameActiveSlide = _options3.classNameActiveSlide;
                    var duration = slideSpeed;
                    var nextSlide = direction ? index + 1 : index - 1;
                    var maxOffset = Math.round(slidesWidth - frameWidth);
                    dispatchSliderEvent('before', 'slide', {
                        index: index,
                        nextSlide: nextSlide
                    });
                    if (typeof nextIndex !== 'number') {
                        if (direction) {
                            nextIndex = index + slidesToScroll;
                        }
                        else {
                            nextIndex = index - slidesToScroll;
                        }
                    }
                    nextIndex = Math.min(Math.max(nextIndex, 0), slides.length - 1);
                    if (infinite && direction === undefined) {
                        nextIndex += infinite;
                    }
                    var nextOffset = Math.min(Math.max(slides[nextIndex].offsetLeft * -1, maxOffset * -1), 0);
                    if (rewind && Math.abs(position.x) === maxOffset && direction) {
                        nextOffset = 0;
                        nextIndex = 0;
                        duration = rewindSpeed;
                    }
                    translate(nextOffset, duration, ease);
                    position.x = nextOffset;
                    if (slides[nextIndex].offsetLeft <= maxOffset) {
                        index = nextIndex;
                    }
                    if (classNameActiveSlide) {
                        setActiveElement(slice.call(slides), index);
                    }
                    if (options.noTouchIndex === index)
                        frame.style.pointerEvents = 'none';
                    else if (options.noTouchIndex != -1)
                        frame.style.pointerEvents = 'all';
                    dispatchSliderEvent('after', 'slide', {
                        currentSlide: index
                    });
                }
                function setup() {
                    dispatchSliderEvent('before', 'init');
                    prefixes = (0, _detectPrefixes2.default)();
                    options = _extends({}, _defaults2.default, opts);
                    var _options4 = options;
                    var classNameFrame = _options4.classNameFrame;
                    var classNameSlideContainer = _options4.classNameSlideContainer;
                    var classNamePrevCtrl = _options4.classNamePrevCtrl;
                    var classNameNextCtrl = _options4.classNameNextCtrl;
                    var enableMouseEvents = _options4.enableMouseEvents;
                    var classNameActiveSlide = _options4.classNameActiveSlide;
                    frame = slider.getElementsByClassName(classNameFrame)[0];
                    slideContainer = frame.getElementsByClassName(classNameSlideContainer)[0];
                    prevCtrl = slider.getElementsByClassName(classNamePrevCtrl)[0];
                    nextCtrl = slider.getElementsByClassName(classNameNextCtrl)[0];
                    indicators = _options4.indicators;
                    position = {
                        x: slideContainer.offsetLeft,
                        y: slideContainer.offsetTop
                    };
                    var _slides;
                    if (_options4.classNameSlide === '' && _options4.searchDepth > 0) {
                        var searchChildren = function (element, depth) {
                            depth--;
                            var _list = [];
                            for (var o = 0, len2 = element.children.length; o < len2; o++) {
                                if (depth >= 0) {
                                    Array.prototype.splice.apply(_list, [_list.length, 0].concat(searchChildren(element.children[o], depth)));
                                }
                                else
                                    _list.push(element.children[o]);
                            }
                            return _list;
                        };
                        _slides = searchChildren(slideContainer, _options4.searchDepth);
                    }
                    else if (_options4.classNameSlide !== '') {
                        var searchChildren = function (element, depth) {
                            depth--;
                            var _list = [];
                            for (var o = 0, len2 = element.children.length; o < len2; o++) {
                                if (element.children[o].classList.contains(_options4.classNameSlide))
                                    _list.push(element.children[o]);
                                else if (depth >= 0) {
                                    Array.prototype.splice.apply(_list, [_list.length, 0].concat(searchChildren(element.children[o], depth)));
                                }
                            }
                            return _list;
                        };
                        _slides = searchChildren(slideContainer, _options4.searchDepth);
                    }
                    else
                        _slides = slice.call(slideContainer.children);
                    slides = slice.call(_slides);
                    reset();
                    slide(options.defaultIndex);
                    if (prevCtrl && nextCtrl) {
                        prevCtrl.addEventListener('click', prev);
                        nextCtrl.addEventListener('click', next);
                    }
                    frame.addEventListener('touchstart', onTouchstart);
                    if (enableMouseEvents) {
                        frame.addEventListener('mousedown', onTouchstart);
                        frame.addEventListener('click', onClick);
                    }
                    options.window.addEventListener('resize', onResize);
                    dispatchSliderEvent('after', 'init');
                }
                function reset() {
                    var _options5 = options;
                    var infinite = _options5.infinite;
                    var ease = _options5.ease;
                    var rewindSpeed = _options5.rewindSpeed;
                    var rewindOnResize = _options5.rewindOnResize;
                    var classNameActiveSlide = _options5.classNameActiveSlide;
                    slidesWidth = slideContainer.getBoundingClientRect().width || slideContainer.offsetWidth;
                    frameWidth = frame.getBoundingClientRect().width || frame.offsetWidth;
                    if (frameWidth === slidesWidth) {
                        slidesWidth = slides.reduce(function (previousValue, slide) {
                            return previousValue + slide.getBoundingClientRect().width || slide.offsetWidth;
                        }, 0);
                    }
                    if (rewindOnResize) {
                        index = _options5.defaultIndex;
                    }
                    else {
                        ease = null;
                        rewindSpeed = 0;
                    }
                    translate(slides[index].offsetLeft * -1, rewindSpeed, ease);
                    position.x = slides[index].offsetLeft * -1;
                    if (classNameActiveSlide) {
                        setActiveElement(slice.call(slides), index);
                    }
                }
                function slideTo(index) {
                    slide(index);
                }
                function returnIndex() {
                    return index - options.infinite || 0;
                }
                function prev() {
                    slide(false, false);
                }
                function next() {
                    slide(false, true);
                }
                function destroy() {
                    dispatchSliderEvent('before', 'destroy');
                    frame.removeEventListener(prefixes.transitionEnd, onTransitionEnd);
                    frame.removeEventListener('touchstart', onTouchstart);
                    frame.removeEventListener('touchmove', onTouchmove);
                    frame.removeEventListener('touchend', onTouchend);
                    frame.removeEventListener('mousemove', onTouchmove);
                    frame.removeEventListener('mousedown', onTouchstart);
                    frame.removeEventListener('mouseup', onTouchend);
                    frame.removeEventListener('mouseleave', onTouchend);
                    frame.removeEventListener('click', onClick);
                    options.window.removeEventListener('resize', onResize);
                    if (prevCtrl) {
                        prevCtrl.removeEventListener('click', prev);
                    }
                    if (nextCtrl) {
                        nextCtrl.removeEventListener('click', next);
                    }
                    dispatchSliderEvent('after', 'destroy');
                }
                var touchOffset = void 0;
                var delta = void 0;
                var isScrolling = void 0;
                function onTransitionEnd() {
                    if (transitionEndCallback) {
                        transitionEndCallback();
                        transitionEndCallback = undefined;
                    }
                }
                function onTouchstart(event) {
                    var _options6 = options;
                    var enableMouseEvents = _options6.enableMouseEvents;
                    var touches = event.touches ? event.touches[0] : event;
                    if (enableMouseEvents) {
                        frame.addEventListener('mousemove', onTouchmove);
                        frame.addEventListener('mouseup', onTouchend);
                        frame.addEventListener('mouseleave', onTouchend);
                    }
                    frame.addEventListener('touchmove', onTouchmove);
                    frame.addEventListener('touchend', onTouchend);
                    var pageX = touches.pageX;
                    var pageY = touches.pageY;
                    touchOffset = {
                        x: pageX,
                        y: pageY,
                        time: Date.now()
                    };
                    isScrolling = undefined;
                    delta = {};
                    dispatchSliderEvent('on', 'touchstart', {
                        event: event
                    });
                }
                function onTouchmove(event) {
                    var touches = event.touches ? event.touches[0] : event;
                    var pageX = touches.pageX;
                    var pageY = touches.pageY;
                    delta = {
                        x: pageX - touchOffset.x,
                        y: pageY - touchOffset.y
                    };
                    if (typeof isScrolling === 'undefined') {
                        isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
                    }
                    if (!isScrolling && touchOffset) {
                        event.preventDefault();
                        if (options.overflowScroll || !(!index && delta.x > 0 || index === slides.length - 1 && delta.x < 0))
                            translate(position.x + delta.x, 0, null);
                    }
                    dispatchSliderEvent('on', 'touchmove', {
                        event: event
                    });
                }
                function onTouchend(event) {
                    var duration = touchOffset ? Date.now() - touchOffset.time : undefined;
                    var isValid = Number(duration) < 300 && Math.abs(delta.x) > 25 || Math.abs(delta.x) > frameWidth / 3;
                    var isOutOfBounds = !index && delta.x > 0 || index === slides.length - 1 && delta.x < 0;
                    var direction = delta.x < 0;
                    if (!isScrolling) {
                        if (isValid && !isOutOfBounds) {
                            slide(false, direction);
                        }
                        else {
                            translate(position.x, options.snapBackSpeed);
                        }
                    }
                    touchOffset = undefined;
                    frame.removeEventListener('touchmove', onTouchmove);
                    frame.removeEventListener('touchend', onTouchend);
                    frame.removeEventListener('mousemove', onTouchmove);
                    frame.removeEventListener('mouseup', onTouchend);
                    frame.removeEventListener('mouseleave', onTouchend);
                    dispatchSliderEvent('on', 'touchend', {
                        event: event
                    });
                }
                function onClick(event) {
                    if (delta.x) {
                        event.preventDefault();
                    }
                }
                function onResize(event) {
                    reset();
                    dispatchSliderEvent('on', 'resize', {
                        event: event
                    });
                }
                setup();
                return {
                    setup: setup,
                    reset: reset,
                    slideTo: slideTo,
                    returnIndex: returnIndex,
                    prev: prev,
                    next: next,
                    destroy: destroy
                };
            }
        },
        function (module, exports) {
            (function (global) {
                'use strict';
                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.default = detectPrefixes;
                function detectPrefixes() {
                    var transform = void 0;
                    var transition = void 0;
                    var transitionEnd = void 0;
                    var hasTranslate3d = void 0;
                    (function () {
                        var el = document.createElement('_');
                        var style = el.style;
                        var prop = void 0;
                        if (style[prop = 'webkitTransition'] === '') {
                            transitionEnd = 'webkitTransitionEnd';
                            transition = prop;
                        }
                        if (style[prop = 'transition'] === '') {
                            transitionEnd = 'transitionend';
                            transition = prop;
                        }
                        if (style[prop = 'webkitTransform'] === '') {
                            transform = prop;
                        }
                        if (style[prop = 'msTransform'] === '') {
                            transform = prop;
                        }
                        if (style[prop = 'transform'] === '') {
                            transform = prop;
                        }
                        document.body.insertBefore(el, null);
                        style[transform] = 'translate3d(0, 0, 0)';
                        hasTranslate3d = !!global.getComputedStyle(el).getPropertyValue(transform);
                        document.body.removeChild(el);
                    })();
                    return {
                        transform: transform,
                        transition: transition,
                        transitionEnd: transitionEnd,
                        hasTranslate3d: hasTranslate3d
                    };
                }
            }.call(exports, (function () { return this; }())));
        },
        function (module, exports, __webpack_require__) {
            'use strict';
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.default = dispatchEvent;
            var _customEvent = __webpack_require__(4);
            var _customEvent2 = _interopRequireDefault(_customEvent);
            function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
            function dispatchEvent(target, type, detail) {
                var event = new _customEvent2.default(type, {
                    bubbles: true,
                    cancelable: true,
                    detail: detail
                });
                target.dispatchEvent(event);
            }
        },
        function (module, exports) {
            (function (global) {
                var NativeCustomEvent = global.CustomEvent;
                function useNative() {
                    try {
                        var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
                        return 'cat' === p.type && 'bar' === p.detail.foo;
                    }
                    catch (e) {
                    }
                    return false;
                }
                module.exports = useNative() ? NativeCustomEvent :
                    'function' === typeof document.createEvent ? function CustomEvent(type, params) {
                        var e = document.createEvent('CustomEvent');
                        if (params) {
                            e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
                        }
                        else {
                            e.initCustomEvent(type, false, false, void 0);
                        }
                        return e;
                    } :
                        function CustomEvent(type, params) {
                            var e = document.createEventObject();
                            e.type = type;
                            if (params) {
                                e.bubbles = Boolean(params.bubbles);
                                e.cancelable = Boolean(params.cancelable);
                                e.detail = params.detail;
                            }
                            else {
                                e.bubbles = false;
                                e.cancelable = false;
                                e.detail = void 0;
                            }
                            return e;
                        };
            }.call(exports, (function () { return this; }())));
        },
        function (module, exports) {
            'use strict';
            Object.defineProperty(exports, "__esModule", {
                value: true
            });
            exports.default = {
                slidesToScroll: 1,
                slideSpeed: 300,
                rewindSpeed: 600,
                snapBackSpeed: 200,
                ease: 'ease',
                rewind: false,
                classNameFrame: 'js_frame',
                classNameSlideContainer: 'js_slides',
                classNamePrevCtrl: 'js_prev',
                classNameNextCtrl: 'js_next',
                classNameActiveSlide: 'active',
                enableMouseEvents: false,
                window: window,
                rewindOnResize: true,
                indicators: [],
                classNameSlide: '',
                searchDepth: 0,
                overflowScroll: true,
                noTouchIndex: -1,
                defaultIndex: 0,
            };
        }
    ]);
});
;
//# sourceMappingURL=lory.js.map