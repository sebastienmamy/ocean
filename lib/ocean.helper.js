/**  commons functions usable on server or client side
 * @author sebastien.mamy@gmail.com
 * @update 2021-12-09
 */

const hash = typeof global !== "undefined" ? require("hash36") : undefined

/** module object */
let helper = {
    silent: false,
    RANDOM_BASE: "ABCDEF1234567890",
    Color: {
        Reset: "\x1b[0m",
        Bright: "\x1b[1m",
        Dim: "\x1b[2m",
        Underscore: "\x1b[4m",
        Blink: "\x1b[5m",
        Reverse: "\x1b[7m",
        Hidden: "\x1b[8m",
        
        FgBlack: "\x1b[30m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m",
        FgMagenta: "\x1b[35m",
        FgCyan: "\x1b[36m",
        FgWhite: "\x1b[37m",
        
        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m"
    }
}


/** test an assertion and throw an exception in case of failure 
 * @return undefined
 */
helper.assert = (test, message = null) => test ? "" : helper.exception("assertion failed" + (message === null ? "" : ": " + message))



/**  cleans a string of double quotes and wrong CRLF
 * @return string 
 */
helper.clean = (str) => typeof str  !== "string" ? null : str.replace(/\n/g,"").replace(/\\n/g,"").split("\\\"").join("\"").replace( / +/g, ' ' ).trim()



/** returns the context of the runtime (window or global)
 * @return object 
 */
helper.context = () => typeof(window) === "undefined" ? global : window
helper.static = typeof(window) === "undefined" ? global : window


/** clone an object
 * @return object
 */
helper.clone = (object) => {
    helper.assert(typeof object === "object", "only objects can be cloned")
    return typeof structuredClone !== "undefined" ? structuredClone(object) : Object.assign({}, object)
}


/** returns the current date in EN, FR or US format 
 * @return string 
 */ 
helper.date = (separator = "-", format = "FR", date = null, time = false) => {
    date = date === null ? new Date() : new Date(date)
    let suffix = time ? [
        String(date.getUTCHours()).padStart(2,"0"),
        String(date.getMinutes()).padStart(2,"0"),
        String(date.getSeconds()).padStart(2,"0"), 
        String(date.getMilliseconds()).padStart(3,"0")].join(separator) : ""; 
    return typeof separator  !== "string" || typeof format !== "string" ? helper.error("wrong parameter types", ...arguments) :
        format === "US" ? [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join(separator) + suffix :
        format === "EN" ? [String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0"),date.getFullYear()].join(separator) + suffix : 
        format === "FR" ? [String(date.getDate()).padStart(2,"0"), String(date.getMonth()+1).padStart(2,"0"), date.getFullYear()].join(separator) + suffix :
        helper.error("unknow format", ...arguments)
}


/** log an error message to the console
 * @return undefined 
 */
helper.error = (...values) => helper.log("error", ...values)



/** throw an exception or log a fatal error to a log
 * @return undefined 
 */
helper.exception = (message = null, ...values) => {
    console.log("in exception", message)
    const outType = " " + helper.Color.BgRed + "[EXCEPTION]" + helper.Color.Reset + " "
    let error = typeof Error === "undefined" ? "" : (new Error()).stack.split("\n")[3]
    if(error !== "" && error.indexOf("(") >= 0) error = error.split("(")[1].split(")")[0].trim()
    console.log(helper.date() + " " + helper.time() + outType + ("undefined" !== typeof window ? "" : error), message, ...values)
    if(error !== "") console.log((new Error()).stack.split("\n").slice(1).join("\n"))
    if(typeof process !== "undefined") process.exit(-1)
}


/** create a 26 chars hash
 * @return string 
 */
helper.hash = (st, separator = "") => typeof hash !== "undefined" ? [...hash.md5(helper.stringify(st)).toUpperCase()].map((d, i) => (i) % 4 === 0 && i > 0 ? separator + d : d).join("").trim() : undefined



/** log an info message to the console
 * @return undefined 
 */
helper.info = (...values) => helper.log("info", ...values)



/** intersection of 2 arrays
 * @return array 
 */
helper.intersect = (ar1, ar2 = "__unduplicate") => ar1.reduce((result, item) => {
    if(result.indexOf(item) === -1 && (ar2 === "__unduplicate" || ar2.indexOf(item) >= 0)) result.push(item)
    return result
},[])



/** check if an object is circular
 * @return boolean
 */
helper.isCircular = (object, seen = null) => {
    if(typeof object !== "object") return false
    seen = seen || new WeakSet()
    if(seen.has(object)) return true
    seen.add(object)
    for(const key in object) if(helper.isCircular(object[key], seen)) return true
    return false
}


/** log to the console the values, with a time stamped invite of type
 * @return undefined 
 */
helper.log = (type, ...values) => {
    if(helper.silent) return
    const outType = " " + (
        type === "error" || type === "failure" ? helper.Color.BgRed + "[" + type.toUpperCase() + "]" :
        type === "success" ? helper.Color.BgGreen + "[SUCCESS]" :
        type === "info" ? helper.Color.BgCyan + "[INFO]" :
        type === "skipped" ? helper.Color.BgWhite + "[SKIPPED]" :
        helper.Color.BgYellow + "[" + type.toUpperCase() + "]") 
        + helper.Color.Reset + " "
    let error = typeof Error !== "undefined" ? (new Error()).stack.split("\n")[3] : ""
    if(error.indexOf("(") >= 0) error = error.split("(")[1].split(")")[0].trim()
    console.log(helper.date() + " " + helper.time() + outType +  ("undefined" !== typeof window ? "" : error), 
        ...values.map(
            (value) => typeof value === "string" ? value : typeof value === "object" ? (
                typeof window !== "undefined" ? (
                    Object.keys(value).reduce(
                        (result, key) => (
                            typeof value[key] === "function" ? result : {...result, [key]: value[key]}),{}
                    )
                ) : helper.stringify(value)
            ): value))
    if(type === "debug" && typeof Error !== "undefined") console.log((new Error()).stack.split("\n").slice(1).join("\n"))
}


/** apply a function to all the item of an item collection
 * @return any
 */
helper.map = (items, func) => {
    helper.assert(Array.isArray(items) || (items !== null && typeof items === "object"))
    if(Array.isArray(items)) return items.map(func)
    let result = {}
    for(let key in items) result[key] = func(items[key])
    return result
}


/** merge of 2 arrays without duplicates
 * @return array 
 */
helper.merge = (array1, array2) => {
    helper.assert(Array.isArray(array1) && Array.isArray(array2))
    let result = []
    for(let value of array1) helper.push(result, value)
    for(let value of array2) helper.push(result, value)
    return result
}


/** transform an array into an object 
 * @return object
 */
helper.objectify = (item) => {
    helper.assert(Array.isArray(item) || typeof item === "object" && item !== null, "cannot objectify non-collection values")
    if(Array.isArray(item)) {
        let result = {}
        for(let i = 0; i < item.length; i++) result[i] = item [i]
        return result
    }    
    return item
}


/** returns a offset-th page of the item properties
 * @return object 
 */
helper.paginate = (item, offset, size) => Object.keys(item).slice(offset).slice(0, size).reduce((page, id) => ({...page, [id]: item[id]}), {})



/** returns the percentage of value over total
 * @return string 
 */ 
helper.percent = (value, total) => {
    return  (typeof value !== "number" || typeof total !== "number" || total === 0) ? NaN : 
            value / total < 0.0001 ? "00.00" : 
            value >= total  ? (((value * 10000) / total)/100).toFixed(1) : 
            ""+ (((value * 10000) / total)/100).toFixed(2).padStart(5,"0")
}


/** push a property value in a property key, avoiding duplicate and returns the position in the set
 * @return int|string 
 */
helper.push = (item, value = null, key = null) => {
    helper.assert(Array.isArray(item) || (item !==null && typeof item === "object"))
    if(key === null && item.indexOf(value) === -1) return item.push(value) - 1
    if(key === null) return item.indexOf(value)
    item[key] = value
    return key
}


/** create a rand string of length character
  * @return string 
  */
helper.random = (length = 4, randombase = helper.RANDOM_BASE) => length === 0 ? "" : randombase.charAt(Math.floor(Math.random() * randombase.length)) + helper.random(length - 1, randombase)



/** reduce an object or an array according to an include function, and limiting to a subset of properties ({a:true, b:false,c: true),["a","b"],(v) => v) => {a:true}
  * @return any
  */
helper.reduce = (items, func, init) => {
    helper.assert(Array.isArray(items) || (items !==null && typeof items === "object"))
    if(Array.isArray(items)) return items.reduce(func, init ?? [])
    return Object.values(items).reduce(func, init ?? {})
}


/** register a model to the current context
 * @return undefined
 */
helper.register = (name, obj = {}) => {
    if(helper.context()[name]) helper.wargning("context." + name + " is already registered")
    helper.context()[name] = obj
}


/** randomly shuffle an array (shuffle the input array)
 * @return array
 */ 
helper.shuffle = (arr) => {
    helper.assert(Array.isArray(arr),"arr must be an array",...arr)
    let ar = arr.slice()
    for (var _i = ar.length - 1; _i > 0; _i--) {
        var _j = ~~(Math.random() * (_i + 1))
        var _temp = ar[_i]
        ar[_i] = ar[_j]
        ar[_j] = _temp
    }
    return ar
}


/** returns the size of the object (NaN if the object cannot be sized)
 * @return int
 */
helper.size = (item = null) => typeof item === "function" || item === null ? 0 : item.length ? item.length : "object" === typeof item ? Object.keys(item).length : ["boolean","symbol"].includes(typeof item) ? 1 : ["number","bigint"].includes(typeof item) ? item : "function" === typeof item ? NaN : 0



/** sort item (null: key name, "__value__":stringify of items, any: per stringify of item[prop]
 * @return array
 */
helper.sort = (items, prop = null, asc = true) => { 
    helper.assert(Array.isArray(items) || (items !== null && typeof items === "object"), "items must be a collection - array or object")
    let result = Array.isArray(items) ? [...items] : items
    if(!Array.isArray(items)) return helper.sort(Object.values(items), prop, asc)
    if(Array.isArray(items) && prop === null) result.sort((item1, item2) => helper.stringify(item1) < helper.stringify(item2) ? (asc ? -1 : 1) : (asc ? 1 : -1))
    if(Array.isArray(items) && prop !== null) result.sort((item1, item2) => !item1[prop] && !item2[prop] ? 0 : item1?.[prop] < item2?.[prop] ? (asc ? -1 : 1) : (asc ? 1 : -1))
    return result
}


/** stringify an object, even with circular reference
 * @return string
 */
helper.stringify = (item) => {
    if(item === undefined) return "undefined"
    if(item === null) return "null"
    if(typeof item === "function") return item
    if(helper.size(item) === 0 || isNaN(helper.size(item))) return JSON.stringify(item)
    if(Array.isArray(item)) return "[" + (helper.reduce(item, (result, value) => result + "," + helper.stringify(value), "")).substring(1) + "]"
    if(typeof item !== "object") return String(item)
    if(!helper.isCircular(item)) return JSON.stringify(item)
    const getCircularReplacer = function() {
        const seen = new WeakSet()
        return function(key, value) {
            if(typeof value === "object" && value !== null) {
                if(seen.has(value)) return value.__id ? "@" + value.__id : "[circular reference]"
                seen.add(value)
            }
            return value
        };
    };
    return helper.clean(JSON.stringify(item, getCircularReplacer()))
}


/** returns the current time in hh[:]mm[:]ss, or the time converted from the number of seconds
 * @return string
 */
helper.test = (module, name, expected = "__skip", ...params) => {
    let result = expected === "__skip" ? "" : helper.context()[module][name](...params)
    result = typeof result === "string" ? result : helper.stringify(result)
    expected = typeof expected === "string" ? expected : helper.stringify(expected)
    helper.test[module] = helper.test[module] ?? {}
    helper.test[module][name] = helper.test[module][name] ?? {tests:0, skipped:0, failure:0, success:0}
    helper.test[module][name]["tests"]++
    let status = expected === "__skip" ? "skipped" : result === expected ? "success" : "failure"
    helper.test[module][name][status]++
    let message = module + ":" + name + "(" + params.join(",") + ")"
    if(helper.test.level && ((helper.test.level === 3 && status === "failure") || helper.test.level > 3)) helper.log(status, message, status === "failure" ? "expected: " + expected : "", status === "failure" ? "found: " + result : "")
}


/** returns the current time in hh[:]mm[:]ss, or the time converted from the number of seconds
 * @return string
 */
 helper.testClass = (className, functionName, expected = "__skip", ...params) => {
    let result = expected === "__skip" ? "" : helper.context()[module][name](...params)
    result = typeof result === "string" ? result : helper.stringify(result)
    expected = typeof expected === "string" ? expected : helper.stringify(expected)
    helper.test[module] = helper.test[module] ?? {}
    helper.test[module][name] = helper.test[module][name] ?? {tests:0, skipped:0, failure:0, success:0}
    helper.test[module][name]["tests"]++
    let status = expected === "__skip" ? "skipped" : result === expected ? "success" : "failure"
    helper.test[module][name][status]++
    let message = module + ":" + name + "(" + params.join(",") + ")"
    if(helper.test.level && ((helper.test.level === 3 && status === "failure") || helper.test.level > 3)) helper.log(status, message, status === "failure" ? "expected: " + expected : "", status === "failure" ? "found: " + result : "")
}


/** display the result of a uni test campaign 
 * @return undefined
 */
helper.test.log = () => {
    let output = []
    let totals = {tests:0, skipped:0, failure:0, success:0, modules: 0, functions: 0}
    console.log(helper.Color.Reverse + "\n                               \n   --- UNIT TEST RESULTS ---   \n                               " + helper.Color.Reset)
    for(let module in helper.test) {
        if(Array.isArray(helper.test[module]) || typeof helper.test[module] !== "object") continue
        totals.modules++
        let result = helper.reduce(helper.test[module], (res, test_res) => {
            res.tests += test_res.tests
            res.skipped += test_res.skipped
            res.failure += test_res.failure
            res.success += test_res.success
            res.functions++
            return res
        }, {tests:0, skipped:0, failure:0, success:0, functions: 0})
        totals.tests += result.tests
        totals.skipped += result.skipped
        totals.failure += result.failure
        totals.success += result.success
        totals.functions += result.functions
        let success = helper.percent(result.success, result.tests - result.skipped)
        let sucvalue = Number.parseInt(success)
        let color = sucvalue === 100 ? helper.Color.BgGreen : sucvalue > 50 ? helper.Color.BgBlue : helper.Color.BgRed
        if(!helper.test.level || helper.test.level >= 1) output.push("\n" + helper.Color.Bright + "module " + module + " (" + result.functions + " functions, " + result.skipped + " skipped):" + helper.Color.Reset + "  " + result.tests + " tests, " + color + success + "%" + helper.Color.Reset + " success")
        if(helper.test.level && helper.test.level >= 2) for(let func in helper.test[module]) {
            let fres = helper.test[module][func]
            let fsuccess = helper.percent(fres.success, fres.tests - fres.skipped)
            let fsucvalue = Number.parseInt(fsuccess)
            let fcolor = fsucvalue === 100 ? helper.Color.BgGreen : fsucvalue > 50 ? helper.Color.BgBlue : fres.tests === fres.skipped ? helper.Color.BgBlack : helper.Color.BgRed
            output.push("    - " + (func + "()").padEnd(30," ") + (fres.skipped === 0 ? (fcolor + (fsuccess + "%").padStart(6," ")  + helper.Color.Reset + " success" + " of " + fres.tests + " tests"): "skipped"))
        }
    }
    let tsuc = helper.percent(totals.success, totals.tests - totals.skipped)
    let tsucvalue = Number.parseInt(tsuc)
    let tcolor = tsucvalue === 100 ? helper.Color.BgGreen : tsucvalue > 50 ? helper.Color.BgBlue : helper.Color.BgRed
    console.log("\n-------------------------------\n  " + totals.tests + " tests\n  " + totals.functions + " functions of " + totals.modules + " modules")
    console.log("  " + tcolor + tsuc + "%" + helper.Color.Reset + " success\n  " + totals.skipped + " skipped functions\n-------------------------------")
    for(let line of output) console.log(line)
}


/** returns the current time in hh[:]mm[:]ss, or the time converted from the number of seconds
 * @return string
 */
 helper.time = (separator= ":", duration = -1) => {
    return duration === 0 ? ["00","00","00"].join(separator) : duration < 0 ? [String(new Date().getHours() - 1).padStart(2, "0"), String(new Date().getMinutes()).padStart(2, "0"), String(new Date().getSeconds()).padStart(2, "0")].join(separator) : [String(new Date(duration * 1000).getHours() - 1).padStart(2, "0"), String(new Date(duration * 1000).getMinutes()).padStart(2, "0"), String(new Date(duration * 1000).getSeconds()).padStart(2, "0")].join(separator)
}


/** log an info message to the console
 * @return undefined
 */
helper.todo = (...values) => helper.log("todo", ...values)



/** update the name of the keys of an object
 * @return object
 */
helper.updateKeys = (obj, old_keys = null, new_keys = null) => {
    helper.assert(old_keys !== null && new_keys !== null && old_keys.length === new_keys.length)
    let result = {}
    for(const key in obj) result[old_keys.indexOf(key) >= 0 ? new_keys[old_keys.indexOf(key)] : key] = obj[key]
    return result
}


/** log a warning
  * @return undefined
  */
helper.warning = (...values) => helper.log("wargning", ...values)







/** add helper function and property to the global or window object */
helper.reduce(helper, (out, key) => { helper.context().helper = {...helper} })
helper.context().assert = console.assert
helper.static.a = {}





