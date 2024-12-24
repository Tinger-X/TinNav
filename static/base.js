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
    TokenName = "Tin-Nav-Token";
    #LocalRelateKey = "__TinNav_Local_Relate__";
    #LocalTokenKey = "__TinNav_Local_Token__";
    #BaseString = "zxcvbnmlkjhgfdsaqwertyuiop0.123456789-ZXCVBNMLKJHGFDSAQWERTYUIOP_";
    #ShaSeed = 217;
    #ShaSize = 16;
    randomString(size = 16) {
        let result = "";
        for (let i = 0; i < size; i++) {
            result += this.#BaseString.charAt(Math.floor(Math.random() * this.#BaseString.length));
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
    sha128(plain) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);
        const hash = new Uint8Array(this.#ShaSize);
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];
            for (let j = 0; j < this.#ShaSize; j++) {
                hash[j] = (hash[j] + ((byte ^ (j * 7) ^ this.#ShaSeed) + (i * 11) + data.length)) % 256;
            }
        }
        for (let k = 0; k < this.#ShaSize; k++) {
            hash[k] = (hash[k] * this.#ShaSeed + (k * 3)) % 256;
        }
        let res = "";
        for (let i = 0; i < hash.length; i++) {
            const hex = hash[i].toString(16).padStart(2, "0");
            res += hex;
        }
        return res;
    }
}

const Base = new BaseUtil();