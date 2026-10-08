import {examEligible,daysUntil} from './engine.js';

export const examPresets=[
 {id:'manual',label:'Definir pelas regras do meu aviso',rules:{}},
 {id:'dre-2026',label:'DRE — Aviso 6/2026',rules:{durationMinutes:90,consultation:'forbidden',officialFormat:'written',source:'https://joram.madeira.gov.pt/joram/2serie/Ano%20de%202026/IISerie-006-2026-01-09Supl4.pdf',sourceNote:'Aviso: prova escrita teórica, sem consulta. Número, cotação e tipos de perguntas não confirmados. O aviso fixa legislação à sua publicação; este banco treina legislação atual por opção do utilizador.'}},
 {id:'funchal-2024',label:'Funchal — convocatória de 2024',rules:{durationMinutes:120,consultation:'permitted',officialFormat:'written',source:'https://www.funchal.pt/consulta/recursos-humanos/',sourceNote:'Convocatória anexada: 120 minutos com consulta. Concurso histórico; preencher a data da prova efetivamente pretendida. Tipos, cotações e penalizações não confirmados.'}},
 {id:'isel-2022',label:'ISEL RH — exemplo de prova de 2022',rules:{durationMinutes:90,consultation:'permitted',officialFormat:'mixed',questionCount:6,essayCount:2,automaticPoints:12,wrongPenalty:null,source:'https://www.isel.pt/sites/default/files/SRHGP/Concursos_ND/TS_SRHGP/ProvaConhecimentos_TS_SGRH.pdf',sourceNote:'Exemplo histórico: seis escolhas múltiplas (2 valores cada), uma resposta específica e uma geral (4 valores cada); sorteio de perguntas, consulta sem anotações. As regras servem de exemplo; soluções antigas não são importadas.'}},
 {id:'braga-2021',label:'Braga RH — exemplo de prova de 2021',rules:{durationMinutes:90,consultation:'forbidden',officialFormat:'mixed',essayCount:1,automaticPoints:17,essayLimitLines:30,source:'https://www.cm-braga.pt/archive/doc/Prova_Conhecimentos.pdf',sourceNote:'Exemplo histórico com 63 itens de cotação variável e texto até 30 linhas (3 valores). O treino usa escolha única, sem lacunas, e não reproduz integralmente essa prova.'}}
];
const number=(value,min,max)=>{if(value===null||value===undefined||value==='')return null;const n=Number(value);return Number.isFinite(n)&&n>=min&&n<=max?n:null};
export function normalizeExamRules(value={}){
 const count=number(value.questionCount,1,60),essayCount=number(value.essayCount,0,3);
 return {durationMinutes:number(value.durationMinutes,1,300),consultation:['permitted','forbidden'].includes(value.consultation)?value.consultation:'unknown',officialFormat:['single-choice','mixed','written','multi-choice','true-false'].includes(value.officialFormat)?value.officialFormat:'unknown',questionCount:count===null?20:Math.floor(count),essayCount:essayCount===null?0:Math.floor(essayCount),automaticPoints:number(value.automaticPoints,1,20)??20,wrongPenalty:number(value.wrongPenalty,0,1),essayLimitLines:number(value.essayLimitLines,1,100),source:typeof value.source==='string'&&/^https:\/\//.test(value.source)?value.source:'',sourceNote:String(value.sourceNote||''),preset:String(value.preset||'manual')};
}
export function selectExamQuestions(questions,competition,history=[],seed=Date.now()){
 const pool=examEligible(questions,competition.region,competition.legislationIds,competition.area,competition.administrationScope,competition.programme),last=new Map(),byId=new Map(questions.map(q=>[q.id,q]));
 for(const run of history)for(const id of run.questionIds||[]){const q=byId.get(id)||(run.questions||[]).find(q=>q.id===id),family=q?.familyId||id;last.set(family,Math.max(last.get(family)||0,Date.parse(run.finishedAt)||0));}
 const hash=id=>{let h=Number(seed)>>>0;for(const char of id)h=(Math.imul(h,31)+char.charCodeAt(0))>>>0;h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;return h>>>0};
 const lastAt=q=>last.get(q.familyId||q.id)||0;
 const ordered=[...pool].sort((a,b)=>lastAt(a)-lastAt(b)||hash(a.id)-hash(b.id));
 const selected=[],families=new Set(),counts=new Map(),remaining=[...ordered],limit=normalizeExamRules(competition.examRules).questionCount;
 while(selected.length<limit&&remaining.length){
  remaining.sort((a,b)=>lastAt(a)-lastAt(b)||((counts.get(a.law)||0)/(Number(competition.weights?.[a.law])||1))-((counts.get(b.law)||0)/(Number(competition.weights?.[b.law])||1))||hash(a.id)-hash(b.id));
  const q=remaining.shift(),family=q.familyId||q.id;if(families.has(family))continue;families.add(family);counts.set(q.law,(counts.get(q.law)||0)+1);selected.push(q);
 }
 return selected;
}
export function remainingExamSeconds(run,now=Date.now()){return run.deadline?Math.max(0,Math.ceil((Date.parse(run.deadline)-now)/1000)):null}
export function scoreExam(run){
 const rules=normalizeExamRules(run.rules),items=run.questions||[],perQuestion=items.length?rules.automaticPoints/items.length:0;
 let correct=0,wrong=0,blank=0,raw=0;
 for(const q of items){const choice=run.responses?.[q.id];if(!Number.isInteger(choice)||choice<0||choice>=q.options.length){blank++;continue}if(choice===q.correct){correct++;raw+=perQuestion}else{wrong++;raw-=perQuestion*(rules.wrongPenalty??0)}}
 return {correct,wrong,blank,total:items.length,automaticScore:Math.round(Math.max(0,Math.min(rules.automaticPoints,raw))*100)/100,automaticMaximum:rules.automaticPoints,essayPending:rules.essayCount>0,penaltyConfirmed:rules.wrongPenalty!==null,trainingOnly:true};
}
export function simulationSchedule(competition,now=new Date()){
 const days=daysUntil(competition.examDate,now);return {days,perWeek:days===null||days<0?0:days<=7?4:days<=21?3:1};
}
