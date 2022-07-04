require("dotenv").config();
const axios = require('axios');
const Discord = require('discord.js');
const fs = require('fs');

const TOKEN = process.env.TOKEN;
const GUILD_ID = process.env.GUILD_ID;

const GOOGLE_SHEET_QUERY_GET = process.env.GOOGLE_SHEET_QUERY_GET;

const COMMAND_CHANNEL_ID = process.env.COMMAND_CHANNEL_ID;
const ROLE_CHANNEL_ID = process.env.ROLE_CHANNEL_ID;
const WELCOME_CHANNEL_ID = process.env.WELCOME_CHANNEL_ID;

const STUDENT_ROLE_ID = process.env.STUDENT_ROLE_ID;

const GRADE1_ROLE_ID = process.env.GRADE1_ROLE_ID;
const GRADE2_ROLE_ID = process.env.GRADE2_ROLE_ID;
const GRADE3_ROLE_ID = process.env.GRADE3_ROLE_ID;
const GRADE4_ROLE_ID = process.env.GRADE4_ROLE_ID;
const GRADE5_ROLE_ID = process.env.GRADE5_ROLE_ID;
const GRADE6_ROLE_ID = process.env.GRADE6_ROLE_ID;
const GRADE_ROLE_ID = [, GRADE1_ROLE_ID, GRADE2_ROLE_ID, GRADE3_ROLE_ID, GRADE4_ROLE_ID, GRADE5_ROLE_ID, GRADE6_ROLE_ID];

const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const query = async (email) => {
    const rawEmail = await fs.readFileSync('./email.json');
    const cacheEmail = await JSON.parse(rawEmail);
    
    if (cacheEmail.indexOf(email) !== -1) return true;

    let found;

    await axios
        .get(GOOGLE_SHEET_QUERY_GET)
        .then(response => {
            fs.writeFileSync('./email.json', JSON.stringify(response.data));
            if (response.data.indexOf(email) !== -1) {
                found = true;
            } else {
                found = false;
            }
        });
    return found;
}

const doneID = (id) => {
    const rawID = fs.readFileSync('./id.json');
    const doneID = JSON.parse(rawID);
    if (doneID.includes(id)) return true;
    doneID.push(id);
    fs.writeFileSync('./id.json', JSON.stringify(doneID));
    return false;
}

const client = new Discord.Client({ 
    partials: ["CHANNEL"], 
    intents: [ 
        "GUILDS", 
        "GUILD_MESSAGES", 
        "GUILD_MESSAGE_REACTIONS", 
        "DIRECT_MESSAGES" 
    ], allowedMentions: { 
        repliedUser: false 
    } 
});

client.once('ready', () => {
    console.log(`${client.user.username} ready!`);
    client.user.setActivity(`MINECRAFT`, { type: "PLAYING" });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channelId === COMMAND_CHANNEL_ID && message.content.toLowerCase() === 'auth') {
        try {
            message.reply({ content: 'Check your Direct Message' });
            message.author.send('Please enter your email address');
        } catch (err) {
            console.error(err);
            message.reply({ content: 'Cannot send Direct Message. Please contact moderator' });
        }

    } else if (message.guildId == null) {
        if (!validateEmail(message.content)) return message.author.send('Email is invalid');
        if (doneID(message.author.id)) return message.author.send('You have already registered');
        if (!query(message.content)) return message.author.send('Email not found');
        message.author.send(`Hello ${message.author.username}!`);
        const channel = client.channels.cache.get(WELCOME_CHANNEL_ID);
        const guild = client.guilds.cache.get(GUILD_ID);
        (await guild.members.fetch(message.author.id)).roles.add(STUDENT_ROLE_ID);
        channel.send(`Welcome ${message.author.username} to SW2 Minecraft Student Ambassador Discord!`);

    } else if (message.channelId === ROLE_CHANNEL_ID && message.content.toLowerCase().startsWith('grade')) {
        const [, grade] = message.content.toLowerCase().split(/ +/);
        const guild = client.guilds.cache.get(GUILD_ID);
        const gradeNumber = parseInt(grade);
        if (gradeNumber > 6 || gradeNumber < 1) return message.reply({ content: 'Grade must be a number between 1 to 6' });
        (await guild.members.fetch(message.author.id)).roles.add(GRADE_ROLE_ID[gradeNumber]);
        message.reply({ content: 'Done! Check your role' });

    }
});

client.login(TOKEN);