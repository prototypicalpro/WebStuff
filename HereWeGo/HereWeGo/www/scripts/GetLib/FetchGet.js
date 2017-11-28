define(["require", "exports", "../ErrorUtil"], function (require, exports, ErrorUtil) {
    "use strict";
    class FetchGet {
        static initAPI() { return typeof fetch !== undefined; }
        get(URL) {
            return fetch(URL).catch((err) => {
                console.log(err);
                throw ErrorUtil.code.NO_INTERNET;
            }).then((response) => {
                if (!response.ok) {
                    console.log("Fetch error: " + response.statusText);
                    throw ErrorUtil.code.BAD_RESPONSE;
                }
                return response.json();
            });
        }
        getAsBlob(URL) {
            return fetch(URL).catch((err) => {
                console.log(err);
                throw ErrorUtil.code.NO_INTERNET;
            }).then((response) => {
                if (!response.ok) {
                    console.log("Fetch error: " + response.statusText);
                    throw ErrorUtil.code.BAD_RESPONSE;
                }
                return response.blob();
            });
        }
    }
    return FetchGet;
});
//# sourceMappingURL=FetchGet.js.map