var ManagerBase = (function () {
    function manager() {
        
    }

    manager.prototype.Register = function (params) {
        
    }
    manager.prototype.Get = function (name) {
        
    }

    return manager;
})();

var FileServerManager = (function () {
    var container = {}
    function manager() {
        
    }
    // not only for fsServer, but also tablesServer and backupServer
    manager.Register = function (fsClass) {
        container[fsClass.TypeName] = fsClass;
        hsoUI.TableTypeMenu.AppendItems([{
            "title": MizLang.GetDefaultLang("fs-"+fsClass.TypeName),
            "value": fsClass.TypeName
        }]);
    }
    manager.Get = function (typeName) {
        return container[typeName]; // alert if not exist
    }
    return manager;
})();

var ItemTypeManager = (function (params) {
    var container = {}
    function manager(params) {
        
    }

    manager.GetDefaultType = function () {
        
    }
    manager.Register = function (itemTypeClass) {
        container[itemTypeClass.TypeName] = itemTypeClass;
    }
    manager.Get = function (typeName, status) {
        // status "show" or "edit"
        return container[typeName+"-"+status] ||container["raweditor-"+status];
    }

    return manager;
})();

var EditemManager = (function (params) {
    
})();