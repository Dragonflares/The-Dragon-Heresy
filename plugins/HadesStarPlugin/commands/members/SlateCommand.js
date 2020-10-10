import { MemberCommand } from './MemberCommand';
import { Member, Tech } from '../../database';
import { MessageEmbed, MessageAttachment } from 'discord.js';
import { TechTree } from '../../techs';
import { confirmTech } from '../../utils';
import TechData from '../../../../assets/techs.json';
import { registerFont, Canvas, loadImage } from 'canvas';
import TheCanvas from 'canvas';

export class SlateCommand extends MemberCommand {
	constructor(plugin) {
		super(plugin, {
			name: 'slate',
			aliases: ['st'],
			description: "Gets the slate of an user",
			usage: "&slate <name>"
		});
	}

	async run(message, args) {
		let targetb
		let userb = message.mentions.users.first()
		if (!userb) {
			targetb = message.guild.member(message.author)
		}
		else targetb = message.guild.member(userb)
		let requester = message.guild.member(message.author)
		let error = false

		let author = (await Member.findOne({ discordId: requester.id.toString() }).catch(err => console.log(err)))
		if (!author)
			return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")
		else {
			let Carrier = await Member.findOne({ discordId: requester.id.toString() }).populate("Corp").exec()
			if (Carrier.Corp.corpId != message.guild.id.toString()) {
				return message.channel.send("You aren't a Member of this Corporation!")
			}
		}
		let CorpMember
		let CorpMember2 = (await Member.findOne({ discordId: targetb.id.toString() }).catch(err => console.logg(err)))
		if (!CorpMember2) {
			if (!userb) {
				return message.channel.send("You were never part of a Corporation! You must join one to have a tech tracker!")
			}
			else {
				return message.channel.send("This Member was never part of a Corporation! He must join one to have a tech tracker!")
			}

		} else {
			await Member.findOne({ discordId: targetb.id.toString() }).populate("Corp").exec((err, result) => {
				if (err) return console.log(err)
				else {
					if (result.Corp.corpId != message.guild.id.toString()) {
						if (!userb)
							return message.channel.send("You aren't in your home server")
						else
							return message.channel.send("You aren't in the home server of this Member")
					}
					else {

						return techCoolInformation(message, result)
					}
				}
			})
		}
	}
}

async function PreLoadImages() {
	let images = [];
	Object.keys(TechData).forEach(async (techname1) => {
		const tech = TechTree.find(techname1);
		images[techname1] = await loadImage(`./assets/images/modules/${techname1}.png`)
	})
	return images;
}

async function techCoolInformation(message, CorpMember) {
	let pImages = await PreLoadImages();
	console.log(`Getting info of :  ${CorpMember.name} `)
	var d = timer('All &ctech Command');
	await generateImage(message, CorpMember, pImages)
	d.stop();

}

async function generateImage(message, CorpMember, pImages) {
	const buffer = await roster(message, CorpMember, pImages);
	const filename = `image.jpg`;
	const attachment = new MessageAttachment(buffer, filename);
	await message.channel.send(attachment);
}

async function roster(message, CorpMember, pImages) {
	//Canvas
	const rosterImage = new Canvas(1725, 3550)
	const roster = rosterImage.getContext(`2d`)

	//Initial Valules
	let initialPlaceTop = 80
	let initialPlaceLeft = 85

	//Load module backgroud beforehand to not call it every time
	const moduleback = await TheCanvas.loadImage(`https://i.imgur.com/gl66HlY.png`)

	//Name
	roster.fillStyle = `#a2a832`
	roster.font = `80px "Atarian"`
	roster.fillText(`${CorpMember.name}:`, initialPlaceLeft + 30, initialPlaceTop)
	initialPlaceTop += 100


	let categories = ["Economy", "Mining", "Weapons", "Shields", "Support"]
	await Promise.all(categories.map(async (category, index) => {
		console.log(category)
		let name = category;
		if (name == "Economy") name = "Trade";
		roster.font = `50px "Atarian"`
		roster.fillText(name, initialPlaceLeft + 30, initialPlaceTop + 600 * index)
		roster.fillStyle = `#8debb1`
		roster.font = `50px "Atarian"`
		var d = timer(`Category ${name.toUpperCase()}`);
		await drawModuleCategory(rosterImage, moduleback, name, CorpMember, initialPlaceTop + 600 * index, initialPlaceLeft, 6, pImages);
		d.stop()

	}))
	return rosterImage.toBuffer()
}

async function drawModuleCategory(rosterImage, moduleback, category, CorpMember, initialPlaceTop, initialPlaceLeft, maxPerLine, pImages) {

	//variables
	let startPlaceTop = initialPlaceTop
	let startPlaceLeft = initialPlaceLeft
	let modulenum = 0


	let techs = await TechTree.findCategory(category);
	return await Promise.all(Array.from(techs.technologies.values()).map(async techFound => {
		let tech = await Tech.findOne({ name: techFound.name, playerId: CorpMember.discordId })
		var e = timer(`Module ${techFound.name}`);
		await drawModule(rosterImage, moduleback, tech, techFound.name, startPlaceTop, startPlaceLeft, pImages)
		e.stop()
		//Move next place
		modulenum += 1;
		if (modulenum == maxPerLine) {
			modulenum = 0;
			startPlaceLeft = initialPlaceLeft
			startPlaceTop += 250
		} else {
			startPlaceLeft += 250
		}
	})
	);

}


var timer = function (name) {
	var start = new Date();
	return {
		stop: function () {
			var end = new Date();
			var time = end.getTime() - start.getTime();
			console.log('Timer:', name, 'finished in', time, 'ms');
		}
	}
};
async function drawModule(rosterImage, moduleback, tech, techname1, startPlaceTop, startPlaceLeft, pImages) {
	const roster = rosterImage.getContext(`2d`)
	//constants
	let moduleBackSize = 80
	let moduleImageSize = 100
	let deltaTitleSize = 30

	//Draw Module background
	roster.drawImage(moduleback, startPlaceLeft, startPlaceTop + deltaTitleSize)

	//Small modules fixed required
	let smallFixLeft = 0;
	if (techname1 == "WeakBattery") smallFixLeft += 18;
	if (techname1 == "Battery") smallFixLeft += 5;
	if (techname1 == "DartLauncher") smallFixLeft += 18;

	//Draw module icon
	roster.drawImage(pImages[techname1], smallFixLeft + startPlaceLeft + moduleBackSize / 2 + 13, startPlaceTop + moduleBackSize / 2 + deltaTitleSize)

	//Add module level
	roster.fillText(`${tech.level}`, startPlaceLeft + moduleImageSize + 64, startPlaceTop + moduleImageSize * 2 - 4)
	return rosterImage.toBuffer();
}