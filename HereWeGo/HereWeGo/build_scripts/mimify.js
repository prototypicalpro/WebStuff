const htmlMinify = require('html-minifier').minify;
const CleanCSS = require('clean-css');
const fs = require('fs');
const path = require('path');
var UglifyJS = require('uglify-js');

const htmlFile = "index.html"
const cssFiles = ["QuickStart.css", "index.css"];
const androidHtmlPath = path.join("platforms", "android", "app", "src", "main", "assets", "www");
const iosHtmlPath = path.join("platforms", "ios", "www");

const paths = [androidHtmlPath, iosHtmlPath];

const jsPaths = ["cordova.js", "cordova_plugins.js", path.join("scripts", "lory.js"), path.join("scripts", "iscroll-lite.js")];

const htmlOps = {
    collapseWhitespace: true,
    keepClosingSlash: true,
    removeAttributeQuotes: true,
    removeComments: true,
};

const cssOps = {
    level: 2,
};

const jsOps = {
    "compress": {
        "drop_console": true
    },
    "mangle": false,
    "output": {
        "code": true
    }
};

console.log("Minifying HTML!");

for(let i = 0, len = paths.length; i < len; i++) {
    const filePath = path.resolve(paths[i], htmlFile);
    const file = fs.openSync(filePath, 'r+');
    const fileCont = fs.readFileSync(file, 'utf8');
    const result = htmlMinify(fileCont, htmlOps);
    fs.ftruncateSync(file);
    fs.writeFileSync(file, result);
}

console.log("Minifying CSS!");
const cleanMe = new CleanCSS(cssOps);

for(let i = 0, len = paths.length; i < len; i++) {
    for(let o = 0, len1 = cssFiles.length; o < len1; o++) {
        const filePath = path.resolve(paths[i], "css", cssFiles[o]);
        const file = fs.openSync(filePath, 'r+');
        const fileCont = fs.readFileSync(file, 'utf8');
        const result = cleanMe.minify(fileCont);
        fs.ftruncateSync(file);
        fs.writeFileSync(file, result.styles);
    }
}

console.log("Minifying cordova, iscoll, lory!");

for(let i = 0, len = paths.length; i < len; i++) {
    for(let o = 0, len1 = jsPaths.length; o < len1; o++) {
        const filePath = path.resolve(paths[i], jsPaths[o]);
        const file = fs.openSync(filePath, 'r+');
        const fileCont = fs.readFileSync(file, 'utf8');
        const result = UglifyJS.minify(fileCont, jsOps);
        fs.ftruncateSync(file);
        fs.writeFileSync(file, result.code);
    }
}