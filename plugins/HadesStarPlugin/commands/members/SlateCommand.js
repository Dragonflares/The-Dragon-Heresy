import { MemberCommand } from './MemberCommand';
import { Member, Tech, Corp } from '../../database';
import { MessageAttachment } from 'discord.js';
import { TechTree } from '../../techs';
import TechData from '../../../../assets/techs.json';
import { Canvas, loadImage } from 'canvas';
import { confirmResultButtons } from '../../utils';

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
		let dMember = message.author;
		let dTarget = message.mentions.users.first() || message.author;
		let target
		if (!args[0]) {
			dTarget = message.mentions.users.first() || message.author;
			target = (await Member.findOne({ discordId: dTarget.id.toString() }).populate("Corp").populate("techs").populate("shipyardLevels").catch(err => console.logg(err)))
		} else {
			let corp = await Corp.findOne({ corpId: message.guild.id.toString() }).populate('members').exec();
			let memberslist = new Map(corp.members.map(t => [t.name, t]))
			let member = await confirmResultButtons(message, args.join(' '), [...memberslist.keys()])
			if (!member) return;
			target = (await Member.findOne({ discordId: memberslist.get(member).discordId.toString() }).populate("Corp").populate("techs").populate("shipyardLevels").catch(err => console.logg(err)))
		}

		if (!target)
			return message.channel.send("You aren't part of any Corporations, so you cannot request this information from anyone.")

		if (dMember.id != dTarget.id && target.Corp.corpId != message.guild.id.toString())
			return message.channel.send("You can't see a Member tech outside of your Corporation!");

		if (!target)
			return message.channel.send("This Member was never part of a Corporation! He must join one to have a tech tracker!");

		return this.techCoolInformation(message, target, args);
	}

	async techCoolInformation(message, CorpMember, args) {
		let pImages = await this.preLoadImages();
		console.log(`Getting info of :  ${CorpMember.name} `)
		var d = timer('All &ctech Command');
		await this.generateImage(message, CorpMember, pImages)
		d.stop();

	}

	async preLoadImages() {
		let images = [];
		Object.keys(TechData).forEach(async (techname1) => {
			const tech = TechTree.find(techname1);
			images[techname1] = await loadImage(`./assets/images/modules/${techname1}.png`)
		})
		return images;
	}

	async generateImage(message, CorpMember, pImages) {
		const buffer = await this.roster(CorpMember, pImages);
		const filename = `image.jpg`;
		const attachment = new MessageAttachment(buffer, filename);
		await message.channel.send(attachment);
	}

	async roster(CorpMember, pImages) {
		//Canvas
		const rosterImage = new Canvas(2325, 4380)
		const roster = rosterImage.getContext(`2d`)
		roster.fillStyle = `#101415`;
		roster.fillRect(0, 0, rosterImage.width, rosterImage.height);

		//Initial Valules
		let initialPlaceTop = 180
		let initialPlaceLeft = 85

		//Load module backgroud beforehand to not call it every time
		const moduleback = await loadImage(`./assets/images/modules/ModuleBack.png`)

		//Name
		roster.fillStyle = "white"
		roster.font = `120px "Atarian"`
		roster.fillText(`${CorpMember.name}`, initialPlaceLeft, initialPlaceTop)
		initialPlaceTop += 160
		let nextHeight = 0
		let categories = ["Economy", "Mining", "Weapons", "Shields", "Support"]
		let separations = [0, 800, 1600, 2200, 2800]

		//Ship Levels
		let newbsLevel = 1
		let newminerLevel = 1
		let newtpsLevel = 1

		if (CorpMember.shipyardLevels) {
			newbsLevel = CorpMember.shipyardLevels.battleshiplevel
			newminerLevel = CorpMember.shipyardLevels.minerlevel
			newtpsLevel = CorpMember.shipyardLevels.transportlevel
		}
		const bsImage = await loadImage(`./assets/images/Battleship${newbsLevel}.png`)
		const msImage = await loadImage(`./assets/images/Miner${newminerLevel}.png`)
		const tpsImage = await loadImage(`./assets/images/Transport${newtpsLevel}.png`)
		
		let scale = 0.4
		let leftPlace = rosterImage.width - msImage.naturalWidth * scale * 1.5
		
		roster.drawImage(msImage, leftPlace, initialPlaceTop + 40 - msImage.naturalHeight * scale, msImage.naturalWidth * scale, msImage.naturalHeight * scale)
		leftPlace -= msImage.naturalWidth * scale * 1.5
		roster.drawImage(tpsImage, leftPlace, initialPlaceTop + 40- tpsImage.naturalHeight * scale, tpsImage.naturalWidth * scale, tpsImage.naturalHeight * scale)
		leftPlace -= tpsImage.naturalWidth * scale * 2.5
		roster.drawImage(bsImage, leftPlace, initialPlaceTop + 40- bsImage.naturalHeight * scale, bsImage.naturalWidth * scale, bsImage.naturalHeight * scale)

		await Promise.all(categories.map(async (category, index) => {
			roster.font = `100px "Atarian"`
			roster.fillStyle = `#44645b`
			nextHeight = await this.drawModuleCategory(rosterImage, moduleback, category, CorpMember, initialPlaceTop + separations[index], initialPlaceLeft, pImages);
		}))
		return rosterImage.toBuffer()
	}

	async drawModuleCategory(rosterImage, moduleback, category, CorpMember, initialPlaceTop, initialPlaceLeft, pImages) {
		const roster = rosterImage.getContext(`2d`)

		//Title
		let name = category;
		if (name == "Economy") name = "Trade";
		roster.fillText(name.toUpperCase(), initialPlaceLeft, initialPlaceTop)

		//variables
		let startPlaceTop = initialPlaceTop + 100
		let startPlaceLeft = initialPlaceLeft
		let modulenum = 0
		let scale = 1.5
		let maxPerLine = 7

		//Get Player techs
		const memberTechs = new Map(CorpMember.techs.filter(t => t.level > 0).map(t => [t.name, t]).sort((a, b) => a.name > b.name ? 1 : -1));

		//Get Technology Tree
		let techs = await TechTree.getCategory(category);

		await Promise.all(Array.from(techs.technologies.values()).map(techFound => {
			let tech = memberTechs.get(techFound.name)
			//Draw Module background
			let backHeight = moduleback.naturalHeight * scale
			let backWidth = moduleback.naturalWidth * scale
			roster.drawImage(moduleback, startPlaceLeft, startPlaceTop, backWidth, backHeight)

			let moduleHeight = pImages[techFound.name].naturalHeight * scale
			let moduleWidth = pImages[techFound.name].naturalWidth * scale

			//Draw module icon
			roster.drawImage(pImages[techFound.name], startPlaceLeft + backWidth / 2 - moduleWidth / 2, startPlaceTop + backHeight / 2 - moduleHeight / 2, moduleWidth, moduleHeight)
			//Add module level
			roster.font = `80px "Atarian"`
			roster.fillStyle = `#8debb1`
			let level = 0
			if (tech) level = tech.level;
			roster.fillText(`${level}`, startPlaceLeft + backWidth * 4 / 5, startPlaceTop + backHeight)

			//Move next place
			modulenum += 1;
			if (modulenum == maxPerLine) {
				modulenum = 0;
				startPlaceLeft = initialPlaceLeft
				startPlaceTop += backHeight * 1.1
			} else {
				startPlaceLeft += backWidth * 1.1
			}
		}));
		return startPlaceTop;
	}


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

