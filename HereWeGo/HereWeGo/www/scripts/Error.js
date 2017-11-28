/**
 * Global Error constants and utility functions
 * To make handling events such as no internet easier than
 * a bunch of text constants
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    var ErrorUtil;
    (function (ErrorUtil) {
        var ErrorCode;
        (function (ErrorCode) {
            ErrorCode[ErrorCode["NO_SCHOOL"] = 0] = "NO_SCHOOL";
            ErrorCode[ErrorCode["NO_INTERNET"] = 1] = "NO_INTERNET";
            ErrorCode[ErrorCode["NO_STORED"] = 2] = "NO_STORED";
        })(ErrorCode = ErrorUtil.ErrorCode || (ErrorUtil.ErrorCode = {}));
    })(ErrorUtil || (ErrorUtil = {}));
    return ErrorUtil;
});
//# sourceMappingURL=Error.js.map