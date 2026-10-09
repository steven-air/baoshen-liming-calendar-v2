'use strict';
/* ================= 一、农历核心数据（1900–2100） ================= */
const LUNAR_INFO=[0x04bd8,0x04ae0,0x0a570,0x054d5,0x0d260,0x0d950,0x16554,0x056a0,0x09ad0,0x055d2,
0x04ae0,0x0a5b6,0x0a4d0,0x0d250,0x1d255,0x0b540,0x0d6a0,0x0ada2,0x095b0,0x14977,
0x04970,0x0a4b0,0x0b4b5,0x06a50,0x06d40,0x1ab54,0x02b60,0x09570,0x052f2,0x04970,
0x06566,0x0d4a0,0x0ea50,0x06e95,0x05ad0,0x02b60,0x186e3,0x092e0,0x1c8d7,0x0c950,
0x0d4a0,0x1d8a6,0x0b550,0x056a0,0x1a5b4,0x025d0,0x092d0,0x0d2b2,0x0a950,0x0b557,
0x06ca0,0x0b550,0x15355,0x04da0,0x0a5b0,0x14573,0x052b0,0x0a9a8,0x0e950,0x06aa0,
0x0aea6,0x0ab50,0x04b60,0x0aae4,0x0a570,0x05260,0x0f263,0x0d950,0x05b57,0x056a0,
0x096d0,0x04dd5,0x04ad0,0x0a4d0,0x0d4d4,0x0d250,0x0d558,0x0b540,0x0b6a0,0x195a6,
0x095b0,0x049b5,0x0a974,0x0a4b0,0x0b27a,0x06a50,0x06d40,0x0af46,0x0ab60,0x09570,
0x04af5,0x04970,0x064b0,0x074a3,0x0ea50,0x06b58,0x055c0,0x0ab60,0x096d5,0x092e0,
0x0c960,0x0d954,0x0d4a0,0x0da50,0x07552,0x056a0,0x0abb7,0x025d0,0x092d0,0x0cab5,
0x0a950,0x0b4a0,0x0baa4,0x0ad50,0x055d9,0x04ba0,0x0a5b0,0x15176,0x052b0,0x0a930,
0x07954,0x06aa0,0x0ad50,0x05b52,0x04b60,0x0a6e6,0x0a4e0,0x0d260,0x0ea65,0x0d530,
0x05aa0,0x076a3,0x096d0,0x04afb,0x04ad0,0x0a4d0,0x1d0b6,0x0d250,0x0d520,0x0dd45,
0x0b5a0,0x056d0,0x055b2,0x049b0,0x0a577,0x0a4b0,0x0aa50,0x1b255,0x06d20,0x0ada0,
0x14b63,0x09370,0x049f8,0x04970,0x064b0,0x168a6,0x0ea50,0x06b20,0x1a6c4,0x0aae5,
0x0a2e0,0x0d2e3,0x0c960,0x0d557,0x0d4a0,0x0da50,0x05d55,0x056a0,0x0a6d0,0x055d4,
0x052d0,0x0a9b8,0x0a950,0x0b4a0,0x0b6a6,0x0ad50,0x055a0,0x0aba4,0x0a5b0,0x052b0,
0x0b273,0x06930,0x07337,0x06aa0,0x0ad50,0x14b55,0x04b60,0x0a570,0x054e4,0x0d160,
0x0e968,0x0d520,0x0daa0,0x16aa6,0x056d0,0x04ae0,0x0a9d4,0x0a2d0,0x0d150,0x0f252,
0x0d520];
const LUNAR_MONTH=['正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];
const LUNAR_DAY=['初一','初二','初三','初四','初五','初六','初七','初八','初九','初十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
function lLeapMonth(y){return LUNAR_INFO[y-1900]&0xf}
function lLeapDays(y){return lLeapMonth(y)?((LUNAR_INFO[y-1900]&0x10000)?30:29):0}
function lMonthDays(y,m){return (LUNAR_INFO[y-1900]&(0x10000>>m))?30:29}
function lYearDays(y){let s=348;for(let i=0x8000;i>0x8;i>>=1)s+=(LUNAR_INFO[y-1900]&i)?1:0;return s+lLeapDays(y)}
const LUNAR_BASE=Date.UTC(1900,0,31);
const _lunarCache=new Map();
// 优先使用浏览器原生的中国农历实现，避免内置年份表在闰月处发生整月偏移。
const _intlLunar=new Intl.DateTimeFormat('en-u-ca-chinese',{year:'numeric',month:'numeric',day:'numeric',timeZone:'UTC'});
function solar2lunar(date){
  const k=date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
  if(_lunarCache.has(k))return _lunarCache.get(k);
  const utcDate=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate(),12));
  const parts=_intlLunar.formatToParts(utcDate);
  const monthPart=parts.find(p=>p.type==='month'),dayPart=parts.find(p=>p.type==='day'),yearPart=parts.find(p=>p.type==='relatedYear');
  if(monthPart&&dayPart&&yearPart){
    const monthMatch=monthPart.value.match(/^(\d+)(?:bis)?$/);
    if(monthMatch){
      const res={year:Number(yearPart.value),month:Number(monthMatch[1]),day:Number(dayPart.value),isLeap:/bis$/.test(monthPart.value)};
      _lunarCache.set(k,res);return res;
    }
  }
  // 原始表算法作为旧浏览器的兼容回退。
  let offset=Math.floor((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-LUNAR_BASE)/86400000);
  if(offset<0)return null;
  let y=1900;
  while(y<2100&&offset>=lYearDays(y)){offset-=lYearDays(y);y++}
  if(offset>=lYearDays(y))return null;
  const leap=lLeapMonth(y);let m=1,isLeap=false;
  while(m<=12){
    const md=lMonthDays(y,m);
    if(offset<md){break}
    offset-=md;
    if(leap===m){const ld=lLeapDays(y);if(offset<ld){isLeap=true;break}offset-=ld}
    m++;
  }
  const res={year:y,month:m,day:offset+1,isLeap};
  _lunarCache.set(k,res);return res;
}
/* ================= 二、干支与节气 ================= */
const GAN='甲乙丙丁戊己庚辛壬癸',ZHI='子丑寅卯辰巳午未申酉戌亥';
const GZ60=[];for(let i=0;i<60;i++)GZ60.push(GAN[i%10]+ZHI[i%12]);
function getDayGZ(date){
  const diff=Math.floor((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(1949,9,1))/86400000);
  const idx=((diff%60)+60)%60;return{idx,name:GZ60[idx]};
}
const TERM_NAMES=['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
const TERM_C21=[5.4055,20.12,3.87,18.73,5.63,20.646,4.81,20.1,5.52,21.04,5.678,21.37,7.108,22.83,7.5,23.13,7.646,23.042,8.318,23.438,7.438,22.36,7.18,21.9405];
const TERM_C20=[6.11,20.84,4.6295,19.4599,6.3826,21.4155,5.59,20.888,6.318,21.86,6.5,22.20,7.928,23.65,8.35,23.95,8.44,23.822,9.098,24.218,8.218,23.08,7.9,22.60];
const _termCache={};
function getTermList(year){
  if(_termCache[year])return _termCache[year];
  const c=year>=2000?TERM_C21:TERM_C20,y=year-(year>=2000?2000:1900);
  const list=TERM_NAMES.map((name,i)=>{
    const L=i<=3?Math.floor((y-1)/4):Math.floor(y/4);
    const day=Math.floor(y*0.2422+c[i])-L;
    return{name,index:i,date:new Date(year,Math.floor(i/2),day)};
  });
  _termCache[year]=list;return list;
}
function getTermByName(year,name){return getTermList(year).find(t=>t.name===name)||null}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function dayDiff(a,b){return Math.round((Date.UTC(a.getFullYear(),a.getMonth(),a.getDate())-Date.UTC(b.getFullYear(),b.getMonth(),b.getDate()))/86400000)}
function addDays(d,n){const r=new Date(d.getFullYear(),d.getMonth(),d.getDate());r.setDate(r.getDate()+n);return r}
function findTermOnDate(date){return getTermList(date.getFullYear()).find(t=>sameDay(t.date,date))||null}
function getYearGZ(date){
  const y=date.getFullYear(),lichun=getTermByName(y,'立春').date;
  const eff=date>=lichun?y:y-1,idx=((eff-1984)%60+60)%60;
  return{idx,name:GZ60[idx],year:eff};
}
const JIE_ORDER=['立春','惊蛰','清明','立夏','芒种','小暑','立秋','白露','寒露','立冬','大雪','小寒'];
const JIE_ZHI=[2,3,4,5,6,7,8,9,10,11,0,1];
function getMonthGZ(date){
  let best=null;
  for(const y of[date.getFullYear()-1,date.getFullYear()])
    for(let i=0;i<12;i++){const t=getTermByName(y,JIE_ORDER[i]).date;
      if(dayDiff(date,t)>=0&&(!best||dayDiff(t,best.date)>0))best={date:t,jieIndex:i};}
  const base={0:2,1:4,2:6,3:8,4:0,5:2,6:4,7:6,8:8,9:0}[getYearGZ(date).idx%10];
  const ganIdx=(base+best.jieIndex)%10;
  return{name:GAN[ganIdx]+ZHI[JIE_ZHI[best.jieIndex]]};
}
/* ================= 三、戒期数据（名称 / 原因 / 后果） ================= */
const MONTHLY_FIXED={
  1:[['月朔','朔为农历每月初一日（每月同）','夺纪']],
  3:[['斗降','北斗星君下降之日（每月同）','夺纪']],
  6:[['雷斋日','雷斋之日，宜持斋（每月同）','减寿']],
  8:[['四天王巡行','四天王下界巡察善恶（每月同）','宜戒']],
  14:[['四天王巡行','四天王下界巡察善恶（每月同）','减寿']],
  15:[['月望','望为农历每月十五日（每月同）','夺纪'],['四天王巡行','四天王下界巡察善恶（每月同）','宜戒']],
  23:[['四天王巡行','四天王下界巡察善恶（每月同）','宜戒']],
  25:[['月晦日','每月同（晦本指每月最后一日，原书列于廿五）','减寿']],
  27:[['斗降','北斗星君下降之日（每月同）','夺纪']],
  28:[['人神在阴','人神在阴之日（每月同），宜先一日即戒','得病']],
  29:[['四天王巡行','四天王下界巡察善恶（每月同）','宜戒']],
  30:[['月晦 · 司命奏事','月之末日，司命灶君奏事于天（每月同）','减寿'],['四天王巡行','四天王下界巡察善恶（每月同，月小即戒廿九）','宜戒']]
};
const MS={
1:{1:[['天腊','天腊之辰，玉帝校世人神气禄命','削禄夺纪']],
3:[['万神都会','万神都会之辰','夺纪']],
5:[['五虚忌','五虚，中医谓体虚之五种症状：脉细、皮寒、泄利前后、饮食不入、真气不足','宜戒']],
6:[['六耗忌','阴、阳、晦、明、风、雨所导致的六种病，是谓六耗','宜戒']],
7:[['上会日','上会之日','损寿']],
8:[['五殿阎罗天子诞','五殿阎罗天子圣诞','夺纪']],
9:[['玉皇上帝诞','玉皇上帝圣诞','夺纪']],
13:[['杨公忌','杨公忌日','宜戒']],
14:[['三元降','三官大帝下降之日','减寿']],
15:[['三元降','三官大帝下降之日','减寿'],['上元神会','上元神会之辰','夺纪'],['三元日','正月十五为上元，三元之日','犯之减寿五年']],
16:[['三元降','三官大帝下降之日','减寿']],
19:[['长春真人诞','长春真人圣诞','宜戒']],
23:[['三尸神奏事','三尸神上奏人过之日','宜戒']],
25:[['天地仓开日','天地仓开之日','损寿、子带疾']]},
2:{1:[['一殿秦广王诞','一殿秦广王圣诞','夺纪']],
2:[['万神都会','万神都会之辰','夺纪']],
3:[['文昌帝君诞','文昌帝君圣诞','削禄夺纪']],
6:[['东华帝君诞','东华帝君圣诞','宜戒']],
8:[['释迦牟尼佛出家','释迦牟尼佛出家纪念日','夺纪'],['三殿宋帝王诞','三殿宋帝王圣诞','宜戒'],['张大帝诞','张大帝圣诞','宜戒']],
11:[['杨公忌','杨公忌日','宜戒']],
15:[['释迦牟尼佛般涅槃','释迦牟尼佛涅槃纪念日','宜戒'],['太上老君诞','太上老君圣诞','削禄夺纪']],
17:[['东方杜将军诞','东方杜将军圣诞','宜戒']],
18:[['四殿五官王诞','四殿五官王圣诞','宜戒'],['至圣先师孔子讳辰','至圣先师孔子讳辰','削禄夺纪']],
19:[['观音大士诞','观音大士圣诞','夺纪']],
21:[['普贤菩萨诞','普贤菩萨圣诞','宜戒']]},
3:{1:[['二殿楚江王诞','二殿楚江王圣诞','夺纪']],
3:[['玄天上帝诞','玄天上帝（真武大帝）圣诞','夺纪']],
8:[['六殿卞城王诞','六殿卞城王圣诞','夺纪']],
9:[['牛鬼神出','牛鬼神出之日','产恶胎'],['杨公忌','杨公忌日','宜戒']],
12:[['中央五道诞','中央五道神圣诞','宜戒']],
15:[['玄坛诞','玄坛真君圣诞','夺纪'],['昊天上帝诞','昊天上帝圣诞','宜戒']],
16:[['准提菩萨诞','准提菩萨圣诞','夺纪']],
18:[['中岳大帝诞','中岳大帝圣诞','宜戒'],['后土娘娘诞','后土娘娘圣诞','宜戒'],['三茅降','三茅真君下降之日','宜戒']],
20:[['天地仓开日','天地仓开之日','损寿'],['子孙娘娘诞','子孙娘娘圣诞','宜戒']],
27:[['七殿泰山王诞','七殿泰山王圣诞','夺纪']],
28:[['苍颉至圣先师诞','苍颉至圣先师圣诞','削禄夺纪'],['东岳大帝诞','东岳大帝圣诞','宜戒']]},
4:{1:[['八殿都市王诞','八殿都市王圣诞','夺纪']],
4:[['万神善化','万神善化之辰','失瘏夭胎'],['文殊菩萨诞','文殊菩萨圣诞','宜戒']],
7:[['南斗北斗西斗同降','南斗、北斗、西斗星君同降之日','减寿'],['杨公忌','杨公忌日','宜戒']],
8:[['释迦牟尼佛诞','释迦牟尼佛圣诞','夺纪'],['万神善化','万神善化之辰','失瘏夭胎'],['善恶童子降','善恶童子下降，察录人间善恶','血死'],['九殿平等王诞','九殿平等王圣诞','宜戒']],
14:[['纯阳祖师诞','纯阳祖师吕洞宾圣诞','减寿']],
15:[['钟离祖师诞','钟离祖师圣诞','夺纪']],
16:[['天地仓开日','天地仓开之日','损寿']],
17:[['十殿转轮王诞','十殿转轮王圣诞','夺纪']],
18:[['天地仓开日','天地仓开之日','宜戒'],['紫微大帝诞','紫微大帝圣诞','减寿']],
20:[['眼光圣母诞','眼光圣母圣诞','宜戒']]},
5:{1:[['南极长生大帝诞','南极长生大帝圣诞','夺纪']],
5:[['地腊','地腊之辰，五帝校定生人官爵','削禄夺纪'],['九毒日','九毒日之首日（五月俗称毒月）','夭亡奇祸不测'],['杨公忌','杨公忌日','宜戒']],
6:[['九毒日','九毒日','夭亡奇祸不测']],
7:[['九毒日','九毒日','夭亡奇祸不测']],
8:[['南方五道诞','南方五道神圣诞','宜戒']],
11:[['天仓开日','天仓开之日','损寿'],['天下都城隍诞','天下都城隍圣诞','宜戒']],
12:[['炳灵公诞','炳灵公圣诞','宜戒']],
13:[['关圣降神','关圣帝君降神之日','削禄夺纪']],
14:[['天地交泰','夜子时为天地交泰之日','三年内夫妇俱亡']],
15:[['九毒日','九毒日','夭亡奇祸不测']],
16:[['九毒日','九毒日','夭亡奇祸不测'],['天地元气造化万物之辰','天地元气造化万物之辰','三年内夫妇俱亡']],
17:[['九毒日','九毒日','夭亡奇祸不测']],
18:[['张天师诞','张天师圣诞','宜戒']],
22:[['孝娥神诞','孝娥神圣诞','夺纪']],
25:[['九毒日','九毒日','夭亡奇祸不测']],
26:[['九毒日','九毒日','夭亡奇祸不测']],
27:[['九毒日','九毒日','夭亡奇祸不测']]},
6:{3:[['杨公忌','杨公忌日','宜戒']],
4:[['南赡部洲转大法轮','南赡部洲转大法轮之日','损寿']],
6:[['天仓开日','天仓开之日','损寿']],
10:[['金粟如来诞','金粟如来圣诞','宜戒']],
13:[['井泉龙王诞','井泉龙王圣诞','宜戒']],
19:[['观音大士成道日','观音大士成道（涅槃）之日','夺纪']],
23:[['南方火神诞','南方火神圣诞','遭回禄']],
24:[['雷祖诞','雷祖圣诞','宜戒'],['关帝诞','关圣帝君圣诞','削禄夺纪']]},
7:{1:[['杨公忌','杨公忌日','夺纪']],
5:[['中会日','中会之日（一作初七）','损寿']],
7:[['道德腊','道德腊之辰，五帝校生人善恶','宜戒'],['魁星诞','魁星圣诞','削禄夺纪']],
10:[['阴毒日','阴毒日','大忌']],
12:[['长真谭真人诞','长真谭真人圣诞','宜戒']],
13:[['大势至菩萨诞','大势至菩萨圣诞','减寿']],
14:[['三元降','三官大帝下降之日','减寿']],
15:[['三元降','三官大帝下降之日','宜戒'],['地官校籍','中元地官大帝校籍之辰','夺纪'],['三元日','七月十五为中元，三元之日','犯之减寿五年']],
16:[['三元降','三官大帝下降之日','减寿']],
18:[['西王母诞','西王母圣诞','夺纪']],
19:[['太岁诞','太岁星君圣诞','夺纪']],
22:[['增福财神诞','增福财神圣诞','削禄夺纪']],
29:[['杨公忌','杨公忌日','宜戒']],
30:[['地藏菩萨诞','地藏菩萨圣诞','夺纪']]},
8:{1:[['许真君诞','许真君圣诞','宜戒']],
3:[['北斗诞','北斗星君圣诞','削禄夺纪'],['司命灶君诞','司命灶君圣诞','遭回禄']],
5:[['雷声大帝诞','雷声大帝圣诞','夺纪']],
10:[['北斗大帝诞','北斗大帝圣诞','宜戒']],
12:[['西方五道诞','西方五道神圣诞','宜戒']],
15:[['太阴朝元','太阴朝元之辰，宜焚香守夜','暴亡']],
16:[['天曹掠刷真君降','天曹掠刷真君下降之日','贫夭']],
18:[['天人兴福之辰','天人兴福之辰，宜斋戒、存想吉事','宜戒']],
23:[['汉桓侯张显王诞','汉桓侯张显王圣诞','宜戒']],
24:[['灶君夫人诞','灶君夫人圣诞','宜戒']],
27:[['至圣先师孔子诞','至圣先师孔子圣诞','削禄夺纪'],['杨公忌','杨公忌日','宜戒']],
28:[['四天会事','四天王会集议事之辰','宜戒']],
30:[['诸神考校','诸神考校人间善恶之日','夺算']]},
9:{1:[['南斗诞','南斗星君圣诞','削禄夺纪']],
3:[['五瘟神诞','五瘟神圣诞','宜戒']],
9:[['斗母诞','斗母元君圣诞','削禄夺纪'],['酆都大帝诞','酆都大帝圣诞','宜戒'],['玄天上帝飞升','玄天上帝飞升之日','宜戒']],
10:[['斗母降','斗母元君下降之日','夺纪']],
11:[['宜戒之日','原书标明宜戒之日','宜戒']],
13:[['孟婆尊神诞','孟婆尊神圣诞','宜戒']],
17:[['金龙四大王诞','金龙四大王圣诞','水厄']],
19:[['日宫月宫会合','日宫月宫会合之辰','宜戒'],['观世音菩萨出家日','观世音菩萨出家纪念日','减寿']],
25:[['杨公忌','杨公忌日','宜戒']],
30:[['药师琉璃光佛诞','药师琉璃光佛圣诞','得危疾']]},
10:{1:[['民岁腊','民岁腊之辰','夺纪'],['四天王降','四天王下降之日','一年内死']],
3:[['三茅诞','三茅真君圣诞','夺纪']],
5:[['下会日','下会之日','损寿'],['达摩祖师诞','达摩祖师圣诞','宜戒']],
6:[['天曹考察','天曹考察善恶之日','夺纪']],
8:[['佛涅槃日','佛涅槃日，大忌色欲','大忌色欲']],
10:[['四天王降','四天王下降之日','一年内死']],
11:[['宜戒之日','原书标明宜戒之日','宜戒']],
14:[['三元降','三官大帝下降之日','减寿']],
15:[['三元降','三官大帝下降之日','宜戒'],['下元水府校籍','下元水府校籍之辰','夺纪'],['三元日','十月十五为下元，三元之日','犯之减寿五年']],
16:[['三元降','三官大帝下降之日','减寿']],
23:[['杨公忌','杨公忌日','宜戒']],
27:[['北极紫微大帝降','北极紫微大帝下降之日','宜戒']]},
11:{4:[['至圣先师孔子诞','至圣先师孔子圣诞','削禄夺纪']],
6:[['西岳大帝诞','西岳大帝圣诞','宜戒']],
11:[['天仓开日','天仓开之日','宜戒'],['太乙救苦天尊诞','太乙救苦天尊圣诞','夺纪']],
15:[['月望之夜','月望之夜：上半夜犯者男死，下半夜犯者女死','上半夜犯男死，下半夜犯女死']],
17:[['阿弥陀佛诞','阿弥陀佛圣诞','宜戒']],
19:[['太阳日宫诞','太阳日宫圣诞','奇祸']],
21:[['杨公忌','杨公忌日','宜戒']],
23:[['张仙诞','张仙（送子张仙）圣诞','绝嗣']],
25:[['掠刷大夫降','掠刷大夫下降之日','大凶']],
26:[['北方五道诞','北方五道神圣诞','宜戒']]},
12:{6:[['天仓开日','天仓开之日','宜戒']],
7:[['掠刷大夫降','掠刷大夫下降之日','得恶疾']],
8:[['王侯腊','王侯腊之辰（初旬内戊日亦名王侯腊）','夺纪'],['释迦如来成道日','释迦如来成道纪念日','宜戒']],
12:[['太素三元君朝真','太素三元君朝真之日','宜戒']],
16:[['南岳大帝诞','南岳大帝圣诞','宜戒']],
19:[['杨公忌','杨公忌日','宜戒']],
20:[['天地交道','天地交通之辰','促寿']],
21:[['天猷上帝诞','天猷上帝圣诞','宜戒']],
23:[['五岳神降','五岳神下降之日','宜戒']],
24:[['司命朝天奏人善恶','司命灶君朝天，奏人善恶','大祸']],
25:[['三清玉帝同降考察善恶','三清与玉帝同降，考察善恶','奇祸']],
29:[['华严菩萨诞','华严菩萨圣诞','宜戒']],
30:[['诸神下降察访善恶','诸神下降，察访人间善恶','犯者男女俱亡']]}
};
const YIN_CUO={1:'庚戌',2:'辛酉',3:'庚申',4:'丁未',5:'丙午',6:'丁巳',7:'甲辰',8:'乙卯',9:'甲寅',10:'癸丑',11:'壬子',12:'癸亥'};
const YANG_CUO={1:'甲寅',2:'乙卯',3:'甲辰',4:'丁巳',5:'丙午',6:'丁未',7:'庚申',8:'乙酉',9:'庚戌',10:'癸亥',11:'壬子',12:'癸丑'};
const YIN_TXT='正月庚戌、二月辛酉、三月庚申、四月丁未、五月丙午、六月丁巳、七月甲辰、八月乙卯、九月甲寅、十月癸丑、十一月壬子、十二月癸亥，此阴不足之日';
const YANG_TXT='正月甲寅、二月乙卯、三月甲辰、四月丁巳、五月丙午、六月丁未、七月庚申、八月乙酉、九月庚戌、十月癸亥、十一月壬子、十二月癸丑，此阳不足之日';
const SHI_E_DA_BAI={'甲':[[3,'戊戌'],[7,'癸亥'],[10,'丙申'],[11,'丁亥']],'己':[[3,'戊戌'],[7,'癸亥'],[10,'丙申'],[11,'丁亥']],
'乙':[[4,'壬申'],[9,'乙巳']],'庚':[[4,'壬申'],[9,'乙巳']],'丙':[[3,'辛巳'],[9,'庚辰'],[10,'甲辰']],'辛':[[3,'辛巳'],[9,'庚辰'],[10,'甲辰']],'戊':[[6,'己丑']],'癸':[[6,'己丑']]};
const SHI_E_TXT='甲己年三月戊戌、七月癸亥、十月丙申、十一月丁亥；乙庚年四月壬申、九月乙巳；丙辛年三月辛巳、九月庚辰、十月甲辰；丁壬年无忌；戊癸年六月己丑。此皆大不吉之日';
const FEN_ZHI=['春分','秋分','夏至','冬至'],SI_LI=['立春','立夏','立秋','立冬'];
const TERM_DESC={'春分':'雷将发声。犯者生子五官四肢不全，父母有灾。宜从惊蛰节禁起，戒过一月。',
'秋分':'杀气浸盛，阳气日衰。宜从白露节禁起，戒过一月。',
'夏至':'阴阳相争，死生分判之时。宜从芒种节禁起，戒过一月。',
'冬至':'阴阳相争，死生分判之时。宜从大雪节禁起，戒过一月。半夜子时犯之，主一年内亡。',
'立春':'四立之日，犯之减寿五年（前一日为四绝日）。','立夏':'四立之日，犯之减寿五年（前一日为四绝日）。',
'立秋':'四立之日，犯之减寿五年（前一日为四绝日）。','立冬':'四立之日，犯之减寿五年（前一日为四绝日）。'};
const MAJOR_KEYS=['夭','亡','死','祸','凶','绝嗣','血死','危疾','急疾','暴亡','恶疾','产恶胎','大忌','大不吉','水厄','一年内'];
function severityOf(s){return MAJOR_KEYS.some(k=>s.includes(k))?'major':'minor'}
/* ================= 四、逐日戒期收集 ================= */
const _aux={};
function nthGanAfter(from,nth,ganIdx){let d=addDays(from,1),n=0;
  while(n<nth){if(getDayGZ(d).idx%10===ganIdx)n++;if(n<nth)d=addDays(d,1)}return d}
function nthZhiAfter(from,nth,zhiIdx){let d=addDays(from,1),n=0;
  while(n<nth){if(getDayGZ(d).idx%12===zhiIdx)n++;if(n<nth)d=addDays(d,1)}return d}
function getFuDates(y){const a=_aux[y]=_aux[y]||{};
  if(!a.fu){const xz=getTermByName(y,'夏至').date,lq=getTermByName(y,'立秋').date;
    a.fu=[nthGanAfter(xz,3,6),nthGanAfter(xz,4,6),nthGanAfter(lq,1,6)]}return a.fu}
function getSheDates(y){const a=_aux[y]=_aux[y]||{};
  if(!a.she)a.she={chun:nthGanAfter(getTermByName(y,'立春').date,5,4),qiu:nthGanAfter(getTermByName(y,'立秋').date,5,4)};return a.she}
function getDZAux(y){const a=_aux[y]=_aux[y]||{};
  if(!a.dz){const dz=getTermByName(y,'冬至').date;a.dz={date:dz,thirdXu:nthZhiAfter(dz,3,10)}}return a.dz}
const ZHAI=[['惊蛰','春分'],['芒种','夏至'],['白露','秋分'],['大雪','冬至']];

function collectItems(date,lunar,gz){
  const items=[];
  const push=(t,r,c,sev)=>items.push({t,r,c,sev:sev||severityOf(t+r+c)});
  const lm=lunar.month,ld=lunar.day,isLeap=lunar.isLeap;
  const monthLen=isLeap?lLeapDays(lunar.year):lMonthDays(lunar.year,lm);
  const gan=gz.idx%10;
  if(!isLeap){
    const sp=MS[lm];
    if(sp&&sp[ld])sp[ld].forEach(x=>push(x[0],x[1],x[2]));
    if(lm===9&&ld<=9)push('北斗九星降','自初一至初九，北斗九星下降，此九日俱宜斋戒','夺纪');
    if(YIN_CUO[lm]===gz.name)push('阴错日（'+gz.name+'日）',YIN_TXT,'俱宜戒');
    if(YANG_CUO[lm]===gz.name)push('阳错日（'+gz.name+'日）',YANG_TXT,'俱宜戒');
    const bad=SHI_E_DA_BAI[GAN[getYearGZ(date).idx%10]];
    if(bad)for(const b of bad)if(b[0]===lm&&b[1]===gz.name)push('十恶大败日（'+gz.name+'日）',SHI_E_TXT,'大不吉之日，宜戒');
  }
  if(MONTHLY_FIXED[ld])MONTHLY_FIXED[ld].forEach(x=>push(x[0],x[1],x[2]));
  if(ld===29&&monthLen===29)push('月晦 · 司命奏事','月小，即戒廿九（晦为月之末日，司命奏事）','减寿');
  if(ld===7||ld===8)push('上弦日','上弦为每月初七、初八，弦日','犯之减寿一年');
  if(ld===22||ld===23)push('下弦日','下弦为每月廿二、廿三，弦日','犯之减寿一年');
  if((monthLen===30&&ld===18)||(monthLen===29&&ld===17))push('毁败日','毁败之日：大月十八日、小月十七日','犯之得病');
  if(gan===2||gan===3)push(gz.name+'日（丙丁日）','日干属丙、丁（丙丁属火）','犯之得病');
  if(gan===7)push(gz.name+'日（三辛日）','每月三个辛日','犯之减寿一年');
  if(gz.name==='甲子')push('甲子日','六十甲子之首日','犯之减寿一年');
  if(gz.name==='庚申')push('庚申日','庚申之日','犯之减寿一年');
  const ygz=getYearGZ(date);
  if(gz.idx===ygz.idx)push('太岁日（'+gz.name+'日）','日干支与当年太岁干支相同','犯之减寿');
  const term=findTermOnDate(date),yT=findTermOnDate(addDays(date,-1));
  if(term&&SI_LI.includes(term.name))push('四立日 · '+term.name,'四立：立春、立夏、立秋、立冬之日','犯之减寿五年');
  if(yT){
    if(FEN_ZHI.includes(yT.name))push('四离日（'+yT.name+'前一日）','四离：冬至、夏至、春分、秋分之前一日','犯之减寿五年');
    else if(SI_LI.includes(yT.name))push('四绝日（'+yT.name+'前一日）','四绝：四立日之前一日','犯之减寿五年');
  }
  for(const name of FEN_ZHI){
    const t=getTermByName(date.getFullYear(),name).date,diff=dayDiff(date,t);
    if(diff>=-3&&diff<=3){
      const pos=diff===0?'当日':(diff<0?'前'+(-diff)+'日':'后'+diff+'日');
      const zhi=(name==='夏至'||name==='冬至');
      push(name+'前三年后三日七日之期','今为'+name+pos+'（二分二至之前三后三共七日）'+(zhi?'，此二至乃阴阳绝续之交':''),zhi?'犯之必得急疾，尤宜切戒':'犯之必得危疾，尤宜切戒');
    }
  }
  for(const y of[date.getFullYear()-1,date.getFullYear()])
    for(const[from,to]of ZHAI){
      const t=getTermByName(y,from).date,diff=dayDiff(date,t);
      if(diff>=0&&diff<=29)push(to+'之月斋戒期','宜从'+from+'节禁起，戒过一月','宜斋戒','zhai');
    }
  getFuDates(date.getFullYear()).forEach((fd,i)=>{
    if(sameDay(fd,date))push(['初伏日','中伏日','末伏日'][i]+'（三伏日）','夏至后第三庚日为初伏、第四庚日为中伏，立秋后第一庚日为末伏','犯之减寿一年')});
  const she=getSheDates(date.getFullYear());
  if(sameDay(she.chun,date))push('春社日','立春后第五个戊日为春社；社日受胎者，毛发皆白','犯之减寿五年');
  if(sameDay(she.qiu,date))push('秋社日','立秋后第五个戊日为秋社；社日受胎者，毛发皆白','犯之减寿五年');
  if(term&&term.name==='冬至')push('冬至半夜子时','冬至夜半子时，阴阳绝续之交','犯之皆主在一年内亡');
  for(const y of[date.getFullYear(),date.getFullYear()-1]){
    const dz=getDZAux(y),xc=getTermByName(y+1,'小寒').date;
    if(dayDiff(date,dz.date)>0&&dayDiff(xc,date)>0){
      if(gan===6)push('冬至后庚日（'+gz.name+'日）','冬至后之庚日','犯之皆主在一年内亡');
      else if(gan===7)push('冬至后辛日（'+gz.name+'日）','冬至后之辛日','犯之皆主在一年内亡');
    }
    if(sameDay(dz.thirdXu,date))push('冬至后第三戌日（'+gz.name+'日）','自冬至起第三个戌日','犯之皆主在一年内亡');
  }
  const rank={major:0,minor:1,zhai:2};
  items.sort((a,b)=>rank[a.sev]-rank[b.sev]);
  return items;
}
const _dayCache=new Map();
const pad=n=>(n<10?'0':'')+n;
function fmtKey(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())}
function getDayInfo(date){
  const k=fmtKey(date);
  if(_dayCache.has(k))return _dayCache.get(k);
  const lunar=solar2lunar(date),gz=getDayGZ(date);
  const info={date:new Date(date.getFullYear(),date.getMonth(),date.getDate()),lunar,gz,
    items:lunar?collectItems(date,lunar,gz):[],term:findTermOnDate(date),
    monthGZ:getMonthGZ(date),yearGZ:getYearGZ(date)};
  _dayCache.set(k,info);return info;
}
function dayStatus(info){
  if(!info.lunar)return'safe';
  if(info.items.some(i=>i.sev==='major'))return'major';
  if(info.items.some(i=>i.sev==='minor'))return'minor';
  if(info.items.some(i=>i.sev==='zhai'))return'zhai';
  return'safe';
}
/* ================= 五、渲染与交互 ================= */
