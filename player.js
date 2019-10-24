const Discord = require("discord.js")

class Battleship {
    constructor(){
        this.name = ""
        this.level = 1
        this.weapon = ""
        this.shield = ""
        this.support = []
    }
}

class TechTree {
    constructor() {
        this.CargoBayExtension = 0
        this.ShipmentComputer = 0
        this.TradeBoost = 0
        this.Rush = 0
        this.TradeBurst = 0
        this.ShipmentDrone = 0
        this.Offload = 0
        this.ShipmentBeam = 0
        this.Entrust = 0
        this.Dispatch = 0
        this.Recall = 0
        this.MiningBoost = 0
        this.HydrogenBayExtension = 0
        this.Enrich = 0
        this.RemoteMining = 0
        this.HydrogenUpload = 0
        this.MiningUnity = 0
        this.Crunch = 0
        this.Genesis = 0
        this.HydrogenRocket = 0
        this.MiningDrone = 0
        this.WeakBattery = 0
        this.Battery = 0
        this.Laser = 0
        this.MassBattery = 0
        this.DualLaser = 0
        this.Barrage = 0
        this.DartLauncher = 0
        this.AlphaShield = 0
        this.DeltaShield = 0
        this.PassiveShield = 0
        this.OmegaShield = 0
        this.MirrorShield = 0
        this.BlastShield = 0
        this.AreaShield = 0
        this.EMP = 0
        this.Teleport = 0
        this.RedStarLifeExtender = 0
        this.RemoteRepair = 0
        this.TimeWarp = 0
        this.Unity = 0
        this.Sanctuary = 0
        this.Stealth = 0
        this.Fortify = 0
        this.Impulse = 0
        this.AlphaRocket = 0
        this.Salvage = 0
        this.Suppress = 0
        this.Destiny = 0
        this.Barrier = 0
        this.Vengeance = 0
        this.DeltaRocket = 0
        this.Leap = 0
        this.Bond = 0
        this.AlphaDrone = 0
        this.Suspend = 0
        this.OmegaRocket = 0
    }
}



class Player {

    constructor(targetb, message){
        this.user = targetb.user.username
        this.rank = 'Member'
        this.corp = `${message.guild.id}`
        this.timezone = '+0'
        this.battleship = new Battleship()
        this.techs = new TechTree()
    }
}

module.exports = Player