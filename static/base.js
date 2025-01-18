String.prototype.format = function () {
  if (arguments.length === 0) {
    return this;
  }
  let s = this;
  for (let i = 0; i < arguments.length; i++) {
    s = s.replace(new RegExp(`\\{${i}\\}`, "g"), arguments[i]);
  }
  return s;
};

class LocalToken {
  #Key = "_Local_Token_";
  #Token = null;
  #Name = null;
  #MinSize = 8;
  constructor(name) {
    this.#Name = name || "Token";
    this.#Token = localStorage.getItem(this.#Key);
  }
  setName(name) {
    this.#Name = name;
  }
  valid() {
    return this.#Token && this.#Token.length >= this.#MinSize;
  }
  get() {
    return this.#Token;
  }
  set(token) {
    this.#Token = token;
    localStorage.setItem(this.#Key, token);
  }
  del() {
    this.#Token = null;
    localStorage.removeItem(this.#Key);
  }
  makeHeader() {
    const header = {};
    if (this.valid()) {
      header[this.#Name] = this.#Token;
    }
    return header;
  }
}

class LocalRelate {
  #Key = "_Local_Relate_";
  #Data = [];
  constructor() {
    this.#Data = JSON.parse(localStorage.getItem(this.#Key) || "[]");
  }
  search(query) {
    const ptn = new RegExp(query.split().join(".*"), "i");
    const res = [];
    for (let i = 0; i < this.#Data.length && res.length < 10; ++i) {
      if (ptn.test(this.#Data[i])) {
        res.push(this.#Data[i]);
      }
    }
    return res;
  }
  update(word) {
    if (word === undefined) {
      return;
    }
    const index = this.#Data.indexOf(word);
    if (index !== -1) {
      this.#Data.splice(index, 1);
    }
    this.#Data.unshift(word);
    localStorage.setItem(this.#Key, JSON.stringify(this.#Data));
  }
  delete(word) {
    if (word === undefined) {
      return;
    }
    const index = this.#Data.indexOf(word);
    if (index !== -1) {
      this.#Data.splice(index, 1);
    }
    localStorage.setItem(this.#Key, JSON.stringify(this.#Data));
  }
}

class LocalDetail {
  #Key = "_Local_Detail_";
  #Data = [];
  constructor() {
    this.#Data = JSON.parse(localStorage.getItem(this.#Key) || "[]");
  }
  all() {
    return this.#Data;
  }
  addBlock() {
    // TODO
  }
}

class NetWork {
  #Local = {
    token: new LocalToken(),
    relate: new LocalRelate(),
    detail: new LocalDetail()
  };
  #Server = null;
  #onLoginResult = null;
  constructor(server, tokenName) {
    this.#Server = server;
    this.#Local.token.setName(tokenName);
    window.addEventListener("message", event => {
      try {
        const res = JSON.parse(event.data);
        if (res.code === 200) {
          this.#Local.token.set(res.data);
        }
        this.#onLoginResult && this.#onLoginResult(res);
      } catch (e) {
        console.log(e);
      }
    });
  }
  oauth(fn, force = false) {
    if (!force && this.#Local.token.valid()) {
      return;
    }
    this.#onLoginResult = fn;
    window.open(`https://wx-api.tinger.host/oauth?target=${window.location.href}`);
  }
  logout() {
    this.#Local.token.del();
  }
  init(fn) {
    const oauthFn = result => {
      if (result.code === 200) {
        fetch(`${this.#Server}/init`, {
          method: "POST",
          headers: this.#Local.token.makeHeader()
        }).then(res => res.json()).then(res => {
          fn && fn(res);
        });
      }
    };
    this.oauth(oauthFn, true);
  }
}

class BaseUtil {
  TokenName = "Tin-Nav-Token";
  #LocalRelateKey = "__TinNav_Local_Relate__";
  #LocalTokenKey = "__TinNav_Local_Token__";
  #LocalDetailKey = "__TinNav_Local_Detail__";
  static #BaseString = "zxcvbnmlkjhgfdsaqwertyuiop0.123456789-ZXCVBNMLKJHGFDSAQWERTYUIOP_";

  static randomString(size = 16) {
    let result = "";
    for (let i = 0; i < size; i++) {
      result += BaseUtil.#BaseString.charAt(Math.floor(Math.random() * BaseUtil.#BaseString.length));
    }
    return result;
  }
  localRelateSearch(query) {
    const arr = JSON.parse(localStorage.getItem(this.#LocalRelateKey) || "[]");
    const ptn = new RegExp(query.split().join(".*"), "i");
    let res = [];
    for (let i = 0; i < arr.length && res.length < 10; ++i) {
      if (ptn.test(arr[i])) {
        res.push(arr[i]);
      }
    }
    return res;
  }
  localRelateUpdate(word) {
    if (word === undefined) {
      return;
    }
    let arr = JSON.parse(localStorage.getItem(this.#LocalRelateKey) || "[]"), index = arr.indexOf(word);
    if (index !== -1) {
      arr.splice(index, 1);
    }
    arr.unshift(word);
    localStorage.setItem(this.#LocalRelateKey, JSON.stringify(arr));
  }
  localRelateDelete(word) {
    if (word === undefined) {
      return;
    }
    let arr = JSON.parse(localStorage.getItem(this.#LocalRelateKey) || "[]"), index = arr.indexOf(word);
    if (index !== -1) {
      arr.splice(index, 1);
    }
    localStorage.setItem(this.#LocalRelateKey, JSON.stringify(arr));
  }
  localRelateClear() {
    localStorage.setItem(this.#LocalRelateKey, "[]");
  }
  localTokenGet() {
    return localStorage.getItem(this.#LocalTokenKey);
  }
  localTokenSet(token) {
    localStorage.setItem(this.#LocalTokenKey, token);
  }
  localTokenRemove() {
    localStorage.removeItem(this.#LocalTokenKey);
  }
  localDetailGet() {
    return JSON.parse(localStorage.getItem(this.#LocalDetailKey) || "[]");
  }
}

class Alert {
  #leave = false;
  #click = false;
  #timer = null;
  #then = null;
  #$root = null;
  #$title = null;
  #$msg = null;
  #$close = null;
  #init() {
    if (this.#timer !== null) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
    this.#leave = false;
    this.#click = false;
  }
  #handleClose() {
    this.#init();
    this.#$root.classList.remove("show");
    this.#then && this.#then();
    this.then = null;
  }
  #common(msg, sec) {
    this.#init();
    this.#$msg.textContent = msg;
    this.#timer = setTimeout(this.#handleClose.bind(this), sec * 1000);
  }
  constructor(root = "#alert") {
    this.#$root = document.querySelector(root);
    this.#$title = this.#$root.querySelector(".alert-title");
    this.#$msg = this.#$root.querySelector(".alert-msg");
    this.#$close = this.#$root.querySelector(".alert-close");

    this.#$close.addEventListener("click", () => {
      this.#click = true;
      this.#handleClose();
    });
    this.#$root.addEventListener("mouseenter", this.#init.bind(this));
    this.#$root.addEventListener("mouseleave", () => {
      if (!this.#click) {
        this.#leave = true;
        setTimeout(() => { this.#leave && this.#handleClose(); }, 1000);
      }
    });
  }
  info(msg, sec = 3) {
    this.#common(msg, sec);
    this.#$title.textContent = "提 示";
    this.#$root.classList.remove("error");
    this.#$root.classList.add("show");
    return this;
  }
  warn(msg, sec = 3) {
    this.#common(msg, sec);
    this.#$title.textContent = "错 误";
    this.#$root.classList.add("error", "show");
    return this;
  }
  then(fn) {
    this.#then = fn;
  }
}

const Base = new BaseUtil();