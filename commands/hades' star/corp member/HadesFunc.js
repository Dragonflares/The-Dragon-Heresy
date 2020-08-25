
let TechData = require("../../../Database/Hades' Star/techs.json")
function GetObjArray(index)
{
	var fs = require('fs');
	var text = fs.readFileSync(`Assets/TextAsset/modules.bytes`, 'utf8');
	var last_key;
	var last_value;
	var level =1;
	const obj = text.split(/\n/g).reduce((p, c) => {
		const s = c.split(',');
		if(s[0] !== "")
		{
			last_key= s[0]
			last_value= s[index]
			level = 1
		}else{
			level = level+1
		}
		if(s[index] !=="")
		{
			last_value= s[index]
		}

		p[`${last_key}_${level}`] = last_value;
		return p;
	}, {}) 
	delete obj["Name"];
	delete obj[""];
	return obj;
}

function formatNumber (num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

function GetValue(key,obj)
{
	//console.log(`GetValue of ${key} is ${obj[key]}`);
	if( obj[key] === undefined ) {
		return null;
	}else{
		return obj[key];
	}
}

function GetString (key,lang) {
	if (lang == null)
	{
		lang = 'en'
	}
	var fs = require('fs');
	var text = fs.readFileSync(`Assets/TextAsset/loc_strings_${lang}.bytes`, 'utf8');
	
	const obj = text.split(/\n/g).reduce((p, c) => {
		const s = c.split(',');
		p[s.shift()] = s.join(',');
		return p;
	}, {}) 

 	if( obj[`"${key}"`] === undefined ) {
		return null;
	}else{
		return obj[`"${key}"`];
	}
}

const nameIndex=1;
const descIndex=2;
const iconIndex=4;


function capitalizeFirstLetter(string) 
{
  return string.replace(`"`,``).charAt(0).toUpperCase() + string.replace(`"`,``).slice(1).toLowerCase().replace(`"`,``);
}



module.exports =  {

GetIndexName : function (index) {
	switch(index) {
		case	0	: return `Name` ; break;
		case	1	: return `TID` ; break;
		case	2	: return `Description` ; break;
		case	3	: return `Research Level` ; break;
		case	4	: return `Icon` ; break;
		case	5	: return `ShowWSInfo` ; break;
		case	6	: return `ShowBSInfo` ; break;
		case	7	: return `InitialBlueprints` ; break;
		case	8	: return `Hide` ; break;
		case	9	: return `HideSelection` ; break;
		case	10	: return `DoNotAward` ; break;
		case	11	: return `Unlock Blueprints` ; break;
		case	12	: return `Unlock Price` ; break;
		case	13	: return `Research Time` ; break;
		case	14	: return `Category` ; break;
		case	15	: return `ActivationType` ; break;
		case	16	: return `Hydrogen Required` ; break;
		case	17	: return `Activation Delay` ; break;
		case	18	: return `Preparation Time Per Item` ; break; //APTPIOTTP
		case	19	: return `DisableActivationDuringPrep` ; break;
		case	20	: return `Activation Delay (White Star)` ; break;
		case	21	: return `Activation Delay (Blue Star)` ; break;
		case	22	: return `WeaponEffectType` ; break;
		case	23	: return `WeaponFx` ; break;
		case	24	: return `ClientActivationFx` ; break;
		case	25	: return `ActivateFX` ; break;
		case	26	: return `ActivateFXStaysInPlace` ; break;
		case	27	: return `SustainedFX` ; break;
		case	28	: return `ScaleEffectsWithZoom` ; break;
		case	29	: return `Cooldown` ; break;
		case	30	: return `Effect Range` ; break;
		case	31	: return `Effect Range (White Star)` ; break;
		case	32	: return `Effect Range (Blue Star)` ; break;
		case	33	: return `Speed Increase` ; break;
		case	34	: return `AOE Damage` ; break;
		case	35	: return `AOE Damage (White Star)` ; break;
		case	36	: return `AOE Damage (Blue star)` ; break;
		case	37	: return `AutoActivateHealth` ; break;
		case	38	: return `PreventShieldDuringActivation` ; break;
		case	39	: return `ApplyAOEDamageOnDestroy` ; break;
		case	40	: return `Effect Duration` ; break;
		case	41	: return `Effect Duration (White Star)` ; break;
		case	42	: return `Effect Duration (Blue Star)` ; break;
		case	43	: return `Upload Ammount` ; break;
		case	44	: return `MaxImpulse` ; break;
		case	45	: return `Shipment Reward Bonus` ; break;
		case	46	: return `ExtraTradeSlots` ; break;
		case	47	: return `Bonus Reward` ; break;
		case	48	: return `ExtraHydrogenStorage` ; break;
		case	49	: return `Mining Speed` ; break;
		case	50	: return `Extra Hydrogen Storage` ; break;
		case	51	: return `IsStealth` ; break;
		case	52	: return `Shield Strength` ; break;
		case	53	: return `IsAreaShield` ; break;
		case	54	: return `IsAOEOnlyShield` ; break;
		case	55	: return `Shield Regeneration Delay` ; break;
		case	56	: return `Time To Fully Regenerate` ; break;
		case	57	: return `Boost Percent` ; break;
		case	58	: return `DPS` ; break;
		case	59	: return `Additional DPS Per Target In Range` ; break;
		case	60	: return `Max DPS` ; break;
		case	61	: return `Max DPS Charging Time` ; break;
		case	62	: return `Max DPS Charging Time (Blue Star)` ; break;
		case	63	: return `IsEMP` ; break;
		case	64	: return `IsBarrier` ; break;
		case	65	: return `IsTeleport` ; break;
		case	66	: return `PullShips` ; break;
		case	67	: return `TimeWarp Factor` ; break;
		case	68	: return `IsTaunt` ; break;
		case	69	: return `Damage Reduction` ; break;
		case	70	: return `Life Extention` ; break;
		case	71	: return `Repair Per Second` ; break;
		case	72	: return `MineAllInSector` ; break;
		case	73	: return `IsSupress` ; break;
		case	74	: return `SalvageHullPercent` ; break;
		case	75	: return `IsDestiny` ; break;
		case	76	: return `TeleportToClosestCombat` ; break;
		case	77	: return `Mirror Damage` ; break;
		case	78	: return `Max Targets` ; break;
		case	79	: return `Threshold` ; break;//TradeBurstShipmentsStart
		case	80	: return `Bonus Reward` ; break;//TradeBurstShipmentBonus
		case	81	: return `Max Shipments` ; break;
		case	82	: return `Reward` ; break;//TradeStationDeliverReward
		case	83	: return `JumpToSafety` ; break;
		case	84	: return `TeleportToTradeStation` ; break;
		case	85	: return `Hydro Increase` ; break;
		case	86	: return `Speed Increase Per Shipment` ; break;
		case	87	: return `Instant Hydrogen Collected` ; break;
		case	88	: return `Max New Asteroids` ; break;
		case	89	: return `Hydro Per New Asteroid` ; break;
		case	90	: return `SwapLoadWithOtherTransport` ; break;
		case	91	: return `SpawnedShip` ; break;
		case	92	: return `Lifetime` ; break;
		case	93	: return `Lifetime (White Star)` ; break;
		case	94	: return `Total Cargo Slots` ; break;
		case	95	: return `AllowedStarTypes` ; break;
		case	96	: return `Bonus Per Additional Shipment` ; break;
		case	97	: return `PreventUseOnWsJumpgate` ; break;
		case	98	: return `Activation Cost` ; break;
		case	99	: return `Additional Hydrogen Use` ; break;//FuelUseIncrease
		case	100	: return `Install Price` ; break;
		case	101	: return `WhiteStarScore` ; break;
		case	102	: return `BSScore` ; break;
		case	103	: return `Target Switch Ticks` ; break;
		case	104	: return `DeactivateOnJump` ; break;
		case	105	: return `Min Public RS Level` ; break;
		case	106	: return `ReqEnemyShipsInSector` ; break;
		case	107	: return `StopCountdownOnDisable` ; break;
		case	108	: return `BSOnly` ; break;
		case	109	: return `IsRecoil` ; break;
		case	110	: return `IsImmolation` ; 

		default:
    // code block
	}
	return `Weird`
},

GetItem : function(key,index,lang) {
	if (index == 1)
	{
		return capitalizeFirstLetter(GetString(GetValue(key,GetObjArray(index)),lang))
	}else if (index == 2)
	{
		return GetString(GetValue(key,GetObjArray(index)),lang).replace(`"`,``).replace(`"`,``)
	}
	return GetValue(key,GetObjArray(index));
},
GetModules : function(){

	var fs = require('fs');
	var text = fs.readFileSync(`Assets/TextAsset/modules.bytes`, 'utf8');
	var last_key;
	var last_value;
	const obj = text.split(/\n/g).reduce((p, c) => {
		const s = c.split(',');
		last_key= s[0]
		last_value= s[1]
		p[`${last_key}`] = last_value;
		return p;
	}, {}) 
	delete obj["Name"];
	delete obj[""];
	return obj;	
},
IsModule : function(key) {
	
	return GetValue(key + `_1`,GetObjArray(1));
},

NameToDB : function (key){
	if(key == "TransportCapacity" ) return "CargoBayExtension";
	if(key == "Trader" ) return "TradeBoost";
	if(key == "MineralStorageCapacity" ) return "HydrogenBayExtension";
	if(key == "MassMining" ) return "RemoteMining";
	if(key == "WeakShield" ) return "AlphaShield";
	if(key == "StandardShield" ) return "DeltaShield";
	if(key == "StrongShield" ) return "OmegaShield";
	if(key == "HydroRocket" ) return "HydrogenRocket";
	if(key == "RedStarExtender" ) return "RedStarLifeExtender";
	if(key == "Repair" ) return "RemoteRepair";
	if(key == "Supress" ) return "Suppress";			
	return key;
},

NameToCsv : function(key){
	if(key == "CargoBayExtension" ) return "TransportCapacity";
	if(key == "TradeBoost" ) return "Trader";
	if(key == "HydrogenBayExtension" ) return "MineralStorageCapacity";
	if(key == "RemoteMining" ) return "MassMining";
	if(key == "AlphaShield" ) return "WeakShield";
	if(key == "DeltaShield" ) return "StandardShield";
	if(key == "OmegaShield" ) return "StrongShield";
	if(key == "HydrogenRocket" ) return "HydroRocket";
	if(key == "RedStarLifeExtender" ) return "RedStarExtender";
	if(key == "RemoteRepair" ) return "Repair";
	if(key == "Suppress" ) return "Supress";		
	return key;
},

IsBlackListed : function(key){
	if(key == "DestroyerVengeance") return true;
	if(key == "PhoenixShield") return true;
	if(key == "GuardianBattery") return true;
	if(key == "BomberLauncher") return true;
	if(key == "ColossusLaser") return true;
	if(key == "InterceptorMBattery") return true;
	if(key == "HydraBarrage") return true;
	if(key == "DartBarrage") return true;
	return false;
},
GetImage : function (key) {
	if ( key == "RemoteBomb") return "https://i.imgur.com/gQwHi4p.png";
	if ( key == "Recoil") return "https://i.imgur.com/4hB8qi1.png";
	if ( key == "Immolation") return "https://i.imgur.com/DsW12Vb.png";
	if ( key == "EMPRocket") return "https://i.imgur.com/C43huif.png";
	if( key in TechData) return TechData[key].Image;
		console.log(`Missing Image for ${key}`);
	return "";
	
},
CategoryToArt: function(key) {
	if( key = "Trade") return "Blue Crystals";
	if( key = "Mining") return "Blue Crystals";
	if( key = "Support") return "Tetrahedrons";
	if( key = "Shield") return "Orbs";
	if( key = "Weapon") return "Orbs";
	return "Arts";
},

GetEndLevel	  : function(key) {
	var i;
	var level = 1;
	for (i = 1; i < 30; i++) {
	    if( GetValue(`${key}_${i}`,GetObjArray(1)) != null)
			level = i;
		else
			break;
	}
	return level;
},

formatNumber : function(key) {
	return formatNumber(key);
},

secToTime : function(key) {
	
	 d = Number(key);
	var day = Math.floor(d / (24*3600));
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = (d % 3600 % 60);

    var dDisplay = day > 0 ? day + (day == 1 ? "d " : "d ") : "";
    var hDisplay = h > 0 & h<24 ? h + (h == 1 ? "h " : "h ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? "m " : "m ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay; 
}

};