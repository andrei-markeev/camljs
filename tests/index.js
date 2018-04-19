var Tests = require('./Tests').default;

// running tests in node

var results = Tests.run();
console.log("1.." + (results.errors.length + results.passes.length))
var i = 0;
for (var err of results.errors) {
    i++;
    console.log("not ok " + i + " " + err.funcName + ":", err.diffChars ? "" : err.message.replace(/\n/g, "\n  "));
    if (err.diffChars) {
        var colors = err.diffChars.map(p => p.added ? "\x1b[32m" : p.removed ? "\x1b[31m" : "\x1b[0m");
        var coloredText = err.diffChars.reduce((a, i, index) => a + colors[index] + i.value, "");
        console.log("  " + coloredText.replace(/\n/g, "\n  ") + "\x1b[0m");
    }
}
for (var pass of results.passes) {
    i++;
    console.log("ok " + i + " " + pass.funcName);
}
