/**
 作者：临渊
 日期：7-2
 微信小程序：同程旅行 （入口：里程商城->每日签到->祈愿树）
 抓包：开着抓包软件进活动，抓 https://sgame.moxigame.cn/planttree_tc//game/local/logincheck 这条链接下请求体的 body 全部
 示例：{"info":{"appId":"xx","userId":"xx","activeId":"xx","startTime":xx,"endTime":xx,"time":"xx","openId":"xx=","nickname":"临渊","pltId":"xx","avatar":"xx","platform":"{\"money\":0,\"moneyId\":\"xx\"}","sign":"xx"},"sourceChannel":"xx"}
 变量格式：export tczs='xxx@xxx '  最好放配置文件，用单引号括起来，如果抓到的跑不了，把\换成\\，不行的话删掉\再试试，多个账号用 @ 或者 换行 分割
 Cron：10 9-14 * * *

 [task_local]
 #同程旅行种树
 13,43 8-18 * * * https://raw.githubusercontent.com/LinYuanovo/scripts/main/tczs.js, tag=同程旅行种树, enabled=true
 [rewrite_local]
 https://sgame.moxigame.cn/planttree_tc//game/local/logincheck url script-request-header https://raw.githubusercontent.com/LinYuanovo/scripts/main/tczs.js
 [MITM]
 hostname = sgame.moxigame.cn
 */

 const $ = new Env('同程旅行种树');
 const notify = $.isNode() ? require('./sendNotify') : '';
 const {log} = console;
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 //////////////////////
 let scriptVersion = "1.0.2";
 let scriptVersionLatest = '';
 let tczs = ($.isNode() ? process.env.tczs : $.getdata("tczs")) || "";
 let tczsArr = [];
 let data = '';
 let msg = '';
 let activityUrl = `https://sgame.moxigame.cn/planttree_tc//game/local`;
 let loginBack = 0;
 let gameId = '';
 let token = '';
 let name = '';
 let taskListBack = 0;
 let taskIdArr = [];
 let waterNum = 0;
 let giveWaterBack = 0;
 let progress = 0.00;
 
 
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
             log(`\n=================== 共找到 ${tczsArr.length} 个账号 ===================`)
 
             if (debug) {
                 log(`【debug】 这是你的全部账号数组:\n ${tczsArr}`);
             }
 
             for (let index = 0; index < tczsArr.length; index++) {
 
 
                 let num = index + 1
                 log(`\n========= 开始【第 ${num} 个账号】=========\n`)
 
                 data = tczsArr[index];
 
                 if (debug) {
                     log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
                 }
 
                 log('【开始登录】');
                 await login();
                 await $.wait(2 * 1000);
 
                 if (loginBack) {

                     log('【开始签到】');
                     await signin();
                     await $.wait(2 * 1000);

                     log('【开始获取任务列表】');
                     await getTaskList();
                     await $.wait(2 * 1000);
                     log('【开始做任务】');
                     //k5 ? 有时间再补上判断
                     if (taskListBack) {
                         for (let i in taskIdArr) {
                             await doTask(i);
                             await $.wait(2 * 1000);
                         }
                     }
                     log('【开始浇水】')
                     do {
                         await giveWater();
                         await $.wait(2 * 1000);
                     } while (giveWaterBack);
                     log('【开始领取水瓶水滴】');
                     await fetchWater();
                     await $.wait(2 * 1000);
                     log('【开始领取自动水滴】');
                     await fetchAutoRestoreWater();
                     await $.wait(2 * 1000);
                     log('【开始领取使用道具】');
                     await useItem(2);//少量阳光
                     await $.wait(2 * 1000);
                     await useItem(3);//大量阳光
                     await $.wait(2 * 1000);
                 }
 
                 await login();
                 await $.wait(2 * 1000);
                 msg += `账号[${name}]进度：${progress}%\n`
 
             }
             await SendMsg(msg);
         }
     }
 
 })()
     .catch((e) => log(e))
     .finally(() => $.done())


/**
 * 登录
 */
function login(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/logincheck`,
            headers: {"Host":"sgame.moxigame.cn","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx336dcaf6a1ecf632","Content-Type":"application/json"},
            body: `${data}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 登录 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 登录 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0 && result.hasOwnProperty("token")) {
                    progress = result.role.plantInfo.score / 1000;
                    token = result.token;
                    gameId = result.role.gameId;
                    name = result.role.nickName;
                    loginBack = 1;
                } else {
                    log(`登录获取Token失败，原因是：${result.errMsg}，退出`)
                    loginBack = 0;
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
 * 签到
 */
function signin(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/getSevenSignReward`,
            headers: {"Host":"sgame.moxigame.cn","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx336dcaf6a1ecf632","Content-Type":"application/json"},
            body: `{"gameId":"${gameId}","token":"${token}"}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 签到 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 签到 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0 && result.signReward[0] != null) {
                    log(`签到成功，获得：${result.signReward[0]}`)
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
  * 获取任务列表
  */
 function getTaskList(timeout = 3 * 1000) {
     return new Promise((resolve) => {
         let url = {
             url: `${activityUrl}/getTaskList`,
             headers: {"Host":"sgame.moxigame.cn","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx336dcaf6a1ecf632","Content-Type":"application/json"},
             body: `{"gameId":"${gameId}","token":"${token}"}`,
         }
 
         if (debug) {
             log(`\n【debug】=============== 这是 获取任务列表 请求 url ===============`);
             log(JSON.stringify(url));
         }
 
         $.post(url, async (error, response, data) => {
             try {
                 if (debug) {
                     log(`\n\n【debug】===============这是 获取任务列表 返回data==============`);
                     log(data)
                 }
 
                 let result = JSON.parse(data);
                 if (result.code == 0 && result.hasOwnProperty("taskList")) {
                     for (let i in result.taskList) {
                         taskIdArr[i] = result.taskList[i].taskId;
                     }
                     taskListBack = 1;
                     log(`获取任务列表成功`)
                 } else {
                     taskListBack = 0;
                     log(`获取任务列表失败`)
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
  * 完成任务
  */
 function doTask(num) {
     return new Promise((resolve) => {
         let url = {
             url: `${activityUrl}/getTaskAward`,
             headers: {"Host":"sgame.moxigame.cn","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx336dcaf6a1ecf632","Content-Type":"application/json"},
             body: `{"taskId":"${taskIdArr[num]}","gameId":"${gameId}","token":"${token}"}`,
         }
 
         if (debug) {
             log(`\n【debug】=============== 这是 完成任务 请求 url ===============`);
             log(JSON.stringify(url));
         }
 
         $.post(url, async (error, response, data) => {
             try {
                 if (debug) {
                     log(`\n\n【debug】===============这是 完成任务 返回data==============`);
                     log(data)
                 }
 
                 let result = JSON.parse(data);
                 if (result.code == 0 && result.hasOwnProperty("awardItems")) {
                     //LC01 金币 k1 水滴 k2 阳光 k3 大量阳光 k6 抽奖券
                     log(`完成任务[${taskIdArr[num]}]成功，获得：${result.awardItems[0]}`)
                 }
 
             } catch (e) {
                 log(e)
             } finally {
                 resolve();
             }
         })
     })
 }
 
 /**
  * 浇水
  */
 function giveWater(timeout = 2 * 1000) {
     return new Promise((resolve) => {
         let url = {
             url: `${activityUrl}/waterTree`,
             headers: {"Host":"sgame.moxigame.cn","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx336dcaf6a1ecf632","Content-Type":"application/json"},
             body: `{"gameId":"${gameId}","token":"${token}"}`,
         }
 
         if (debug) {
             log(`\n【debug】=============== 这是 浇水 请求 url ===============`);
             log(JSON.stringify(url));
         }
 
         $.post(url, async (error, response, data) => {
             try {
                 if (debug) {
                     log(`\n\n【debug】===============这是 浇水 返回data==============`);
                     log(data)
                 }
 
                 let result = JSON.parse(data);
                 if (result.code == 0 && result.hasOwnProperty("items")) {
                     waterNum = result.items.k1 == "undefined" ? 0 : result.items.k1;
                     log(`浇水成功，剩余水滴：${waterNum}`)
                     if (waterNum/10 >= 1) {
                         giveWaterBack = 1;
                     } else giveWaterBack = 0;
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
  * 领取水瓶水滴
  */
 function fetchWater(timeout = 2 * 1000) {
     return new Promise((resolve) => {
         let url = {
             url: `${activityUrl}/fetchWater`,
             headers: {"Host":"sgame.moxigame.cn","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx336dcaf6a1ecf632","Content-Type":"application/json"},
             body: `{"gameId":"${gameId}","token":"${token}"}`,
         }
 
         if (debug) {
             log(`\n【debug】=============== 这是 领取水瓶水滴 请求 url ===============`);
             log(JSON.stringify(url));
         }
 
         $.post(url, async (error, response, data) => {
             try {
                 if (debug) {
                     log(`\n\n【debug】===============这是 领取水瓶水滴 返回data==============`);
                     log(data)
                 }
 
                 let result = JSON.parse(data);
                 if (result.code == 0) {
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
  * 领取自动水滴
  */
 function fetchAutoRestoreWater(timeout = 2 * 1000) {
     return new Promise((resolve) => {
         let url = {
             url: `${activityUrl}/fetchAutoRestoreWater`,
             headers: {"Host":"sgame.moxigame.cn","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx336dcaf6a1ecf632","Content-Type":"application/json"},
             body: `{"waterNum":10,"gameId":"${gameId}","token":"${token}"}`,
         }
 
         if (debug) {
             log(`\n【debug】=============== 这是 领取自动水滴 请求 url ===============`);
             log(JSON.stringify(url));
         }
 
         $.post(url, async (error, response, data) => {
             try {
                 if (debug) {
                     log(`\n\n【debug】===============这是 领取自动水滴 返回data==============`);
                     log(data)
                 }
 
                 let result = JSON.parse(data);
                 if (result.code == 0 && result.hasOwnProperty("items")) {
                     log(`领取自动水滴成功，剩余水滴：${result.items.k1}`)
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
  * 使用道具
  */
 function useItem(num) {
     return new Promise((resolve) => {
         let url = {
             url: `${activityUrl}/useItem`,
             headers: {"Host":"sgame.moxigame.cn","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/appbrand2 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wx336dcaf6a1ecf632","Content-Type":"application/json"},
             body: `{"itemId":"k${num}","gameId":"${gameId}","token":"${token}"}`,
         }
 
         if (debug) {
             log(`\n【debug】=============== 这是 使用道具 请求 url ===============`);
             log(JSON.stringify(url));
         }
 
         $.post(url, async (error, response, data) => {
             try {
                 if (debug) {
                     log(`\n\n【debug】===============这是 使用道具 返回data==============`);
                     log(data)
                 }
 
                 let result = JSON.parse(data);
                 if (result.code == 0 && result.hasOwnProperty("items")) {
                     log(`使用道具成功`)
                 }
 
             } catch (e) {
                 log(e)
             } finally {
                 resolve();
             }
         })
     })
 }
 
 // ============================================重写============================================ \\
 async function GetRewrite() {
     if ($request.url.indexOf("local/logincheck") > -1) {
         const ck = $request.body;
         if (tczs) {
             if (tczs.indexOf(ck) == -1) {
                 tczs = tczs + "@" + ck;
                 $.setdata(tczs, "tczs");
                 let List = tczs.split("@");
                 $.msg(`【${$.name}】` + ` 获取第${List.length}个 ck 成功: ${ck} ,不用请自行关闭重写!`);
             }
         } else {
             $.setdata(ck, "tczs");
             $.msg(`【${$.name}】` + ` 获取第1个 ck 成功: ${ck} ,不用请自行关闭重写!`);
         }
     }
 }
 // ============================================变量检查============================================ \\
 async function Envs() {
     if (tczs) {
         if (tczs.indexOf("@") != -1) {
             tczs.split("@").forEach((item) => {
                 tczsArr.push(item);
             });
         } else if (tczs.indexOf("\n") != -1) {
             tczs.split("\n").forEach((item) => {
                 tczsArr.push(item);
             });
         } else {
             tczsArr.push(tczs);
         }
     } else {
         log(`\n 【${$.name}】：未填写变量 tczs`)
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
             url: `https://raw.gh.fakev.cn/LinYuanovo/scripts/main/tczs.js`,
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
