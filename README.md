# Concurso Study — V0.2 Banco RH

Atualização na mesma V0.2: banco ampliado, perfis nacional/autárquico/regional, programas de referência e matriz de cobertura. PWA local, sem backend nem serviços externos durante o estudo.

## Atualização no GitHub

1. Exportar backup na aplicação atual. Extrair o ZIP.
2. Abrir a pasta concurso-study-v0.2. Carregar **todo o seu conteúdo** para a raiz do mesmo repositório: substituir os iguais e acrescentar os novos. Manter data/ e icons/ como pastas. Fazer commit e esperar pelo deploy do GitHub Pages.
3. Abrir a aplicação com Internet, aguardar o carregamento, fechar todas as janelas da app e reabrir. O novo cache precisa dessa abertura online. Não apagar os dados do navegador.
4. Em Definições, confirmar programa e âmbito. Madeira / RH / Treino geral / Regional: **6 474 perguntas**. Continente / RH / Treino geral / Central: **6 175**. O programa RH — núcleo geral do Continente é mais restrito: **5 032**.
5. Seguir TESTAR-1-A-1.txt e exportar novo backup.

Scripts, HTML, CSS, data/, icons/, manifesto e service-worker são obrigatórios. Documentação e imagens de pré-visualização podem ficar fora do repositório. Não abrir index.html diretamente como ficheiro: usar GitHub Pages ou servidor local.

## Banco e fontes

**7 274 registos: 7 270 ativos e quatro antigos suspensos.** 7 082 exercícios de leitura literal de normas, níveis 1–2; 188 perguntas de conceito/aplicação, incluindo 26 casos de RH acrescentados. Níveis 1/2/3/4/5: 5 061 / 2 099 / 43 / 36 / 31. Não são 7 270 casos complexos.

Inventário: 26 diplomas, 3 292 entradas de artigos e 16 859 segmentos extraídos. Em Leis > Matriz de cobertura, consultar artigos, segmentos, fontes e lacunas. Um artigo com exercício não significa que todas as exceções e conceitos estejam abrangidos. LEVANTAMENTO.md discrimina o banco e as pendências.

Fontes oficiais: Diário da República, Assembleia da República, EUR-Lex, Governo Regional e textos consolidados da PGDL. Data de extração/conferência: 7/10/2026. Cada pergunta indica a versão usada; não existe revisão jurídica independente de todo o banco. source-text-matched comprova correspondência literal do excerto, não interpretação jurídica nem validade de todas as remissões. Os níveis são editoriais.

## Perfis e programas

O âmbito administrativo é distinto da região. Um concurso autárquico na Madeira usa o âmbito Autarquias; o SIADAP-RAM destina-se ao âmbito regional. O perfil central do Continente exclui os diplomas próprios da RAM. Os programas de referência filtram matérias, não reproduzem automaticamente todas as redações vigentes numa data histórica.

DRE — matérias do Aviso 6/2026: 6153 perguntas, 829 unidades.
Funchal — matérias do aviso de 2024: 4142 perguntas, 550 unidades.
RH — núcleo geral do Continente: 5032 perguntas, 674 unidades.

Funchal 2024: referência histórica; o treino autárquico atual inclui DR 7/2026, que substituiu DR 18/2009. DRE 2026: aviso menciona uma orgânica SRE revogada; esse diploma está excluído e exige esclarecimento do júri. Circulares DROT de 2025: catálogo com sete documentos e errata; análise por ponto e casos ainda pendentes. ORAM/execução de 2025 só aparecem no programa DRE e estão identificados como 2025. O núcleo geral contém alterações posteriores ao aviso de janeiro, incluindo CCP; confirmar a data legal exigida pelo júri antes de estudar para essa prova.

## Progresso, percurso e sessão

973 unidades no banco completo, das quais as 28 anteriores conservam IDs e membros. A contagem visível depende do perfil e programa. Há percursos separados de conceitos, leitura e casos de RH, com paginação de 20 unidades e atalho para a próxima disponível. Uma unidade conclui com todas as perguntas vistas e pelo menos 80% corretas. Marcos alcançados permanecem; as últimas respostas mostram o reforço necessário. XP: 10 + 2 × dificuldade, só na primeira resposta correta; cada 200 XP aumenta o nível.

Acerto = corretas/respostas; cobertura pessoal = perguntas distintas vistas/banco elegível; domínio recente = acerto ponderado com meia-vida de 30 dias. Sem respostas, mostrar sem dados. Estas métricas não medem cobertura jurídica nem previsão da nota.

Sessão: aproximadamente 50% revisões devidas, 30% pontos fracos e 20% novas; fallback quando faltam candidatos. Não repete IDs na sessão nem perguntas respondidas há menos de seis horas. Novas distribuem-se pelos diplomas e reservam parte para conceito/aplicação. Concursos guardam âmbito, programa, matérias e pesos; apresentam dias, progresso e meta básica de 12–40 perguntas/dia. Matérias sem perguntas não geram conteúdo.

## Dados, backup e funcionamento offline

Mantidos ConcursoStudyDB versão 1, kv/answers/reviews/competitions e IDs antigos. Backup JSON de todas as chaves e registos; restauro valida e substitui numa transação com reversão em caso de erro. Importar substitui o estado atual; guardar backup antes. Mudanças de perfil filtram as métricas, sem apagar o histórico.

Cache inclui banco, matriz e catálogo; as fontes externas precisam de Internet. Lembretes funcionam enquanto a app está aberta; notificações do dispositivo dependem de suporte/permissão. Para avisos com a app fechada, configurar Atalhos no iPhone conforme o guia da aplicação. Não há envio por backend.

## Verificação

VERIFICACAO.txt regista testes automáticos e navegador local. Estudo e matriz funcionaram com servidor desligado. GitHub Pages publicado, Safari/iPhone, notificações e dados reais do utilizador exigem os testes do guia. O ZIP não inclui dados de teste nem listas nominativas dos anexos.
