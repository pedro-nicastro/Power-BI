const $ = (s) => document.querySelector(s),
  R = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR"),
  P = (v) => (v >= 0 ? "+" : "") + v.toFixed(1).replace(".", ",") + "%",
  mil = (v) =>
    v >= 1e6
      ? "R$ " + (v / 1e6).toFixed(1).replace(".", ",") + " mi"
      : v >= 1e3
        ? "R$ " + Math.round(v / 1e3) + " mil"
        : "R$ 0";
const F = {
  periodo: "12m",
  equipe: "Todos",
  vendedor: "Todos",
  cliente: "Todos",
  dias: 60,
};
let D,
  modo = "vendedores",
  pronto = false;

const opt = (arr, sel) =>
  arr
    .map((o) => {
      const [v, t] = Array.isArray(o) ? o : [o, o];
      return `<option value="${v}"${v == sel ? " selected" : ""}>${t}</option>`;
    })
    .join("");
const vend = () =>
  ($("#vendedor").innerHTML = opt(
    [
      "Todos",
      ...D.opcoes.vendedores
        .filter((v) => F.equipe == "Todos" || v.equipe == F.equipe)
        .map((v) => v.nome),
    ],
    F.vendedor,
  ));
function filtros() {
  const o = D.opcoes;
  $("#periodo").innerHTML = opt(o.periodos, F.periodo);
  $("#equipe").innerHTML = opt(["Todos", ...o.equipes], F.equipe);
  $("#cliente").innerHTML = opt(["Todos", ...o.clientes], F.cliente);
  vend();
  ["periodo", "equipe", "vendedor", "cliente"].forEach(
    (k) =>
      ($("#" + k).onchange = (e) => {
        F[k] = e.target.value;
        if (k == "equipe") {
          F.vendedor = "Todos";
          vend();
        }
        carregar();
      }),
  );
  $("#dias").onchange = (e) => {
    F.dias = +e.target.value;
    carregar();
  };
  document.querySelectorAll(".tg button").forEach(
    (b) =>
      (b.onclick = () => {
        modo = b.dataset.m;
        vendas();
      }),
  );
}

function escala(max) {
  const p = Math.pow(10, Math.floor(Math.log10(max || 1)));
  for (const m of [1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10])
    if (m * p >= max) return m * p;
  return 10 * p;
}
function grade(W, H, l, r, t, b, mx) {
  const y = (v) => t + (H - t - b) * (1 - v / mx);
  let s = "";
  for (let i = 0; i <= 4; i++) {
    const v = (mx * i) / 4;
    s += `<line x1="${l}" x2="${W - r}" y1="${y(v)}" y2="${y(v)}" class="g"/><text x="${l - 6}" y="${y(v) + 4}" class="ax" text-anchor="end">${mil(v)}</text>`;
  }
  return [s, y];
}

function kpis() {
  const k = D.kpis,
    seta = (v) => (v >= 0 ? "▲" : "▼"),
    m = k.meta_pct;
  const c = [
    [
      "c1",
      "💰",
      "Faturamento Total",
      R(k.fat),
      `${seta(k.cresc)} ${P(k.cresc)} vs. ano anterior`,
    ],
    [
      "c2",
      "📈",
      "Crescimento vs. Ano Anterior",
      P(k.cresc),
      R(Math.abs(k.dif)) + (k.dif >= 0 ? " a mais" : " a menos"),
    ],
    [
      "c3",
      "🎯",
      "Meta Atingida",
      m == null ? "—" : Math.round(m) + "%",
      m == null
        ? "Meta não se aplica a um cliente"
        : R(k.fat) + " / " + R(k.meta),
      m == null ? 0 : Math.min(m, 100),
    ],
    [
      "c4",
      "👥",
      "Clientes Ativos",
      k.ativos.toLocaleString("pt-BR"),
      Math.round(k.ativos_pct) + "% do total",
      k.ativos_pct,
    ],
    [
      "c5",
      "🛒",
      "Ticket Médio",
      R(k.ticket),
      `${seta(k.ticket_var)} ${P(k.ticket_var)} vs. ano anterior`,
    ],
  ];
  $("#kpis").innerHTML = c
    .map(
      ([cl, ic, t, v, s, b]) =>
        `<div class="kpi ${cl}"><div class="kt"><i>${ic}</i>${t}</div><strong>${v}</strong><small>${s}</small>${b == null ? "" : `<div class="bar"><span style="width:${b}%"></span></div>`}</div>`,
    )
    .join("");
}

function linha() {
  const L = D.serie.labels,
    A = D.serie.atual,
    B = D.serie.anterior,
    W = 620,
    H = 250,
    l = 70,
    r = 12,
    t = 14,
    b = 28;
  const [g, y] = grade(W, H, l, r, t, b, escala(Math.max(...A, ...B))),
    x = (i) => l + (i * (W - l - r)) / Math.max(L.length - 1, 1);
  const pts = (a) => a.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  $("#linha").innerHTML =
    `<svg viewBox="0 0 ${W} ${H}">${g}` +
    L.map(
      (n, i) =>
        `<text x="${x(i)}" y="${H - 8}" class="ax" text-anchor="middle">${n}</text>`,
    ).join("") +
    `<polygon points="${x(0)},${y(0)} ${pts(A)} ${x(A.length - 1)},${y(0)}" class="ar"/><polyline points="${pts(B)}" class="l2"/><polyline points="${pts(A)}" class="l1"/>` +
    A.map(
      (v, i) =>
        `<circle cx="${x(i)}" cy="${y(v)}" r="4.5" class="pt"><title>${L[i]}: ${R(v)} (ano anterior: ${R(B[i])})</title></circle>`,
    ).join("") +
    "</svg>";
}

function barras() {
  const M = D.metareal,
    el = $("#barras");
  if (!M) {
    el.innerHTML =
      '<p class="vazio">A meta é definida por vendedor e não se aplica a um cliente específico.</p>';
    $("#pct").innerHTML = "";
    return;
  }
  const W = 620,
    H = 250,
    l = 70,
    r = 12,
    t = 14,
    b = 28,
    n = M.labels.length,
    w = (W - l - r) / n;
  const [g, y] = grade(
    W,
    H,
    l,
    r,
    t,
    b,
    escala(Math.max(...M.real, ...M.meta)),
  );
  $("#barras").innerHTML =
    `<svg viewBox="0 0 ${W} ${H}">${g}` +
    M.real
      .map(
        (v, i) =>
          `<rect x="${l + i * w + w * 0.18}" y="${y(v)}" width="${w * 0.64}" height="${y(0) - y(v)}" rx="3" class="bar1"><title>${M.labels[i]}: ${R(v)} | meta ${R(M.meta[i])}</title></rect><text x="${l + i * w + w / 2}" y="${H - 8}" class="ax" text-anchor="middle">${M.labels[i]}</text>`,
      )
      .join("") +
    `<polyline class="meta" points="${M.meta.map((v, i) => `${l + i * w + w / 2},${y(v)}`).join(" ")}"/></svg>`;
  const p = D.kpis.meta_pct,
    c = 2 * Math.PI * 30;
  $("#pct").innerHTML =
    `<svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="30" class="dn0"/><circle cx="40" cy="40" r="30" class="dn1" stroke-dasharray="${(Math.min(p, 100) / 100) * c} ${c}" transform="rotate(-90 40 40)"/></svg><b>${Math.round(p)}%<small>da meta</small></b>`;
}

function tabela(id, rows, cor, rot) {
  const mx = Math.max(...rows.map((r) => r.fat), 1);
  $(id).innerHTML =
    `<tr><th>#</th><th>${rot}</th><th>Faturamento</th><th>% do Total</th></tr>` +
    rows
      .map(
        (r, i) =>
          `<tr><td>${i + 1}</td><td>${r.nome}</td><td><div class="rb"><em>${R(r.fat)}</em><span class="${cor}" style="width:${(r.fat / mx) * 60}px"></span></div></td><td>${r.pct.toFixed(1).replace(".", ",")}%</td></tr>`,
      )
      .join("");
}

function vendas() {
  $("#vend").innerHTML =
    `<tr><th>#</th><th>${modo == "vendedores" ? "Vendedor" : "Equipe"}</th><th>Faturamento</th><th>Pedidos</th><th>Ticket Médio</th></tr>` +
    D[modo]
      .map(
        (r, i) =>
          `<tr><td><span class="num">${i + 1}</span></td><td>${r.nome}</td><td>${R(r.fat)}</td><td>${r.pedidos}</td><td>${R(r.ticket)}</td></tr>`,
      )
      .join("");
  document
    .querySelectorAll(".tg button")
    .forEach((b) => b.classList.toggle("on", b.dataset.m == modo));
}

function inativos() {
  const I = D.inativos,
    mx = Math.max(...I.faixas.map((f) => f.qtd), 1),
    cores = ["#ef4452", "#f28a30", "#fbbf24", "#3b82f6"];
  $("#ina-n").textContent = I.total;
  $("#dias-t").textContent = F.dias;
  $("#ina-t").innerHTML =
    "<tr><th>Cliente</th><th>Última compra</th><th>Dias</th></tr>" +
    I.lista
      .map(
        (r) =>
          `<tr><td>${r.nome}</td><td>${r.data}</td><td>${r.dias}</td></tr>`,
      )
      .join("");
  $("#faixas").innerHTML = I.faixas
    .map(
      (f, i) =>
        `<div class="fx"><b>${f.qtd}</b><span style="height:${(f.qtd / mx) * 90 + 4}px;background:${cores[i]}"></span><small>${f.rotulo}</small></div>`,
    )
    .join("");
}

function desenhar() {
  kpis();
  linha();
  barras();
  tabela("#topc", D.top_clientes, "bl", "Cliente");
  tabela("#topp", D.top_produtos, "gr", "Produto");
  vendas();
  inativos();
  $("#ins").innerHTML = D.insights
    .map((i) => `<li><i>${i.ic}</i>${i.t}</li>`)
    .join("");
}

async function carregar() {
  try {
    const r = await fetch("/api/dados?" + new URLSearchParams(F));
    if (!r.ok) throw new Error("HTTP " + r.status);
    D = await r.json();
  } catch (e) {
    if (!$(".erro"))
      $("main").insertAdjacentHTML(
        "afterbegin",
        `<div class="erro"><b>O servidor Python não respondeu (${e.message}).</b> Esta página precisa do Flask: no terminal, dentro da pasta <b>painel-araujo</b>, rode <b>python app.py</b> e acesse <b>http://127.0.0.1:5000</b>. Não funciona pelo Live Server nem abrindo o arquivo HTML direto.</div>`,
      );
    return;
  }
  if (!pronto) {
    filtros();
    pronto = true;
  }
  desenhar();
}
carregar();
