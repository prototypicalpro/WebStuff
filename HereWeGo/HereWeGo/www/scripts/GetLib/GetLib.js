define(["require", "exports", "./FetchGet"], function (require, exports, FetchGet) {
    "use strict";
    const DRIVER_LIST = [FetchGet];
    class GetLib {
        initAPI() {
            for (let i = 0, len = DRIVER_LIST.length; i < len; i++) {
                if (DRIVER_LIST[i].initAPI()) {
                    this.useClass = new DRIVER_LIST[i]();
                    return true;
                }
            }
            return false;
        }
        get(URL) {
            return this.useClass.get(URL);
        }
        getAsBlob(URL) {
            return this.useClass.getAsBlob(URL);
        }
    }
    return GetLib;
});
//# sourceMappingURL=GetLib.js.map