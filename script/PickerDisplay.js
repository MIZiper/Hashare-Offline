var Picker = {
    Date:(function(beginYear,endYear){
        var eleYear = document.getElementById("date-picker-year"),
            eleMonth = document.getElementById("date-picker-month"),
            eleDay = document.getElementById("date-picker-day");
        
        var fragEle = document.createDocumentFragment();
        for (var i=beginYear; i<=endYear; i++) {
            var e = document.createElement("option");
            e.textContent = i;
            e.value = i;
            fragEle.appendChild(e);
        }
        eleYear.appendChild(fragEle);
        fragEle = document.createDocumentFragment();
        for (var i=1; i<=12; i++) {
            var e = document.createElement("option");
            e.textContent = i;
            e.value = i<10 ? "0"+i : i;
            fragEle.appendChild(e);
        }
        eleMonth.appendChild(fragEle);
        fragEle = document.createDocumentFragment();
        for (var i=1; i<=31; i++) {
            var e = document.createElement("option");
            e.textContent = i;
            e.value = i<10 ? "0"+i : i;
            fragEle.appendChild(e);
        }
        eleDay.appendChild(fragEle);
        
        function IsLeapYear(year) {
            return !(year%100 ? year%4 : year%400);
        }
        var DaysOfMonth = [
            [31,28,31,30,31,30,31,31,30,31,30,31],
            [31,29,31,30,31,30,31,31,30,31,30,31]
        ];
        function DateChange(evt) {
            if (evt && evt.target==eleDay) return;
            year = parseInt(eleYear.value) || 1;
            month = parseInt(eleMonth.value) || 2;
            day = parseInt(eleDay.value) || 0;
            
            var isLeap = !(year%100 ? year%4 : year%400),
                DoM = DaysOfMonth[isLeap+0];
            for (var i=28; i<31; i++) {
                eleDay.children[i].disabled = DoM[month-1]<(i+1);
            }
            if (day>DoM[month-1]) eleDay.selectedIndex=-1;
        }
        
        document.getElementById("date-picker").addEventListener("change",DateChange,false);
        document.getElementById("btn-today").addEventListener("click",function(evt){C.SetValue(MizDate.Today)},false);
        document.getElementById("btn-emptydate").addEventListener("click",function(evt){C.SetValue("")},false);
        
        var C = {
            GetValue:function(){
                if (eleYear.value && eleMonth.value && eleDay.value) {
                    return eleYear.value+"-"+eleMonth.value+"-"+eleDay.value;
                } else
                    return "";
            },
            SetValue:function(val){
                var a = val.split("-");
                eleYear.value = a[0];
                eleMonth.value = a[1];
                eleDay.value = a[2];
                DateChange(null);
            }
        };
        
        return C;
    })(1970,2050),
    Image:(function(){
        var langsPack = {
            langs:["zh-cn","en"],
            pack:{
                "picker-notimage":["\u8FD9\u4E0D\u662F\u4E00\u5F20\u56FE\u7247","This is not an image."],
                "picker-imagenotexist":["\u4E0D\u662F\u56FE\u7247\u6216\u5DF2\u88AB\u5220\u9664","Image doesn't existed or has been deleted."]
            }
        }
        MizLang.AddLangsPack(langsPack);
        langsPack = null;
        
        var container = document.getElementById("image-picker-container");
        
        var AddImage = function(val){
            if (!val) {
                MizUI.Message.Hint("picker-notimage");
                return;
            }
            var li = document.createElement("li");
            var i = document.createElement("i");
            var img = document.createElement("img");
            i.className = "font-btn btn-context";
            li.className = "thumb";
            li.setAttribute("data-guid",val.guid);
            img.src = val.url;
            li.appendChild(i); li.appendChild(img);
            container.appendChild(li);
        }
        var DelImage = function(ele){
            container.removeChild(ele);
            ImageManager.Delete(ele.getAttribute("data-guid"));
        }
        
        MenuManager.AddMenu("picker-image",[
            {key:"sys-delete",func:DelImage}
        ]);
        var thumbContext = function(evt){
            var li = evt.target.MizUpTo("thumb");
            if (!li) return;
            evt.preventDefault();
            MizUI.Menu.Open("picker-image",evt,li);
        }
        container.addEventListener("contextmenu",thumbContext,false);
        container.addEventListener("click",function(evt){
            if (evt.target.classList.contains("btn-context")) {
                thumbContext(evt);
                evt.stopPropagation();
                return;
            }
            var li = evt.target.MizUpTo("thumb");
            if (!li) return;
            guid = li.getAttribute("data-guid");
            MizUI.Picker.Yes();
        },false);
        
        document.getElementById("input-imagefile").addEventListener("change",function(evt){
            var files = evt.target.files;
            if (!files[0]) return;
            ImageManager.Add(files[0],AddImage);
        },false);
        document.getElementById("btn-imagefile").addEventListener("click",function(evt){
            document.getElementById("input-imagefile").click();
        },false);
        document.getElementById("btn-emptyimage").addEventListener("click",function(evt){
            guid = "";
            MizUI.Picker.Yes();
        },false);
        
        var guid,
            inited = false;
        /*This is the most interesting trick!*/
        var C = {
            GetValue:function(){
                return guid;
            },
            SetValue:function(val){
                guid = val;
                if (!inited) {
                    ImageManager.GetThumbs(function(vals){
                        for (var i in vals) {
                            AddImage(vals[i]);
                        }
                    });
                    inited = true;
                }
            }
        }
        
        return C;
    })()
}

var Display = {
    Image:(function(){
        var i = document.getElementById("image-display-img");
        var div = document.getElementById("image-display");
        var pannel = div.lastElementChild;
        
        var positionPannel = function(evt){
            var H = window.innerHeight,
                h = div.clientHeight,
                Y = ((h/2+H/2)|0)-pannel.clientHeight-12;
            pannel.style.top = Y+"px";
        }
        document.getElementById("btn-imagelarger").addEventListener("click",function(evt){
            i.style.height = ((1.1*i.height)|0) + "px";
            positionPannel();
        },false);
        document.getElementById("btn-imagesmaller").addEventListener("click",function(evt){
            i.style.height = ((0.9*i.height)|0) + "px";
            positionPannel();
        },false);
        
        var C = {
            GetValue:function(){
                return i.src;
            },
            SetValue:function(val){
                i.style.height = "auto";
                ImageManager.GetURL(val,function(url){
                    if (url) {
                        i.src = url;
                    } else {
                        i.src = ImageManager.DEFAUTLIMAGE;
                        MizUI.Message.Hint("picker-imagenotexist");
                    }
                    i.onload = positionPannel;
                });
            }
        }
        return C;
    })()
}

var ImageManager = {
    _cacheThumb:[],/*guid->URL(thumb,origin)*/
    THUMBLENGTH:128,
    DEFAUTLIMAGE:"misc/whobody.png",
    GetThumbs:function(callback){
        var ind = dbConn.transaction("Resources","readonly").objectStore("Resources").index("idx_type");
        var vals = [];
        ind.openCursor(IDBKeyRange.only("image/thumb")).onsuccess = function(evt){
            var cursor = evt.target.result;
            if (cursor) {
                var guid = cursor.value.fname.slice(0,-6);
                vals.push({guid:guid,url:cursor.value.data});
                ImageManager._cacheThumb[guid] = cursor.value.data;
                cursor.continue();
            } else {
                callback(vals);
            }
            /*
                Why don't store 'guid' in record
                Is it necessary to 'GetThumbURL' since both this func and Add save to _cacheThumb
                Return only guids or [{guid,url(data)}]
            */
        }
    },
    GetThumb:function(blob,callback){
        var cvs = document.createElement("canvas");
        cvs.width = ImageManager.THUMBLENGTH; cvs.height = ImageManager.THUMBLENGTH;
        var ctx = cvs.getContext("2d");
        
        var i = document.createElement("img");
        i.onerror = function(evt){
            callback(null);
            /*use this to judge whether it's an image, fairly low...*/
        }
        i.onload = function(evt){
            var h=0, w=0, x=0, y=0;
            if (i.height>i.width) {
                h = ImageManager.THUMBLENGTH; y = 0;
                w = (i.width/i.height)*ImageManager.THUMBLENGTH|0;
                x = (ImageManager.THUMBLENGTH-w)/2|0;
            } else {
                w = ImageManager.THUMBLENGTH; x = 0;
                h = (i.height/i.width)*ImageManager.THUMBLENGTH|0;
                y = (ImageManager.THUMBLENGTH-h)/2|0;
            }
            ctx.drawImage(this,x,y,w,h);
            callback(cvs.toDataURL());
        }
        i.src = URL.createObjectURL(blob);
    },
    GetThumbURL:function(guid,callback){
        if (!guid || ImageManager._cacheThumb[guid]) {
            callback(ImageManager._cacheThumb[guid]);
            return;
        }
        var req = dbConn.transaction("Resources","readonly").objectStore("Resources").get(guid+"-thumb");
        req.onsuccess = function(evt){
            var result = evt.target.result;
            if (result) {
                ImageManager._cacheThumb[guid] = result.data;
                callback(result.data);
            } else {
                callback(null);
            }
        }
        req.onerror = function(evt){console.log(evt);}
    },
    GetURL:function(guid,callback){
        if (!guid) {
            callback(null);
            return;
        }
        var req = dbConn.transaction("Resources","readonly").objectStore("Resources").get(guid);
        req.onsuccess = function(evt){
            var result = evt.target.result;
            if (result) {
                callback(URL.createObjectURL(result.data));
            } else {
                callback(null);
            }
        }
        req.onerror = function(evt){console.log(evt);}
    },
    Add:function(blob,callback){
        ImageManager.GetThumb(blob,function(thumbURL){
            if (!thumbURL) {
                callback(null);
                return;
            }
            var guid = MizGuid(), time = 0;
            ImageManager._cacheThumb[guid] = thumbURL;
            var objStore = dbConn.transaction("Resources","readwrite").objectStore("Resources");
            var success = function(evt){
                if (++time>=2) callback({guid:guid,url:thumbURL});
            }
            var req = objStore.add({fname:guid,type:"image/origin",data:blob});
            var reqThumb = objStore.add({fname:guid+"-thumb",type:"image/thumb",data:thumbURL});
            req.onsuccess = success;
            reqThumb.onsuccess = success;
            req.onerror = function(evt){console.log(evt);}
            reqThumb.onerror = function(evt){console.log(evt);}
            /*
                I'd like to store the thumb and origin in one object,
                but I'm not sure origin affects when thumb iteration (when I need thumb only)
                Impressive that indexedDB support blob, deeply clone!
            */
        });
    },
    Delete:function(guid,callback){
        var objStore = dbConn.transaction("Resources","readwrite").objectStore("Resources");
        ImageManager._cacheThumb[guid] = null;
        objStore.delete(guid);
        objStore.delete(guid+"-thumb");
    }
}