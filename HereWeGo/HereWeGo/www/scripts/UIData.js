define(["require", "exports", "./UILib/UIUtil"], function (require, exports, UIUtil) {
    "use strict";
    class UIData {
        constructor(schedHandle, eventHandle, dayHandle, quoteHandle, imgHandle, recievers) {
            this.recvParamList = [[], [], [], [], []];
            this.sched = schedHandle;
            this.events = eventHandle;
            this.day = dayHandle;
            this.quote = quoteHandle;
            this.image = imgHandle;
            for (let i = 0, len = recievers.length; i < len; i++)
                if (recievers[i].getChildren)
                    recievers = recievers.concat(recievers[i].getChildren());
            this.recvs = recievers;
            for (let i = 0, len = recievers.length; i < len; i++)
                if (recievers[i].recv)
                    for (let o = 0, len1 = recievers[i].recv.length; o < len1; o++)
                        this.recvParamList[recievers[i].recv[o].type].push(recievers[i].recv[o]);
        }
        initInject() {
            return Promise.all([
                this.sched.getSched(this.recvParamList[0], this.events),
                this.events.getEvents(this.recvParamList[2]),
                this.day.getDay(this.recvParamList[1]),
                this.quote.getQuote(this.recvParamList[3]),
                this.image.getImage(this.recvParamList[4]),
            ]);
        }
        initRun() {
            for (let i = 0, len = this.recvs.length; i < len; i++)
                if (this.recvs[i].onInit)
                    this.recvs[i].onInit();
        }
        trigger(why) {
            let thing;
            if (why.indexOf(5) != -1)
                thing = Promise.all([
                    this.sched.getSched(this.recvParamList[0], this.events),
                    this.events.getEvents(this.recvParamList[2]),
                    this.day.getDay(this.recvParamList[1]),
                    this.quote.getQuote(this.recvParamList[3]),
                    this.image.getImage(this.recvParamList[4]),
                ]);
            else {
                let ray = [];
                if (why.indexOf(2) != -1)
                    ray.push(this.sched.getSched(this.recvParamList[0], this.events));
                if (why.indexOf(1) != -1)
                    ray.push(this.events.getEvents(this.recvParamList[2]));
                if (why.indexOf(3) != -1)
                    ray.push(this.quote.getQuote(this.recvParamList[3]));
                if (why.indexOf(0) != -1)
                    ray.push(this.day.getDay(this.recvParamList[1]));
                if (why.indexOf(4) != -1)
                    ray.push(this.image.getImage(this.recvParamList[4]));
                thing = Promise.all(ray);
            }
            return thing.then(() => {
                for (let i = 0, len = this.recvs.length; i < len; i++)
                    if (this.recvs[i].onUpdate)
                        this.recvs[i].onUpdate(why);
            });
        }
        deDupeDays(key, objs) {
            let days = [];
            for (let i = 0, len = objs.length; i < len; i++) {
                let dayRay = objs[i][key];
                if (Array.isArray(dayRay)) {
                    for (let o = 0, len1 = dayRay.length; o < len1; o++)
                        if (days.indexOf(dayRay[o]) == -1)
                            days.push(dayRay[o]);
                }
                else if (days.indexOf(dayRay[i]) == -1)
                    days.push(dayRay[i]);
            }
            return days;
        }
    }
    return UIData;
});
//# sourceMappingURL=UIData.js.map