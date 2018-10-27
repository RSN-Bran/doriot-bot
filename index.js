// Load up necessary libraries
const Discord = require("discord.js");
const fs = require("fs");
let request = require(`request`);


// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();
client.dexEntries = require("./entries/dexEntries.json")
const pokemonList = require("./info/pokemonList.json")
var pokemonArray = pokemonList.list;

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

//Currently unused
client.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

//Currently unused
client.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});


client.on("message", async message => {
  // This event will run on every single message received, from any channel or DM.
  
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if(message.content.indexOf(config.prefix) !== 0) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  const args = message.content.slice(config.prefix.length).trim().split('\n');
  var command = args.shift().toLowerCase();
  command = command.replace(/\s+/g, '');
  
  //Add a Pokemon to the dex
  if(command === "addpoke") {
    basicInfo = args[0].split(' ');
    if(args[0].match(/[a-zA-Z0-9:-]+,\sthe\s[a-zA-Z0-9:-\s]+\sPokemon/) === null || args.length !== 2) {
      message.channel.send("Adding a Pokemon must have the following format:\n<Pokemon_Name>, the <Species_Name> Pokemon\n<Description>");
      return;
    }
      
    var pokemon = basicInfo[0].substring(0, basicInfo[0].length-1);
    if(pokemonArray.indexOf(pokemon) === -1) {
      message.channel.send(pokemon + " is not a real Pokemon, try again in a few years");
    }
    
    var species = "";
    console.log(basicInfo)
    for(var i = 2; i < basicInfo.length-1; i++) {
      species = species + basicInfo[i] + " ";
    }
    client.dexEntries[pokemon] = {
      "number": pokemonArray.indexOf(pokemon)+1,
      "species":species,
      "description":args[1]
    }
    fs.writeFile("./entries/dexEntries.json", JSON.stringify(client.dexEntries, null, 4), err => {
      if(err) throw err;
    })
    var imageFound = false;
    message.attachments.forEach(a => {
      request(a.url).pipe(fs.createWriteStream(`./images/${pokemon}.png`));
      imageFound = true;
      message.channel.send("Pokemon saved");
    });
    if(!imageFound) {
      message.channel.send("An image of this Pokemon is needed");
    }
  }
  
  if(command === "getpoke") {
    var pokemon = args[0];
    if(client.dexEntries[pokemon] === undefined) {
      message.channel.send("This Pokemon has not been discovered")
    }
    else {
      var output = pokemon + ", the " + client.dexEntries[pokemon].species + "Pokemon\n" + client.dexEntries[pokemon].description
      message.channel.send(output, {files: [`./images/${pokemon}.png`]})
    } 
  }
  
  if(command === "deletepoke") {
    var pokemon = args[0];
    client.dexEntries[pokemon] = undefined;
    fs.writeFile("./entries/dexEntries.json", JSON.stringify(client.dexEntries, null, 4), err => {
      if(err) throw err;
    })
    message.channel.send(pokemon + " has been deleted")
  }
  
});

client.login(config.token);