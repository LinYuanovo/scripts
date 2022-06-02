/**
 * @ 临渊
 * 软件：三星网上商城
 * 功能：签到，查券，抢券
 * 日期：6-2
 * 抓取登录包
 * https://app.samsungeshop.com.cn/api/auth/auth/mobile
 * 里面的refresh_token
 * 变量格式：export sxsc='refresh_token@xxx '  多个账号用@或者换行分割 
 * 定时一天一次
 * cron 10 10 * * *
 */

 const $ = new Env('三星商城签到');
 const notify = $.isNode() ? require('./sendNotify') : '';
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 //////////////////////
 let sxsc = process.env.sxsc;
 let sxscArr = [];
 let data = '';
 let msg = '';
 let tokenArr = [];
 let margin = 0;
 let refreshback = 0;
 let url = {
    url: 'https://www.samsungeshop.com.cn/',
    headers: {
        "Host": "www.samsungeshop.com.cn",
        "Connection": "keep-alive",
        "Accept": "application/json, text/plain, */*",
        "authorization": `${tokenArr[0]}`,
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36::estore-app"
     },
    body: ''
 }
 
 
 !(async () => {
 
     if (!(await Envs()))
         return;
     else {
 

 
         console.log(`\n\n=========================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
             new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
             8 * 60 * 60 * 1000).toLocaleString()} \n=========================================\n`);

 
         console.log(`\n=================== 共找到 ${sxscArr.length} 个账号 ===================`)
 
         if (debug) {
             console.log(`【debug】 这是你的全部账号数组:\n ${sxscArr}`);
         }
 
 
         for (let index = 0; index < sxscArr.length; index++) {
 
 
             let num = index + 1
             console.log(`\n========= 开始【第 ${num} 个账号】=========\n`)
 
             data = sxscArr[index].split('&');
 
             if (debug) {
                 console.log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
             }

             msg += `\n第${num}个账号运行结果：`

             console.log('开始刷新token');
             await refreshToken(index);
             await $.wait(2 * 1000);

             if (refreshback){

                console.log('开始签到');
                await signin(index);
                await $.wait(2 * 1000);
   
                console.log('开始查券');
                await queryCoupon(index);
                await $.wait(2 * 1000);
   
                if (margin!=0) {
                   console.log('开始抢券');
                   await getCoupon(index);
                   await $.wait(2 * 1000);
                }
                else console.log("89-88优惠券已无，寄！")
             }
             else {
                 console.log("\nrefresh_token错误，请重新抓包填入")
                 msg += `\nrefresh_token错误，请重新抓包填入`
             }
         }
         await SendMsg(msg);
     }
 
 })()
     .catch((e) => console.log(e))
     .finally(() => $.done())
 
 
 
 
 
 
 /**
  * 签到  
  */
 function signin(timeout = 3 * 1000,num) {
     let url = {
        url: 'https://www.samsungeshop.com.cn/api/act/signAct/sign/',
        headers: {
            "Host": "www.samsungeshop.com.cn",
            "Connection": "keep-alive",
            "Accept": "application/json, text/plain, */*",
            "authorization": `Bearer ${tokenArr[num]}`,
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36::estore-app"
         },
        //body: ''
     }

     return new Promise((resolve) => {
         if (debug) {
             console.log(`\n【debug】=============== 这是 签到 请求 url ===============`);
             console.log(JSON.stringify(url));
         }
 
         $.get(url, async (error, response, data) => {
             try {
                 if (debug) {
                     console.log(`\n\n【debug】===============这是 签到 返回data==============`);
                     console.log(data)
                 }
 
                 let result = JSON.parse(data);
                 if (result.status == 200) {
 
                     console.log(`签到成功🎉`)
                     msg += `\n签到成功🎉`
 
                 } else if (result.status === 500) {
 
                     console.log(`\n签到失败,原因是:${result.message}!`)
                     msg += `\n签到失败,原因是:${result.message}!`
 
                 } else if (result.status === 400) { 
 
                     console.log(`\n签到失败,原因是:CK失效`)
                     msg += `\n签到失败,原因是:CK失效`
 
                 } else {  
 
                     console.log(`\n签到失败,原因是:${result.message}`)
                     msg += `\n签到失败,原因是:${result.message}`
 
 
                 }
 
             } catch (e) {
                 console.log(e)
             } finally {
                 resolve();
             }
         }, timeout)
     })
 }
 
 /**
  * 查询优惠券  
  */
  function queryCoupon(timeout = 3 * 1000,num) {
    let url = {
        url: 'https://www.samsungeshop.com.cn/api/act/exchange/star',
        headers: {
            "Host": "www.samsungeshop.com.cn",
            "Connection": "keep-alive",
            "Accept": "application/json, text/plain, */*",
            "authorization": `Bearer ${tokenArr[num]}`,
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36::estore-app"
         },
        //body: ''
     }
    return new Promise((resolve) => {
        if (debug) {
            console.log(`\n【debug】=============== 这是 查询优惠券 请求 url ===============`);
            console.log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    console.log(`\n\n【debug】===============这是 查询优惠券 返回data==============`);
                    console.log(data)
                }

                let result = JSON.parse(data);
                let back = eval(result.data);
                if (result.status == 200) {

                    console.log(`\n查询成功，剩余${back.exchangeGoods[5].cacheInv}件`)
                    msg += `\n查询成功，剩余${back.exchangeGoods[5].cacheInv}件`
                    margin = back.exchangeGoods[5].cacheInv

                } else {  

                    console.log(`\n查询失败,原因是:${result.message}`)
                    msg += `\n查询失败,原因是:${result.message}`

                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

 /**
  * 抢券  
  */
  function getCoupon(timeout = 3 * 1000,num) {
    let url = {
        url: 'https://www.samsungeshop.com.cn/api/act/exchange/coupon',
        headers: {
            "Host": "www.samsungeshop.com.cn",
            "Connection": "keep-alive",
            "Content-Type": "application/json; charset=UTF-8",
            "authorization": `Bearer ${tokenArr[num]}`,
            "user-agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/83.0.4103.101 Mobile Safari/537.36::estore-app"
         },
        body: `{"typ":"1","actItemId":6}`
     }
    return new Promise((resolve) => {
        if (debug) {
            console.log(`\n【debug】=============== 这是 抢券 请求 url ===============`);
            console.log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    console.log(`\n\n【debug】===============这是 抢券 返回data==============`);
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.status == 200) {

                    console.log(`\n抢券成功，返回信息为${result.message}`)
                    msg += `\n抢券成功，返回信息为${result.message}`

                } else {  

                    console.log(`\n抢券失败,原因是:${result.message}`)

                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

 /**
  * 刷新token  
  */
  function refreshToken(timeout = 3 * 1000,num) {
    let url = {
        url : `https://www.samsungeshop.com.cn/api/auth/login/refresh`,
        headers : {
            "Host": "app.samsungeshop.com.cn",
            "authorization": "Basic ZXN0b3JlYXBwOmVzdG9yZWFwcEBzYW0=",
            "User-Agent": "Brand/Xiaomi;Model/MI 8;OSVer/29;APPVer/145;",
            "Content-Type": "application/json; charset=UTF-8",
            "accept-encoding": "gzip"
        },
        body : `{"refreshToken":"${data[0]}"}`
    }
    return new Promise((resolve) => {
        if (debug) {
            console.log(`\n【debug】=============== 这是 刷新token 请求 url ===============`);
            console.log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    console.log(`\n\n【debug】===============这是 刷新token 返回data==============`);
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.status == 200) {

                    refreshback = 1;
                    console.log(`\n刷新成功，最新token为${result.data.access_token}`)
                    tokenArr[num] = `${result.data.access_token}`
                    console.log(`\n最新的refresh_token为： ${result.data.refresh_token}`)
                    msg += `\n最新的refresh_token为： ${result.data.refresh_token}`

                } else if (result.status == 400) {  

                    console.log(`\n刷新失败,原因是:refresh_token错误`)

                } else {
                    console.log(`\n刷新失败,原因是:${result.message}`)
                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        }, timeout)
    })
}

 // ============================================变量检查============================================ \\
 async function Envs() {
     if (sxsc) {
         if (sxsc.indexOf("@") != -1) {
             sxsc.split("@").forEach((item) => {
                 sxscArr.push(item);
             });
         } else if (sxsc.indexOf("\n") != -1) {
            sxsc.split("\n").forEach((item) => {
                sxscArr.push(item);
            });
         } else {
             sxscArr.push(sxsc);
         }
     } else {
         console.log(`\n 【${$.name}】：未填写变量 sxsc`)
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


 function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }