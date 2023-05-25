### Built on Ubuntu/Bunsenlabs/Lubuntu Linux Debian [0.4.14]
### Index.js
The package will build a directory including a ping command.
```js
const Discord = require("discord-abrupt")

new Discord({
    token: "TOKEN", // replace with bot token
    data: {
        cash: 100
    }, // default users json data [Default: false]
    prefix: ";", // Default: !
    debug: true // Default: false
})
```
### Creating a command
After initializing, you can build a custom command.
Create a node.js file in the pre-built commands folder with a exported module with the keyword as the file name.
```js
// file name ping.js
module.exports = (message, args) => {
    message.channel.send("ping!")
}
```
### Creating Synonyms
Creating commands with multiple keywords.
```js
module.exports = {
    names: ["repeat", "talk"]
    run(message, args) {
        const { channel } = message
        channel.send(args.join(" "))
    }
}
```
### Creating Local User Data
Getting value from JSON array.
```js
module.exports = {
    names: ["cash"],
    run(message, args) {
        message.channel.send(String(author.data.get("cash")))
    }
}
```
Setting value from JSON array.
```js
module.exports = {
    names: "donate",
    run(message, args) { // Simple Example: message.author.data.set(key, value)
        const { author, channel } = message
        const { data } = author
        const current = data.get("cash")
        const value = Number(args[0]) 
        if ((value) && (value > 0) && (value <= current) && (args.length == 1)) {
            set = current - value
            data.set("cash", set)
            channel.send(`cash: ${set}`)
        }
    }
}
```
### Beta MongoDB Support
Example of MongoDB with discord-abrupt
```js
const mongoose = require("mongoose")
const Discord = require("discord-abrupt")


new Discord({
    token: "TOKEN", // replace with bot token
    data: {
        mongoose,
        type: "mongodb",
        context: {
            url: "mongodb+srv://user:password@example.com/", // replace with URL created with the MongoDB site 
            dbName: "database",
            collections: {
                users: {
                    scheme: {
                        id: String,
                        Balance: Number
                    },
                    on: async (message) => { // this function can be used for management of user data, the applications of this function is for creating a users data through a command or automatically.
                        const { metadata: { keyword }, content, channel, author } = message
                        const { id, data: { Users } } = author
                        const [ command, ...args ] = content.slice(1).split(" ")

                        const user = await Users.findOne({ id })

                        if (user == null) {
                            if ((command == "start") && (args.length == 0)) {
                                return new Users({ id, Balance: 1000 }).save()
                            } else {
                                if (keyword) { // keyword represents if a command is being used, so you can detect if a user typed a command instead of random text after the prefix.
                                    channel.send("Please use the '!start' command to begin using the bot.")
                                }
                                return false // false return will stop a command from being called after this function runs.
                            }
                        } else {
                            return user
                        }
                    }
                }
            },
        }
    }
})
```
Extension of the example using the MongoDB database to create a economy.

-- Coinflip
```js
// Path: ./commands/coinflip.js
const rand = require("abrupt/rand")
const { comma } = require("abrupt/string")

const types = ["heads", "tails"]
module.exports = {
    names: ["cf", "coinflip"],
    run(message, args) {
        const { author, channel } = message
        const { data: { User } } = author
        
        const [ type, amount ] = args.map(x => Number(x) || x)

        if ((args.length != 2) || (!Number(amount))) {
            return
        }

        if (types.indexOf(type) == -1) {
            channel.send("Please use 'heads' or 'tails' for your bet.")
            return
        }

        if (amount > User.Balance) {
            channel.send("Sorry, but you cannot place that bet. Your current balance is not sufficient.")
            return
        }

        if (amount <= 0) {
            return
        }

        if ((types[rand.int(0,1)] == type)) {
            User.Balance += amount
        } else {
            User.Balance -= amount
        }

        User.save()

        channel.send(`Balance: ${comma(User.Balance, "$")}`)
    }
}
```
-- Balance
```js
// Path: ./commands/balance.js
const string = require("abrupt/string")
module.exports = {
    names: ["bal", "balance"],
    run(message, args) {
        const { author, channel } = message
        const { data: { User } } = author
        if (args == 0) {
            channel.send(`Balance: ${string.comma(User.Balance, "$")}`)
        }
    }
}
```