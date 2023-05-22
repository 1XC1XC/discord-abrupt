const file = require("abrupt/file")
const object = require("abrupt/object")

module.exports = class data { 
    constructor(data) {
        if (object.is(data) && (file.exists("./users") != "folder")) {
            file.create("./users")
        }
    }

    user = class { 
        constructor(author, content) {
            this.id = author.id
            const Path = `./users/${this.id}.json`
            this.Path = Path
            if (file.exists(Path) != "file") {
                file.create(Path, content)
            }
        }

        content() {
            const content = file.exists(this.Path)
            if (content == "file") {
                return JSON.parse(file.read(this.Path))
            }
            return false
        }

        get(prop) {
            const data = this.content()
            if ((prop != undefined) && (data.hasOwnProperty(prop))) {
                return data[prop]
            }
            return false
        }

        set(prop, value, create = true) {
            const data = this.content()
            if (((value != undefined) && (prop != undefined)) && (data.hasOwnProperty(prop) || (create == true))) { // create when set to false won't create a new property in the value
                data[prop] = value
                file.create(this.Path, JSON.stringify(data))
            }
            return false
        }
    }
}