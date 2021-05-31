var { client, data } = require("../bot.js")

module.exports = {
    name: "misc",
    description: "Miscellaneous Actions",
    events: ["message"],
    run: (name, message) => {
        if (message.channel.type != "dm") var config = data.servers[message.guild.id]; else var config = { prefix: "?", deleteTimeout: 2147483.647, atSender: false }

        if (message.embeds[0] != null) if (message.embeds[0].title == "Poll") {
            var args = message.content.toLowerCase().split(" "); args.shift()

            require("../commands/poll.js").addReactions(message, args, client, config)
        }
    }
}