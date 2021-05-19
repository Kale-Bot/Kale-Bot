var { client, data } = require("../bot.js")

module.exports = {
    name: "statistics",
    description: "Puts statistics at the top of your server",
    required: false,
    events: ["register", "guildCreate", "channelCreate", "channelDelete", "guildMemberAdd", "guildMemberRemove", "guildMemberUpdate", "roleCreate", "roleDelete"],
    run: (name, event) => {
        if (name == "register") {
            client.guilds.cache.forEach(guild => {
                update(guild)
            })
        } else if (name == "guildCreate") {
            update(event)
        } else if (name == "channelCreate" || name == "channelDelete" || name == "guildMemberAdd" || name == "guildMemberRemove" || name == "roleCreate" || name == "roleDelete") {
            if (name == "channelCreate" || name == "channelDelete") { if (event.parent != event.guild.channels.cache.find(channel => channel.type == "category" && channel.name == "Stats" && channel.position == 0).id) { update(event.guild) } } else update(event.guild)
        } else if (name == "guildMemberUpdate") {
            var max = new Date()
            max.setMinutes(max.getMinutes() + 1)
            var min = new Date()
            min.setMinutes(min.getMinutes() - 1)

            if (event.premiumSinceTimestamp <= max && event.premiumSinceTimestamp >= min) {
                update(event.guild)
            }
        }
    }
}

function update(guild) {
    var config = data.servers[guild.id]

    if (config.stats.enabled) {
        var statsCategory = guild.channels.cache.find(channel => channel.type == "category" && channel.name == "Stats" && channel.position == 0)

        if (statsCategory == null) guild.channels.create("Stats", { type: "category", position: 0 }).then(statsCategory => { next() }); else next()

        function next() {
            statsCategory = guild.channels.cache.find(channel => channel.type == "category" && channel.name == "Stats" && channel.position == 0)

            if (statsCategory == null) return

            guild.channels.cache.filter(channel => channel.parent == statsCategory.id).forEach(channel => {
                channel.delete()
            })

            if (config.stats.members) guild.channels.create("Members: " + guild.memberCount, { type: "voice", parent: statsCategory.id })
            if (config.stats.channels) guild.channels.create("Channels: " + guild.channels.cache.filter(channel => channel.parent != statsCategory.id).size, { type: "voice", parent: statsCategory.id })
            if (config.stats.roles) guild.channels.create("Roles: " + guild.roles.cache.filter(role => true).size, { type: "voice", parent: statsCategory.id })
            if (config.stats.boosts) guild.channels.create("Boosts: " + guild.premiumSubscriptionCount, { type: "voice", parent: statsCategory.id })
        }
    } else {
        var statsCategory = guild.channels.cache.find(channel => channel.type == "category" && channel.name == "Stats" && channel.position == 0)

        if (statsCategory != null) {
            statsCategory.children.forEach(channel => channel.delete())

            statsCategory.delete()
        }
    }
}