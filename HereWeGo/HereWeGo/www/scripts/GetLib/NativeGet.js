define(["require", "exports", "../ErrorUtil"], function (require, exports, ErrorUtil) {
    "use strict";
    class NativeGet {
        static initAPI() { return typeof cordovaHTTP != 'undefined'; }
        get(URL) {
            return new Promise((resolve, reject) => { cordovaHTTP.get(URL, {}, {}, resolve, reject); }).catch((err) => {
                console.log(err);
                throw ErrorUtil.code.NO_INTERNET;
            }).then((response) => {
                if (!response)
                    throw ErrorUtil.code.NO_INTERNET;
                if (response.status != 200)
                    throw ErrorUtil.code.BAD_RESPONSE;
                return JSON.parse(response.data);
            });
        }
        getAsBlob(URL) {
            return new Promise((resolve, reject) => { cordovaHTTP.get(URL, {}, {}, resolve, reject); }).catch((err) => {
                console.log(err);
                throw ErrorUtil.code.NO_INTERNET;
            }).then((response) => {
                console.log(response);
                if (!response)
                    throw ErrorUtil.code.NO_INTERNET;
                if (response.status != 200)
                    throw ErrorUtil.code.BAD_RESPONSE;
                return new Blob(response.data);
            });
        }
    }
    return NativeGet;
});
//# sourceMappingURL=NativeGet.js.map