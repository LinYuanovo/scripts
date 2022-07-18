/**
 作者：临渊
 日期：7-17
 软件：龙湖U享家 （可以兑换实物或卡券）
 抓包：无需抓包，下载注册设置账号密码就行 格式：账号&密码
 变量格式：export lhAPP='130xxxxxxxx&密码'  多个账号用 @ 或者 换行 分割
 Cron：10 9 * * *
 */

 const $ = new Env('龙湖U享家');
 const notify = $.isNode() ? require('./sendNotify') : '';
 const {log} = console;
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 //////////////////////
 let scriptVersion = "1.0.0";
 let scriptVersionLatest = '';
 let lhAPP = ($.isNode() ? process.env.lhAPP : $.getdata("lhAPP")) || "";
 let lhAPPArr = [];
 let data = '';
 let msg = '';
 let activityUrl = `https://longzhu.longfor.com/proxy`;
 let loginBack = 0;
 let token = '';
 let name = '';
 let balance = 0.00;
 
 
 !(async () => {
     if (!(await Envs()))
         return;
     else {

         log(`\n\n=============================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
             new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
             8 * 60 * 60 * 1000).toLocaleString()} \n=============================================\n`);

         await poem();
         await getVersion();
         log(`\n============ 当前版本：${scriptVersion}  最新版本：${scriptVersionLatest} ============`)
         log(`\n=================== 共找到 ${lhAPPArr.length} 个账号 ===================`)

         if (debug) {
             log(`【debug】 这是你的全部账号数组:\n ${lhAPPArr}`);
         }

         for (let index = 0; index < lhAPPArr.length; index++) {


             let num = index + 1
             log(`\n========= 开始【第 ${num} 个账号】=========\n`)

             lhAPP = lhAPPArr[index].split("&");

             if (debug) {
                 log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
             }

             msg += `第${num}个账号运行结果：`
             loginBack = 0;//置0，防止上一个号影响下一个号
             log('【开始登录】');
             await login();
             await $.wait(2 * 1000);

             if (loginBack) {
                 log('【开始签到】');
                 await signin();
                 await $.wait(2 * 1000);

                 log('【开始获取余额】');
                 await getBalance();
                 await $.wait(2 * 1000);
             }
         }
         await SendMsg(msg);
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
            url: `https://new-uhome.longfor.com/propertyUhomeApi/uhome/login/secretLogin`,
            headers: {"Device-Model":"MI 8","User-Agent":"uhome-android/5.6.4 Android/10","Source":"App","buCode":"C40501","User-Source":"PMS","Channel-Code":"U_HOME","Nonce":`${randomString(32)}`,"OS-Version":"10","constId":"62d409e1Ft4HtNF6eq3wbpfrVZpFQIveHwO7x173","App-Version":"5.6.4","Accept":"application/json","Device-Id":"8f5fb5c4f53b8d94","App-Platform":"Android","Content-Type":"application/json; charset=utf-8","Host":"new-uhome.longfor.com","Connection":"Keep-Alive","Accept-Encoding":"gzip"},
            body: `{"mobile":"${lhAPP[0]}","password":"${lhAPP[1]}","projectId":"6210122504607638","prefix":"+86"}`,
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

                let result = data == "undefined" ? await login() : JSON.parse(data);
                if (result.code == 0 && result.data.hasOwnProperty("lmToken")) {
                    token = result.data.lmToken;
                    name = result.data.user.accountNickName;
                    loginBack = 1;
                    log(`登录获取token成功`)
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
            url: `${activityUrl}/lmarketing-task-api-prod/openapi/task/v1/signs/clock`,
            headers: {"Host":"longzhu.longfor.com","Connection":"keep-alive","X-LF-UserToken":`${token}`,"X-LF-DXRisk-Source":"1","X-LF-Bu-Code":"C40501","X-GAIA-API-KEY":"caed5282-9019-418d-8854-3c34d02e0b4e","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36 &MAIAWebKit_android_com.longfor.app.uhome_5.6.4_39_Default_3.1.2.0 /qd-app-5.6.4-android","Content-Type":"application/json;charset=UTF-8","Accept":"application/json, text/plain, */*","X-LF-DXRisk-Captcha-Token":"","X-LF-DXRisk-Token":"62d40a0ctzMSWxb0n2j3wTMGjvRygR7nzJR39la1","X-LF-Channel":"C4","Origin":"https://longzhu.longfor.com","X-Requested-With":"com.longfor.app.uhome","Sec-Fetch-Site":"same-origin","Sec-Fetch-Mode":"cors","Sec-Fetch-Dest":"empty","Referer":"https://longzhu.longfor.com/longball-homeh5/","Accept-Encoding":"gzip, deflate","Accept-Language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"},
            body: `{"token":"${token}","channel":"C4","bu_code":"C40501","city_code":"100000","task_id":"28"}`,
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
                if (result.code == 0000) {
                    log(`账号[${name}]签到成功，获得：${result.data.rewards}颗龙珠`)
                    msg += `\n账号[${name}]签到成功，获得：${result.data.rewards}颗龙珠`
                } else if (result.code == 801002) {
                    log(`账号[${name}]签到失败，今日已签到`)
                    msg += `\n账号[${name}]签到失败，今日已签到`
                } else {
                    log(`账号[${name}]签到失败，原因是：${result.message}`)
                    msg += `\n账号[${name}]签到失败，原因是：${result.message}`
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
 * 查询余额
 */
function getBalance(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/lmember-cms-api-prod/api/cms/v2/account/queryDetail`,
            headers: {"Host":"longzhu.longfor.com","Connection":"keep-alive","X-LF-UserToken":`${token}`,"X-LF-DXRisk-Source":"1","X-LF-Bu-Code":"C40501","X-GAIA-API-KEY":"4fadac56-f483-498c-8438-0b5bdd0140bd","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36 &MAIAWebKit_android_com.longfor.app.uhome_5.6.4_39_Default_3.1.2.0 /qd-app-5.6.4-android","Content-Type":"application/json;charset=UTF-8","Accept":"application/json, text/plain, */*","X-LF-DXRisk-Captcha-Token":"","X-LF-DXRisk-Token":"62d40a0ctzMSWxb0n2j3wTMGjvRygR7nzJR39la1","X-LF-Channel":"C4","Origin":"https://longzhu.longfor.com","X-Requested-With":"com.longfor.app.uhome","Sec-Fetch-Site":"same-origin","Sec-Fetch-Mode":"cors","Sec-Fetch-Dest":"empty","Referer":"https://longzhu.longfor.com/longball-homeh5/","Accept-Encoding":"gzip, deflate","Accept-Language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7"},
            body: `{"token":"${token}","channel":"C4","bu_code":"C40501","trade_type":0,"page_size":20,"id":"","start_time":"2021-07-01 00:00:00","end_time":"2023-07-31 23:59:59"}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 查询余额 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 查询余额 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0000) {
                    balance = result.data.billList[0].balance;
                    log(`账号[${name}]余额为：${balance}`)
                    msg += `\n账号[${name}]余额为：${balance}\n`
                } else {
                    log(`账号[${name}]查询余额失败，原因是：${result.message}`)
                    msg += `\n账号[${name}]查询余额失败，原因是：${result.message}\n`
                }

            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

 // ============================================变量检查============================================ \\
 async function Envs() {
     if (lhAPP) {
         if (lhAPP.indexOf("@") != -1) {
             lhAPP.split("@").forEach((item) => {
                 lhAPPArr.push(item);
             });
         } else if (lhAPP.indexOf("\n") != -1) {
             lhAPP.split("\n").forEach((item) => {
                 lhAPPArr.push(item);
             });
         } else {
             lhAPPArr.push(lhAPP);
         }
     } else {
         log(`\n 【${$.name}】：未填写变量 lhAPP`)
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
     var t = "1234567890",
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
             url: `https://raw.gh.fakev.cn/LinYuanovo/scripts/main/lhuxj.js`,
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