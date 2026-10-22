"""Painel de Vendas - Araujo Embalagens (demonstração).
Como rodar:  pip install -r requirements.txt  ->  python app.py  ->  http://127.0.0.1:5000
Os dados são fictícios e gerados aqui. Na versão real, troque gerar() pela leitura da base da empresa."""
import math
import random
from datetime import date, timedelta
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)
HOJE = date(2026, 9, 28)
MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
EQUIPES = {'Equipe Norte': ['Carlos Silva', 'Mariana Costa', 'João Santos', 'Fernanda Lima', 'Bruno Alves'],
           'Equipe Sul': ['Ana Souza', 'Rafael Pereira', 'Larissa Gomes', 'Thiago Martins', 'Camila Rocha']}
VEND = {v: e for e, vs in EQUIPES.items() for v in vs}
PRODUTOS = [f'Produto {c}' for c in 'ABCDEFGHIJKL']
CLIENTES = [f'Cliente {i:02d}' for i in range(1, 61)]
PERIODOS = {'12m': (12, 23, 'Últimos 12 meses'), '6m': (18, 23, 'Últimos 6 meses'), 'ano': (15, 23, 'Ano atual (2026)')}


def gerar():
    """24 meses (out/2024 a set/2026) de vendas fictícias; k = índice do mês."""
    rnd = random.Random(7)
    pc = [1 / (i + 1) ** 0.9 for i in range(len(CLIENTES))]
    pp = [1 / (i + 1) ** 0.8 for i in range(len(PRODUTOS))]
    ultimo = {c: HOJE if i < 40 else HOJE - timedelta(days=rnd.randint(20, 170)) for i, c in enumerate(CLIENTES)}
    linhas, meta = [], {}
    for k in range(24):
        ano, mes = 2024 + (9 + k) // 12, (9 + k) % 12 + 1
        for i, v in enumerate(VEND):
            fator = (1.3 - 0.07 * i) * (1 + k * 0.015) * (1 + 0.2 * math.sin(2 * math.pi * (mes - 4) / 12))
            meta[(v, k)] = 4500 * 8 * 0.95 * fator
            for _ in range(8):
                d = date(ano, mes, rnd.randint(1, 28))
                c = rnd.choices(CLIENTES, pc)[0]
                if d > ultimo[c] or d > HOJE:
                    continue
                linhas.append({'k': k, 'data': d, 'vendedor': v, 'equipe': VEND[v], 'cliente': c,
                               'produto': rnd.choices(PRODUTOS, pp)[0],
                               'valor': rnd.uniform(2500, 6500) * fator, 'pedidos': rnd.randint(1, 2)})
    return linhas, meta


LINHAS, META = gerar()


def filtrar(ks, eq, vd, cl):
    ks = set(ks)
    return [l for l in LINHAS if l['k'] in ks and (eq == 'Todos' or l['equipe'] == eq)
            and (vd == 'Todos' or l['vendedor'] == vd) and (cl == 'Todos' or l['cliente'] == cl)]


def agrupar(linhas, chave):
    g = {}
    for l in linhas:
        x = g.setdefault(l[chave], {'fat': 0, 'pedidos': 0})
        x['fat'] += l['valor']
        x['pedidos'] += l['pedidos']
    return g


def ranking(g, limite=10):
    total = sum(x['fat'] for x in g.values()) or 1
    top = sorted(g.items(), key=lambda i: -i[1]['fat'])[:limite]
    return [{'nome': nome, 'fat': round(x['fat']), 'pct': round(x['fat'] / total * 100, 1), 'pedidos': x['pedidos'],
             'ticket': round(x['fat'] / x['pedidos']) if x['pedidos'] else 0} for nome, x in top]


def brl(v):
    return 'R$ ' + f'{v:,.0f}'.replace(',', '.')


def pc(v):
    return f'{v:.1f}'.replace('.', ',')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/dados')
def dados():
    a = request.args
    eq, vd, cl = (a.get(x, 'Todos') for x in ('equipe', 'vendedor', 'cliente'))
    ini, fim, _ = PERIODOS.get(a.get('periodo'), PERIODOS['12m'])
    dias = int(a.get('dias', 60))
    ks, ant = range(ini, fim + 1), range(ini - 12, fim - 11)
    atual, anterior = filtrar(ks, eq, vd, cl), filtrar(ant, eq, vd, cl)

    fat, fat_ant = sum(l['valor'] for l in atual), sum(l['valor'] for l in anterior)
    ped, ped_ant = sum(l['pedidos'] for l in atual), sum(l['pedidos'] for l in anterior)
    ticket, ticket_ant = (fat / ped if ped else 0), (fat_ant / ped_ant if ped_ant else 0)
    var = lambda x, y: (x / y - 1) * 100 if y else 0
    cresc = var(fat, fat_ant)

    vends = [v for v in VEND if (eq == 'Todos' or VEND[v] == eq) and (vd == 'Todos' or v == vd)]
    meta_mes = [round(sum(META[(v, k)] for v in vends)) for k in ks]
    mensal = lambda linhas, off=0: [round(sum(l['valor'] for l in linhas if l['k'] == k - off)) for k in ks]
    meta_pct = fat / sum(meta_mes) * 100 if cl == 'Todos' and sum(meta_mes) else None
    ativos = len({l['cliente'] for l in atual})

    # clientes inativos (ignora o período: olha a última compra de cada cliente)
    base, ultimo = filtrar(range(24), eq, vd, cl), {}
    for l in base:
        ultimo[l['cliente']] = max(ultimo.get(l['cliente'], l['data']), l['data'])
    rows = sorted(((c, d, (HOJE - d).days) for c, d in ultimo.items()), key=lambda r: r[2])
    inat = [r for r in rows if r[2] > dias]
    faixas = [{'rotulo': f'{dias + 1 + 30 * b}-{dias + 30 * (b + 1)}',
               'qtd': sum(1 for r in inat if dias + 1 + 30 * b <= r[2] <= dias + 30 * (b + 1))} for b in range(4)]

    top_c = ranking(agrupar(atual, 'cliente'))
    ins = [{'ic': '📈' if cresc >= 0 else '📉',
            't': f'Faturamento em {"alta" if cresc >= 0 else "queda"} de {pc(abs(cresc))}% em relação ao ano anterior.'}]
    if meta_pct is not None:
        ins.append({'ic': '🎯', 't': f'Meta superada em {pc(meta_pct - 100)}%.' if meta_pct >= 100
                    else f'Meta atingida em {pc(meta_pct)}%; faltam {brl(sum(meta_mes) - fat)}.'})
    if top_c:
        ins.append({'ic': '👥', 't': f'{top_c[0]["nome"]} representa {pc(top_c[0]["pct"])}% do faturamento total.'})
    ins.append({'ic': '⚠️', 't': f'{len(inat)} clientes estão inativos (acima de {dias} dias).'})

    return jsonify({
        'opcoes': {'periodos': [[k, v[2]] for k, v in PERIODOS.items()], 'equipes': list(EQUIPES),
                   'vendedores': [{'nome': v, 'equipe': e} for v, e in VEND.items()], 'clientes': CLIENTES},
        'kpis': {'fat': round(fat), 'cresc': cresc, 'dif': round(fat - fat_ant), 'meta': sum(meta_mes), 'meta_pct': meta_pct,
                 'ativos': ativos, 'ativos_pct': ativos / len(CLIENTES) * 100, 'ticket': round(ticket),
                 'ticket_var': var(ticket, ticket_ant)},
        'serie': {'labels': [MESES[(9 + k) % 12] for k in ks], 'atual': mensal(atual), 'anterior': mensal(anterior, 12)},
        'metareal': {'labels': [MESES[(9 + k) % 12] for k in ks], 'real': mensal(atual), 'meta': meta_mes} if cl == 'Todos' else None,
        'top_clientes': top_c, 'top_produtos': ranking(agrupar(atual, 'produto')),
        'vendedores': ranking(agrupar(atual, 'vendedor')), 'equipes': ranking(agrupar(atual, 'equipe')),
        'inativos': {'total': len(inat), 'faixas': faixas,
                     'lista': [{'nome': c, 'data': d.strftime('%d/%m/%Y'), 'dias': n} for c, d, n in inat[:5]]},
        'insights': ins})


if __name__ == '__main__':
    app.run(debug=True)
