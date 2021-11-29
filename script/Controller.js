var UserController = (function () {
    var dbConn,
        req = indexedDB.open("Hashare-Offline");
    req.onsuccess = function(evt) {
        dbConn = evt.target.result;
    }
    req.onupgradeneeded = function (evt) {
        var db = evt.target.result,
            tblStore = db.createObjectStore("Tables", {"keyPath": "hso-guid"}),
            itmStore = db.createObjectStore("ItemTypes", {"keyPath": "typeName"});
    }

    var user = {}

    user.AddEntry = function (callback, val) {
        var hsoGuid = MizGuid();
        val["hso-guid"] = hsoGuid;
        var req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").add(val);
        req.onsuccess = function (evt) {
            callback(hsoGuid);
        }
    }
    user.DelEntry = function (callback, hsoGuid) {
        var req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").delete(hsoGuid);
        req.onsuccess = callback;
    }
    user.ModEntry = function (callback, hsoGuid, val) {
        val["hso-guid"] = hsoGuid;
        var req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").put(val);
        req.onsuccess = callback;
    }
    user.GetEntry = function (callback, hsoGuid) {
        var req = dbConn.transaction("Tables", "readonly").objectStore("Tables").get(hsoGuid);
        req.onsuccess = function (evt) {
            callback(evt.target.result);
        }
    }
    user.ListEntries = function (callback) {
        var os = dbConn.transaction("Tables", "readonly").objectStore("Tables"),
            vals = [];
        os.openCursor().onsuccess = function (evt) {
            var cursor = evt.target.result;
            if (cursor) {
                vals.push(cursor.value);
                cursor.continue();
            } else {
                callback(vals);
            }
        }
    }

    user.PutItemType = function (callback, typeName, jsblob, cssblob) {
        var req = dbConn.transaction("ItemTypes", "readwrite").objectStore("ItemTypes").put(
            {"typeName": typeName, "js": jsblob, "css": cssblob}
        );
        req.onsuccess = callback;
    }
    user.GetItemType = function (callback, typeName) {
        var req = dbConn.transaction("ItemTypes", "readonly").objectStore("ItemTypes").get(typeName);
        req.onsuccess = function (evt) {
            var result = evt.target.result;
            callback(result["js"], result["css"]);
        }
    }
    user.DelItemType = function (callback, typeName) {
        var req = dbConn.transaction("ItemTypes", "readwrite").objectStore("ItemTypes").delete(typeName);
        req.onsuccess = callback;
    }
    user.ListItemTypes = function (callback) {
        var os = dbConn.transaction("ItemTypes", "readonly").objectStore("ItemTypes"),
            vals = [];
        os.openCursor().onsuccess = function (evt) {
            var cursor = evt.target.result;
            if (cursor) {
                vals.push(cursor.value);
                cursor.continue();
            } else {
                callback(vals);
            }
        }
    }

    return user;
})();

var HashAction = (function () {
    var theZone = document.getElementById("item-zone"),
        theObj;

    function hash(params) {
        this.typeName = '';
    }

    hash.Init = function (hashStoreObj) {
        if (hashStoreObj) {
            
        } else {
            // clear
        }
    }

    hash.prototype.AddItem = function (params) {
        
    }
    hash.prototype.DeleteItem = function (params) {
        
    }
    hash.prototype.InsertBefore = function (fromItemObj, toItemObj) {
        
    }

    function clear() {
        if (theObj) theObj.Tini();
        theObj = null;
        var itemDomObjs = theZone.querySelectorAll(".item");
        itemDomObjs.forEach(function (itemDomObj, index) {
            var itemTypeObj = itemDomObj.MizObject;
            itemTypeObj.Tini();
        });
        var ele;
        while (ele=theZone.firstChild) theZone.removeChild(ele);
    }

    hash.AddItem = function (evt) {
        if (!theObj) {
            hsoUI.Message("sys-nohashselected");
            return;
        }
        var win = hsoEditemManager(theObj.typeName);
        win.Open(evt, "", function (val) {
            var t = ItemType.GetTypeClass(typeName+'-show'),
                // typeName can be passed in val, is bound to win
                itemStringObj = new ItemStringClass(val);
                itemTypeObj = new t(itemStringObj);
            theZone.appendChild(itemTypeObj.ItemDomObject);
        }, null);
    }
    hash.DeleteItem = function (srcEle, evt) {
        var itemTypeObj = srcEle.MizObject;
        itemTypeObj.Tini(); // itemTypeObj.ItemStringObject.Delete();
        theZone.removeChild(srcEle);
    }
    hash.SwitchToType = function (typeName) {
        if (theObj && theObj.typeName!=typeName) {
            var itemDomObjs = theZone.querySelectorAll(".item");
            itemDomObjs.forEach(function (itemDomObj, index) {
                var itemTypeObj = itemDomObj.MizObject;
                itemTypeObj.Tini();
            });
            var ele;
            while (ele=theZone.firstChild) theZone.removeChild(ele);
            // theObj.SetType(typeName);
            // hash.Init(null);
        }
    }
    hash.EditItem = function (srcEle, evt) {
        if (!theObj) return;
        var itemTypeObj = srcEle.MizObject;
        var win = hsoEditemManager(theObj.typeName);
        win.Open(evt, itemTypeObj.GetValue(), function (val) {
            itemTypeObj.SetValue(val);
        }, null);
    }

    return hash;
})();

var TableAction = (function () {
    var theZone = document.getElementById("hash-zone"),
        theList = document.createElement("ul"),
        lastHashEle = null,
        theObj;

    function table(hsoObj) {
        
    }

    table.Init = function (hsoObj) {
        var fragEle = document.createDocumentFragment();
        theObj = new table(hsoObj);
        theObj.HashStoreObjects.forEach(function (hashStoreObj, index) {
            var hashTempObj = new HashTempClass(hashStoreObj);
            fragEle.appendChild(hashTempObj.HashDomObject);
        });
        theList.appendChild(fragEle);
    }

    table.prototype.AddHash = function (params) {
        
    }
    table.prototype.MergeTable = function (callback, hsoObj) {
        
    }

    function clear() {
        if (theObj) theObj.Tini();
        theObj = null;
        var hashDomObjs = theList.querySelectorAll(".hash");
        hashDomObjs.forEach(function (hashDomObj, index) {
            var hashTempObj = hashDomObj.MizObject;
            hashTempObj.Tini();
        });
        var ele;
        while (ele=theList.firstChild) theList.remove(ele);
    }

    table.SwitchToHash = function (srcEle, evt) {
        if (srcEle==lastHashEle) return;
        var hashTempObj = srcEle.MizObject;
        HashAction.Init(hashTempObj.HashStoreObject);
        if (lastHashEle) lastHashEle.classList.remove("active");
        srcEle.classList.add("active");
        lastHashEle = srcEle;
    }
    table.DeleteHash = function (srcEle, evt) {
        if (srcEle==lastHashEle) {
            HashAction.Init(); // clear
            lastHashEle = null;
        }
        var hashTempObj = srcEle.MizObject;
        theObj.DeleteHash(hashTempObj.HashStoreObject);
        hashTempObj.Tini();
        theList.removeChild(srcEle);
    }
    table.AddHash = function (val) {
        theObj.AddHash(function (hashStoreObj) {
            var hashTempObj = new HashTempClass(hashStoreObj);
            theList.appendChild(hashTempObj.HashDomObject);
        }, val);
    }

    return table;
})();

var UserAction = (function () {
    var theZone = document.getElementById("table-zone"),
        theList = document.createElement("ul"),
        //-- fileServerObjects = [],
        user = {};

    user.Init = function (callback) {
        //TODO: clear elements in table-zone
        var fragEle = document.createDocumentFragment();
        UserController.ListEntries(function (vals) {
            // vals [{hso-guid, type, ..}]
            vals.forEach(function(val, index) {
                var fsObj = hsoFileServerManager(val["type"], val);
                //-- fileServerObjects.push(fsObj);
                var tableTempObj = new TableTempClass(fsObj);
                fragEle.appendChild(tableTempObj.TableDomObject);
            });
            theList.appendChild(fragEle);
            theZone.appendChild(theList);
        });
    }
    user.Init(); //REVIEW: any callback? and should be called right here?
    user.SwitchToTable = function (srcEle, evt) {
        var tableTempObj = srcEle.MizObject,
            fsObj = tableTempObj.FileServerObject;
        fsObj.Open(function (hsoObj) {
            TableAction.Init(hsoObj);
        });
    }
    user.DeleteTable = function (srcEle, evt) {
        var tableTempObj = srcEle.MizObject,
            fsObj = tableTempObj.FileServerObject;
        hsoUI.DelTableAlert.Open(evt, fsObj.type, function (remotely) {
            fsObj.Delete(function () {
                UserController.DelEntry(function () {
                    tableTempObj.Tini();
                    theList.removeChild(srcEle);
                }, fsObj.hsoGuid);
            }, remotely);
        }, null);
    }
    user.AddTable = function (val) {
        // val {type, host, name, opsd?, epsd?, ..}
        var fsClass = hsoFileServerManager(val["type"]);
        UserController.AddEntry(function (hsoGuid) { //REVIEW: to obtain hsoGuid, put AddEntry first, but fsClass.AddTable may fail
            val["hso-guid"] = hsoGuid;
            fsClass.AddTable(function (fsObj) {
                var tableTempObj = new TableTempClass(fsObj);
                theList.appendChild(tableTempObj.TableDomObject);
            }, val);
        }, val);
    }
    user.LinkTable = function (val) {
        // or import if val["type"]=="local"
    }
    user.DownloadTable = function (srcEle, evt) {
        var tableTempObj = srcEle.MizObject,
            fsObj = tableTempObj.FileServerObject;
        fsObj.Get(function (hsoBlob) {
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(hsoBlob, fsObj.name+".txt");
            } else {
                hsoUI.DownTable.Open(); //TODO: implement
            }
        });
    }
    user.DownloadTables = function () {
        
    }

    return user;
})();