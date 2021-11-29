var CurrentUserObject = new CurrentUserClass();
var CurrentTableObject;
var CurrentHashObject;

var TableDom = {
    _ELE:document.getElementById("table-zone"),
    Init:function(){
        var u = document.createElement("ul");
        var k = CurrentUserObject.TableStoreObjects;
        var fragDoc = document.createDocumentFragment();
        var obj;
        for (var i in k) {
            obj = new TableTempClass(k[i]);
            fragDoc.appendChild(obj.TableDomObject);
        }
        u.appendChild(fragDoc);
        TableDom._ELE.appendChild(u);
    },
    SwitchTo:function(srcEle){
        var tblTempObj = srcEle.MizObject;
        CurrentTableObject = new CurrentTableClass(tblTempObj.TableStoreObject);
        CurrentTableObject.Loading(function () {
            HashDom.Init();
            document.getElementById("table-name").textContent = tblTempObj.GetName();
            document.getElementById("main-blk").style.display="none";
            document.getElementById("table-blk").style.display="block";
        });
    },
    Delete:function(srcEle, evt){
        hsoUI.DelTableAlert.Open(evt, true, function (remote) {
            var tblTempObj = srcEle.MizObject;
            CurrentUserObject.DeleteTable(tblTempObj.TableStoreObject, remote);
            tblTempObj.Tini();
            srcEle.parentElement.removeChild(srcEle);
        }, null);
    },
    Save:function(){
        if (!EventManager.CanContinue(0)) return;
        if (CurrentHashObject) CurrentHashObject.End();
        CurrentTableObject && CurrentTableObject.End(function (err) {
            if (err!=-1) MizUI.Message.Hint("sys-tablesaved");
        });
    },
    Back:function(){
        if (!EventManager.CanContinue(0)) return;
        if (CurrentHashObject) CurrentHashObject.End();
        ItemDom.Clear();
        CurrentTableObject && CurrentTableObject.End(function (err) {
            if (err!=-1) MizUI.Message.Hint("sys-tablesaved");
            HashDom.Clear();
            document.getElementById("table-blk").style.display="none";
            document.getElementById("main-blk").style.display="block";
        });
    },
    BeforeLeave:function(){
        if ((CurrentHashObject && CurrentHashObject.End(true)) ||
            (CurrentTableObject && CurrentTableObject.End()))
            return MizLang.GetDefaultLang("sys-unsavedetected");
    },
    /*
        Save & Back aren't parts of TableDom
    */
    Add:function(val){
        CurrentUserObject.AddTable(val, function (tblStoreObj) {
            if (!tblStoreObj) return; // messagebox the reason
            var obj = new TableTempClass(tblStoreObj);
            TableDom._ELE.children[0].appendChild(obj.TableDomObject);
        });
    },
    AddViaText:function(text){
        var obj = MizParser.Text2Object(text);
        if (obj) {
            CurrentUserObject.AddViaObject(obj, function (tblStoreObj) {
                var tblTempObj = new TableTempClass(tblStoreObj);
                TableDom._ELE.children[0].appendChild(tblTempObj.TableDomObject);
            })
        } else {
            MizUI.Message.Hint("sys-failtoparse");
        }
    },
    AddViaFile:function(evt){
        var fs = evt.target.files;
        (function(files,index){
            if (index<files.length) {
                var freader = new FileReader();
                freader.onloadend = (function(callback,para1,para2){
                    return function(evt) {
                        var result = evt.target.result;
                        TableDom.AddViaText(result);
                        callback(para1,para2);
                    }
                })(arguments.callee,files,index+1);
                freader.readAsText(files[index]);
            }
        })(fs,0);
    },
    Edit:function(srcEle,evt){
        hsoUI.AddTable.Open(evt, srcEle.textContent, (function (ele) {
            var tblTempObj = ele.MizObject;
            return function(val){
                tblTempObj.SetPartialValue(val["name"]);
                CurrentUserObject.EditTable(tblTempObj.TableStoreObject, val["name"]);
                /*
                    Why Table's Edit requires CurrentUserObject?
                    'cause TableTempObject.SetValue won't reflect to db/fs
                    while Hash or Item's SetValue directly affect in data structure
                */
            }
        })(srcEle),null);
    },
    Down:function(srcEle){
        var tblTempObj = srcEle.MizObject,
            tblStoreObj = tblTempObj.TableStoreObject;
        tblStoreObj.Get(function (blob) {
            if (navigator.msSaveBlob) {
                navigator.msSaveBlob(blob,tblTempObj.GetName()+".txt");
            } else {
                var val = {
                    "text":MizLang.GetDefaultLang("sys-downtable"),
                    "filename":tblTempObj.GetName()+".txt",
                    "link":URL.createObjectURL(blob)
                }
                MizUI.Display.Down(val,function(link){
                    URL.revokeObjectURL(link);
                },null);
            }
        });
    },
    Clear:function(){},
    ImportTable: function (evt) {
        var m = {
            "local": function () {
                document.getElementById("input-tablefile").click();
            },
            "mizip": function (val, evt) {
                val["by"] = "import";
                hsoUI.PasswordAuth.Open(evt, val, function (v) {
                    // {opsd, epsd, guid}
                    v["name"] = val["name"];
                    v["host"] = val["host"];
                    var fsObj = new hsoFSMIZip(v);
                    CurrentUserObject.LinkTable(fsObj);
                    var tblTempObj = new TableTempClass(fsObj);
                    TableDom._ELE.children[0].appendChild(tblTempObj.TableDomObject);
                }, null);
            },
            "private": function (val, evt) {
                hsoFSPrivate.ListTable(function (val) {
                    // val [{"guid", "name"}]
                    hsoUI.RemoteFilesList.Open(evt, val, function (val) {
                        // val [{"guid", "name"}]
                        for (var i in val) {
                            var fsObj = new hsoFSPrivate(val[i]["guid"], val[i]["name"]);
                            CurrentUserObject.LinkTable(fsObj);
                            var tblTempObj = new TableTempClass(fsObj);
                            TableDom._ELE.children[0].appendChild(tblTempObj.TableDomObject);
                        }
                    }, null);
                });
            }
        }
        hsoUI.AddTable.Nextep(function (val, evt) {
            m[val["type"]](val, evt);
        });
    }
}

var HashDom = {
    _ELE:document.getElementById("hash-zone"),
    _lastEle:null,
    _copiedHash:{name:"",type:"",ItemStrings:null},
    Init:function(){
        var u = document.createElement("ul");
        var k = CurrentTableObject.HashStoreObjects;
        var fragDoc = document.createDocumentFragment();
        var obj;
        for (var i in k) {
            obj = new HashTempClass(k[i]);
            fragDoc.appendChild(obj.HashDomObject);
        }
        u.appendChild(fragDoc);
        HashDom._ELE.appendChild(u);
        
        TagManager.Init(); // Weird to be here
    },
    SwtichTo:function(srcEle){
        if (srcEle==HashDom._lastEle) return;
        var hashTempObj = srcEle.MizObject;
        if (CurrentHashObject) CurrentHashObject.End();
        ItemDom.Clear();
        CurrentHashObject = new CurrentHashClass(hashTempObj.HashStoreObject);
        ItemDom.Init();
        if (HashDom._lastEle) HashDom._lastEle.classList.remove("active");
        srcEle.classList.add("active");
        HashDom._lastEle = srcEle;
    },
    Delete:function(srcEle){
        if (srcEle==HashDom._lastEle) {
            ItemDom.Clear();
            HashDom._lastEle = null;
        }
        var hashTempObj = srcEle.MizObject;
        hashTempObj.HashStoreObject.Delete();
        /*
            In principle, it should be
            CurrentTableObject.Delete(hashTempObj.HashStoreObject);
        */
        hashTempObj.Tini();
        srcEle.parentElement.removeChild(srcEle);
    },
    Clear:function(){
        if (!CurrentTableObject) return;
        CurrentTableObject.Tini();
        CurrentTableObject = null;
        var hashTempObj;
        var hashDomObjs = HashDom._ELE.querySelectorAll(".hash");
        for (var i=0, l=hashDomObjs.length; i<l; i++) {
            hashTempObj = hashDomObjs[i].MizObject;
            hashTempObj.Tini();
        }
        var ele;
        while (ele = HashDom._ELE.firstChild) HashDom._ELE.removeChild(ele);
    },
    Add:function(val){
        var hashStoreObj = CurrentTableObject.AddHash(val);
        var obj = new HashTempClass(hashStoreObj);
        HashDom._ELE.children[0].appendChild(obj.HashDomObject);
        /*
            Not good to use children[0]
        */
    },
    Edit:function(srcEle,evt){
        hsoUI.AddHash.Open(evt, srcEle.textContent, (function (ele) {
            var hashTempObj = ele.MizObject;
            return function(val){
                hashTempObj.SetPartialValue(val);
            }
        })(srcEle),null);
    },
    Copy:function(srcEle){
        var hashStoreObj = srcEle.MizObject.HashStoreObject;
        HashDom._copiedHash.name = hashStoreObj.name;
        HashDom._copiedHash.type = hashStoreObj.type;
        HashDom._copiedHash.ItemStrings = hashStoreObj.ItemStrings.slice(0);
    },
    Paste:function(evt){
        if (HashDom._copiedHash.ItemStrings) {
            var hashStoreObj = CurrentTableObject.PasteHash(HashDom._copiedHash);
            var obj = new HashTempClass(hashStoreObj);
            HashDom._ELE.children[0].appendChild(obj.HashDomObject);
            HashDom._copiedHash.ItemStrings = null;
            hsoUI.AddHash.No(); //!! replace this using hsoUI.AddHash.Nextep
        } else {
            MizUI.Message.Hint("sys-nohashcopied");
        }
        /*
            Two hashStoreObj might use same ItemStrings array copied once
            Modification to one Hash won't affect the other, because new array created when
            CurrentHashObject.End(). But if AppendItemString, both are appended.
            So Hash can be pasted only once at a time.
        */
    },
    MoveTo:function(fromEle,toEle){
        if (toEle==HashDom._lastEle) return;
        var hashTempObj = toEle.MizObject,
            itemTypeObj = fromEle.MizObject;
        hashTempObj.HashStoreObject.AppendItemString(itemTypeObj.GetValue());
        itemTypeObj.ItemStringObject.Delete();
        itemTypeObj.Tini();
        fromEle.parentElement.removeChild(fromEle);
    }
}

var ItemDom = {
    _ELE:document.getElementById("item-zone"),
    _copiedItemString:null,
    Init:function(){
        var k = CurrentHashObject.ItemStringObjects;
        var t = ItemType.GetTypeClass(CurrentHashObject.type+"-show");
        var fragDoc = document.createDocumentFragment();
        var obj;
        for (var i in k) {
            if (k[i].ItemString==null) continue;
            obj = new t(k[i]);
            fragDoc.appendChild(obj.ItemDomObject);
        }
        ItemDom._ELE.appendChild(fragDoc);
    },
    Delete:function(srcEle){
        var itemTypeObj = srcEle.MizObject;
        itemTypeObj.ItemStringObject.Delete();
        itemTypeObj.Tini();
        srcEle.parentElement.removeChild(srcEle);
    },
    Clear:function(){
        if (CurrentHashObject==null) return;
        if (CurrentHashObject) CurrentHashObject.Tini();
        CurrentHashObject = null;
        /* Everywhere else use if (CurrentHashObjec).. !!0==false and !!null==false
        but null!=0/false; So this is a trick for clear TagFilter result,
        but should be a temporary trick. */
        var itemTypeObj;
        var itemDomObjs = ItemDom._ELE.querySelectorAll(".item");
        for (var i=0, l=itemDomObjs.length; i<l; i++) {
            itemTypeObj = itemDomObjs[i].MizObject;
            itemTypeObj.Tini();
        }
        var ele;
        while (ele = ItemDom._ELE.firstChild) ItemDom._ELE.removeChild(ele);
    },
    Add:function(evt){
        if (!EventManager.CanContinue(0)) return;
        if (!CurrentHashObject) {
            MizUI.Message.Hint("sys-nohashselected");
            return;
        }
        MizUI.Editem.Show(CurrentHashObject.type,evt,"",function(val){
            var t = ItemType.GetTypeClass(CurrentHashObject.type+"-show");
            var itemStringObj = CurrentHashObject.AddItem(val);
            var itemTypeObj = new t(itemStringObj);
            ItemDom._ELE.appendChild(itemTypeObj.ItemDomObject);
        },null);
    },
    Copy:function(srcEle){
        var itemTypeObj = srcEle.MizObject;
        ItemDom._copiedItemString = itemTypeObj.GetValue();
    },
    Paste:function(evt){
        if (!EventManager.CanContinue(1) || !ItemDom._copiedItemString) return;
        EditemManager.CurrentEditem.SetValue(ItemDom._copiedItemString);
        /*If you can paste, there must be CurrentEditem*/
    },
    MoveBefore:function(fromEle,toEle){
        if (fromEle==toEle) return;
        var fromTypeObj = fromEle.MizObject,
            toTypeObj = toEle.MizObject;
        if (CurrentHashObject) CurrentHashObject.InsertBefore(fromTypeObj.ItemStringObject,toTypeObj.ItemStringObject);
        fromEle.parentElement.insertBefore(fromEle,toEle);
    },
    Edit:function(srcEle,evt){
        if (!CurrentHashObject) return;
        /* The clause above owing to TagFilter, which makes CurrentHashObject to 0/false
        but Items remaining. Need some methods to create real CurrentHashObject, for later's
        copy/edit of filtered Items. Same in MoveBefore */
        var itemString = srcEle.MizObject.GetValue();
        MizUI.Editem.Show(CurrentHashObject.type,evt,itemString,(function(ele){
            var itemTypeObj = ele.MizObject;
            return function(val){
                itemTypeObj.SetValue(val);
            }
        })(srcEle),null);
    },
    SwitchToType:function(type){
        if (CurrentHashObject && CurrentHashObject.type!=type) {
            var itemTypeObj;
            var itemDomObjs = ItemDom._ELE.querySelectorAll(".item");
            for (var i=0, l=itemDomObjs.length; i<l; i++) {
                itemTypeObj = itemDomObjs[i].MizObject;
                itemTypeObj.Tini();
            }
            var ele;
            while (ele = ItemDom._ELE.firstChild) ItemDom._ELE.removeChild(ele);
            CurrentHashObject.SetType(type);
            ItemDom.Init();
        }
    }
}

TableDom.Init();