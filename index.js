const { Client, GatewayIntentBits } = require("discord.js")
const db = require("./data.js")
const file = require("abrupt/file")

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

        return (() => {
            const database = new db(data)
            const client = new Client({
                intents: Object.keys(GatewayIntentBits).filter(x => !Number(x) ? GatewayIntentBits[x] : null)
            })
            
            client.on("ready", () => {
                console.log(`Logged in as ${client.user.tag}`)
            })

            client.on("messageCreate", message => {
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
 
                if ((typeof data == "object") && (Array.isArray(data) == false)) {
                    author.data = new database.user(author, JSON.stringify(data))
                } else if ((data != false) || (typeof data != "object") || ((typeof data == "object") && (Array.isArray(data) == true))) {
                    if (debug) console.log("discord-abrupt: error creating default user data")
                }

                if ((content) && (content.startsWith(prefix))) {
                    const [name, ...args] = content.slice(1).toLowerCase().split(" ")

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
    }
}
