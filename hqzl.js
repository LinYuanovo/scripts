/**
 作者：临渊
 日期：7-23
 软件：红旗智联
 抓包：hqapp.faw.cn/fawcshop 这个域名里请求体 Authorization 和 aid
 变量：两个 hqAPP：Authorization hqAid：aid
 定时一天一次
 cron: 15 11 * * *

 [task_local]
 #红旗智联
 15 11 * * *  https://raw.githubusercontent.com/LinYuanovo/scripts/main/hqzl.js, tag=红旗智联, enabled=false
 [rewrite_local]
 https://hqapp.faw.cn/fawcshop/members/task/v2/getTaskList?taskType=integral url script-request-header https://raw.githubusercontent.com/LinYuanovo/scripts/main/hqzl.js
 [MITM]
 hostname = hqapp.faw.cn
 */

 const $ = new Env('红旗智联');
 const notify = $.isNode() ? require('./sendNotify') : '';
 const {log} = console;
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 //////////////////////
 let scriptVersion = "1.0.0";
 let scriptVersionLatest = '';
 let hqAPP = ($.isNode() ? process.env.hqAPP : $.getdata("hqAPP")) || "";
 let hqAPPArr = [];
 let hqAid = ($.isNode() ? process.env.hqAid : $.getdata("hqAid")) || ""
 let hqAidArr = [];
 let data = '';
 let msg = '';
 let activityUrl = 'https://hqapp.faw.cn/fawcshop';
 let luckyDrawBack = 0;
 let contentIdArr = [];
 let getArticlesBack = 0;
 let getQuestionsBack = 0;
 let questionId = 0;
 let questionContent = '';
 let questionIdArr = [];
 let getDynamicBack = 0;
 let dynamicContent = '';
 
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
             log(`\n=================== 共找到 ${hqAPPArr.length} 个账号 ===================`)

             if (debug) {
                 log(`【debug】 这是你的全部账号数组:\n ${hqAPPArr}`);
             }


             for (let index = 0; index < hqAPPArr.length; index++) {


                 let num = index + 1
                 log(`\n========= 开始【第 ${num} 个账号】=========\n`)

                 hqAPP = hqAPPArr[index];
                 hqAid = hqAidArr[index];

                 if (debug) {
                     log(`\n 【debug】 这是你第 ${num} 账号信息:\n ${data}\n`);
                 }

                 msg += `\n\n第${num}个账号运行结果：`

                 log('【开始签到】');
                 await doSignin();
                 await $.wait(randomInt(3000,6000));

                 log('【开始分享】');
                 await doShare();
                 await $.wait(randomInt(3000,6000));
                 // 评论相关 //
                 await getArticles();//获取文章
                 await $.wait(randomInt(3000,6000));

                 if (getArticlesBack) {
                     log(`【开始评论】`);
                     for (let i in contentIdArr) {
                         let temp =+ i;
                         temp ++;
                         await addComment(i);
                         await $.wait(randomInt(3000,6000));
                     }
                 }
                 contentIdArr.length = 0;
                 // 问答相关 //
                 await getQuestions();//获取最新问答
                 await $.wait(randomInt(3000,6000));
                 if (getQuestionsBack) {
                     log('【开始发布问答】');
                     await addQuestion();
                     await $.wait(randomInt(3000,6000));
                 }

                 await getLikesQuestions();//获取最热问答
                 await $.wait(randomInt(3000,6000));
                 if (getQuestionsBack) {
                     log(`【开始回答】`);
                     for (let i in questionIdArr) {
                         await getLikesQuestionsComment(i);//获取最热问答评论
                         await $.wait(randomInt(5000,10000));
                         if (getQuestionsBack) {
                             let temp =+ i;
                             temp ++;
                             await answerQuestion();
                             await $.wait(randomInt(5000,10000));
                         }
                     }
                 }
                 questionIdArr.length = 0;

                 await getDynamic();//获取最新问答
                 await $.wait(randomInt(3000,6000));
                 if (getDynamicBack) {
                     log('【开始发布动态】');
                     await addDynamic();
                     await $.wait(randomInt(3000,6000));
                 }

                 log('【开始获取信息】');
                 await getInfo();
                 await $.wait(randomInt(3000,6000));

             }
             await SendMsg(msg);
         }
     }
 })()
     .catch((e) => log(e))
     .finally(() => $.done())

/**
 * 签到
 */
function doSignin(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-public/v1/score/addScore`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
            body: `{"scoreType":"2"}`,
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
                if (result.code == 000000) {
                    log(`签到成功，获得：${result.data.score}积分`)
                    msg += `\n签到成功，获得：${result.data.score}积分`;
                } else {
                    log(`签到失败，原因是：${result.msg}`)
                    msg += `\n签到失败，原因是：${result.msg}`;
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
 * 分享 (每周一次)
 */
function doShare(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-public/v1/score/addScore`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
            body: `{"scoreType":"4"}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 分享 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 分享 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    if (result.data.score != null) {
                        log(`分享成功，获得：${result.data.score}积分`)
                        msg += `\n分享成功，获得：${result.data.score}积分`;
                    } else {
                        log(`分享成功，但每周上限一次，故未获得积分`)
                        msg += `\n分享成功，但每周上限一次，故未获得积分`;
                    }
                } else {
                    log(`分享失败，原因是：${result.msg}`)
                    msg += `\n分享失败，原因是：${result.msg}`;
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
 * 获取文章
 */
function getArticles(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/cms/api/front/content/queryPostList?city=%E9%93%9C%E4%BB%81%E5%B8%82&stats=2&pageNo=1&pageSize=10`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 获取文章 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 获取文章 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    for (let i = 0; i < 2; i++) {
                        contentIdArr.push(result.data[i].contentId)
                    }
                    getArticlesBack = 1;
                } else {
                    getArticlesBack = 0;
                    log(`获取文章失败，不进行评论，原因是：${result.msg}`)
                    msg += `\n获取文章失败，不进行评论，原因是：${result.msg}`;
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
 * 评论 （每日两次）
 */
function addComment(num) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/cms/api/front/hongqi/comment/save`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
            body: `{"txt":"说得好","contentId":"${contentIdArr[num]}","parentId":""}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 评论 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 评论 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    log(`评论[id=${contentIdArr[num]}]文章成功`)
                    msg += `\n评论[id=${contentIdArr[num]}]文章成功`;
                } else {
                    log(`评论[id=${contentIdArr[num]}]文章失败，原因是：${result.msg}`)
                    msg += `\n评论[id=${contentIdArr[num]}]文章失败，原因是：${result.msg}`;
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
 * 获取问答
 */
function getQuestions(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-qa/v2/QACenter/getQuestionsListRevision?seriesCode=all&pageNo=1&orderByRule=RULE13&pageSize=10&qaSortId=0`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 获取问答 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 获取问答 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    questionId =+ result.data[0].qaSortId;
                    questionId ++;
                    questionContent = result.data[randomInt(0,9)].content;
                    getQuestionsBack = 1;
                } else {
                    getQuestionsBack = 0;
                    log(`获取问答失败，不进行发布问答，原因是：${result.msg}`)
                    msg += `\n获取问答失败，不进行发布问答，原因是：${result.msg}`;
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
 * 发布问答 （每日一次）
 */
function addQuestion(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-qa/v2/QACenter/saveQuestionsDetailRevision`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
            body: `{"catalogId":${questionId},"seriesCode":"all","userType":0,"content":"${questionContent}"}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 发布问答 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 发布问答 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    log(`发布[id=${questionId}]问答成功`)
                    msg += `\n发布[id=${questionId}]问答成功`;
                } else {
                    log(`发布[id=${questionId}]问答失败，原因是：${result.msg}`)
                    msg += `\n发布[id=${questionId}]问答失败，原因是：${result.msg}`;
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
 * 获取最热问答
 */
function getLikesQuestions(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-qa/v2/QACenter/getQuestionsListRevision?seriesCode=all&pageNo=1&orderByRule=RULE12&pageSize=150&qaSortId=0`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 获取最热问答 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 获取最热问答 返回data==============`);
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    let id = randomInt(0,145)
                    for (let i = 0; i < 3; i++) {
                        questionIdArr.push(result.data[id+i].id);
                    }
                    getQuestionsBack = 1;
                } else {
                    getQuestionsBack = 0;
                    log(`获取最热问答失败，不进行回答提问，原因是：${result.msg}`)
                    msg += `\n获取最热问答失败，不进行回答提问，原因是：${result.msg}`;
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
 * 获取最热问答评论
 */
function getLikesQuestionsComment(num) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-sns/v1/dynamicTopic/getCommentUnionList?contentId=${questionIdArr[num]}&commentType=8400&commentDetailsId=&pageSize=10&pageNo=1&orderByRule=RULE10`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 获取最热问答评论 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 获取最热问答评论 返回data==============`);
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    let id = randomInt(0,9)
                    questionId =+ result.data.result[id].commentInfo.contentId;
                    questionContent = result.data.result[id].commentContext;
                    getQuestionsBack = 1;
                } else {
                    getQuestionsBack = 0;
                    log(`获取最热问答评论失败，不进行回答提问，原因是：${result.msg}`)
                    msg += `\n获取最热问答评论失败，不进行回答提问，原因是：${result.msg}`;
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
 * 回答问答 （每日三次）
 */
function answerQuestion() {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-sns/v1/dynamicTopic/saveCommentDetailsRevision`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
            body: `{"commentContext":"${questionContent}","commentType":"8400","contentId":"${questionId}","parentId":"0","fileString":[]}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 回答问答 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 回答问答 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    log(`回答[id=${questionId}]问答成功`)
                    msg += `\n回答[id=${questionId}]问答成功`;
                } else {
                    log(`回答[id=${questionId}]问答失败，原因是：${result.msg}`)
                    msg += `\n回答[id=${questionId}]问答失败，原因是：${result.msg}`;
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
 * 获取动态
 */
function getDynamic(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-sns/v1/dynamicTopic/getDynamicList?pageNo=1&refreshTime=2023-07-23%2015%3A04%3A55&likeFlag=0&orderByRule=RULE19&pageSize=20`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
        }

        if (debug) {
            log(`\n【debug】=============== 这是 获取动态 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.get(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 获取动态 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    dynamicContent = result.data[randomInt(0,19)].content;
                    getDynamicBack = 1;
                } else {
                    getDynamicBack = 0;
                    log(`获取动态失败，不进行发布动态，原因是：${result.msg}`)
                    msg += `\n获取动态失败，不进行发布动态，原因是：${result.msg}`;
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
 * 发布动态 （每日一次）
 */
function addDynamic(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/collect-sns/v1/dynamicTopic/saveDynamicInfoImgUrl`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
            body: `{"province":"北京市","city":"北京市","content":"${dynamicContent}"}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 发布动态 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 发布动态 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    log(`发布[id=${result.data.result.id}]动态成功`)
                    msg += `\n发布[id=${result.data.result.id}]动态成功`;
                } else {
                    log(`发布动态失败，原因是：${result.msg}`)
                    msg += `\n发布动态失败，原因是：${result.msg}`;
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
 * 获取个人信息
 */
function getInfo(timeout = 3 * 1000) {
    return new Promise((resolve) => {
        let url = {
            url: `${activityUrl}/mall/v1/apiCus/getUserInfo`,
            headers: {"Authorization":`${hqAPP}`,"platform":"2","aid":`${hqAid}`,"version":"3.18.0","Content-Type":"application/json","Host":"hqapp.faw.cn","Connection":"Keep-Alive","Accept-Encoding":"gzip","User-Agent":"okhttp/3.11.0"},
            body: `{"userId":"${hqAid}"}`,
        }

        if (debug) {
            log(`\n【debug】=============== 这是 获取个人信息 请求 url ===============`);
            log(JSON.stringify(url));
        }

        $.post(url, async (error, response, data) => {
            try {
                if (debug) {
                    log(`\n\n【debug】===============这是 获取个人信息 返回data==============`);
                    log(data)
                }
                let result = JSON.parse(data);
                if (result.code == 000000) {
                    log(`账号[${result.data.nickname}]积分余额为：${result.data.scoreCount}`)
                    msg += `\n账号[${result.data.nickname}]积分余额为：${result.data.scoreCount}`;
                } else {
                    log(`获取个人信息失败，原因是：${result.msg}`)
                    msg += `\n获取个人信息失败，原因是：${result.msg}`;
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
    if ($request.url.indexOf("v2/getTaskList") > -1) {
        const ck1 = $request.headers.Authorization;
        const ck2 = $request.headers.aid;
        if (hqAPP) {
            if (hqAPP.indexOf(ck1) == -1) {
                hqAPP = hqAPP + "@" + ck1;
                $.setdata(hqAPP, "hqAPP");
                let List = hqAPP.split("@");
                $.msg(
                    $.name + ` 获取第${List.length}个 ck 成功: ${ck1} ,不用请自行关闭重写!`
                );
            }
        } else {
            $.setdata(ck1, "hqAPP");
            $.msg($.name + ` 获取第1个 ck 成功: ${ck1} ,不用请自行关闭重写!`);
        }
        if (hqAid) {
            if (hqAid.indexOf(ck2) == -1) {
                hqAid = hqAid + "@" + ck2;
                $.setdata(hqAid, "hqAid");
                let List = hqAid.split("@");
                $.msg(
                    $.name + ` 获取第${List.length}个 ck 成功: ${ck2} ,不用请自行关闭重写!`
                );
            }
        } else {
            $.setdata(ck2, "hqAid");
            $.msg($.name + ` 获取第1个 ck 成功: ${ck2} ,不用请自行关闭重写!`);
        }
    }
}
 // ============================================变量检查============================================ \\
 async function Envs() {
    if (hqAid) {
        if (hqAid.indexOf("@") != -1) {
            hqAid.split("@").forEach((item) => {
                hqAidArr.push(item);
            });
        } else if (hqAid.indexOf("\n") != -1) {
            hqAid.split("\n").forEach((item) => {
                hqAidArr.push(item);
            });
        } else {
            hqAidArr.push(hqAid);
        }
    } else {
        log(`\n 【${$.name}】：未填写变量 hqAid`)
    }
    if (hqAPP) {
        if (hqAPP.indexOf("@") != -1) {
            hqAPP.split("@").forEach((item) => {
                hqAPPArr.push(item);
            });
        } else if (hqAPP.indexOf("\n") != -1) {
            hqAPP.split("\n").forEach((item) => {
                hqAPPArr.push(item);
            });
        } else {
            hqAPPArr.push(hqAPP);
        }
    } else {
        log(`\n 【${$.name}】：未填写变量 hqAPP`)
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
            url: `https://raw.gh.fakev.cn/LinYuanovo/scripts/main/hqzl.js`,
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