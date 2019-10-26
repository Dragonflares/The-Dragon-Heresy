const Discord = require("discord.js")


function battleship(){
    let battleship = {   
        name : "",
        level : 1,
        weapon : "",
        shield : "",
        support : []
    }
    return battleship
}

function techTree() {
    let tech = {
        CargoBayExtension : 0,
        ShipmentComputer : 0,
        TradeBoost : 0,
        Rush : 0,
        TradeBurst : 0,
        ShipmentDrone : 0,
        Offload : 0,
        ShipmentBeam : 0,
        Entrust : 0,
        Dispatch : 0,
        Recall : 0,
        MiningBoost : 0,
        HydrogenBayExtension : 0,
        Enrich : 0,
        RemoteMining : 0,
        HydrogenUpload : 0,
        MiningUnity : 0,
        Crunch : 0,
        Genesis : 0,
        HydrogenRocket : 0,
        MiningDrone : 0,
        WeakBattery : 0,
        Battery : 0,
        Laser : 0,
        MassBattery : 0,
        DualLaser : 0,
        Barrage : 0,
        DartLauncher : 0,
        AlphaShield : 0,
        DeltaShield : 0,
        PassiveShield : 0,
        OmegaShield : 0,
        MirrorShield : 0,
        BlastShield : 0,
        AreaShield : 0,
        EMP : 0,
        Teleport : 0,
        RedStarLifeExtender : 0,
        RemoteRepair : 0,
        TimeWarp : 0,
        Unity : 0,
        Sanctuary : 0,
        Stealth : 0,
        Fortify : 0,
        Impulse : 0,
        AlphaRocket : 0,
        Salvage : 0,
        Suppress : 0,
        Destiny : 0,
        Barrier : 0,
        Vengeance : 0,
        DeltaRocket : 0,
        Leap : 0,
        Bond : 0,
        AlphaDrone : 0,
        Suspend : 0,
        OmegaRocket : 0,
    }
    return tech
}

module.exports = {
    player: function (targetb, message) {
        let player = {
            name : targetb.user.username,
            rank : 'Member',
            corp : `${message.guild.id}`,
            timezone : '+0',
            battleship : battleship(),
            miner : miner(),
            transport : transport(),
            techs : techTree() ,
            battlegroup : ""
        }
        return player
    }
}

function transport() {
    let transport= {
        name : "",
        level: 0,
        support : "",
        economy: []
    }
    return transport
}

function miner() {
    let miner= {
        name : "",
        level: 0,
        support : "",
        mining: []
    }
    return miner
}