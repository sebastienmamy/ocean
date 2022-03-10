/** manages all data handling
 * @author sebastien.mamy@gmail.com
 * @since 2022-01-30
 */

require("./ocean.helper")
require("./ocean.io")
require("./ocean.item")


/** store class */
class Store extends Item {

    /** file bases persistence */
    static FILE = "file"

    /** constructor of a store */
    constructor(type, name, path) {
        super({type,name, path})
        this.__model = "Store"
        this.Set("files.items", name + ".items.json")
        this.Set("files.index", name + ".index.json")
        io.makeDir(path)
        this.Set("items", io.fileExists(io.path(path, this.Get("files.items"))) ? io.readJson(io.path(path, this.Get("files.items"))) : {})
        this.Set("index", )
        // this.set("items", io.fileExists(io.path(store.path, store.itemsfile)) ? io.readJson(io.path(store.path, store.itemsfile)) : {})
    }


    /** saves the items to the store persistence
     * @return Store
     */
    Save = () => {
        return this
    }


    /** insert an item to the store (or replace)
     * @return Store
     */
    Push = (item) => {
        helper.assert(item instanceof Item, "cannot push a non-item")
        this.Set(["items", item.__id], item)
        return this.Index(item.__id, item)
    }


    /** index a item with a value 
     * @return Store
     */
    Index = (value, item) => {
        helper.assert(item instanceof Item, "cannot index a non-item")
        this.Set(["index", value, "*"], item.__id)
        return this
    }


    /** creates an item of the given model
     * @return Item
     */
    New = (model) => {
        let item = (new Item()).SetModel(model)
        this.Push(item)
        return item
    }


    /** creates a Reference item
     * @return Item
     */
    Reference = () => this.New("Reference")


    /** creates a Identity item
     * @return Item
     */
    Identity = () => this.New("Identity")
}




/** store object */
helper.register("store", {values: {}, items : {}})



/** generate a unique id made of random blocks
 * @return string */
store.nextId = (length = 12, blocksize = 4, prefix = "") => {
    let id = (prefix + "").length > 0 ? prefix + " " : prefix
    let nbblock = (length / blocksize)
    for(let i = 0; i < nbblock; i++) id += helper.random(blocksize) + " "
    id = id.trim()
    return store.values[id] ? store.nextId(length, blocksize, prefix) : id
}


/** intitializes a json store with a given path
 * @return undefined */
store.init = (name, path) => {
    store.path = path
    store.itemsfile = name + ".items.json"
    store.indexfile = name + ".index.json"
    store.valuesfile = name + ".values.json"
    io.makeDir(path)
    store.items = io.fileExists(io.path(store.path, store.itemsfile)) ? io.readJson(io.path(store.path, store.itemsfile)) : {}
    store.values = io.fileExists(io.path(store.path, store.valuesfile)) ? io.readJson(io.path(store.path, store.valuesfile)) : {}
    store.index.data = io.fileExists(io.path(store.path, store.indexfile)) ? io.readJson(io.path(store.path, store.indexfile)) : {}
}


/** save the current store to the files
 * @return undefined */
store.save = () => {
    io.write(store.index.data, io.path(store.path, store.indexfile))
    io.write(store.items, io.path(store.path, store.itemsfile))
    io.write(store.values, io.path(store.path, store.valuesfile))
}


/** update an item and return the value  
 * @return string */
store.update = (id, path, value, source, timestamp) => {
    source = source ?? {id: "?"}
    timestamp = timestamp ?? (new Date()).valueOf()
    let multiple = path.endsWith(".*")
    let p = path.split(".*")[0]
    let values = multiple ? store.get(id) : store.get(id, path)
    let i = 0
    for(let v of values) if(v.path === p) {
        if(v.value === value) {
            if(!v.sources.hasOwnProeprty(source)) v.sources[source] = timestamp
            return v.id
        }
        i++
    }
    return store.push({item: id, path: multiple ? p + "." + i : p, value, sources: {[source]: timestamp}})
}



/** add a new item and return the id 
 * @return string */
store.push = (model, item = null) => {
    item = item ?? {}
    item = {...item, models: []}
    helper.push(item.models, model)
    if(!item.id) item.id = store.nextId(12,4,(new Date().getFullYear()))
    store.items[item.id] = item
    store.values[item.id] = []
    return item.id
}


/** return the object, or an array of all the values according to the filter 
 * @return object|array */
store.get = (id, path = null, source = null) => {
    if(path === null) return store.items[id]
    if(path === "*") return helper.reduce(store.values, (result = [], value) => {
        if(value.item === id && (source === null || value.sources.hasOwnProperty(source))) result.push(value)
        return result 
    })
    return helper.reduce(store.values, (result = [], value) => {
        if(value.item === id && value.path === path && (source === null || value.sources.hasOwnProperty(source))) result.push(value)
        return result 
    })
}


/** assert the model of the item
 * @return undefined */
store.assert = (id, model) => helper.assert(store.get(id).models.indexOf(model) >= 0, "item " + id + " is not of model " + model)



/** create an index from a list of items and a property
 * @return string */
store.index = (value, item) => {
    if(value === null) return
    if(!store.index.data[value]) store.index.data[value] = []
    helper.push(store.index.data[value], item)
    return item
}


/** store data */
store.index.data = {}



/** return the list of item corresponding to a indexed value, optionaly filter by model 
 * @return array */
store.index.get = (value, model = null) => store.index.data[value] ? helper.reduce(store.index.data[value], (out, id) => {
        let item = store.get(id)
        if(model === null || item?.models?.indexOf(model) >= 0) out = [...out, item.id]
        return out
    }) : []


/** return the list of item corresponding to a indexed value, optionaly filter by model 
 * @return object */
 store.index.getUnique = (value, model = null) => {
    let matches = store.index.get(value, model)
    helper.assert(matches.length <= 1)
    return matches.length === 1 ? matches[0] : undefined
}





helper.context().Store = Store