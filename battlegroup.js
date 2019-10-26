module.exports = { 
    battlegroupMember: function(){
        let member = {
            player : {},
            role: "",
            support : ""
        }
        return member
    }
}

module.exports = {
    battlegroup: function (message) {
        let battlegroup = {
            name : "",
            captain: {},
            corp : `${message.guild.id}`,
            members : []
        }
        return battlegroup
    }
}