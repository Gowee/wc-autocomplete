const http = require('http');
const https = require('https');
const { URL } = require('url');
const fetch = require('node-fetch');

const fetchInit = {
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
            return new http.Agent({
                keepAlive: true
            });
        } else {
            return new https.Agent({
                keepAlive: true
            });
        }
    }
};

async function duckSuggest(input) {
    const url = `https://duckduckgo.com/ac/?callback=autocompleteCallback&q=${encodeURIComponent(input)}&kl=wt-wt&_=${(new Date()).getTime()}`;
    const r = await fetch(url, fetchInit);
    const d = (await r.text()).slice("autocompleteCallback(".length, -");\n".length);
    const candidates = JSON.parse(d).map((item) => item.phrase);
    return candidates;
}

async function googleSuggest(input) {
    // const url = `https://www.google.com/complete/search?q=${encodeURIComponent(input)}&client=psy-ab`;
    const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(input)}`;
    const r = await fetch(url, fetchInit);
    const d = await r.text();
    const candidates = JSON.parse(d)[1]/*.map((item) => item[0])*/;
    return candidates;
}

const server = http.createServer();
server.on('request', async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    const url = new URL(req.url, "http://localhost:8821");
    if (url.pathname === "/google") {
        suggest = googleSuggest;
    }
    else {
        suggest = duckSuggest;
    }
    const candidates = await suggest(url.searchParams.get("input") || "");
    console.log(candidates);
    res.end(JSON.stringify(candidates));
})
console.log("Completer-server starting at http://localhost:8821...");
server.listen(8821);