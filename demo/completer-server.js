const PL = "autocompleteCallback(".length; // length of the left of JSONP 
const PR = ");\n".length; // length of the right of JSONP 


const http = require('http');
const https = require('https');
const url = require('url');
const fetch = require('node-fetch');

const httpAgent = new http.Agent({
    keepAlive: true
});
const httpsAgent = new https.Agent({
    keepAlive: true
});

const server = http.createServer();
server.on('request', async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    const q = url.parse(req.url, true).query;
    console.log(q.input);
    const d = await fetch(`https://duckduckgo.com/ac/?callback=autocompleteCallback&q=${encodeURIComponent(q.input)}&kl=wt-wt&_=${(new Date()).getTime()}`, {
        "credentials": "omit",
        "headers": {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:72.0) Gecko/20100101 Firefox/72.0",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5"
        },
        "referrer": "https://duckduckgo.com/",
        "method": "GET",
        "mode": "cors",
        "agent": function (_parsedURL) {
            if (_parsedURL.protocol == 'http:') {
                return httpAgent;
            } else {
                return httpsAgent;
            }
        }
    });
    const jsonp = await d.text()
    const candidates = JSON.parse(jsonp.slice(PL, -PR)).map((item) => item.phrase);
    console.log(candidates);
    res.end(JSON.stringify(candidates));
})
console.log("Completer-server starting at http://localhost:8821...");
server.listen(8821);