import UIUtil = require('./UIUtil');
import ButtonUI = require('./ButtonUI');

//this is cancerous, but store a callback to close each event menu
//so there's only one open at a time
/**
 * Global event description close callback. Serves as a mutex for every {@link EventGraphic},
 * so that only one event description is visible at a given time.
 */
var evClose: () => void = null;

/**
 * Class abstracting each event row into a {@link ButtonUI}, so each one can react
 * to a click and display a description. Should only be constructed by {@link EventGraphic}.
 */
class EventRowUI extends ButtonUI {
    //event item template
    //100% certified(!) unreadable
    /** Individual event HTML template */
    private static readonly eventTemplate: string = `
    <div id="{{id}}">
        <div class="evRow {{modCl}}">
            <div class="leftCell"> 
                <div class="incep"> 
                    {{time}}
                </div> 
            </div>
            <div class="rWrap" style="border-left: 2px solid {{lineColor}}">
                <p class="evRight">{{name}}</p> 
            </div>
        </div>
        <div class="evSlide">
            <div class="smallT evDesc">
                <p class="evDescHead">Description</p>
                <p class="evDescBody">{{desc}}</p>
            </div>
        </div>
    </div>`;
    /** How many characters are allowed in a single line of an event title before word wrap triggers */
    private static readonly charLineMax: number = 30;
    /** CSS class to show the event's description */
    private static readonly descShowClass: string = "evSlideShow";
    //member varibles
    private readonly strStore: string;
    private descShown: boolean = false;
    private descEl: HTMLElement;
    /**
     * @param modCl CSS class to apply to the event
     * @param time HTML string time created from {@link EventGraphic.normalTime} or {@link EventGraphic.allDayTime}
     * @param lineColor Color code to use for line dividing time and event name
     * @param name Name of the event
     * @param isSchedule Whether or not the event represents a schedule
     */
    constructor(modCl: string, time: string, lineColor: string, name: string, isSchedule: boolean, desc?: string) {
        super(false, 50, 20);
        //start by creating our HTML
        //add breakline tags to long titles
        let eventFix: string = '';
        //add breaklines to quote so we don't overflow
        while (name.length > EventRowUI.charLineMax) {
            //work on the substring ending at the 64th char
            //starting at the nth char, and work backwards until we find a space
            let breakPoint = name.slice(0, EventRowUI.charLineMax).lastIndexOf(' ');
            //add a break tag to that space
            eventFix += name.slice(0, breakPoint) + `<br/>`;
            name = name.slice(breakPoint + 1);
        }
        if (eventFix.length) name = eventFix + name;
        //if it's a schedule event, we need to eventually figure out how to display the schedule
        //eventaully
        //TODO: above
        if(isSchedule) desc = 'Developer is busy. Coming soon!'
        //construct event string!
        this.strStore = UIUtil.templateEngine(EventRowUI.eventTemplate, {
            id: this.id,
            modCl: modCl,
            time: time,
            lineColor: lineColor,
            name: name,
            desc: desc ? desc : "No description provided"
        });
    }
    /**
     * onInit just returns the template string.
     * Note: this is normally bad because it means we are messing with strings at the start,
     * but these will be constructed in onInit of EventGraphic so whatever.
     */
    onInit() {
        return this.strStore;
    }
    /** Grabs the description element along with everything in {@link ButtonUI.buildJS} */
    buildJS() {
        super.buildJS();
        //assume the button has grabed the wrapper div, so now grab the desc div in the wrapper
        this.descEl = this.buttonStore.querySelector(".evSlide");
    }
    /**
     * Click callback function, displays the description in a dropdown below the event.
     * This CSS on this particular feature was very difficult.
     */
    protected readonly callback: () => void = () => {
        if(!this.descShown) {
            //close the last event description that was open
            if(evClose) evClose();
            //open ours
            this.descEl.classList.add(EventRowUI.descShowClass);
            evClose = this.callback;
        }
        else {
            //close ours
            this.descEl.classList.remove(EventRowUI.descShowClass);
            evClose = null;
        }
        this.descShown = !this.descShown;
        //resize so IScroll fixes it's sh*t
        const trans = (() => {
            window.dispatchEvent(new Event('resize'))
            this.descEl.removeEventListener('transitionend', trans, <any>{ passive : true, once : true });
        }).bind(this);
        this.descEl.addEventListener('transitionend', trans, { passive : true, once : true });
    }
}

export = EventRowUI;