const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const cron = require('node-cron');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const TOKEN = "";
const CHANNEL_ID = "";

let lastEpisodeCount = 1;

async function getEpisodeCount() {
    try {
        const res = await axios.get("https://myanimelist.net/anime.php?q=steel+ball+run");

        const html = res.data.toLowerCase();

        if (html.includes("episode 2")) {
            return 2;
        }

        return 1;
    } catch (err) {
        console.error("api error:", err.message);
        return null;
    }
}

client.once("clientReady", () => {
    console.log(`Connected as ${client.user.tag}`);
    cron.schedule("*/10 * * * *", async () => {
        console.log("checking steel ball run episodes ^-^");
        const currentEpisodes = await getEpisodeCount();
        if (currentEpisodes === null) return;

        console.log("eps found:", currentEpisodes);

        if (currentEpisodes >= 2 && lastEpisodeCount < 2) {
            const channel = await client.channels.fetch(CHANNEL_ID);
            channel.send("SBR EP 2 JUST RELEASED!");

            lastEpisodeCount = currentEpisodes;
        }
    });
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.content === "!sbr") {
        const currentEpisodes = await getEpisodeCount();
        if (currentEpisodes === null) {
            message.channel.send("api error");
            return;
        }

        if (currentEpisodes >= 2) {
            message.channel.send("SBR EP 2 IS OUT!");
        } else {
            message.channel.send("SBR EP 2 is not out yet loser try again later");
        }
    }
});

client.login(TOKEN);
