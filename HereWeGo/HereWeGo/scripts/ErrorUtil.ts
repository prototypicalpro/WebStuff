/**
 * Global Error constants and utility functions
 * To make handling events such as no internet easier than
 * a bunch of text constants
 */

namespace ErrorUtil {
    export enum code {
        NO_SCHOOL,
        NO_INTERNET,
        NO_STORED,
        NO_IMAGE,
        BAD_RESPONSE,
        HTTP_FAIL,
        FS_FAIL,
    }
}


export = ErrorUtil;