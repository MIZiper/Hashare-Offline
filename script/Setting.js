Picker.Sync = (function(){
    /*Create sync-picker dom*/
    MizLang.AddLangs(["zh-cn","en"],"pre-syncpicker",["\u540C\u6B65\u9009\u62E9","Sync Picker"]);
    var div = document.createElement("div");
    div.className = "picker"; div.id = "sync-picker";
    var p = document.createElement("p");
    p.className = "title"; p.textContent = MizLang.GetDefaultLang("pre-syncpicker");
    var cnt = document.createElement("div");
    cnt.className = "content";
    var slt = document.createElement("select");
    slt.size = 5; slt.multiple = true;
    var pnl = document.createElement("div");
    pnl.className = "panel";
    var btn = document.createElement("button");
    btn.type = "button"; btn.textContent = MizLang.GetDefaultLang("pre-useless");
    slt.id = "sync-picker-list";
    slt.style.minWidth = "20em";
    cnt.appendChild(slt);
    pnl.appendChild(btn);
    div.appendChild(p); div.appendChild(cnt); div.appendChild(pnl);
    MizUI.Picker._pickerDom.insertBefore(div,MizUI.Picker._pickerDom.firstChild);
    /*Bind and handle event*/
    /*GetValue/SetValue*/
    var C = {
        GetValue:function(){
            var r = [],
                opt = slt.firstChild;
            while (opt) {
                if (opt.selected) {
                    r.push(opt.value);
                }
                opt = opt.nextSibling;
            }
            return r;
        },
        SetValue:function(val){
            var e;
            while (e=slt.firstChild) slt.removeChild(e);
            var frag = document.createDocumentFragment();
            for (var i in val) {
                var o = document.createElement("option");
                o.value = val[i].credential;
                o.textContent = val[i].name;
                frag.appendChild(o);
            }
            slt.appendChild(frag);
        }
    }
    return C;
})();

SomeManager.Add(new SomeManager("sync-picker",Picker.Sync.SetValue,Picker.Sync.GetValue));
MizUI.Picker.Sync = function(evt,val,yesCallback,noCallback){
    MizUI.Picker._show("sync-picker",evt,val,yesCallback,noCallback);
}

var SyncDelegate = {
    _handlers:[],
    _counterMaker:function(total){
        var success = 0, fail = 0;
        return function(bool){
            if (bool) success++; else fail++;
            MizUI.Message.Progress(total,success,fail);
        }
    },
    AddHandler:function(credential,handler){
        SyncDelegate._handlers[credential] = handler;
    },
    GetHandler:function(credential){
        return SyncDelegate._handlers[credential];
    },
    Login:function(credential){
        var h = SyncDelegate.GetHandler(credential);
        if (h) {
            h.ToAuth();
        }
    },
    Upload:function(credential,evt){
        var h = SyncDelegate.GetHandler(credential);
        if (h && h.GetToken()) {
            var setVal = [],
                tblStoreObj = CurrentUserObject.TableStoreObjects;
            for (var i in tblStoreObj) {
                if (tblStoreObj[i])
                    setVal.push({credential:tblStoreObj[i].GetValue(),name:tblStoreObj[i].name});
            }
            MizUI.Picker.Sync(evt,setVal,function(getVal){
                /*[credential]*/
                var counter = SyncDelegate._counterMaker(getVal.length);
                for (var j in getVal) {
                    (function(tblStr){
                        var tblStoreObj = new TableStoreClass(tblStr);
                        CurrentUserObject.GenTableBlob(tblStoreObj,function(blob){
                            h.Upload(blob,tblStoreObj.name,counter);
                        });
                    })(getVal[j]);
                }
            },null);
        } else {
            MizUI.Message.Hint("set-backup-unauth");
        }
    },
    Download:function(credential,evt){
        var h = SyncDelegate.GetHandler(credential);
        if (h && h.GetToken()) {
            h.GetList(function(setVal){
                if (!setVal) {
                    MizUI.Message.Hint("set-backup-fetchlistfail");
                    return;
                }
                MizUI.Picker.Sync(evt,setVal,function(getVal){
                    var counter = SyncDelegate._counterMaker(getVal.length);
                    for (var j in getVal) {
                        h.Download(getVal[j],function(success,text){
                            if (success) TableDom.AddViaText(text);
                            counter(success);
                        });
                    }
                },null);
            });
        } else {
            MizUI.Message.Hint("set-backup-unauth");
        }
    }
}
SyncDelegate.AddHandler("onedrive",{
    _token:"",
    GetToken:function(){
        if (!this._token) {
            var result = null;
            if (location.hash) {
                var regex = new RegExp("[\\?#&]access_token=([^&#]*)");
                result = regex.exec(location.hash);
                /*http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript*/
            }
            if (result) {
                this._token = result[1];
                sessionStorage.setItem("sync-onedrive-token",result[1]);
            } else {
                this._token = sessionStorage.getItem("sync-onedrive-token");
                /*could be null*/
            }
        }
        return this._token;
    },
    ToAuth:function(){
        var response_type = "token",
            client_id = "0000000040157B10",
            redirect_uri = encodeURIComponent(location.protocol+"//"+location.host+location.pathname),
            auth_url = " https://login.live.com/oauth20_authorize.srf",
            scope = "onedrive.appfolder";
        var url = auth_url+"?scope="+scope+"&client_id="+client_id+"&response_type="+response_type+"&redirect_uri="+redirect_uri;
        location.href = url;
    },
    Upload:function(blob,name,callback){
        var origin = "https://api.onedrive.com/v1.0",
            url = "/drive/special/approot:/"+(encodeURIComponent(name)+".txt")+":/content",
            xhr = new XMLHttpRequest();
        xhr.open("put",origin+url);
        xhr.onreadystatechange = function(){
            if (this.readyState==4) {
                if (this.status>=200 && this.status<300)
                    callback(true);
                else
                    callback(false);
            }
        };
        xhr.setRequestHeader("Authorization","bearer "+this.GetToken());
        xhr.setRequestHeader("Content-type","text/plain");
        xhr.send(blob);
    },
    GetList:function(callback){
        var origin = "https://api.onedrive.com/v1.0",
            url = "/drive/special/approot/children?select=id,name,@content.downloadUrl",
            xhr = new XMLHttpRequest();
        xhr.open("get",origin+url);
        xhr.onreadystatechange = function(){
            if (this.readyState==4) {
                if (this.status>=200 && this.status<300) {
                    var files = JSON.parse(this.responseText).value,
                        setVal = [];
                    for (var i in files) {
                        setVal.push({credential:files[i]["@content.downloadUrl"],name:files[i].name});
                    }
                    callback(setVal);
                }
                else
                    callback(null);
            }
        }
        xhr.setRequestHeader("Authorization","bearer "+this.GetToken());
        xhr.send();
    },
    Download:function(url,callback){
        var xhr = new XMLHttpRequest();
        xhr.open("get",url);
        xhr.onreadystatechange = function(){
            if (this.readyState==4) {
                if (this.status>=200 && this.status<300)
                    callback(true,this.responseText);
                else
                    callback(false,"");
            }
        }
        xhr.send();
    }
});



var ItemShow_Sys_RelArt = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlShow_Link,CtrlShow_Inputbox,["item-sys-relart-title","item-sys-relart-desc"]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "item-sys-relart-title":["\u6807\u9898","Title"],
            "item-sys-relart-desc":["\u63CF\u8FF0","Description"]
        }
    }
    MizLang.AddLangsPack(langsPack);
    C.TYPENAME = "sys-relart-show";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();

var CtrlShow_Sys_Commands = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        this.Commands = [];
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "sys-commands-show";
    P.SetCommands = function(cmds){
        if(!this.Commands.length){
            for (var i in cmds) {
                var btn = document.createElement("button");
                btn.className = "btn-cmd"
                btn.textContent = MizLang.GetDefaultLang(cmds[i].key);
                btn.MizBind(cmds[i].func);
                this.Commands.push(btn);
                this.ControlDomObject.appendChild(btn);
            }
            this.SetValue(this.ControlString,true);
        }
    }
    P.Tini = function(){
        var cmds = this.Commands;
        for (var i in cmds){
            cmds[i].MizUnbind();
        }
        this.Commands = null;
        ControlTypeBase.prototype.Tini.call(this);
    }
    P.SetValue = function(ctrlStr,inner){
        if (!inner) this.ControlString = ctrlStr;
        var a = ctrlStr.split("|"),
            n = parseInt(a[1]) || 0;
        var cmds = this.Commands;
        for (var i in cmds) {
            cmds[i].disabled = !((1<<i)&n)
        }
    }
    P.GetCredential = function(){
        return this.ControlString.split("|")[0];
    }
    
    return C;
})();

var ItemShow_Sys_Backup = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlShow_Link,CtrlShow_Text,CtrlShow_Sys_Commands,["item-sys-backup-serv","item-sys-backup-desc","item-sys-backup-cmds"]);
        this.Controls[2].SetCommands([
            {key:"item-sys-backup-login",func:SyncDelegate.Login},
            {key:"item-sys-backup-up",func:SyncDelegate.Upload},
            {key:"item-sys-backup-down",func:SyncDelegate.Download}
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "item-sys-backup-serv":["\u670D\u52A1","Service"],
            "item-sys-backup-desc":["\u63CF\u8FF0","Description"],
            "item-sys-backup-cmds":["\u547D\u4EE4","Commands"],
            "item-sys-backup-login":["\u767B\u5165","Login"],
            "item-sys-backup-up":["\u4E0A\u4F20","Upload"],
            "item-sys-backup-down":["\u4E0B\u8F7D","Download"]
        }
    }
    MizLang.AddLangsPack(langsPack);
    C.TYPENAME = "sys-backup-show";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();



var TypesManager = {
    DeleteItemType:function(credential,evt){
        var req = dbConn.transaction("ItemTypes","readwrite").objectStore("ItemTypes").delete(credential);
        req.onsuccess = function(e){
            var itemEle = evt.target.MizUpTo("item");
            ItemDom.Delete(itemEle);
            MizUI.Message.Hint("set-package-deleted");
        }
    },
    DefautlItemType:function(credential){
        localStorage.setItem("default-type",credential);
        MizUI.Message.Hint("set-package-defaulted");
    },
    PreferredItemTypes:function(hashStoreObject){
        var itemDomObjs = ItemDom._ELE.querySelectorAll(".item"),
            prefTypes = [],
            prefAll = true,
            itemTypeObj;
        for (var i=0, l=itemDomObjs.length; i<l; i++) {
            itemTypeObj = itemDomObjs[i].MizObject;
            if (itemTypeObj.Controls[3].GetValue()=="1") {
                prefTypes.push(itemTypeObj.Controls[0].GetValue());
                continue;
            }
            prefAll = false;
        }
        localStorage.setItem("preferred-types",(prefAll?"":prefTypes.join(";")));
        //use hashStoreObject instead of itemDomObjs
    },
    InstalledItemTypes:(function(){
        var t = false;
        return function(hashStoreObject){
            if (t) return;
            var itemStrs = hashStoreObject.ItemStrings,
                itemTypes = ItemType.ItemInfos,
                prefTypes = localStorage.getItem("preferred-types");
            for (var i in itemTypes) {
                itemStrs.push(
                    itemTypes[i].type+";"+
                    itemTypes[i].name.MizEncode()+";"+
                    itemTypes[i].intro.MizEncode()+";"+
                    ((!prefTypes || prefTypes.indexOf(itemTypes[i].type)!=-1) ? "1;" : "0;")+
                    itemTypes[i].type+"|3"
                );
            }
            t = true;
        }
    })(),
    ListedItemTypes:(function(){
        var t = false;
        return function(hashStoreObject){
            if (t) return;
            var xhr = new XMLHttpRequest();
            //xhr.responseType = "json";
            xhr.open("get",MizLang.GetDefaultLang("set-package-path")+MizLang.GetDefaultLang("set-package-json"),false);
            xhr.onreadystatechange = function(){
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        var itemTypes = JSON.parse(this.responseText).ItemTypes,
                            itemStrs = hashStoreObject.ItemStrings;
                        for (var i in itemTypes) {
                            itemStrs.push(
                                itemTypes[i].name.MizEncode()+";"+
                                itemTypes[i].intro.MizEncode()+";"+
                                itemTypes[i].type+"|1"
                            );
                        }
                    }
                }
            }
            xhr.send();
            t = true;
        }
    })(),
    DownItemType:function(credential){
        var path = MizLang.GetDefaultLang("set-package-path"),
            xhrjs = new XMLHttpRequest(),
            xhrcss = new XMLHttpRequest();
        var blobjs = null, blobcss = null,
            dbHandler = function(type,blob){
                (type=="js") && (blobjs=blob);
                (type=="css") && (blobcss=blob);
                if (blobjs && blobcss) {
                    var req = dbConn.transaction("ItemTypes","readwrite").objectStore("ItemTypes").put({
                        type:credential,
                        js:blobjs,
                        css:blobcss
                    });
                    req.onsuccess = function(evt){
                        MizUI.Message.Hint("set-package-down");
                    }
                    req.onerror = function(evt){console.log(evt);}
                }
            };
        xhrjs.open("get",path+credential+".js");
        xhrjs.responseType = "blob";
        /* set responseType after open for ie, btw ie doesn't support responseType="json" */
        xhrjs.onreadystatechange = function(){
            if (this.readyState == 4) {
                var b = new Blob([]);
                if (this.status == 200) {
                    b = this.response;
                }
                dbHandler("js",b);
            }
        }
        xhrjs.send();
        xhrcss.open("get",path+credential+".css");
        xhrcss.responseType = "blob";
        xhrcss.onreadystatechange = function(){
            if (this.readyState == 4) {
                var b = new Blob([]);
                if (this.status == 200) {
                    b = this.response;
                }
                dbHandler("css",b);
            }
        }
        xhrcss.send();
    },
    InitItemTypes:(function(){
        if (!dbConn) {
            dbCallbacks.push(arguments.callee);
            return;
        }
        var req = dbConn.transaction("ItemTypes","readonly").objectStore("ItemTypes").openCursor(),
            blobjs = new Blob([]),
            blobcss = new Blob([]);
        req.onsuccess = function(evt){
            var cur = evt.target.result;
            if (cur) {
                blobcss = new Blob([blobcss,cur.value.css]);
                blobjs = new Blob([blobjs,cur.value.js]);
                cur.continue();
            } else {
                var script = document.createElement("script"),
                    css = document.createElement("link");
                script.type = "text/javascript";
                script.src = URL.createObjectURL(blobjs);
                css.type = "text/css";
                css.rel = "stylesheet";
                css.href = URL.createObjectURL(blobcss);
                document.head.appendChild(css);
                document.body.appendChild(script);
            }
        }
        return true;
    })()
}

var CtrlShow_Hidden = (function(){
    function C(ctrlStr,itemTypeObj){
        ControlTypeBase.call(this,ctrlStr,itemTypeObj,C.TYPENAME);
        //this.SetValue(ctrlStr,true);
    }
    var P = ControlTypeBase.GetProto(C);
    
    C.TYPENAME = "hidden-show";
    
    P.SetValue = function(ctrlStr,inner){
        this.ControlString = ctrlStr;
    }
    
    return C;
})();

var ItemShow_Sys_Installed = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlShow_Hidden,CtrlShow_Inputbox,CtrlShow_Text,CtrlShow_Toggle,CtrlShow_Sys_Commands,["item-sys-installed-hidden","item-sys-installed-name","item-sys-installed-intro","item-sys-installed-dis","item-sys-installed-cmds"]);
        this.Controls[4].SetCommands([
            {key:"item-sys-installed-del",func:TypesManager.DeleteItemType},
            {key:"item-sys-installed-def",func:TypesManager.DefautlItemType}
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "item-sys-installed-hidden":["\u5FFD\u7565","Ignore Me"],
            "item-sys-installed-name":["\u540D\u79F0","Type Name"],
            "item-sys-installed-intro":["\u4ECB\u7ECD","Introduction"],
            "item-sys-installed-cmds":["\u547D\u4EE4","Commands"],
            "item-sys-installed-del":["\u5220\u9664","Delete"],
            "item-sys-installed-def":["\u8BBE\u4E3A\u9ED8\u8BA4","Make Default"],
            "item-sys-installed-dis":["\u663E\u793A","Display"],
            "item-sys-package-down":["\u4E0B\u8F7D","Download"]
        }
    }
    MizLang.AddLangsPack(langsPack);
    C.TYPENAME = "sys-installed-show";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();

var ItemShow_Sys_Package = (function(){
    function C(itemStrObj){
        ItemTypeBase.call(this,itemStrObj,C.TYPENAME);
        this.SetCtrls(CtrlShow_Inputbox,CtrlShow_Text,CtrlShow_Sys_Commands,["item-sys-installed-name","item-sys-installed-intro","item-sys-installed-cmds"]);
        this.Controls[2].SetCommands([
            {key:"item-sys-package-down",func:TypesManager.DownItemType}
        ]);
    }
    var P = ItemTypeBase.GetProto(C);
    
    C.TYPENAME = "sys-package-show";
    C.INTROKEY = null;
    
    ItemType.RegisterType(C);
    return C;
})();



(function(){
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "set-relart":["\u76F8\u5173\u6587\u7AE0","Relevant Posts"],
            "set-relart-hasharehowto":[
                "Hashare\u4F7F\u7528|http://blog.mizip.net/hashare-howto;\u672C\u7BC7\u6587\u7AE0\u7B80\u5355\u4ECB\u7ECD\u8FD9\u4E2A\u73A9\u610F\u600E\u4E48\u7528\uFF08\u5B9E\u9645\u4E0A\u529F\u80FD\u4E5F\u4E0D\u591A\uFF09\u3002",
                "Hashare HowTo|http://blog.mizip.net/hashare-howto-en;This is an article about how to use Hashare-Offline. Well, Hashare-Offline is simple though."
            ],
            "set-relart-oauth":[
                "OAuth\u767B\u5165\u5907\u4EFD|http://blog.mizip.net/oauth-for-hashare;\u5728\u5907\u4EFD\u5230\u4E91\u7AEF\u4E2D\u5C06\u4F7F\u7528\u5230\u4E00\u79CD\u767B\u5165\u65B9\u5F0F\uFF0C\u6211\u60F3\u5728\u6B64\u4ECB\u7ECD\uFF0C\u8BA9\u5404\u4F4D\u80FD\u4E86\u89E3Hashare\u7684\u5728\u9690\u79C1\u4E0A\u7684\u5904\u7406\u65B9\u5F0F\u3002",
                "OAuth Backup|http://blog.mizip.net/oauth-for-hashare;I want to share my knowledge about OAuth(A technique that used to backup in Hashare-Offline), and explain my way about users' privacy. (Language in Chinese)"
            ],

            "set-backup":["\u5907\u4EFD","Backup"],
            "set-backup-unauth":["\u5C1A\u672A\u767B\u5165\u670D\u52A1","No token found, login first."],
            "set-backup-fetchlistfail":["\u83B7\u53D6\u5217\u8868\u5931\u8D25","Failed to fetch list."],
            "set-backup-onedrive":[
                "OneDrive|https://onedrive.live.com/;\u901A\u8FC7\u5FAE\u8F6FOneDrive\u5907\u4EFD\uFF08Tables\u3001\u56FE\u7247\u3001\u6807\u7B7E\uFF09\u7B49\u8D44\u6E90\uFF08\u4E0D\u8FC7\u6682\u65F6\u53EA\u80FD\u5907\u4EFDTables\uFF09\uFF0C\u5728\u684C\u9762\u4E0E\u79FB\u52A8\u6D4F\u89C8\u5668\u95F4\u540C\u6B65\uFF08\u624B\u52A8\uFF09\u3002\u5982\u679C\u60A8\u5BF9\u9690\u79C1\u6709\u6240\u7591\u8651\uFF0C\u8BF7\u770B\u201C\u76F8\u5173\u6587\u7AE0-OAuth\u767B\u5165\u5907\u4EFD\u201D\u3002\\n\u6BCF\u6B21\u767B\u5165\u51ED\u8BC1\u6709\u6548\u65F6\u95F4\u4E3A\u4E00\u5C0F\u65F6\uFF0C\u53E6\u5173\u95ED\u6D4F\u89C8\u5668\u4E5F\u5C06\u4E22\u5931\u51ED\u8BC1\uFF0C\u8BF7\u91CD\u65B0\u767B\u5165\u3002;onedrive|7",
                "OneDrive|https://onedrive.live.com/;Backup your Tables/Images/Tags/etc.(only Tables currently) through Microsoft OneDrive, and sync manually among desktop and mobile browsers. Please refer to \"Relevant Posts - OAuth Backup\" for the privacy issue.\\nToken will expire in an hour and get lost when browser closed, just re-login then.;onedrive|7"
            ],
            "set-installed":["\u5DF2\u88C5\u7C7B\u578B","Installed Types"],
            "set-package":["\u7C7B\u578B\u5217\u8868","Types List"],
            "set-package-json":["package.zh-cn.json","package.en.json"],
            "set-package-path":["itemType/","itemType/"],
            "set-package-down":["\u4E0B\u8F7D\u5B8C\u6210\uFF0C\u91CD\u65B0\u8F7D\u5165\u540E\u751F\u6548\u3002","Download complete, reload to take effect."],
            "set-package-deleted":["\u7C7B\u578B\u5DF2\u5220\u9664\uFF0C\u91CD\u8F7D\u540E\u751F\u6548\uFF0C\u7CFB\u7EDF\u7C7B\u578B\u65E0\u6CD5\u5220\u9664\u3002","Type deleted, reload to take effect or it's a system type."],
            "set-package-defaulted":["\u7C7B\u578B\u5DF2\u8BBE\u7F6E\u4E3A\u9ED8\u8BA4\u3002","Type has been set to default."]
        }
    }
    MizLang.AddLangsPack(langsPack);

    var settingData = [
        {
            name:MizLang.GetDefaultLang("set-relart"),
            type:"sys-relart",
            ItemStrings:[
                MizLang.GetDefaultLang("set-relart-hasharehowto"),
                MizLang.GetDefaultLang("set-relart-oauth")
            ]
        },
        {
            name:MizLang.GetDefaultLang("set-backup"),
            type:"sys-backup",
            ItemStrings:[
                MizLang.GetDefaultLang("set-backup-onedrive")
            ]
        },
        {
            name:MizLang.GetDefaultLang("set-installed"),
            type:"sys-installed",
            StartAction:TypesManager.InstalledItemTypes,
            EndAction:TypesManager.PreferredItemTypes,
            ItemStrings:[]
        },
        {
            name:MizLang.GetDefaultLang("set-package"),
            type:"sys-package",
            StartAction:TypesManager.ListedItemTypes,
            ItemStrings:[]
        }
    ]

    var settingBackMain = function(evt){
        if (!EventManager.CanContinue(1)) return;
        if (CurrentHashObject) CurrentHashObject.End();
        ItemDom.Clear();HashDom.Clear();
        document.getElementById("btn-backmain").removeEventListener("click",settingBackMain,false);
        document.getElementById("hash-zone").removeEventListener("click",settingSwitchHash,false);
        document.getElementById("item-zone").removeEventListener("click",settingItemCmd,false);
        document.body.onbeforeunload = TableDom.BeforeLeave;
        document.getElementById("table-blk").style.display="none";
        document.getElementById("main-blk").style.display="block";
        EventManager.SetLevel(0);
    }
    var settingSwitchHash = function(evt){
        var hashDom = evt.target.MizUpTo("hash");
        if (!(EventManager.CanContinue(1) && hashDom)) return;
        HashDom.SwtichTo(hashDom);
        ItemDom._ELE.style.display = "block";
    }
    var settingItemCmd = function(evt){
        /*Don't use MizUpTo if evt.target should only == this*/
        if (EventManager.CanContinue(1) && evt.target.classList.contains("btn-cmd")) {
            var func = evt.target.MizObject,
                ctrl = evt.target.MizUpTo("ctrl");
            func(ctrl.MizObject.GetCredential(),evt);
        }
    }

    document.getElementById("btn-setting").addEventListener("click",function(evt){
        document.getElementById("table-name").textContent = MizLang.GetDefaultLang("sys-setting");
        document.getElementById("table-blk").style.display = "block";
        document.getElementById("main-blk").style.display = "none";
        CurrentTableObject = new CurrentTableClass(null);
        CurrentTableObject.AppendHashes(settingData);
        ItemDom._ELE.style.display = "none";
        HashDom.Init();
        document.getElementById("btn-backmain").addEventListener("click",settingBackMain,false);
        EventManager.SetLevel(1);
        document.getElementById("hash-zone").addEventListener("click",settingSwitchHash,false);
        document.body.onbeforeunload = null;
        document.getElementById("item-zone").addEventListener("click",settingItemCmd,false);
    },false);
})();