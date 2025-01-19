class PromiseEx {
  #Acc = null;
  #Rej = null;
  #default() {}
  constructor(fn) {
    setTimeout(() => fn(this.#Acc, this.#Rej), 0);
  }
  then(fn) {
    this.#Acc = fn || this.#default;
    return this;
  }
  catch(fn) {
    this.#Rej = fn || this.#default;
    return this;
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
