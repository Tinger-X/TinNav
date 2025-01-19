const EngineConf = {
  _R_: ["https://www.baidu.com/s?wd=", "baidu"],
  baidu: ["https://www.baidu.com/s?wd=", "百度一下，你就知道！"],
  bing: ["https://www.bing.com/search?q=", "有问题尽管问我..."],
  google: ["https://www.google.com/search?q=", "咕噜咕噜~"]
};
const $Engine = document.querySelector("#engine"),
  $SearchContent = document.querySelector("#search-content"),
  $LinkBlocks = document.querySelector("#link-blocks");
const TinAlert = new Alert("#alert");
// const TinManager = new Manager("http://127.0.0.1:8787", "Tin-Nav-Token");
const TinManager = new Manager("https://nav-api.tinger.host", "Tin-Nav-Token");
const SetEngine = key => {
  $Engine.setAttribute("src", `img/${key}.svg`);
  $Engine.setAttribute("alt", key);
  EngineConf._R_ = [EngineConf[key][0], key];
  $SearchContent.setAttribute("placeholder", EngineConf[key][1]);
}

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

function loginBtn() {
  const $loginBtn = document.querySelector("#login-btn");
  if (TinManager.loginStatus()) {
    $loginBtn.classList.add("exit");
    $loginBtn.textContent = "退出登录";
  } else {
    $loginBtn.textContent = "点击登录";
  }
  $loginBtn.addEventListener("click", () => {
    if (TinManager.loginStatus()) {
      TinManager.logout();
      $loginBtn.classList.remove("exit");
      $loginBtn.textContent = "点击登录";
    } else {
      TinManager.oauthLogin(res => {
        if (res.code === 200) {
          TinAlert.info("登录成功");
          $loginBtn.classList.add("exit");
          $loginBtn.textContent = "退出登录";
        } else {
          TinAlert.warn(res.msg);
        }
      });
    }
  });
}

function engines() {
  let timer = null;
  const $engines = document.querySelectorAll(".engine:not(#engine)");

  $engines.forEach($eng => {
    $eng.addEventListener("click", function () {
      SetEngine(this.getAttribute("alt"));
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
      TinManager.localRelateDelete(text);
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

    TinManager.relate(eng, val).then(res => {
      if (res.type === "local") {
        $local_relate.innerHTML = "";
        res.data.forEach(word => {
          const $item = createRelate(true, word, doSearch);
          $local_relate.appendChild($item);
        });
      } else {
        $engine_relate.innerHTML = "";
        res.data.forEach(word => {
          const $item = createRelate(false, word, doSearch);
          $engine_relate.appendChild($item);
        });
      }
    }).catch(err => TinAlert.warn(err));
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
    TinManager.localRelateUpdate(value);
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

function createLink(bid, lid, info) {
  const $link = document.createElement("div");
  $link.classList.add("link");

  const $link_actions = document.createElement("div");
  $link_actions.classList.add("link-actions");
  const $action_delete = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  $action_delete.classList.add("link-delete");
  $action_delete.setAttribute("viewBox", "0 0 1024 1024");
  $action_delete.innerHTML = `<path d="M910.016 213.312h-148.928V113.92a49.664 49.664 0 0 0-49.664-49.664H313.92h-0.064a49.664 49.664 0 0 0-49.664 49.664v99.328H115.2a49.664 49.664 0 0 0 0 99.328h49.664V908.8c0 27.52 22.272 49.664 49.664 49.664h596.032a50.752 50.752 0 0 0 19.328-3.904 49.792 49.792 0 0 0 30.336-45.824V312.768v-0.128h49.664a49.6 49.6 0 0 0 0.128-99.328zM363.52 163.648h298.24v49.664H363.52v-49.664z m198.656 695.488H463.04V312.768v-0.128h99.136V859.136zM363.712 312.64V859.136H264.256V312.768v-0.128h99.456z m397.312 0.128v546.368h-99.456V312.768l-0.064-0.128h99.52v0.128z"/>`;
  $action_delete.addEventListener("click", e => {
    e.stopPropagation();
    console.log(`delete block[${bid}][${lid}]: ${info[0]}`);
  });
  $link_actions.appendChild($action_delete);
  const $action_edit = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  $action_edit.classList.add("link-edit");
  $action_edit.setAttribute("viewBox", "0 0 1024 1024");
  $action_edit.innerHTML = `<path d="M928 365.664a32 32 0 0 0-32 32V864a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h429.6a32 32 0 0 0 0-64H160a96 96 0 0 0-96 96v704a96 96 0 0 0 96 96h704a96 96 0 0 0 96-96V397.664a32 32 0 0 0-32-32z"/><path d="M231.616 696.416a38.4 38.4 0 0 0 44.256 53.792l148-38.368L950.496 185.248 814.72 49.472 290.432 573.76l-58.816 122.656z m111.808-85.12L814.72 140l45.248 45.248-468.992 468.992-77.824 20.16 30.272-63.104z"/>`;
  $action_edit.addEventListener("click", e => {
    e.stopPropagation();
    console.log(`edit block[${bid}][${lid}]: ${info[0]}`);
  });
  $link_actions.appendChild($action_edit);
  $link.appendChild($link_actions);

  const $link_info = document.createElement("div");
  $link_info.classList.add("link-info");
  const $link_icon = document.createElement("img");
  $link_icon.classList.add("link-icon");
  $link_icon.setAttribute("src", info[2]);
  $link_icon.setAttribute("alt", "icon");
  $link_info.appendChild($link_icon);
  const $link_name = document.createElement("div");
  $link_name.classList.add("link-name");
  $link_name.innerText = info[0];
  $link_info.appendChild($link_name);
  $link.appendChild($link_info);

  $link.addEventListener("click", () => window.open(info[1], "_blank"));
  return $link;
}

function createLinkAdd(index) {
  const $link_add = document.createElement("div");
  $link_add.classList.add("link-add");

  const $link_icon = document.createElement("img");
  $link_icon.classList.add("link-icon");
  $link_icon.setAttribute("src", "img/add.svg");
  $link_icon.setAttribute("alt", "icon");
  $link_add.appendChild($link_icon);
  const $link_name = document.createElement("div");
  $link_name.classList.add("link-name");
  $link_name.innerText = "点击添加连接";
  $link_add.appendChild($link_name);

  $link_add.addEventListener("click", () => {
    console.log(`add new link to block[${index}]`);
  });
  return $link_add;
}

function createBlock(index, info, links) {
  const [collapse, name] = info;
  const $block_container = document.createElement("div");
  $block_container.classList.add("link-block-container");
  const control_class = collapse === 1 ? "collapse" : "expand";
  $block_container.classList.add(control_class);

  const $title_container = document.createElement("div");
  $title_container.classList.add("link-block-title-container");
  const $block_title = document.createElement("input");
  $block_title.classList.add("link-block-title");
  $block_title.setAttribute("type", "text");
  $block_title.setAttribute("placeholder", "[双击修改]");
  $block_title.value = name || "";
  $block_title.readOnly = true;
  $block_title.addEventListener("dblclick", () => {
    $block_title.readOnly = false;
  });
  $block_title.addEventListener("change", () => {
    console.log(`change block[${index}].name to ${$block_title.value}`);
  });
  $block_title.addEventListener("blur", () => {
    $block_title.readOnly = true;
  })
  $title_container.appendChild($block_title);

  const $block_dragger = document.createElement("div");
  $block_dragger.classList.add("block-dragger");
  $block_dragger.innerHTML = `<img src="img/drag.svg" alt="drag"/>`;
  $title_container.appendChild($block_dragger);

  const $block_actions = document.createElement("div");
  $block_actions.classList.add("link-block-actions");
  const $action_delete = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  $action_delete.classList.add("link-block-delete");
  $action_delete.setAttribute("viewBox", "0 0 1024 1024");
  $action_delete.innerHTML = `<path d="M512 1024C229.238154 1024 0 794.761846 0 512S229.238154 0 512 0s512 229.238154 512 512-229.238154 512-512 512z m236.307692-551.384615H551.384615V275.692308a39.384615 39.384615 0 1 0-78.76923 0v196.923077H275.692308a39.384615 39.384615 0 1 0 0 78.76923h196.923077v196.923077a39.384615 39.384615 0 1 0 78.76923 0V551.384615h196.923077a39.384615 39.384615 0 0 0 0-78.76923z"/>`;
  $action_delete.addEventListener("click", () => {
    console.log(`delete block: ${index}`);
  });
  $block_actions.appendChild($action_delete);
  const $action_collapse = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  $action_collapse.classList.add("link-block-collapse");
  $action_collapse.setAttribute("viewBox", "0 0 1024 1024");
  $action_collapse.innerHTML = `<path d="M758.613333 465.493333l-221.013333 235.52a35.84 35.84 0 0 1-52.48 0L264.533333 465.066667a35.84 35.84 0 1 1 52.48-49.066667L512 623.786667l194.56-207.36a35.84 35.84 0 1 1 52.48 49.066666zM512 0a512 512 0 1 0 512 512A512 512 0 0 0 512 0z"/>`;
  $action_collapse.addEventListener("click", () => {
    const shown = $block_container.classList.contains("expand");
    if (shown) {
      $block_container.classList.remove("expand");
      $block_container.classList.add("collapse");
    } else {
      $block_container.classList.remove("collapse");
      $block_container.classList.add("expand");
    }
    TinManager.collapse({ type: "one", index: index, status: shown ? 0 : 1 });
  });
  $block_actions.appendChild($action_collapse);
  $title_container.appendChild($block_actions);
  $block_container.appendChild($title_container);

  const $links = document.createElement("div");
  $links.classList.add("links");
  for (let i = 0; i < links.length; ++i) {
    $links.appendChild(createLink(index, i, links[i]));
  }
  $links.appendChild(createLinkAdd(index));
  $block_container.appendChild($links);
  new Sortable($links, {
    group: "shared",
    animation: 500,
    ghostClass: "sortable-ghost",
    draggable: ".link",
    handle: ".link",
    onEnd: handleLinkSortEnd
  });

  return $block_container;
}

function handleLinkSortEnd(event) {
  if (event.oldIndex === event.newIndex && event.from === event.to) {
    return;
  }

  const from = Array.from($LinkBlocks.children).indexOf(event.from.parentNode);
  const to = Array.from($LinkBlocks.children).indexOf(event.to.parentNode);

  console.log({
    type: "item",
    data: [from, event.oldIndex, to, event.newIndex]
  });
}

function handleBlockSortEnd(event) {
  if (event.oldIndex === event.newIndex) {
    return;
  }

  console.log({
    type: "block",
    data: [event.oldIndex, event.newIndex]
  });
}

function linkBlocks() {
  $LinkBlocks.clear();
  const $action_block_add = document.querySelector("#link-block-add");
  const $action_blocks_collapse = document.querySelector("#link-blocks-collapse");
  $action_block_add.addEventListener("click", () => {
    console.log("add new block");
  });
  $action_blocks_collapse.addEventListener("click", () => {
    const $expanded_list = document.querySelectorAll(".link-block-container.expand");
    if ($expanded_list.length > 0) {
      for (let i = 0; i < $expanded_list.length; ++i) {
        $expanded_list[i].classList.remove("expand");
        $expanded_list[i].classList.add("collapse");
      }
      TinManager.collapse({ type: "all", status: 0 });
    } else {
      const $collapsed_list = document.querySelectorAll(".link-block-container.collapse");
      for (let i = 0; i < $collapsed_list.length; ++i) {
        $collapsed_list[i].classList.remove("collapse");
        $collapsed_list[i].classList.add("expand");
      }
      TinManager.collapse({ type: "all", status: 1 });
    }
  });
  TinManager.detail().then(detail => {
    SetEngine(detail[0]);
    $LinkBlocks.clear();
    for (let index = 1; index < detail.length; ++index) {
      const [info, ...links] = detail[index];
      const $block = createBlock(index, info, links);
      $LinkBlocks.appendChild($block);
    }
    new Sortable($LinkBlocks, {
      animation: 500,
      ghostClass: "sortable-ghost",
      handle: ".block-dragger",
      onEnd: handleBlockSortEnd
    });
  }).catch(err => TinAlert.warn(err));
}

window.onload = function () {
  slideBar();
  loginBtn();
  engines();
  search();
  linkBlocks();
}