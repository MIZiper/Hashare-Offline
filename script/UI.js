(function () {
    var langsPack = {
        "langs": ["zh-cn", "en"],
        "pack": {
            "ui-yes": ["", "Yes"],
            "ui-no": ["", "No"],
            "ui-addtable": ["", "Add Table"],
            "ui-import": ["", "Import"],
            "ui-addhash": ["", "Add Hash"],
            "ui-paste": ["", "Paste"],
            "ui-remotelist": ["", "Files List"],
            "ui-getentity": ["", "Down Entity"],
            "ui-deltable": ["", "Delete Table"],
            "ui-cfm2deltable": ["", "Are you sure to delete the table? By checking 'Delete Remote', the entity exists in remote server will be deleted."],
            "ui-delremote": ["", "Delete Remote"]
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
    var uiStack = [];
    document.body.addEventListener("click", function (evt) {
        var last = uiStack.pop();
        if (last) {
            var li = evt.target.MizUpTo("menu-item");
            if (li) {
                var func = li.MizObject;
                func(last.relEle, evt);
            }
            // this will cause problem if more than one menu is opened

            if (last.relEle) last.relEle.classList.remove("hover");
            last.relEle = null;
            last.Close();
        }
        // will the menu show when clicking btn-context between different ele?
        // yes, because evt.stopPropagation()
    }, false);

    function uimenu(hostDom) {
        mizUIFrame.call(this);
        this.alwaysShrink = true;
        var ul = document.createElement("ul");
        ul.className = "menu";
        this.dom = ul;
        this.relEle = null;
        hostDom.appendChild(ul);

        /*
        ul.addEventListener("click", (function (obj) {
            return function (evt) {
                var li = evt.target.MizUpTo("menu-item");
                if (li) {
                    var func = li.MizObject;
                    func(obj.relEle, evt);
                }
            }
        })(this), false);
        */
        // can bind the event listener to hostDom, but hard to find relEle
    }

    uimenu.IsOn = function () {
        return uiStack.length>0;
    }

    uimenu.prototype = Object.create(mizUIFrame.prototype);
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
                fragEle.appendChild(li)
            }
        }
        this.dom.appendChild(fragEle);
    }

    uimenu.prototype.Open = function (evt, relEle) {
        uiStack.push(this);
        if (this.relEle!=relEle) {
            if (this.relEle) {
                this.relEle.classList.remove("hover");
            }
            this.relEle = relEle;
            if (relEle) relEle.classList.add("hover");
        }
        
        this.Show(evt.clientX, evt.clientY);
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
    })(document.getElementById("window-zone")),
    RemoteFilesList: (function (hostDom) {
        var remoteList = new mizUIWindow("ui-remotelist", hostDom);

        var listFiles = document.createElement("select");
        listFiles.size = 7; listFiles.multiple = true;
        listFiles.style.width = "100%";
        remoteList.SetContent(listFiles);

        var fragEle = document.createDocumentFragment(),
            chkEntity = document.createElement("input"),
            lblEntity = document.createElement("label");
        chkEntity.type = "checkbox";
        lblEntity.textContent = MizLang.GetDefaultLang("ui-getentity");
        lblEntity.appendChild(chkEntity);
        fragEle.appendChild(lblEntity);
        //fragEle.ChainAppend(chkEntity).ChainAppend(lblEntity);
        remoteList.SetPanel(fragEle);

        remoteList.SetGet(
            function (val) {
                var e,
                    fragEle = document.createDocumentFragment();
                while (e=listFiles.firstChild) listFiles.removeChild(e);
                for (var i in val) {
                    var o = document.createElement("option");
                    o.value = val[i]["guid"];
                    o.textContent = val[i]["name"];
                    fragEle.appendChild(o);
                }
                listFiles.appendChild(fragEle);
            },
            function () {
                var r = [],
                    opt = listFiles.firstChild;
                while (opt) {
                    if (opt.selected) {
                        r.push({"guid": opt.value, "name": opt.textContent});
                    }
                    opt = opt.nextSibling;
                }
                return r;
            }
        );

        return remoteList;
    })(document.getElementById("window-zone")),
    // there's no need to define menu object here.
    TableMenu: new mizUIMenu(document.getElementById("menu-zone")),
    HashMenu: new mizUIMenu(document.getElementById("menu-zone")),
    ItemMenu: new mizUIMenu(document.getElementById("menu-zone")),
    ItemTypeMenu: new mizUIMenu(document.getElementById("menu-zone")),
    PickerImageMenu: new mizUIMenu(document.getElementById("menu-zone")),
    PickerTagFilterMenu: new mizUIMenu(document.getElementById("menu-zone")),
    DelTableAlert: (function (hostDom) {
        var deltable = new mizUIWindow("ui-deltable", hostDom);

        var pMessage = document.createElement("p");
        pMessage.textContent = MizLang.GetDefaultLang("ui-cfm2deltable");
        pMessage.className = "alert-message";
        deltable.SetContent(pMessage);

        var chkEntity = document.createElement("input"),
            lblEntity = document.createElement("label");
        chkEntity.type = "checkbox";
        lblEntity.textContent = MizLang.GetDefaultLang("ui-delremote");
        lblEntity.appendChild(chkEntity);
        deltable.SetPanel(lblEntity);

        deltable.SetGet(
            function () {
                chkEntity.checked = false;
            },
            function () {
                return chkEntity.checked;
            }
        );

        return deltable;
    })(document.getElementById("window-zone")),
    Message: function (msgKey) {
        // use previous implementation temporarily
        MizUI.Message.Hint(msgKey);
    }
}