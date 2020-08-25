let TechData = require("../../../Database/Hades' Star/techs.json")
let { RichEmbed } = require("discord.js")
const CorpModel = require("../../../Models/Guild")
const MemberModel = require("../../../Models/Member")
const Mongoose = require('mongoose')
let Player = require("../../../player.js")
const TechModel = require("../../../Models/Techs")
const { registerFont, Canvas} = require(`canvas`);
const TheCanvas = require(`canvas`)
const { Attachment } = require(`discord.js`);

module.exports = {
    name: "cooltech",
    aliases: ["ctech"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Shows the techs of a certain player in your corp.",
    usage: "&cooltech (player)",
    run: async (client, message, args) => {
        let targetb
        let userb = message.mentions.users.first()
        if(!userb){
            targetb = message.guild.member(message.author)
        }
        else targetb = message.guild.member(userb)
        let requester = message.guild.member(message.author)
        let error = false

        let author = (await MemberModel.findOne({discordId: requester.id.toString()}).catch(err => console.log(err)))
       // if(!author) 
       //     return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
        //else {
        //    let Carrier = await MemberModel.findOne({discordId: requester.id.toString()}).populate("Corp").exec()
        //    if(Carrier.Corp.corpId != message.guild.id.toString()){
        //        return message.channel.send("You aren't a Member of this Corporation!")
        //    }
        //}
        //let CorpMember
        //let CorpMember2 = (await MemberModel.findOne({discordId: targetb.id.toString()}).catch(err => console.logg(err)))
        //if(!CorpMember2){
        //    if(!userb){
        //        return message.channel.send("You were never part of a Corporation! You must join one to have a tech tracker!")
        //    }
        //    else {
         //       return message.channel.send("This Member was never part of a Corporation! He must join one to have a tech tracker!")
         //   }
        //} 
        //else {
            await MemberModel.findOne({discordId: targetb.id.toString()}).populate("Corp").exec((err, result) => {
                if(err) return console.log(err)
                else {
                   // if(result.Corp.corpId != message.guild.id.toString()) {
                   //     if(!userb)
                    //        return message.channel.send("You aren't in your home server")
                   //     else
                   //         return message.channel.send("You aren't in the home server of this Member")
                   // }
                //    else {
                         
                        return techCoolInformation(message, result)
                //    }
               }
            })
        //}
    }
}

async function PreLoadImages(){
	let images = [];
	var techDato = new Object()
	Object.keys(TechData).forEach(async(techname1) =>{
		 images[techname1] = await TheCanvas.loadImage(`${TechData[techname1].Image}`)
		})	
	return images;
}

async function techCoolInformation(message,CorpMember) {
	let pImages = await PreLoadImages();
	console.log(`Getting info of :  ${CorpMember.name} `)
	var d = timer('All &ctech Command');
	await generateImage(message,CorpMember,pImages)
	d.stop();
	
}

async function generateImage(message,CorpMember,pImages) {
    const buffer = await roster(message,CorpMember,pImages);
    const filename = `image.jpg`;
    const attachment = new Attachment(buffer, filename);
    await message.channel.send(attachment);
}

async function roster(message,CorpMember,pImages) {
	//Canvas
	const rosterImage = new Canvas(1725, 3550)
    const roster = rosterImage.getContext(`2d`)
	
	//Initial Valules
	let initialPlaceTop  = 80
    let initialPlaceLeft = 85
	
	//Load module backgroud beforehand to not call it every time
	const moduleback = await TheCanvas.loadImage(`https://i.imgur.com/gl66HlY.png`)


	//Run for Economy
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`	
	roster.fillText(`TRADE`, initialPlaceLeft +30, initialPlaceTop)	
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`	
	var d = timer(`Category Economy`);
	await drawModuleCategory(rosterImage,moduleback,"Economy",CorpMember,initialPlaceTop,initialPlaceLeft,6,pImages);
	d.stop()
	initialPlaceTop += 600

	//Run for Economy
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`	
	roster.fillText(`MINING`, initialPlaceLeft +30, initialPlaceTop)	
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`	
	await drawModuleCategory(rosterImage,moduleback,"Mining",CorpMember,initialPlaceTop,initialPlaceLeft,6,pImages);
	
	initialPlaceTop += 600
	
	//Run for Economy
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`	
	roster.fillText(`WEAPONS`, initialPlaceLeft +30, initialPlaceTop)		
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`
	await drawModuleCategory(rosterImage,moduleback,"Weapons",CorpMember,initialPlaceTop,initialPlaceLeft,6,pImages);
	
	initialPlaceTop += 600
	
	//Run for Economy
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`	
	roster.fillText(`SHIELDS`, initialPlaceLeft +30, initialPlaceTop)		
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`
	await drawModuleCategory(rosterImage,moduleback,"Shields",CorpMember,initialPlaceTop,initialPlaceLeft,6,pImages);
	
	initialPlaceTop += 600
	
	//Run for Economy
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`	
	roster.fillText(`SUPPORT`, initialPlaceLeft +30, initialPlaceTop)	
	roster.fillStyle = `#8debb1`
	roster.font = `50px "Atarian"`	
	
	//const promises = array.map(
	
	await drawModuleCategory(rosterImage,moduleback,"Support",CorpMember,initialPlaceTop,initialPlaceLeft,6,pImages)
	//await Promise.all(promises)
	//await drawModuleCategory(rosterImage,moduleback,"Support",CorpMember,initialPlaceTop,initialPlaceLeft,6,pImages);
	
	return rosterImage.toBuffer()
}

async function drawModuleCategory(rosterImage,moduleback,category,CorpMember,initialPlaceTop,initialPlaceLeft,maxPerLine,pImages)
{	

	//variables
	let startPlaceTop  = initialPlaceTop
    let startPlaceLeft = initialPlaceLeft
	let modulenum=0
	let finalArray = [];
	
	 return await Promise.all(Object.keys(TechData).map(async(techname1) => { // map instead of forEach
		if(TechData[techname1].Category === category) {
			let tech = await TechModel.findOne({name: techname1, playerId: CorpMember.discordId})
			var e = timer(`Module ${techname1}`);
			await drawModule(rosterImage,moduleback,tech,techname1,startPlaceTop,startPlaceLeft,pImages)
			e.stop()
			//Move next place
			modulenum+=1;
			if(modulenum == maxPerLine)
			{
				modulenum=0;
				startPlaceLeft = initialPlaceLeft
				startPlaceTop += 250
			}else{
				startPlaceLeft += 250
			}
		}
	})
	);
	
}


var timer = function(name) {
    var start = new Date();
    return {
        stop: function() {
            var end  = new Date();
            var time = end.getTime() - start.getTime();
            console.log('Timer:', name, 'finished in', time, 'ms');
        }
    }
};
async function drawModule(rosterImage,moduleback,tech,techname1,startPlaceTop,startPlaceLeft,pImages)
{
	const roster = rosterImage.getContext(`2d`)
	//constants
	let moduleBackSize = 80
	let moduleImageSize = 100
	let deltaTitleSize = 30
	
	//Draw Module background
	roster.drawImage(moduleback, startPlaceLeft, startPlaceTop + deltaTitleSize )

	//Small modules fixed required
	let smallFixLeft =0;
	if(techname1 == "WeakBattery") smallFixLeft +=18;
	if(techname1 == "Battery") smallFixLeft +=5;
	if(techname1 == "DartLauncher") smallFixLeft +=18;
	
	//Draw module icon
	roster.drawImage(pImages[techname1], smallFixLeft + startPlaceLeft + moduleBackSize/2 + 13, startPlaceTop + moduleBackSize/2 + deltaTitleSize)
	
	//Add module level
	roster.fillText(`${tech.level}`, startPlaceLeft + moduleImageSize + 64, startPlaceTop + moduleImageSize*2 -4)
	return rosterImage.toBuffer();
}