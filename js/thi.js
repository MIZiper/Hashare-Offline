var UserAction = (function () {
    // TableDom + CurrentUserClass
    var theZone = document.getElementById("table-zone"),
        theList = document.createElement("ul"), // ???
        theObj;
    var dbConn,
        req = indexedDB.open("Hashare-Offline");
    req.onsuccess = function (evt) {
        dbConn = evt.target.result;
    }
    req.onupgradeneeded = function (evt) {
        var db = evt.target.result,
            tableStore = db.createObjectStore("Tables", {"keyPath": "guid"}),
            // Tables {guid, name, type, config}
            typeStore = db.createObjectStore("ItemTypes", {"keyPath": "type"});
            // ItemTypes {type, css, js}
    }
    req.onblocked = function (evt) {
        console.log(evt);
    }

    function user() {
        user.ListEntries(function (vals) {
            var fragEle = document.createDocumentFragment();
            for (var i in vals) {
                var val = vals[i],
                    fsClass = FileServerManager.Get(val["type"]),
                    fsObj = new fsClass(val),
                    tableEntryObj = new TableEntryClass(fsObj);
                fragEle.appendChild(tableEntryObj.DOM());
            }
            theList.appendChild(fragEle);
        });
    }

    user.prototype.AddTable = function (val) {
        // val {type, import?, name, config {host, opsd, epsd..}}
        var fsClass = FileServerManager.Get(val["type"]);
        function _(fsObj) {
            if (fsObj) {
                var tableEntryObj = new TableEntryClass(fsObj),
                    guid = MizGuid();
                req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").add(
                    {"guid": guid, "name": fsObj.Name(), "type": fsObj.TypeName(), "config": fsObj.Config()}
                );
                req.onsuccess = function (evt) {
                    theList.appendChild(tableEntryObj.DOM());
                }
            }
        }
        if (val["import"]) {
            fsClass.ImportTable(_, val);
        } else {
            fsClass.CreateNewTable(_, val);
        }
    }

    user.Init = function () {
        theZone.appendChild(theList);
        theObj = new user();
        // seems no different between object and class
        // but it would be easier if there is user
    }
    user.ListEntries = function (callback) {
        // should I put ListEntries to class? or object?
        // key: necessary exposed to other function?
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
    user.AddTable = function (evt) {
        if (!theObj) {
            hsoUI.Message("sys-userobjmissing");
            return;
        }
        hsoUI.TableTypeMenu.Open(evt, function (typeName) {
            var fsClass = FileServerManager.Get(typeName);
            fsClass.AddTableWindow.Open(evt, "", function (val) {
                theObj.AddTable(val);
            }, null);
        });
    }
    user.DownloadTables = function (params) {
        
    }
    
    return user;
})();

var TableEntryClass = (function () {
    // TableTempClass

    function createEntry(name, isLink) {
        var li = document.createElement("li");
        li.className = isLink ? "table linked" : "table";
        var i = document.createElement("i");
        i.className = "font-btn btn-context";
        var span = document.createElement("span");
        span.textContent = name;
        li.ChainAppend(i).ChainAppend(span);
        return li;
    }

    function table(fsObj) {
        // check if fileserver is instance of FileServer
        this.fileServer = fsObj;
        this.dom = createEntry(fsObj.Name(), fsObj.IsLink());
        this.dom.MizBind(this);
    }

    table.prototype.SwitchTo = function (params) {
        var fsObj = this.fileServer;
        fsObj.Get(function (mizTableObj) {
            TableAction.Init(mizTableObj, fsObj);
            document.getElementById("table-name").textContent = fsObj.Name();
        });
    }
    table.prototype.Delete = function (params) {
        var fsObj = this.fileServer,
            dom = this.dom;
        hsoUI.DeleteTable.Open(evt, fsObj.IsLink(), function (remote) {
            fsObj.Delete(function () {
                // remove fsObj from db
                dom.parentElement.removeChild(dom);
            }, remote);
        }, null);
    }
    table.prototype.Download = function (params) {
        var fsObj = this.fileServer;
        fsObj.Get(function (mizTableObj) {
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(mizTableObj.ToBlob(), fsObj.Name()+".txt");
            } else {
                hsoUI.DownTable.Open({
                    "link": URL.createObjectURL(mizTableObj.ToBlob()),
                    "filename": fsObj.Name()+".txt",
                    "text": fsObj.Name()
                }, function (link) {
                    URL.revokeObjectURL(link);
                }, null);
            }
        });
    }
    table.prototype.Rename = function (params) {
        var fsObj = this.fileServer,
            span = this.dom.querySelector("span");
        hsoUI.EditTable.Open(evt, fsObj.Name(), function (name) {
            // how to change fsObj.Name and notify db?
            span.textContent = name;
        }, null);
    }
    table.prototype.DOM = function () {
        return this.dom;
    }

    return table;
})();

var TableAction = (function () {
    // HashDom + CurrentTableClass
    var theZone = document.getElementById("hash-zone"),
        theList = document.createElement("ul"),
        theObj,
        theParentObj;

    function table(mizTableObj) {
        this.mizTableObj = mizTableObj;
        this._init();
    }

    table.prototype._init = function () {
        var mizTableObj = this.mizTableObj;
        mizTableObj.ListHashes(function (mizHashObjs) {
            var fragEle = document.createDocumentFragment();
            for (var i in mizHashObjs) {
                var mizHashObj = mizHashObjs[i],
                    hashEntryObj = new HashEntryClass(mizHashObj);
                fragEle.appendChild(hashEntryObj.DOM());
            }
            theList.appendChild(fragEle);
        });
    }
    table.prototype.AddHash = function (name, typeName) {
        var mizTableObj = this.mizTableObj;
        mizTableObj.AddHash(function (mizHashObj) {
            var hashEntryObj = new HashEntryClass(mizHashObj);
            theList.appendChild(hashEntryObj.DOM());
        }, name, typeName);
    }

    table.Init = function (mizTableObj, fsObj) {
        theObj = new table(mizTableObj);
        theParentObj = fsObj;
        document.getElementById("main-blk").style.display = "none";
        document.getElementById("table-blk").style.display = "block";
        document.getElementById("item-zone").style.display = "none";
        // clean hash-zone
    }
    table.AddHash = function (evt) {
        if (!theObj) {
            hsoUI.Message("sys-tableobjmissing");
            return;
        }
        hsoUI.EditHash.Open(evt, "", function (hashName) {
            theObj.AddHash(hashName, ItemTypeManager.GetDefaultType());
        }, null);
    }
    table.MergeTable = function (params) {
        
    }
    table.Back = function (evt) {
        if (theObj && theObj.IsModified()) {
            if (theParentObj) {
                theParentObj.Save(function () {
                    hsoUI.Message("sys-tablesaved");
                    // clean the hash-zone and item-zone?
                    theParentObj = null;
                    theObj = null;
                    document.getElementById("table-blk").style.display = "none";
                    document.getElementById("main-blk").style.display = "block";
                });
            }
        }
    }
    table.Save = function (evt) {
        if (theObj && theObj.IsModified()) {
            if (theParentObj) {
                theParentObj.Save(function () {
                    hsoUI.Message("sys-tablesaved");
                    theObj.Saved();
                }, theObj);
            }
        }
    }
    table.BeforeLeave = function () {
        if (theObj && theObj.IsModified()) {
            return MizLang.GetDefaultLang("sys-unsavedetected");
        }
    }

    return table;
})();

var HashEntryClass = (function () {
    // HashTempClass
    
    function createEntry(name) {
        var li = document.createElement("li");
        li.className = "hash";
        var i = document.createElement("i");
        i.className = "font-btn btn-context";
        var span = document.createElement("span");
        li.ChainAppend(i).ChainAppend(span);
        return li;
    }

    function hash(mizHashObj) {
        this.mizHashObj = mizHashObj;
        this.dom = createEntry(mizHashObj.Name());
        this.dom.MizBind(this);
    }

    hash.prototype.Delete = function (params) {
        var dom = this.dom,
            mizHashObj = this.mizHashObj;
        mizHashObj.Delete();
        if (this.dom.classList.contains("active")) {
            document.getElementById("item-zone").style.display = "none";
        }
        dom.parentElement.removeChild(dom);
        // need to set theObj to null in HashAction
    }
    hash.prototype.SwitchTo = function (params) {
        document.getElementById("item-zone").style.display = "block";
        if (this.dom.classList.contains("active")) return;
        var mizHashObj = this.mizHashObj;
        HashAction.Init(mizHashObj);
        // inform TableAction to unactive last one, and save this one
        this.dom.classList.add("active");
    }
    hash.prototype.Rename = function (params) {
        var mizHashObj = this.mizHashObj,
            span = this.dom.querySelector("span");
        hsoUI.EditHash.Open(evt, mizHashObj.Name(), function (name) {
            mizHashObj.SetName(name);
            span.textContent = name;
        }, null);
    }
    hash.prototype.DOM = function () {
        return this.dom;
    }
    
    return hash;
})();

var HashAction = (function () {
    // ItemDom + CurrentHashClass
    var theZone = document.getElementById("item-zone"),
        theObj;

    function hash(mizHashObj) {
        // HashEntryClass and HashAction take same mizHashObj as input
        // makes me confused. why don't combine them?
        // but TableEntryClass and TableAction take different (fsObj and mizTableObj)
        // and no ItemAction or UserEntryClass
        this.mizHashObj = mizHashObj;
        this._init();
    }

    hash.prototype._init = function () {
        var mizHashObj = this.mizHashObj;
        mizHashObj.ListItems(function (mizItemObjs) {
            var fragEle = document.createDocumentFragment(),
                itemEntryClass = ItemTypeManager.Get(mizHashObj.TypeName(), "show");
            for (var i in mizItemObjs) {
                var mizItemObj = mizItemObjs[i],
                    itemEntryObj = new itemEntryClass(mizItemObj);
                fragEle.appendChild(itemEntryObj.DOM());
            }
            theZone.appendChild(fragEle);
        });
    }
    hash.prototype._tini = function () {
        var ele;
        while (ele = theZone.firstChild) {
            // if (ele.MizObject) {
            //     var itemEntryObj = ele.MizObject;
            //     itemEntryObj.Tini();
            // }
            theZone.removeChild(ele);
        }
    }
    hash.prototype.TypeName = function () {
        return this.mizHashObj.TypeName();
    }
    hash.prototype.SwitchToType = function (typeName) {
        var mizHashObj = this.mizHashObj;
        if (mizHashObj.TypeName() == typeName) return;
        mizHashObj.SetType(typeName);
        this._tini();
        theObj = new hash(mizHashObj);
    }
    hash.prototype.AddItem = function (itemString) {
        var mizHashObj = this.mizHashObj;
        mizHashObj.AddItem(function (mizItemObj) {
            itemEntryClass = ItemTypeManager.Get(mizHashObj.TypeName(), "show");
            itemEntryObj = new itemEntryClass(mizItemObj);
            theZone.appendChild(itemEntryObj.DOM());
        }, itemString);
    }

    hash.Init = function (mizHashObj) {
        theObj = new hash(mizHashObj);
    }
    hash.SwitchToType = function (evt) {
        if (!theObj) {
            hsoUI.Message("sys-nohashselected");
            return;
        }
        hsoUI.ItemTypeMenu.Open(evt, function (typeName) {
            theObj.SwitchToType(typeName);
        });
    }
    hash.AddItem = function (evt) {
        if (!theObj) {
            hsoUI.Message("sys-nohashselected");
            return;
        }
        var win = EditemManager.Get(theObj.TypeName());
        win.Open(evt, "", function (itemString) {
            theObj.AddItem(itemString);
        }, null);
    }

    return hash;
})();

//////////////////////////////////////////////////////////////
var ItemEntryClass = (function () {
    function item(mizItemObj) {
        
    }

    item.prototype.Edit = function (params) {
        var win = EditemManager.Get(typeName); // typeName?
        win.Open();
    }
    item.prototype.Delete = function (params) {
        // mark deleted
        this.dom.parentElement.removeChild(this.dom);
    }

    return item;
})();
//////////////////////////////////////////////////////////////

var MizTHI = (function () {
    function thi() {
        this.isDeleted = false;
        this.isModified = false;
    }

    thi.prototype.Delete = function (params) {
        
    }
    thi.prototype.IsDeleted = function () {
        
    }
    thi.prototype.IsModified = function () {
        
    }
    thi.prototype.Saved = function (params) {
        
    }

    return thi;
})();

var MizTag = (function () {
    function tag(params) {
        
    }

    return tag;
})();

var MizTable = (function () {
    var LINE = "\r\n",
        HEADER = "!MIZip/Hashare-Offline;0";

    function table(text, name) {
        this.name = name;
        this.hashes = [];
        this.tags = null;
        this._parseText(text);
    }

    table.prototype._parseText = function (text) {
        if (text=="") return;
        var arr = text.split(LINE);
        if (arr[0]==HEADER) {
            var itemStrings = [],
                hashName = null,
                hashType = null;
            for (var i in arr) {
                switch (arr[i][0]) {
                    case "#":
                        // replace the origin name?
                        break;
                    case "*":
                        if (hashName) this.hashes.push(new MizHash(itemStrings, hashName, hashType));
                        arr[i].substr(1).MizSplit(function (name, typeName) {
                            hashName = name;
                            hashType = typeName;
                            itemStrings = [];
                        }, 2);
                        break;
                    case "-":
                        itemStrings.push(arr[i].substr(1));
                        break;
                    case "~":
                        // construct a MizTag class
                        break;
                    default:
                        break;
                }
            }
            if (hashName) this.hashes.push(new MizHash(itemStrings, hashName, hashType));
            // make "Untitled" hash for fast append function
        }
    }
    table.prototype.GetText = function () {
        var arr = [];
        arr.push(HEADER);
        arr.push("#"+this.name.MizEncode()); // [this.name].MizTilps()
        this.ListHashes(function (mizHashObjs) {
            for (var i in mizHashObjs) {
                var mizHashObj = mizHashObjs[i];
                arr.push("*"+[mizHashObj.Name(),mizHashObj.TypeName()].MizTilps());
                mizHashObj.ListItems(function (mizItemObjs) {
                    for (var j in mizItemObjs) {
                        var mizItemObj = mizItemObjs[i];
                        arr.push("-"+mizItemObj.ItemString()); // should MizTable know MizItem?
                    }
                });
            }
        });
        // and the MizTag
        return arr.join(LINE);
    }
    table.prototype.ToBlob = function (params) {
        return new Blob(this.GetText(), {"type": "text/plain"});
    }
    table.prototype.ListHashes = function (callback) {
        // return the mizHashObjs not deleted
        // but this member function always called after init, hardly can there be deleted ones
        var hashes = this.hashes,
            mizHashObjs = [];
        for (var i in hashes) {
            var mizHashObj = hashes[i];
            if (!mizHashObj.IsDeleted()) mizHashObjs.push(mizHashObj);
        }
        callback(mizHashObjs);
    }
    table.prototype.AddHash = function (callback, name, typeName) {
        // create a new empty mizHashObj and pass to callback
        var mizHashObj = new MizHash([], name, typeName);
        this.hashes.push(mizHashObj);
        callback(mizHashObj);
    }
    table.prototype.AddHashObjs = function (mizHashObjs) {
        // append the existed mizHashObjs
        // applied when merge another table
        this.hashes.push(mizHashObjs);
        // or need to judge if mizHashObj is deleted?
    }
    table.prototype.IsModified = function () {
        var mizHashObjs = this.hashes;
        // MizTag
        for (var i in mizHashObjs) {
            var mizHashObj = mizHashObjs[i];
            if (mizHashObj.IsModified()) return true;
        }
    }
    table.prototype.Saved = function () {
        // reset elements to unmodified status
        var mizHashObjs = this.hashes;
        for (var i in mizHashObjs) {
            var mizHashObj = mizHashObjs[i];
            mizHashObj.Saved(); // even mizHashObj.IsDeleted() == true
        }
    }

    return table;
})();

var MizHash = (function () {
    function hash(itemStrings, name, typeName) {
        this.name = name;
        this.typeName = typeName;
        this.items = [];
        for (var i in itemStrings) {
            var itemString = itemStrings[i],
                mizItemObj = new MizItem(itemString);
            this.items.push(mizItemObj);
        }
        // record the original itemStrings length to define modified status
    }

    hash.prototype.TypeName = function () {
        return this.typeName;
    }
    hash.prototype.Name = function () {
        return this.name;
    }
    hash.prototype.ListItems = function (callback) {
        var items = this.items,
            mizItemObjs = [];
        for (var i in items) {
            var mizItemObj = items[i];
            // not every item is mizItemObj, perhaps null as place holder due to movement
            if (!mizItemObj.IsDeleted()) mizItemObjs.push(mizItemObj);
        }
        callback(mizItemObjs);
    }
    hash.prototype.AddItem = function (callback, itemString) {
        var mizItemObj = new MizItem(itemString);
        this.items.push(mizItemObj);
    }
    hash.prototype.AddItemObjs = function (mizItemObjs) {
        this.items.push(mizItemObjs);
    }
    hash.prototype.RemoveItem = function (mizItemObj) {
        mizItemObj.Delete();
    }
    hash.prototype.SetName = function (name) {
        this.name = name;
        // notify modified
    }
    hash.prototype.SetType = function (typeName) {
        this.typeName = typeName;
    }

    return hash;
})();

var MizItem = (function () {
    function item(itemString) {
        this.itemString = itemString;
    }

    item.prototype.ItemString = function () {
        return this.itemString;
    }
    item.prototype.SetString = function (itemString) {
        if (this.itemString!=itemString) {
            this.itemString = itemString;
            this.isModified = true;
        }
    }

    return item;
})();