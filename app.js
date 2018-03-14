//////////////////
//Initialisation//
//////////////////

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require("fs");
const ytdl    = require('ytdl-core');
const economy = require('discord-eco');
const sql = require("sqlite");
sql.open("./score.sqlite");
const newUsers = [];
//////////////
//Evenements//
//////////////

client.on("ready", () => 
{
  console.log(`Le bot à démarré, avec ${client.users.size} utilisateurs, dans ${client.channels.size} salons de ${client.guilds.size} serveurs.`); 
  client.user.setActivity(`;help.  ${client.guilds.size} serveurs connectés.`);
});

client.on("guildCreate", guild => 
{
  console.log(`Un nouveau serveur est apparu! ${guild.name} (id: ${guild.id}). Ce serveur a ${guild.memberCount} membres!`);
  client.user.setActivity(`sur ${client.guilds.size} serveurs`);
});

client.on("guildDelete", guild => 
{
  console.log(`J'ai été supprimé de ce serveur: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`sur ${client.guilds.size} serveurs`);
});

client.on('guildMemberAdd', (guild, member) => 
{
client.channels.find("name","general").send(`Un nouveau membre est apparu! Souhaitez lui la Bienvenue, ${member}`);
console.log(`Membre ${member} ajt sur le serveur ${guild.name} (id: ${guild.id}) `);
});

client.on("guildMemberAdd", (member) => 
{
  console.log(`User `+member.user.username+ `a rejoint le serveur`);
  client.channels.find("name","general").send(`Un nouveau membre est apparu: **`+member.user.username+`**.\nSouhaitez lui la bienvenue!`);
});

////////////////////
//Demarrage du bot//
////////////////////

client.on("message", async message => 
{

  if(message.author.bot) return;
  if(message.content.indexOf(config.prefix) !== 0) {
       sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 1]);

    } else {
            let curLevel = Math.floor(0.4 * Math.sqrt(row.points + 1));
              if (curLevel > row.level) 
              {
                row.level = curLevel;
                sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
                message.channel.send(`Niveau supérieur! Votre niveau est: ${row.level} `);
                console.log(`${author.id} est a présent niveau ${row.level}`);
              }
    
      sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => 
  {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => 
    {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    });
  });
    return;
  }
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

///////////////////
//Commandes admin// 
///////////////////
 
  if(command === "say") 
  {
    if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send("Vous n'avez pas les droits pour utiliser cette commande !");
    const sayMessage = args.join(" ");
    message.delete().catch(O_o=>{});  
    message.channel.send(sayMessage);
  }

  if(command === "kick") 
  {
    if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("Vous n'avez pas les droits pour utiliser cette commande !");

    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Syntaxe: *kick @membre raison");
    if(!member.kickable) 
      return message.reply("Je ne peux pas le kick! As-t-il un meilleur grade? Ai-je les permissions?");
    

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Veuillez indiquer une raison! Syntaxe: *kick @membre raison");
    
    await member.kick(reason)
      .catch(error => message.reply(`Désolé ${message.author} Je ne peux pas kick : ${error}`));
    message.reply(`${member.user.tag} a été kické par ${message.author.tag} pour: ${reason}`);
   }

  if(command === "ban") 
  {
    if(!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send("Vous n'avez pas les droits pour utiliser cette commande !");
    
    let member = message.mentions.members.first();
    if(!member)
      return message.reply("Syntaxe: *ban @membre raison");
    if(!member.bannable) 
      return message.reply("Je ne peux pas le ban! As-t-il un meilleur grade? Ai-je les permissions?");

    let reason = args.slice(1).join(' ');
    if(!reason)
      return message.reply("Veuillez indiquer une raison! Syntaxe: *ban @membre raison");
    
    await member.ban(reason)
      .catch(error => message.reply(`Sorry ${message.author} Je ne peux pas ban parce que: ${error}`));
    message.reply(`${member.user.tag} a été banni ${message.author.tag} pour: ${reason}`);
  }
  
  if(command === "purge") 
  {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("Vous n'avez pas les droits pour utiliser cette commande !");
    const deleteCount = parseInt(args[0], 10);
    
    if(!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply("Veuillez entrer une valeur entre 2 et 100. Syntaxe: *purge <nombre>");
    
    const fetched = await message.channel.fetchMessages({limit: deleteCount});
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Impossible de supprimer les messages parce que: ${error}`));
  }

///////////////////////
//Commandes générales//
///////////////////////

  if(command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! La latence est de ${Math.round(client.ping)}ms`);
  }
  
  if(command === "help") {
    const embed = new Discord.RichEmbed()
    .setTitle("Voici les commandes utilisable avec le bot Micheline (N'oubliez pas le prefix ' ; ' avant chaques commandes)")
    .setColor(0x00AE86)
    .addField("Commandes Admin","Say <texte>: envoie un message de la part du bot \nKick <@membre> <raison> \nBan <@membre> <raison> \nPurge <nombre> : supprime un certain nombre de messages")
    .addField("Commandes utilisable par tous:","Help: affiche l'aide \nPing: Pong! \nLevel: Affiche votre niveau et le nombre de points que vous avez")
    .addField("Commandes musicales:","Vous devez être dans un salon **vocal** obligatoirement!\nPlay <url>: diffuse une musique! (YouTube seulement) \nStop: Arrête la musique.");
    message.author.send({embed});
  }

/////////////////////
//Commandes musique//
/////////////////////

if(command === "play") 
{ 
  const url = args.join(" ");
    const regex = /^https:\/\/www\.youtube\.com\/watch/g;
    const regexb =/^https:\/\/youtu\.be/g;

    if (regex.test(url)==false && regexb.test(url)==false)
    {

      return message.reply("Mauvaise url! Elle doit commencer par <https://youtube.com/watch> ou https://youtu.be/");
    }

  ytdl.getInfo(url, (err, info) => 
  {
    console.log(`Musique jouee sur un serveur par ${message.author.id} alias ${message.author.username} !`);
    const voiceChannel = message.member.voiceChannel;
    if (!voiceChannel) 
    {
      return message.reply('Premierement entrez dans un salon vocal!');
    }

    voiceChannel.join()
    .then(connection => 
    {
      const stream = ytdl(url, { filter: 'audioonly' });
      const dispatcher = connection.playStream(stream);
      title=info.title;
      duree=info.length_seconds;
      message.channel.send(`Joue actuellement ${title} durant ${duree} secondes`);
      dispatcher.on('end', () => 
      {
        voiceChannel.leave();
        message.channel.send("Musique arrêtée.");
      });
    });
  });
}

if(command === "stop") {
  const voiceChannel = message.member.voiceChannel;
  //message.channel.send("Musique arrêtée.");
    voiceChannel.leave();
    musicplayed=0;
}

////////////////
//Commandes xp//
////////////////

   sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) 
    {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 1]);
    } else 
    {
            let curLevel = Math.floor(0.4 * Math.sqrt(row.points + 1));
              if (curLevel > row.level) 
              {
                row.level = curLevel;
                sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
                message.channel.send(`Niveau supérieur! Votre niveau est: ${row.level} `);
                console.log(`${author.id} est a présent niveau ${row.level}`);
              }
    
      sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => 
  {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => 
    {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    });
  });
   if(command === "level") 
   {
      sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => 
      {
      if (!row) return message.reply("Nouveau joueur!");
      message.reply(`Votre niveau est: ${row.level} ;)`);
    });
      sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => 
      {
      if (!row) return message.reply("Tristement vous n'avez aucun point pour le moment!");
      message.channel.send(`Vous avez ${row.points} points, bien joué! `);    
      });
    }
});

client.login(config.token);