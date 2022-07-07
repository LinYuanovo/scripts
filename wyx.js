/**
 作者：临渊
 日期：7-7
 微信公众号：联通沃邮箱 (福利中心 -> 签到得好礼) (第一个登录任务做不了，需要真的登录好像)
 抓包：开着抓包软件进活动，抓 club.soyu.cn 这个域名下链接请求体的 Cookie 里面的 SESSION (不知道CK有效期多长)
 示例：SESSION=xx-xx-xx-xx-xx
 变量格式：export wyxCk='SESSION=xx-xx-xx-xx-xx' 多账户 换行 或者 @ 分割
 Cron：15 9 * * *

 [task_local]
 #联通沃邮箱
 15 9 * * * https://raw.githubusercontent.com/LinYuanovo/scripts/main/wyx.js, tag=联通沃邮箱, enabled=false
 [rewrite_local]
 https://club.soyu.cn/clubwebservice/growth/get-person-centre url script-request-headers https://raw.githubusercontent.com/LinYuanovo/scripts/main/wyx.js
 [MITM]
 hostname = club.soyu.cn
 */

 const $ = new Env('沃邮箱');
 const notify = $.isNode() ? require('./sendNotify') : '';
 const {log} = console;
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 //////////////////////
 let scriptVersion = "1.0.0";
 let scriptVersionLatest = '';
 let wyxCk = ($.isNode() ? process.env.wyxCk : $.getdata("wyxCk")) || "";
 let wyxCkArr = [];
 let data = '';
 let msg = '';
 let resourceTypeArr = [];
 let taskListBack = 0;
 
 
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
             log(`\n=================== 共找到 ${wyxCkArr.length} 个账号 ===================`)

             if (debug) {
                 log(`【debug】 这是你的全部账号数组:\n ${wyxCkArr}`);
             }


             for (let index = 0; index < wyxCkArr.length; index++) {


                 let num = index + 1
                 log(`\n========= 开始【第 ${num} 个账号】=========\n`)

                 wyxCk = wyxCkArr[index];

                 if (debug) {
                     log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
                 }

                 msg += `\n\n第${num}个账号运行结果：`

                 log('【开始获取任务列表】');
                 taskListBack = 0;//置零，避免影响下个号
                 await getTaskList();
                 await $.wait(randomInt(3000,6000));

                 if (taskListBack) {
                     log('【开始签到】');
                     await doSignin();
                     await $.wait(randomInt(3000,6000));

                     log('【开始做任务】');
                     for (let i in resourceTypeArr) {
                         await doTask(i);
                         await $.wait(randomInt(3000,6000));
                     }

                     log('【开始查询积分余额】');
                     await getInfo();
                     await $.wait(randomInt(3000,6000));
                 }

             }
             await SendMsg(msg);
         }

     }

 })()
     .catch((e) => log(e))
     .finally(() => $.done())

/**
 * 获取任务列表
 */
function getTaskList() {
    return new Promise((resolve) => {
        let url = {
            url: `https://club.soyu.cn/clubwebservice/growth/queryIntegralTask?channelId=wo-wx`,
            headers: {"Host":"club.soyu.cn","Connection":"keep-alive","Accept":"application/json, text/javascript, */*; q=0.01","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/toolsmp WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64","X-Requested-With":"XMLHttpRequest","Sec-Fetch-Site":"same-origin","Sec-Fetch-Mode":"cors","Sec-Fetch-Dest":"empty","Referer":"https://club.soyu.cn/clubwebservice/club-user/user-info/mine-task?currentPage=signScope&channelId=wo-wx&mobile=tdC17TJ8eqD%2Ftqc9mCGv%2BQ%3D%3D&userName=&openId=7VPTOxKdXOrwC33Mus17G9na0NUvfr26t%2FSAS4twX%2B4%3D","Accept-Encoding":"gzip, deflate","Accept-Language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7","Cookie":`${wyxCk}; Hm_lvt_ae8c182e471b2da55e7452b2ed27f15e=${timestampS()-20}; Hm_lpvt_ae8c182e471b2da55e7452b2ed27f15e=${timestampS()}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 获取任务列表 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 获取任务列表 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                if (result.status == "SUCCESS") {
                    log(`[获取任务列表]${result.status}`)
                    taskListBack = 1;
                    for (let i in result.data) {
                        let resourceFlag = result.data[i].resourceFlag;
                        resourceTypeArr[i] = resourceFlag;
                    }
                }
            } catch (e) {
                log(e)
                log(data)
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 做任务
 */
function doTask(num) {
    return new Promise((resolve) => {
        let url = {
            url: `https://club.soyu.cn/clubwebservice/growth/saveTask?resourceType=${resourceTypeArr[num]}`,
            headers: {"Host":"club.soyu.cn","Connection":"keep-alive","Accept":"application/json, text/javascript, */*; q=0.01","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/toolsmp WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64","X-Requested-With":"XMLHttpRequest","Sec-Fetch-Site":"same-origin","Sec-Fetch-Mode":"cors","Sec-Fetch-Dest":"empty","Referer":"https://club.soyu.cn/clubwebservice/club-user/user-info/mine-task?currentPage=signScope&channelId=wo-wx&mobile=tdC17TJ8eqD%2Ftqc9mCGv%2BQ%3D%3D&userName=&openId=7VPTOxKdXOrwC33Mus17G9na0NUvfr26t%2FSAS4twX%2B4%3D","Accept-Encoding":"gzip, deflate","Accept-Language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7","Cookie":`${wyxCk}; Hm_lvt_ae8c182e471b2da55e7452b2ed27f15e=${timestampS()-20}; Hm_lpvt_ae8c182e471b2da55e7452b2ed27f15e=${timestampS()}`},
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
                log(`[第${++num}个任务]${result.description}`)
                msg += `\n[第${num}个任务]${result.description}`
            } catch (e) {
                log(e)
                log(data)
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 签到
 */
function doSignin() {
    return new Promise((resolve) => {
        let url = {
            url: `https://club.soyu.cn/clubwebservice/club-user/user-sign/create?channelId=wo-wx`,
            headers: {"Host":"club.soyu.cn","Connection":"keep-alive","Accept":"application/json, text/javascript, */*; q=0.01","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/toolsmp WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64","X-Requested-With":"XMLHttpRequest","Sec-Fetch-Site":"same-origin","Sec-Fetch-Mode":"cors","Sec-Fetch-Dest":"empty","Referer":"https://club.soyu.cn/clubwebservice/club-user/user-info/mine-task?currentPage=signScope&channelId=wo-wx&mobile=tdC17TJ8eqD%2Ftqc9mCGv%2BQ%3D%3D&userName=&openId=7VPTOxKdXOrwC33Mus17G9na0NUvfr26t%2FSAS4twX%2B4%3D","Accept-Encoding":"gzip, deflate","Accept-Language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7","Cookie":`${wyxCk}; Hm_lvt_ae8c182e471b2da55e7452b2ed27f15e=${timestampS()-20}; Hm_lpvt_ae8c182e471b2da55e7452b2ed27f15e=${timestampS()}`},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 签到 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 签到 返回data==============`);
                    log(data)
                }

                let result = JSON.parse(data);
                log(`[签到]${result.description}`)
                msg += `\n[签到]${result.description}`
            } catch (e) {
                log(e)
                log(data)
            } finally {
                resolve();
            }
        })
    })
}

/**
 * 查询积分余额
 */
function getInfo() {
    return new Promise((resolve) => {
        let url = {
            url: `https://club.soyu.cn/clubwebservice/growth/get-person-centre?time=${timestampMs()}`,
            headers: {"Host":"club.soyu.cn","Connection":"keep-alive","Accept":"application/json, text/javascript, */*; q=0.01","User-Agent":"Mozilla/5.0 (Linux; Android 10; MI 8 Build/QKQ1.190828.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/3247 MMWEBSDK/20220204 Mobile Safari/537.36 MMWEBID/6242 MicroMessenger/8.0.20.2080(0x28001435) Process/toolsmp WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64","X-Requested-With":"XMLHttpRequest","Sec-Fetch-Site":"same-origin","Sec-Fetch-Mode":"cors","Sec-Fetch-Dest":"empty","Referer":"https://club.soyu.cn/clubwebservice/club-user/user-info/mine-task?currentPage=signScope&channelId=wo-wx&mobile=tdC17TJ8eqD%2Ftqc9mCGv%2BQ%3D%3D&userName=&openId=7VPTOxKdXOrwC33Mus17G9na0NUvfr26t%2FSAS4twX%2B4%3D","Accept-Encoding":"gzip, deflate","Accept-Language":"zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7","Cookie":`${wyxCk}; Hm_lvt_ae8c182e471b2da55e7452b2ed27f15e=${timestampS()-20}; Hm_lpvt_ae8c182e471b2da55e7452b2ed27f15e=${timestampS()}`},
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
                if (result.status == 200) {
                    log(`账号[${result.data.memberUser.phoneNum}]积分余额为：${result.data.score}`)
                    msg += `\n账号[${result.data.memberUser.phoneNum}]积分余额为：${result.data.score}`
                }
            } catch (e) {
                log(e)
                log(data)
            } finally {
                resolve();
            }
        })
    })
}

// ============================================重写============================================ \\
async function GetRewrite() {
    if ($request.url.indexOf("growth/get-person-centre") > -1) {
        const ck = $request.headers.Cookie;
        ck = ck.match(/SESSION=[\w-]+/)
        if (wyxCk) {
            if (wyxCk.indexOf(ck) == -1) {
                wyxCk = wyxCk + "@" + ck;
                $.setdata(wyxCk, "wyxCk");
                let List = wyxCk.split("@");
                $.msg(`【${$.name}】` + ` 获取第${List.length}个 ck 成功: ${ck} ,不用请自行关闭重写!`);
            }
        } else {
            $.setdata(ck, "wyxCk");
            $.msg(`【${$.name}】` + ` 获取第1个 ck 成功: ${ck} ,不用请自行关闭重写!`);
        }
    }
}
 // ============================================变量检查============================================ \\
 async function Envs() {
     if (wyxCk) {
         if (wyxCk.indexOf("@") != -1) {
             wyxCk.split("@").forEach((item) => {
                 wyxCkArr.push(item);
             });
         } else if (wyxCk.indexOf("\n") != -1) {
             wyxCk.split("\n").forEach((item) => {
                 wyxCkArr.push(item);
             });
         } else {
             wyxCkArr.push(wyxCk);
         }
     } else {
         log(`\n 【${$.name}】：未填写变量 wyxCk`)
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
            url: `https://raw.gh.fakev.cn/LinYuanovo/scripts/main/wyx.js`,
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