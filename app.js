import {
  getKV,
  setKV,
  allReviews,
  putReview,
  addAnswer,
  allAnswers,
  allCompetitions,
  putCompetition
} from './db.js';

import { questions } from './data/questions.js';
import { legislation } from './data/legislation.js';
import {
  nextReview,
  buildSession,
  daysUntil
} from './engine.js';


const app = document.querySelector('#app');

const state = {
  view: 'home',

  profile: {
    region: 'Madeira',
    area: 'Recursos Humanos'
  },

  reviews: [],
  answers: [],
  competitions: [],

  session: [],
  index: 0,
  answered: false,
  selected: null
};


const nav = [
  ['home', '⌂', 'Hoje'],
  ['study', '◉', 'Estudar'],
  ['progress', '▥', 'Progresso'],
  ['laws', '§', 'Leis'],
  ['competitions', '◎', 'Concursos'],
  ['settings', '⚙', 'Definições']
];


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

async function init() {

  state.profile =
    (await getKV('profile')) ||
    state.profile;

  await setKV(
    'profile',
    state.profile
  );

  state.reviews =
    await allReviews();

  state.answers =
    await allAnswers();

  state.competitions =
    await allCompetitions();


  if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register(
      './service-worker.js'
    );

  }

  render();

}


/* =========================================================
   HELPERS
========================================================= */

function activeCompetition() {

  return state.competitions.find(
    c => c.active
  );

}


function calcAccuracy() {

  if (!state.answers.length) {
    return 0;
  }

  const correct =
    state.answers.filter(
      a => a.correct
    ).length;

  return Math.round(
    correct /
    state.answers.length *
    100
  );

}


/* =========================================================
   STREAK
========================================================= */

function localDayKey(value) {

  const d =
    value instanceof Date
      ? value
      : new Date(value);

  const year =
    d.getFullYear();

  const month =
    String(
      d.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      d.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;

}


function calcStreak() {

  if (!state.answers.length) {
    return 0;
  }


  /*
    Guardamos apenas os dias em que
    houve pelo menos uma resposta.
  */

  const activeDays =
    new Set(
      state.answers.map(
        answer =>
          localDayKey(
            answer.answeredAt
          )
      )
    );


  let cursor =
    new Date();

  /*
    Usar meio-dia reduz problemas
    relacionados com mudança de hora.
  */

  cursor.setHours(
    12,
    0,
    0,
    0
  );


  /*
    Se ainda não estudaste hoje,
    verificamos ontem.

    Assim a streak não desaparece
    logo de manhã antes de estudares.
  */

  if (
    !activeDays.has(
      localDayKey(cursor)
    )
  ) {

    const yesterday =
      new Date(cursor);

    yesterday.setDate(
      yesterday.getDate() - 1
    );


    if (
      !activeDays.has(
        localDayKey(yesterday)
      )
    ) {

      return 0;

    }


    cursor =
      yesterday;

  }


  let streak = 0;


  while (
    activeDays.has(
      localDayKey(cursor)
    )
  ) {

    streak++;

    cursor.setDate(
      cursor.getDate() - 1
    );

  }


  return streak;

}


/* =========================================================
   SESSÃO DIÁRIA
========================================================= */

function todaySession() {

  const competition =
    activeCompetition();


  return buildSession(
    questions,
    state.reviews,
    state.profile.region,
    12,
    competition?.legislationIds ||
      null
  );

}


function startStudy() {

  state.session =
    todaySession();

  state.index = 0;

  state.answered = false;

  state.selected = null;

  state.view = 'study';

  render();

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function navigate(view) {

  if (view === 'study') {

    startStudy();

    return;

  }


  state.view = view;

  render();

}


function shell(content) {

  return `
    <div class="shell">

      ${content}

    </div>

    ${
      state.view !== 'study'
        ? bottomNav()
        : ''
    }
  `;

}


function bottomNav() {

  return `
    <nav class="bottom">

      ${
        nav
          .map(
            ([id, icon, label]) => `

              <button
                class="nav ${
                  state.view === id
                    ? 'active'
                    : ''
                }"
                data-nav="${id}"
              >

                <span class="ico">
                  ${icon}
                </span>

                <span class="label">
                  ${label}
                </span>

              </button>

            `
          )
          .join('')
      }

    </nav>
  `;

}


function top(
  eyebrow,
  title
) {

  const today =
    new Intl.DateTimeFormat(
      'pt-PT',
      {
        day: '2-digit',
        month: 'short'
      }
    ).format(
      new Date()
    );


  return `
    <header class="top">

      <div>

        <p class="eyebrow">
          ${eyebrow}
        </p>

        <h1>
          ${title}
        </h1>

      </div>

      <span class="chip">
        ${today}
      </span>

    </header>
  `;

}


/* =========================================================
   PÁGINA INICIAL
========================================================= */

function home() {

  const session =
    todaySession();

  const accuracy =
    calcAccuracy();

  const due =
    state.reviews.filter(
      review =>
        new Date(
          review.dueAt
        ) <= new Date()
    ).length;

  const competition =
    activeCompetition();

  const streak =
    calcStreak();


  return shell(`

    ${top(
      `${state.profile.area} · ${state.profile.region}`,
      'Hoje'
    )}


    <section class="hero">

      <div>

        <p
          class="eyebrow"
          style="color:#bbb"
        >
          Sessão diária
        </p>

        <h2>
          ${session.length || 6}
          perguntas
        </h2>

        <p>
          ~8 minutos
        </p>

      </div>


      <button
        class="btn btn-light"
        id="start"
      >
        Começar →
      </button>

    </section>


    <div class="stats">

      <div class="stat">

        <strong>
          ${streak}
          ${
            streak === 1
              ? 'dia'
              : 'dias'
          }
        </strong>

        <span>
          streak
        </span>

      </div>


      <div class="stat">

        <strong>
          ${due}
        </strong>

        <span>
          revisões
        </span>

      </div>


      <div class="stat">

        <strong>
          ${accuracy}%
        </strong>

        <span>
          acerto
        </span>

      </div>

    </div>


    ${
      competition
        ? `

          <div class="panel">

            <p class="eyebrow">
              Concurso ativo
            </p>

            <h3>
              ${competition.title}
            </h3>

            <p class="muted">

              ${competition.entity}

              ·

              ${
                daysUntil(
                  competition.examDate
                )
              }
              dias até à prova

            </p>

          </div>

        `
        : ''
    }


    <div class="section-title">

      <p class="eyebrow">
        Mapa de domínio
      </p>

      <h3>
        Matérias principais
      </h3>

    </div>


    ${
      [
        ['CPA', 82],
        ['LTFP', 74],
        ['SIADAP-RAM', 63],
        ['Procedimento concursal', 79],
        ['RGPD', 71]
      ]
        .map(
          ([name, value]) => `

            <div class="row">

              <div>

                <strong>
                  ${name}
                </strong>

                <span class="muted">
                  revisão adaptativa
                </span>

              </div>


              <div class="bar">

                <span
                  style="width:${value}%"
                ></span>

              </div>

            </div>

          `
        )
        .join('')
    }

  `);

}


/* =========================================================
   ESTUDO
========================================================= */

function study() {

  if (
    !state.session.length
  ) {

    state.session =
      todaySession();

  }


  const question =
    state.session[
      state.index
    ];


  if (!question) {

    return shell(`

      <div class="empty">

        <h2>
          Sessão concluída.
        </h2>

        <button
          class="btn btn-dark"
          data-nav="home"
        >
          Voltar
        </button>

      </div>

    `);

  }


  const law =
    legislation.find(
      item =>
        item.id ===
        question.law
    );


  const progress =
    (
      (
        state.index + 1
      ) /
      state.session.length
    ) *
    100;


  return shell(`

    <div class="quiz-top">

      <button
        class="btn btn-ghost"
        data-nav="home"
      >
        Fechar
      </button>


      <div class="meter">

        <span
          style="width:${progress}%"
        ></span>

      </div>


      <span class="muted">

        ${state.index + 1}
        /
        ${state.session.length}

      </span>

    </div>


    <section class="quiz">

      <p class="eyebrow">

        ${law?.short || ''}

        · nível

        ${question.difficulty}

      </p>


      <h2>
        ${question.prompt}
      </h2>


      <div class="options">

        ${
          question.options
            .map(
              (
                option,
                index
              ) => {

                let cssClass =
                  'option';


                if (
                  state.answered
                ) {

                  if (
                    index ===
                    question.correct
                  ) {

                    cssClass +=
                      ' correct';

                  }

                  else if (
                    index ===
                    state.selected
                  ) {

                    cssClass +=
                      ' wrong';

                  }

                }


                return `

                  <button
                    class="${cssClass}"
                    data-answer="${index}"
                  >

                    <b>
                      ${
                        String
                          .fromCharCode(
                            65 + index
                          )
                      }
                    </b>

                    ${option}

                  </button>

                `;

              }
            )
            .join('')
        }

      </div>


      ${
        state.answered
          ? `

            <div class="explain">

              <strong>
                Explicação
              </strong>


              <p>
                ${question.explanation}
              </p>


              ${
                question.article
                  ? `

                    <div class="legal">

                      ${question.article}

                    </div>

                  `
                  : ''
              }


              <button
                class="btn btn-dark"
                id="next"
              >
                Continuar →
              </button>

            </div>

          `
          : ''
      }

    </section>

  `);

}


/* =========================================================
   PROGRESSO
========================================================= */

function progress() {

  const accuracy =
    calcAccuracy();


  return shell(`

    ${top(
      'Evolução',
      'Progresso'
    )}


    <div class="hero">

      <div>

        <p
          class="eyebrow"
          style="color:#bbb"
        >
          Acerto global
        </p>


        <h2>
          ${accuracy}%
        </h2>


        <p>
          ${state.answers.length}
          respostas registadas
        </p>

      </div>

    </div>


    <div class="panel">

      <h3>
        Estrutura pronta
      </h3>

      <p class="muted">
        A próxima versão calcula
        domínio por diploma,
        tema, dificuldade,
        erro e tempo de resposta.
      </p>

    </div>

  `);

}


/* =========================================================
   LEGISLAÇÃO
========================================================= */

function laws() {

  return shell(`

    ${top(
      'Base jurídica',
      'Legislação'
    )}


    <div class="grid">

      ${
        legislation
          .map(
            law => `

              <div class="panel law">

                <p class="eyebrow">
                  ${law.region}
                </p>


                <h3>
                  ${law.short}
                </h3>


                <div>
                  ${law.title}
                </div>


                <small>
                  ${law.diploma}
                </small>


                <div class="status">

                  Verificado em

                  ${law.verified}

                  ·

                  ${law.source}

                </div>

              </div>

            `
          )
          .join('')
      }

    </div>

  `);

}


/* =========================================================
   CONCURSOS
========================================================= */

function competitions() {

  const items =
    state.competitions
      .map(
        competition => `

          <div class="panel">

            <p class="eyebrow">

              ${
                competition.active
                  ? 'Ativo'
                  : 'Arquivado'
              }

            </p>


            <h3>
              ${competition.title}
            </h3>


            <p>
              ${competition.entity}
            </p>


            <span class="badge">

              ${
                daysUntil(
                  competition.examDate
                )
              }
              dias

            </span>

          </div>

        `
      )
      .join('');


  return shell(`

    ${top(
      'Preparação específica',
      'Concursos'
    )}


    <div class="panel">

      <h3>
        Adicionar concurso
      </h3>


      <form
        class="form"
        id="competitionForm"
      >

        <label>
          Cargo / vaga
        </label>

        <input
          name="title"
          required
          placeholder="Técnico Superior — RH"
        />


        <label>
          Entidade
        </label>

        <input
          name="entity"
          required
          placeholder="Direção Regional de Educação"
        />


        <label>
          Data da prova
        </label>

        <input
          name="examDate"
          required
          type="date"
        />


        <label>
          Legislação
        </label>


        <select
          name="laws"
          multiple
          size="6"
        >

          ${
            legislation
              .map(
                law => `

                  <option
                    value="${law.id}"
                  >

                    ${law.short}
                    —
                    ${law.title}

                  </option>

                `
              )
              .join('')
          }

        </select>


        <button
          class="btn btn-dark"
          style="margin-top:14px"
        >
          Guardar concurso
        </button>

      </form>

    </div>


    ${items}

  `);

}


/* =========================================================
   DEFINIÇÕES
========================================================= */

function settings() {

  return shell(`

    ${top(
      'Aplicação',
      'Definições'
    )}


    <div class="panel">

      <h3>
        Perfil
      </h3>


      <form
        class="form"
        id="profileForm"
      >

        <label>
          Região
        </label>


        <select
          name="region"
        >

          <option
            ${
              state.profile.region ===
              'Madeira'
                ? 'selected'
                : ''
            }
          >
            Madeira
          </option>


          <option
            ${
              state.profile.region ===
              'Continente'
                ? 'selected'
                : ''
            }
          >
            Continente
          </option>


          <option
            ${
              state.profile.region ===
              'Açores'
                ? 'selected'
                : ''
            }
          >
            Açores
          </option>

        </select>


        <label>
          Área
        </label>


        <select
          name="area"
        >

          <option
            ${
              state.profile.area ===
              'Recursos Humanos'
                ? 'selected'
                : ''
            }
          >
            Recursos Humanos
          </option>


          <option
            ${
              state.profile.area ===
              'Gestão Financeira'
                ? 'selected'
                : ''
            }
          >
            Gestão Financeira
          </option>


          <option
            ${
              state.profile.area ===
              'Administração'
                ? 'selected'
                : ''
            }
          >
            Administração
          </option>


          <option
            ${
              state.profile.area ===
              'Educação'
                ? 'selected'
                : ''
            }
          >
            Educação
          </option>


          <option
            ${
              state.profile.area ===
              'Jurídico'
                ? 'selected'
                : ''
            }
          >
            Jurídico
          </option>

        </select>


        <button
          class="btn btn-dark"
          style="margin-top:14px"
        >
          Guardar
        </button>

      </form>

    </div>


    <div class="panel">

      <h3>
        Dados locais
      </h3>


      <p class="muted">

        O progresso fica guardado
        no iPhone através de IndexedDB.

        Backup/exportação entra
        numa versão posterior.

      </p>

    </div>

  `);

}


/* =========================================================
   RENDER
========================================================= */

function render() {

  if (
    state.view === 'home'
  ) {

    app.innerHTML =
      home();

  }

  else if (
    state.view === 'study'
  ) {

    app.innerHTML =
      study();

  }

  else if (
    state.view === 'progress'
  ) {

    app.innerHTML =
      progress();

  }

  else if (
    state.view === 'laws'
  ) {

    app.innerHTML =
      laws();

  }

  else if (
    state.view ===
    'competitions'
  ) {

    app.innerHTML =
      competitions();

  }

  else {

    app.innerHTML =
      settings();

  }


  bind();

}


/* =========================================================
   EVENTOS
========================================================= */

function bind() {

  document
    .querySelectorAll(
      '[data-nav]'
    )
    .forEach(
      button => {

        button.onclick =
          () =>
            navigate(
              button.dataset.nav
            );

      }
    );


  document
    .querySelector(
      '#start'
    )
    ?.addEventListener(
      'click',
      startStudy
    );


  document
    .querySelectorAll(
      '[data-answer]'
    )
    .forEach(
      button => {

        button.onclick =
          () =>
            answer(
              Number(
                button.dataset.answer
              )
            );

      }
    );


  document
    .querySelector(
      '#next'
    )
    ?.addEventListener(
      'click',
      () => {

        state.index++;

        state.answered =
          false;

        state.selected =
          null;

        render();

      }
    );


  document
    .querySelector(
      '#profileForm'
    )
    ?.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const form =
          new FormData(
            event.target
          );


        state.profile = {

          region:
            form.get(
              'region'
            ),

          area:
            form.get(
              'area'
            )

        };


        await setKV(
          'profile',
          state.profile
        );


        render();

      }
    );


  document
    .querySelector(
      '#competitionForm'
    )
    ?.addEventListener(
      'submit',
      async event => {

        event.preventDefault();


        const form =
          new FormData(
            event.target
          );


        const selected = [

          ...event
            .target
            .elements
            .laws
            .selectedOptions

        ].map(
          option =>
            option.value
        );


        /*
          Apenas um concurso ativo.
        */

        for (
          const competition
          of state.competitions
        ) {

          if (
            competition.active
          ) {

            competition.active =
              false;

            await putCompetition(
              competition
            );

          }

        }


        const competition = {

          id:
            crypto.randomUUID(),

          title:
            form.get(
              'title'
            ),

          entity:
            form.get(
              'entity'
            ),

          examDate:
            form.get(
              'examDate'
            ),

          region:
            state.profile.region,

          legislationIds:
            selected,

          active:
            true,

          createdAt:
            new Date()
              .toISOString()

        };


        await putCompetition(
          competition
        );


        state.competitions =
          await allCompetitions();


        render();

      }
    );

}


/* =========================================================
   RESPOSTAS
========================================================= */

async function answer(index) {

  if (
    state.answered
  ) {
    return;
  }


  const question =
    state.session[
      state.index
    ];


  const correct =
    index ===
    question.correct;


  state.selected =
    index;

  state.answered =
    true;


  await addAnswer({

    questionId:
      question.id,

    correct,

    answeredAt:
      new Date()
        .toISOString()

  });


  const current =
    state.reviews.find(
      review =>
        review.questionId ===
        question.id
    );


  await putReview(

    nextReview(
      current,
      correct,
      question.id
    )

  );


  state.reviews =
    await allReviews();

  state.answers =
    await allAnswers();


  render();

}


/* =========================================================
   START
========================================================= */

init();
