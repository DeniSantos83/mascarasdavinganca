// =====================
// MÁSCARAS DA VINGANÇA
// game.js (COMPLETO)
// Fernanda Sena (Jornalista investigativa)
// Messias Santos (Policial reformado)
// Caso 01 (Crime 1) — Praça Fausto Cardoso
// =====================

// ------------------
// Personagens
// ------------------
const CHARACTERS = {
  fernanda: {
    id: "fernanda",
    name: "Fernanda Sena",
    role: "Jornalista investigativa",
    stats: { life: 10, sanity: 12, focus: 12, rep: 9 },
    skills: [
      { key: "persuasao", label: "Persuasão (+2) — abre portas na conversa" },
      { key: "observacao", label: "Observação (+2) — vê padrões e contradições" },
      { key: "fontes", label: "Rede de Fontes (+2) — contatos, vazamentos e bastidores" },
      { key: "instinto", label: "Instinto de Notícia (+1) — fareja pista vs. armadilha" }
    ],
    startingItems: ["gravador", "caderno", "celular"]
  },

  messias: {
    id: "messias",
    name: "Messias Santos",
    role: "Policial reformado",
    stats: { life: 13, sanity: 10, focus: 10, rep: 7 },
    skills: [
      { key: "procedimento", label: "Procedimento (+2) — isola, preserva e reduz falhas" },
      { key: "interrogatorio", label: "Interrogatório (+2) — pressiona sem perder o controle" },
      { key: "tatico", label: "Tático (+2) — leitura de risco, cobertura, aproximação" },
      { key: "rua", label: "Olho de Rua (+1) — percebe movimentos e gente fora do lugar" }
    ],
    startingItems: ["caderno", "radio", "lanterna"]
  }
};

// ------------------
// Estado do jogo
// ------------------
const DEFAULT_STATE = {
  player: null, // { id, name, role, stats, skills, items, clues, heat }
  case: {
    id: "case01",
    title: "Praça Fausto Cardoso",
    day: 1,
    suspects: 2,
    flags: {}
  },
  log: [],
  sceneId: null
};

let state = structuredClone(DEFAULT_STATE);

// ------------------
// Elementos UI (IDs devem existir no index.html)
// ------------------
const screenStart = document.getElementById("screenStart");
const screenGame = document.getElementById("screenGame");

const panelSelect = document.getElementById("panelSelect");
const btnChoose = document.getElementById("btnChoose");
const btnClose = document.getElementById("btnClose");
const btnConfirm = document.getElementById("btnConfirm");
const btnContinue = document.getElementById("btnContinue");

const pillName = document.getElementById("pillName");
const pillRole = document.getElementById("pillRole");
const stLife = document.getElementById("stLife");
const stSanity = document.getElementById("stSanity");
const stFocus = document.getElementById("stFocus");
const stRep = document.getElementById("stRep");
const skillsList = document.getElementById("skillsList");
const startHint = document.getElementById("startHint");

const hudChar = document.getElementById("hudChar");
const hudStats = document.getElementById("hudStats");
const btnRestart = document.getElementById("btnRestart");

const sceneTitle = document.getElementById("sceneTitle");
const sceneText = document.getElementById("sceneText");
const choicesEl = document.getElementById("choices");

// ------------------
// Seleção de personagem
// ------------------
let selectedCharId = null;

btnChoose?.addEventListener("click", () => {
  panelSelect?.setAttribute("aria-hidden", "false");
});

btnClose?.addEventListener("click", () => {
  panelSelect?.setAttribute("aria-hidden", "true");
});

document.querySelectorAll(".charCard").forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.char;
    selectedCharId = id;

    document.querySelectorAll(".charCard").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");

    renderSheet(id);
    if (btnConfirm) btnConfirm.disabled = false;
  });
});

btnConfirm?.addEventListener("click", () => {
  if (!selectedCharId) return;

  const base = CHARACTERS[selectedCharId];

  state.player = {
    id: base.id,
    name: base.name,
    role: base.role,
    stats: { ...base.stats },
    skills: base.skills.map((s) => ({ ...s })),
    items: [...base.startingItems],
    clues: [],
    heat: 0
  };

  state.sceneId = "case01_intro";
  state.log.push(`Personagem escolhido: ${state.player.name}`);

  if (btnContinue) btnContinue.disabled = false;
  panelSelect?.setAttribute("aria-hidden", "true");

  if (startHint) startHint.textContent = "Escolha confirmada. Você pode continuar.";
  btnContinue?.focus();
});

btnContinue?.addEventListener("click", () => {
  if (!state.player) return;
  startGame();
});

btnRestart?.addEventListener("click", () => {
  state = structuredClone(DEFAULT_STATE);
  selectedCharId = null;

  if (btnContinue) btnContinue.disabled = true;
  if (btnConfirm) btnConfirm.disabled = true;

  document.querySelectorAll(".charCard").forEach((b) => b.classList.remove("selected"));
  renderSheet(null);

  if (screenGame) screenGame.hidden = true;
  if (screenStart) screenStart.hidden = false;
});

// ------------------
// Render ficha
// ------------------
function renderSheet(id) {
  if (!pillName || !pillRole || !stLife || !stSanity || !stFocus || !stRep || !skillsList || !startHint) return;

  if (!id) {
    pillName.textContent = "Nome: —";
    pillRole.textContent = "Profissão: —";
    stLife.textContent = "—";
    stSanity.textContent = "—";
    stFocus.textContent = "—";
    stRep.textContent = "—";
    skillsList.innerHTML = `<span class="chip">—</span>`;
    startHint.textContent = "Selecione um personagem para liberar “Continuar”.";
    return;
  }

  const c = CHARACTERS[id];
  pillName.textContent = `Nome: ${c.name}`;
  pillRole.textContent = `Profissão: ${c.role}`;
  stLife.textContent = String(c.stats.life);
  stSanity.textContent = String(c.stats.sanity);
  stFocus.textContent = String(c.stats.focus);
  stRep.textContent = String(c.stats.rep);

  skillsList.innerHTML = "";
  for (const sk of c.skills) {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = sk.label;
    skillsList.appendChild(span);
  }

  startHint.textContent = "Dica: suas skills abrem opções exclusivas durante a investigação.";
}

// ------------------
// HUD
// ------------------
function updateHudStats() {
  if (!state.player || !hudStats) return;
  const { life, sanity, focus, rep } = state.player.stats;
  hudStats.textContent = `Vida ${life} | Sanidade ${sanity} | Foco ${focus} | Reputação ${rep} | Calor ${state.player.heat}`;
}

// ------------------
// Utilidades
// ------------------
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hasSkill(key) {
  return !!state.player?.skills?.some((s) => s.key === key);
}

function skillBonus(keys) {
  // Se tiver qualquer skill listada -> +1 (simples, consistente e rápido)
  const owned = new Set((state.player?.skills || []).map((s) => s.key));
  return keys.some((k) => owned.has(k)) ? 1 : 0;
}

function gainClue(text) {
  if (!state.player) return;
  if (!state.player.clues.includes(text)) {
    state.player.clues.push(text);
    state.log.push(`Pista: ${text}`);
  }
}

function softNarrate(msg) {
  if (!sceneText) return;
  sceneText.textContent += `\n\n— ${msg}`;
}

function hardFail(msg) {
  if (!sceneText || !choicesEl) return;
  sceneText.textContent += `\n\n☠️ ${msg}`;
  choicesEl.innerHTML = "";
  addChoice("Recomeçar", () => btnRestart?.click());
}

function addChoice(label, onClick, style) {
  if (!choicesEl) return;
  const b = document.createElement("button");
  b.textContent = label;
  b.className = style === "danger" ? "danger" : "primary";
  b.addEventListener("click", onClick);
  choicesEl.appendChild(b);
}

// ======================
// MOTOR DE CENAS + DADOS
// ======================
function rollD6() {
  return 1 + Math.floor(Math.random() * 6);
}

function testCheck({ label, skillKeys = [], difficulty = 4 }) {
  const base = rollD6();
  const bonus = skillBonus(skillKeys);
  const total = base + bonus;

  const ok = total >= difficulty;
  state.log.push(`Teste: ${label} | d6=${base} + bonus=${bonus} => ${total} (>=${difficulty}? ${ok})`);
  return { ok, total, base, bonus, difficulty };
}

function gotoScene(id) {
  state.sceneId = id;
  renderScene();
}

function setChoices(choices) {
  if (!choicesEl) return;

  choicesEl.innerHTML = "";

  for (const ch of choices) {
    if (ch.requireClue && !state.player?.clues?.includes(ch.requireClue)) continue;
    if (ch.requireItem && !state.player?.items?.includes(ch.requireItem)) continue;
    if (ch.requireSkill && !hasSkill(ch.requireSkill)) continue;

    const btn = document.createElement("button");
    btn.textContent = ch.label;
    btn.className = ch.style === "danger" ? "danger" : "primary";
    btn.addEventListener("click", () => ch.onClick());
    choicesEl.appendChild(btn);
  }
}

function renderScene() {
  const scene = CRIME1_SCENES[state.sceneId];
  if (!sceneTitle || !sceneText) return;

  if (!scene) {
    sceneTitle.textContent = "Cena não encontrada";
    sceneText.textContent = "Algo deu errado no roteiro do Caso 01.";
    if (choicesEl) choicesEl.innerHTML = "";
    return;
  }

  sceneTitle.textContent = scene.title;
  sceneText.textContent = typeof scene.text === "function" ? scene.text(state) : scene.text;

  const choices = typeof scene.choices === "function" ? scene.choices(state) : scene.choices;
  setChoices(choices);

  updateHudStats();
}

function endCase1Success(msg) {
  if (!sceneText || !choicesEl) return;
  sceneText.textContent += `\n\n✅ ${msg}\n\n(Encerrando Caso 01 — pronto para o Caso 02.)`;
  choicesEl.innerHTML = "";
  addChoice("Ir para o próximo caso (a gente liga depois)", () => {
    softNarrate("Em breve: Caso 02 — Leste Companhia Ferroviária.");
  });
}

function endCase1Fail(msg) {
  hardFail(msg + " O Caso 01 escapa das suas mãos.");
}

// ======================
// CASO 01 — CRIME 1
// Praça Fausto Cardoso
// ======================
const CLUES = {
  PALHA: "Mãos amarradas com palha de cana seca.",
  CACHACA: "Garrafas de cachaça vazias — com digitais em sangue.",
  ARRASTO: "Marcas de arrasto: a vítima foi trazida para a praça.",
  NAO_MORTE_LOCAL: "Indícios fortes: não morreu no local (cena montada).",
  CARRO_SEM_FAROIS: "Testemunha: carro saiu sem faróis perto do horário.",
  CAMERA_PREFEITURA: "Câmera: veículo estaciona rápido e some em rua lateral.",
  NOME_VITIMA: "Identificação: Augusto Frederico Martins Fontes.",
  PADRAO_MENSAGEM: "Mensagem simbólica: cana + sangue + álcool = 'dívida antiga'.",
  AMEACA: "Aviso velado: 'pare de cavar' (ameaça indireta)."
};

const CRIME1_SCENES = {
  case01_intro: {
    title: "Caso 01 — Praça Fausto Cardoso (Manhã)",
    text: () => {
      return [
        "Manhã em Aracaju. O centro acorda com calor e pressa.",
        "A Praça Fausto Cardoso costuma ser vitrine de poder antigo.",
        "Hoje, vira palco.",
        "",
        "Um homem é encontrado desacordado em um banco. No começo, pensam ser um morador de rua.",
        "As roupas desmentem. O murmúrio cresce. Sirenes se aproximam.",
        "",
        "Você chega. E sente: isso não é só um crime.",
        "É uma mensagem."
      ].join("\n");
    },
    choices: () => ([
      {
        label: "Isolar a área e observar a cena primeiro",
        onClick: () => gotoScene("case01_scene_observar")
      },
      {
        label: "Falar com testemunhas (rápido)",
        onClick: () => gotoScene("case01_scene_testemunhas")
      },
      {
        label: "Checar sinais imediatos (roupas, odores, postura, entorno)",
        onClick: () => gotoScene("case01_scene_tecnico")
      },
      {
        label: "Aproximar demais para ver o rosto (arriscado)",
        style: "danger",
        onClick: () => gotoScene("case01_scene_erro")
      }
    ])
  },

  case01_scene_observar: {
    title: "Cena do Crime — Primeiro olhar",
    text: () => [
      "Você segura a pressa. Olha o que a cidade não olha.",
      "O banco, o corpo, o entorno. Nada ali parece “casual”.",
      "",
      "A praça inteira parece assistir."
    ].join("\n"),
    choices: () => {
      if (!state.player?.clues?.includes(CLUES.PALHA)) gainClue(CLUES.PALHA);
      state.player.stats.focus = clamp(state.player.stats.focus + 1, 0, 20);

      return [
        {
          label: "Examinar amarrações e mãos (com cuidado)",
          onClick: () => gotoScene("case01_scene_amarracao")
        },
        {
          label: "Examinar garrafas e a disposição ao redor",
          onClick: () => gotoScene("case01_scene_garrafas")
        },
        {
          label: "Pedir perímetro maior (mais controle, mais atenção em você)",
          onClick: () => {
            state.player.heat = clamp(state.player.heat + 1, 0, 10);
            softNarrate("Você assume o controle. Isso chama atenção.");
            gotoScene("case01_scene_fluxo");
          }
        }
      ];
    }
  },

  case01_scene_amarracao: {
    title: "Amarrações — Palha de cana seca",
    text: () => [
      "A palha é áspera, seca demais para “aparecer” ali sozinha.",
      "Você vê o nó. Vê as fibras. Vê a intenção.",
      "",
      "Isso não é improviso. É símbolo."
    ].join("\n"),
    choices: () => ([
      {
        label: "Interpretar o símbolo (cana no centro?)",
        onClick: () => {
          const t = testCheck({
            label: "Interpretar simbolismo",
            skillKeys: ["observacao", "instinto", "rua"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue(CLUES.PADRAO_MENSAGEM);
            softNarrate("O recado aparece: açúcar, terra, sangue, dívida.");
          } else {
            state.player.stats.sanity = clamp(state.player.stats.sanity - 1, 0, 20);
            softNarrate("A cena te encara de volta. Você sente que falta uma peça.");
          }
          gotoScene("case01_scene_fluxo");
        }
      },
      {
        label: "Apertar os nós e ler o método (tático/polícia)",
        requireSkill: "tatico",
        onClick: () => {
          const t = testCheck({
            label: "Ler método pelos nós e posição do corpo",
            skillKeys: ["tatico", "procedimento"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue("Nó firme e limpo: quem amarrou sabia o que fazia e teve tempo.");
            state.player.stats.focus = clamp(state.player.stats.focus + 1, 0, 20);
            softNarrate("Isso foi feito com calma. O assassino não teve pressa.");
          } else {
            state.player.heat = clamp(state.player.heat + 1, 0, 10);
            softNarrate("Você se expõe demais na cena. Gente demais te observa.");
          }
          gotoScene("case01_scene_fluxo");
        }
      },
      {
        label: "Voltar e examinar garrafas",
        onClick: () => gotoScene("case01_scene_garrafas")
      }
    ])
  },

  case01_scene_garrafas: {
    title: "Garrafas — Sangue e digitais",
    text: () => [
      "As garrafas vazias estão posicionadas como moldura.",
      "Em mais de uma, há marcas de dedos… em sangue.",
      "O sangue parece usado como tinta.",
      "",
      "Quem fez isso queria ser entendido."
    ].join("\n"),
    choices: () => {
      if (!state.player?.clues?.includes(CLUES.CACHACA)) gainClue(CLUES.CACHACA);

      return [
        {
          label: "Buscar marcas de arrasto ao redor do banco",
          onClick: () => gotoScene("case01_scene_arrasto")
        },
        {
          label: "Preservar evidência sem contaminar (procedimento)",
          onClick: () => {
            const t = testCheck({
              label: "Preservar evidência sem contaminar",
              skillKeys: ["procedimento", "tatico"],
              difficulty: 4
            });

            if (t.ok) {
              gainClue("Evidência preservada: digitais em sangue catalogadas e fotografadas.");
              state.player.stats.rep = clamp(state.player.stats.rep + 1, 0, 20);
              softNarrate("Você ganha respeito e evita contaminação.");
            } else {
              state.player.stats.rep = clamp(state.player.stats.rep - 1, 0, 20);
              state.player.heat = clamp(state.player.heat + 1, 0, 10);
              softNarrate("Um empurra-empurra. Uma marca se perde.");
            }
            gotoScene("case01_scene_fluxo");
          }
        },
        {
          label: "Pedir o IML imediatamente",
          onClick: () => gotoScene("case01_scene_iml")
        }
      ];
    }
  },

  case01_scene_arrasto: {
    title: "Chão — Marcas de arrasto",
    text: () => [
      "No calor do centro, a poeira denuncia o caminho.",
      "Há marcas: algo pesado foi puxado até o banco.",
      "",
      "Ele não caiu ali. Ele foi colocado."
    ].join("\n"),
    choices: () => {
      if (!state.player?.clues?.includes(CLUES.ARRASTO)) gainClue(CLUES.ARRASTO);

      return [
        {
          label: "Seguir discretamente o rastro (rua lateral)",
          onClick: () => {
            const t = testCheck({
              label: "Seguir rastro sem se expor",
              skillKeys: ["rua", "tatico", "observacao"],
              difficulty: 4
            });

            if (t.ok) {
              gainClue("O rastro morre perto de uma parada rápida (veículo).");
              gotoScene("case01_scene_camera");
            } else {
              state.player.heat = clamp(state.player.heat + 2, 0, 10);
              softNarrate("Você anda demais. Olhares demais. Você vira assunto.");
              gotoScene("case01_scene_ameaca");
            }
          }
        },
        {
          label: "Voltar e priorizar testemunhas",
          onClick: () => gotoScene("case01_scene_testemunhas")
        },
        {
          label: "Ir direto ao IML (garantir laudo cedo)",
          onClick: () => gotoScene("case01_scene_iml")
        }
      ];
    }
  },

  case01_scene_testemunhas: {
    title: "Testemunhas — Boca fechada",
    text: () => [
      "Você se aproxima das pessoas certas: quem viu, quem finge que não viu,",
      "quem vende café e quem só observa o centro como se fosse uma arena.",
      "",
      "Aracaju fala baixo quando sobrenome está no meio."
    ].join("\n"),
    choices: () => ([
      {
        label: "Puxar conversa com tato (persuasão/fontes)",
        onClick: () => {
          const t = testCheck({
            label: "Extrair informação sem provocar recuo",
            skillKeys: ["persuasao", "fontes", "observacao"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue(CLUES.CARRO_SEM_FAROIS);
            softNarrate("Uma testemunha descreve: carro escuro, saída sem faróis, rua lateral.");
            gotoScene("case01_scene_camera");
          } else {
            state.player.stats.rep = clamp(state.player.stats.rep - 1, 0, 20);
            state.player.heat = clamp(state.player.heat + 1, 0, 10);
            softNarrate("Medo + lealdade + silêncio. Você sente a parede.");
            gotoScene("case01_scene_fluxo");
          }
        }
      },
      {
        label: "Acionar rede de fontes (exclusivo Fernanda)",
        requireSkill: "fontes",
        onClick: () => {
          gainClue("Fonte anônima: 'isso tem a ver com terra antiga e família grande'.");
          state.player.stats.focus = clamp(state.player.stats.focus + 1, 0, 20);
          softNarrate("Você consegue uma frase que não deveria existir.");
          gotoScene("case01_scene_fluxo");
        }
      },
      {
        label: "Pressionar direto (interrogatório / Messias)",
        requireSkill: "interrogatorio",
        onClick: () => {
          const t = testCheck({
            label: "Pressão controlada em testemunha",
            skillKeys: ["interrogatorio", "rua", "tatico"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue(CLUES.CARRO_SEM_FAROIS);
            gainClue("Detalhe: alguém no banco anotava nomes e observava de longe.");
            softNarrate("Você separa o nervoso do mentiroso.");
            gotoScene("case01_scene_camera");
          } else {
            state.player.heat = clamp(state.player.heat + 2, 0, 10);
            softNarrate("Você força demais. A praça vira contra você.");
            gotoScene("case01_scene_ameaca");
          }
        }
      },
      {
        label: "Registrar depoimentos discretamente (gravador)",
        requireItem: "gravador",
        onClick: () => {
          gainClue("Áudio: ruídos + um nome sussurrado (incompleto) + 'Fausto Cardoso de novo…'.");
          state.player.stats.focus = clamp(state.player.stats.focus + 1, 0, 20);
          gotoScene("case01_scene_fluxo");
        }
      }
    ])
  },

  case01_scene_tecnico: {
    title: "Sinais imediatos — O crime não é só visual",
    text: () => [
      "Você busca o que não aparece em foto:",
      "odor, rigidez, saliva, marcas nos pulsos, poeira na roupa.",
      "",
      "A cidade corre. Você reconstrói."
    ].join("\n"),
    choices: () => ([
      {
        label: "Inferir deslocamento e dinâmica do crime",
        onClick: () => {
          const t = testCheck({
            label: "Inferir deslocamento e dinâmica do crime",
            skillKeys: ["procedimento", "rua", "observacao"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue(CLUES.NAO_MORTE_LOCAL);
            softNarrate("O álcool foi forçado. A cena foi montada depois.");
            gotoScene("case01_scene_iml");
          } else {
            state.player.stats.sanity = clamp(state.player.stats.sanity - 1, 0, 20);
            softNarrate("Você não confirma o essencial ainda. Algo escapa.");
            gotoScene("case01_scene_fluxo");
          }
        }
      },
      {
        label: "Buscar câmeras próximas (prefeitura/comércio)",
        onClick: () => gotoScene("case01_scene_camera")
      },
      {
        label: "Voltar para testemunhas",
        onClick: () => gotoScene("case01_scene_testemunhas")
      }
    ])
  },

  case01_scene_camera: {
    title: "Câmeras — A cidade tem olhos",
    text: () => [
      "Você procura a verdade nos ângulos frios:",
      "câmeras da prefeitura, bancos, comércio e trânsito.",
      "",
      "Nem sempre dá pra acessar. Nem sempre alguém quer ajudar."
    ].join("\n"),
    choices: () => ([
      {
        label: "Pedir imagens oficialmente (procedimento)",
        onClick: () => {
          const t = testCheck({
            label: "Acesso oficial",
            skillKeys: ["procedimento"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue(CLUES.CAMERA_PREFEITURA);
            state.player.stats.rep = clamp(state.player.stats.rep + 1, 0, 20);
            softNarrate("Você consegue um trecho: parada rápida + saída por rua lateral.");
            gotoScene("case01_scene_identificar");
          } else {
            state.player.heat = clamp(state.player.heat + 1, 0, 10);
            softNarrate("Burocracia: ‘volte depois’. No crime, depois é tarde.");
            gotoScene("case01_scene_fluxo");
          }
        }
      },
      {
        label: "Conseguir imagens na base da presença (polícia reformado)",
        requireSkill: "interrogatorio",
        onClick: () => {
          const t = testCheck({
            label: "Pressão/Autoridade para liberar imagens",
            skillKeys: ["interrogatorio", "procedimento"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue(CLUES.CAMERA_PREFEITURA);
            gainClue("Detalhe: o motorista evita câmera — boné e vidro escuro.");
            softNarrate("Você não pede: você conduz. E alguém cede.");
            gotoScene("case01_scene_identificar");
          } else {
            state.player.heat = clamp(state.player.heat + 2, 0, 10);
            softNarrate("Você força demais. Agora tem gente irritada e atenta.");
            gotoScene("case01_scene_ameaca");
          }
        }
      },
      {
        label: "Puxar por contato informal (fontes / Fernanda)",
        requireSkill: "fontes",
        onClick: () => {
          const t = testCheck({
            label: "Acesso informal às imagens",
            skillKeys: ["fontes", "persuasao"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue(CLUES.CAMERA_PREFEITURA);
            gainClue("Trecho extra: um segundo ocupante no carro (silhueta).");
            softNarrate("Alguém te deve um favor. E paga agora.");
            gotoScene("case01_scene_identificar");
          } else {
            state.player.heat = clamp(state.player.heat + 1, 0, 10);
            softNarrate("O contato recua. ‘Não mexe com isso…’");
            gotoScene("case01_scene_fluxo");
          }
        }
      },
      {
        label: "Voltar e priorizar o IML",
        onClick: () => gotoScene("case01_scene_iml")
      }
    ])
  },

  case01_scene_iml: {
    title: "IML — A verdade no corpo",
    text: () => [
      "No IML, o crime perde o teatro e vira matéria.",
      "Aqui, o corpo fala sem medo de sobrenome.",
      "",
      "O laudo preliminar começa a desenhar o que a praça tentou esconder."
    ].join("\n"),
    choices: () => ([
      {
        label: "Acompanhar a autópsia (frio, porém necessário)",
        onClick: () => {
          const t = testCheck({
            label: "Acompanhar autópsia sem falhar",
            skillKeys: ["procedimento", "tatico"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue(CLUES.NAO_MORTE_LOCAL);
            gainClue("Causa: ingestão forçada de álcool em volume absurdo (intoxicação).");
            softNarrate("Confirmado: ele foi levado e a cena foi montada.");
          } else {
            state.player.stats.sanity = clamp(state.player.stats.sanity - 2, 0, 20);
            softNarrate("Você vacila. A imagem fica com você.");
          }
          gotoScene("case01_scene_identificar");
        }
      },
      {
        label: "Cruzar nome e família (cartório/contatos)",
        onClick: () => gotoScene("case01_scene_identificar")
      }
    ])
  },

  case01_scene_identificar: {
    title: "Identificação — Um nome pesa mais que um corpo",
    text: () => [
      "A identificação chega. E com ela, o peso social.",
      "",
      "A vítima: Augusto Frederico Martins Fontes.",
      "O centro fica menor. A cidade fica mais silenciosa."
    ].join("\n"),
    choices: () => {
      if (!state.player?.clues?.includes(CLUES.NOME_VITIMA)) gainClue(CLUES.NOME_VITIMA);

      return [
        {
          label: "Ir até a família (risco político/social)",
          onClick: () => {
            state.player.heat = clamp(state.player.heat + 1, 0, 10);
            gotoScene("case01_scene_familia");
          }
        },
        {
          label: "Conectar simbologia: cana + sangue + álcool (padrão)",
          requireClue: CLUES.CACHACA,
          onClick: () => gotoScene("case01_scene_conexao")
        },
        {
          label: "Encerrar Crime 1 com o que você tem",
          onClick: () => {
            const keyCount = [CLUES.PALHA, CLUES.CACHACA, CLUES.NAO_MORTE_LOCAL]
              .filter((c) => state.player.clues.includes(c)).length;

            if (keyCount >= 2) {
              endCase1Success("Você fecha o Crime 1 com base sólida: mensagem simbólica + deslocamento + método.");
            } else {
              endCase1Fail("Você sai com lacunas. O assassino ganha tempo para o próximo movimento.");
            }
          }
        }
      ];
    }
  },

  case01_scene_conexao: {
    title: "Conexões — A cidade antiga volta à tona",
    text: () => [
      "Cana seca no pulso. Sangue como assinatura. Álcool forçado como punição.",
      "Isso não é só matar. É dizer: ‘foi a tua linhagem que fez isso’.",
      "",
      "Você sente um desenho maior: dívida antiga enterrada em cartórios, jornal e cinzas."
    ].join("\n"),
    choices: () => {
      gainClue(CLUES.PADRAO_MENSAGEM);
      state.player.stats.focus = clamp(state.player.stats.focus + 1, 0, 20);

      return [
        {
          label: "Voltar e encarar a família (com essa leitura em mente)",
          onClick: () => gotoScene("case01_scene_familia")
        },
        {
          label: "Encerrar Crime 1 com tese forte",
          onClick: () => endCase1Success("Você transforma a cena em tese: não é aleatório — é vingança histórica organizada.")
        }
      ];
    }
  },

  case01_scene_familia: {
    title: "Família Martins Fontes — Portas que não se abrem",
    text: () => [
      "Você chega à família. O luto tem protocolo.",
      "A recepção tem camadas: educação, suspeita e controle.",
      "",
      "Você sente que cada palavra sua será medida."
    ].join("\n"),
    choices: () => ([
      {
        label: "Entrar na conversa com persuasão (Fernanda brilha aqui)",
        onClick: () => {
          const t = testCheck({
            label: "Conseguir cooperação da família",
            skillKeys: ["persuasao", "instinto", "fontes"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue("A família menciona disputas antigas por terras e um incêndio ‘que não foi acidente’ (sem detalhes).");
            state.player.stats.rep = clamp(state.player.stats.rep + 1, 0, 20);
            gotoScene("case01_scene_finalizar");
          } else {
            state.player.heat = clamp(state.player.heat + 1, 0, 10);
            softNarrate("A família fecha. Você sai com a sensação de estar sendo observado.");
            gotoScene("case01_scene_ameaca");
          }
        }
      },
      {
        label: "Perguntas secas e objetivas (Messias brilha aqui)",
        onClick: () => {
          const t = testCheck({
            label: "Extrair detalhes objetivos",
            skillKeys: ["procedimento", "interrogatorio"],
            difficulty: 4
          });

          if (t.ok) {
            gainClue("Rotina da vítima + janela provável do sequestro + última ligação antes do sumiço.");
            gotoScene("case01_scene_finalizar");
          } else {
            state.player.stats.rep = clamp(state.player.stats.rep - 1, 0, 20);
            softNarrate("Eles interpretam como acusação. A conversa azeda.");
            gotoScene("case01_scene_fluxo");
          }
        }
      },
      {
        label: "Sair e encerrar Crime 1 com o que já tem",
        onClick: () => gotoScene("case01_scene_finalizar")
      }
    ])
  },

  case01_scene_ameaca: {
    title: "Sombra — Alguém responde ao seu avanço",
    text: () => [
      "Você percebe o mundo mudando ao redor.",
      "Um olhar que dura demais. Um carro parado onde não deveria.",
      "",
      "Uma mensagem chega (ou é deixada no seu caminho):",
      "“Pare de cavar.”"
    ].join("\n"),
    choices: () => {
      gainClue(CLUES.AMEACA);

      return [
        {
          label: "Ignorar e continuar (corajoso, perigoso)",
          style: "danger",
          onClick: () => {
            if (state.player.heat >= 6) {
              state.player.stats.life = clamp(state.player.stats.life - 4, 0, 20);
              softNarrate("Você paga pela ousadia. Um susto vira dor.");
              if (state.player.stats.life <= 0) return endCase1Fail("Você cai. A cidade segue. O assassino não perde tempo.");
            } else {
              state.player.heat = clamp(state.player.heat + 1, 0, 10);
              softNarrate("Você segura o tranco. Mas agora está no radar.");
            }
            gotoScene("case01_scene_finalizar");
          }
        },
        {
          label: "Reduzir exposição: discreção e método",
          onClick: () => {
            state.player.heat = clamp(state.player.heat - 1, 0, 10);
            state.player.stats.focus = clamp(state.player.stats.focus + 1, 0, 20);
            softNarrate("Você aprende: sobreviver também é investigação.");
            gotoScene("case01_scene_finalizar");
          }
        }
      ];
    }
  },

  case01_scene_erro: {
    title: "Erro — Chegar perto demais",
    text: () => [
      "Você se aproxima demais. O redor pressiona. A cidade quer ver.",
      "Uma mão puxa seu ombro. Você se desequilibra.",
      "",
      "Você sente o gosto metálico do pânico: um detalhe foi destruído.",
      "E você virou parte do espetáculo."
    ].join("\n"),
    choices: () => ([
      {
        label: "Recuperar o controle (procedimento / sangue-frio)",
        onClick: () => {
          state.player.stats.life = clamp(state.player.stats.life - 2, 0, 20);
          state.player.heat = clamp(state.player.heat + 2, 0, 10);
          state.player.stats.rep = clamp(state.player.stats.rep - 1, 0, 20);
          softNarrate("O erro custa caro — e chama atenção.");
          if (state.player.stats.life <= 0) return endCase1Fail("Você desmaia e perde o fio do caso.");
          gotoScene("case01_scene_fluxo");
        }
      }
    ])
  },

  case01_scene_fluxo: {
    title: "Fluxo — O que você prioriza agora?",
    text: () => [
      "Você precisa decidir a próxima peça.",
      "O crime é teatro. A verdade está nos bastidores.",
      "",
      "Pistas atuais:",
      ...(state.player?.clues || []).map((c) => `• ${c}`)
    ].join("\n"),
    choices: () => ([
      { label: "Voltar à cena e revisar tudo", onClick: () => gotoScene("case01_scene_observar") },
      { label: "Ir ao IML e buscar laudo/confirmar deslocamento", onClick: () => gotoScene("case01_scene_iml") },
      { label: "Buscar câmeras e rota de fuga", onClick: () => gotoScene("case01_scene_camera") },
      { label: "Tentar fechar Crime 1 com a tese atual", onClick: () => gotoScene("case01_scene_finalizar") }
    ])
  },

  case01_scene_finalizar: {
    title: "Fechamento do Crime 1 — O que você tem nas mãos",
    text: () => [
      "Você organiza o que descobriu.",
      "Nem toda vitória é pegar alguém — às vezes é não deixar o assassino te conduzir.",
      "",
      "Pistas atuais:",
      ...(state.player?.clues || []).map((c) => `• ${c}`),
      "",
      "Agora você decide: seguir com base sólida… ou correr com lacunas."
    ].join("\n"),
    choices: () => ([
      {
        label: "Encerrar Crime 1 com relatório consistente",
        onClick: () => {
          const must = [CLUES.PALHA, CLUES.CACHACA, CLUES.NAO_MORTE_LOCAL];
          const got = must.filter((c) => state.player.clues.includes(c)).length;

          if (got >= 2) {
            endCase1Success("Você confirma o essencial: álcool forçado + cena montada + símbolo da cana. O assassino está assinando uma dívida.");
          } else {
            endCase1Fail("Você não confirma o essencial. O assassino ganha tempo e confiança.");
          }
        }
      },
      {
        label: "Se expor para ‘puxar’ o assassino (iscando reação)",
        style: "danger",
        onClick: () => {
          state.player.heat = clamp(state.player.heat + 3, 0, 10);
          const t = testCheck({
            label: "Sobreviver ao blefe",
            skillKeys: ["procedimento", "instinto", "tatico"],
            difficulty: 5
          });

          if (t.ok) {
            gainClue("Reação percebida: movimentação estranha perto da Leste Companhia Ferroviária (próximo alvo).");
            endCase1Success("Você fecha o Crime 1 e ainda sente o próximo passo do inimigo.");
          } else {
            state.player.stats.life = clamp(state.player.stats.life - 5, 0, 20);
            if (state.player.stats.life <= 0) return endCase1Fail("A reação vem… e te alcança.");
            endCase1Fail("Você atraiu a reação, mas não controlou o risco.");
          }
        }
      }
    ])
  }
};

// ------------------
// Início do jogo
// ------------------
function startGame() {
  if (screenStart) screenStart.hidden = true;
  if (screenGame) screenGame.hidden = false;

  if (hudChar && state.player) {
    hudChar.textContent = `${state.player.name} • ${state.player.role}`;
  }
  updateHudStats();

  gotoScene("case01_intro");
}

// inicial
renderSheet(null);
updateHudStats();