class NetWork {
  #Server = null;
  #Header = {};
  #authed() {
    return JSON.stringify(this.#Header) !== "{}";
  }
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
  rank(opt) {

  }
  collapse(opt) {
    if (JSON.stringify(this.#Header) === "{}") {
      return;
    }
    fetch(`${this.#Server}/group/collapse`, {
      method: "POST",
      headers: this.#Header,
      body: JSON.stringify(opt)
    });
  }
  groupAdd(name) {
    return new PromiseEx((acc, rej) => {

    });
  }
  groupRename(gid, name) {
    return new PromiseEx((acc, rej) => {

    });
  }
  groupDelete(gid) {
    return new PromiseEx((acc, rej) => {

    });
  }
  linkAdd(info, gid) {
    return new PromiseEx((acc, rej) => {

    });
  }
  linkEdit(info, gid, lid) {
    return new PromiseEx((acc, rej) => {

    });
  }
  linkDelete(gid, lid) {
    return new PromiseEx((acc, rej) => {

    });
  }
}
