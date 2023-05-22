const { Client, GatewayIntentBits } = require("discord.js")
const db = require("./data.js")
const file = require("abrupt/file")
const string = require("abrupt/string")
const object = require("abrupt/object")

const { path: orgin } = arguments["1"].main 
const { readFile } = require("fs")


module.exports = class {
    constructor({
        token,
        folder = "commands",
        data = false,
        prefix = "!",
        debug = false
    }) {
        return (async () => {
            const core = `./${folder}`
            if (!file.exists(core)) {
                file.create(core)
                console.log(`discord-abrupt: created ${core}`)
            }

            const commands = file.read(folder)
            const allCommands = {}

            if (Array.isArray(commands)) {
                if (commands.length == 0) {
                    readFile(`${__dirname}/bin/ping.js`, "utf8", (_, content) => {
                        file.create(`./${folder}/ping.js`, content)
                        allCommands["ping"] = require(`${__dirname}/bin/ping.js`)
                        console.log(`discord-abrupt: created ping with prefix "${prefix}" in directory "${core}"`)
                    })
                }

                for (let i in commands) {
                    const cmd = commands[i]
                    const path = `./${folder}/${cmd}`
                    const type = file.exists(path)

                    if (type != "file") {
                        if (debug) console.log(`discord-abrupt: error loading "${path}"`)
                        continue
                    }
                    
                    try {
                        const func = require(`${orgin}/${folder}/${cmd}`)

                        if (!func) {
                            new Error()
                        } else {
                            allCommands[cmd.split("\.").shift()] = func
                        }
                    } catch {
                        if (debug) console.log(`discord-abrupt: error loading "${path}"`)
                    }
                }
            }

            const dbconfig = {
                connected: false,
                schemes: {}
            }

            if ((data != false) && (object.is(data))) {
                const { context: { url, dbName, collections }, mongoose } = data
                if (mongoose && string.is(url, dbName)) {
                    await mongoose.connect(url, { dbName })
                        .then(() => {
                            dbconfig.connected = true
                            console.log("MongoDB: Connected")
                        })
                        .catch((...args) => {
                            dbconfig.connected = false
                            console.log("MongoDB: Connection Error")
                            console.log("404:", args)
                        })
                    
                    if (dbconfig.connected) {
                        const { model, Schema } = mongoose
                        
                        for (let i in collections) {
                            const { collection, scheme, on } = collections[i]
                            dbconfig.schemes[i] = { scheme: model(collection || i, Schema(scheme)), on }
                        }
                    }
                }
            }

            return (async () => {
                let database = false
                if (object.is(data) && !dbconfig.connected && !data.type) {
                    database = new db(data)
                }
                const client = new Client({
                    intents: Object.keys(GatewayIntentBits).filter(x => !Number(x) ? GatewayIntentBits[x] : null)
                })
                
                client.on("ready", () => {
                    console.log(`Logged in as ${client.user.tag}`)
                })
                
                client.on("messageCreate", async message => {
                    const { content, author, channel } = message
                    if (author.bot) return
                    
                    
                    const embed = {
                        author: {
                            name: author.username,
                            icon_url: author.displayAvatarURL(),
                        },
                        footer: {
                            text: client.user.username,
                            icon_url: client.user.displayAvatarURL(),
                        }
                    }
                    
                    channel.sendEmbed = ({
                        author = embed.author,
                        footer = embed.footer,
                        color = 0x0099ff,
                        timestamp = (new Date()).toISOString(),
                        title, description, url, image, thumbnail, fields
                    }) => channel.send({embeds:[{author, footer, color, timestamp, title, description, url, image, thumbnail, fields}]})
                    
                    if ((content) && (content.startsWith(prefix))) {
                        const [name, ...args] = content.slice(1).toLowerCase().split(" ")

                        const commandKeys = Object.keys(allCommands)
                        const commandValues = Object.values(allCommands).map((x, i) => x.names || commandKeys[i]).filter(x => x).flat()
                        const isCommand = commandValues.includes(name)

                        author.data = {}
                        if ((data) && (object.is(data))) {
                            const { type } = data
                            if (!type) {
                                author.data = new database.user(author, JSON.stringify(data))
                            } else if (type == "mongodb") {
                                const { mongoose } = data
                                const { schemes } = dbconfig
                                if (mongoose && dbconfig.connected && schemes.users) {
                                    const { users: { scheme, on } } = schemes
                                    Object.assign(author.data, { Users: scheme })
                                    const User = await on(message, isCommand)                                    

                                    if (User === false) {
                                        return
                                    }
                                    Object.assign(author.data, { User })
                                }
                            }
                        } else if ((data != false) || (!object.is(data))) {
                            if (debug) console.log("discord-abrupt: error creating default user data")
                        }

                        if (!isCommand) {
                            return
                        }

                        for (let named in allCommands) {
                            const call = allCommands[named]

                            if ((name == named) && (typeof call == "function")) {
                                call(message, args)
                                break
                            }
                            
                            if (typeof call == "object") {
                                let { names, run } = call
                                if (typeof names == "string") {
                                    names = [names, named]
                                } 
                                
                                if (names.includes(name)) {
                                    run(message, args)
                                    break
                                }
                            }
                        }

                    }
                })

                client.login(token)

                return client
            })()
        })()
    }
}