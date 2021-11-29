import cherry, sys, os, json, uuid

LISTFILE = "list.json"

@cherry.expose
class HsoPublicServer(object):
    def __init__(self, root):
        pass

    def GET(self, guid=None):
        # get /hso/public/ or get /hso/public/guid
        # [{name, public guid, description}] or {content}
        pass

class HsoPublikServer(object):
    def __init__(self, root):
        pass

    def GET(self, guid):
        # get /hso/publik/{guid} {#psd?}
        # {content}
        pass

    def DELETE(self, guid):
        # delete /hso/publik/{guid} {#psd}
        pass

    def PUT(self, guid):
        # put /hso/publik/{guid} {#psd, content}
        pass

    def POST(self, name):
        # post /hso/publik/ {name, psd, description, contact?}
        # generate 'guid and public guid'
        # {guid}
        pass

def main():
    if len(sys.argv)>1 and os.path.isdir(sys.argv[1]):
        cherry.tree.mount(
            HsoPublicServer(sys.argv[1]), "/public",
            {
                "/": {
                    "request.dispatch": cherry.dispatch.MethodDispatcher()
                }
            }
        )
        cherry.tree.mount(
            HsoPublikServer(sys.argv[1]), "/publik",
            {
                "/": {
                    "request.dispatch": cherry.dispatch.MethodDispatcher()
                }
            }
        )
        cherry.engine.start()
        cherry.engine.block()

if __name__ == '__main__':
    main()