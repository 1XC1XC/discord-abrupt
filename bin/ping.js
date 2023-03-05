module.exports = (message, args) => {
    const { channel } = message 
    channel.send("pong!")
}