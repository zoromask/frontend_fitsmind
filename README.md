 ## ** System Requirement ** ##
 * Apache 2.4/IIS 7/Nginix
 * NodeJS 4+

## ** Installation ** ##
 * Run command ``` npm install -g gulp ``` to setup streaming build system.
 * Run command ``` npm install ``` to setup all plugins that needle for application (require internet)
 * After all plugins is installed, please clone file **config.js** from *config/config.js.prod* and run command ``` gulp build ``` to compile and minify application.
 * After application is minified, create symbolic link or copy the directory *dist/* to the Web Directory on your server and setup the virtual host.