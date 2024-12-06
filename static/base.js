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

class BaseUtil {
    #LocalKey = "__TinNav_Local__";
    #BaseString = "zxcvbnmlkjhgfdsaqwertyuiop0.123456789-ZXCVBNMLKJHGFDSAQWERTYUIOP_";
    randomString(size = 16) {
        let result = "";
        for (let i = 0; i < size; i++) {
            result += this.#BaseString.charAt(Math.floor(Math.random() * this.#BaseString.length));
        }
        return result;
    }
    localRelate(query) {
        const arr = JSON.parse(localStorage.getItem(this.#LocalKey) || "[]");
        const ptn = new RegExp(query.split().join(".*"), "i");
        let res = [];
        for (let i = 0; i < arr.length && res.length < 10; ++i) {
            if (ptn.test(arr[i])) {
                res.push(arr[i]);
            }
        }
        return res;
    }
    localUpdate(word) {
        if (word === undefined) {
            return;
        }
        let arr = JSON.parse(localStorage.getItem(this.#LocalKey) || "[]"), index = arr.indexOf(word);
        if (index !== -1) {
            arr.splice(index, 1);
        }
        arr.unshift(word);
        localStorage.setItem(this.#LocalKey, JSON.stringify(arr));
    }
    localDelete(word) {
        if (word === undefined) {
            return;
        }
        let arr = JSON.parse(localStorage.getItem(this.#LocalKey) || "[]"), index = arr.indexOf(word);
        if (index !== -1) {
            arr.splice(index, 1);
        }
        localStorage.setItem(this.#LocalKey, JSON.stringify(arr));
    }
    localClear() {
        localStorage.setItem(this.#LocalKey, "[]");
    }
}

const Base = new BaseUtil();