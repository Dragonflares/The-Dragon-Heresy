const { registerFont, Canvas} = require('canvas');
const TheCanvas = require('canvas')
const { Attachment } = require('discord.js');
const fetch = require('node-fetch');
let xp = require('../../xp.json')
const imageUrlRegex = /\?size=2048$/g;
const placeholder = new Map();

module.exports = {
    name: "rank",
    category: "info",
    description: "Gives the xp and the level you currently have.",
    usage: "<id | mention>",
    run: async (client, message, args, queue) => {
        const key = `${message.guild.id}-${message.author.id}`;

        try {
          if (!placeholder.has(key)) {
            placeholder.set(key, {
              user: message.author.id, guild: message.guild.id, points: 500, level: 17
            });
          }
      
          const buffer = await profile(message, placeholder.get(key));
          const filename = `profile-${message.author.id}.jpg`;
          const attachment = new Attachment(buffer, filename);
          await message.channel.send(attachment);
          
        } catch (error) {
          client.logger.error(error.stack);
          return message.channel.send(`An error ocurred: **${error.message}**`);
        }
    }
}
async function profile(message, score) {
    const key = `${message.guild.id}-${message.author.id}`;
    const member = message.author;
    const guildMember = message.guild.members.get(member.id)
    if(!xp[message.guild.id][message.author.id]){
      message.channel.send(`You haven't done any talk in this server.`)
      return;
    }
    let nxtlevel = xp[message.guild.id][message.author.id].level * 300;
    let necessary = xp[message.guild.id][message.author.id].xp / nxtlevel
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
      const curlevel = xp[message.guild.id][message.author.id].level
      buildRank.fillStyle = '#00fff8'

      buildRank.font = '20px "Noodle"'
      buildRank.fillText(guildMember.nickname, '110', '50')

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
      buildRank.fillText(`${xp[message.guild.id][message.author.id].xp} / ${nxtlevel}`, '325', '90')
      //   XP Bar
      buildRank.fillStyle = '#313131'
      const XP_BAR_HEIGHT = 13
      const XP_BAR_WIDTH = 470/2
      roundRect(buildRank, XP_X, XP_Y + 5, XP_BAR_WIDTH, XP_BAR_HEIGHT, XPradius, true, true)
      //   XP Bar current
      buildRank.fillStyle = '#00fff8'
      roundRect(buildRank, XP_X, XP_Y + 5, XP_BAR_WIDTH* necessary, XP_BAR_HEIGHT, XPradius, true, true)


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