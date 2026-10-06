# Concurso Study — v0.1

PWA pessoal, sem backend e sem custos recorrentes, para estudar concursos públicos no iPhone.

## Já incluído

- instalação como web app no iPhone
- funcionamento offline após primeira abertura
- perfil inicial Madeira + Recursos Humanos
- IndexedDB para guardar progresso localmente
- sessão diária
- perguntas de demonstração
- correção e explicação imediata
- repetição espaçada básica
- página de legislação com data de verificação
- página de progresso
- criação de concurso específico
- seleção das legislações desse concurso
- data da prova e contagem decrescente
- filtragem das sessões pelo concurso ativo

## Publicar gratuitamente no GitHub Pages

1. Criar conta em github.com.
2. Criar um repositório público chamado, por exemplo, `concurso-study`.
3. Fazer upload de **todos os ficheiros e pastas** deste pacote para a raiz do repositório.
4. Fazer commit para a branch `main`.
5. Abrir `Settings > Pages`.
6. Em `Build and deployment`, escolher `Deploy from a branch`.
7. Selecionar `main` e `/ (root)` e guardar.
8. Aguardar 1–3 minutos. O GitHub mostra o endereço público da aplicação.

## Instalar no iPhone

1. Abrir esse endereço no Safari.
2. Tocar em `Partilhar`.
3. Escolher `Adicionar ao ecrã principal`.
4. Abrir pelo novo ícone.

## Notificação diária sem servidor

Na app Atalhos do iPhone:

1. `Automação > + > Hora do dia`.
2. Escolher a hora diária pretendida.
3. Adicionar ação `Mostrar notificação` com texto: `Sessão diária de concursos pendente`.
4. Adicionar ação `Abrir URLs` e colocar o endereço GitHub Pages da aplicação.
5. Desativar pedido de confirmação, se o iOS disponibilizar essa opção.

## Próxima versão

- plano automático de estudo até à prova
- banco de perguntas robusto de RH/Madeira
- domínio real por diploma e tema
- simulados
- backup/importação JSON
- versionamento e alertas de legislação
- planos semanais adaptativos
