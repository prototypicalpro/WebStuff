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
    //storage members
    protected readonly callback: () => void;
    protected readonly longPress?: () => void;
    private readonly wrapClass: string;
    private readonly textClass: string;
    private readonly text: string;
    private readonly icon: string;
    
    //do yo thang
    constructor(wrapClass: string, textClass: string, text: string, callback: () => void, icon?: string, longPressCallback?: () => void, disableAnim?: boolean, maxXDelta?: number, maxYDelta?: number) {
        super(disableAnim, maxXDelta, maxYDelta);
        this.callback = callback;
        this.longPress = longPressCallback;
        this.wrapClass = wrapClass;
        this.textClass = textClass;
        this.text = text;
        this.icon = icon;
    }
    //make a whole buncha that thing
    static Factory(wrapClass: string, textClass: string, params: Array<{text: string, callback: () => void, longPressCallback?: () => void, icon?: string}>, disableAnim?: boolean, maxXDelta?: number, maxYDelta?: number): Array<TextButtonUI> {
        return params.map(param => new TextButtonUI(wrapClass, textClass, param.text, param.callback, param.icon, param.longPressCallback, disableAnim, maxXDelta, maxYDelta));
    }
    //init dat HTML
    onInit(): string {
        return UIUtil.templateEngine(TextButtonUI.strTemplate, {
            id: this.id,
            wrapClass: this.wrapClass,
            textClass: this.textClass,
            text: this.text,
            image: this.icon ? UIUtil.templateEngine(this.imgTemplate, { image: this.icon }) : '',
        });
    }
    //the rest (buildJS, etc.) is handled by the super class
 }

 export = TextButtonUI;