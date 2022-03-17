/** manages all data handling
 * @author sebastien.mamy@gmail.com
 * @since 2022-01-30
 */

if(typeof global !== "undefined") require("./ocean.helper")
if(typeof global !== "undefined") require("./ocean.io")
//if(typeof global !== "undefined") require("./ocean.item")


helper.static.Store = {}




/** file bases persistence */
helper.static.FILE = "file"
helper.static.FILES = "files"
helper.static.MEMORY = "memory"

/** constructor of a store
 * @return Store
 */
Store.Init = (type, name, path = null) => {
    Store = {...Store, type, name, items: {}, index: {}, links : {}}
    if(Store.type === FILES) {
        Store.path = path
        Store.files = { items: name + ".items.json", index: name + ".index.json", links: name + "links.json"}
        io.makeDir(path)
        if(io.fileExists(io.path(path, Store.files.items))) Store.items = io.readJson(io.path(path, Store.files.items))
        if(io.fileExists(io.path(path, Store.files.index))) Store.index = io.readJson(io.path(path, Store.files.index))
        if(io.fileExists(io.path(path, Store.files.links))) Store.links = io.readJson(io.path(path, Store.files.links))
    }
    if(Store.type === FILE) {
        Store.files = { output: path }
        if(io.fileExists(io.path(Store.files.output))) {
            const data = io.readJson(Store.files.output)
            Store.items = data.items || {}
            Store.index = data.index || {}
            Store.links = data.links || {}
            Store.lastUpdate = data.lastUpdate
        }
    }
    return Store
}


/** saves the items to the store persistence
 * @return Store
 */
Store.Save = () => {
    if(Store.type === FILES) {
        io.write(Store.items, Store.path + io.sep + Store.files.items)
        io.write(Store.index, Store.path + io.sep + Store.files.index)
        io.write(Store.links, Store.path + io.sep + Store.files.links)
    }
    if(Store.type === FILE) {
        helper.assert(Store.files.output.endsWith(".json"), "the output file " + Store.files.output + " must be a json file")
        if(io.fileExists(Store.files.output)) io.Delete(Store.files.output)
        io.write(Store, Store.files.output)
    }
    return Store
}


/** insert an item to the store (or replace)
 * @return Store
 */
Store.Push = (item) => {
    helper.assert(item?.hasOwnProperty("__id"), "cannot push a non-item")
    Store.lastUpdate = Date.now()
    Store.items[item.__id] = item
    return Store
}


/** index a item with a value 
 * @return Store
 */
Store.Index = (value, item) => {
    helper.assert(item?.hasOwnProperty("__id"), "cannot index a non-item")
    if(value === null) return Store
    if(!item?.__id) helper.error("cannot index to a null value")
    Store.lastUpdate = Date.now()
    Store.index[value] = Store.index?.[value] || []
    helper.push(Store.index[value], item.__id)
    return Store
}


/** creates an item of the given model
 * @return Object
 */
Store.New = (model, id = null) => {
    let item = Store.Get(id) || Item.New({__id : id})
    Item.SetModel(item, model)
    Store.Push(item)
    return item
}


/** returns an Store item
 * @return Object
 */
Store.Get = (id = null, path = null) => {
    if(id === null) return null
    if(path === null) return Store.items[id]
    return Item.Get(Store.items[id], path)
}


/** creates a Reference item
 * @return Object
 */
Store.Reference = (namespace, code, item = null) => {
    let reference = Store.New("Reference")
    Item.Set(reference, "namespace",namespace).Set(reference,"code", code)
    Store.Index(namespace + ":" + code, reference)
    if(item !== null) {
        Item.Set(reference, "targets.*", Item.GetId(item))
        Store.Index(namespace + ":" + code, item)
    }
    return reference
}


/** creates a Identity item
 * @return Object
 */
Store.Identity = (name = null, nametype = "short", id = null) => {
    let identity = Store.New("Identity", id)
    if(name !== null) {
        Item.Set(identity, ["names", nametype,"*"], name)
        Store.Index(name, identity)
    }
    return identity
}


/** creates a Identity item
 * @return Object
 */
Store.Asset = (title = null, titletype = "original", id = null) => {
    let asset = Store.New("Asset", id)
    if(title !== null) {
        Item.Set(asset, ["titles", titletype,"*"], title)
        Store.Index(title, asset)
    }
    return asset
}


/** returns the id of a link between two items
 * @return String
 */
// Store.LinkId = (sourceId, targetId) => sourceId + "::" + targetId



/** fetch a link
 * @return Object
 */
// Store.Link = (sourceId, targetId) => {
//     let linkid = Store.LinkId(sourceId, targetId)
//     let link = Store.Get(linkid) || Store.New("Link",linkid)
//     Item.Set(link, "source", sourceId).Set(link, "target", targetId)
//     return link
// }


/** adds a link from source to target and indexes the links 
 * @return Store
 */
Store.AddLink = (source, target, name = "links", path = null, value = "") => {
    Item.Set(source, name + "." + target.__id + (path === null ? "" : "." + path), value)
    return Store.IndexLink(source, target)
}


/** add the link to the list of links
 * @return Store
 */
Store.IndexLink = (source, target) => {
    Item.Set(Store.links, source.__id + ".outgoing.*", target.__id)
    Item.Set(Store.links, target.__id + ".incoming.*", source.__id)
    return Store
}


/** returns the list of item corresponding to the indexed value
 * @return Object | Array
 */
Store.FromIndex = (value, model = null, max = null) => {
    let results = Store.index?.[value] || []
    if(results.length > 0 && model !== null) results = results.filter(id => Store.Get(id, "__model") === model)
    helper.assert(max === null || results.length <= max, "too many results: " + results.toString())
    return results
}


/** returns or create an item of the given model
 * @return Object
 */
Store.Fetch = (index, model) => {
    let items = Store.FromIndex(index, model)
    if(items.length > 1) helper.warning("several " + model + " items exist for index " + index + ", please run deduplication")
    let item = items.length === 1 ? Store.Get(items[0]) : Item.New(null, model)
    Store.Push(item)
    if(index) Store.Index(index, item)
    return item
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