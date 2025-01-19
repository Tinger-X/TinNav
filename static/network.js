class NetWork {
  #Server = null;
  #Header = {};
  constructor(server = null) {
    this.#Server = server;
  }
  setServer(server) {
    this.#Server = server;
  }
  setHeader(header) {
    this.#Header = header;
  }
  init() {
    return new PromiseEx((acc, rej) => {
      fetch(`${this.#Server}/init`, {
        method: "POST",
        headers: this.#Header
      }).then(res => res.json()).then(res => {
        res.code === 200 ? acc(res.data) : rej(res.msg);
      });
    });
  }
  setEngine(engine) {
    return new PromiseEx((acc, rej) => {
      fetch(`${this.#Server}/engine?target=${engine}`, {
        method: "POST",
        headers: this.#Header
      }).then(res => res.json()).then(res => res.code === 200 ? acc(res.data) : rej(res.msg));
    });
  }
  relate(engine, query) {
    return new PromiseEx((acc, rej) => {
      fetch(
        `${this.#Server}/relate?engine=${engine}&query=${query}`
      ).then(res => res.json()).then(res => res.code === 200 ? acc(res.data) : rej(res.msg));
    });
  }
  collapse(opt) {
    if (JSON.stringify(this.#Header) === "{}") {
      return;
    }
    fetch(`${this.#Server}/block/collapse`, {
      method: "POST",
      headers: this.#Header,
      body: JSON.stringify(opt)
    }).then(res => res.json()).then(res => console.log(res));
  }
  detail() {
    return new PromiseEx((acc, rej) => {
      fetch(`${this.#Server}/detail`, {
        method: "GET",
        headers: this.#Header
      }).then(res => res.json()).then(res => {
        res.code === 200 ? acc(res.data) : rej(res.msg);
      });
    });
  }
}
