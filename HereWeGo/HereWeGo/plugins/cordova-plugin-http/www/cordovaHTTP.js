/*global angular*/

/*
 * An HTTP Plugin for PhoneGap.
 */

var exec = require('cordova/exec');

// Thanks Mozilla: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function mergeHeaders(globalHeaders, localHeaders) {
    var globalKeys = Object.keys(globalHeaders);
    var key;
    for (var i = 0; i < globalKeys.length; i++) {
        key = globalKeys[i];
        if (!localHeaders.hasOwnProperty(key)) {
            localHeaders[key] = globalHeaders[key];
        }
    }
    return localHeaders;
}

var http = {
    headers: {},
    sslPinning: false,
    getBasicAuthHeader: function(username, password) {
        return {'Authorization': 'Basic ' + b64EncodeUnicode(username + ':' + password)};
    },
    useBasicAuth: function(username, password) {
        this.headers.Authorization = 'Basic ' + b64EncodeUnicode(username + ':' + password);
    },
    setHeader: function(header, value) {
        this.headers[header] = value;
    },
    enableSSLPinning: function(enable, success, failure) {
        return exec(success, failure, "CordovaHttpPlugin", "enableSSLPinning", [enable]);
    },
    acceptAllCerts: function(allow, success, failure) {
        return exec(success, failure, "CordovaHttpPlugin", "acceptAllCerts", [allow]);
    },
    validateDomainName: function(validate, success, failure) {
        return exec(success, failure, "CordovaHttpPlugin", "validateDomainName", [validate]);
    },
    post: function(url, params, headers, success, failure) {
        headers = mergeHeaders(this.headers, headers);
        return exec(success, failure, "CordovaHttpPlugin", "post", [url, params, headers]);
    },
    get: function(url, params, headers, success, failure) {
        headers = mergeHeaders(this.headers, headers);
        return exec(success, failure, "CordovaHttpPlugin", "get", [url, params, headers]);
    },
    head: function(url, params, headers, success, failure) {
        headers = mergeHeaders(this.headers, headers);
        return exec(success, failure, "CordovaHttpPlugin", "head", [url, params, headers]);
    },
};

module.exports = http;

if (typeof angular !== "undefined") {
    angular.module('cordovaHTTP', []).factory('cordovaHTTP', function($timeout, $q) {
        function makePromise(fn, args, async) {
            var deferred = $q.defer();
            
            var success = function(response) {
                if (async) {
                    $timeout(function() {
                        deferred.resolve(response);
                    });
                } else {
                    deferred.resolve(response);
                }
            };
            
            var fail = function(response) {
                if (async) {
                    $timeout(function() {
                        deferred.reject(response);
                    });
                } else {
                    deferred.reject(response);
                }
            };
            
            args.push(success);
            args.push(fail);
            
            fn.apply(http, args);
            
            return deferred.promise;
        }
        
        var cordovaHTTP = {
            getBasicAuthHeader: http.getBasicAuthHeader,
            useBasicAuth: function(username, password) {
                return http.useBasicAuth(username, password);
            },
            setHeader: function(header, value) {
                return http.setHeader(header, value);
            },
            enableSSLPinning: function(enable) {
                return makePromise(http.enableSSLPinning, [enable]);
            },
            acceptAllCerts: function(allow) {
                return makePromise(http.acceptAllCerts, [allow]);
            },
            validateDomainName: function(validate) {
                return makePromise(http.validateDomainName, [validate]);
            },
            post: function(url, params, headers) {
                return makePromise(http.post, [url, params, headers], true);
            },
            get: function(url, params, headers) {
                return makePromise(http.get, [url, params, headers], true);
            },
            head: function(url, params, headers) {
                return makePromise(http.head, [url, params, headers], true);
            },
        };
        return cordovaHTTP;
    });
} else {
    window.cordovaHTTP = http;
}
