const fs = require('fs');

function watchFile(file, callback) {
    console.log(`Watching for file changes on ${file}`);
    fs.watchFile(file, (curr, prev) => {
        console.log(`${file} file Changed`);
        callback()
    });
}
module.exports.watchFile = watchFile