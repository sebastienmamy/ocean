/** utilities for node services
 * @author sebastien.mamy@gmail.com
 * @since 2020-04-30 
 */


if(typeof global !== "undefined") require("./ocean.helper")
if(typeof global !== "undefined") require("./ocean.io")

/** helper for Item handling */
helper.static.Service = {}


/** initializes the service and loads the configuration
 * returns Service
 */
Service.Init = (basedir, scriptfile) => {
    Service.basedir = basedir
    Service.files = {}
    Service.files.script = scriptfile
    Service.name = Service.files.script.split("/").pop().slice(0, Service.files.script.split("/").pop().length - 3)
    Service.files.conf = Service.name + ".json"
    if(io.fileExists(io.path(basedir, Service.files.conf))) Service.conf = io.readJson(io.path(basedir, Service.files.conf))
    return Service
}


// const Express       = require("express");
// const BodyParser    = require("body-parser");
// const Helmet        = require("helmet");
// const http          = require("http");
// const https         = require("https");
// const fs            = require("fs");
// const path          = require("path");
// const xlsx          = require("xlsx");
// const crypto        = require("crypto");

// const Helper        = require("./oceans.helper");
// const Store         = require("./oceans.store");


// // init the root object for easy function calls
// let Server = {};



// // internal express server
// Server.$express = Express();
// Server.$express.use(BodyParser.json());
// Server.$express.use(BodyParser.urlencoded({extended: true}));
// Server.$express.use(Helmet());
// Server.$express.set('trust proxy', true);
// Server.$express.use(function allowCrossDomain(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });




// /// initializes the node server with the given excecution directory
// /// @returns        undefined
// /// @side-effects   file system
// ///
// Server.Init = (path) => 
// {
//     if(!Server.Exists(path)) Helper.Error("path does not exists", path);
//     let configuration = 
//     {
//         ...Server.ReadFile(Server.Path(path, "config.json")), servicedir: {id: "servicedir", value:path}
//     };
//     Store.$Lake = Server.Exists(configuration.datalake.path) ? Server.ReadFile(configuration.datalake.path) : Store.lake;
//     Helper.Log("TODO","replace _select with the proper reduce function");
//     // let preferences = _select((item) => item.name = "preferences");
//     Helper.Log("TODO","replace _new with the proper new function");        
//     // if(Helper.Size.int(preferences) === 0) preferences = _new({name: "preferences", ...configuration});
//     Helper.Log("TODO","replace _insert with the proper add function");        
//     // _insert(preferences, true);
// };


// /// lists recursivly all the files of a given directory
// /// @returns        array
// /// @side-effect    file system
// ///
// Server.ListFiles = (dir, rootDir = null) => 
// {
//     rootDir = rootDir === null ? Server.Path(dir) : rootDir;
//     let directory   = Server.Path(dir),
//         files       = fs.readdirSync(directory, { withFileTypes: true });    
//     let relativeDir = directory.split(rootDir)[1];        
//     return files.reduce((result, file) => 
//     {
//         let absolutePath = Server.Path(directory, file.name),
//             stats = fs.statSync(absolutePath);
//         if(file.isDirectory()) result = [...result, ...Server.ListFiles(absolutePath, rootDir)];
//         let details = { 
//             name:           file.name, 
//             absolutePath:   absolutePath,
//             extension:      file.name.substring(file.name.lastIndexOf(".") >= 0 ? file.name.lastIndexOf(".") : file.name.length, file.name.length),
//             type:           file.isDirectory() ? "directory" : "file", 
//             size:           file.isDirectory() ? 0 : (stats.size * stats.blksize/8) / 16384,
//             timestamp:      stats.mtimeMs,
//             rootDir:        rootDir,
//             relativeDir:    relativeDir,
//             hash:           crypto.
//                             createHash("sha512").
//                             update(file.isDirectory() ? absolutePath : Server.ReadFile(absolutePath)).digest("hex") 
//         };
//         return [ ...result,  details]; 
//     }, []);
// }



// /// tests if the file exists
// /// @returns        boolean
// /// @side-effect    file system
// Server.FileExists = (...path) => fs.existsSync(Server.Path(...path))



// /// canonify the path elements
// /// @returns        string
// /// @side-effect    file system
// Server.Path = (...pathelements) => path.resolve(pathelements.join(path.sep))



// /// creates a directory from path elements (recursive)
// /// @returns        string
// /// @side-effect file system
// ///
// Server.MakeDir = (...paths) => path.resolve(paths.join(path.sep)).split(path.sep).reduce(function(result, subpath) {result += path.sep + subpath;if(!Server.FileExists(result)) fs.mkdirSync(result);return result;})



// // read a excel workbook and format it into a json object of sheets
// // @side-effect file system
// // 
// Server.ReadExcel = (path) => 
// {
//     Helper.Log("TODO","replace _reduce with Array.reduce");
//     // return_reduce(xlsx.readFile(endpoint, {cellStyles: true}).sheets, (data, sheet, name) => ({...data, [name]: _reduce(xlsx.utils.sheet_to_json(data.Sheets[name]), (items, item) => ({...items, [item.id] : item}))}))
// }




// // writes an excel workbook 
// // @returns        xlsx book
// // @side-effect file system
// Server.WriteExcel = (data, endpoint) => 
// {
//     Helper.Log("TODO","replace _reduce with the Array.reduce")
//     // return _reduce(data, (out, sheet, name) => ({...out, SheetNames: [...out.SheetNames, name], Sheets: {...out.Sheets, [name]: xlsx.utils.json_to_sheet(sheet)}}), {...xlsx.utils.book_new(), SheetNames: [], Sheets: {}});
// }
// // {
//     // let excel = xlsx.utils.book_new();
//     // excel.SheetNames = [];
//     // excel.Sheets = {};
//     // let sheet = [];
//     // return 
//     // for(let name in data) {
//     //     excel.SheetNames.push(name);
//     //     excel.Sheets[name] = xlsx.utils.json_to_sheet(data[name]);
//     // }
//     // return excel;
// // }


// /// read a file and transform it into string
// /// @returns        string
// /// @side-effect    file system
// ///
// Server.ReadFile = (endpoint ="", encoding = "utf8") => !Server.FileExists(endpoint) ? Helper.Error("file does not exists", endpoint) : fs.readFileSync(endpoint, encoding);



// /// writes a file from a data
// /// @returns        status
// /// @side-effect    file system
// ///
// Server.WriteFile = (data, endpoint, encoding = "utf8") => 
// {
//     Server.MakeDir(endpoint.split(path.sep).slice(0,-1).join(path.sep));
//     switch((endpoint.split(".")[endpoint.split(".").length - 1]).toLowerCase()) {
//         case "xlsx":
//             return Server.WriteExcel(endpoint);
//         case "json":
//             return fs.writeFileSync(endpoint, Helper.Stringify.string(data), encoding);
//         case "txt":
//             return fs.writeFileSync(endpoint, data.join("\n"), encoding);
//         case "data":
//         case "html":
//         case "md":
//             return fs.writeFileSync(endpoint, data, encoding);
//         default:
//             Helper.Error("unknown file type error",endpoint, data);
//     }
// }

// // copy or overwrite src in dest
// // @returns         undefined
// // @side-effect     file system
// //
// Server.CopyFile = (src, dest) => !fs.copyFileSync(_path(src), _path(dest)) && console.log("copying " + src + " to " + dest);



// module.exports = Server;














    /** writes a file from the data in the given encoding and format */
    // static Write = (path, data, format, encoding, sheet) => {
    //     format = File.GetFormat(path, format);
    //     if(data !== undefined) switch(format) {
    //         case File.Format.Json:
    //         case File.Format.Text:
    //             FS.writeFileSync(path, Helper.Stringify(data), encoding);
    //             break;
    //         case File.Format.Excel:
    //             XLSX.writeFile(File.ToExcel(data, File.Read(path, format, encoding), sheet), path, {cellStyles: true});
    //             break;
    //         case File.Format.Plain:
    //             FS.writeFileSync(path, data, encoding);
    //             break;
    //         default:
    //             throw("unknown format " + format);
    //     }
    // }

    /** writes a file from the data in the given encoding and format */
    // static Append = (path, data, format, encoding) => {
    //     format = File.GetFormat(path, format);
    //     if(data !== undefined) switch(format) {
    //         case File.Format.Text:
    //         case File.Format.Plain:
    //             FS.appendFileSync(path, Helper.Stringify(data), encoding);
    //             break;
    //         case File.Format.Json:
    //         case File.Format.Excel:
    //             Helper.Throw("cannot append to file of format " + format);
    //             break;
    //         default:
    //             Helper.Throw("unknown format " + format);
    //     }
    // }

    /** parse a excel workbook */
    // static FromExcel(data, types = null) {
    //     let sheets = {};
    //     if(data !== null && data !== undefined && data.Sheets) 
    //         for(let name in data.Sheets) sheets[name] = XLSX.utils.sheet_to_json(data.Sheets[name]).map(item => type(item, {key:"string", type:"string", constraints:"array", description:"string", check:"function", error:"string", label:"string", store:"string"}));
    //     if(!sheets.data) sheets.data = [];
    //     return sheets;
    // }

    // /** generate an excel workbook */
    // static ToExcel(data, excel = null) {
    //     excel = excel === null ? XLSX.utils.book_new() : excel;
    //     excel.SheetNames = [];
    //     excel.Sheets = {};
    //     let sheet = [];
    //     data.forEach((item) => (sheet.push(Helper.UnType(item))));
    //     excel.SheetNames.push('data');
    //     excel.Sheets.data = XLSX.utils.json_to_sheet(sheet);
    //     Helper.UnderProgress("not tested");
    //     return excel;
    // }


    /** constructor */
    // constructor(format = File.Format.Plain, encoding = "utf8", ...path) {
    //     this.__path = File.Path(...path);
    //     this.__format = File.GetFormat(this.__path, format);
    //     this.__encoding = encoding;
    // }    
    

    /** list the files of extension in the directory (null means directory) */
    // list(extension = "*") {
    //     let filter =   extension === "*"  ? (dirent) => true :
    //                    extension === null ? (dirent) => dirent.isDirectory() :
    //                    (dirent) => dirent.name.toLowerCase().endsWith(extension.toLowerCase());
    //     return FS.readdirSync(this.path, { withFileTypes: true }).filter(filter).map(dirent => dirent.name);
    // }


    /** creates recursivly a directory if it does not exist */
    // createDir = ()  => this.path.split(File.Separator).reduce(function(result, subpath) {result += File.Separator + subpath;FS.mkdirSync(result);return result;});

// }

/** array that can be flushed */
// class PersistantArray {
// 
//     /** constructor */
//     constructor(persistance, pagesize = 100) {
//        this.__persistance = persistance;
//        this.__items = [];
//        this.__pagesize = pagesize;
//     }
// 
//     /** push data */
//     push(item) {
//         this.__items.push(item);
//         this.flush();
//     }
// 
//     /** flush the data when pagesize is reached or forced */
//     flush(force = false) {
//         let self = this;
//         if(force || this.__items.length > this.__pagesize) {
//             this.__persistance.append(this.__items.reduce((prev, curr) => prev + os.EOL + curr, "") + os.EOL);
//             this.items = [];
//         }
//     }
// 
// }











// TODO
//   - read the default configuration file
//   - read the data lake
//   - merge the configuration with the configuration item in the data lake





//      /** main class  */
//      class Server {
//      
//          // abstract async init();
//      
//          /** list of available methods */
//          // migrated
//          //  static Method = {GET: "GET", POST: "POST", HEAD: "HEAD", PATCH:"PATCH", DELETE: "DELETE"};
//          
//          /** data directory */
//          // migrated
//          // static DataDir = "data";
//      
//          /** return the datafile  */
//          // migrated
//          // dataFile = (filename) => File.Path(Server.DataDir, this.name + "." + filename);
//          
//         
//      
//      
//          
//          /** add a route providing the given http method for the model and dataset */
//          // migrated
//          // add = (method, path, data = undefined, filter = undefined) => {
//          //     let route = { path: this.configuration.base_path + path, data: data, method: method};
//          //     if(typeof filter === "string") route.type = filter;
//          //     else route.filter = filter;
//          //     this.model.route.push(route);
//          // }
//       
//          /** add a get http method to the API, according to the path and triggering the action. The get method returns the relevant json and HTTP status code returning an {status, body} object */
//          // migrated
//          // async addRoute(method = Server.Method.GET, path, action) {
//          //     let self = this;
//          //     console.log(datetime() + " Mounting " + method + " route " + path + " [OK]");
//          //     switch(method) {
//          //         case Server.Method.GET:
//          //             this.app.get(path, async (req, $res) => self.send(await action(req), req, $res));
//          //             break;
//          //         case Server.Method.POST:
//          //             this.app.post(path, async function(req, $res) { 
//          //                 let res = await action(req);
//          //                 $res.status(res.status).json(stringify(res.body));
//          //             });
//          //             break;
//          //         default:
//          //             Event.Error("not implemented http method: " + method).throw();
//          //     }
//          // }
//       
//          /** sends an event back to the HTTP caller */
//          // skipped
//          // send = (event, httpRequest, httpResponse) => {
//          //     this.logger.log(event);      
//          //     httpRequest.__session.event = event;
//          //     httpRequest.__session.active = false;
//          //     httpResponse.status(event.status).json(this.model.reduce(event));
//          // }
//      
//          
//      
//          /**  starts the server on the given port */
//          async start() {
//              let self = this;
//              
//              // migrated
//              // self.model          = new Model("services", this.name , "/model.xlsx");
//              // migrated
//              // self.configuration  = merge(require("../" + this.name + "/config.json"), (new File(File.Format.JSON, "utf8", this.dataFile("config.json"))).read());
//              
//              _out(self.configuration);
//              self.logger         = new Logger(self.configuration.log.levels, self.configuration.log.path);
//              
//              // migrated
//              // self.app.use("*", (req, res, next) => { 
//              //     let stop = false, userId = "anonymous@ocean-solutions.fr", password = null;
//              //     req.__session   = self.model.session.push({ event: Event.HttpEvent(true, req), active: true });
//              //     if(req.headers.authorization && req.headers.authorization.indexOf("Basic") >= 0) {
//              //         const credentials = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString('ascii').split(':');
//              //         userId = credentials[0];
//              //         password = credentials[1];
//              //     }
//              //     let user = self.model.user.indexes("key")[userId][0];
//              //     if(user === undefined) self.send(new Event("User unknown " + userId, 401), req, res);
//              //     else if(user.password !== password) {
//              //         debug(user, user["password"], password, user.password !== password);
//              //         self.send(new Event("Wrong credentials", 401), req, res);
//              //     }
//              //     else {
//              //         req.__user = user;
//              //         req.__user.groups = [];
//              //         req.__user.reads = {};
//              //         req.__user.types = [];
//              //         req.__user.groupIds.forEach((groupId) => {
//              //             let group = self.model.group.get(groupId, "key")[0];
//              //             req.__user.groups.push(group);
//              //             group.reads.forEach((field) => {
//              //                 let keys = field.split(".");
//              //                 req.__user.reads[keys[0]] = req.__user.reads[keys[0]] ? req.__user.reads[keys[0]] : [];
//              //                 if(!req.__user.reads[keys[0]].includes(keys[1])) req.__user.reads[keys[0]].push(keys[1]);
//              //                 if(!req.__user.types.includes(keys[0])) req.__user.types.push(keys[0]);
//              //             });                    
//              //         });           
//              //         req.__user.sessions.push(req.__session);            
//              //         self.logger.log(req.__session.event);
//              //         next();
//              //     }
//              // });
//               
//              
//              // migrated
//              // process.on('SIGINT', function() { self.logger.flush(); self.model.flush(true);console.log(": exiting...\n" + datetime() + " Shut down Http(s) Servers\n\nhttp://ocean-solutions.fr © Oceans 2020");process.exit();});
//              
//      
//      
//      
//      
//      
//              self.add(Server.Method.GET,     "types",     this.model.getTypes(), null);
//              self.add(Server.Method.GET,     "routes",    this.model.route.items, "route");
//              debug("TODO","Fix the issue with /routes/:id path -> select is not working");
//              self.add(Server.Method.GET,     "users",     this.model.user.items,  "user");
//              self.add(Server.Method.POST,    "users",     null, "user");
//              self.add(Server.Method.GET,     "sessions",  this.model.session.items, "session");
//              self.add(Server.Method.GET,     "groups",    this.model.group.items, "group");
//      
//      
//              await self.init();
//              
//              this.model.route.forEach(async (route) => {             
//                  switch(route.method) {
//                      case Server.Method.POST:
//                          await this.addRoute(route.method, route.path, (req) => new Event("debug", 200, req.body));
//                          break;
//                      case Server.Method.GET:                    
//                          await this.addRoute(route.method, route.path, (req) => {
//                              if(route.type !== undefined && !req.__user.types.includes(route.type)) return new Event("access denied to objects " + route.type , 403);
//                              return new Event("success", 200, select(route.data, route.filter !== undefined ? route.filter : req.__user.reads[route.__type]));
//                          });
//                          await this.addRoute(route.method, route.path + "/:id", (req) => {
//                              if(route.type !== undefined && !req.__user.types.includes(route.type)) return new Event("access denied to objects " + route.type , 403);
//                              if(route.data[req.params.id] === undefined) return new Event("id " + req.params.id, 404);
//                              // debug(req.params.id,route.data[req.params.id] );
//                              return new Event("success", 200, filter(route.data[req.params.id], route.filter !== undefined ? route.filter : req.__user.reads[route.__type]));
//                          });
//                          break;
//                      default:
//                          await this.addRoute(route.method, route.path, (req) => new Event("unknown HTTP method " + route.method, 500,  (new Error()).stack));
//                  }
//                  
//                  
//                  // await this.addRoute(route.method, route.path, (req) => { 
//                  //     switch(route.method) {
//                  //         case Server.Method.POST:
//                  //             return new Event("debug", 200, req.body);
//                  //         case Server.Method.GET:
//                  //             if(route.type !== undefined && !req.__user.types.includes(route.type)) return new Event("access denied to objects " + route.type , 403);
//                  //             return new Event("success", 200, select(route.data, route.filter !== undefined ? route.filter : req.__user.reads[route.__type]));
//                  //         default:
//                  //             return new Event("unknown HTTP method " + route.method, 500,  (new Error()).stack);
//                  //     }
//                  // }); 
//              });
//      
//      
//              // BEGIN: migrated
//              
//              // for(let key in this.configuration.public_dirs) {
//              //     console.log(datetime() + " Mounting STATIC route " + key + " pointing to " + this.configuration.public_dirs[key] + " [OK]");
//              //     this.app.use(key, Express.static(this.configuration.public_dirs[key]));
//              // }
//              // 
//              // https.createServer({
//              //     key     : new File(File.Format.Binary, "binary", this.configuration.https_key).read(),
//              //     cert    : new File(File.Format.Binary, "binary", this.configuration.https_cert).read()
//              // },this.app).listen(self.configuration.port_https, () => { console.log(datetime() + " Https Server listening on " + self.configuration.port_https)}).on('error', function(err) {
//              //     console.log('error listening on ' + self.configuration.port_https + ': ' + err.code + '\n\nexiting...\n');
//              //     process.exit(0);
//              // });
//              // 
//              // http.createServer(function(req, res) {
//              //     let server = req.headers['host'].split(":");
//              //     res.writeHead(301, { "Location": "https://" + self.configuration.server + ":" +  self.configuration.port_https + req.url });
//      	    //     res.end();
//              // }).listen(self.configuration.port_http, () => { console.log(datetime() + " Http Server redirects " + self.configuration.port_http + " on " + self.configuration.port_https)}).on('error', function(err) {
//              //     console.log('error listening on ' + self.configuration.port_http + ': ' + err.code + '\n\nexiting...\n')
//              //     process.exit(0);
//              // });
//      
//              // END:migrated
//          }
//      
//       }
//      
//      
//       // make available for node.js
//      module.exports = {Server : Server};