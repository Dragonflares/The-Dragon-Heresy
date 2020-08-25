let TechData = require("../../../Database/Hades' Star/techs.json")
const { RichEmbed } = require("discord.js")
const HadesFunc = require('./HadesFunc.js');

module.exports = {
    name: "techdata",
    aliases: ["td"],
    category: "hades' star",
    subcategory: "corp member",
    description: "Returns info about a certain tech in a certain level.",
    usage: "&techdata (tech) (level). Not stating any tech will show all existing techs, stating a tech will show it's description and max level. Stating a level will give detailed info on it",
    run: async (client, message, args) => {
        let embed = new RichEmbed()
            .setColor("RANDOM")
        const tech = message.content.split(" ")
		lang = "en";
	
        if(!tech[1]) { // Techs List
            embed.setTitle(`**Known Techs**`)

			var str = "";
			var cat_val = {};
			var modules = HadesFunc.GetModules();
			for (var key of Object.keys(modules)) {
				if(HadesFunc.IsBlackListed(key)) continue;			
				newKey = `${key}_1`;
				translatedKey = HadesFunc.NameToDB(key)
				cat_val[`${HadesFunc.GetItem(newKey,14,``)}`] +=  `,${translatedKey}`;
			}

			for (var key of Object.keys(cat_val))
			{
				var values =cat_val[key].replace("undefined,", "")
				 embed.addField(`*${key}*`, `${values}`)
			}
			
            return message.channel.send(embed)
        }
        else {
			csvName=HadesFunc.NameToCsv(tech[1])
			dbName = HadesFunc.NameToDB(tech[1])
			if(!HadesFunc.IsModule(csvName)) return message.channel.send(`There's no tech with said name ${tech[1]}!`)
            
		if(!tech[2]) { // General Description
                let techs;
				if(dbName in TechData)
				{
					techs = `${TechData[dbName].Description}\n`
					embed.setDescription(techs)
				}else{
				
					techs = HadesFunc.GetItem(csvName + "_1",2,lang).replace(`\n`,``);
					artlevel = parseInt(HadesFunc.GetItem(csvName + "_1",3,"en")) +1;
					research = `Blueprints are obtained by researching level ${artlevel}+ ${HadesFunc.CategoryToArt(HadesFunc.GetItem(csvName + "_1",14,"en"))}\n`
					embed.setDescription(`${techs}\n${research}`)
					
				}	
				embed.setTitle(`**Tech: ${dbName}**`)				
				embed.setFooter(`You may add a number between 1 and ${HadesFunc.GetEndLevel(csvName)} to get info about the required level`)
				embed.setThumbnail(`${HadesFunc.GetImage(dbName)}`)
              
                return message.channel.send(embed)
            }
            else { //Level Description
					level = parseInt(tech[2]);
                if((1 > tech[2]) || parseInt(HadesFunc.GetEndLevel(csvName)) < (tech[2])) {
                    return message.channel.send(`The level you requested is invalid for that tech!`)
                }
				if(1==2)//(dbName in TechData)
				{
					embed.setTitle(`**${tech[1]}**`)
					let a = 0
					const techinfo = Object.values(TechData[dbName])
					const techkeys = Object.keys(TechData[dbName])
					while(techkeys[a]){
						
						if(techkeys[a] === "Description" || techkeys[a] === "Category") {
							embed.addField(`*${techkeys[a]}*`, `${techinfo[a]}`)
						}
						else if(techkeys[a] === "Image") {
							embed.setThumbnail(`${techinfo[a]}`)
						}
						else {
							embed.addField(`*${techkeys[a]}*`, `${techinfo[a][tech[2] - 1]}`)
						}
						a++
					}
				}else{
					embed.setTitle(`**${dbName}**`)
					embed.setThumbnail(`${HadesFunc.GetImage(dbName)}`)
					newKey = csvName + "_" + level;
					var skips = [1,2,4,5,6,7,8,9,10,15,19,22,23,24,25,26,27,28,44,51,53,54,63,64,65,66,68,72,73,75,76,83,84,90,91,95,97,101,102,104,106,107,108,109,110]; 
					var str = "";
					var i;
					var tabs=110;
					artlevel = parseInt(HadesFunc.GetItem(csvName + "_1",3,"en")) +1;
					for (i = 1; i < tabs; i++) {
						if( skips.includes(i) == true ) continue;
						var val = HadesFunc.GetItem(newKey,i,lang)
						if (i == 41 && val == "") // WS sometimes doesnt have a value 
						{
							val="special1"; 
						}
						if(val !== ""){
							if(val == "special1"){
								if(HadesFunc.GetItem(newKey,40,lang)== "") continue;
								mes = `${HadesFunc.GetItem(newKey,40,lang)}`;
							}else{
								mes = `${HadesFunc.GetItem(newKey,i,lang)}`;
							}
								if(i == 3) //mes ++; // Research Level, Starts from 0
								 mes = `Blueprints are obtained by researching level ${artlevel}+ ${HadesFunc.CategoryToArt(HadesFunc.GetItem(newKey,14,"en"))}\n`;
								if(i == 13) mes = HadesFunc.secToTime(mes); //Unlock Time
								if(i == 18) mes = HadesFunc.secToTime(parseInt(mes/5)); //Dispatch
								if(i == 29) mes = HadesFunc.secToTime(mes); //CoolDown
								if(i == 30) mes = parseInt(mes)/10 + " AU"; //Effect Duration
								if(i == 40) mes = HadesFunc.secToTime(mes/10); //Effect Duration
								if(i == 17 || i == 21 ||i == 41||i == 55 ||i == 56  ||i == 61   ||i == 62 ||i == 70  || i == 92 || i == 93) mes = HadesFunc.secToTime(mes); //Effect Duration WS
								if(i == 42) mes = HadesFunc.secToTime(mes/10); //Effect Duration BS
								if(i == 33 ||i == 45 || i == 47  || i == 57 || i == 69 || i == 77 || i == 80 || i == 82 || i == 85|| i == 96) mes = mes + "%"; //Shippment reward bonus
								if(i == 49 || i == 67) mes = mes/100 + "x"; //mining speed
								if(i == 99) mes = mes/5 + "/100 AU"; //Effect Duration BS
								if (!isNaN(mes)) mes = HadesFunc.formatNumber(parseInt(mes)); // Put commas on values
								embed.addField(HadesFunc.GetIndexName(i),mes);
								
								if(i == 29) //CoolDown for WS
								{
									embed.addField(HadesFunc.GetIndexName(i) + " (White Star)", HadesFunc.secToTime(HadesFunc.GetItem(newKey,i,lang)*600));
								}	
							
					  }
					}
					//Keep Description at the end  (2)
					embed.addField(HadesFunc.GetIndexName(2),`${HadesFunc.GetItem(newKey,2,lang)}`);
				}
                return message.channel.send(embed)
            }
        }
    }
}