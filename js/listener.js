hsoUI.TableMenu.AppendItems([
    {"title": MizLang.GetDefaultLang(""), "func": function (srcEle, evt) {
        var tableEntryObj = srcEle.MizObject;
        tableEntryObj.Delete();
    }}
]);

(function () {
    var tableContext = function (evt) {
        var tableDom = evt.target.MizUpTo("table");
        if (tableDom) {
            evt.preventDefault();
            hsoUI.TableMenu.Open(evt, tableDom);
        }
    }
    var hashContext = function (evt) {
        var hashDom = evt.target.MizUpTo("hash");
        if (hashDom) {
            evt.preventDefault();
            hsoUI.HashMenu.Open(evt, hashDom);
        }
    }
    var itemContext = function (evt) {
        var itemDom = evt.target.MizUpTo("item");
        if (itemDom) {
            evt.preventDefault();
            hsoUI.ItemMenu.Open(evt, itemDom);
            // replace with ItemMenuManager like thing
        }
    }
    document.getElementById("table-zone").addEventListener("click", function (evt) {
        if (evt.target.classList.contains("btn-context")) {
            tableContext(evt);
            evt.stopPropagation();
            return;
        }
        var tableDom = evt.target.MizUpTo("table");
        if (tableDom && tableDom.MizObject) {
            var tableEntryObj = tableDom.MizObject;
            tableEntryObj.SwitchTo();
        }
    }, false);
    document.getElementById("table-zone").addEventListener("contextmenu", tableContext, false);
    document.getElementById("hash-zone").addEventListener("click", function (evt) {
        if (evt.target.classList.contains("btn-context")) {
            hashContext(evt);
            evt.stopPropagation();
            return;
        }
        var hashDom = evt.target.MizUpTo("hash");
        if (hashDom && hashDom.MizObject) {
            var hashEntryObj = hashDom.MizObject;
            hashEntryObj.SwitchTo();
        }
    }, false);
    document.getElementById("hash-zone").addEventListener("contextmenu", hashContext, false);
    document.getElementById("item-zone").addEventListener("click", function (evt) {
        if (evt.target.classList.contains("btn-context")) {
            itemContext(evt);
            evt.stopPropagation();
        }
    }, false);
    document.getElementById("item-zone").addEventListener("contextmenu", itemContext, false);
})();

document.getElementById("btn-addtable").addEventListener("click", UserAction.AddTable, false);
document.getElementById("btn-addhash").addEventListener("click", TableAction.AddHash, false);
document.getElementById("btn-backmain").addEventListener("click", TableAction.Back, false);
document.getElementById("btn-save").addEventListener("click", TableAction.Save, false);
document.getElementById("btn-itemtype").addEventListener("click", HashAction.SwitchToType, false);
document.getElementById("btn-additem").addEventListener("click", HashAction.AddItem, false);
document.body.onbeforeunload = TableAction.BeforeLeave;