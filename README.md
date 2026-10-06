# Concurso Study — V0.2 integrada

Uma base única: backup, progresso, adaptação, concursos, lembretes, avatar, ícones, novo visual e banco ampliado. Sem backend nem dependências externas em execução.

## Atualizar no GitHub
1. Extrai o ZIP. Substitui os ficheiros do repositório pelo conteúdo desta pasta; mantém o mesmo endereço GitHub Pages. Faz **Commit changes**.
2. Espera pelo deploy. Abre com Internet; fecha todas as janelas da app e volta a abrir para ativar o cache. Não apagues dados do Safari.
3. Exporta o backup em **Definições**. Segue TESTAR-1-A-1.txt.

Documentação e preview-mobile.jpg podem ficar fora do repositório. Copia todos os scripts, index.html, styles.css, data/, icons/, manifesto e service worker.

## Dados
Mantidos ConcursoStudyDB, versão 1, quatro lojas e IDs antigos. O backup inclui todas as chaves e registos de kv, answers, reviews e competitions, incluindo onboarding e lembretes. A importação valida o ficheiro e substitui tudo numa transação. Após confirmar, descarrega uma cópia do estado atual antes de restaurar. A transação reverte integralmente se falhar.

Acerto = corretas / respostas. Cobertura = perguntas distintas vistas / banco ativo. Domínio recente = acerto ponderado, com meia-vida de 30 dias. Uma única resposta correta pode dar 100% de acerto; cobertura e número de respostas mostram a amostra. IDs suspensos ou ausentes permanecem no histórico e no backup; métricas por matéria usam o banco ativo.

A sessão procura 50% revisões devidas, 30% temas fracos, 20% novas. Sem candidatos suficientes, preenche com outros elegíveis. Não repete IDs na sessão nem perguntas respondidas nas últimas seis horas. Erros regressam após seis horas; acertos após um dia, três dias e intervalos crescentes.

O concurso guarda matérias e pesos, mostra dias até à prova, progresso das matérias e uma meta básica entre 12 e 40 perguntas/dia. Progresso inclui estudo anterior à criação. Disponibilidade depende do banco e do intervalo de repetição. Data passada resulta em plano zero. Matérias sem perguntas ativas não criam conteúdo artificialmente.

## Lembretes sem backend
Em Definições, é possível guardar um lembrete na app e testar uma notificação do sistema. O lembrete é verificado enquanto a app está visível e na reabertura; não acorda a app fechada. O teste depende de suporte, instalação, permissão e service worker ativo.

Para um aviso diário com a app fechada no iPhone, configura uma automação nos Atalhos. O guia está dentro da app. A automação não é instalada automaticamente; a notificação de Atalhos não é um link automático para a PWA. Web Push exige um emissor externo e fica fora da solução sem backend.
Referências: [WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) e [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API).

## Banco jurídico
41 registos: 35 novos, dois antigos conferidos e quatro antigos suspensos para revisão de fonte. Há 37 ativos: CRP 7, CPA 10, LTFP 8, SIADAP-RAM 5, RGPD 7. Incluem conceitos, distinções e casos. É um banco inicial ampliado, não centenas de perguntas nem cobertura integral de qualquer concurso.

Ativos têm artigo, fonte oficial, versão indicada e data de conferência. source-checked significa conferência com a fonte consultada, sem revisão jurídica independente. Matérias regionais usam a redação após o DLR 23/2024/M, incluindo periodicidade anual. Critérios concretos de seleção dependem do aviso e diploma aplicável; a pergunta genérica antiga desse tema ficou suspensa.

Esquema: id, law (ID do diploma), article, topic, subtopic, region, professionalArea, difficulty (1–5), type, prompt, options, correct (índice base zero), explanation, officialSource, legalVersion, lastValidated, validationStatus, suspended. Mantém IDs estáveis. Atualizações jurídicas alteram data/question-bank.js; muda a chave de cache no service worker quando mudar conteúdo.

Fontes: [CRP](https://www.parlamento.pt/Legislacao/Paginas/ConstituicaoRepublicaPortuguesa.aspx), [CPA](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2015-105602322), [LTFP](https://diariodarepublica.pt/dr/legislacao-consolidada/lei/2014-57466875), [SIADAP-RAM](https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-legislativo-regional/2009-874069762), [RGPD](https://eur-lex.europa.eu/eli/reg/2016/679/oj?locale=pt).

Avatar vetorial próprio, ícones PNG 192/512 e Apple 180, animações CSS e onboarding. Respeita a preferência de reduzir movimento. Sem fontes ou imagens remotas.

## Verificação
Consultar VERIFICACAO.txt. Lógica e IndexedDB simulado passaram. Browser local: resposta, fontes, concurso, lembrete, persistência, ecrã 390 px e arranque offline com servidor desligado. iPhone, notificações, Atalhos e GitHub Pages exigem testes reais.
