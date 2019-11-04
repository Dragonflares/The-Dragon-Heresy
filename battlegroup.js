module.exports = { 
    battlegroupMember: function(){
        let member = {
            player : {},
            rolebattlegroup1: "",
            rolebattlegroup2: "",
            support: ""
        }
        return member
    },
    guildbattlegroup: function() {
        let guild = {
            battlegroup1 : {},
            battlegroup2 : {}
        }
        return guild
    },
    battlegroup: function (message) {
        let battlegroup = {
            name : "",
            captain: "",
            members : []
        }
        return battlegroup
    }
}