const fs = require('fs');
const csvSync = require('csv-parse/lib/sync');
const Discord = require('discord.js');
const client = new Discord.Client();
const BOT_TOKEN = process.env.BOT_TOKEN;


function main() {
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('message', async msg => {
        if (msg.content === '/time') {
            let embed = new Discord.MessageEmbed();
            showTime().forEach(function (value) {
                embed.setTitle('This bot doesn\'t consider daylight saving time!')
                    .addField(value.name, value.date + value.time, true)
                    .setColor('RANDOM')
            });
            msg.reply(embed);
        }   
    });

    client.login(BOT_TOKEN);
};

// 都市の時間帯を表示
function showTime() {
    let dateList = csvSync(fs.readFileSync('./datelist.txt'));
    let date = new Date();
    let data = [];

    dateList.forEach(function (value) {
        let row = {};
        valueDate = value[1]; // value[0]は都市名

        let M = date.getMonth() + 1;
        let M_EN = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
        MM = M_EN[M - 1];

        let D = date.getDate();

        // GMTに一度戻してdatelistの時差を増減する
        let h = date.getHours() - 9 + parseInt(valueDate);
        let m = date.getMinutes();

        if (h < 0) {
            D = D - 1;
            h = 24 + h;
        }

        if (D === 1 || D === 11 || D === 21 || D === 31) {
            D = D + 'st';
        } else if (D === 2 || D === 12 || D === 22) {
            D = D + 'nd';
        } else if (D === 3 || D === 13 || D === 23) {
            D = D + 'rd';
        } else {
            D = D + 'th';
        }

        let checkMeridian = h < 12 ? 'a.m.' : 'p.m.';

        row = {
            name: value[0],
            date: (MM + ' ' + D).padEnd(9),
            time: ('00' + (h % 12)).slice(-2) + ':' + ('00' + m).slice(-2) + ' ' +	checkMeridian
        }
            
        data.push(row);
    });

    return data;
}

main();
