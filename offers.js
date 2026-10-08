import {getKV,setKV} from './db.js';
export const BEP_SOURCE='https://bep.madeira.gov.pt/Home/OfertasGeral';
const MAX_AGE=24*3600000;
export function lisbonDay(now=new Date()){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Lisbon',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now).map(p=>[p.type,p.value]));return parts.year+'-'+parts.month+'-'+parts.day;}
export function validateOfferFeed(data){
 if(data?.schemaVersion!==1||data.source!==BEP_SOURCE||data.access!=='sem-vinculo'||!['ok','error'].includes(data.status)||!Array.isArray(data.offers)||data.offers.length>500)throw Error('Dados das ofertas não reconhecidos');
 if(data.checkedAt!==null&&!Number.isFinite(Date.parse(data.checkedAt)))throw Error('Data de verificação inválida');
 if(data.status==='ok'&&(!data.checkedAt||typeof data.detailComplete!=='boolean'))throw Error('Verificação incompleta');
 const ids=new Set();
 for(const o of data.offers){if(!/^\d+$/.test(o.id)||ids.has(o.id)||!/^OE\d{6}\/\d+$/.test(o.code)||o.url!=='https://bep.madeira.gov.pt/Home/Oferta/'+o.id||o.access!=='sem-vinculo'||!['yes','no','unknown'].includes(o.rh)||!/^\d{4}-\d{2}-\d{2}$/.test(o.deadline)||new Date(o.deadline+'T12:00:00Z').toISOString().slice(0,10)!==o.deadline)throw Error('Oferta com identificação inválida');
  for(const field of ['career','organisation','type','functionalArea','rhReason'])if(typeof o[field]!=='string'||o[field].length>600)throw Error('Campo de oferta inválido');ids.add(o.id);
 }
 return data;
}
export function offerSummary(snapshot,now=new Date()){
 const today=lisbonDay(now),offers=(snapshot?.offers||[]).filter(o=>o.deadline>=today),age=snapshot?.checkedAt?now-Date.parse(snapshot.checkedAt):Infinity;
 return {offers,rh:offers.filter(o=>o.rh==='yes'),unknown:offers.filter(o=>o.rh==='unknown'),stale:age>MAX_AGE||age< -300000,error:snapshot?.status==='error',hasVerification:Boolean(snapshot?.checkedAt)};
}
export function matchingOffers(snapshot,settings,now=new Date()){
 const summary=offerSummary(snapshot,now);return settings?.scope==='all'?summary.offers:summary.offers.filter(o=>o.rh==='yes'||o.rh==='unknown');
}
export function newOfferIds(snapshot,settings,seen,now=new Date()){
 const summary=offerSummary(snapshot,now);if(summary.stale||summary.error||!summary.hasVerification)return [];
 const prior=new Set(seen);return matchingOffers(snapshot,settings,now).map(o=>o.id).filter(id=>!prior.has(id));
}
export async function readCachedOffers(){const cache=await getKV('bepSnapshot');if(!cache)return null;try{return validateOfferFeed(cache)}catch{return null;}}
export async function fetchOffers(fetcher=globalThis.fetch){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 try{const response=await fetcher('./data/bep-offers.json',{cache:'no-store',signal:controller.signal});
 if(!response.ok)throw Error('Não foi possível obter as ofertas');const snapshot=validateOfferFeed(await response.json());await setKV('bepSnapshot',snapshot);return snapshot;}finally{clearTimeout(timer);}
}
export async function requestOfferPermission(){
 if(typeof Notification==='undefined'||!('serviceWorker'in navigator))return false;
 return await Notification.requestPermission()==='granted';
}
export async function notifyNewOffers(snapshot,settings){
 if(!settings?.enabled)return 0;
 const stored=await getKV('bepSeen');
 // Primeira verificação estabelece a base; as ofertas existentes aparecem no painel.
 if(!Array.isArray(stored)){await setKV('bepSeen',snapshot.offers.map(o=>o.id));return 0;}
 const ids=newOfferIds(snapshot,settings,stored);
 if(!ids.length)return 0;
 const selected=snapshot.offers.filter(o=>ids.includes(o.id)),count=selected.length;
 if(typeof Notification!=='undefined'&&Notification.permission==='granted'){
  try{const reg=await navigator.serviceWorker.getRegistration();if(reg?.active)await reg.showNotification('BEP-RAM · novas ofertas sem vínculo',{body:count+' '+(count===1?'nova oferta':'novas ofertas')+(settings.scope==='all'?'':', de RH ou por verificar')+'. Consulta o painel Hoje.',tag:'concurso-study-bep',icon:'./icons/icon-192.png',data:{url:location.href}});}catch(e){console.error('Não foi possível mostrar o aviso BEP-RAM',e.message);}
 }
 await setKV('bepSeen',[...new Set([...stored,...snapshot.offers.map(o=>o.id)])].slice(-1000));
 return count;
}
export function offersShortcutGuide(){return '<ol><li>Em Atalhos, cria uma automação para uma hora do dia e escolhe execução automática.</li><li>Adiciona Obter conteúdos do URL com o endereço de ofertas indicado abaixo. O resultado é um dicionário JSON.</li><li>Obtém status e checkedAt. Continua apenas se status for ok e a verificação tiver menos de 24 horas.</li><li>Obtém a lista offers. Usa Repetir com cada elemento e filtra access igual a sem-vinculo, deadline igual ou posterior à data de hoje e rh igual a yes. Para incluir ofertas por verificar, aceita também unknown. Para todas as ofertas, omite apenas o filtro rh.</li><li>Se houver resultados, usa Mostrar notificação. Sem guardar os IDs entre execuções, esta automação lembra ofertas abertas todos os dias; não identifica apenas as novas.</li></ol><p>Esta automação é configurada no iPhone. Não é uma subscrição push da PWA.</p>';}
