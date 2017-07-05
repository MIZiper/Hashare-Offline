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
    function fsmizip() {
        
    }

    return fsmizip;
})();

var hsoFSOnedrive = (function () {
    function fsonedrive() {
        
    }

    return fsonedrive;
})();

var mizFileServerManager = (function () {
    // a register required, for tablesServer/fsServer/backupServer
    var map = {
        "local": hsoFSLocal,
        "mizip": hsoFSMIZip,
        "onedrive": hsoFSOnedrive
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