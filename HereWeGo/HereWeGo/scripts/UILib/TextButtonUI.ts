/**
 * Simple text clickable button implementing ButtonUI
 */

 import ButtonUI = require('./ButtonUI');
 import UIUtil = require('./UIUtil');

 class TextButtonUI extends ButtonUI {
    //main html! pretty simple, just a lot of varibles
    private static readonly strTemplate: string = `
    <div class="{{wrapClass}}" id="{{id}}" style="{{image}}">
        <p class="{{textClass}}">{{text}}</p>
    </div>`
    private readonly imgTemplate: string = `background-image: url('./images/{{image}}')`;
    //storage string (we'll just go straight to a string since nothing we get needs data)
    private readonly strStore: string;

    constructor(wrapClass: string, textClass: string, text: string, callback: () => void, icon?: string, longPressCallback?: () => void, disableAnim?: boolean) {
        super(callback, longPressCallback, disableAnim);
        this.strStore = UIUtil.templateEngine(TextButtonUI.strTemplate, {
            id: this.id,
            wrapClass: wrapClass,
            textClass: textClass,
            text: text,
            image: icon ? UIUtil.templateEngine(this.imgTemplate, { image: icon }) : '',
        });
    }
    //make a whole buncha that thing
    static Factory(wrapClass: string, textClass: string, params: Array<UIUtil.ButtonParam>, disableAnim?: boolean): Array<ButtonUI> {
        return params.map((param) => new TextButtonUI(wrapClass, textClass, param.text, param.callback, param.icon, param.longPressCallback, disableAnim));
    }
    //init dat HTML
    onInit(): string {
        return this.strStore;
    }
    //the rest (buildJS, etc.) is handled by the super class
 }

 export = TextButtonUI;