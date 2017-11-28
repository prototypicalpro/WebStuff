define(["require", "exports"], function (require, exports) {
    "use strict";
    var ErrorUtil;
    (function (ErrorUtil) {
        var code;
        (function (code) {
            code[code["NO_SCHOOL"] = 0] = "NO_SCHOOL";
            code[code["NO_INTERNET"] = 1] = "NO_INTERNET";
            code[code["NO_STORED"] = 2] = "NO_STORED";
            code[code["NO_IMAGE"] = 3] = "NO_IMAGE";
            code[code["BAD_RESPONSE"] = 4] = "BAD_RESPONSE";
            code[code["HTTP_FAIL"] = 5] = "HTTP_FAIL";
        })(code = ErrorUtil.code || (ErrorUtil.code = {}));
    })(ErrorUtil || (ErrorUtil = {}));
    return ErrorUtil;
});
//# sourceMappingURL=ErrorUtil.js.map