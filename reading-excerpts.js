// The paragraph selection is explicitly authored with each question.
// Unknown or structurally ambiguous text is shown in full.
export function numberedParagraphs(text){
 const matches=[...text.matchAll(/(?:^|\s)(\d{1,2})\s*[-–—]\s+/g)];
 if(!matches.length||matches.some((m,i)=>Number(m[1])!==i+1))return null;
 return matches.map((m,i)=>({number:Number(m[1]),text:text.slice(m.index,matches[i+1]?.index??text.length).trim()}));
}
export function excerptForQuestions(source,questions){
 if(!questions.length||questions.some(q=>!Array.isArray(q.readingParagraphs)||!q.readingParagraphs.length))return source;
 const parts=numberedParagraphs(source.text);if(!parts)return source;
 const wanted=[...new Set(questions.flatMap(q=>q.readingParagraphs))].sort((a,b)=>a-b);
 if(wanted.some(n=>!parts.some(p=>p.number===n)))return source;
 const selected=parts.filter(p=>wanted.includes(p.number));
 if(selected.length===parts.length)return source;
 return {...source,text:selected.map(p=>p.text).join('\n\n[…]\n\n'),fullText:source.text,excerptParagraphs:wanted,isExcerpt:true};
}
