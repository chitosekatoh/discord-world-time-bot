const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const monthEnglish = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
const guildId = process.env.GUILD_ID;
const worldTimeCommands = {
    data: {
        name: 'worldtime',
        description: 'Enter `/worldtime help` for an usage of this command.',
        options: [
            {
                name: 'show',
                description: 'Displays local time of each places.',
                type: 1,
                options: []
            },
            {
                name: 'add',
                description: 'Add an entry with the specified name.',
                type: 1,
                options: [
                    {
                        name: 'label',
                        description: 'This location\'s name. Country/City is recommended for the value. e.g. \'Japan/Tokyo\'',
                        required: true,
                        type: 3
                    },
                    {
                        name: 'offset',
                        description: 'This location\'s GMT based time offset. e.g. +9',
                        required: true,
                        type: 4
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Removes the entry of the specified location.',
                type: 1,
                options: [
                    {
                        name: 'label',
                        description: 'Enter the label of the entry, To specify Which one to remove.',
                        required: true,
                        type: 3
                    },
                ]
            }
        ]
    }
}

const getApp = (guildId) => {
    const app = client.api.applications(client.user.id);
    if (guildId) {
        app.guilds(guildId);
    }
    return app;
}

const reply = async (interaction, response) => {
    console.log(response);
    
    let data = {
        content: response
    }

    if (typeof response === 'object') {
        data = await createAPIMessage(interaction, response);
    }

    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data,
        }
    });
}

const createAPIMessage = async (interaction, content) => {
    const { data, files} = await Discord.APIMessage.create(
        client.channels.resolve(interaction.channel_id),
        content
    )

    .resolveData()
    .resolveFiles();

    return { ...data, files }
}

const getArgs = (options) => {
    const args = {};

    if(!options) return args;

    for(const option of options) {
        if(option.type >= 3) {
            const { name, value } = option;
            args[name] = value;
        } else {
            return getArgs(option.options);
        }
    }

    return args;
}

const getSubCommandName = (options) => options[0].type === 1 ? options[0].name.toLowerCase() : getSubCommandName(options[0].options);

client.on('ready', async () => {
    console.log('the bot is ready');

    await getApp(guildId).commands.post(worldTimeCommands);
    const commands = await getApp(guildId).commands.get();
    console.log(commands);

    client.ws.on('INTERACTION_CREATE', async (interaction) => {
        const { name, options } = interaction.data;
        const command = name.toLowerCase();
        const subCommand = getSubCommandName(options);

        let embed = {};        
        if(command === 'worldtime') {
            const args = getArgs(options);
            const wt = new WorldTime();
            console.log(subCommand);

            switch (subCommand) {
                case 'show':
                    embed = wt.show();
                    break;
                case 'add':
                    embed = wt.add(args.label, args.offset);
                    break;
                case 'remove':
                    embed = wt.remove(args.label);
                    break;
                default:
                    break;
            }
        }

        reply(interaction, embed);
    });
});

client.login(process.env.BOT_TOKEN);

class WorldTime {
    
    show() {
        let dateList = JSON.parse(fs.readFileSync('./datelist.json', 'utf-8'));
        let currentDate = new Date();
        let data = [];

        dateList.forEach(function (value) {
            let row = {};
            let monthName = monthEnglish[currentDate.getMonth()];
            let date = currentDate.getDate();
            // GMTに一度戻してdatelistの時差を増減する
            let hour = currentDate.getHours() - 9 + value.offset;
            let minute = currentDate.getMinutes();


            if (date === 1 || date === 11 || date === 21 || date === 31) {
                date = date + 'st';
            } else if (date === 2 || date === 12 || date === 22) {
                date = date + 'nd';
            } else if (date === 3 || date === 13 || date === 23) {
                date = date + 'rd';
            } else {
                date = date + 'th';
            }

            let checkMeridian = hour < 12 ? 'a.m.' : 'p.m.';
            let hourDisp = ('00' + hour % 12).slice(-2);
            let miniteDisp = ('00' + minute).slice(-2);

            // 00:XX p.m.の場合のみ、12:XX a.m.へ変更
            if (hourDisp === 0 && checkMeridian === 'p.m.') {
                hourDisp = 12;
                checkMeridian = 'a.m.';
            }

            row = {
                name: value.label,
                date: (monthName + ' ' + date).padEnd(9),
                time: hourDisp + ':' + miniteDisp + ' ' +	checkMeridian
            }
                
            data.push(row);
        });

        let embed = new Discord.MessageEmbed();
        embed.setTitle('This bot doesn\'t consider daylight saving time!');
        embed.setColor('RANDOM');
        data.forEach(function (value) { embed.addField(value.name, value.date + value.time, true); });
        
        return embed;
    }

    add(label, offset) {
        const embed = new Discord.MessageEmbed();
        embed.setColor('RANDOM');

        try {
            const dateList = JSON.parse(fs.readFileSync('./datelist.json'));
            const index = dateList.findIndex(entry => entry.label === label);
            if(index >= 0) {
                dateList[index].offset = offset;
            } else {
                dateList.push({ label, offset });
            }

            // 追加予定の都市を加えた配列に対してGMTとの時差が小さい順にソート
            dateList.sort((a, b) => a.offset - b.offset);

            fs.writeFileSync('./datelist.json', JSON.stringify(dateList));
            embed.setTitle('Success!');
            embed.setDescription(`${label}の登録に成功しました！\r\nSucceed in adding ${label}.`);
        } catch (err) {
            console.error(err);

            embed.setTitle('Failure!');
            embed.setDescription(`${label}の登録に失敗しました！\r\nFailed to add ${label}.`);
        }

        return embed;
    }

    remove(label) {
        const dateList = JSON.parse(fs.readFileSync('./datelist.json'));
        const embed = new Discord.MessageEmbed();
        embed.setColor('RANDOM');

        try {
            const newDateList = dateList.filter(val => val.label !== label);
            fs.writeFileSync('./datelist.json', JSON.stringify(newDateList));

            embed.setTitle('Success!');
            embed.setDescription(`${label}の削除に成功しました！\r\nSucceed in deleteing ${label}.`);
        } catch (err) {
            console.error(err);

            embed.setTitle('Failure!');
            embed.setDescription(`${label}の削除に失敗しました！\r\nFailed to delete ${label}.`);
        }

        return embed;
    }
}