(function () {
    var langsPack = {
        "langs": ["zh-cn", "en"],
        "pack": {
            "ui-yes": ["", "Yes"],
            "ui-no": ["", "No"]
        }
    }
    MizLang.AddLangsPack(langsPack);
})();

var UIFrame = (function () {
    function uiframe() {
        this.dom = null;
        this.alwaysShrink = false;
    }

    uiframe.prototype.Show = function (x, y) {
        var dom = this.dom;
        if (dom) {
            this.dom.style.display = "block";
            var H = window.innerHeight,
                W = window.innerWidth,
                h = dom.clientHeight,
                w = dom.clientWidth,
                X = 0, Y = 0;
            if (W>800 || this.alwaysShrink) {
                if (x+w>W) X = x-w; else X = x;
                if (y+h>H) Y = y-h; else Y = y;
            } else {
                X = 0;
                Y = (H-h)/2 | 0;
            }
            dom.style.top = Y+"px";
            dom.style.left = X+"px";
        }
    }

    uiframe.prototype.Close = function () {
        if (this.dom) {
            this.dom.style.display = "none";
        }
    }

    uiframe.prototype.Open = function () {
        console.log("Not Implemented!");
    }

    uiframe.createElementWithLabel = function (eleStr, labelKey) {
        var lbl = document.createElement("label"),
            ele = document.createElement(eleStr);
        lbl.textContent = MizLang.GetDefaultLang(labelKey);
        lbl.appendChild(ele);
        return [lbl, ele];
    }

    return uiframe;
})();

var UIWindow = (function () {
    function uiwindow(titleKey, hostDom) {
        UIFrame.call(this);
        this.yesCallback = null;
        this.noCallback = null;
        this.getValue = null;
        this.setValue = null;

        var dom = document.createElement("div");
        dom.className = "window";
        dom.appendChild(this.createDom(titleKey));
        this.dom = dom;
        hostDom.appendChild(dom);
    }

    uiwindow.prototype = Object.create(UIFrame.prototype);
    uiwindow.prototype.constructor = uiwindow;

    uiwindow.prototype.createDom = function (titleKey) {
        var fragEle = document.createDocumentFragment(),
            pTitle = document.createElement("p"),
            divContent = document.createElement("div"),
            divPanel = document.createElement("div"),
            divAllPanel = document.createElement("div");
        pTitle.className = "title";
        divContent.className = "content";
        divPanel.className = "panel";
        divAllPanel.className = "all-panel";
        pTitle.textContent = MizLang.GetDefaultLang(titleKey);
        var btnYes = document.createElement("button"),
            btnNo = document.createElement("button");
        btnNo.type = "button"; btnYes.type = "button";
        btnNo.textContent = MizLang.GetDefaultLang("ui-no");
        btnYes.textContent = MizLang.GetDefaultLang("ui-yes");
        divAllPanel.ChainAppend(btnYes).ChainAppend(btnNo);

        fragEle.ChainAppend(pTitle).ChainAppend(divContent).ChainAppend(
            divPanel).ChainAppend(divAllPanel);

        this.divPanel = divPanel;
        this.divContent = divContent;

        // btnNo.addEventListener("click", uiEvent(this, this.No), false);
        // btnYes.addEventListener("click", uiEvent(this, this.Yes), false);

        return fragEle;
    }

    uiwindow.prototype.SetPanel = function (panelFrag) {
        this.divPanel.appendChild(panelFrag);
    }
    uiwindow.prototype.SetContent = function (contentFrag) {
        this.divContent.appendChild(contentFrag);
    }

    uiwindow.prototype.SetGet = function (setValue, getValue) {
        this.setValue = setValue;
        this.getValue = getValue;
    }

    uiwindow.prototype.Open = function (evt, val, yesCallback, noCallback) {
        // uiStack.push(this);
        this.Show(evt.clientX, evt.clientY);
        this.setValue(val);
        this.yesCallback = yesCallback;
        this.noCallback = noCallback;
        this.dom.querySelector("input, textarea, select, button").focus();
    }

    return uiwindow;
})();

var UIMenu = (function () {
    function uimenu(hostDom) {
        UIFrame.call(this);
        this.alwaysShrink = true;
        var ul = document.createElement("ul");
        ul.className = "menu";
        this.dom = ul;
        this.relEle = null;
        hostDom.appendChild(ul);
    }

    uimenu.prototype = Object.create(UIFrame.prototype);
    uimenu.prototype.constructor = uimenu;

    uimenu.prototype.AppendItems = function (menuItems) {
        // menuItems: [{title, func}]
        var fragEle = document.createDocumentFragment();
        for (var i in menuItems) {
            if (menuItems.hasOwnProperty(i)) {
                var menuItem = menuItems[i];
                var li = document.createElement("li");
                li.textContent = menuItem["title"];
                li.className = "menu-item";
                li.MizBind(menuItem["func"]);
                fragEle.appendChild(li);
            }
        }
        this.dom.appendChild(fragEle);
    }

    uimenu.prototype.Open = function (evt, relEle) {
        // uiStack.push(this);
        if (this.relEle!=relEle) {
            if (this.relEle) this.relEle.classList.remove("hover");
            this.relEle = relEle;
            if (relEle) relEle.classList.add("hover");
        }
        this.Show(evt.clientX, evt.clientY);
    }
})();

var UIOptionMenu = (function () {
    // the difference between UIOptionMenu and UIMenu
    // UIOptionMenu share same callback, but different options on menuItem
    // menuItem from UIMenu has its own callback
    // UIOptionMenu is for menu on same/one button
    // UIMenu is for menu on different items (TableEntry, HashEntry, ItemEntry)
    function uimenu(hostDom) {
        UIMenu.call(this, hostDom);
    }
    uimenu.prototype = Object.create(UIMenu.prototype);
    uimenu.prototype.constructor = uimenu;
    uimenu.prototype.AppendItems = function (menuItems) {
        // menuItems: [{title, value}]
    }
    uimenu.prototype.Open = function (evt, callback) {
        
    }
})();

var UIMask = (function () {
    function uimask(hostDom) {
        
    }

    uimask.prototype = Object.create(UIFrame.prototype);
    uimask.prototype.constructor = uimask;

    uimask.prototype.Show = function () {
        
    }

    return uimask;
})();