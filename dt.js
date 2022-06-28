/*
 作者：临渊
 日期：6-28
 软件：读特
 功能：全部
 抓包：开着抓包软件登录，抓 https://api.dutenews.com/api-uaa/client/token 这条链接里请求体的body部分
 示例：password=xxx&device_id=xxx&grantType=custom_pwd&account=xxx
 变量格式：export dt='body1@body2'  多个账号用 @ 或者 换行 分割
 定时：一天一次
 cron：32 10 * * *

 [task_local]
 #读特
 32 10 * * * https://raw.githubusercontent.com/LinYuanovo/scripts/main/dt.js, tag=读特, enabled=false
 [rewrite_local]
 https://api.dutenews.com/api-uaa/client/token url script-request-header https://raw.githubusercontent.com/LinYuanovo/scripts/main/dt.js
 [MITM]
 hostname = api.dutenews.com

 */

 const $ = new Env('读特');
 const notify = $.isNode() ? require('./sendNotify') : '';
 const {log} = console;
 const crypto = require('crypto-js');
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 //////////////////////
 let scriptVersion = "1.0.0";
 let scriptVersionLatest = '';
 let dt = ($.isNode() ? process.env.dt : $.getdata("dt")) || "";
 let dtArr = [];
 let ck = '';
 let data = '';
 let msg = '';
 let dtTK = '';
 let userId = '';
 let name = '';
 let deviceId = '';
 let balance = 0;
 let afterBalance = 0;
 let beforeBalance = 0;
 let flyCardBack = 0;
 let contentidArr = [];
 let taskType = ["CUSTOM_QIANDAO","SYS_LOGIN","SYS_READ","SYS_LIKE","SYS_COMMENT","SYS_SHARE","SYS_COLLECT","CUSTOM_WATCH_VIDEO","CUSTOM_READ_CARD_NEWS","CUSTOM_PLUS_FEED"];
 //签到 2-8*1 登录1*1 阅读1*1 点赞1*6 评论2*1 分享3*3 收藏1*1 视频1*1 飞卡1*10 动态5*1


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
            log(`\n============ 当前版本：${scriptVersion}，最新版本：${scriptVersionLatest} ============`)
            log(`\n=================== 共找到 ${dtArr.length} 个账号 ===================`)
            if (debug) {
                log(`【debug】 这是你的全部账号数组:\n ${dtArr}`);
            }


            for (let index = 0; index < dtArr.length; index++) {

                let num = index + 1
                log(`\n========= 开始【第 ${num} 个账号】=========\n`)

                dt = dtArr[index];
                deviceId = dt.match(/device_id=[-\w]{0,100}/);

                if (debug) {
                    log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
                }

                msg += `\n第${num}个账号运行结果：`
                log('【开始登录】');
                await login();
                await $.wait(2000);

                log('【开始查询积分余额】');
                await getInfo();
                await $.wait(2000);
                beforeBalance =+ balance;

                log('【开始做任务】');
                for (let i = 0; i < taskType.length; i++) {
                    if (i == 3) {
                        for (let j = 0; j < 6; j++) {
                            await doTask(i);
                            await $.wait(2000);
                        }
                    } else if (i == 5) {
                        for (let j = 0; j < 3; j++) {
                            await doTask(i);
                            await $.wait(2000);
                        }
                    } else if (i == 8) {
                        for (let j = 0; j < 10; j++) {
                            await doTask(i);
                            await $.wait(2000);
                        }
                    } else {
                        await doTask(i);
                        await $.wait(2000);
                    }
                }

                log('【开始查询积分余额】');
                await getInfo();
                await $.wait(2000);
                afterBalance =+ balance;
                balance = afterBalance-beforeBalance;

                msg += `\n账号[${name}]本次运行获得：${balance}积分，总积分：${afterBalance}`

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
function login(timeout = 2000) {
    let url = {
        url : `https://api.dutenews.com/api-uaa/client/token?clientid=1&${deviceId}&app_version=7.1.0.1&ip=100.100.100.100&system_name=android&sign=adaffff685042eac86ad34f46e99c364&siteid=10001&time=${timestampMs()}&type=android&modules=cloudlogin:1`,
        headers : {"Content-Type":"application/x-www-form-urlencoded","Host":"api.dutenews.com","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.12.1"},
        body : `${dt}`
    }
    return new Promise((resolve) => {

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
                if (result.resp_code == 000000) {
                    log(`登录获取Token成功`)
                    dtTK = result.data.login.auth.accessToken;
                    dtTK = "Bearer " + dtTK;
                    userId = result.data.login.loginInfo.encodeInfo.userid;
                    name = result.data.login.loginInfo.nickname;
                } else {
                    log(`登录失败，原因是：${result.resp_msg}`)
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
 * 做任务
 */
function doTask(num) {
    return new Promise((resolve) => {
        let ms1 = timestampMs()
        let key1 = `app_version=7.1.0.1&clientid=1&contentId=${userId}_${ms1}&creditType=${taskType[num]}&${deviceId}&ip=100.100.100.100&memberId=${userId}&memberid=${userId}&modules=common%3A1&siteid=10001&system_name=android&type=android`
        let fv = '01ff984b3118a8ec815058f03025b6ac'
        let key2 = crypto.MD5(key1).toString()
        let ms2 = timestampMs()
        let key3 = key2 + fv + ms2
        let sign = crypto.MD5(key3).toString()
        let url = {
            url: `https://api.dutenews.com/gateway/pgc/v2/credit?clientid=1&app_version=7.1.0.1&${deviceId}&ip=100.100.100.100&system_name=android&contentId=${userId}_${ms1}&sign=${sign}&type=android&modules=common%3A1&creditType=${taskType[num]}&siteid=10001&time=${ms2}&memberid=${userId}&memberId=${userId}`,
            headers: {"Authorization":`${dtTK}`,"Host":"api.dutenews.com","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.12.1"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 做任务 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 做任务 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.state == true) {
                    if (result.data.common.hasOwnProperty("message")) {
                        if (result.data.common.message == '完成飞卡阅读，积分+1') {
                            pushCardBack += 1;
                        }
                        log(`账号[${name}]完成${result.data.common.message}`)
                    }
                } else {
                    log(`任务失败`)
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
 * 查询积分余额
 */
function getInfo(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let ms1 = timestampMs()
        let key1 = `app_version=7.1.0.1&bind_id=${userId}&clientid=1&${deviceId}&ip=100.100.100.100&modules=integral%3A1&siteid=10001&system_name=android&type=android`
        let fv = '01ff984b3118a8ec815058f03025b6ac'
        let key2 = crypto.MD5(key1).toString()
        let ms2 = timestampMs()
        let key3 = key2 + fv + ms2
        let sign = crypto.MD5(key3).toString()
        let url = {
            url: `https://api.dutenews.com/gateway/pgc/v2/app/mall?bind_id=${userId}&clientid=1&app_version=7.1.0.1&${deviceId}&ip=100.100.100.100&system_name=android&sign=${sign}&siteid=10001&time=${ms2}&type=android&modules=integral%3A1`,
            headers: {"Authorization":`${dtTK}`,"Host":"api.dutenews.com","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.12.1"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 查询积分余额 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询积分余额 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.state == true) {
                    balance =+ result.data.integral.integral
                    log(`账号[${name}]积分余额：${balance}`)
                } else {
                    log(`账号[${name}]查询积分余额失败`)
                }

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
    if ($request.url.indexOf("api-uaa/client/token?") > -1) {
        const ck = $request.body;
        if (dt) {
            if (dt.indexOf(ck) == -1) {
                dt = dt + "@" + ck;
                $.setdata(dt, "dt");
                List = dt.split("@");
                $.msg(`【${$.name}】` + ` 获取第${dt.length}个 ck 成功: ${ck} ,不用请自行关闭重写!`);
            }
        } else {
            $.setdata(ck, "dt");
            $.msg(`【${$.name}】` + ` 获取第1个 ck 成功: ${ck} ,不用请自行关闭重写!`);
        }
    }
}
 // ============================================变量检查============================================ \\
 async function Envs() {
     if (dt) {
         if (dt.indexOf("@") != -1) {
             dt.split("@").forEach((item) => {
                 dtArr.push(item);
             });
         } else if (dt.indexOf("\n") != -1) {
             dt.split("\n").forEach((item) => {
                 dtArr.push(item);
             });
         } else {
             dtArr.push(dt);
         }
     } else {
         log(`\n 【${$.name}】：未填写变量 dt`)
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
            url: `https://raw.gh.fakev.cn/LinYuanovo/scripts/main/dt.js`,
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
