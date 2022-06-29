/**
 作者：临渊
 日期：6-23
 软件：联想智选 （签到获得延保券，乐豆）
 功能：签到
 抓包：可抓可不抓，不抓直接填一个 lzzxApp 账号&密码  抓包的话抓一个登陆包，里面有baseinfo，再填到 lxzxBaseinfo （lxzxApp这个变量一定要填）
 变量：lzzxApp='账号&密码@xxxx '  多个账号用 @ 或者 换行 分割
 定时一天一次
 cron: 30 10 * * *
 */

 process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";//提示Warning正常现象
 const $ = new Env('联想智选签到');
 const notify = $.isNode() ? require('./sendNotify') : '';
 const {log} = console;
 const cryptojs = require('crypto-js');
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 //////////////////////
 let scriptVersion = "1.0.0";
 let scriptVersionLatest = '';
 let lxzxApp = process.env.lxzxApp;
 let lxzxAppArr = [];
 let lxzxBaseinfo = process.env.lxzxBaseinfo;
 let lxzxBaseinfoArr = [];
 let data = '';
 let msg = '';
 let baseInfo = 'eyJpbWVpIjoiMTY1NDA1MDY3NTI4Mjc5ODciLCJwaG9uZWJyYW5kIjoiWGlhb21pIiwicGhvbmVNb2RlbCI6Ik1JIDgiLCJhcHBWZXJzaW9uIjoiVjUuMy41IiwicGhvbmVpbmNyZW1lbnRhbCI6IjIwLjkuNCIsInNtRGV2aWNlSWQiOiJCSW42MU95c1Z2NGo4TWRMUGtPcldBU0gvejJMTHd6dThnS1I0WVIvUzhZMjdCWGV1ZkgyVUlyZEFVL1pMcGs3SHZPRGNIMzB3YjRNSE13ZzBFTm44aXc9PSIsInBob25lZGlzcGxheSI6IlFLUTEuMTkwODI4LjAwMiB0ZXN0LWtleXMiLCJwaG9uZU1hbnVmYWN0dXJlciI6IlhpYW9taSIsImxlbm92b0NsdWJDaGFubmVsIjoieGlhb21pIiwibG9naW5OYW1lIjoiMTUyODU0NDI4MTEiLCJwaG9uZXByb2R1Y3QiOiJkaXBwZXIiLCJzeXN0ZW1WZXJzaW9uIjoiMTAiLCJhbmRyb2lkc2RrdmVyc2lvbiI6IjI5In0=';
 let baseInfoArr = '';
 let infos = '';
 let imei = '';
 let lpsutgt = '';
 let lpsutgt2 = '';
 let lenovoid = '';
 let sessionid = '';
 let token = '';
 let name = '';
 let ledou = 0;
 let refreshBack = 0;
 let loginBack = 0;

 !(async () => {
 
     if (!(await Envs()))
         return;
     else {

         log(`\n\n=============================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
             new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
             8 * 60 * 60 * 1000).toLocaleString()} \n=============================================\n`);

         await poem();
         await getVersion();
         log(`\n============ 当前版本：${scriptVersion}，最新版本：${scriptVersionLatest} ============`)
         log(`\n=================== 共找到 ${lxzxAppArr.length} 个账号 ===================`)
 
         if (debug) {
             log(`【debug】 这是你的全部账号数组:\n ${lxzxAppArr}`);
         }
 
 
         for (let index = 0; index < lxzxAppArr.length; index++) {
 
 
             let num = index + 1
             log(`\n========= 开始【第 ${num} 个账号】=========\n`)
 
             data = lxzxAppArr[index].split('&');
             lxzxBaseinfo = lxzxBaseinfoArr[index];
 
             if (debug) {
                 log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
             }
 
             msg += `\n第${num}个账号运行结果：`

             if (lxzxBaseinfo) {
                 baseInfo = lxzxBaseinfo;
             }

             baseInfoArr = cryptojs.enc.Base64.parse(baseInfo);
             infos = JSON.parse(baseInfoArr.toString(cryptojs.enc.Utf8))
             imei = infos.imei;

             log('【开始登录】');
             await login();
             await $.wait(2 * 1000);

             if (loginBack) {
                 log('【开始刷新lpsutgt】');
                 await refreshLpsutgt(lpsutgt);
                 await $.wait(2 * 1000);

                 if (refreshBack) {
                     log('【开始获取关键信息】');
                     await getInfo(lpsutgt2);
                     await $.wait(2 * 1000);

                     log('【开始查询个人信息】');
                     await getUserInfo(sessionid,token,lenovoid);
                     await $.wait(2 * 1000);

                     log('【开始签到】');
                     await doSign(sessionid,token,lenovoid);
                     await $.wait(2 * 1000);

                     log('【开始查询个人信息】');
                     await getUserInfo(sessionid,token,lenovoid);
                     await $.wait(2 * 1000);

                     msg += `\n账号[${name}]乐豆余额为：${ledou}`
                 }
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
            url: `https://uss.lenovomm.com/authen/1.2/tgt/user/get?msisdn=${data[0]}&lang=zh-CN-%23Hans&source=android%3Acom.lenovo.club.app-V4.2.5&deviceidtype=mac&deviceid=${imei}&devicecategory=unknown&devicevendor=${infos.phoneManufacturer}&devicefamily=unknown&devicemodel=${infos.phoneModel}&osversion=${infos.systemVersion}&osname=Android&password=${data[1]}`,
            headers: {"Authorization":"","BaseInfo":`${baseInfo}`,"unique":`${imei}`,"token":"","Content-Type":"text/json","Host":"api.club.lenovo.cn","User-Agent":"Apache-HttpClient/UNAVAILABLE (java 1.5)"},
            body: '',
        }

        if (debug) {
            log(`\n【debug】=============== 这是 登录 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url,async (error, response, data) => {
            try {
                lpsutgt = data.match(/<Value>(.+?)<\/Value>/)[1]
                if (lpsutgt) {
                    loginBack = 1;
                    log(`登陆成功`)
                } else {
                    log(`登录失败，退出`)
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
 * 刷新lpsutgt
 */
function refreshLpsutgt(lpsutgt) {
    return new Promise((resolve) => {
        let url = {
            url: `https://uss.lenovomm.com/authen/1.2/st/get?lpsutgt=${lpsutgt}&source=ios%3Alenovo%3Aclub%3A4.1.0&lang=zh-CN&realm=club.lenovo.com.cn`,
            headers: {"Authorization":"","BaseInfo":`${baseInfo}`,"unique":`${imei}`,"token":"","User-Agent":"Apache-HttpClient/UNAVAILABLE (java 1.5)"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 刷新lpsutgt 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url,async (error, response, data) => {
            try {
                lpsutgt2 = data.match(/<Value>(.+?)<\/Value>/)[1]
                if (lpsutgt2) {
                    refreshBack = 1;
                    log(`刷新lpsutgt成功`)
                } else log(`刷新lpsutgt失败，退出`)
            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 获取session
 */
function getInfo(lpsutgt) {
    return new Promise((resolve) => {
        let url = {
            url: `https://api.club.lenovo.cn/users/getSessionID?s=${randomString(576)}`,
            headers: {"Authorization":`Lenovosso ${lpsutgt}`,"BaseInfo":`${baseInfo}`,"unique":`${imei}`,"token":`Lenovosso ${lpsutgt}==`,"User-Agent":"Apache-HttpClient/UNAVAILABLE (java 1.5)"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 获取session 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url,async (error, response, data) => {
            try {
                let result = JSON.parse(data)
                if (result.status ==0) {
                    token = result.res.token;
                    sessionid = result.res.sessionid;
                    lenovoid = result.res.lenovoid;
                    log(`获取关键信息成功`)
                } else {
                    log(`获取关键信息失败`)
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
 * 查询个人信息
 */
function getUserInfo(sessionid,token,lenovoid) {
    return new Promise((resolve) => {
        let url = {
            url:`https://api.club.lenovo.cn/users/show?s=${randomString(256)}`,
            headers: {"Authorization":`Lenovo ${sessionid}`,"BaseInfo":`${baseInfo}`,"unique":`${imei}`,"token":`${token}==`,"User-Agent":"Apache-HttpClient/UNAVAILABLE (java 1.5)"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 查询信息 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url,async (error, response, data) => {
            try {
                let result = JSON.parse(data)
                if (result.status == 0) {
                    log(`获取个人信息成功`)
                    name = result.res.nickname;
                    ledou = result.res.ledou_user_amount;
                } else log(`获取个人信息失败`)
            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 签到
 */
function doSign(sessionid,token,lenovoid) {
    return new Promise((resolve) => {
        let url = {
            url:`https://api.club.lenovo.cn/signin/v2/add?imei=${imei}&uid=${lenovoid}`,
            headers: {"Authorization":`Lenovo ${sessionid}`,"BaseInfo":`${baseInfo}`,"unique":`${imei}`,"token":`${token}==`,"User-Agent":"Apache-HttpClient/UNAVAILABLE (java 1.5)"},
            body:''
        }

        if (debug) {
            log(`\n【debug】=============== 这是 签到 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url,async (error, response, data) => {
            try {
                let result = JSON.parse(data)
                if (result.status == 0&& result.res.success == true) {
                    log(`账号[${name}]签到成功，连续签到：${result.res.continueCount}天，获得：${result.res.rewardTips}`)
                    msg += `\n账号[${name}]签到成功，连续签到：${result.res.continueCount}天，获得：${result.res.rewardTips}`
                } else if (result.status == 0&& result.res.success == false) {
                    log(`账号[${name}]签到失败，今日已签到`)
                    msg += `\n账号[${name}]签到失败，今日已签到`
                } else log(`签到失败`)
            } catch (e) {
                log(e)
            } finally {
                resolve();
            }
        })
    })
}

 // ============================================变量检查============================================ \\
 async function Envs() {
     if (lxzxBaseinfo) {
         if (lxzxBaseinfo.indexOf("@") != -1) {
             lxzxBaseinfo.split("@").forEach((item) => {
                 lxzxBaseinfoArr.push(item);
             });
         } else if (lxzxBaseinfo.indexOf("\n") != -1) {
             lxzxBaseinfo.split("\n").forEach((item) => {
                 lxzxBaseinfoArr.push(item);
             });
         } else {
             lxzxBaseinfoArr.push(lxzxBaseinfo);
         }
     }
     if (lxzxApp) {
         if (lxzxApp.indexOf("@") != -1) {
             lxzxApp.split("@").forEach((item) => {
                 lxzxAppArr.push(item);
             });
         } else if (lxzxApp.indexOf("\n") != -1) {
             lxzxApp.split("\n").forEach((item) => {
                 lxzxAppArr.push(item);
             });
         } else {
             lxzxAppArr.push(lxzxApp);
         }
     } else {
         log(`\n 【${$.name}】：未填写变量 lxzxApp`)
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
     var t = "abcdef1234567890",
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
            url: `https://raw.gh.fakev.cn/LinYuanovo/scripts/main/lxzx.js`,
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