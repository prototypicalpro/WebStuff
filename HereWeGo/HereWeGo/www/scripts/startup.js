define(["require", "exports", "./application"], function (require, exports, Application) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require(["./platformOverrides"], () => Application.initialize(), () => Application.initialize());
});
//# sourceMappingURL=startup.js.map