const DB_NAME = 'ConcursoStudyDB';
const DB_VERSION = 1;

function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if(!db.objectStoreNames.contains('reviews')) db.createObjectStore('reviews',{keyPath:'questionId'});
      if(!db.objectStoreNames.contains('answers')) db.createObjectStore('answers',{keyPath:'id',autoIncrement:true});
      if(!db.objectStoreNames.contains('competitions')) db.createObjectStore('competitions',{keyPath:'id'});
    };
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });
}
async function tx(store,mode,fn){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction(store,mode);const s=t.objectStore(store);let result;try{result=fn(s)}catch(e){reject(e);return}t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);});}
export async function getKV(key){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('kv').objectStore('kv').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function setKV(key,val){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(val,key);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);});}
export async function allReviews(){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('reviews').objectStore('reviews').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function putReview(v){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('reviews','readwrite');t.objectStore('reviews').put(v);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);});}
export async function addAnswer(v){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('answers','readwrite');t.objectStore('answers').add(v);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);});}
export async function allAnswers(){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('answers').objectStore('answers').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function allCompetitions(){const db=await openDB();return new Promise((resolve,reject)=>{const r=db.transaction('competitions').objectStore('competitions').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
export async function putCompetition(v){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction('competitions','readwrite');t.objectStore('competitions').put(v);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);});}
