const EngineConf = {
    _R_: ["https://www.baidu.com/s?wd=", "baidu"],
    baidu: ["https://www.baidu.com/s?wd=", "百度一下，你就知道！"],
    bing: ["https://www.bing.com/search?q=", "有问题尽管问我..."],
    google: ["https://www.google.com/search?q=", "咕噜咕噜~"]
};
const $Engine = document.querySelector("#engine"),
    $SearchContent = document.querySelector("#search-content");

function slideBar() {
    const $slider = document.querySelector("#slide-bar"),
        $toTop = document.querySelector("#to-top");
    document.addEventListener("scroll", function () {
        const scrollHeight = document.body.scrollHeight - window.innerHeight, scrollTop = Math.min(window.scrollY, scrollHeight);
        $slider.style.width = `${(scrollTop / scrollHeight) * 100}%`;

        if (scrollTop > window.innerHeight * 0.5) {
            $toTop.classList.add("show");
        } else {
            $toTop.classList.remove("show");
        }
    });
    $toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
}

function engines() {
    let timer = null;
    const $engines = document.querySelectorAll(".engine:not(#engine)");

    $engines.forEach($eng => {
        $eng.addEventListener("click", function () {
            const key = this.getAttribute("alt");
            $Engine.setAttribute("src", `img/${key}.svg`);
            $Engine.setAttribute("alt", key);
            EngineConf._R_ = [EngineConf[key][0], key];
            $SearchContent.setAttribute("placeholder", EngineConf[key][1]);
        });
        $eng.addEventListener("mouseenter", function () {
            if (timer !== null) {
                clearTimeout(timer);
                timer = null;
            }
        });
        $eng.addEventListener("mouseleave", function () {
            timer = setTimeout(() => {
                $engines.forEach($eng => $eng.classList.remove("show"));
                timer = null;
            }, 200);
        });
    });

    $Engine.addEventListener("mouseenter", function () {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        } else {
            $engines.forEach($eng => $eng.classList.add("show"));
        }
    });
    $Engine.addEventListener("mouseleave", function () {
        timer = setTimeout(() => {
            $engines.forEach($eng => $eng.classList.remove("show"));
            timer = null;
        }, 500);
    });
}

function createRelate(local = true, text = "", fn) {
    const $relate = document.createElement("div");
    $relate.classList.add("relate-item");

    const $icon = document.createElement("img");
    const which = local ? "history" : "hot";
    $icon.setAttribute("src", `img/${which}.svg`);
    $icon.setAttribute("alt", which);
    $icon.classList.add("relate-icon");

    const $text = document.createElement("div");
    $text.classList.add("relate-text");
    $text.innerText = text;

    $relate.appendChild($icon);
    $relate.appendChild($text);

    if (local) {
        const $delete = document.createElement("img");
        $delete.setAttribute("src", "img/delete.svg");
        $delete.setAttribute("alt", "delete");
        $delete.classList.add("relate-delete");
        $delete.addEventListener("click", e => {
            Base.localDelete(text);
            $relate.remove();
            e.stopPropagation();
        });
        $relate.appendChild($delete);
    }

    $relate.addEventListener("click", () => {
        fn && fn(text);
    });
    return $relate;
}

function search() {
    let timer = null, compose = false, cache = "", show = false;
    const $seach_img = document.querySelector("#search-image");
    const $relate_container = document.querySelector("#relate-container");
    const $local_relate = $relate_container.querySelector("#local-relate");
    const $engine_relate = $relate_container.querySelector("#engine-relate");

    const clear_timer = () => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    }
    const reset_timer = () => {
        clear_timer();
        const value = $SearchContent.value.trim();
        if (value === "") {
            return;
        }
        timer = setTimeout(() => {
            timer = null;
            doRelate(EngineConf._R_[1], value);
        }, 500);
    }

    const doRelate = (eng, val) => {
        if (val === cache) {
            return;
        }
        cache = val;

        const local = Base.localRelate(val);
        $local_relate.innerHTML = "";
        local.forEach(v => {
            const $item = createRelate(true, v, doSearch);
            $local_relate.appendChild($item);
        });
        Net.relate(eng, val).then(res => {
            if (res.code === 200) {
                $engine_relate.innerHTML = "";
                res.data.forEach(v => {
                    const $item = createRelate(false, v, doSearch);
                    $engine_relate.appendChild($item);
                });
            }
        });
        $relate_container.classList.add("show");
    }
    const doSearch = (val) => {  // 不传时为 undefined
        clear_timer();
        const value = val || $SearchContent.value.trim();
        if (value === "") {
            return;
        }
        window.open(`${EngineConf._R_[0]}${value}`);
        $SearchContent.value = "";
        $relate_container.classList.remove("show");
        Base.localUpdate(value);
    }

    const showRelate = () => {
        if ($local_relate.childNodes.length !== 0 || $engine_relate.childNodes.length !== 0) {
            show = true;
            $relate_container.classList.add("show");
        }
    }
    const hideRelate = () => {
        show = false;
        setTimeout(() => {
            if (!show) {
                $relate_container.classList.remove("show");
            }
        }, 200);
    }

    $seach_img.addEventListener("click", doSearch);

    $relate_container.addEventListener("mouseenter", showRelate);
    $relate_container.addEventListener("mouseleave", hideRelate);

    $SearchContent.addEventListener("mouseenter", showRelate);
    $SearchContent.addEventListener("mouseleave", hideRelate);
    $SearchContent.addEventListener("compositionstart", () => {
        compose = true;
    });
    $SearchContent.addEventListener("compositionend", () => {
        compose = false;
        reset_timer();
    });
    $SearchContent.addEventListener("input", function () {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
        if (compose) {
            return;
        }
        reset_timer();
    });
    $SearchContent.addEventListener("keydown", e => {
        if (e.keyCode === 13) {
            doSearch();
        }
    });
}

const DB_DATA = {

};

function linkBlocks() {

}

window.onload = function () {
    slideBar();
    engines();
    search();
    linkBlocks();
}