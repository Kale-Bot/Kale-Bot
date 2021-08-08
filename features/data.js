var { client, development, config } = require("../bot.js")
const fs = require("fs")
var env = {}
if (fs.existsSync("./env.json")) env = require("../env.json")

const firebase = require("firebase-admin")
const firebaseApp = firebase.initializeApp({
    credential: firebase.credential.cert((process.env.FIREBASECERT || JSON.stringify(env.FIREBASECERT)).startsWith("{") ? JSON.parse(process.env.FIREBASECERT || JSON.stringify(env.FIREBASECERT)) : JSON.parse(fs.readFileSync(process.env.FIREBASECERT))),
    databaseURL: "https://kale-bot-discord-default-rtdb.firebaseio.com"
})
const storage = firebase.storage(firebaseApp).bucket("gs://kale-bot-discord.appspot.com")

var data = {}

module.exports = {
    name: "data",
    description: "Configurate a server with custom options and save data",
    events: ["register", "guildCreate", "guildDelete"],
    run: (name, guild) => {
        if (name == "preregister") {
            if (!development) {
                module.exports.downloadData(newdata => {
                    data = newdata

                    module.exports.data = data

                    guild(data)
                })
            } else {
                data = { configs: {}, logs: {} }

                module.exports.data = data

                guild(data)
            }
        } else if (name == "register") {
            client.guilds.cache.forEach(guild => {
                module.exports.fixConfig(guild)
            })

            module.exports.uploadData()
        } else if (name == "guildCreate") {
            module.exports.fixConfig(guild)

            module.exports.uploadData()
        } else {
            delete data.configs[guild.id]
            delete data.logs[guild.id]

            module.exports.uploadData()
        }
    },
    data,
    uploadData: () => { if (!development) storage.file("data.json").save(JSON.stringify(data, null, 4)) },
    downloadData: (callback) => { storage.file("data.json").download().then(newData => { callback(JSON.parse(newData)) }).catch(err => { throw err }) },
    fixConfig: (guild) => {
        if (data.configs[guild.id] == undefined || data.configs[guild.id] == null) data.configs[guild.id] = config.defaultConfig
        if (data.logs[guild.id] == undefined || data.logs[guild.id] == null) data.logs[guild.id] = config.defaultLogs

        console.log(guild.id, guild.name)

        data.configs[guild.id].name = guild.name

        var serverconfig = data.configs[guild.id]
        var logs = data.logs[guild.id]

        function fix(data, expected) {
            for (var key of Object.keys(expected)) {
                if (!JSON.stringify(expected[key]).startsWith("{")) {
                    if (data[key] == null || data[key] == undefined) data[key] = expected[key]
                } else {
                    if (data[key] == null || data[key] == undefined) data[key] = expected[key]

                    data[key] = fix(data[key], expected[key])
                }
            }

            return data
        }
        serverconfig = fix(serverconfig, config.defaultConfig)
        logs = fix(logs, config.defaultLogs)

        data.configs[guild.id] = serverconfig
        data.logs[guild.id] = logs

        module.exports.uploadData()
    }
}