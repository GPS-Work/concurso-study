import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const SOURCE='https://bep.madeira.gov.pt/Home/OfertasGeral';
const normal=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
export function textContent(html){
 const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
 return html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&#(x[\da-f]+|\d+);/gi,(_,code)=>{const n=code[0].toLowerCase()==='x'?parseInt(code.slice(1),16):Number(code);return n>0&&n<=0x10ffff?String.fromCodePoint(n):' '}).replace(/&([a-z]+);/gi,(m,e)=>entities[e.toLowerCase()]??m).replace(/\s+/g,' ').trim();
}
function dateISO(value){const m=value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);if(!m)throw Error('Data-limite da BEP-RAM não reconhecida');const iso=m[3]+'-'+m[2]+'-'+m[1];if(new Date(iso+'T12:00:00Z').toISOString().slice(0,10)!==iso)throw Error('Data-limite inválida');return iso;}
export function parseListing(html){
 const table=html.match(/<table\b[^>]*\bid=["']tabOfertas["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
 if(!table||!normal(textContent(html)).includes('ofertas de emprego para cidadaos sem vinculo'))throw Error('A página não é a listagem pública esperada da BEP-RAM');
 const body=table.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/i)?.[1];if(body===undefined)throw Error('Tabela sem corpo reconhecido');
 const offers=[];
 for(const match of body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)){
  const cells=[...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>m[1]);if(cells.length!==6)throw Error('Estrutura da listagem mudou');
  const id=cells[0].match(/href=["']\/Home\/Oferta\/(\d+)["']/i)?.[1];const code=textContent(cells[1]);
  if(!id||!/^OE\d{6}\/\d+$/.test(code))throw Error('Oferta sem identificação reconhecida');
  offers.push({id,code,type:textContent(cells[2]),career:textContent(cells[3]),organisation:textContent(cells[4]),deadline:dateISO(textContent(cells[5])),url:'https://bep.madeira.gov.pt/Home/Oferta/'+id,access:'sem-vinculo',rh:'unknown',functionalArea:'',rhReason:'Detalhes ainda não classificados'});
 }
 if(new Set(offers.map(o=>o.id)).size!==offers.length)throw Error('Ofertas duplicadas');
 return offers;
}
export function classifyDetail(html){
 const fields={};
 // Só os campos da oferta. Menus, metadados, contactos e local de entrega são excluídos.
 for(const m of html.matchAll(/<div\s+class=["']col-md-3["'][^>]*>([\s\S]*?)<\/div>\s*<div\s+class=["']col-md-9["'][^>]*>([\s\S]*?)<\/div>/gi))fields[normal(textContent(m[1]))]=textContent(m[2]);
 const functionalArea=fields['area funcional']||'',activity=fields['area de atuacao']||'';
 if(!functionalArea&&!activity)return {rh:'unknown',functionalArea:'',rhReason:'Não foi possível ler a área da oferta'};
 const primary=normal(functionalArea),duties=normal(activity);
 const signals=[['recursos humanos',/\brecursos humanos\b/],['gestão de pessoal',/\bgestao (?:administrativa )?(?:de|do) pessoal\b/],['recrutamento e seleção de pessoal',/\brecrutamento e selecao (?:de (?:pessoal|trabalhadores)|de recursos humanos)\b/],['processamento de remunerações',/\bprocessamento (?:de |das |dos )?(?:remuneracoes|vencimentos|salarios)\b/]];
 const hit=signals.find(([,pattern])=>pattern.test(primary)||pattern.test(duties));
 return {rh:hit?'yes':'no',functionalArea:functionalArea.slice(0,160),rhReason:hit?'Referência à área/funções de '+hit[0]:'Sem referência explícita a funções de RH nos campos da oferta'};
}
async function readPage(url){
 const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'ConcursoStudy/0.2 (public employment listing; no login)'}});
 if(!r.ok)throw Error('BEP-RAM respondeu '+r.status);
 if(new URL(r.url).hostname!=='bep.madeira.gov.pt')throw Error('Redirecionamento fora da BEP-RAM');
 return r.text();
}
export async function collect(fetchPage=readPage,now=new Date()){
 const offers=parseListing(await fetchPage(SOURCE));
 for(const offer of offers){try{Object.assign(offer,classifyDetail(await fetchPage(offer.url)))}catch{offer.rhReason='Detalhes indisponíveis nesta verificação';}}
 return {schemaVersion:1,source:SOURCE,access:'sem-vinculo',checkedAt:now.toISOString(),lastAttemptAt:now.toISOString(),status:'ok',detailComplete:offers.every(o=>o.rh!=='unknown'),offers};
}
export async function updateFeed(target,fetchPage=readPage,now=new Date()){
 let previous;try{previous=JSON.parse(await fs.readFile(target,'utf8'))}catch{}
 try{const snapshot=await collect(fetchPage,now);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify(snapshot,null,2)+'\n');return snapshot;}
 catch(error){
  const fallback=previous?.schemaVersion===1?{...previous,lastAttemptAt:now.toISOString(),status:'error',error:'Não foi possível verificar a fonte; mantém-se a última verificação bem-sucedida.'}:{schemaVersion:1,source:SOURCE,access:'sem-vinculo',checkedAt:null,lastAttemptAt:now.toISOString(),status:'error',detailComplete:false,offers:[],error:'Ainda não existe uma verificação bem-sucedida da BEP-RAM.'};
  await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,JSON.stringify(fallback,null,2)+'\n');throw error;
 }
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const target=fileURLToPath(new URL('../data/bep-offers.json',import.meta.url));
 try{const result=await updateFeed(target);console.log('BEP-RAM: '+result.offers.length+' ofertas sem vínculo; '+result.offers.filter(o=>o.rh==='yes').length+' com funções de RH; '+result.offers.filter(o=>o.rh==='unknown').length+' por classificar.');}
 catch(error){console.error('Atualização BEP-RAM falhou: '+error.message);process.exitCode=1;}
}
