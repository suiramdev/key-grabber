const config = require("./config.json");
const Discord = require('discord.js');
const SteamUser = require('steam-user');

const client = new Discord.Client();

const steamUser = new SteamUser();
let authentified = false;
steamUser.logOn({
    "accountName": config.accountName,
    "password": config.password
});

steamUser.on('loggedOn', () => {
    console.log("Logged onto Steam as " + steamUser.steamID.getSteam3RenderedID());
    console.log("Listening to keys... ");
    authentified = true;
});

steamUser.on('disconnected', () => {
    console.log("Disconnected of Steam");
    authentified = false;
});

client.on('message', message => {
    if (!authentified) return;
    if (!config.listenServers.includes(message.guild.id)) return;

    const matches = message.content.match(/((\w{5}-){2,}\w{5})/);
    if (matches) {
        console.log(`Trying to redeem: ${matches[0]}`);
        steamUser.redeemKey(matches[0], (err, purchaseResultDetails, packageList) => {
            console.log(err ? "😭 Could not redeem..." : "🎉 Redeemed succesfully !");
        });
    }
});

client.login(config.token);