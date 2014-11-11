var connect = require("connect"),
    path = require("path");

var wwwPath = process.argv[2],
    host = connect().use(connect.logger('dev'));

if(!wwwPath) {
    console.log("Please input wwwPath!");
    return;
}
wwwPath = path.join(process.cwd(), wwwPath);

host.use( connect.static(wwwPath) )
    .use( connect.vhost("www.kamliao.com", host) )
    .listen(80);

console.log("host " + wwwPath + " at 127.0.0.1:80");