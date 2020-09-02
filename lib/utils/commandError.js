export const commandError = (message, e) => {
	logger.error(`Command failed`, e);
	if(process.env.LOGCHAT)
		return message.channel.send(`\`\`\`fix\nCommand failed with [${e}]\n\`\`\``);
	return message.channel.send(`\`\`\`fix\nCommand failed ! Sorry !\n\`\`\``);
}