(function () {
    var langsPack = {
        "langs": ["en"],
        "pack": {
            "fs-delremotely": "Remote entity deleted.",
            "fs-del404": "Remote entity not found, delete entry.",
            "fs-delaswell": "Something wrong with server, delete the entry.",
            "fs-local": "Local",
            "fs-secret": "Secret",
            "fs-private": "Private",
            "fs-host": "Host",
            "fs-opsd": "Operation Password",
            "fs-epsd": "Encryption Password"
        }
    }
})();

var FileServer = (function () {
    function fileserver(val) {
        // val {guid?, name, config}
        this.name = val["name"];
        this.guid = val["guid"] ? val["guid"] : MizGuid();
        this.config = config;
    }

    fileserver.prototype.Delete = function (callback, remote) {
        
    }
    fileserver.prototype.Save = function (callback, mizTableObj) {
        
    }
    fileserver.prototype.Get = function (callback) {
        // callback(mizTableObj)
    }
    fileserver.prototype.Info = function () {
        
    }
    fileserver.prototype.Config = function () {
        
    }
    fileserver.prototype.QuickAppend = function () {
        // To append the item outside Table
        // Watch-out the encrypted cases
    }
    fileserver.prototype.IsLink = function () {
        return this.constructor.IsLink;
    }
    fileserver.prototype.TypeName = function () {
        return this.constructor.TypeName;
    }
    fileserver.prototype.Name = function () {
        return this.name;
    }
    fileserver.prototype.SetName = function (name) {
        this.name = name;
    }
    fileserver.IsLink = True; // Only the LocalServer is False
    fileserver.TypeName = null;
    fileserver.CreateNewTable = function (callback, val) {
        // val {name, config}
        // callback(fsObj)
    }
    fileserver.ListTables = function () {
        // LocalFileServer can also ListTables and delete entry only
        // Link/AddEntry and Import are different
        // But add extra options is not "quick action"
    }
    fileserver.ImportTable = function () {
        // one possible "import" is to import Tables
        // (from other fileservers or from local disk)
        // to the fileserver
    }
    fileserver.CreateTableEntry = function () {
        // Only to create an entry
        // The info/auth won't validate currently
    }

    return fileserver;
})();

var LocalFileServer = (function () {
    var dbConn,
        req = indexedDB.open("Hashare-Offline-FileServer");
    req.onsuccess = function (evt) {
        dbConn = evt.target.result;
    }
    req.onupgradeneeded = function (evt) {
        var db = evt.target.result,
            tableStore = db.createObjectStore("Tables", {"keyPath": "guid"}),
            // Tables {guid, content}
            resourceStore = db.createObjectStore("Resources", {"keyPath": "guid"});
            // Resources {guid, type, content}
        resourceStore.createIndex("idx_type", "type");
    }
    req.onblocked = function (evt) {
        console.log(evt);
    }

    function fileserver(val) {
        // val {guid?, name, config}
        FileServer.call(this, val);
    }
    fileserver.prototype = Object.create(FileServer.prototype);
    fileserver.prototype.constructor = fileserver;

    fileserver.prototype.Delete = function (callback) {
        var config = this.config,
            req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").delete(config["guid"]);
        req.onsuccess = callback;
    }
    fileserver.prototype.Get = function (callback) {
        var config = this.config,
            req = dbConn.transaction("Tables", "readonly").objectStore("Tables").get(config["guid"]),
            name = this.name;
        req.onsuccess = function (evt) {
            // convert result to text
            var text = evt.target.result["content"],
                mizTableObj = new MizTable(text, name);
            callback(mizTableObj);
        }
    }
    fileserver.prototype.Save = function (callback, mizTableObj) {
        var config = this.config,
            obj = {"guid": config["guid"], "content": mizTableObj.ToText()},
            req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").put(obj);
        req.onsuccess = callback;
    }

    fileserver.CreateNewTable = function (callback, val) {
        // val {name}
        var guid = MizGuid(),
            obj = {"guid": guid, "content": ""},
            req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").add(obj);
        req.onsuccess = function (evt) {
            var fsObj = new fileserver({"name": val["name"], "config": {"guid": guid}});
            callback(fsObj);
        }
    }
    fileserver.ImportTable = function (callback, val) {
        // val {name, config {file}}

    }

    fileserver.IsLink = false;
    fileserver.TypeName = "local";

    return fileserver;
})();

var PrivateFileServer = (function () {
    function fileserver(val) {
        // val {guid?, name, config}
        FileServer.call(this, val);
    }
    fileserver.prototype = Object.create(FileServer.prototype);
    fileserver.prototype.constructor = fileserver;

    fileserver.prototype._url = function () {
        var config = this.config;
        return config["host"]+"/hso/"+config["guid"]+"?ts="+Date.now();
    }
    fileserver.prototype.Delete = function (callback, remote) {
        if (remote) {
            var xhrfs = new XMLHttpRequest();
            xhrfs.open("delete", this._url());
            xhrfs.onreadystatechange = function () {
                if (this.readyState==4) {
                    if (this.status==200) {
                        hsoUI.Message("fs-delremotely");
                    } else if (this.status==404) {
                        hsoUI.Message("fs-del404");
                    } else {
                        hsoUI.Message("fs-delaswell");
                    }
                    callback();
                }
            }
            xhrfs.send();
        } else {
            callback();
        }
    }
    fileserver.prototype.Get = function (callback) {
        var xhrfs = new XMLHttpRequest(),
            name = this.name;
        xhrfs.open("get", this._url());
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    var mizTableObj = new MizTable(this.responseText, name);
                    callback(mizTableObj);
                }
            }
        }
        xhrfs.send();
    }
    fileserver.prototype.Save = function (callback, mizTableObj) {
        var xhrfs = new XMLHttpRequest();
        xhrfs.open("put", this._url());
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    callback();
                }
            }
        }
        xhrfs.send(mizTableObj.ToBlob());
    }

    fileserver.CreateNewTable = function (callback, val) {
        // val {name, config {host}}
        var xhrfs = new XMLHttpRequest(),
            config = val["config"],
            url = config["host"]+"/hso/?ts="+Date.now();
        xhrfs.open("post", url);
        xhrfs.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    config["guid"] = this.responseText;
                    var fsObj = new fileserver({"name": val["name"], "config": config});
                    callback(fsObj);
                }
            }
        }
        xhrfs.send("name="+encodeURIComponent(val["name"]));
    }
    fileserver.ListTables = function (callback, host) {
        var xhrfs = new XMLHttpRequest();
        host = host || "";
        xhrfs.open("get", host+"/hso/?ts="+Date.now());
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    callback(JSON.parse(this.responseText));
                    // [{"name", "guid"}]
                }
            }
        }
        xhrfs.send();
    }
    fileserver.ImportTable = function (callback, val) {
        // val {name, guid, config {host}}
        callback(new fileserver(val));
    }

    fileserver.TypeName = "private";

    return fileserver;
})();

var SecretFileServer = (function () {
    function fileserver(val) {
        FileServer.call(this, call);
    }
    fileserver.prototype = Object.create(FileServer.prototype);
    fileserver.prototype.constructor = fileserver;

    fileserver.prototype._url = function () {
        var config = this.config;
        return config["host"]+"/hso/"+config["guid"]+"?ts="+Date.now();
    }
    fileserver.prototype._validate = function () {
        var config = this.config;
        // var hopsd = sjcl.hash ()
    }
    fileserver.prototype.Get = function (callback) {
        var xhrfs = new XMLHttpRequest(),
            name = this.name,
            config = this.config;
        xhrfs.open("get", this._url());
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    // var text = sjcl (this.responseText, config["epsd"]);
                    var mizTableObj = new MizTable(text, name);
                    callback(mizTableObj);
                }
            }
        }
        // and "Date" in header
        // var hopsd = sjcl.hash (config["opsd"], Date.now());
        xhrfs.send("hopsd="+hopsd);
    }
    fileserver.prototype.Save = function (callback, mizTableObj) {
        var xhrfs = new XMLHttpRequest();
        xhrfs.open("put", this._url());
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    callback();
                }
            }
        }
        // this._validate
        // var encryptedContent = sjcl (mizTableObj.ToText(), config["epsd"]);
        xhrfs.send(encryptedContent);
    }
    fileserver.prototype.Delete = function (callback, remote) {
        
    }

    fileserver.CreateNewTable = function (callback, val) {
        // val {name?, config {host, opsd, !epsd}}
        var xhrfs = new XMLHttpRequest(),
            config = val["config"],
            url = config["host"]+"/hso/?ts="+Date.now();
        xhrfs.open("post", url);
        
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    config["guid"] = this.responseText;
                    var fsObj = new fileserver({"name": val["name"], "config": config});
                    callback(fsObj);
                }
            }
        }
        xhrfs.send("name=&opsd=");
    }
    fileserver.ImportTable = function (callback, val) {
        
    }

    fileserver.TypeName = "secret";

    return fileserver;
})();

// OnedriveFileServer
// PublicServer

LocalFileServer.AddTableWindow = (function (hostDom) {
    var win = new UIWindow("ui-addtable", hostDom),
        groupName = UIFrame.createElementWithLabel("input", "ui-name");
        
    var labelName = groupName[0], inputName = groupName[1];
    inputName.type = "text";
    win.SetContent(labelName);

    var fragEle = document.createDocumentFragment(),
        btnFile = document.createElement("input"),
        btnImport = document.createElement("button");
    btnImport.type = "button"; btnFile.type = "file";
    // btnFile.multiple = true;
    btnImport.textContent = MizLang.GetDefaultLang("ui-import");
    fragEle.ChainAppend(btnImport).ChainAppend(btnFile);
    win.SetPanel(fragEle);

    btnFile.style.display = "none";
    btnImport.addEventListener("click", function (evt) {
        btnFile.click();
    }, false);
    btnFile.addEventListener("change", function (evt) {
        var fs = evt.target.files;
        if (fs.length>0) {
            var freader = new FileReader();
            freader.onloadend = function (evt) {
                // envolope the evt.target.result (text) to GetValue
                // and set "import"
                win.Yes();
            }
            freader.readAsText(fs[0]);
        }
    }, false);

    win.SetGet(
        function (name) {
            inputName.value = name;
        },
        function () {
            // no no no, need val {}
            return inputName.value;
        }
    );

    return win;
})(windowZone);

PrivateFileServer.AddTableWindow = (function (hostDom) {
    var win = new UIWindow("ui-addtable", hostDom),
        groupName = UIFrame.createElementWithLabel("input", "ui-name"),
        groupHost = UIFrame.createElementWithLabel("input", "fs-host");
    var labelName = groupName[0], inputName = groupName[1],
        labelHost = groupHost[0], inputHost = groupHost[1];
    inputName.type = "text"; inputHost.type = "text";
    var fragEle = document.createDocumentFragment();
    fragEle.ChainAppend(labelName).ChainAppend(labelHost);
    win.SetContent(fragEle);

    var btnImport = document.createElement("button");
    win.SetPanel(btnImport);
    btnImport.addEventListener("click", function (evt) {
        PrivateFileServer.ListTables(function (vals) {
            // vals [{name, guid}]
            hsoUI.NameValueSelector.Open(evt, vals, function (r) {
                // r [{name, guid}]
                if (r.length>0) {
                    // envolop the result
                    win.Yes()
                }
            });
        }, inputHost.value);
    }, false);

    win.SetGet(
        function (val) {
            inputName.value = val["name"];
            inputHost.value = "";
        },
        function () {
            return {"name": inputName.value, "config": {"host": inputHost.value}}
        }
    );

    return win;
})(windowZone);

SecretFileServer.AddTableWindow = (function (hostDom) {
    var win = new UIWindow("ui-addtable", hostDom),
        groupName = UIFrame.createElementWithLabel("input", "ui-name"),
        groupHost = UIFrame.createElementWithLabel("input", "fs-host"),
        groupOpsd = UIFrame.createElementWithLabel("input", "fs-opsd"),
        groupEpsd = UIFrame.createElementWithLabel("input", "fs-epsd")
})(windowZone);

PublicFileServer.AddTableWindow = (function (hostDom) {
    var win = new UIWindow("ui-addtable", hostDom),
        groupName = UIFrame.createElementWithLabel("input", "ui-name"),
        groupHost = UIFrame.createElementWithLabel("input", "fs-host"),
        groupOpsd = UIFrame.createElementWithLabel("input", "fs-opsd");
    /**Explanation on PublicFileServer
     * the server is intended to share tables
     * user who create the table provides an operation password (opsd)
     * and will get an publik-guid (maybe public-guid as well)
     * others can download (by tablesServer) or add (manually) the table by public-guid
     * but only with publik-guid and opsd, the table can be saved/deleted
     */
})(windowZone);

FileServerManager.Register(LocalFileServer);
FileServerManager.Register(PrivateFileServer);
FileServerManager.Register(SecretFileServer);