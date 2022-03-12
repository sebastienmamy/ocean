/**  commons functions usable on server or client side
 * using the item model: {__content: object, __status: success|error|exception}
 * @author sebastien.mamy@gmail.com
 * @update 2021-12-09
 */

if(typeof hash === "undefined") helper.context().hash = typeof global !== "undefined" ? require("hash36") : undefined
if(typeof global !== "undefined") require("./ocean.store")

/** item model 
 * @return item
 */
class Item {

    /** latest timestamped used */
    static lastTimestamp = 0

    /** create a new instance, duplicating existing item or creating one
     * @return Item
     */
    constructor(content = null) {
        assert(content === null || typeof content === "object", "content must be null or an object")
        this.__status = content?.__status || "success"
        this.__id = content?.__id || null
        this.__model = content?.__model || "Item"
        if(this.__id === null) {
            this.__id = Date.now()
            while(this.__id <= Item.lastTimestamp) this.__id = Date.now()
            Item.lastTimestamp = this.__id
            this.__id = Number(this.__id).toString(36).toUpperCase().padStart(12,"0")
            this.__id = [this.__id.substr(0,4),this.__id.substr(4,4), this.__id.substr(8)].join("-")
        }
        if(content !== null) for(const prop in content) this.Set(prop, content[prop])
    }


    /** create an Item from a string 
     * @return Item
     */
    static FromString(content) {
        helper.assert(typeof content === "string", "cannot parse an Item from a non-string value")
        return new Item(JSON.parse(content))
    }


    /** set a property of the content, in case the content is an object 
     * @return Item
     */
    Set = (path, value = null, obj = null) => {
        // helper.todo("save the previous value of the property")
        if(value === null) return this
        path = Array.isArray(path) ? path : path.split(".")
        obj = obj === null ? this : obj
        helper.assert(path.length > 0, "cannot set a sub property without a path") 
        helper.assert((Array.isArray(obj) && path[0] === "*") || (typeof obj === "object" && path[0] !== "*"), "cannot set a value to a non-array/non-object: " + helper.stringify(obj))
        if(this.__status !== "success") return this
        if(path.length === 1 && path[0] !== "*") obj[path[0]] = value
        else if(path.length === 1 && path[0] === "*") helper.push(obj,value)
        else if(path.length > 1 && path[0] !== "*") {
            obj[path[0]] = obj[path[0]] ? obj[path[0]] : path[1] === "*" ? [] : {}
            this.Set(path.splice(1), value, obj[path[0]])
        } else if(path.length > 1 && path[0] === "*") {
            helper.push(obj, path[1] === "*" ? [] : {})
            this.Set(path.splice(1), value, obj[obj.length-1])
        }
        return this
    }


    /** set a name of an item
     * @return Item
    */
    SetName = (name, nametype = "short") => {
        this.Set(["names", nametype,"*"], name)
        Store.Index(name, this)
        return this
    }


    /** sets the model of the current Item
     * @return Item
     */
    SetModel = (model = null) => {
        this.__model = model || this.model
        Store.Index(model, this)
        return this
    }


    /** set a property of the content, in case the content is an object 
     * @return any
     */
    Get = (path, obj = null) => {
        path = Array.isArray(path) ? path : path.split(".")
        obj = obj || this
        helper.assert(path.length > 0, "cannot get a sub property without a path")
        if(path.length === 1 && Number.isInteger(path[0])) return obj[path[0]]
        else if(path.length === 1) return obj[path[0]]
        else if(path.length > 1 && Number.isInteger(path[0])) return this.get(path.splice(1),obj[path[0]])
        return this.Get(path.splice(1), obj[path[0]])
    }


    /** returns the item id 
     * @return string
     */
    GetId = () => this.__id


    /**  create a 26 chars hash of the item 
     * @return Item
     */
    Hash = (separator = "") => {
        if(typeof hash !== "undefined") this.__hash = [...hash.md5(helper.stringify(this.value)).toUpperCase()].map((d, i) => (i) % 4 === 0 && i > 0 ? separator + d : d).join("").trim()
        return this
    }

    
    /** apply a function to all the item of an item collection
     * @return Item
     */
    Map = (func) => {
        for(const [key,value] of this) if(typeof key !== "string" || !key.startsWith("__")) this.set(key, func(this.get(key)))
        return this
    }


    /** apply a function to all the item of an item collection
     * @return Item
     */
    Merge = (item) => {
        helper.assert(item instanceof Map, "cannot merge with non Map instance")
        for(const [key, value] of item) this.set(key, value)
        return this
    }


    /** return a string version of the Item 
     * @return string
     */
    ToString = () => helper.stringify(this)
    
}




/** add helper function and property to the global or window object */
helper.context().Item = Item






