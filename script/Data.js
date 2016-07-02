(function(){
    var langsPack = {
        langs:["zh-cn","en"],
        pack:{
            "pre-description":["Hashare\u662F\u4E00\u4E2A\u57FA\u4E8E\u7F51\u9875\u6280\u672F\uFF0C\u7C7B\u4F3C\u4E8E\u5F85\u529E\u4E8B\u9879\u548C\u7B14\u8BB0\uFF0C\u81F4\u529B\u4E8E\u4E2A\u4EBA\u77E5\u8BC6\u7ED3\u6784\u68B3\u7406\uFF0C\u7684\uFF0C\u5C0F\u5E94\u7528","Hashare is a todo and note like tool, based on webpage techniques, to clarify one's knowledge."],
            "pre-showhash":["\u663E\u793AHash","Show Hash"],
            "pre-edithash":["\u7F16\u8F91Hash","Edit Hash"],
            "pre-name":["\u540D\u79F0","Name"],
            "pre-paste":["\u7C98\u8D34","Paste"],
            "pre-edittable":["\u7F16\u8F91Table","Edit Table"],
            "pre-fromfile":["\u6765\u81EA\u6587\u4EF6","From File"],
            "pre-yes":["\u786E\u5B9A","OK"],
            "pre-no":["\u53D6\u6D88","Cancel"],
            "pre-editem":["\u7F16\u8F91Item","Edit Item"],
            "pre-datepicker":["\u9009\u62E9\u65E5\u671F","Pick Date"],
            "pre-today":["\u4ECA\u5929","Today"],
            "pre-empty":["\u91CD\u7F6E","Empty"],
            "pre-downlink":["\u94FE\u63A5","Download Link"],
            "pre-year":["\u5E74","Year"],
            "pre-month":["\u6708","Month"],
            "pre-day":["\u65E5","Day"],
            "pre-imagepicker":["\u9009\u62E9\u56FE\u7247","Pick Image"],
            "pre-larger":["\u653E\u5927","Larger"],
            "pre-smaller":["\u7F29\u5C0F","Smaller"],
            "pre-useless":["\u6CA1\u7528","Useless"],
            "pre-tagfilter":["\u6807\u7B7E\u7B5B\u9009","Tag Filter"],
            "pre-tagunit":["\u6807\u7B7E","Tag"],
            "pre-taglogic":["\u903B\u8F91","Logic"],
            "pre-addfilter":["\u6DFB\u52A0","Add"],
            "pre-taglogicAll":["\u542B\u6240\u6709","Contain All"],
            "pre-taglogicOne":["\u542B\u5176\u4E00","Contain One"],
            "pre-taglogicNotone":["\u975E\u5176\u4E00","Not Any"],
            "pre-taglogicNotall":["\u975E\u6240\u6709","Not All"],
            
            "sys-nohashselected":["\u8FD8\u6CA1\u9009\u62E9Hash","Haven't selected any Hash."],
            "sys-tablesaved":["Table\u5DF2\u4FDD\u5B58","Table saved."],
            "sys-cfm2deltable":["\u786E\u5B9A\u5220\u9664Table\uFF1F","Are you sure to delete this Table?"],
            "sys-unsavedetected":["\u6240\u505A\u4FEE\u6539\u5C06\u4E22\u5931\uFF01","Modification won't be saved!"],
            "sys-downtable":["\u4E0B\u8F7DTable","Download Table"],
            "sys-edit":["\u7F16\u8F91","Edit"],
            "sys-delete":["\u5220\u9664","Delete"],
            "sys-down":["\u4E0B\u8F7D","Download"],
            "sys-copy":["\u590D\u5236","Copy"],
            "sys-move":["\u79FB\u52A8","Move"],
            "sys-nohashcopied":["\u6CA1\u6709Hash\u88AB\u590D\u5236\uFF0C\u6216\u8005\u5DF2\u88AB\u7C98\u8D34","No Hash copied, or has been pasted once."],
            "sys-setting":["\u8BBE\u7F6E","Setting"],
            "sys-progressformat":["\u603B\u5171\uFF1A{0} - \u6210\u529F\uFF1A{1} - \u5931\u8D25\uFF1A{2}","Total:{0} - Success:{1} - Fail:{2}"],
            "sys-failtoparse":["\u65E0\u6CD5\u89E3\u6790\u6587\u4EF6\u6216\u6587\u672C","Failed to parse text or file!"]
        }
    }
    
    MizLang.AddLangsPack(langsPack);
    var l = "",
        result = null;
    if (location.search) {
        var regex = new RegExp("[\\?#&]lang=([^&#]*)");
        result = regex.exec(location.search);
        /*http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript*/
    }
    if (result) {
        l = result[1];
        localStorage.setItem("hashare-lang",l);
    } else {
        l = localStorage.getItem("hashare-lang") || "zh-cn";
    }
    MizLang.SetDefaultLang(l);
    
    var a = document.querySelectorAll("[data-prekey]");
    if (document.body.dataset) {
        for (var i=0, l=a.length; i<l; i++) {
            a[i].textContent = MizLang.GetDefaultLang("pre-"+a[i].dataset["prekey"]);
        }
    } else {
        for (var i=0, l=a.length; i<l; i++) {
            a[i].textContent = MizLang.GetDefaultLang("pre-"+a[i].getAttribute("data-prekey"));
        }
    }
})();