import UIUtil = require('./UIUtil');
import TextButtonUI = require('./TextButtonUI');

/**
 * List of links to be used as resources for students.
 * Takes an array of strings and URLs to point to, will eventually be written to determine this data
 * from cloud data.
 */

 class ResourceUI extends UIUtil.UIItem {
    /** Header template */
    private static readonly template: string = `<p class="header resHead">Student Resource Links</p>`;
    /** Maximum length of text before overflow */
    private static readonly charMax: number = 49;
    //storage content
    private readonly content: Array<{text: string, url: string}>;
    //storage buttons
    private buttons: Array<TextButtonUI>;
    //storage url callback func
    private readonly urlCallbackFunc: (url: string) => () => void;
    /**
     * @param content The objects in format of {text: string, url: string} representing each button
     * @param urlCallbackFunc The function returning a function which when called opens the url in a browser window
     */
    constructor(content: Array<{text: string, url: string}>, urlCallbackFunc: (url: string) => () => void) {
        super();
        this.content = content;
        this.urlCallbackFunc = urlCallbackFunc;
    }
    /**
     * Build HTML based on the button data stored in {@link ResourceUI.content}.
     * @returns The resource page HTML
     */
    onInit(): string {
        //trim length of button text and create callbacks
        let newData = this.content.map(data => {
            return {
                text: UIUtil.breakText(data.text, ResourceUI.charMax),
                callback: this.urlCallbackFunc(data.url),
            };
        });
        //contruct the buttons from the data
        this.buttons = TextButtonUI.Factory("resRow", "benjamin", newData, false, 50, 20);
        //generate HTML from these buttons
        return ResourceUI.template + this.buttons.map(b => b.onInit()).join('');
    }
    /**
     * Run {@link ButtonUI.buildJS} of buttons
     */
    buildJS() {
        for(let i = 0, len = this.buttons.length; i < len; i++) this.buttons[i].buildJS();
    }
 }

 export = ResourceUI;