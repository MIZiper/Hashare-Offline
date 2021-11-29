import cherrypy, sys, os, json, uuid
from hashlib import sha1
from datetime import datetime, timedelta

LISTFILE = "list.json"

@cherrypy.expose
class HsoSecretServer(object):
    def __init__(self, root):
        self.root = root
        self.list = {}
        listpath = os.path.join(root, LISTFILE)
        if os.path.exists(listpath):
            with open(listpath) as fp:
                self.list = json.load(fp)

    def flush(self):
        with open(os.path.join(self.root, LISTFILE), mode='w') as fp:
            json.dump(self.list, fp, indent=2)
        
    def validate(self, guid, hopsd):
        if "Date" not in cherrypy.request.headers:
            return False
        d = cherrypy.request.headers["Date"]
        D = datetime.strptime(d, "%Y-%m-%dT%H:%M:%S.%fZ")
        C = datetime.utcnow()
        psd = sha1((self.list[guid]["hopsd"]+d).encode("utf8")).hexdigest()
        if abs(C-D)<timedelta(seconds=500) and psd.encode("utf8")==hopsd:
            return True
        return False

    def bodyParser(self):
        return {
            "hopsd": cherrypy.request.body.readline().strip(b"\n\r"),
            "ctx": cherrypy.request.body.readline().strip(b"\n\r")
        }

    def GET(self, guid):
        # get /hso/{guid} {#owner-psd}
        # {encrypt-content}
        if guid in self.list:
            d = self.bodyParser()
            if self.validate(guid, d["hopsd"]):
                with open(os.path.join(self.root, guid), mode='rb') as fp:
                    return fp.read()
            else:
                cherrypy.response.status = 403
        else:
            cherrypy.response.status = 404

    def PUT(self, guid):
        # put /hso/{guid} {#owner-psd, encrypt-content}
        if guid in self.list:
            d = self.bodyParser()
            if self.validate(guid, d["hopsd"]):
                with open(os.path.join(self.root, guid), mode="wb") as fp:
                    fp.write(d["ctx"])
            else:
                cherrypy.response.status = 403
        else:
            cherrypy.response.status = 404

    def POST(self, name, hopsd):
        # post /hso/ {name, #owner-psd}
        # {guid}
        guid = str(uuid.uuid4())
        assert guid not in self.list
        self.list[guid] = {"name": name, "hopsd": hopsd}
        self.flush()
        with open(os.path.join(self.root, guid), mode='ab') as fp:
            pass
        return guid

    def DELETE(self, guid):
        # delete /hso/{guid} {#owner-psd}
        if guid in self.list:
            d = self.bodyParser()
            if self.validate(guid, d["hopsd"]):
                del self.list[guid]
                self.flush()
                os.remove(os.path.join(self.root, guid))
            else:
                cherrypy.response.status = 403
        else:
            cherrypy.response.status = 404

def main():
    if len(sys.argv)>1 and os.path.isdir(sys.argv[1]):
        cherrypy.tree.mount(
            HsoSecretServer(sys.argv[1]), "/",
            {
                "/": {
                    "request.dispatch": cherrypy.dispatch.MethodDispatcher()
                }
            }
        )
        cherrypy.config.update({"server.socket_port": 8081})
        cherrypy.engine.start()
        cherrypy.engine.block()

if __name__ == '__main__':
    main()