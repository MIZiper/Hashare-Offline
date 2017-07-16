import cherrypy, sys, os, json, uuid

LISTFILE = "list.json"

@cherrypy.expose
class HsoPrivateServer(object):
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

	def GET(self, guid=None):
		# get /hso/ or get /hso/guid
		if guid is None:
			return json.dumps([
				{"guid": g, "name": n} for (g, n) in self.list.items()
			])
		else:
			if guid in self.list:
				with open(os.path.join(self.root, guid), mode='rb') as fp:
					return fp.read()
			else:
				cherrypy.response.status = 404

	def POST(self, name):
		# post /hso/ {name}
		guid = str(uuid.uuid4())
		assert guid not in self.list
		self.list[guid] = name
		self.flush()
		with open(os.path.join(self.root, guid), mode='w') as fp:
			fp.write("!MIZip/Hashare-Offline;0\r\n#|%s"%name)
		return guid

	def PUT(self, guid):
		# put /hso/guid {content}
		if guid in self.list:
			with open(os.path.join(self.root, guid), mode='wb') as fp:
				fp.write(cherrypy.request.body.read())
		else:
			cherrypy.response.status = 404

	def DELETE(self, guid):
		# delete /hso/guid
		if guid in self.list:
			del self.list[guid]
			self.flush()
			os.remove(os.path.join(self.root, guid))
		else:
			cherrypy.response.status = 404

def main():
	if len(sys.argv)>1 and os.path.isdir(sys.argv[1]):
		cherrypy.tree.mount(
			HsoPrivateServer(sys.argv[1]), "/",
			{
				"/": {
					"request.dispatch": cherrypy.dispatch.MethodDispatcher()
				}
			}
		)
		cherrypy.engine.start()
		cherrypy.engine.block()

if __name__ == '__main__':
	main()