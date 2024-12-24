class NetWork {
    #Server = "https://nav-api.tinger.host";  // 服务端api前缀，末尾不含`/`
    #makeHeader() {
        const token = Base.localTokenGet();
        const header = {};
        if (token !== null) {
            header[Base.TokenName] = token;
        }
        return header;
    }
    relate(engine, query) {
        if (query === undefined || query === "") return [];
        if (!["baidu", "bing", "google"].includes(engine)) return [];
        const url = `${this.#Server}/relate?engine=${engine}&query=${query}`;
        return new Promise(accept => {
            fetch(url).then(res => res.json()).then(res => accept(res));
        });
    }
    detail() {
        return new Promise(accept => {
            fetch(`${this.#Server}/links/detail`, {
                headers: this.#makeHeader(),
                method: "GET"
            }).then(res => res.json()).then(res => accept(res));
        });
    }
    updateCollapse(config) {
        console.log(config);
        const header = this.#makeHeader();
        if (!header.hasOwnProperty(Base.TokenName)) {
            return;
        }
        fetch(`${this.#Server}/links/collapse`, {
            method: "POST",
            headers: header,
            body: JSON.stringify(config)
        }).then(res => res.json()).then(res => console.log(res));
    }
    register(name, pass) {
        return new Promise(accept => {
            fetch(`${this.#Server}/test`, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                    pass: Base.sha128(`${name}-${pass}`)
                })
            }).then(res => res.json()).then(res => accept(res));
        });
    }
}

const Net = new NetWork();
