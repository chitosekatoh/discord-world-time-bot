const fs = require('fs');
const csvSync = require('csv-parse/lib/sync');
const Discord = require('discord.js');
const client = new Discord.Client();
const BOT_TOKEN = process.env.BOT_TOKEN;
const monthEnglish = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];

function main() {
    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    client.on('message', async msg => {
        if (msg.content === '/time') {
            msg.reply(showTime());
        }   

        if (msg.content.includes('/time-add')) {
            if(!msg.content.split(' ')[1]) {
                msg.reply(createEmbed(msg.content, 'emptyAll'))
            } else {
                if(!msg.content.split(' ')[1].split(',')[0]) {
                    msg.reply(createEmbed(msg.content, 'emptyCityName'))
                } else if(!msg.content.split(' ')[1].split(',')[1]) {
                    msg.reply(createEmbed(msg.content, 'emptyTimeZone'))
                } else {
                    let result = addTime(msg.content);

                    if (result.flg) {
                        msg.reply(result.embed);
                        msg.reply(showTime());
                    } else {
                        msg.reply(result.embed);
                    }
                }
            }
        }

        if (msg.content.includes('/time-delete')) {
            if (!msg.content.split(' ')[1]) {
                msg.reply(createEmbed(msg.content, 'emptyCityName'))
            } else {
                let result = deleteTime(msg.content);

                if (result.flg) {
                    msg.reply(result.embed);
                    msg.reply(showTime());
                } else {
                    msg.reply(result.embed);
                }
            }
        }
    });

    client.login(BOT_TOKEN);
};

// 都市ごとの時間帯を表示
function showTime() {
    let dateList = csvSync(fs.readFileSync('./datelist.txt'));
    let currentDate = new Date();
    let data = [];

    dateList.forEach(function (value) {
        let row = {};
        let passedTime = value[1];

        
        let monthName = monthEnglish[currentDate.getMonth()];

        let date = currentDate.getDate();

        // GMTに一度戻してdatelistの時差を増減する
        let hour = currentDate.getHours() - 9 + parseInt(passedTime);
        let minute = currentDate.getMinutes();

        if (hour < 0) {
            date = date - 1;
            hour = 24 + hour;
        }

        if (date === 1 || date === 11 || date === 21 || date === 31) {
            date = date + 'st';
        } else if (date === 2 || date === 12 || date === 22) {
            date = date + 'nd';
        } else if (date === 3 || date === 13 || date === 23) {
            date = date + 'rd';
        } else {
            date = date + 'th';
        }

        let checkMeridian = hour < 13 ? 'a.m.' : 'p.m.';

        row = {
            name: value[0],
            date: (monthName + ' ' + date).padEnd(9),
            time: ('00' + (hour % 13)).slice(-2) + ':' + ('00' + minute).slice(-2) + ' ' +	checkMeridian
        }
            
        data.push(row);
    });
    
    return createEmbed('/time', data);
}

// 都市追加
function addTime(msgContent) {
    let addData = msgContent.split(' ')[1];
    let data = [addData.split(',')[0], addData.split(',')[1]];

    let dateList = csvSync(fs.readFileSync('./datelist.txt'));

    dateList.push(data);

    // 追加予定の都市を加えた配列に対してGMTとの時差が小さい順にソート
    dateList.sort(function(a, b){
        return (a[1] - b[1]);
    })

    fs.unlinkSync('./datelist.txt');
    
    dateList.forEach(function (value) {
        if (value[0] !== msgContent.split(' ')[1]) {
            let data = value[0] + ',' + value[1] + '\r\n';
            
            fs.appendFileSync('./datelist.txt', data, (err) => {
                if (err)  {
                    return {
                        embed: createEmbed(msgContent, false), 
                        flg: false
                    };
                }
            });
        }
    });

    return {
        embed: createEmbed(msgContent, true), 
        flg: true
    };
}

// 都市削除
function deleteTime(msgContent) {
    let dateList = csvSync(fs.readFileSync('./datelist.txt'));

    fs.unlinkSync('./datelist.txt');
    
    dateList.forEach(function (value) {
        if (value[0] !== msgContent.split(' ')[1]) {
            let data = value[0] + ',' + value[1] + '\r\n';
            
            fs.appendFileSync('./datelist.txt', data, (err) => {
                if (err)  {
                    return {
                        embed: createEmbed(msgContent, false), 
                        flg: false
                    };
                }
            });
        }
    });

    return {
        embed: createEmbed(msgContent, true), 
        flg: true
    };
}

// embed作成
function createEmbed(msgContent, data) {
    let embed = new Discord.MessageEmbed();

    if (msgContent === '/time') {
        data.forEach(function (value) {
            embed
                .setTitle('This bot doesn\'t consider daylight saving time!')
                .addField(value.name, value.date + value.time, true)
                .setColor('RANDOM')
            ;
        });
    } else if (msgContent.includes('/time-add')) {
        let cityName = '';

        if (data === true || data === false ) {
            cityName = msgContent.split(' ')[1].split(',')[0];
        }

        switch (data) {
            case true:
                embed
                    .setTitle('Success!')
                    .setDescription(cityName + ' の登録に成功しました！\r\n' + 'Succeed in adding ' + cityName + '.')
                    .setColor('RANDOM')
                ;
                break;
            case false:
                embed
                    .setTitle('Failure!')
                    .setDescription(cityName + ' の登録に失敗しました！\r\n' + 'Failed to add ' + cityName + '.')
                    .setColor('RANDOM')
                ;
                break;
            case 'emptyAll':
                embed
                    .setTitle('Failure!')
                    .setDescription('都市と時間帯を指定してください！\r\n' + 'Please specify city and time zone.')
                    .setColor('RANDOM')
                ;
                break;
            case 'emptyCityName':
                embed
                    .setTitle('Failure!')
                    .setDescription('都市を指定してください！\r\n' + 'Please specify city.')
                    .setColor('RANDOM')
                ;
                break;
            case 'emptyTimeZone': 
                embed
                    .setTitle('Failure!')
                    .setDescription('時間帯を指定してください！\r\n' + 'Please specify time zone.')
                    .setColor('RANDOM')
                ;
                break;
        }
    } else if (msgContent.includes('/time-delete')) {
        let cityName = msgContent.split(' ')[1];

        switch (data) {
            case true:
                embed
                    .setTitle('Success!')
                    .setDescription(cityName + ' の削除に成功しました！\r\n' + 'Succeed in deleting ' + cityName + '.')
                    .setColor('RANDOM')
                ;
                break;
            case false:
                embed
                    .setTitle('Failure!')
                    .setDescription(cityName + ' の削除に失敗しました！\r\n' + 'Failed to delete ' + cityName + '.')
                    .setColor('RANDOM')
                ;
                break;
            case 'emptyCityName':
                embed
                    .setTitle('Failure!')
                    .setDescription('都市を指定してください！\r\n' + 'Please specify city.')
                    .setColor('RANDOM')
                ;
                break;
        }
    }

    return embed;    
}

main();
