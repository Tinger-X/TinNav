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
  #Data = ["bing"];
  constructor() {
    this.#Data = JSON.parse(localStorage.getItem(this.#Key) || `["bing"]`);
  }
  detail() {
    return this.#Data;
  }
  update(data) {
    const strNew = JSON.stringify(data), strNow = JSON.stringify(this.#Data);
    if (strNow !== strNew) {
      this.#Data = data;
      localStorage.setItem(this.#Key, strNew);
      return true;
    }
    return false;
  }
  setEngine(engine) {
    this.#Data[0] = engine;
    localStorage.setItem(this.#Key, JSON.stringify(this.#Data));
  }
  rank(opt) {
    
  }
  collapse(opt) {

  }
  groupAdd(name) {

  }
  groupRename(gid, name) {

  }
  groupDelete(gid) {

  }
  linkAdd(info, gid) {

  }
  linkEdit(info, gid, lid) {

  }
  linkDelete(gid, lid) {

  }
}
