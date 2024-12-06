class NetWork {
    #ServerPrefix = "https://nav-api.tinger.host";  // 服务端api前缀，末尾不含`/`
    relate(engine, query) {
        if (query === undefined || query === "") return [];
        if (!["baidu", "bing", "google"].includes(engine)) return [];
        const url = `${this.#ServerPrefix}/relate?engine=${engine}&query=${query}`;
        return new Promise(resove => {
            fetch(url).then(res => res.json()).then(res => resove(res));
        });
    }
}

const Net = new NetWork();
