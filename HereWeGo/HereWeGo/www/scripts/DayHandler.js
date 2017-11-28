define(["require", "exports"], function (require, exports) {
    "use strict";
    class DayHandler {
        constructor(useThis) {
            if (useThis)
                this.storeDay = useThis;
        }
        getDay(objs) {
            let day = this.storeDay;
            if (!day)
                day = new Date();
            for (let i = 0, len = objs.length; i < len; i++)
                objs[i].storeDay(day);
        }
    }
    return DayHandler;
});
//# sourceMappingURL=DayHandler.js.map