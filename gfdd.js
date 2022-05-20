/**
 * @ 临渊
 * 微信小程序：G房豆豆
 * 功能：签到，抽奖，互助加抽奖次数
 * 前几个参数需要先在首页-赚取积分注册入会，然后抓取域名
 * myscrm.cn
 * 里面的token&member_id&user_id
 * 活动CK需要先进入抽奖活动才能抓取，别的地方抓的不行
 * 入口：首页-热门活动-每日积分抽奖
 * 变量格式：export gfdd='token&member_id&user_id&phone&活动Cookie@xxx '  多个账号用@分割 
 * 推荐开启互助，可以增加抽奖机会，不过仅能互助一次，助力一次后便可以关掉
 */

 const jsname = "G房豆豆";
 const $ = Env(jsname);
 const notify = $.isNode() ? require('./sendNotify') : '';
 const Notify = 0; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 const doHlep = 1; //0为关闭互助，1为打开互助,默认为1
 //////////////////////
 let gfdd = process.env.gfdd;
 let gfddArr = [];
 let shareId = [];
 let sharePhone = [];
 let data = '';
 let msg = '';
 let num2 = 0;
 let ckArr = [];

 !(async () => {
 
     if (!(await Envs()))
         return;
     else {
 
 
         console.log(`\n\n=========================================    \n脚本执行 - 北京时间(UTC+8)：${new Date(
             new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 +
             8 * 60 * 60 * 1000).toLocaleString()} \n=========================================\n`);

 
         console.log(`\n=================== 共找到 ${gfddArr.length} 个账号 ===================`)
 
         if (debug) {
             console.log(`【debug】 这是你的全部账号数组:\n ${gfddArr}`);
         }
        
         for (let index = 0; index < gfddArr.length; index++) {
 
 
             let num = index + 1
             console.log(`\n========= 开始【第 ${num} 个账号】=========\n`)
 
             data = gfddArr[index].split('&');
             shareId[index] = `${data[2]}`;
             sharePhone[index] = `${data[3]}`;
             ckArr[index]= `${data[4]}`;

             if (debug) {
                 console.log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
             }
             
             msg += `\n第${num}个账号运行结果：`
           
             console.log('开始签到');
             await signin();
             await $.wait(2 * 1000+randomInt(0,2000));
             
             console.log('开始抽奖');
             await lottery();
             await $.wait(2 * 1000);

         }
         if(doHlep) {
             console.log("开始互助")
             msg += `\n\n${gfddArr.length+1}个账号互助结果：`
             for (let index = 0; index < gfddArr.length; index++) {
                 for(num2 =0;num2<gfddArr.length;num2++){
                     if(index!=num2){
                         await doShare(index,num2);
                     }
                 }
             }
             }

         await SendMsg(msg);
     }
 
 })()
     .catch((e) => console.logErr(e))
     .finally(() => $.done())

 /**
  * 签到  G房豆豆
  */
 function signin(timeout = 3 * 1000) {
     return new Promise((resolve) => {
         let url = {
             url: `https://vip-php-platform.myscrm.cn/index.php?site=api&r=checkin/checkin&tenant_code=nnldadmin&token=${data[0]}&member_id=${data[1]}&orgcode=nnldadmin`,    
             headers: '',
             body: '',
         }
 
         if (debug) {
             console.log(`\n【debug】=============== 这是 签到 请求 url ===============`);
             console.log(JSON.stringify(url));
         }
 
         $.post(url, async (error, response, data) => {
             try {
                 if (debug) {
                     console.log(`\n\n【debug】===============这是 签到 返回data==============`);
                     console.log(data)
                 }
 
                 let result = JSON.parse(data);
                 if (result.code == 1) {
 
                     console.log(`签到成功，获得${result.data.prize}点积分`)
                     msg += `\n签到成功，获得${result.data.prize}点积分`
 
                 } else if (result.code == 0) {
 
                     console.log(`\n签到失败,今日已签到\n `)
                     msg += `\n签到失败,今日已签到`

                 }  else {  
 
                     console.log(`\n签到失败，原因是：${result.error}\n `)
                     msg += `\n签到失败，原因是：${result.error}`
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
  * 抽奖  G房豆豆
  */
  function lottery(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `https://activity.myunke.com/api/lottery_draw/lottery`,    
            headers: JSON.parse(`{ 
                "Host": "activity.myunke.com",
                "Connection": "keep-alive",
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*",
                "user-adcode": "k9Aq5sgSvdwzuxpjHa3HVw%3D%3D",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3211 MMWEBSDK/20211001 Mobile Safari/537.36 MMWEBID/9871 MicroMessenger/8.0.16.2040(0x2800105F) Process/appbrand1 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wxb807f501434d8f4c",
                "Cookie":"${data[4]}"
            }`),
            body: `{"user_id":"${data[2]}","user_phone":"${data[3]}","spread_context":"{\\\"spread_type\\\":0}","activity_id":"1522754627264516096","value":"U2FsdGVkX19dSsvKtZqM2yLsC0tuX6EBMuRDTjGPh5/1wI3icBNEVtO5CjAzioYtlgvZP1gLH9rPJlkkplbPoyXmuCXabLv+rVGln9aQC7JaH9SwFhBZ3DAm6UFrWL1CHYOkUnhYfpVhEMMO9Uqd3cpAWIoWvgBxpGTdv+NDD1jDMA/T0r3piUfqjhxpq7CdMV0i3NZmaC2TSV58JOw/WMgBANpLqiX/cXOfpWH2rrGXCMIBNT8dDVZwzx5DAk3kt+vdngLl69kqkSbx8wcPFmOKBNKFfG7lhwrDR9jXk3YT8FO0YY5xtOApA+4aLRpdoMVzb5Eklt6M9p8b2LTMin8Ok0A53OsHx4uqKpYMwbj3g+Gz4QOK/qd3GUQiB5Sso8bWFCF5/mCGxuCCLDSvUupBZqsmrCnK6/ceMhfSYWQChuiiPNm1izNT6gG/o8SIYuBfwWSy9hWF88IpMIjXEaHUFrn/6K54tw1xe4UjhdyAMY3bKsUV1XrsIXNTBy3K2wsm78OLkRJ/ORmCBmvkn7bPArxWO+wfjUmqn/3fMfaAfF0TlXR7MvWrfEnLxfBqPt2FsFz1yVq0DxYNjpBtyMU6NwXA6u3O2eNNwVjPV6skewQPtu5n6G+DcgyZGrPcK7RYYP82/uBxahSFBaoQvrWQ6/Q0eVDMruTFSIi+vtTOCzH4sCZAllKaqq0FgT5QSTW9QowehLBAFwr+rYx1e0hdxDbMpNxAaVD+8qqcs/Z5jdWCUNI4Yyil02eK+fMTzF1h9QjdE+izj94U8q6Vynp1AccWcUYBw7JdYvBWJuBpal1Vygof4/tB/1YHMJdSv/4SYPuygf9ZRi8YYBevbMyGXjazLvmbOnUGPzIyWnTR9y8YaRxagQu0diOJSCA3UsMuckUaNqgAkcE0/kTkEu8JKbVqLxnuEbQkyd8p1quvay7D0NgdaSI2drbWvYhV7rHj2MvbfVdDsoB5FbDPQBOlzRReQHeP8aUqtwJ"}`,
        }

        if (debug) {
            console.log(`\n【debug】=============== 这是 抽奖 请求 url ===============`);
            console.log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    console.log(`\n\n【debug】===============这是 抽奖 返回data==============`);
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0) {
                    if(result.data.is_win == true){
                        console.log(`抽奖成功，获得${result.data.lottery_win_award.level_name}`)
                        msg += `\n抽奖成功，获得${result.data.lottery_win_award.level_name}`
                    }
                } else if (result.code == -1005) {

                    console.log(`\n抽奖失败,今日已抽奖\n`)
                    msg += `\n抽奖失败,今日已抽奖`

                }  else {  

                    console.log(`\n抽奖失败，原因是：${result.msg}\n `)
                    msg += `\n抽奖失败，原因是：${result.msg}`
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
  * 互助  G房豆豆
  */
 function doShare(num1,num2) {
    return new Promise((resolve) => {
        let url = {
            url: `https://activity.myunke.com/api/c_activity/record_user`,    
            headers: JSON.parse(`{
                "Host": "activity.myunke.com",
                "yk-wx-token": "isxbcc1509975999",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3211 MMWEBSDK/20211001 Mobile Safari/537.36 MMWEBID/6440 MicroMessenger/8.0.16.2040(0x2800105F) Process/appbrand0 WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 miniProgram/wxb807f501434d8f4c",
                "Content-Type": "application/json",
                "location": "pDW59wvar95eAfaz%2FzgSimc5AwErve%2BjtajjyPET1sg%3D,U45KsEUncJzd6J6A5ZALRiJJSbPq71oBQHVDR7iLHDE%3D",
                "Accept": "application/json, text/plain, */*",
                "user-adcode": "9HrtTjNNWtJGH9p5jTAquw%3D%3D",
                "Cookie": "${ckArr[num2]}"
            }`),
            body: `{"spread_type":"4","inviter_info":{"inviter_id":"${shareId[num1]}","inviter_phone":"${sharePhone[num1]}"},"promoter_info":{"promoter_type":4,"promoter_id":"${shareId[num1]}","promoter_phone":"${sharePhone[num1]}","promoter_team_id":"","promoter_team_name":""},"activity_id":"1522754627264516096","user_info":{"user_id":"${shareId[num2]}","user_phone":"${sharePhone[num2]}"},"thd_extdata":null}`
        }

        if (debug) {
            console.log(`\n【debug】=============== 这是 互助 请求 url ===============`);
            console.log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    console.log(`\n\n【debug】===============这是 互助 返回data==============`);
                    console.log(data)
                }

                let result = JSON.parse(data);
                if (result.code == 0) {

                    console.log(`\n账号${num2+1}去助力${num1+1}`)
                    msg += `\n账号${num2+1}助力${num1+1}成功`

                }  else {  

                    console.log(`\n互助失败，原因是：${result.error}\n `)
                    msg += `\n互助失败，原因是：${result.error}`
                }

            } catch (e) {
                console.log(e)
            } finally {
                resolve();
            }
        })
    })
}


 //#region 固定代码 可以不管他
 // ============================================变量检查============================================ \\
 async function Envs() {
     if (gfdd) {
         if (gfdd.indexOf("@") != -1) {
             gfdd.split("@").forEach((item) => {
                 gfddArr.push(item);
             });
         } else {
             gfddArr.push(gfdd);
         }
     } else {
         console.log(`\n 【${$.name}】：未填写变量 gfdd`)
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

 //#endregion
 
 
 // prettier-ignore   固定代码  不用管他
 function Env(t, e) { "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0); class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }