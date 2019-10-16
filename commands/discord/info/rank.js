const { registerFont, Canvas} = require('canvas');
const TheCanvas = require('canvas')
const { Attachment } = require('discord.js');

const SQLite = require("better-sqlite3");
const sql = new SQLite('./Database/experience.sqlite');


module.exports = {
    name: "rank",
    category: "discord",
    subcategory: "info",
    description: "Gives the xp and the level you currently have.",
    usage: "<id | mention>",
    run: async (client, message, args, queue) => {
        try {
          const buffer = await profile(message, client);
          const filename = `profile-${message.author.id}.jpg`;
          const attachment = new Attachment(buffer, filename);
          await message.channel.send(attachment);
          
        } catch (error) {
          client.logger.error(error.stack);
          return message.channel.send(`An error ocurred: **${error.message}**`);
        }
    }
}
async function profile(message, client) {
    const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'xp';").get();
    if (!table['count(*)']) {
       sql.prepare("CREATE TABLE xp (id TEXT PRIMARY KEY, user TEXT, guild TEXT, experience INTEGER, level INTEGER);").run();
       sql.prepare("CREATE UNIQUE INDEX idx_xp_id ON xp (id);").run();
       sql.pragma("synchronous = 1");
       sql.pragma("journal_mode = wal");
    }
    client.getExp = sql.prepare("SELECT * FROM xp WHERE user = ? AND guild = ?");
    client.setExp = sql.prepare("INSERT OR REPLACE INTO xp (id, user, guild, experience, level) VALUES (@id, @user, @guild, @experience, @level);")

    const member = message.author;
    const guildMember = message.guild.members.get(member.id)
    let xp = client.getExp.get(message.author.id, message.guild.id);
    const curlevel = xp.level
    let nxtlevel = curlevel * 300
    let necessary = xp.experience / nxtlevel

    try {
      const foxCavalier = './fonts/Fox_Cavalier.otf'
      const batmanfont = "./fonts/batman_forever/batmfa__.ttf"
      const bignoodle = './fonts/bignoodletitling/big_noodle_titling.ttf'
      registerFont(batmanfont, {family: 'BatmanFonts'})
      registerFont(foxCavalier, {family: 'FoxCavalier'})
      registerFont(bignoodle, {family: "Noodle"})
      const rankImage = new Canvas(470, 130)
      const buildRank = rankImage.getContext('2d')
      const background = await TheCanvas.loadImage('./canvas/canvasbackground.jpg')
      
      buildRank.drawImage(background, 0, 0, rankImage.width, rankImage.height)
      
      buildRank.fillStyle = '#00fff8'

      if(!guildMember.nickname){

        buildRank.font = '20px "Noodle"'
        buildRank.fillText(guildMember.user.username, '110', '50')
      }
      else{
        buildRank.font = '20px "Noodle"'
        buildRank.fillText(guildMember.nickname, '110', '50')
      }



      buildRank.font = '14px "Noodle"'
      buildRank.fillText('Level:', '315', '65')
      
      buildRank.font = '19px "Noodle"'
      buildRank.fillText(curlevel, '340', '65')

      //   XP Label
      const XPradius = 18
      const XP_X = 130
      const XP_Y = 90
      buildRank.fillText('XP', XP_X, XP_Y,)
      buildRank.font = '12px "Noodle"'
      buildRank.fillText('progress', XP_X + 15, XP_Y)
      buildRank.fillText(`${xp.experience} / ${nxtlevel}`, '315', '90')
      buildRank.fillStyle = '#a8a8a8'
      buildRank.font = '10px "Noodle"'
      buildRank.fillText('xp', '355', '90')
      //   XP Bar
      buildRank.fillStyle = '#313131'
      const XP_BAR_HEIGHT = 13
      const XP_BAR_WIDTH = 470/2
      roundRect(buildRank, XP_X, XP_Y + 5, XP_BAR_WIDTH, XP_BAR_HEIGHT, XPradius, true, true)
      //   XP Bar current
      buildRank.fillStyle = '#00fff8'
      roundRect(buildRank, XP_X, XP_Y + 5, XP_BAR_WIDTH* necessary, XP_BAR_HEIGHT, XPradius, true, true)

      let ring

      if(xp.level < 3) {
        ring = await TheCanvas.loadImage('./canvas/ranklevelborders/level0.png')
      }
      else if(xp.level < 5) {
        ring = await TheCanvas.loadImage('./canvas/ranklevelborders/level3.png')
      }
      else if(xp.level < 10) {
        ring = await TheCanvas.loadImage('./canvas/ranklevelborders/level5.png')
      }
      else if(xp.level < 15) {
        ring = await TheCanvas.loadImage('./canvas/ranklevelborders/level10.png')
      }
      else{
        ring = await TheCanvas.loadImage('./canvas/ranklevelborders/level15.png')
      }
      if(xp.level < 15){
        buildRank.drawImage(ring, 13, 17, 94, 94)
      }
      else {
        buildRank.drawImage(ring, 11, 15, 100, 100)
      }


      buildRank.beginPath();
      buildRank.arc(60, 65, 40, 0, Math.PI * 2, true);
      buildRank.closePath();
      buildRank.clip();

      const avatar = await TheCanvas.loadImage(member.displayAvatarURL);
      buildRank.drawImage(avatar, 20, 25, 80, 80);

 


      return rankImage.toBuffer();
    } 
    catch (error) {
      await message.channel.send(`An error occurred: **${error.message}**`);
    }
}

async function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  var cornerRadius = { upperLeft: 0, upperRight: 0, lowerLeft: 0, lowerRight: 0 };
  if (typeof stroke == "undefined") {
      stroke = true;
  }
  if (typeof radius === "object") {
      for (var side in radius) {
          cornerRadius[side] = radius[side];
      }
  }
  else {
    cornerRadius.upperRight = radius/2
    cornerRadius.upperLeft = radius/2
    cornerRadius.lowerRight = radius/2
    cornerRadius.lowerLeft = radius/2
  }

  ctx.beginPath();
  ctx.moveTo(x + cornerRadius.upperLeft, y);
  ctx.lineTo(x + width - cornerRadius.upperRight, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius.upperRight);
  ctx.lineTo(x + width, y + height - cornerRadius.lowerRight);
  ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius.lowerRight, y + height);
  ctx.lineTo(x + cornerRadius.lowerLeft, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius.lowerLeft);
  ctx.lineTo(x, y + cornerRadius.upperLeft);
  ctx.quadraticCurveTo(x, y, x + cornerRadius.upperLeft, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }
  return ctx
}