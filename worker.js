const Config = {
    front: "https://nav.tinger.host",  // 前端Pages绑定的域名，用于限制请求
};

addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

const BaseStr = "zxcvbnmlkjhgfdsaqwertyuiop0.123456789-ZXCVBNMLKJHGFDSAQWERTYUIOP_";
function randomString(size = 16) {
    let result = "";
    for (let i = 0; i < size; i++) {
        result += BaseStr.charAt(Math.floor(Math.random() * BaseStr.length));
    }
    return result;
}

function restfulResponse(code, data, msg) {
    const payload = JSON.stringify({ code: code, data: data, msg: msg });
    const resp = new Response(payload);
    resp.headers.set("Access-Control-Allow-Origin", Config.front);
    resp.headers.set("Access-Control-Allow-Methods", "GET,POST");
    resp.headers.set("Content-Type", "application/json");
    return resp;
}

async function handleRequest(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/relate")) {
        return handleRealte(request);
    }
    return restfulResponse(404, null, "Resource Not Found");
}

async function _fetchBaiduRelate(query) {
    const url = `https://www.baidu.com/sugrec?prod=pc&wd=${query}`;
    try {
        const resp = await fetch(url, { method: "GET", headers: UserAgentHeader });

        if (!resp.ok) {
            return restfulResponse(resp.status, null, resp.statusText);
        }
        const data = await resp.json();
        const payload = data.g.map(itr => itr.q);
        return restfulResponse(200, payload, "success");
    } catch (error) {
        return restfulResponse(500, null, "Error Fetch");
    }
}

async function _fetchBingRelate(query) {
    const url = `https://cn.bing.com/AS/Suggestions?csr=1&cvid=${randomString()}&qry=${query}`;
    try {
        const resp = await fetch(url, { method: "GET", headers: UserAgentHeader });

        if (!resp.ok) {
            return restfulResponse(resp.status, null, resp.statusText);
        }
        const data = await resp.json();
        const payload = data.s.map(itr => itr.q);
        return restfulResponse(200, payload, "success");
    } catch (error) {
        return restfulResponse(500, null, "Error Fetch");
    }
}

async function _fetchGoogleRelate(query) {
    const url = `https://www.google.com/complete/search?client=gws-wiz&q=${query}`;
    try {
        const resp = await fetch(url, { method: "GET", headers: UserAgentHeader });

        if (!resp.ok) {
            return restfulResponse(resp.status, null, resp.statusText);
        }
        const data = (await resp.text()).trim().slice(19, -1);
        const payload = JSON.parse(data)[0].map(itr => itr[0]);
        return restfulResponse(200, payload, "success");
    } catch (error) {
        return restfulResponse(500, null, "Error Fetch");
    }
}

const EnginesMap = { baidu: _fetchBaiduRelate, bing: _fetchBingRelate, google: _fetchGoogleRelate };
const UserAgentHeader = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0"
};  // user-agent-header
async function handleRealte(request) {
    const url = new URL(request.url);
    const params = url.searchParams;
    if (!params.has("engine") || !params.has("query")) {
        return restfulResponse(405, null, "Param Lost");
    }
    let engine = url.searchParams.get("engine"), query = url.searchParams.get("query")?.trim();
    if (query === null || query === "" || !EnginesMap.hasOwnProperty(engine)) {
        return restfulResponse(406, null, "Param Error");
    }
    return EnginesMap[engine](query);
}