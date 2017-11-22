let fs = require('fs'),
    server = require('./source/server');

module.exports = server;

fs.watchFile('./dist/styles.css', update);

setTimeout(update, 2000);

function update() {

  fs.readFile(`./dist/styles.css`, (err, content) => {

    if(err) return;

    fs.writeFile(`./dist/styles.css`, String(content)
      .replace(`/*# sourceMappingURL=styles.css.map*/`, ''), (err) => {

      if(err) console.log(err);

    });

  });

}