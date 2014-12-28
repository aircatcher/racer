var connect = require('connect'),
	morgan = require('morgan'),
	serveStatic = require('serve-static'),
	nPath = require('path'),
	app = connect(),
	staticDir = nPath.join(process.cwd(), process.argv[2]);

app.use(morgan()).use(serveStatic(staticDir)).listen(80);

console.log("host " + staticDir + " at 127.0.0.1:80");