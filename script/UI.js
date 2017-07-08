(function () {
    var langsPack = {
        "langs": ["zh-cn", "en"],
        "pack": {
            "ui-yes": ["", "Yes"],
            "ui-no": ["", "No"],
            "ui-addtable": ["", "Add Table"],
            "ui-import": ["", "Import"],
            "ui-addhash": ["", "Add Hash"],
            "ui-paste": ["", "Paste"]
        }
    }
    MizLang.AddLangsPack(langsPack);
})();

var mizUIFrame = (function () {
    function uiframe() {
        this.dom = null;
        this.isOn = false;
        this.alwaysShrink = false;
        /**
         * set "true" to menu, it won't fit screen.
         * or maybe yes/will?
         */
    }

    uiframe.prototype.Show = function (x, y) {
        var dom = this.dom;
        if (dom) {
            if (!this.isOn) {
                this.dom.style.display = "block";
                this.isOn = true;
            }
            var H = window.innerHeight,
                W = window.innerWidth,
                h = dom.clientHeight,
                w = dom.clientWidth,
                X = 0, Y = 0;
            if (W > 800 || this.alwaysShrink) {
                if (x + w > W) X = x - w; else X = x;
                if (y + h > H) Y = y - h; else Y = y;
            } else {
                X = 0;
                Y = (H - h) / 2 | 0;
            }
            dom.style.top = Y + "px";
            dom.style.left = X + "px";
        }
    }

    uiframe.prototype.Close = function () {
        if (this.isOn) {
            this.dom.style.display = "none";
            this.isOn = false;
        }
    }

    return uiframe;
})();

var mizUIWindow = (function () {
    var uiStack = [];
    function uiEvent(obj, action) {
        return function (evt) {
            var last = uiStack.pop();
            if (obj == last) {
                action.call(obj);
            } else {
                uiStack.push(last);
            }
        }
    }
    document.body.addEventListener("keydown", function (evt) {
        var last = uiStack.pop();
        if (last) {
            if (evt.which==27)
                last.No();
            else if (evt.which==13)
                last.Yes();
            else
                uiStack.push(last);
        }
    }, false);

    function uiwindow(titleKey, hostDom) {
        mizUIFrame.call(this);
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

    uiwindow.prototype = Object.create(mizUIFrame.prototype);
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

        btnNo.addEventListener("click", uiEvent(this, this.No), false);
        btnYes.addEventListener("click", uiEvent(this, this.Yes), false);

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

    uiwindow.prototype.Yes = function () {
        if (this.yesCallback) {
            this.yesCallback(this.getValue());
        }
        this.Close();
    }
    uiwindow.prototype.No = function () {
        if (this.noCallback) this.noCallback();
        this.Close();
    }

    uiwindow.prototype.Open = function (evt, val, yesCallback, noCallback) {
        uiStack.push(this);
        this.Show(evt.clientX, evt.clientY);
        this.setValue(val);
        this.yesCallback = yesCallback;
        this.noCallback = noCallback;
        this.dom.querySelector("input, textarea, select, button").focus();
    }

    return uiwindow;
})();

var mizUIMenu = (function () {
    function uimenu(menuItems, domParent) {
        // menuItems: [{title, func}]
        mizUIFrame.call(this);
        this.domParent = domParent;
        var ul = document.createElement("ul");
        ul.className = "menu";
        this.dom = ul;
        this.AppendItems(menuItems);
    }

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
                fragEle.appendChild(li)
            }
        }
        this.dom.appendChild(fragEle);
    }

    return uimenu;
})();

var hsoUI = {
    AddTable: (function (hostDom) {
        var addTableWindow = new mizUIWindow("ui-addtable", hostDom);

        var fragEle = document.createDocumentFragment(),
            inputName = document.createElement("input"),
            lblName = document.createElement("label");
        inputName.type = "text";
        lblName.textContent = MizLang.GetDefaultLang("ui-addtable");
        fragEle.ChainAppend(lblName).ChainAppend(inputName);
        addTableWindow.SetContent(fragEle);

        var fragEle = document.createDocumentFragment(),
            btnFile = document.createElement("input"),
            btnImport = document.createElement("button"),
            cmbServer = document.createElement("select");
        btnImport.type = "button"; btnImport.id = "btn-tablefile";
        btnFile.type = "file"; btnFile.id = "input-tablefile";
        btnFile.multiple = true;
        btnImport.textContent = MizLang.GetDefaultLang("ui-import");
        // add event listener for import
        fragEle.ChainAppend(cmbServer).ChainAppend(btnImport).ChainAppend(btnFile);
        addTableWindow.SetPanel(fragEle);

        addTableWindow.SetGet(
            function (name) {
                inputName.value = name;
            },
            function () {
                return {
                    "type": cmbServer[cmbServer.selectedIndex].value,
                    "name": inputName.value
                }
            }
        );

        addTableWindow.RegisterServers = function (srvs) {
            var fragEle = document.createDocumentFragment();
            for (var i in srvs) {
                var o = document.createElement("option");
                o.textContent = srvs[i]["name"];
                o.value = srvs[i]["value"];
                fragEle.appendChild(o);
            }
            cmbServer.appendChild(fragEle);
        }

        return addTableWindow;
    })(document.getElementById("window-zone")),
    AddHash: (function (hostDom) {
        var addHashWindow = new mizUIWindow("ui-addhash", hostDom);

        var fragEle = document.createDocumentFragment(),
            inputName = document.createElement("input"),
            lblName = document.createElement("label");
        inputName.type = "text";
        lblName.textContent = MizLang.GetDefaultLang("ui-addhash");
        fragEle.ChainAppend(lblName).ChainAppend(inputName);
        addHashWindow.SetContent(fragEle);

        var fragEle = document.createDocumentFragment(),
            btnPaste = document.createElement("button");
        btnPaste.type = "button"; btnPaste.id = "btn-pastehash";
        btnPaste.textContent = MizLang.GetDefaultLang("ui-paste");
        fragEle.appendChild(btnPaste);
        addHashWindow.SetPanel(fragEle);

        addHashWindow.SetGet(
            function (name) {
                inputName.value = name;
            },
            function () {
                return inputName.value;
            }
        );

        return addHashWindow;
    })(document.getElementById("window-zone"))
}