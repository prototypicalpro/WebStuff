(function e(t, n, r) { function s(o, u) { if (!n[o]) {
    if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a)
            return a(o, !0);
        if (i)
            return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
    }
    var l = n[o] = { exports: {} };
    t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e); }, l, l.exports, e, t, n, r);
} return n[o].exports; } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++)
    s(r[o]); return s; })({ 1: [function (require, module, exports) {
            (function (process) {
                (function (definition) {
                    "use strict";
                    if (typeof bootstrap === "function") {
                        bootstrap("promise", definition);
                    }
                    else if (typeof exports === "object" && typeof module === "object") {
                        module.exports = definition();
                    }
                    else if (typeof define === "function" && define.amd) {
                        define(definition);
                    }
                    else if (typeof ses !== "undefined") {
                        if (!ses.ok()) {
                            return;
                        }
                        else {
                            ses.makeQ = definition;
                        }
                    }
                    else if (typeof window !== "undefined" || typeof self !== "undefined") {
                        var global = typeof window !== "undefined" ? window : self;
                        var previousQ = global.Q;
                        global.Q = definition();
                        global.Q.noConflict = function () {
                            global.Q = previousQ;
                            return this;
                        };
                    }
                    else {
                        throw new Error("This environment was not anticipated by Q. Please file a bug.");
                    }
                })(function () {
                    "use strict";
                    var hasStacks = false;
                    try {
                        throw new Error();
                    }
                    catch (e) {
                        hasStacks = !!e.stack;
                    }
                    var qStartingLine = captureLine();
                    var qFileName;
                    var noop = function () { };
                    var nextTick = (function () {
                        var head = { task: void 0, next: null };
                        var tail = head;
                        var flushing = false;
                        var requestTick = void 0;
                        var isNodeJS = false;
                        var laterQueue = [];
                        function flush() {
                            var task, domain;
                            while (head.next) {
                                head = head.next;
                                task = head.task;
                                head.task = void 0;
                                domain = head.domain;
                                if (domain) {
                                    head.domain = void 0;
                                    domain.enter();
                                }
                                runSingle(task, domain);
                            }
                            while (laterQueue.length) {
                                task = laterQueue.pop();
                                runSingle(task);
                            }
                            flushing = false;
                        }
                        function runSingle(task, domain) {
                            try {
                                task();
                            }
                            catch (e) {
                                if (isNodeJS) {
                                    if (domain) {
                                        domain.exit();
                                    }
                                    setTimeout(flush, 0);
                                    if (domain) {
                                        domain.enter();
                                    }
                                    throw e;
                                }
                                else {
                                    setTimeout(function () {
                                        throw e;
                                    }, 0);
                                }
                            }
                            if (domain) {
                                domain.exit();
                            }
                        }
                        nextTick = function (task) {
                            tail = tail.next = {
                                task: task,
                                domain: isNodeJS && process.domain,
                                next: null
                            };
                            if (!flushing) {
                                flushing = true;
                                requestTick();
                            }
                        };
                        if (typeof process === "object" &&
                            process.toString() === "[object process]" && process.nextTick) {
                            isNodeJS = true;
                            requestTick = function () {
                                process.nextTick(flush);
                            };
                        }
                        else if (typeof setImmediate === "function") {
                            if (typeof window !== "undefined") {
                                requestTick = setImmediate.bind(window, flush);
                            }
                            else {
                                requestTick = function () {
                                    setImmediate(flush);
                                };
                            }
                        }
                        else if (typeof MessageChannel !== "undefined") {
                            var channel = new MessageChannel();
                            channel.port1.onmessage = function () {
                                requestTick = requestPortTick;
                                channel.port1.onmessage = flush;
                                flush();
                            };
                            var requestPortTick = function () {
                                channel.port2.postMessage(0);
                            };
                            requestTick = function () {
                                setTimeout(flush, 0);
                                requestPortTick();
                            };
                        }
                        else {
                            requestTick = function () {
                                setTimeout(flush, 0);
                            };
                        }
                        nextTick.runAfter = function (task) {
                            laterQueue.push(task);
                            if (!flushing) {
                                flushing = true;
                                requestTick();
                            }
                        };
                        return nextTick;
                    })();
                    var call = Function.call;
                    function uncurryThis(f) {
                        return function () {
                            return call.apply(f, arguments);
                        };
                    }
                    var array_slice = uncurryThis(Array.prototype.slice);
                    var array_reduce = uncurryThis(Array.prototype.reduce || function (callback, basis) {
                        var index = 0, length = this.length;
                        if (arguments.length === 1) {
                            do {
                                if (index in this) {
                                    basis = this[index++];
                                    break;
                                }
                                if (++index >= length) {
                                    throw new TypeError();
                                }
                            } while (1);
                        }
                        for (; index < length; index++) {
                            if (index in this) {
                                basis = callback(basis, this[index], index);
                            }
                        }
                        return basis;
                    });
                    var array_indexOf = uncurryThis(Array.prototype.indexOf || function (value) {
                        for (var i = 0; i < this.length; i++) {
                            if (this[i] === value) {
                                return i;
                            }
                        }
                        return -1;
                    });
                    var array_map = uncurryThis(Array.prototype.map || function (callback, thisp) {
                        var self = this;
                        var collect = [];
                        array_reduce(self, function (undefined, value, index) {
                            collect.push(callback.call(thisp, value, index, self));
                        }, void 0);
                        return collect;
                    });
                    var object_create = Object.create || function (prototype) {
                        function Type() { }
                        Type.prototype = prototype;
                        return new Type();
                    };
                    var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
                    var object_keys = Object.keys || function (object) {
                        var keys = [];
                        for (var key in object) {
                            if (object_hasOwnProperty(object, key)) {
                                keys.push(key);
                            }
                        }
                        return keys;
                    };
                    var object_toString = uncurryThis(Object.prototype.toString);
                    function isObject(value) {
                        return value === Object(value);
                    }
                    function isStopIteration(exception) {
                        return (object_toString(exception) === "[object StopIteration]" ||
                            exception instanceof QReturnValue);
                    }
                    var QReturnValue;
                    if (typeof ReturnValue !== "undefined") {
                        QReturnValue = ReturnValue;
                    }
                    else {
                        QReturnValue = function (value) {
                            this.value = value;
                        };
                    }
                    var STACK_JUMP_SEPARATOR = "From previous event:";
                    function makeStackTraceLong(error, promise) {
                        if (hasStacks &&
                            promise.stack &&
                            typeof error === "object" &&
                            error !== null &&
                            error.stack &&
                            error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1) {
                            var stacks = [];
                            for (var p = promise; !!p; p = p.source) {
                                if (p.stack) {
                                    stacks.unshift(p.stack);
                                }
                            }
                            stacks.unshift(error.stack);
                            var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
                            error.stack = filterStackString(concatedStacks);
                        }
                    }
                    function filterStackString(stackString) {
                        var lines = stackString.split("\n");
                        var desiredLines = [];
                        for (var i = 0; i < lines.length; ++i) {
                            var line = lines[i];
                            if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
                                desiredLines.push(line);
                            }
                        }
                        return desiredLines.join("\n");
                    }
                    function isNodeFrame(stackLine) {
                        return stackLine.indexOf("(module.js:") !== -1 ||
                            stackLine.indexOf("(node.js:") !== -1;
                    }
                    function getFileNameAndLineNumber(stackLine) {
                        var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
                        if (attempt1) {
                            return [attempt1[1], Number(attempt1[2])];
                        }
                        var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
                        if (attempt2) {
                            return [attempt2[1], Number(attempt2[2])];
                        }
                        var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
                        if (attempt3) {
                            return [attempt3[1], Number(attempt3[2])];
                        }
                    }
                    function isInternalFrame(stackLine) {
                        var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
                        if (!fileNameAndLineNumber) {
                            return false;
                        }
                        var fileName = fileNameAndLineNumber[0];
                        var lineNumber = fileNameAndLineNumber[1];
                        return fileName === qFileName &&
                            lineNumber >= qStartingLine &&
                            lineNumber <= qEndingLine;
                    }
                    function captureLine() {
                        if (!hasStacks) {
                            return;
                        }
                        try {
                            throw new Error();
                        }
                        catch (e) {
                            var lines = e.stack.split("\n");
                            var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
                            var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
                            if (!fileNameAndLineNumber) {
                                return;
                            }
                            qFileName = fileNameAndLineNumber[0];
                            return fileNameAndLineNumber[1];
                        }
                    }
                    function deprecate(callback, name, alternative) {
                        return function () {
                            if (typeof console !== "undefined" &&
                                typeof console.warn === "function") {
                                console.warn(name + " is deprecated, use " + alternative +
                                    " instead.", new Error("").stack);
                            }
                            return callback.apply(callback, arguments);
                        };
                    }
                    function Q(value) {
                        if (value instanceof Promise) {
                            return value;
                        }
                        if (isPromiseAlike(value)) {
                            return coerce(value);
                        }
                        else {
                            return fulfill(value);
                        }
                    }
                    Q.resolve = Q;
                    Q.nextTick = nextTick;
                    Q.longStackSupport = false;
                    if (typeof process === "object" && process && process.env && process.env.Q_DEBUG) {
                        Q.longStackSupport = true;
                    }
                    Q.defer = defer;
                    function defer() {
                        var messages = [], progressListeners = [], resolvedPromise;
                        var deferred = object_create(defer.prototype);
                        var promise = object_create(Promise.prototype);
                        promise.promiseDispatch = function (resolve, op, operands) {
                            var args = array_slice(arguments);
                            if (messages) {
                                messages.push(args);
                                if (op === "when" && operands[1]) {
                                    progressListeners.push(operands[1]);
                                }
                            }
                            else {
                                Q.nextTick(function () {
                                    resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
                                });
                            }
                        };
                        promise.valueOf = function () {
                            if (messages) {
                                return promise;
                            }
                            var nearerValue = nearer(resolvedPromise);
                            if (isPromise(nearerValue)) {
                                resolvedPromise = nearerValue;
                            }
                            return nearerValue;
                        };
                        promise.inspect = function () {
                            if (!resolvedPromise) {
                                return { state: "pending" };
                            }
                            return resolvedPromise.inspect();
                        };
                        if (Q.longStackSupport && hasStacks) {
                            try {
                                throw new Error();
                            }
                            catch (e) {
                                promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
                            }
                        }
                        function become(newPromise) {
                            resolvedPromise = newPromise;
                            promise.source = newPromise;
                            array_reduce(messages, function (undefined, message) {
                                Q.nextTick(function () {
                                    newPromise.promiseDispatch.apply(newPromise, message);
                                });
                            }, void 0);
                            messages = void 0;
                            progressListeners = void 0;
                        }
                        deferred.promise = promise;
                        deferred.resolve = function (value) {
                            if (resolvedPromise) {
                                return;
                            }
                            become(Q(value));
                        };
                        deferred.fulfill = function (value) {
                            if (resolvedPromise) {
                                return;
                            }
                            become(fulfill(value));
                        };
                        deferred.reject = function (reason) {
                            if (resolvedPromise) {
                                return;
                            }
                            become(reject(reason));
                        };
                        deferred.notify = function (progress) {
                            if (resolvedPromise) {
                                return;
                            }
                            array_reduce(progressListeners, function (undefined, progressListener) {
                                Q.nextTick(function () {
                                    progressListener(progress);
                                });
                            }, void 0);
                        };
                        return deferred;
                    }
                    defer.prototype.makeNodeResolver = function () {
                        var self = this;
                        return function (error, value) {
                            if (error) {
                                self.reject(error);
                            }
                            else if (arguments.length > 2) {
                                self.resolve(array_slice(arguments, 1));
                            }
                            else {
                                self.resolve(value);
                            }
                        };
                    };
                    Q.Promise = promise;
                    Q.promise = promise;
                    function promise(resolver) {
                        if (typeof resolver !== "function") {
                            throw new TypeError("resolver must be a function.");
                        }
                        var deferred = defer();
                        try {
                            resolver(deferred.resolve, deferred.reject, deferred.notify);
                        }
                        catch (reason) {
                            deferred.reject(reason);
                        }
                        return deferred.promise;
                    }
                    promise.race = race;
                    promise.all = all;
                    promise.reject = reject;
                    promise.resolve = Q;
                    Q.passByCopy = function (object) {
                        return object;
                    };
                    Promise.prototype.passByCopy = function () {
                        return this;
                    };
                    Q.join = function (x, y) {
                        return Q(x).join(y);
                    };
                    Promise.prototype.join = function (that) {
                        return Q([this, that]).spread(function (x, y) {
                            if (x === y) {
                                return x;
                            }
                            else {
                                throw new Error("Can't join: not the same: " + x + " " + y);
                            }
                        });
                    };
                    Q.race = race;
                    function race(answerPs) {
                        return promise(function (resolve, reject) {
                            for (var i = 0, len = answerPs.length; i < len; i++) {
                                Q(answerPs[i]).then(resolve, reject);
                            }
                        });
                    }
                    Promise.prototype.race = function () {
                        return this.then(Q.race);
                    };
                    Q.makePromise = Promise;
                    function Promise(descriptor, fallback, inspect) {
                        if (fallback === void 0) {
                            fallback = function (op) {
                                return reject(new Error("Promise does not support operation: " + op));
                            };
                        }
                        if (inspect === void 0) {
                            inspect = function () {
                                return { state: "unknown" };
                            };
                        }
                        var promise = object_create(Promise.prototype);
                        promise.promiseDispatch = function (resolve, op, args) {
                            var result;
                            try {
                                if (descriptor[op]) {
                                    result = descriptor[op].apply(promise, args);
                                }
                                else {
                                    result = fallback.call(promise, op, args);
                                }
                            }
                            catch (exception) {
                                result = reject(exception);
                            }
                            if (resolve) {
                                resolve(result);
                            }
                        };
                        promise.inspect = inspect;
                        if (inspect) {
                            var inspected = inspect();
                            if (inspected.state === "rejected") {
                                promise.exception = inspected.reason;
                            }
                            promise.valueOf = function () {
                                var inspected = inspect();
                                if (inspected.state === "pending" ||
                                    inspected.state === "rejected") {
                                    return promise;
                                }
                                return inspected.value;
                            };
                        }
                        return promise;
                    }
                    Promise.prototype.toString = function () {
                        return "[object Promise]";
                    };
                    Promise.prototype.then = function (fulfilled, rejected, progressed) {
                        var self = this;
                        var deferred = defer();
                        var done = false;
                        function _fulfilled(value) {
                            try {
                                return typeof fulfilled === "function" ? fulfilled(value) : value;
                            }
                            catch (exception) {
                                return reject(exception);
                            }
                        }
                        function _rejected(exception) {
                            if (typeof rejected === "function") {
                                makeStackTraceLong(exception, self);
                                try {
                                    return rejected(exception);
                                }
                                catch (newException) {
                                    return reject(newException);
                                }
                            }
                            return reject(exception);
                        }
                        function _progressed(value) {
                            return typeof progressed === "function" ? progressed(value) : value;
                        }
                        Q.nextTick(function () {
                            self.promiseDispatch(function (value) {
                                if (done) {
                                    return;
                                }
                                done = true;
                                deferred.resolve(_fulfilled(value));
                            }, "when", [function (exception) {
                                    if (done) {
                                        return;
                                    }
                                    done = true;
                                    deferred.resolve(_rejected(exception));
                                }]);
                        });
                        self.promiseDispatch(void 0, "when", [void 0, function (value) {
                                var newValue;
                                var threw = false;
                                try {
                                    newValue = _progressed(value);
                                }
                                catch (e) {
                                    threw = true;
                                    if (Q.onerror) {
                                        Q.onerror(e);
                                    }
                                    else {
                                        throw e;
                                    }
                                }
                                if (!threw) {
                                    deferred.notify(newValue);
                                }
                            }]);
                        return deferred.promise;
                    };
                    Q.tap = function (promise, callback) {
                        return Q(promise).tap(callback);
                    };
                    Promise.prototype.tap = function (callback) {
                        callback = Q(callback);
                        return this.then(function (value) {
                            return callback.fcall(value).thenResolve(value);
                        });
                    };
                    Q.when = when;
                    function when(value, fulfilled, rejected, progressed) {
                        return Q(value).then(fulfilled, rejected, progressed);
                    }
                    Promise.prototype.thenResolve = function (value) {
                        return this.then(function () { return value; });
                    };
                    Q.thenResolve = function (promise, value) {
                        return Q(promise).thenResolve(value);
                    };
                    Promise.prototype.thenReject = function (reason) {
                        return this.then(function () { throw reason; });
                    };
                    Q.thenReject = function (promise, reason) {
                        return Q(promise).thenReject(reason);
                    };
                    Q.nearer = nearer;
                    function nearer(value) {
                        if (isPromise(value)) {
                            var inspected = value.inspect();
                            if (inspected.state === "fulfilled") {
                                return inspected.value;
                            }
                        }
                        return value;
                    }
                    Q.isPromise = isPromise;
                    function isPromise(object) {
                        return object instanceof Promise;
                    }
                    Q.isPromiseAlike = isPromiseAlike;
                    function isPromiseAlike(object) {
                        return isObject(object) && typeof object.then === "function";
                    }
                    Q.isPending = isPending;
                    function isPending(object) {
                        return isPromise(object) && object.inspect().state === "pending";
                    }
                    Promise.prototype.isPending = function () {
                        return this.inspect().state === "pending";
                    };
                    Q.isFulfilled = isFulfilled;
                    function isFulfilled(object) {
                        return !isPromise(object) || object.inspect().state === "fulfilled";
                    }
                    Promise.prototype.isFulfilled = function () {
                        return this.inspect().state === "fulfilled";
                    };
                    Q.isRejected = isRejected;
                    function isRejected(object) {
                        return isPromise(object) && object.inspect().state === "rejected";
                    }
                    Promise.prototype.isRejected = function () {
                        return this.inspect().state === "rejected";
                    };
                    var unhandledReasons = [];
                    var unhandledRejections = [];
                    var reportedUnhandledRejections = [];
                    var trackUnhandledRejections = true;
                    function resetUnhandledRejections() {
                        unhandledReasons.length = 0;
                        unhandledRejections.length = 0;
                        if (!trackUnhandledRejections) {
                            trackUnhandledRejections = true;
                        }
                    }
                    function trackRejection(promise, reason) {
                        if (!trackUnhandledRejections) {
                            return;
                        }
                        if (typeof process === "object" && typeof process.emit === "function") {
                            Q.nextTick.runAfter(function () {
                                if (array_indexOf(unhandledRejections, promise) !== -1) {
                                    process.emit("unhandledRejection", reason, promise);
                                    reportedUnhandledRejections.push(promise);
                                }
                            });
                        }
                        unhandledRejections.push(promise);
                        if (reason && typeof reason.stack !== "undefined") {
                            unhandledReasons.push(reason.stack);
                        }
                        else {
                            unhandledReasons.push("(no stack) " + reason);
                        }
                    }
                    function untrackRejection(promise) {
                        if (!trackUnhandledRejections) {
                            return;
                        }
                        var at = array_indexOf(unhandledRejections, promise);
                        if (at !== -1) {
                            if (typeof process === "object" && typeof process.emit === "function") {
                                Q.nextTick.runAfter(function () {
                                    var atReport = array_indexOf(reportedUnhandledRejections, promise);
                                    if (atReport !== -1) {
                                        process.emit("rejectionHandled", unhandledReasons[at], promise);
                                        reportedUnhandledRejections.splice(atReport, 1);
                                    }
                                });
                            }
                            unhandledRejections.splice(at, 1);
                            unhandledReasons.splice(at, 1);
                        }
                    }
                    Q.resetUnhandledRejections = resetUnhandledRejections;
                    Q.getUnhandledReasons = function () {
                        return unhandledReasons.slice();
                    };
                    Q.stopUnhandledRejectionTracking = function () {
                        resetUnhandledRejections();
                        trackUnhandledRejections = false;
                    };
                    resetUnhandledRejections();
                    Q.reject = reject;
                    function reject(reason) {
                        var rejection = Promise({
                            "when": function (rejected) {
                                if (rejected) {
                                    untrackRejection(this);
                                }
                                return rejected ? rejected(reason) : this;
                            }
                        }, function fallback() {
                            return this;
                        }, function inspect() {
                            return { state: "rejected", reason: reason };
                        });
                        trackRejection(rejection, reason);
                        return rejection;
                    }
                    Q.fulfill = fulfill;
                    function fulfill(value) {
                        return Promise({
                            "when": function () {
                                return value;
                            },
                            "get": function (name) {
                                return value[name];
                            },
                            "set": function (name, rhs) {
                                value[name] = rhs;
                            },
                            "delete": function (name) {
                                delete value[name];
                            },
                            "post": function (name, args) {
                                if (name === null || name === void 0) {
                                    return value.apply(void 0, args);
                                }
                                else {
                                    return value[name].apply(value, args);
                                }
                            },
                            "apply": function (thisp, args) {
                                return value.apply(thisp, args);
                            },
                            "keys": function () {
                                return object_keys(value);
                            }
                        }, void 0, function inspect() {
                            return { state: "fulfilled", value: value };
                        });
                    }
                    function coerce(promise) {
                        var deferred = defer();
                        Q.nextTick(function () {
                            try {
                                promise.then(deferred.resolve, deferred.reject, deferred.notify);
                            }
                            catch (exception) {
                                deferred.reject(exception);
                            }
                        });
                        return deferred.promise;
                    }
                    Q.master = master;
                    function master(object) {
                        return Promise({
                            "isDef": function () { }
                        }, function fallback(op, args) {
                            return dispatch(object, op, args);
                        }, function () {
                            return Q(object).inspect();
                        });
                    }
                    Q.spread = spread;
                    function spread(value, fulfilled, rejected) {
                        return Q(value).spread(fulfilled, rejected);
                    }
                    Promise.prototype.spread = function (fulfilled, rejected) {
                        return this.all().then(function (array) {
                            return fulfilled.apply(void 0, array);
                        }, rejected);
                    };
                    Q.async = async;
                    function async(makeGenerator) {
                        return function () {
                            function continuer(verb, arg) {
                                var result;
                                if (typeof StopIteration === "undefined") {
                                    try {
                                        result = generator[verb](arg);
                                    }
                                    catch (exception) {
                                        return reject(exception);
                                    }
                                    if (result.done) {
                                        return Q(result.value);
                                    }
                                    else {
                                        return when(result.value, callback, errback);
                                    }
                                }
                                else {
                                    try {
                                        result = generator[verb](arg);
                                    }
                                    catch (exception) {
                                        if (isStopIteration(exception)) {
                                            return Q(exception.value);
                                        }
                                        else {
                                            return reject(exception);
                                        }
                                    }
                                    return when(result, callback, errback);
                                }
                            }
                            var generator = makeGenerator.apply(this, arguments);
                            var callback = continuer.bind(continuer, "next");
                            var errback = continuer.bind(continuer, "throw");
                            return callback();
                        };
                    }
                    Q.spawn = spawn;
                    function spawn(makeGenerator) {
                        Q.done(Q.async(makeGenerator)());
                    }
                    Q["return"] = _return;
                    function _return(value) {
                        throw new QReturnValue(value);
                    }
                    Q.promised = promised;
                    function promised(callback) {
                        return function () {
                            return spread([this, all(arguments)], function (self, args) {
                                return callback.apply(self, args);
                            });
                        };
                    }
                    Q.dispatch = dispatch;
                    function dispatch(object, op, args) {
                        return Q(object).dispatch(op, args);
                    }
                    Promise.prototype.dispatch = function (op, args) {
                        var self = this;
                        var deferred = defer();
                        Q.nextTick(function () {
                            self.promiseDispatch(deferred.resolve, op, args);
                        });
                        return deferred.promise;
                    };
                    Q.get = function (object, key) {
                        return Q(object).dispatch("get", [key]);
                    };
                    Promise.prototype.get = function (key) {
                        return this.dispatch("get", [key]);
                    };
                    Q.set = function (object, key, value) {
                        return Q(object).dispatch("set", [key, value]);
                    };
                    Promise.prototype.set = function (key, value) {
                        return this.dispatch("set", [key, value]);
                    };
                    Q.del =
                        Q["delete"] = function (object, key) {
                            return Q(object).dispatch("delete", [key]);
                        };
                    Promise.prototype.del =
                        Promise.prototype["delete"] = function (key) {
                            return this.dispatch("delete", [key]);
                        };
                    Q.mapply =
                        Q.post = function (object, name, args) {
                            return Q(object).dispatch("post", [name, args]);
                        };
                    Promise.prototype.mapply =
                        Promise.prototype.post = function (name, args) {
                            return this.dispatch("post", [name, args]);
                        };
                    Q.send =
                        Q.mcall =
                            Q.invoke = function (object, name) {
                                return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
                            };
                    Promise.prototype.send =
                        Promise.prototype.mcall =
                            Promise.prototype.invoke = function (name) {
                                return this.dispatch("post", [name, array_slice(arguments, 1)]);
                            };
                    Q.fapply = function (object, args) {
                        return Q(object).dispatch("apply", [void 0, args]);
                    };
                    Promise.prototype.fapply = function (args) {
                        return this.dispatch("apply", [void 0, args]);
                    };
                    Q["try"] =
                        Q.fcall = function (object) {
                            return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
                        };
                    Promise.prototype.fcall = function () {
                        return this.dispatch("apply", [void 0, array_slice(arguments)]);
                    };
                    Q.fbind = function (object) {
                        var promise = Q(object);
                        var args = array_slice(arguments, 1);
                        return function fbound() {
                            return promise.dispatch("apply", [
                                this,
                                args.concat(array_slice(arguments))
                            ]);
                        };
                    };
                    Promise.prototype.fbind = function () {
                        var promise = this;
                        var args = array_slice(arguments);
                        return function fbound() {
                            return promise.dispatch("apply", [
                                this,
                                args.concat(array_slice(arguments))
                            ]);
                        };
                    };
                    Q.keys = function (object) {
                        return Q(object).dispatch("keys", []);
                    };
                    Promise.prototype.keys = function () {
                        return this.dispatch("keys", []);
                    };
                    Q.all = all;
                    function all(promises) {
                        return when(promises, function (promises) {
                            var pendingCount = 0;
                            var deferred = defer();
                            array_reduce(promises, function (undefined, promise, index) {
                                var snapshot;
                                if (isPromise(promise) &&
                                    (snapshot = promise.inspect()).state === "fulfilled") {
                                    promises[index] = snapshot.value;
                                }
                                else {
                                    ++pendingCount;
                                    when(promise, function (value) {
                                        promises[index] = value;
                                        if (--pendingCount === 0) {
                                            deferred.resolve(promises);
                                        }
                                    }, deferred.reject, function (progress) {
                                        deferred.notify({ index: index, value: progress });
                                    });
                                }
                            }, void 0);
                            if (pendingCount === 0) {
                                deferred.resolve(promises);
                            }
                            return deferred.promise;
                        });
                    }
                    Promise.prototype.all = function () {
                        return all(this);
                    };
                    Q.any = any;
                    function any(promises) {
                        if (promises.length === 0) {
                            return Q.resolve();
                        }
                        var deferred = Q.defer();
                        var pendingCount = 0;
                        array_reduce(promises, function (prev, current, index) {
                            var promise = promises[index];
                            pendingCount++;
                            when(promise, onFulfilled, onRejected, onProgress);
                            function onFulfilled(result) {
                                deferred.resolve(result);
                            }
                            function onRejected() {
                                pendingCount--;
                                if (pendingCount === 0) {
                                    deferred.reject(new Error("Can't get fulfillment value from any promise, all " +
                                        "promises were rejected."));
                                }
                            }
                            function onProgress(progress) {
                                deferred.notify({
                                    index: index,
                                    value: progress
                                });
                            }
                        }, undefined);
                        return deferred.promise;
                    }
                    Promise.prototype.any = function () {
                        return any(this);
                    };
                    Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
                    function allResolved(promises) {
                        return when(promises, function (promises) {
                            promises = array_map(promises, Q);
                            return when(all(array_map(promises, function (promise) {
                                return when(promise, noop, noop);
                            })), function () {
                                return promises;
                            });
                        });
                    }
                    Promise.prototype.allResolved = function () {
                        return allResolved(this);
                    };
                    Q.allSettled = allSettled;
                    function allSettled(promises) {
                        return Q(promises).allSettled();
                    }
                    Promise.prototype.allSettled = function () {
                        return this.then(function (promises) {
                            return all(array_map(promises, function (promise) {
                                promise = Q(promise);
                                function regardless() {
                                    return promise.inspect();
                                }
                                return promise.then(regardless, regardless);
                            }));
                        });
                    };
                    Q.fail =
                        Q["catch"] = function (object, rejected) {
                            return Q(object).then(void 0, rejected);
                        };
                    Promise.prototype.fail =
                        Promise.prototype["catch"] = function (rejected) {
                            return this.then(void 0, rejected);
                        };
                    Q.progress = progress;
                    function progress(object, progressed) {
                        return Q(object).then(void 0, void 0, progressed);
                    }
                    Promise.prototype.progress = function (progressed) {
                        return this.then(void 0, void 0, progressed);
                    };
                    Q.fin =
                        Q["finally"] = function (object, callback) {
                            return Q(object)["finally"](callback);
                        };
                    Promise.prototype.fin =
                        Promise.prototype["finally"] = function (callback) {
                            callback = Q(callback);
                            return this.then(function (value) {
                                return callback.fcall().then(function () {
                                    return value;
                                });
                            }, function (reason) {
                                return callback.fcall().then(function () {
                                    throw reason;
                                });
                            });
                        };
                    Q.done = function (object, fulfilled, rejected, progress) {
                        return Q(object).done(fulfilled, rejected, progress);
                    };
                    Promise.prototype.done = function (fulfilled, rejected, progress) {
                        var onUnhandledError = function (error) {
                            Q.nextTick(function () {
                                makeStackTraceLong(error, promise);
                                if (Q.onerror) {
                                    Q.onerror(error);
                                }
                                else {
                                    throw error;
                                }
                            });
                        };
                        var promise = fulfilled || rejected || progress ?
                            this.then(fulfilled, rejected, progress) :
                            this;
                        if (typeof process === "object" && process && process.domain) {
                            onUnhandledError = process.domain.bind(onUnhandledError);
                        }
                        promise.then(void 0, onUnhandledError);
                    };
                    Q.timeout = function (object, ms, error) {
                        return Q(object).timeout(ms, error);
                    };
                    Promise.prototype.timeout = function (ms, error) {
                        var deferred = defer();
                        var timeoutId = setTimeout(function () {
                            if (!error || "string" === typeof error) {
                                error = new Error(error || "Timed out after " + ms + " ms");
                                error.code = "ETIMEDOUT";
                            }
                            deferred.reject(error);
                        }, ms);
                        this.then(function (value) {
                            clearTimeout(timeoutId);
                            deferred.resolve(value);
                        }, function (exception) {
                            clearTimeout(timeoutId);
                            deferred.reject(exception);
                        }, deferred.notify);
                        return deferred.promise;
                    };
                    Q.delay = function (object, timeout) {
                        if (timeout === void 0) {
                            timeout = object;
                            object = void 0;
                        }
                        return Q(object).delay(timeout);
                    };
                    Promise.prototype.delay = function (timeout) {
                        return this.then(function (value) {
                            var deferred = defer();
                            setTimeout(function () {
                                deferred.resolve(value);
                            }, timeout);
                            return deferred.promise;
                        });
                    };
                    Q.nfapply = function (callback, args) {
                        return Q(callback).nfapply(args);
                    };
                    Promise.prototype.nfapply = function (args) {
                        var deferred = defer();
                        var nodeArgs = array_slice(args);
                        nodeArgs.push(deferred.makeNodeResolver());
                        this.fapply(nodeArgs).fail(deferred.reject);
                        return deferred.promise;
                    };
                    Q.nfcall = function (callback) {
                        var args = array_slice(arguments, 1);
                        return Q(callback).nfapply(args);
                    };
                    Promise.prototype.nfcall = function () {
                        var nodeArgs = array_slice(arguments);
                        var deferred = defer();
                        nodeArgs.push(deferred.makeNodeResolver());
                        this.fapply(nodeArgs).fail(deferred.reject);
                        return deferred.promise;
                    };
                    Q.nfbind =
                        Q.denodeify = function (callback) {
                            var baseArgs = array_slice(arguments, 1);
                            return function () {
                                var nodeArgs = baseArgs.concat(array_slice(arguments));
                                var deferred = defer();
                                nodeArgs.push(deferred.makeNodeResolver());
                                Q(callback).fapply(nodeArgs).fail(deferred.reject);
                                return deferred.promise;
                            };
                        };
                    Promise.prototype.nfbind =
                        Promise.prototype.denodeify = function () {
                            var args = array_slice(arguments);
                            args.unshift(this);
                            return Q.denodeify.apply(void 0, args);
                        };
                    Q.nbind = function (callback, thisp) {
                        var baseArgs = array_slice(arguments, 2);
                        return function () {
                            var nodeArgs = baseArgs.concat(array_slice(arguments));
                            var deferred = defer();
                            nodeArgs.push(deferred.makeNodeResolver());
                            function bound() {
                                return callback.apply(thisp, arguments);
                            }
                            Q(bound).fapply(nodeArgs).fail(deferred.reject);
                            return deferred.promise;
                        };
                    };
                    Promise.prototype.nbind = function () {
                        var args = array_slice(arguments, 0);
                        args.unshift(this);
                        return Q.nbind.apply(void 0, args);
                    };
                    Q.nmapply =
                        Q.npost = function (object, name, args) {
                            return Q(object).npost(name, args);
                        };
                    Promise.prototype.nmapply =
                        Promise.prototype.npost = function (name, args) {
                            var nodeArgs = array_slice(args || []);
                            var deferred = defer();
                            nodeArgs.push(deferred.makeNodeResolver());
                            this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
                            return deferred.promise;
                        };
                    Q.nsend =
                        Q.nmcall =
                            Q.ninvoke = function (object, name) {
                                var nodeArgs = array_slice(arguments, 2);
                                var deferred = defer();
                                nodeArgs.push(deferred.makeNodeResolver());
                                Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
                                return deferred.promise;
                            };
                    Promise.prototype.nsend =
                        Promise.prototype.nmcall =
                            Promise.prototype.ninvoke = function (name) {
                                var nodeArgs = array_slice(arguments, 1);
                                var deferred = defer();
                                nodeArgs.push(deferred.makeNodeResolver());
                                this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
                                return deferred.promise;
                            };
                    Q.nodeify = nodeify;
                    function nodeify(object, nodeback) {
                        return Q(object).nodeify(nodeback);
                    }
                    Promise.prototype.nodeify = function (nodeback) {
                        if (nodeback) {
                            this.then(function (value) {
                                Q.nextTick(function () {
                                    nodeback(null, value);
                                });
                            }, function (error) {
                                Q.nextTick(function () {
                                    nodeback(error);
                                });
                            });
                        }
                        else {
                            return this;
                        }
                    };
                    Q.noConflict = function () {
                        throw new Error("Q.noConflict only works when Q is used as a global");
                    };
                    var qEndingLine = captureLine();
                    return Q;
                });
            }).call(this, require('_process'));
        }, { "_process": 10 }], 2: [function (require, module, exports) {
            module.exports = {
                "android": ["4.0.4", "4.2.2", "4.4.2", "5.0", "5.1", "6.0", "7.0"],
                "ios": ["4", "5", "6", "7", "8", "9", "10"],
                "windows": ["8.1", "10"]
            };
        }, {}], 3: [function (require, module, exports) {
            var telemetry = require('telemetry-helper');
            var osVersions;
            var currentDeviceId;
            var devicesById;
            var isVirtual = true;
            var baseProps;
            var versionMap = {
                'windows': {
                    '8.1': '6.3.9600.0',
                    '10': '10.0.143939.0'
                }
            };
            var displayedPlatforms = {
                'android': 'Android',
                'ios': 'iOS',
                'windows': 'Windows'
            };
            var devicePluginPlatformMap = {
                'android': 'Android',
                'ios': 'iOS',
                'osx': 'Mac OS X',
                'ubuntu': 'Linux'
            };
            module.exports = {
                init: function (deviceInfo, props) {
                    currentDeviceId = deviceInfo.deviceId;
                    devicesById = deviceInfo.platformDevices;
                    baseProps = props;
                },
                selectDevice: function (deviceId) {
                    currentDeviceId = deviceId;
                    return getCurrentDevice();
                }
            };
            Object.defineProperties(module.exports, {
                osVersions: {
                    get: function () {
                        osVersions = osVersions || require('../../devices/os-versions.json');
                        return osVersions[getCurrentDevice().platform];
                    }
                },
                currentDevice: {
                    get: function () {
                        return getCurrentDevice();
                    }
                },
                devicesById: {
                    get: function () {
                        return devicesById;
                    }
                },
                isVirtual: {
                    get: function () {
                        return isVirtual;
                    },
                    set: function (value) {
                        if (value !== isVirtual) {
                            isVirtual = value;
                            telemetry.sendUITelemetry(Object.assign({}, baseProps, { control: 'is-virtual-device' }));
                        }
                    }
                },
                displayedPlatform: {
                    get: function () {
                        var platform = getCurrentDevice().platform;
                        var displayedPlatform = displayedPlatforms[platform];
                        if (!displayedPlatform) {
                            displayedPlatform = platform.charAt(0).toUpperCase() + platform.slice(1);
                            displayedPlatforms[platform] = displayedPlatform;
                        }
                        return displayedPlatform;
                    }
                },
                currentDevicePlatform: {
                    get: function () {
                        var platform = getCurrentDevice().platform;
                        return devicePluginPlatformMap[platform] || platform;
                    }
                },
                currentDeviceVersion: {
                    get: function () {
                        var device = getCurrentDevice();
                        var osVersion = device['os-version'];
                        var versionTemplate = device['device-version-template'];
                        if (versionTemplate === '<os-version>') {
                            return osVersion;
                        }
                        if (versionTemplate === '<map-os-version>') {
                            var platform = device.platform;
                            var mappedVersion = versionMap[platform] && versionMap[platform][osVersion];
                            return mappedVersion || '(unknown)';
                        }
                        return versionTemplate;
                    }
                }
            });
            function getCurrentDevice() {
                return devicesById[currentDeviceId];
            }
        }, { "../../devices/os-versions.json": 2, "telemetry-helper": "telemetry-helper" }], 4: [function (require, module, exports) {
            var PositionError = function (code, message) {
                this.code = code || null;
                this.message = message || '';
            };
            PositionError.prototype.PERMISSION_DENIED = PositionError.PERMISSION_DENIED = 1;
            PositionError.prototype.POSITION_UNAVAILABLE = PositionError.POSITION_UNAVAILABLE = 2;
            PositionError.prototype.TIMEOUT = PositionError.TIMEOUT = 3;
            module.exports = PositionError;
        }, {}], 5: [function (require, module, exports) {
            var db = require('db'), exception = require('exception'), utils = require('utils'), _positionInfo = {
                'latitude': 43.465187,
                'longitude': -80.522372,
                'altitude': 100,
                'accuracy': 150,
                'altitudeAccuracy': 80,
                'heading': 0,
                'speed': 0
            };
            var messages;
            function _serialize(settings) {
                var tempSettings = utils.copy(settings);
                tempSettings.position.timeStamp = 'new Date(' + tempSettings.position.timeStamp.getTime() + ')';
                return tempSettings;
            }
            function _validatePositionInfo(pInfo) {
                return (pInfo && !(isNaN(pInfo.latitude) ||
                    isNaN(pInfo.longitude) ||
                    isNaN(pInfo.altitude) ||
                    isNaN(pInfo.accuracy) ||
                    isNaN(pInfo.altitudeAccuracy) ||
                    isNaN(pInfo.heading) ||
                    isNaN(pInfo.speed))) ? true : false;
            }
            var self = {
                initialize: function (msgs) {
                    messages = msgs;
                    var settings = db.retrieveObject('geosettings');
                    if (settings) {
                        utils.forEach(_positionInfo, function (value, key) {
                            _positionInfo[key] = parseFloat(settings.position[key] || value);
                        });
                        self.timeout = settings.timeout;
                        self.delay = settings.delay || 0;
                    }
                },
                getPositionInfo: function () {
                    var pi = utils.copy(_positionInfo);
                    pi.timeStamp = new Date();
                    return pi;
                },
                updatePositionInfo: function (newPositionInfo, delay, timeout) {
                    if (!_validatePositionInfo(newPositionInfo)) {
                        exception.raise(exception.types.Geo, 'invalid positionInfo object');
                    }
                    _positionInfo = utils.copy(newPositionInfo);
                    _positionInfo.timeStamp = new Date();
                    self.delay = delay || 0;
                    self.timeout = timeout;
                    db.saveObject('geosettings', _serialize({
                        position: _positionInfo,
                        delay: self.delay,
                        timeout: self.timeout
                    }));
                    if (!messages) {
                        throw 'geo-model has not been initialized';
                    }
                    messages.emit('position-info-updated', _positionInfo);
                },
                timeout: false,
                delay: 0,
                map: {}
            };
            module.exports = self;
        }, { "db": "db", "exception": "exception", "utils": "utils" }], 6: [function (require, module, exports) {
            var db = require('db'), event = require('event');
            var _sims = null;
            module.exports = {
                get sims() {
                    if (!_sims) {
                        _sims = db.retrieveObject('saved-sims') || [];
                    }
                    return _sims;
                },
                addSim: function (sim) {
                    var sims = this.sims;
                    sims.push(sim);
                    db.saveObject('saved-sims', sims);
                    event.trigger('saved-sim-added', [sim]);
                },
                removeSim: function (sim) {
                    var sims = this.sims;
                    var simIndex = sim;
                    if (typeof simIndex === 'object') {
                        simIndex = sims.indexOf(simIndex);
                        if (simIndex < 0) {
                            throw 'Tried to remove sim object that didn\'t exist';
                        }
                    }
                    else if (typeof simIndex === 'number') {
                        if (simIndex < 0 || simIndex >= sims.length) {
                            throw 'Invalid saved sim index ' + simIndex + ' (should be from 0 to ' + sims.length - 1 + ')';
                        }
                        sim = sims[simIndex];
                    }
                    else {
                        throw 'Invalid value passed to removeSim(): ' + sim;
                    }
                    sims.splice(simIndex, 1);
                    db.saveObject('saved-sims', sims);
                    event.trigger('saved-sim-removed', [sim, simIndex]);
                },
                findSavedSim: function (service, action) {
                    var sims = this.sims;
                    var savedSim = null;
                    sims.some(function (sim) {
                        if (sim.service === service && sim.action === action) {
                            savedSim = sim;
                            return true;
                        }
                        return false;
                    });
                    return savedSim;
                }
            };
        }, { "db": "db", "event": "event" }], 7: [function (require, module, exports) {
            var Q = require('q'), simStatus = require('sim-status'), telemetry = require('telemetry-helper');
            var socket;
            var serviceToPluginMap;
            function getSuccess(index) {
                return function (result) {
                    console.log('Success callback for index: ' + index + '; result: ' + result);
                    var data = { index: index, result: result };
                    socket.emit('exec-success', data);
                };
            }
            function getFailure(index) {
                return function (error) {
                    console.log('Failure callback for index: ' + index + '; error: ' + error);
                    var data = { index: index, error: error };
                    socket.emit('exec-failure', data);
                };
            }
            function registerSimHost() {
                socket.emit('register-simulation-host');
            }
            Object.defineProperty(module.exports, 'socket', {
                get: function () {
                    return socket;
                }
            });
            module.exports.initialize = function (pluginHandlers, services) {
                var deferred = Q.defer();
                serviceToPluginMap = services;
                socket = io();
                socket.on('init-telemetry', function () {
                    telemetry.init(socket);
                });
                socket.on('refresh', function () {
                    document.location.reload(true);
                });
                socket.on('retheme', function () {
                    var themeLink = document.head.querySelector('link[href="sim-host-theme.css"]');
                    if (themeLink) {
                        themeLink.href = 'sim-host-theme.css';
                    }
                });
                socket.on('connect', function () {
                    registerSimHost();
                });
                socket.on('connect_error', function (err) {
                    deferred.reject(err);
                });
                socket.on('connect_timeout', function (err) {
                    deferred.reject(err);
                });
                socket.on('app-plugin-list', function () {
                    socket.emit('start');
                    simStatus._fireAppHostReady();
                });
                socket.once('init', function (device) {
                    deferred.resolve(device);
                    socket.on('exec', function (data) {
                        var index;
                        if (!data) {
                            throw 'Exec called on simulation host without exec info';
                        }
                        index = data.index;
                        if (typeof index !== 'number') {
                            throw 'Exec called on simulation host without an index specified';
                        }
                        var success = data.hasSuccess ? getSuccess(index) : null;
                        var failure = data.hasFail ? getFailure(index) : null;
                        var service = data.service;
                        if (!service) {
                            throw 'Exec called on simulation host without a service specified';
                        }
                        var action = data.action;
                        if (!action) {
                            throw 'Exec called on simulation host without an action specified';
                        }
                        console.log('Exec ' + service + '.' + action + ' (index: ' + index + ')');
                        var handler = pluginHandlers[service] && pluginHandlers[service][action];
                        var telemetryProps = { service: service, action: action };
                        if (!handler) {
                            telemetryProps.handled = 'none';
                            handler = pluginHandlers['*']['*'];
                            handler(success, failure, service, action, data.args);
                        }
                        else {
                            telemetryProps.handled = 'sim-host';
                            handler(success, failure, data.args);
                        }
                        telemetry.sendClientTelemetry('exec', telemetryProps);
                    });
                });
                socket.on('init', function () {
                    socket.emit('ready');
                });
                return deferred.promise;
            };
            module.exports.notifyPluginsReady = function () {
                telemetry.registerPluginServices(serviceToPluginMap);
            };
        }, { "q": 1, "sim-status": "sim-status", "telemetry-helper": "telemetry-helper" }], 8: [function (require, module, exports) {
            var dialog = require('dialog'), utils = require('utils');
            var uniqueIdSuffix = 0;
            var interactiveElementSelector = '* /deep/ input, * /deep/ select, * /deep/ button, * /deep/ textarea';
            function initialize(changePanelVisibilityCallback) {
                registerCustomElement('cordova-panel', {
                    proto: {
                        cordovaCollapsed: {
                            set: function (value) {
                                var icon = this.shadowRoot.querySelector('.cordova-collapse-icon');
                                var content = this.shadowRoot.querySelector('.cordova-content');
                                var isCurrentlyCollapsed = icon.classList.contains('cordova-collapsed');
                                if (value && !isCurrentlyCollapsed) {
                                    collapsePanel(icon, content);
                                }
                                else if (!value && isCurrentlyCollapsed) {
                                    expandPanel(icon, content);
                                }
                            }
                        },
                        enabled: {
                            set: function (value) {
                                if (value) {
                                    if (this.elementEnabledState) {
                                        this.elementEnabledState.forEach(function (enabledState) {
                                            enabledState.element.disabled = enabledState.disabled;
                                        });
                                        delete this.elementEnabledState;
                                        this.shadowRoot.querySelector('.cordova-panel-inner').setAttribute('tabIndex', '0');
                                    }
                                }
                                else {
                                    this.elementEnabledState = [];
                                    Array.prototype.forEach.call(this.querySelectorAll(interactiveElementSelector), function (element) {
                                        this.elementEnabledState.push({ element: element, disabled: element.disabled });
                                        element.disabled = true;
                                    }, this);
                                    this.shadowRoot.querySelector('.cordova-panel-inner').setAttribute('tabIndex', '');
                                }
                            }
                        },
                        focus: {
                            value: function () {
                                this.shadowRoot.querySelector('.cordova-panel-inner').focus();
                            }
                        }
                    },
                    initialize: function () {
                        var content = this.shadowRoot.querySelector('.cordova-content');
                        var panelId = this.getAttribute('id');
                        var collapseIcon = this.shadowRoot.querySelector('.cordova-collapse-icon');
                        this.shadowRoot.querySelector('.cordova-header .spoken-text span').textContent = this.getAttribute('caption');
                        this.shadowRoot.querySelector('.cordova-header .spoken-text span').setAttribute('title', this.getAttribute('caption'));
                        this.shadowRoot.querySelector('.cordova-header .spoken-text').setAttribute('aria-label', this.getAttribute('spoken-text') || this.getAttribute('caption'));
                        function expandCollapse() {
                            var collapsed = collapseIcon.classList.contains('cordova-collapsed');
                            if (collapsed) {
                                expandPanel(collapseIcon, content);
                            }
                            else {
                                collapsePanel(collapseIcon, content);
                            }
                            if (changePanelVisibilityCallback && typeof changePanelVisibilityCallback === 'function') {
                                changePanelVisibilityCallback(panelId, !collapsed);
                            }
                        }
                        this.shadowRoot.querySelector('.cordova-header').addEventListener('click', expandCollapse);
                        this.shadowRoot.querySelector('.cordova-panel-inner').addEventListener('keydown', function (e) {
                            if (e.target === this && e.keyCode === 32 && !isModifyKeyPressed(e)) {
                                expandCollapse();
                            }
                        });
                    }
                });
                registerCustomElement('cordova-dialog', {
                    proto: {
                        show: {
                            value: function () {
                                document.getElementById('popup-window').style.display = '';
                                this.style.display = '';
                                this.querySelector('.cordova-panel-inner').focus();
                            }
                        },
                        hide: {
                            value: function () {
                                document.getElementById('popup-window').style.display = 'none';
                                this.style.display = 'none';
                            }
                        }
                    },
                    initialize: function () {
                        this.shadowRoot.querySelector('.cordova-header .spoken-text span').textContent = this.getAttribute('caption');
                        this.shadowRoot.querySelector('.cordova-header .spoken-text span').setAttribute('title', this.getAttribute('caption'));
                        this.shadowRoot.querySelector('.cordova-header .spoken-text').setAttribute('aria-label', this.getAttribute('spoken-text') || this.getAttribute('caption'));
                        this.shadowRoot.querySelector('.cordova-close-icon').addEventListener('click', function () {
                            dialog.hideDialog();
                        });
                        this.addEventListener('keydown', function (e) {
                            if (e.keyCode === 27 && !isModifyKeyPressed(e)) {
                                dialog.hideDialog();
                            }
                        });
                    }
                });
                registerCustomElement('cordova-item-list', {
                    proto: {
                        addItem: {
                            value: function (item) {
                                this.appendChild(item);
                            }
                        },
                        removeItem: {
                            value: function (item) {
                                this.removeChild(this.children[item]);
                            }
                        }
                    },
                    initialize: function () {
                        this.classList.add('cordova-group');
                    }
                });
                registerCustomElement('cordova-item', {
                    proto: {
                        focus: {
                            value: function () {
                                this.shadowRoot.querySelector('.cordova-item-wrapper').focus();
                            }
                        }
                    },
                    initialize: function () {
                        this.classList.add('cordova-group');
                        this.addEventListener('mousedown', function () {
                            var that = this;
                            window.setTimeout(function () {
                                if (document.activeElement !== that) {
                                    that.focus();
                                }
                            }, 0);
                        });
                        var that = this;
                        this.shadowRoot.querySelector('.close-button').addEventListener('click', function () {
                            removeItem(that);
                        });
                        this.addEventListener('keydown', function (e) {
                            if (isModifyKeyPressed(e)) {
                                return;
                            }
                            var list, childIndex;
                            switch (e.keyCode) {
                                case 46:
                                    removeItem(this, true);
                                    break;
                                case 38:
                                    e.preventDefault();
                                    list = this.parentNode;
                                    childIndex = getItemIndex(this, list);
                                    if (childIndex > 0) {
                                        list.children[childIndex - 1].focus();
                                    }
                                    break;
                                case 40:
                                    e.preventDefault();
                                    list = this.parentNode;
                                    childIndex = getItemIndex(this, list);
                                    if (childIndex < list.children.length - 1) {
                                        list.children[childIndex + 1].focus();
                                    }
                                    break;
                            }
                        });
                        function getItemIndex(item, list) {
                            return list && list.tagName === 'CORDOVA-ITEM-LIST' ? Array.prototype.indexOf.call(list.children, item) : -1;
                        }
                        function removeItem(item, setFocus) {
                            var list = item.parentNode;
                            var childIndex = getItemIndex(item, list);
                            if (childIndex > -1) {
                                var itemRemovedEvent = new CustomEvent('itemremoved', { detail: { itemIndex: childIndex }, bubbles: true });
                                item.dispatchEvent(itemRemovedEvent);
                                list.removeChild(item);
                                if (setFocus) {
                                    var itemCount = list.children.length;
                                    if (itemCount > 0) {
                                        if (childIndex >= itemCount) {
                                            childIndex = itemCount - 1;
                                        }
                                        list.children[childIndex].focus();
                                    }
                                    else {
                                        var panel = findParent(list, 'cordova-panel');
                                        panel && panel.focus();
                                    }
                                }
                            }
                        }
                    }
                });
                registerCustomElement('cordova-panel-row', {
                    initialize: function () {
                        this.classList.add('cordova-panel-row');
                        this.classList.add('cordova-group');
                    }
                });
                registerCustomElement('cordova-group', {
                    initialize: function () {
                        this.classList.add('cordova-group');
                    }
                });
                registerCustomElement('cordova-checkbox', {
                    proto: {
                        checked: {
                            get: function () {
                                return this.shadowRoot.querySelector('input').checked;
                            },
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('input'), 'checked', value);
                            }
                        },
                        focus: {
                            value: function () {
                                this.shadowRoot.querySelector('input').focus();
                            }
                        }
                    },
                    initialize: function () {
                        if (this.parentNode.tagName === 'CORDOVA-PANEL') {
                            this.classList.add('cordova-panel-row');
                            this.classList.add('cordova-group');
                        }
                        else {
                            this.shadowRoot.appendChild(this.shadowRoot.querySelector('label'));
                        }
                        if (this.hasAttribute('spoken')) {
                            this.shadowRoot.querySelector('label').setAttribute('aria-hidden', false);
                        }
                    },
                    mungeIds: 'cordova-checkbox-template-input'
                });
                registerCustomElement('cordova-radio', {
                    proto: {
                        checked: {
                            get: function () {
                                return this.shadowRoot.querySelector('input').checked;
                            },
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('input'), 'checked', value);
                            }
                        },
                        focus: {
                            value: function () {
                                this.shadowRoot.querySelector('input').focus();
                            }
                        }
                    },
                    initialize: function () {
                        var isChecked = this.getAttribute('checked');
                        if (isChecked && isChecked.toLowerCase() === 'true') {
                            this.shadowRoot.querySelector('input').checked = true;
                        }
                        var parentGroup = findParent(this, 'cordova-group');
                        if (parentGroup) {
                            var radioButton = this.shadowRoot.querySelector('input');
                            radioButton.setAttribute('name', parentGroup.id);
                        }
                    },
                    mungeIds: 'cordova-radio-template-input'
                });
                registerCustomElement('cordova-label', {
                    proto: {
                        value: {
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('label'), 'textContent', value);
                            },
                            get: function () {
                                return this.shadowRoot.querySelector('label').textContent;
                            }
                        }
                    },
                    initialize: function () {
                        var label = this.shadowRoot.querySelector('label');
                        label.textContent = this.getAttribute('label');
                        label.setAttribute('for', this.getAttribute('for'));
                        this.setAttribute('for', '');
                        if (this.hasAttribute('spoken')) {
                            label.setAttribute('aria-hidden', 'false');
                        }
                    }
                });
                registerCustomElement('cordova-text-entry', {
                    proto: {
                        value: {
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('input'), 'value', value);
                            },
                            get: function () {
                                return this.shadowRoot.querySelector('input').value;
                            }
                        },
                        disabled: {
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('input'), 'disabled', value);
                            }
                        },
                        focus: {
                            value: function () {
                                this.shadowRoot.querySelector('input').focus();
                            }
                        }
                    },
                    initialize: function () {
                        this.shadowRoot.querySelector('label').textContent = this.getAttribute('label');
                        this.classList.add('cordova-panel-row');
                        this.classList.add('cordova-group');
                    },
                    eventTarget: 'input',
                    mungeIds: 'cordova-text-entry-template-input'
                });
                registerCustomElement('cordova-number-entry', {
                    proto: {
                        value: {
                            set: function (value) {
                                if (utils.isNumber(value)) {
                                    this._internalValue = value;
                                }
                                else {
                                    value = this._internalValue;
                                }
                                setValueSafely(this.shadowRoot.querySelector('input'), 'value', value);
                            },
                            get: function () {
                                return this.shadowRoot.querySelector('input').value;
                            }
                        },
                        disabled: {
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('input'), 'disabled', value);
                            }
                        },
                        focus: {
                            value: function () {
                                this.shadowRoot.querySelector('input').focus();
                            }
                        }
                    },
                    initialize: function () {
                        var displayLabel = this.getAttribute('label');
                        this.shadowRoot.querySelector('label').textContent = displayLabel;
                        this.classList.add('cordova-panel-row');
                        this.classList.add('cordova-group');
                        this._internalValue = 0;
                        var input = this.shadowRoot.querySelector('input');
                        input.setAttribute('aria-label', this.getAttribute('spoken-text') || displayLabel);
                        var maxValue = this.getAttribute('max'), minValue = this.getAttribute('min'), value = this.getAttribute('value'), step = this.getAttribute('step');
                        if (value !== null && utils.isNumber(value)) {
                            this._internalValue = value;
                        }
                        else if (minValue !== null && utils.isNumber(minValue)) {
                            this._internalValue = minValue;
                        }
                        else if (maxValue !== null && utils.isNumber(maxValue) && this._internalValue > parseFloat(maxValue)) {
                            this._internalValue = maxValue;
                        }
                        if (maxValue !== null)
                            input.setAttribute('max', maxValue);
                        if (minValue !== null)
                            input.setAttribute('min', minValue);
                        if (step !== null)
                            input.setAttribute('step', step);
                        if (value !== null)
                            input.setAttribute('value', value);
                        input.addEventListener('input', function (event) {
                            var value = event.target.value;
                            if (utils.isNumber(value)) {
                                this._internalValue = value;
                            }
                            else {
                                input.value = this._internalValue;
                                return false;
                            }
                        }.bind(this));
                    },
                    eventTarget: 'input',
                    mungeIds: 'cordova-number-entry-template-input'
                });
                registerCustomElement('cordova-labeled-value', {
                    proto: {
                        label: {
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('label'), 'textContent', value);
                            },
                            get: function () {
                                return this.shadowRoot.querySelector('label').textContent;
                            }
                        },
                        value: {
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('span'), 'textContent', value);
                                setValueSafely(this.shadowRoot.querySelector('span'), 'title', value);
                            },
                            get: function () {
                                return this.shadowRoot.querySelector('span').textContent;
                            }
                        }
                    },
                    initialize: function () {
                        this.shadowRoot.querySelector('label').textContent = this.getAttribute('label');
                        this.shadowRoot.querySelector('span').textContent = this.getAttribute('value');
                        this.shadowRoot.querySelector('span').setAttribute('title', this.getAttribute('value'));
                        this.classList.add('cordova-panel-row');
                        this.classList.add('cordova-group');
                    }
                });
                registerCustomElement('cordova-button', {
                    proto: {
                        focus: {
                            value: function () {
                                this.shadowRoot.querySelector('button').focus();
                            }
                        }
                    },
                    initialize: function () {
                        var readLabel = this.getAttribute('spoken-text');
                        if (readLabel) {
                            this.shadowRoot.querySelector('button').setAttribute('aria-label', readLabel);
                        }
                    },
                    eventTarget: 'button'
                });
                registerCustomElement('cordova-file', {
                    proto: {
                        input: {
                            get: function () {
                                return this.shadowRoot.querySelector('input');
                            }
                        },
                        files: {
                            get: function () {
                                return this.shadowRoot.querySelector('input').files;
                            }
                        },
                        accept: {
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('input'), 'accept', value);
                            }
                        }
                    },
                    eventTarget: 'input'
                });
                registerCustomElement('cordova-combo', {
                    proto: {
                        options: {
                            get: function () {
                                return this.shadowRoot.querySelector('select').options;
                            }
                        },
                        selectedIndex: {
                            get: function () {
                                return this.shadowRoot.querySelector('select').selectedIndex;
                            }
                        },
                        value: {
                            get: function () {
                                return this.shadowRoot.querySelector('select').value;
                            },
                            set: function (value) {
                                setValueSafely(this.shadowRoot.querySelector('select'), 'value', value);
                            }
                        },
                        appendChild: {
                            value: function (node) {
                                this.shadowRoot.querySelector('select').appendChild(node);
                            }
                        },
                        focus: {
                            value: function () {
                                this.shadowRoot.querySelector('select').focus();
                            }
                        }
                    },
                    initialize: function () {
                        this.classList.add('cordova-panel-row');
                        this.classList.add('cordova-group');
                        var select = this.shadowRoot.querySelector('select');
                        var name = this.getAttribute('name');
                        if (name) {
                            select.setAttribute('name', name);
                        }
                        var label = this.getAttribute('label');
                        if (label) {
                            this.shadowRoot.querySelector('label').textContent = this.getAttribute('label');
                        }
                        else {
                            select.style.width = this.style.width || '100%';
                            select.style.minWidth = this.style.minWidth;
                        }
                        var options = this.querySelectorAll('option');
                        Array.prototype.forEach.call(options, function (option) {
                            select.appendChild(option);
                        });
                    },
                    eventTarget: 'select',
                    mungeIds: 'cordova-combo-template-select'
                });
            }
            function registerCustomElement(name, opts) {
                var protoProperties = opts.proto;
                var initializeCallback = opts.initialize;
                var eventTargetSelector = opts.eventTarget;
                var mungeIds = opts.mungeIds;
                if (mungeIds && !Array.isArray(mungeIds)) {
                    mungeIds = [mungeIds];
                }
                var constructorName = name.split('-').map(function (bit) {
                    return bit.charAt(0).toUpperCase() + bit.substr(1);
                }).join('');
                var proto = Object.create(HTMLElement.prototype);
                if (protoProperties) {
                    Object.defineProperties(proto, protoProperties);
                }
                function initialize() {
                    this.initialized = true;
                    var eventTarget = eventTargetSelector && this.shadowRoot.querySelector(eventTargetSelector);
                    if (eventTarget) {
                        Object.defineProperties(this, {
                            addEventListener: {
                                value: function (a, b, c) {
                                    eventTarget.addEventListener(a, b, c);
                                }
                            },
                            click: {
                                value: eventTarget.click
                            },
                            onclick: {
                                get: function () {
                                    return eventTarget.onclick;
                                },
                                set: function (value) {
                                    eventTarget.onclick = value;
                                }
                            },
                            onchange: {
                                get: function () {
                                    return eventTarget.onchange;
                                },
                                set: function (value) {
                                    eventTarget.onchange = value;
                                }
                            }
                        });
                    }
                    var atts = this.attributes;
                    Array.prototype.forEach.call(atts, function (att) {
                        if (att.name.indexOf('on') === 0) {
                            console.error('Unsupported inline event handlers detected: ' + name + '.' + att.name + '="' + att.value + '"');
                            this.removeAttribute(att.name);
                        }
                    }, this);
                    initializeCallback && initializeCallback.call(this);
                }
                proto.attachedCallback = function () {
                    if (!this.initialized) {
                        initialize.call(this);
                    }
                };
                proto.createdCallback = function () {
                    var t = document.getElementById(name + '-template');
                    var shadowRoot = this.createShadowRoot();
                    shadowRoot.appendChild(document.importNode(t.content, true));
                    if (mungeIds) {
                        mungeIds.forEach(function (idToMunge) {
                            var mungedId = idToMunge + '-' + uniqueIdSuffix++;
                            var target = shadowRoot.querySelector('#' + idToMunge);
                            if (target) {
                                target.setAttribute('id', mungedId);
                            }
                            var forElement = shadowRoot.querySelector('[for=' + idToMunge + ']');
                            if (forElement) {
                                forElement.setAttribute('for', mungedId);
                            }
                        });
                    }
                    if (initializeCallback && this.ownerDocument === document) {
                        initialize.call(this);
                    }
                };
                window[constructorName] = document.registerElement(name, {
                    prototype: proto
                });
            }
            function isModifyKeyPressed(e) {
                return e.altKey || e.ctrlKey || e.shiftKey || e.metaKey;
            }
            function collapsePanel(iconElem, content) {
                iconElem.classList.add('cordova-collapsed');
                content.style.display = 'none';
                content.style.height = '0';
            }
            function expandPanel(iconElem, content) {
                iconElem.classList.remove('cordova-collapsed');
                content.style.display = '';
                content.style.height = '';
            }
            function findParent(element, tag) {
                if (!Array.isArray(tag)) {
                    tag = [tag];
                }
                var parent = element.parentNode;
                return parent && parent.tagName ? tag.indexOf(parent.tagName.toLowerCase()) > -1 ? parent : findParent(parent, tag) : null;
            }
            function setValueSafely(el, prop, value) {
                if (el.ownerDocument.contains(el)) {
                    el[prop] = value;
                }
                else {
                    window.setTimeout(function () {
                        el[prop] = value;
                    }, 0);
                }
            }
            module.exports = {
                initialize: initialize
            };
            if (!Array.prototype.find) {
                Array.prototype.find = function (predicate) {
                    if (this == null) {
                        throw new TypeError('Array.prototype.find called on null or undefined');
                    }
                    if (typeof predicate !== 'function') {
                        throw new TypeError('predicate must be a function');
                    }
                    var list = Object(this);
                    var length = list.length >>> 0;
                    var thisArg = arguments[1];
                    var value;
                    for (var i = 0; i < length; i++) {
                        value = list[i];
                        if (predicate.call(thisArg, value, i, list)) {
                            return value;
                        }
                    }
                    return undefined;
                };
            }
        }, { "dialog": "dialog", "utils": "utils" }], 9: [function (require, module, exports) {
            require('polyfills');
            var customElements = require('./custom-elements'), db = require('db'), dialog = require('dialog'), Messages = require('messages'), Q = require('q'), socket = require('../protocol/socket');
            var COLLAPSED_PANELS_KEY = 'collapsed-panels';
            var plugins;
            var pluginHandlers = {};
            var serviceToPluginMap = {};
            var initSocketPromise = socket.initialize(pluginHandlers, serviceToPluginMap);
            customElements.initialize(changePanelVisibilityCallback);
            window.addEventListener('DOMContentLoaded', function () {
                sizeContent();
                Q.all([db.initialize(), initSocketPromise]).then(function (result) {
                    initializePlugins(result[1]);
                    getCollapsedPanels().forEach(function (panelId) {
                        var panel = document.getElementById(panelId);
                        if (panel) {
                            panel.cordovaCollapsed = true;
                        }
                    });
                }).done();
            });
            window.addEventListener('resize', function () {
                sizeContent();
            });
            function changePanelVisibilityCallback(id, isNowCollapsed) {
                var collapsedPanels = getCollapsedPanels();
                var index = collapsedPanels.indexOf(id);
                if (isNowCollapsed && index === -1) {
                    collapsedPanels.push(id);
                }
                else if (!isNowCollapsed && index > -1) {
                    collapsedPanels.splice(index, 1);
                }
                db.saveObject(COLLAPSED_PANELS_KEY, collapsedPanels);
            }
            function getCollapsedPanels() {
                var collapsedPanels = db.retrieveObject(COLLAPSED_PANELS_KEY);
                if (!Array.isArray(collapsedPanels)) {
                    collapsedPanels = [];
                }
                return collapsedPanels;
            }
            function sizeContent() {
                var bodyWidth = parseInt(window.getComputedStyle(document.body).width);
                var panelWidth = parseInt(window.getComputedStyle(document.querySelector('cordova-panel')).width);
                var columnWidth = panelWidth / 320 * 323 + 3;
                var contentWidth = (Math.floor((bodyWidth - 1) / columnWidth) || 1) * columnWidth;
                document.querySelector('.cordova-main').style.width = contentWidth + 'px';
            }
            var pluginMessages = {};
            function applyPlugins(plugins, clobberScope, clobberToPluginMap) {
                Object.keys(plugins).forEach(function (pluginId) {
                    var plugin = plugins[pluginId];
                    if (plugin) {
                        if (typeof plugin === 'function') {
                            pluginMessages[pluginId] = pluginMessages[pluginId] || new Messages(pluginId, socket.socket);
                            plugin = plugin(pluginMessages[pluginId]);
                            plugins[pluginId] = plugin;
                        }
                        if (clobberScope) {
                            clobber(plugin, clobberScope, clobberToPluginMap, pluginId);
                        }
                    }
                });
            }
            function clobber(clobbers, scope, clobberToPluginMap, pluginId) {
                Object.keys(clobbers).forEach(function (key) {
                    if (clobberToPluginMap && pluginId) {
                        clobberToPluginMap[key] = pluginId;
                    }
                    if (clobbers[key] && typeof clobbers[key] === 'object') {
                        scope[key] = scope[key] || {};
                        clobber(clobbers[key], scope[key]);
                    }
                    else {
                        scope[key] = clobbers[key];
                    }
                });
            }
            function initializePlugins(device) {
                plugins = {
                    'cordova-plugin-geolocation': require('cordova-plugin-geolocation'),
                    'exec': require('exec'),
                    'events': require('events'),
                    'cordova-plugin-device': require('cordova-plugin-device'),
                    'cordova-plugin-inappbrowser': require('cordova-plugin-inappbrowser')
                };
                var pluginHandlersDefinitions = {
                    'cordova-plugin-geolocation': require('cordova-plugin-geolocation-handlers'),
                    'exec': require('exec-handlers'),
                    'cordova-plugin-device': require('cordova-plugin-device-handlers'),
                    'cordova-plugin-statusbar': require('cordova-plugin-statusbar-handlers'),
                    'android-platform-core': require('android-platform-core-handlers')
                };
                applyPlugins(plugins);
                applyPlugins(pluginHandlersDefinitions, pluginHandlers, serviceToPluginMap);
                Array.prototype.forEach.call(document.getElementById('popup-window').children, function (dialogRef) {
                    dialog.pluginDialogs[dialogRef.id] = dialogRef;
                    dialogRef.style.display = 'none';
                });
                Object.keys(plugins).forEach(function (pluginId) {
                    try {
                        plugins[pluginId] && plugins[pluginId].initialize && plugins[pluginId].initialize(device);
                    }
                    catch (e) {
                        console.error('Error initializing plugin ' + pluginId);
                        console.error(e);
                    }
                });
                socket.notifyPluginsReady();
            }
        }, { "../protocol/socket": 7, "./custom-elements": 8, "android-platform-core-handlers": "android-platform-core-handlers", "cordova-plugin-device": "cordova-plugin-device", "cordova-plugin-device-handlers": "cordova-plugin-device-handlers", "cordova-plugin-geolocation": "cordova-plugin-geolocation", "cordova-plugin-geolocation-handlers": "cordova-plugin-geolocation-handlers", "cordova-plugin-inappbrowser": "cordova-plugin-inappbrowser", "cordova-plugin-statusbar-handlers": "cordova-plugin-statusbar-handlers", "db": "db", "dialog": "dialog", "events": "events", "exec": "exec", "exec-handlers": "exec-handlers", "messages": "messages", "polyfills": "polyfills", "q": 1 }], 10: [function (require, module, exports) {
            var process = module.exports = {};
            var cachedSetTimeout;
            var cachedClearTimeout;
            (function () {
                try {
                    cachedSetTimeout = setTimeout;
                }
                catch (e) {
                    cachedSetTimeout = function () {
                        throw new Error('setTimeout is not defined');
                    };
                }
                try {
                    cachedClearTimeout = clearTimeout;
                }
                catch (e) {
                    cachedClearTimeout = function () {
                        throw new Error('clearTimeout is not defined');
                    };
                }
            }());
            function runTimeout(fun) {
                if (cachedSetTimeout === setTimeout) {
                    return setTimeout(fun, 0);
                }
                try {
                    return cachedSetTimeout(fun, 0);
                }
                catch (e) {
                    try {
                        return cachedSetTimeout.call(null, fun, 0);
                    }
                    catch (e) {
                        return cachedSetTimeout.call(this, fun, 0);
                    }
                }
            }
            function runClearTimeout(marker) {
                if (cachedClearTimeout === clearTimeout) {
                    return clearTimeout(marker);
                }
                try {
                    return cachedClearTimeout(marker);
                }
                catch (e) {
                    try {
                        return cachedClearTimeout.call(null, marker);
                    }
                    catch (e) {
                        return cachedClearTimeout.call(this, marker);
                    }
                }
            }
            var queue = [];
            var draining = false;
            var currentQueue;
            var queueIndex = -1;
            function cleanUpNextTick() {
                if (!draining || !currentQueue) {
                    return;
                }
                draining = false;
                if (currentQueue.length) {
                    queue = currentQueue.concat(queue);
                }
                else {
                    queueIndex = -1;
                }
                if (queue.length) {
                    drainQueue();
                }
            }
            function drainQueue() {
                if (draining) {
                    return;
                }
                var timeout = runTimeout(cleanUpNextTick);
                draining = true;
                var len = queue.length;
                while (len) {
                    currentQueue = queue;
                    queue = [];
                    while (++queueIndex < len) {
                        if (currentQueue) {
                            currentQueue[queueIndex].run();
                        }
                    }
                    queueIndex = -1;
                    len = queue.length;
                }
                currentQueue = null;
                draining = false;
                runClearTimeout(timeout);
            }
            process.nextTick = function (fun) {
                var args = new Array(arguments.length - 1);
                if (arguments.length > 1) {
                    for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                    }
                }
                queue.push(new Item(fun, args));
                if (queue.length === 1 && !draining) {
                    runTimeout(drainQueue);
                }
            };
            function Item(fun, array) {
                this.fun = fun;
                this.array = array;
            }
            Item.prototype.run = function () {
                this.fun.apply(null, this.array);
            };
            process.title = 'browser';
            process.browser = true;
            process.env = {};
            process.argv = [];
            process.version = '';
            process.versions = {};
            function noop() { }
            process.on = noop;
            process.addListener = noop;
            process.once = noop;
            process.off = noop;
            process.removeListener = noop;
            process.removeAllListeners = noop;
            process.emit = noop;
            process.binding = function (name) {
                throw new Error('process.binding is not supported');
            };
            process.cwd = function () { return '/'; };
            process.chdir = function (dir) {
                throw new Error('process.chdir is not supported');
            };
            process.umask = function () { return 0; };
        }, {}], "android-platform-core-handlers": [function (require, module, exports) {
            module.exports = {
                'CoreAndroid': {
                    'show': function (success, fail, service, action, args) {
                        success && success();
                    },
                    'messageChannel': function (success, fail, service, action, args) {
                    }
                }
            };
        }, {}], "argscheck": [function (require, module, exports) {
            var utils = require('utils');
            var moduleExports = module.exports;
            var typeMap = {
                'A': 'Array',
                'D': 'Date',
                'N': 'Number',
                'S': 'String',
                'F': 'Function',
                'O': 'Object'
            };
            function extractParamName(callee, argIndex) {
                return (/.*?\((.*?)\)/).exec(callee)[1].split(', ')[argIndex];
            }
            function checkArgs(spec, functionName, args, opt_callee) {
                if (!moduleExports.enableChecks) {
                    return;
                }
                var errMsg = null;
                var typeName;
                for (var i = 0; i < spec.length; ++i) {
                    var c = spec.charAt(i), cUpper = c.toUpperCase(), arg = args[i];
                    if (c == '*') {
                        continue;
                    }
                    typeName = utils.typeName(arg);
                    if ((arg === null || arg === undefined) && c == cUpper) {
                        continue;
                    }
                    if (typeName != typeMap[cUpper]) {
                        errMsg = 'Expected ' + typeMap[cUpper];
                        break;
                    }
                }
                if (errMsg) {
                    errMsg += ', but got ' + typeName + '.';
                    errMsg = 'Wrong type for parameter "' + extractParamName(opt_callee || args.callee, i) + '" of ' + functionName + ': ' + errMsg;
                    throw TypeError(errMsg);
                }
            }
            function getValue(value, defaultValue) {
                return value === undefined ? defaultValue : value;
            }
            moduleExports.checkArgs = checkArgs;
            moduleExports.getValue = getValue;
            moduleExports.enableChecks = true;
        }, { "utils": "utils" }], "cordova-plugin-device-handlers": [function (require, module, exports) {
            var deviceModel = require('./device-model');
            module.exports = {
                'Device': {
                    'getDeviceInfo': function (success, fail, args) {
                        var device = deviceModel.currentDevice;
                        success({
                            model: device.model,
                            manufacturer: device.manufacturer,
                            platform: deviceModel.currentDevicePlatform,
                            uuid: device.uuid,
                            version: deviceModel.currentDeviceVersion,
                            isVirtual: deviceModel.isVirtual,
                            serial: device.serial
                        });
                    }
                }
            };
        }, { "./device-model": 3 }], "cordova-plugin-device": [function (require, module, exports) {
            var telemetry = require('telemetry-helper'), simStatus = require('sim-status'), deviceModel = require('./device-model');
            var baseProps = {
                plugin: 'cordova-plugin-device',
                panel: 'device'
            };
            function initialize(deviceInfo, messages) {
                deviceModel.init(deviceInfo, baseProps);
                var device = deviceModel.currentDevice;
                document.getElementById('device-platform').value = deviceModel.displayedPlatform;
                var deviceList = document.getElementById('device-list');
                getSortedDevices().forEach(function (device) {
                    var option = document.createElement('option');
                    option.value = device.id;
                    var caption = document.createTextNode(device.name);
                    option.appendChild(caption);
                    deviceList.appendChild(option);
                });
                deviceList.addEventListener('change', selectedDeviceChanged);
                deviceList.value = device.id;
                var osVersions = deviceModel.osVersions;
                var osVersionList = document.getElementById('device-os-version');
                if (osVersions) {
                    osVersions.forEach(function (version) {
                        var option = document.createElement('option');
                        option.value = version;
                        var caption = document.createTextNode(version);
                        option.appendChild(caption);
                        osVersionList.appendChild(option);
                    });
                    osVersionList.style.display = '';
                    osVersionList.addEventListener('change', osVersionChanged);
                }
                else {
                    osVersionList.style.display = 'none';
                }
                updateDevice();
                registerTelemetryEvents();
                function selectedDeviceChanged() {
                    var deviceId = this.value;
                    deviceModel.selectDevice(deviceId);
                    updateDevice();
                    messages.refreshAppHost(deviceModel.currentDevice);
                }
                function osVersionChanged(e) {
                    deviceModel.currentDevice['os-version'] = this.value;
                    var device = deviceModel.currentDevice;
                    document.getElementById('device-os-version').value = device['os-version'];
                    messages.refreshAppHost(device);
                }
                function updateDevice() {
                    var device = deviceModel.currentDevice;
                    var viewportWidth = device.viewport.width;
                    var viewportHeight = device.viewport.height;
                    document.getElementById('device-os-version').value = device['os-version'];
                    document.getElementById('device-model').value = device.model;
                    document.getElementById('device-manufacturer').value = device.manufacturer;
                    document.getElementById('device-uuid').value = device.uuid;
                    document.getElementById('device-version').value = deviceModel.currentDeviceVersion;
                    document.getElementById('is-virtual-device').checked = deviceModel.isVirtual;
                    document.getElementById('device-serial').value = device.serial;
                    document.getElementById('device-resolution').value = device.resolution.width + ' x ' + device.resolution.height;
                    document.getElementById('device-viewport-size').value = viewportWidth + ' x ' + viewportHeight;
                    document.getElementById('device-pixel-ratio').value = device['pixel-ratio'];
                    notifyResize(messages, {
                        width: viewportWidth,
                        height: viewportHeight,
                        pixelRatio: device['pixel-ratio']
                    });
                }
            }
            function getSortedDevices() {
                var devicesById = deviceModel.devicesById;
                var devices = Object.getOwnPropertyNames(devicesById).map(function (deviceId) {
                    return devicesById[deviceId];
                });
                devices.sort(function (left, right) {
                    left = left.name.toUpperCase();
                    right = right.name.toUpperCase();
                    if (left < right) {
                        return -1;
                    }
                    if (right < left) {
                        return 1;
                    }
                    return 0;
                });
                return devices;
            }
            function notifyResize(messages, dimensions) {
                var width = parseInt(dimensions.width);
                var height = parseInt(dimensions.height);
                var pixelRatio = parseFloat(dimensions.pixelRatio);
                if (isNaN(width) || isNaN(height)) {
                    return;
                }
                messages.emitDebug('resize-viewport', {
                    width: width,
                    height: height,
                    pixelRatio: pixelRatio
                });
            }
            function registerTelemetryEvents() {
                var deviceList = document.getElementById('device-list');
                deviceList.addEventListener('change', function () {
                    telemetry.sendUITelemetry(Object.assign({}, baseProps, {
                        control: 'device-list',
                        value: deviceList.value
                    }));
                });
                var osVersionList = document.getElementById('device-os-version');
                osVersionList.addEventListener('change', function () {
                    telemetry.sendUITelemetry(Object.assign({}, baseProps, {
                        control: 'device-os-version',
                        value: deviceList.value
                    }));
                });
                var virtualDeviceCheckbox = document.getElementById('is-virtual-device');
                virtualDeviceCheckbox.addEventListener('click', function () {
                    deviceModel.isVirtual = virtualDeviceCheckbox.checked;
                });
            }
            module.exports = function (messages) {
                var cordovaVersionLabel = document.getElementById('device-cordova-version');
                cordovaVersionLabel.value = 'Querying...';
                simStatus.whenAppHostReady(function () {
                    messages.call('cordova-version').then(function (version) {
                        cordovaVersionLabel.value = version;
                    }).fail(function () {
                        cordovaVersionLabel.value = 'unknown';
                    });
                });
                return {
                    initialize: function (deviceInfo) {
                        initialize(deviceInfo, messages);
                    }
                };
            };
        }, { "./device-model": 3, "sim-status": "sim-status", "telemetry-helper": "telemetry-helper" }], "cordova-plugin-geolocation-handlers": [function (require, module, exports) {
            module.exports = function (messages) {
                var geo = require('./geo-model'), utils = require('utils'), PositionError = require('./PositionError'), _watches = {};
                function _getCurrentPosition(win, fail) {
                    var delay = (geo.delay || 0) * 1000;
                    window.setTimeout(function () {
                        if (geo.timeout) {
                            if (fail) {
                                fail(new PositionError(PositionError.TIMEOUT, 'Position retrieval timed out.'));
                            }
                        }
                        else {
                            win(geo.getPositionInfo());
                        }
                    }, delay);
                }
                messages.on('position-info-updated', function (message, pi) {
                    utils.forEach(_watches, function (watch) {
                        try {
                            _getCurrentPosition(watch.win, watch.fail);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    });
                });
                return {
                    Geolocation: {
                        getLocation: function (success, error) {
                            _getCurrentPosition(success, error);
                        },
                        addWatch: function (success, error, args) {
                            _watches[args[0]] = {
                                win: success,
                                fail: error
                            };
                            _getCurrentPosition(success, error);
                        },
                        clearWatch: function (success, error, args) {
                            delete _watches[args[0]];
                            if (success && typeof (success) === 'function') {
                                success();
                            }
                        },
                        getPermission: function (success, fail, args) {
                            success();
                        }
                    }
                };
            };
        }, { "./PositionError": 4, "./geo-model": 5, "utils": "utils" }], "cordova-plugin-geolocation": [function (require, module, exports) {
            var telemetry = require('telemetry-helper');
            var baseProps = {
                plugin: 'cordova-plugin-geolocation',
                panel: 'geolocation'
            };
            var mouseEventHoldDelay = 1000;
            var pendingMouseEvents = 0;
            module.exports = function (messages) {
                var constants = require('sim-constants'), geo = require('./geo-model'), db = require('db'), event = require('event'), utils = require('utils'), navUtils = utils.navHelper(), _gpsMapZoomLevel;
                geo.initialize(messages);
                function _updateGpsMap() {
                    var positionInfo = geo.getPositionInfo(), mapContainer = document.getElementById(constants.GEO.OPTIONS.MAP_CONTAINER), geoZoomValue = document.getElementById(constants.GEO.MAP_ZOOM_LEVEL_CONTAINER);
                    if (mapContainer) {
                        geo.map.setCenter(new OpenLayers.LonLat(positionInfo.longitude, positionInfo.latitude)
                            .transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:900913')), _gpsMapZoomLevel, true);
                    }
                    if (geoZoomValue) {
                        geoZoomValue.innerHTML = _gpsMapZoomLevel;
                    }
                }
                function _updateGpsMapZoom(goUp) {
                    var inc = goUp ? 1 : -1;
                    _gpsMapZoomSet(_gpsMapZoomLevel + inc);
                    _updateGpsMap();
                }
                function _gpsMapZoomSet(value) {
                    _gpsMapZoomLevel = Math.max(Math.min(value, constants.GEO.MAP_ZOOM_MAX), constants.GEO.MAP_ZOOM_MIN);
                    document.getElementById(constants.GEO.MAP_ZOOM_LEVEL_CONTAINER).innerHTML = _gpsMapZoomLevel;
                    db.save(constants.GEO.MAP_ZOOM_KEY, _gpsMapZoomLevel);
                }
                function mapEventTelemetryHandler() {
                    pendingMouseEvents++;
                    setTimeout(function () {
                        --pendingMouseEvents;
                        if (pendingMouseEvents === 0) {
                            telemetry.sendUITelemetry(Object.assign({}, baseProps, { control: 'geo-map-container' }));
                        }
                    }, mouseEventHoldDelay);
                }
                function registerTelemetryEvents() {
                    var basicTelemetryEvents = [
                        { control: 'geo-latitude' },
                        { control: 'geo-longitude' },
                        { control: 'geo-altitude' },
                        { control: 'geo-accuracy' },
                        { control: 'geo-altitude-accuracy' },
                        { control: 'geo-heading' },
                        { control: 'geo-speed' },
                        { control: 'geo-delay' },
                        { control: 'geo-gpxfile-button', event: 'click' },
                        { control: 'geo-map-zoom-decrease', event: 'click' },
                        { control: 'geo-map-zoom-increase', event: 'click' }
                    ];
                    basicTelemetryEvents.forEach(function (controlEvent) {
                        registerTelemetryForControl(controlEvent.control, controlEvent.event);
                    });
                    var previousTimeoutState = false;
                    var geoTimeoutCheckbox = document.querySelector('#geo-timeout');
                    geoTimeoutCheckbox.onclick = function () {
                        if (geoTimeoutCheckbox.checked !== previousTimeoutState) {
                            previousTimeoutState = geoTimeoutCheckbox.checked;
                            telemetry.sendUITelemetry(Object.assign({}, baseProps, { control: 'geo-timeout' }));
                        }
                    };
                    document.getElementById('geo-gpx-go').onclick = function () {
                        var rateList = document.getElementById('geo-gpxmultiplier-select');
                        var option = rateList.options[rateList.selectedIndex];
                        telemetry.sendUITelemetry(Object.assign({}, baseProps, { control: 'geo-gpx-go', value: option.value }));
                    };
                    document.getElementById('geo-map-container').onwheel = mapEventTelemetryHandler;
                }
                function registerTelemetryForControl(controlId, event) {
                    event = event || 'change';
                    document.getElementById(controlId).addEventListener(event, telemetry.sendUITelemetry.bind(this, Object.assign({}, baseProps, { control: controlId })));
                }
                return {
                    panel: {
                        domId: 'gps-container',
                        collapsed: true,
                        pane: 'right'
                    },
                    initialize: function () {
                        var GEO_OPTIONS = constants.GEO.OPTIONS, positionInfo = geo.getPositionInfo(), positionUpdatedMessage = 'position-info-updated', latitude = document.getElementById(GEO_OPTIONS.LATITUDE), longitude = document.getElementById(GEO_OPTIONS.LONGITUDE), altitude = document.getElementById(GEO_OPTIONS.ALTITUDE), accuracy = document.getElementById(GEO_OPTIONS.ACCURACY), altitudeAccuracy = document.getElementById(GEO_OPTIONS.ALTITUDE_ACCURACY), heading = document.getElementById(GEO_OPTIONS.HEADING), speed = document.getElementById(GEO_OPTIONS.SPEED), delay = document.getElementById(GEO_OPTIONS.DELAY), delayLabel = document.getElementById(GEO_OPTIONS.DELAY_LABEL), headingLabel = document.getElementById(GEO_OPTIONS.HEADING_LABEL), headingMapLabel = document.getElementById(GEO_OPTIONS.HEADING_MAP_LABEL), timeout = document.getElementById(GEO_OPTIONS.TIMEOUT), gpxMultiplier = document.getElementById(GEO_OPTIONS.GPXMULTIPLIER), gpxReplayStatus = document.getElementById(GEO_OPTIONS.GPXREPLAYSTATUS), gpxGo = document.getElementById(GEO_OPTIONS.GPXGO), mapMarker = document.getElementById(GEO_OPTIONS.MAP_MARKER), mapContainer = document.getElementById(GEO_OPTIONS.MAP_CONTAINER), map = null, track = [], _replayingGpxFile = false, _haltGpxReplay = false;
                        var updateGeoPending = false;
                        function updateGeo() {
                            if (!updateGeoPending) {
                                updateGeoPending = true;
                                window.setTimeout(function () {
                                    geo.updatePositionInfo({
                                        latitude: parseFloat(latitude.value),
                                        longitude: parseFloat(longitude.value),
                                        altitude: parseInt(altitude.value, 10),
                                        accuracy: parseInt(accuracy.value, 10),
                                        altitudeAccuracy: parseInt(altitudeAccuracy.value, 10),
                                        heading: heading.value ? parseFloat(heading.value) : 0,
                                        speed: speed.value ? parseInt(speed.value, 10) : 0,
                                        timeStamp: new Date()
                                    }, delay.value, timeout.checked);
                                    updateGeoPending = false;
                                }, 0);
                            }
                        }
                        function onHeadingValueUpdated(value) {
                            heading.value = value;
                            var headingDeg = parseInt(heading.value), headingText = navUtils.getDirection(headingDeg);
                            headingLabel.value = headingText;
                            headingMapLabel.innerHTML = headingText + '</br>' + headingDeg + '&deg;';
                            var style = ['-webkit-transform', '-ms-transform', '-moz-transform', '-o-transform', 'transform'].map(function (prop) {
                                return prop + ': rotate(' + headingDeg + 'deg);';
                            }).join(' ');
                            mapMarker.setAttribute('style', style);
                        }
                        function updateHeadingValues() {
                            messages.emit('device-orientation-updated', heading.value, true);
                        }
                        function updateValsFromMap() {
                            var center = geo.map.getCenter().transform(new OpenLayers.Projection('EPSG:900913'), new OpenLayers.Projection('EPSG:4326'));
                            longitude.value = center.lon;
                            latitude.value = center.lat;
                            _gpsMapZoomSet(geo.map.zoom);
                            updateGeo();
                        }
                        function initializeValues() {
                            latitude.value = positionInfo.latitude;
                            longitude.value = positionInfo.longitude;
                            altitude.value = positionInfo.altitude;
                            accuracy.value = positionInfo.accuracy;
                            altitudeAccuracy.value = positionInfo.altitudeAccuracy;
                            delay.value = document.getElementById(GEO_OPTIONS.DELAY_LABEL).value = geo.delay || 0;
                            if (geo.timeout) {
                                timeout.checked = true;
                            }
                            updateHeadingValues();
                        }
                        function initMap() {
                            OpenLayers.ImgPath = 'http://openlayers.org/api/img/';
                            geo.map = new OpenLayers.Map(mapContainer, { controls: [], theme: null });
                            geo.map.addLayer(new OpenLayers.Layer.OSM());
                            geo.map.addControl(new OpenLayers.Control.Navigation());
                            var clickHandler = new OpenLayers.Handler.Click(this, {
                                click: function (e) {
                                    var lonlat = geo.map.getLonLatFromViewPortPx(e.xy);
                                    mapEventTelemetryHandler();
                                    geo.map.panTo(new OpenLayers.LonLat(lonlat.lon, lonlat.lat), _gpsMapZoomLevel);
                                },
                                dblclick: function () {
                                    mapEventTelemetryHandler();
                                    _updateGpsMapZoom(true);
                                }
                            }, { double: true });
                            clickHandler.setMap(geo.map);
                            clickHandler.activate();
                            geo.map.events.register('moveend', map, function () {
                                mapEventTelemetryHandler();
                                updateValsFromMap();
                            });
                            event.on('ApplicationState', function (obj) {
                                if (obj && obj[0].id === 'gps-container' && obj.hasClass('ui-box-open')) {
                                    _updateGpsMap();
                                }
                            });
                        }
                        function loadGpxFile(filename) {
                            var reader = new FileReader(), t, att, lastAtt, _ele, _timestamp, _lastTimestamp, _useTimestamp = new Date().getTime(), _tempTimestamp, _tempPosition, _lastPosition, _useLastTimestamp, _heading = 0, _speed = 0, _dist = 0;
                            reader.onload = function (e) {
                                function parseXml(xml) {
                                    return new DOMParser().parseFromString(xml, 'text/xml');
                                }
                                t = parseXml(e.target.result).querySelectorAll('trkpt');
                                track = [];
                                utils.forEach(t, function (p, i) {
                                    if (!isNaN(i)) {
                                        att = t[i].attributes;
                                        _ele = t[i].querySelectorAll('ele')[0];
                                        _timestamp = t[i].querySelectorAll('time')[0];
                                        if (_timestamp) {
                                            _useTimestamp = new Date(_timestamp.innerHTML).getTime();
                                        }
                                        if (t[i - 1]) {
                                            lastAtt = t[i - 1].attributes;
                                            _lastTimestamp = t[i - 1].querySelectorAll('time')[0];
                                            _dist = navUtils.getDistance(att['lat'].value, att['lon'].value, lastAtt['lat'].value, lastAtt['lon'].value);
                                            if (_lastTimestamp) {
                                                _useLastTimestamp = new Date(_lastTimestamp.innerHTML).getTime();
                                            }
                                            else {
                                                _useLastTimestamp = _useTimestamp;
                                                _useTimestamp += Math.round(_dist / 22.2222 * 1000);
                                            }
                                            _heading = navUtils.getHeading(lastAtt['lat'].value, lastAtt['lon'].value, att['lat'].value, att['lon'].value);
                                            _speed = (_dist / ((_useTimestamp - _useLastTimestamp) / 1000)).toFixed(2);
                                            if (!_lastTimestamp) {
                                                _tempTimestamp = _useLastTimestamp;
                                                while (_useTimestamp - _tempTimestamp > 1000) {
                                                    _tempTimestamp += 1000;
                                                    _lastPosition = track[track.length - 1].coords;
                                                    _tempPosition = navUtils.simulateTravel(_lastPosition.latitude, _lastPosition.longitude, _heading, _speed);
                                                    track.push({
                                                        coords: {
                                                            latitude: _tempPosition.latitude,
                                                            longitude: _tempPosition.longitude,
                                                            altitude: _ele ? _ele.innerHTML : 0,
                                                            accuracy: 150,
                                                            altitudeAccuracy: 80,
                                                            heading: _heading,
                                                            speed: _speed
                                                        },
                                                        timestamp: _tempTimestamp
                                                    });
                                                }
                                            }
                                        }
                                        track.push({
                                            coords: {
                                                latitude: att.lat.value,
                                                longitude: att.lon.value,
                                                altitude: _ele ? _ele.innerHTML : 0,
                                                accuracy: 150,
                                                altitudeAccuracy: 80,
                                                heading: _heading,
                                                speed: _speed
                                            },
                                            timestamp: _useTimestamp
                                        });
                                    }
                                });
                            };
                            reader.onerror = function (e) {
                                console.log('Error reading gpx file ' + filename + ': ' + e);
                            };
                            reader.readAsText(filename, 'UTF-8');
                        }
                        function replayGpxTrack() {
                            if (_replayingGpxFile) {
                                _haltGpxReplay = true;
                                gpxGo.textContent = constants.GEO.GPXGO_LABELS.GO;
                            }
                            else {
                                if (track.length > 0) {
                                    _haltGpxReplay = false;
                                    gpxGo.textContent = constants.GEO.GPXGO_LABELS.STOP;
                                    latitude.value = track[0].coords.latitude;
                                    longitude.value = track[0].coords.longitude;
                                    altitude.value = track[0].coords.altitude;
                                    accuracy.value = track[0].coords.accuracy;
                                    altitudeAccuracy.value = track[0].coords.altitudeAccuracy;
                                    heading.value = track[0].coords.heading;
                                    speed.value = track[0].coords.speed;
                                    updateGeo();
                                    updateHeadingValues();
                                    moveNextGpxTrack(1);
                                }
                            }
                        }
                        function moveNextGpxTrack(i) {
                            if (_haltGpxReplay) {
                                _replayingGpxFile = false;
                                _haltGpxReplay = false;
                                console.log('User interrupted replay of GPX file.');
                            }
                            else {
                                _replayingGpxFile = true;
                                var _timeMultiplier = !isNaN(gpxMultiplier.value) ? gpxMultiplier.value : 1, _step = 0, _interval = 0;
                                while (_interval < 250) {
                                    _step++;
                                    if ((i + _step) >= track.length) {
                                        break;
                                    }
                                    _interval = (track[i + _step].timestamp - track[i].timestamp) / _timeMultiplier;
                                }
                                gpxReplayStatus.textContent = (_interval / 1000).toFixed(2) + 's (' + (_interval / 1000 * _timeMultiplier).toFixed(2) + 's realtime), ' + (i + 1) + ' of ' + track.length + ' (stepping ' + _step + ' at ' + _timeMultiplier + 'x)';
                                setTimeout(function () {
                                    latitude.value = track[i].coords.latitude;
                                    longitude.value = track[i].coords.longitude;
                                    altitude.value = track[i].coords.altitude;
                                    accuracy.value = track[i].coords.accuracy;
                                    altitudeAccuracy.value = track[i].coords.altitudeAccuracy;
                                    heading.value = track[i].coords.heading;
                                    speed.value = track[i].coords.speed;
                                    updateGeo();
                                    updateHeadingValues();
                                    if (track[i + _step]) {
                                        moveNextGpxTrack(i + _step);
                                    }
                                    else {
                                        if (i < track.length - 1) {
                                            moveNextGpxTrack(track.length - 1);
                                        }
                                        else {
                                            _replayingGpxFile = false;
                                            gpxGo.textContent = constants.GEO.GPXGO_LABELS.GO;
                                            console.log('Finished replaying GPX file.');
                                        }
                                    }
                                }, _interval);
                            }
                        }
                        _gpsMapZoomLevel = db.retrieve(constants.GEO.MAP_ZOOM_KEY) || 14;
                        document.querySelector('#geo-map-zoom-decrease').addEventListener('click', function () {
                            _updateGpsMapZoom(false);
                        });
                        document.querySelector('#geo-map-zoom-increase').addEventListener('click', function () {
                            _updateGpsMapZoom(true);
                        });
                        latitude.addEventListener('change', updateGeo);
                        longitude.addEventListener('change', updateGeo);
                        altitude.addEventListener('change', updateGeo);
                        accuracy.addEventListener('change', updateGeo);
                        altitudeAccuracy.addEventListener('change', updateGeo);
                        speed.addEventListener('change', updateGeo);
                        delay.addEventListener('change', function () {
                            updateGeo();
                            delayLabel.value = delay.value;
                        });
                        delay.addEventListener('input', function () {
                            updateGeo();
                            delayLabel.value = delay.value;
                        });
                        timeout.addEventListener('click', updateGeo);
                        var gpxFileLoader = document.querySelector('#' + GEO_OPTIONS.GPXFILE);
                        var gpxFileButton = document.querySelector('#geo-gpxfile-button');
                        gpxFileButton.addEventListener('click', function () {
                            gpxFileLoader.input.click();
                        });
                        gpxFileLoader.accept = '.gpx,.GPX';
                        gpxFileLoader.addEventListener('change', function () {
                            var selectedFiles = this.files;
                            if (selectedFiles.length > 0) {
                                loadGpxFile(selectedFiles[0]);
                                gpxFileButton.textContent = selectedFiles[0].name;
                            }
                            else {
                                gpxFileButton.textContent = 'Choose File';
                            }
                        });
                        gpxGo.addEventListener('click', function () {
                            replayGpxTrack();
                        });
                        heading.addEventListener('change', function () {
                            updateGeo();
                            updateHeadingValues();
                        });
                        heading.addEventListener('input', function () {
                            updateGeo();
                            updateHeadingValues();
                        });
                        heading.value = positionInfo.heading;
                        speed.value = positionInfo.speed;
                        initMap();
                        messages.on('device-orientation-updated', function (event, value) {
                            onHeadingValueUpdated(value);
                        }, true);
                        initializeValues();
                        messages.on(positionUpdatedMessage, function () {
                            _updateGpsMap();
                        });
                        updateGeo();
                        registerTelemetryEvents();
                    }
                };
            };
        }, { "./geo-model": 5, "db": "db", "event": "event", "sim-constants": "sim-constants", "telemetry-helper": "telemetry-helper", "utils": "utils" }], "cordova-plugin-inappbrowser": [function (require, module, exports) {
            var db = require('db'), telemetry = require('telemetry-helper');
            var baseProps = {
                plugin: 'cordova-plugin-inappbrowser',
                panel: 'inappbrowser'
            };
            module.exports = function (messages) {
                var INAPPBROWSER_SELECTION = 'inappbrowser-key';
                var currentSelection = db.retrieve(INAPPBROWSER_SELECTION) || 'iframe';
                messages.register('inAppBrowserSelected', function (callback) {
                    callback(null, currentSelection);
                });
                function updateSelection(selection) {
                    currentSelection = selection;
                    db.save(INAPPBROWSER_SELECTION, currentSelection);
                    messages.emit('inappbrowser-selected', currentSelection);
                }
                function initialize() {
                    var optionsGroup = document.getElementById('inappbrowser-options');
                    optionsGroup.querySelector('[data-inappbrowser="' + currentSelection + '"]').checked = true;
                    optionsGroup.addEventListener('click', function (event) {
                        var target = event.target, selection = target.getAttribute('data-inappbrowser');
                        if (currentSelection !== selection) {
                            updateSelection(selection);
                            telemetry.sendUITelemetry(Object.assign({}, baseProps, { control: selection }));
                        }
                    });
                }
                return {
                    initialize: initialize
                };
            };
        }, { "db": "db", "telemetry-helper": "telemetry-helper" }], "cordova-plugin-statusbar-handlers": [function (require, module, exports) {
            module.exports = {
                'StatusBar': {
                    '_ready': function (successCallback) {
                        successCallback(false);
                    }
                }
            };
        }, {}], "db": [function (require, module, exports) {
            var Q = require('q'), utils = require('utils'), constants = require('sim-constants'), event = require('event'), DB_NAME = 'ripple', cache, self, opendb;
            function saveToStorage() {
                localStorage[DB_NAME] = JSON.stringify(cache);
            }
            function validateAndSetPrefix(prefix) {
                if (prefix) {
                    utils.validateArgumentType(prefix, 'string');
                }
                return prefix || constants.COMMON.PREFIX;
            }
            function createKey(key, prefix) {
                return validateAndSetPrefix(prefix) + key;
            }
            function createItem(key, value, prefix) {
                return {
                    id: createKey(key, prefix),
                    key: key,
                    value: value,
                    prefix: validateAndSetPrefix(prefix)
                };
            }
            function save(key, value, prefix, callback) {
                var item = createItem(key, value, prefix);
                cache[item.id] = item;
                if (!window.openDatabase) {
                    saveToStorage();
                    if (callback) {
                        callback();
                    }
                }
                else {
                    opendb.transaction(function (tx) {
                        tx.executeSql('REPLACE INTO persistence (id, key, value, prefix) VALUES (?, ?, ?, ?)', [item.id, item.key, item.value, item.prefix], function () {
                            return callback && callback();
                        });
                    });
                }
            }
            function retrieve(key, prefix) {
                var item = cache[createKey(key, prefix)];
                return item ? item.value : undefined;
            }
            function retrieveAll(prefix, callback) {
                var result = {};
                if (prefix) {
                    utils.forEach(cache, function (value) {
                        if (value.prefix === prefix) {
                            result[value.key] = value.value;
                        }
                    });
                }
                if (callback) {
                    callback(result);
                }
            }
            function remove(key, prefix, callback) {
                var id = createKey(key, prefix);
                delete cache[id];
                if (!window.openDatabase) {
                    saveToStorage();
                    if (callback) {
                        callback();
                    }
                }
                else {
                    opendb.transaction(function (tx) {
                        tx.executeSql('DELETE FROM persistence WHERE key = ? AND prefix = ?', [key, validateAndSetPrefix(prefix)], function () {
                            return callback && callback();
                        });
                    });
                }
            }
            function removeAll(callback) {
                cache = {};
                if (!window.openDatabase) {
                    delete localStorage[DB_NAME];
                    saveToStorage();
                }
                else {
                    opendb.transaction(function (tx) {
                        tx.executeSql('DELETE FROM persistence', [], function () {
                            return callback && callback();
                        });
                    });
                }
            }
            self = {
                save: function (key, value, prefix, callback) {
                    save(key, value, prefix, callback);
                    event.trigger('StorageUpdatedEvent');
                },
                saveObject: function (key, obj, prefix, callback) {
                    save(key, JSON.stringify(obj), prefix, callback);
                    event.trigger('StorageUpdatedEvent');
                },
                retrieve: function (key, prefix) {
                    return retrieve(key, prefix);
                },
                retrieveObject: function (key, prefix) {
                    var retrievedValue = retrieve(key, prefix);
                    return retrievedValue ? JSON.parse(retrievedValue) : retrievedValue;
                },
                retrieveAll: function (prefix, callback) {
                    return retrieveAll(prefix, callback);
                },
                remove: function (key, prefix, callback) {
                    event.trigger('StorageUpdatedEvent');
                    remove(key, prefix, callback);
                },
                removeAll: function (callback) {
                    removeAll(callback);
                    event.trigger('StorageUpdatedEvent');
                },
                initialize: function () {
                    var d = Q.defer();
                    if (!window.openDatabase) {
                        var store = localStorage[DB_NAME];
                        cache = store ? JSON.parse(store) : {};
                        saveToStorage();
                        d.resolve();
                    }
                    else {
                        cache = {};
                        opendb = openDatabase('tinyHippos', '1.0', 'tiny Hippos persistence', 2 * 1024 * 1024);
                        opendb.transaction(function (tx) {
                            tx.executeSql('CREATE TABLE IF NOT EXISTS persistence (id unique, key, value, prefix)');
                            tx.executeSql('SELECT id, key, value, prefix FROM persistence', [], function (tx, results) {
                                var len = results.rows.length, i, item;
                                for (i = 0; i < len; i++) {
                                    item = results.rows.item(i);
                                    cache[item.id] = item;
                                }
                                d.resolve();
                            });
                        });
                    }
                    return d.promise;
                }
            };
            module.exports = self;
        }, { "event": "event", "q": 1, "sim-constants": "sim-constants", "utils": "utils" }], "dialog": [function (require, module, exports) {
            var pluginDialogs = {};
            var currentDialogId = null;
            var dialogQueue = [];
            module.exports.pluginDialogs = pluginDialogs;
            var panelsDisabled = false;
            var activeElement = null;
            function showDialog(dialogId, cb) {
                var dialog = pluginDialogs[dialogId];
                if (!dialog) {
                    throw 'No dialog defined with id ' + dialogId;
                }
                if (currentDialogId) {
                    dialogQueue.push({ id: dialogId, callback: cb });
                    return;
                }
                cb && cb('showing');
                currentDialogId = dialogId;
                if (!panelsDisabled) {
                    activeElement = document.activeElement;
                    getPanels().forEach(function (panel) {
                        panel.enabled = false;
                    });
                    panelsDisabled = true;
                }
                dialog.show();
                cb && cb('shown');
            }
            module.exports.showDialog = showDialog;
            function hideDialog(dialogId) {
                if (!dialogId) {
                    dialogId = currentDialogId;
                    if (!dialogId) {
                        throw 'Trying to hide dialog when none is showing.';
                    }
                }
                else {
                    if (dialogId !== currentDialogId) {
                        throw 'Trying to hide a dialog that isn\'t currently showing: ' + dialogId;
                    }
                }
                var dialog = pluginDialogs[dialogId];
                if (!dialog) {
                    throw 'No dialog defined with id ' + dialogId;
                }
                currentDialogId = null;
                dialog.hide();
                window.setTimeout(function () {
                    if (currentDialogId) {
                        return;
                    }
                    var dialogInfo = findNextDialog();
                    if (dialogInfo) {
                        showDialog(dialogInfo.id, dialogInfo.callback);
                    }
                    else {
                        getPanels().forEach(function (panel) {
                            panel.enabled = true;
                        });
                        if (activeElement) {
                            activeElement.focus();
                            activeElement = null;
                        }
                        panelsDisabled = false;
                    }
                }, 0);
            }
            module.exports.hideDialog = hideDialog;
            function getPanels() {
                return Array.prototype.slice.call(document.querySelectorAll('body /deep/ cordova-panel'));
            }
            function findNextDialog() {
                while (dialogQueue.length) {
                    var dialogInfo = dialogQueue.shift();
                    var cb = dialogInfo.callback;
                    if (!cb || cb('query-show') !== false) {
                        return dialogInfo;
                    }
                }
                return null;
            }
        }, {}], "events": [function (require, module, exports) {
            var telemetry = require('telemetry-helper');
            var baseProps = {
                plugin: 'events',
                panel: 'events'
            };
            module.exports = function (messages) {
                function initialize() {
                    var eventList = document.getElementById('event-list');
                    var events = ['backbutton', 'menubutton', 'pause', 'resume', 'searchbutton', 'online', 'offline'];
                    events.forEach(function (event) {
                        var option = document.createElement('option');
                        option.value = event;
                        var caption = document.createTextNode(event);
                        option.appendChild(caption);
                        eventList.appendChild(option);
                    });
                    document.getElementById('event-fire').addEventListener('click', function () {
                        var eventList = document.getElementById('event-list');
                        var option = eventList.options[eventList.selectedIndex];
                        telemetry.sendUITelemetry(Object.assign({}, baseProps, { control: 'event-fire', value: option.value }));
                        messages.call('event', option.value).then(function (result) {
                            console.log('Fired event: ' + result);
                        }, function (err) {
                            console.log('Firing event failed: ' + err);
                        });
                    });
                }
                return {
                    initialize: initialize
                };
            };
        }, { "telemetry-helper": "telemetry-helper" }], "event": [function (require, module, exports) {
            var utils = require('utils'), exception = require('exception'), _listeners = {};
            function _on(eventType, listener, scope, once) {
                if (!eventType) {
                    throw 'eventType must be truthy';
                }
                _listeners[eventType] = _listeners[eventType] || [];
                _listeners[eventType].push({
                    func: listener,
                    scope: scope,
                    once: !!once
                });
            }
            function _trigger(listener, args, sync) {
                try {
                    if (sync) {
                        listener.func.apply(listener.scope, args);
                    }
                    else {
                        setTimeout(function () {
                            listener.func.apply(listener.scope, args);
                        }, 1);
                    }
                }
                catch (e) {
                    exception.handle(e);
                }
            }
            module.exports = {
                on: function (eventType, listener, scope) {
                    _on(eventType, listener, scope, false);
                },
                once: function (eventType, listener, scope) {
                    _on(eventType, listener, scope, true);
                },
                trigger: function (eventType, args, sync) {
                    args = args || [];
                    sync = sync || false;
                    var listeners = _listeners[eventType];
                    if (listeners) {
                        listeners.forEach(function (listener) {
                            _trigger(listener, args, sync);
                        });
                        _listeners[eventType] = listeners.filter(function (listener) {
                            return !listener.once;
                        });
                    }
                },
                eventHasSubscriber: function (eventType) {
                    return !!_listeners[eventType];
                },
                getEventSubscribers: function (eventType) {
                    return utils.copy(_listeners[eventType]) || [];
                },
                clear: function (eventType) {
                    if (eventType) {
                        delete _listeners[eventType];
                    }
                }
            };
        }, { "exception": "exception", "utils": "utils" }], "exception": [function (require, module, exports) {
            function _getStack(depth) {
                var caller, stack = '', count = 0;
                try {
                    caller = arguments.callee.caller.arguments.callee.caller;
                    while (count <= depth && caller) {
                        stack += 'function: ' + caller.toString().match(/function\s?(.*)\{/)[1] + '\n';
                        caller = caller.arguments.callee.caller;
                        count++;
                    }
                }
                catch (e) {
                    stack = 'failed to determine stack trace (' + (e.name || e.type) + ' :: ' + e.message + ')';
                }
                return stack;
            }
            module.exports = {
                types: {
                    Application: 'Application',
                    ArgumentLength: 'ArgumentLength',
                    ArgumentType: 'ArgumentType',
                    Argument: 'Argument',
                    NotificationType: 'NotificationType',
                    NotificationStateType: 'NotificationStateType',
                    DomObjectNotFound: 'DomObjectNotFound',
                    LayoutType: 'LayoutType',
                    DeviceNotFound: 'DeviceNotFound',
                    tinyHipposMaskedException: 'tinyHipposMaskedException',
                    Geo: 'Geo',
                    Accelerometer: 'Accelerometer',
                    MethodNotImplemented: 'MethodNotImplemented',
                    InvalidState: 'InvalidState',
                    ApplicationState: 'ApplicationState'
                },
                handle: function handle(exception, reThrow) {
                    reThrow = reThrow || false;
                    var eMsg = exception.message || 'exception caught!', msg = eMsg + '\n\n' + (exception.stack || '*no stack provided*') + '\n\n';
                    console.error(msg);
                    if (reThrow) {
                        throw exception;
                    }
                },
                raise: function raise(exceptionType, message, customExceptionObject) {
                    var obj = customExceptionObject || {
                        type: '',
                        message: '',
                        toString: function () {
                            var result = this.name + ': \'' + this.message + '\'';
                            if (this.stack) {
                                result += '\n' + this.stack;
                            }
                            return result;
                        }
                    };
                    message = message || '';
                    obj.name = exceptionType;
                    obj.type = exceptionType;
                    obj.message = message;
                    obj.stack = _getStack(5);
                    throw obj;
                }
            };
        }, {}], "exec-handlers": [function (require, module, exports) {
            var dialog = require('dialog');
            var savedSims = require('./saved-sims');
            var telemetry = require('telemetry-helper');
            module.exports = {
                '*': {
                    '*': function (success, fail, service, action, args) {
                        if (!success && !fail) {
                            return;
                        }
                        if (handleSavedSim(success, fail, service, action)) {
                            return;
                        }
                        dialog.showDialog('exec-dialog', function (msg) {
                            if (msg === 'query-show') {
                                return !handleSavedSim(success, fail, service, action);
                            }
                            else if (msg === 'showing') {
                                var successButton = document.getElementById('exec-success');
                                var failureButton = document.getElementById('exec-failure');
                                var resultField = document.getElementById('exec-response');
                                var errorDisplay = document.getElementById('exec-error');
                                errorDisplay.style.display = 'none';
                                document.getElementById('exec-service').textContent = service;
                                document.getElementById('exec-action').textContent = action;
                                document.getElementById('exec-args').textContent = (args || []).map(JSON.stringify).join(', ');
                                function handleSuccess() {
                                    exec(success, true);
                                }
                                function handleFailure() {
                                    exec(fail);
                                }
                                function exec(func, isSuccess) {
                                    var result = resultField.value;
                                    var shouldPersist = document.getElementById('exec-persist').checked;
                                    try {
                                        result = result && JSON.parse(result);
                                    }
                                    catch (e) {
                                        document.getElementById('exec-parse-error').textContent = e.toString();
                                        errorDisplay.style.display = '';
                                        return;
                                    }
                                    dialog.hideDialog('exec-dialog');
                                    if (shouldPersist) {
                                        savedSims.addSim({ service: service, action: action, args: args, value: result, success: isSuccess });
                                    }
                                    sendExecUnhandledTelemetry(service, action, false, isSuccess, resultHasValue(result), shouldPersist);
                                    func.apply(null, result ? [result] : []);
                                }
                                successButton.onclick = handleSuccess;
                                failureButton.onclick = handleFailure;
                                resultField.value = '';
                            }
                        });
                    }
                }
            };
            function handleSavedSim(success, fail, service, action) {
                var savedSim = savedSims.findSavedSim(service, action);
                if (savedSim) {
                    var isSuccess = !!savedSim.success;
                    sendExecUnhandledTelemetry(service, action, true, isSuccess, resultHasValue(savedSim.value));
                    if (isSuccess) {
                        success(savedSim.value);
                    }
                    else {
                        fail(savedSim.value);
                    }
                    return true;
                }
                return false;
            }
            function sendExecUnhandledTelemetry(service, action, hasPersisted, isSuccess, hasResult, saveResult) {
                var props = {
                    'service': service,
                    'action': action,
                    'has-persisted-result': hasPersisted,
                    'is-success': isSuccess,
                    'has-result-value': hasResult
                };
                if (!hasPersisted) {
                    props['save-result'] = !!saveResult;
                }
                telemetry.sendClientTelemetry('exec-unhandled', props);
            }
            function resultHasValue(result) {
                return typeof result !== 'undefined' && result !== '';
            }
        }, { "./saved-sims": 6, "dialog": "dialog", "telemetry-helper": "telemetry-helper" }], "exec": [function (require, module, exports) {
            var savedSims = require('./saved-sims');
            var event = require('event');
            var emptyLabel;
            var execList;
            module.exports = {
                initialize: function () {
                    var sims = savedSims.sims;
                    emptyLabel = document.getElementById('empty-label');
                    execList = document.getElementById('exec-list');
                    execList.addEventListener('itemremoved', function (e) {
                        savedSims.removeSim(e.detail.itemIndex);
                        if (!savedSims.sims.length) {
                            showEmptyLabel();
                        }
                    });
                    event.on('saved-sim-added', function (sim) {
                        hideEmptyLabel();
                        execList.addItem(cordovaItemFromSim(sim));
                    });
                    if (sims && sims.length) {
                        sims.forEach(function (sim) {
                            execList.addItem(cordovaItemFromSim(sim));
                        });
                    }
                    else {
                        showEmptyLabel();
                    }
                }
            };
            function cordovaItemFromSim(sim) {
                var labeledValue = new CordovaLabeledValue();
                labeledValue.label = sim.service + '.' + sim.action;
                var value = sim.value;
                if (typeof value === 'object') {
                    try {
                        value = JSON.stringify(value);
                    }
                    catch (e) {
                    }
                }
                labeledValue.value = value;
                var cordovaItem = new CordovaItem();
                cordovaItem.appendChild(labeledValue);
                return cordovaItem;
            }
            function showEmptyLabel() {
                emptyLabel.classList.remove('cordova-hidden');
                execList.classList.add('cordova-hidden');
            }
            function hideEmptyLabel() {
                emptyLabel.classList.add('cordova-hidden');
                execList.classList.remove('cordova-hidden');
            }
        }, { "./saved-sims": 6, "event": "event" }], "jquery.min": [function (require, module, exports) {
            !function (a, b) { "object" == typeof module && "object" == typeof module.exports ? module.exports = a.document ? b(a, !0) : function (a) { if (!a.document)
                throw new Error("jQuery requires a window with a document"); return b(a); } : b(a); }("undefined" != typeof window ? window : this, function (a, b) {
                var c = [], d = c.slice, e = c.concat, f = c.push, g = c.indexOf, h = {}, i = h.toString, j = h.hasOwnProperty, k = {}, l = a.document, m = "2.1.4", n = function (a, b) { return new n.fn.init(a, b); }, o = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, p = /^-ms-/, q = /-([\da-z])/gi, r = function (a, b) { return b.toUpperCase(); };
                n.fn = n.prototype = { jquery: m, constructor: n, selector: "", length: 0, toArray: function () { return d.call(this); }, get: function (a) { return null != a ? 0 > a ? this[a + this.length] : this[a] : d.call(this); }, pushStack: function (a) { var b = n.merge(this.constructor(), a); return b.prevObject = this, b.context = this.context, b; }, each: function (a, b) { return n.each(this, a, b); }, map: function (a) { return this.pushStack(n.map(this, function (b, c) { return a.call(b, c, b); })); }, slice: function () { return this.pushStack(d.apply(this, arguments)); }, first: function () { return this.eq(0); }, last: function () { return this.eq(-1); }, eq: function (a) { var b = this.length, c = +a + (0 > a ? b : 0); return this.pushStack(c >= 0 && b > c ? [this[c]] : []); }, end: function () { return this.prevObject || this.constructor(null); }, push: f, sort: c.sort, splice: c.splice }, n.extend = n.fn.extend = function () { var a, b, c, d, e, f, g = arguments[0] || {}, h = 1, i = arguments.length, j = !1; for ("boolean" == typeof g && (j = g, g = arguments[h] || {}, h++), "object" == typeof g || n.isFunction(g) || (g = {}), h === i && (g = this, h--); i > h; h++)
                    if (null != (a = arguments[h]))
                        for (b in a)
                            c = g[b], d = a[b], g !== d && (j && d && (n.isPlainObject(d) || (e = n.isArray(d))) ? (e ? (e = !1, f = c && n.isArray(c) ? c : []) : f = c && n.isPlainObject(c) ? c : {}, g[b] = n.extend(j, f, d)) : void 0 !== d && (g[b] = d)); return g; }, n.extend({ expando: "jQuery" + (m + Math.random()).replace(/\D/g, ""), isReady: !0, error: function (a) { throw new Error(a); }, noop: function () { }, isFunction: function (a) { return "function" === n.type(a); }, isArray: Array.isArray, isWindow: function (a) { return null != a && a === a.window; }, isNumeric: function (a) { return !n.isArray(a) && a - parseFloat(a) + 1 >= 0; }, isPlainObject: function (a) { return "object" !== n.type(a) || a.nodeType || n.isWindow(a) ? !1 : a.constructor && !j.call(a.constructor.prototype, "isPrototypeOf") ? !1 : !0; }, isEmptyObject: function (a) { var b; for (b in a)
                        return !1; return !0; }, type: function (a) { return null == a ? a + "" : "object" == typeof a || "function" == typeof a ? h[i.call(a)] || "object" : typeof a; }, globalEval: function (a) { var b, c = eval; a = n.trim(a), a && (1 === a.indexOf("use strict") ? (b = l.createElement("script"), b.text = a, l.head.appendChild(b).parentNode.removeChild(b)) : c(a)); }, camelCase: function (a) { return a.replace(p, "ms-").replace(q, r); }, nodeName: function (a, b) { return a.nodeName && a.nodeName.toLowerCase() === b.toLowerCase(); }, each: function (a, b, c) { var d, e = 0, f = a.length, g = s(a); if (c) {
                        if (g) {
                            for (; f > e; e++)
                                if (d = b.apply(a[e], c), d === !1)
                                    break;
                        }
                        else
                            for (e in a)
                                if (d = b.apply(a[e], c), d === !1)
                                    break;
                    }
                    else if (g) {
                        for (; f > e; e++)
                            if (d = b.call(a[e], e, a[e]), d === !1)
                                break;
                    }
                    else
                        for (e in a)
                            if (d = b.call(a[e], e, a[e]), d === !1)
                                break; return a; }, trim: function (a) { return null == a ? "" : (a + "").replace(o, ""); }, makeArray: function (a, b) { var c = b || []; return null != a && (s(Object(a)) ? n.merge(c, "string" == typeof a ? [a] : a) : f.call(c, a)), c; }, inArray: function (a, b, c) { return null == b ? -1 : g.call(b, a, c); }, merge: function (a, b) { for (var c = +b.length, d = 0, e = a.length; c > d; d++)
                        a[e++] = b[d]; return a.length = e, a; }, grep: function (a, b, c) { for (var d, e = [], f = 0, g = a.length, h = !c; g > f; f++)
                        d = !b(a[f], f), d !== h && e.push(a[f]); return e; }, map: function (a, b, c) { var d, f = 0, g = a.length, h = s(a), i = []; if (h)
                        for (; g > f; f++)
                            d = b(a[f], f, c), null != d && i.push(d);
                    else
                        for (f in a)
                            d = b(a[f], f, c), null != d && i.push(d); return e.apply([], i); }, guid: 1, proxy: function (a, b) { var c, e, f; return "string" == typeof b && (c = a[b], b = a, a = c), n.isFunction(a) ? (e = d.call(arguments, 2), f = function () { return a.apply(b || this, e.concat(d.call(arguments))); }, f.guid = a.guid = a.guid || n.guid++, f) : void 0; }, now: Date.now, support: k }), n.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (a, b) { h["[object " + b + "]"] = b.toLowerCase(); });
                function s(a) { var b = "length" in a && a.length, c = n.type(a); return "function" === c || n.isWindow(a) ? !1 : 1 === a.nodeType && b ? !0 : "array" === c || 0 === b || "number" == typeof b && b > 0 && b - 1 in a; }
                var t = function (a) { var b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u = "sizzle" + 1 * new Date, v = a.document, w = 0, x = 0, y = ha(), z = ha(), A = ha(), B = function (a, b) { return a === b && (l = !0), 0; }, C = 1 << 31, D = {}.hasOwnProperty, E = [], F = E.pop, G = E.push, H = E.push, I = E.slice, J = function (a, b) { for (var c = 0, d = a.length; d > c; c++)
                    if (a[c] === b)
                        return c; return -1; }, K = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", L = "[\\x20\\t\\r\\n\\f]", M = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", N = M.replace("w", "w#"), O = "\\[" + L + "*(" + M + ")(?:" + L + "*([*^$|!~]?=)" + L + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + N + "))|)" + L + "*\\]", P = ":(" + M + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + O + ")*)|.*)\\)|)", Q = new RegExp(L + "+", "g"), R = new RegExp("^" + L + "+|((?:^|[^\\\\])(?:\\\\.)*)" + L + "+$", "g"), S = new RegExp("^" + L + "*," + L + "*"), T = new RegExp("^" + L + "*([>+~]|" + L + ")" + L + "*"), U = new RegExp("=" + L + "*([^\\]'\"]*?)" + L + "*\\]", "g"), V = new RegExp(P), W = new RegExp("^" + N + "$"), X = { ID: new RegExp("^#(" + M + ")"), CLASS: new RegExp("^\\.(" + M + ")"), TAG: new RegExp("^(" + M.replace("w", "w*") + ")"), ATTR: new RegExp("^" + O), PSEUDO: new RegExp("^" + P), CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + L + "*(even|odd|(([+-]|)(\\d*)n|)" + L + "*(?:([+-]|)" + L + "*(\\d+)|))" + L + "*\\)|)", "i"), bool: new RegExp("^(?:" + K + ")$", "i"), needsContext: new RegExp("^" + L + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + L + "*((?:-\\d)?\\d*)" + L + "*\\)|)(?=[^-]|$)", "i") }, Y = /^(?:input|select|textarea|button)$/i, Z = /^h\d$/i, $ = /^[^{]+\{\s*\[native \w/, _ = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, aa = /[+~]/, ba = /'|\\/g, ca = new RegExp("\\\\([\\da-f]{1,6}" + L + "?|(" + L + ")|.)", "ig"), da = function (a, b, c) { var d = "0x" + b - 65536; return d !== d || c ? b : 0 > d ? String.fromCharCode(d + 65536) : String.fromCharCode(d >> 10 | 55296, 1023 & d | 56320); }, ea = function () { m(); }; try {
                    H.apply(E = I.call(v.childNodes), v.childNodes), E[v.childNodes.length].nodeType;
                }
                catch (fa) {
                    H = { apply: E.length ? function (a, b) { G.apply(a, I.call(b)); } : function (a, b) { var c = a.length, d = 0; while (a[c++] = b[d++])
                            ; a.length = c - 1; } };
                } function ga(a, b, d, e) { var f, h, j, k, l, o, r, s, w, x; if ((b ? b.ownerDocument || b : v) !== n && m(b), b = b || n, d = d || [], k = b.nodeType, "string" != typeof a || !a || 1 !== k && 9 !== k && 11 !== k)
                    return d; if (!e && p) {
                    if (11 !== k && (f = _.exec(a)))
                        if (j = f[1]) {
                            if (9 === k) {
                                if (h = b.getElementById(j), !h || !h.parentNode)
                                    return d;
                                if (h.id === j)
                                    return d.push(h), d;
                            }
                            else if (b.ownerDocument && (h = b.ownerDocument.getElementById(j)) && t(b, h) && h.id === j)
                                return d.push(h), d;
                        }
                        else {
                            if (f[2])
                                return H.apply(d, b.getElementsByTagName(a)), d;
                            if ((j = f[3]) && c.getElementsByClassName)
                                return H.apply(d, b.getElementsByClassName(j)), d;
                        }
                    if (c.qsa && (!q || !q.test(a))) {
                        if (s = r = u, w = b, x = 1 !== k && a, 1 === k && "object" !== b.nodeName.toLowerCase()) {
                            o = g(a), (r = b.getAttribute("id")) ? s = r.replace(ba, "\\$&") : b.setAttribute("id", s), s = "[id='" + s + "'] ", l = o.length;
                            while (l--)
                                o[l] = s + ra(o[l]);
                            w = aa.test(a) && pa(b.parentNode) || b, x = o.join(",");
                        }
                        if (x)
                            try {
                                return H.apply(d, w.querySelectorAll(x)), d;
                            }
                            catch (y) { }
                            finally {
                                r || b.removeAttribute("id");
                            }
                    }
                } return i(a.replace(R, "$1"), b, d, e); } function ha() { var a = []; function b(c, e) { return a.push(c + " ") > d.cacheLength && delete b[a.shift()], b[c + " "] = e; } return b; } function ia(a) { return a[u] = !0, a; } function ja(a) { var b = n.createElement("div"); try {
                    return !!a(b);
                }
                catch (c) {
                    return !1;
                }
                finally {
                    b.parentNode && b.parentNode.removeChild(b), b = null;
                } } function ka(a, b) { var c = a.split("|"), e = a.length; while (e--)
                    d.attrHandle[c[e]] = b; } function la(a, b) { var c = b && a, d = c && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || C) - (~a.sourceIndex || C); if (d)
                    return d; if (c)
                    while (c = c.nextSibling)
                        if (c === b)
                            return -1; return a ? 1 : -1; } function ma(a) { return function (b) { var c = b.nodeName.toLowerCase(); return "input" === c && b.type === a; }; } function na(a) { return function (b) { var c = b.nodeName.toLowerCase(); return ("input" === c || "button" === c) && b.type === a; }; } function oa(a) { return ia(function (b) { return b = +b, ia(function (c, d) { var e, f = a([], c.length, b), g = f.length; while (g--)
                    c[e = f[g]] && (c[e] = !(d[e] = c[e])); }); }); } function pa(a) { return a && "undefined" != typeof a.getElementsByTagName && a; } c = ga.support = {}, f = ga.isXML = function (a) { var b = a && (a.ownerDocument || a).documentElement; return b ? "HTML" !== b.nodeName : !1; }, m = ga.setDocument = function (a) { var b, e, g = a ? a.ownerDocument || a : v; return g !== n && 9 === g.nodeType && g.documentElement ? (n = g, o = g.documentElement, e = g.defaultView, e && e !== e.top && (e.addEventListener ? e.addEventListener("unload", ea, !1) : e.attachEvent && e.attachEvent("onunload", ea)), p = !f(g), c.attributes = ja(function (a) { return a.className = "i", !a.getAttribute("className"); }), c.getElementsByTagName = ja(function (a) { return a.appendChild(g.createComment("")), !a.getElementsByTagName("*").length; }), c.getElementsByClassName = $.test(g.getElementsByClassName), c.getById = ja(function (a) { return o.appendChild(a).id = u, !g.getElementsByName || !g.getElementsByName(u).length; }), c.getById ? (d.find.ID = function (a, b) { if ("undefined" != typeof b.getElementById && p) {
                    var c = b.getElementById(a);
                    return c && c.parentNode ? [c] : [];
                } }, d.filter.ID = function (a) { var b = a.replace(ca, da); return function (a) { return a.getAttribute("id") === b; }; }) : (delete d.find.ID, d.filter.ID = function (a) { var b = a.replace(ca, da); return function (a) { var c = "undefined" != typeof a.getAttributeNode && a.getAttributeNode("id"); return c && c.value === b; }; }), d.find.TAG = c.getElementsByTagName ? function (a, b) { return "undefined" != typeof b.getElementsByTagName ? b.getElementsByTagName(a) : c.qsa ? b.querySelectorAll(a) : void 0; } : function (a, b) { var c, d = [], e = 0, f = b.getElementsByTagName(a); if ("*" === a) {
                    while (c = f[e++])
                        1 === c.nodeType && d.push(c);
                    return d;
                } return f; }, d.find.CLASS = c.getElementsByClassName && function (a, b) { return p ? b.getElementsByClassName(a) : void 0; }, r = [], q = [], (c.qsa = $.test(g.querySelectorAll)) && (ja(function (a) { o.appendChild(a).innerHTML = "<a id='" + u + "'></a><select id='" + u + "-\f]' msallowcapture=''><option selected=''></option></select>", a.querySelectorAll("[msallowcapture^='']").length && q.push("[*^$]=" + L + "*(?:''|\"\")"), a.querySelectorAll("[selected]").length || q.push("\\[" + L + "*(?:value|" + K + ")"), a.querySelectorAll("[id~=" + u + "-]").length || q.push("~="), a.querySelectorAll(":checked").length || q.push(":checked"), a.querySelectorAll("a#" + u + "+*").length || q.push(".#.+[+~]"); }), ja(function (a) { var b = g.createElement("input"); b.setAttribute("type", "hidden"), a.appendChild(b).setAttribute("name", "D"), a.querySelectorAll("[name=d]").length && q.push("name" + L + "*[*^$|!~]?="), a.querySelectorAll(":enabled").length || q.push(":enabled", ":disabled"), a.querySelectorAll("*,:x"), q.push(",.*:"); })), (c.matchesSelector = $.test(s = o.matches || o.webkitMatchesSelector || o.mozMatchesSelector || o.oMatchesSelector || o.msMatchesSelector)) && ja(function (a) { c.disconnectedMatch = s.call(a, "div"), s.call(a, "[s!='']:x"), r.push("!=", P); }), q = q.length && new RegExp(q.join("|")), r = r.length && new RegExp(r.join("|")), b = $.test(o.compareDocumentPosition), t = b || $.test(o.contains) ? function (a, b) { var c = 9 === a.nodeType ? a.documentElement : a, d = b && b.parentNode; return a === d || !(!d || 1 !== d.nodeType || !(c.contains ? c.contains(d) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(d))); } : function (a, b) { if (b)
                    while (b = b.parentNode)
                        if (b === a)
                            return !0; return !1; }, B = b ? function (a, b) { if (a === b)
                    return l = !0, 0; var d = !a.compareDocumentPosition - !b.compareDocumentPosition; return d ? d : (d = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1, 1 & d || !c.sortDetached && b.compareDocumentPosition(a) === d ? a === g || a.ownerDocument === v && t(v, a) ? -1 : b === g || b.ownerDocument === v && t(v, b) ? 1 : k ? J(k, a) - J(k, b) : 0 : 4 & d ? -1 : 1); } : function (a, b) { if (a === b)
                    return l = !0, 0; var c, d = 0, e = a.parentNode, f = b.parentNode, h = [a], i = [b]; if (!e || !f)
                    return a === g ? -1 : b === g ? 1 : e ? -1 : f ? 1 : k ? J(k, a) - J(k, b) : 0; if (e === f)
                    return la(a, b); c = a; while (c = c.parentNode)
                    h.unshift(c); c = b; while (c = c.parentNode)
                    i.unshift(c); while (h[d] === i[d])
                    d++; return d ? la(h[d], i[d]) : h[d] === v ? -1 : i[d] === v ? 1 : 0; }, g) : n; }, ga.matches = function (a, b) { return ga(a, null, null, b); }, ga.matchesSelector = function (a, b) { if ((a.ownerDocument || a) !== n && m(a), b = b.replace(U, "='$1']"), !(!c.matchesSelector || !p || r && r.test(b) || q && q.test(b)))
                    try {
                        var d = s.call(a, b);
                        if (d || c.disconnectedMatch || a.document && 11 !== a.document.nodeType)
                            return d;
                    }
                    catch (e) { } return ga(b, n, null, [a]).length > 0; }, ga.contains = function (a, b) { return (a.ownerDocument || a) !== n && m(a), t(a, b); }, ga.attr = function (a, b) { (a.ownerDocument || a) !== n && m(a); var e = d.attrHandle[b.toLowerCase()], f = e && D.call(d.attrHandle, b.toLowerCase()) ? e(a, b, !p) : void 0; return void 0 !== f ? f : c.attributes || !p ? a.getAttribute(b) : (f = a.getAttributeNode(b)) && f.specified ? f.value : null; }, ga.error = function (a) { throw new Error("Syntax error, unrecognized expression: " + a); }, ga.uniqueSort = function (a) { var b, d = [], e = 0, f = 0; if (l = !c.detectDuplicates, k = !c.sortStable && a.slice(0), a.sort(B), l) {
                    while (b = a[f++])
                        b === a[f] && (e = d.push(f));
                    while (e--)
                        a.splice(d[e], 1);
                } return k = null, a; }, e = ga.getText = function (a) { var b, c = "", d = 0, f = a.nodeType; if (f) {
                    if (1 === f || 9 === f || 11 === f) {
                        if ("string" == typeof a.textContent)
                            return a.textContent;
                        for (a = a.firstChild; a; a = a.nextSibling)
                            c += e(a);
                    }
                    else if (3 === f || 4 === f)
                        return a.nodeValue;
                }
                else
                    while (b = a[d++])
                        c += e(b); return c; }, d = ga.selectors = { cacheLength: 50, createPseudo: ia, match: X, attrHandle: {}, find: {}, relative: { ">": { dir: "parentNode", first: !0 }, " ": { dir: "parentNode" }, "+": { dir: "previousSibling", first: !0 }, "~": { dir: "previousSibling" } }, preFilter: { ATTR: function (a) { return a[1] = a[1].replace(ca, da), a[3] = (a[3] || a[4] || a[5] || "").replace(ca, da), "~=" === a[2] && (a[3] = " " + a[3] + " "), a.slice(0, 4); }, CHILD: function (a) { return a[1] = a[1].toLowerCase(), "nth" === a[1].slice(0, 3) ? (a[3] || ga.error(a[0]), a[4] = +(a[4] ? a[5] + (a[6] || 1) : 2 * ("even" === a[3] || "odd" === a[3])), a[5] = +(a[7] + a[8] || "odd" === a[3])) : a[3] && ga.error(a[0]), a; }, PSEUDO: function (a) { var b, c = !a[6] && a[2]; return X.CHILD.test(a[0]) ? null : (a[3] ? a[2] = a[4] || a[5] || "" : c && V.test(c) && (b = g(c, !0)) && (b = c.indexOf(")", c.length - b) - c.length) && (a[0] = a[0].slice(0, b), a[2] = c.slice(0, b)), a.slice(0, 3)); } }, filter: { TAG: function (a) { var b = a.replace(ca, da).toLowerCase(); return "*" === a ? function () { return !0; } : function (a) { return a.nodeName && a.nodeName.toLowerCase() === b; }; }, CLASS: function (a) { var b = y[a + " "]; return b || (b = new RegExp("(^|" + L + ")" + a + "(" + L + "|$)")) && y(a, function (a) { return b.test("string" == typeof a.className && a.className || "undefined" != typeof a.getAttribute && a.getAttribute("class") || ""); }); }, ATTR: function (a, b, c) { return function (d) { var e = ga.attr(d, a); return null == e ? "!=" === b : b ? (e += "", "=" === b ? e === c : "!=" === b ? e !== c : "^=" === b ? c && 0 === e.indexOf(c) : "*=" === b ? c && e.indexOf(c) > -1 : "$=" === b ? c && e.slice(-c.length) === c : "~=" === b ? (" " + e.replace(Q, " ") + " ").indexOf(c) > -1 : "|=" === b ? e === c || e.slice(0, c.length + 1) === c + "-" : !1) : !0; }; }, CHILD: function (a, b, c, d, e) { var f = "nth" !== a.slice(0, 3), g = "last" !== a.slice(-4), h = "of-type" === b; return 1 === d && 0 === e ? function (a) { return !!a.parentNode; } : function (b, c, i) { var j, k, l, m, n, o, p = f !== g ? "nextSibling" : "previousSibling", q = b.parentNode, r = h && b.nodeName.toLowerCase(), s = !i && !h; if (q) {
                            if (f) {
                                while (p) {
                                    l = b;
                                    while (l = l[p])
                                        if (h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType)
                                            return !1;
                                    o = p = "only" === a && !o && "nextSibling";
                                }
                                return !0;
                            }
                            if (o = [g ? q.firstChild : q.lastChild], g && s) {
                                k = q[u] || (q[u] = {}), j = k[a] || [], n = j[0] === w && j[1], m = j[0] === w && j[2], l = n && q.childNodes[n];
                                while (l = ++n && l && l[p] || (m = n = 0) || o.pop())
                                    if (1 === l.nodeType && ++m && l === b) {
                                        k[a] = [w, n, m];
                                        break;
                                    }
                            }
                            else if (s && (j = (b[u] || (b[u] = {}))[a]) && j[0] === w)
                                m = j[1];
                            else
                                while (l = ++n && l && l[p] || (m = n = 0) || o.pop())
                                    if ((h ? l.nodeName.toLowerCase() === r : 1 === l.nodeType) && ++m && (s && ((l[u] || (l[u] = {}))[a] = [w, m]), l === b))
                                        break;
                            return m -= e, m === d || m % d === 0 && m / d >= 0;
                        } }; }, PSEUDO: function (a, b) { var c, e = d.pseudos[a] || d.setFilters[a.toLowerCase()] || ga.error("unsupported pseudo: " + a); return e[u] ? e(b) : e.length > 1 ? (c = [a, a, "", b], d.setFilters.hasOwnProperty(a.toLowerCase()) ? ia(function (a, c) { var d, f = e(a, b), g = f.length; while (g--)
                            d = J(a, f[g]), a[d] = !(c[d] = f[g]); }) : function (a) { return e(a, 0, c); }) : e; } }, pseudos: { not: ia(function (a) { var b = [], c = [], d = h(a.replace(R, "$1")); return d[u] ? ia(function (a, b, c, e) { var f, g = d(a, null, e, []), h = a.length; while (h--)
                            (f = g[h]) && (a[h] = !(b[h] = f)); }) : function (a, e, f) { return b[0] = a, d(b, null, f, c), b[0] = null, !c.pop(); }; }), has: ia(function (a) { return function (b) { return ga(a, b).length > 0; }; }), contains: ia(function (a) { return a = a.replace(ca, da), function (b) { return (b.textContent || b.innerText || e(b)).indexOf(a) > -1; }; }), lang: ia(function (a) { return W.test(a || "") || ga.error("unsupported lang: " + a), a = a.replace(ca, da).toLowerCase(), function (b) { var c; do
                            if (c = p ? b.lang : b.getAttribute("xml:lang") || b.getAttribute("lang"))
                                return c = c.toLowerCase(), c === a || 0 === c.indexOf(a + "-");
                        while ((b = b.parentNode) && 1 === b.nodeType); return !1; }; }), target: function (b) { var c = a.location && a.location.hash; return c && c.slice(1) === b.id; }, root: function (a) { return a === o; }, focus: function (a) { return a === n.activeElement && (!n.hasFocus || n.hasFocus()) && !!(a.type || a.href || ~a.tabIndex); }, enabled: function (a) { return a.disabled === !1; }, disabled: function (a) { return a.disabled === !0; }, checked: function (a) { var b = a.nodeName.toLowerCase(); return "input" === b && !!a.checked || "option" === b && !!a.selected; }, selected: function (a) { return a.parentNode && a.parentNode.selectedIndex, a.selected === !0; }, empty: function (a) { for (a = a.firstChild; a; a = a.nextSibling)
                            if (a.nodeType < 6)
                                return !1; return !0; }, parent: function (a) { return !d.pseudos.empty(a); }, header: function (a) { return Z.test(a.nodeName); }, input: function (a) { return Y.test(a.nodeName); }, button: function (a) { var b = a.nodeName.toLowerCase(); return "input" === b && "button" === a.type || "button" === b; }, text: function (a) { var b; return "input" === a.nodeName.toLowerCase() && "text" === a.type && (null == (b = a.getAttribute("type")) || "text" === b.toLowerCase()); }, first: oa(function () { return [0]; }), last: oa(function (a, b) { return [b - 1]; }), eq: oa(function (a, b, c) { return [0 > c ? c + b : c]; }), even: oa(function (a, b) { for (var c = 0; b > c; c += 2)
                            a.push(c); return a; }), odd: oa(function (a, b) { for (var c = 1; b > c; c += 2)
                            a.push(c); return a; }), lt: oa(function (a, b, c) { for (var d = 0 > c ? c + b : c; --d >= 0;)
                            a.push(d); return a; }), gt: oa(function (a, b, c) { for (var d = 0 > c ? c + b : c; ++d < b;)
                            a.push(d); return a; }) } }, d.pseudos.nth = d.pseudos.eq; for (b in { radio: !0, checkbox: !0, file: !0, password: !0, image: !0 })
                    d.pseudos[b] = ma(b); for (b in { submit: !0, reset: !0 })
                    d.pseudos[b] = na(b); function qa() { } qa.prototype = d.filters = d.pseudos, d.setFilters = new qa, g = ga.tokenize = function (a, b) { var c, e, f, g, h, i, j, k = z[a + " "]; if (k)
                    return b ? 0 : k.slice(0); h = a, i = [], j = d.preFilter; while (h) {
                    (!c || (e = S.exec(h))) && (e && (h = h.slice(e[0].length) || h), i.push(f = [])), c = !1, (e = T.exec(h)) && (c = e.shift(), f.push({ value: c, type: e[0].replace(R, " ") }), h = h.slice(c.length));
                    for (g in d.filter)
                        !(e = X[g].exec(h)) || j[g] && !(e = j[g](e)) || (c = e.shift(), f.push({ value: c, type: g, matches: e }), h = h.slice(c.length));
                    if (!c)
                        break;
                } return b ? h.length : h ? ga.error(a) : z(a, i).slice(0); }; function ra(a) { for (var b = 0, c = a.length, d = ""; c > b; b++)
                    d += a[b].value; return d; } function sa(a, b, c) { var d = b.dir, e = c && "parentNode" === d, f = x++; return b.first ? function (b, c, f) { while (b = b[d])
                    if (1 === b.nodeType || e)
                        return a(b, c, f); } : function (b, c, g) { var h, i, j = [w, f]; if (g) {
                    while (b = b[d])
                        if ((1 === b.nodeType || e) && a(b, c, g))
                            return !0;
                }
                else
                    while (b = b[d])
                        if (1 === b.nodeType || e) {
                            if (i = b[u] || (b[u] = {}), (h = i[d]) && h[0] === w && h[1] === f)
                                return j[2] = h[2];
                            if (i[d] = j, j[2] = a(b, c, g))
                                return !0;
                        } }; } function ta(a) { return a.length > 1 ? function (b, c, d) { var e = a.length; while (e--)
                    if (!a[e](b, c, d))
                        return !1; return !0; } : a[0]; } function ua(a, b, c) { for (var d = 0, e = b.length; e > d; d++)
                    ga(a, b[d], c); return c; } function va(a, b, c, d, e) { for (var f, g = [], h = 0, i = a.length, j = null != b; i > h; h++)
                    (f = a[h]) && (!c || c(f, d, e)) && (g.push(f), j && b.push(h)); return g; } function wa(a, b, c, d, e, f) { return d && !d[u] && (d = wa(d)), e && !e[u] && (e = wa(e, f)), ia(function (f, g, h, i) { var j, k, l, m = [], n = [], o = g.length, p = f || ua(b || "*", h.nodeType ? [h] : h, []), q = !a || !f && b ? p : va(p, m, a, h, i), r = c ? e || (f ? a : o || d) ? [] : g : q; if (c && c(q, r, h, i), d) {
                    j = va(r, n), d(j, [], h, i), k = j.length;
                    while (k--)
                        (l = j[k]) && (r[n[k]] = !(q[n[k]] = l));
                } if (f) {
                    if (e || a) {
                        if (e) {
                            j = [], k = r.length;
                            while (k--)
                                (l = r[k]) && j.push(q[k] = l);
                            e(null, r = [], j, i);
                        }
                        k = r.length;
                        while (k--)
                            (l = r[k]) && (j = e ? J(f, l) : m[k]) > -1 && (f[j] = !(g[j] = l));
                    }
                }
                else
                    r = va(r === g ? r.splice(o, r.length) : r), e ? e(null, g, r, i) : H.apply(g, r); }); } function xa(a) { for (var b, c, e, f = a.length, g = d.relative[a[0].type], h = g || d.relative[" "], i = g ? 1 : 0, k = sa(function (a) { return a === b; }, h, !0), l = sa(function (a) { return J(b, a) > -1; }, h, !0), m = [function (a, c, d) { var e = !g && (d || c !== j) || ((b = c).nodeType ? k(a, c, d) : l(a, c, d)); return b = null, e; }]; f > i; i++)
                    if (c = d.relative[a[i].type])
                        m = [sa(ta(m), c)];
                    else {
                        if (c = d.filter[a[i].type].apply(null, a[i].matches), c[u]) {
                            for (e = ++i; f > e; e++)
                                if (d.relative[a[e].type])
                                    break;
                            return wa(i > 1 && ta(m), i > 1 && ra(a.slice(0, i - 1).concat({ value: " " === a[i - 2].type ? "*" : "" })).replace(R, "$1"), c, e > i && xa(a.slice(i, e)), f > e && xa(a = a.slice(e)), f > e && ra(a));
                        }
                        m.push(c);
                    } return ta(m); } function ya(a, b) { var c = b.length > 0, e = a.length > 0, f = function (f, g, h, i, k) { var l, m, o, p = 0, q = "0", r = f && [], s = [], t = j, u = f || e && d.find.TAG("*", k), v = w += null == t ? 1 : Math.random() || .1, x = u.length; for (k && (j = g !== n && g); q !== x && null != (l = u[q]); q++) {
                    if (e && l) {
                        m = 0;
                        while (o = a[m++])
                            if (o(l, g, h)) {
                                i.push(l);
                                break;
                            }
                        k && (w = v);
                    }
                    c && ((l = !o && l) && p--, f && r.push(l));
                } if (p += q, c && q !== p) {
                    m = 0;
                    while (o = b[m++])
                        o(r, s, g, h);
                    if (f) {
                        if (p > 0)
                            while (q--)
                                r[q] || s[q] || (s[q] = F.call(i));
                        s = va(s);
                    }
                    H.apply(i, s), k && !f && s.length > 0 && p + b.length > 1 && ga.uniqueSort(i);
                } return k && (w = v, j = t), r; }; return c ? ia(f) : f; } return h = ga.compile = function (a, b) { var c, d = [], e = [], f = A[a + " "]; if (!f) {
                    b || (b = g(a)), c = b.length;
                    while (c--)
                        f = xa(b[c]), f[u] ? d.push(f) : e.push(f);
                    f = A(a, ya(e, d)), f.selector = a;
                } return f; }, i = ga.select = function (a, b, e, f) { var i, j, k, l, m, n = "function" == typeof a && a, o = !f && g(a = n.selector || a); if (e = e || [], 1 === o.length) {
                    if (j = o[0] = o[0].slice(0), j.length > 2 && "ID" === (k = j[0]).type && c.getById && 9 === b.nodeType && p && d.relative[j[1].type]) {
                        if (b = (d.find.ID(k.matches[0].replace(ca, da), b) || [])[0], !b)
                            return e;
                        n && (b = b.parentNode), a = a.slice(j.shift().value.length);
                    }
                    i = X.needsContext.test(a) ? 0 : j.length;
                    while (i--) {
                        if (k = j[i], d.relative[l = k.type])
                            break;
                        if ((m = d.find[l]) && (f = m(k.matches[0].replace(ca, da), aa.test(j[0].type) && pa(b.parentNode) || b))) {
                            if (j.splice(i, 1), a = f.length && ra(j), !a)
                                return H.apply(e, f), e;
                            break;
                        }
                    }
                } return (n || h(a, o))(f, b, !p, e, aa.test(a) && pa(b.parentNode) || b), e; }, c.sortStable = u.split("").sort(B).join("") === u, c.detectDuplicates = !!l, m(), c.sortDetached = ja(function (a) { return 1 & a.compareDocumentPosition(n.createElement("div")); }), ja(function (a) { return a.innerHTML = "<a href='#'></a>", "#" === a.firstChild.getAttribute("href"); }) || ka("type|href|height|width", function (a, b, c) { return c ? void 0 : a.getAttribute(b, "type" === b.toLowerCase() ? 1 : 2); }), c.attributes && ja(function (a) { return a.innerHTML = "<input/>", a.firstChild.setAttribute("value", ""), "" === a.firstChild.getAttribute("value"); }) || ka("value", function (a, b, c) { return c || "input" !== a.nodeName.toLowerCase() ? void 0 : a.defaultValue; }), ja(function (a) { return null == a.getAttribute("disabled"); }) || ka(K, function (a, b, c) { var d; return c ? void 0 : a[b] === !0 ? b.toLowerCase() : (d = a.getAttributeNode(b)) && d.specified ? d.value : null; }), ga; }(a);
                n.find = t, n.expr = t.selectors, n.expr[":"] = n.expr.pseudos, n.unique = t.uniqueSort, n.text = t.getText, n.isXMLDoc = t.isXML, n.contains = t.contains;
                var u = n.expr.match.needsContext, v = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, w = /^.[^:#\[\.,]*$/;
                function x(a, b, c) { if (n.isFunction(b))
                    return n.grep(a, function (a, d) { return !!b.call(a, d, a) !== c; }); if (b.nodeType)
                    return n.grep(a, function (a) { return a === b !== c; }); if ("string" == typeof b) {
                    if (w.test(b))
                        return n.filter(b, a, c);
                    b = n.filter(b, a);
                } return n.grep(a, function (a) { return g.call(b, a) >= 0 !== c; }); }
                n.filter = function (a, b, c) { var d = b[0]; return c && (a = ":not(" + a + ")"), 1 === b.length && 1 === d.nodeType ? n.find.matchesSelector(d, a) ? [d] : [] : n.find.matches(a, n.grep(b, function (a) { return 1 === a.nodeType; })); }, n.fn.extend({ find: function (a) { var b, c = this.length, d = [], e = this; if ("string" != typeof a)
                        return this.pushStack(n(a).filter(function () { for (b = 0; c > b; b++)
                            if (n.contains(e[b], this))
                                return !0; })); for (b = 0; c > b; b++)
                        n.find(a, e[b], d); return d = this.pushStack(c > 1 ? n.unique(d) : d), d.selector = this.selector ? this.selector + " " + a : a, d; }, filter: function (a) { return this.pushStack(x(this, a || [], !1)); }, not: function (a) { return this.pushStack(x(this, a || [], !0)); }, is: function (a) { return !!x(this, "string" == typeof a && u.test(a) ? n(a) : a || [], !1).length; } });
                var y, z = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, A = n.fn.init = function (a, b) { var c, d; if (!a)
                    return this; if ("string" == typeof a) {
                    if (c = "<" === a[0] && ">" === a[a.length - 1] && a.length >= 3 ? [null, a, null] : z.exec(a), !c || !c[1] && b)
                        return !b || b.jquery ? (b || y).find(a) : this.constructor(b).find(a);
                    if (c[1]) {
                        if (b = b instanceof n ? b[0] : b, n.merge(this, n.parseHTML(c[1], b && b.nodeType ? b.ownerDocument || b : l, !0)), v.test(c[1]) && n.isPlainObject(b))
                            for (c in b)
                                n.isFunction(this[c]) ? this[c](b[c]) : this.attr(c, b[c]);
                        return this;
                    }
                    return d = l.getElementById(c[2]), d && d.parentNode && (this.length = 1, this[0] = d), this.context = l, this.selector = a, this;
                } return a.nodeType ? (this.context = this[0] = a, this.length = 1, this) : n.isFunction(a) ? "undefined" != typeof y.ready ? y.ready(a) : a(n) : (void 0 !== a.selector && (this.selector = a.selector, this.context = a.context), n.makeArray(a, this)); };
                A.prototype = n.fn, y = n(l);
                var B = /^(?:parents|prev(?:Until|All))/, C = { children: !0, contents: !0, next: !0, prev: !0 };
                n.extend({ dir: function (a, b, c) { var d = [], e = void 0 !== c; while ((a = a[b]) && 9 !== a.nodeType)
                        if (1 === a.nodeType) {
                            if (e && n(a).is(c))
                                break;
                            d.push(a);
                        } return d; }, sibling: function (a, b) { for (var c = []; a; a = a.nextSibling)
                        1 === a.nodeType && a !== b && c.push(a); return c; } }), n.fn.extend({ has: function (a) { var b = n(a, this), c = b.length; return this.filter(function () { for (var a = 0; c > a; a++)
                        if (n.contains(this, b[a]))
                            return !0; }); }, closest: function (a, b) { for (var c, d = 0, e = this.length, f = [], g = u.test(a) || "string" != typeof a ? n(a, b || this.context) : 0; e > d; d++)
                        for (c = this[d]; c && c !== b; c = c.parentNode)
                            if (c.nodeType < 11 && (g ? g.index(c) > -1 : 1 === c.nodeType && n.find.matchesSelector(c, a))) {
                                f.push(c);
                                break;
                            } return this.pushStack(f.length > 1 ? n.unique(f) : f); }, index: function (a) { return a ? "string" == typeof a ? g.call(n(a), this[0]) : g.call(this, a.jquery ? a[0] : a) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1; }, add: function (a, b) { return this.pushStack(n.unique(n.merge(this.get(), n(a, b)))); }, addBack: function (a) { return this.add(null == a ? this.prevObject : this.prevObject.filter(a)); } });
                function D(a, b) { while ((a = a[b]) && 1 !== a.nodeType)
                    ; return a; }
                n.each({ parent: function (a) { var b = a.parentNode; return b && 11 !== b.nodeType ? b : null; }, parents: function (a) { return n.dir(a, "parentNode"); }, parentsUntil: function (a, b, c) { return n.dir(a, "parentNode", c); }, next: function (a) { return D(a, "nextSibling"); }, prev: function (a) { return D(a, "previousSibling"); }, nextAll: function (a) { return n.dir(a, "nextSibling"); }, prevAll: function (a) { return n.dir(a, "previousSibling"); }, nextUntil: function (a, b, c) { return n.dir(a, "nextSibling", c); }, prevUntil: function (a, b, c) { return n.dir(a, "previousSibling", c); }, siblings: function (a) { return n.sibling((a.parentNode || {}).firstChild, a); }, children: function (a) { return n.sibling(a.firstChild); }, contents: function (a) { return a.contentDocument || n.merge([], a.childNodes); } }, function (a, b) { n.fn[a] = function (c, d) { var e = n.map(this, b, c); return "Until" !== a.slice(-5) && (d = c), d && "string" == typeof d && (e = n.filter(d, e)), this.length > 1 && (C[a] || n.unique(e), B.test(a) && e.reverse()), this.pushStack(e); }; });
                var E = /\S+/g, F = {};
                function G(a) { var b = F[a] = {}; return n.each(a.match(E) || [], function (a, c) { b[c] = !0; }), b; }
                n.Callbacks = function (a) { a = "string" == typeof a ? F[a] || G(a) : n.extend({}, a); var b, c, d, e, f, g, h = [], i = !a.once && [], j = function (l) { for (b = a.memory && l, c = !0, g = e || 0, e = 0, f = h.length, d = !0; h && f > g; g++)
                    if (h[g].apply(l[0], l[1]) === !1 && a.stopOnFalse) {
                        b = !1;
                        break;
                    } d = !1, h && (i ? i.length && j(i.shift()) : b ? h = [] : k.disable()); }, k = { add: function () { if (h) {
                        var c = h.length;
                        !function g(b) { n.each(b, function (b, c) { var d = n.type(c); "function" === d ? a.unique && k.has(c) || h.push(c) : c && c.length && "string" !== d && g(c); }); }(arguments), d ? f = h.length : b && (e = c, j(b));
                    } return this; }, remove: function () { return h && n.each(arguments, function (a, b) { var c; while ((c = n.inArray(b, h, c)) > -1)
                        h.splice(c, 1), d && (f >= c && f--, g >= c && g--); }), this; }, has: function (a) { return a ? n.inArray(a, h) > -1 : !(!h || !h.length); }, empty: function () { return h = [], f = 0, this; }, disable: function () { return h = i = b = void 0, this; }, disabled: function () { return !h; }, lock: function () { return i = void 0, b || k.disable(), this; }, locked: function () { return !i; }, fireWith: function (a, b) { return !h || c && !i || (b = b || [], b = [a, b.slice ? b.slice() : b], d ? i.push(b) : j(b)), this; }, fire: function () { return k.fireWith(this, arguments), this; }, fired: function () { return !!c; } }; return k; }, n.extend({ Deferred: function (a) { var b = [["resolve", "done", n.Callbacks("once memory"), "resolved"], ["reject", "fail", n.Callbacks("once memory"), "rejected"], ["notify", "progress", n.Callbacks("memory")]], c = "pending", d = { state: function () { return c; }, always: function () { return e.done(arguments).fail(arguments), this; }, then: function () { var a = arguments; return n.Deferred(function (c) { n.each(b, function (b, f) { var g = n.isFunction(a[b]) && a[b]; e[f[1]](function () { var a = g && g.apply(this, arguments); a && n.isFunction(a.promise) ? a.promise().done(c.resolve).fail(c.reject).progress(c.notify) : c[f[0] + "With"](this === d ? c.promise() : this, g ? [a] : arguments); }); }), a = null; }).promise(); }, promise: function (a) { return null != a ? n.extend(a, d) : d; } }, e = {}; return d.pipe = d.then, n.each(b, function (a, f) { var g = f[2], h = f[3]; d[f[1]] = g.add, h && g.add(function () { c = h; }, b[1 ^ a][2].disable, b[2][2].lock), e[f[0]] = function () { return e[f[0] + "With"](this === e ? d : this, arguments), this; }, e[f[0] + "With"] = g.fireWith; }), d.promise(e), a && a.call(e, e), e; }, when: function (a) { var b = 0, c = d.call(arguments), e = c.length, f = 1 !== e || a && n.isFunction(a.promise) ? e : 0, g = 1 === f ? a : n.Deferred(), h = function (a, b, c) { return function (e) { b[a] = this, c[a] = arguments.length > 1 ? d.call(arguments) : e, c === i ? g.notifyWith(b, c) : --f || g.resolveWith(b, c); }; }, i, j, k; if (e > 1)
                        for (i = new Array(e), j = new Array(e), k = new Array(e); e > b; b++)
                            c[b] && n.isFunction(c[b].promise) ? c[b].promise().done(h(b, k, c)).fail(g.reject).progress(h(b, j, i)) : --f; return f || g.resolveWith(k, c), g.promise(); } });
                var H;
                n.fn.ready = function (a) { return n.ready.promise().done(a), this; }, n.extend({ isReady: !1, readyWait: 1, holdReady: function (a) { a ? n.readyWait++ : n.ready(!0); }, ready: function (a) { (a === !0 ? --n.readyWait : n.isReady) || (n.isReady = !0, a !== !0 && --n.readyWait > 0 || (H.resolveWith(l, [n]), n.fn.triggerHandler && (n(l).triggerHandler("ready"), n(l).off("ready")))); } });
                function I() { l.removeEventListener("DOMContentLoaded", I, !1), a.removeEventListener("load", I, !1), n.ready(); }
                n.ready.promise = function (b) { return H || (H = n.Deferred(), "complete" === l.readyState ? setTimeout(n.ready) : (l.addEventListener("DOMContentLoaded", I, !1), a.addEventListener("load", I, !1))), H.promise(b); }, n.ready.promise();
                var J = n.access = function (a, b, c, d, e, f, g) { var h = 0, i = a.length, j = null == c; if ("object" === n.type(c)) {
                    e = !0;
                    for (h in c)
                        n.access(a, b, h, c[h], !0, f, g);
                }
                else if (void 0 !== d && (e = !0, n.isFunction(d) || (g = !0), j && (g ? (b.call(a, d), b = null) : (j = b, b = function (a, b, c) { return j.call(n(a), c); })), b))
                    for (; i > h; h++)
                        b(a[h], c, g ? d : d.call(a[h], h, b(a[h], c))); return e ? a : j ? b.call(a) : i ? b(a[0], c) : f; };
                n.acceptData = function (a) { return 1 === a.nodeType || 9 === a.nodeType || !+a.nodeType; };
                function K() { Object.defineProperty(this.cache = {}, 0, { get: function () { return {}; } }), this.expando = n.expando + K.uid++; }
                K.uid = 1, K.accepts = n.acceptData, K.prototype = { key: function (a) { if (!K.accepts(a))
                        return 0; var b = {}, c = a[this.expando]; if (!c) {
                        c = K.uid++;
                        try {
                            b[this.expando] = { value: c }, Object.defineProperties(a, b);
                        }
                        catch (d) {
                            b[this.expando] = c, n.extend(a, b);
                        }
                    } return this.cache[c] || (this.cache[c] = {}), c; }, set: function (a, b, c) { var d, e = this.key(a), f = this.cache[e]; if ("string" == typeof b)
                        f[b] = c;
                    else if (n.isEmptyObject(f))
                        n.extend(this.cache[e], b);
                    else
                        for (d in b)
                            f[d] = b[d]; return f; }, get: function (a, b) { var c = this.cache[this.key(a)]; return void 0 === b ? c : c[b]; }, access: function (a, b, c) { var d; return void 0 === b || b && "string" == typeof b && void 0 === c ? (d = this.get(a, b), void 0 !== d ? d : this.get(a, n.camelCase(b))) : (this.set(a, b, c), void 0 !== c ? c : b); }, remove: function (a, b) { var c, d, e, f = this.key(a), g = this.cache[f]; if (void 0 === b)
                        this.cache[f] = {};
                    else {
                        n.isArray(b) ? d = b.concat(b.map(n.camelCase)) : (e = n.camelCase(b), b in g ? d = [b, e] : (d = e, d = d in g ? [d] : d.match(E) || [])), c = d.length;
                        while (c--)
                            delete g[d[c]];
                    } }, hasData: function (a) { return !n.isEmptyObject(this.cache[a[this.expando]] || {}); }, discard: function (a) { a[this.expando] && delete this.cache[a[this.expando]]; } };
                var L = new K, M = new K, N = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, O = /([A-Z])/g;
                function P(a, b, c) { var d; if (void 0 === c && 1 === a.nodeType)
                    if (d = "data-" + b.replace(O, "-$1").toLowerCase(), c = a.getAttribute(d), "string" == typeof c) {
                        try {
                            c = "true" === c ? !0 : "false" === c ? !1 : "null" === c ? null : +c + "" === c ? +c : N.test(c) ? n.parseJSON(c) : c;
                        }
                        catch (e) { }
                        M.set(a, b, c);
                    }
                    else
                        c = void 0; return c; }
                n.extend({ hasData: function (a) { return M.hasData(a) || L.hasData(a); }, data: function (a, b, c) {
                        return M.access(a, b, c);
                    }, removeData: function (a, b) { M.remove(a, b); }, _data: function (a, b, c) { return L.access(a, b, c); }, _removeData: function (a, b) { L.remove(a, b); } }), n.fn.extend({ data: function (a, b) { var c, d, e, f = this[0], g = f && f.attributes; if (void 0 === a) {
                        if (this.length && (e = M.get(f), 1 === f.nodeType && !L.get(f, "hasDataAttrs"))) {
                            c = g.length;
                            while (c--)
                                g[c] && (d = g[c].name, 0 === d.indexOf("data-") && (d = n.camelCase(d.slice(5)), P(f, d, e[d])));
                            L.set(f, "hasDataAttrs", !0);
                        }
                        return e;
                    } return "object" == typeof a ? this.each(function () { M.set(this, a); }) : J(this, function (b) { var c, d = n.camelCase(a); if (f && void 0 === b) {
                        if (c = M.get(f, a), void 0 !== c)
                            return c;
                        if (c = M.get(f, d), void 0 !== c)
                            return c;
                        if (c = P(f, d, void 0), void 0 !== c)
                            return c;
                    }
                    else
                        this.each(function () { var c = M.get(this, d); M.set(this, d, b), -1 !== a.indexOf("-") && void 0 !== c && M.set(this, a, b); }); }, null, b, arguments.length > 1, null, !0); }, removeData: function (a) { return this.each(function () { M.remove(this, a); }); } }), n.extend({ queue: function (a, b, c) { var d; return a ? (b = (b || "fx") + "queue", d = L.get(a, b), c && (!d || n.isArray(c) ? d = L.access(a, b, n.makeArray(c)) : d.push(c)), d || []) : void 0; }, dequeue: function (a, b) { b = b || "fx"; var c = n.queue(a, b), d = c.length, e = c.shift(), f = n._queueHooks(a, b), g = function () { n.dequeue(a, b); }; "inprogress" === e && (e = c.shift(), d--), e && ("fx" === b && c.unshift("inprogress"), delete f.stop, e.call(a, g, f)), !d && f && f.empty.fire(); }, _queueHooks: function (a, b) { var c = b + "queueHooks"; return L.get(a, c) || L.access(a, c, { empty: n.Callbacks("once memory").add(function () { L.remove(a, [b + "queue", c]); }) }); } }), n.fn.extend({ queue: function (a, b) { var c = 2; return "string" != typeof a && (b = a, a = "fx", c--), arguments.length < c ? n.queue(this[0], a) : void 0 === b ? this : this.each(function () { var c = n.queue(this, a, b); n._queueHooks(this, a), "fx" === a && "inprogress" !== c[0] && n.dequeue(this, a); }); }, dequeue: function (a) { return this.each(function () { n.dequeue(this, a); }); }, clearQueue: function (a) { return this.queue(a || "fx", []); }, promise: function (a, b) { var c, d = 1, e = n.Deferred(), f = this, g = this.length, h = function () { --d || e.resolveWith(f, [f]); }; "string" != typeof a && (b = a, a = void 0), a = a || "fx"; while (g--)
                        c = L.get(f[g], a + "queueHooks"), c && c.empty && (d++, c.empty.add(h)); return h(), e.promise(b); } });
                var Q = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, R = ["Top", "Right", "Bottom", "Left"], S = function (a, b) { return a = b || a, "none" === n.css(a, "display") || !n.contains(a.ownerDocument, a); }, T = /^(?:checkbox|radio)$/i;
                !function () { var a = l.createDocumentFragment(), b = a.appendChild(l.createElement("div")), c = l.createElement("input"); c.setAttribute("type", "radio"), c.setAttribute("checked", "checked"), c.setAttribute("name", "t"), b.appendChild(c), k.checkClone = b.cloneNode(!0).cloneNode(!0).lastChild.checked, b.innerHTML = "<textarea>x</textarea>", k.noCloneChecked = !!b.cloneNode(!0).lastChild.defaultValue; }();
                var U = "undefined";
                k.focusinBubbles = "onfocusin" in a;
                var V = /^key/, W = /^(?:mouse|pointer|contextmenu)|click/, X = /^(?:focusinfocus|focusoutblur)$/, Y = /^([^.]*)(?:\.(.+)|)$/;
                function Z() { return !0; }
                function $() { return !1; }
                function _() { try {
                    return l.activeElement;
                }
                catch (a) { } }
                n.event = { global: {}, add: function (a, b, c, d, e) { var f, g, h, i, j, k, l, m, o, p, q, r = L.get(a); if (r) {
                        c.handler && (f = c, c = f.handler, e = f.selector), c.guid || (c.guid = n.guid++), (i = r.events) || (i = r.events = {}), (g = r.handle) || (g = r.handle = function (b) { return typeof n !== U && n.event.triggered !== b.type ? n.event.dispatch.apply(a, arguments) : void 0; }), b = (b || "").match(E) || [""], j = b.length;
                        while (j--)
                            h = Y.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o && (l = n.event.special[o] || {}, o = (e ? l.delegateType : l.bindType) || o, l = n.event.special[o] || {}, k = n.extend({ type: o, origType: q, data: d, handler: c, guid: c.guid, selector: e, needsContext: e && n.expr.match.needsContext.test(e), namespace: p.join(".") }, f), (m = i[o]) || (m = i[o] = [], m.delegateCount = 0, l.setup && l.setup.call(a, d, p, g) !== !1 || a.addEventListener && a.addEventListener(o, g, !1)), l.add && (l.add.call(a, k), k.handler.guid || (k.handler.guid = c.guid)), e ? m.splice(m.delegateCount++, 0, k) : m.push(k), n.event.global[o] = !0);
                    } }, remove: function (a, b, c, d, e) { var f, g, h, i, j, k, l, m, o, p, q, r = L.hasData(a) && L.get(a); if (r && (i = r.events)) {
                        b = (b || "").match(E) || [""], j = b.length;
                        while (j--)
                            if (h = Y.exec(b[j]) || [], o = q = h[1], p = (h[2] || "").split(".").sort(), o) {
                                l = n.event.special[o] || {}, o = (d ? l.delegateType : l.bindType) || o, m = i[o] || [], h = h[2] && new RegExp("(^|\\.)" + p.join("\\.(?:.*\\.|)") + "(\\.|$)"), g = f = m.length;
                                while (f--)
                                    k = m[f], !e && q !== k.origType || c && c.guid !== k.guid || h && !h.test(k.namespace) || d && d !== k.selector && ("**" !== d || !k.selector) || (m.splice(f, 1), k.selector && m.delegateCount--, l.remove && l.remove.call(a, k));
                                g && !m.length && (l.teardown && l.teardown.call(a, p, r.handle) !== !1 || n.removeEvent(a, o, r.handle), delete i[o]);
                            }
                            else
                                for (o in i)
                                    n.event.remove(a, o + b[j], c, d, !0);
                        n.isEmptyObject(i) && (delete r.handle, L.remove(a, "events"));
                    } }, trigger: function (b, c, d, e) { var f, g, h, i, k, m, o, p = [d || l], q = j.call(b, "type") ? b.type : b, r = j.call(b, "namespace") ? b.namespace.split(".") : []; if (g = h = d = d || l, 3 !== d.nodeType && 8 !== d.nodeType && !X.test(q + n.event.triggered) && (q.indexOf(".") >= 0 && (r = q.split("."), q = r.shift(), r.sort()), k = q.indexOf(":") < 0 && "on" + q, b = b[n.expando] ? b : new n.Event(q, "object" == typeof b && b), b.isTrigger = e ? 2 : 3, b.namespace = r.join("."), b.namespace_re = b.namespace ? new RegExp("(^|\\.)" + r.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, b.result = void 0, b.target || (b.target = d), c = null == c ? [b] : n.makeArray(c, [b]), o = n.event.special[q] || {}, e || !o.trigger || o.trigger.apply(d, c) !== !1)) {
                        if (!e && !o.noBubble && !n.isWindow(d)) {
                            for (i = o.delegateType || q, X.test(i + q) || (g = g.parentNode); g; g = g.parentNode)
                                p.push(g), h = g;
                            h === (d.ownerDocument || l) && p.push(h.defaultView || h.parentWindow || a);
                        }
                        f = 0;
                        while ((g = p[f++]) && !b.isPropagationStopped())
                            b.type = f > 1 ? i : o.bindType || q, m = (L.get(g, "events") || {})[b.type] && L.get(g, "handle"), m && m.apply(g, c), m = k && g[k], m && m.apply && n.acceptData(g) && (b.result = m.apply(g, c), b.result === !1 && b.preventDefault());
                        return b.type = q, e || b.isDefaultPrevented() || o._default && o._default.apply(p.pop(), c) !== !1 || !n.acceptData(d) || k && n.isFunction(d[q]) && !n.isWindow(d) && (h = d[k], h && (d[k] = null), n.event.triggered = q, d[q](), n.event.triggered = void 0, h && (d[k] = h)), b.result;
                    } }, dispatch: function (a) { a = n.event.fix(a); var b, c, e, f, g, h = [], i = d.call(arguments), j = (L.get(this, "events") || {})[a.type] || [], k = n.event.special[a.type] || {}; if (i[0] = a, a.delegateTarget = this, !k.preDispatch || k.preDispatch.call(this, a) !== !1) {
                        h = n.event.handlers.call(this, a, j), b = 0;
                        while ((f = h[b++]) && !a.isPropagationStopped()) {
                            a.currentTarget = f.elem, c = 0;
                            while ((g = f.handlers[c++]) && !a.isImmediatePropagationStopped())
                                (!a.namespace_re || a.namespace_re.test(g.namespace)) && (a.handleObj = g, a.data = g.data, e = ((n.event.special[g.origType] || {}).handle || g.handler).apply(f.elem, i), void 0 !== e && (a.result = e) === !1 && (a.preventDefault(), a.stopPropagation()));
                        }
                        return k.postDispatch && k.postDispatch.call(this, a), a.result;
                    } }, handlers: function (a, b) { var c, d, e, f, g = [], h = b.delegateCount, i = a.target; if (h && i.nodeType && (!a.button || "click" !== a.type))
                        for (; i !== this; i = i.parentNode || this)
                            if (i.disabled !== !0 || "click" !== a.type) {
                                for (d = [], c = 0; h > c; c++)
                                    f = b[c], e = f.selector + " ", void 0 === d[e] && (d[e] = f.needsContext ? n(e, this).index(i) >= 0 : n.find(e, this, null, [i]).length), d[e] && d.push(f);
                                d.length && g.push({ elem: i, handlers: d });
                            } return h < b.length && g.push({ elem: this, handlers: b.slice(h) }), g; }, props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "), fixHooks: {}, keyHooks: { props: "char charCode key keyCode".split(" "), filter: function (a, b) { return null == a.which && (a.which = null != b.charCode ? b.charCode : b.keyCode), a; } }, mouseHooks: { props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "), filter: function (a, b) { var c, d, e, f = b.button; return null == a.pageX && null != b.clientX && (c = a.target.ownerDocument || l, d = c.documentElement, e = c.body, a.pageX = b.clientX + (d && d.scrollLeft || e && e.scrollLeft || 0) - (d && d.clientLeft || e && e.clientLeft || 0), a.pageY = b.clientY + (d && d.scrollTop || e && e.scrollTop || 0) - (d && d.clientTop || e && e.clientTop || 0)), a.which || void 0 === f || (a.which = 1 & f ? 1 : 2 & f ? 3 : 4 & f ? 2 : 0), a; } }, fix: function (a) { if (a[n.expando])
                        return a; var b, c, d, e = a.type, f = a, g = this.fixHooks[e]; g || (this.fixHooks[e] = g = W.test(e) ? this.mouseHooks : V.test(e) ? this.keyHooks : {}), d = g.props ? this.props.concat(g.props) : this.props, a = new n.Event(f), b = d.length; while (b--)
                        c = d[b], a[c] = f[c]; return a.target || (a.target = l), 3 === a.target.nodeType && (a.target = a.target.parentNode), g.filter ? g.filter(a, f) : a; }, special: { load: { noBubble: !0 }, focus: { trigger: function () { return this !== _() && this.focus ? (this.focus(), !1) : void 0; }, delegateType: "focusin" }, blur: { trigger: function () { return this === _() && this.blur ? (this.blur(), !1) : void 0; }, delegateType: "focusout" }, click: { trigger: function () { return "checkbox" === this.type && this.click && n.nodeName(this, "input") ? (this.click(), !1) : void 0; }, _default: function (a) { return n.nodeName(a.target, "a"); } }, beforeunload: { postDispatch: function (a) { void 0 !== a.result && a.originalEvent && (a.originalEvent.returnValue = a.result); } } }, simulate: function (a, b, c, d) { var e = n.extend(new n.Event, c, { type: a, isSimulated: !0, originalEvent: {} }); d ? n.event.trigger(e, null, b) : n.event.dispatch.call(b, e), e.isDefaultPrevented() && c.preventDefault(); } }, n.removeEvent = function (a, b, c) { a.removeEventListener && a.removeEventListener(b, c, !1); }, n.Event = function (a, b) { return this instanceof n.Event ? (a && a.type ? (this.originalEvent = a, this.type = a.type, this.isDefaultPrevented = a.defaultPrevented || void 0 === a.defaultPrevented && a.returnValue === !1 ? Z : $) : this.type = a, b && n.extend(this, b), this.timeStamp = a && a.timeStamp || n.now(), void (this[n.expando] = !0)) : new n.Event(a, b); }, n.Event.prototype = { isDefaultPrevented: $, isPropagationStopped: $, isImmediatePropagationStopped: $, preventDefault: function () { var a = this.originalEvent; this.isDefaultPrevented = Z, a && a.preventDefault && a.preventDefault(); }, stopPropagation: function () { var a = this.originalEvent; this.isPropagationStopped = Z, a && a.stopPropagation && a.stopPropagation(); }, stopImmediatePropagation: function () { var a = this.originalEvent; this.isImmediatePropagationStopped = Z, a && a.stopImmediatePropagation && a.stopImmediatePropagation(), this.stopPropagation(); } }, n.each({ mouseenter: "mouseover", mouseleave: "mouseout", pointerenter: "pointerover", pointerleave: "pointerout" }, function (a, b) { n.event.special[a] = { delegateType: b, bindType: b, handle: function (a) { var c, d = this, e = a.relatedTarget, f = a.handleObj; return (!e || e !== d && !n.contains(d, e)) && (a.type = f.origType, c = f.handler.apply(this, arguments), a.type = b), c; } }; }), k.focusinBubbles || n.each({ focus: "focusin", blur: "focusout" }, function (a, b) { var c = function (a) { n.event.simulate(b, a.target, n.event.fix(a), !0); }; n.event.special[b] = { setup: function () { var d = this.ownerDocument || this, e = L.access(d, b); e || d.addEventListener(a, c, !0), L.access(d, b, (e || 0) + 1); }, teardown: function () { var d = this.ownerDocument || this, e = L.access(d, b) - 1; e ? L.access(d, b, e) : (d.removeEventListener(a, c, !0), L.remove(d, b)); } }; }), n.fn.extend({ on: function (a, b, c, d, e) { var f, g; if ("object" == typeof a) {
                        "string" != typeof b && (c = c || b, b = void 0);
                        for (g in a)
                            this.on(g, b, c, a[g], e);
                        return this;
                    } if (null == c && null == d ? (d = b, c = b = void 0) : null == d && ("string" == typeof b ? (d = c, c = void 0) : (d = c, c = b, b = void 0)), d === !1)
                        d = $;
                    else if (!d)
                        return this; return 1 === e && (f = d, d = function (a) { return n().off(a), f.apply(this, arguments); }, d.guid = f.guid || (f.guid = n.guid++)), this.each(function () { n.event.add(this, a, d, c, b); }); }, one: function (a, b, c, d) { return this.on(a, b, c, d, 1); }, off: function (a, b, c) { var d, e; if (a && a.preventDefault && a.handleObj)
                        return d = a.handleObj, n(a.delegateTarget).off(d.namespace ? d.origType + "." + d.namespace : d.origType, d.selector, d.handler), this; if ("object" == typeof a) {
                        for (e in a)
                            this.off(e, b, a[e]);
                        return this;
                    } return (b === !1 || "function" == typeof b) && (c = b, b = void 0), c === !1 && (c = $), this.each(function () { n.event.remove(this, a, c, b); }); }, trigger: function (a, b) { return this.each(function () { n.event.trigger(a, b, this); }); }, triggerHandler: function (a, b) { var c = this[0]; return c ? n.event.trigger(a, b, c, !0) : void 0; } });
                var aa = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, ba = /<([\w:]+)/, ca = /<|&#?\w+;/, da = /<(?:script|style|link)/i, ea = /checked\s*(?:[^=]|=\s*.checked.)/i, fa = /^$|\/(?:java|ecma)script/i, ga = /^true\/(.*)/, ha = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, ia = { option: [1, "<select multiple='multiple'>", "</select>"], thead: [1, "<table>", "</table>"], col: [2, "<table><colgroup>", "</colgroup></table>"], tr: [2, "<table><tbody>", "</tbody></table>"], td: [3, "<table><tbody><tr>", "</tr></tbody></table>"], _default: [0, "", ""] };
                ia.optgroup = ia.option, ia.tbody = ia.tfoot = ia.colgroup = ia.caption = ia.thead, ia.th = ia.td;
                function ja(a, b) { return n.nodeName(a, "table") && n.nodeName(11 !== b.nodeType ? b : b.firstChild, "tr") ? a.getElementsByTagName("tbody")[0] || a.appendChild(a.ownerDocument.createElement("tbody")) : a; }
                function ka(a) { return a.type = (null !== a.getAttribute("type")) + "/" + a.type, a; }
                function la(a) { var b = ga.exec(a.type); return b ? a.type = b[1] : a.removeAttribute("type"), a; }
                function ma(a, b) { for (var c = 0, d = a.length; d > c; c++)
                    L.set(a[c], "globalEval", !b || L.get(b[c], "globalEval")); }
                function na(a, b) { var c, d, e, f, g, h, i, j; if (1 === b.nodeType) {
                    if (L.hasData(a) && (f = L.access(a), g = L.set(b, f), j = f.events)) {
                        delete g.handle, g.events = {};
                        for (e in j)
                            for (c = 0, d = j[e].length; d > c; c++)
                                n.event.add(b, e, j[e][c]);
                    }
                    M.hasData(a) && (h = M.access(a), i = n.extend({}, h), M.set(b, i));
                } }
                function oa(a, b) { var c = a.getElementsByTagName ? a.getElementsByTagName(b || "*") : a.querySelectorAll ? a.querySelectorAll(b || "*") : []; return void 0 === b || b && n.nodeName(a, b) ? n.merge([a], c) : c; }
                function pa(a, b) { var c = b.nodeName.toLowerCase(); "input" === c && T.test(a.type) ? b.checked = a.checked : ("input" === c || "textarea" === c) && (b.defaultValue = a.defaultValue); }
                n.extend({ clone: function (a, b, c) { var d, e, f, g, h = a.cloneNode(!0), i = n.contains(a.ownerDocument, a); if (!(k.noCloneChecked || 1 !== a.nodeType && 11 !== a.nodeType || n.isXMLDoc(a)))
                        for (g = oa(h), f = oa(a), d = 0, e = f.length; e > d; d++)
                            pa(f[d], g[d]); if (b)
                        if (c)
                            for (f = f || oa(a), g = g || oa(h), d = 0, e = f.length; e > d; d++)
                                na(f[d], g[d]);
                        else
                            na(a, h); return g = oa(h, "script"), g.length > 0 && ma(g, !i && oa(a, "script")), h; }, buildFragment: function (a, b, c, d) { for (var e, f, g, h, i, j, k = b.createDocumentFragment(), l = [], m = 0, o = a.length; o > m; m++)
                        if (e = a[m], e || 0 === e)
                            if ("object" === n.type(e))
                                n.merge(l, e.nodeType ? [e] : e);
                            else if (ca.test(e)) {
                                f = f || k.appendChild(b.createElement("div")), g = (ba.exec(e) || ["", ""])[1].toLowerCase(), h = ia[g] || ia._default, f.innerHTML = h[1] + e.replace(aa, "<$1></$2>") + h[2], j = h[0];
                                while (j--)
                                    f = f.lastChild;
                                n.merge(l, f.childNodes), f = k.firstChild, f.textContent = "";
                            }
                            else
                                l.push(b.createTextNode(e)); k.textContent = "", m = 0; while (e = l[m++])
                        if ((!d || -1 === n.inArray(e, d)) && (i = n.contains(e.ownerDocument, e), f = oa(k.appendChild(e), "script"), i && ma(f), c)) {
                            j = 0;
                            while (e = f[j++])
                                fa.test(e.type || "") && c.push(e);
                        } return k; }, cleanData: function (a) { for (var b, c, d, e, f = n.event.special, g = 0; void 0 !== (c = a[g]); g++) {
                        if (n.acceptData(c) && (e = c[L.expando], e && (b = L.cache[e]))) {
                            if (b.events)
                                for (d in b.events)
                                    f[d] ? n.event.remove(c, d) : n.removeEvent(c, d, b.handle);
                            L.cache[e] && delete L.cache[e];
                        }
                        delete M.cache[c[M.expando]];
                    } } }), n.fn.extend({ text: function (a) { return J(this, function (a) { return void 0 === a ? n.text(this) : this.empty().each(function () { (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) && (this.textContent = a); }); }, null, a, arguments.length); }, append: function () { return this.domManip(arguments, function (a) { if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var b = ja(this, a);
                        b.appendChild(a);
                    } }); }, prepend: function () { return this.domManip(arguments, function (a) { if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                        var b = ja(this, a);
                        b.insertBefore(a, b.firstChild);
                    } }); }, before: function () { return this.domManip(arguments, function (a) { this.parentNode && this.parentNode.insertBefore(a, this); }); }, after: function () { return this.domManip(arguments, function (a) { this.parentNode && this.parentNode.insertBefore(a, this.nextSibling); }); }, remove: function (a, b) { for (var c, d = a ? n.filter(a, this) : this, e = 0; null != (c = d[e]); e++)
                        b || 1 !== c.nodeType || n.cleanData(oa(c)), c.parentNode && (b && n.contains(c.ownerDocument, c) && ma(oa(c, "script")), c.parentNode.removeChild(c)); return this; }, empty: function () { for (var a, b = 0; null != (a = this[b]); b++)
                        1 === a.nodeType && (n.cleanData(oa(a, !1)), a.textContent = ""); return this; }, clone: function (a, b) { return a = null == a ? !1 : a, b = null == b ? a : b, this.map(function () { return n.clone(this, a, b); }); }, html: function (a) { return J(this, function (a) { var b = this[0] || {}, c = 0, d = this.length; if (void 0 === a && 1 === b.nodeType)
                        return b.innerHTML; if ("string" == typeof a && !da.test(a) && !ia[(ba.exec(a) || ["", ""])[1].toLowerCase()]) {
                        a = a.replace(aa, "<$1></$2>");
                        try {
                            for (; d > c; c++)
                                b = this[c] || {}, 1 === b.nodeType && (n.cleanData(oa(b, !1)), b.innerHTML = a);
                            b = 0;
                        }
                        catch (e) { }
                    } b && this.empty().append(a); }, null, a, arguments.length); }, replaceWith: function () { var a = arguments[0]; return this.domManip(arguments, function (b) { a = this.parentNode, n.cleanData(oa(this)), a && a.replaceChild(b, this); }), a && (a.length || a.nodeType) ? this : this.remove(); }, detach: function (a) { return this.remove(a, !0); }, domManip: function (a, b) { a = e.apply([], a); var c, d, f, g, h, i, j = 0, l = this.length, m = this, o = l - 1, p = a[0], q = n.isFunction(p); if (q || l > 1 && "string" == typeof p && !k.checkClone && ea.test(p))
                        return this.each(function (c) { var d = m.eq(c); q && (a[0] = p.call(this, c, d.html())), d.domManip(a, b); }); if (l && (c = n.buildFragment(a, this[0].ownerDocument, !1, this), d = c.firstChild, 1 === c.childNodes.length && (c = d), d)) {
                        for (f = n.map(oa(c, "script"), ka), g = f.length; l > j; j++)
                            h = c, j !== o && (h = n.clone(h, !0, !0), g && n.merge(f, oa(h, "script"))), b.call(this[j], h, j);
                        if (g)
                            for (i = f[f.length - 1].ownerDocument, n.map(f, la), j = 0; g > j; j++)
                                h = f[j], fa.test(h.type || "") && !L.access(h, "globalEval") && n.contains(i, h) && (h.src ? n._evalUrl && n._evalUrl(h.src) : n.globalEval(h.textContent.replace(ha, "")));
                    } return this; } }), n.each({ appendTo: "append", prependTo: "prepend", insertBefore: "before", insertAfter: "after", replaceAll: "replaceWith" }, function (a, b) { n.fn[a] = function (a) { for (var c, d = [], e = n(a), g = e.length - 1, h = 0; g >= h; h++)
                    c = h === g ? this : this.clone(!0), n(e[h])[b](c), f.apply(d, c.get()); return this.pushStack(d); }; });
                var qa, ra = {};
                function sa(b, c) { var d, e = n(c.createElement(b)).appendTo(c.body), f = a.getDefaultComputedStyle && (d = a.getDefaultComputedStyle(e[0])) ? d.display : n.css(e[0], "display"); return e.detach(), f; }
                function ta(a) { var b = l, c = ra[a]; return c || (c = sa(a, b), "none" !== c && c || (qa = (qa || n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement), b = qa[0].contentDocument, b.write(), b.close(), c = sa(a, b), qa.detach()), ra[a] = c), c; }
                var ua = /^margin/, va = new RegExp("^(" + Q + ")(?!px)[a-z%]+$", "i"), wa = function (b) { return b.ownerDocument.defaultView.opener ? b.ownerDocument.defaultView.getComputedStyle(b, null) : a.getComputedStyle(b, null); };
                function xa(a, b, c) { var d, e, f, g, h = a.style; return c = c || wa(a), c && (g = c.getPropertyValue(b) || c[b]), c && ("" !== g || n.contains(a.ownerDocument, a) || (g = n.style(a, b)), va.test(g) && ua.test(b) && (d = h.width, e = h.minWidth, f = h.maxWidth, h.minWidth = h.maxWidth = h.width = g, g = c.width, h.width = d, h.minWidth = e, h.maxWidth = f)), void 0 !== g ? g + "" : g; }
                function ya(a, b) { return { get: function () { return a() ? void delete this.get : (this.get = b).apply(this, arguments); } }; }
                !function () { var b, c, d = l.documentElement, e = l.createElement("div"), f = l.createElement("div"); if (f.style) {
                    f.style.backgroundClip = "content-box", f.cloneNode(!0).style.backgroundClip = "", k.clearCloneStyle = "content-box" === f.style.backgroundClip, e.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute", e.appendChild(f);
                    function g() { f.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute", f.innerHTML = "", d.appendChild(e); var g = a.getComputedStyle(f, null); b = "1%" !== g.top, c = "4px" === g.width, d.removeChild(e); }
                    a.getComputedStyle && n.extend(k, { pixelPosition: function () { return g(), b; }, boxSizingReliable: function () { return null == c && g(), c; }, reliableMarginRight: function () { var b, c = f.appendChild(l.createElement("div")); return c.style.cssText = f.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0", c.style.marginRight = c.style.width = "0", f.style.width = "1px", d.appendChild(e), b = !parseFloat(a.getComputedStyle(c, null).marginRight), d.removeChild(e), f.removeChild(c), b; } });
                } }(), n.swap = function (a, b, c, d) { var e, f, g = {}; for (f in b)
                    g[f] = a.style[f], a.style[f] = b[f]; e = c.apply(a, d || []); for (f in b)
                    a.style[f] = g[f]; return e; };
                var za = /^(none|table(?!-c[ea]).+)/, Aa = new RegExp("^(" + Q + ")(.*)$", "i"), Ba = new RegExp("^([+-])=(" + Q + ")", "i"), Ca = { position: "absolute", visibility: "hidden", display: "block" }, Da = { letterSpacing: "0", fontWeight: "400" }, Ea = ["Webkit", "O", "Moz", "ms"];
                function Fa(a, b) { if (b in a)
                    return b; var c = b[0].toUpperCase() + b.slice(1), d = b, e = Ea.length; while (e--)
                    if (b = Ea[e] + c, b in a)
                        return b; return d; }
                function Ga(a, b, c) { var d = Aa.exec(b); return d ? Math.max(0, d[1] - (c || 0)) + (d[2] || "px") : b; }
                function Ha(a, b, c, d, e) { for (var f = c === (d ? "border" : "content") ? 4 : "width" === b ? 1 : 0, g = 0; 4 > f; f += 2)
                    "margin" === c && (g += n.css(a, c + R[f], !0, e)), d ? ("content" === c && (g -= n.css(a, "padding" + R[f], !0, e)), "margin" !== c && (g -= n.css(a, "border" + R[f] + "Width", !0, e))) : (g += n.css(a, "padding" + R[f], !0, e), "padding" !== c && (g += n.css(a, "border" + R[f] + "Width", !0, e))); return g; }
                function Ia(a, b, c) { var d = !0, e = "width" === b ? a.offsetWidth : a.offsetHeight, f = wa(a), g = "border-box" === n.css(a, "boxSizing", !1, f); if (0 >= e || null == e) {
                    if (e = xa(a, b, f), (0 > e || null == e) && (e = a.style[b]), va.test(e))
                        return e;
                    d = g && (k.boxSizingReliable() || e === a.style[b]), e = parseFloat(e) || 0;
                } return e + Ha(a, b, c || (g ? "border" : "content"), d, f) + "px"; }
                function Ja(a, b) { for (var c, d, e, f = [], g = 0, h = a.length; h > g; g++)
                    d = a[g], d.style && (f[g] = L.get(d, "olddisplay"), c = d.style.display, b ? (f[g] || "none" !== c || (d.style.display = ""), "" === d.style.display && S(d) && (f[g] = L.access(d, "olddisplay", ta(d.nodeName)))) : (e = S(d), "none" === c && e || L.set(d, "olddisplay", e ? c : n.css(d, "display")))); for (g = 0; h > g; g++)
                    d = a[g], d.style && (b && "none" !== d.style.display && "" !== d.style.display || (d.style.display = b ? f[g] || "" : "none")); return a; }
                n.extend({ cssHooks: { opacity: { get: function (a, b) { if (b) {
                                var c = xa(a, "opacity");
                                return "" === c ? "1" : c;
                            } } } }, cssNumber: { columnCount: !0, fillOpacity: !0, flexGrow: !0, flexShrink: !0, fontWeight: !0, lineHeight: !0, opacity: !0, order: !0, orphans: !0, widows: !0, zIndex: !0, zoom: !0 }, cssProps: { "float": "cssFloat" }, style: function (a, b, c, d) { if (a && 3 !== a.nodeType && 8 !== a.nodeType && a.style) {
                        var e, f, g, h = n.camelCase(b), i = a.style;
                        return b = n.cssProps[h] || (n.cssProps[h] = Fa(i, h)), g = n.cssHooks[b] || n.cssHooks[h], void 0 === c ? g && "get" in g && void 0 !== (e = g.get(a, !1, d)) ? e : i[b] : (f = typeof c, "string" === f && (e = Ba.exec(c)) && (c = (e[1] + 1) * e[2] + parseFloat(n.css(a, b)), f = "number"), null != c && c === c && ("number" !== f || n.cssNumber[h] || (c += "px"), k.clearCloneStyle || "" !== c || 0 !== b.indexOf("background") || (i[b] = "inherit"), g && "set" in g && void 0 === (c = g.set(a, c, d)) || (i[b] = c)), void 0);
                    } }, css: function (a, b, c, d) { var e, f, g, h = n.camelCase(b); return b = n.cssProps[h] || (n.cssProps[h] = Fa(a.style, h)), g = n.cssHooks[b] || n.cssHooks[h], g && "get" in g && (e = g.get(a, !0, c)), void 0 === e && (e = xa(a, b, d)), "normal" === e && b in Da && (e = Da[b]), "" === c || c ? (f = parseFloat(e), c === !0 || n.isNumeric(f) ? f || 0 : e) : e; } }), n.each(["height", "width"], function (a, b) { n.cssHooks[b] = { get: function (a, c, d) { return c ? za.test(n.css(a, "display")) && 0 === a.offsetWidth ? n.swap(a, Ca, function () { return Ia(a, b, d); }) : Ia(a, b, d) : void 0; }, set: function (a, c, d) { var e = d && wa(a); return Ga(a, c, d ? Ha(a, b, d, "border-box" === n.css(a, "boxSizing", !1, e), e) : 0); } }; }), n.cssHooks.marginRight = ya(k.reliableMarginRight, function (a, b) { return b ? n.swap(a, { display: "inline-block" }, xa, [a, "marginRight"]) : void 0; }), n.each({ margin: "", padding: "", border: "Width" }, function (a, b) { n.cssHooks[a + b] = { expand: function (c) { for (var d = 0, e = {}, f = "string" == typeof c ? c.split(" ") : [c]; 4 > d; d++)
                        e[a + R[d] + b] = f[d] || f[d - 2] || f[0]; return e; } }, ua.test(a) || (n.cssHooks[a + b].set = Ga); }), n.fn.extend({ css: function (a, b) { return J(this, function (a, b, c) { var d, e, f = {}, g = 0; if (n.isArray(b)) {
                        for (d = wa(a), e = b.length; e > g; g++)
                            f[b[g]] = n.css(a, b[g], !1, d);
                        return f;
                    } return void 0 !== c ? n.style(a, b, c) : n.css(a, b); }, a, b, arguments.length > 1); }, show: function () { return Ja(this, !0); }, hide: function () { return Ja(this); }, toggle: function (a) { return "boolean" == typeof a ? a ? this.show() : this.hide() : this.each(function () { S(this) ? n(this).show() : n(this).hide(); }); } });
                function Ka(a, b, c, d, e) { return new Ka.prototype.init(a, b, c, d, e); }
                n.Tween = Ka, Ka.prototype = { constructor: Ka, init: function (a, b, c, d, e, f) { this.elem = a, this.prop = c, this.easing = e || "swing", this.options = b, this.start = this.now = this.cur(), this.end = d, this.unit = f || (n.cssNumber[c] ? "" : "px"); }, cur: function () { var a = Ka.propHooks[this.prop]; return a && a.get ? a.get(this) : Ka.propHooks._default.get(this); }, run: function (a) { var b, c = Ka.propHooks[this.prop]; return this.options.duration ? this.pos = b = n.easing[this.easing](a, this.options.duration * a, 0, 1, this.options.duration) : this.pos = b = a, this.now = (this.end - this.start) * b + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), c && c.set ? c.set(this) : Ka.propHooks._default.set(this), this; } }, Ka.prototype.init.prototype = Ka.prototype, Ka.propHooks = { _default: { get: function (a) { var b; return null == a.elem[a.prop] || a.elem.style && null != a.elem.style[a.prop] ? (b = n.css(a.elem, a.prop, ""), b && "auto" !== b ? b : 0) : a.elem[a.prop]; }, set: function (a) { n.fx.step[a.prop] ? n.fx.step[a.prop](a) : a.elem.style && (null != a.elem.style[n.cssProps[a.prop]] || n.cssHooks[a.prop]) ? n.style(a.elem, a.prop, a.now + a.unit) : a.elem[a.prop] = a.now; } } }, Ka.propHooks.scrollTop = Ka.propHooks.scrollLeft = { set: function (a) { a.elem.nodeType && a.elem.parentNode && (a.elem[a.prop] = a.now); } }, n.easing = { linear: function (a) { return a; }, swing: function (a) { return .5 - Math.cos(a * Math.PI) / 2; } }, n.fx = Ka.prototype.init, n.fx.step = {};
                var La, Ma, Na = /^(?:toggle|show|hide)$/, Oa = new RegExp("^(?:([+-])=|)(" + Q + ")([a-z%]*)$", "i"), Pa = /queueHooks$/, Qa = [Va], Ra = { "*": [function (a, b) { var c = this.createTween(a, b), d = c.cur(), e = Oa.exec(b), f = e && e[3] || (n.cssNumber[a] ? "" : "px"), g = (n.cssNumber[a] || "px" !== f && +d) && Oa.exec(n.css(c.elem, a)), h = 1, i = 20; if (g && g[3] !== f) {
                            f = f || g[3], e = e || [], g = +d || 1;
                            do
                                h = h || ".5", g /= h, n.style(c.elem, a, g + f);
                            while (h !== (h = c.cur() / d) && 1 !== h && --i);
                        } return e && (g = c.start = +g || +d || 0, c.unit = f, c.end = e[1] ? g + (e[1] + 1) * e[2] : +e[2]), c; }] };
                function Sa() { return setTimeout(function () { La = void 0; }), La = n.now(); }
                function Ta(a, b) { var c, d = 0, e = { height: a }; for (b = b ? 1 : 0; 4 > d; d += 2 - b)
                    c = R[d], e["margin" + c] = e["padding" + c] = a; return b && (e.opacity = e.width = a), e; }
                function Ua(a, b, c) { for (var d, e = (Ra[b] || []).concat(Ra["*"]), f = 0, g = e.length; g > f; f++)
                    if (d = e[f].call(c, b, a))
                        return d; }
                function Va(a, b, c) { var d, e, f, g, h, i, j, k, l = this, m = {}, o = a.style, p = a.nodeType && S(a), q = L.get(a, "fxshow"); c.queue || (h = n._queueHooks(a, "fx"), null == h.unqueued && (h.unqueued = 0, i = h.empty.fire, h.empty.fire = function () { h.unqueued || i(); }), h.unqueued++, l.always(function () { l.always(function () { h.unqueued--, n.queue(a, "fx").length || h.empty.fire(); }); })), 1 === a.nodeType && ("height" in b || "width" in b) && (c.overflow = [o.overflow, o.overflowX, o.overflowY], j = n.css(a, "display"), k = "none" === j ? L.get(a, "olddisplay") || ta(a.nodeName) : j, "inline" === k && "none" === n.css(a, "float") && (o.display = "inline-block")), c.overflow && (o.overflow = "hidden", l.always(function () { o.overflow = c.overflow[0], o.overflowX = c.overflow[1], o.overflowY = c.overflow[2]; })); for (d in b)
                    if (e = b[d], Na.exec(e)) {
                        if (delete b[d], f = f || "toggle" === e, e === (p ? "hide" : "show")) {
                            if ("show" !== e || !q || void 0 === q[d])
                                continue;
                            p = !0;
                        }
                        m[d] = q && q[d] || n.style(a, d);
                    }
                    else
                        j = void 0; if (n.isEmptyObject(m))
                    "inline" === ("none" === j ? ta(a.nodeName) : j) && (o.display = j);
                else {
                    q ? "hidden" in q && (p = q.hidden) : q = L.access(a, "fxshow", {}), f && (q.hidden = !p), p ? n(a).show() : l.done(function () { n(a).hide(); }), l.done(function () { var b; L.remove(a, "fxshow"); for (b in m)
                        n.style(a, b, m[b]); });
                    for (d in m)
                        g = Ua(p ? q[d] : 0, d, l), d in q || (q[d] = g.start, p && (g.end = g.start, g.start = "width" === d || "height" === d ? 1 : 0));
                } }
                function Wa(a, b) { var c, d, e, f, g; for (c in a)
                    if (d = n.camelCase(c), e = b[d], f = a[c], n.isArray(f) && (e = f[1], f = a[c] = f[0]), c !== d && (a[d] = f, delete a[c]), g = n.cssHooks[d], g && "expand" in g) {
                        f = g.expand(f), delete a[d];
                        for (c in f)
                            c in a || (a[c] = f[c], b[c] = e);
                    }
                    else
                        b[d] = e; }
                function Xa(a, b, c) { var d, e, f = 0, g = Qa.length, h = n.Deferred().always(function () { delete i.elem; }), i = function () { if (e)
                    return !1; for (var b = La || Sa(), c = Math.max(0, j.startTime + j.duration - b), d = c / j.duration || 0, f = 1 - d, g = 0, i = j.tweens.length; i > g; g++)
                    j.tweens[g].run(f); return h.notifyWith(a, [j, f, c]), 1 > f && i ? c : (h.resolveWith(a, [j]), !1); }, j = h.promise({ elem: a, props: n.extend({}, b), opts: n.extend(!0, { specialEasing: {} }, c), originalProperties: b, originalOptions: c, startTime: La || Sa(), duration: c.duration, tweens: [], createTween: function (b, c) { var d = n.Tween(a, j.opts, b, c, j.opts.specialEasing[b] || j.opts.easing); return j.tweens.push(d), d; }, stop: function (b) { var c = 0, d = b ? j.tweens.length : 0; if (e)
                        return this; for (e = !0; d > c; c++)
                        j.tweens[c].run(1); return b ? h.resolveWith(a, [j, b]) : h.rejectWith(a, [j, b]), this; } }), k = j.props; for (Wa(k, j.opts.specialEasing); g > f; f++)
                    if (d = Qa[f].call(j, a, k, j.opts))
                        return d; return n.map(k, Ua, j), n.isFunction(j.opts.start) && j.opts.start.call(a, j), n.fx.timer(n.extend(i, { elem: a, anim: j, queue: j.opts.queue })), j.progress(j.opts.progress).done(j.opts.done, j.opts.complete).fail(j.opts.fail).always(j.opts.always); }
                n.Animation = n.extend(Xa, { tweener: function (a, b) { n.isFunction(a) ? (b = a, a = ["*"]) : a = a.split(" "); for (var c, d = 0, e = a.length; e > d; d++)
                        c = a[d], Ra[c] = Ra[c] || [], Ra[c].unshift(b); }, prefilter: function (a, b) { b ? Qa.unshift(a) : Qa.push(a); } }), n.speed = function (a, b, c) { var d = a && "object" == typeof a ? n.extend({}, a) : { complete: c || !c && b || n.isFunction(a) && a, duration: a, easing: c && b || b && !n.isFunction(b) && b }; return d.duration = n.fx.off ? 0 : "number" == typeof d.duration ? d.duration : d.duration in n.fx.speeds ? n.fx.speeds[d.duration] : n.fx.speeds._default, (null == d.queue || d.queue === !0) && (d.queue = "fx"), d.old = d.complete, d.complete = function () { n.isFunction(d.old) && d.old.call(this), d.queue && n.dequeue(this, d.queue); }, d; }, n.fn.extend({ fadeTo: function (a, b, c, d) { return this.filter(S).css("opacity", 0).show().end().animate({ opacity: b }, a, c, d); }, animate: function (a, b, c, d) { var e = n.isEmptyObject(a), f = n.speed(b, c, d), g = function () { var b = Xa(this, n.extend({}, a), f); (e || L.get(this, "finish")) && b.stop(!0); }; return g.finish = g, e || f.queue === !1 ? this.each(g) : this.queue(f.queue, g); }, stop: function (a, b, c) { var d = function (a) { var b = a.stop; delete a.stop, b(c); }; return "string" != typeof a && (c = b, b = a, a = void 0), b && a !== !1 && this.queue(a || "fx", []), this.each(function () { var b = !0, e = null != a && a + "queueHooks", f = n.timers, g = L.get(this); if (e)
                        g[e] && g[e].stop && d(g[e]);
                    else
                        for (e in g)
                            g[e] && g[e].stop && Pa.test(e) && d(g[e]); for (e = f.length; e--;)
                        f[e].elem !== this || null != a && f[e].queue !== a || (f[e].anim.stop(c), b = !1, f.splice(e, 1)); (b || !c) && n.dequeue(this, a); }); }, finish: function (a) { return a !== !1 && (a = a || "fx"), this.each(function () { var b, c = L.get(this), d = c[a + "queue"], e = c[a + "queueHooks"], f = n.timers, g = d ? d.length : 0; for (c.finish = !0, n.queue(this, a, []), e && e.stop && e.stop.call(this, !0), b = f.length; b--;)
                        f[b].elem === this && f[b].queue === a && (f[b].anim.stop(!0), f.splice(b, 1)); for (b = 0; g > b; b++)
                        d[b] && d[b].finish && d[b].finish.call(this); delete c.finish; }); } }), n.each(["toggle", "show", "hide"], function (a, b) { var c = n.fn[b]; n.fn[b] = function (a, d, e) { return null == a || "boolean" == typeof a ? c.apply(this, arguments) : this.animate(Ta(b, !0), a, d, e); }; }), n.each({ slideDown: Ta("show"), slideUp: Ta("hide"), slideToggle: Ta("toggle"), fadeIn: { opacity: "show" }, fadeOut: { opacity: "hide" }, fadeToggle: { opacity: "toggle" } }, function (a, b) { n.fn[a] = function (a, c, d) { return this.animate(b, a, c, d); }; }), n.timers = [], n.fx.tick = function () { var a, b = 0, c = n.timers; for (La = n.now(); b < c.length; b++)
                    a = c[b], a() || c[b] !== a || c.splice(b--, 1); c.length || n.fx.stop(), La = void 0; }, n.fx.timer = function (a) { n.timers.push(a), a() ? n.fx.start() : n.timers.pop(); }, n.fx.interval = 13, n.fx.start = function () { Ma || (Ma = setInterval(n.fx.tick, n.fx.interval)); }, n.fx.stop = function () { clearInterval(Ma), Ma = null; }, n.fx.speeds = { slow: 600, fast: 200, _default: 400 }, n.fn.delay = function (a, b) { return a = n.fx ? n.fx.speeds[a] || a : a, b = b || "fx", this.queue(b, function (b, c) { var d = setTimeout(b, a); c.stop = function () { clearTimeout(d); }; }); }, function () { var a = l.createElement("input"), b = l.createElement("select"), c = b.appendChild(l.createElement("option")); a.type = "checkbox", k.checkOn = "" !== a.value, k.optSelected = c.selected, b.disabled = !0, k.optDisabled = !c.disabled, a = l.createElement("input"), a.value = "t", a.type = "radio", k.radioValue = "t" === a.value; }();
                var Ya, Za, $a = n.expr.attrHandle;
                n.fn.extend({ attr: function (a, b) { return J(this, n.attr, a, b, arguments.length > 1); }, removeAttr: function (a) { return this.each(function () { n.removeAttr(this, a); }); } }), n.extend({ attr: function (a, b, c) {
                        var d, e, f = a.nodeType;
                        if (a && 3 !== f && 8 !== f && 2 !== f)
                            return typeof a.getAttribute === U ? n.prop(a, b, c) : (1 === f && n.isXMLDoc(a) || (b = b.toLowerCase(), d = n.attrHooks[b] || (n.expr.match.bool.test(b) ? Za : Ya)),
                                void 0 === c ? d && "get" in d && null !== (e = d.get(a, b)) ? e : (e = n.find.attr(a, b), null == e ? void 0 : e) : null !== c ? d && "set" in d && void 0 !== (e = d.set(a, c, b)) ? e : (a.setAttribute(b, c + ""), c) : void n.removeAttr(a, b));
                    }, removeAttr: function (a, b) { var c, d, e = 0, f = b && b.match(E); if (f && 1 === a.nodeType)
                        while (c = f[e++])
                            d = n.propFix[c] || c, n.expr.match.bool.test(c) && (a[d] = !1), a.removeAttribute(c); }, attrHooks: { type: { set: function (a, b) { if (!k.radioValue && "radio" === b && n.nodeName(a, "input")) {
                                var c = a.value;
                                return a.setAttribute("type", b), c && (a.value = c), b;
                            } } } } }), Za = { set: function (a, b, c) { return b === !1 ? n.removeAttr(a, c) : a.setAttribute(c, c), c; } }, n.each(n.expr.match.bool.source.match(/\w+/g), function (a, b) { var c = $a[b] || n.find.attr; $a[b] = function (a, b, d) { var e, f; return d || (f = $a[b], $a[b] = e, e = null != c(a, b, d) ? b.toLowerCase() : null, $a[b] = f), e; }; });
                var _a = /^(?:input|select|textarea|button)$/i;
                n.fn.extend({ prop: function (a, b) { return J(this, n.prop, a, b, arguments.length > 1); }, removeProp: function (a) { return this.each(function () { delete this[n.propFix[a] || a]; }); } }), n.extend({ propFix: { "for": "htmlFor", "class": "className" }, prop: function (a, b, c) { var d, e, f, g = a.nodeType; if (a && 3 !== g && 8 !== g && 2 !== g)
                        return f = 1 !== g || !n.isXMLDoc(a), f && (b = n.propFix[b] || b, e = n.propHooks[b]), void 0 !== c ? e && "set" in e && void 0 !== (d = e.set(a, c, b)) ? d : a[b] = c : e && "get" in e && null !== (d = e.get(a, b)) ? d : a[b]; }, propHooks: { tabIndex: { get: function (a) { return a.hasAttribute("tabindex") || _a.test(a.nodeName) || a.href ? a.tabIndex : -1; } } } }), k.optSelected || (n.propHooks.selected = { get: function (a) { var b = a.parentNode; return b && b.parentNode && b.parentNode.selectedIndex, null; } }), n.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () { n.propFix[this.toLowerCase()] = this; });
                var ab = /[\t\r\n\f]/g;
                n.fn.extend({ addClass: function (a) { var b, c, d, e, f, g, h = "string" == typeof a && a, i = 0, j = this.length; if (n.isFunction(a))
                        return this.each(function (b) { n(this).addClass(a.call(this, b, this.className)); }); if (h)
                        for (b = (a || "").match(E) || []; j > i; i++)
                            if (c = this[i], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(ab, " ") : " ")) {
                                f = 0;
                                while (e = b[f++])
                                    d.indexOf(" " + e + " ") < 0 && (d += e + " ");
                                g = n.trim(d), c.className !== g && (c.className = g);
                            } return this; }, removeClass: function (a) { var b, c, d, e, f, g, h = 0 === arguments.length || "string" == typeof a && a, i = 0, j = this.length; if (n.isFunction(a))
                        return this.each(function (b) { n(this).removeClass(a.call(this, b, this.className)); }); if (h)
                        for (b = (a || "").match(E) || []; j > i; i++)
                            if (c = this[i], d = 1 === c.nodeType && (c.className ? (" " + c.className + " ").replace(ab, " ") : "")) {
                                f = 0;
                                while (e = b[f++])
                                    while (d.indexOf(" " + e + " ") >= 0)
                                        d = d.replace(" " + e + " ", " ");
                                g = a ? n.trim(d) : "", c.className !== g && (c.className = g);
                            } return this; }, toggleClass: function (a, b) { var c = typeof a; return "boolean" == typeof b && "string" === c ? b ? this.addClass(a) : this.removeClass(a) : this.each(n.isFunction(a) ? function (c) { n(this).toggleClass(a.call(this, c, this.className, b), b); } : function () { if ("string" === c) {
                        var b, d = 0, e = n(this), f = a.match(E) || [];
                        while (b = f[d++])
                            e.hasClass(b) ? e.removeClass(b) : e.addClass(b);
                    }
                    else
                        (c === U || "boolean" === c) && (this.className && L.set(this, "__className__", this.className), this.className = this.className || a === !1 ? "" : L.get(this, "__className__") || ""); }); }, hasClass: function (a) { for (var b = " " + a + " ", c = 0, d = this.length; d > c; c++)
                        if (1 === this[c].nodeType && (" " + this[c].className + " ").replace(ab, " ").indexOf(b) >= 0)
                            return !0; return !1; } });
                var bb = /\r/g;
                n.fn.extend({ val: function (a) { var b, c, d, e = this[0]; {
                        if (arguments.length)
                            return d = n.isFunction(a), this.each(function (c) { var e; 1 === this.nodeType && (e = d ? a.call(this, c, n(this).val()) : a, null == e ? e = "" : "number" == typeof e ? e += "" : n.isArray(e) && (e = n.map(e, function (a) { return null == a ? "" : a + ""; })), b = n.valHooks[this.type] || n.valHooks[this.nodeName.toLowerCase()], b && "set" in b && void 0 !== b.set(this, e, "value") || (this.value = e)); });
                        if (e)
                            return b = n.valHooks[e.type] || n.valHooks[e.nodeName.toLowerCase()], b && "get" in b && void 0 !== (c = b.get(e, "value")) ? c : (c = e.value, "string" == typeof c ? c.replace(bb, "") : null == c ? "" : c);
                    } } }), n.extend({ valHooks: { option: { get: function (a) { var b = n.find.attr(a, "value"); return null != b ? b : n.trim(n.text(a)); } }, select: { get: function (a) { for (var b, c, d = a.options, e = a.selectedIndex, f = "select-one" === a.type || 0 > e, g = f ? null : [], h = f ? e + 1 : d.length, i = 0 > e ? h : f ? e : 0; h > i; i++)
                                if (c = d[i], !(!c.selected && i !== e || (k.optDisabled ? c.disabled : null !== c.getAttribute("disabled")) || c.parentNode.disabled && n.nodeName(c.parentNode, "optgroup"))) {
                                    if (b = n(c).val(), f)
                                        return b;
                                    g.push(b);
                                } return g; }, set: function (a, b) { var c, d, e = a.options, f = n.makeArray(b), g = e.length; while (g--)
                                d = e[g], (d.selected = n.inArray(d.value, f) >= 0) && (c = !0); return c || (a.selectedIndex = -1), f; } } } }), n.each(["radio", "checkbox"], function () { n.valHooks[this] = { set: function (a, b) { return n.isArray(b) ? a.checked = n.inArray(n(a).val(), b) >= 0 : void 0; } }, k.checkOn || (n.valHooks[this].get = function (a) { return null === a.getAttribute("value") ? "on" : a.value; }); }), n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (a, b) { n.fn[b] = function (a, c) { return arguments.length > 0 ? this.on(b, null, a, c) : this.trigger(b); }; }), n.fn.extend({ hover: function (a, b) { return this.mouseenter(a).mouseleave(b || a); }, bind: function (a, b, c) { return this.on(a, null, b, c); }, unbind: function (a, b) { return this.off(a, null, b); }, delegate: function (a, b, c, d) { return this.on(b, a, c, d); }, undelegate: function (a, b, c) { return 1 === arguments.length ? this.off(a, "**") : this.off(b, a || "**", c); } });
                var cb = n.now(), db = /\?/;
                n.parseJSON = function (a) { return JSON.parse(a + ""); }, n.parseXML = function (a) { var b, c; if (!a || "string" != typeof a)
                    return null; try {
                    c = new DOMParser, b = c.parseFromString(a, "text/xml");
                }
                catch (d) {
                    b = void 0;
                } return (!b || b.getElementsByTagName("parsererror").length) && n.error("Invalid XML: " + a), b; };
                var eb = /#.*$/, fb = /([?&])_=[^&]*/, gb = /^(.*?):[ \t]*([^\r\n]*)$/gm, hb = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, ib = /^(?:GET|HEAD)$/, jb = /^\/\//, kb = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, lb = {}, mb = {}, nb = "*/".concat("*"), ob = a.location.href, pb = kb.exec(ob.toLowerCase()) || [];
                function qb(a) { return function (b, c) { "string" != typeof b && (c = b, b = "*"); var d, e = 0, f = b.toLowerCase().match(E) || []; if (n.isFunction(c))
                    while (d = f[e++])
                        "+" === d[0] ? (d = d.slice(1) || "*", (a[d] = a[d] || []).unshift(c)) : (a[d] = a[d] || []).push(c); }; }
                function rb(a, b, c, d) { var e = {}, f = a === mb; function g(h) { var i; return e[h] = !0, n.each(a[h] || [], function (a, h) { var j = h(b, c, d); return "string" != typeof j || f || e[j] ? f ? !(i = j) : void 0 : (b.dataTypes.unshift(j), g(j), !1); }), i; } return g(b.dataTypes[0]) || !e["*"] && g("*"); }
                function sb(a, b) { var c, d, e = n.ajaxSettings.flatOptions || {}; for (c in b)
                    void 0 !== b[c] && ((e[c] ? a : d || (d = {}))[c] = b[c]); return d && n.extend(!0, a, d), a; }
                function tb(a, b, c) { var d, e, f, g, h = a.contents, i = a.dataTypes; while ("*" === i[0])
                    i.shift(), void 0 === d && (d = a.mimeType || b.getResponseHeader("Content-Type")); if (d)
                    for (e in h)
                        if (h[e] && h[e].test(d)) {
                            i.unshift(e);
                            break;
                        } if (i[0] in c)
                    f = i[0];
                else {
                    for (e in c) {
                        if (!i[0] || a.converters[e + " " + i[0]]) {
                            f = e;
                            break;
                        }
                        g || (g = e);
                    }
                    f = f || g;
                } return f ? (f !== i[0] && i.unshift(f), c[f]) : void 0; }
                function ub(a, b, c, d) { var e, f, g, h, i, j = {}, k = a.dataTypes.slice(); if (k[1])
                    for (g in a.converters)
                        j[g.toLowerCase()] = a.converters[g]; f = k.shift(); while (f)
                    if (a.responseFields[f] && (c[a.responseFields[f]] = b), !i && d && a.dataFilter && (b = a.dataFilter(b, a.dataType)), i = f, f = k.shift())
                        if ("*" === f)
                            f = i;
                        else if ("*" !== i && i !== f) {
                            if (g = j[i + " " + f] || j["* " + f], !g)
                                for (e in j)
                                    if (h = e.split(" "), h[1] === f && (g = j[i + " " + h[0]] || j["* " + h[0]])) {
                                        g === !0 ? g = j[e] : j[e] !== !0 && (f = h[0], k.unshift(h[1]));
                                        break;
                                    }
                            if (g !== !0)
                                if (g && a["throws"])
                                    b = g(b);
                                else
                                    try {
                                        b = g(b);
                                    }
                                    catch (l) {
                                        return { state: "parsererror", error: g ? l : "No conversion from " + i + " to " + f };
                                    }
                        } return { state: "success", data: b }; }
                n.extend({ active: 0, lastModified: {}, etag: {}, ajaxSettings: { url: ob, type: "GET", isLocal: hb.test(pb[1]), global: !0, processData: !0, async: !0, contentType: "application/x-www-form-urlencoded; charset=UTF-8", accepts: { "*": nb, text: "text/plain", html: "text/html", xml: "application/xml, text/xml", json: "application/json, text/javascript" }, contents: { xml: /xml/, html: /html/, json: /json/ }, responseFields: { xml: "responseXML", text: "responseText", json: "responseJSON" }, converters: { "* text": String, "text html": !0, "text json": n.parseJSON, "text xml": n.parseXML }, flatOptions: { url: !0, context: !0 } }, ajaxSetup: function (a, b) { return b ? sb(sb(a, n.ajaxSettings), b) : sb(n.ajaxSettings, a); }, ajaxPrefilter: qb(lb), ajaxTransport: qb(mb), ajax: function (a, b) { "object" == typeof a && (b = a, a = void 0), b = b || {}; var c, d, e, f, g, h, i, j, k = n.ajaxSetup({}, b), l = k.context || k, m = k.context && (l.nodeType || l.jquery) ? n(l) : n.event, o = n.Deferred(), p = n.Callbacks("once memory"), q = k.statusCode || {}, r = {}, s = {}, t = 0, u = "canceled", v = { readyState: 0, getResponseHeader: function (a) { var b; if (2 === t) {
                            if (!f) {
                                f = {};
                                while (b = gb.exec(e))
                                    f[b[1].toLowerCase()] = b[2];
                            }
                            b = f[a.toLowerCase()];
                        } return null == b ? null : b; }, getAllResponseHeaders: function () { return 2 === t ? e : null; }, setRequestHeader: function (a, b) { var c = a.toLowerCase(); return t || (a = s[c] = s[c] || a, r[a] = b), this; }, overrideMimeType: function (a) { return t || (k.mimeType = a), this; }, statusCode: function (a) { var b; if (a)
                            if (2 > t)
                                for (b in a)
                                    q[b] = [q[b], a[b]];
                            else
                                v.always(a[v.status]); return this; }, abort: function (a) { var b = a || u; return c && c.abort(b), x(0, b), this; } }; if (o.promise(v).complete = p.add, v.success = v.done, v.error = v.fail, k.url = ((a || k.url || ob) + "").replace(eb, "").replace(jb, pb[1] + "//"), k.type = b.method || b.type || k.method || k.type, k.dataTypes = n.trim(k.dataType || "*").toLowerCase().match(E) || [""], null == k.crossDomain && (h = kb.exec(k.url.toLowerCase()), k.crossDomain = !(!h || h[1] === pb[1] && h[2] === pb[2] && (h[3] || ("http:" === h[1] ? "80" : "443")) === (pb[3] || ("http:" === pb[1] ? "80" : "443")))), k.data && k.processData && "string" != typeof k.data && (k.data = n.param(k.data, k.traditional)), rb(lb, k, b, v), 2 === t)
                        return v; i = n.event && k.global, i && 0 === n.active++ && n.event.trigger("ajaxStart"), k.type = k.type.toUpperCase(), k.hasContent = !ib.test(k.type), d = k.url, k.hasContent || (k.data && (d = k.url += (db.test(d) ? "&" : "?") + k.data, delete k.data), k.cache === !1 && (k.url = fb.test(d) ? d.replace(fb, "$1_=" + cb++) : d + (db.test(d) ? "&" : "?") + "_=" + cb++)), k.ifModified && (n.lastModified[d] && v.setRequestHeader("If-Modified-Since", n.lastModified[d]), n.etag[d] && v.setRequestHeader("If-None-Match", n.etag[d])), (k.data && k.hasContent && k.contentType !== !1 || b.contentType) && v.setRequestHeader("Content-Type", k.contentType), v.setRequestHeader("Accept", k.dataTypes[0] && k.accepts[k.dataTypes[0]] ? k.accepts[k.dataTypes[0]] + ("*" !== k.dataTypes[0] ? ", " + nb + "; q=0.01" : "") : k.accepts["*"]); for (j in k.headers)
                        v.setRequestHeader(j, k.headers[j]); if (k.beforeSend && (k.beforeSend.call(l, v, k) === !1 || 2 === t))
                        return v.abort(); u = "abort"; for (j in { success: 1, error: 1, complete: 1 })
                        v[j](k[j]); if (c = rb(mb, k, b, v)) {
                        v.readyState = 1, i && m.trigger("ajaxSend", [v, k]), k.async && k.timeout > 0 && (g = setTimeout(function () { v.abort("timeout"); }, k.timeout));
                        try {
                            t = 1, c.send(r, x);
                        }
                        catch (w) {
                            if (!(2 > t))
                                throw w;
                            x(-1, w);
                        }
                    }
                    else
                        x(-1, "No Transport"); function x(a, b, f, h) { var j, r, s, u, w, x = b; 2 !== t && (t = 2, g && clearTimeout(g), c = void 0, e = h || "", v.readyState = a > 0 ? 4 : 0, j = a >= 200 && 300 > a || 304 === a, f && (u = tb(k, v, f)), u = ub(k, u, v, j), j ? (k.ifModified && (w = v.getResponseHeader("Last-Modified"), w && (n.lastModified[d] = w), w = v.getResponseHeader("etag"), w && (n.etag[d] = w)), 204 === a || "HEAD" === k.type ? x = "nocontent" : 304 === a ? x = "notmodified" : (x = u.state, r = u.data, s = u.error, j = !s)) : (s = x, (a || !x) && (x = "error", 0 > a && (a = 0))), v.status = a, v.statusText = (b || x) + "", j ? o.resolveWith(l, [r, x, v]) : o.rejectWith(l, [v, x, s]), v.statusCode(q), q = void 0, i && m.trigger(j ? "ajaxSuccess" : "ajaxError", [v, k, j ? r : s]), p.fireWith(l, [v, x]), i && (m.trigger("ajaxComplete", [v, k]), --n.active || n.event.trigger("ajaxStop"))); } return v; }, getJSON: function (a, b, c) { return n.get(a, b, c, "json"); }, getScript: function (a, b) { return n.get(a, void 0, b, "script"); } }), n.each(["get", "post"], function (a, b) { n[b] = function (a, c, d, e) { return n.isFunction(c) && (e = e || d, d = c, c = void 0), n.ajax({ url: a, type: b, dataType: e, data: c, success: d }); }; }), n._evalUrl = function (a) { return n.ajax({ url: a, type: "GET", dataType: "script", async: !1, global: !1, "throws": !0 }); }, n.fn.extend({ wrapAll: function (a) { var b; return n.isFunction(a) ? this.each(function (b) { n(this).wrapAll(a.call(this, b)); }) : (this[0] && (b = n(a, this[0].ownerDocument).eq(0).clone(!0), this[0].parentNode && b.insertBefore(this[0]), b.map(function () { var a = this; while (a.firstElementChild)
                        a = a.firstElementChild; return a; }).append(this)), this); }, wrapInner: function (a) { return this.each(n.isFunction(a) ? function (b) { n(this).wrapInner(a.call(this, b)); } : function () { var b = n(this), c = b.contents(); c.length ? c.wrapAll(a) : b.append(a); }); }, wrap: function (a) { var b = n.isFunction(a); return this.each(function (c) { n(this).wrapAll(b ? a.call(this, c) : a); }); }, unwrap: function () { return this.parent().each(function () { n.nodeName(this, "body") || n(this).replaceWith(this.childNodes); }).end(); } }), n.expr.filters.hidden = function (a) { return a.offsetWidth <= 0 && a.offsetHeight <= 0; }, n.expr.filters.visible = function (a) { return !n.expr.filters.hidden(a); };
                var vb = /%20/g, wb = /\[\]$/, xb = /\r?\n/g, yb = /^(?:submit|button|image|reset|file)$/i, zb = /^(?:input|select|textarea|keygen)/i;
                function Ab(a, b, c, d) { var e; if (n.isArray(b))
                    n.each(b, function (b, e) { c || wb.test(a) ? d(a, e) : Ab(a + "[" + ("object" == typeof e ? b : "") + "]", e, c, d); });
                else if (c || "object" !== n.type(b))
                    d(a, b);
                else
                    for (e in b)
                        Ab(a + "[" + e + "]", b[e], c, d); }
                n.param = function (a, b) { var c, d = [], e = function (a, b) { b = n.isFunction(b) ? b() : null == b ? "" : b, d[d.length] = encodeURIComponent(a) + "=" + encodeURIComponent(b); }; if (void 0 === b && (b = n.ajaxSettings && n.ajaxSettings.traditional), n.isArray(a) || a.jquery && !n.isPlainObject(a))
                    n.each(a, function () { e(this.name, this.value); });
                else
                    for (c in a)
                        Ab(c, a[c], b, e); return d.join("&").replace(vb, "+"); }, n.fn.extend({ serialize: function () { return n.param(this.serializeArray()); }, serializeArray: function () { return this.map(function () { var a = n.prop(this, "elements"); return a ? n.makeArray(a) : this; }).filter(function () { var a = this.type; return this.name && !n(this).is(":disabled") && zb.test(this.nodeName) && !yb.test(a) && (this.checked || !T.test(a)); }).map(function (a, b) { var c = n(this).val(); return null == c ? null : n.isArray(c) ? n.map(c, function (a) { return { name: b.name, value: a.replace(xb, "\r\n") }; }) : { name: b.name, value: c.replace(xb, "\r\n") }; }).get(); } }), n.ajaxSettings.xhr = function () { try {
                    return new XMLHttpRequest;
                }
                catch (a) { } };
                var Bb = 0, Cb = {}, Db = { 0: 200, 1223: 204 }, Eb = n.ajaxSettings.xhr();
                a.attachEvent && a.attachEvent("onunload", function () { for (var a in Cb)
                    Cb[a](); }), k.cors = !!Eb && "withCredentials" in Eb, k.ajax = Eb = !!Eb, n.ajaxTransport(function (a) { var b; return k.cors || Eb && !a.crossDomain ? { send: function (c, d) { var e, f = a.xhr(), g = ++Bb; if (f.open(a.type, a.url, a.async, a.username, a.password), a.xhrFields)
                        for (e in a.xhrFields)
                            f[e] = a.xhrFields[e]; a.mimeType && f.overrideMimeType && f.overrideMimeType(a.mimeType), a.crossDomain || c["X-Requested-With"] || (c["X-Requested-With"] = "XMLHttpRequest"); for (e in c)
                        f.setRequestHeader(e, c[e]); b = function (a) { return function () { b && (delete Cb[g], b = f.onload = f.onerror = null, "abort" === a ? f.abort() : "error" === a ? d(f.status, f.statusText) : d(Db[f.status] || f.status, f.statusText, "string" == typeof f.responseText ? { text: f.responseText } : void 0, f.getAllResponseHeaders())); }; }, f.onload = b(), f.onerror = b("error"), b = Cb[g] = b("abort"); try {
                        f.send(a.hasContent && a.data || null);
                    }
                    catch (h) {
                        if (b)
                            throw h;
                    } }, abort: function () { b && b(); } } : void 0; }), n.ajaxSetup({ accepts: { script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript" }, contents: { script: /(?:java|ecma)script/ }, converters: { "text script": function (a) { return n.globalEval(a), a; } } }), n.ajaxPrefilter("script", function (a) { void 0 === a.cache && (a.cache = !1), a.crossDomain && (a.type = "GET"); }), n.ajaxTransport("script", function (a) { if (a.crossDomain) {
                    var b, c;
                    return { send: function (d, e) { b = n("<script>").prop({ async: !0, charset: a.scriptCharset, src: a.url }).on("load error", c = function (a) { b.remove(), c = null, a && e("error" === a.type ? 404 : 200, a.type); }), l.head.appendChild(b[0]); }, abort: function () { c && c(); } };
                } });
                var Fb = [], Gb = /(=)\?(?=&|$)|\?\?/;
                n.ajaxSetup({ jsonp: "callback", jsonpCallback: function () { var a = Fb.pop() || n.expando + "_" + cb++; return this[a] = !0, a; } }), n.ajaxPrefilter("json jsonp", function (b, c, d) { var e, f, g, h = b.jsonp !== !1 && (Gb.test(b.url) ? "url" : "string" == typeof b.data && !(b.contentType || "").indexOf("application/x-www-form-urlencoded") && Gb.test(b.data) && "data"); return h || "jsonp" === b.dataTypes[0] ? (e = b.jsonpCallback = n.isFunction(b.jsonpCallback) ? b.jsonpCallback() : b.jsonpCallback, h ? b[h] = b[h].replace(Gb, "$1" + e) : b.jsonp !== !1 && (b.url += (db.test(b.url) ? "&" : "?") + b.jsonp + "=" + e), b.converters["script json"] = function () { return g || n.error(e + " was not called"), g[0]; }, b.dataTypes[0] = "json", f = a[e], a[e] = function () { g = arguments; }, d.always(function () { a[e] = f, b[e] && (b.jsonpCallback = c.jsonpCallback, Fb.push(e)), g && n.isFunction(f) && f(g[0]), g = f = void 0; }), "script") : void 0; }), n.parseHTML = function (a, b, c) { if (!a || "string" != typeof a)
                    return null; "boolean" == typeof b && (c = b, b = !1), b = b || l; var d = v.exec(a), e = !c && []; return d ? [b.createElement(d[1])] : (d = n.buildFragment([a], b, e), e && e.length && n(e).remove(), n.merge([], d.childNodes)); };
                var Hb = n.fn.load;
                n.fn.load = function (a, b, c) { if ("string" != typeof a && Hb)
                    return Hb.apply(this, arguments); var d, e, f, g = this, h = a.indexOf(" "); return h >= 0 && (d = n.trim(a.slice(h)), a = a.slice(0, h)), n.isFunction(b) ? (c = b, b = void 0) : b && "object" == typeof b && (e = "POST"), g.length > 0 && n.ajax({ url: a, type: e, dataType: "html", data: b }).done(function (a) { f = arguments, g.html(d ? n("<div>").append(n.parseHTML(a)).find(d) : a); }).complete(c && function (a, b) { g.each(c, f || [a.responseText, b, a]); }), this; }, n.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (a, b) { n.fn[b] = function (a) { return this.on(b, a); }; }), n.expr.filters.animated = function (a) { return n.grep(n.timers, function (b) { return a === b.elem; }).length; };
                var Ib = a.document.documentElement;
                function Jb(a) { return n.isWindow(a) ? a : 9 === a.nodeType && a.defaultView; }
                n.offset = { setOffset: function (a, b, c) { var d, e, f, g, h, i, j, k = n.css(a, "position"), l = n(a), m = {}; "static" === k && (a.style.position = "relative"), h = l.offset(), f = n.css(a, "top"), i = n.css(a, "left"), j = ("absolute" === k || "fixed" === k) && (f + i).indexOf("auto") > -1, j ? (d = l.position(), g = d.top, e = d.left) : (g = parseFloat(f) || 0, e = parseFloat(i) || 0), n.isFunction(b) && (b = b.call(a, c, h)), null != b.top && (m.top = b.top - h.top + g), null != b.left && (m.left = b.left - h.left + e), "using" in b ? b.using.call(a, m) : l.css(m); } }, n.fn.extend({ offset: function (a) { if (arguments.length)
                        return void 0 === a ? this : this.each(function (b) { n.offset.setOffset(this, a, b); }); var b, c, d = this[0], e = { top: 0, left: 0 }, f = d && d.ownerDocument; if (f)
                        return b = f.documentElement, n.contains(b, d) ? (typeof d.getBoundingClientRect !== U && (e = d.getBoundingClientRect()), c = Jb(f), { top: e.top + c.pageYOffset - b.clientTop, left: e.left + c.pageXOffset - b.clientLeft }) : e; }, position: function () { if (this[0]) {
                        var a, b, c = this[0], d = { top: 0, left: 0 };
                        return "fixed" === n.css(c, "position") ? b = c.getBoundingClientRect() : (a = this.offsetParent(), b = this.offset(), n.nodeName(a[0], "html") || (d = a.offset()), d.top += n.css(a[0], "borderTopWidth", !0), d.left += n.css(a[0], "borderLeftWidth", !0)), { top: b.top - d.top - n.css(c, "marginTop", !0), left: b.left - d.left - n.css(c, "marginLeft", !0) };
                    } }, offsetParent: function () { return this.map(function () { var a = this.offsetParent || Ib; while (a && !n.nodeName(a, "html") && "static" === n.css(a, "position"))
                        a = a.offsetParent; return a || Ib; }); } }), n.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (b, c) { var d = "pageYOffset" === c; n.fn[b] = function (e) { return J(this, function (b, e, f) { var g = Jb(b); return void 0 === f ? g ? g[c] : b[e] : void (g ? g.scrollTo(d ? a.pageXOffset : f, d ? f : a.pageYOffset) : b[e] = f); }, b, e, arguments.length, null); }; }), n.each(["top", "left"], function (a, b) { n.cssHooks[b] = ya(k.pixelPosition, function (a, c) { return c ? (c = xa(a, b), va.test(c) ? n(a).position()[b] + "px" : c) : void 0; }); }), n.each({ Height: "height", Width: "width" }, function (a, b) { n.each({ padding: "inner" + a, content: b, "": "outer" + a }, function (c, d) { n.fn[d] = function (d, e) { var f = arguments.length && (c || "boolean" != typeof d), g = c || (d === !0 || e === !0 ? "margin" : "border"); return J(this, function (b, c, d) { var e; return n.isWindow(b) ? b.document.documentElement["client" + a] : 9 === b.nodeType ? (e = b.documentElement, Math.max(b.body["scroll" + a], e["scroll" + a], b.body["offset" + a], e["offset" + a], e["client" + a])) : void 0 === d ? n.css(b, c, g) : n.style(b, c, d, g); }, b, f ? d : void 0, f, null); }; }); }), n.fn.size = function () { return this.length; }, n.fn.andSelf = n.fn.addBack, "function" == typeof define && define.amd && define("jquery", [], function () { return n; });
                var Kb = a.jQuery, Lb = a.$;
                return n.noConflict = function (b) { return a.$ === n && (a.$ = Lb), b && a.jQuery === n && (a.jQuery = Kb), n; }, typeof b === U && (a.jQuery = a.$ = n), n;
            });
        }, {}], "messages": [function (require, module, exports) {
            var Q = require('q');
            function Messages(pluginId, socket) {
                this.pluginId = pluginId;
                this.socket = socket;
                this.messages = {};
                this.methods = {};
                var that = this;
                socket.on('plugin-message', function (data) {
                    if (data.pluginId === pluginId) {
                        notify.call(that, that.messages, data.message, data.data);
                    }
                });
                socket.on('plugin-method', function (data, callback) {
                    if (data.pluginId === pluginId) {
                        var handler = that.methods && that.methods[data.method];
                        if (handler) {
                            var args = data.args;
                            args.push(callback);
                            handler.apply(this, args);
                        }
                    }
                });
            }
            Messages._globalMessages = {};
            function notify(messagesObj, message, data) {
                var handlers = messagesObj && messagesObj[message];
                if (handlers) {
                    handlers.forEach(function (handler) {
                        handler.call(this, message, data);
                    });
                }
            }
            Messages.prototype = {
                call: function (method) {
                    var d = Q.defer();
                    this.socket.emit('plugin-method', {
                        pluginId: this.pluginId,
                        method: method,
                        args: Array.prototype.slice.call(arguments, 1)
                    }, function (err, result) {
                        if (err) {
                            d.reject(err);
                        }
                        else {
                            d.resolve(result);
                        }
                    });
                    return d.promise;
                },
                register: function (method, handler) {
                    this.methods[method] = handler;
                    return this;
                },
                emit: function (message, data, isGlobal) {
                    var eventName, messagesObj;
                    if (isGlobal) {
                        eventName = 'global-plugin-message';
                        messagesObj = Messages._globalMessages;
                    }
                    else {
                        eventName = 'plugin-message';
                        messagesObj = this.messages;
                    }
                    this.socket.emit(eventName, {
                        pluginId: this.pluginId,
                        message: message,
                        data: data
                    });
                    notify.call(this, messagesObj, message, data);
                },
                emitDebug: function (message, data) {
                    this.socket.emit('debug-message', {
                        pluginId: this.pluginId,
                        message: message,
                        data: data
                    });
                },
                refreshAppHost: function (device) {
                    this.socket.emit('refresh-app-host', device);
                },
                on: function (message, handler, isGlobal) {
                    var messagesObj = (!isGlobal) ? this.messages : Messages._globalMessages;
                    if (!messagesObj[message]) {
                        messagesObj[message] = [handler];
                    }
                    else {
                        messagesObj[message].push(handler);
                    }
                    return this;
                },
                off: function (message, handler) {
                    var handlers = this.messages[message];
                    if (!handlers) {
                        handlers = Messages._globalMessages[message];
                        if (!handlers) {
                            return this;
                        }
                    }
                    var pos = handlers.indexOf(handler);
                    while (pos > -1) {
                        handlers.splice(pos, 1);
                        pos = handlers.indexOf(handler);
                    }
                }
            };
            module.exports = Messages;
        }, { "q": 1 }], "polyfills": [function (require, module, exports) {
            if (typeof Object.assign != 'function') {
                (function () {
                    Object.assign = function (target) {
                        'use strict';
                        if (target === undefined || target === null) {
                            throw new TypeError('Cannot convert undefined or null to object');
                        }
                        var output = Object(target);
                        for (var index = 1; index < arguments.length; index++) {
                            var source = arguments[index];
                            if (source !== undefined && source !== null) {
                                for (var nextKey in source) {
                                    if (Object.prototype.hasOwnProperty.call(source, nextKey)) {
                                        output[nextKey] = source[nextKey];
                                    }
                                }
                            }
                        }
                        return output;
                    };
                })();
            }
        }, {}], "sim-constants": [function (require, module, exports) {
            module.exports = {
                'API_URL': 'https://rippleapi.herokuapp.com',
                'SERVICES': {
                    'GOOGLE_MAPS_URI': 'http://maps.google.com/maps/api/staticmap?size=476x476&maptype=roadmap',
                    'GOOGLE_MAPS_API_KEY': 'ABQIAAAA-CaPZHXR-0Tzhui_h6gpjhSE_2rGlnYiB7L-ZGVwgaut5s7OYRSlBAaHCzBuZf2_23_vrCOfPxXHjA'
                },
                'FS_SIZE': 1024 * 1024 * 10,
                'COMMON': {
                    'APPLICATION_STATE': 'ui-application-state-',
                    'PREFIX': 'tinyhippos-',
                    'MENU_BUTTON': 'menu-button',
                    'BACK_BUTTON': 'back-button',
                    'HTML_CONTAINER': 'document',
                    'INFO_SECTION': 'information-sub-container',
                    'ORIENTATION_SELECT_PORTRAIT_ID': 'layout-portrait',
                    'ORIENTATION_SELECT_LANDSCAPE_ID': 'layout-landscape',
                    'PLATFORM_SELECT_ID': 'platform-select',
                    'DEVICE_SELECT_ID': 'device-select',
                    'STORAGE_TABLE_BODY_CLASS': 'preferences-list-body',
                    'STORAGE_COUNT_CONTAINER_ID': 'preferences-count',
                    'GEO_MAP_CONTAINER_ID': 'geo-map',
                    'FILESYSTEM_UPDATE_BUTTON_ID_WITH_HASH': '#update-filesystem-button',
                    'APPLICATIONS_CONTAINER_ID': 'widget-applications-content',
                    'STORAGE_CLEAR_BUTTON_ID': 'preferences-clear-button',
                    'CHANGE_PLATFORM_BUTTON_ID': 'change-platform',
                    'AJAX_LOADER_CONTAINER_CLASS': '.loader',
                    'IRRELEVANT_CLASS': 'irrelevant',
                    'MULTIMEDIA_VOLUME_SLIDER_ID': 'media-volume',
                    'MULTIMEDIA_VOLUME_FIELD_ID': 'media-volume-value',
                    'MULTIMEDIA_AUDIO_STATE_FIELD_ID': 'media-audio-state',
                    'MULTIMEDIA_AUDIO_PLAYING_FIELD_ID': 'multimedia-isaudioplaying',
                    'MULTIMEDIA_AUDIO_PROGRESS_ID': 'media-audio-progress',
                    'MULTIMEDIA_AUDIO_FILE_FIELD_ID': 'media-audio-file',
                    'MULTIMEDIA_VIDEO_STATE_FIELD_ID': 'media-video-state',
                    'MULTIMEDIA_VIDEO_PLAYING_FIELD_ID': 'multimedia-isvideoplaying',
                    'MULTIMEDIA_VIDEO_PROGRESS_ID': 'media-video-progress',
                    'MULTIMEDIA_VIDEO_FILE_FIELD_ID': 'media-video-file',
                    'EXTENSION_URL_CONTAINER': 'extension-url',
                    'SECURITY_LEVEL': 'security-level'
                },
                'FILESYSTEM': {
                    'PERSISTENCE_KEY': 'filesystem',
                    'INPUT_PREFIX_ID': '#panel-filesystem-'
                },
                'PLATFORM': {
                    'DEFAULT': {
                        'name': 'cordova',
                        'version': '1.0.0'
                    }
                },
                'ENCAPSULATOR': {
                    'DEFAULT_HEIGHT': 684,
                    'DEFAULT_WIDTH': 480
                },
                'GEO': {
                    'OPTIONS': {
                        'LATITUDE': 'geo-latitude',
                        'LONGITUDE': 'geo-longitude',
                        'ALTITUDE': 'geo-altitude',
                        'CELL_ID': 'geo-cellid',
                        'ACCURACY': 'geo-accuracy',
                        'ALTITUDE_ACCURACY': 'geo-altitude-accuracy',
                        'HEADING': 'geo-heading',
                        'SPEED': 'geo-speed',
                        'TIME_STAMP': 'geo-timestamp',
                        'DELAY': 'geo-delay',
                        'DELAY_LABEL': 'geo-delay-label',
                        'HEADING_LABEL': 'geo-heading-label',
                        'HEADING_MAP_LABEL': 'geo-map-direction-label',
                        'IMAGE': 'geo-map-img',
                        'MAP_MARKER': 'geo-map-marker',
                        'MAP_CONTAINER': 'geo-map-container',
                        'TIMEOUT': 'geo-timeout',
                        'GPXFILE': 'geo-gpxfile',
                        'GPXGO': 'geo-gpx-go',
                        'GPXMULTIPLIER': 'geo-gpxmultiplier-select',
                        'GPXREPLAYSTATUS': 'geo-gpxreplaystatus'
                    },
                    'MAP_ZOOM_MAX': 18,
                    'MAP_ZOOM_MIN': 0,
                    'MAP_ZOOM_LEVEL_CONTAINER': 'geo-map-zoomlevel-value',
                    'MAP_ZOOM_KEY': 'geo-map-zoom-key',
                    'GPXGO_LABELS': {
                        'GO': 'Go',
                        'STOP': 'Stop'
                    }
                },
                'PUSH': {
                    'OPTIONS': {
                        'PAYLOAD': 'push-text'
                    }
                },
                'TELEPHONY': {
                    'CALL_LIST_KEY': 'telephony-call-list-key'
                },
                'PIM': {
                    'ADDRESS_LIST_KEY': 'pim-address-list-key',
                    'CALENDAR_LIST_KEY': 'pim-calendar-list-key'
                },
                'CAMERA': {
                    'WINDOW_ANIMATION': 'images/dance.gif',
                    'WARNING_TEXT': 'The runtime simulated saving the camera file to {file}. If you need to access this file in your application, please copy a file to the saved location'
                },
                'AUDIOPLAYER': {
                    'WARNING_TEXT': 'The runtime simulated saving the audio file to {file}. If you need to access this file in your application, please copy a file to the saved location'
                },
                'API_APPLICATION': {
                    'NO_APPLICATIONS_MESSAGE': 'No applications available for your platform'
                },
                'NOTIFICATIONS': {
                    'MESSAGE_CONTAINER_CLASS': 'notification-message-div',
                    'MAIN_CONTAINER_CLASS': 'panel-notification',
                    'CLOSE_BUTTON_CLASS': 'panel-notification-closebtn',
                    'MESSAGE_TEXT_CONTAINER_CLASS': 'panel-notification-text',
                    'CSS_PREFIX': 'panel-notification-',
                    'STATE_TYPES': {
                        'OPEN': 1,
                        'CLOSE': 2
                    }
                },
                'BATTERY_STATUS': {
                    'BATTERY_STATUS_KEY': 'battery-status-key',
                    'IS_PLUGGED_KEY': 'is-plugged-key',
                    'LEVEL_LABEL': 'battery-level-label',
                    'LEVEL_VALUE': 'battery-level',
                    'IS_PLUGGED_CHECKBOX': 'is-plugged'
                },
                'CSS_PREFIX': {
                    'IRRELEVANT': 'irrelevant'
                },
                'STORAGE': {
                    'PAIR_DELIMETER': ',',
                    'KEY_VALUE_DELIMETER': '|'
                },
                'REGEX': {
                    'GEO': /^geo-/,
                    'URL': /^((https?|ftp|gopher|telnet|file|notes|ms-help):((\/\/)|(\\\\))+[\w\d:#@%\/;$()~_?\+-=\\\.&]*)$/,
                    'EMAIL': /^([^@\s]+)@((?:[\-a-z0-9]+\.)+[a-z]{2,})$/,
                    'WC3_DTF': /^((\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)|(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)|(\d{4})-(\d\d)-(\d\d)|(\d{4})-(\d\d)|(\d\d\d\d))$/,
                    'NON_RELATIVE_URI': /^https?:\/\/|^file:\/\//
                },
                'CONFIG': {
                    'SUCCESS_CSS': {
                        'true': 'ui-text-pass',
                        'false': 'ui-text-fail',
                        'missing': 'ui-text-missing'
                    }
                },
                'SETTINGS': {
                    'TOOLTIPS_TOGGLE_DIV': '#settings-toggletooltips',
                    'TOOLTIPS_KEY': 'tool-tips-key'
                },
                'UI': {
                    'JQUERY_UI_BUTTON_CLASSES': 'ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only',
                    'JQUERY_UI_INPUT_CLASSES': 'ui-state-default ui-corner-all',
                    'PANEL_TABLE_CLASS': 'panel-table',
                    'RIGHT_RANGE_LABEL_CLASS': 'range-label',
                    'LEFT_RANGE_LABEL_CLASS': 'range-label-left',
                    'TEXT_LABEL_CLASS': 'ui-text-label',
                    'SCREEN_PPI': 96
                },
                'MULTIMEDIA': {
                    'AUDIO_STATES': {
                        'OPENED': 'opened',
                        'STOPPED': 'stopped',
                        'PAUSED': 'paused',
                        'PLAYING': 'playing',
                        'COMPLETED': 'completed'
                    }
                },
                'LANG': {
                    'ISO6392_LIST': ['abk', 'ace', 'ach', 'ada', 'ady', 'aar', 'afh', 'afr', 'afa', 'ain', 'aka', 'akk', 'alb/sqi', 'gsw', 'ale', 'alg', 'tut', 'amh', 'anp', 'apa', 'ara', 'arg', 'arp', 'arw', 'arm/hye', 'rup', 'art', 'asm', 'ast', 'ath', 'aus', 'map', 'ava', 'ave', 'awa', 'aym', 'aze', 'ban', 'bat', 'bal', 'bam', 'bai', 'bad', 'bnt', 'bas', 'bak', 'baq/eus', 'btk', 'bej', 'bel', 'bem', 'ben', 'ber', 'bho', 'bih', 'bik', 'byn', 'bin', 'bis', 'zbl', 'nob', 'bos', 'bra', 'bre', 'bug', 'bul', 'bua', 'bur/mya', 'cad', 'spa', 'cat', 'cau', 'ceb', 'cel', 'cai', 'khm', 'chg', 'cmc', 'cha', 'che', 'chr', 'nya', 'chy', 'chb', 'chi/zho', 'chn', 'chp', 'cho', 'zha', 'chu', 'chk', 'chv', 'nwc', 'syc', 'rar', 'cop', 'cor', 'cos', 'cre', 'mus', 'crp', 'cpe', 'cpf', 'cpp', 'crh', 'hrv', 'cus', 'cze/ces', 'dak', 'dan', 'dar', 'del', 'div', 'zza', 'din', 'doi', 'dgr', 'dra', 'dua', 'dut/nld', 'dum', 'dyu', 'dzo', 'frs', 'efi', 'egy', 'eka', 'elx', 'eng', 'enm', 'ang', 'myv', 'epo', 'est', 'ewe', 'ewo', 'fan', 'fat', 'fao', 'fij', 'fil', 'fin', 'fiu', 'fon', 'fre/fra', 'frm', 'fro', 'fur', 'ful', 'gaa', 'gla', 'car', 'glg', 'lug', 'gay', 'gba', 'gez', 'geo/kat', 'ger/deu', 'nds', 'gmh', 'goh', 'gem', 'kik', 'gil', 'gon', 'gor', 'got', 'grb', 'grc', 'gre/ell', 'kal', 'grn', 'guj', 'gwi', 'hai', 'hat', 'hau', 'haw', 'heb', 'her', 'hil', 'him', 'hin', 'hmo', 'hit', 'hmn', 'hun', 'hup', 'iba', 'ice/isl', 'ido', 'ibo', 'ijo', 'ilo', 'arc', 'smn', 'inc', 'ine', 'ind', 'inh', 'ina', 'ile', 'iku', 'ipk', 'ira', 'gle', 'mga', 'sga', 'iro', 'ita', 'jpn', 'jav', 'kac', 'jrb', 'jpr', 'kbd', 'kab', 'xal', 'kam', 'kan', 'kau', 'pam', 'kaa', 'krc', 'krl', 'kar', 'kas', 'csb', 'kaw', 'kaz', 'kha', 'khi', 'kho', 'kmb', 'kin', 'kir', 'tlh', 'kom', 'kon', 'kok', 'kor', 'kos', 'kpe', 'kro', 'kua', 'kum', 'kur', 'kru', 'kut', 'lad', 'lah', 'lam', 'day', 'lao', 'lat', 'lav', 'ltz', 'lez', 'lim', 'lin', 'lit', 'jbo', 'dsb', 'loz', 'lub', 'lua', 'lui', 'smj', 'lun', 'luo', 'lus', 'mac/mkd', 'mad', 'mag', 'mai', 'mak', 'mlg', 'may/msa', 'mal', 'mlt', 'mnc', 'mdr', 'man', 'mni', 'mno', 'glv', 'mao/mri', 'arn', 'mar', 'chm', 'mah', 'mwr', 'mas', 'myn', 'men', 'mic', 'min', 'mwl', 'moh', 'mdf', 'rum/ron', 'mkh', 'lol', 'mon', 'mos', 'mul', 'mun', 'nqo', 'nah', 'nau', 'nav', 'nde', 'nbl', 'ndo', 'nap', 'new', 'nep', 'nia', 'nic', 'ssa', 'niu', 'zxx', 'nog', 'non', 'nai', 'frr', 'sme', 'nso', 'nor', 'nno', 'nub', 'iii', 'nym', 'nyn', 'nyo', 'nzi', 'oci', 'pro', 'oji', 'ori', 'orm', 'osa', 'oss', 'oto', 'pal', 'pau', 'pli', 'pag', 'pan', 'pap', 'paa', 'pus', 'per/fas', 'peo', 'phi', 'phn', 'pon', 'pol', 'por', 'pra', 'que', 'raj', 'rap', 'qaa-qtz', 'roa', 'roh', 'rom', 'run', 'rus', 'sal', 'sam', 'smi', 'smo', 'sad', 'sag', 'san', 'sat', 'srd', 'sas', 'sco', 'sel', 'sem', 'srp', 'srr', 'shn', 'sna', 'scn', 'sid', 'sgn', 'bla', 'snd', 'sin', 'sit', 'sio', 'sms', 'den', 'sla', 'slo/slk', 'slv', 'sog', 'som', 'son', 'snk', 'wen', 'sot', 'sai', 'alt', 'sma', 'srn', 'suk', 'sux', 'sun', 'sus', 'swa', 'ssw', 'swe', 'syr', 'tgl', 'tah', 'tai', 'tgk', 'tmh', 'tam', 'tat', 'tel', 'ter', 'tet', 'tha', 'tib/bod', 'tig', 'tir', 'tem', 'tiv', 'tli', 'tpi', 'tkl', 'tog', 'ton', 'tsi', 'tso', 'tsn', 'tum', 'tup', 'tur', 'ota', 'tuk', 'tvl', 'tyv', 'twi', 'udm', 'uga', 'uig', 'ukr', 'umb', 'mis', 'und', 'hsb', 'urd', 'uzb', 'vai', 'ven', 'vie', 'vol', 'vot', 'wak', 'wln', 'war', 'was', 'wel/cym', 'fry', 'wal', 'wol', 'xho', 'sah', 'yao', 'yap', 'yid', 'yor', 'ypk', 'znd', 'zap', 'zen', 'zul', 'zun']
                },
                'XHR': {
                    PROXY_SETTING: 'settings-xhr-proxy-setting',
                    PROXY_SETTINGS_LIST: {
                        remote: 'remote',
                        local: 'local',
                        disabled: 'disabled'
                    },
                    DEFAULT_LOCAL_PORT: 4400,
                    DEFAULT_LOCAL_ROUTE: '/ripple',
                    LOCAL_PROXY_PORT_SETTING: 'settings-xhr-proxy-local-port',
                    LOCAL_PROXY_ROUTE_SETTING: 'settings-xhr-proxy-local-route'
                }
            };
        }, {}], "sim-status": [function (require, module, exports) {
            var isAppHostReady = false, appHostReadyHandlers = [];
            function whenAppHostReady(handler) {
                var idx;
                if (typeof handler !== 'function') {
                    return;
                }
                idx = appHostReadyHandlers.push({ 'handler': handler, 'fired': false });
                if (isAppHostReady) {
                    handler();
                    appHostReadyHandlers[idx - 1].fired = true;
                }
            }
            function fireAppHostReady() {
                isAppHostReady = true;
                appHostReadyHandlers.forEach(function (element) {
                    if (!element.fired) {
                        element.handler();
                        element.fired = true;
                    }
                });
            }
            module.exports._fireAppHostReady = fireAppHostReady;
            module.exports.whenAppHostReady = whenAppHostReady;
        }, {}], "socket.io": [function (require, module, exports) {
            (function (global) {
                (function (f) { if (typeof exports === "object" && typeof module !== "undefined") {
                    module.exports = f();
                }
                else if (typeof define === "function" && define.amd) {
                    define([], f);
                }
                else {
                    var g;
                    if (typeof window !== "undefined") {
                        g = window;
                    }
                    else if (typeof global !== "undefined") {
                        g = global;
                    }
                    else if (typeof self !== "undefined") {
                        g = self;
                    }
                    else {
                        g = this;
                    }
                    g.io = f();
                } })(function () {
                    var define, module, exports;
                    return function e(t, n, r) { function s(o, u) { if (!n[o]) {
                        if (!t[o]) {
                            var a = typeof require == "function" && require;
                            if (!u && a)
                                return a(o, !0);
                            if (i)
                                return i(o, !0);
                            var f = new Error("Cannot find module '" + o + "'");
                            throw f.code = "MODULE_NOT_FOUND", f;
                        }
                        var l = n[o] = { exports: {} };
                        t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e); }, l, l.exports, e, t, n, r);
                    } return n[o].exports; } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++)
                        s(r[o]); return s; }({ 1: [function (_dereq_, module, exports) { module.exports = _dereq_("./lib/"); }, { "./lib/": 2 }], 2: [function (_dereq_, module, exports) { module.exports = _dereq_("./socket"); module.exports.parser = _dereq_("engine.io-parser"); }, { "./socket": 3, "engine.io-parser": 19 }], 3: [function (_dereq_, module, exports) { (function (global) { var transports = _dereq_("./transports"); var Emitter = _dereq_("component-emitter"); var debug = _dereq_("debug")("engine.io-client:socket"); var index = _dereq_("indexof"); var parser = _dereq_("engine.io-parser"); var parseuri = _dereq_("parseuri"); var parsejson = _dereq_("parsejson"); var parseqs = _dereq_("parseqs"); module.exports = Socket; function noop() { } function Socket(uri, opts) { if (!(this instanceof Socket))
                                return new Socket(uri, opts); opts = opts || {}; if (uri && "object" == typeof uri) {
                                opts = uri;
                                uri = null;
                            } if (uri) {
                                uri = parseuri(uri);
                                opts.hostname = uri.host;
                                opts.secure = uri.protocol == "https" || uri.protocol == "wss";
                                opts.port = uri.port;
                                if (uri.query)
                                    opts.query = uri.query;
                            }
                            else if (opts.host) {
                                opts.hostname = parseuri(opts.host).host;
                            } this.secure = null != opts.secure ? opts.secure : global.location && "https:" == location.protocol; if (opts.hostname && !opts.port) {
                                opts.port = this.secure ? "443" : "80";
                            } this.agent = opts.agent || false; this.hostname = opts.hostname || (global.location ? location.hostname : "localhost"); this.port = opts.port || (global.location && location.port ? location.port : this.secure ? 443 : 80); this.query = opts.query || {}; if ("string" == typeof this.query)
                                this.query = parseqs.decode(this.query); this.upgrade = false !== opts.upgrade; this.path = (opts.path || "/engine.io").replace(/\/$/, "") + "/"; this.forceJSONP = !!opts.forceJSONP; this.jsonp = false !== opts.jsonp; this.forceBase64 = !!opts.forceBase64; this.enablesXDR = !!opts.enablesXDR; this.timestampParam = opts.timestampParam || "t"; this.timestampRequests = opts.timestampRequests; this.transports = opts.transports || ["polling", "websocket"]; this.readyState = ""; this.writeBuffer = []; this.policyPort = opts.policyPort || 843; this.rememberUpgrade = opts.rememberUpgrade || false; this.binaryType = null; this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades; this.perMessageDeflate = false !== opts.perMessageDeflate ? opts.perMessageDeflate || {} : false; if (true === this.perMessageDeflate)
                                this.perMessageDeflate = {}; if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
                                this.perMessageDeflate.threshold = 1024;
                            } this.pfx = opts.pfx || null; this.key = opts.key || null; this.passphrase = opts.passphrase || null; this.cert = opts.cert || null; this.ca = opts.ca || null; this.ciphers = opts.ciphers || null; this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized; var freeGlobal = typeof global == "object" && global; if (freeGlobal.global === freeGlobal) {
                                if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
                                    this.extraHeaders = opts.extraHeaders;
                                }
                            } this.open(); } Socket.priorWebsocketSuccess = false; Emitter(Socket.prototype); Socket.protocol = parser.protocol; Socket.Socket = Socket; Socket.Transport = _dereq_("./transport"); Socket.transports = _dereq_("./transports"); Socket.parser = _dereq_("engine.io-parser"); Socket.prototype.createTransport = function (name) { debug('creating transport "%s"', name); var query = clone(this.query); query.EIO = parser.protocol; query.transport = name; if (this.id)
                                query.sid = this.id; var transport = new transports[name]({ agent: this.agent, hostname: this.hostname, port: this.port, secure: this.secure, path: this.path, query: query, forceJSONP: this.forceJSONP, jsonp: this.jsonp, forceBase64: this.forceBase64, enablesXDR: this.enablesXDR, timestampRequests: this.timestampRequests, timestampParam: this.timestampParam, policyPort: this.policyPort, socket: this, pfx: this.pfx, key: this.key, passphrase: this.passphrase, cert: this.cert, ca: this.ca, ciphers: this.ciphers, rejectUnauthorized: this.rejectUnauthorized, perMessageDeflate: this.perMessageDeflate, extraHeaders: this.extraHeaders }); return transport; }; function clone(obj) { var o = {}; for (var i in obj) {
                                if (obj.hasOwnProperty(i)) {
                                    o[i] = obj[i];
                                }
                            } return o; } Socket.prototype.open = function () { var transport; if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf("websocket") != -1) {
                                transport = "websocket";
                            }
                            else if (0 === this.transports.length) {
                                var self = this;
                                setTimeout(function () { self.emit("error", "No transports available"); }, 0);
                                return;
                            }
                            else {
                                transport = this.transports[0];
                            } this.readyState = "opening"; try {
                                transport = this.createTransport(transport);
                            }
                            catch (e) {
                                this.transports.shift();
                                this.open();
                                return;
                            } transport.open(); this.setTransport(transport); }; Socket.prototype.setTransport = function (transport) { debug("setting transport %s", transport.name); var self = this; if (this.transport) {
                                debug("clearing existing transport %s", this.transport.name);
                                this.transport.removeAllListeners();
                            } this.transport = transport; transport.on("drain", function () { self.onDrain(); }).on("packet", function (packet) { self.onPacket(packet); }).on("error", function (e) { self.onError(e); }).on("close", function () { self.onClose("transport close"); }); }; Socket.prototype.probe = function (name) { debug('probing transport "%s"', name); var transport = this.createTransport(name, { probe: 1 }), failed = false, self = this; Socket.priorWebsocketSuccess = false; function onTransportOpen() { if (self.onlyBinaryUpgrades) {
                                var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
                                failed = failed || upgradeLosesBinary;
                            } if (failed)
                                return; debug('probe transport "%s" opened', name); transport.send([{ type: "ping", data: "probe" }]); transport.once("packet", function (msg) { if (failed)
                                return; if ("pong" == msg.type && "probe" == msg.data) {
                                debug('probe transport "%s" pong', name);
                                self.upgrading = true;
                                self.emit("upgrading", transport);
                                if (!transport)
                                    return;
                                Socket.priorWebsocketSuccess = "websocket" == transport.name;
                                debug('pausing current transport "%s"', self.transport.name);
                                self.transport.pause(function () { if (failed)
                                    return; if ("closed" == self.readyState)
                                    return; debug("changing transport and sending upgrade packet"); cleanup(); self.setTransport(transport); transport.send([{ type: "upgrade" }]); self.emit("upgrade", transport); transport = null; self.upgrading = false; self.flush(); });
                            }
                            else {
                                debug('probe transport "%s" failed', name);
                                var err = new Error("probe error");
                                err.transport = transport.name;
                                self.emit("upgradeError", err);
                            } }); } function freezeTransport() { if (failed)
                                return; failed = true; cleanup(); transport.close(); transport = null; } function onerror(err) { var error = new Error("probe error: " + err); error.transport = transport.name; freezeTransport(); debug('probe transport "%s" failed because of error: %s', name, err); self.emit("upgradeError", error); } function onTransportClose() { onerror("transport closed"); } function onclose() { onerror("socket closed"); } function onupgrade(to) { if (transport && to.name != transport.name) {
                                debug('"%s" works - aborting "%s"', to.name, transport.name);
                                freezeTransport();
                            } } function cleanup() { transport.removeListener("open", onTransportOpen); transport.removeListener("error", onerror); transport.removeListener("close", onTransportClose); self.removeListener("close", onclose); self.removeListener("upgrading", onupgrade); } transport.once("open", onTransportOpen); transport.once("error", onerror); transport.once("close", onTransportClose); this.once("close", onclose); this.once("upgrading", onupgrade); transport.open(); }; Socket.prototype.onOpen = function () { debug("socket open"); this.readyState = "open"; Socket.priorWebsocketSuccess = "websocket" == this.transport.name; this.emit("open"); this.flush(); if ("open" == this.readyState && this.upgrade && this.transport.pause) {
                                debug("starting upgrade probes");
                                for (var i = 0, l = this.upgrades.length; i < l; i++) {
                                    this.probe(this.upgrades[i]);
                                }
                            } }; Socket.prototype.onPacket = function (packet) { if ("opening" == this.readyState || "open" == this.readyState) {
                                debug('socket receive: type "%s", data "%s"', packet.type, packet.data);
                                this.emit("packet", packet);
                                this.emit("heartbeat");
                                switch (packet.type) {
                                    case "open":
                                        this.onHandshake(parsejson(packet.data));
                                        break;
                                    case "pong":
                                        this.setPing();
                                        this.emit("pong");
                                        break;
                                    case "error":
                                        var err = new Error("server error");
                                        err.code = packet.data;
                                        this.onError(err);
                                        break;
                                    case "message":
                                        this.emit("data", packet.data);
                                        this.emit("message", packet.data);
                                        break;
                                }
                            }
                            else {
                                debug('packet received with socket readyState "%s"', this.readyState);
                            } }; Socket.prototype.onHandshake = function (data) { this.emit("handshake", data); this.id = data.sid; this.transport.query.sid = data.sid; this.upgrades = this.filterUpgrades(data.upgrades); this.pingInterval = data.pingInterval; this.pingTimeout = data.pingTimeout; this.onOpen(); if ("closed" == this.readyState)
                                return; this.setPing(); this.removeListener("heartbeat", this.onHeartbeat); this.on("heartbeat", this.onHeartbeat); }; Socket.prototype.onHeartbeat = function (timeout) { clearTimeout(this.pingTimeoutTimer); var self = this; self.pingTimeoutTimer = setTimeout(function () { if ("closed" == self.readyState)
                                return; self.onClose("ping timeout"); }, timeout || self.pingInterval + self.pingTimeout); }; Socket.prototype.setPing = function () { var self = this; clearTimeout(self.pingIntervalTimer); self.pingIntervalTimer = setTimeout(function () { debug("writing ping packet - expecting pong within %sms", self.pingTimeout); self.ping(); self.onHeartbeat(self.pingTimeout); }, self.pingInterval); }; Socket.prototype.ping = function () { var self = this; this.sendPacket("ping", function () { self.emit("ping"); }); }; Socket.prototype.onDrain = function () { this.writeBuffer.splice(0, this.prevBufferLen); this.prevBufferLen = 0; if (0 === this.writeBuffer.length) {
                                this.emit("drain");
                            }
                            else {
                                this.flush();
                            } }; Socket.prototype.flush = function () { if ("closed" != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
                                debug("flushing %d packets in socket", this.writeBuffer.length);
                                this.transport.send(this.writeBuffer);
                                this.prevBufferLen = this.writeBuffer.length;
                                this.emit("flush");
                            } }; Socket.prototype.write = Socket.prototype.send = function (msg, options, fn) { this.sendPacket("message", msg, options, fn); return this; }; Socket.prototype.sendPacket = function (type, data, options, fn) { if ("function" == typeof data) {
                                fn = data;
                                data = undefined;
                            } if ("function" == typeof options) {
                                fn = options;
                                options = null;
                            } if ("closing" == this.readyState || "closed" == this.readyState) {
                                return;
                            } options = options || {}; options.compress = false !== options.compress; var packet = { type: type, data: data, options: options }; this.emit("packetCreate", packet); this.writeBuffer.push(packet); if (fn)
                                this.once("flush", fn); this.flush(); }; Socket.prototype.close = function () { if ("opening" == this.readyState || "open" == this.readyState) {
                                this.readyState = "closing";
                                var self = this;
                                if (this.writeBuffer.length) {
                                    this.once("drain", function () { if (this.upgrading) {
                                        waitForUpgrade();
                                    }
                                    else {
                                        close();
                                    } });
                                }
                                else if (this.upgrading) {
                                    waitForUpgrade();
                                }
                                else {
                                    close();
                                }
                            } function close() { self.onClose("forced close"); debug("socket closing - telling transport to close"); self.transport.close(); } function cleanupAndClose() { self.removeListener("upgrade", cleanupAndClose); self.removeListener("upgradeError", cleanupAndClose); close(); } function waitForUpgrade() { self.once("upgrade", cleanupAndClose); self.once("upgradeError", cleanupAndClose); } return this; }; Socket.prototype.onError = function (err) { debug("socket error %j", err); Socket.priorWebsocketSuccess = false; this.emit("error", err); this.onClose("transport error", err); }; Socket.prototype.onClose = function (reason, desc) { if ("opening" == this.readyState || "open" == this.readyState || "closing" == this.readyState) {
                                debug('socket close with reason: "%s"', reason);
                                var self = this;
                                clearTimeout(this.pingIntervalTimer);
                                clearTimeout(this.pingTimeoutTimer);
                                this.transport.removeAllListeners("close");
                                this.transport.close();
                                this.transport.removeAllListeners();
                                this.readyState = "closed";
                                this.id = null;
                                this.emit("close", reason, desc);
                                self.writeBuffer = [];
                                self.prevBufferLen = 0;
                            } }; Socket.prototype.filterUpgrades = function (upgrades) { var filteredUpgrades = []; for (var i = 0, j = upgrades.length; i < j; i++) {
                                if (~index(this.transports, upgrades[i]))
                                    filteredUpgrades.push(upgrades[i]);
                            } return filteredUpgrades; }; }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { "./transport": 4, "./transports": 5, "component-emitter": 15, debug: 17, "engine.io-parser": 19, indexof: 23, parsejson: 26, parseqs: 27, parseuri: 28 }], 4: [function (_dereq_, module, exports) { var parser = _dereq_("engine.io-parser"); var Emitter = _dereq_("component-emitter"); module.exports = Transport; function Transport(opts) { this.path = opts.path; this.hostname = opts.hostname; this.port = opts.port; this.secure = opts.secure; this.query = opts.query; this.timestampParam = opts.timestampParam; this.timestampRequests = opts.timestampRequests; this.readyState = ""; this.agent = opts.agent || false; this.socket = opts.socket; this.enablesXDR = opts.enablesXDR; this.pfx = opts.pfx; this.key = opts.key; this.passphrase = opts.passphrase; this.cert = opts.cert; this.ca = opts.ca; this.ciphers = opts.ciphers; this.rejectUnauthorized = opts.rejectUnauthorized; this.extraHeaders = opts.extraHeaders; } Emitter(Transport.prototype); Transport.prototype.onError = function (msg, desc) { var err = new Error(msg); err.type = "TransportError"; err.description = desc; this.emit("error", err); return this; }; Transport.prototype.open = function () { if ("closed" == this.readyState || "" == this.readyState) {
                                this.readyState = "opening";
                                this.doOpen();
                            } return this; }; Transport.prototype.close = function () { if ("opening" == this.readyState || "open" == this.readyState) {
                                this.doClose();
                                this.onClose();
                            } return this; }; Transport.prototype.send = function (packets) { if ("open" == this.readyState) {
                                this.write(packets);
                            }
                            else {
                                throw new Error("Transport not open");
                            } }; Transport.prototype.onOpen = function () { this.readyState = "open"; this.writable = true; this.emit("open"); }; Transport.prototype.onData = function (data) { var packet = parser.decodePacket(data, this.socket.binaryType); this.onPacket(packet); }; Transport.prototype.onPacket = function (packet) { this.emit("packet", packet); }; Transport.prototype.onClose = function () { this.readyState = "closed"; this.emit("close"); }; }, { "component-emitter": 15, "engine.io-parser": 19 }], 5: [function (_dereq_, module, exports) { (function (global) { var XMLHttpRequest = _dereq_("xmlhttprequest-ssl"); var XHR = _dereq_("./polling-xhr"); var JSONP = _dereq_("./polling-jsonp"); var websocket = _dereq_("./websocket"); exports.polling = polling; exports.websocket = websocket; function polling(opts) { var xhr; var xd = false; var xs = false; var jsonp = false !== opts.jsonp; if (global.location) {
                                var isSSL = "https:" == location.protocol;
                                var port = location.port;
                                if (!port) {
                                    port = isSSL ? 443 : 80;
                                }
                                xd = opts.hostname != location.hostname || port != opts.port;
                                xs = opts.secure != isSSL;
                            } opts.xdomain = xd; opts.xscheme = xs; xhr = new XMLHttpRequest(opts); if ("open" in xhr && !opts.forceJSONP) {
                                return new XHR(opts);
                            }
                            else {
                                if (!jsonp)
                                    throw new Error("JSONP disabled");
                                return new JSONP(opts);
                            } } }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { "./polling-jsonp": 6, "./polling-xhr": 7, "./websocket": 9, "xmlhttprequest-ssl": 10 }], 6: [function (_dereq_, module, exports) { (function (global) { var Polling = _dereq_("./polling"); var inherit = _dereq_("component-inherit"); module.exports = JSONPPolling; var rNewline = /\n/g; var rEscapedNewline = /\\n/g; var callbacks; var index = 0; function empty() { } function JSONPPolling(opts) { Polling.call(this, opts); this.query = this.query || {}; if (!callbacks) {
                                if (!global.___eio)
                                    global.___eio = [];
                                callbacks = global.___eio;
                            } this.index = callbacks.length; var self = this; callbacks.push(function (msg) { self.onData(msg); }); this.query.j = this.index; if (global.document && global.addEventListener) {
                                global.addEventListener("beforeunload", function () { if (self.script)
                                    self.script.onerror = empty; }, false);
                            } } inherit(JSONPPolling, Polling); JSONPPolling.prototype.supportsBinary = false; JSONPPolling.prototype.doClose = function () { if (this.script) {
                                this.script.parentNode.removeChild(this.script);
                                this.script = null;
                            } if (this.form) {
                                this.form.parentNode.removeChild(this.form);
                                this.form = null;
                                this.iframe = null;
                            } Polling.prototype.doClose.call(this); }; JSONPPolling.prototype.doPoll = function () { var self = this; var script = document.createElement("script"); if (this.script) {
                                this.script.parentNode.removeChild(this.script);
                                this.script = null;
                            } script.async = true; script.src = this.uri(); script.onerror = function (e) { self.onError("jsonp poll error", e); }; var insertAt = document.getElementsByTagName("script")[0]; if (insertAt) {
                                insertAt.parentNode.insertBefore(script, insertAt);
                            }
                            else {
                                (document.head || document.body).appendChild(script);
                            } this.script = script; var isUAgecko = "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent); if (isUAgecko) {
                                setTimeout(function () { var iframe = document.createElement("iframe"); document.body.appendChild(iframe); document.body.removeChild(iframe); }, 100);
                            } }; JSONPPolling.prototype.doWrite = function (data, fn) { var self = this; if (!this.form) {
                                var form = document.createElement("form");
                                var area = document.createElement("textarea");
                                var id = this.iframeId = "eio_iframe_" + this.index;
                                var iframe;
                                form.className = "socketio";
                                form.style.position = "absolute";
                                form.style.top = "-1000px";
                                form.style.left = "-1000px";
                                form.target = id;
                                form.method = "POST";
                                form.setAttribute("accept-charset", "utf-8");
                                area.name = "d";
                                form.appendChild(area);
                                document.body.appendChild(form);
                                this.form = form;
                                this.area = area;
                            } this.form.action = this.uri(); function complete() { initIframe(); fn(); } function initIframe() { if (self.iframe) {
                                try {
                                    self.form.removeChild(self.iframe);
                                }
                                catch (e) {
                                    self.onError("jsonp polling iframe removal error", e);
                                }
                            } try {
                                var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
                                iframe = document.createElement(html);
                            }
                            catch (e) {
                                iframe = document.createElement("iframe");
                                iframe.name = self.iframeId;
                                iframe.src = "javascript:0";
                            } iframe.id = self.iframeId; self.form.appendChild(iframe); self.iframe = iframe; } initIframe(); data = data.replace(rEscapedNewline, "\\\n"); this.area.value = data.replace(rNewline, "\\n"); try {
                                this.form.submit();
                            }
                            catch (e) { } if (this.iframe.attachEvent) {
                                this.iframe.onreadystatechange = function () { if (self.iframe.readyState == "complete") {
                                    complete();
                                } };
                            }
                            else {
                                this.iframe.onload = complete;
                            } }; }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { "./polling": 8, "component-inherit": 16 }], 7: [function (_dereq_, module, exports) { (function (global) { var XMLHttpRequest = _dereq_("xmlhttprequest-ssl"); var Polling = _dereq_("./polling"); var Emitter = _dereq_("component-emitter"); var inherit = _dereq_("component-inherit"); var debug = _dereq_("debug")("engine.io-client:polling-xhr"); module.exports = XHR; module.exports.Request = Request; function empty() { } function XHR(opts) { Polling.call(this, opts); if (global.location) {
                                var isSSL = "https:" == location.protocol;
                                var port = location.port;
                                if (!port) {
                                    port = isSSL ? 443 : 80;
                                }
                                this.xd = opts.hostname != global.location.hostname || port != opts.port;
                                this.xs = opts.secure != isSSL;
                            }
                            else {
                                this.extraHeaders = opts.extraHeaders;
                            } } inherit(XHR, Polling); XHR.prototype.supportsBinary = true; XHR.prototype.request = function (opts) { opts = opts || {}; opts.uri = this.uri(); opts.xd = this.xd; opts.xs = this.xs; opts.agent = this.agent || false; opts.supportsBinary = this.supportsBinary; opts.enablesXDR = this.enablesXDR; opts.pfx = this.pfx; opts.key = this.key; opts.passphrase = this.passphrase; opts.cert = this.cert; opts.ca = this.ca; opts.ciphers = this.ciphers; opts.rejectUnauthorized = this.rejectUnauthorized; opts.extraHeaders = this.extraHeaders; return new Request(opts); }; XHR.prototype.doWrite = function (data, fn) { var isBinary = typeof data !== "string" && data !== undefined; var req = this.request({ method: "POST", data: data, isBinary: isBinary }); var self = this; req.on("success", fn); req.on("error", function (err) { self.onError("xhr post error", err); }); this.sendXhr = req; }; XHR.prototype.doPoll = function () { debug("xhr poll"); var req = this.request(); var self = this; req.on("data", function (data) { self.onData(data); }); req.on("error", function (err) { self.onError("xhr poll error", err); }); this.pollXhr = req; }; function Request(opts) { this.method = opts.method || "GET"; this.uri = opts.uri; this.xd = !!opts.xd; this.xs = !!opts.xs; this.async = false !== opts.async; this.data = undefined != opts.data ? opts.data : null; this.agent = opts.agent; this.isBinary = opts.isBinary; this.supportsBinary = opts.supportsBinary; this.enablesXDR = opts.enablesXDR; this.pfx = opts.pfx; this.key = opts.key; this.passphrase = opts.passphrase; this.cert = opts.cert; this.ca = opts.ca; this.ciphers = opts.ciphers; this.rejectUnauthorized = opts.rejectUnauthorized; this.extraHeaders = opts.extraHeaders; this.create(); } Emitter(Request.prototype); Request.prototype.create = function () { var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR }; opts.pfx = this.pfx; opts.key = this.key; opts.passphrase = this.passphrase; opts.cert = this.cert; opts.ca = this.ca; opts.ciphers = this.ciphers; opts.rejectUnauthorized = this.rejectUnauthorized; var xhr = this.xhr = new XMLHttpRequest(opts); var self = this; try {
                                debug("xhr open %s: %s", this.method, this.uri);
                                xhr.open(this.method, this.uri, this.async);
                                try {
                                    if (this.extraHeaders) {
                                        xhr.setDisableHeaderCheck(true);
                                        for (var i in this.extraHeaders) {
                                            if (this.extraHeaders.hasOwnProperty(i)) {
                                                xhr.setRequestHeader(i, this.extraHeaders[i]);
                                            }
                                        }
                                    }
                                }
                                catch (e) { }
                                if (this.supportsBinary) {
                                    xhr.responseType = "arraybuffer";
                                }
                                if ("POST" == this.method) {
                                    try {
                                        if (this.isBinary) {
                                            xhr.setRequestHeader("Content-type", "application/octet-stream");
                                        }
                                        else {
                                            xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
                                        }
                                    }
                                    catch (e) { }
                                }
                                if ("withCredentials" in xhr) {
                                    xhr.withCredentials = true;
                                }
                                if (this.hasXDR()) {
                                    xhr.onload = function () { self.onLoad(); };
                                    xhr.onerror = function () { self.onError(xhr.responseText); };
                                }
                                else {
                                    xhr.onreadystatechange = function () { if (4 != xhr.readyState)
                                        return; if (200 == xhr.status || 1223 == xhr.status) {
                                        self.onLoad();
                                    }
                                    else {
                                        setTimeout(function () { self.onError(xhr.status); }, 0);
                                    } };
                                }
                                debug("xhr data %s", this.data);
                                xhr.send(this.data);
                            }
                            catch (e) {
                                setTimeout(function () { self.onError(e); }, 0);
                                return;
                            } if (global.document) {
                                this.index = Request.requestsCount++;
                                Request.requests[this.index] = this;
                            } }; Request.prototype.onSuccess = function () { this.emit("success"); this.cleanup(); }; Request.prototype.onData = function (data) { this.emit("data", data); this.onSuccess(); }; Request.prototype.onError = function (err) { this.emit("error", err); this.cleanup(true); }; Request.prototype.cleanup = function (fromError) { if ("undefined" == typeof this.xhr || null === this.xhr) {
                                return;
                            } if (this.hasXDR()) {
                                this.xhr.onload = this.xhr.onerror = empty;
                            }
                            else {
                                this.xhr.onreadystatechange = empty;
                            } if (fromError) {
                                try {
                                    this.xhr.abort();
                                }
                                catch (e) { }
                            } if (global.document) {
                                delete Request.requests[this.index];
                            } this.xhr = null; }; Request.prototype.onLoad = function () { var data; try {
                                var contentType;
                                try {
                                    contentType = this.xhr.getResponseHeader("Content-Type").split(";")[0];
                                }
                                catch (e) { }
                                if (contentType === "application/octet-stream") {
                                    data = this.xhr.response;
                                }
                                else {
                                    if (!this.supportsBinary) {
                                        data = this.xhr.responseText;
                                    }
                                    else {
                                        try {
                                            data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
                                        }
                                        catch (e) {
                                            var ui8Arr = new Uint8Array(this.xhr.response);
                                            var dataArray = [];
                                            for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
                                                dataArray.push(ui8Arr[idx]);
                                            }
                                            data = String.fromCharCode.apply(null, dataArray);
                                        }
                                    }
                                }
                            }
                            catch (e) {
                                this.onError(e);
                            } if (null != data) {
                                this.onData(data);
                            } }; Request.prototype.hasXDR = function () { return "undefined" !== typeof global.XDomainRequest && !this.xs && this.enablesXDR; }; Request.prototype.abort = function () { this.cleanup(); }; if (global.document) {
                                Request.requestsCount = 0;
                                Request.requests = {};
                                if (global.attachEvent) {
                                    global.attachEvent("onunload", unloadHandler);
                                }
                                else if (global.addEventListener) {
                                    global.addEventListener("beforeunload", unloadHandler, false);
                                }
                            } function unloadHandler() { for (var i in Request.requests) {
                                if (Request.requests.hasOwnProperty(i)) {
                                    Request.requests[i].abort();
                                }
                            } } }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { "./polling": 8, "component-emitter": 15, "component-inherit": 16, debug: 17, "xmlhttprequest-ssl": 10 }], 8: [function (_dereq_, module, exports) { var Transport = _dereq_("../transport"); var parseqs = _dereq_("parseqs"); var parser = _dereq_("engine.io-parser"); var inherit = _dereq_("component-inherit"); var yeast = _dereq_("yeast"); var debug = _dereq_("debug")("engine.io-client:polling"); module.exports = Polling; var hasXHR2 = function () { var XMLHttpRequest = _dereq_("xmlhttprequest-ssl"); var xhr = new XMLHttpRequest({ xdomain: false }); return null != xhr.responseType; }(); function Polling(opts) { var forceBase64 = opts && opts.forceBase64; if (!hasXHR2 || forceBase64) {
                                this.supportsBinary = false;
                            } Transport.call(this, opts); } inherit(Polling, Transport); Polling.prototype.name = "polling"; Polling.prototype.doOpen = function () { this.poll(); }; Polling.prototype.pause = function (onPause) { var pending = 0; var self = this; this.readyState = "pausing"; function pause() { debug("paused"); self.readyState = "paused"; onPause(); } if (this.polling || !this.writable) {
                                var total = 0;
                                if (this.polling) {
                                    debug("we are currently polling - waiting to pause");
                                    total++;
                                    this.once("pollComplete", function () { debug("pre-pause polling complete"); --total || pause(); });
                                }
                                if (!this.writable) {
                                    debug("we are currently writing - waiting to pause");
                                    total++;
                                    this.once("drain", function () { debug("pre-pause writing complete"); --total || pause(); });
                                }
                            }
                            else {
                                pause();
                            } }; Polling.prototype.poll = function () { debug("polling"); this.polling = true; this.doPoll(); this.emit("poll"); }; Polling.prototype.onData = function (data) { var self = this; debug("polling got data %s", data); var callback = function (packet, index, total) { if ("opening" == self.readyState) {
                                self.onOpen();
                            } if ("close" == packet.type) {
                                self.onClose();
                                return false;
                            } self.onPacket(packet); }; parser.decodePayload(data, this.socket.binaryType, callback); if ("closed" != this.readyState) {
                                this.polling = false;
                                this.emit("pollComplete");
                                if ("open" == this.readyState) {
                                    this.poll();
                                }
                                else {
                                    debug('ignoring poll - transport state "%s"', this.readyState);
                                }
                            } }; Polling.prototype.doClose = function () { var self = this; function close() { debug("writing close packet"); self.write([{ type: "close" }]); } if ("open" == this.readyState) {
                                debug("transport open - closing");
                                close();
                            }
                            else {
                                debug("transport not open - deferring close");
                                this.once("open", close);
                            } }; Polling.prototype.write = function (packets) { var self = this; this.writable = false; var callbackfn = function () { self.writable = true; self.emit("drain"); }; var self = this; parser.encodePayload(packets, this.supportsBinary, function (data) { self.doWrite(data, callbackfn); }); }; Polling.prototype.uri = function () { var query = this.query || {}; var schema = this.secure ? "https" : "http"; var port = ""; if (false !== this.timestampRequests) {
                                query[this.timestampParam] = yeast();
                            } if (!this.supportsBinary && !query.sid) {
                                query.b64 = 1;
                            } query = parseqs.encode(query); if (this.port && ("https" == schema && this.port != 443 || "http" == schema && this.port != 80)) {
                                port = ":" + this.port;
                            } if (query.length) {
                                query = "?" + query;
                            } var ipv6 = this.hostname.indexOf(":") !== -1; return schema + "://" + (ipv6 ? "[" + this.hostname + "]" : this.hostname) + port + this.path + query; }; }, { "../transport": 4, "component-inherit": 16, debug: 17, "engine.io-parser": 19, parseqs: 27, "xmlhttprequest-ssl": 10, yeast: 30 }], 9: [function (_dereq_, module, exports) { (function (global) { var Transport = _dereq_("../transport"); var parser = _dereq_("engine.io-parser"); var parseqs = _dereq_("parseqs"); var inherit = _dereq_("component-inherit"); var yeast = _dereq_("yeast"); var debug = _dereq_("debug")("engine.io-client:websocket"); var BrowserWebSocket = global.WebSocket || global.MozWebSocket; var WebSocket = BrowserWebSocket; if (!WebSocket && typeof window === "undefined") {
                                try {
                                    WebSocket = _dereq_("ws");
                                }
                                catch (e) { }
                            } module.exports = WS; function WS(opts) { var forceBase64 = opts && opts.forceBase64; if (forceBase64) {
                                this.supportsBinary = false;
                            } this.perMessageDeflate = opts.perMessageDeflate; Transport.call(this, opts); } inherit(WS, Transport); WS.prototype.name = "websocket"; WS.prototype.supportsBinary = true; WS.prototype.doOpen = function () { if (!this.check()) {
                                return;
                            } var self = this; var uri = this.uri(); var protocols = void 0; var opts = { agent: this.agent, perMessageDeflate: this.perMessageDeflate }; opts.pfx = this.pfx; opts.key = this.key; opts.passphrase = this.passphrase; opts.cert = this.cert; opts.ca = this.ca; opts.ciphers = this.ciphers; opts.rejectUnauthorized = this.rejectUnauthorized; if (this.extraHeaders) {
                                opts.headers = this.extraHeaders;
                            } this.ws = BrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts); if (this.ws.binaryType === undefined) {
                                this.supportsBinary = false;
                            } if (this.ws.supports && this.ws.supports.binary) {
                                this.supportsBinary = true;
                                this.ws.binaryType = "buffer";
                            }
                            else {
                                this.ws.binaryType = "arraybuffer";
                            } this.addEventListeners(); }; WS.prototype.addEventListeners = function () { var self = this; this.ws.onopen = function () { self.onOpen(); }; this.ws.onclose = function () { self.onClose(); }; this.ws.onmessage = function (ev) { self.onData(ev.data); }; this.ws.onerror = function (e) { self.onError("websocket error", e); }; }; if ("undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)) {
                                WS.prototype.onData = function (data) { var self = this; setTimeout(function () { Transport.prototype.onData.call(self, data); }, 0); };
                            } WS.prototype.write = function (packets) { var self = this; this.writable = false; var total = packets.length; for (var i = 0, l = total; i < l; i++) {
                                (function (packet) { parser.encodePacket(packet, self.supportsBinary, function (data) { if (!BrowserWebSocket) {
                                    var opts = {};
                                    if (packet.options) {
                                        opts.compress = packet.options.compress;
                                    }
                                    if (self.perMessageDeflate) {
                                        var len = "string" == typeof data ? global.Buffer.byteLength(data) : data.length;
                                        if (len < self.perMessageDeflate.threshold) {
                                            opts.compress = false;
                                        }
                                    }
                                } try {
                                    if (BrowserWebSocket) {
                                        self.ws.send(data);
                                    }
                                    else {
                                        self.ws.send(data, opts);
                                    }
                                }
                                catch (e) {
                                    debug("websocket closed before onclose event");
                                } --total || done(); }); })(packets[i]);
                            } function done() { self.emit("flush"); setTimeout(function () { self.writable = true; self.emit("drain"); }, 0); } }; WS.prototype.onClose = function () { Transport.prototype.onClose.call(this); }; WS.prototype.doClose = function () { if (typeof this.ws !== "undefined") {
                                this.ws.close();
                            } }; WS.prototype.uri = function () { var query = this.query || {}; var schema = this.secure ? "wss" : "ws"; var port = ""; if (this.port && ("wss" == schema && this.port != 443 || "ws" == schema && this.port != 80)) {
                                port = ":" + this.port;
                            } if (this.timestampRequests) {
                                query[this.timestampParam] = yeast();
                            } if (!this.supportsBinary) {
                                query.b64 = 1;
                            } query = parseqs.encode(query); if (query.length) {
                                query = "?" + query;
                            } var ipv6 = this.hostname.indexOf(":") !== -1; return schema + "://" + (ipv6 ? "[" + this.hostname + "]" : this.hostname) + port + this.path + query; }; WS.prototype.check = function () { return !!WebSocket && !("__initialize" in WebSocket && this.name === WS.prototype.name); }; }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { "../transport": 4, "component-inherit": 16, debug: 17, "engine.io-parser": 19, parseqs: 27, ws: undefined, yeast: 30 }], 10: [function (_dereq_, module, exports) { var hasCORS = _dereq_("has-cors"); module.exports = function (opts) { var xdomain = opts.xdomain; var xscheme = opts.xscheme; var enablesXDR = opts.enablesXDR; try {
                                if ("undefined" != typeof XMLHttpRequest && (!xdomain || hasCORS)) {
                                    return new XMLHttpRequest;
                                }
                            }
                            catch (e) { } try {
                                if ("undefined" != typeof XDomainRequest && !xscheme && enablesXDR) {
                                    return new XDomainRequest;
                                }
                            }
                            catch (e) { } if (!xdomain) {
                                try {
                                    return new ActiveXObject("Microsoft.XMLHTTP");
                                }
                                catch (e) { }
                            } }; }, { "has-cors": 22 }], 11: [function (_dereq_, module, exports) { module.exports = after; function after(count, callback, err_cb) { var bail = false; err_cb = err_cb || noop; proxy.count = count; return count === 0 ? callback() : proxy; function proxy(err, result) { if (proxy.count <= 0) {
                                throw new Error("after called too many times");
                            } --proxy.count; if (err) {
                                bail = true;
                                callback(err);
                                callback = err_cb;
                            }
                            else if (proxy.count === 0 && !bail) {
                                callback(null, result);
                            } } } function noop() { } }, {}], 12: [function (_dereq_, module, exports) { module.exports = function (arraybuffer, start, end) { var bytes = arraybuffer.byteLength; start = start || 0; end = end || bytes; if (arraybuffer.slice) {
                                return arraybuffer.slice(start, end);
                            } if (start < 0) {
                                start += bytes;
                            } if (end < 0) {
                                end += bytes;
                            } if (end > bytes) {
                                end = bytes;
                            } if (start >= bytes || start >= end || bytes === 0) {
                                return new ArrayBuffer(0);
                            } var abv = new Uint8Array(arraybuffer); var result = new Uint8Array(end - start); for (var i = start, ii = 0; i < end; i++, ii++) {
                                result[ii] = abv[i];
                            } return result.buffer; }; }, {}], 13: [function (_dereq_, module, exports) {
                                (function (chars) {
                                    "use strict";
                                    exports.encode = function (arraybuffer) {
                                        var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = "";
                                        for (i = 0; i < len; i += 3) {
                                            base64 += chars[bytes[i] >> 2];
                                            base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
                                            base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
                                            base64 += chars[bytes[i + 2] & 63];
                                        }
                                        if (len % 3 === 2) {
                                            base64 = base64.substring(0, base64.length - 1) + "=";
                                        }
                                        else if (len % 3 === 1) {
                                            base64 = base64.substring(0, base64.length - 2) + "==";
                                        }
                                        return base64;
                                    };
                                    exports.decode = function (base64) { var bufferLength = base64.length * .75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4; if (base64[base64.length - 1] === "=") {
                                        bufferLength--;
                                        if (base64[base64.length - 2] === "=") {
                                            bufferLength--;
                                        }
                                    } var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer); for (i = 0; i < len; i += 4) {
                                        encoded1 = chars.indexOf(base64[i]);
                                        encoded2 = chars.indexOf(base64[i + 1]);
                                        encoded3 = chars.indexOf(base64[i + 2]);
                                        encoded4 = chars.indexOf(base64[i + 3]);
                                        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
                                        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
                                        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
                                    } return arraybuffer; };
                                })("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
                            }, {}], 14: [function (_dereq_, module, exports) { (function (global) { var BlobBuilder = global.BlobBuilder || global.WebKitBlobBuilder || global.MSBlobBuilder || global.MozBlobBuilder; var blobSupported = function () { try {
                                var a = new Blob(["hi"]);
                                return a.size === 2;
                            }
                            catch (e) {
                                return false;
                            } }(); var blobSupportsArrayBufferView = blobSupported && function () { try {
                                var b = new Blob([new Uint8Array([1, 2])]);
                                return b.size === 2;
                            }
                            catch (e) {
                                return false;
                            } }(); var blobBuilderSupported = BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob; function mapArrayBufferViews(ary) { for (var i = 0; i < ary.length; i++) {
                                var chunk = ary[i];
                                if (chunk.buffer instanceof ArrayBuffer) {
                                    var buf = chunk.buffer;
                                    if (chunk.byteLength !== buf.byteLength) {
                                        var copy = new Uint8Array(chunk.byteLength);
                                        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
                                        buf = copy.buffer;
                                    }
                                    ary[i] = buf;
                                }
                            } } function BlobBuilderConstructor(ary, options) { options = options || {}; var bb = new BlobBuilder; mapArrayBufferViews(ary); for (var i = 0; i < ary.length; i++) {
                                bb.append(ary[i]);
                            } return options.type ? bb.getBlob(options.type) : bb.getBlob(); } function BlobConstructor(ary, options) { mapArrayBufferViews(ary); return new Blob(ary, options || {}); } module.exports = function () { if (blobSupported) {
                                return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
                            }
                            else if (blobBuilderSupported) {
                                return BlobBuilderConstructor;
                            }
                            else {
                                return undefined;
                            } }(); }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, {}], 15: [function (_dereq_, module, exports) { module.exports = Emitter; function Emitter(obj) { if (obj)
                                return mixin(obj); } function mixin(obj) { for (var key in Emitter.prototype) {
                                obj[key] = Emitter.prototype[key];
                            } return obj; } Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) { this._callbacks = this._callbacks || {}; (this._callbacks[event] = this._callbacks[event] || []).push(fn); return this; }; Emitter.prototype.once = function (event, fn) { var self = this; this._callbacks = this._callbacks || {}; function on() { self.off(event, on); fn.apply(this, arguments); } on.fn = fn; this.on(event, on); return this; }; Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) { this._callbacks = this._callbacks || {}; if (0 == arguments.length) {
                                this._callbacks = {};
                                return this;
                            } var callbacks = this._callbacks[event]; if (!callbacks)
                                return this; if (1 == arguments.length) {
                                delete this._callbacks[event];
                                return this;
                            } var cb; for (var i = 0; i < callbacks.length; i++) {
                                cb = callbacks[i];
                                if (cb === fn || cb.fn === fn) {
                                    callbacks.splice(i, 1);
                                    break;
                                }
                            } return this; }; Emitter.prototype.emit = function (event) { this._callbacks = this._callbacks || {}; var args = [].slice.call(arguments, 1), callbacks = this._callbacks[event]; if (callbacks) {
                                callbacks = callbacks.slice(0);
                                for (var i = 0, len = callbacks.length; i < len; ++i) {
                                    callbacks[i].apply(this, args);
                                }
                            } return this; }; Emitter.prototype.listeners = function (event) { this._callbacks = this._callbacks || {}; return this._callbacks[event] || []; }; Emitter.prototype.hasListeners = function (event) { return !!this.listeners(event).length; }; }, {}], 16: [function (_dereq_, module, exports) { module.exports = function (a, b) { var fn = function () { }; fn.prototype = b.prototype; a.prototype = new fn; a.prototype.constructor = a; }; }, {}], 17: [function (_dereq_, module, exports) { exports = module.exports = _dereq_("./debug"); exports.log = log; exports.formatArgs = formatArgs; exports.save = save; exports.load = load; exports.useColors = useColors; exports.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : localstorage(); exports.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"]; function useColors() { return "WebkitAppearance" in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31; } exports.formatters.j = function (v) { return JSON.stringify(v); }; function formatArgs() { var args = arguments; var useColors = this.useColors; args[0] = (useColors ? "%c" : "") + this.namespace + (useColors ? " %c" : " ") + args[0] + (useColors ? "%c " : " ") + "+" + exports.humanize(this.diff); if (!useColors)
                                return args; var c = "color: " + this.color; args = [args[0], c, "color: inherit"].concat(Array.prototype.slice.call(args, 1)); var index = 0; var lastC = 0; args[0].replace(/%[a-z%]/g, function (match) { if ("%%" === match)
                                return; index++; if ("%c" === match) {
                                lastC = index;
                            } }); args.splice(lastC, 0, c); return args; } function log() { return "object" === typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments); } function save(namespaces) { try {
                                if (null == namespaces) {
                                    exports.storage.removeItem("debug");
                                }
                                else {
                                    exports.storage.debug = namespaces;
                                }
                            }
                            catch (e) { } } function load() { var r; try {
                                r = exports.storage.debug;
                            }
                            catch (e) { } return r; } exports.enable(load()); function localstorage() { try {
                                return window.localStorage;
                            }
                            catch (e) { } } }, { "./debug": 18 }], 18: [function (_dereq_, module, exports) { exports = module.exports = debug; exports.coerce = coerce; exports.disable = disable; exports.enable = enable; exports.enabled = enabled; exports.humanize = _dereq_("ms"); exports.names = []; exports.skips = []; exports.formatters = {}; var prevColor = 0; var prevTime; function selectColor() { return exports.colors[prevColor++ % exports.colors.length]; } function debug(namespace) { function disabled() { } disabled.enabled = false; function enabled() { var self = enabled; var curr = +new Date; var ms = curr - (prevTime || curr); self.diff = ms; self.prev = prevTime; self.curr = curr; prevTime = curr; if (null == self.useColors)
                                self.useColors = exports.useColors(); if (null == self.color && self.useColors)
                                self.color = selectColor(); var args = Array.prototype.slice.call(arguments); args[0] = exports.coerce(args[0]); if ("string" !== typeof args[0]) {
                                args = ["%o"].concat(args);
                            } var index = 0; args[0] = args[0].replace(/%([a-z%])/g, function (match, format) { if (match === "%%")
                                return match; index++; var formatter = exports.formatters[format]; if ("function" === typeof formatter) {
                                var val = args[index];
                                match = formatter.call(self, val);
                                args.splice(index, 1);
                                index--;
                            } return match; }); if ("function" === typeof exports.formatArgs) {
                                args = exports.formatArgs.apply(self, args);
                            } var logFn = enabled.log || exports.log || console.log.bind(console); logFn.apply(self, args); } enabled.enabled = true; var fn = exports.enabled(namespace) ? enabled : disabled; fn.namespace = namespace; return fn; } function enable(namespaces) { exports.save(namespaces); var split = (namespaces || "").split(/[\s,]+/); var len = split.length; for (var i = 0; i < len; i++) {
                                if (!split[i])
                                    continue;
                                namespaces = split[i].replace(/\*/g, ".*?");
                                if (namespaces[0] === "-") {
                                    exports.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
                                }
                                else {
                                    exports.names.push(new RegExp("^" + namespaces + "$"));
                                }
                            } } function disable() { exports.enable(""); } function enabled(name) { var i, len; for (i = 0, len = exports.skips.length; i < len; i++) {
                                if (exports.skips[i].test(name)) {
                                    return false;
                                }
                            } for (i = 0, len = exports.names.length; i < len; i++) {
                                if (exports.names[i].test(name)) {
                                    return true;
                                }
                            } return false; } function coerce(val) { if (val instanceof Error)
                                return val.stack || val.message; return val; } }, { ms: 25 }], 19: [function (_dereq_, module, exports) { (function (global) { var keys = _dereq_("./keys"); var hasBinary = _dereq_("has-binary"); var sliceBuffer = _dereq_("arraybuffer.slice"); var base64encoder = _dereq_("base64-arraybuffer"); var after = _dereq_("after"); var utf8 = _dereq_("utf8"); var isAndroid = navigator.userAgent.match(/Android/i); var isPhantomJS = /PhantomJS/i.test(navigator.userAgent); var dontSendBlobs = isAndroid || isPhantomJS; exports.protocol = 3; var packets = exports.packets = { open: 0, close: 1, ping: 2, pong: 3, message: 4, upgrade: 5, noop: 6 }; var packetslist = keys(packets); var err = { type: "error", data: "parser error" }; var Blob = _dereq_("blob"); exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) { if ("function" == typeof supportsBinary) {
                                callback = supportsBinary;
                                supportsBinary = false;
                            } if ("function" == typeof utf8encode) {
                                callback = utf8encode;
                                utf8encode = null;
                            } var data = packet.data === undefined ? undefined : packet.data.buffer || packet.data; if (global.ArrayBuffer && data instanceof ArrayBuffer) {
                                return encodeArrayBuffer(packet, supportsBinary, callback);
                            }
                            else if (Blob && data instanceof global.Blob) {
                                return encodeBlob(packet, supportsBinary, callback);
                            } if (data && data.base64) {
                                return encodeBase64Object(packet, callback);
                            } var encoded = packets[packet.type]; if (undefined !== packet.data) {
                                encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
                            } return callback("" + encoded); }; function encodeBase64Object(packet, callback) { var message = "b" + exports.packets[packet.type] + packet.data.data; return callback(message); } function encodeArrayBuffer(packet, supportsBinary, callback) { if (!supportsBinary) {
                                return exports.encodeBase64Packet(packet, callback);
                            } var data = packet.data; var contentArray = new Uint8Array(data); var resultBuffer = new Uint8Array(1 + data.byteLength); resultBuffer[0] = packets[packet.type]; for (var i = 0; i < contentArray.length; i++) {
                                resultBuffer[i + 1] = contentArray[i];
                            } return callback(resultBuffer.buffer); } function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) { if (!supportsBinary) {
                                return exports.encodeBase64Packet(packet, callback);
                            } var fr = new FileReader; fr.onload = function () { packet.data = fr.result; exports.encodePacket(packet, supportsBinary, true, callback); }; return fr.readAsArrayBuffer(packet.data); } function encodeBlob(packet, supportsBinary, callback) { if (!supportsBinary) {
                                return exports.encodeBase64Packet(packet, callback);
                            } if (dontSendBlobs) {
                                return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
                            } var length = new Uint8Array(1); length[0] = packets[packet.type]; var blob = new Blob([length.buffer, packet.data]); return callback(blob); } exports.encodeBase64Packet = function (packet, callback) { var message = "b" + exports.packets[packet.type]; if (Blob && packet.data instanceof global.Blob) {
                                var fr = new FileReader;
                                fr.onload = function () { var b64 = fr.result.split(",")[1]; callback(message + b64); };
                                return fr.readAsDataURL(packet.data);
                            } var b64data; try {
                                b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
                            }
                            catch (e) {
                                var typed = new Uint8Array(packet.data);
                                var basic = new Array(typed.length);
                                for (var i = 0; i < typed.length; i++) {
                                    basic[i] = typed[i];
                                }
                                b64data = String.fromCharCode.apply(null, basic);
                            } message += global.btoa(b64data); return callback(message); }; exports.decodePacket = function (data, binaryType, utf8decode) { if (typeof data == "string" || data === undefined) {
                                if (data.charAt(0) == "b") {
                                    return exports.decodeBase64Packet(data.substr(1), binaryType);
                                }
                                if (utf8decode) {
                                    try {
                                        data = utf8.decode(data);
                                    }
                                    catch (e) {
                                        return err;
                                    }
                                }
                                var type = data.charAt(0);
                                if (Number(type) != type || !packetslist[type]) {
                                    return err;
                                }
                                if (data.length > 1) {
                                    return { type: packetslist[type], data: data.substring(1) };
                                }
                                else {
                                    return { type: packetslist[type] };
                                }
                            } var asArray = new Uint8Array(data); var type = asArray[0]; var rest = sliceBuffer(data, 1); if (Blob && binaryType === "blob") {
                                rest = new Blob([rest]);
                            } return { type: packetslist[type], data: rest }; }; exports.decodeBase64Packet = function (msg, binaryType) { var type = packetslist[msg.charAt(0)]; if (!global.ArrayBuffer) {
                                return { type: type, data: { base64: true, data: msg.substr(1) } };
                            } var data = base64encoder.decode(msg.substr(1)); if (binaryType === "blob" && Blob) {
                                data = new Blob([data]);
                            } return { type: type, data: data }; }; exports.encodePayload = function (packets, supportsBinary, callback) { if (typeof supportsBinary == "function") {
                                callback = supportsBinary;
                                supportsBinary = null;
                            } var isBinary = hasBinary(packets); if (supportsBinary && isBinary) {
                                if (Blob && !dontSendBlobs) {
                                    return exports.encodePayloadAsBlob(packets, callback);
                                }
                                return exports.encodePayloadAsArrayBuffer(packets, callback);
                            } if (!packets.length) {
                                return callback("0:");
                            } function setLengthHeader(message) { return message.length + ":" + message; } function encodeOne(packet, doneCallback) { exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function (message) { doneCallback(null, setLengthHeader(message)); }); } map(packets, encodeOne, function (err, results) { return callback(results.join("")); }); }; function map(ary, each, done) { var result = new Array(ary.length); var next = after(ary.length, done); var eachWithIndex = function (i, el, cb) { each(el, function (error, msg) { result[i] = msg; cb(error, result); }); }; for (var i = 0; i < ary.length; i++) {
                                eachWithIndex(i, ary[i], next);
                            } } exports.decodePayload = function (data, binaryType, callback) { if (typeof data != "string") {
                                return exports.decodePayloadAsBinary(data, binaryType, callback);
                            } if (typeof binaryType === "function") {
                                callback = binaryType;
                                binaryType = null;
                            } var packet; if (data == "") {
                                return callback(err, 0, 1);
                            } var length = "", n, msg; for (var i = 0, l = data.length; i < l; i++) {
                                var chr = data.charAt(i);
                                if (":" != chr) {
                                    length += chr;
                                }
                                else {
                                    if ("" == length || length != (n = Number(length))) {
                                        return callback(err, 0, 1);
                                    }
                                    msg = data.substr(i + 1, n);
                                    if (length != msg.length) {
                                        return callback(err, 0, 1);
                                    }
                                    if (msg.length) {
                                        packet = exports.decodePacket(msg, binaryType, true);
                                        if (err.type == packet.type && err.data == packet.data) {
                                            return callback(err, 0, 1);
                                        }
                                        var ret = callback(packet, i + n, l);
                                        if (false === ret)
                                            return;
                                    }
                                    i += n;
                                    length = "";
                                }
                            } if (length != "") {
                                return callback(err, 0, 1);
                            } }; exports.encodePayloadAsArrayBuffer = function (packets, callback) { if (!packets.length) {
                                return callback(new ArrayBuffer(0));
                            } function encodeOne(packet, doneCallback) { exports.encodePacket(packet, true, true, function (data) { return doneCallback(null, data); }); } map(packets, encodeOne, function (err, encodedPackets) { var totalLength = encodedPackets.reduce(function (acc, p) { var len; if (typeof p === "string") {
                                len = p.length;
                            }
                            else {
                                len = p.byteLength;
                            } return acc + len.toString().length + len + 2; }, 0); var resultArray = new Uint8Array(totalLength); var bufferIndex = 0; encodedPackets.forEach(function (p) { var isString = typeof p === "string"; var ab = p; if (isString) {
                                var view = new Uint8Array(p.length);
                                for (var i = 0; i < p.length; i++) {
                                    view[i] = p.charCodeAt(i);
                                }
                                ab = view.buffer;
                            } if (isString) {
                                resultArray[bufferIndex++] = 0;
                            }
                            else {
                                resultArray[bufferIndex++] = 1;
                            } var lenStr = ab.byteLength.toString(); for (var i = 0; i < lenStr.length; i++) {
                                resultArray[bufferIndex++] = parseInt(lenStr[i]);
                            } resultArray[bufferIndex++] = 255; var view = new Uint8Array(ab); for (var i = 0; i < view.length; i++) {
                                resultArray[bufferIndex++] = view[i];
                            } }); return callback(resultArray.buffer); }); }; exports.encodePayloadAsBlob = function (packets, callback) { function encodeOne(packet, doneCallback) { exports.encodePacket(packet, true, true, function (encoded) { var binaryIdentifier = new Uint8Array(1); binaryIdentifier[0] = 1; if (typeof encoded === "string") {
                                var view = new Uint8Array(encoded.length);
                                for (var i = 0; i < encoded.length; i++) {
                                    view[i] = encoded.charCodeAt(i);
                                }
                                encoded = view.buffer;
                                binaryIdentifier[0] = 0;
                            } var len = encoded instanceof ArrayBuffer ? encoded.byteLength : encoded.size; var lenStr = len.toString(); var lengthAry = new Uint8Array(lenStr.length + 1); for (var i = 0; i < lenStr.length; i++) {
                                lengthAry[i] = parseInt(lenStr[i]);
                            } lengthAry[lenStr.length] = 255; if (Blob) {
                                var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
                                doneCallback(null, blob);
                            } }); } map(packets, encodeOne, function (err, results) { return callback(new Blob(results)); }); }; exports.decodePayloadAsBinary = function (data, binaryType, callback) { if (typeof binaryType === "function") {
                                callback = binaryType;
                                binaryType = null;
                            } var bufferTail = data; var buffers = []; var numberTooLong = false; while (bufferTail.byteLength > 0) {
                                var tailArray = new Uint8Array(bufferTail);
                                var isString = tailArray[0] === 0;
                                var msgLength = "";
                                for (var i = 1;; i++) {
                                    if (tailArray[i] == 255)
                                        break;
                                    if (msgLength.length > 310) {
                                        numberTooLong = true;
                                        break;
                                    }
                                    msgLength += tailArray[i];
                                }
                                if (numberTooLong)
                                    return callback(err, 0, 1);
                                bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
                                msgLength = parseInt(msgLength);
                                var msg = sliceBuffer(bufferTail, 0, msgLength);
                                if (isString) {
                                    try {
                                        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
                                    }
                                    catch (e) {
                                        var typed = new Uint8Array(msg);
                                        msg = "";
                                        for (var i = 0; i < typed.length; i++) {
                                            msg += String.fromCharCode(typed[i]);
                                        }
                                    }
                                }
                                buffers.push(msg);
                                bufferTail = sliceBuffer(bufferTail, msgLength);
                            } var total = buffers.length; buffers.forEach(function (buffer, i) { callback(exports.decodePacket(buffer, binaryType, true), i, total); }); }; }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { "./keys": 20, after: 11, "arraybuffer.slice": 12, "base64-arraybuffer": 13, blob: 14, "has-binary": 21, utf8: 29 }], 20: [function (_dereq_, module, exports) { module.exports = Object.keys || function keys(obj) { var arr = []; var has = Object.prototype.hasOwnProperty; for (var i in obj) {
                                if (has.call(obj, i)) {
                                    arr.push(i);
                                }
                            } return arr; }; }, {}], 21: [function (_dereq_, module, exports) { (function (global) { var isArray = _dereq_("isarray"); module.exports = hasBinary; function hasBinary(data) { function _hasBinary(obj) { if (!obj)
                                return false; if (global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File) {
                                return true;
                            } if (isArray(obj)) {
                                for (var i = 0; i < obj.length; i++) {
                                    if (_hasBinary(obj[i])) {
                                        return true;
                                    }
                                }
                            }
                            else if (obj && "object" == typeof obj) {
                                if (obj.toJSON) {
                                    obj = obj.toJSON();
                                }
                                for (var key in obj) {
                                    if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
                                        return true;
                                    }
                                }
                            } return false; } return _hasBinary(data); } }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { isarray: 24 }], 22: [function (_dereq_, module, exports) { try {
                                module.exports = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest;
                            }
                            catch (err) {
                                module.exports = false;
                            } }, {}], 23: [function (_dereq_, module, exports) { var indexOf = [].indexOf; module.exports = function (arr, obj) { if (indexOf)
                                return arr.indexOf(obj); for (var i = 0; i < arr.length; ++i) {
                                if (arr[i] === obj)
                                    return i;
                            } return -1; }; }, {}], 24: [function (_dereq_, module, exports) { module.exports = Array.isArray || function (arr) { return Object.prototype.toString.call(arr) == "[object Array]"; }; }, {}], 25: [function (_dereq_, module, exports) { var s = 1e3; var m = s * 60; var h = m * 60; var d = h * 24; var y = d * 365.25; module.exports = function (val, options) { options = options || {}; if ("string" == typeof val)
                                return parse(val); return options.long ? long(val) : short(val); }; function parse(str) { str = "" + str; if (str.length > 1e4)
                                return; var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str); if (!match)
                                return; var n = parseFloat(match[1]); var type = (match[2] || "ms").toLowerCase(); switch (type) {
                                case "years":
                                case "year":
                                case "yrs":
                                case "yr":
                                case "y": return n * y;
                                case "days":
                                case "day":
                                case "d": return n * d;
                                case "hours":
                                case "hour":
                                case "hrs":
                                case "hr":
                                case "h": return n * h;
                                case "minutes":
                                case "minute":
                                case "mins":
                                case "min":
                                case "m": return n * m;
                                case "seconds":
                                case "second":
                                case "secs":
                                case "sec":
                                case "s": return n * s;
                                case "milliseconds":
                                case "millisecond":
                                case "msecs":
                                case "msec":
                                case "ms": return n;
                            } } function short(ms) { if (ms >= d)
                                return Math.round(ms / d) + "d"; if (ms >= h)
                                return Math.round(ms / h) + "h"; if (ms >= m)
                                return Math.round(ms / m) + "m"; if (ms >= s)
                                return Math.round(ms / s) + "s"; return ms + "ms"; } function long(ms) { return plural(ms, d, "day") || plural(ms, h, "hour") || plural(ms, m, "minute") || plural(ms, s, "second") || ms + " ms"; } function plural(ms, n, name) { if (ms < n)
                                return; if (ms < n * 1.5)
                                return Math.floor(ms / n) + " " + name; return Math.ceil(ms / n) + " " + name + "s"; } }, {}], 26: [function (_dereq_, module, exports) { (function (global) { var rvalidchars = /^[\],:{}\s]*$/; var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g; var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g; var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g; var rtrimLeft = /^\s+/; var rtrimRight = /\s+$/; module.exports = function parsejson(data) { if ("string" != typeof data || !data) {
                                return null;
                            } data = data.replace(rtrimLeft, "").replace(rtrimRight, ""); if (global.JSON && JSON.parse) {
                                return JSON.parse(data);
                            } if (rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
                                return new Function("return " + data)();
                            } }; }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, {}], 27: [function (_dereq_, module, exports) { exports.encode = function (obj) { var str = ""; for (var i in obj) {
                                if (obj.hasOwnProperty(i)) {
                                    if (str.length)
                                        str += "&";
                                    str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
                                }
                            } return str; }; exports.decode = function (qs) { var qry = {}; var pairs = qs.split("&"); for (var i = 0, l = pairs.length; i < l; i++) {
                                var pair = pairs[i].split("=");
                                qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                            } return qry; }; }, {}], 28: [function (_dereq_, module, exports) { var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/; var parts = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"]; module.exports = function parseuri(str) { var src = str, b = str.indexOf("["), e = str.indexOf("]"); if (b != -1 && e != -1) {
                                str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
                            } var m = re.exec(str || ""), uri = {}, i = 14; while (i--) {
                                uri[parts[i]] = m[i] || "";
                            } if (b != -1 && e != -1) {
                                uri.source = src;
                                uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
                                uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
                                uri.ipv6uri = true;
                            } return uri; }; }, {}], 29: [function (_dereq_, module, exports) { (function (global) { (function (root) { var freeExports = typeof exports == "object" && exports; var freeModule = typeof module == "object" && module && module.exports == freeExports && module; var freeGlobal = typeof global == "object" && global; if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
                                root = freeGlobal;
                            } var stringFromCharCode = String.fromCharCode; function ucs2decode(string) { var output = []; var counter = 0; var length = string.length; var value; var extra; while (counter < length) {
                                value = string.charCodeAt(counter++);
                                if (value >= 55296 && value <= 56319 && counter < length) {
                                    extra = string.charCodeAt(counter++);
                                    if ((extra & 64512) == 56320) {
                                        output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
                                    }
                                    else {
                                        output.push(value);
                                        counter--;
                                    }
                                }
                                else {
                                    output.push(value);
                                }
                            } return output; } function ucs2encode(array) { var length = array.length; var index = -1; var value; var output = ""; while (++index < length) {
                                value = array[index];
                                if (value > 65535) {
                                    value -= 65536;
                                    output += stringFromCharCode(value >>> 10 & 1023 | 55296);
                                    value = 56320 | value & 1023;
                                }
                                output += stringFromCharCode(value);
                            } return output; } function checkScalarValue(codePoint) { if (codePoint >= 55296 && codePoint <= 57343) {
                                throw Error("Lone surrogate U+" + codePoint.toString(16).toUpperCase() + " is not a scalar value");
                            } } function createByte(codePoint, shift) { return stringFromCharCode(codePoint >> shift & 63 | 128); } function encodeCodePoint(codePoint) { if ((codePoint & 4294967168) == 0) {
                                return stringFromCharCode(codePoint);
                            } var symbol = ""; if ((codePoint & 4294965248) == 0) {
                                symbol = stringFromCharCode(codePoint >> 6 & 31 | 192);
                            }
                            else if ((codePoint & 4294901760) == 0) {
                                checkScalarValue(codePoint);
                                symbol = stringFromCharCode(codePoint >> 12 & 15 | 224);
                                symbol += createByte(codePoint, 6);
                            }
                            else if ((codePoint & 4292870144) == 0) {
                                symbol = stringFromCharCode(codePoint >> 18 & 7 | 240);
                                symbol += createByte(codePoint, 12);
                                symbol += createByte(codePoint, 6);
                            } symbol += stringFromCharCode(codePoint & 63 | 128); return symbol; } function utf8encode(string) { var codePoints = ucs2decode(string); var length = codePoints.length; var index = -1; var codePoint; var byteString = ""; while (++index < length) {
                                codePoint = codePoints[index];
                                byteString += encodeCodePoint(codePoint);
                            } return byteString; } function readContinuationByte() { if (byteIndex >= byteCount) {
                                throw Error("Invalid byte index");
                            } var continuationByte = byteArray[byteIndex] & 255; byteIndex++; if ((continuationByte & 192) == 128) {
                                return continuationByte & 63;
                            } throw Error("Invalid continuation byte"); } function decodeSymbol() { var byte1; var byte2; var byte3; var byte4; var codePoint; if (byteIndex > byteCount) {
                                throw Error("Invalid byte index");
                            } if (byteIndex == byteCount) {
                                return false;
                            } byte1 = byteArray[byteIndex] & 255; byteIndex++; if ((byte1 & 128) == 0) {
                                return byte1;
                            } if ((byte1 & 224) == 192) {
                                var byte2 = readContinuationByte();
                                codePoint = (byte1 & 31) << 6 | byte2;
                                if (codePoint >= 128) {
                                    return codePoint;
                                }
                                else {
                                    throw Error("Invalid continuation byte");
                                }
                            } if ((byte1 & 240) == 224) {
                                byte2 = readContinuationByte();
                                byte3 = readContinuationByte();
                                codePoint = (byte1 & 15) << 12 | byte2 << 6 | byte3;
                                if (codePoint >= 2048) {
                                    checkScalarValue(codePoint);
                                    return codePoint;
                                }
                                else {
                                    throw Error("Invalid continuation byte");
                                }
                            } if ((byte1 & 248) == 240) {
                                byte2 = readContinuationByte();
                                byte3 = readContinuationByte();
                                byte4 = readContinuationByte();
                                codePoint = (byte1 & 15) << 18 | byte2 << 12 | byte3 << 6 | byte4;
                                if (codePoint >= 65536 && codePoint <= 1114111) {
                                    return codePoint;
                                }
                            } throw Error("Invalid UTF-8 detected"); } var byteArray; var byteCount; var byteIndex; function utf8decode(byteString) { byteArray = ucs2decode(byteString); byteCount = byteArray.length; byteIndex = 0; var codePoints = []; var tmp; while ((tmp = decodeSymbol()) !== false) {
                                codePoints.push(tmp);
                            } return ucs2encode(codePoints); } var utf8 = { version: "2.0.0", encode: utf8encode, decode: utf8decode }; if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
                                define(function () { return utf8; });
                            }
                            else if (freeExports && !freeExports.nodeType) {
                                if (freeModule) {
                                    freeModule.exports = utf8;
                                }
                                else {
                                    var object = {};
                                    var hasOwnProperty = object.hasOwnProperty;
                                    for (var key in utf8) {
                                        hasOwnProperty.call(utf8, key) && (freeExports[key] = utf8[key]);
                                    }
                                }
                            }
                            else {
                                root.utf8 = utf8;
                            } })(this); }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, {}], 30: [function (_dereq_, module, exports) {
                                "use strict";
                                var alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""), length = 64, map = {}, seed = 0, i = 0, prev;
                                function encode(num) { var encoded = ""; do {
                                    encoded = alphabet[num % length] + encoded;
                                    num = Math.floor(num / length);
                                } while (num > 0); return encoded; }
                                function decode(str) { var decoded = 0; for (i = 0; i < str.length; i++) {
                                    decoded = decoded * length + map[str.charAt(i)];
                                } return decoded; }
                                function yeast() { var now = encode(+new Date); if (now !== prev)
                                    return seed = 0, prev = now; return now + "." + encode(seed++); }
                                for (; i < length; i++)
                                    map[alphabet[i]] = i;
                                yeast.encode = encode;
                                yeast.decode = decode;
                                module.exports = yeast;
                            }, {}], 31: [function (_dereq_, module, exports) { var url = _dereq_("./url"); var parser = _dereq_("socket.io-parser"); var Manager = _dereq_("./manager"); var debug = _dereq_("debug")("socket.io-client"); module.exports = exports = lookup; var cache = exports.managers = {}; function lookup(uri, opts) { if (typeof uri == "object") {
                                opts = uri;
                                uri = undefined;
                            } opts = opts || {}; var parsed = url(uri); var source = parsed.source; var id = parsed.id; var path = parsed.path; var sameNamespace = cache[id] && path in cache[id].nsps; var newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace; var io; if (newConnection) {
                                debug("ignoring socket cache for %s", source);
                                io = Manager(source, opts);
                            }
                            else {
                                if (!cache[id]) {
                                    debug("new io instance for %s", source);
                                    cache[id] = Manager(source, opts);
                                }
                                io = cache[id];
                            } return io.socket(parsed.path); } exports.protocol = parser.protocol; exports.connect = lookup; exports.Manager = _dereq_("./manager"); exports.Socket = _dereq_("./socket"); }, { "./manager": 32, "./socket": 34, "./url": 35, debug: 39, "socket.io-parser": 47 }], 32: [function (_dereq_, module, exports) {
                                var eio = _dereq_("engine.io-client");
                                var Socket = _dereq_("./socket");
                                var Emitter = _dereq_("component-emitter");
                                var parser = _dereq_("socket.io-parser");
                                var on = _dereq_("./on");
                                var bind = _dereq_("component-bind");
                                var debug = _dereq_("debug")("socket.io-client:manager");
                                var indexOf = _dereq_("indexof");
                                var Backoff = _dereq_("backo2");
                                var has = Object.prototype.hasOwnProperty;
                                module.exports = Manager;
                                function Manager(uri, opts) { if (!(this instanceof Manager))
                                    return new Manager(uri, opts); if (uri && "object" == typeof uri) {
                                    opts = uri;
                                    uri = undefined;
                                } opts = opts || {}; opts.path = opts.path || "/socket.io"; this.nsps = {}; this.subs = []; this.opts = opts; this.reconnection(opts.reconnection !== false); this.reconnectionAttempts(opts.reconnectionAttempts || Infinity); this.reconnectionDelay(opts.reconnectionDelay || 1e3); this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3); this.randomizationFactor(opts.randomizationFactor || .5); this.backoff = new Backoff({ min: this.reconnectionDelay(), max: this.reconnectionDelayMax(), jitter: this.randomizationFactor() }); this.timeout(null == opts.timeout ? 2e4 : opts.timeout); this.readyState = "closed"; this.uri = uri; this.connecting = []; this.lastPing = null; this.encoding = false; this.packetBuffer = []; this.encoder = new parser.Encoder; this.decoder = new parser.Decoder; this.autoConnect = opts.autoConnect !== false; if (this.autoConnect)
                                    this.open(); }
                                Manager.prototype.emitAll = function () { this.emit.apply(this, arguments); for (var nsp in this.nsps) {
                                    if (has.call(this.nsps, nsp)) {
                                        this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
                                    }
                                } };
                                Manager.prototype.updateSocketIds = function () { for (var nsp in this.nsps) {
                                    if (has.call(this.nsps, nsp)) {
                                        this.nsps[nsp].id = this.engine.id;
                                    }
                                } };
                                Emitter(Manager.prototype);
                                Manager.prototype.reconnection = function (v) { if (!arguments.length)
                                    return this._reconnection; this._reconnection = !!v; return this; };
                                Manager.prototype.reconnectionAttempts = function (v) { if (!arguments.length)
                                    return this._reconnectionAttempts; this._reconnectionAttempts = v; return this; };
                                Manager.prototype.reconnectionDelay = function (v) { if (!arguments.length)
                                    return this._reconnectionDelay; this._reconnectionDelay = v; this.backoff && this.backoff.setMin(v); return this; };
                                Manager.prototype.randomizationFactor = function (v) { if (!arguments.length)
                                    return this._randomizationFactor; this._randomizationFactor = v; this.backoff && this.backoff.setJitter(v); return this; };
                                Manager.prototype.reconnectionDelayMax = function (v) { if (!arguments.length)
                                    return this._reconnectionDelayMax; this._reconnectionDelayMax = v; this.backoff && this.backoff.setMax(v); return this; };
                                Manager.prototype.timeout = function (v) { if (!arguments.length)
                                    return this._timeout; this._timeout = v; return this; };
                                Manager.prototype.maybeReconnectOnOpen = function () { if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
                                    this.reconnect();
                                } };
                                Manager.prototype.open = Manager.prototype.connect = function (fn) { debug("readyState %s", this.readyState); if (~this.readyState.indexOf("open"))
                                    return this; debug("opening %s", this.uri); this.engine = eio(this.uri, this.opts); var socket = this.engine; var self = this; this.readyState = "opening"; this.skipReconnect = false; var openSub = on(socket, "open", function () { self.onopen(); fn && fn(); }); var errorSub = on(socket, "error", function (data) { debug("connect_error"); self.cleanup(); self.readyState = "closed"; self.emitAll("connect_error", data); if (fn) {
                                    var err = new Error("Connection error");
                                    err.data = data;
                                    fn(err);
                                }
                                else {
                                    self.maybeReconnectOnOpen();
                                } }); if (false !== this._timeout) {
                                    var timeout = this._timeout;
                                    debug("connect attempt will timeout after %d", timeout);
                                    var timer = setTimeout(function () { debug("connect attempt timed out after %d", timeout); openSub.destroy(); socket.close(); socket.emit("error", "timeout"); self.emitAll("connect_timeout", timeout); }, timeout);
                                    this.subs.push({ destroy: function () { clearTimeout(timer); } });
                                } this.subs.push(openSub); this.subs.push(errorSub); return this; };
                                Manager.prototype.onopen = function () { debug("open"); this.cleanup(); this.readyState = "open"; this.emit("open"); var socket = this.engine; this.subs.push(on(socket, "data", bind(this, "ondata"))); this.subs.push(on(socket, "ping", bind(this, "onping"))); this.subs.push(on(socket, "pong", bind(this, "onpong"))); this.subs.push(on(socket, "error", bind(this, "onerror"))); this.subs.push(on(socket, "close", bind(this, "onclose"))); this.subs.push(on(this.decoder, "decoded", bind(this, "ondecoded"))); };
                                Manager.prototype.onping = function () { this.lastPing = new Date; this.emitAll("ping"); };
                                Manager.prototype.onpong = function () { this.emitAll("pong", new Date - this.lastPing); };
                                Manager.prototype.ondata = function (data) { this.decoder.add(data); };
                                Manager.prototype.ondecoded = function (packet) { this.emit("packet", packet); };
                                Manager.prototype.onerror = function (err) { debug("error", err); this.emitAll("error", err); };
                                Manager.prototype.socket = function (nsp) {
                                    var socket = this.nsps[nsp];
                                    if (!socket) {
                                        socket = new Socket(this, nsp);
                                        this.nsps[nsp] = socket;
                                        var self = this;
                                        socket.on("connecting", onConnecting);
                                        socket.on("connect", function () { socket.id = self.engine.id; });
                                        if (this.autoConnect) {
                                            onConnecting();
                                        }
                                    }
                                    function onConnecting() { if (!~indexOf(self.connecting, socket)) {
                                        self.connecting.push(socket);
                                    } }
                                    return socket;
                                };
                                Manager.prototype.destroy = function (socket) { var index = indexOf(this.connecting, socket); if (~index)
                                    this.connecting.splice(index, 1); if (this.connecting.length)
                                    return; this.close(); };
                                Manager.prototype.packet = function (packet) { debug("writing packet %j", packet); var self = this; if (!self.encoding) {
                                    self.encoding = true;
                                    this.encoder.encode(packet, function (encodedPackets) { for (var i = 0; i < encodedPackets.length; i++) {
                                        self.engine.write(encodedPackets[i], packet.options);
                                    } self.encoding = false; self.processPacketQueue(); });
                                }
                                else {
                                    self.packetBuffer.push(packet);
                                } };
                                Manager.prototype.processPacketQueue = function () { if (this.packetBuffer.length > 0 && !this.encoding) {
                                    var pack = this.packetBuffer.shift();
                                    this.packet(pack);
                                } };
                                Manager.prototype.cleanup = function () { debug("cleanup"); var sub; while (sub = this.subs.shift())
                                    sub.destroy(); this.packetBuffer = []; this.encoding = false; this.lastPing = null; this.decoder.destroy(); };
                                Manager.prototype.close = Manager.prototype.disconnect = function () { debug("disconnect"); this.skipReconnect = true; this.reconnecting = false; if ("opening" == this.readyState) {
                                    this.cleanup();
                                } this.backoff.reset(); this.readyState = "closed"; if (this.engine)
                                    this.engine.close(); };
                                Manager.prototype.onclose = function (reason) { debug("onclose"); this.cleanup(); this.backoff.reset(); this.readyState = "closed"; this.emit("close", reason); if (this._reconnection && !this.skipReconnect) {
                                    this.reconnect();
                                } };
                                Manager.prototype.reconnect = function () { if (this.reconnecting || this.skipReconnect)
                                    return this; var self = this; if (this.backoff.attempts >= this._reconnectionAttempts) {
                                    debug("reconnect failed");
                                    this.backoff.reset();
                                    this.emitAll("reconnect_failed");
                                    this.reconnecting = false;
                                }
                                else {
                                    var delay = this.backoff.duration();
                                    debug("will wait %dms before reconnect attempt", delay);
                                    this.reconnecting = true;
                                    var timer = setTimeout(function () { if (self.skipReconnect)
                                        return; debug("attempting reconnect"); self.emitAll("reconnect_attempt", self.backoff.attempts); self.emitAll("reconnecting", self.backoff.attempts); if (self.skipReconnect)
                                        return; self.open(function (err) { if (err) {
                                        debug("reconnect attempt error");
                                        self.reconnecting = false;
                                        self.reconnect();
                                        self.emitAll("reconnect_error", err.data);
                                    }
                                    else {
                                        debug("reconnect success");
                                        self.onreconnect();
                                    } }); }, delay);
                                    this.subs.push({ destroy: function () { clearTimeout(timer); } });
                                } };
                                Manager.prototype.onreconnect = function () { var attempt = this.backoff.attempts; this.reconnecting = false; this.backoff.reset(); this.updateSocketIds(); this.emitAll("reconnect", attempt); };
                            }, { "./on": 33, "./socket": 34, backo2: 36, "component-bind": 37, "component-emitter": 38, debug: 39, "engine.io-client": 1, indexof: 42, "socket.io-parser": 47 }], 33: [function (_dereq_, module, exports) { module.exports = on; function on(obj, ev, fn) { obj.on(ev, fn); return { destroy: function () { obj.removeListener(ev, fn); } }; } }, {}], 34: [function (_dereq_, module, exports) { var parser = _dereq_("socket.io-parser"); var Emitter = _dereq_("component-emitter"); var toArray = _dereq_("to-array"); var on = _dereq_("./on"); var bind = _dereq_("component-bind"); var debug = _dereq_("debug")("socket.io-client:socket"); var hasBin = _dereq_("has-binary"); module.exports = exports = Socket; var events = { connect: 1, connect_error: 1, connect_timeout: 1, connecting: 1, disconnect: 1, error: 1, reconnect: 1, reconnect_attempt: 1, reconnect_failed: 1, reconnect_error: 1, reconnecting: 1, ping: 1, pong: 1 }; var emit = Emitter.prototype.emit; function Socket(io, nsp) { this.io = io; this.nsp = nsp; this.json = this; this.ids = 0; this.acks = {}; this.receiveBuffer = []; this.sendBuffer = []; this.connected = false; this.disconnected = true; if (this.io.autoConnect)
                                this.open(); } Emitter(Socket.prototype); Socket.prototype.subEvents = function () { if (this.subs)
                                return; var io = this.io; this.subs = [on(io, "open", bind(this, "onopen")), on(io, "packet", bind(this, "onpacket")), on(io, "close", bind(this, "onclose"))]; }; Socket.prototype.open = Socket.prototype.connect = function () { if (this.connected)
                                return this; this.subEvents(); this.io.open(); if ("open" == this.io.readyState)
                                this.onopen(); this.emit("connecting"); return this; }; Socket.prototype.send = function () { var args = toArray(arguments); args.unshift("message"); this.emit.apply(this, args); return this; }; Socket.prototype.emit = function (ev) { if (events.hasOwnProperty(ev)) {
                                emit.apply(this, arguments);
                                return this;
                            } var args = toArray(arguments); var parserType = parser.EVENT; if (hasBin(args)) {
                                parserType = parser.BINARY_EVENT;
                            } var packet = { type: parserType, data: args }; packet.options = {}; packet.options.compress = !this.flags || false !== this.flags.compress; if ("function" == typeof args[args.length - 1]) {
                                debug("emitting packet with ack id %d", this.ids);
                                this.acks[this.ids] = args.pop();
                                packet.id = this.ids++;
                            } if (this.connected) {
                                this.packet(packet);
                            }
                            else {
                                this.sendBuffer.push(packet);
                            } delete this.flags; return this; }; Socket.prototype.packet = function (packet) { packet.nsp = this.nsp; this.io.packet(packet); }; Socket.prototype.onopen = function () { debug("transport is open - connecting"); if ("/" != this.nsp) {
                                this.packet({ type: parser.CONNECT });
                            } }; Socket.prototype.onclose = function (reason) { debug("close (%s)", reason); this.connected = false; this.disconnected = true; delete this.id; this.emit("disconnect", reason); }; Socket.prototype.onpacket = function (packet) { if (packet.nsp != this.nsp)
                                return; switch (packet.type) {
                                case parser.CONNECT:
                                    this.onconnect();
                                    break;
                                case parser.EVENT:
                                    this.onevent(packet);
                                    break;
                                case parser.BINARY_EVENT:
                                    this.onevent(packet);
                                    break;
                                case parser.ACK:
                                    this.onack(packet);
                                    break;
                                case parser.BINARY_ACK:
                                    this.onack(packet);
                                    break;
                                case parser.DISCONNECT:
                                    this.ondisconnect();
                                    break;
                                case parser.ERROR:
                                    this.emit("error", packet.data);
                                    break;
                            } }; Socket.prototype.onevent = function (packet) { var args = packet.data || []; debug("emitting event %j", args); if (null != packet.id) {
                                debug("attaching ack callback to event");
                                args.push(this.ack(packet.id));
                            } if (this.connected) {
                                emit.apply(this, args);
                            }
                            else {
                                this.receiveBuffer.push(args);
                            } }; Socket.prototype.ack = function (id) { var self = this; var sent = false; return function () { if (sent)
                                return; sent = true; var args = toArray(arguments); debug("sending ack %j", args); var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK; self.packet({ type: type, id: id, data: args }); }; }; Socket.prototype.onack = function (packet) { var ack = this.acks[packet.id]; if ("function" == typeof ack) {
                                debug("calling ack %s with %j", packet.id, packet.data);
                                ack.apply(this, packet.data);
                                delete this.acks[packet.id];
                            }
                            else {
                                debug("bad ack %s", packet.id);
                            } }; Socket.prototype.onconnect = function () { this.connected = true; this.disconnected = false; this.emit("connect"); this.emitBuffered(); }; Socket.prototype.emitBuffered = function () { var i; for (i = 0; i < this.receiveBuffer.length; i++) {
                                emit.apply(this, this.receiveBuffer[i]);
                            } this.receiveBuffer = []; for (i = 0; i < this.sendBuffer.length; i++) {
                                this.packet(this.sendBuffer[i]);
                            } this.sendBuffer = []; }; Socket.prototype.ondisconnect = function () { debug("server disconnect (%s)", this.nsp); this.destroy(); this.onclose("io server disconnect"); }; Socket.prototype.destroy = function () { if (this.subs) {
                                for (var i = 0; i < this.subs.length; i++) {
                                    this.subs[i].destroy();
                                }
                                this.subs = null;
                            } this.io.destroy(this); }; Socket.prototype.close = Socket.prototype.disconnect = function () { if (this.connected) {
                                debug("performing disconnect (%s)", this.nsp);
                                this.packet({ type: parser.DISCONNECT });
                            } this.destroy(); if (this.connected) {
                                this.onclose("io client disconnect");
                            } return this; }; Socket.prototype.compress = function (compress) { this.flags = this.flags || {}; this.flags.compress = compress; return this; }; }, { "./on": 33, "component-bind": 37, "component-emitter": 38, debug: 39, "has-binary": 41, "socket.io-parser": 47, "to-array": 51 }], 35: [function (_dereq_, module, exports) { (function (global) { var parseuri = _dereq_("parseuri"); var debug = _dereq_("debug")("socket.io-client:url"); module.exports = url; function url(uri, loc) { var obj = uri; var loc = loc || global.location; if (null == uri)
                                uri = loc.protocol + "//" + loc.host; if ("string" == typeof uri) {
                                if ("/" == uri.charAt(0)) {
                                    if ("/" == uri.charAt(1)) {
                                        uri = loc.protocol + uri;
                                    }
                                    else {
                                        uri = loc.host + uri;
                                    }
                                }
                                if (!/^(https?|wss?):\/\//.test(uri)) {
                                    debug("protocol-less url %s", uri);
                                    if ("undefined" != typeof loc) {
                                        uri = loc.protocol + "//" + uri;
                                    }
                                    else {
                                        uri = "https://" + uri;
                                    }
                                }
                                debug("parse %s", uri);
                                obj = parseuri(uri);
                            } if (!obj.port) {
                                if (/^(http|ws)$/.test(obj.protocol)) {
                                    obj.port = "80";
                                }
                                else if (/^(http|ws)s$/.test(obj.protocol)) {
                                    obj.port = "443";
                                }
                            } obj.path = obj.path || "/"; var ipv6 = obj.host.indexOf(":") !== -1; var host = ipv6 ? "[" + obj.host + "]" : obj.host; obj.id = obj.protocol + "://" + host + ":" + obj.port; obj.href = obj.protocol + "://" + host + (loc && loc.port == obj.port ? "" : ":" + obj.port); return obj; } }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { debug: 39, parseuri: 45 }], 36: [function (_dereq_, module, exports) { module.exports = Backoff; function Backoff(opts) { opts = opts || {}; this.ms = opts.min || 100; this.max = opts.max || 1e4; this.factor = opts.factor || 2; this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0; this.attempts = 0; } Backoff.prototype.duration = function () { var ms = this.ms * Math.pow(this.factor, this.attempts++); if (this.jitter) {
                                var rand = Math.random();
                                var deviation = Math.floor(rand * this.jitter * ms);
                                ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
                            } return Math.min(ms, this.max) | 0; }; Backoff.prototype.reset = function () { this.attempts = 0; }; Backoff.prototype.setMin = function (min) { this.ms = min; }; Backoff.prototype.setMax = function (max) { this.max = max; }; Backoff.prototype.setJitter = function (jitter) { this.jitter = jitter; }; }, {}], 37: [function (_dereq_, module, exports) { var slice = [].slice; module.exports = function (obj, fn) { if ("string" == typeof fn)
                                fn = obj[fn]; if ("function" != typeof fn)
                                throw new Error("bind() requires a function"); var args = slice.call(arguments, 2); return function () { return fn.apply(obj, args.concat(slice.call(arguments))); }; }; }, {}], 38: [function (_dereq_, module, exports) { module.exports = Emitter; function Emitter(obj) { if (obj)
                                return mixin(obj); } function mixin(obj) { for (var key in Emitter.prototype) {
                                obj[key] = Emitter.prototype[key];
                            } return obj; } Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) { this._callbacks = this._callbacks || {}; (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn); return this; }; Emitter.prototype.once = function (event, fn) { function on() { this.off(event, on); fn.apply(this, arguments); } on.fn = fn; this.on(event, on); return this; }; Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) { this._callbacks = this._callbacks || {}; if (0 == arguments.length) {
                                this._callbacks = {};
                                return this;
                            } var callbacks = this._callbacks["$" + event]; if (!callbacks)
                                return this; if (1 == arguments.length) {
                                delete this._callbacks["$" + event];
                                return this;
                            } var cb; for (var i = 0; i < callbacks.length; i++) {
                                cb = callbacks[i];
                                if (cb === fn || cb.fn === fn) {
                                    callbacks.splice(i, 1);
                                    break;
                                }
                            } return this; }; Emitter.prototype.emit = function (event) { this._callbacks = this._callbacks || {}; var args = [].slice.call(arguments, 1), callbacks = this._callbacks["$" + event]; if (callbacks) {
                                callbacks = callbacks.slice(0);
                                for (var i = 0, len = callbacks.length; i < len; ++i) {
                                    callbacks[i].apply(this, args);
                                }
                            } return this; }; Emitter.prototype.listeners = function (event) { this._callbacks = this._callbacks || {}; return this._callbacks["$" + event] || []; }; Emitter.prototype.hasListeners = function (event) { return !!this.listeners(event).length; }; }, {}], 39: [function (_dereq_, module, exports) { arguments[4][17][0].apply(exports, arguments); }, { "./debug": 40, dup: 17 }], 40: [function (_dereq_, module, exports) { arguments[4][18][0].apply(exports, arguments); }, { dup: 18, ms: 44 }], 41: [function (_dereq_, module, exports) { (function (global) { var isArray = _dereq_("isarray"); module.exports = hasBinary; function hasBinary(data) { function _hasBinary(obj) { if (!obj)
                                return false; if (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File) {
                                return true;
                            } if (isArray(obj)) {
                                for (var i = 0; i < obj.length; i++) {
                                    if (_hasBinary(obj[i])) {
                                        return true;
                                    }
                                }
                            }
                            else if (obj && "object" == typeof obj) {
                                if (obj.toJSON && "function" == typeof obj.toJSON) {
                                    obj = obj.toJSON();
                                }
                                for (var key in obj) {
                                    if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
                                        return true;
                                    }
                                }
                            } return false; } return _hasBinary(data); } }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { isarray: 43 }], 42: [function (_dereq_, module, exports) { arguments[4][23][0].apply(exports, arguments); }, { dup: 23 }], 43: [function (_dereq_, module, exports) { arguments[4][24][0].apply(exports, arguments); }, { dup: 24 }], 44: [function (_dereq_, module, exports) { arguments[4][25][0].apply(exports, arguments); }, { dup: 25 }], 45: [function (_dereq_, module, exports) { arguments[4][28][0].apply(exports, arguments); }, { dup: 28 }], 46: [function (_dereq_, module, exports) { (function (global) { var isArray = _dereq_("isarray"); var isBuf = _dereq_("./is-buffer"); exports.deconstructPacket = function (packet) { var buffers = []; var packetData = packet.data; function _deconstructPacket(data) { if (!data)
                                return data; if (isBuf(data)) {
                                var placeholder = { _placeholder: true, num: buffers.length };
                                buffers.push(data);
                                return placeholder;
                            }
                            else if (isArray(data)) {
                                var newData = new Array(data.length);
                                for (var i = 0; i < data.length; i++) {
                                    newData[i] = _deconstructPacket(data[i]);
                                }
                                return newData;
                            }
                            else if ("object" == typeof data && !(data instanceof Date)) {
                                var newData = {};
                                for (var key in data) {
                                    newData[key] = _deconstructPacket(data[key]);
                                }
                                return newData;
                            } return data; } var pack = packet; pack.data = _deconstructPacket(packetData); pack.attachments = buffers.length; return { packet: pack, buffers: buffers }; }; exports.reconstructPacket = function (packet, buffers) { var curPlaceHolder = 0; function _reconstructPacket(data) { if (data && data._placeholder) {
                                var buf = buffers[data.num];
                                return buf;
                            }
                            else if (isArray(data)) {
                                for (var i = 0; i < data.length; i++) {
                                    data[i] = _reconstructPacket(data[i]);
                                }
                                return data;
                            }
                            else if (data && "object" == typeof data) {
                                for (var key in data) {
                                    data[key] = _reconstructPacket(data[key]);
                                }
                                return data;
                            } return data; } packet.data = _reconstructPacket(packet.data); packet.attachments = undefined; return packet; }; exports.removeBlobs = function (data, callback) { function _removeBlobs(obj, curKey, containingObject) { if (!obj)
                                return obj; if (global.Blob && obj instanceof Blob || global.File && obj instanceof File) {
                                pendingBlobs++;
                                var fileReader = new FileReader;
                                fileReader.onload = function () { if (containingObject) {
                                    containingObject[curKey] = this.result;
                                }
                                else {
                                    bloblessData = this.result;
                                } if (!--pendingBlobs) {
                                    callback(bloblessData);
                                } };
                                fileReader.readAsArrayBuffer(obj);
                            }
                            else if (isArray(obj)) {
                                for (var i = 0; i < obj.length; i++) {
                                    _removeBlobs(obj[i], i, obj);
                                }
                            }
                            else if (obj && "object" == typeof obj && !isBuf(obj)) {
                                for (var key in obj) {
                                    _removeBlobs(obj[key], key, obj);
                                }
                            } } var pendingBlobs = 0; var bloblessData = data; _removeBlobs(bloblessData); if (!pendingBlobs) {
                                callback(bloblessData);
                            } }; }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, { "./is-buffer": 48, isarray: 43 }], 47: [function (_dereq_, module, exports) { var debug = _dereq_("debug")("socket.io-parser"); var json = _dereq_("json3"); var isArray = _dereq_("isarray"); var Emitter = _dereq_("component-emitter"); var binary = _dereq_("./binary"); var isBuf = _dereq_("./is-buffer"); exports.protocol = 4; exports.types = ["CONNECT", "DISCONNECT", "EVENT", "BINARY_EVENT", "ACK", "BINARY_ACK", "ERROR"]; exports.CONNECT = 0; exports.DISCONNECT = 1; exports.EVENT = 2; exports.ACK = 3; exports.ERROR = 4; exports.BINARY_EVENT = 5; exports.BINARY_ACK = 6; exports.Encoder = Encoder; exports.Decoder = Decoder; function Encoder() { } Encoder.prototype.encode = function (obj, callback) { debug("encoding packet %j", obj); if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
                                encodeAsBinary(obj, callback);
                            }
                            else {
                                var encoding = encodeAsString(obj);
                                callback([encoding]);
                            } }; function encodeAsString(obj) { var str = ""; var nsp = false; str += obj.type; if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
                                str += obj.attachments;
                                str += "-";
                            } if (obj.nsp && "/" != obj.nsp) {
                                nsp = true;
                                str += obj.nsp;
                            } if (null != obj.id) {
                                if (nsp) {
                                    str += ",";
                                    nsp = false;
                                }
                                str += obj.id;
                            } if (null != obj.data) {
                                if (nsp)
                                    str += ",";
                                str += json.stringify(obj.data);
                            } debug("encoded %j as %s", obj, str); return str; } function encodeAsBinary(obj, callback) { function writeEncoding(bloblessData) { var deconstruction = binary.deconstructPacket(bloblessData); var pack = encodeAsString(deconstruction.packet); var buffers = deconstruction.buffers; buffers.unshift(pack); callback(buffers); } binary.removeBlobs(obj, writeEncoding); } function Decoder() { this.reconstructor = null; } Emitter(Decoder.prototype); Decoder.prototype.add = function (obj) { var packet; if ("string" == typeof obj) {
                                packet = decodeString(obj);
                                if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) {
                                    this.reconstructor = new BinaryReconstructor(packet);
                                    if (this.reconstructor.reconPack.attachments === 0) {
                                        this.emit("decoded", packet);
                                    }
                                }
                                else {
                                    this.emit("decoded", packet);
                                }
                            }
                            else if (isBuf(obj) || obj.base64) {
                                if (!this.reconstructor) {
                                    throw new Error("got binary data when not reconstructing a packet");
                                }
                                else {
                                    packet = this.reconstructor.takeBinaryData(obj);
                                    if (packet) {
                                        this.reconstructor = null;
                                        this.emit("decoded", packet);
                                    }
                                }
                            }
                            else {
                                throw new Error("Unknown type: " + obj);
                            } }; function decodeString(str) { var p = {}; var i = 0; p.type = Number(str.charAt(0)); if (null == exports.types[p.type])
                                return error(); if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
                                var buf = "";
                                while (str.charAt(++i) != "-") {
                                    buf += str.charAt(i);
                                    if (i == str.length)
                                        break;
                                }
                                if (buf != Number(buf) || str.charAt(i) != "-") {
                                    throw new Error("Illegal attachments");
                                }
                                p.attachments = Number(buf);
                            } if ("/" == str.charAt(i + 1)) {
                                p.nsp = "";
                                while (++i) {
                                    var c = str.charAt(i);
                                    if ("," == c)
                                        break;
                                    p.nsp += c;
                                    if (i == str.length)
                                        break;
                                }
                            }
                            else {
                                p.nsp = "/";
                            } var next = str.charAt(i + 1); if ("" !== next && Number(next) == next) {
                                p.id = "";
                                while (++i) {
                                    var c = str.charAt(i);
                                    if (null == c || Number(c) != c) {
                                        --i;
                                        break;
                                    }
                                    p.id += str.charAt(i);
                                    if (i == str.length)
                                        break;
                                }
                                p.id = Number(p.id);
                            } if (str.charAt(++i)) {
                                try {
                                    p.data = json.parse(str.substr(i));
                                }
                                catch (e) {
                                    return error();
                                }
                            } debug("decoded %s as %j", str, p); return p; } Decoder.prototype.destroy = function () { if (this.reconstructor) {
                                this.reconstructor.finishedReconstruction();
                            } }; function BinaryReconstructor(packet) { this.reconPack = packet; this.buffers = []; } BinaryReconstructor.prototype.takeBinaryData = function (binData) { this.buffers.push(binData); if (this.buffers.length == this.reconPack.attachments) {
                                var packet = binary.reconstructPacket(this.reconPack, this.buffers);
                                this.finishedReconstruction();
                                return packet;
                            } return null; }; BinaryReconstructor.prototype.finishedReconstruction = function () { this.reconPack = null; this.buffers = []; }; function error(data) { return { type: exports.ERROR, data: "parser error" }; } }, { "./binary": 46, "./is-buffer": 48, "component-emitter": 49, debug: 39, isarray: 43, json3: 50 }], 48: [function (_dereq_, module, exports) { (function (global) { module.exports = isBuf; function isBuf(obj) { return global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer; } }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {}); }, {}], 49: [function (_dereq_, module, exports) { arguments[4][15][0].apply(exports, arguments); }, { dup: 15 }], 50: [function (_dereq_, module, exports) {
                                (function (global) {
                                    (function () {
                                        var isLoader = typeof define === "function" && define.amd;
                                        var objectTypes = { "function": true, object: true };
                                        var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
                                        var root = objectTypes[typeof window] && window || this, freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;
                                        if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
                                            root = freeGlobal;
                                        }
                                        function runInContext(context, exports) {
                                            context || (context = root["Object"]());
                                            exports || (exports = root["Object"]());
                                            var Number = context["Number"] || root["Number"], String = context["String"] || root["String"], Object = context["Object"] || root["Object"], Date = context["Date"] || root["Date"], SyntaxError = context["SyntaxError"] || root["SyntaxError"], TypeError = context["TypeError"] || root["TypeError"], Math = context["Math"] || root["Math"], nativeJSON = context["JSON"] || root["JSON"];
                                            if (typeof nativeJSON == "object" && nativeJSON) {
                                                exports.stringify = nativeJSON.stringify;
                                                exports.parse = nativeJSON.parse;
                                            }
                                            var objectProto = Object.prototype, getClass = objectProto.toString, isProperty, forEach, undef;
                                            var isExtended = new Date(-0xc782b5b800cec);
                                            try {
                                                isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 && isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
                                            }
                                            catch (exception) { }
                                            function has(name) { if (has[name] !== undef) {
                                                return has[name];
                                            } var isSupported; if (name == "bug-string-char-index") {
                                                isSupported = "a"[0] != "a";
                                            }
                                            else if (name == "json") {
                                                isSupported = has("json-stringify") && has("json-parse");
                                            }
                                            else {
                                                var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                                                if (name == "json-stringify") {
                                                    var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
                                                    if (stringifySupported) {
                                                        (value = function () { return 1; }).toJSON = value;
                                                        try {
                                                            stringifySupported = stringify(0) === "0" && stringify(new Number) === "0" && stringify(new String) == '""' && stringify(getClass) === undef && stringify(undef) === undef && stringify() === undef && stringify(value) === "1" && stringify([value]) == "[1]" && stringify([undef]) == "[null]" && stringify(null) == "null" && stringify([undef, getClass, null]) == "[null,null,null]" && stringify({ a: [value, true, false, null, "\x00\b\n\f\r	"] }) == serialized && stringify(null, value) === "1" && stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" && stringify(new Date(-864e13)) == '"-271821-04-20T00:00:00.000Z"' && stringify(new Date(864e13)) == '"+275760-09-13T00:00:00.000Z"' && stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' && stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
                                                        }
                                                        catch (exception) {
                                                            stringifySupported = false;
                                                        }
                                                    }
                                                    isSupported = stringifySupported;
                                                }
                                                if (name == "json-parse") {
                                                    var parse = exports.parse;
                                                    if (typeof parse == "function") {
                                                        try {
                                                            if (parse("0") === 0 && !parse(false)) {
                                                                value = parse(serialized);
                                                                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                                                                if (parseSupported) {
                                                                    try {
                                                                        parseSupported = !parse('"	"');
                                                                    }
                                                                    catch (exception) { }
                                                                    if (parseSupported) {
                                                                        try {
                                                                            parseSupported = parse("01") !== 1;
                                                                        }
                                                                        catch (exception) { }
                                                                    }
                                                                    if (parseSupported) {
                                                                        try {
                                                                            parseSupported = parse("1.") !== 1;
                                                                        }
                                                                        catch (exception) { }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        catch (exception) {
                                                            parseSupported = false;
                                                        }
                                                    }
                                                    isSupported = parseSupported;
                                                }
                                            } return has[name] = !!isSupported; }
                                            if (!has("json")) {
                                                var functionClass = "[object Function]", dateClass = "[object Date]", numberClass = "[object Number]", stringClass = "[object String]", arrayClass = "[object Array]", booleanClass = "[object Boolean]";
                                                var charIndexBuggy = has("bug-string-char-index");
                                                if (!isExtended) {
                                                    var floor = Math.floor;
                                                    var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
                                                    var getDay = function (year, month) { return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400); };
                                                }
                                                if (!(isProperty = objectProto.hasOwnProperty)) {
                                                    isProperty = function (property) { var members = {}, constructor; if ((members.__proto__ = null, members.__proto__ = { toString: 1 }, members).toString != getClass) {
                                                        isProperty = function (property) { var original = this.__proto__, result = property in (this.__proto__ = null, this); this.__proto__ = original; return result; };
                                                    }
                                                    else {
                                                        constructor = members.constructor;
                                                        isProperty = function (property) { var parent = (this.constructor || constructor).prototype; return property in this && !(property in parent && this[property] === parent[property]); };
                                                    } members = null; return isProperty.call(this, property); };
                                                }
                                                forEach = function (object, callback) { var size = 0, Properties, members, property; (Properties = function () { this.valueOf = 0; }).prototype.valueOf = 0; members = new Properties; for (property in members) {
                                                    if (isProperty.call(members, property)) {
                                                        size++;
                                                    }
                                                } Properties = members = null; if (!size) {
                                                    members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
                                                    forEach = function (object, callback) { var isFunction = getClass.call(object) == functionClass, property, length; var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty; for (property in object) {
                                                        if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                                                            callback(property);
                                                        }
                                                    } for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property))
                                                        ; };
                                                }
                                                else if (size == 2) {
                                                    forEach = function (object, callback) { var members = {}, isFunction = getClass.call(object) == functionClass, property; for (property in object) {
                                                        if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                                                            callback(property);
                                                        }
                                                    } };
                                                }
                                                else {
                                                    forEach = function (object, callback) { var isFunction = getClass.call(object) == functionClass, property, isConstructor; for (property in object) {
                                                        if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                                                            callback(property);
                                                        }
                                                    } if (isConstructor || isProperty.call(object, property = "constructor")) {
                                                        callback(property);
                                                    } };
                                                } return forEach(object, callback); };
                                                if (!has("json-stringify")) {
                                                    var Escapes = { 92: "\\\\", 34: '\\"', 8: "\\b", 12: "\\f", 10: "\\n", 13: "\\r", 9: "\\t" };
                                                    var leadingZeroes = "000000";
                                                    var toPaddedString = function (width, value) { return (leadingZeroes + (value || 0)).slice(-width); };
                                                    var unicodePrefix = "\\u00";
                                                    var quote = function (value) { var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10; var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value); for (; index < length; index++) {
                                                        var charCode = value.charCodeAt(index);
                                                        switch (charCode) {
                                                            case 8:
                                                            case 9:
                                                            case 10:
                                                            case 12:
                                                            case 13:
                                                            case 34:
                                                            case 92:
                                                                result += Escapes[charCode];
                                                                break;
                                                            default:
                                                                if (charCode < 32) {
                                                                    result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                                                                    break;
                                                                }
                                                                result += useCharIndex ? symbols[index] : value.charAt(index);
                                                        }
                                                    } return result + '"'; };
                                                    var serialize = function (property, object, callback, properties, whitespace, indentation, stack) { var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result; try {
                                                        value = object[property];
                                                    }
                                                    catch (exception) { } if (typeof value == "object" && value) {
                                                        className = getClass.call(value);
                                                        if (className == dateClass && !isProperty.call(value, "toJSON")) {
                                                            if (value > -1 / 0 && value < 1 / 0) {
                                                                if (getDay) {
                                                                    date = floor(value / 864e5);
                                                                    for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++)
                                                                        ;
                                                                    for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++)
                                                                        ;
                                                                    date = 1 + date - getDay(year, month);
                                                                    time = (value % 864e5 + 864e5) % 864e5;
                                                                    hours = floor(time / 36e5) % 24;
                                                                    minutes = floor(time / 6e4) % 60;
                                                                    seconds = floor(time / 1e3) % 60;
                                                                    milliseconds = time % 1e3;
                                                                }
                                                                else {
                                                                    year = value.getUTCFullYear();
                                                                    month = value.getUTCMonth();
                                                                    date = value.getUTCDate();
                                                                    hours = value.getUTCHours();
                                                                    minutes = value.getUTCMinutes();
                                                                    seconds = value.getUTCSeconds();
                                                                    milliseconds = value.getUTCMilliseconds();
                                                                }
                                                                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) + "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) + "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) + "." + toPaddedString(3, milliseconds) + "Z";
                                                            }
                                                            else {
                                                                value = null;
                                                            }
                                                        }
                                                        else if (typeof value.toJSON == "function" && (className != numberClass && className != stringClass && className != arrayClass || isProperty.call(value, "toJSON"))) {
                                                            value = value.toJSON(property);
                                                        }
                                                    } if (callback) {
                                                        value = callback.call(object, property, value);
                                                    } if (value === null) {
                                                        return "null";
                                                    } className = getClass.call(value); if (className == booleanClass) {
                                                        return "" + value;
                                                    }
                                                    else if (className == numberClass) {
                                                        return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
                                                    }
                                                    else if (className == stringClass) {
                                                        return quote("" + value);
                                                    } if (typeof value == "object") {
                                                        for (length = stack.length; length--;) {
                                                            if (stack[length] === value) {
                                                                throw TypeError();
                                                            }
                                                        }
                                                        stack.push(value);
                                                        results = [];
                                                        prefix = indentation;
                                                        indentation += whitespace;
                                                        if (className == arrayClass) {
                                                            for (index = 0, length = value.length; index < length; index++) {
                                                                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                                                                results.push(element === undef ? "null" : element);
                                                            }
                                                            result = results.length ? whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : "[" + results.join(",") + "]" : "[]";
                                                        }
                                                        else {
                                                            forEach(properties || value, function (property) { var element = serialize(property, value, callback, properties, whitespace, indentation, stack); if (element !== undef) {
                                                                results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                                                            } });
                                                            result = results.length ? whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : "{" + results.join(",") + "}" : "{}";
                                                        }
                                                        stack.pop();
                                                        return result;
                                                    } };
                                                    exports.stringify = function (source, filter, width) { var whitespace, callback, properties, className; if (objectTypes[typeof filter] && filter) {
                                                        if ((className = getClass.call(filter)) == functionClass) {
                                                            callback = filter;
                                                        }
                                                        else if (className == arrayClass) {
                                                            properties = {};
                                                            for (var index = 0, length = filter.length, value; index < length; value = filter[index++], (className = getClass.call(value), className == stringClass || className == numberClass) && (properties[value] = 1))
                                                                ;
                                                        }
                                                    } if (width) {
                                                        if ((className = getClass.call(width)) == numberClass) {
                                                            if ((width -= width % 1) > 0) {
                                                                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ")
                                                                    ;
                                                            }
                                                        }
                                                        else if (className == stringClass) {
                                                            whitespace = width.length <= 10 ? width : width.slice(0, 10);
                                                        }
                                                    } return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []); };
                                                }
                                                if (!has("json-parse")) {
                                                    var fromCharCode = String.fromCharCode;
                                                    var Unescapes = { 92: "\\", 34: '"', 47: "/", 98: "\b", 116: "	", 110: "\n", 102: "\f", 114: "\r" };
                                                    var Index, Source;
                                                    var abort = function () { Index = Source = null; throw SyntaxError(); };
                                                    var lex = function () { var source = Source, length = source.length, value, begin, position, isSigned, charCode; while (Index < length) {
                                                        charCode = source.charCodeAt(Index);
                                                        switch (charCode) {
                                                            case 9:
                                                            case 10:
                                                            case 13:
                                                            case 32:
                                                                Index++;
                                                                break;
                                                            case 123:
                                                            case 125:
                                                            case 91:
                                                            case 93:
                                                            case 58:
                                                            case 44:
                                                                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                                                                Index++;
                                                                return value;
                                                            case 34:
                                                                for (value = "@", Index++; Index < length;) {
                                                                    charCode = source.charCodeAt(Index);
                                                                    if (charCode < 32) {
                                                                        abort();
                                                                    }
                                                                    else if (charCode == 92) {
                                                                        charCode = source.charCodeAt(++Index);
                                                                        switch (charCode) {
                                                                            case 92:
                                                                            case 34:
                                                                            case 47:
                                                                            case 98:
                                                                            case 116:
                                                                            case 110:
                                                                            case 102:
                                                                            case 114:
                                                                                value += Unescapes[charCode];
                                                                                Index++;
                                                                                break;
                                                                            case 117:
                                                                                begin = ++Index;
                                                                                for (position = Index + 4; Index < position; Index++) {
                                                                                    charCode = source.charCodeAt(Index);
                                                                                    if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                                                                                        abort();
                                                                                    }
                                                                                }
                                                                                value += fromCharCode("0x" + source.slice(begin, Index));
                                                                                break;
                                                                            default: abort();
                                                                        }
                                                                    }
                                                                    else {
                                                                        if (charCode == 34) {
                                                                            break;
                                                                        }
                                                                        charCode = source.charCodeAt(Index);
                                                                        begin = Index;
                                                                        while (charCode >= 32 && charCode != 92 && charCode != 34) {
                                                                            charCode = source.charCodeAt(++Index);
                                                                        }
                                                                        value += source.slice(begin, Index);
                                                                    }
                                                                }
                                                                if (source.charCodeAt(Index) == 34) {
                                                                    Index++;
                                                                    return value;
                                                                }
                                                                abort();
                                                            default:
                                                                begin = Index;
                                                                if (charCode == 45) {
                                                                    isSigned = true;
                                                                    charCode = source.charCodeAt(++Index);
                                                                }
                                                                if (charCode >= 48 && charCode <= 57) {
                                                                    if (charCode == 48 && (charCode = source.charCodeAt(Index + 1), charCode >= 48 && charCode <= 57)) {
                                                                        abort();
                                                                    }
                                                                    isSigned = false;
                                                                    for (; Index < length && (charCode = source.charCodeAt(Index), charCode >= 48 && charCode <= 57); Index++)
                                                                        ;
                                                                    if (source.charCodeAt(Index) == 46) {
                                                                        position = ++Index;
                                                                        for (; position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++)
                                                                            ;
                                                                        if (position == Index) {
                                                                            abort();
                                                                        }
                                                                        Index = position;
                                                                    }
                                                                    charCode = source.charCodeAt(Index);
                                                                    if (charCode == 101 || charCode == 69) {
                                                                        charCode = source.charCodeAt(++Index);
                                                                        if (charCode == 43 || charCode == 45) {
                                                                            Index++;
                                                                        }
                                                                        for (position = Index; position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++)
                                                                            ;
                                                                        if (position == Index) {
                                                                            abort();
                                                                        }
                                                                        Index = position;
                                                                    }
                                                                    return +source.slice(begin, Index);
                                                                }
                                                                if (isSigned) {
                                                                    abort();
                                                                }
                                                                if (source.slice(Index, Index + 4) == "true") {
                                                                    Index += 4;
                                                                    return true;
                                                                }
                                                                else if (source.slice(Index, Index + 5) == "false") {
                                                                    Index += 5;
                                                                    return false;
                                                                }
                                                                else if (source.slice(Index, Index + 4) == "null") {
                                                                    Index += 4;
                                                                    return null;
                                                                }
                                                                abort();
                                                        }
                                                    } return "$"; };
                                                    var get = function (value) {
                                                        var results, hasMembers;
                                                        if (value == "$") {
                                                            abort();
                                                        }
                                                        if (typeof value == "string") {
                                                            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
                                                                return value.slice(1);
                                                            }
                                                            if (value == "[") {
                                                                results = [];
                                                                for (;; hasMembers || (hasMembers = true)) {
                                                                    value = lex();
                                                                    if (value == "]") {
                                                                        break;
                                                                    }
                                                                    if (hasMembers) {
                                                                        if (value == ",") {
                                                                            value = lex();
                                                                            if (value == "]") {
                                                                                abort();
                                                                            }
                                                                        }
                                                                        else {
                                                                            abort();
                                                                        }
                                                                    }
                                                                    if (value == ",") {
                                                                        abort();
                                                                    }
                                                                    results.push(get(value));
                                                                }
                                                                return results;
                                                            }
                                                            else if (value == "{") {
                                                                results = {};
                                                                for (;; hasMembers || (hasMembers = true)) {
                                                                    value = lex();
                                                                    if (value == "}") {
                                                                        break;
                                                                    }
                                                                    if (hasMembers) {
                                                                        if (value == ",") {
                                                                            value = lex();
                                                                            if (value == "}") {
                                                                                abort();
                                                                            }
                                                                        }
                                                                        else {
                                                                            abort();
                                                                        }
                                                                    }
                                                                    if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                                                                        abort();
                                                                    }
                                                                    results[value.slice(1)] = get(lex());
                                                                }
                                                                return results;
                                                            }
                                                            abort();
                                                        }
                                                        return value;
                                                    };
                                                    var update = function (source, property, callback) { var element = walk(source, property, callback); if (element === undef) {
                                                        delete source[property];
                                                    }
                                                    else {
                                                        source[property] = element;
                                                    } };
                                                    var walk = function (source, property, callback) { var value = source[property], length; if (typeof value == "object" && value) {
                                                        if (getClass.call(value) == arrayClass) {
                                                            for (length = value.length; length--;) {
                                                                update(value, length, callback);
                                                            }
                                                        }
                                                        else {
                                                            forEach(value, function (property) { update(value, property, callback); });
                                                        }
                                                    } return callback.call(source, property, value); };
                                                    exports.parse = function (source, callback) { var result, value; Index = 0; Source = "" + source; result = get(lex()); if (lex() != "$") {
                                                        abort();
                                                    } Index = Source = null; return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result; };
                                                }
                                            }
                                            exports["runInContext"] = runInContext;
                                            return exports;
                                        }
                                        if (freeExports && !isLoader) {
                                            runInContext(root, freeExports);
                                        }
                                        else {
                                            var nativeJSON = root.JSON, previousJSON = root["JSON3"], isRestored = false;
                                            var JSON3 = runInContext(root, root["JSON3"] = { noConflict: function () { if (!isRestored) {
                                                    isRestored = true;
                                                    root.JSON = nativeJSON;
                                                    root["JSON3"] = previousJSON;
                                                    nativeJSON = previousJSON = null;
                                                } return JSON3; } });
                                            root.JSON = { parse: JSON3.parse, stringify: JSON3.stringify };
                                        }
                                        if (isLoader) {
                                            define(function () { return JSON3; });
                                        }
                                    }).call(this);
                                }).call(this, typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
                            }, {}], 51: [function (_dereq_, module, exports) { module.exports = toArray; function toArray(list, index) { var array = []; index = index || 0; for (var i = index || 0; i < list.length; i++) {
                                array[i - index] = list[i];
                            } return array; } }, {}] }, {}, [31])(31);
                });
            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
        }, {}], "telemetry-helper": [function (require, module, exports) {
            var clientSocket;
            var serviceToPluginMap;
            var pendingTelemetryEvents = [];
            function init(socket) {
                clientSocket = socket;
                trySendPendingEvents();
            }
            function registerPluginServices(pluginServices) {
                serviceToPluginMap = pluginServices;
                trySendPendingEvents();
            }
            function trySendPendingEvents() {
                if (!clientSocket) {
                    return;
                }
                var unsent = [];
                pendingTelemetryEvents.forEach(function (eventData) {
                    if (mustMapServiceToPlugin(eventData) && !serviceToPluginMap) {
                        unsent.push(eventData);
                    }
                    else {
                        sendClientTelemetry(eventData);
                    }
                });
                pendingTelemetryEvents = unsent;
            }
            function mustMapServiceToPlugin(eventData) {
                return !!eventData.props.service && !eventData.plugin;
            }
            function sendClientTelemetry(event, props, piiProps) {
                var eventData = {
                    event: event,
                    props: props,
                    piiProps: piiProps
                };
                if (!clientSocket) {
                    pendingTelemetryEvents.push(eventData);
                    return;
                }
                if (mustMapServiceToPlugin(eventData)) {
                    if (!serviceToPluginMap) {
                        pendingTelemetryEvents.push(eventData);
                        return;
                    }
                    eventData.props.plugin = serviceToPluginMap[eventData.props.service] || '_unknown';
                }
                clientSocket.emit('telemetry', eventData);
            }
            function sendUITelemetry(uiControlData) {
                sendClientTelemetry('plugin-ui-interaction', uiControlData);
            }
            module.exports.init = init;
            module.exports.registerPluginServices = registerPluginServices;
            module.exports.sendClientTelemetry = sendClientTelemetry;
            module.exports.sendUITelemetry = sendUITelemetry;
        }, {}], "utils": [function (require, module, exports) {
            var self, exception = require('exception');
            self = module.exports = {
                validateArgumentType: function (arg, argType, customExceptionType, customExceptionMessage, customExceptionObject) {
                    var invalidArg = false, msg;
                    switch (argType) {
                        case 'array':
                            if (!(arg instanceof Array)) {
                                invalidArg = true;
                            }
                            break;
                        case 'date':
                            if (!(arg instanceof Date)) {
                                invalidArg = true;
                            }
                            break;
                        case 'integer':
                            if (typeof arg === 'number') {
                                if (arg !== Math.floor(arg)) {
                                    invalidArg = true;
                                }
                            }
                            else {
                                invalidArg = true;
                            }
                            break;
                        default:
                            if (typeof arg !== argType) {
                                invalidArg = true;
                            }
                            break;
                    }
                    if (invalidArg) {
                        msg = customExceptionMessage + ('\n\nInvalid Argument type. argument: ' + arg + ' ==> was expected to be of type: ' + argType);
                        exception.raise((customExceptionType || exception.types.ArgumentType), msg, customExceptionObject);
                    }
                },
                forEach: function (obj, action, scope) {
                    if (obj instanceof Array) {
                        return obj.forEach(action, scope);
                    }
                    else {
                        self.map(obj, action, scope);
                    }
                },
                map: function (obj, func, scope) {
                    var i, returnVal = null, result = [];
                    if (window.MozNamedAttrMap) {
                        NamedNodeMap = window.MozNamedAttrMap;
                    }
                    if (obj instanceof Array) {
                        return obj.map(func, scope);
                    }
                    else if (obj instanceof NamedNodeMap) {
                        for (i = 0; i < obj.length; i++) {
                            returnVal = func.apply(scope, [obj[i], i]);
                            result.push(returnVal);
                        }
                    }
                    else {
                        for (i in obj) {
                            if (obj.hasOwnProperty(i)) {
                                returnVal = func.apply(scope, [obj[i], i]);
                                result.push(returnVal);
                            }
                        }
                    }
                    return result;
                },
                bindAutoSaveEvent: function (selector, saveCallback) {
                    var oldSetTimeoutId;
                    var node = document.querySelector(selector);
                    if (!node) {
                        console.log('AUTO SAVE: REINSTATE ONCE WE HAVE ' + selector + ' ELEMENT');
                        return;
                    }
                    node.addEventListener('keyup', function (event) {
                        if (event.keyCode !== 9) {
                            clearTimeout(oldSetTimeoutId);
                            oldSetTimeoutId = window.setTimeout(function () {
                                saveCallback();
                            }, 500);
                        }
                    });
                },
                mixin: function (mixin, to) {
                    for (var prop in mixin) {
                        if (Object.hasOwnProperty.call(mixin, prop)) {
                            to[prop] = mixin[prop];
                        }
                    }
                },
                copy: function (obj) {
                    var i, newObj = Array.isArray(obj) ? [] : {};
                    if (typeof obj === 'number' ||
                        typeof obj === 'string' ||
                        typeof obj === 'boolean' ||
                        obj === null ||
                        obj === undefined) {
                        return obj;
                    }
                    if (obj instanceof Date) {
                        return new Date(obj);
                    }
                    if (obj instanceof RegExp) {
                        return new RegExp(obj);
                    }
                    for (i in obj) {
                        if (obj.hasOwnProperty(i)) {
                            if (obj[i] && typeof obj[i] === 'object') {
                                if (obj[i] instanceof Date) {
                                    newObj[i] = obj[i];
                                }
                                else {
                                    newObj[i] = self.copy(obj[i]);
                                }
                            }
                            else {
                                newObj[i] = obj[i];
                            }
                        }
                    }
                    return newObj;
                },
                navHelper: function () {
                    return {
                        Directions: {
                            N: 'N',
                            NE: 'NE',
                            E: 'E',
                            SE: 'SE',
                            S: 'S',
                            SW: 'SW',
                            W: 'W',
                            NW: 'NW'
                        },
                        getDirection: function (heading) {
                            if (heading > 337.5 || (heading >= 0 && heading <= 22.5)) {
                                return this.Directions.N;
                            }
                            if (heading > 22.5 && heading <= 67.5) {
                                return this.Directions.NE;
                            }
                            if (heading > 67.5 && heading <= 112.5) {
                                return this.Directions.E;
                            }
                            if (heading > 112.5 && heading <= 157.5) {
                                return this.Directions.SE;
                            }
                            if (heading > 157.5 && heading <= 202.5) {
                                return this.Directions.S;
                            }
                            if (heading > 202.5 && heading <= 247.5) {
                                return this.Directions.SW;
                            }
                            if (heading > 247.5 && heading <= 292.5) {
                                return this.Directions.W;
                            }
                            return this.Directions.NW;
                        },
                        getHeading: function (lat1, lon1, lat2, lon2) {
                            var dLon = this.rad(lon2 - lon1), llat1 = this.rad(lat1), llat2 = this.rad(lat2), y = Math.sin(dLon) * Math.cos(llat2), x = Math.cos(llat1) * Math.sin(llat2) - Math.sin(llat1) * Math.cos(llat2) * Math.cos(dLon);
                            return (this.deg(Math.atan2(y, x)) + 360) % 360;
                        },
                        getDistance: function (lat1, lon1, lat2, lon2) {
                            var dLat = this.rad(lat2 - lat1), dLon = this.rad(lon2 - lon1), a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.rad(lat1)) * Math.cos(this.rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2), c = 2 * Math.asin(Math.sqrt(a)), d = 6378100 * c;
                            return d;
                        },
                        simulateTravel: function (lat, lon, hdg, dist) {
                            var lat1 = this.rad(lat), lon1 = this.rad(lon), brng = this.rad(hdg), angularDistance = dist / 6378100, lat2 = Math.asin(Math.sin(lat1) * Math.cos(angularDistance) + Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(brng)), lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(angularDistance) * Math.cos(lat1), Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2));
                            lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
                            return {
                                latitude: this.deg(lat2),
                                longitude: this.deg(lon2)
                            };
                        },
                        deg: function (num) {
                            return num * 180 / Math.PI;
                        },
                        rad: function (num) {
                            return num * Math.PI / 180;
                        }
                    };
                },
                createUUID: function () {
                    return createUUIDPart(4) + '-' +
                        createUUIDPart(2) + '-' +
                        createUUIDPart(2) + '-' +
                        createUUIDPart(2) + '-' +
                        createUUIDPart(6);
                },
                typeName: function (val) {
                    return Object.prototype.toString.call(val).slice(8, -1);
                },
                parseUrl: function (url) {
                    var a = document.createElement('a');
                    a.href = url;
                    return {
                        href: a.href,
                        host: a.host,
                        origin: a.origin,
                        port: a.port,
                        protocol: a.protocol,
                        search: a.search
                    };
                },
                isSameOriginRequest: function (url) {
                    url = this.parseUrl(url);
                    if (url.port !== location.port) {
                        return false;
                    }
                    var sameOrigin = url.href.match(location.origin.replace(/www\./, '')) ||
                        !url.href.match(/^https?:\/\/|^file:\/\//);
                    return !!sameOrigin;
                },
                isNumber: function (value) {
                    var type = typeof value;
                    return (type === 'number' || type === 'string') && !isNaN(value - parseFloat(value));
                }
            };
            function createUUIDPart(length) {
                var uuidpart = '';
                for (var i = 0; i < length; i++) {
                    var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
                    if (uuidchar.length == 1) {
                        uuidchar = '0' + uuidchar;
                    }
                    uuidpart += uuidchar;
                }
                return uuidpart;
            }
        }, { "exception": "exception" }], "webcomponents.min": [function (require, module, exports) {
            !function () { window.WebComponents = window.WebComponents || { flags: {} }; var e = "webcomponents.js", t = document.querySelector('script[src*="' + e + '"]'), n = {}; if (!n.noOpts) {
                if (location.search.slice(1).split("&").forEach(function (e) { var t, r = e.split("="); r[0] && (t = r[0].match(/wc-(.+)/)) && (n[t[1]] = r[1] || !0); }), t)
                    for (var r, o = 0; r = t.attributes[o]; o++)
                        "src" !== r.name && (n[r.name] = r.value || !0);
                if (n.log && n.log.split) {
                    var i = n.log.split(",");
                    n.log = {}, i.forEach(function (e) { n.log[e] = !0; });
                }
                else
                    n.log = {};
            } n.shadow = n.shadow || n.shadowdom || n.polyfill, "native" === n.shadow ? n.shadow = !1 : n.shadow = n.shadow || !HTMLElement.prototype.createShadowRoot, n.register && (window.CustomElements = window.CustomElements || { flags: {} }, window.CustomElements.flags.register = n.register), WebComponents.flags = n; }(), WebComponents.flags.shadow && ("undefined" == typeof WeakMap && !function () { var e = Object.defineProperty, t = Date.now() % 1e9, n = function () { this.name = "__st" + (1e9 * Math.random() >>> 0) + (t++ + "__"); }; n.prototype = { set: function (t, n) { var r = t[this.name]; return r && r[0] === t ? r[1] = n : e(t, this.name, { value: [t, n], writable: !0 }), this; }, get: function (e) { var t; return (t = e[this.name]) && t[0] === e ? t[1] : void 0; }, "delete": function (e) { var t = e[this.name]; return t && t[0] === e ? (t[0] = t[1] = void 0, !0) : !1; }, has: function (e) { var t = e[this.name]; return t ? t[0] === e : !1; } }, window.WeakMap = n; }(), window.ShadowDOMPolyfill = {}, function (e) {
                "use strict";
                function t() { if ("undefined" != typeof chrome && chrome.app && chrome.app.runtime)
                    return !1; if (navigator.getDeviceStorage)
                    return !1; try {
                    var e = new Function("return true;");
                    return e();
                }
                catch (t) {
                    return !1;
                } }
                function n(e) { if (!e)
                    throw new Error("Assertion failed"); }
                function r(e, t) { for (var n = W(t), r = 0; r < n.length; r++) {
                    var o = n[r];
                    A(e, o, F(t, o));
                } return e; }
                function o(e, t) { for (var n = W(t), r = 0; r < n.length; r++) {
                    var o = n[r];
                    switch (o) {
                        case "arguments":
                        case "caller":
                        case "length":
                        case "name":
                        case "prototype":
                        case "toString": continue;
                    }
                    A(e, o, F(t, o));
                } return e; }
                function i(e, t) { for (var n = 0; n < t.length; n++)
                    if (t[n] in e)
                        return t[n]; }
                function a(e, t, n) { U.value = n, A(e, t, U); }
                function s(e, t) { var n = e.__proto__ || Object.getPrototypeOf(e); if (q)
                    try {
                        W(n);
                    }
                    catch (r) {
                        n = n.__proto__;
                    } var o = R.get(n); if (o)
                    return o; var i = s(n), a = E(i); return g(n, a, t), a; }
                function c(e, t) { w(e, t, !0); }
                function l(e, t) { w(t, e, !1); }
                function u(e) { return /^on[a-z]+$/.test(e); }
                function d(e) { return /^[a-zA-Z_$][a-zA-Z_$0-9]*$/.test(e); }
                function p(e) { return k && d(e) ? new Function("return this.__impl4cf1e782hg__." + e) : function () { return this.__impl4cf1e782hg__[e]; }; }
                function h(e) { return k && d(e) ? new Function("v", "this.__impl4cf1e782hg__." + e + " = v") : function (t) { this.__impl4cf1e782hg__[e] = t; }; }
                function f(e) { return k && d(e) ? new Function("return this.__impl4cf1e782hg__." + e + ".apply(this.__impl4cf1e782hg__, arguments)") : function () { return this.__impl4cf1e782hg__[e].apply(this.__impl4cf1e782hg__, arguments); }; }
                function m(e, t) { try {
                    return Object.getOwnPropertyDescriptor(e, t);
                }
                catch (n) {
                    return B;
                } }
                function w(t, n, r, o) { for (var i = W(t), a = 0; a < i.length; a++) {
                    var s = i[a];
                    if ("polymerBlackList_" !== s && !(s in n || t.polymerBlackList_ && t.polymerBlackList_[s])) {
                        q && t.__lookupGetter__(s);
                        var c, l, d = m(t, s);
                        if ("function" != typeof d.value) {
                            var w = u(s);
                            c = w ? e.getEventHandlerGetter(s) : p(s), (d.writable || d.set || V) && (l = w ? e.getEventHandlerSetter(s) : h(s));
                            var v = V || d.configurable;
                            A(n, s, { get: c, set: l, configurable: v, enumerable: d.enumerable });
                        }
                        else
                            r && (n[s] = f(s));
                    }
                } }
                function v(e, t, n) { if (null != e) {
                    var r = e.prototype;
                    g(r, t, n), o(t, e);
                } }
                function g(e, t, r) { var o = t.prototype; n(void 0 === R.get(e)), R.set(e, t), I.set(o, e), c(e, o), r && l(o, r), a(o, "constructor", t), t.prototype = o; }
                function b(e, t) { return R.get(t.prototype) === e; }
                function y(e) { var t = Object.getPrototypeOf(e), n = s(t), r = E(n); return g(t, r, e), r; }
                function E(e) { function t(t) { e.call(this, t); } var n = Object.create(e.prototype); return n.constructor = t, t.prototype = n, t; }
                function _(e) { return e && e.__impl4cf1e782hg__; }
                function S(e) { return !_(e); }
                function T(e) { if (null === e)
                    return null; n(S(e)); var t = e.__wrapper8e3dd93a60__; return null != t ? t : e.__wrapper8e3dd93a60__ = new (s(e, e))(e); }
                function M(e) { return null === e ? null : (n(_(e)), e.__impl4cf1e782hg__); }
                function O(e) { return e.__impl4cf1e782hg__; }
                function L(e, t) { t.__impl4cf1e782hg__ = e, e.__wrapper8e3dd93a60__ = t; }
                function N(e) { return e && _(e) ? M(e) : e; }
                function C(e) { return e && !_(e) ? T(e) : e; }
                function j(e, t) { null !== t && (n(S(e)), n(void 0 === t || _(t)), e.__wrapper8e3dd93a60__ = t); }
                function D(e, t, n) { G.get = n, A(e.prototype, t, G); }
                function H(e, t) { D(e, t, function () { return T(this.__impl4cf1e782hg__[t]); }); }
                function x(e, t) { e.forEach(function (e) { t.forEach(function (t) { e.prototype[t] = function () { var e = C(this); return e[t].apply(e, arguments); }; }); }); }
                var R = new WeakMap, I = new WeakMap, P = Object.create(null), k = t(), A = Object.defineProperty, W = Object.getOwnPropertyNames, F = Object.getOwnPropertyDescriptor, U = { value: void 0, configurable: !0, enumerable: !1, writable: !0 };
                W(window);
                var q = /Firefox/.test(navigator.userAgent), B = { get: function () { }, set: function (e) { }, configurable: !0, enumerable: !0 }, V = function () { var e = Object.getOwnPropertyDescriptor(Node.prototype, "nodeType"); return e && !e.get && !e.set; }(), G = { get: void 0, configurable: !0, enumerable: !0 };
                e.addForwardingProperties = c, e.assert = n, e.constructorTable = R, e.defineGetter = D, e.defineWrapGetter = H, e.forwardMethodsToWrapper = x, e.isIdentifierName = d, e.isWrapper = _, e.isWrapperFor = b, e.mixin = r, e.nativePrototypeTable = I, e.oneOf = i, e.registerObject = y, e.registerWrapper = v, e.rewrap = j, e.setWrapper = L, e.unsafeUnwrap = O, e.unwrap = M, e.unwrapIfNeeded = N, e.wrap = T, e.wrapIfNeeded = C, e.wrappers = P;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e, t, n) { return { index: e, removed: t, addedCount: n }; }
                function n() { }
                var r = 0, o = 1, i = 2, a = 3;
                n.prototype = { calcEditDistances: function (e, t, n, r, o, i) { for (var a = i - o + 1, s = n - t + 1, c = new Array(a), l = 0; a > l; l++)
                        c[l] = new Array(s), c[l][0] = l; for (var u = 0; s > u; u++)
                        c[0][u] = u; for (var l = 1; a > l; l++)
                        for (var u = 1; s > u; u++)
                            if (this.equals(e[t + u - 1], r[o + l - 1]))
                                c[l][u] = c[l - 1][u - 1];
                            else {
                                var d = c[l - 1][u] + 1, p = c[l][u - 1] + 1;
                                c[l][u] = p > d ? d : p;
                            } return c; }, spliceOperationsFromEditDistances: function (e) { for (var t = e.length - 1, n = e[0].length - 1, s = e[t][n], c = []; t > 0 || n > 0;)
                        if (0 != t)
                            if (0 != n) {
                                var l, u = e[t - 1][n - 1], d = e[t - 1][n], p = e[t][n - 1];
                                l = p > d ? u > d ? d : u : u > p ? p : u, l == u ? (u == s ? c.push(r) : (c.push(o), s = u), t--, n--) : l == d ? (c.push(a), t--, s = d) : (c.push(i), n--, s = p);
                            }
                            else
                                c.push(a), t--;
                        else
                            c.push(i), n--; return c.reverse(), c; }, calcSplices: function (e, n, s, c, l, u) { var d = 0, p = 0, h = Math.min(s - n, u - l); if (0 == n && 0 == l && (d = this.sharedPrefix(e, c, h)), s == e.length && u == c.length && (p = this.sharedSuffix(e, c, h - d)), n += d, l += d, s -= p, u -= p, s - n == 0 && u - l == 0)
                        return []; if (n == s) {
                        for (var f = t(n, [], 0); u > l;)
                            f.removed.push(c[l++]);
                        return [f];
                    } if (l == u)
                        return [t(n, [], s - n)]; for (var m = this.spliceOperationsFromEditDistances(this.calcEditDistances(e, n, s, c, l, u)), f = void 0, w = [], v = n, g = l, b = 0; b < m.length; b++)
                        switch (m[b]) {
                            case r:
                                f && (w.push(f), f = void 0), v++, g++;
                                break;
                            case o:
                                f || (f = t(v, [], 0)), f.addedCount++, v++, f.removed.push(c[g]), g++;
                                break;
                            case i:
                                f || (f = t(v, [], 0)), f.addedCount++, v++;
                                break;
                            case a: f || (f = t(v, [], 0)), f.removed.push(c[g]), g++;
                        } return f && w.push(f), w; }, sharedPrefix: function (e, t, n) { for (var r = 0; n > r; r++)
                        if (!this.equals(e[r], t[r]))
                            return r; return n; }, sharedSuffix: function (e, t, n) { for (var r = e.length, o = t.length, i = 0; n > i && this.equals(e[--r], t[--o]);)
                        i++; return i; }, calculateSplices: function (e, t) { return this.calcSplices(e, 0, e.length, t, 0, t.length); }, equals: function (e, t) { return e === t; } }, e.ArraySplice = n;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t() { a = !1; var e = i.slice(0); i = []; for (var t = 0; t < e.length; t++)
                    (0, e[t])(); }
                function n(e) { i.push(e), a || (a = !0, r(t, 0)); }
                var r, o = window.MutationObserver, i = [], a = !1;
                if (o) {
                    var s = 1, c = new o(t), l = document.createTextNode(s);
                    c.observe(l, { characterData: !0 }), r = function () { s = (s + 1) % 2, l.data = s; };
                }
                else
                    r = window.setTimeout;
                e.setEndOfMicrotask = n;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { e.scheduled_ || (e.scheduled_ = !0, f.push(e), m || (u(n), m = !0)); }
                function n() { for (m = !1; f.length;) {
                    var e = f;
                    f = [], e.sort(function (e, t) { return e.uid_ - t.uid_; });
                    for (var t = 0; t < e.length; t++) {
                        var n = e[t];
                        n.scheduled_ = !1;
                        var r = n.takeRecords();
                        i(n), r.length && n.callback_(r, n);
                    }
                } }
                function r(e, t) { this.type = e, this.target = t, this.addedNodes = new p.NodeList, this.removedNodes = new p.NodeList, this.previousSibling = null, this.nextSibling = null, this.attributeName = null, this.attributeNamespace = null, this.oldValue = null; }
                function o(e, t) { for (; e; e = e.parentNode) {
                    var n = h.get(e);
                    if (n)
                        for (var r = 0; r < n.length; r++) {
                            var o = n[r];
                            o.options.subtree && o.addTransientObserver(t);
                        }
                } }
                function i(e) { for (var t = 0; t < e.nodes_.length; t++) {
                    var n = e.nodes_[t], r = h.get(n);
                    if (!r)
                        return;
                    for (var o = 0; o < r.length; o++) {
                        var i = r[o];
                        i.observer === e && i.removeTransientObservers();
                    }
                } }
                function a(e, n, o) { for (var i = Object.create(null), a = Object.create(null), s = e; s; s = s.parentNode) {
                    var c = h.get(s);
                    if (c)
                        for (var l = 0; l < c.length; l++) {
                            var u = c[l], d = u.options;
                            if ((s === e || d.subtree) && ("attributes" !== n || d.attributes) && ("attributes" !== n || !d.attributeFilter || null === o.namespace && -1 !== d.attributeFilter.indexOf(o.name)) && ("characterData" !== n || d.characterData) && ("childList" !== n || d.childList)) {
                                var p = u.observer;
                                i[p.uid_] = p, ("attributes" === n && d.attributeOldValue || "characterData" === n && d.characterDataOldValue) && (a[p.uid_] = o.oldValue);
                            }
                        }
                } for (var f in i) {
                    var p = i[f], m = new r(n, e);
                    "name" in o && "namespace" in o && (m.attributeName = o.name, m.attributeNamespace = o.namespace), o.addedNodes && (m.addedNodes = o.addedNodes), o.removedNodes && (m.removedNodes = o.removedNodes), o.previousSibling && (m.previousSibling = o.previousSibling), o.nextSibling && (m.nextSibling = o.nextSibling), void 0 !== a[f] && (m.oldValue = a[f]), t(p), p.records_.push(m);
                } }
                function s(e) { if (this.childList = !!e.childList, this.subtree = !!e.subtree, "attributes" in e || !("attributeOldValue" in e || "attributeFilter" in e) ? this.attributes = !!e.attributes : this.attributes = !0, "characterDataOldValue" in e && !("characterData" in e) ? this.characterData = !0 : this.characterData = !!e.characterData, !this.attributes && (e.attributeOldValue || "attributeFilter" in e) || !this.characterData && e.characterDataOldValue)
                    throw new TypeError; if (this.characterData = !!e.characterData, this.attributeOldValue = !!e.attributeOldValue, this.characterDataOldValue = !!e.characterDataOldValue, "attributeFilter" in e) {
                    if (null == e.attributeFilter || "object" != typeof e.attributeFilter)
                        throw new TypeError;
                    this.attributeFilter = w.call(e.attributeFilter);
                }
                else
                    this.attributeFilter = null; }
                function c(e) { this.callback_ = e, this.nodes_ = [], this.records_ = [], this.uid_ = ++v, this.scheduled_ = !1; }
                function l(e, t, n) { this.observer = e, this.target = t, this.options = n, this.transientObservedNodes = []; }
                var u = e.setEndOfMicrotask, d = e.wrapIfNeeded, p = e.wrappers, h = new WeakMap, f = [], m = !1, w = Array.prototype.slice, v = 0;
                c.prototype = { constructor: c, observe: function (e, t) { e = d(e); var n, r = new s(t), o = h.get(e); o || h.set(e, o = []); for (var i = 0; i < o.length; i++)
                        o[i].observer === this && (n = o[i], n.removeTransientObservers(), n.options = r); n || (n = new l(this, e, r), o.push(n), this.nodes_.push(e)); }, disconnect: function () { this.nodes_.forEach(function (e) { for (var t = h.get(e), n = 0; n < t.length; n++) {
                        var r = t[n];
                        if (r.observer === this) {
                            t.splice(n, 1);
                            break;
                        }
                    } }, this), this.records_ = []; }, takeRecords: function () { var e = this.records_; return this.records_ = [], e; } }, l.prototype = { addTransientObserver: function (e) { if (e !== this.target) {
                        t(this.observer), this.transientObservedNodes.push(e);
                        var n = h.get(e);
                        n || h.set(e, n = []), n.push(this);
                    } }, removeTransientObservers: function () { var e = this.transientObservedNodes; this.transientObservedNodes = []; for (var t = 0; t < e.length; t++)
                        for (var n = e[t], r = h.get(n), o = 0; o < r.length; o++)
                            if (r[o] === this) {
                                r.splice(o, 1);
                                break;
                            } } }, e.enqueueMutation = a, e.registerTransientObservers = o, e.wrappers.MutationObserver = c, e.wrappers.MutationRecord = r;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e, t) { this.root = e, this.parent = t; }
                function n(e, t) { if (e.treeScope_ !== t) {
                    e.treeScope_ = t;
                    for (var r = e.shadowRoot; r; r = r.olderShadowRoot)
                        r.treeScope_.parent = t;
                    for (var o = e.firstChild; o; o = o.nextSibling)
                        n(o, t);
                } }
                function r(n) { if (n instanceof e.wrappers.Window, n.treeScope_)
                    return n.treeScope_; var o, i = n.parentNode; return o = i ? r(i) : new t(n, null), n.treeScope_ = o; }
                t.prototype = { get renderer() { return this.root instanceof e.wrappers.ShadowRoot ? e.getRendererForHost(this.root.host) : null; }, contains: function (e) { for (; e; e = e.parent)
                        if (e === this)
                            return !0; return !1; } }, e.TreeScope = t, e.getTreeScope = r, e.setTreeScope = n;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { return e instanceof G.ShadowRoot; }
                function n(e) { return A(e).root; }
                function r(e, r) { var s = [], c = e; for (s.push(c); c;) {
                    var l = a(c);
                    if (l && l.length > 0) {
                        for (var u = 0; u < l.length; u++) {
                            var p = l[u];
                            if (i(p)) {
                                var h = n(p), f = h.olderShadowRoot;
                                f && s.push(f);
                            }
                            s.push(p);
                        }
                        c = l[l.length - 1];
                    }
                    else if (t(c)) {
                        if (d(e, c) && o(r))
                            break;
                        c = c.host, s.push(c);
                    }
                    else
                        c = c.parentNode, c && s.push(c);
                } return s; }
                function o(e) { if (!e)
                    return !1; switch (e.type) {
                    case "abort":
                    case "error":
                    case "select":
                    case "change":
                    case "load":
                    case "reset":
                    case "resize":
                    case "scroll":
                    case "selectstart": return !0;
                } return !1; }
                function i(e) { return e instanceof HTMLShadowElement; }
                function a(t) { return e.getDestinationInsertionPoints(t); }
                function s(e, t) { if (0 === e.length)
                    return t; t instanceof G.Window && (t = t.document); for (var n = A(t), r = e[0], o = A(r), i = l(n, o), a = 0; a < e.length; a++) {
                    var s = e[a];
                    if (A(s) === i)
                        return s;
                } return e[e.length - 1]; }
                function c(e) { for (var t = []; e; e = e.parent)
                    t.push(e); return t; }
                function l(e, t) { for (var n = c(e), r = c(t), o = null; n.length > 0 && r.length > 0;) {
                    var i = n.pop(), a = r.pop();
                    if (i !== a)
                        break;
                    o = i;
                } return o; }
                function u(e, t, n) { t instanceof G.Window && (t = t.document); var o, i = A(t), a = A(n), s = r(n, e), o = l(i, a); o || (o = a.root); for (var c = o; c; c = c.parent)
                    for (var u = 0; u < s.length; u++) {
                        var d = s[u];
                        if (A(d) === c)
                            return d;
                    } return null; }
                function d(e, t) { return A(e) === A(t); }
                function p(e) { if (!K.get(e) && (K.set(e, !0), f(V(e), V(e.target)), P)) {
                    var t = P;
                    throw P = null, t;
                } }
                function h(e) { switch (e.type) {
                    case "load":
                    case "beforeunload":
                    case "unload": return !0;
                } return !1; }
                function f(t, n) { if ($.get(t))
                    throw new Error("InvalidStateError"); $.set(t, !0), e.renderAllPending(); var o, i, a; if (h(t) && !t.bubbles) {
                    var s = n;
                    s instanceof G.Document && (a = s.defaultView) && (i = s, o = []);
                } if (!o)
                    if (n instanceof G.Window)
                        a = n, o = [];
                    else if (o = r(n, t), !h(t)) {
                        var s = o[o.length - 1];
                        s instanceof G.Document && (a = s.defaultView);
                    } return ne.set(t, o), m(t, o, a, i) && w(t, o, a, i) && v(t, o, a, i), J.set(t, re), Y["delete"](t, null), $["delete"](t), t.defaultPrevented; }
                function m(e, t, n, r) { var o = oe; if (n && !g(n, e, o, t, r))
                    return !1; for (var i = t.length - 1; i > 0; i--)
                    if (!g(t[i], e, o, t, r))
                        return !1; return !0; }
                function w(e, t, n, r) { var o = ie, i = t[0] || n; return g(i, e, o, t, r); }
                function v(e, t, n, r) { for (var o = ae, i = 1; i < t.length; i++)
                    if (!g(t[i], e, o, t, r))
                        return; n && t.length > 0 && g(n, e, o, t, r); }
                function g(e, t, n, r, o) { var i = z.get(e); if (!i)
                    return !0; var a = o || s(r, e); if (a === e) {
                    if (n === oe)
                        return !0;
                    n === ae && (n = ie);
                }
                else if (n === ae && !t.bubbles)
                    return !0; if ("relatedTarget" in t) {
                    var c = B(t), l = c.relatedTarget;
                    if (l) {
                        if (l instanceof Object && l.addEventListener) {
                            var d = V(l), p = u(t, e, d);
                            if (p === a)
                                return !0;
                        }
                        else
                            p = null;
                        Z.set(t, p);
                    }
                } J.set(t, n); var h = t.type, f = !1; X.set(t, a), Y.set(t, e), i.depth++; for (var m = 0, w = i.length; w > m; m++) {
                    var v = i[m];
                    if (v.removed)
                        f = !0;
                    else if (!(v.type !== h || !v.capture && n === oe || v.capture && n === ae))
                        try {
                            if ("function" == typeof v.handler ? v.handler.call(e, t) : v.handler.handleEvent(t), ee.get(t))
                                return !1;
                        }
                        catch (g) {
                            P || (P = g);
                        }
                } if (i.depth--, f && 0 === i.depth) {
                    var b = i.slice();
                    i.length = 0;
                    for (var m = 0; m < b.length; m++)
                        b[m].removed || i.push(b[m]);
                } return !Q.get(t); }
                function b(e, t, n) { this.type = e, this.handler = t, this.capture = Boolean(n); }
                function y(e, t) { if (!(e instanceof se))
                    return V(T(se, "Event", e, t)); var n = e; return be || "beforeunload" !== n.type || this instanceof M ? void U(n, this) : new M(n); }
                function E(e) { return e && e.relatedTarget ? Object.create(e, { relatedTarget: { value: B(e.relatedTarget) } }) : e; }
                function _(e, t, n) { var r = window[e], o = function (t, n) { return t instanceof r ? void U(t, this) : V(T(r, e, t, n)); }; if (o.prototype = Object.create(t.prototype), n && W(o.prototype, n), r)
                    try {
                        F(r, o, new r("temp"));
                    }
                    catch (i) {
                        F(r, o, document.createEvent(e));
                    } return o; }
                function S(e, t) { return function () { arguments[t] = B(arguments[t]); var n = B(this); n[e].apply(n, arguments); }; }
                function T(e, t, n, r) { if (ve)
                    return new e(n, E(r)); var o = B(document.createEvent(t)), i = we[t], a = [n]; return Object.keys(i).forEach(function (e) { var t = null != r && e in r ? r[e] : i[e]; "relatedTarget" === e && (t = B(t)), a.push(t); }), o["init" + t].apply(o, a), o; }
                function M(e) { y.call(this, e); }
                function O(e) { return "function" == typeof e ? !0 : e && e.handleEvent; }
                function L(e) { switch (e) {
                    case "DOMAttrModified":
                    case "DOMAttributeNameChanged":
                    case "DOMCharacterDataModified":
                    case "DOMElementNameChanged":
                    case "DOMNodeInserted":
                    case "DOMNodeInsertedIntoDocument":
                    case "DOMNodeRemoved":
                    case "DOMNodeRemovedFromDocument":
                    case "DOMSubtreeModified": return !0;
                } return !1; }
                function N(e) { U(e, this); }
                function C(e) { return e instanceof G.ShadowRoot && (e = e.host), B(e); }
                function j(e, t) { var n = z.get(e); if (n)
                    for (var r = 0; r < n.length; r++)
                        if (!n[r].removed && n[r].type === t)
                            return !0; return !1; }
                function D(e, t) { for (var n = B(e); n; n = n.parentNode)
                    if (j(V(n), t))
                        return !0; return !1; }
                function H(e) { k(e, Ee); }
                function x(t, n, o, i) { e.renderAllPending(); var a = V(_e.call(q(n), o, i)); if (!a)
                    return null; var c = r(a, null), l = c.lastIndexOf(t); return -1 == l ? null : (c = c.slice(0, l), s(c, t)); }
                function R(e) { return function () { var t = te.get(this); return t && t[e] && t[e].value || null; }; }
                function I(e) { var t = e.slice(2); return function (n) { var r = te.get(this); r || (r = Object.create(null), te.set(this, r)); var o = r[e]; if (o && this.removeEventListener(t, o.wrapped, !1), "function" == typeof n) {
                    var i = function (t) { var r = n.call(this, t); r === !1 ? t.preventDefault() : "onbeforeunload" === e && "string" == typeof r && (t.returnValue = r); };
                    this.addEventListener(t, i, !1), r[e] = { value: n, wrapped: i };
                } }; }
                var P, k = e.forwardMethodsToWrapper, A = e.getTreeScope, W = e.mixin, F = e.registerWrapper, U = e.setWrapper, q = e.unsafeUnwrap, B = e.unwrap, V = e.wrap, G = e.wrappers, z = (new WeakMap, new WeakMap), K = new WeakMap, $ = new WeakMap, X = new WeakMap, Y = new WeakMap, Z = new WeakMap, J = new WeakMap, Q = new WeakMap, ee = new WeakMap, te = new WeakMap, ne = new WeakMap, re = 0, oe = 1, ie = 2, ae = 3;
                b.prototype = { equals: function (e) { return this.handler === e.handler && this.type === e.type && this.capture === e.capture; }, get removed() { return null === this.handler; }, remove: function () { this.handler = null; } };
                var se = window.Event;
                se.prototype.polymerBlackList_ = { returnValue: !0, keyLocation: !0 }, y.prototype = { get target() { return X.get(this); }, get currentTarget() { return Y.get(this); }, get eventPhase() { return J.get(this); }, get path() { var e = ne.get(this); return e ? e.slice() : []; }, stopPropagation: function () { Q.set(this, !0); }, stopImmediatePropagation: function () { Q.set(this, !0), ee.set(this, !0); } };
                var ce = function () { var e = document.createEvent("Event"); return e.initEvent("test", !0, !0), e.preventDefault(), e.defaultPrevented; }();
                ce || (y.prototype.preventDefault = function () { this.cancelable && (q(this).preventDefault(), Object.defineProperty(this, "defaultPrevented", { get: function () { return !0; }, configurable: !0 })); }), F(se, y, document.createEvent("Event"));
                var le = _("UIEvent", y), ue = _("CustomEvent", y), de = { get relatedTarget() { var e = Z.get(this); return void 0 !== e ? e : V(B(this).relatedTarget); } }, pe = W({ initMouseEvent: S("initMouseEvent", 14) }, de), he = W({ initFocusEvent: S("initFocusEvent", 5) }, de), fe = _("MouseEvent", le, pe), me = _("FocusEvent", le, he), we = Object.create(null), ve = function () { try {
                    new window.FocusEvent("focus");
                }
                catch (e) {
                    return !1;
                } return !0; }();
                if (!ve) {
                    var ge = function (e, t, n) { if (n) {
                        var r = we[n];
                        t = W(W({}, r), t);
                    } we[e] = t; };
                    ge("Event", { bubbles: !1, cancelable: !1 }), ge("CustomEvent", { detail: null }, "Event"), ge("UIEvent", { view: null, detail: 0 }, "Event"), ge("MouseEvent", { screenX: 0, screenY: 0, clientX: 0, clientY: 0, ctrlKey: !1, altKey: !1, shiftKey: !1, metaKey: !1, button: 0, relatedTarget: null }, "UIEvent"), ge("FocusEvent", { relatedTarget: null }, "UIEvent");
                }
                var be = window.BeforeUnloadEvent;
                M.prototype = Object.create(y.prototype), W(M.prototype, { get returnValue() { return q(this).returnValue; }, set returnValue(e) { q(this).returnValue = e; } }), be && F(be, M);
                var ye = window.EventTarget, Ee = ["addEventListener", "removeEventListener", "dispatchEvent"];
                [Node, Window].forEach(function (e) { var t = e.prototype; Ee.forEach(function (e) { Object.defineProperty(t, e + "_", { value: t[e] }); }); }), N.prototype = { addEventListener: function (e, t, n) { if (O(t) && !L(e)) {
                        var r = new b(e, t, n), o = z.get(this);
                        if (o) {
                            for (var i = 0; i < o.length; i++)
                                if (r.equals(o[i]))
                                    return;
                        }
                        else
                            o = [], o.depth = 0, z.set(this, o);
                        o.push(r);
                        var a = C(this);
                        a.addEventListener_(e, p, !0);
                    } }, removeEventListener: function (e, t, n) { n = Boolean(n); var r = z.get(this); if (r) {
                        for (var o = 0, i = !1, a = 0; a < r.length; a++)
                            r[a].type === e && r[a].capture === n && (o++, r[a].handler === t && (i = !0, r[a].remove()));
                        if (i && 1 === o) {
                            var s = C(this);
                            s.removeEventListener_(e, p, !0);
                        }
                    } }, dispatchEvent: function (t) { var n = B(t), r = n.type; K.set(n, !1), e.renderAllPending(); var o; D(this, r) || (o = function () { }, this.addEventListener(r, o, !0)); try {
                        return B(this).dispatchEvent_(n);
                    }
                    finally {
                        o && this.removeEventListener(r, o, !0);
                    } } }, ye && F(ye, N);
                var _e = document.elementFromPoint;
                e.elementFromPoint = x, e.getEventHandlerGetter = R, e.getEventHandlerSetter = I, e.wrapEventTargetMethods = H, e.wrappers.BeforeUnloadEvent = M, e.wrappers.CustomEvent = ue, e.wrappers.Event = y, e.wrappers.EventTarget = N, e.wrappers.FocusEvent = me, e.wrappers.MouseEvent = fe, e.wrappers.UIEvent = le;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e, t) { Object.defineProperty(e, t, m); }
                function n(e) { l(e, this); }
                function r() { this.length = 0, t(this, "length"); }
                function o(e) { for (var t = new r, o = 0; o < e.length; o++)
                    t[o] = new n(e[o]); return t.length = o, t; }
                function i(e) { a.call(this, e); }
                var a = e.wrappers.UIEvent, s = e.mixin, c = e.registerWrapper, l = e.setWrapper, u = e.unsafeUnwrap, d = e.wrap, p = window.TouchEvent;
                if (p) {
                    var h;
                    try {
                        h = document.createEvent("TouchEvent");
                    }
                    catch (f) {
                        return;
                    }
                    var m = { enumerable: !1 };
                    n.prototype = { get target() { return d(u(this).target); } };
                    var w = { configurable: !0, enumerable: !0, get: null };
                    ["clientX", "clientY", "screenX", "screenY", "pageX", "pageY", "identifier", "webkitRadiusX", "webkitRadiusY", "webkitRotationAngle", "webkitForce"].forEach(function (e) { w.get = function () { return u(this)[e]; }, Object.defineProperty(n.prototype, e, w); }), r.prototype = { item: function (e) { return this[e]; } }, i.prototype = Object.create(a.prototype), s(i.prototype, { get touches() { return o(u(this).touches); }, get targetTouches() { return o(u(this).targetTouches); }, get changedTouches() { return o(u(this).changedTouches); }, initTouchEvent: function () { throw new Error("Not implemented"); } }), c(p, i, h), e.wrappers.Touch = n, e.wrappers.TouchEvent = i, e.wrappers.TouchList = r;
                }
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e, t) { Object.defineProperty(e, t, s); }
                function n() { this.length = 0, t(this, "length"); }
                function r(e) { if (null == e)
                    return e; for (var t = new n, r = 0, o = e.length; o > r; r++)
                    t[r] = a(e[r]); return t.length = o, t; }
                function o(e, t) { e.prototype[t] = function () { return r(i(this)[t].apply(i(this), arguments)); }; }
                var i = e.unsafeUnwrap, a = e.wrap, s = { enumerable: !1 };
                n.prototype = { item: function (e) { return this[e]; } }, t(n.prototype, "item"), e.wrappers.NodeList = n, e.addWrapNodeListMethod = o, e.wrapNodeList = r;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                e.wrapHTMLCollection = e.wrapNodeList, e.wrappers.HTMLCollection = e.wrappers.NodeList;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { O(e instanceof _); }
                function n(e) { var t = new T; return t[0] = e, t.length = 1, t; }
                function r(e, t, n) { N(t, "childList", { removedNodes: n, previousSibling: e.previousSibling, nextSibling: e.nextSibling }); }
                function o(e, t) { N(e, "childList", { removedNodes: t }); }
                function i(e, t, r, o) { if (e instanceof DocumentFragment) {
                    var i = s(e);
                    U = !0;
                    for (var a = i.length - 1; a >= 0; a--)
                        e.removeChild(i[a]), i[a].parentNode_ = t;
                    U = !1;
                    for (var a = 0; a < i.length; a++)
                        i[a].previousSibling_ = i[a - 1] || r, i[a].nextSibling_ = i[a + 1] || o;
                    return r && (r.nextSibling_ = i[0]), o && (o.previousSibling_ = i[i.length - 1]), i;
                } var i = n(e), c = e.parentNode; return c && c.removeChild(e), e.parentNode_ = t, e.previousSibling_ = r, e.nextSibling_ = o, r && (r.nextSibling_ = e), o && (o.previousSibling_ = e), i; }
                function a(e) { if (e instanceof DocumentFragment)
                    return s(e); var t = n(e), o = e.parentNode; return o && r(e, o, t), t; }
                function s(e) { for (var t = new T, n = 0, r = e.firstChild; r; r = r.nextSibling)
                    t[n++] = r; return t.length = n, o(e, t), t; }
                function c(e) { return e; }
                function l(e, t) { R(e, t), e.nodeIsInserted_(); }
                function u(e, t) { for (var n = C(t), r = 0; r < e.length; r++)
                    l(e[r], n); }
                function d(e) { R(e, new M(e, null)); }
                function p(e) { for (var t = 0; t < e.length; t++)
                    d(e[t]); }
                function h(e, t) { var n = e.nodeType === _.DOCUMENT_NODE ? e : e.ownerDocument; n !== t.ownerDocument && n.adoptNode(t); }
                function f(t, n) { if (n.length) {
                    var r = t.ownerDocument;
                    if (r !== n[0].ownerDocument)
                        for (var o = 0; o < n.length; o++)
                            e.adoptNodeNoRemove(n[o], r);
                } }
                function m(e, t) { f(e, t); var n = t.length; if (1 === n)
                    return P(t[0]); for (var r = P(e.ownerDocument.createDocumentFragment()), o = 0; n > o; o++)
                    r.appendChild(P(t[o])); return r; }
                function w(e) { if (void 0 !== e.firstChild_)
                    for (var t = e.firstChild_; t;) {
                        var n = t;
                        t = t.nextSibling_, n.parentNode_ = n.previousSibling_ = n.nextSibling_ = void 0;
                    } e.firstChild_ = e.lastChild_ = void 0; }
                function v(e) { if (e.invalidateShadowRenderer()) {
                    for (var t = e.firstChild; t;) {
                        O(t.parentNode === e);
                        var n = t.nextSibling, r = P(t), o = r.parentNode;
                        o && X.call(o, r), t.previousSibling_ = t.nextSibling_ = t.parentNode_ = null, t = n;
                    }
                    e.firstChild_ = e.lastChild_ = null;
                }
                else
                    for (var n, i = P(e), a = i.firstChild; a;)
                        n = a.nextSibling, X.call(i, a), a = n; }
                function g(e) { var t = e.parentNode; return t && t.invalidateShadowRenderer(); }
                function b(e) { for (var t, n = 0; n < e.length; n++)
                    t = e[n], t.parentNode.removeChild(t); }
                function y(e, t, n) { var r; if (r = A(n ? q.call(n, I(e), !1) : B.call(I(e), !1)), t) {
                    for (var o = e.firstChild; o; o = o.nextSibling)
                        r.appendChild(y(o, !0, n));
                    if (e instanceof F.HTMLTemplateElement)
                        for (var i = r.content, o = e.content.firstChild; o; o = o.nextSibling)
                            i.appendChild(y(o, !0, n));
                } return r; }
                function E(e, t) { if (!t || C(e) !== C(t))
                    return !1; for (var n = t; n; n = n.parentNode)
                    if (n === e)
                        return !0; return !1; }
                function _(e) { O(e instanceof V), S.call(this, e), this.parentNode_ = void 0, this.firstChild_ = void 0, this.lastChild_ = void 0, this.nextSibling_ = void 0, this.previousSibling_ = void 0, this.treeScope_ = void 0; }
                var S = e.wrappers.EventTarget, T = e.wrappers.NodeList, M = e.TreeScope, O = e.assert, L = e.defineWrapGetter, N = e.enqueueMutation, C = e.getTreeScope, j = e.isWrapper, D = e.mixin, H = e.registerTransientObservers, x = e.registerWrapper, R = e.setTreeScope, I = e.unsafeUnwrap, P = e.unwrap, k = e.unwrapIfNeeded, A = e.wrap, W = e.wrapIfNeeded, F = e.wrappers, U = !1, q = document.importNode, B = window.Node.prototype.cloneNode, V = window.Node, G = window.DocumentFragment, z = (V.prototype.appendChild, V.prototype.compareDocumentPosition), K = V.prototype.isEqualNode, $ = V.prototype.insertBefore, X = V.prototype.removeChild, Y = V.prototype.replaceChild, Z = /Trident|Edge/.test(navigator.userAgent), J = Z ? function (e, t) { try {
                    X.call(e, t);
                }
                catch (n) {
                    if (!(e instanceof G))
                        throw n;
                } } : function (e, t) { X.call(e, t); };
                _.prototype = Object.create(S.prototype), D(_.prototype, { appendChild: function (e) { return this.insertBefore(e, null); }, insertBefore: function (e, n) { t(e); var r; n ? j(n) ? r = P(n) : (r = n, n = A(r)) : (n = null, r = null), n && O(n.parentNode === this); var o, s = n ? n.previousSibling : this.lastChild, c = !this.invalidateShadowRenderer() && !g(e); if (o = c ? a(e) : i(e, this, s, n), c)
                        h(this, e), w(this), $.call(I(this), P(e), r);
                    else {
                        s || (this.firstChild_ = o[0]), n || (this.lastChild_ = o[o.length - 1], void 0 === this.firstChild_ && (this.firstChild_ = this.firstChild));
                        var l = r ? r.parentNode : I(this);
                        l ? $.call(l, m(this, o), r) : f(this, o);
                    } return N(this, "childList", { addedNodes: o, nextSibling: n, previousSibling: s }), u(o, this), e; }, removeChild: function (e) { if (t(e), e.parentNode !== this) {
                        for (var r = !1, o = (this.childNodes, this.firstChild); o; o = o.nextSibling)
                            if (o === e) {
                                r = !0;
                                break;
                            }
                        if (!r)
                            throw new Error("NotFoundError");
                    } var i = P(e), a = e.nextSibling, s = e.previousSibling; if (this.invalidateShadowRenderer()) {
                        var c = this.firstChild, l = this.lastChild, u = i.parentNode;
                        u && J(u, i), c === e && (this.firstChild_ = a), l === e && (this.lastChild_ = s), s && (s.nextSibling_ = a), a && (a.previousSibling_ = s), e.previousSibling_ = e.nextSibling_ = e.parentNode_ = void 0;
                    }
                    else
                        w(this), J(I(this), i); return U || N(this, "childList", { removedNodes: n(e), nextSibling: a, previousSibling: s }), H(this, e), e; }, replaceChild: function (e, r) { t(e); var o; if (j(r) ? o = P(r) : (o = r, r = A(o)), r.parentNode !== this)
                        throw new Error("NotFoundError"); var s, c = r.nextSibling, l = r.previousSibling, p = !this.invalidateShadowRenderer() && !g(e); return p ? s = a(e) : (c === e && (c = e.nextSibling), s = i(e, this, l, c)), p ? (h(this, e), w(this), Y.call(I(this), P(e), o)) : (this.firstChild === r && (this.firstChild_ = s[0]), this.lastChild === r && (this.lastChild_ = s[s.length - 1]), r.previousSibling_ = r.nextSibling_ = r.parentNode_ = void 0, o.parentNode && Y.call(o.parentNode, m(this, s), o)), N(this, "childList", { addedNodes: s, removedNodes: n(r), nextSibling: c, previousSibling: l }), d(r), u(s, this), r; }, nodeIsInserted_: function () { for (var e = this.firstChild; e; e = e.nextSibling)
                        e.nodeIsInserted_(); }, hasChildNodes: function () { return null !== this.firstChild; }, get parentNode() { return void 0 !== this.parentNode_ ? this.parentNode_ : A(I(this).parentNode); }, get firstChild() { return void 0 !== this.firstChild_ ? this.firstChild_ : A(I(this).firstChild); }, get lastChild() { return void 0 !== this.lastChild_ ? this.lastChild_ : A(I(this).lastChild); }, get nextSibling() { return void 0 !== this.nextSibling_ ? this.nextSibling_ : A(I(this).nextSibling); }, get previousSibling() { return void 0 !== this.previousSibling_ ? this.previousSibling_ : A(I(this).previousSibling); }, get parentElement() { for (var e = this.parentNode; e && e.nodeType !== _.ELEMENT_NODE;)
                        e = e.parentNode; return e; }, get textContent() { for (var e = "", t = this.firstChild; t; t = t.nextSibling)
                        t.nodeType != _.COMMENT_NODE && (e += t.textContent); return e; }, set textContent(e) { null == e && (e = ""); var t = c(this.childNodes); if (this.invalidateShadowRenderer()) {
                        if (v(this), "" !== e) {
                            var n = I(this).ownerDocument.createTextNode(e);
                            this.appendChild(n);
                        }
                    }
                    else
                        w(this), I(this).textContent = e; var r = c(this.childNodes); N(this, "childList", { addedNodes: r, removedNodes: t }), p(t), u(r, this); }, get childNodes() { for (var e = new T, t = 0, n = this.firstChild; n; n = n.nextSibling)
                        e[t++] = n; return e.length = t, e; }, cloneNode: function (e) { return y(this, e); }, contains: function (e) { return E(this, W(e)); }, compareDocumentPosition: function (e) { return z.call(I(this), k(e)); }, isEqualNode: function (e) { return K.call(I(this), k(e)); }, normalize: function () { for (var e, t, n = c(this.childNodes), r = [], o = "", i = 0; i < n.length; i++)
                        t = n[i], t.nodeType === _.TEXT_NODE ? e || t.data.length ? e ? (o += t.data, r.push(t)) : e = t : this.removeChild(t) : (e && r.length && (e.data += o, b(r)), r = [], o = "", e = null, t.childNodes.length && t.normalize()); e && r.length && (e.data += o, b(r)); } }), L(_, "ownerDocument"), x(V, _, document.createDocumentFragment()), delete _.prototype.querySelector, delete _.prototype.querySelectorAll, _.prototype = D(Object.create(S.prototype), _.prototype), e.cloneNode = y, e.nodeWasAdded = l, e.nodeWasRemoved = d, e.nodesWereAdded = u, e.nodesWereRemoved = p, e.originalInsertBefore = $, e.originalRemoveChild = X, e.snapshotNodeList = c, e.wrappers.Node = _;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(t, n, r, o) { for (var i = null, a = null, s = 0, c = t.length; c > s; s++)
                    i = b(t[s]), !o && (a = v(i).root) && a instanceof e.wrappers.ShadowRoot || (r[n++] = i); return n; }
                function n(e) { return String(e).replace(/\/deep\/|::shadow|>>>/g, " "); }
                function r(e) { return String(e).replace(/:host\(([^\s]+)\)/g, "$1").replace(/([^\s]):host/g, "$1").replace(":host", "*").replace(/\^|\/shadow\/|\/shadow-deep\/|::shadow|\/deep\/|::content|>>>/g, " "); }
                function o(e, t) { for (var n, r = e.firstElementChild; r;) {
                    if (r.matches(t))
                        return r;
                    if (n = o(r, t))
                        return n;
                    r = r.nextElementSibling;
                } return null; }
                function i(e, t) { return e.matches(t); }
                function a(e, t, n) { var r = e.localName; return r === t || r === n && e.namespaceURI === j; }
                function s() { return !0; }
                function c(e, t, n) { return e.localName === n; }
                function l(e, t) { return e.namespaceURI === t; }
                function u(e, t, n) { return e.namespaceURI === t && e.localName === n; }
                function d(e, t, n, r, o, i) { for (var a = e.firstElementChild; a;)
                    r(a, o, i) && (n[t++] = a), t = d(a, t, n, r, o, i), a = a.nextElementSibling; return t; }
                function p(n, r, o, i, a) { var s, c = g(this), l = v(this).root; if (l instanceof e.wrappers.ShadowRoot)
                    return d(this, r, o, n, i, null); if (c instanceof N)
                    s = S.call(c, i);
                else {
                    if (!(c instanceof C))
                        return d(this, r, o, n, i, null);
                    s = _.call(c, i);
                } return t(s, r, o, a); }
                function h(n, r, o, i, a) { var s, c = g(this), l = v(this).root; if (l instanceof e.wrappers.ShadowRoot)
                    return d(this, r, o, n, i, a); if (c instanceof N)
                    s = M.call(c, i, a);
                else {
                    if (!(c instanceof C))
                        return d(this, r, o, n, i, a);
                    s = T.call(c, i, a);
                } return t(s, r, o, !1); }
                function f(n, r, o, i, a) { var s, c = g(this), l = v(this).root; if (l instanceof e.wrappers.ShadowRoot)
                    return d(this, r, o, n, i, a); if (c instanceof N)
                    s = L.call(c, i, a);
                else {
                    if (!(c instanceof C))
                        return d(this, r, o, n, i, a);
                    s = O.call(c, i, a);
                } return t(s, r, o, !1); }
                var m = e.wrappers.HTMLCollection, w = e.wrappers.NodeList, v = e.getTreeScope, g = e.unsafeUnwrap, b = e.wrap, y = document.querySelector, E = document.documentElement.querySelector, _ = document.querySelectorAll, S = document.documentElement.querySelectorAll, T = document.getElementsByTagName, M = document.documentElement.getElementsByTagName, O = document.getElementsByTagNameNS, L = document.documentElement.getElementsByTagNameNS, N = window.Element, C = window.HTMLDocument || window.Document, j = "http://www.w3.org/1999/xhtml", D = {
                    querySelector: function (t) { var r = n(t), i = r !== t; t = r; var a, s = g(this), c = v(this).root; if (c instanceof e.wrappers.ShadowRoot)
                        return o(this, t); if (s instanceof N)
                        a = b(E.call(s, t));
                    else {
                        if (!(s instanceof C))
                            return o(this, t);
                        a = b(y.call(s, t));
                    } return a && !i && (c = v(a).root) && c instanceof e.wrappers.ShadowRoot ? o(this, t) : a; }, querySelectorAll: function (e) { var t = n(e), r = t !== e; e = t; var o = new w; return o.length = p.call(this, i, 0, o, e, r), o; }
                }, H = { matches: function (t) { return t = r(t), e.originalMatches.call(g(this), t); } }, x = { getElementsByTagName: function (e) { var t = new m, n = "*" === e ? s : a; return t.length = h.call(this, n, 0, t, e, e.toLowerCase()), t; }, getElementsByClassName: function (e) { return this.querySelectorAll("." + e); }, getElementsByTagNameNS: function (e, t) { var n = new m, r = null; return r = "*" === e ? "*" === t ? s : c : "*" === t ? l : u, n.length = f.call(this, r, 0, n, e || null, t), n; } };
                e.GetElementsByInterface = x, e.SelectorsInterface = D, e.MatchesInterface = H;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { for (; e && e.nodeType !== Node.ELEMENT_NODE;)
                    e = e.nextSibling; return e; }
                function n(e) { for (; e && e.nodeType !== Node.ELEMENT_NODE;)
                    e = e.previousSibling; return e; }
                var r = e.wrappers.NodeList, o = { get firstElementChild() { return t(this.firstChild); }, get lastElementChild() { return n(this.lastChild); }, get childElementCount() { for (var e = 0, t = this.firstElementChild; t; t = t.nextElementSibling)
                        e++; return e; }, get children() { for (var e = new r, t = 0, n = this.firstElementChild; n; n = n.nextElementSibling)
                        e[t++] = n; return e.length = t, e; }, remove: function () { var e = this.parentNode; e && e.removeChild(this); } }, i = { get nextElementSibling() { return t(this.nextSibling); }, get previousElementSibling() { return n(this.previousSibling); } }, a = { getElementById: function (e) { return /[ \t\n\r\f]/.test(e) ? null : this.querySelector('[id="' + e + '"]'); } };
                e.ChildNodeInterface = i, e.NonElementParentNodeInterface = a, e.ParentNodeInterface = o;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { r.call(this, e); }
                var n = e.ChildNodeInterface, r = e.wrappers.Node, o = e.enqueueMutation, i = e.mixin, a = e.registerWrapper, s = e.unsafeUnwrap, c = window.CharacterData;
                t.prototype = Object.create(r.prototype), i(t.prototype, { get nodeValue() { return this.data; }, set nodeValue(e) { this.data = e; }, get textContent() { return this.data; }, set textContent(e) { this.data = e; }, get data() { return s(this).data; }, set data(e) { var t = s(this).data; o(this, "characterData", { oldValue: t }), s(this).data = e; } }), i(t.prototype, n), a(c, t, document.createTextNode("")), e.wrappers.CharacterData = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { return e >>> 0; }
                function n(e) { r.call(this, e); }
                var r = e.wrappers.CharacterData, o = (e.enqueueMutation, e.mixin), i = e.registerWrapper, a = window.Text;
                n.prototype = Object.create(r.prototype), o(n.prototype, { splitText: function (e) { e = t(e); var n = this.data; if (e > n.length)
                        throw new Error("IndexSizeError"); var r = n.slice(0, e), o = n.slice(e); this.data = r; var i = this.ownerDocument.createTextNode(o); return this.parentNode && this.parentNode.insertBefore(i, this.nextSibling), i; } }), i(a, n, document.createTextNode("")), e.wrappers.Text = n;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { return i(e).getAttribute("class"); }
                function n(e, t) { a(e, "attributes", { name: "class", namespace: null, oldValue: t }); }
                function r(t) { e.invalidateRendererBasedOnAttribute(t, "class"); }
                function o(e, o, i) { var a = e.ownerElement_; if (null == a)
                    return o.apply(e, i); var s = t(a), c = o.apply(e, i); return t(a) !== s && (n(a, s), r(a)), c; }
                if (!window.DOMTokenList)
                    return void console.warn("Missing DOMTokenList prototype, please include a compatible classList polyfill such as http://goo.gl/uTcepH.");
                var i = e.unsafeUnwrap, a = e.enqueueMutation, s = DOMTokenList.prototype.add;
                DOMTokenList.prototype.add = function () { o(this, s, arguments); };
                var c = DOMTokenList.prototype.remove;
                DOMTokenList.prototype.remove = function () { o(this, c, arguments); };
                var l = DOMTokenList.prototype.toggle;
                DOMTokenList.prototype.toggle = function () { return o(this, l, arguments); };
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(t, n) { var r = t.parentNode; if (r && r.shadowRoot) {
                    var o = e.getRendererForHost(r);
                    o.dependsOnAttribute(n) && o.invalidate();
                } }
                function n(e, t, n) { u(e, "attributes", { name: t, namespace: null, oldValue: n }); }
                function r(e) { a.call(this, e); }
                var o = e.ChildNodeInterface, i = e.GetElementsByInterface, a = e.wrappers.Node, s = e.ParentNodeInterface, c = e.SelectorsInterface, l = e.MatchesInterface, u = (e.addWrapNodeListMethod, e.enqueueMutation), d = e.mixin, p = (e.oneOf, e.registerWrapper), h = e.unsafeUnwrap, f = e.wrappers, m = window.Element, w = ["matches", "mozMatchesSelector", "msMatchesSelector", "webkitMatchesSelector"].filter(function (e) { return m.prototype[e]; }), v = w[0], g = m.prototype[v], b = new WeakMap;
                r.prototype = Object.create(a.prototype), d(r.prototype, { createShadowRoot: function () { var t = new f.ShadowRoot(this); h(this).polymerShadowRoot_ = t; var n = e.getRendererForHost(this); return n.invalidate(), t; }, get shadowRoot() { return h(this).polymerShadowRoot_ || null; }, setAttribute: function (e, r) { var o = h(this).getAttribute(e); h(this).setAttribute(e, r), n(this, e, o), t(this, e); }, removeAttribute: function (e) { var r = h(this).getAttribute(e); h(this).removeAttribute(e), n(this, e, r), t(this, e); }, get classList() { var e = b.get(this); if (!e) {
                        if (e = h(this).classList, !e)
                            return;
                        e.ownerElement_ = this, b.set(this, e);
                    } return e; }, get className() { return h(this).className; }, set className(e) { this.setAttribute("class", e); }, get id() { return h(this).id; }, set id(e) { this.setAttribute("id", e); } }), w.forEach(function (e) { "matches" !== e && (r.prototype[e] = function (e) { return this.matches(e); }); }), m.prototype.webkitCreateShadowRoot && (r.prototype.webkitCreateShadowRoot = r.prototype.createShadowRoot), d(r.prototype, o), d(r.prototype, i), d(r.prototype, s), d(r.prototype, c), d(r.prototype, l), p(m, r, document.createElementNS(null, "x")), e.invalidateRendererBasedOnAttribute = t, e.matchesNames = w, e.originalMatches = g, e.wrappers.Element = r;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { switch (e) {
                    case "&": return "&amp;";
                    case "<": return "&lt;";
                    case ">": return "&gt;";
                    case '"': return "&quot;";
                    case " ": return "&nbsp;";
                } }
                function n(e) { return e.replace(L, t); }
                function r(e) { return e.replace(N, t); }
                function o(e) { for (var t = {}, n = 0; n < e.length; n++)
                    t[e[n]] = !0; return t; }
                function i(e) { if (e.namespaceURI !== D)
                    return !0; var t = e.ownerDocument.doctype; return t && t.publicId && t.systemId; }
                function a(e, t) { switch (e.nodeType) {
                    case Node.ELEMENT_NODE:
                        for (var o, a = e.tagName.toLowerCase(), c = "<" + a, l = e.attributes, u = 0; o = l[u]; u++)
                            c += " " + o.name + '="' + n(o.value) + '"';
                        return C[a] ? (i(e) && (c += "/"), c + ">") : c + ">" + s(e) + "</" + a + ">";
                    case Node.TEXT_NODE:
                        var d = e.data;
                        return t && j[t.localName] ? d : r(d);
                    case Node.COMMENT_NODE: return "<!--" + e.data + "-->";
                    default: throw console.error(e), new Error("not implemented");
                } }
                function s(e) { e instanceof O.HTMLTemplateElement && (e = e.content); for (var t = "", n = e.firstChild; n; n = n.nextSibling)
                    t += a(n, e); return t; }
                function c(e, t, n) { var r = n || "div"; e.textContent = ""; var o = T(e.ownerDocument.createElement(r)); o.innerHTML = t; for (var i; i = o.firstChild;)
                    e.appendChild(M(i)); }
                function l(e) { m.call(this, e); }
                function u(e, t) { var n = T(e.cloneNode(!1)); n.innerHTML = t; for (var r, o = T(document.createDocumentFragment()); r = n.firstChild;)
                    o.appendChild(r); return M(o); }
                function d(t) { return function () { return e.renderAllPending(), S(this)[t]; }; }
                function p(e) { w(l, e, d(e)); }
                function h(t) { Object.defineProperty(l.prototype, t, { get: d(t), set: function (n) { e.renderAllPending(), S(this)[t] = n; }, configurable: !0, enumerable: !0 }); }
                function f(t) { Object.defineProperty(l.prototype, t, { value: function () { return e.renderAllPending(), S(this)[t].apply(S(this), arguments); }, configurable: !0, enumerable: !0 }); }
                var m = e.wrappers.Element, w = e.defineGetter, v = e.enqueueMutation, g = e.mixin, b = e.nodesWereAdded, y = e.nodesWereRemoved, E = e.registerWrapper, _ = e.snapshotNodeList, S = e.unsafeUnwrap, T = e.unwrap, M = e.wrap, O = e.wrappers, L = /[&\u00A0"]/g, N = /[&\u00A0<>]/g, C = o(["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]), j = o(["style", "script", "xmp", "iframe", "noembed", "noframes", "plaintext", "noscript"]), D = "http://www.w3.org/1999/xhtml", H = /MSIE/.test(navigator.userAgent), x = window.HTMLElement, R = window.HTMLTemplateElement;
                l.prototype = Object.create(m.prototype), g(l.prototype, { get innerHTML() { return s(this); }, set innerHTML(e) { if (H && j[this.localName])
                        return void (this.textContent = e); var t = _(this.childNodes); this.invalidateShadowRenderer() ? this instanceof O.HTMLTemplateElement ? c(this.content, e) : c(this, e, this.tagName) : !R && this instanceof O.HTMLTemplateElement ? c(this.content, e) : S(this).innerHTML = e; var n = _(this.childNodes); v(this, "childList", { addedNodes: n, removedNodes: t }), y(t), b(n, this); }, get outerHTML() { return a(this, this.parentNode); }, set outerHTML(e) { var t = this.parentNode; if (t) {
                        t.invalidateShadowRenderer();
                        var n = u(t, e);
                        t.replaceChild(n, this);
                    } }, insertAdjacentHTML: function (e, t) { var n, r; switch (String(e).toLowerCase()) {
                        case "beforebegin":
                            n = this.parentNode, r = this;
                            break;
                        case "afterend":
                            n = this.parentNode, r = this.nextSibling;
                            break;
                        case "afterbegin":
                            n = this, r = this.firstChild;
                            break;
                        case "beforeend":
                            n = this, r = null;
                            break;
                        default: return;
                    } var o = u(n, t); n.insertBefore(o, r); }, get hidden() { return this.hasAttribute("hidden"); }, set hidden(e) { e ? this.setAttribute("hidden", "") : this.removeAttribute("hidden"); } }), ["clientHeight", "clientLeft", "clientTop", "clientWidth", "offsetHeight", "offsetLeft", "offsetTop", "offsetWidth", "scrollHeight", "scrollWidth"].forEach(p), ["scrollLeft", "scrollTop"].forEach(h), ["focus", "getBoundingClientRect", "getClientRects", "scrollIntoView"].forEach(f), E(x, l, document.createElement("b")), e.wrappers.HTMLElement = l, e.getInnerHTML = s, e.setInnerHTML = c;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = e.mixin, o = e.registerWrapper, i = e.unsafeUnwrap, a = e.wrap, s = window.HTMLCanvasElement;
                t.prototype = Object.create(n.prototype), r(t.prototype, { getContext: function () { var e = i(this).getContext.apply(i(this), arguments); return e && a(e); } }), o(s, t, document.createElement("canvas")), e.wrappers.HTMLCanvasElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = e.mixin, o = e.registerWrapper, i = window.HTMLContentElement;
                t.prototype = Object.create(n.prototype), r(t.prototype, { constructor: t, get select() { return this.getAttribute("select"); }, set select(e) { this.setAttribute("select", e); }, setAttribute: function (e, t) { n.prototype.setAttribute.call(this, e, t), "select" === String(e).toLowerCase() && this.invalidateShadowRenderer(!0); } }), i && o(i, t), e.wrappers.HTMLContentElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = e.mixin, o = e.registerWrapper, i = e.wrapHTMLCollection, a = e.unwrap, s = window.HTMLFormElement;
                t.prototype = Object.create(n.prototype), r(t.prototype, { get elements() { return i(a(this).elements); } }), o(s, t, document.createElement("form")), e.wrappers.HTMLFormElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { r.call(this, e); }
                function n(e, t) { if (!(this instanceof n))
                    throw new TypeError("DOM object constructor cannot be called as a function."); var o = i(document.createElement("img")); r.call(this, o), a(o, this), void 0 !== e && (o.width = e), void 0 !== t && (o.height = t); }
                var r = e.wrappers.HTMLElement, o = e.registerWrapper, i = e.unwrap, a = e.rewrap, s = window.HTMLImageElement;
                t.prototype = Object.create(r.prototype), o(s, t, document.createElement("img")), n.prototype = t.prototype, e.wrappers.HTMLImageElement = t, e.wrappers.Image = n;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = (e.mixin, e.wrappers.NodeList, e.registerWrapper), o = window.HTMLShadowElement;
                t.prototype = Object.create(n.prototype), t.prototype.constructor = t, o && r(o, t), e.wrappers.HTMLShadowElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { if (!e.defaultView)
                    return e; var t = d.get(e); if (!t) {
                    for (t = e.implementation.createHTMLDocument(""); t.lastChild;)
                        t.removeChild(t.lastChild);
                    d.set(e, t);
                } return t; }
                function n(e) { for (var n, r = t(e.ownerDocument), o = c(r.createDocumentFragment()); n = e.firstChild;)
                    o.appendChild(n); return o; }
                function r(e) { if (o.call(this, e), !p) {
                    var t = n(e);
                    u.set(this, l(t));
                } }
                var o = e.wrappers.HTMLElement, i = e.mixin, a = e.registerWrapper, s = e.unsafeUnwrap, c = e.unwrap, l = e.wrap, u = new WeakMap, d = new WeakMap, p = window.HTMLTemplateElement;
                r.prototype = Object.create(o.prototype), i(r.prototype, { constructor: r, get content() { return p ? l(s(this).content) : u.get(this); } }), p && a(p, r), e.wrappers.HTMLTemplateElement = r;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = e.registerWrapper, o = window.HTMLMediaElement;
                o && (t.prototype = Object.create(n.prototype), r(o, t, document.createElement("audio")), e.wrappers.HTMLMediaElement = t);
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { r.call(this, e); }
                function n(e) { if (!(this instanceof n))
                    throw new TypeError("DOM object constructor cannot be called as a function."); var t = i(document.createElement("audio")); r.call(this, t), a(t, this), t.setAttribute("preload", "auto"), void 0 !== e && t.setAttribute("src", e); }
                var r = e.wrappers.HTMLMediaElement, o = e.registerWrapper, i = e.unwrap, a = e.rewrap, s = window.HTMLAudioElement;
                s && (t.prototype = Object.create(r.prototype), o(s, t, document.createElement("audio")), n.prototype = t.prototype, e.wrappers.HTMLAudioElement = t, e.wrappers.Audio = n);
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { return e.replace(/\s+/g, " ").trim(); }
                function n(e) { o.call(this, e); }
                function r(e, t, n, i) { if (!(this instanceof r))
                    throw new TypeError("DOM object constructor cannot be called as a function."); var a = c(document.createElement("option")); o.call(this, a), s(a, this), void 0 !== e && (a.text = e), void 0 !== t && a.setAttribute("value", t), n === !0 && a.setAttribute("selected", ""), a.selected = i === !0; }
                var o = e.wrappers.HTMLElement, i = e.mixin, a = e.registerWrapper, s = e.rewrap, c = e.unwrap, l = e.wrap, u = window.HTMLOptionElement;
                n.prototype = Object.create(o.prototype), i(n.prototype, { get text() { return t(this.textContent); }, set text(e) { this.textContent = t(String(e)); }, get form() { return l(c(this).form); } }), a(u, n, document.createElement("option")), r.prototype = n.prototype, e.wrappers.HTMLOptionElement = n, e.wrappers.Option = r;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = e.mixin, o = e.registerWrapper, i = e.unwrap, a = e.wrap, s = window.HTMLSelectElement;
                t.prototype = Object.create(n.prototype), r(t.prototype, { add: function (e, t) { "object" == typeof t && (t = i(t)), i(this).add(i(e), t); }, remove: function (e) { return void 0 === e ? void n.prototype.remove.call(this) : ("object" == typeof e && (e = i(e)), void i(this).remove(e)); }, get form() { return a(i(this).form); } }), o(s, t, document.createElement("select")), e.wrappers.HTMLSelectElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = e.mixin, o = e.registerWrapper, i = e.unwrap, a = e.wrap, s = e.wrapHTMLCollection, c = window.HTMLTableElement;
                t.prototype = Object.create(n.prototype), r(t.prototype, { get caption() { return a(i(this).caption); }, createCaption: function () { return a(i(this).createCaption()); }, get tHead() { return a(i(this).tHead); }, createTHead: function () { return a(i(this).createTHead()); }, createTFoot: function () { return a(i(this).createTFoot()); }, get tFoot() { return a(i(this).tFoot); }, get tBodies() { return s(i(this).tBodies); }, createTBody: function () { return a(i(this).createTBody()); }, get rows() { return s(i(this).rows); }, insertRow: function (e) { return a(i(this).insertRow(e)); } }), o(c, t, document.createElement("table")), e.wrappers.HTMLTableElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = e.mixin, o = e.registerWrapper, i = e.wrapHTMLCollection, a = e.unwrap, s = e.wrap, c = window.HTMLTableSectionElement;
                t.prototype = Object.create(n.prototype), r(t.prototype, { constructor: t, get rows() { return i(a(this).rows); }, insertRow: function (e) { return s(a(this).insertRow(e)); } }), o(c, t, document.createElement("thead")), e.wrappers.HTMLTableSectionElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.HTMLElement, r = e.mixin, o = e.registerWrapper, i = e.wrapHTMLCollection, a = e.unwrap, s = e.wrap, c = window.HTMLTableRowElement;
                t.prototype = Object.create(n.prototype), r(t.prototype, { get cells() { return i(a(this).cells); }, insertCell: function (e) { return s(a(this).insertCell(e)); } }), o(c, t, document.createElement("tr")), e.wrappers.HTMLTableRowElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { switch (e.localName) {
                    case "content": return new n(e);
                    case "shadow": return new o(e);
                    case "template": return new i(e);
                } r.call(this, e); }
                var n = e.wrappers.HTMLContentElement, r = e.wrappers.HTMLElement, o = e.wrappers.HTMLShadowElement, i = e.wrappers.HTMLTemplateElement, a = (e.mixin, e.registerWrapper), s = window.HTMLUnknownElement;
                t.prototype = Object.create(r.prototype), a(s, t), e.wrappers.HTMLUnknownElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.Element, r = e.wrappers.HTMLElement, o = e.registerWrapper, i = (e.defineWrapGetter, e.unsafeUnwrap), a = e.wrap, s = e.mixin, c = "http://www.w3.org/2000/svg", l = window.SVGElement, u = document.createElementNS(c, "title");
                if (!("classList" in u)) {
                    var d = Object.getOwnPropertyDescriptor(n.prototype, "classList");
                    Object.defineProperty(r.prototype, "classList", d), delete n.prototype.classList;
                }
                t.prototype = Object.create(n.prototype), s(t.prototype, { get ownerSVGElement() { return a(i(this).ownerSVGElement); } }), o(l, t, document.createElementNS(c, "title")), e.wrappers.SVGElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { p.call(this, e); }
                var n = e.mixin, r = e.registerWrapper, o = e.unwrap, i = e.wrap, a = window.SVGUseElement, s = "http://www.w3.org/2000/svg", c = i(document.createElementNS(s, "g")), l = document.createElementNS(s, "use"), u = c.constructor, d = Object.getPrototypeOf(u.prototype), p = d.constructor;
                t.prototype = Object.create(d), "instanceRoot" in l && n(t.prototype, { get instanceRoot() { return i(o(this).instanceRoot); }, get animatedInstanceRoot() { return i(o(this).animatedInstanceRoot); } }), r(a, t, l), e.wrappers.SVGUseElement = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.EventTarget, r = e.mixin, o = e.registerWrapper, i = e.unsafeUnwrap, a = e.wrap, s = window.SVGElementInstance;
                s && (t.prototype = Object.create(n.prototype), r(t.prototype, { get correspondingElement() { return a(i(this).correspondingElement); }, get correspondingUseElement() { return a(i(this).correspondingUseElement); }, get parentNode() { return a(i(this).parentNode); }, get childNodes() { throw new Error("Not implemented"); }, get firstChild() { return a(i(this).firstChild); }, get lastChild() { return a(i(this).lastChild); }, get previousSibling() { return a(i(this).previousSibling); }, get nextSibling() { return a(i(this).nextSibling); } }), o(s, t), e.wrappers.SVGElementInstance = t);
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { o(e, this); }
                var n = e.mixin, r = e.registerWrapper, o = e.setWrapper, i = e.unsafeUnwrap, a = e.unwrap, s = e.unwrapIfNeeded, c = e.wrap, l = window.CanvasRenderingContext2D;
                n(t.prototype, { get canvas() { return c(i(this).canvas); }, drawImage: function () { arguments[0] = s(arguments[0]), i(this).drawImage.apply(i(this), arguments); }, createPattern: function () { return arguments[0] = a(arguments[0]), i(this).createPattern.apply(i(this), arguments); } }), r(l, t, document.createElement("canvas").getContext("2d")), e.wrappers.CanvasRenderingContext2D = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { i(e, this); }
                var n = e.addForwardingProperties, r = e.mixin, o = e.registerWrapper, i = e.setWrapper, a = e.unsafeUnwrap, s = e.unwrapIfNeeded, c = e.wrap, l = window.WebGLRenderingContext;
                if (l) {
                    r(t.prototype, { get canvas() { return c(a(this).canvas); }, texImage2D: function () { arguments[5] = s(arguments[5]), a(this).texImage2D.apply(a(this), arguments); }, texSubImage2D: function () { arguments[6] = s(arguments[6]), a(this).texSubImage2D.apply(a(this), arguments); } });
                    var u = Object.getPrototypeOf(l.prototype);
                    u !== Object.prototype && n(u, t.prototype);
                    var d = /WebKit/.test(navigator.userAgent) ? { drawingBufferHeight: null, drawingBufferWidth: null } : {};
                    o(l, t, d), e.wrappers.WebGLRenderingContext = t;
                }
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.Node, r = e.GetElementsByInterface, o = e.NonElementParentNodeInterface, i = e.ParentNodeInterface, a = e.SelectorsInterface, s = e.mixin, c = e.registerObject, l = e.registerWrapper, u = window.DocumentFragment;
                t.prototype = Object.create(n.prototype), s(t.prototype, i), s(t.prototype, a), s(t.prototype, r), s(t.prototype, o), l(u, t, document.createDocumentFragment()), e.wrappers.DocumentFragment = t;
                var d = c(document.createComment(""));
                e.wrappers.Comment = d;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { var t = d(u(e).ownerDocument.createDocumentFragment()); n.call(this, t), c(t, this); var o = e.shadowRoot; f.set(this, o), this.treeScope_ = new r(this, a(o || e)), h.set(this, e); }
                var n = e.wrappers.DocumentFragment, r = e.TreeScope, o = e.elementFromPoint, i = e.getInnerHTML, a = e.getTreeScope, s = e.mixin, c = e.rewrap, l = e.setInnerHTML, u = e.unsafeUnwrap, d = e.unwrap, p = e.wrap, h = new WeakMap, f = new WeakMap;
                t.prototype = Object.create(n.prototype), s(t.prototype, { constructor: t, get innerHTML() { return i(this); }, set innerHTML(e) { l(this, e), this.invalidateShadowRenderer(); }, get olderShadowRoot() { return f.get(this) || null; }, get host() { return h.get(this) || null; }, invalidateShadowRenderer: function () { return h.get(this).invalidateShadowRenderer(); }, elementFromPoint: function (e, t) { return o(this, this.ownerDocument, e, t); }, getSelection: function () { return document.getSelection(); }, get activeElement() { var e = d(this).ownerDocument.activeElement; if (!e || !e.nodeType)
                        return null; var t = p(e); if (t === this.host)
                        return null; for (; !this.contains(t) && !this.host.contains(t);) {
                        for (; t.parentNode;)
                            t = t.parentNode;
                        if (!t.host)
                            return null;
                        t = t.host;
                    } return t; } }), e.wrappers.ShadowRoot = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { var t = d(e).root; return t instanceof h ? t.host : null; }
                function n(t, n) { if (t.shadowRoot) {
                    n = Math.min(t.childNodes.length - 1, n);
                    var r = t.childNodes[n];
                    if (r) {
                        var o = e.getDestinationInsertionPoints(r);
                        if (o.length > 0) {
                            var i = o[0].parentNode;
                            i.nodeType == Node.ELEMENT_NODE && (t = i);
                        }
                    }
                } return t; }
                function r(e) { return e = u(e), t(e) || e; }
                function o(e) { a(e, this); }
                var i = e.registerWrapper, a = e.setWrapper, s = e.unsafeUnwrap, c = e.unwrap, l = e.unwrapIfNeeded, u = e.wrap, d = e.getTreeScope, p = window.Range, h = e.wrappers.ShadowRoot;
                o.prototype = { get startContainer() { return r(s(this).startContainer); }, get endContainer() { return r(s(this).endContainer); }, get commonAncestorContainer() { return r(s(this).commonAncestorContainer); }, setStart: function (e, t) { e = n(e, t), s(this).setStart(l(e), t); }, setEnd: function (e, t) { e = n(e, t), s(this).setEnd(l(e), t); }, setStartBefore: function (e) { s(this).setStartBefore(l(e)); }, setStartAfter: function (e) { s(this).setStartAfter(l(e)); }, setEndBefore: function (e) { s(this).setEndBefore(l(e)); }, setEndAfter: function (e) { s(this).setEndAfter(l(e)); }, selectNode: function (e) { s(this).selectNode(l(e)); }, selectNodeContents: function (e) { s(this).selectNodeContents(l(e)); }, compareBoundaryPoints: function (e, t) { return s(this).compareBoundaryPoints(e, c(t)); }, extractContents: function () { return u(s(this).extractContents()); }, cloneContents: function () { return u(s(this).cloneContents()); }, insertNode: function (e) { s(this).insertNode(l(e)); }, surroundContents: function (e) { s(this).surroundContents(l(e)); }, cloneRange: function () { return u(s(this).cloneRange()); }, isPointInRange: function (e, t) { return s(this).isPointInRange(l(e), t); }, comparePoint: function (e, t) { return s(this).comparePoint(l(e), t); }, intersectsNode: function (e) { return s(this).intersectsNode(l(e)); }, toString: function () { return s(this).toString(); } }, p.prototype.createContextualFragment && (o.prototype.createContextualFragment = function (e) { return u(s(this).createContextualFragment(e)); }), i(window.Range, o, document.createRange()), e.wrappers.Range = o;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { e.previousSibling_ = e.previousSibling, e.nextSibling_ = e.nextSibling, e.parentNode_ = e.parentNode; }
                function n(n, o, i) { var a = x(n), s = x(o), c = i ? x(i) : null; if (r(o), t(o), i)
                    n.firstChild === i && (n.firstChild_ = i), i.previousSibling_ = i.previousSibling;
                else {
                    n.lastChild_ = n.lastChild, n.lastChild === n.firstChild && (n.firstChild_ = n.firstChild);
                    var l = R(a.lastChild);
                    l && (l.nextSibling_ = l.nextSibling);
                } e.originalInsertBefore.call(a, s, c); }
                function r(n) { var r = x(n), o = r.parentNode; if (o) {
                    var i = R(o);
                    t(n), n.previousSibling && (n.previousSibling.nextSibling_ = n), n.nextSibling && (n.nextSibling.previousSibling_ = n), i.lastChild === n && (i.lastChild_ = n), i.firstChild === n && (i.firstChild_ = n), e.originalRemoveChild.call(o, r);
                } }
                function o(e) { P.set(e, []); }
                function i(e) { var t = P.get(e); return t || P.set(e, t = []), t; }
                function a(e) { for (var t = [], n = 0, r = e.firstChild; r; r = r.nextSibling)
                    t[n++] = r; return t; }
                function s() { for (var e = 0; e < F.length; e++) {
                    var t = F[e], n = t.parentRenderer;
                    n && n.dirty || t.render();
                } F = []; }
                function c() { T = null, s(); }
                function l(e) { var t = A.get(e); return t || (t = new h(e), A.set(e, t)), t; }
                function u(e) { var t = j(e).root; return t instanceof C ? t : null; }
                function d(e) { return l(e.host); }
                function p(e) { this.skip = !1, this.node = e, this.childNodes = []; }
                function h(e) { this.host = e, this.dirty = !1, this.invalidateAttributes(), this.associateNode(e); }
                function f(e) { for (var t = [], n = e.firstChild; n; n = n.nextSibling)
                    E(n) ? t.push.apply(t, i(n)) : t.push(n); return t; }
                function m(e) { if (e instanceof L)
                    return e; if (e instanceof O)
                    return null; for (var t = e.firstChild; t; t = t.nextSibling) {
                    var n = m(t);
                    if (n)
                        return n;
                } return null; }
                function w(e, t) { i(t).push(e); var n = k.get(e); n ? n.push(t) : k.set(e, [t]); }
                function v(e) { return k.get(e); }
                function g(e) { k.set(e, void 0); }
                function b(e, t) { var n = t.getAttribute("select"); if (!n)
                    return !0; if (n = n.trim(), !n)
                    return !0; if (!(e instanceof M))
                    return !1; if (!q.test(n))
                    return !1; try {
                    return e.matches(n);
                }
                catch (r) {
                    return !1;
                } }
                function y(e, t) { var n = v(t); return n && n[n.length - 1] === e; }
                function E(e) { return e instanceof O || e instanceof L; }
                function _(e) { return e.shadowRoot; }
                function S(e) { for (var t = [], n = e.shadowRoot; n; n = n.olderShadowRoot)
                    t.push(n); return t; }
                var T, M = e.wrappers.Element, O = e.wrappers.HTMLContentElement, L = e.wrappers.HTMLShadowElement, N = e.wrappers.Node, C = e.wrappers.ShadowRoot, j = (e.assert, e.getTreeScope), D = (e.mixin, e.oneOf), H = e.unsafeUnwrap, x = e.unwrap, R = e.wrap, I = e.ArraySplice, P = new WeakMap, k = new WeakMap, A = new WeakMap, W = D(window, ["requestAnimationFrame", "mozRequestAnimationFrame", "webkitRequestAnimationFrame", "setTimeout"]), F = [], U = new I;
                U.equals = function (e, t) { return x(e.node) === t; }, p.prototype = { append: function (e) { var t = new p(e); return this.childNodes.push(t), t; }, sync: function (e) { if (!this.skip) {
                        for (var t = this.node, o = this.childNodes, i = a(x(t)), s = e || new WeakMap, c = U.calculateSplices(o, i), l = 0, u = 0, d = 0, p = 0; p < c.length; p++) {
                            for (var h = c[p]; d < h.index; d++)
                                u++, o[l++].sync(s);
                            for (var f = h.removed.length, m = 0; f > m; m++) {
                                var w = R(i[u++]);
                                s.get(w) || r(w);
                            }
                            for (var v = h.addedCount, g = i[u] && R(i[u]), m = 0; v > m; m++) {
                                var b = o[l++], y = b.node;
                                n(t, y, g), s.set(y, !0), b.sync(s);
                            }
                            d += v;
                        }
                        for (var p = d; p < o.length; p++)
                            o[p].sync(s);
                    } } }, h.prototype = { render: function (e) { if (this.dirty) {
                        this.invalidateAttributes();
                        var t = this.host;
                        this.distribution(t);
                        var n = e || new p(t);
                        this.buildRenderTree(n, t);
                        var r = !e;
                        r && n.sync(), this.dirty = !1;
                    } }, get parentRenderer() { return j(this.host).renderer; }, invalidate: function () { if (!this.dirty) {
                        this.dirty = !0;
                        var e = this.parentRenderer;
                        if (e && e.invalidate(), F.push(this), T)
                            return;
                        T = window[W](c, 0);
                    } }, distribution: function (e) { this.resetAllSubtrees(e), this.distributionResolution(e); }, resetAll: function (e) { E(e) ? o(e) : g(e), this.resetAllSubtrees(e); }, resetAllSubtrees: function (e) { for (var t = e.firstChild; t; t = t.nextSibling)
                        this.resetAll(t); e.shadowRoot && this.resetAll(e.shadowRoot), e.olderShadowRoot && this.resetAll(e.olderShadowRoot); }, distributionResolution: function (e) { if (_(e)) {
                        for (var t = e, n = f(t), r = S(t), o = 0; o < r.length; o++)
                            this.poolDistribution(r[o], n);
                        for (var o = r.length - 1; o >= 0; o--) {
                            var i = r[o], a = m(i);
                            if (a) {
                                var s = i.olderShadowRoot;
                                s && (n = f(s));
                                for (var c = 0; c < n.length; c++)
                                    w(n[c], a);
                            }
                            this.distributionResolution(i);
                        }
                    } for (var l = e.firstChild; l; l = l.nextSibling)
                        this.distributionResolution(l); }, poolDistribution: function (e, t) { if (!(e instanceof L))
                        if (e instanceof O) {
                            var n = e;
                            this.updateDependentAttributes(n.getAttribute("select"));
                            for (var r = !1, o = 0; o < t.length; o++) {
                                var e = t[o];
                                e && b(e, n) && (w(e, n), t[o] = void 0, r = !0);
                            }
                            if (!r)
                                for (var i = n.firstChild; i; i = i.nextSibling)
                                    w(i, n);
                        }
                        else
                            for (var i = e.firstChild; i; i = i.nextSibling)
                                this.poolDistribution(i, t); }, buildRenderTree: function (e, t) { for (var n = this.compose(t), r = 0; r < n.length; r++) {
                        var o = n[r], i = e.append(o);
                        this.buildRenderTree(i, o);
                    } if (_(t)) {
                        var a = l(t);
                        a.dirty = !1;
                    } }, compose: function (e) { for (var t = [], n = e.shadowRoot || e, r = n.firstChild; r; r = r.nextSibling)
                        if (E(r)) {
                            this.associateNode(n);
                            for (var o = i(r), a = 0; a < o.length; a++) {
                                var s = o[a];
                                y(r, s) && t.push(s);
                            }
                        }
                        else
                            t.push(r); return t; }, invalidateAttributes: function () { this.attributes = Object.create(null); }, updateDependentAttributes: function (e) { if (e) {
                        var t = this.attributes;
                        /\.\w+/.test(e) && (t["class"] = !0), /#\w+/.test(e) && (t.id = !0), e.replace(/\[\s*([^\s=\|~\]]+)/g, function (e, n) { t[n] = !0; });
                    } }, dependsOnAttribute: function (e) { return this.attributes[e]; }, associateNode: function (e) { H(e).polymerShadowRenderer_ = this; } };
                var q = /^(:not\()?[*.#[a-zA-Z_|]/;
                N.prototype.invalidateShadowRenderer = function (e) { var t = H(this).polymerShadowRenderer_; return t ? (t.invalidate(), !0) : !1; }, O.prototype.getDistributedNodes = L.prototype.getDistributedNodes = function () { return s(), i(this); }, M.prototype.getDestinationInsertionPoints = function () { return s(), v(this) || []; }, O.prototype.nodeIsInserted_ = L.prototype.nodeIsInserted_ = function () { this.invalidateShadowRenderer(); var e, t = u(this); t && (e = d(t)), H(this).polymerShadowRenderer_ = e, e && e.invalidate(); }, e.getRendererForHost = l, e.getShadowTrees = S, e.renderAllPending = s, e.getDestinationInsertionPoints = v, e.visual = { insertBefore: n, remove: r };
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(t) { if (window[t]) {
                    r(!e.wrappers[t]);
                    var c = function (e) { n.call(this, e); };
                    c.prototype = Object.create(n.prototype), o(c.prototype, { get form() { return s(a(this).form); } }), i(window[t], c, document.createElement(t.slice(4, -7))), e.wrappers[t] = c;
                } }
                var n = e.wrappers.HTMLElement, r = e.assert, o = e.mixin, i = e.registerWrapper, a = e.unwrap, s = e.wrap, c = ["HTMLButtonElement", "HTMLFieldSetElement", "HTMLInputElement", "HTMLKeygenElement", "HTMLLabelElement", "HTMLLegendElement", "HTMLObjectElement", "HTMLOutputElement", "HTMLTextAreaElement"];
                c.forEach(t);
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { r(e, this); }
                var n = e.registerWrapper, r = e.setWrapper, o = e.unsafeUnwrap, i = e.unwrap, a = e.unwrapIfNeeded, s = e.wrap, c = window.Selection;
                t.prototype = { get anchorNode() { return s(o(this).anchorNode); }, get focusNode() { return s(o(this).focusNode); }, addRange: function (e) { o(this).addRange(a(e)); }, collapse: function (e, t) { o(this).collapse(a(e), t); }, containsNode: function (e, t) { return o(this).containsNode(a(e), t); }, getRangeAt: function (e) { return s(o(this).getRangeAt(e)); }, removeRange: function (e) { o(this).removeRange(i(e)); }, selectAllChildren: function (e) { o(this).selectAllChildren(e instanceof ShadowRoot ? o(e.host) : a(e)); }, toString: function () { return o(this).toString(); } }, c.prototype.extend && (t.prototype.extend = function (e, t) { o(this).extend(a(e), t); }), n(window.Selection, t, window.getSelection()), e.wrappers.Selection = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { r(e, this); }
                var n = e.registerWrapper, r = e.setWrapper, o = e.unsafeUnwrap, i = e.unwrapIfNeeded, a = e.wrap, s = window.TreeWalker;
                t.prototype = { get root() { return a(o(this).root); }, get currentNode() { return a(o(this).currentNode); }, set currentNode(e) { o(this).currentNode = i(e); }, get filter() { return o(this).filter; }, parentNode: function () { return a(o(this).parentNode()); }, firstChild: function () { return a(o(this).firstChild()); }, lastChild: function () { return a(o(this).lastChild()); }, previousSibling: function () { return a(o(this).previousSibling()); }, previousNode: function () { return a(o(this).previousNode()); }, nextNode: function () { return a(o(this).nextNode()); } }, n(s, t), e.wrappers.TreeWalker = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { u.call(this, e), this.treeScope_ = new w(this, null); }
                function n(e) { var n = document[e]; t.prototype[e] = function () { return j(n.apply(N(this), arguments)); }; }
                function r(e, t) { x.call(N(t), C(e)), o(e, t); }
                function o(e, t) { e.shadowRoot && t.adoptNode(e.shadowRoot), e instanceof m && i(e, t); for (var n = e.firstChild; n; n = n.nextSibling)
                    o(n, t); }
                function i(e, t) { var n = e.olderShadowRoot; n && t.adoptNode(n); }
                function a(e) { L(e, this); }
                function s(e, t) {
                    var n = document.implementation[t];
                    e.prototype[t] = function () { return j(n.apply(N(this), arguments)); };
                }
                function c(e, t) { var n = document.implementation[t]; e.prototype[t] = function () { return n.apply(N(this), arguments); }; }
                var l = e.GetElementsByInterface, u = e.wrappers.Node, d = e.ParentNodeInterface, p = e.NonElementParentNodeInterface, h = e.wrappers.Selection, f = e.SelectorsInterface, m = e.wrappers.ShadowRoot, w = e.TreeScope, v = e.cloneNode, g = e.defineGetter, b = e.defineWrapGetter, y = e.elementFromPoint, E = e.forwardMethodsToWrapper, _ = e.matchesNames, S = e.mixin, T = e.registerWrapper, M = e.renderAllPending, O = e.rewrap, L = e.setWrapper, N = e.unsafeUnwrap, C = e.unwrap, j = e.wrap, D = e.wrapEventTargetMethods, H = (e.wrapNodeList, new WeakMap);
                t.prototype = Object.create(u.prototype), b(t, "documentElement"), b(t, "body"), b(t, "head"), g(t, "activeElement", function () { var e = C(this).activeElement; if (!e || !e.nodeType)
                    return null; for (var t = j(e); !this.contains(t);) {
                    for (; t.parentNode;)
                        t = t.parentNode;
                    if (!t.host)
                        return null;
                    t = t.host;
                } return t; }), ["createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode"].forEach(n);
                var x = document.adoptNode, R = document.getSelection;
                S(t.prototype, { adoptNode: function (e) { return e.parentNode && e.parentNode.removeChild(e), r(e, this), e; }, elementFromPoint: function (e, t) { return y(this, this, e, t); }, importNode: function (e, t) { return v(e, t, N(this)); }, getSelection: function () { return M(), new h(R.call(C(this))); }, getElementsByName: function (e) { return f.querySelectorAll.call(this, "[name=" + JSON.stringify(String(e)) + "]"); } });
                var I = document.createTreeWalker, P = e.wrappers.TreeWalker;
                if (t.prototype.createTreeWalker = function (e, t, n, r) { var o = null; return n && (n.acceptNode && "function" == typeof n.acceptNode ? o = { acceptNode: function (e) { return n.acceptNode(j(e)); } } : "function" == typeof n && (o = function (e) { return n(j(e)); })), new P(I.call(C(this), C(e), t, o, r)); }, document.registerElement) {
                    var k = document.registerElement;
                    t.prototype.registerElement = function (t, n) { function r(e) { return e ? void L(e, this) : i ? document.createElement(i, t) : document.createElement(t); } var o, i; if (void 0 !== n && (o = n.prototype, i = n["extends"]), o || (o = Object.create(HTMLElement.prototype)), e.nativePrototypeTable.get(o))
                        throw new Error("NotSupportedError"); for (var a, s = Object.getPrototypeOf(o), c = []; s && !(a = e.nativePrototypeTable.get(s));)
                        c.push(s), s = Object.getPrototypeOf(s); if (!a)
                        throw new Error("NotSupportedError"); for (var l = Object.create(a), u = c.length - 1; u >= 0; u--)
                        l = Object.create(l); ["createdCallback", "attachedCallback", "detachedCallback", "attributeChangedCallback"].forEach(function (e) { var t = o[e]; t && (l[e] = function () { j(this) instanceof r || O(this), t.apply(j(this), arguments); }); }); var d = { prototype: l }; i && (d["extends"] = i), r.prototype = o, r.prototype.constructor = r, e.constructorTable.set(l, r), e.nativePrototypeTable.set(o, l); k.call(C(this), t, d); return r; }, E([window.HTMLDocument || window.Document], ["registerElement"]);
                }
                E([window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement, window.HTMLHtmlElement], ["appendChild", "compareDocumentPosition", "contains", "getElementsByClassName", "getElementsByTagName", "getElementsByTagNameNS", "insertBefore", "querySelector", "querySelectorAll", "removeChild", "replaceChild"]), E([window.HTMLBodyElement, window.HTMLHeadElement, window.HTMLHtmlElement], _), E([window.HTMLDocument || window.Document], ["adoptNode", "importNode", "contains", "createComment", "createDocumentFragment", "createElement", "createElementNS", "createEvent", "createEventNS", "createRange", "createTextNode", "createTreeWalker", "elementFromPoint", "getElementById", "getElementsByName", "getSelection"]), S(t.prototype, l), S(t.prototype, d), S(t.prototype, f), S(t.prototype, p), S(t.prototype, { get implementation() { var e = H.get(this); return e ? e : (e = new a(C(this).implementation), H.set(this, e), e); }, get defaultView() { return j(C(this).defaultView); } }), T(window.Document, t, document.implementation.createHTMLDocument("")), window.HTMLDocument && T(window.HTMLDocument, t), D([window.HTMLBodyElement, window.HTMLDocument || window.Document, window.HTMLHeadElement]);
                var A = document.implementation.createDocument;
                a.prototype.createDocument = function () { return arguments[2] = C(arguments[2]), j(A.apply(N(this), arguments)); }, s(a, "createDocumentType"), s(a, "createHTMLDocument"), c(a, "hasFeature"), T(window.DOMImplementation, a), E([window.DOMImplementation], ["createDocument", "createDocumentType", "createHTMLDocument", "hasFeature"]), e.adoptNodeNoRemove = r, e.wrappers.DOMImplementation = a, e.wrappers.Document = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { n.call(this, e); }
                var n = e.wrappers.EventTarget, r = e.wrappers.Selection, o = e.mixin, i = e.registerWrapper, a = e.renderAllPending, s = e.unwrap, c = e.unwrapIfNeeded, l = e.wrap, u = window.Window, d = window.getComputedStyle, p = window.getDefaultComputedStyle, h = window.getSelection;
                t.prototype = Object.create(n.prototype), u.prototype.getComputedStyle = function (e, t) { return l(this || window).getComputedStyle(c(e), t); }, p && (u.prototype.getDefaultComputedStyle = function (e, t) { return l(this || window).getDefaultComputedStyle(c(e), t); }), u.prototype.getSelection = function () { return l(this || window).getSelection(); }, delete window.getComputedStyle, delete window.getDefaultComputedStyle, delete window.getSelection, ["addEventListener", "removeEventListener", "dispatchEvent"].forEach(function (e) { u.prototype[e] = function () { var t = l(this || window); return t[e].apply(t, arguments); }, delete window[e]; }), o(t.prototype, { getComputedStyle: function (e, t) { return a(), d.call(s(this), c(e), t); }, getSelection: function () { return a(), new r(h.call(s(this))); }, get document() { return l(s(this).document); } }), p && (t.prototype.getDefaultComputedStyle = function (e, t) { return a(), p.call(s(this), c(e), t); }), i(u, t, window), e.wrappers.Window = t;
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                var t = e.unwrap, n = window.DataTransfer || window.Clipboard, r = n.prototype.setDragImage;
                r && (n.prototype.setDragImage = function (e, n, o) { r.call(this, t(e), n, o); });
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { var t; t = e instanceof i ? e : new i(e && o(e)), r(t, this); }
                var n = e.registerWrapper, r = e.setWrapper, o = e.unwrap, i = window.FormData;
                i && (n(i, t, new i), e.wrappers.FormData = t);
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                var t = e.unwrapIfNeeded, n = XMLHttpRequest.prototype.send;
                XMLHttpRequest.prototype.send = function (e) { return n.call(this, t(e)); };
            }(window.ShadowDOMPolyfill), function (e) {
                "use strict";
                function t(e) { var t = n[e], r = window[t]; if (r) {
                    var o = document.createElement(e), i = o.constructor;
                    window[t] = i;
                } }
                var n = (e.isWrapperFor, { a: "HTMLAnchorElement", area: "HTMLAreaElement", audio: "HTMLAudioElement", base: "HTMLBaseElement", body: "HTMLBodyElement", br: "HTMLBRElement", button: "HTMLButtonElement", canvas: "HTMLCanvasElement", caption: "HTMLTableCaptionElement", col: "HTMLTableColElement", content: "HTMLContentElement", data: "HTMLDataElement", datalist: "HTMLDataListElement", del: "HTMLModElement", dir: "HTMLDirectoryElement", div: "HTMLDivElement", dl: "HTMLDListElement", embed: "HTMLEmbedElement", fieldset: "HTMLFieldSetElement", font: "HTMLFontElement", form: "HTMLFormElement", frame: "HTMLFrameElement", frameset: "HTMLFrameSetElement", h1: "HTMLHeadingElement", head: "HTMLHeadElement", hr: "HTMLHRElement", html: "HTMLHtmlElement", iframe: "HTMLIFrameElement", img: "HTMLImageElement", input: "HTMLInputElement", keygen: "HTMLKeygenElement", label: "HTMLLabelElement", legend: "HTMLLegendElement", li: "HTMLLIElement", link: "HTMLLinkElement", map: "HTMLMapElement", marquee: "HTMLMarqueeElement", menu: "HTMLMenuElement", menuitem: "HTMLMenuItemElement", meta: "HTMLMetaElement", meter: "HTMLMeterElement", object: "HTMLObjectElement", ol: "HTMLOListElement", optgroup: "HTMLOptGroupElement", option: "HTMLOptionElement", output: "HTMLOutputElement", p: "HTMLParagraphElement", param: "HTMLParamElement", pre: "HTMLPreElement", progress: "HTMLProgressElement", q: "HTMLQuoteElement", script: "HTMLScriptElement", select: "HTMLSelectElement", shadow: "HTMLShadowElement", source: "HTMLSourceElement", span: "HTMLSpanElement", style: "HTMLStyleElement", table: "HTMLTableElement", tbody: "HTMLTableSectionElement", template: "HTMLTemplateElement", textarea: "HTMLTextAreaElement", thead: "HTMLTableSectionElement", time: "HTMLTimeElement", title: "HTMLTitleElement", tr: "HTMLTableRowElement", track: "HTMLTrackElement", ul: "HTMLUListElement", video: "HTMLVideoElement" });
                Object.keys(n).forEach(t), Object.getOwnPropertyNames(e.wrappers).forEach(function (t) { window[t] = e.wrappers[t]; });
            }(window.ShadowDOMPolyfill), function (e) { function t(e, t) { var n = ""; return Array.prototype.forEach.call(e, function (e) { n += e.textContent + "\n\n"; }), t || (n = n.replace(d, "")), n; } function n(e) { var t = document.createElement("style"); return t.textContent = e, t; } function r(e) { var t = n(e); document.head.appendChild(t); var r = []; if (t.sheet)
                try {
                    r = t.sheet.cssRules;
                }
                catch (o) { }
            else
                console.warn("sheet not found", t); return t.parentNode.removeChild(t), r; } function o() { C.initialized = !0, document.body.appendChild(C); var e = C.contentDocument, t = e.createElement("base"); t.href = document.baseURI, e.head.appendChild(t); } function i(e) { C.initialized || o(), document.body.appendChild(C), e(C.contentDocument), document.body.removeChild(C); } function a(e, t) { if (t) {
                var o;
                if (e.match("@import") && D) {
                    var a = n(e);
                    i(function (e) { e.head.appendChild(a.impl), o = Array.prototype.slice.call(a.sheet.cssRules, 0), t(o); });
                }
                else
                    o = r(e), t(o);
            } } function s(e) { e && l().appendChild(document.createTextNode(e)); } function c(e, t) { var r = n(e); r.setAttribute(t, ""), r.setAttribute(x, ""), document.head.appendChild(r); } function l() { return j || (j = document.createElement("style"), j.setAttribute(x, ""), j[x] = !0), j; } var u = { strictStyling: !1, registry: {}, shimStyling: function (e, n, r) { var o = this.prepareRoot(e, n, r), i = this.isTypeExtension(r), a = this.makeScopeSelector(n, i), s = t(o, !0); s = this.scopeCssText(s, a), e && (e.shimmedStyle = s), this.addCssToDocument(s, n); }, shimStyle: function (e, t) { return this.shimCssText(e.textContent, t); }, shimCssText: function (e, t) { return e = this.insertDirectives(e), this.scopeCssText(e, t); }, makeScopeSelector: function (e, t) { return e ? t ? "[is=" + e + "]" : e : ""; }, isTypeExtension: function (e) { return e && e.indexOf("-") < 0; }, prepareRoot: function (e, t, n) { var r = this.registerRoot(e, t, n); return this.replaceTextInStyles(r.rootStyles, this.insertDirectives), this.removeStyles(e, r.rootStyles), this.strictStyling && this.applyScopeToContent(e, t), r.scopeStyles; }, removeStyles: function (e, t) { for (var n, r = 0, o = t.length; o > r && (n = t[r]); r++)
                    n.parentNode.removeChild(n); }, registerRoot: function (e, t, n) { var r = this.registry[t] = { root: e, name: t, extendsName: n }, o = this.findStyles(e); r.rootStyles = o, r.scopeStyles = r.rootStyles; var i = this.registry[r.extendsName]; return i && (r.scopeStyles = i.scopeStyles.concat(r.scopeStyles)), r; }, findStyles: function (e) { if (!e)
                    return []; var t = e.querySelectorAll("style"); return Array.prototype.filter.call(t, function (e) { return !e.hasAttribute(R); }); }, applyScopeToContent: function (e, t) { e && (Array.prototype.forEach.call(e.querySelectorAll("*"), function (e) { e.setAttribute(t, ""); }), Array.prototype.forEach.call(e.querySelectorAll("template"), function (e) { this.applyScopeToContent(e.content, t); }, this)); }, insertDirectives: function (e) { return e = this.insertPolyfillDirectivesInCssText(e), this.insertPolyfillRulesInCssText(e); }, insertPolyfillDirectivesInCssText: function (e) { return e = e.replace(p, function (e, t) { return t.slice(0, -2) + "{"; }), e.replace(h, function (e, t) { return t + " {"; }); }, insertPolyfillRulesInCssText: function (e) { return e = e.replace(f, function (e, t) { return t.slice(0, -1); }), e.replace(m, function (e, t, n, r) { var o = e.replace(t, "").replace(n, ""); return r + o; }); }, scopeCssText: function (e, t) { var n = this.extractUnscopedRulesFromCssText(e); if (e = this.insertPolyfillHostInCssText(e), e = this.convertColonHost(e), e = this.convertColonHostContext(e), e = this.convertShadowDOMSelectors(e), t) {
                    var e, r = this;
                    a(e, function (n) { e = r.scopeRules(n, t); });
                } return e = e + "\n" + n, e.trim(); }, extractUnscopedRulesFromCssText: function (e) { for (var t, n = ""; t = w.exec(e);)
                    n += t[1].slice(0, -1) + "\n\n"; for (; t = v.exec(e);)
                    n += t[0].replace(t[2], "").replace(t[1], t[3]) + "\n\n"; return n; }, convertColonHost: function (e) { return this.convertColonRule(e, E, this.colonHostPartReplacer); }, convertColonHostContext: function (e) { return this.convertColonRule(e, _, this.colonHostContextPartReplacer); }, convertColonRule: function (e, t, n) { return e.replace(t, function (e, t, r, o) { if (t = O, r) {
                    for (var i, a = r.split(","), s = [], c = 0, l = a.length; l > c && (i = a[c]); c++)
                        i = i.trim(), s.push(n(t, i, o));
                    return s.join(",");
                } return t + o; }); }, colonHostContextPartReplacer: function (e, t, n) { return t.match(g) ? this.colonHostPartReplacer(e, t, n) : e + t + n + ", " + t + " " + e + n; }, colonHostPartReplacer: function (e, t, n) { return e + t.replace(g, "") + n; }, convertShadowDOMSelectors: function (e) { for (var t = 0; t < N.length; t++)
                    e = e.replace(N[t], " "); return e; }, scopeRules: function (e, t) { var n = ""; return e && Array.prototype.forEach.call(e, function (e) { if (e.selectorText && e.style && void 0 !== e.style.cssText)
                    n += this.scopeSelector(e.selectorText, t, this.strictStyling) + " {\n	", n += this.propertiesFromRule(e) + "\n}\n\n";
                else if (e.type === CSSRule.MEDIA_RULE)
                    n += "@media " + e.media.mediaText + " {\n", n += this.scopeRules(e.cssRules, t), n += "\n}\n\n";
                else
                    try {
                        e.cssText && (n += e.cssText + "\n\n");
                    }
                    catch (r) {
                        e.type === CSSRule.KEYFRAMES_RULE && e.cssRules && (n += this.ieSafeCssTextFromKeyFrameRule(e));
                    } }, this), n; }, ieSafeCssTextFromKeyFrameRule: function (e) { var t = "@keyframes " + e.name + " {"; return Array.prototype.forEach.call(e.cssRules, function (e) { t += " " + e.keyText + " {" + e.style.cssText + "}"; }), t += " }"; }, scopeSelector: function (e, t, n) { var r = [], o = e.split(","); return o.forEach(function (e) { e = e.trim(), this.selectorNeedsScoping(e, t) && (e = n && !e.match(O) ? this.applyStrictSelectorScope(e, t) : this.applySelectorScope(e, t)), r.push(e); }, this), r.join(", "); }, selectorNeedsScoping: function (e, t) { if (Array.isArray(t))
                    return !0; var n = this.makeScopeMatcher(t); return !e.match(n); }, makeScopeMatcher: function (e) { return e = e.replace(/\[/g, "\\[").replace(/\]/g, "\\]"), new RegExp("^(" + e + ")" + S, "m"); }, applySelectorScope: function (e, t) { return Array.isArray(t) ? this.applySelectorScopeList(e, t) : this.applySimpleSelectorScope(e, t); }, applySelectorScopeList: function (e, t) { for (var n, r = [], o = 0; n = t[o]; o++)
                    r.push(this.applySimpleSelectorScope(e, n)); return r.join(", "); }, applySimpleSelectorScope: function (e, t) { return e.match(L) ? (e = e.replace(O, t), e.replace(L, t + " ")) : t + " " + e; }, applyStrictSelectorScope: function (e, t) { t = t.replace(/\[is=([^\]]*)\]/g, "$1"); var n = [" ", ">", "+", "~"], r = e, o = "[" + t + "]"; return n.forEach(function (e) { var t = r.split(e); r = t.map(function (e) { var t = e.trim().replace(L, ""); return t && n.indexOf(t) < 0 && t.indexOf(o) < 0 && (e = t.replace(/([^:]*)(:*)(.*)/, "$1" + o + "$2$3")), e; }).join(e); }), r; }, insertPolyfillHostInCssText: function (e) { return e.replace(M, b).replace(T, g); }, propertiesFromRule: function (e) { var t = e.style.cssText; e.style.content && !e.style.content.match(/['"]+|attr/) && (t = t.replace(/content:[^;]*;/g, "content: '" + e.style.content + "';")); var n = e.style; for (var r in n)
                    "initial" === n[r] && (t += r + ": initial; "); return t; }, replaceTextInStyles: function (e, t) { e && t && (e instanceof Array || (e = [e]), Array.prototype.forEach.call(e, function (e) { e.textContent = t.call(this, e.textContent); }, this)); }, addCssToDocument: function (e, t) { e.match("@import") ? c(e, t) : s(e); } }, d = /\/\*[^*]*\*+([^\/*][^*]*\*+)*\//gim, p = /\/\*\s*@polyfill ([^*]*\*+([^\/*][^*]*\*+)*\/)([^{]*?){/gim, h = /polyfill-next-selector[^}]*content\:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim, f = /\/\*\s@polyfill-rule([^*]*\*+([^\/*][^*]*\*+)*)\//gim, m = /(polyfill-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, w = /\/\*\s@polyfill-unscoped-rule([^*]*\*+([^\/*][^*]*\*+)*)\//gim, v = /(polyfill-unscoped-rule)[^}]*(content\:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim, g = "-shadowcsshost", b = "-shadowcsscontext", y = ")(?:\\(((?:\\([^)(]*\\)|[^)(]*)+?)\\))?([^,{]*)", E = new RegExp("(" + g + y, "gim"), _ = new RegExp("(" + b + y, "gim"), S = "([>\\s~+[.,{:][\\s\\S]*)?$", T = /\:host/gim, M = /\:host-context/gim, O = g + "-no-combinator", L = new RegExp(g, "gim"), N = (new RegExp(b, "gim"), [/>>>/g, /::shadow/g, /::content/g, /\/deep\//g, /\/shadow\//g, /\/shadow-deep\//g, /\^\^/g, /\^/g]), C = document.createElement("iframe"); C.style.display = "none"; var j, D = navigator.userAgent.match("Chrome"), H = "shim-shadowdom", x = "shim-shadowdom-css", R = "no-shim"; if (window.ShadowDOMPolyfill) {
                s("style { display: none !important; }\n");
                var I = ShadowDOMPolyfill.wrap(document), P = I.querySelector("head");
                P.insertBefore(l(), P.childNodes[0]), document.addEventListener("DOMContentLoaded", function () { e.urlResolver; if (window.HTMLImports && !HTMLImports.useNative) {
                    var t = "link[rel=stylesheet][" + H + "]", n = "style[" + H + "]";
                    HTMLImports.importer.documentPreloadSelectors += "," + t, HTMLImports.importer.importsPreloadSelectors += "," + t, HTMLImports.parser.documentSelectors = [HTMLImports.parser.documentSelectors, t, n].join(",");
                    var r = HTMLImports.parser.parseGeneric;
                    HTMLImports.parser.parseGeneric = function (e) { if (!e[x]) {
                        var t = e.__importElement || e;
                        if (!t.hasAttribute(H))
                            return void r.call(this, e);
                        e.__resource && (t = e.ownerDocument.createElement("style"), t.textContent = e.__resource), HTMLImports.path.resolveUrlsInStyle(t, e.href), t.textContent = u.shimStyle(t), t.removeAttribute(H, ""), t.setAttribute(x, ""), t[x] = !0, t.parentNode !== P && (e.parentNode === P ? P.replaceChild(t, e) : this.addElementToDocument(t)), t.__importParsed = !0, this.markParsingComplete(e), this.parseNext();
                    } };
                    var o = HTMLImports.parser.hasResource;
                    HTMLImports.parser.hasResource = function (e) { return "link" === e.localName && "stylesheet" === e.rel && e.hasAttribute(H) ? e.__resource : o.call(this, e); };
                } });
            } e.ShadowCSS = u; }(window.WebComponents)), function (e) { window.ShadowDOMPolyfill ? (window.wrap = ShadowDOMPolyfill.wrapIfNeeded, window.unwrap = ShadowDOMPolyfill.unwrapIfNeeded) : window.wrap = window.unwrap = function (e) { return e; }; }(window.WebComponents), function (e) {
                "use strict";
                function t(e) { return void 0 !== p[e]; }
                function n() { s.call(this), this._isInvalid = !0; }
                function r(e) { return "" == e && n.call(this), e.toLowerCase(); }
                function o(e) { var t = e.charCodeAt(0); return t > 32 && 127 > t && -1 == [34, 35, 60, 62, 63, 96].indexOf(t) ? e : encodeURIComponent(e); }
                function i(e) { var t = e.charCodeAt(0); return t > 32 && 127 > t && -1 == [34, 35, 60, 62, 96].indexOf(t) ? e : encodeURIComponent(e); }
                function a(e, a, s) { function c(e) { b.push(e); } var l = a || "scheme start", u = 0, d = "", v = !1, g = !1, b = []; e: for (; (e[u - 1] != f || 0 == u) && !this._isInvalid;) {
                    var y = e[u];
                    switch (l) {
                        case "scheme start":
                            if (!y || !m.test(y)) {
                                if (a) {
                                    c("Invalid scheme.");
                                    break e;
                                }
                                d = "", l = "no scheme";
                                continue;
                            }
                            d += y.toLowerCase(), l = "scheme";
                            break;
                        case "scheme":
                            if (y && w.test(y))
                                d += y.toLowerCase();
                            else {
                                if (":" != y) {
                                    if (a) {
                                        if (f == y)
                                            break e;
                                        c("Code point not allowed in scheme: " + y);
                                        break e;
                                    }
                                    d = "", u = 0, l = "no scheme";
                                    continue;
                                }
                                if (this._scheme = d, d = "", a)
                                    break e;
                                t(this._scheme) && (this._isRelative = !0), l = "file" == this._scheme ? "relative" : this._isRelative && s && s._scheme == this._scheme ? "relative or authority" : this._isRelative ? "authority first slash" : "scheme data";
                            }
                            break;
                        case "scheme data":
                            "?" == y ? (this._query = "?", l = "query") : "#" == y ? (this._fragment = "#", l = "fragment") : f != y && "	" != y && "\n" != y && "\r" != y && (this._schemeData += o(y));
                            break;
                        case "no scheme":
                            if (s && t(s._scheme)) {
                                l = "relative";
                                continue;
                            }
                            c("Missing scheme."), n.call(this);
                            break;
                        case "relative or authority":
                            if ("/" != y || "/" != e[u + 1]) {
                                c("Expected /, got: " + y), l = "relative";
                                continue;
                            }
                            l = "authority ignore slashes";
                            break;
                        case "relative":
                            if (this._isRelative = !0, "file" != this._scheme && (this._scheme = s._scheme), f == y) {
                                this._host = s._host, this._port = s._port, this._path = s._path.slice(), this._query = s._query, this._username = s._username, this._password = s._password;
                                break e;
                            }
                            if ("/" == y || "\\" == y)
                                "\\" == y && c("\\ is an invalid code point."), l = "relative slash";
                            else if ("?" == y)
                                this._host = s._host, this._port = s._port, this._path = s._path.slice(), this._query = "?", this._username = s._username, this._password = s._password, l = "query";
                            else {
                                if ("#" != y) {
                                    var E = e[u + 1], _ = e[u + 2];
                                    ("file" != this._scheme || !m.test(y) || ":" != E && "|" != E || f != _ && "/" != _ && "\\" != _ && "?" != _ && "#" != _) && (this._host = s._host, this._port = s._port, this._username = s._username, this._password = s._password, this._path = s._path.slice(), this._path.pop()), l = "relative path";
                                    continue;
                                }
                                this._host = s._host, this._port = s._port, this._path = s._path.slice(), this._query = s._query, this._fragment = "#", this._username = s._username, this._password = s._password, l = "fragment";
                            }
                            break;
                        case "relative slash":
                            if ("/" != y && "\\" != y) {
                                "file" != this._scheme && (this._host = s._host, this._port = s._port, this._username = s._username, this._password = s._password), l = "relative path";
                                continue;
                            }
                            "\\" == y && c("\\ is an invalid code point."), l = "file" == this._scheme ? "file host" : "authority ignore slashes";
                            break;
                        case "authority first slash":
                            if ("/" != y) {
                                c("Expected '/', got: " + y), l = "authority ignore slashes";
                                continue;
                            }
                            l = "authority second slash";
                            break;
                        case "authority second slash":
                            if (l = "authority ignore slashes", "/" != y) {
                                c("Expected '/', got: " + y);
                                continue;
                            }
                            break;
                        case "authority ignore slashes":
                            if ("/" != y && "\\" != y) {
                                l = "authority";
                                continue;
                            }
                            c("Expected authority, got: " + y);
                            break;
                        case "authority":
                            if ("@" == y) {
                                v && (c("@ already seen."), d += "%40"), v = !0;
                                for (var S = 0; S < d.length; S++) {
                                    var T = d[S];
                                    if ("	" != T && "\n" != T && "\r" != T)
                                        if (":" != T || null !== this._password) {
                                            var M = o(T);
                                            null !== this._password ? this._password += M : this._username += M;
                                        }
                                        else
                                            this._password = "";
                                    else
                                        c("Invalid whitespace in authority.");
                                }
                                d = "";
                            }
                            else {
                                if (f == y || "/" == y || "\\" == y || "?" == y || "#" == y) {
                                    u -= d.length, d = "", l = "host";
                                    continue;
                                }
                                d += y;
                            }
                            break;
                        case "file host":
                            if (f == y || "/" == y || "\\" == y || "?" == y || "#" == y) {
                                2 != d.length || !m.test(d[0]) || ":" != d[1] && "|" != d[1] ? 0 == d.length ? l = "relative path start" : (this._host = r.call(this, d), d = "", l = "relative path start") : l = "relative path";
                                continue;
                            }
                            "	" == y || "\n" == y || "\r" == y ? c("Invalid whitespace in file host.") : d += y;
                            break;
                        case "host":
                        case "hostname":
                            if (":" != y || g) {
                                if (f == y || "/" == y || "\\" == y || "?" == y || "#" == y) {
                                    if (this._host = r.call(this, d), d = "", l = "relative path start", a)
                                        break e;
                                    continue;
                                }
                                "	" != y && "\n" != y && "\r" != y ? ("[" == y ? g = !0 : "]" == y && (g = !1), d += y) : c("Invalid code point in host/hostname: " + y);
                            }
                            else if (this._host = r.call(this, d), d = "", l = "port", "hostname" == a)
                                break e;
                            break;
                        case "port":
                            if (/[0-9]/.test(y))
                                d += y;
                            else {
                                if (f == y || "/" == y || "\\" == y || "?" == y || "#" == y || a) {
                                    if ("" != d) {
                                        var O = parseInt(d, 10);
                                        O != p[this._scheme] && (this._port = O + ""), d = "";
                                    }
                                    if (a)
                                        break e;
                                    l = "relative path start";
                                    continue;
                                }
                                "	" == y || "\n" == y || "\r" == y ? c("Invalid code point in port: " + y) : n.call(this);
                            }
                            break;
                        case "relative path start":
                            if ("\\" == y && c("'\\' not allowed in path."), l = "relative path", "/" != y && "\\" != y)
                                continue;
                            break;
                        case "relative path":
                            if (f != y && "/" != y && "\\" != y && (a || "?" != y && "#" != y))
                                "	" != y && "\n" != y && "\r" != y && (d += o(y));
                            else {
                                "\\" == y && c("\\ not allowed in relative path.");
                                var L;
                                (L = h[d.toLowerCase()]) && (d = L), ".." == d ? (this._path.pop(), "/" != y && "\\" != y && this._path.push("")) : "." == d && "/" != y && "\\" != y ? this._path.push("") : "." != d && ("file" == this._scheme && 0 == this._path.length && 2 == d.length && m.test(d[0]) && "|" == d[1] && (d = d[0] + ":"), this._path.push(d)), d = "", "?" == y ? (this._query = "?", l = "query") : "#" == y && (this._fragment = "#", l = "fragment");
                            }
                            break;
                        case "query":
                            a || "#" != y ? f != y && "	" != y && "\n" != y && "\r" != y && (this._query += i(y)) : (this._fragment = "#", l = "fragment");
                            break;
                        case "fragment": f != y && "	" != y && "\n" != y && "\r" != y && (this._fragment += y);
                    }
                    u++;
                } }
                function s() { this._scheme = "", this._schemeData = "", this._username = "", this._password = null, this._host = "", this._port = "", this._path = [], this._query = "", this._fragment = "", this._isInvalid = !1, this._isRelative = !1; }
                function c(e, t) { void 0 === t || t instanceof c || (t = new c(String(t))), this._url = e, s.call(this); var n = e.replace(/^[ \t\r\n\f]+|[ \t\r\n\f]+$/g, ""); a.call(this, n, null, t); }
                var l = !1;
                if (!e.forceJURL)
                    try {
                        var u = new URL("b", "http://a");
                        u.pathname = "c%20d", l = "http://a/c%20d" === u.href;
                    }
                    catch (d) { }
                if (!l) {
                    var p = Object.create(null);
                    p.ftp = 21, p.file = 0, p.gopher = 70, p.http = 80, p.https = 443, p.ws = 80, p.wss = 443;
                    var h = Object.create(null);
                    h["%2e"] = ".", h[".%2e"] = "..", h["%2e."] = "..", h["%2e%2e"] = "..";
                    var f = void 0, m = /[a-zA-Z]/, w = /[a-zA-Z0-9\+\-\.]/;
                    c.prototype = { toString: function () { return this.href; }, get href() { if (this._isInvalid)
                            return this._url; var e = ""; return ("" != this._username || null != this._password) && (e = this._username + (null != this._password ? ":" + this._password : "") + "@"), this.protocol + (this._isRelative ? "//" + e + this.host : "") + this.pathname + this._query + this._fragment; }, set href(e) { s.call(this), a.call(this, e); }, get protocol() { return this._scheme + ":"; }, set protocol(e) { this._isInvalid || a.call(this, e + ":", "scheme start"); }, get host() { return this._isInvalid ? "" : this._port ? this._host + ":" + this._port : this._host; }, set host(e) { !this._isInvalid && this._isRelative && a.call(this, e, "host"); }, get hostname() { return this._host; }, set hostname(e) { !this._isInvalid && this._isRelative && a.call(this, e, "hostname"); }, get port() { return this._port; }, set port(e) { !this._isInvalid && this._isRelative && a.call(this, e, "port"); }, get pathname() { return this._isInvalid ? "" : this._isRelative ? "/" + this._path.join("/") : this._schemeData; }, set pathname(e) { !this._isInvalid && this._isRelative && (this._path = [], a.call(this, e, "relative path start")); }, get search() { return this._isInvalid || !this._query || "?" == this._query ? "" : this._query; }, set search(e) { !this._isInvalid && this._isRelative && (this._query = "?", "?" == e[0] && (e = e.slice(1)), a.call(this, e, "query")); }, get hash() { return this._isInvalid || !this._fragment || "#" == this._fragment ? "" : this._fragment; }, set hash(e) { this._isInvalid || (this._fragment = "#", "#" == e[0] && (e = e.slice(1)), a.call(this, e, "fragment")); }, get origin() { var e; if (this._isInvalid || !this._scheme)
                            return ""; switch (this._scheme) {
                            case "data":
                            case "file":
                            case "javascript":
                            case "mailto": return "null";
                        } return e = this.host, e ? this._scheme + "://" + e : ""; } };
                    var v = e.URL;
                    v && (c.createObjectURL = function (e) { return v.createObjectURL.apply(v, arguments); }, c.revokeObjectURL = function (e) { v.revokeObjectURL(e); }), e.URL = c;
                }
            }(self), function (e) { function t(e) { y.push(e), b || (b = !0, m(r)); } function n(e) { return window.ShadowDOMPolyfill && window.ShadowDOMPolyfill.wrapIfNeeded(e) || e; } function r() { b = !1; var e = y; y = [], e.sort(function (e, t) { return e.uid_ - t.uid_; }); var t = !1; e.forEach(function (e) { var n = e.takeRecords(); o(e), n.length && (e.callback_(n, e), t = !0); }), t && r(); } function o(e) { e.nodes_.forEach(function (t) { var n = w.get(t); n && n.forEach(function (t) { t.observer === e && t.removeTransientObservers(); }); }); } function i(e, t) { for (var n = e; n; n = n.parentNode) {
                var r = w.get(n);
                if (r)
                    for (var o = 0; o < r.length; o++) {
                        var i = r[o], a = i.options;
                        if (n === e || a.subtree) {
                            var s = t(a);
                            s && i.enqueue(s);
                        }
                    }
            } } function a(e) { this.callback_ = e, this.nodes_ = [], this.records_ = [], this.uid_ = ++E; } function s(e, t) { this.type = e, this.target = t, this.addedNodes = [], this.removedNodes = [], this.previousSibling = null, this.nextSibling = null, this.attributeName = null, this.attributeNamespace = null, this.oldValue = null; } function c(e) { var t = new s(e.type, e.target); return t.addedNodes = e.addedNodes.slice(), t.removedNodes = e.removedNodes.slice(), t.previousSibling = e.previousSibling, t.nextSibling = e.nextSibling, t.attributeName = e.attributeName, t.attributeNamespace = e.attributeNamespace, t.oldValue = e.oldValue, t; } function l(e, t) { return _ = new s(e, t); } function u(e) { return S ? S : (S = c(_), S.oldValue = e, S); } function d() { _ = S = void 0; } function p(e) { return e === S || e === _; } function h(e, t) { return e === t ? e : S && p(e) ? S : null; } function f(e, t, n) { this.observer = e, this.target = t, this.options = n, this.transientObservedNodes = []; } if (!e.JsMutationObserver) {
                var m, w = new WeakMap;
                if (/Trident|Edge/.test(navigator.userAgent))
                    m = setTimeout;
                else if (window.setImmediate)
                    m = window.setImmediate;
                else {
                    var v = [], g = String(Math.random());
                    window.addEventListener("message", function (e) { if (e.data === g) {
                        var t = v;
                        v = [], t.forEach(function (e) { e(); });
                    } }), m = function (e) { v.push(e), window.postMessage(g, "*"); };
                }
                var b = !1, y = [], E = 0;
                a.prototype = { observe: function (e, t) { if (e = n(e), !t.childList && !t.attributes && !t.characterData || t.attributeOldValue && !t.attributes || t.attributeFilter && t.attributeFilter.length && !t.attributes || t.characterDataOldValue && !t.characterData)
                        throw new SyntaxError; var r = w.get(e); r || w.set(e, r = []); for (var o, i = 0; i < r.length; i++)
                        if (r[i].observer === this) {
                            o = r[i], o.removeListeners(), o.options = t;
                            break;
                        } o || (o = new f(this, e, t), r.push(o), this.nodes_.push(e)), o.addListeners(); }, disconnect: function () { this.nodes_.forEach(function (e) { for (var t = w.get(e), n = 0; n < t.length; n++) {
                        var r = t[n];
                        if (r.observer === this) {
                            r.removeListeners(), t.splice(n, 1);
                            break;
                        }
                    } }, this), this.records_ = []; }, takeRecords: function () { var e = this.records_; return this.records_ = [], e; } };
                var _, S;
                f.prototype = { enqueue: function (e) { var n = this.observer.records_, r = n.length; if (n.length > 0) {
                        var o = n[r - 1], i = h(o, e);
                        if (i)
                            return void (n[r - 1] = i);
                    }
                    else
                        t(this.observer); n[r] = e; }, addListeners: function () { this.addListeners_(this.target); }, addListeners_: function (e) { var t = this.options; t.attributes && e.addEventListener("DOMAttrModified", this, !0), t.characterData && e.addEventListener("DOMCharacterDataModified", this, !0), t.childList && e.addEventListener("DOMNodeInserted", this, !0), (t.childList || t.subtree) && e.addEventListener("DOMNodeRemoved", this, !0); }, removeListeners: function () { this.removeListeners_(this.target); }, removeListeners_: function (e) { var t = this.options; t.attributes && e.removeEventListener("DOMAttrModified", this, !0), t.characterData && e.removeEventListener("DOMCharacterDataModified", this, !0), t.childList && e.removeEventListener("DOMNodeInserted", this, !0), (t.childList || t.subtree) && e.removeEventListener("DOMNodeRemoved", this, !0); }, addTransientObserver: function (e) { if (e !== this.target) {
                        this.addListeners_(e), this.transientObservedNodes.push(e);
                        var t = w.get(e);
                        t || w.set(e, t = []), t.push(this);
                    } }, removeTransientObservers: function () { var e = this.transientObservedNodes; this.transientObservedNodes = [], e.forEach(function (e) { this.removeListeners_(e); for (var t = w.get(e), n = 0; n < t.length; n++)
                        if (t[n] === this) {
                            t.splice(n, 1);
                            break;
                        } }, this); }, handleEvent: function (e) { switch (e.stopImmediatePropagation(), e.type) {
                        case "DOMAttrModified":
                            var t = e.attrName, n = e.relatedNode.namespaceURI, r = e.target, o = new l("attributes", r);
                            o.attributeName = t, o.attributeNamespace = n;
                            var a = e.attrChange === MutationEvent.ADDITION ? null : e.prevValue;
                            i(r, function (e) { return !e.attributes || e.attributeFilter && e.attributeFilter.length && -1 === e.attributeFilter.indexOf(t) && -1 === e.attributeFilter.indexOf(n) ? void 0 : e.attributeOldValue ? u(a) : o; });
                            break;
                        case "DOMCharacterDataModified":
                            var r = e.target, o = l("characterData", r), a = e.prevValue;
                            i(r, function (e) { return e.characterData ? e.characterDataOldValue ? u(a) : o : void 0; });
                            break;
                        case "DOMNodeRemoved": this.addTransientObserver(e.target);
                        case "DOMNodeInserted":
                            var s, c, p = e.target;
                            "DOMNodeInserted" === e.type ? (s = [p], c = []) : (s = [], c = [p]);
                            var h = p.previousSibling, f = p.nextSibling, o = l("childList", e.target.parentNode);
                            o.addedNodes = s, o.removedNodes = c, o.previousSibling = h, o.nextSibling = f, i(e.relatedNode, function (e) { return e.childList ? o : void 0; });
                    } d(); } }, e.JsMutationObserver = a, e.MutationObserver || (e.MutationObserver = a, a._isPolyfilled = !0);
            } }(self), function (e) {
                "use strict";
                if (!window.performance) {
                    var t = Date.now();
                    window.performance = { now: function () { return Date.now() - t; } };
                }
                window.requestAnimationFrame || (window.requestAnimationFrame = function () { var e = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame; return e ? function (t) { return e(function () { t(performance.now()); }); } : function (e) { return window.setTimeout(e, 1e3 / 60); }; }()), window.cancelAnimationFrame || (window.cancelAnimationFrame = function () { return window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || function (e) { clearTimeout(e); }; }());
                var n = function () { var e = document.createEvent("Event"); return e.initEvent("foo", !0, !0), e.preventDefault(), e.defaultPrevented; }();
                if (!n) {
                    var r = Event.prototype.preventDefault;
                    Event.prototype.preventDefault = function () { this.cancelable && (r.call(this), Object.defineProperty(this, "defaultPrevented", { get: function () { return !0; }, configurable: !0 })); };
                }
                var o = /Trident/.test(navigator.userAgent);
                if ((!window.CustomEvent || o && "function" != typeof window.CustomEvent) && (window.CustomEvent = function (e, t) { t = t || {}; var n = document.createEvent("CustomEvent"); return n.initCustomEvent(e, Boolean(t.bubbles), Boolean(t.cancelable), t.detail), n; }, window.CustomEvent.prototype = window.Event.prototype), !window.Event || o && "function" != typeof window.Event) {
                    var i = window.Event;
                    window.Event = function (e, t) { t = t || {}; var n = document.createEvent("Event"); return n.initEvent(e, Boolean(t.bubbles), Boolean(t.cancelable)), n; }, window.Event.prototype = i.prototype;
                }
            }(window.WebComponents), window.HTMLImports = window.HTMLImports || { flags: {} }, function (e) {
                function t(e, t) { t = t || f, r(function () { i(e, t); }, t); }
                function n(e) { return "complete" === e.readyState || e.readyState === v; }
                function r(e, t) { if (n(t))
                    e && e();
                else {
                    var o = function () { ("complete" === t.readyState || t.readyState === v) && (t.removeEventListener(g, o), r(e, t)); };
                    t.addEventListener(g, o);
                } }
                function o(e) { e.target.__loaded = !0; }
                function i(e, t) {
                    function n() { c == l && e && e({ allImports: s, loadedImports: u, errorImports: d }); }
                    function r(e) {
                        o(e), u.push(this),
                            c++, n();
                    }
                    function i(e) { d.push(this), c++, n(); }
                    var s = t.querySelectorAll("link[rel=import]"), c = 0, l = s.length, u = [], d = [];
                    if (l)
                        for (var p, h = 0; l > h && (p = s[h]); h++)
                            a(p) ? (u.push(this), c++, n()) : (p.addEventListener("load", r), p.addEventListener("error", i));
                    else
                        n();
                }
                function a(e) { return d ? e.__loaded || e["import"] && "loading" !== e["import"].readyState : e.__importParsed; }
                function s(e) { for (var t, n = 0, r = e.length; r > n && (t = e[n]); n++)
                    c(t) && l(t); }
                function c(e) { return "link" === e.localName && "import" === e.rel; }
                function l(e) { var t = e["import"]; t ? o({ target: e }) : (e.addEventListener("load", o), e.addEventListener("error", o)); }
                var u = "import", d = Boolean(u in document.createElement("link")), p = Boolean(window.ShadowDOMPolyfill), h = function (e) { return p ? window.ShadowDOMPolyfill.wrapIfNeeded(e) : e; }, f = h(document), m = { get: function () { var e = window.HTMLImports.currentScript || document.currentScript || ("complete" !== document.readyState ? document.scripts[document.scripts.length - 1] : null); return h(e); }, configurable: !0 };
                Object.defineProperty(document, "_currentScript", m), Object.defineProperty(f, "_currentScript", m);
                var w = /Trident/.test(navigator.userAgent), v = w ? "complete" : "interactive", g = "readystatechange";
                d && (new MutationObserver(function (e) { for (var t, n = 0, r = e.length; r > n && (t = e[n]); n++)
                    t.addedNodes && s(t.addedNodes); }).observe(document.head, { childList: !0 }), function () { if ("loading" === document.readyState)
                    for (var e, t = document.querySelectorAll("link[rel=import]"), n = 0, r = t.length; r > n && (e = t[n]); n++)
                        l(e); }()), t(function (e) { window.HTMLImports.ready = !0, window.HTMLImports.readyTime = (new Date).getTime(); var t = f.createEvent("CustomEvent"); t.initCustomEvent("HTMLImportsLoaded", !0, !0, e), f.dispatchEvent(t); }), e.IMPORT_LINK_TYPE = u, e.useNative = d, e.rootDocument = f, e.whenReady = t, e.isIE = w;
            }(window.HTMLImports), function (e) { var t = [], n = function (e) { t.push(e); }, r = function () { t.forEach(function (t) { t(e); }); }; e.addModule = n, e.initializeModules = r; }(window.HTMLImports), window.HTMLImports.addModule(function (e) { var t = /(url\()([^)]*)(\))/g, n = /(@import[\s]+(?!url\())([^;]*)(;)/g, r = { resolveUrlsInStyle: function (e, t) { var n = e.ownerDocument, r = n.createElement("a"); return e.textContent = this.resolveUrlsInCssText(e.textContent, t, r), e; }, resolveUrlsInCssText: function (e, r, o) { var i = this.replaceUrls(e, o, r, t); return i = this.replaceUrls(i, o, r, n); }, replaceUrls: function (e, t, n, r) { return e.replace(r, function (e, r, o, i) { var a = o.replace(/["']/g, ""); return n && (a = new URL(a, n).href), t.href = a, a = t.href, r + "'" + a + "'" + i; }); } }; e.path = r; }), window.HTMLImports.addModule(function (e) { var t = { async: !0, ok: function (e) { return e.status >= 200 && e.status < 300 || 304 === e.status || 0 === e.status; }, load: function (n, r, o) { var i = new XMLHttpRequest; return (e.flags.debug || e.flags.bust) && (n += "?" + Math.random()), i.open("GET", n, t.async), i.addEventListener("readystatechange", function (e) { if (4 === i.readyState) {
                    var n = null;
                    try {
                        var a = i.getResponseHeader("Location");
                        a && (n = "/" === a.substr(0, 1) ? location.origin + a : a);
                    }
                    catch (e) {
                        console.error(e.message);
                    }
                    r.call(o, !t.ok(i) && i, i.response || i.responseText, n);
                } }), i.send(), i; }, loadDocument: function (e, t, n) { this.load(e, t, n).responseType = "document"; } }; e.xhr = t; }), window.HTMLImports.addModule(function (e) { var t = e.xhr, n = e.flags, r = function (e, t) { this.cache = {}, this.onload = e, this.oncomplete = t, this.inflight = 0, this.pending = {}; }; r.prototype = { addNodes: function (e) { this.inflight += e.length; for (var t, n = 0, r = e.length; r > n && (t = e[n]); n++)
                    this.require(t); this.checkDone(); }, addNode: function (e) { this.inflight++, this.require(e), this.checkDone(); }, require: function (e) { var t = e.src || e.href; e.__nodeUrl = t, this.dedupe(t, e) || this.fetch(t, e); }, dedupe: function (e, t) { if (this.pending[e])
                    return this.pending[e].push(t), !0; return this.cache[e] ? (this.onload(e, t, this.cache[e]), this.tail(), !0) : (this.pending[e] = [t], !1); }, fetch: function (e, r) { if (n.load && console.log("fetch", e, r), e)
                    if (e.match(/^data:/)) {
                        var o = e.split(","), i = o[0], a = o[1];
                        a = i.indexOf(";base64") > -1 ? atob(a) : decodeURIComponent(a), setTimeout(function () { this.receive(e, r, null, a); }.bind(this), 0);
                    }
                    else {
                        var s = function (t, n, o) { this.receive(e, r, t, n, o); }.bind(this);
                        t.load(e, s);
                    }
                else
                    setTimeout(function () { this.receive(e, r, { error: "href must be specified" }, null); }.bind(this), 0); }, receive: function (e, t, n, r, o) { this.cache[e] = r; for (var i, a = this.pending[e], s = 0, c = a.length; c > s && (i = a[s]); s++)
                    this.onload(e, i, r, n, o), this.tail(); this.pending[e] = null; }, tail: function () { --this.inflight, this.checkDone(); }, checkDone: function () { this.inflight || this.oncomplete(); } }, e.Loader = r; }), window.HTMLImports.addModule(function (e) { var t = function (e) { this.addCallback = e, this.mo = new MutationObserver(this.handler.bind(this)); }; t.prototype = { handler: function (e) { for (var t, n = 0, r = e.length; r > n && (t = e[n]); n++)
                    "childList" === t.type && t.addedNodes.length && this.addedNodes(t.addedNodes); }, addedNodes: function (e) { this.addCallback && this.addCallback(e); for (var t, n = 0, r = e.length; r > n && (t = e[n]); n++)
                    t.children && t.children.length && this.addedNodes(t.children); }, observe: function (e) { this.mo.observe(e, { childList: !0, subtree: !0 }); } }, e.Observer = t; }), window.HTMLImports.addModule(function (e) { function t(e) { return "link" === e.localName && e.rel === u; } function n(e) { var t = r(e); return "data:text/javascript;charset=utf-8," + encodeURIComponent(t); } function r(e) { return e.textContent + o(e); } function o(e) { var t = e.ownerDocument; t.__importedScripts = t.__importedScripts || 0; var n = e.ownerDocument.baseURI, r = t.__importedScripts ? "-" + t.__importedScripts : ""; return t.__importedScripts++, "\n//# sourceURL=" + n + r + ".js\n"; } function i(e) { var t = e.ownerDocument.createElement("style"); return t.textContent = e.textContent, a.resolveUrlsInStyle(t), t; } var a = e.path, s = e.rootDocument, c = e.flags, l = e.isIE, u = e.IMPORT_LINK_TYPE, d = "link[rel=" + u + "]", p = { documentSelectors: d, importsSelectors: [d, "link[rel=stylesheet]:not([type])", "style:not([type])", "script:not([type])", 'script[type="application/javascript"]', 'script[type="text/javascript"]'].join(","), map: { link: "parseLink", script: "parseScript", style: "parseStyle" }, dynamicElements: [], parseNext: function () { var e = this.nextToParse(); e && this.parse(e); }, parse: function (e) { if (this.isParsed(e))
                    return void (c.parse && console.log("[%s] is already parsed", e.localName)); var t = this[this.map[e.localName]]; t && (this.markParsing(e), t.call(this, e)); }, parseDynamic: function (e, t) { this.dynamicElements.push(e), t || this.parseNext(); }, markParsing: function (e) { c.parse && console.log("parsing", e), this.parsingElement = e; }, markParsingComplete: function (e) { e.__importParsed = !0, this.markDynamicParsingComplete(e), e.__importElement && (e.__importElement.__importParsed = !0, this.markDynamicParsingComplete(e.__importElement)), this.parsingElement = null, c.parse && console.log("completed", e); }, markDynamicParsingComplete: function (e) { var t = this.dynamicElements.indexOf(e); t >= 0 && this.dynamicElements.splice(t, 1); }, parseImport: function (e) { if (e["import"] = e.__doc, window.HTMLImports.__importsParsingHook && window.HTMLImports.__importsParsingHook(e), e["import"] && (e["import"].__importParsed = !0), this.markParsingComplete(e), e.__resource && !e.__error ? e.dispatchEvent(new CustomEvent("load", { bubbles: !1 })) : e.dispatchEvent(new CustomEvent("error", { bubbles: !1 })), e.__pending)
                    for (var t; e.__pending.length;)
                        t = e.__pending.shift(), t && t({ target: e }); this.parseNext(); }, parseLink: function (e) { t(e) ? this.parseImport(e) : (e.href = e.href, this.parseGeneric(e)); }, parseStyle: function (e) { var t = e; e = i(e), t.__appliedElement = e, e.__importElement = t, this.parseGeneric(e); }, parseGeneric: function (e) { this.trackElement(e), this.addElementToDocument(e); }, rootImportForElement: function (e) { for (var t = e; t.ownerDocument.__importLink;)
                    t = t.ownerDocument.__importLink; return t; }, addElementToDocument: function (e) { var t = this.rootImportForElement(e.__importElement || e); t.parentNode.insertBefore(e, t); }, trackElement: function (e, t) { var n = this, r = function (o) { e.removeEventListener("load", r), e.removeEventListener("error", r), t && t(o), n.markParsingComplete(e), n.parseNext(); }; if (e.addEventListener("load", r), e.addEventListener("error", r), l && "style" === e.localName) {
                    var o = !1;
                    if (-1 == e.textContent.indexOf("@import"))
                        o = !0;
                    else if (e.sheet) {
                        o = !0;
                        for (var i, a = e.sheet.cssRules, s = a ? a.length : 0, c = 0; s > c && (i = a[c]); c++)
                            i.type === CSSRule.IMPORT_RULE && (o = o && Boolean(i.styleSheet));
                    }
                    o && setTimeout(function () { e.dispatchEvent(new CustomEvent("load", { bubbles: !1 })); });
                } }, parseScript: function (t) { var r = document.createElement("script"); r.__importElement = t, r.src = t.src ? t.src : n(t), e.currentScript = t, this.trackElement(r, function (t) { r.parentNode && r.parentNode.removeChild(r), e.currentScript = null; }), this.addElementToDocument(r); }, nextToParse: function () { return this._mayParse = [], !this.parsingElement && (this.nextToParseInDoc(s) || this.nextToParseDynamic()); }, nextToParseInDoc: function (e, n) { if (e && this._mayParse.indexOf(e) < 0) {
                    this._mayParse.push(e);
                    for (var r, o = e.querySelectorAll(this.parseSelectorsForNode(e)), i = 0, a = o.length; a > i && (r = o[i]); i++)
                        if (!this.isParsed(r))
                            return this.hasResource(r) ? t(r) ? this.nextToParseInDoc(r.__doc, r) : r : void 0;
                } return n; }, nextToParseDynamic: function () { return this.dynamicElements[0]; }, parseSelectorsForNode: function (e) { var t = e.ownerDocument || e; return t === s ? this.documentSelectors : this.importsSelectors; }, isParsed: function (e) { return e.__importParsed; }, needsDynamicParsing: function (e) { return this.dynamicElements.indexOf(e) >= 0; }, hasResource: function (e) { return t(e) && void 0 === e.__doc ? !1 : !0; } }; e.parser = p, e.IMPORT_SELECTOR = d; }), window.HTMLImports.addModule(function (e) { function t(e) { return n(e, a); } function n(e, t) { return "link" === e.localName && e.getAttribute("rel") === t; } function r(e) { return !!Object.getOwnPropertyDescriptor(e, "baseURI"); } function o(e, t) { var n = document.implementation.createHTMLDocument(a); n._URL = t; var o = n.createElement("base"); o.setAttribute("href", t), n.baseURI || r(n) || Object.defineProperty(n, "baseURI", { value: t }); var i = n.createElement("meta"); return i.setAttribute("charset", "utf-8"), n.head.appendChild(i), n.head.appendChild(o), n.body.innerHTML = e, window.HTMLTemplateElement && HTMLTemplateElement.bootstrap && HTMLTemplateElement.bootstrap(n), n; } var i = e.flags, a = e.IMPORT_LINK_TYPE, s = e.IMPORT_SELECTOR, c = e.rootDocument, l = e.Loader, u = e.Observer, d = e.parser, p = { documents: {}, documentPreloadSelectors: s, importsPreloadSelectors: [s].join(","), loadNode: function (e) { h.addNode(e); }, loadSubtree: function (e) { var t = this.marshalNodes(e); h.addNodes(t); }, marshalNodes: function (e) { return e.querySelectorAll(this.loadSelectorsForNode(e)); }, loadSelectorsForNode: function (e) { var t = e.ownerDocument || e; return t === c ? this.documentPreloadSelectors : this.importsPreloadSelectors; }, loaded: function (e, n, r, a, s) { if (i.load && console.log("loaded", e, n), n.__resource = r, n.__error = a, t(n)) {
                    var c = this.documents[e];
                    void 0 === c && (c = a ? null : o(r, s || e), c && (c.__importLink = n, this.bootDocument(c)), this.documents[e] = c), n.__doc = c;
                } d.parseNext(); }, bootDocument: function (e) { this.loadSubtree(e), this.observer.observe(e), d.parseNext(); }, loadedAll: function () { d.parseNext(); } }, h = new l(p.loaded.bind(p), p.loadedAll.bind(p)); if (p.observer = new u, !document.baseURI) {
                var f = { get: function () { var e = document.querySelector("base"); return e ? e.href : window.location.href; }, configurable: !0 };
                Object.defineProperty(document, "baseURI", f), Object.defineProperty(c, "baseURI", f);
            } e.importer = p, e.importLoader = h; }), window.HTMLImports.addModule(function (e) { var t = e.parser, n = e.importer, r = { added: function (e) { for (var r, o, i, a, s = 0, c = e.length; c > s && (a = e[s]); s++)
                    r || (r = a.ownerDocument, o = t.isParsed(r)), i = this.shouldLoadNode(a), i && n.loadNode(a), this.shouldParseNode(a) && o && t.parseDynamic(a, i); }, shouldLoadNode: function (e) { return 1 === e.nodeType && o.call(e, n.loadSelectorsForNode(e)); }, shouldParseNode: function (e) { return 1 === e.nodeType && o.call(e, t.parseSelectorsForNode(e)); } }; n.observer.addCallback = r.added.bind(r); var o = HTMLElement.prototype.matches || HTMLElement.prototype.matchesSelector || HTMLElement.prototype.webkitMatchesSelector || HTMLElement.prototype.mozMatchesSelector || HTMLElement.prototype.msMatchesSelector; }), function (e) { function t() { window.HTMLImports.importer.bootDocument(r); } var n = e.initializeModules; e.isIE; if (!e.useNative) {
                n();
                var r = e.rootDocument;
                "complete" === document.readyState || "interactive" === document.readyState && !window.attachEvent ? t() : document.addEventListener("DOMContentLoaded", t);
            } }(window.HTMLImports), window.CustomElements = window.CustomElements || { flags: {} }, function (e) { var t = e.flags, n = [], r = function (e) { n.push(e); }, o = function () { n.forEach(function (t) { t(e); }); }; e.addModule = r, e.initializeModules = o, e.hasNative = Boolean(document.registerElement), e.isIE = /Trident/.test(navigator.userAgent), e.useNative = !t.register && e.hasNative && !window.ShadowDOMPolyfill && (!window.HTMLImports || window.HTMLImports.useNative); }(window.CustomElements), window.CustomElements.addModule(function (e) { function t(e, t) { n(e, function (e) { return t(e) ? !0 : void r(e, t); }), r(e, t); } function n(e, t, r) { var o = e.firstElementChild; if (!o)
                for (o = e.firstChild; o && o.nodeType !== Node.ELEMENT_NODE;)
                    o = o.nextSibling; for (; o;)
                t(o, r) !== !0 && n(o, t, r), o = o.nextElementSibling; return null; } function r(e, n) { for (var r = e.shadowRoot; r;)
                t(r, n), r = r.olderShadowRoot; } function o(e, t) { i(e, t, []); } function i(e, t, n) { if (e = window.wrap(e), !(n.indexOf(e) >= 0)) {
                n.push(e);
                for (var r, o = e.querySelectorAll("link[rel=" + a + "]"), s = 0, c = o.length; c > s && (r = o[s]); s++)
                    r["import"] && i(r["import"], t, n);
                t(e);
            } } var a = window.HTMLImports ? window.HTMLImports.IMPORT_LINK_TYPE : "none"; e.forDocumentTree = o, e.forSubtree = t; }), window.CustomElements.addModule(function (e) { function t(e, t) { return n(e, t) || r(e, t); } function n(t, n) { return e.upgrade(t, n) ? !0 : void (n && a(t)); } function r(e, t) { b(e, function (e) { return n(e, t) ? !0 : void 0; }); } function o(e) { S.push(e), _ || (_ = !0, setTimeout(i)); } function i() { _ = !1; for (var e, t = S, n = 0, r = t.length; r > n && (e = t[n]); n++)
                e(); S = []; } function a(e) { E ? o(function () { s(e); }) : s(e); } function s(e) { e.__upgraded__ && !e.__attached && (e.__attached = !0, e.attachedCallback && e.attachedCallback()); } function c(e) { l(e), b(e, function (e) { l(e); }); } function l(e) { E ? o(function () { u(e); }) : u(e); } function u(e) { e.__upgraded__ && e.__attached && (e.__attached = !1, e.detachedCallback && e.detachedCallback()); } function d(e) { for (var t = e, n = window.wrap(document); t;) {
                if (t == n)
                    return !0;
                t = t.parentNode || t.nodeType === Node.DOCUMENT_FRAGMENT_NODE && t.host;
            } } function p(e) { if (e.shadowRoot && !e.shadowRoot.__watched) {
                g.dom && console.log("watching shadow-root for: ", e.localName);
                for (var t = e.shadowRoot; t;)
                    m(t), t = t.olderShadowRoot;
            } } function h(e, n) { if (g.dom) {
                var r = n[0];
                if (r && "childList" === r.type && r.addedNodes && r.addedNodes) {
                    for (var o = r.addedNodes[0]; o && o !== document && !o.host;)
                        o = o.parentNode;
                    var i = o && (o.URL || o._URL || o.host && o.host.localName) || "";
                    i = i.split("/?").shift().split("/").pop();
                }
                console.group("mutations (%d) [%s]", n.length, i || "");
            } var a = d(e); n.forEach(function (e) { "childList" === e.type && (T(e.addedNodes, function (e) { e.localName && t(e, a); }), T(e.removedNodes, function (e) { e.localName && c(e); })); }), g.dom && console.groupEnd(); } function f(e) { for (e = window.wrap(e), e || (e = window.wrap(document)); e.parentNode;)
                e = e.parentNode; var t = e.__observer; t && (h(e, t.takeRecords()), i()); } function m(e) { if (!e.__observer) {
                var t = new MutationObserver(h.bind(this, e));
                t.observe(e, { childList: !0, subtree: !0 }), e.__observer = t;
            } } function w(e) { e = window.wrap(e), g.dom && console.group("upgradeDocument: ", e.baseURI.split("/").pop()); var n = e === window.wrap(document); t(e, n), m(e), g.dom && console.groupEnd(); } function v(e) { y(e, w); } var g = e.flags, b = e.forSubtree, y = e.forDocumentTree, E = window.MutationObserver._isPolyfilled && g["throttle-attached"]; e.hasPolyfillMutations = E, e.hasThrottledAttached = E; var _ = !1, S = [], T = Array.prototype.forEach.call.bind(Array.prototype.forEach), M = Element.prototype.createShadowRoot; M && (Element.prototype.createShadowRoot = function () { var e = M.call(this); return window.CustomElements.watchShadow(this), e; }), e.watchShadow = p, e.upgradeDocumentTree = v, e.upgradeDocument = w, e.upgradeSubtree = r, e.upgradeAll = t, e.attached = a, e.takeRecords = f; }), window.CustomElements.addModule(function (e) { function t(t, r) { if ("template" === t.localName && window.HTMLTemplateElement && HTMLTemplateElement.decorate && HTMLTemplateElement.decorate(t), !t.__upgraded__ && t.nodeType === Node.ELEMENT_NODE) {
                var o = t.getAttribute("is"), i = e.getRegisteredDefinition(t.localName) || e.getRegisteredDefinition(o);
                if (i && (o && i.tag == t.localName || !o && !i["extends"]))
                    return n(t, i, r);
            } } function n(t, n, o) { return a.upgrade && console.group("upgrade:", t.localName), n.is && t.setAttribute("is", n.is), r(t, n), t.__upgraded__ = !0, i(t), o && e.attached(t), e.upgradeSubtree(t, o), a.upgrade && console.groupEnd(), t; } function r(e, t) { Object.__proto__ ? e.__proto__ = t.prototype : (o(e, t.prototype, t["native"]), e.__proto__ = t.prototype); } function o(e, t, n) { for (var r = {}, o = t; o !== n && o !== HTMLElement.prototype;) {
                for (var i, a = Object.getOwnPropertyNames(o), s = 0; i = a[s]; s++)
                    r[i] || (Object.defineProperty(e, i, Object.getOwnPropertyDescriptor(o, i)), r[i] = 1);
                o = Object.getPrototypeOf(o);
            } } function i(e) { e.createdCallback && e.createdCallback(); } var a = e.flags; e.upgrade = t, e.upgradeWithDefinition = n, e.implementPrototype = r; }), window.CustomElements.addModule(function (e) { function t(t, r) { var c = r || {}; if (!t)
                throw new Error("document.registerElement: first argument `name` must not be empty"); if (t.indexOf("-") < 0)
                throw new Error("document.registerElement: first argument ('name') must contain a dash ('-'). Argument provided was '" + String(t) + "'."); if (o(t))
                throw new Error("Failed to execute 'registerElement' on 'Document': Registration failed for type '" + String(t) + "'. The type name is invalid."); if (l(t))
                throw new Error("DuplicateDefinitionError: a type with name '" + String(t) + "' is already registered"); return c.prototype || (c.prototype = Object.create(HTMLElement.prototype)), c.__name = t.toLowerCase(), c.lifecycle = c.lifecycle || {}, c.ancestry = i(c["extends"]), a(c), s(c), n(c.prototype), u(c.__name, c), c.ctor = d(c), c.ctor.prototype = c.prototype, c.prototype.constructor = c.ctor, e.ready && v(document), c.ctor; } function n(e) { if (!e.setAttribute._polyfilled) {
                var t = e.setAttribute;
                e.setAttribute = function (e, n) { r.call(this, e, n, t); };
                var n = e.removeAttribute;
                e.removeAttribute = function (e) { r.call(this, e, null, n); }, e.setAttribute._polyfilled = !0;
            } } function r(e, t, n) { e = e.toLowerCase(); var r = this.getAttribute(e); n.apply(this, arguments); var o = this.getAttribute(e); this.attributeChangedCallback && o !== r && this.attributeChangedCallback(e, r, o); } function o(e) { for (var t = 0; t < _.length; t++)
                if (e === _[t])
                    return !0; } function i(e) { var t = l(e); return t ? i(t["extends"]).concat([t]) : []; } function a(e) { for (var t, n = e["extends"], r = 0; t = e.ancestry[r]; r++)
                n = t.is && t.tag; e.tag = n || e.__name, n && (e.is = e.__name); } function s(e) { if (!Object.__proto__) {
                var t = HTMLElement.prototype;
                if (e.is) {
                    var n = document.createElement(e.tag);
                    t = Object.getPrototypeOf(n);
                }
                for (var r, o = e.prototype, i = !1; o;)
                    o == t && (i = !0), r = Object.getPrototypeOf(o), r && (o.__proto__ = r), o = r;
                i || console.warn(e.tag + " prototype not found in prototype chain for " + e.is), e["native"] = t;
            } } function c(e) { return b(M(e.tag), e); } function l(e) { return e ? S[e.toLowerCase()] : void 0; } function u(e, t) { S[e] = t; } function d(e) { return function () { return c(e); }; } function p(e, t, n) { return e === T ? h(t, n) : O(e, t); } function h(e, t) { e && (e = e.toLowerCase()), t && (t = t.toLowerCase()); var n = l(t || e); if (n) {
                if (e == n.tag && t == n.is)
                    return new n.ctor;
                if (!t && !n.is)
                    return new n.ctor;
            } var r; return t ? (r = h(e), r.setAttribute("is", t), r) : (r = M(e), e.indexOf("-") >= 0 && y(r, HTMLElement), r); } function f(e, t) { var n = e[t]; e[t] = function () { var e = n.apply(this, arguments); return g(e), e; }; } var m, w = e.isIE, v = e.upgradeDocumentTree, g = e.upgradeAll, b = e.upgradeWithDefinition, y = e.implementPrototype, E = e.useNative, _ = ["annotation-xml", "color-profile", "font-face", "font-face-src", "font-face-uri", "font-face-format", "font-face-name", "missing-glyph"], S = {}, T = "http://www.w3.org/1999/xhtml", M = document.createElement.bind(document), O = document.createElementNS.bind(document); m = Object.__proto__ || E ? function (e, t) { return e instanceof t; } : function (e, t) { if (e instanceof t)
                return !0; for (var n = e; n;) {
                if (n === t.prototype)
                    return !0;
                n = n.__proto__;
            } return !1; }, f(Node.prototype, "cloneNode"), f(document, "importNode"), w && !function () { var e = document.importNode; document.importNode = function () { var t = e.apply(document, arguments); if (t.nodeType == t.DOCUMENT_FRAGMENT_NODE) {
                var n = document.createDocumentFragment();
                return n.appendChild(t), n;
            } return t; }; }(), document.registerElement = t, document.createElement = h, document.createElementNS = p, e.registry = S, e["instanceof"] = m, e.reservedTagList = _, e.getRegisteredDefinition = l, document.register = document.registerElement; }), function (e) { function t() { i(window.wrap(document)), window.CustomElements.ready = !0; var e = window.requestAnimationFrame || function (e) { setTimeout(e, 16); }; e(function () { setTimeout(function () { window.CustomElements.readyTime = Date.now(), window.HTMLImports && (window.CustomElements.elapsed = window.CustomElements.readyTime - window.HTMLImports.readyTime), document.dispatchEvent(new CustomEvent("WebComponentsReady", { bubbles: !0 })); }); }); } var n = e.useNative, r = e.initializeModules; e.isIE; if (n) {
                var o = function () { };
                e.watchShadow = o, e.upgrade = o, e.upgradeAll = o, e.upgradeDocumentTree = o, e.upgradeSubtree = o, e.takeRecords = o, e["instanceof"] = function (e, t) { return e instanceof t; };
            }
            else
                r(); var i = e.upgradeDocumentTree, a = e.upgradeDocument; if (window.wrap || (window.ShadowDOMPolyfill ? (window.wrap = window.ShadowDOMPolyfill.wrapIfNeeded, window.unwrap = window.ShadowDOMPolyfill.unwrapIfNeeded) : window.wrap = window.unwrap = function (e) { return e; }), window.HTMLImports && (window.HTMLImports.__importsParsingHook = function (e) { e["import"] && a(wrap(e["import"])); }), "complete" === document.readyState || e.flags.eager)
                t();
            else if ("interactive" !== document.readyState || window.attachEvent || window.HTMLImports && !window.HTMLImports.ready) {
                var s = window.HTMLImports && !window.HTMLImports.ready ? "HTMLImportsLoaded" : "DOMContentLoaded";
                window.addEventListener(s, t);
            }
            else
                t(); }(window.CustomElements), function (e) { Function.prototype.bind || (Function.prototype.bind = function (e) { var t = this, n = Array.prototype.slice.call(arguments, 1); return function () { var r = n.slice(); return r.push.apply(r, arguments), t.apply(e, r); }; }); }(window.WebComponents), function (e) { var t = document.createElement("style"); t.textContent = "body {transition: opacity ease-in 0.2s; } \nbody[unresolved] {opacity: 0; display: block; overflow: hidden; position: relative; } \n"; var n = document.querySelector("head"); n.insertBefore(t, n.firstChild); }(window.WebComponents), function (e) { window.Platform = e; }(window.WebComponents);
        }, {}], "xhr-proxy": [function (require, module, exports) {
            var utils = require('utils');
            var init = function () {
                var _XMLHttpRequest = XMLHttpRequest;
                window.XMLHttpRequest = function () {
                    var xhr = new _XMLHttpRequest(), origMethods = {
                        setRequestHeader: xhr.setRequestHeader,
                        open: xhr.open
                    };
                    xhr.open = function (method, url) {
                        var sameOrigin = utils.isSameOriginRequest(url);
                        if (!sameOrigin) {
                            url = '/xhr_proxy?rurl=' + escape(url);
                        }
                        origMethods.open.apply(xhr, Array.prototype.slice.call(arguments));
                    };
                    return xhr;
                };
                window.XMLHttpRequest.__proto__ = _XMLHttpRequest;
            };
            module.exports = {
                init: init
            };
        }, { "utils": "utils" }] }, {}, [9]);
//# sourceMappingURL=sim-host.js.map