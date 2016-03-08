var Commands = {
    name: 'Core-Servers',
    commands: [
        {
            name: 'join',
            admin: true,
            callback: function(e, bot){
                var args = e.message.content.split(" ");
                if (args.length >= 2) {
                    var arg = args[1];
                    arg = arg.substring(arg.lastIndexOf("/")+1);
                    var invites = manager.bot.client.Invites;
                    invites.accept(arg).then(function(invite) {
                        e.message.channel.sendMessage('Joined server: ' + invite.guild.name);
                    }, function(error) {
                        e.message.channel.sendMessage('Error joining server');
                        console.log('Invite Error: ' + error);
                    });
                }
            }
        }
    ]
};

module.exports = Commands;