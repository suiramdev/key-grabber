const config = require("./config.json");
const Discord = require('discord.js');
const SteamUser = require('steam-user');
const fs = require('fs');

const client = new Discord.Client();

let authentified = false;
let nextUser = 0;

function connectToSteam(account, password) {
    const user = new SteamUser();

    user.logOn({
        "accountName": account,
        "password": password
    });

    user.on('loggedOn', () => {
        log("Logged onto Steam as " + user.steamID.getSteam3RenderedID());
        log("Listening to keys... ");
        authentified = true;
    });

    user.on('disconnected', () => {
        log("Disconnected of Steam");
        authentified = false;
    });

    return user;
}

function nextUser() {
    const account = config.accounts[nextUser];
    nextUser++;

    return connectToSteam(account.username, account.password);
}

function log(text) {
    console.log(text);
    fs.appendFile('log.txt', text + "\n", (err) => {
        if (err) {
            throw err;
        }
    });
}

let steamUser = nextUser(accounts);
client.on('message', message => {
    if (!authentified)
        steamUser = nextUser(accounts);
    if (!config.listenServers.includes(message.guild.id))
        return;

    const date = new Date();
    log("<" + date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ">" + steamUser.accountInfo.name + " ----> " + message.guild.name + " - Channel : " + message.channel.name + ", By : " + message.author.username + " -> " + message.content);

    const matches = message.content.match(/((\w{5}-){2,5}\w{5})/);
    if (matches) {
        log(`Trying to redeem: ${matches[0]}`);
        steamUser.redeemKey(matches[0], (err, purchaseResultDetails, packageList) => {
            if (!err) {
                log("🎉 Redeemed succesfully ! : " + matches[0]);
                steamUser.logOff();
                steamUser = nextUser(accounts);
            } else {
                log("😭 Could not redeem...");
            }
        });
    }
});
client.login(config.token);
