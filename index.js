const config = require("./config.json");
const Discord = require('discord.js');
const SteamUser = require('steam-user');

const client = new Discord.Client();

const steamUser = new SteamUser();
steamUser.logOn();

steamUser.on('loggedOn', details => {
    console.log("Logged onto Steam as " + steamUser.steamID);
});

client.on('ready', () => {
    console.log("Listening to any steam keys...")
});

client.on('message', message => {
    if (config.listenServers.includes(message.guild.id)) {
        const matches = message.content.match(/((\w{5}-){2,}\w{5})/);
        if (matches) {
            console.log(`Trying to redeem: ${matches[0]}`);
            steamUser.redeemKey(matches[0], (err, purchaseResultDetails, packageList) => {
                if (err) {
                    console.log("😭 Could not redeem...");
                } else {
                    console.log("🎉 Redeemed succesfully !");
                }
            });
        }
    }
});

client.login(config.token);