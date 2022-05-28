ye(){
ye=$(curl -s -H "Cookie:$ck" "$url/initV4")
il=$(echo $ye | grep -o "isLogin.*" | cut -d '"' -f2 | grep -o "[a-z]*")
}
jg(){
ye
dt=$(date '+%Y-%m-%d %H:%M:%S')
coin=$(echo $ye | grep -o "coin.*" | cut -d '"' -f2 | grep -o "[0-9]*")
cash=$(echo $ye | grep -o "cash.*" | cut -d '"' -f3)
zxjg="$rw$(echo $zx | grep -o "msg.*" | cut -d '"' -f3)"
ts="$dt $zxjg 当前金币$coin 当前现金$cash"
echo $ts
}
xyhxjhb(){
rw="新用户现金红包"
zx=$(curl -s -H "Cookie:$ck" "$url/loginToGetCoin?type=1")
jg
}
kqdktx(){
rw="开启打卡提醒"
zx=$(curl -s -H "Cookie:$ck" "$url/openCardNotice")
jg
}
xyhtxyqm(){
rw="新用户填写邀请码"
zx=$(curl -s -H "Cookie:$ck" "$url/inivite/fillcode?code=382826606")
jg
}
xzydkwjl(){
rw="选择阅读口味奖励"
zx=$(curl -s -H "Cookie:$ck" "https://commontgw6.reader.qq.com/h5/questionnaire/sendCoin")
jg
}
txahp(){
rw="填写app好评"
zx=$(curl -s -H "Cookie:$ck" "$url/giveGoodComment")
jg
}
mrdk(){
rw="每日打卡"
zx=$(curl -s -H "Cookie:$ck" "$url/punchCard_v2")
jg
}
dkkxsp(){
rw="打卡看小视频"
zx=$(curl -s -H "Cookie:$ck" "$url/punchCardWatchVideo")
jg
}
ydzdsj(){
rw="阅读指定书籍"
ydm=$(curl -s -H "Cookie:$ck" "$url/readConfigBookInit" | grep -o "msg.*" | cut -d '"' -f3)
zx=$(curl -s -H "Cookie:$ck" "$url/pickReadConfigBook")
jg
}
jsjkxsp(){
rw="加书架看小视频"
zx=$(curl -s -H "Cookie:$ck" "$url/addBookShelfWatchVideo")
jg
}
xscdj(){
rw="新手抽大奖"
zx=$(curl -s -H "Cookie:$ck" "$url/newUser11To30Draw")
jg
}
ydkxsp(){
rw="阅读看小视频"
qrt=$(curl -s -H "Cookie:$ck" "$url/queryUserReadTaskStatus")
rwcs=$(echo $qrt | grep -o 'targetTime":[0-9]*' | cut -d ":" -f2)
rwsl=$(echo "$rwcs" | wc -l)
rwqk=$(echo $qrt | grep -o 'watched":[a-z]*' | cut -d ":" -f2)
wcsl=$(echo $rwqk | grep -o "true" | wc -l)
ksp(){
for y in "$@"
do
csjg=$(echo $qrt | grep -o "$y.*" | grep -o "watched.*" | cut -d '"' -f2 | grep -o "[a-z]*")
if [ "$csjg" != "true" ]
then zx=$(curl -s -H "Cookie:$ck" "$url/readBookWatchVideo?targetTime=$y")
echo $y分钟$rw
jg
else echo $y分钟$rw$csjg
fi
done
}
if [ $rwsl -ne $wcsl ]
then ksp $rwcs
else echo $rw已完成
fi
}
wzcj(){
rw="网赚抽奖"
c=$(curl -s -H "Cookie:$ck" "$url/queryPunchCardStatus" | grep -o "count.*" | cut -d '"' -f2 | grep -o "[0-9]*")
t=$(curl -s -H "Cookie:$ck" "$url/queryPunchCardStatus" | grep -o "total.*" | cut -d '"' -f2 | grep -o "[0-9]*")
a=$((t+1-c))
if [ $((t-c)) -ne $t ]
then ccc=$((t+1))
for ((cc=a;cc<ccc;cc++))
do
zx=$(curl -s -H "Cookie:$ck" "$url/pickLottery")
echo 第$cc次$rw
jg
done
else echo $rw已完成
fi
}
kxsp(){
rw="看小视频"
ye
vc=$(($(echo $ye | grep -o "videoCount.*" | cut -d '"' -f2 | grep -o "[0-9]*")+1))
lm=$(($(echo $ye | grep -o "limit.*" | cut -d '"' -f2 | grep -o "[0-9]*")+1))
if [ $vc -ne $lm ]
then for ((k=vc;k<lm;k++))
do
zx=$(curl -s -H "Cookie:$ck" "$url/watchVideo")
echo 第$k次$rw
jg
done
else echo $rw已完成
fi
}
kbx(){
rw="开宝箱"
bxxx=$(curl -s -H "Cookie:$ck" "$url/queryOpenBoxInfo")
bxn=$(echo $bxxx | grep -o "openNum.*" | cut -d '"' -f2 | grep -o "[0-9]*")
bxot=$(echo $bxxx | grep -o "openTime.*" | cut -d '"' -f2 | grep -o "[0-9]*")
bxst=$(echo $bxxx | grep -o "serverTime.*" | cut -d '"' -f2 | grep -o "[0-9]*")
sxt=$((bxst-bxot))
if [ $bxn -gt 0 -a $sxt -gt 3600000 ]
then zx=$(curl -s -H "Cookie:$ck" "$url/openBox")
echo 倒数第$bxn次$rw
jg
elif [ $bxn -eq 0 ]
then echo $rw今日已完成，明天再领
else echo $rw暂不可领，请等待$((sxt/1000))秒
fi
}
kspdjl(){
rw="看视频得奖励"
bxxx=$(curl -s -H "Cookie:$ck" "$url/queryOpenBoxInfo")
bxwn=$(echo $bxxx | grep -o "watchNum.*" | cut -d "}" -f1 | cut -d ":" -f2)
if [ $bxwn -gt 0 ]
then zx=$(curl -s -H "Cookie:$ck" "$url/pickOpenBoxWatchVideo")
echo 倒数第$bxwn次$rw
jg
else echo 开宝箱不成功，无法执行$rw
fi
}
cl(){
url="https://eventv3.reader.qq.com/activity/pkg11955"
if [ -s qrck ]
then qrck=$(cat qrck)
if [ -z "$qrck" ]
then echo 文件qrck内无cookie，请将cookie保存至qrck文件内
fi
else 
read -p "请输入cookie，格式为qrsn=xxx;ywguid=xxx;ywkey=xxx，如有多个请用@隔开：" qrck
echo "$qrck" > qrck
fi
if [ $(cat qrck | grep -o "@" | wc -l) -gt 0 ]
then zs=$(($(cat qrck | grep -o "@" | wc -l)+1))
[ ! -n "$(cat qrck | cut -d "@" -f"$zs")" ] && zs=$(cat qrck | grep -o "@" | wc -l)
else zs=1
fi
}
rw(){
for ((i=1;i<$((zs+1));i++))
do 
echo $dt 总共有$zs个账户，正在执行第$i个账户
ck=$(cat qrck | cut -d "@" -f"$i")
ye
if [ -n "$ck" -a "$il" == "true" ]
then $1
else echo 第$i个账户$ck无效，请检查
fi
sleep 0
done
}
run(){
rw xyhxjhb
rw kqdktx
rw txahp
rw xyhtxyqm
rw xzydkwjl
rw mrdk
rw dkkxsp
rw ydzdsj
rw jsjkxsp
rw xscdj
rw ydkxsp
rw wzcj
rw kxsp
rw kbx
rw kspdjl
}
cl
run