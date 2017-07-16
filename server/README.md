#Private FileServer

##Origin
I have a raspberry pi and use it as tiny samba file server.
Why not store the tables (hopefully hso.zip in the future) in RPi, so can be shared among browsers and devices!
##Status
Currently, the js code only fetch resources from the same host of Hashare-Offline. Only one private server and cannot add more address. (I can't place the entries in hso.mizip.net, which I'll use when not at home.)
##Deploy
Take my RPi as example, I use nginx to host the Hashare-Offline.
Add a rule in nginx configuration:

location /hso/ {
    proxy_pass http://localhost:8080/;
}

then start the python script with target dir to store table files:

nohup python3 path/to/hso-private-server.py path/to/storage/dir > path/to/storage/dir/server.log &