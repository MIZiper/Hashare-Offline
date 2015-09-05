var ItemStringClass = (function(){
    function C(str) {
        this.IsModified = false;
        this.ItemString = str;
        this.ExcessString = null;
        /*Why protect the over-flow part*/
    }
    
    C.prototype.GetCtrlStrs = function(targetNum){
        var a = this.ItemString.split(";",targetNum);
        this.ExcessString = null;
        if (a.length<targetNum) {
            for (var i=targetNum-a.length;i>0;i--) {
                a.push("");
            }
        } else {
            var i = 0;
            while (targetNum--) {
                i=this.ItemString.indexOf(";",i);
                i++;
            }
            if (i) {
                this.ExcessString = this.ItemString.substr(i-1);
            }
        }
        return a;
    }
    C.prototype.MergeCtrlStrs = function(a){
        var s = a.join(";");
        if (this.ExcessString) s+=this.ExcessString;
        this.SetString(s);
    }
    C.prototype.SetString = function(str){
        if (this.ItemString!=str) {
            this.ItemString = str;
            this.IsModified = true;
            return true;
        }
        return false;
    }
    C.prototype.GetString = function(){
        return this.ItemString;
    }
    C.prototype.Delete = function(){
        this.ItemString = null;
        this.IsModified = true;
    }
    
    return C;
})();

var ItemType = {
    ItemInfos:[],
    ItemTypes:[],
    NotifyFuncs:[],
    RegisterType:function(itemType){
        this.ItemTypes[itemType.TYPENAME] = itemType;
        if (itemType.INTROKEY) {
            var typeAlone = itemType.TYPENAME.slice(0,-5);//remove "-show"
            var typeIntro = MizLang.GetDefaultLang(itemType.INTROKEY);
            var typeIntroArr = typeIntro.split(";");
            var info = {
                type:typeAlone,
                name:typeIntroArr[0].MizDecode(),
                intro:typeIntroArr[1].MizDecode()
            }
            this.ItemInfos[typeAlone] = info;
            /*
                use typeAlone here as an index instead of number index
                want to allow user to choose types often used
            */
            var funcs = this.NotifyFuncs;
            for (var i in funcs) {
                funcs[i](info);
            }
        }
    },
    AddTypeListener:function(func){
        this.NotifyFuncs.push(func);
    },
    GetTypeClass:function(typeName){
        if (!this.ItemTypes[typeName]) typeName="raweditor"+typeName.slice(-5);
        /*
            an coincidence "-edit".length=="-show".length==5
        */
        return this.ItemTypes[typeName];
    }
}

var HashStoreClass = (function(){
    function C(hashObj){
        this.name = hashObj.name;
        this.type = hashObj.type;
        this.ItemStrings = hashObj.ItemStrings;
        this.StartAction = hashObj.StartAction || null;
        this.EndAction = hashObj.EndAction || null;
        this.IsModified = false;
    }
    
    C.prototype.AppendItemString = function(itemStr){
        this.ItemStrings.push(itemStr);
        this.IsModified = true;
    }
    C.prototype.SetType = function(type){
        this.type = type;
        this.IsModified = true;
    }
    C.prototype.SetName = function(name){
        this.name = name;
        this.IsModified = true;
    }
    C.prototype.MergeFrom = function(hashToo){
        /*
            From CurrentHash, compare each ItemStringObject to ItemString,
            and update ItemStrings
            Implemented in CurrentHashClass.End()
        */
    }
    C.prototype.Delete = function(){
        this.IsModified = true;
        this.ItemStrings = null;
    }
    
    return C;
})();

var HashTempClass = (function(){
    function C(hashStoreObj){
        var li = document.createElement("li");
        li.className = "hash";
        li.MizBind(this);
        var i = document.createElement("i");
        i.className = "font-btn btn-context";
        var span = document.createElement("span");
        li.appendChild(i); li.appendChild(span);
        this.HashDomObject = li;
        this.HashStoreObject = hashStoreObj;
        this.SetPartialValue(hashStoreObj.name,true);
    }
    
    C.prototype.SetPartialValue = function(val,inner){
        this.HashDomObject.lastElementChild.textContent = val;
        if (!inner) this.HashStoreObject.SetName(val);
    }
    C.prototype.Tini = function(){
        this.HashDomObject.MizUnbind();
        this.HashDomObject = null;
        this.HashStoreObject = null;
    }
    
    return C;
})();

/*
    I'm JiuJie/tangled for several days whether it's necessary to create
    TableStoreClass and CurrentUserClass, 'cause logic/complexity become
    so simple for Table's data.
    Adding these two seems to make it much more united, so finally, they
    are here.
    
*/

var TableStoreClass = (function(){
    function C(tblStr){
        var a = tblStr.split("|");
        this.guid = a[0];
        this.name = a[1].MizDecode();
        this.TableString = tblStr;
    }
    
    C.prototype.SetName = function(name){
        this.name = name;
        this.TableString = this.guid+"|"+name.MizEncode();
    }
    C.prototype.GetValue = function(){
        return this.TableString;
    }
    
    return C;
})();

var TableTempClass = (function(){
    function C(tableStoreObj){
        var li = document.createElement("li");
        li.className = "table"
        li.MizBind(this);
        var i = document.createElement("i");
        i.className = "font-btn btn-context";
        var span = document.createElement("span");
        li.appendChild(i); li.appendChild(span);
        this.TableDomObject = li;
        this.TableStoreObject = tableStoreObj;
        this.SetPartialValue(tableStoreObj.name,true);
    }
    
    C.prototype.SetPartialValue = function(val,inner){
        this.TableDomObject.lastElementChild.textContent = val;
        if (!inner) this.TableStoreObject.SetName(val);
    }
    C.prototype.GetName = function(){
        return this.TableStoreObject.name;
    }
    C.prototype.Tini = function(){
        this.TableDomObject.MizUnbind();
        this.TableDomObject = null;
        this.TableStoreObject = null;
    }
    
    return C;
})();

var CurrentHashClass = (function(){
    function C(hashStoreObj){
        this.type = hashStoreObj.type;
        var itemStrObjs = [];
        if (hashStoreObj.StartAction) hashStoreObj.StartAction(hashStoreObj);
        var itemStrs = hashStoreObj.ItemStrings;
        for (var i in itemStrs) {
            itemStrObjs.push(new ItemStringClass(itemStrs[i]));
        }
        this.HashStoreObject = hashStoreObj;
        this.ItemStringObjects = itemStrObjs;
    }
    
    C.prototype.AddItem = function(itemStr){
        var itemStrObj = new ItemStringClass(itemStr);
        this.ItemStringObjects.push(itemStrObj);
        return itemStrObj;
        /*
            why leave itemStrObj.IsModified=false, newly created should be true
            'cause the length of ItemStringObjects increases
        */
    }
//    C.prototype.DeleteItem = function(){}
    C.prototype.InsertBefore = function(fromStrObj,toStrObj){
        var objs = this.ItemStringObjects;
        var fromIdx = objs.indexOf(fromStrObj),
            toIdx = objs.indexOf(toStrObj);
        var scapegoat = new ItemStringClass("");
        scapegoat.Delete();
        objs[fromIdx] = scapegoat;
        objs.splice(toIdx,0,fromStrObj);
    }
    C.prototype.End = function(test){
        var itemStrs = this.HashStoreObject.ItemStrings,
            itemStrObjs = this.ItemStringObjects;
        var flag = false;
        if (itemStrObjs.length!=itemStrs.length) {
            flag = true;
        } else {
            for (var i in itemStrObjs) {
                if (itemStrObjs[i].IsModified && itemStrObjs[i].ItemString!=itemStrs[i]) {
                    flag = true;
                    break;
                }
            }
        }
        if (flag && !test) {
            var newItemStrObjs = [],
                newItemStrs = this.HashStoreObject.ItemStrings;
            newItemStrs.splice(0);
            /* instead of set newItemStrs to new [], use splice can make the change back to Hashes, useful for settingData */
            for (var i in itemStrObjs) {
                if (!itemStrObjs[i].IsModified || itemStrObjs[i].ItemString!=null) {
                    itemStrObjs[i].IsModified = false;
                    newItemStrObjs.push(itemStrObjs[i]);
                    newItemStrs.push(itemStrObjs[i].ItemString);
                }
            }
            //this.HashStoreObject.ItemStrings = newItemStrs;
            this.HashStoreObject.IsModified = true;
            this.ItemStringObjects = newItemStrObjs;
            if (this.HashStoreObject.EndAction) this.HashStoreObject.EndAction(this.HashStoreObject);
        }
        return flag;
        /*
            In fact, I think directly assigning values without comparing
            itemStrs & itemStrObjs goes faster
        */
    }
    C.prototype.SetType = function(type){
        this.type = type;
        this.HashStoreObject.SetType(type);
    }
    C.prototype.Tini  = function(){
        this.HashStoreObject = null;
        this.ItemStringObjects = null;
    }
    
    return C;
})();

var CurrentTableClass = (function(){
    function C(tblStoreObj){
        this.TableStoreObject = tblStoreObj;
        this.HashStoreObjects = [];
    }
    
//    C.prototype.DeleteHash = function(){}
    C.prototype.AppendHashes = function(hashes) {
        for (var i in hashes){
            this.HashStoreObjects.push(new HashStoreClass(hashes[i]));
        }
    }
    C.prototype.FillHashStoreObjecs = function(callback){
        var tblStoreObj = this.TableStoreObject;
        var hashStoreObjs = this.HashStoreObjects;
        
        var req = dbConn.transaction("Tables","readonly").objectStore("Tables").get(tblStoreObj.guid);
        req.onsuccess = function(evt){
            var hashes = evt.target.result.Hashes;
            for (var i in hashes) {
                hashStoreObjs.push(new HashStoreClass(hashes[i]));
            }
            callback();
        }
        req.onerror = function(evt){console.log(evt);}
    }
    C.prototype.AddHash = function(val){
        var defType = localStorage.getItem("default-type"),
            obj = {name:val,type:(defType || ""),ItemStrings:[]},
            hashStoreObj = new HashStoreClass(obj);
        hashStoreObj.IsModified = true;
        /*
            HashStoreObjects.length increases too, and the granularity of db
            is TableLevel, but I won't know the original length of Hashes without
            querying in db. Of course I can record the number in FillHash.. though
        */
        this.HashStoreObjects.push(hashStoreObj);
        return hashStoreObj;
    }
    C.prototype.PasteHash = function(obj){
        var hashStoreObject = new HashStoreClass(obj);
        hashStoreObject.IsModified = true;
        this.HashStoreObjects.push(hashStoreObject);
        return hashStoreObject;
    }
    C.prototype.End = function(test){
        var hashStoreObjs = this.HashStoreObjects;
        var flag = false;
        for (var i in hashStoreObjs) {
            if (hashStoreObjs[i].IsModified) {
                flag = true;
                break;
            }
        }
        if (flag && !test) {
            var newHashStoreObjs = [];
            for (var i in hashStoreObjs) {
                if (!hashStoreObjs[i].IsModified || hashStoreObjs[i].ItemStrings!=null) {
                    hashStoreObjs[i].IsModified = false;
                    newHashStoreObjs.push(hashStoreObjs[i]);
                }
            }
            this.HashStoreObjects = newHashStoreObjs;
            var data = {guid:this.TableStoreObject.guid,Hashes:newHashStoreObjs};
            var req = dbConn.transaction("Tables","readwrite").objectStore("Tables").put(data);
            req.onsuccess = function(evt){}
            req.onerror = function(evt){console.log(evt);}
        }
        return flag;
    }
    C.prototype.Tini = function(){
        this.HashStoreObjects = null;
        this.TableStoreObject = null;
        /*
            No circular reference and no Tini for *StoreObject
            so it's unnecessary
        */
    }
    
    return C;
})();

var CurrentUserClass = (function(){
    function C(){
        var tblStoreObjs = [];
        var tblStrs = [];
        var l = localStorage.getItem("tables");
        if (l && l!="") {
            tblStrs = l.split(";");
        }
        for (var i=0, l=tblStrs.length; i<l; i++) {
            tblStoreObjs.push(new TableStoreClass(tblStrs[i]));
        }
        this.TableStoreObjects = tblStoreObjs;
    }
    
    C.prototype.AddTable = function(val){
        var guid = MizGuid();
        
        var req = dbConn.transaction("Tables","readwrite").objectStore("Tables").add({guid:guid,Hashes:[]});
        req.onsuccess = function(evt){}
        req.onerror = function(evt){console.log(evt);}
        
        var tblStr = guid+"|"+val.MizEncode();
        var tblStoreObj = new TableStoreClass(tblStr);
        this.TableStoreObjects.push(tblStoreObj);
        this.flush();
        return tblStoreObj;
    }
    C.prototype.AddViaObject = function(obj) {
        var guid = MizGuid();
        
        var req = dbConn.transaction("Tables","readwrite").objectStore("Tables").add({guid:guid,Hashes:obj.Hashes});
        req.onsuccess = function(evt){}
        req.onerror = function(evt){console.log(evt);}
        
        var tblStr = guid+"|"+obj.name.MizEncode();
        var tblStoreObj = new TableStoreClass(tblStr);
        this.TableStoreObjects.push(tblStoreObj);
        this.flush();
        return tblStoreObj;
    }
    C.prototype.DeleteTable = function(tblStoreObj){
        var req = dbConn.transaction("Tables","readwrite").objectStore("Tables").delete(tblStoreObj.guid);
        req.onsuccess = function(evt){}
        req.onerror = function(evt){console.log(evt);}
        
        var objs = this.TableStoreObjects;
        for (var i in objs) {
            if (objs[i]==tblStoreObj) {
                objs[i] = null;
                break;
            }
        }
        this.flush();
    }
    C.prototype.EditTable = function(tblStoreObj,val){
        /*
            tblStoreObj has been modified using tblTempObj.SetPartialValue
            just flush and change the localStorage
        */
        this.flush();
    }
    C.prototype.GenTableBlob = function(tblStoreObj,callback){
        var req = dbConn.transaction("Tables","readonly").objectStore("Tables").get(tblStoreObj.guid);
        req.onsuccess = function(evt){
            var hashes = evt.target.result.Hashes;
            var blob = MizParser.Object2Blob(hashes,tblStoreObj);
            callback(blob);
        }
        req.onerror = function(evt){console.log(evt);}
    }
    C.prototype.flush = function(){
        var objs = this.TableStoreObjects;
        var a = [];
        for (var i in objs) {
            if (objs[i]) a.push(objs[i].GetValue());
        }
        localStorage.setItem("tables",a.join(";"));
    }
    
    return C;
})();

var dbConn,
    dbCallbacks = [];
(function(){
    var req = indexedDB.open("HashareOffline",2);
    req.onsuccess = function(evt){
        dbConn = evt.target.result;
        for (var i in dbCallbacks) dbCallbacks[i]();
    }
    req.onupgradeneeded = function(evt){
        var db = evt.target.result;
        if (!evt.oldVersion) {
            var tblStore = db.createObjectStore("Tables",{keyPath:"guid"});
            var resStore = db.createObjectStore("Resources",{keyPath:"fname"});
            resStore.createIndex("idx_type","type");
        }
        var itemStore = db.createObjectStore("ItemTypes",{keyPath:"type"});
    }
    req.onblocked = function(evt){
        console.log(evt);
    }
})();

var MizParser = {
    HEADER:"!MIZip/Hashare-Offline;0",
    LINE:"\r\n",
    Object2Blob:function(hashes,tblStoreObj){
        var arr = [];
        arr.push(MizParser.HEADER+MizParser.LINE);
        arr.push("#"+tblStoreObj.GetValue()+MizParser.LINE);
        for (var i in hashes) {
            arr.push("*"+hashes[i].name.MizEncode()+";"+hashes[i].type+MizParser.LINE);
            var itmStrs = hashes[i].ItemStrings;
            for (var j in itmStrs) {
                arr.push("-");
                arr.push(itmStrs[j]);
                arr.push(MizParser.LINE);
            }
        }
        return new Blob(arr,{type:"text/plain"});
    },
    Text2Object:function(text){
        var obj = null,
            arr = text.split(MizParser.LINE);
        if (arr[0]==MizParser.HEADER) {
            /*Seems BOM(3 bytes for UTF8) created by notepad doesn't affect*/
            obj = {name:"",Hashes:[]};
            var currentHash;
            for (var i=1, l=arr.length; i<l; i++) {
                switch (arr[i][0]) {
                        case "#": {
                            obj.name=arr[i].substr(1).split("|")[1].MizDecode();
                            break;
                        }
                        case "*": {
                            if (currentHash) obj.Hashes.push(currentHash);
                            var a = arr[i].substr(1).split(";");
                            currentHash = {type:a[1],name:a[0],ItemStrings:[]};
                            break;
                        }
                        case "-": {
                            if (currentHash) currentHash.ItemStrings.push(arr[i].substr(1));
                            break;
                        }
                }
            }
            if (currentHash) obj.Hashes.push(currentHash);
        }
        return obj;
    }
}