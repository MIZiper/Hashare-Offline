var windowZone = document.getElementById("window-zone"),
    editemZone = document.getElementById("editem-zone"),
    menuZone = document.getElementById("menu-zone");

var hsoUI = {
    // Window
    EditTable: (function (hostDom) {
        var win = new UIWindow("ui-edittable", hostDom),
            groupName = UIFrame.createElementWithLabel("input", "ui-name");
        var labelName = groupName[0], inputName = groupName[1];
        inputName.type = "text";
        win.SetContent(labelName);

        win.SetGet(
            function (name) {
                inputName.value = name;
            },
            function () {
                return inputName.value;
            }
        );

        return win;
    })(windowZone),
    EditHash: (function (hostDom) {
        var win = new UIWindow("ui-edithash", hostDom),
            groupName = UIFrame.createElementWithLabel("input", "ui-name");
        var labelName = groupName[0], inputName = groupName[1];
        inputName.type = "text";
        win.SetContent(labelName);

        win.SetGet(
            function (name) {
                inputName.value = name;
            },
            function () {
                return inputName.value;
            }
        );

        return win;
    })(windowZone),
    NameValueSelector: (function (hostDom) {
        var win = new UIWindow("ui-selector", hostDom),
            list = document.createElement("select");
        list.size = 7; list.style.width = "100%";
        list.multiple = true;
        win.SetContent(list);
        
        list.SetGet(
            function (vals) {
                // vals [{name, guid}]
                var e,
                    fragEle = document.createDocumentFragment();
                while (e=list.firstChild) list.removeChild(e);
                for (var i in vals) {
                    var val = vals[i],
                        o = document.createElement("option");
                        o.value = val["guid"];
                        o.textContent = val["name"];
                        fragEle.appendChild(o);
                }
                list.appendChild(fragEle);
            },
            function () {
                var r = [],
                    o = list.firstChild;
                while (o) {
                    if (o.selected) {
                        r.push({"guid": o.value, "name": o.textContent});
                    }
                    o = o.nextSibling;
                }
                return r;
            }
        );
    })(windowZone),
    // Menu
    ItemTypeMenu: new UIOptionMenu(menuZone),
    TableTypeMenu: new UIOptionMenu(menuZone),
    TableMenu,
    HashMenu,
    ItemMenu,
    // Message
    TableInfo,
    DeleteTable,
}

(function (params) {
    var langsPack = {
        "langs": ["en"],
        "pack": {
            "sys-nohashselected": "Haven't selected any Hash.",
            "sys-tableobjmissing": "Table lost, shouldn't occur.",
            "sys-userobjmissing": "User lost, aha???",
            "sys-unsavedetected": "Table not saved? Sure to exit?",
            "sys-tablesaved": "Table saved.",

            "ui-addtable": "Add Table",
            "ui-edittable": "Edit Table Name",
            "ui-edithash": "Add/Edit Hash",
            "ui-import": "Import",
            "ui-selector": "Selector"
        }
    }
})();