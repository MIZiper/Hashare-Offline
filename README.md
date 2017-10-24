# Hashare-Offline

## 浏览器支持
IE 10+, Chrome, FireFox, Chrome for Android, FireFox for Android, IE 11 for WP8.1 (IE 10 for WP8 未测试)
## 如何使用
* 获取本地文件后，直接使用浏览器打开index.html即可使用。（IE本地打开不支持indexedDB，推荐使用Chrome）
* 或者将文件放置于静态Web服务器中，注册OneDrive开发服务，并添加重定向链接，修改Setting.js中的client_id，即可支持使用OneDrive同步。
* 详细使用请参阅<http://blog.mizip.net/hashare-howto>（暂时不可访问）

## Browser Support
IE 10+, Chrome, FireFox, Chrome for Android, FireFox for Android, IE 11 for WP8.1 (untested on IE 10 for WP8)
## HowTo
* Store all files on local storage, and open "index.html" using browser directly. (IE restrict indexedDB on local files, so open with Chrome)
* Or put the files on your static web server. Register an OneDrive dev account and set the redirect URI, then replace the "client_id" in "Setting.js" to yours, and you're able to use OneDrive to sync Tables manually using your AppDir.
* Refer to <http://blog.mizip.net/hashare-howto-en> for detail usage. (Currently unavailable)
* Add "?lang=en" for the first time to access English prompted page.
