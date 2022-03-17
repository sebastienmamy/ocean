/** all input/output related functions (side-effect functions)
 * @author sebastien.mamy@gmail.com
 * @since 2021-01-28
 */ 

// const assert = require("assert")
const fs = require("fs")
const path = require("path")
// const parse = require("csv-parse/sync").parse

require("./ocean.helper")


/** module object */
helper.register("io", {
    sep: path.sep
})


/** read a file and transform it into string
 * @return string
 */
io.readFile = (endpoint ="", encoding = "utf8") => {
    return !io.fileExists(endpoint) ? helper.log("ERROR", "file does not exists", endpoint) : fs.readFileSync(endpoint, encoding)
}


/** reads a json file
 * @return object
 */
io.readJson = (endpoint = "") => {
    return !io.fileExists(endpoint) ? {} : JSON.parse(io.readFile(endpoint))
}


/** reads a csv file
 * @return array
 */
io.readCsv = (endpoint = "", columns = false, delimiter = ";", headers = null, line_number = false) => {
    const records = parse(io.readFile(endpoint), {
        columns,
        skip_empty_lines: true,
        delimiter
    })
    let results = []
    if(headers !== null) for(let i = 0; i < records.length; i++) {
        let record = line_number ? {line: i + 1} : {}
        for(let j = 0; j < headers.length; j++) if(headers[j] !== null) record[headers[j]] = records[i][j]
        results.push(record)
    } 
    if(headers === null) for(let i = 0; i < records.length; i++) results.push(line_number ? {...records[i], line: i+1 } : {...records[i]})
    return results
}


/* tests if the file exists
 */
io.fileExists = (...path_elements) => fs.existsSync(io.path(...path_elements))


/* canonify the path elements
 */ 
io.path = (...path_elements) => path.resolve(path_elements.join(path.sep))


/* creates a directory from path elements (recursive)
 */
io.makeDir = (...path_elements) => path.resolve(path_elements.join(path.sep)).split(path.sep).reduce(function(result, subpath) {
    result += path.sep + subpath
    if(!io.fileExists(result)) fs.mkdirSync(result)
    return result
})

/* writes a file from a data
 */
io.write = (data, endpoint, encoding = "utf8") => {
    io.makeDir(endpoint.split(path.sep).slice(0,-1).join(path.sep))
    switch((endpoint.split(".")[endpoint.split(".").length - 1]).toLowerCase()) {
        case "json":
            return fs.writeFileSync(endpoint, JSON.stringify(data), encoding)
        case "txt":
            return fs.writeFileSync(endpoint, data.join("\n"), encoding)
        case "data":
        case "html":
        case "htm":
        case "md":
            return fs.writeFileSync(endpoint, data, encoding)
        default:
            _exception("unknown file type error", endpoint, data)
    }
}

/* copy or overwrite src in dest
 */
io.copyFile = (src, dest) => fs.copyFileSync(io.path(src), io.path(dest))


/** delete a file
 * @return undefined
 */
io.Delete = (filePath) => fs.unlinkSync(filePath)


/** apply a function to all file of a directory
 */
io.reduce = (dir, func, extension = "*") => {
    for(let file of fs.readdirSync(dir)) if(extension === "*" || extension === path.extname(file)) func(file)
}

/**list of the files of a directory {path: string, options: F | D }
 */
io.ls = (params) => !params?.path ? null :
    params?.options === "D" ? fs.readdirSync(params.path, { withFileTypes: true }).filter(dirent => dirent.isDirectory()).map(dirent => dirent.name) :
    params?.options === "F" ? fs.readdirSync(params.path, { withFileTypes: true }).filter(dirent => !dirent.isDirectory()).map(dirent => dirent.name) : 
    fs.readdirSync(params.path, { withFileTypes: true }).map(dirent => dirent.name)

/* list all the file recursivly, and apply a filter if needed 
 */
io.list = function(dirPath, arrayOfFiles, filter = (path) => true) {
    files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
    files.forEach((file) => {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) arrayOfFiles = io.list(dirPath + "/" + file, arrayOfFiles, filter)
      else if(filter(dirPath + "/" + file)) arrayOfFiles.push(dirPath + "/" + file)
    })
    return arrayOfFiles
}

/** checks if a path is a directory
 */
io.isDirectory = (path) => fs.lstatSync(path).isDirectory()


/** count the files of a given path, recursivly or not
 */
io.countFiles = (params) => {
    if(!params?.path)           return 0
    let count =                 fs.readdirSync(params?.path).filter(dirent => !io.isDirectory(params.path + io.sep + dirent)).length
    if(params?.options !== "R") return count
    return                      fs.readdirSync(params?.path).filter(dirent => io.isDirectory(params.path + io.sep + dirent)).reduce((out, dirent) => out + io.countFiles({path: params.path + io.sep + dirent, options: params.options}), count)
}
