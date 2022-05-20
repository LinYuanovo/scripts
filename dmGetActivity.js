/**
 * @ 临渊
 * 软件；到梦空间
 * 功能：到梦空间获取指定活动
 * 抓取：
 * appdmkj.5idream.net
 * 域名请求体的body
 * 变量格式：export dmtk=' xxxx & xxx @  xxxx & xxx '  多个账号用 @分割 
 */

 const jsname = "到梦空间获取活动";
 const $ = Env(jsname);
 const notify = $.isNode() ? require('./sendNotify') : '';
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 //////////////////////
 let dmtk = process.env.dmtk;
 let dmtkArr = [];
 let data = '';
 let msg = '';
 

 !(async () => {
 
     if (!(await Envs()))
         return;
     else {
 
         console.log(`开始获取活动`);
         msg+=`作者：临渊\n`
 
         console.log(`\n\n=========================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
             new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
             8 * 60 * 60 * 1000).toLocaleString()} \n=========================================\n`);

         console.log(`\n=================== 共找到 ${dmtkArr.length} 页的参数 ===================`)
 
         if (debug) {
             console.log(`【debug】 这是你的全部参数数组:\n ${dmtkArr}`);
         }
 
 
         for (let index = 0; index < dmtkArr.length; index++) {
 
 
             let num = index + 1
             console.log(`\n========= 开始【第 ${num} 个参数】=========\n`)
 
             data = dmtkArr[index].split('&');
 
             if (debug) {
                 console.log(`\n 【debug】 这是你第 ${num} 页的参数信息:\n ${data}\n`);
             }
 
 
             console.log('开始获取活动');
             await signin();
             await $.wait(2 * 1000);
         }
         
         await SendMsg(msg);
     }
 
 })()
     .catch((e) => console.logErr(e))
     .finally(() => $.done())
 
 
 
 
 
 
 /**
  * 下面我们来看看函数需要注意的东西吧
  */
 function signin(timeout = 3 * 1000) {
     return new Promise((resolve) => {
         let url = {
             url: `https://appdmkj.5idream.net/v2/activity/activities`,    
             headers: {
                 "standardUA": `{"channelName":"dmkj_Android","countryCode":"CN","createTime":1638856432189,"device":"Xiaomi MI 8","hardware":"qcom","jPushId":"","modifyTime":1650851382947,"operator":"%E4%B8%AD%E5%9B%BD%E8%81%94%E9%80%9A","screenResolution":"1080-2029","startTime":1651055246155,"sysVersion":"Android 29 10","system":"android","uuid":"9487E0211CF7","version":"4.4.4"}`,
                 "Content-Type": "application/x-www-form-urlencoded",
                 "Content-Length": "940",
                 "Host": "appdmkj.5idream.net",
                 "Accept-Encoding": "gzip",
                 "Connection": "keep-alive",
                 "User-Agent": "okhttp/3.11.0"
             },
             body: `${data}`
 
         }
 
         if (debug) {
             console.log(`\n【debug】=============== 这是请求 url ===============`);
             console.log(JSON.stringify(url));
         }
 
         $.post(url, async (error, response, data) => {
             try {
                 if (debug) {
                     console.log(`\n\n【debug】===============这是返回data==============`);
                     console.log(data)
                 }
 
                 let result = JSON.parse(data);
                 var obj = eval(result.data);
                 if (result.code == 100) {
                    for(var i=0;i<40;i++){
                        if(obj.list[i].catalog2name == "创新创业"){
                            if(obj.list[i].status != 6 && obj.list[i].status != 5){
                                console.log(`创新创业活动ID为：${obj.list[i].activityId} `)
                                msg += `\n创新创业活动ID为：${obj.list[i].activityId}`
                                console.log(`创新创业活动名称为：${obj.list[i].name} `)
                                msg += `\n创新创业活动名称为：${obj.list[i].name}`
                                console.log(`创新创业活动时间为：${obj.list[i].activitytime} `)
                                msg += `\n创新创业活动名称为：${obj.list[i].activitytime}`
                                console.log(`创新创业活动状态为：${obj.list[i].statusText} `)
                                msg += `\n创新创业活动状态为：${obj.list[i].statusText}`
                                msg +=`\n`
                            }
                        }
                        else if(obj.list[i].catalog2name == "实践实习"){
                            if(obj.list[i].status != 6 && obj.list[i].status != 5){
                                console.log(`实践实习活动ID为：${obj.list[i].activityId} `)
                                msg += `\n实践实习活动ID为：${obj.list[i].activityId}`
                                console.log(`实践实习活动名称为：${obj.list[i].name} `)
                                msg += `\n实践实习活动名称为：${obj.list[i].name}`
                                console.log(`实践实习活动时间为：${obj.list[i].activitytime} `)
                                msg += `\n实践实习活动名称为：${obj.list[i].activitytime}`
                                console.log(`实践实习活动状态为：${obj.list[i].statusText} `)
                                msg += `\n实践实习活动状态为：${obj.list[i].statusText}`
                                msg +=`\n`
                            }
                        }
                        else if(obj.list[i].catalog2name == "志愿公益"){
                            if(obj.list[i].status != 6){
                                console.log(`志愿公益活动ID为：${obj.list[i].activityId} `)
                                msg += `\n志愿公益活动ID为：${obj.list[i].activityId}`
                                console.log(`志愿公益活动名称为：${obj.list[i].name} `)
                                msg += `\n志愿公益活动名称为：${obj.list[i].name}`
                                console.log(`志愿公益活动时间为：${obj.list[i].activitytime} `)
                                msg += `\n志愿公益活动名称为：${obj.list[i].activitytime}`
                                console.log(`志愿公益活动状态为：${obj.list[i].statusText} `)
                                msg += `\n志愿公益活动状态为：${obj.list[i].statusText}`
                                msg +=`\n`
                            }
                        }
                    }
 
                 } else { 
 
                     console.log(`\n获取失败,可能是参数过期，请重抓!\n `)
                     msg +=`\n获取失败,可能是参数过期，请重抓!\n `
                 }
 
             } catch (e) {
                 console.log(e)
             } finally {
                 resolve();
             }
         }, timeout)
     })
 }
 
 
 
 //#region 固定代码 可以不管他
 // ============================================变量检查============================================ \\
 async function Envs() {
     if (dmtk) {
         if (dmtk.indexOf("@") != -1) {
             dmtk.split("@").forEach((item) => {
                 dmtkArr.push(item);
             });
         } else {
             dmtkArr.push(dmtk);
         }
     } else {
         console.log(`\n 【${$.name}】：未填写变量 dmtk`)
         return;
     }
 
     return true;
 }
 
 // ============================================发送消息============================================ \\
 async function SendMsg(message) {
     if (!message)
         return;
 
     if (Notify1 > 0) {
         if ($.isNode()) {
             var notify = require('./sendNotify1');
             await notify.sendNotify1($.name, message);
         } else {
             $.msg(message);
         }
     } else {
         console.log(message);
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
 

 
 
 // prettier-ignore   固定代码  不用管他
 function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }