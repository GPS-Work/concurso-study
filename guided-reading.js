import {readingSources} from './data/reading-sources.js';
import {excerptForQuestions} from './reading-excerpts.js';
import {dailyPathLesson,lessonSession,learningState} from './learning.js';
import {buildSession,administrationScope,topicStages,eligible} from './engine.js';
import {articleKey} from './article-memory.js';
const readingKey=q=>q.referenceKind==='point'?q.law+':'+q.articleNumber:articleKey(q);

export function guidedDailyLesson(questions,answers,reviews,profile,laws=null,now=Date.now(),weights={}){
 const lesson=dailyPathLesson(questions,answers,reviews,profile,laws,now,10);
 const candidates=lesson.unit?lessonSession(lesson.unit,answers,now):lesson.questions;
 // Once foundations are established, use them for reading and reserve unassisted
 // practice for remaining families. Otherwise the final two could always stay assisted.
 const index=new Map(questions.map(q=>[q.id,q])),established=new Map();
 for(const a of [...answers].sort((a,b)=>Date.parse(a.answeredAt)-Date.parse(b.answeredAt))){const q=index.get(a.questionId);if(q&&a.assisted!==true)established.set(q.familyId||q.id,a.correct===true);}
 candidates.sort((a,b)=>Number(established.get(b.familyId||b.id)===true)-Number(established.get(a.familyId||a.id)===true));
 const groups=new Map();
 for(const q of candidates){const key=readingKey(q);if(!key||!readingSources[key])continue;if(!groups.has(key))groups.set(key,[]);const group=groups.get(key);if(!group.some(x=>(x.familyId||x.id)===(q.familyId||q.id)))group.push(q)}
 const pair=[...groups.values()].find(group=>group.length>=2);
 const masteredPair=[...groups.values()].find(group=>group.length>=2&&group.slice(0,2).every(q=>established.get(q.familyId||q.id)===true));
 const masteredReading=[...groups.values()].flat().filter(q=>established.get(q.familyId||q.id)===true);
 const reading=masteredPair?masteredPair.slice(0,2):masteredReading.length>=2?masteredReading.slice(0,2):pair?pair.slice(0,2):[...groups.values()].flat().slice(0,2);
 const used=new Set(reading.map(q=>q.familyId||q.id));
 const state=lesson.unit?learningState(questions,answers,profile,laws,now):null;
 const stages=topicStages(eligible(questions,profile.region,laws,profile.area,administrationScope(profile),profile.programme,now),answers);
 const allowed=lesson.unit?state.units.filter(u=>u.track==='exame'&&(u.passed||u.id===lesson.unit.id)).flatMap(u=>u.questions):questions;
 const unique=[...new Map(allowed.filter(q=>!used.has(q.familyId||q.id)).map(q=>[q.id,q])).values()];
 // Balance due reviews, weaknesses and new material inside the already unlocked path.
 // The curriculum is the difficulty gate here: a topic may first occur at level 3.
 const general=buildSession(unique,reviews,profile.region,8,laws,answers,weights,profile.area,now,administrationScope(profile),profile.programme);
 // Small lessons need supplementary practice at the same chapter and established difficulty.
 // This does not unlock later lessons or let a narrowed pool bypass a topic's foundations.
 if(lesson.unit&&general.length<8){
  const selected=new Set([...reading,...general].map(q=>q.familyId||q.id));
  const foundations=state.units.filter(u=>u.track==='exame'&&u.chapterNumber===lesson.unit.chapterNumber&&u.difficulty<=lesson.unit.difficulty).flatMap(u=>u.questions).filter(q=>!selected.has(q.familyId||q.id)&&q.difficulty<=(stages.get(q.law+'|'+q.topic)?.stage||1));
  const supplement=buildSession([...new Map(foundations.map(q=>[q.id,q])).values()],reviews,profile.region,8-general.length,laws,answers,weights,profile.area,now,administrationScope(profile),profile.programme);
  general.push(...supplement);
 }
 // A small or recently practised pool can produce fewer questions; never break the cooldown.
 return {...lesson,questions:[...reading,...general],readingCount:reading.length,generalCount:general.length,readingBlocks:[...new Set(reading.map(readingKey))].map(key=>({key,...excerptForQuestions(readingSources[key],reading.filter(q=>readingKey(q)===key))}))};
}
