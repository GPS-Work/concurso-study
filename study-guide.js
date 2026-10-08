// Índice de estudo original: liga temas aos textos legais locais e respeita o âmbito do perfil.
export const studyTopics=[
 {id:'regimes',title:'Escolher o regime aplicável',refs:[['ltfp','1'],['ltfp','2'],['ltfp','4'],['socialframework','7']]},
 {id:'vinculos',title:'Constituir e verificar o vínculo',refs:[['ltfp','6'],['ltfp','17'],['ltfp','40']]},
 {id:'planeamento',title:'Planear e preencher postos de trabalho',refs:[['ltfp','29'],['ltfp','30'],['ltfp','33'],['ltfp','36']]},
 {id:'experimental',title:'Avaliar o período experimental',refs:[['ltfp','45'],['ltfp','46'],['ltfp','49']]},
 {id:'termo',title:'Justificar e renovar contratos a termo',refs:[['ltfp','57'],['ltfp','60'],['ltfp','63']]},
 {id:'acumulacao',title:'Decidir acumulações de funções',refs:[['ltfp','20'],['ltfp','21'],['ltfp','22'],['ltfp','23']]},
 {id:'deveres',title:'Aplicar deveres e garantias',refs:[['ltfp','71'],['ltfp','72'],['ltfp','73']]},
 {id:'mobilidade',title:'Distinguir mobilidade e cedência',refs:[['ltfp','93'],['ltfp','94'],['ltfp','95'],['ltfp','97'],['ltfp','241'],['ltfp','242']]},
 {id:'tempo',title:'Organizar horários e trabalho suplementar',refs:[['ltfp','105'],['ltfp','110'],['ltfp','114-A'],['ltfp','120'],['ltfp','162']]},
 {id:'ferias',title:'Gerir férias e ausências',refs:[['ltfp','126'],['ltfp','134'],['ltfp','135'],['ltfpapproval','15'],['ct','251']]},
 {id:'salarios',title:'Processar remuneração e suplementos',refs:[['ltfp','146'],['ltfp','155'],['ltfp','156'],['ltfp','159'],['ltfp','169']]},
 {id:'disciplina',title:'Instruir a responsabilidade disciplinar',refs:[['ltfp','176'],['ltfp','178'],['ltfp','180'],['ltfp','194'],['ltfp','196']]},
 {id:'licencas',title:'Analisar suspensão, licenças e cessação',refs:[['ltfp','278'],['ltfp','280'],['ltfp','281'],['ltfp','289']]},
 {id:'coletivo',title:'Compreender negociação e greve',refs:[['ltfp','347'],['ltfp','351'],['ltfp','370'],['ltfp','394'],['ltfp','396']]},
 {id:'parentalidade',title:'Gerir direitos de parentalidade',refs:[['ct','40'],['ct','41'],['ct','43'],['ct','54'],['ct','55'],['ct','56']]},
 {id:'personalidade',title:'Proteger igualdade e dignidade',refs:[['ct','16'],['ct','24'],['ct','25'],['ct','29']]},
 {id:'teletrabalho',title:'Verificar acordos de teletrabalho',refs:[['ct','165'],['ct','166'],['ct','166-A'],['ct','168']]},
 {id:'estudante',title:'Conciliar trabalho e estudos',refs:[['ct','89'],['ct','90'],['ct','91'],['ct','92']]},
 {id:'principios',title:'Fundamentar a atuação administrativa',refs:[['cpa','1'],['cpa','3'],['cpa','4'],['cpa','5'],['cpa','6'],['cpa','7'],['cpa','8']]},
 {id:'competencia',title:'Verificar competência e imparcialidade',refs:[['cpa','36'],['cpa','44'],['cpa','45'],['cpa','46'],['cpa','69'],['cpa','73']]},
 {id:'procedimento',title:'Instruir e decidir um procedimento',refs:[['cpa','82'],['cpa','86'],['cpa','87'],['cpa','114'],['cpa','121'],['cpa','122'],['cpa','128']]},
 {id:'atos',title:'Distinguir ato, validade e impugnação',refs:[['cpa','148'],['cpa','151'],['cpa','161'],['cpa','163'],['cpa','191'],['cpa','193']]},
 {id:'avaliacao',title:'Preparar o ciclo de avaliação',refs:[['siadap','9'],['siadap','41'],['siadap','47'],['siadap','50'],['siadap','52'],['siadap','55'],['siadap','61'],['siadapram','5'],['siadaplocal','3']]}
];
export function topicReferences(topic,pool,readingSources){const laws=new Set(pool.map(q=>q.law));return topic.refs.filter(([law,article])=>laws.has(law)&&readingSources[law+':'+article]).map(([law,article])=>({law,article,source:readingSources[law+':'+article]}));}
