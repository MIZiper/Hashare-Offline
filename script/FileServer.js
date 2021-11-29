(function () {
    var langsPack = {
        "langs": ["zh-cn", "en"],
        "pack": {
            "fs-delremotely": ["", "Remote entity deleted."],
            "fs-del404": ["", "Remote entity not found, delete entry."],
            "fs-delaswell": ["", "Some wrong with server, delete the entry."],
            "fs-openfailed": ["", "Get remote file failed, cannot access"]
        }
    }
    MizLang.AddLangsPack(langsPack);
})();

var hsoFileServer = (function () {
    function fileserver() {
        this.credential = "";
        this.name = "";
        this.type = "";
    }

    fileserver.prototype.Delete = function (entity) {
        // entity = entity || false
        // request locally/remotely
    }
    fileserver.prototype.Open = function () {
        // use the provided credential, and get the content of locally/remotely
        // parse it to Object(guid, hashes, tags) used
    }
    fileserver.prototype.Save = function (obj) {
        // save the object to fileserver
    }
    fileserver.prototype.Get = function () {
        // assemble and pass the text blob to callback
    }
    fileserver.prototype.GetValue = function () {
        // to disguise as TableStoreObject
        // and return the credential+name+type+psd?
    }
    fileserver.prototype.SetName = function (name) {
        // SetName only effect in localStorage, won't affect server (maybe yes?)
    }

    fileserver.AddTable = function (name) {
        // create new file and get the credential
        // return new fileserver(credential, name)
    }
    fileserver.ImportTable = function (fileblob) {
        // this is for local fileserver, to add the text file or
        // files downloaded from other servers.
    }
    fileserver.ListTable = function () {
        // get the tables list for private repo (onedrive, rpi, local?)
        // to be downloaded or linked
    }
    fileserver.LinkTable = function () {
        // add entry to TableList, with credential and password (for MIZip)
    }

    return fileserver;
})();

var hsoFSLocal = (function () {
    var dbConn;
    var req = indexedDB.open("HashareOffline", 2);
    req.onsuccess = function (evt) {
        dbConn = evt.target.result;
    }
    req.onupgradeneeded = function (evt) {
        //console.log(evt);
    }

    function fslocal(guid, name) {
        this.type = "local";
        this.guid = guid;
        this.name = name;
    }

    fslocal.prototype.Delete = function (callback) {
        var req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").delete(this.guid);
        req.onsuccess = callback;
    }
    fslocal.prototype.Open = function (callback) {
        var req = dbConn.transaction("Tables", "readonly").objectStore("Tables").get(this.guid);
        req.onsuccess = function (evt) {
            callback(evt.target.result);
        }
    }
    fslocal.prototype.Save = function (obj, callback) {
        obj["guid"] = this.guid;
        var req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").put(obj);
        req.onsuccess = callback;
    }
    fslocal.prototype.Get = function (callback) {
        var req = dbConn.transaction("Tables","readonly").objectStore("Tables").get(this.guid);
        var name = this.name;
        req.onsuccess = function (evt) {
            var blob = MizParser.Object2Blob(evt.target.result, name);
            callback(blob);
        }
    }
    fslocal.prototype.GetValue = function () {
        return this.guid+"|"+this.name.MizEncode()+"|"+this.type;
    }
    fslocal.prototype.SetName = function (name) {
        this.name = name;
    }

    fslocal.AddTable = function (name, callback) {
        var guid = MizGuid();
        var req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").add(
            {"guid": guid, "Hashes": []}
        );
        req.onsuccess = function (evt) {
            callback(new fslocal(guid, name));
        }
    }
    fslocal.AddTableViaObject = function (name, obj, callback) {
        var guid = MizGuid();
        var req = dbConn.transaction("Tables","readwrite").objectStore("Tables").add(
            {"guid": guid, "Hashes": obj["Hashes"], tags: obj["tags"]}
        );
        req.onsuccess = function (evt) {
            callback(new fslocal(guid, name));
        }
    }
    fslocal.AddTableViaText = function (name, text, callback) {
        var guid = MizGuid(),
            obj = MizParser.Text2Object(text);
        obj["guid"] = guid;
        var req = dbConn.transaction("Tables", "readwrite").objectStore("Tables").add(obj);
        req.onsuccess = function (evt) {
            callback(new fslocal(guid, name || obj["name"]));
        }
    }

    return fslocal;
})();

var hsoFSMIZip = (function () {
    function fsmizip(guid, name) {
        this.type = "mizip";
        this.guid = guid;
        this.name = name;
    }

    

    return fsmizip;
})();

var hsoFSOnedrive = (function () {
    function fsonedrive() {
        
    }

    return fsonedrive;
})();

var hsoFSPrivate = (function () {
    function fsprivate(guid, name) {
        this.type = "private";
        this.guid = guid;
        this.name = name;
    }

    fsprivate.prototype.url = function () {
        return "hso/"+this.guid+"#ts="+Date.now();
    }
    fsprivate.prototype.Delete = function (callback, remote) {
        if (remote) {
            var xhrfs = new XMLHttpRequest();
            xhrfs.open("delete", this.url());
            xhrfs.onreadystatechange = function () {
                if (this.readyState==4) {
                    if (this.status==200) {
                        hsoUI.Message("fs-delremotely");
                    } else if (this.status==404) {
                        hsoUI.Message("fs-del404");
                    } else {
                        hsoUI.Message("fs-delaswell")
                    }
                    callback();
                }
            }
            xhrfs.send();
        } else {
            callback();
        }
    }
    fsprivate.prototype.Open = function (callback) {
        var xhrfs = new XMLHttpRequest();
        xhrfs.open("get", this.url());
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    // hsoUI.Message("fs-loading");
                    callback(MizParser.Text2Object(this.responseText));
                    // hsoUI.Message("fs-loaded");
                } else {
                    hsoUI.Message("fs-openfailed")
                }
            }
        }
        xhrfs.send();
    }
    fsprivate.prototype.Save = function (obj, callback) {
        var xhrfs = new XMLHttpRequest();
        xhrfs.open("put", this.url());
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    callback();
                }
            }
        }
        xhrfs.send(MizParser.Object2Blob(obj, this.name));
    }
    fsprivate.prototype.Get = function (callback) {
        var xhrfs = new XMLHttpRequest();
        xhrfs.open("get", this.url());
        xhrfs.responseType = "blob";
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    callback(this.response);
                }
            }
        }
        xhrfs.send();
    }
    fsprivate.prototype.GetValue = function () {
        return this.guid+"|"+this.name.MizEncode()+"|"+this.type;
    }
    fsprivate.prototype.SetName = function (name) {
        this.name = name;
    }

    fsprivate.AddTable = function (name, callback) {
        var xhrfs = new XMLHttpRequest();
        xhrfs.open("post", "hso/#ts="+Date.now());
        xhrfs.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    callback(new fsprivate(this.responseText, name));
                }
            }
        }
        xhrfs.send("name="+name);
    }
    fsprivate.ListTable = function (callback) {
        var xhrfs = new XMLHttpRequest();
        xhrfs.open("get", "hso/#ts="+Date.now());
        xhrfs.onreadystatechange = function () {
            if (this.readyState==4) {
                if (this.status==200) {
                    callback(JSON.parse(this.responseText));
                }
            }
        }
        xhrfs.send();
    }
    fsprivate.LinkTable = function (guid, name, callback) {
        callback(new fsprivate(guid, name));
        // maybe modify guid (with psd) accordingly
    }

    return fsprivate;
})();

var mizFileServerManager = (function () {
    // a register required, for tablesServer/fsServer/backupServer
    var map = {
        "local": hsoFSLocal,
    //  "mizip": hsoFSMIZip,
    //  "onedrive": hsoFSOnedrive
        "private": hsoFSPrivate
    }
    
    function fileservermanager(fsStr) {
        var a = fsStr.split("|"),
            fs = map[a[2]] || map["local"];
        return new fs(a[0], a[1]);
    }

    fileservermanager.get = function (name) {
        return map[name] || map["local"];
    }

    return fileservermanager
})();

hsoUI.AddTable.RegisterServers([
    {"name": "Local", "value": "local"},
//  {"name": "MIZip.net", "value": "mizip"}
    {"name": "Private", "value": "private"}
]);