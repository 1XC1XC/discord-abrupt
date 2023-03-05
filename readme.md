### Built on Ubuntu/Bunsenlabs/Lubuntu Linux Debian [0.3.10]
### Index.js
The package will build a directory including a ping command.
```js
const Discord = require("discord-abrupt")

new Discord({
    token: "OTU4NDgxMjk3NjQ1Mzc1NTQw.G6oYrw.D11IKieKqPq6pjXgAsXR0TourRRKyBdht-0E0k", // replace with bot token
    data: {
        cash: 100
    }, // Default: false
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
        const { author } = message
        message.channel.send(author.data.get("cash"))
    }
}
```
Setting value from JSON array.
```js
module.exports = {
    names: "donate",
    run(message, args) { // Simple Example: message.author.data.set(property, value)
        const { author } = message
        const { data } = author
        const current = data.get("cash")
        const value = Number(args[0]) 
        if ((value) && (value > 0) && (value <= current) && (args.length == 1)) {
            set = current - value
            data.set("cash", set)
            message.channel.send(`cash balance: ${set}`)
        }
    }
}
```