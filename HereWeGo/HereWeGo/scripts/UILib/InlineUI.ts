import UIUtil = require("./UIUtil");

/**
 * Simple Ulility class to take raw HTML strings and plug them into the {@link UIUtil} system.
 */

class InlineUI extends UIUtil.UIItem {
    //storage template string
    private readonly html: string;
    //storage callback for buildJS
    private readonly buildJS_?: () => void;
    /**
     * @param html The HTML string to return during {@link UIUtil.UIItem.onInit}
     * @param buildJS The function to call during {@link UIUtil.UIItem.buildJS}
     */
    constructor(html: string, buildJS?: () => void) {
        super();
        this.html = html;
        this.buildJS_ = buildJS;
    }

    onInit(): string {
        return this.html;
    }

    buildJS() {
        if(this.buildJS_) this.buildJS_();
    }
}

export = InlineUI;