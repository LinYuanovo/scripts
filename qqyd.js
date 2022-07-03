/**
 作者：临渊
 日期：6-30
 软件：QQ阅读
 功能：全部
 抓包：我的->福利，抓 eventv3.reader.qq.com 域名下的Cookie，只需要 qrsn ywguid ywkey 三个参数
 示例：qrsn=xxx_02:00:00:00:00:00;ywguid=xxx;ywkey=xxx
 变量格式：export qqydCK='xxx@xxx'  多个账号用 @ 或者 换行 分割
 定时：一天十次
 cron: 30 9-19 * * *

 默认账号1会填我的邀请码，如果介意请在脚本里把 helpAuthor 改成 0 即可

 [task_local]
 #QQ阅读
 30 0-23/5 * * * https://raw.githubusercontent.com/LinYuanovo/scripts/main/qqyd.js, tag=QQ阅读, enabled=true
 [rewrite_local]
 https://eventv3.reader.qq.com/activity/pkg11955/initV4 url script-request-header https://raw.githubusercontent.com/LinYuanovo/scripts/main/qqyd.js
 [MITM]
 hostname = eventv3.reader.qq.com

 */

const $ = new Env('QQ阅读');
const notify = $.isNode() ? require('./sendNotify') : '';
const {log} = console;
const Notify = 1; //0为关闭通知，1为打开通知,默认为1
const debug = 0; //0为关闭调试，1为打开调试,默认为0
const helpAuthor = 1; //0为不填写作者邀请码，1为填写作者邀请码,默认为1
const doNewUserTask = 0; //0为不做一次性任务，1为做一次性任务,默认为0
//////////////////////
let scriptVersion = "1.0.2";
let scriptVersionLatest = '';
let qqydCK = ($.isNode() ? process.env.qqydCK : $.getdata("qqydCK")) || "";
let qqydCKArr = [];
let data = '';
let msg = '';
let activityUrl = 'https://eventv3.reader.qq.com/activity/pkg11955';
let readBookWatchVideoTargetTime = [];
let readBookWatchVideoStatus = [];
let watchVideoNum = 0;
let watchVideoLimit = 0;
let openBoxNum = 0;
let openBoxBack = 0;
let openBoxVideoNum = 0;
let lotteryCount = 0;
let lotteryTotal = 0;
let lotteryNum = 0;
let coin = 0.00;
let cash = 0.00;


!(async () => {

    if (typeof $request !== "undefined") {
        await GetRewrite();
    } else {
        if (!(await Envs()))
            return;
        else {

            log(`\n\n=============================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
                new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
                8 * 60 * 60 * 1000).toLocaleString()} \n=============================================\n`);

            await poem();
            await getVersion();
            log(`\n============ 当前版本：${scriptVersion}  最新版本：${scriptVersionLatest} ============`)
            log(`\n=================== 共找到 ${qqydCKArr.length} 个账号 ===================`)

            if (debug) {
                log(`【debug】 这是你的全部账号数组:\n ${qqydCKArr}`);
            }


            for (let index = 0; index < qqydCKArr.length; index++) {


                let num = index + 1
                log(`\n========= 开始【第 ${num} 个账号】=========\n`)

                qqydCK = qqydCKArr[index];

                if (debug) {
                    log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
                }

                msg += `\n第${num}个账号运行结果：`

                if (doNewUserTask) {
                    //新用户现金红包
                    await getNewUserCoin();
                    await $.wait(randomInt(3000,5000));
                    //开启打卡提醒
                    await openCardNotice();
                    await $.wait(randomInt(3000,5000));
                    //填写好评
                    await giveGoodComment();
                    await $.wait(randomInt(3000,5000));
                    //选择阅读口味奖励
                    await questionNaire();
                    await $.wait(randomInt(3000,5000));
                    //新手抽奖
                    await getNewUserLottery();
                    await $.wait(randomInt(3000,5000));
                }

                //阅读指定书籍并领取
                await readConfigBookInit();
                await $.wait(randomInt(3000,5000));
                //获取看普通视频次数
                await getInfo();
                await $.wait(randomInt(3000,5000));

                /* 看视频相关 */
                //--1 签到及看视频
                await doSignin();
                await $.wait(randomInt(3000,5000));

                await punchCardWatchVideo();
                await $.wait(randomInt(3000,5000));
                //--2 加书架看视频
                await addBookShelfWatchVideo();
                await $.wait(randomInt(3000,5000));
                //--3 阅读看视频
                await queryUserReadTaskStatus();
                await $.wait(randomInt(3000,5000));

                for (let i in readBookWatchVideoStatus) {
                    if (!readBookWatchVideoStatus[i]) {
                        await $.wait(randomInt(3000,5000));
                        await readBookWatchVideo(i);
                    }
                }
                //--4 普通看视频
                for (;watchVideoNum<watchVideoLimit;watchVideoNum++) {
                    await watchVideo();
                    await $.wait(randomInt(3000,5000));
                }

                /* 开宝箱相关 */
                await queryOpenBoxInfo();
                await $.wait(randomInt(3000,5000));

                if (openBoxNum != 0 && openBoxBack == 1) {
                    await openBox();
                    await $.wait(randomInt(3000,5000));
                }

                /* 抽奖相关 */
                await queryPunchCardStatus();
                await $.wait(randomInt(3000,5000));

                if (lotteryCount != 0) {
                    for (;lotteryNum < lotteryTotal; lotteryNum++) {
                        await pickLottery();
                        await $.wait(randomInt(3000,5000));
                    }
                }

                //填写作者邀请码
                if (helpAuthor == 1 && num == 1) {
                    await invite();
                    await $.wait(randomInt(3000,5000));
                }
                //获取余额信息
                await getInfo();
                await $.wait(randomInt(3000,5000));

                log(`账号[${num}]金币：${coin}，余额：${cash}`)
                msg += `\n账号[${num}] 金币：${coin}，余额：${cash}`
            }
            await SendMsg(msg);
        }
    }

})()
    .catch((e) => log(e))
    .finally(() => $.done())

/**
 * 新用户现金红包 （一次性）
 */
function getNewUserCoin(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/loginToGetCoin?type=1`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 新用户现金红包 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 新用户现金红包 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【新用户现金红包】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 开启打卡提醒 （一次性）
 */
function openCardNotice(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/openCardNotice`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 开启打卡提醒 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 开启打卡提醒 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【开启打卡提醒】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 填写好评 （一次性）
 */
function giveGoodComment(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/giveGoodComment`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 填写好评 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 填写好评 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【填写好评】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 选择阅读口味奖励 （一次性）
 */
function questionNaire(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://commontgw6.reader.qq.com/h5/questionnaire/sendCoin`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 选择阅读口味奖励 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 选择阅读口味奖励 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【选择阅读口味奖励】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 新手抽奖 （一次性）
 */
function getNewUserLottery(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/newUser11To30Draw`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 新手抽奖 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 新手抽奖 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【新手抽奖】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 每日签到
 */
function doSignin(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/punchCard_v2`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 每日签到 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 每日签到 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【每日签到】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 签到视频
 */
function punchCardWatchVideo(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/punchCardWatchVideo`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 签到视频 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 签到视频 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【观看签到视频】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 阅读指定书籍
 */
function readConfigBookInit(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/readConfigBookInit`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 阅读指定书籍 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 阅读指定书籍 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                await $.wait(randomInt(3000,5000))
                pickReadConfigBook();

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 领取阅读指定书籍
 */
function pickReadConfigBook(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/pickReadConfigBook`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 领取阅读指定书籍 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 领取阅读指定书籍 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【领取阅读指定书籍】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 加书架看视频
 */
function addBookShelfWatchVideo(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/addBookShelfWatchVideo`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 加书架看视频 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 领取阅读指定书籍 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【加书架看视频】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 查询阅读看视频详情
 */
function queryUserReadTaskStatus(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/queryUserReadTaskStatus`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 查询阅读看视频详情 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询阅读看视频详情 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.data.hasOwnProperty("readTimeTasks")) {
                    let back = eval(result.data);
                    for (let i in back.readTimeTasks) {
                        //进行提交阅读所需要的参数
                        readBookWatchVideoTargetTime[i] = back.readTimeTasks[i].targetTime;
                        //已看过则是true，判断是否看过，减少运行次数
                        readBookWatchVideoStatus[i] = back.readTimeTasks[i].watched;
                    }
                }

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 阅读看视频
 */
function readBookWatchVideo(num) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/readBookWatchVideo?targetTime=${readBookWatchVideoTargetTime[num]}`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 阅读看视频 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 阅读看视频 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【看阅读${readBookWatchVideoTargetTime[num]}分钟视频】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 普通看视频
 */
function watchVideo(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/watchVideo`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 普通看视频 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 普通看视频 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【普通看视频】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 查询信息
 */
function getInfo(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/initV4`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 查询信息 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询信息 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.data.hasOwnProperty("watchVideo")) {
                    //已看次数
                    watchVideoNum = result.data.watchVideo.videoCount;
                    //总限制次数
                    watchVideoLimit = result.data.watchVideo.limit;
                }
                if (result.data.hasOwnProperty("userBalance")) {
                    //金币
                    coin = result.data.userBalance.coin;
                    //现金
                    cash = result.data.userBalance.cash;
                }

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        },timeout)
    })
}

/**
 * 查询开宝箱详情 （获取剩余次数，看视频次数）
 */
function queryOpenBoxInfo(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/queryOpenBoxInfo`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 查询开宝箱详情 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询开宝箱详情 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.data.hasOwnProperty("openNum")) {
                    //剩余开宝箱次数
                    openBoxNum = result.data.openNum;
                    //是否开宝箱前置条件
                    if (result.data.serverTime >= result.data.openTime) {
                        openBoxBack = 1;
                    } else openBoxBack = 0;//置0
                    //看视频前置条件
                    openBoxVideoNum = result.data.watchNum;
                }

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 开宝箱
 */
function openBox(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/openBox`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 开宝箱 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 开宝箱 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【开宝箱】${result.msg}`)
                if (result.msg == "success" && openBoxVideoNum != 0) {
                    log("成功开宝箱且剩余看视频次数，执行看宝箱视频")
                    await $.wait(3000);
                    pickOpenBoxWatchVideo()
                }

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 开宝箱看视频
 */
function pickOpenBoxWatchVideo(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/pickOpenBoxWatchVideo`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 开宝箱看视频 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 普通看视频 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【开宝箱看视频】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 查询抽奖详情 （获取剩余次数，看视频次数）
 */
function queryPunchCardStatus(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/queryOpenBoxInfo`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 查询抽奖详情 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询抽奖详情 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.data.hasOwnProperty("count")) {
                    //抽奖总次数
                    lotteryTotal = result.data.total;
                    //剩余抽奖次数
                    lotteryCount = result.data.count;
                    //已抽奖次数
                    lotteryNum = lotteryTotal - lotteryCount;
                }

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 抽奖
 */
function pickLottery(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/pickLottery`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 抽奖 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 抽奖 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`【抽奖】${result.msg}`)

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

/**
 * 填写邀请码
 */
function invite(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/inivite/fillcode?code=564785656`,
            headers: {"Cookie":`${qqydCK}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 填写邀请码 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 填写邀请码 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}
// ============================================重写============================================ \\
async function GetRewrite() {
    if ($request.url.indexOf("activity/pkg11955") > -1) {
        let ck = $request.headers.Cookie.match(/qrsn=[\w:;]+/);
        ck = ck + $request.headers.Cookie.match(/ywguid=[0-9;]+/);
        ck = ck + $request.headers.Cookie.match(/ywkey=[\w;]+/);
        if (qqydCK) {
            if (qqydCK.indexOf(ck) == -1) {
                qqydCK = qqydCK + "@" + ck;
                $.setdata(qqydCK, "qqydCK");
                List = qqydCK.split("@");
                $.msg(`【${$.name}】` + ` 获取第${qqydCK.length}个 ck 成功: ${ck} ,不用请自行关闭重写!`);
            }
        } else {
            $.setdata(ck, "qqydCK");
            $.msg(`【${$.name}】` + ` 获取第1个 ck 成功: ${ck} ,不用请自行关闭重写!`);
        }
    }
}
// ============================================变量检查============================================ \\
async function Envs() {
    if (qqydCK) {
        if (qqydCK.indexOf("@") != -1) {
            qqydCK.split("@").forEach((item) => {
                qqydCKArr.push(item);
            });
        } else if (qqydCK.indexOf("\n") != -1) {
            qqydCK.split("\n").forEach((item) => {
                qqydCKArr.push(item);
            });
        } else {
            qqydCKArr.push(qqydCK);
        }
    } else {
        log(`\n 【${$.name}】：未填写变量 qqydCK`)
        return;
    }

    return true;
}

// ============================================发送消息============================================ \\
async function SendMsg(message) {
    if (!message)
        return;

    if (Notify > 0) {
        if ($.isNode()) {
            var notify = require('./sendNotify');
            await notify.sendNotify($.name, message);
        } else {
            $.msg(message);
        }
    } else {
        log(message);
    }
}

/**
 * 随机数生成
 */
function randomString(e) {
    e = e || 32;
    var t = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890",
        a = t.length,
        n = "";
    for (i = 0; i < e; i++)
        n += t.charAt(Math.floor(Math.random() * a));
    return n
}

/**
 * 随机整数生成
 */
function randomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min)
}

/**
 * 获取毫秒时间戳
 */
function timestampMs(){
    return new Date().getTime();
}

/**
 * 获取秒时间戳
 */
function timestampS(){
    return Date.parse(new Date())/1000;
}

/**
 * 获取随机诗词
 */
function poem(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://v1.jinrishici.com/all.json`
        }
        $.get(url, async (err, resp, data) => {
            try {
                data = JSON.parse(data)
                log(`${data.content}  \n————《${data.origin}》${data.author}`);
            } catch (e) {
                log(e, resp);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

/**
 * 修改配置文件
 */
function modify() {

    fs.readFile('/ql/data/config/config.sh','utf8',function(err,dataStr){
        if(err){
            return log('读取文件失败！'+err)
        }
        else {
            var result = dataStr.replace(/regular/g,string);
            fs.writeFile('/ql/data/config/config.sh', result, 'utf8', function (err) {
                if (err) {return log(err);}
            });
        }
    })
}

/**
 * 获取远程版本
 */
function getVersion(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://raw.gh.fakev.cn/LinYuanovo/scripts/main/qqyd.js`,
        }
        $.get(url, async (err, resp, data) => {
            try {
                scriptVersionLatest = data.match(/scriptVersion = "([\d\.]+)"/)[1]
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        }, timeout)
    })
}

function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
