/// @ts-check

var fs = require("fs");

var contents = fs.readFileSync("dist/camljs.js", "utf8");

if (contents.indexOf("(function (f) {") !== 0) {

    contents = `(function (f) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = f()
    } else if (typeof define === "function" && define.amd) {
        define([], f)
    } else {
        var g;
        if (typeof window !== "undefined") g = window
        else if (typeof global !== "undefined") g = global
        else if (typeof self !== "undefined") g = self
        else g = this;
        g.CamlBuilder = f()
    }
})(function () {

var m = {};

(function(module) {
${contents}
})(m);

return m.exports;

});`;

    fs.writeFileSync("dist/camljs.js", contents, "utf8");

}