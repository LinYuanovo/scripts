/**
 作者：临渊
 日期：6-12
 小程序：统一快乐星球
 入口：活动->种番茄
 功能：除了助力都能完成
 抓包：api.xiaoyisz.com/qiehuang/ga/public/api/login  这个登录包里 body 部分的 全部
 变量：tybody='body@xxxx '  多个账号用 @ 或者 换行 分割 
 定时一天三次，八个小时一次收取冒险奖励
 cron: 10 12,18 * * *

 [task_local]
 #统一茄皇
 10 12,18 * * *  https://raw.githubusercontent.com/LinYuanovo/scripts/main/tyqh.js, tag=统一茄皇, enabled=true
 [rewrite_local]
 http://api.xiaoyisz.com/qiehuang/ga/public/api/login url script-request-header https://raw.githubusercontent.com/LinYuanovo/scripts/main/tyqh.js
 [MITM]
 hostname = api.xiaoyisz.com

 6-14 更新了AU获取方式，理论上不会过期了
 6-18 更新了收取植物、种新的植物和推送加上昵称，方便辨认（可能）
 6-22 修复了上报挑战失败、洒阳光失败，更新了种植进度（免得老有人说脚本坏了）
 6-24 优化日志，更新了随机UA，可以自己抓 user-agent 填到变量 UA 里面，也可以不填直接改脚本里 uaNum 的数字
 6-26 移除了开始冒险，加到助力脚本，现在四个号可以两个小时冒险一次
 6-28 新增偷取好友阳光（出自jujuju大佬）
 8-11 更新了sign
 */

 const $ = new Env("统一茄皇");
 const notify = $.isNode() ? require("./sendNotify") : "";
 const { log } = console;
 const Notify = 1; //0为关闭通知，1为打开通知,默认为1
 const debug = 0; //0为关闭调试，1为打开调试,默认为0
 const uaNum = 1; //随机UA，从0-20随便选一个填上去
 let scriptVersion = "2.0.0";
 //////////////////////
const _0x5bbc=['readFile','Mozilla/5.0\x20(Linux;\x20Android\x209;\x2016T\x20Build/PKQ1.190616.001;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/66.0.3359.126\x20MQQBrowser/6.2\x20TBS/044942\x20Mobile\x20Safari/537.36','，进度：','\x20获取第','http://api.xiaoyisz.com/qiehuang/ga/challenge/start?timestamp=','tybody','qiehuang/ga/public/api/login','exception','\x0a【debug】===============\x20这是\x20查询冒险\x20请求\x20url\x20===============','warn','\x20个账号\x20===================','Mozilla/5.0\x20(Linux;\x20Android\x2011;\x20Redmi\x20K30\x205G\x20Build/RKQ1.200826.002;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/77.0.3865.120\x20MQQBrowser/6.2\x20TBS/045511\x20Mobile\x20Safari/537.36','阳光不足','冒险开始成功','&timestamp=','【开始收取阳光】','\x0a\x0a【debug】===============这是\x20领取奖励\x20返回data==============','Mozilla/5.0\x20(iPod;\x20U;\x20CPU\x20iPhone\x20OS\x203_1\x20like\x20Mac\x20OS\x20X;\x20rw-RW)\x20AppleWebKit/531.9.3\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0.5\x20Mobile/8B118\x20Safari/6531.9.3','\x0a【debug】===============\x20这是\x20领取奖励\x20请求\x20url\x20===============','\x0a【debug】===============\x20这是\x20上报冒险\x20请求\x20url\x20===============','任务领取奖励失败，原因是：','\x0a\x0a【debug】===============这是\x20获取植物详情\x20返回data==============','】：未填写变量\x20tybody','data','个任务未完成，开始执行第','【开始进行挑战】','\x20\x0a=============================================\x0a','&attachId=','utf8','parse','http://api.xiaoyisz.com/qiehuang/ga/user/info?userId=-1&timestamp=','收取失败，原因是：','\x0a\x0a【debug】===============这是\x20获取任务\x20返回data==============','\x0a\x0a【debug】===============这是\x20获取AU\x20返回data==============','&signature=','\x20获取第1个\x20ck\x20成功:\x20','tyau=\x22','Mozilla/5.0\x20(Linux;\x20Android\x2010;\x20ONEPLUS\x20A6000\x20Build/QKQ1.190716.003;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/77.0.3865.120\x20MQQBrowser/6.2\x20TBS/045224\x20Mobile\x20Safari/537.36','apply','toFixed','taskType','done','\x0a\x0a【debug】===============这是\x20上报冒险\x20返回data==============','writeFile','api.xiaoyisz.com','Mozilla/5.0\x20(Linux;\x20Android\x209;\x20MI\x206\x20Build/PKQ1.190118.001;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/66.0.3359.126\x20MQQBrowser/6.2\x20TBS/044942\x20Mobile\x20Safari/537.36','{\x22battleId\x22:','植物奖励收取成功，获得','getTime','fromCharCode','random','floor','\x0a\x0a【debug】===============这是\x20浇水\x20返回data==============','【开始收取植物】','冒险已收取','table','code','读取文件失败！','sendNotify','needSunshineNum','msg','获取任务列表成功','获取AU失败，原因是：','Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2013_5\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Mobile/15E148','\x0a\x0a【debug】===============这是\x20收植物\x20返回data==============','http://api.xiaoyisz.com/qiehuang/ga/user/task/drawPrize?taskId=','\x20============','completeTimes','length','Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2013_6\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Mobile/15E148','tyhz','constructor','查询上一次冒险失败，可能是未进行','undefined','种新的植物成功','finally','距离冒险结束小于一分钟，等待','开始挑战失败，次数不足','AU失效，请重抓','冒险收取成功','【开始查询冒险奖励】','tomatoNum','种失败，原因是：已种植','stringify','compile','Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2013_7\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/532.0\x20(KHTML,\x20like\x20Gecko)\x20FxiOS/18.2n0520.0\x20Mobile/50C216\x20Safari/532.0','\x0aAU失效，请重抓','\x0a【debug】===============\x20这是\x20获取任务\x20请求\x20url\x20===============','return\x20/\x22\x20+\x20this\x20+\x20\x22/','http://api.xiaoyisz.com/qiehuang/ga/user/task/list?timestamp=','body','\x0a【debug】===============\x20这是\x20获取信息\x20请求\x20url\x20===============','Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2013_3\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Mobile/15E148','\x20,不用请自行关闭重写!','\x20个账号数组:\x0a\x20','\x0a\x20【','植物奖励已收取','log','Mozilla/5.0\x20(Linux;\x20Android\x2010;\x20ONEPLUS\x20A5010\x20Build/QKQ1.191014.012;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/77.0.3865.120\x20MQQBrowser/6.2\x20TBS/045230\x20Mobile\x20Safari/537.36','/ql/data/config/config.sh','indexOf','debug',']番茄余额为：','Mozilla/5.0\x20(Linux;\x20Android\x2010;\x20Redmi\x20K20\x20Pro\x20Premium\x20Edition\x20Build/QKQ1.190825.002;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/77.0.3865.120\x20MQQBrowser/6.2\x20TBS/045227\x20Mobile\x20Safari/537.36','\x20个账号】=========\x0a','\x0a【debug】===============\x20这是\x20开始挑战\x20请求\x20url\x20===============','\x0a\x0a【debug】===============这是\x20查询冒险\x20返回data==============','env','\x0a【debug】===============\x20这是\x20上报挑战\x20请求\x20url\x20===============','\x0a\x0a【debug】===============这是\x20上报任务\x20返回data==============','Mozilla/5.0\x20(Linux;\x20Android\x208.1.0;\x20MI\x208\x20Build/OPM1.171019.026;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/66.0.3359.126\x20MQQBrowser/6.2\x20TBS/045131\x20Mobile\x20Safari/537.36','结果期','\x0a【debug】===============\x20这是\x20种植物\x20请求\x20url\x20===============','秒后收取冒险奖励','^([^\x20]+(\x20+[^\x20]+)+)+[^\x20]}','幼苗期','【开始洒阳光】','查询成功，账号[','\x0aAU错误，可能是获取失败，请更换到环境变量或配置文件重试','http://api.xiaoyisz.com/qiehuang/ga/plant/start?timestamp=','retryTimes','test','plantId错误','toString','get','\x0a\x0a【debug】===============这是\x20获取信息\x20返回data==============','isNode','forEach','获取AU成功','url','plantId错误，可能是运行的bug，不用管','\x0a【debug】===============\x20这是\x20开始冒险\x20请求\x20url\x20===============','浇水升级成功','&nonce=','发育期','个任务】','\x0a【debug】===============\x20这是\x20获取AU\x20请求\x20url\x20===============','Mozilla/5.0\x20(Linux;\x20Android\x208.0.0;\x20HTC\x20U-3w\x20Build/OPR6.170623.013;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/66.0.3359.126\x20MQQBrowser/6.2\x20TBS/044942\x20Mobile\x20Safari/537.36','http://api.xiaoyisz.com/qiehuang/ga/public/api/login','charAt','message','http://api.xiaoyisz.com/qiehuang/ga/user/daily/pickup?timestamp=','Mozilla/5.0\x20(Linux;\x20Android\x208.1.0;\x2016\x20X\x20Build/OPM1.171019.026;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/66.0.3359.126\x20MQQBrowser/6.2\x20TBS/044942\x20Mobile\x20Safari/537.36','洒阳光成功','个\x20ck\x20成功:\x20','Mozilla/5.0\x20(Linux;\x20Android\x2010;\x20LYA-AL00\x20Build/HUAWEILYA-AL00L;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/77.0.3865.120\x20MQQBrowser/6.2\x20TBS/045230\x20Mobile\x20Safari/537.36','【开始获取AU】','toUpperCase','match','&taskId=','infos','split','toLocaleString','\x0a\x0a【debug】===============这是\x20洒阳光\x20返回data==============','QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890','开花期','http://api.xiaoyisz.com/qiehuang/ga/user/adventure/info?userId=-1&type=2&timestamp=','http://api.xiaoyisz.com/qiehuang/ga/plant/batchgiveSunshine?plantId=','num','任务不是待领取状态','\x0a\x0a【debug】===============这是\x20种植物\x20返回data==============','{}.constructor(\x22return\x20this\x22)(\x20)','info','【开始获取植物详情】','http://api.xiaoyisz.com/qiehuang/ga/challenge/report?timestamp=','获取植物详情成功','catch','收取阳光失败，无可收取的阳光','\x0a============\x20当前版本：','个番茄','https://raw.gh.fakev.cn/LinYuanovo/scripts/main/tyqh.js','trace','挑战成功','author','console','\x0a【debug】===============\x20这是\x20上报任务\x20请求\x20url\x20===============','./sendNotify','\x0a账号[','round','adventureId','content','wait','上报任务失败，可能是已经完成','setdata','name','endTime','origin','当前无可收取的冒险','application/json','\x0a\x0a【debug】===============这是\x20查询番茄余额\x20返回data==============','charCodeAt','Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2014_2\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/532.0\x20(KHTML,\x20like\x20Gecko)\x20CriOS/43.0.823.0\x20Mobile/65M532\x20Safari/532.0','\x0a\x0a【debug】===============这是\x20开始挑战\x20返回data==============','plantId','【开始查询信息】','【debug】\x20这是你的第\x20','\x0a【debug】===============\x20这是\x20浇水\x20请求\x20url\x20===============','\x0a【debug】===============\x20这是\x20收取阳光\x20请求\x20url\x20===============','\x20\x20\x0a————《','nickName','\x20\x20最新版本：','秒，大于一分钟，不进行等待','logErr','stage','push','种新的植物失败，原因是：','Mozilla/5.0\x20(Linux;\x20Android\x2010;\x20M2006J10C\x20Build/QP1A.190711.020;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/77.0.3865.120\x20MQQBrowser/6.2\x20TBS/045230\x20Mobile\x20Safari/537.36','http://api.xiaoyisz.com/qiehuang/ga/plant/upgrade?plantId=','substr','已达到收获阶段','只能给自己批量洒阳光','\x0a【debug】===============\x20这是\x20洒阳光\x20请求\x20url\x20===============','getdata','，植物状态为：','【debug】\x20这是你的全部账号数组:\x0a\x20','\x0a助力任务还未完成，建议执行互助\x0a','status'];(function(_0x1cd57,_0x5bbcdc){const _0x3962b5=function(_0x1244d6){while(--_0x1244d6){_0x1cd57['push'](_0x1cd57['shift']());}};const _0x56db86=function(){const _0x41e4f7={'data':{'key':'cookie','value':'timeout'},'setCookie':function(_0x2e2b43,_0x2a770d,_0x31cd43,_0x214b94){_0x214b94=_0x214b94||{};let _0xbb5771=_0x2a770d+'='+_0x31cd43;let _0x1b04e=0x0;for(let _0xc28ad9=0x0,_0x2b9efd=_0x2e2b43['length'];_0xc28ad9<_0x2b9efd;_0xc28ad9++){const _0x57af1f=_0x2e2b43[_0xc28ad9];_0xbb5771+=';\x20'+_0x57af1f;const _0x2d045c=_0x2e2b43[_0x57af1f];_0x2e2b43['push'](_0x2d045c);_0x2b9efd=_0x2e2b43['length'];if(_0x2d045c!==!![]){_0xbb5771+='='+_0x2d045c;}}_0x214b94['cookie']=_0xbb5771;},'removeCookie':function(){return'dev';},'getCookie':function(_0x2d5074,_0x4bf5f){_0x2d5074=_0x2d5074||function(_0x5d53){return _0x5d53;};const _0x449bb4=_0x2d5074(new RegExp('(?:^|;\x20)'+_0x4bf5f['replace'](/([.$?*|{}()[]\/+^])/g,'$1')+'=([^;]*)'));const _0x1aab9d=function(_0x3243db,_0x47a551){_0x3243db(++_0x47a551);};_0x1aab9d(_0x3962b5,_0x5bbcdc);return _0x449bb4?decodeURIComponent(_0x449bb4[0x1]):undefined;}};const _0x56ffd8=function(){const _0xf42432=new RegExp('\x5cw+\x20*\x5c(\x5c)\x20*{\x5cw+\x20*[\x27|\x22].+[\x27|\x22];?\x20*}');return _0xf42432['test'](_0x41e4f7['removeCookie']['toString']());};_0x41e4f7['updateCookie']=_0x56ffd8;let _0x6f2775='';const _0x49ac83=_0x41e4f7['updateCookie']();if(!_0x49ac83){_0x41e4f7['setCookie'](['*'],'counter',0x1);}else if(_0x49ac83){_0x6f2775=_0x41e4f7['getCookie'](null,'counter');}else{_0x41e4f7['removeCookie']();}};_0x56db86();}(_0x5bbc,0x64));const _0x3962=function(_0x1cd57,_0x5bbcdc){_0x1cd57=_0x1cd57-0x0;let _0x3962b5=_0x5bbc[_0x1cd57];return _0x3962b5;};const _0x2e2b43=function(){let _0xa1e1f8=!![];return function(_0x2700dc,_0x481f70){const _0x3fb419=_0xa1e1f8?function(){if(_0x481f70){const _0x7e1fc5=_0x481f70[_0x3962('0x9b')](_0x2700dc,arguments);_0x481f70=null;return _0x7e1fc5;}}:function(){};_0xa1e1f8=![];return _0x3fb419;};}();const _0x49ac83=_0x2e2b43(this,function(){const _0x400f67=function(){const _0x467c48=_0x400f67[_0x3962('0xbc')](_0x3962('0xcd'))()[_0x3962('0xc9')](_0x3962('0xe'));return!_0x467c48[_0x3962('0x15')](_0x49ac83);};return _0x400f67();});_0x49ac83();const _0x41e4f7=function(){let _0x3574c7=!![];return function(_0x806075,_0x4c72b4){const _0x6709f0=_0x3574c7?function(){if(_0x4c72b4){const _0x1d494c=_0x4c72b4[_0x3962('0x9b')](_0x806075,arguments);_0x4c72b4=null;return _0x1d494c;}}:function(){};_0x3574c7=![];return _0x6709f0;};}();const _0x1244d6=_0x41e4f7(this,function(){const _0x285c13=function(){};const _0x47d130=function(){let _0x597577;try{_0x597577=Function('return\x20(function()\x20'+_0x3962('0x3d')+');')();}catch(_0x550f36){_0x597577=window;}return _0x597577;};const _0x260bbe=_0x47d130();if(!_0x260bbe[_0x3962('0x4a')]){_0x260bbe[_0x3962('0x4a')]=function(_0x3bdc72){const _0xf014b2={};_0xf014b2[_0x3962('0xd6')]=_0x3bdc72;_0xf014b2[_0x3962('0x7e')]=_0x3bdc72;_0xf014b2[_0x3962('0x1')]=_0x3bdc72;_0xf014b2[_0x3962('0x3e')]=_0x3bdc72;_0xf014b2['error']=_0x3bdc72;_0xf014b2[_0x3962('0x7c')]=_0x3bdc72;_0xf014b2['table']=_0x3bdc72;_0xf014b2['trace']=_0x3bdc72;return _0xf014b2;}(_0x285c13);}else{_0x260bbe[_0x3962('0x4a')]['log']=_0x285c13;_0x260bbe[_0x3962('0x4a')][_0x3962('0x7e')]=_0x285c13;_0x260bbe[_0x3962('0x4a')][_0x3962('0x1')]=_0x285c13;_0x260bbe['console'][_0x3962('0x3e')]=_0x285c13;_0x260bbe[_0x3962('0x4a')]['error']=_0x285c13;_0x260bbe['console'][_0x3962('0x7c')]=_0x285c13;_0x260bbe[_0x3962('0x4a')][_0x3962('0xac')]=_0x285c13;_0x260bbe[_0x3962('0x4a')][_0x3962('0x47')]=_0x285c13;}});_0x1244d6();let scriptVersionLatest='';let tyau='';let tybody=($[_0x3962('0x1a')]()?process[_0x3962('0x7')]['tybody']:$[_0x3962('0x70')](_0x3962('0x7a')))||'';let UA=($[_0x3962('0x1a')]()?process[_0x3962('0x7')]['UA']:$[_0x3962('0x70')]('UA'))||'';let UAArr=[];let tybodyArr=[];let newAuArr=[];let tyPlantId='';let plantIdArr=[];let auback=0x0;let data='';let msg='';let taskType=0x0;let taskBack=[];let taskTypeArr=[];let taskId='';let taskIdArr=[];let challengeId='';let adventureId='';let adventureBack=0x0;let name='';let id='';let idArr=[];let progress=0x0;let plantStage=0x0;let plantStatus='';let helpTaskId='';let helpTaskIdArr=[];let giveSunshineBack=0x0;let stealFull=![];let nonce='';let timestamp='';let signature='';const User_Agents=[_0x3962('0xd7'),'Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2014_3\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Mobile/15E148','Mozilla/5.0\x20(Linux;\x20Android\x209;\x20Mi\x20Note\x203\x20Build/PKQ1.181007.001;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/66.0.3359.126\x20MQQBrowser/6.2\x20TBS/045131\x20Mobile\x20Safari/537.36','Mozilla/5.0\x20(Linux;\x20Android\x2010;\x20GM1910\x20Build/QKQ1.190716.003;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/77.0.3865.120\x20MQQBrowser/6.2\x20TBS/045230\x20Mobile\x20Safari/537.36',_0x3962('0x76'),_0x3962('0xba'),_0x3962('0xb4'),_0x3962('0x5b'),_0x3962('0x86'),_0x3962('0xa2'),_0x3962('0x80'),_0x3962('0x9a'),'Mozilla/5.0\x20(Linux;\x20Android\x209;\x20MHA-AL00\x20Build/HUAWEIMHA-AL00;\x20wv)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Version/4.0\x20Chrome/66.0.3359.126\x20MQQBrowser/6.2\x20TBS/044942\x20Mobile\x20Safari/537.36',_0x3962('0x25'),_0x3962('0x2d'),_0x3962('0xa'),_0x3962('0x3'),_0x3962('0x2a'),_0x3962('0x6a'),_0x3962('0xca'),'Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2013_3\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Mobile/15E148',_0x3962('0xd1')];let ua=User_Agents[uaNum];!(async()=>{if(typeof $request!==_0x3962('0xbe')){await GetRewrite();}else{if(!await Envs())return;else{log('\x0a\x0a=============================================\x20\x20\x20\x20\x0a脚本执行\x20-\x20北京时间(UTC+8)：'+new Date(new Date()['getTime']()+new Date()['getTimezoneOffset']()*0x3c*0x3e8+0x8*0x3c*0x3c*0x3e8)[_0x3962('0x34')]()+_0x3962('0x8f'));await poem();await getVersion();log(_0x3962('0x44')+scriptVersion+_0x3962('0x64')+scriptVersionLatest+_0x3962('0xb7'));log('\x0a===================\x20共找到\x20'+tybodyArr[_0x3962('0xb9')]+_0x3962('0x7f'));if(debug){log(_0x3962('0x72')+tybodyArr);}for(let _0x14464e=0x0;_0x14464e<tybodyArr[_0x3962('0xb9')];_0x14464e++){ua=User_Agents[uaNum+_0x14464e];if(UA){if(_0x14464e>=UAArr['length']){let _0x5ab5b9=UAArr[_0x3962('0xb9')]+randomInt(0x0,0x2);ua=User_Agents[uaNum+_0x5ab5b9];}else ua=UAArr[_0x14464e];}tybody=tybodyArr[_0x14464e];let _0x2f839e=_0x14464e+0x1;log('\x0a=========\x20开始【第\x20'+_0x2f839e+_0x3962('0x4'));if(debug){log(_0x3962('0x5f')+_0x2f839e+_0x3962('0xd3')+tybody);}msg+='\x0a第'+_0x2f839e+'个账号运行结果：';log(_0x3962('0x2e'));await refreshAu();await $[_0x3962('0x51')](0x2*0x3e8);newAuArr[_0x14464e]=tyau;log('【开始查询任务】');await getTask();await $[_0x3962('0x51')](0x2*0x3e8);helpTaskIdArr[_0x14464e]=helpTaskId;if(auback!=0x1){for(let _0x12c6e7=0x0;_0x12c6e7<0xa;_0x12c6e7++){if(taskBack[_0x12c6e7]){if(_0x12c6e7==0x0){log(_0x3962('0x73'));}else log('【第'+(_0x12c6e7+0x1)+_0x3962('0x8d')+(_0x12c6e7+0x1)+_0x3962('0x23'));await report(_0x12c6e7);if(_0x12c6e7==0x2){await report(_0x12c6e7);await report(_0x12c6e7);await report(_0x12c6e7);await report(_0x12c6e7);}await $[_0x3962('0x51')](0x2*0x3e8);await getDrawPriz(_0x12c6e7);await $[_0x3962('0x51')](0x2*0x3e8);}}log(_0x3962('0x84'));await getSunshine();await $[_0x3962('0x51')](0x2*0x3e8);log(_0x3962('0x8e'));await startCallenge();await $[_0x3962('0x51')](0x2*0x3e8);log(_0x3962('0xc5'));await queryAdventure();await $[_0x3962('0x51')](0x2*0x3e8);log('【开始获取植物详情】');await getPlant(_0x14464e);await $[_0x3962('0x51')](0x2*0x3e8);plantIdArr[_0x14464e]=tyPlantId;log(_0x3962('0x10'));do{await giveSunshine();await $[_0x3962('0x51')](0x2*0x3e8);}while(giveSunshineBack==0x1);log(_0x3962('0x3f'));await getPlant(_0x14464e);await $[_0x3962('0x51')](0x2*0x3e8);plantIdArr[_0x14464e]=tyPlantId;log(_0x3962('0x5e'));await getUserInfo();await $['wait'](0x2*0x3e8);idArr[_0x14464e]=id;}}await SendMsg(msg);}}})()[_0x3962('0x42')](_0x2028fe=>log(_0x2028fe))[_0x3962('0xc0')](()=>$[_0x3962('0x9e')]());function refreshAu(_0x3b8b2f=0x2*0x3e8){let _0x20a09f={'url':_0x3962('0x26'),'headers':{'Host':_0x3962('0xa1'),'user-agent':''+ua,'Content-Type':_0x3962('0x58')},'body':''+tybody};return new Promise(_0x194868=>{if(debug){log(_0x3962('0x24'));log(JSON[_0x3962('0xc8')](_0x20a09f));}$['post'](_0x20a09f,async(_0x2755c5,_0x114e3d,_0x3a1419)=>{try{if(debug){log(_0x3962('0x96'));log(_0x3a1419);}let _0x5148d8=JSON[_0x3962('0x92')](_0x3a1419);if(_0x5148d8[_0x3962('0xad')]==0x0){log(_0x3962('0x1c'));tyau=_0x5148d8[_0x3962('0x8c')];}else if(_0x5148d8[_0x3962('0xad')]==0x1f4){log('获取AU失败，请检查你的变量是否正确，如正确更换到环境变量或者配置文件重试');auback=0x1;}else{log(_0x3962('0xb3')+_0x5148d8[_0x3962('0x28')]);}}catch(_0x2a1ef9){log(_0x2a1ef9);}finally{_0x194868();}},_0x3b8b2f);});}function report(_0x3ad3aa){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x39f3f2={'url':'http://api.xiaoyisz.com/qiehuang/ga/user/task/report?taskType='+taskTypeArr[_0x3ad3aa]+_0x3962('0x90')+timestampMs()+_0x3962('0x31')+taskIdArr[_0x3ad3aa]+_0x3962('0x83')+timestamp+_0x3962('0x21')+nonce+'&signature='+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'content-type':_0x3962('0x58')}};return new Promise(_0x46ec0d=>{if(debug){log(_0x3962('0x4b'));log(JSON[_0x3962('0xc8')](_0x39f3f2));}$[_0x3962('0x18')](_0x39f3f2,async(_0x335ad1,_0x12d867,_0x54e3be)=>{try{if(debug){log(_0x3962('0x9'));log(_0x54e3be);}let _0x4b59ba=JSON[_0x3962('0x92')](_0x54e3be);if(_0x4b59ba['code']==0x388){refreshAu();}if(_0x4b59ba[_0x3962('0xad')]==0x386){auback=0x1;log(_0x3962('0xc3'));msg+=_0x3962('0xcb');}else if(_0x4b59ba[_0x3962('0x8c')][_0x3962('0x74')]===0x1){log('上报任务成功');}else if(_0x4b59ba[_0x3962('0x8c')][_0x3962('0x74')]==-0x2||_0x4b59ba[_0x3962('0x8c')][_0x3962('0x74')]==0x2){log(_0x3962('0x52'));}else{log('上报任务失败，原因是：'+_0x4b59ba['message']);}}catch(_0x4e2475){log(_0x4e2475);}finally{_0x46ec0d();}});});}function getDrawPriz(_0x3d1746){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x647327={'url':_0x3962('0xb6')+taskIdArr[_0x3d1746]+_0x3962('0x83')+timestamp+'&nonce='+nonce+_0x3962('0x97')+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'content-type':_0x3962('0x58')}};return new Promise(_0x2f9399=>{if(debug){log(_0x3962('0x87'));log(JSON['stringify'](_0x647327));}$[_0x3962('0x18')](_0x647327,async(_0x2be656,_0x1135cd,_0x4bfbf9)=>{try{if(debug){log(_0x3962('0x85'));log(_0x4bfbf9);}let _0x8f1428=JSON[_0x3962('0x92')](_0x4bfbf9);if(_0x8f1428[_0x3962('0xad')]==0x388){refreshAu();}if(_0x8f1428[_0x3962('0xad')]==0x386){auback=0x1;log(_0x3962('0xc3'));msg+=_0x3962('0xcb');}else if(_0x8f1428[_0x3962('0xad')]===0x3e8){log(_0x3962('0x3b'));}else if(_0x8f1428['code']==0x0){let _0x44e900=eval(_0x8f1428[_0x3962('0x8c')]);log('['+_0x44e900[_0x3962('0x54')]+']任务领取奖励成功');}else{log(_0x3962('0x89')+_0x8f1428[_0x3962('0x28')]);}}catch(_0x1b13b6){log(_0x1b13b6);}finally{_0x2f9399();}});});}function getTask(_0x1f8ab2=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x4e07ad={'url':_0x3962('0xce')+timestamp+_0x3962('0x21')+nonce+'&signature='+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'content-type':_0x3962('0x58')}};return new Promise(_0x2f3bcc=>{if(debug){log(_0x3962('0xcc'));log(JSON[_0x3962('0xc8')](_0x4e07ad));}$[_0x3962('0x18')](_0x4e07ad,async(_0x54f26f,_0x34f1a4,_0x5ea28c)=>{try{if(debug){log(_0x3962('0x95'));log(_0x5ea28c);}let _0x3b8560=JSON[_0x3962('0x92')](_0x5ea28c);let _0x5b00c6=eval(_0x3b8560);if(_0x3b8560[_0x3962('0xad')]==0x385||_0x3b8560['code']==0x386||_0x3b8560[_0x3962('0xad')]==0x387){auback=0x1;log('AU错误，可能是获取失败，请更换到环境变量或配置文件重试');msg+=_0x3962('0x12');}if(auback!=0x1&&_0x3b8560[_0x3962('0xad')]==0x0){log(_0x3962('0xb2'));for(let _0xd5fe8c=0x0;_0xd5fe8c<0xa;_0xd5fe8c++){if(_0xd5fe8c==0x0){helpTaskId=_0x5b00c6[_0x3962('0x8c')][_0xd5fe8c]['taskId'];}taskType=_0x5b00c6[_0x3962('0x8c')][_0xd5fe8c][_0x3962('0x9d')];taskTypeArr[_0xd5fe8c]=taskType;taskId=_0x5b00c6[_0x3962('0x8c')][_0xd5fe8c]['taskId'];taskIdArr[_0xd5fe8c]=taskId;if(_0x5b00c6[_0x3962('0x8c')][_0xd5fe8c][_0x3962('0xb8')]!=_0x5b00c6[_0x3962('0x8c')][_0xd5fe8c][_0x3962('0x14')]){taskBack[_0xd5fe8c]=0x1;}}}}catch(_0x290e39){log(_0x290e39);}finally{_0x2f3bcc();}},_0x1f8ab2);});}function getPlant(_0x4a4819){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x3e8387={'url':'http://api.xiaoyisz.com/qiehuang/ga/plant/info?userId=-1&timestamp='+timestamp+_0x3962('0x21')+nonce+_0x3962('0x97')+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'content-type':_0x3962('0x58')}};return new Promise(_0x21aa72=>{if(debug){log('\x0a【debug】===============\x20这是\x20获取植物详情\x20请求\x20url\x20===============');log(JSON[_0x3962('0xc8')](_0x3e8387));}$['get'](_0x3e8387,async(_0xdea1b1,_0x757ffb,_0x308848)=>{try{if(debug){log(_0x3962('0x8a'));log(_0x308848);}let _0x50e10e=JSON['parse'](_0x308848);let _0x1802d0=eval(_0x50e10e);if(_0x50e10e[_0x3962('0xad')]==0x388){refreshAu();}if(_0x50e10e['data'][_0x3962('0x67')]==-0x1){await $[_0x3962('0x51')](0x2*0x3e8);getNewPlant();}if(_0x50e10e[_0x3962('0xad')]==0x0){log(_0x3962('0x41'));tyPlantId=_0x50e10e[_0x3962('0x8c')][_0x3962('0x5d')];progress=+_0x50e10e['data']['currentSunshineNum']/_0x50e10e['data'][_0x3962('0xb0')];progress=progress*0x64;progress=progress[_0x3962('0x9c')](0x2);plantStage=+_0x50e10e['data']['stage'];}else log('获取植物详情失败');}catch(_0x5be089){log(_0x5be089);}finally{_0x21aa72();}});});}function startCallenge(_0x12fb04=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x5cd263={'url':_0x3962('0x79')+timestamp+_0x3962('0x21')+nonce+_0x3962('0x97')+signature,'headers':{'Host':'api.xiaoyisz.com','authorization':''+tyau,'user-agent':''+ua,'content-type':_0x3962('0x58')}};return new Promise(_0x3c2354=>{if(debug){log(_0x3962('0x5'));log(JSON[_0x3962('0xc8')](_0x5cd263));}$['get'](_0x5cd263,async(_0x53eb48,_0x4cffde,_0x4b9203)=>{try{if(debug){log(_0x3962('0x5c'));log(_0x4b9203);}let _0x22709f=JSON[_0x3962('0x92')](_0x4b9203);if(_0x22709f[_0x3962('0xad')]==0x388){refreshAu();}if(auback!=0x1&&_0x22709f[_0x3962('0xad')]==0x0){challengeId=_0x22709f[_0x3962('0x8c')];reportCallenge();$['wait'](0x2*0x3e8);}else if(_0x22709f[_0x3962('0xad')]==0x3e8){log(_0x3962('0xc2'));}}catch(_0x61e1dd){log(_0x61e1dd);}finally{_0x3c2354();}},_0x12fb04);});}function reportCallenge(_0x43faf1=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x42e9c2={'url':_0x3962('0x40')+timestamp+_0x3962('0x21')+nonce+_0x3962('0x97')+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'Content-Type':_0x3962('0x58')},'body':_0x3962('0xa3')+challengeId+',\x22result\x22:1,\x22costMillisecond\x22:'+randomInt(0x1964,0x2ee0)+'}'};return new Promise(_0xd6053a=>{if(debug){log(_0x3962('0x8'));log(JSON['stringify'](_0x42e9c2));}$['post'](_0x42e9c2,async(_0x42ea55,_0x1d1e38,_0x154f6c)=>{try{if(debug){log('\x0a\x0a【debug】===============这是\x20上报挑战\x20返回data==============');log(_0x154f6c);}let _0x2c483c=JSON[_0x3962('0x92')](_0x154f6c);let _0x131511=eval(_0x2c483c['data']);if(_0x2c483c[_0x3962('0xad')]==0x388){refreshAu();}if(auback!=0x1&&_0x2c483c[_0x3962('0xad')]==0x0){log(_0x3962('0x48'));startCallenge();}else log('挑战次数不足');}catch(_0x4c50c7){log(_0x4c50c7);}finally{_0xd6053a();}},_0x43faf1);});}function startAdventure(_0x27fd7a=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x30117d={'url':'http://api.xiaoyisz.com/qiehuang/ga/user/adventure/start?timestamp='+timestamp+_0x3962('0x21')+nonce+_0x3962('0x97')+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'content-type':_0x3962('0x58')}};return new Promise(_0x1ea6a0=>{if(debug){log(_0x3962('0x1f'));log(JSON[_0x3962('0xc8')](_0x30117d));}$[_0x3962('0x18')](_0x30117d,async(_0x439842,_0x2c8e07,_0x17d64d)=>{try{if(debug){log('\x0a\x0a【debug】===============这是\x20开始冒险\x20返回data==============');log(_0x17d64d);}let _0x564900=JSON['parse'](_0x17d64d);if(_0x564900[_0x3962('0xad')]==0x388){refreshAu();}if(_0x564900[_0x3962('0xad')]==0x0){log(_0x3962('0x82'));}else if(_0x564900[_0x3962('0xad')]==0x3e8){log('冒险开始失败，可能是上报异常或者当前已有冒险');}else log(''+_0x564900[_0x3962('0x28')]);}catch(_0x3910a9){log(_0x3910a9);}finally{_0x1ea6a0();}},_0x27fd7a);});}function queryAdventure(_0x348a71=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x4fa3ef={'url':_0x3962('0x38')+timestamp+_0x3962('0x21')+nonce+_0x3962('0x97')+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'content-type':'application/json'}};return new Promise(_0x3fa431=>{if(debug){log(_0x3962('0x7d'));log(JSON[_0x3962('0xc8')](_0x4fa3ef));}$['get'](_0x4fa3ef,async(_0x315137,_0x31eaa2,_0x58fe82)=>{try{if(debug){log(_0x3962('0x6'));log(_0x58fe82);}let _0x549d1b=JSON[_0x3962('0x92')](_0x58fe82);if(_0x549d1b[_0x3962('0xad')]==0x388){refreshAu();}if(_0x549d1b[_0x3962('0xad')]==0x0){adventureId=_0x549d1b[_0x3962('0x8c')][_0x3962('0x4f')];if(timestampS()>=_0x549d1b[_0x3962('0x8c')][_0x3962('0x55')]){reportAdventure();}else{let _0x8180e9=+_0x549d1b[_0x3962('0x8c')][_0x3962('0x55')]-timestampS();if(_0x8180e9<=0x3c){log(_0x3962('0xc1')+_0x8180e9+_0x3962('0xd'));await sleep(_0x8180e9*0x3e8);reportAdventure();}else log('距离冒险结束还有：'+parseInt(_0x8180e9/0xe10)+'小时'+parseInt(_0x8180e9%0xe10/0x3c)+'分钟'+parseInt(_0x8180e9%0x3c)+_0x3962('0x65'));}}else log(_0x3962('0xbd'));}catch(_0x4b0e3e){log(_0x4b0e3e);}finally{_0x3fa431();}},_0x348a71);});}function reportAdventure(_0x187319=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x5dec7f={'url':'http://api.xiaoyisz.com/qiehuang/ga/user/adventure/drawPrize?adventureId='+adventureId+'&timestamp='+timestamp+'&nonce='+nonce+_0x3962('0x97')+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'Content-Type':'application/json'}};return new Promise(_0x8582f7=>{if(debug){log(_0x3962('0x88'));log(JSON[_0x3962('0xc8')](_0x5dec7f));}$[_0x3962('0x18')](_0x5dec7f,async(_0x2a74d6,_0x47d53f,_0x1bd512)=>{try{if(debug){log(_0x3962('0x9f'));log(_0x1bd512);}let _0x523fb1=JSON[_0x3962('0x92')](_0x1bd512);let _0x5c38d4=eval(_0x523fb1[_0x3962('0x8c')]);if(_0x523fb1[_0x3962('0xad')]==0x388){refreshAu();}if(_0x523fb1['code']==0x0){log(_0x3962('0xc4'));}else if(_0x523fb1['code']==0x1f4){log(_0x3962('0x57'));}else if(_0x523fb1[_0x3962('0xad')]==0x3e8){log(_0x3962('0xab'));}else log('冒险未到时间');}catch(_0x507d5e){log(_0x507d5e);}finally{_0x8582f7();}},_0x187319);});}function giveSunshine(_0x3c537=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x10e44a={'url':_0x3962('0x39')+tyPlantId+'&timestamp='+timestamp+_0x3962('0x21')+nonce+'&signature='+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'content-type':_0x3962('0x58')}};return new Promise(_0xfebd6d=>{if(debug){log(_0x3962('0x6f'));log(JSON[_0x3962('0xc8')](_0x10e44a));}$[_0x3962('0x18')](_0x10e44a,async(_0x108d18,_0x20b567,_0x1a2d1a)=>{try{if(debug){log(_0x3962('0x35'));log(_0x1a2d1a);}let _0x5ad2d8=JSON[_0x3962('0x92')](_0x1a2d1a);let _0x1253fd=eval(_0x5ad2d8['data']);if(_0x5ad2d8[_0x3962('0xad')]==0x388){refreshAu();}if(_0x5ad2d8[_0x3962('0x28')]==_0x3962('0x6d')){log(_0x3962('0xaa'));$['wait'](0x2*0x3e8);getHarvest();}else if(_0x5ad2d8[_0x3962('0x28')]==_0x3962('0x16')){log(_0x3962('0x1e'));}else if(_0x5ad2d8['message']==_0x3962('0x6e')){log(_0x3962('0x6e'));}else if(_0x5ad2d8[_0x3962('0x28')]=='阳光不足'){log(_0x3962('0x81'));giveSunshineBack=0x0;}else if(_0x5ad2d8[_0x3962('0x28')]!=_0x3962('0x81')){log(_0x3962('0x2b'));if(_0x1253fd['currentSunshineNum']==_0x1253fd[_0x3962('0xb0')]){$[_0x3962('0x51')](0x3*0x3e8);upgrade();}giveSunshineBack=0x1;}}catch(_0x4c37fe){log(_0x4c37fe);}finally{_0xfebd6d();}},_0x3c537);});}function upgrade(_0x3797af=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x10cc0a={'url':_0x3962('0x6b')+tyPlantId+_0x3962('0x83')+timestamp+_0x3962('0x21')+nonce+_0x3962('0x97')+signature,'headers':{'Host':'api.xiaoyisz.com','authorization':''+tyau,'user-agent':''+ua,'content-type':_0x3962('0x58')}};return new Promise(_0x2f8ffa=>{if(debug){log(_0x3962('0x60'));log(JSON[_0x3962('0xc8')](_0x10cc0a));}$[_0x3962('0x18')](_0x10cc0a,async(_0x58b19e,_0x209e97,_0x166582)=>{try{if(debug){log(_0x3962('0xa9'));log(_0x166582);}let _0x8e346d=JSON['parse'](_0x166582);let _0x5d702b=eval(_0x8e346d[_0x3962('0x8c')]);if(_0x8e346d[_0x3962('0xad')]==0x388){refreshAu();}if(_0x8e346d[_0x3962('0xad')]==0x0){log(_0x3962('0x20'));}}catch(_0x3c4315){log(_0x3c4315);}finally{_0x2f8ffa();}},_0x3797af);});}function getTomato(_0x1f3f28=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x267c12={'url':'http://api.xiaoyisz.com/qiehuang/ga/user/info?userId=-1&timestamp='+timestamp+_0x3962('0x21')+nonce+'&signature='+signature,'headers':{'Host':'api.xiaoyisz.com','authorization':''+tyau,'user-agent':''+ua,'Content-Type':_0x3962('0x58')}};return new Promise(_0x5730e9=>{if(debug){log('\x0a【debug】===============\x20这是\x20查询番茄余额\x20请求\x20url\x20===============');log(JSON['stringify'](_0x267c12));}$[_0x3962('0x18')](_0x267c12,async(_0x2fdaf4,_0x31191c,_0x59d182)=>{try{if(debug){log(_0x3962('0x59'));log(_0x59d182);}let _0x3ed948=JSON[_0x3962('0x92')](_0x59d182);let _0x451f61=eval(_0x3ed948[_0x3962('0x8c')]);if(_0x3ed948[_0x3962('0xad')]==0x388){refreshAu();}if(_0x3ed948[_0x3962('0xad')]==0x0){if(plantStage==0x0){plantStatus=_0x3962('0x22');}else if(plantStage==0x1){plantStatus=_0x3962('0xf');}else if(plantStage==0x2){plantStatus=_0x3962('0x37');}else if(plantStage==0x3){plantStatus=_0x3962('0xb');}log(_0x3962('0x11')+name+_0x3962('0x2')+_0x451f61['tomatoNum']+_0x3962('0x71')+plantStatus+_0x3962('0x77')+progress+'%');msg+=_0x3962('0x4d')+name+']番茄余额为：'+_0x451f61[_0x3962('0xc6')]+'，植物状态为：'+plantStatus+_0x3962('0x77')+progress+'%';}}catch(_0x37bfc5){log(_0x37bfc5);}finally{_0x5730e9();}},_0x1f3f28);});}function getSunshine(_0x3444c1=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x44edfe={'url':_0x3962('0x29')+timestamp+_0x3962('0x21')+nonce+_0x3962('0x97')+signature,'headers':{'Host':'api.xiaoyisz.com','authorization':''+tyau,'user-agent':''+ua,'content-type':'application/json'}};return new Promise(_0x4cbb01=>{if(debug){log(_0x3962('0x61'));log(JSON[_0x3962('0xc8')](_0x44edfe));}$[_0x3962('0x18')](_0x44edfe,async(_0x1fbdfb,_0x3bd090,_0x358461)=>{try{if(debug){log('\x0a\x0a【debug】===============这是\x20收取阳光\x20返回data==============');log(_0x358461);}let _0x7d7ba=JSON[_0x3962('0x92')](_0x358461);if(_0x7d7ba[_0x3962('0xad')]==0x388){refreshAu();}if(_0x7d7ba[_0x3962('0xad')]==0x0){log('收取阳光成功');}else if(_0x7d7ba['code']==0x3e8){log(_0x3962('0x43'));}else log(_0x3962('0x94')+_0x7d7ba['message']);}catch(_0x3106a6){log(_0x3106a6);}finally{_0x4cbb01();}},_0x3444c1);});}function getHarvest(_0x34cf17=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x1818c0={'url':'http://api.xiaoyisz.com/qiehuang/ga/plant/harvest?plantId='+tyPlantId+_0x3962('0x83')+timestamp+'&nonce='+nonce+_0x3962('0x97')+signature,'headers':{'Host':'api.xiaoyisz.com','authorization':''+tyau,'user-agent':''+ua,'Content-Type':'application/json'}};return new Promise(_0x5e88a1=>{if(debug){log('\x0a【debug】===============\x20这是\x20收植物\x20请求\x20url\x20===============');log(JSON[_0x3962('0xc8')](_0x1818c0));}$['get'](_0x1818c0,async(_0x25759b,_0xab9cdb,_0xdabfe3)=>{try{if(debug){log(_0x3962('0xb5'));log(_0xdabfe3);}let _0x5c7cf3=JSON[_0x3962('0x92')](_0xdabfe3);let _0x219520=eval(_0x5c7cf3[_0x3962('0x8c')]);if(_0x5c7cf3[_0x3962('0xad')]==0x388){refreshAu();}if(_0x5c7cf3[_0x3962('0xad')]==0x0){log(_0x3962('0xa4')+_0x219520[_0x3962('0x32')][0x0][_0x3962('0x3a')]+_0x3962('0x45'));getNewPlant();}else if(_0x5c7cf3[_0x3962('0xad')]==0x3e8){log(_0x3962('0xd5'));}else log('植物奖励收取失败，原因是：'+_0x5c7cf3[_0x3962('0x28')]);}catch(_0x5e5dbb){log(_0x5e5dbb);}finally{_0x5e88a1();}},_0x34cf17);});}function getNewPlant(_0x1cb4b8=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x5802e2={'url':_0x3962('0x13')+timestamp+_0x3962('0x21')+nonce+'&signature='+signature,'headers':{'Host':_0x3962('0xa1'),'authorization':''+tyau,'user-agent':''+ua,'Content-Type':_0x3962('0x58')}};return new Promise(_0x33153d=>{if(debug){log(_0x3962('0xc'));log(JSON[_0x3962('0xc8')](_0x5802e2));}$[_0x3962('0x18')](_0x5802e2,async(_0x331e37,_0x382061,_0x8fd53c)=>{try{if(debug){log(_0x3962('0x3c'));log(_0x8fd53c);}let _0x3c2135=JSON[_0x3962('0x92')](_0x8fd53c);let _0x4cb1f3=eval(_0x3c2135[_0x3962('0x8c')]);if(_0x3c2135[_0x3962('0xad')]==0x388){refreshAu();}if(_0x3c2135['code']==0x0){log(_0x3962('0xbf'));await $['wait'](0x2*0x3e8);getPlant();await $[_0x3962('0x51')](0x2*0x3e8);giveSunshine();}else if(_0x3c2135[_0x3962('0xad')]==0x3e8){log(_0x3962('0xc7'));}else log(_0x3962('0x69')+_0x3c2135['message']);}catch(_0x5bf7c6){log(_0x5bf7c6);}finally{_0x33153d();}},_0x1cb4b8);});}function getUserInfo(_0x106764=0x2*0x3e8){timestamp=timestampMs();nonce=randomString(0x10);signature=getSign(nonce,timestamp);let _0x18dda5={'url':_0x3962('0x93')+timestamp+_0x3962('0x21')+nonce+_0x3962('0x97')+signature,'headers':{'Host':'api.xiaoyisz.com','authorization':''+tyau,'user-agent':''+ua,'Content-Type':_0x3962('0x58')}};return new Promise(_0x10f6c0=>{if(debug){log(_0x3962('0xd0'));log(JSON[_0x3962('0xc8')](_0x18dda5));}$['get'](_0x18dda5,async(_0x56679d,_0x372004,_0x1fe11f)=>{try{if(debug){log(_0x3962('0x19'));log(_0x1fe11f);}let _0x1fd1b9=JSON[_0x3962('0x92')](_0x1fe11f);let _0x1cb3af=eval(_0x1fd1b9[_0x3962('0x8c')]);if(_0x1fd1b9['code']==0x388){refreshAu();}if(_0x1fd1b9[_0x3962('0xad')]==0x0){name=_0x1cb3af[_0x3962('0x63')];id=_0x1cb3af['id'];await $[_0x3962('0x51')](0x2*0x3e8);getTomato();}else log('获取信息失败，原因是：'+_0x1fd1b9[_0x3962('0x28')]);}catch(_0x2d14f8){log(_0x2d14f8);}finally{_0x10f6c0();}},_0x106764);});}async function GetRewrite(){if($request[_0x3962('0x1d')][_0x3962('0x0')](_0x3962('0x7b'))>-0x1){const _0x5721f4=$request[_0x3962('0xcf')];if(tybody){if(tybody[_0x3962('0x0')](_0x5721f4)==-0x1){tybody=tybody+'@'+_0x5721f4;let _0x4f45ac=_0x4f45ac+'@'+_0x5721f4;$[_0x3962('0x53')](tybody,_0x3962('0x7a'));$[_0x3962('0x53')](tybody,_0x3962('0xbb'));List=tybody[_0x3962('0x33')]('@');$['msg']($[_0x3962('0x54')]+(_0x3962('0x78')+tybody['length']+_0x3962('0x2c')+_0x5721f4+_0x3962('0xd2')));}}else{$[_0x3962('0x53')](_0x5721f4,'tybody');$[_0x3962('0xb1')]($[_0x3962('0x54')]+(_0x3962('0x98')+_0x5721f4+'\x20,不用请自行关闭重写!'));}}}async function Envs(){if(UA){if(UA[_0x3962('0x0')]('@')!=-0x1){UA['split']('@')[_0x3962('0x1b')](_0x3f0377=>{UAArr[_0x3962('0x68')](_0x3f0377);});}else if(UA[_0x3962('0x0')]('\x0a')!=-0x1){UA[_0x3962('0x33')]('\x0a')[_0x3962('0x1b')](_0x4623e0=>{UAArr[_0x3962('0x68')](_0x4623e0);});}else{UAArr['push'](UA);}}if(tybody){if(tybody['indexOf']('@')!=-0x1){tybody['split']('@')[_0x3962('0x1b')](_0xf7e1f2=>{tybodyArr[_0x3962('0x68')](_0xf7e1f2);});}else if(tybody['indexOf']('\x0a')!=-0x1){tybody['split']('\x0a')[_0x3962('0x1b')](_0x2dc43b=>{tybodyArr[_0x3962('0x68')](_0x2dc43b);});}else{tybodyArr[_0x3962('0x68')](tybody);}}else{log(_0x3962('0xd4')+$[_0x3962('0x54')]+_0x3962('0x8b'));return;}return!![];}async function SendMsg(_0x1b1ed0){if(!_0x1b1ed0)return;if(Notify>0x0){if($[_0x3962('0x1a')]()){var _0x4596ec=require(_0x3962('0x4c'));await _0x4596ec[_0x3962('0xaf')]($[_0x3962('0x54')],_0x1b1ed0);}else{$['msg'](_0x1b1ed0);}}else{log(_0x1b1ed0);}}function randomString(_0x41a8fd){_0x41a8fd=_0x41a8fd||0x20;var _0x1740a2=_0x3962('0x36'),_0x2b93d3=_0x1740a2[_0x3962('0xb9')],_0x59faa4='';for(i=0x0;i<_0x41a8fd;i++)_0x59faa4+=_0x1740a2[_0x3962('0x27')](Math[_0x3962('0xa8')](Math[_0x3962('0xa7')]()*_0x2b93d3));return _0x59faa4;}function randomInt(_0x244f5a,_0x4614b2){return Math[_0x3962('0x4e')](Math[_0x3962('0xa7')]()*(_0x4614b2-_0x244f5a)+_0x244f5a);}function timestampMs(){return new Date()[_0x3962('0xa5')]();}function timestampS(){return Date[_0x3962('0x92')](new Date())/0x3e8;}function poem(_0x14def9=0x3*0x3e8){return new Promise(_0x383338=>{let _0x380f62={'url':'https://v1.jinrishici.com/all.json'};$[_0x3962('0x18')](_0x380f62,async(_0x4c08b2,_0x43f069,_0xdb4582)=>{try{_0xdb4582=JSON[_0x3962('0x92')](_0xdb4582);log(_0xdb4582[_0x3962('0x50')]+_0x3962('0x62')+_0xdb4582[_0x3962('0x56')]+'》'+_0xdb4582[_0x3962('0x49')]);}catch(_0xfbde3c){log(_0xfbde3c,_0x43f069);}finally{_0x383338();}},_0x14def9);});}function modify(){fs[_0x3962('0x75')](_0x3962('0xd8'),_0x3962('0x91'),function(_0x3532ab,_0x5693f9){if(_0x3532ab){return log(_0x3962('0xae')+_0x3532ab);}else{var _0x13a9e8=_0x5693f9['replace'](/tyau="[\w-\s/+@]{0,1000}"/g,_0x3962('0x99')+newAuArr[0x0]+'@'+newAuArr[0x1]+'@'+newAuArr[0x2]+'\x22');fs[_0x3962('0xa0')]('/ql/data/config/config.sh',_0x13a9e8,_0x3962('0x91'),function(_0xa43fbf){if(_0xa43fbf){return log(_0xa43fbf);}});}});}function sleep(_0x4c261a){return new Promise(_0x4684fa=>setTimeout(_0x4684fa,_0x4c261a));}function getVersion(_0x158d3a=0x3*0x3e8){return new Promise(_0x7df865=>{let _0x40de74={'url':_0x3962('0x46')};$[_0x3962('0x18')](_0x40de74,async(_0x18b653,_0x36f536,_0x4d973b)=>{try{scriptVersionLatest=_0x4d973b[_0x3962('0x30')](/scriptVersion = "([\d\.]+)"/)[0x1];}catch(_0x38cbd1){$[_0x3962('0x66')](_0x38cbd1,_0x36f536);}finally{_0x7df865();}},_0x158d3a);});}function getSign(_0x23c25f,_0x1e388c){let _0x431579='clientKey=IfWu0xwXlWgqkIC7DWn20qpo6a30hXX6&clientSecret=A4rHhUJfMjw2I5CODh5g40Ja1d3Yk1CH&nonce=';let _0x1ffa48=_0x431579+nonce+_0x3962('0x83')+_0x1e388c;return md5(_0x1ffa48);}function md5(_0x5e24fe){function _0x71f5ff(_0x272534,_0x1855f0){return _0x272534<<_0x1855f0|_0x272534>>>0x20-_0x1855f0;}function _0x562d55(_0x2452a2,_0x38782c){var _0x12e282,_0x249bd2,_0x32800c,_0x2944fb,_0x524f5c;_0x32800c=_0x2452a2&0x80000000;_0x2944fb=_0x38782c&0x80000000;_0x12e282=_0x2452a2&0x40000000;_0x249bd2=_0x38782c&0x40000000;_0x524f5c=(_0x2452a2&0x3fffffff)+(_0x38782c&0x3fffffff);if(_0x12e282&_0x249bd2){return _0x524f5c^0x80000000^_0x32800c^_0x2944fb;}if(_0x12e282|_0x249bd2){if(_0x524f5c&0x40000000){return _0x524f5c^0xc0000000^_0x32800c^_0x2944fb;}else{return _0x524f5c^0x40000000^_0x32800c^_0x2944fb;}}else{return _0x524f5c^_0x32800c^_0x2944fb;}}function _0x31a0b9(_0xae18d2,_0x242fc2,_0x33ef25){return _0xae18d2&_0x242fc2|~_0xae18d2&_0x33ef25;}function _0x382a28(_0x1caa02,_0x114fca,_0x1d9ab7){return _0x1caa02&_0x1d9ab7|_0x114fca&~_0x1d9ab7;}function _0x1866b6(_0xa5c81e,_0x3b6eb5,_0xd4ad87){return _0xa5c81e^_0x3b6eb5^_0xd4ad87;}function _0x29a4c8(_0x57e23c,_0x10ccdd,_0x23a453){return _0x10ccdd^(_0x57e23c|~_0x23a453);}function _0x8b2fb6(_0x26ac37,_0x38f0ad,_0x566887,_0x99d682,_0xe163c9,_0x3f96fe,_0x8d3b29){_0x26ac37=_0x562d55(_0x26ac37,_0x562d55(_0x562d55(_0x31a0b9(_0x38f0ad,_0x566887,_0x99d682),_0xe163c9),_0x8d3b29));return _0x562d55(_0x71f5ff(_0x26ac37,_0x3f96fe),_0x38f0ad);}function _0xfa1f39(_0x278efc,_0x22680d,_0x38b6ca,_0x54a7bb,_0x55d582,_0x59bd9c,_0x320552){_0x278efc=_0x562d55(_0x278efc,_0x562d55(_0x562d55(_0x382a28(_0x22680d,_0x38b6ca,_0x54a7bb),_0x55d582),_0x320552));return _0x562d55(_0x71f5ff(_0x278efc,_0x59bd9c),_0x22680d);}function _0x5c21de(_0x3e1023,_0x4645ef,_0x2c4aca,_0x235394,_0x79cba0,_0x4fed96,_0x54313e){_0x3e1023=_0x562d55(_0x3e1023,_0x562d55(_0x562d55(_0x1866b6(_0x4645ef,_0x2c4aca,_0x235394),_0x79cba0),_0x54313e));return _0x562d55(_0x71f5ff(_0x3e1023,_0x4fed96),_0x4645ef);}function _0x231fe2(_0x75b6a3,_0x3dd12e,_0x21ffce,_0x517295,_0x2c8760,_0x3c3145,_0x13a45e){_0x75b6a3=_0x562d55(_0x75b6a3,_0x562d55(_0x562d55(_0x29a4c8(_0x3dd12e,_0x21ffce,_0x517295),_0x2c8760),_0x13a45e));return _0x562d55(_0x71f5ff(_0x75b6a3,_0x3c3145),_0x3dd12e);}function _0x4fa15d(_0xec7001){var _0x2a987d;var _0x3dada7=_0xec7001[_0x3962('0xb9')];var _0x3025b1=_0x3dada7+0x8;var _0x4d072a=(_0x3025b1-_0x3025b1%0x40)/0x40;var _0x1f6a9c=(_0x4d072a+0x1)*0x10;var _0x1943be=Array(_0x1f6a9c-0x1);var _0x32b1e2=0x0;var _0x3088ac=0x0;while(_0x3088ac<_0x3dada7){_0x2a987d=(_0x3088ac-_0x3088ac%0x4)/0x4;_0x32b1e2=_0x3088ac%0x4*0x8;_0x1943be[_0x2a987d]=_0x1943be[_0x2a987d]|_0xec7001[_0x3962('0x5a')](_0x3088ac)<<_0x32b1e2;_0x3088ac++;}_0x2a987d=(_0x3088ac-_0x3088ac%0x4)/0x4;_0x32b1e2=_0x3088ac%0x4*0x8;_0x1943be[_0x2a987d]=_0x1943be[_0x2a987d]|0x80<<_0x32b1e2;_0x1943be[_0x1f6a9c-0x2]=_0x3dada7<<0x3;_0x1943be[_0x1f6a9c-0x1]=_0x3dada7>>>0x1d;return _0x1943be;}function _0x3daf22(_0x49f2f5){var _0x49c43b='',_0x5ed7e3='',_0x33874f,_0x1fa454;for(_0x1fa454=0x0;_0x1fa454<=0x3;_0x1fa454++){_0x33874f=_0x49f2f5>>>_0x1fa454*0x8&0xff;_0x5ed7e3='0'+_0x33874f[_0x3962('0x17')](0x10);_0x49c43b=_0x49c43b+_0x5ed7e3[_0x3962('0x6c')](_0x5ed7e3[_0x3962('0xb9')]-0x2,0x2);}return _0x49c43b;}function _0x458f8e(_0x526ccc){_0x526ccc=_0x526ccc['replace'](/\r\n/g,'\x0a');var _0x470414='';for(var _0x3807c7=0x0;_0x3807c7<_0x526ccc['length'];_0x3807c7++){var _0xdc5a5e=_0x526ccc['charCodeAt'](_0x3807c7);if(_0xdc5a5e<0x80){_0x470414+=String[_0x3962('0xa6')](_0xdc5a5e);}else if(_0xdc5a5e>0x7f&&_0xdc5a5e<0x800){_0x470414+=String['fromCharCode'](_0xdc5a5e>>0x6|0xc0);_0x470414+=String['fromCharCode'](_0xdc5a5e&0x3f|0x80);}else{_0x470414+=String[_0x3962('0xa6')](_0xdc5a5e>>0xc|0xe0);_0x470414+=String[_0x3962('0xa6')](_0xdc5a5e>>0x6&0x3f|0x80);_0x470414+=String['fromCharCode'](_0xdc5a5e&0x3f|0x80);}}return _0x470414;}var _0x4e886d=Array();var _0x23ddfc,_0x4fa35c,_0x5dca0d,_0x540234,_0x2bff3e,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45;var _0x5a9551=0x7,_0xd45971=0xc,_0x25ceee=0x11,_0x5d5073=0x16;var _0x5b7274=0x5,_0x48d5a2=0x9,_0x4144b7=0xe,_0x5cbae8=0x14;var _0x222db6=0x4,_0x3f483d=0xb,_0x247696=0x10,_0x398a97=0x17;var _0x47183c=0x6,_0x4c2490=0xa,_0x283abc=0xf,_0x5efe42=0x15;_0x5e24fe=_0x458f8e(_0x5e24fe);_0x4e886d=_0x4fa15d(_0x5e24fe);_0x5cf9ad=0x67452301;_0xebc9b=0xefcdab89;_0x1e0563=0x98badcfe;_0x1c2e45=0x10325476;for(_0x23ddfc=0x0;_0x23ddfc<_0x4e886d[_0x3962('0xb9')];_0x23ddfc+=0x10){_0x4fa35c=_0x5cf9ad;_0x5dca0d=_0xebc9b;_0x540234=_0x1e0563;_0x2bff3e=_0x1c2e45;_0x5cf9ad=_0x8b2fb6(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x0],_0x5a9551,0xd76aa478);_0x1c2e45=_0x8b2fb6(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x1],_0xd45971,0xe8c7b756);_0x1e0563=_0x8b2fb6(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0x2],_0x25ceee,0x242070db);_0xebc9b=_0x8b2fb6(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x3],_0x5d5073,0xc1bdceee);_0x5cf9ad=_0x8b2fb6(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x4],_0x5a9551,0xf57c0faf);_0x1c2e45=_0x8b2fb6(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x5],_0xd45971,0x4787c62a);_0x1e0563=_0x8b2fb6(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0x6],_0x25ceee,0xa8304613);_0xebc9b=_0x8b2fb6(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x7],_0x5d5073,0xfd469501);_0x5cf9ad=_0x8b2fb6(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x8],_0x5a9551,0x698098d8);_0x1c2e45=_0x8b2fb6(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x9],_0xd45971,0x8b44f7af);_0x1e0563=_0x8b2fb6(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0xa],_0x25ceee,0xffff5bb1);_0xebc9b=_0x8b2fb6(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0xb],_0x5d5073,0x895cd7be);_0x5cf9ad=_0x8b2fb6(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0xc],_0x5a9551,0x6b901122);_0x1c2e45=_0x8b2fb6(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0xd],_0xd45971,0xfd987193);_0x1e0563=_0x8b2fb6(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0xe],_0x25ceee,0xa679438e);_0xebc9b=_0x8b2fb6(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0xf],_0x5d5073,0x49b40821);_0x5cf9ad=_0xfa1f39(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x1],_0x5b7274,0xf61e2562);_0x1c2e45=_0xfa1f39(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x6],_0x48d5a2,0xc040b340);_0x1e0563=_0xfa1f39(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0xb],_0x4144b7,0x265e5a51);_0xebc9b=_0xfa1f39(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x0],_0x5cbae8,0xe9b6c7aa);_0x5cf9ad=_0xfa1f39(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x5],_0x5b7274,0xd62f105d);_0x1c2e45=_0xfa1f39(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0xa],_0x48d5a2,0x2441453);_0x1e0563=_0xfa1f39(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0xf],_0x4144b7,0xd8a1e681);_0xebc9b=_0xfa1f39(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x4],_0x5cbae8,0xe7d3fbc8);_0x5cf9ad=_0xfa1f39(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x9],_0x5b7274,0x21e1cde6);_0x1c2e45=_0xfa1f39(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0xe],_0x48d5a2,0xc33707d6);_0x1e0563=_0xfa1f39(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0x3],_0x4144b7,0xf4d50d87);_0xebc9b=_0xfa1f39(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x8],_0x5cbae8,0x455a14ed);_0x5cf9ad=_0xfa1f39(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0xd],_0x5b7274,0xa9e3e905);_0x1c2e45=_0xfa1f39(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x2],_0x48d5a2,0xfcefa3f8);_0x1e0563=_0xfa1f39(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0x7],_0x4144b7,0x676f02d9);_0xebc9b=_0xfa1f39(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0xc],_0x5cbae8,0x8d2a4c8a);_0x5cf9ad=_0x5c21de(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x5],_0x222db6,0xfffa3942);_0x1c2e45=_0x5c21de(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x8],_0x3f483d,0x8771f681);_0x1e0563=_0x5c21de(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0xb],_0x247696,0x6d9d6122);_0xebc9b=_0x5c21de(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0xe],_0x398a97,0xfde5380c);_0x5cf9ad=_0x5c21de(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x1],_0x222db6,0xa4beea44);_0x1c2e45=_0x5c21de(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x4],_0x3f483d,0x4bdecfa9);_0x1e0563=_0x5c21de(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0x7],_0x247696,0xf6bb4b60);_0xebc9b=_0x5c21de(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0xa],_0x398a97,0xbebfbc70);_0x5cf9ad=_0x5c21de(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0xd],_0x222db6,0x289b7ec6);_0x1c2e45=_0x5c21de(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x0],_0x3f483d,0xeaa127fa);_0x1e0563=_0x5c21de(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0x3],_0x247696,0xd4ef3085);_0xebc9b=_0x5c21de(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x6],_0x398a97,0x4881d05);_0x5cf9ad=_0x5c21de(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x9],_0x222db6,0xd9d4d039);_0x1c2e45=_0x5c21de(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0xc],_0x3f483d,0xe6db99e5);_0x1e0563=_0x5c21de(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0xf],_0x247696,0x1fa27cf8);_0xebc9b=_0x5c21de(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x2],_0x398a97,0xc4ac5665);_0x5cf9ad=_0x231fe2(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x0],_0x47183c,0xf4292244);_0x1c2e45=_0x231fe2(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x7],_0x4c2490,0x432aff97);_0x1e0563=_0x231fe2(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0xe],_0x283abc,0xab9423a7);_0xebc9b=_0x231fe2(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x5],_0x5efe42,0xfc93a039);_0x5cf9ad=_0x231fe2(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0xc],_0x47183c,0x655b59c3);_0x1c2e45=_0x231fe2(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0x3],_0x4c2490,0x8f0ccc92);_0x1e0563=_0x231fe2(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0xa],_0x283abc,0xffeff47d);_0xebc9b=_0x231fe2(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x1],_0x5efe42,0x85845dd1);_0x5cf9ad=_0x231fe2(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x8],_0x47183c,0x6fa87e4f);_0x1c2e45=_0x231fe2(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0xf],_0x4c2490,0xfe2ce6e0);_0x1e0563=_0x231fe2(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0x6],_0x283abc,0xa3014314);_0xebc9b=_0x231fe2(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0xd],_0x5efe42,0x4e0811a1);_0x5cf9ad=_0x231fe2(_0x5cf9ad,_0xebc9b,_0x1e0563,_0x1c2e45,_0x4e886d[_0x23ddfc+0x4],_0x47183c,0xf7537e82);_0x1c2e45=_0x231fe2(_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x1e0563,_0x4e886d[_0x23ddfc+0xb],_0x4c2490,0xbd3af235);_0x1e0563=_0x231fe2(_0x1e0563,_0x1c2e45,_0x5cf9ad,_0xebc9b,_0x4e886d[_0x23ddfc+0x2],_0x283abc,0x2ad7d2bb);_0xebc9b=_0x231fe2(_0xebc9b,_0x1e0563,_0x1c2e45,_0x5cf9ad,_0x4e886d[_0x23ddfc+0x9],_0x5efe42,0xeb86d391);_0x5cf9ad=_0x562d55(_0x5cf9ad,_0x4fa35c);_0xebc9b=_0x562d55(_0xebc9b,_0x5dca0d);_0x1e0563=_0x562d55(_0x1e0563,_0x540234);_0x1c2e45=_0x562d55(_0x1c2e45,_0x2bff3e);}return(_0x3daf22(_0x5cf9ad)+_0x3daf22(_0xebc9b)+_0x3daf22(_0x1e0563)+_0x3daf22(_0x1c2e45))[_0x3962('0x2f')]();}

function Env(t, e) {
   "undefined" != typeof process &&
     JSON.stringify(process.env).indexOf("GITHUB") > -1 &&
     process.exit(0);
   class s {
     constructor(t) {
       this.env = t;
     }
     send(t, e = "GET") {
       t = "string" == typeof t ? { url: t } : t;
       let s = this.get;
       return (
         "POST" === e && (s = this.post),
         new Promise((e, i) => {
           s.call(this, t, (t, s, r) => {
             t ? i(t) : e(s);
           });
         })
       );
     }
     get(t) {
       return this.send.call(this.env, t);
     }
     post(t) {
       return this.send.call(this.env, t, "POST");
     }
   }
   return new (class {
     constructor(t, e) {
       (this.name = t),
         (this.http = new s(this)),
         (this.data = null),
         (this.dataFile = "box.dat"),
         (this.logs = []),
         (this.isMute = !1),
         (this.isNeedRewrite = !1),
         (this.logSeparator = "\n"),
         (this.startTime = new Date().getTime()),
         Object.assign(this, e),
         this.log("", `🔔${this.name}, 开始!`);
     }
     isNode() {
       return "undefined" != typeof module && !!module.exports;
     }
     isQuanX() {
       return "undefined" != typeof $task;
     }
     isSurge() {
       return "undefined" != typeof $httpClient && "undefined" == typeof $loon;
     }
     isLoon() {
       return "undefined" != typeof $loon;
     }
     toObj(t, e = null) {
       try {
         return JSON.parse(t);
       } catch {
         return e;
       }
     }
     toStr(t, e = null) {
       try {
         return JSON.stringify(t);
       } catch {
         return e;
       }
     }
     getjson(t, e) {
       let s = e;
       const i = this.getdata(t);
       if (i)
         try {
           s = JSON.parse(this.getdata(t));
         } catch {}
       return s;
     }
     setjson(t, e) {
       try {
         return this.setdata(JSON.stringify(t), e);
       } catch {
         return !1;
       }
     }
     getScript(t) {
       return new Promise((e) => {
         this.get({ url: t }, (t, s, i) => e(i));
       });
     }
     runScript(t, e) {
       return new Promise((s) => {
         let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
         i = i ? i.replace(/\n/g, "").trim() : i;
         let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
         (r = r ? 1 * r : 20), (r = e && e.timeout ? e.timeout : r);
         const [o, h] = i.split("@"),
           n = {
             url: `http://${h}/v1/scripting/evaluate`,
             body: { script_text: t, mock_type: "cron", timeout: r },
             headers: { "X-Key": o, Accept: "*/*" },
           };
         this.post(n, (t, e, i) => s(i));
       }).catch((t) => this.logErr(t));
     }
     loaddata() {
       if (!this.isNode()) return {};
       {
         (this.fs = this.fs ? this.fs : require("fs")),
           (this.path = this.path ? this.path : require("path"));
         const t = this.path.resolve(this.dataFile),
           e = this.path.resolve(process.cwd(), this.dataFile),
           s = this.fs.existsSync(t),
           i = !s && this.fs.existsSync(e);
         if (!s && !i) return {};
         {
           const i = s ? t : e;
           try {
             return JSON.parse(this.fs.readFileSync(i));
           } catch (t) {
             return {};
           }
         }
       }
     }
     writedata() {
       if (this.isNode()) {
         (this.fs = this.fs ? this.fs : require("fs")),
           (this.path = this.path ? this.path : require("path"));
         const t = this.path.resolve(this.dataFile),
           e = this.path.resolve(process.cwd(), this.dataFile),
           s = this.fs.existsSync(t),
           i = !s && this.fs.existsSync(e),
           r = JSON.stringify(this.data);
         s
           ? this.fs.writeFileSync(t, r)
           : i
           ? this.fs.writeFileSync(e, r)
           : this.fs.writeFileSync(t, r);
       }
     }
     lodash_get(t, e, s) {
       const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
       let r = t;
       for (const t of i) if (((r = Object(r)[t]), void 0 === r)) return s;
       return r;
     }
     lodash_set(t, e, s) {
       return Object(t) !== t
         ? t
         : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []),
           (e
             .slice(0, -1)
             .reduce(
               (t, s, i) =>
                 Object(t[s]) === t[s]
                   ? t[s]
                   : (t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}),
               t
             )[e[e.length - 1]] = s),
           t);
     }
     getdata(t) {
       let e = this.getval(t);
       if (/^@/.test(t)) {
         const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t),
           r = s ? this.getval(s) : "";
         if (r)
           try {
             const t = JSON.parse(r);
             e = t ? this.lodash_get(t, i, "") : e;
           } catch (t) {
             e = "";
           }
       }
       return e;
     }
     setdata(t, e) {
       let s = !1;
       if (/^@/.test(e)) {
         const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e),
           o = this.getval(i),
           h = i ? ("null" === o ? null : o || "{}") : "{}";
         try {
           const e = JSON.parse(h);
           this.lodash_set(e, r, t), (s = this.setval(JSON.stringify(e), i));
         } catch (e) {
           const o = {};
           this.lodash_set(o, r, t), (s = this.setval(JSON.stringify(o), i));
         }
       } else s = this.setval(t, e);
       return s;
     }
     getval(t) {
       return this.isSurge() || this.isLoon()
         ? $persistentStore.read(t)
         : this.isQuanX()
         ? $prefs.valueForKey(t)
         : this.isNode()
         ? ((this.data = this.loaddata()), this.data[t])
         : (this.data && this.data[t]) || null;
     }
     setval(t, e) {
       return this.isSurge() || this.isLoon()
         ? $persistentStore.write(t, e)
         : this.isQuanX()
         ? $prefs.setValueForKey(t, e)
         : this.isNode()
         ? ((this.data = this.loaddata()),
           (this.data[e] = t),
           this.writedata(),
           !0)
         : (this.data && this.data[e]) || null;
     }
     initGotEnv(t) {
       (this.got = this.got ? this.got : require("got")),
         (this.cktough = this.cktough ? this.cktough : require("tough-cookie")),
         (this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar()),
         t &&
           ((t.headers = t.headers ? t.headers : {}),
           void 0 === t.headers.Cookie &&
             void 0 === t.cookieJar &&
             (t.cookieJar = this.ckjar));
     }
     get(t, e = () => {}) {
       t.headers &&
         (delete t.headers["Content-Type"], delete t.headers["Content-Length"]),
         this.isSurge() || this.isLoon()
           ? (this.isSurge() &&
               this.isNeedRewrite &&
               ((t.headers = t.headers || {}),
               Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })),
             $httpClient.get(t, (t, s, i) => {
               !t && s && ((s.body = i), (s.statusCode = s.status)), e(t, s, i);
             }))
           : this.isQuanX()
           ? (this.isNeedRewrite &&
               ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })),
             $task.fetch(t).then(
               (t) => {
                 const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                 e(null, { status: s, statusCode: i, headers: r, body: o }, o);
               },
               (t) => e(t)
             ))
           : this.isNode() &&
             (this.initGotEnv(t),
             this.got(t)
               .on("redirect", (t, e) => {
                 try {
                   if (t.headers["set-cookie"]) {
                     const s = t.headers["set-cookie"]
                       .map(this.cktough.Cookie.parse)
                       .toString();
                     s && this.ckjar.setCookieSync(s, null),
                       (e.cookieJar = this.ckjar);
                   }
                 } catch (t) {
                   this.logErr(t);
                 }
               })
               .then(
                 (t) => {
                   const {
                     statusCode: s,
                     statusCode: i,
                     headers: r,
                     body: o,
                   } = t;
                   e(null, { status: s, statusCode: i, headers: r, body: o }, o);
                 },
                 (t) => {
                   const { message: s, response: i } = t;
                   e(s, i, i && i.body);
                 }
               ));
     }
     post(t, e = () => {}) {
       if (
         (t.body &&
           t.headers &&
           !t.headers["Content-Type"] &&
           (t.headers["Content-Type"] = "application/x-www-form-urlencoded"),
         t.headers && delete t.headers["Content-Length"],
         this.isSurge() || this.isLoon())
       )
         this.isSurge() &&
           this.isNeedRewrite &&
           ((t.headers = t.headers || {}),
           Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })),
           $httpClient.post(t, (t, s, i) => {
             !t && s && ((s.body = i), (s.statusCode = s.status)), e(t, s, i);
           });
       else if (this.isQuanX())
         (t.method = "POST"),
           this.isNeedRewrite &&
             ((t.opts = t.opts || {}), Object.assign(t.opts, { hints: !1 })),
           $task.fetch(t).then(
             (t) => {
               const { statusCode: s, statusCode: i, headers: r, body: o } = t;
               e(null, { status: s, statusCode: i, headers: r, body: o }, o);
             },
             (t) => e(t)
           );
       else if (this.isNode()) {
         this.initGotEnv(t);
         const { url: s, ...i } = t;
         this.got.post(s, i).then(
           (t) => {
             const { statusCode: s, statusCode: i, headers: r, body: o } = t;
             e(null, { status: s, statusCode: i, headers: r, body: o }, o);
           },
           (t) => {
             const { message: s, response: i } = t;
             e(s, i, i && i.body);
           }
         );
       }
     }
     time(t, e = null) {
       const s = e ? new Date(e) : new Date();
       let i = {
         "M+": s.getMonth() + 1,
         "d+": s.getDate(),
         "H+": s.getHours(),
         "m+": s.getMinutes(),
         "s+": s.getSeconds(),
         "q+": Math.floor((s.getMonth() + 3) / 3),
         S: s.getMilliseconds(),
       };
       /(y+)/.test(t) &&
         (t = t.replace(
           RegExp.$1,
           (s.getFullYear() + "").substr(4 - RegExp.$1.length)
         ));
       for (let e in i)
         new RegExp("(" + e + ")").test(t) &&
           (t = t.replace(
             RegExp.$1,
             1 == RegExp.$1.length
               ? i[e]
               : ("00" + i[e]).substr(("" + i[e]).length)
           ));
       return t;
     }
     msg(e = t, s = "", i = "", r) {
       const o = (t) => {
         if (!t) return t;
         if ("string" == typeof t)
           return this.isLoon()
             ? t
             : this.isQuanX()
             ? { "open-url": t }
             : this.isSurge()
             ? { url: t }
             : void 0;
         if ("object" == typeof t) {
           if (this.isLoon()) {
             let e = t.openUrl || t.url || t["open-url"],
               s = t.mediaUrl || t["media-url"];
             return { openUrl: e, mediaUrl: s };
           }
           if (this.isQuanX()) {
             let e = t["open-url"] || t.url || t.openUrl,
               s = t["media-url"] || t.mediaUrl;
             return { "open-url": e, "media-url": s };
           }
           if (this.isSurge()) {
             let e = t.url || t.openUrl || t["open-url"];
             return { url: e };
           }
         }
       };
       if (
         (this.isMute ||
           (this.isSurge() || this.isLoon()
             ? $notification.post(e, s, i, o(r))
             : this.isQuanX() && $notify(e, s, i, o(r))),
         !this.isMuteLog)
       ) {
         let t = ["", "==============📣系统通知📣=============="];
         t.push(e),
           s && t.push(s),
           i && t.push(i),
           console.log(t.join("\n")),
           (this.logs = this.logs.concat(t));
       }
     }
     log(...t) {
       t.length > 0 && (this.logs = [...this.logs, ...t]),
         console.log(t.join(this.logSeparator));
     }
     logErr(t, e) {
       const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
       s
         ? this.log("", `❗️${this.name}, 错误!`, t.stack)
         : this.log("", `❗️${this.name}, 错误!`, t);
     }
     wait(t) {
       return new Promise((e) => setTimeout(e, t));
     }
     done(t = {}) {
       const e = new Date().getTime(),
         s = (e - this.startTime) / 1e3;
       this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`),
         this.log(),
         (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t);
     }
   })(t, e);
 }
 
