<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TricoMaster · App</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  /* ── Brand greens ── */
  --verde:     #013425;   /* primário: topbar, cabeçalhos */
  --verde-md:  #044E38;   /* hover botão verde */
  --verde-clr: #0B5E43;   /* hover sidebar */
  --verde-bdr: #a3b8b1;   /* bordas verdes / nav inativo */
  /* ── Gold ── */
  --gold:      #C5A365;   /* botão primário, destaques, nav ativo */
  --gold-hov:  #b59254;   /* hover botão dourado */
  --gold-clr:  #fdf5e8;   /* fundo pill gold */
  /* ── Surfaces ── */
  --creme:     #F2F4F3;   /* background geral */
  --branco:    #ffffff;   /* cards */
  --cinza-1:   #f9fafb;   /* fundo input, fundo pill neutro */
  --cinza-2:   #e8ece9;   /* bordas de card */
  --cinza-3:   #d1d5db;   /* bordas de input */
  --cinza-4:   #888888;   /* labels secundários */
  --cinza-5:   #666666;   /* labels de campo */
  --preto:     #1a1a1a;   /* texto principal */
  /* ── Feedback ── */
  --vm:        #dc2626;   /* erro, danger */
  --vm-bg:     #fef2f2;
  --am-bg:     #fff7ed;   /* laranja claro */
  --am-tx:     #f97316;   /* laranja cortesia */
  /* ── Layout ── */
  --r:         12px;
  --rsm:       8px;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: var(--creme); color: var(--preto); min-height: 100vh; font-size: 14px; }

.shell { max-width: 480px; margin: 0 auto; background: var(--branco); min-height: 100vh; box-shadow: 0 0 40px rgba(0,0,0,.08); display: flex; flex-direction: column; }

/* ── topbar ── */
.topbar { background: var(--verde); padding: 16px 20px 0; position: sticky; top: 0; z-index: 100; }
.topbar-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.logo { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -.3px; }
.logo span { font-weight: 400; color: var(--gold); }
.badge-env { font-size: 10px; font-weight: 600; letter-spacing: .8px; background: rgba(197,163,101,.2); color: var(--gold); padding: 3px 10px; border-radius: 20px; }
.tabs { display: flex; }
.tab { flex: 1; text-align: center; padding: 10px 0 14px; font-size: 13px; font-weight: 500; color: var(--verde-bdr); cursor: pointer; border: none; background: none; border-bottom: 2.5px solid transparent; transition: all .2s; }
.tab.active { color: #fff; border-bottom-color: var(--gold); }

/* ── content ── */
.content { padding: 24px 20px 56px; flex: 1; overflow-y: auto; }
.screen { display: none; }
.screen.active { display: block; }

/* ── progress ── */
.prog-wrap { display: flex; gap: 6px; margin-bottom: 24px; align-items: center; }
.prog-step { flex: 1; height: 4px; border-radius: 4px; background: var(--cinza-2); transition: background .3s; }
.prog-step.done { background: var(--gold); }
.prog-label { font-size: 11px; color: var(--cinza-4); white-space: nowrap; margin-left: 4px; }

/* ── headings ── */
.form-title { font-family: 'Inter', sans-serif; font-size: 20px; font-weight: 700; color: var(--verde); margin-bottom: 4px; letter-spacing: -.3px; }
.form-sub   { font-size: 13px; color: var(--cinza-4); margin-bottom: 24px; font-weight: 400; }
.sec-head {
  font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase;
  color: var(--verde); margin: 22px 0 12px;
  display: flex; align-items: center; gap: 8px;
}
.sec-head::after { content:''; flex:1; height:1px; background: var(--cinza-2); }

/* ── fields ── */
.field { margin-bottom: 14px; }
.field > label, .lbl {
  display: block; font-size: 11px; font-weight: 600; letter-spacing: .5px;
  color: var(--cinza-5); text-transform: uppercase; margin-bottom: 6px;
}
.field input[type=text],
.field input[type=number],
.field textarea,
.field select {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid var(--cinza-3); border-radius: var(--rsm);
  background: var(--cinza-1); font-family: 'Inter', sans-serif;
  font-size: 14px; color: var(--preto); outline: none; transition: border .2s;
}
.field input:focus, .field textarea:focus, .field select:focus { border-color: var(--gold); background: var(--branco); }
.field textarea { resize: none; }
.row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

/* ── pills ── */
.pill-group { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border: 1.5px solid var(--cinza-3); border-radius: 24px;
  font-size: 13px; font-weight: 500; color: var(--cinza-5); cursor: pointer; user-select: none;
  transition: all .15s; background: var(--branco);
}
.pill::before { content:''; width:7px; height:7px; border-radius:50%; border:1.5px solid var(--cinza-3); flex-shrink:0; transition:all .15s; }
.pill:hover   { border-color: var(--gold); background: var(--gold-clr); color: var(--preto); }
.pill.sel     { background: var(--gold-clr); border-color: var(--gold); color: var(--verde); font-weight:600; }
.pill.sel::before { background: var(--gold); border-color: var(--gold); }

/* ── queda onde ── */
.queda-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px; }
.queda-item { background: var(--cinza-1); border-radius: var(--rsm); padding: 9px 12px; display: flex; align-items: center; justify-content: space-between; }
.queda-item span { font-size: 13px; color: var(--cinza-5); }
.sn-pair { display: flex; gap: 6px; }
.sn-btn { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight:500; cursor: pointer; border: 1px solid var(--cinza-3); background: var(--branco); color: var(--cinza-4); transition: all .15s; }
.sn-btn.sel-s { background: var(--gold-clr); border-color: var(--gold); color: var(--verde); font-weight:600; }
.sn-btn.sel-n { background: var(--cinza-1); border-color: var(--cinza-3); color: var(--cinza-5); font-weight:600; }

/* ── doença rows (médico) ── */
.dx-bloco { border: 1.5px solid var(--cinza-2); border-radius: var(--r); overflow: hidden; margin-bottom: 14px; }
.dx-row   { padding: 10px 14px; border-bottom: 1px solid var(--cinza-1); }
.dx-row:last-child { border-bottom: none; }
.dx-row-top { display: flex; align-items: center; gap: 10px; }
.dx-nome  { font-size: 13px; flex: 1; }
.dx-detail { margin-top: 6px; display: none; }
.dx-detail input, .dx-detail textarea {
  width: 100%; padding: 7px 10px; border: 1px solid var(--cinza-3); border-radius: 6px;
  font-size: 13px; background: var(--cinza-1); font-family: 'Inter', sans-serif; color: var(--preto);
}

/* inline scale row: label + buttons on same line */
.scale-inline { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.scale-inline .scale-lbl { font-size: 11px; font-weight: 600; letter-spacing: .5px; color: var(--cinza-5); text-transform: uppercase; white-space: nowrap; min-width: 100px; }
.scale-inline .scale-row { margin-top: 0; flex-wrap: nowrap; }
.rp { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight:500; cursor: pointer; border: 1px solid var(--cinza-3); background: var(--branco); color: var(--cinza-4); transition: all .15s; white-space: nowrap; }
.rp-x { font-size: 13px; font-weight: 700; line-height: 1; opacity: .6; margin-left: 2px; }
.rp-x:hover { opacity: 1; }
.rp:hover    { background: var(--cinza-1); }
.rp.sel-nao  { background: #e6f2ec; border-color: var(--verde); color: var(--verde); font-weight: 600; }
.rp.sel-sim  { background: var(--vm-bg); border-color: #F5C6C5; color: var(--vm); font-weight: 600; }

/* ── escalas ── */
.scale-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
.scale-btn { width: 40px; height: 40px; border-radius: 8px; border: 1.5px solid var(--cinza-3); background: var(--branco); font-size: 14px; font-weight:500; cursor: pointer; transition: all .15s; color: var(--cinza-5); }
.scale-btn:hover { border-color: var(--gold); background: var(--gold-clr); color: var(--verde); }
.scale-btn.sel   { background: var(--verde); border-color: var(--verde); color: #fff; }

/* ── cards info ── */
.info-bloco { background: var(--cinza-1); border-radius: var(--r); padding: 14px 16px; margin-bottom: 14px; }
.info-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 6px 0; border-bottom: 1px solid var(--cinza-2); gap: 12px; }
.info-row:last-child { border-bottom: none; }
.info-label { font-size: 11px; font-weight:600; color: var(--cinza-4); letter-spacing:.3px; white-space:nowrap; }
.info-val   { font-size: 13px; color: var(--preto); text-align: right; max-width: 65%; }

/* ── tratamento box ── */
.trat-box { background: var(--gold-clr); border: 1.5px solid #e8d4aa; border-radius: var(--r); padding: 14px 16px; margin-bottom: 14px; }
.trat-box .trat-tit { font-size:11px; font-weight:700; letter-spacing:.6px; text-transform:uppercase; color:var(--verde); margin-bottom:10px; }
.trat-box textarea { width:100%; background:transparent; border:none; font-family:'Inter',sans-serif; font-size:13px; color:#5a3e10; line-height:1.6; resize:none; outline:none; min-height:80px; }

/* ── familiar / tipos ── */
.fam-entrada { border: 1.5px solid var(--cinza-2); border-radius: var(--r); padding: 12px 14px; margin-bottom: 10px; }
.fam-top     { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
.fam-top input { padding: 9px 12px; border: 1.5px solid var(--cinza-3); border-radius: var(--rsm); font-size: 13px; font-family: 'Inter', sans-serif; background: var(--cinza-1); width: 100%; }
.tipos-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin: 10px 0 6px; }
.tipo-card   { border: 2px solid var(--cinza-2); border-radius: var(--rsm); padding: 8px 4px; text-align: center; cursor: pointer; transition: all .15s; background: var(--branco); }
.tipo-card:hover { border-color: var(--gold); background: var(--gold-clr); }
.tipo-card.sel   { border-color: var(--gold); background: var(--gold-clr); }
.tipo-card svg   { display: block; margin: 0 auto 4px; }
.tipo-card .tlbl { font-size: 10px; font-weight:600; color: var(--cinza-5); }
.tipo-card.sel .tlbl { color: var(--verde); }
.fam-sel { font-size: 12px; color: var(--cinza-4); min-height: 18px; margin-top: 4px; }
.fam-sel span { background: var(--gold-clr); color: var(--verde); border: 1px solid var(--gold); padding: 2px 8px; border-radius: 10px; font-weight:600; font-size:11px; }

/* ── médico paciente cards ── */
.pac-card { background: var(--branco); border: 1.5px solid var(--cinza-2); border-radius: var(--r); padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 14px; }
.pac-card:hover { border-color: var(--gold); box-shadow: 0 2px 12px rgba(1,52,37,.08); }
.pac-avatar { width:44px; height:44px; border-radius:50%; background:var(--gold-clr); color:var(--verde); font-family:'Inter',sans-serif; font-size:15px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.pac-nome { font-size:14px; font-weight:600; }
.pac-hora { font-size:12px; color:var(--cinza-4); margin-top:2px; }
.tag      { font-size:10px; font-weight:700; letter-spacing:.5px; padding:4px 10px; border-radius:20px; }
.tag-ok   { background:var(--gold-clr); color:#7a5c2a; border: 1px solid #e0c88a; }
.tag-wait { background:var(--am-bg); color:var(--am-tx); }

/* ── sub-tabs médico ── */
.sub-tabs { display: flex; gap: 0; border-bottom: 1.5px solid var(--cinza-2); margin-bottom: 20px; }
.sub-tab  { flex: 1; text-align: center; padding: 10px 0; font-size: 13px; font-weight:500; color: var(--cinza-4); cursor: pointer; border: none; background: none; border-bottom: 2px solid transparent; margin-bottom: -1.5px; transition: all .2s; }
.sub-tab.active { color: var(--verde); border-bottom-color: var(--gold); font-weight:600; }

/* ── buttons ── */
.btn { width:100%; padding:14px; border-radius:var(--r); border:none; font-family:'Inter',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; margin-top:12px; letter-spacing:.2px; }
.btn-primary   { background: var(--gold); color: #fff; }
.btn-primary:hover { background: var(--gold-hov); }
.btn-secondary { background: var(--cinza-1); color: var(--cinza-5); border:1.5px solid var(--cinza-2); }
.btn-secondary:hover { background: var(--cinza-2); }
.btn-pdf { background: var(--verde); color: #fff; border: none; }
.btn-pdf:hover { background: var(--verde-md); }
.btn-save { background: var(--verde); color: #fff; border: none; }
.btn-save:hover { background: var(--verde-md); }
.btn-sm  { width:auto; padding:9px 18px; font-size:13px; }
.back-btn { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:500; color:var(--verde); cursor:pointer; margin-bottom:20px; background:none; border:none; }

/* ── success ── */
.success-card { background: var(--gold-clr); border: 1.5px solid #e0c88a; border-radius: var(--r); padding: 32px 24px; text-align:center; display:none; }
.success-card h2 { font-family:'Inter',sans-serif; font-size:20px; font-weight:700; color:var(--verde); margin-bottom:8px; }
.success-card p  { font-size:14px; color:var(--cinza-5); line-height:1.6; }

/* ── toast / loader ── */
.toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(80px); background:#016630; color:#fff; padding:12px 24px; border-radius:30px; font-size:13px; font-weight:500; transition:transform .3s; z-index:999; white-space:nowrap; }
.toast.show { transform:translateX(-50%) translateY(0); }
.loader-wrap { display:none; flex-direction:column; align-items:center; padding:28px 0; gap:12px; }
.spinner { width:36px; height:36px; border:3px solid var(--cinza-2); border-top-color:var(--gold); border-radius:50%; animation:spin .7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.loader-txt { font-size:13px; color:var(--cinza-4); }

/* readonly style */
input[readonly] { background: var(--cinza-1) !important; color: var(--cinza-4); cursor: default; }
</style>
</head>
<body>
<div class="shell">
  <div class="topbar">
    <div class="topbar-head">
      <div class="logo">Trico<span>Master</span></div>
      <div class="badge-env">MVP · TESTE</div>
    </div>
    <div class="tabs">
      <button class="tab active" onclick="switchTab('pac')" id="tab-pac">Paciente</button>
      <button class="tab" onclick="pedirSenha()" id="tab-med">Médico 🔒</button>
    </div>
  </div>

  <div class="content">

    <!-- ══════════════════ PACIENTE ══════════════════ -->
    <div class="screen active" id="screen-pac">
      <div id="pac-form">

        <!-- ETAPA 1 -->
        <div id="step1">
          <div class="prog-wrap">
            <div class="prog-step done"></div><div class="prog-step"></div>
            <div class="prog-step"></div><div class="prog-step"></div>
            <span class="prog-label">1 de 4</span>
          </div>
          <div class="form-title">Questionário</div>
          <div class="form-sub">Preencha antes da consulta. Leva menos de 5 minutos.</div>

          <div class="field">
            <label>Data</label>
            <input type="text" id="p-data" readonly/>
          </div>
          <div class="field">
            <label>Nome completo</label>
            <input type="text" id="p-nome" placeholder="Seu nome completo"/>
          </div>
          <div class="row2">
            <div class="field"><label>Idade</label><input type="number" id="p-idade" placeholder="Ex: 32"/></div>
            <div class="field"><label>Profissão</label><input type="text" id="p-prof" placeholder="Ex: Professora"/></div>
          </div>
          <div class="field">
            <label>Possui convênio médico?</label>
            <div class="pill-group" id="pg-conv" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
            <input type="text" id="p-conv-qual" placeholder="Qual convênio?" style="margin-top:8px;display:none"/>
          </div>
          <div class="field">
            <label>Como nos conheceu?</label>
            <div class="pill-group" id="pg-conheceu" data-type="multi">
              <div class="pill" data-val="Google" onclick="selPill(this)">Google</div>
              <div class="pill" data-val="Instagram" onclick="selPill(this)">Instagram</div>
              <div class="pill" data-val="Facebook" onclick="selPill(this)">Facebook</div>
              <div class="pill" data-val="Indicação" onclick="selPill(this)">Indicação</div>
              <div class="pill" data-val="Outros" onclick="selPill(this)">Outros</div>
            </div>
          </div>
          <button class="btn btn-primary" onclick="goStep(2)">Continuar →</button>
        </div>

        <!-- ETAPA 2 -->
        <div id="step2" style="display:none">
          <div class="prog-wrap">
            <div class="prog-step done"></div><div class="prog-step done"></div>
            <div class="prog-step"></div><div class="prog-step"></div>
            <span class="prog-label">2 de 4</span>
          </div>
          <div class="form-title">Queixa principal</div>
          <div class="form-sub">Conte o que está acontecendo com seus cabelos.</div>

          <div class="field">
            <label>1. Tipo de queixa</label>
            <div class="pill-group" id="pg-queixa" data-type="multi">
              <div class="pill" data-val="Queda de cabelo" onclick="selPill(this)">Queda de cabelo</div>
              <div class="pill" data-val="Falhas" onclick="selPill(this)">Falhas</div>
              <div class="pill" data-val="Quebra de fios" onclick="selPill(this)">Quebra de fios</div>
              <div class="pill" data-val="Outros" onclick="selPill(this)">Outros</div>
            </div>
          </div>
          <div class="row2">
            <div class="field"><label>Tempo do problema</label><input type="text" id="p-tempo" placeholder="Ex: 3 meses"/></div>
            <div class="field"><label>Fios por dia (média)</label><input type="text" id="p-fios" placeholder="Ex: ~80"/></div>
          </div>
          <div class="field">
            <label>2. O problema está</label>
            <div class="pill-group" id="pg-prog" data-type="radio">
              <div class="pill" data-val="Estável" onclick="selPill(this)">Estável</div>
              <div class="pill" data-val="Aumentando" onclick="selPill(this)">Aumentando</div>
            </div>
          </div>
          <div class="field">
            <label>Queda ocorre onde?</label>
            <div class="queda-grid">
              <div class="queda-item"><span>No banho</span><div class="sn-pair"><button class="sn-btn" onclick="selSN(this,'qb','S')">Sim</button><button class="sn-btn" onclick="selSN(this,'qb','N')">Não</button></div></div>
              <div class="queda-item"><span>Ao escovar</span><div class="sn-pair"><button class="sn-btn" onclick="selSN(this,'qe','S')">Sim</button><button class="sn-btn" onclick="selSN(this,'qe','N')">Não</button></div></div>
              <div class="queda-item"><span>No chão</span><div class="sn-pair"><button class="sn-btn" onclick="selSN(this,'qc','S')">Sim</button><button class="sn-btn" onclick="selSN(this,'qc','N')">Não</button></div></div>
              <div class="queda-item"><span>Na roupa</span><div class="sn-pair"><button class="sn-btn" onclick="selSN(this,'qr','S')">Sim</button><button class="sn-btn" onclick="selSN(this,'qr','N')">Não</button></div></div>
              <div class="queda-item"><span>No travesseiro</span><div class="sn-pair"><button class="sn-btn" onclick="selSN(this,'qt','S')">Sim</button><button class="sn-btn" onclick="selSN(this,'qt','N')">Não</button></div></div>
            </div>
          </div>
          <div class="field">
            <label>3. Alterações no couro cabeludo</label>
            <div class="pill-group" id="pg-couro" data-type="multi">
              <div class="pill" data-val="Oleosidade" onclick="selPill(this)">Oleosidade</div>
              <div class="pill" data-val="Caspa" onclick="selPill(this)">Caspa</div>
              <div class="pill" data-val="Crostas" onclick="selPill(this)">Crostas</div>
              <div class="pill" data-val="Descamação" onclick="selPill(this)">Descamação</div>
              <div class="pill" data-val="Vermelhidão" onclick="selPill(this)">Vermelhidão</div>
              <div class="pill" data-val="Coceira" onclick="selPill(this)">Coceira</div>
              <div class="pill" data-val="Ardor" onclick="selPill(this)">Ardor</div>
              <div class="pill" data-val="Odor" onclick="selPill(this)">Odor</div>
              <div class="pill" data-val="Secreção" onclick="selPill(this)">Secreção</div>
              <div class="pill" data-val="Dor" onclick="selPill(this)">Dor</div>
            </div>
          </div>
          <div class="field">
            <label>4. Já apresentou outras crises?</label>
            <div class="pill-group" id="pg-crise" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
            <input type="text" id="p-crise-q" placeholder="Quando?" style="margin-top:8px;display:none"/>
          </div>
          <div class="field">
            <label>5. Já fez tratamento para este problema?</label>
            <div class="pill-group" id="pg-tratou" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
            <input type="text" id="p-trat-q" placeholder="Quando?" style="margin-top:8px;display:none"/>
          </div>
          <div class="field">
            <label>Tipos de tratamento realizados</label>
            <div class="pill-group" id="pg-trattipos" data-type="multi">
              <div class="pill" data-val="Fórmulas via oral" onclick="selPill(this)">Fórmulas oral</div>
              <div class="pill" data-val="Solução capilar" onclick="selPill(this)">Solução capilar</div>
              <div class="pill" data-val="Mesoterapia" onclick="selPill(this)">Mesoterapia</div>
              <div class="pill" data-val="PRP" onclick="selPill(this)">PRP</div>
              <div class="pill" data-val="Microagulhamento" onclick="selPill(this)">Microagulhamento</div>
              <div class="pill" data-val="Shampoo antiqueda" onclick="selPill(this)">Shampoo antiqueda</div>
              <div class="pill" data-val="Laserterapia" onclick="selPill(this)">Laserterapia</div>
              <div class="pill" data-val="MMP" onclick="selPill(this)">MMP</div>
              <div class="pill" data-val="Terapia capilar" onclick="selPill(this)">Terapia capilar</div>
            </div>
          </div>
          <button class="btn btn-primary" onclick="goStep(3)">Continuar →</button>
          <button class="btn btn-secondary" onclick="goStep(1)">← Voltar</button>
        </div>

        <!-- ETAPA 3 -->
        <div id="step3" style="display:none">
          <div class="prog-wrap">
            <div class="prog-step done"></div><div class="prog-step done"></div>
            <div class="prog-step done"></div><div class="prog-step"></div>
            <span class="prog-label">3 de 4</span>
          </div>
          <div class="form-title">Hábitos capilares</div>
          <div class="form-sub">Rotina e cuidados com o cabelo.</div>

          <div class="field">
            <label>6. Está tomando alguma medicação?</label>
            <div class="pill-group" id="pg-med" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
            <textarea id="p-med-q" rows="2" placeholder="Quais medicamentos?" style="margin-top:8px;display:none"></textarea>
          </div>
          <div class="field">
            <label>7. Com qual frequência lava os cabelos?</label>
            <div class="pill-group" id="pg-lav" data-type="radio">
              <div class="pill" data-val="1x/semana" onclick="selPill(this)">1x/semana</div>
              <div class="pill" data-val="2x/semana" onclick="selPill(this)">2x/semana</div>
              <div class="pill" data-val="3x/semana" onclick="selPill(this)">3x/semana</div>
              <div class="pill" data-val="Todo dia" onclick="selPill(this)">Todo dia</div>
            </div>
          </div>
          <div class="field">
            <label>8. Faz química no cabelo?</label>
            <div class="pill-group" id="pg-quim" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
            <div id="quim-detail" style="display:none;margin-top:10px">
              <div class="pill-group" id="pg-quimtipo" data-type="multi" style="margin-bottom:8px">
                <div class="pill" data-val="Tintura" onclick="selPill(this)">Tintura</div>
                <div class="pill" data-val="Tonalizante" onclick="selPill(this)">Tonalizante</div>
                <div class="pill" data-val="Botox" onclick="selPill(this)">Botox</div>
                <div class="pill" data-val="Progressiva" onclick="selPill(this)">Progressiva</div>
                <div class="pill" data-val="Outros" onclick="selPill(this)">Outros</div>
              </div>
              <div class="row2">
                <input type="text" id="p-quim-freq" placeholder="Frequência" style="padding:9px 12px;border:1.5px solid var(--cinza-3);border-radius:var(--rsm);font-family:'Inter',sans-serif;font-size:13px;background:var(--cinza-1)"/>
                <input type="text" id="p-quim-4m" placeholder="Últimos 4 meses" style="padding:9px 12px;border:1.5px solid var(--cinza-3);border-radius:var(--rsm);font-family:'Inter',sans-serif;font-size:13px;background:var(--cinza-1)"/>
              </div>
            </div>
          </div>
          <div class="field">
            <label>9. Utiliza chapinha / escova?</label>
            <div class="pill-group" id="pg-chap" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
            <input type="text" id="p-chap-freq" placeholder="Com qual frequência?" style="margin-top:8px;display:none"/>
          </div>
          <div class="field">
            <label>9. Tem alongamento?</label>
            <div class="pill-group" id="pg-along" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
            <input type="text" id="p-along-t" placeholder="Há quanto tempo?" style="margin-top:8px;display:none"/>
          </div>
          <button class="btn btn-primary" onclick="goStep(4)">Continuar →</button>
          <button class="btn btn-secondary" onclick="goStep(2)">← Voltar</button>
        </div>

        <!-- ETAPA 4 -->
        <div id="step4" style="display:none">
          <div class="prog-wrap">
            <div class="prog-step done"></div><div class="prog-step done"></div>
            <div class="prog-step done"></div><div class="prog-step done"></div>
            <span class="prog-label">4 de 4</span>
          </div>
          <div class="form-title">Histórico familiar</div>
          <div class="form-sub">Alguém na família tem ou teve calvície? Selecione o tipo.</div>
          <div id="fam-entradas"></div>
          <button class="btn btn-secondary btn-sm" onclick="addFamEntrada()" style="margin-top:0">+ Adicionar familiar</button>
          <div style="margin-top:20px;background:var(--cinza-1);border-radius:var(--r);padding:14px 16px">
            <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;font-size:13px;line-height:1.6;color:var(--cinza-5)">
              <input type="checkbox" id="p-decl" style="width:16px;height:16px;margin-top:2px;flex-shrink:0;accent-color:var(--verde-md)"/>
              Declaro que as informações acima são verdadeiras e de minha responsabilidade.
            </label>
          </div>
          <button class="btn btn-primary" onclick="submitPac()" style="margin-top:20px">Enviar para a clínica ✓</button>
          <button class="btn btn-secondary" onclick="goStep(3)">← Voltar</button>
        </div>
      </div>

      <div class="success-card" id="pac-ok">
        <div style="font-size:48px;margin-bottom:12px">🌿</div>
        <h2>Questionário enviado!</h2>
        <p>A clínica recebeu seus dados.<br>Aguarde ser chamado pelo médico.</p>
      </div>
    </div><!-- /screen-pac -->

    <!-- ══════════════════ MÉDICO ══════════════════ -->
    <div class="screen" id="screen-med">

      <!-- lista -->
      <div id="med-lista">
        <div class="form-title" style="margin-bottom:4px">Pacientes de hoje</div>
        <div class="form-sub">Quinta-feira, 19 de março de 2026</div>
        <div class="pac-card" onclick="openPac(0)">
          <div class="pac-avatar">AB</div>
          <div style="flex:1"><div class="pac-nome">Ana Beatriz Silva</div><div class="pac-hora">09:00 · Queda de cabelo</div></div>
          <span class="tag tag-ok">Ficha ok</span>
        </div>
        <div class="pac-card" onclick="alert('Paciente não preencheu o questionário ainda.')">
          <div class="pac-avatar" style="background:var(--am-bg);color:var(--am-tx)">RF</div>
          <div style="flex:1"><div class="pac-nome">Rodrigo Ferreira</div><div class="pac-hora">10:30 · Primeira consulta</div></div>
          <span class="tag tag-wait">Aguardando</span>
        </div>
        <div class="pac-card" onclick="openPac(1)">
          <div class="pac-avatar">CM</div>
          <div style="flex:1"><div class="pac-nome">Carla Menezes</div><div class="pac-hora">11:30 · Retorno</div></div>
          <span class="tag tag-ok">Ficha ok</span>
        </div>
      </div>

      <!-- prontuário -->
      <div id="med-pront" style="display:none">
        <button class="back-btn" onclick="closePac()">← Voltar à lista</button>
        <div class="form-title" id="mp-nome">—</div>
        <div class="form-sub" id="mp-hora">—</div>

        <!-- sub-tabs -->
        <div class="sub-tabs">
          <button class="sub-tab active" id="st-quest" onclick="subTab('quest')">Questionário</button>
          <button class="sub-tab" id="st-anam" onclick="subTab('anam')">Anamnese</button>
          <button class="sub-tab" id="st-trico" onclick="subTab('trico')">Tricoscopia</button>
        </div>

        <!-- ── SUB: Questionário do paciente ── -->
        <div id="sub-quest">
          <div class="sec-head">Dados do paciente</div>
          <div class="info-bloco">
            <div class="info-row"><span class="info-label">Queixa</span><span class="info-val">Queda de cabelo, Falhas</span></div>
            <div class="info-row"><span class="info-label">Tempo / Fios/dia</span><span class="info-val">3 meses · ~80 fios</span></div>
            <div class="info-row"><span class="info-label">Evolução</span><span class="info-val">Aumentando</span></div>
            <div class="info-row"><span class="info-label">Couro cabeludo</span><span class="info-val">Oleosidade, Coceira</span></div>
            <div class="info-row"><span class="info-label">Tratamentos ant.</span><span class="info-val">Shampoo antiqueda, PRP</span></div>
            <div class="info-row"><span class="info-label">Medicação</span><span class="info-val">Levotiroxina 50mcg</span></div>
            <div class="info-row"><span class="info-label">Lava cabelo</span><span class="info-val">Todo dia</span></div>
            <div class="info-row"><span class="info-label">Química</span><span class="info-val">Tintura · a cada 2 meses</span></div>
            <div class="info-row"><span class="info-label">Hist. familiar</span><span class="info-val">Mãe – Tipo I-2</span></div>
          </div>
        </div>

        <!-- ── SUB: Anamnese (Histórico Pessoal preenchido pelo médico) ── -->
        <div id="sub-anam" style="display:none">

          <div class="field">
            <label>Queixa principal (registro médico)</label>
            <textarea id="m-queixa" rows="3" placeholder="Descreva a queixa conforme relatada pelo paciente..."></textarea>
          </div>

          <div class="sec-head">Antecedentes pessoais</div>
          <div class="dx-bloco">
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">1. Doenças Cardíacas</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Qual?"/></div></div>
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">2. Doenças Renais</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Qual?"/></div></div>
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">3. Doenças Cancerígenas</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Qual?"/></div></div>
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">4. Doenças Neurológicas</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Qual?"/></div></div>
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">5. Doenças Hematológicas</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Qual?"/></div></div>
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">6. Doenças Autoimunes</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Qual?"/></div></div>
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">7. Alergia a Medicamentos</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Quais?"/></div></div>
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">8. Internações / Cirurgias recentes</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><textarea rows="2" placeholder="Descreva..."></textarea></div></div>
          </div>

          <div class="field">
            <label>9. Medicamentos em uso</label>
            <textarea id="m-meds" rows="2" placeholder="Liste os medicamentos e doses..."></textarea>
          </div>

          <div class="sec-head">Para mulheres</div>
          <div class="dx-bloco">
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">1. Doenças Ginecológicas</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Qual?"/></div></div>
          </div>

          <div class="field">
            <label>2. Ciclo menstrual</label>
            <div class="pill-group" id="pg-ciclo" data-type="radio">
              <div class="pill" data-val="Regular" onclick="selPill(this)">Regular</div>
              <div class="pill" data-val="Irregular" onclick="selPill(this)">Irregular</div>
              <div class="pill" data-val="Climatério" onclick="selPill(this)">Climatério</div>
              <div class="pill" data-val="Histerectomia" onclick="selPill(this)">Histerectomia</div>
              <div class="pill" data-val="Menopausa" onclick="selPill(this)">Menopausa</div>
            </div>
          </div>

          <div class="row2">
            <div class="field">
              <label>3. SOP</label>
              <div class="pill-group" id="pg-sop" data-type="radio">
                <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
                <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
              </div>
            </div>
            <div class="field"><label>Fluxo</label><input type="text" id="m-fluxo" placeholder="Descreva"/></div>
          </div>

          <div class="field">
            <label>4. Método de prevenção</label>
            <div class="pill-group" id="pg-prev" data-type="multi">
              <div class="pill" data-val="Anticoncepcional" onclick="selPill(this)">Anticoncepcional</div>
              <div class="pill" data-val="Chip da Beleza" onclick="selPill(this)">Chip da Beleza</div>
              <div class="pill" data-val="Laqueadura" onclick="selPill(this)">Laqueadura</div>
              <div class="pill" data-val="DIU" onclick="selPill(this)">DIU</div>
              <div class="pill" data-val="Preservativo" onclick="selPill(this)">Preservativo</div>
              <div class="pill" data-val="Reposição Hormonal" onclick="selPill(this)">Reposição Hormonal</div>
              <div class="pill" data-val="Comp. Vasectomizado" onclick="selPill(this)">Comp. Vasectomizado</div>
            </div>
          </div>

          <div class="field">
            <label>Quer engravidar?</label>
            <div class="pill-group" id="pg-eng" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
          </div>

          <div class="field">
            <label>5. Tem filhos?</label>
            <div class="pill-group" id="pg-filhos" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
          </div>

          <div class="sec-head">Hábitos e estilo de vida</div>
          <div class="field">
            <label>6. Alimentação</label>
            <div class="pill-group" id="pg-alim" data-type="multi">
              <div class="pill" data-val="Carne" onclick="selPill(this)">Carne</div>
              <div class="pill" data-val="Frango" onclick="selPill(this)">Frango</div>
              <div class="pill" data-val="Peixes" onclick="selPill(this)">Peixes</div>
              <div class="pill" data-val="Ovos" onclick="selPill(this)">Ovos</div>
              <div class="pill" data-val="Leite e Derivados" onclick="selPill(this)">Leite e Derivados</div>
              <div class="pill" data-val="Carboidratos" onclick="selPill(this)">Carboidratos</div>
              <div class="pill" data-val="Legumes" onclick="selPill(this)">Legumes</div>
              <div class="pill" data-val="Verduras" onclick="selPill(this)">Verduras</div>
              <div class="pill" data-val="Frutas" onclick="selPill(this)">Frutas</div>
            </div>
          </div>

          <div class="row2">
            <div class="field"><label>Água (litros/dia)</label><input type="text" id="m-agua" placeholder="Ex: 2L"/></div>
          </div>

          <div class="field">
            <label>7. Peso últimos meses</label>
            <div class="pill-group" id="pg-peso" data-type="radio">
              <div class="pill" data-val="Ganhou peso" onclick="selPill(this)">Ganhou peso</div>
              <div class="pill" data-val="Emagreceu" onclick="selPill(this)">Emagreceu</div>
              <div class="pill" data-val="Mantendo" onclick="selPill(this)">Mantendo</div>
            </div>
          </div>

          <div class="field">
            <label>8. Atividade física</label>
            <div class="pill-group" id="pg-atv" data-type="radio">
              <div class="pill" data-val="Não" onclick="selPill(this)">Não</div>
              <div class="pill" data-val="Sim" onclick="selPill(this)">Sim</div>
            </div>
          </div>

          <div class="field">
            <label>9. Hábito intestinal</label>
            <div class="pill-group" id="pg-int" data-type="radio">
              <div class="pill" data-val="Normal" onclick="selPill(this)">Normal</div>
              <div class="pill" data-val="Constipado" onclick="selPill(this)">Constipado</div>
              <div class="pill" data-val="Diarreico" onclick="selPill(this)">Diarreico</div>
            </div>
          </div>

          <div class="field">
            <label>10. Antecedentes familiares</label>
            <div class="pill-group" id="pg-antfam" data-type="multi">
              <div class="pill" data-val="AAG" onclick="selPill(this)">AAG</div>
              <div class="pill" data-val="Alopecia Areata" onclick="selPill(this)">Alopecia Areata</div>
              <div class="pill" data-val="Alopecia Cicatricial" onclick="selPill(this)">Alopecia Cicatricial</div>
            </div>
            <input type="text" id="m-antfam-outras" placeholder="Outras..." style="margin-top:8px;padding:9px 12px;border:1.5px solid var(--cinza-3);border-radius:var(--rsm);font-family:'Inter',sans-serif;font-size:13px;background:var(--cinza-1);width:100%"/>
          </div>

          <button class="btn btn-secondary" onclick="subTab('trico')" style="margin-top:8px">Ir para Tricoscopia →</button>
        </div>

        <!-- ── SUB: Tricoscopia + Hipótese + Tratamento ── -->
        <div id="sub-trico" style="display:none">

          <div class="sec-head">Tricoscopia digital</div>
          <div class="info-bloco" style="padding-bottom:4px">
            <div class="field" style="margin-bottom:12px">
              <label>1. Teste de tração</label>
              <div class="pill-group" id="pg-trac" data-type="radio">
                <div class="pill" data-val="Positivo" onclick="selPill(this)">Positivo</div>
                <div class="pill" data-val="Negativo" onclick="selPill(this)">Negativo</div>
              </div>
            </div>
            <div class="field" style="margin-bottom:12px">
              <label>2. Haste</label>
              <div class="pill-group" id="pg-haste" data-type="radio">
                <div class="pill" data-val="Normal" onclick="selPill(this)">Normal</div>
                <div class="pill" data-val="Ressecada" onclick="selPill(this)">Ressecada</div>
              </div>
            </div>
            <div class="field" style="margin-bottom:12px">
              <label>3. Miniaturização dos fios</label>
              <div class="pill-group" id="pg-mini" data-type="radio">
                <div class="pill" data-val="Ausente" onclick="selPill(this)">Ausente</div>
                <div class="pill" data-val="Presente" onclick="selPill(this)">Presente</div>
              </div>
            </div>
            <div class="field" style="margin-bottom:12px">
              <label>4. Descamação</label>
              <div class="pill-group" id="pg-desc" data-type="radio">
                <div class="pill" data-val="Leve" onclick="selPill(this)">Leve</div>
                <div class="pill" data-val="Moderada" onclick="selPill(this)">Moderada</div>
                <div class="pill" data-val="Intensa" onclick="selPill(this)">Intensa</div>
              </div>
            </div>
            <div style="margin-bottom:14px">
              <div class="scale-inline">
                <span class="scale-lbl">Hiperemia</span>
                <div class="scale-row" id="sc-hip"></div>
              </div>
              <div class="scale-inline">
                <span class="scale-lbl">Oleosidade</span>
                <div class="scale-row" id="sc-ole"></div>
              </div>
              <div class="scale-inline">
                <span class="scale-lbl">Cresc. fios</span>
                <div class="scale-row" id="sc-cres"></div>
              </div>
            </div>
            <div class="field" style="margin-bottom:10px">
              <label>Lesões / observações</label>
              <input type="text" id="t-obs" placeholder="Descreva..."/>
            </div>
            <div class="pill-group" id="pg-outros-trico" data-type="multi" style="margin-bottom:8px">
              <div class="pill" data-val="Pelos cadavéricos" onclick="selPill(this)">Pelos cadavéricos</div>
              <div class="pill" data-val="Falhas" onclick="selPill(this)">Falhas</div>
            </div>
          </div>

          <div class="sec-head">Hipótese diagnóstica</div>
          <div class="dx-bloco">
            <div class="dx-row" id="dr-agg"><div class="dx-row-top"><span class="dx-nome">AGG</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Grau / observação"/></div></div>
            <div class="dx-row" id="dr-aa"><div class="dx-row-top"><span class="dx-nome">Alopecia Areata</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Observação"/></div></div>
            <div class="dx-row" id="dr-ac"><div class="dx-row-top"><span class="dx-nome">Alopecia Cicatricial</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Observação"/></div></div>
            <div class="dx-row" id="dr-ds"><div class="dx-row-top"><span class="dx-nome">Dermatite Seborreica</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Observação"/></div></div>
            <div class="dx-row" id="dr-ef"><div class="dx-row-top"><span class="dx-nome">Eflúvio</span><span class="rp" data-side="nao" onclick="selDx(this,'nao')">Não</span><span class="rp" data-side="sim" onclick="selDx(this,'sim')">Sim</span></div><div class="dx-detail"><input type="text" placeholder="Tipo (telógeno / anágeno)"/></div></div>
            <div class="dx-row"><div class="dx-row-top"><span class="dx-nome">Outras hipóteses</span></div><div class="dx-detail"><input type="text" id="dx-outras" placeholder="Diagnósticos adicionais"/></div></div>
          </div>

          <div class="sec-head">Tratamento proposto</div>
          <div class="trat-box">
            <div class="trat-tit">Conduta médica</div>
            <textarea id="m-trat" rows="5" placeholder="Ex: Minoxidil 5% 1mL 2x/dia&#10;Fórmula oral: Biotina 10mg + Zinco&#10;Mesoterapia 1x/mês · 4 meses&#10;Retorno em 60 dias"></textarea>
          </div>

          <button class="btn btn-save" onclick="salvarPront()">Salvar prontuário</button>
          <button class="btn btn-pdf" onclick="gerarPDF()">📄 Gerar PDF para impressão</button>
          <div class="loader-wrap" id="pdf-loader">
            <div class="spinner"></div>
            <div class="loader-txt">Gerando PDF…</div>
          </div>
        </div>

      </div><!-- /med-pront -->
    </div><!-- /screen-med -->

  </div><!-- /content -->

<!-- ── MODAL SENHA ── -->
<div id="modal-senha" style="
  display:none; position:fixed; inset:0; z-index:500;
  background:rgba(1,52,37,.7); backdrop-filter:blur(4px);
  align-items:center; justify-content:center;
">
  <div style="
    background:#fff; border-radius:16px; padding:32px 28px;
    width:300px; box-shadow:0 20px 60px rgba(0,0,0,.3); text-align:center;
  ">
    <div style="font-size:32px; margin-bottom:12px">🔒</div>
    <div style="font-family:'Inter',sans-serif; font-size:17px; font-weight:700; color:#013425; margin-bottom:6px">Área Médica</div>
    <div style="font-family:'Inter',sans-serif; font-size:13px; color:#888; margin-bottom:20px">Digite a senha para continuar</div>
    <input
      type="password" id="input-senha"
      placeholder="••••••"
      onkeydown="if(event.key==='Enter')confirmarSenha()"
      style="
        width:100%; padding:12px 16px; font-size:16px; letter-spacing:4px;
        border:1.5px solid #d1d5db; border-radius:10px; outline:none;
        font-family:'Inter',sans-serif; text-align:center; margin-bottom:8px;
      "
    />
    <div id="senha-erro" style="font-size:12px; color:#dc2626; min-height:18px; margin-bottom:12px"></div>
    <button onclick="confirmarSenha()" style="
      width:100%; padding:13px; border-radius:10px; border:none;
      background:#C5A365; color:#fff; font-family:'Inter',sans-serif;
      font-size:14px; font-weight:700; cursor:pointer; margin-bottom:10px;
    ">Entrar</button>
    <button onclick="fecharSenha()" style="
      width:100%; padding:10px; border-radius:10px; border:1.5px solid #e8ece9;
      background:#fff; color:#666; font-family:'Inter',sans-serif;
      font-size:13px; cursor:pointer;
    ">Cancelar</button>
  </div>
</div>

</div><!-- /shell -->
<div class="toast" id="toast"></div>

<script>
// 1. Carregar o SDK do Supabase const { createClient } = supabase; // 2. Inicializar (substitua pelos seus valores) const sb = https://yxoedniamdyvoefmfrip.supabase.co; // 3. Salvar quando paciente enviar async function salvarQuestionario(dados) { const { error } = await sb .from('questionario') .insert(dados); if (error) console.error(error); }
// ── data automática ──────────────────────────────────
const hoje = new Date();
document.getElementById('p-data').value =
  hoje.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric'});

// ── tabs ─────────────────────────────────────────────
function switchTab(t) {
  ['pac','med'].forEach(x => {
    document.getElementById('tab-'+x).classList.toggle('active', x===t);
    document.getElementById('screen-'+x).classList.toggle('active', x===t);
  });
}

// ── sub-tabs médico ───────────────────────────────────
function subTab(t) {
  ['quest','anam','trico'].forEach(x => {
    document.getElementById('st-'+x).classList.toggle('active', x===t);
    document.getElementById('sub-'+x).style.display = x===t ? 'block' : 'none';
  });
  window.scrollTo({top:0, behavior:'smooth'});
}

// ── steps ─────────────────────────────────────────────
let currentStep = 1;
function goStep(n) {
  document.getElementById('step'+currentStep).style.display = 'none';
  currentStep = n;
  document.getElementById('step'+n).style.display = 'block';
  window.scrollTo({top:0, behavior:'smooth'});
}

// ── pill universal ────────────────────────────────────
function selPill(pill) {
  const g = pill.closest('.pill-group');
  const tipo = g.getAttribute('data-type');
  if (tipo === 'radio') {
    g.querySelectorAll('.pill').forEach(p => p.classList.remove('sel'));
    pill.classList.add('sel');
  } else {
    pill.classList.toggle('sel');
  }
  // side-effects
  const id = g.id;
  const v = getVal(id);
  if (id==='pg-conv')   toggle('p-conv-qual',  v==='Sim');
  if (id==='pg-crise')  toggle('p-crise-q',    v==='Sim');
  if (id==='pg-tratou') toggle('p-trat-q',     v==='Sim');
  if (id==='pg-med')    toggle('p-med-q',      v==='Sim');
  if (id==='pg-quim')   toggle('quim-detail',  v==='Sim');
  if (id==='pg-chap')   toggle('p-chap-freq',  v==='Sim');
  if (id==='pg-along')  toggle('p-along-t',    v==='Sim');
}
function toggle(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? 'block' : 'none';
}
function getVal(gid) {
  const s = document.querySelector('#'+gid+' .pill.sel');
  return s ? s.getAttribute('data-val') : '';
}
function getVals(gid) {
  return [...document.querySelectorAll('#'+gid+' .pill.sel')].map(p => p.getAttribute('data-val'));
}

// ── queda onde ────────────────────────────────────────
const quedaState = {};
function selSN(btn, key, val) {
  btn.closest('.sn-pair').querySelectorAll('.sn-btn').forEach(b => b.classList.remove('sel-s','sel-n'));
  btn.classList.add(val==='S' ? 'sel-s' : 'sel-n');
  quedaState[key] = val==='S' ? 'Sim' : 'Não';
}

// ── toggle dx (anamnese): padrão = Não visível, Sim oculto
//    ao clicar Sim: some o Não, fica só Sim
//    ao clicar Não (voltar): some o Sim, fica só Não
function selDx(el, tipo) {
  const row = el.closest('.dx-row');
  const btnNao = row.querySelector('.rp[data-side="nao"]');
  const btnSim = row.querySelector('.rp[data-side="sim"]');
  const detail = row.querySelector('.dx-detail');

  function resetDx() {
    // volta os dois botões, sem seleção, sem detalhe
    btnNao.style.display = 'inline-flex';
    btnSim.style.display = 'inline-flex';
    btnNao.classList.remove('sel-nao','sel-sim');
    btnSim.classList.remove('sel-sim','sel-nao');
    // remove × de ambos
    [btnNao, btnSim].forEach(b => { const x = b.querySelector('.rp-x'); if(x) x.remove(); });
    if (detail) detail.style.display = 'none';
  }

  function addX(btn) {
    // remove × existentes antes de adicionar
    [btnNao, btnSim].forEach(b => { const x = b.querySelector('.rp-x'); if(x) x.remove(); });
    const x = document.createElement('span');
    x.className = 'rp-x';
    x.textContent = '×';
    x.onclick = function(e) { e.stopPropagation(); resetDx(); };
    btn.appendChild(x);
  }

  if (tipo === 'sim') {
    btnNao.style.display = 'none';
    btnSim.style.display = 'inline-flex';
    btnSim.classList.add('sel-sim');
    btnSim.classList.remove('sel-nao');
    addX(btnSim);
    if (detail) detail.style.display = 'block';
  } else {
    btnSim.style.display = 'none';
    btnSim.classList.remove('sel-sim');
    btnNao.style.display = 'inline-flex';
    btnNao.classList.add('sel-nao');
    btnNao.classList.remove('sel-sim');
    addX(btnNao);
    if (detail) detail.style.display = 'none';
  }
}



// ── escalas /4 ────────────────────────────────────────
['hip','ole','cres'].forEach(key => {
  const w = document.getElementById('sc-'+key);
  for (let i=0; i<=4; i++) {
    const b = document.createElement('button');
    b.className='scale-btn'; b.textContent=i; b.type='button';
    b.onclick = () => { w.querySelectorAll('.scale-btn').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); };
    w.appendChild(b);
  }
});

// ── SVG calvície ──────────────────────────────────────
function svgM(flags) {
  let p = `<ellipse cx="22" cy="26" rx="18" ry="22" fill="#F5E6D0" stroke="#C9AA8A" stroke-width="1"/>`;
  if (!flags.includes('f-total')) {
    const ry = flags.includes('f-forte') ? 9  : flags.includes('f-mod') ? 13 : flags.includes('f-leve') ? 17 : 20;
    const cy = flags.includes('f-forte') ? 40 : flags.includes('f-mod') ? 37 : flags.includes('f-leve') ? 34 : 30;
    p += `<ellipse cx="22" cy="${cy}" rx="14" ry="${ry}" fill="#4A2C1A" opacity=".8"/>`;
  }
  if (flags.includes('v-sm'))  p += `<ellipse cx="22" cy="24" rx="5"  ry="5"  fill="#F5E6D0" stroke="#C9AA8A" stroke-width=".5"/>`;
  if (flags.includes('v-md'))  p += `<ellipse cx="22" cy="24" rx="9"  ry="9"  fill="#F5E6D0" stroke="#C9AA8A" stroke-width=".5"/>`;
  if (flags.includes('v-lg'))  p += `<ellipse cx="22" cy="24" rx="13" ry="13" fill="#F5E6D0" stroke="#C9AA8A" stroke-width=".5"/>`;
  if (flags.includes('v-xl'))  p += `<ellipse cx="22" cy="24" rx="15" ry="17" fill="#F5E6D0" stroke="#C9AA8A" stroke-width=".5"/>`;
  if (flags.includes('f-mid')) p += `<rect x="9" y="6" width="26" height="9" rx="3" fill="#F5E6D0" opacity=".9"/>`;
  return `<svg viewBox="0 0 44 52" width="38" height="46" xmlns="http://www.w3.org/2000/svg">${p}</svg>`;
}

function svgF(w) {
  // w = largura da zona de afinamento central (0..32)
  let p = `<ellipse cx="22" cy="28" rx="18" ry="22" fill="#F5E6D0" stroke="#C9AA8A" stroke-width="1"/>`;
  p += `<path d="M4,20 Q4,6 22,6 Q40,6 40,20 Q38,13 22,13 Q6,13 4,20Z" fill="#4A2C1A" opacity=".8"/>`;
  if (w > 0) p += `<rect x="${22-w/2}" y="6" width="${w}" height="28" rx="2" fill="#F0D8BE" opacity=".9"/>`;
  p += `<line x1="22" y1="5" x2="22" y2="33" stroke="#C9AA8A" stroke-width=".8" stroke-dasharray="2,2"/>`;
  return `<svg viewBox="0 0 44 52" width="38" height="46" xmlns="http://www.w3.org/2000/svg">${p}</svg>`;
}

const tiposM = [
  {label:'Tipo I',    svg: svgM([])},
  {label:'Tipo II',   svg: svgM(['f-leve'])},
  {label:'Tipo IIa',  svg: svgM(['f-leve','f-mid'])},
  {label:'Tipo III',  svg: svgM(['f-mod'])},
  {label:'Tipo IIIv', svg: svgM(['f-mod','v-sm'])},
  {label:'Tipo IV',   svg: svgM(['f-mod','v-md'])},
  {label:'Tipo IVa',  svg: svgM(['f-forte'])},
  {label:'Tipo V',    svg: svgM(['f-forte','v-lg'])},
  {label:'Tipo VI',   svg: svgM(['f-total','v-lg'])},
  {label:'Tipo VII',  svg: svgM(['f-total','v-xl'])},
];
const tiposF = [
  {label:'I-1',    svg: svgF(3)},
  {label:'I-2',    svg: svgF(7)},
  {label:'I-3',    svg: svgF(12)},
  {label:'I-4',    svg: svgF(17)},
  {label:'II-1',   svg: svgF(20)},
  {label:'II-2',   svg: svgF(24)},
  {label:'III',    svg: svgF(28)},
  {label:'Frontal',svg: svgF(32)},
];

// ── familiar ──────────────────────────────────────────
let famCount = 0;
const famData = {};

function addFamEntrada() {
  const id = 'fam' + (++famCount);
  famData[id] = {parentesco:'', sexo:'', tipo:''};
  const w = document.createElement('div');
  w.className = 'fam-entrada'; w.id = id;
  w.innerHTML = `
    <div class="fam-top">
      <input type="text" placeholder="Parentesco (ex: Mãe)" oninput="famData['${id}'].parentesco=this.value"/>
      <div></div>
    </div>
    <div style="margin-bottom:8px">
      <div class="lbl" style="margin-bottom:6px">Sexo</div>
      <div class="pill-group" data-type="radio" style="gap:8px">
        <div class="pill" data-val="M" onclick="setFamSexo('${id}','M',this)">Masculino</div>
        <div class="pill" data-val="F" onclick="setFamSexo('${id}','F',this)">Feminino</div>
      </div>
    </div>
    <div id="${id}-tipos" style="display:none">
      <div class="lbl" style="margin-bottom:8px">Selecione o tipo de calvície</div>
      <div id="${id}-grid" class="tipos-grid"></div>
    </div>
    <div class="fam-sel" id="${id}-sel">Nenhum tipo selecionado</div>
  `;
  document.getElementById('fam-entradas').appendChild(w);
}

function setFamSexo(id, sexo, pill) {
  pill.closest('.pill-group').querySelectorAll('.pill').forEach(p => p.classList.remove('sel'));
  pill.classList.add('sel');
  famData[id].sexo = sexo; famData[id].tipo = '';
  document.getElementById(id+'-sel').innerHTML = 'Nenhum tipo selecionado';
  const grid = document.getElementById(id+'-grid');
  grid.innerHTML = '';
  const tipos = sexo === 'M' ? tiposM : tiposF;
  tipos.forEach(t => {
    const c = document.createElement('div');
    c.className = 'tipo-card';
    c.innerHTML = t.svg + `<div class="tlbl">${t.label}</div>`;
    c.onclick = () => {
      grid.querySelectorAll('.tipo-card').forEach(x => x.classList.remove('sel'));
      c.classList.add('sel');
      famData[id].tipo = t.label;
      const par = famData[id].parentesco || 'Familiar';
      document.getElementById(id+'-sel').innerHTML = `<span>${par} – ${t.label}</span>`;
    };
    grid.appendChild(c);
  });
  document.getElementById(id+'-tipos').style.display = 'block';
}

addFamEntrada();
addFamEntrada();

// ── submit paciente ───────────────────────────────────
function submitPac() {
  if (!document.getElementById('p-decl').checked) { showToast('Marque a declaração de veracidade'); return; }
  document.getElementById('pac-form').style.display = 'none';
  document.getElementById('pac-ok').style.display = 'block';
  showToast('Questionário enviado!');
}

// ── médico ────────────────────────────────────────────
const pacientes = [
  {nome:'Ana Beatriz Silva', hora:'09:00 · Queda de cabelo'},
  {nome:'Carla Menezes',     hora:'11:30 · Retorno'},
];
function openPac(idx) {
  document.getElementById('med-lista').style.display = 'none';
  document.getElementById('med-pront').style.display = 'block';
  document.getElementById('mp-nome').textContent = pacientes[idx].nome;
  document.getElementById('mp-hora').textContent = pacientes[idx].hora;
  subTab('quest');
  window.scrollTo({top:0, behavior:'smooth'});
}
function closePac() {
  document.getElementById('med-pront').style.display = 'none';
  document.getElementById('med-lista').style.display = 'block';
}
function salvarPront() { showToast('Prontuário salvo com sucesso!'); }

// ── gerar PDF ─────────────────────────────────────────
async function gerarPDF() {
  document.getElementById('pdf-loader').style.display = 'flex';
  await loadJsPDF();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({orientation:'portrait', unit:'mm', format:'a4'});

  const W=210, PX=15;
  const VERDE=[1,52,37], GOLD=[197,163,101], GOLD_CLR=[253,245,232];
  const CINZA_BG=[248,249,248], CINZA_BD=[220,224,221];
  let y = 0;

  // ── helpers ──────────────────────────────────────────
  function checkPage(needed=20) {
    if (y + needed > 278) { doc.addPage(); y = 15; }
  }

  function cabecalho() {
    doc.setFillColor(...VERDE); doc.rect(0,0,W,24,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(17); doc.setTextColor(255,255,255);
    doc.text('TricoMaster', PX, 13);
    doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...GOLD);
    doc.text('Medicina Capilar', PX, 19.5);
    doc.setTextColor(255,255,255);
    doc.text('PRONTUÁRIO · '+hoje.toLocaleDateString('pt-BR'), W-PX, 13, {align:'right'});
    y = 32;
  }

  function pacHeader(nome, hora) {
    doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(20,20,20);
    doc.text(nome, PX, y);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(120,120,120);
    doc.text(hora, PX, y+6);
    y += 13;
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.8); doc.line(PX,y,W-PX,y);
    y += 7;
  }

  function secHead(txt) {
    checkPage(14);
    doc.setFillColor(...VERDE); doc.roundedRect(PX,y,W-PX*2,7,2,2,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(255,255,255);
    doc.text(txt, PX+4, y+5); y += 11;
  }

  function bloco(pares) {
    // calc total height first
    let th = 6;
    pares.forEach(([,v]) => {
      th += Math.max(doc.splitTextToSize(String(v||'—'), W-PX-68).length*5, 6) + 2;
    });
    checkPage(th+6);
    doc.setFillColor(...CINZA_BG); doc.roundedRect(PX,y-1,W-PX*2,th+4,3,3,'F');
    doc.setDrawColor(...CINZA_BD); doc.setLineWidth(0.3); doc.roundedRect(PX,y-1,W-PX*2,th+4,3,3,'D');
    pares.forEach(([l,v]) => {
      doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(130,130,130);
      doc.text(l, PX+4, y+4);
      const lines = doc.splitTextToSize(String(v||'—'), W-PX-68);
      doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(25,25,25);
      doc.text(lines, 76, y+4);
      const rh = Math.max(lines.length*5, 6)+2;
      // separator line
      doc.setDrawColor(...CINZA_BD); doc.setLineWidth(0.2);
      doc.line(PX+2, y+rh+1, W-PX-2, y+rh+1);
      y += rh;
    });
    y += 7;
  }

  function blocoVerde(txt) {
    const lines = doc.splitTextToSize(txt||'Não informado', W-PX*2-12);
    const th = lines.length*5.5 + 12;
    checkPage(th+4);
    doc.setFillColor(...GOLD_CLR);
    doc.roundedRect(PX,y-1,W-PX*2,th,3,3,'F');
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.4);
    doc.roundedRect(PX,y-1,W-PX*2,th,3,3,'D');
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5);
    doc.setTextColor(...VERDE);
    doc.text(lines, PX+6, y+7);
    y += th+5;
  }

  // ── getters ───────────────────────────────────────────
  // paciente
  function pv(id)  { const s=document.querySelector('#'+id+' .pill.sel'); return s?s.getAttribute('data-val'):'—'; }
  function pvs(id) { const ss=[...document.querySelectorAll('#'+id+' .pill.sel')]; return ss.length?ss.map(s=>s.getAttribute('data-val')).join(', '):'—'; }
  function ptxt(id){ return document.getElementById(id)?.value?.trim()||'—'; }

  // histórico familiar
  function getFamiliar() {
    const entradas = [];
    Object.keys(famData).forEach(id => {
      const d = famData[id];
      if (d.parentesco || d.tipo) entradas.push((d.parentesco||'?')+' – '+(d.tipo||'?'));
    });
    return entradas.length ? entradas.join(' | ') : '—';
  }

  // queda onde
  function getQueda() {
    const map = {qb:'No banho',qe:'Ao escovar',qc:'No chão',qr:'Na roupa',qt:'No travesseiro'};
    const sim = Object.entries(quedaState).filter(([,v])=>v==='Sim').map(([k])=>map[k]||k);
    return sim.length ? sim.join(', ') : '—';
  }

  // médico — antecedentes (dx-row sem id)
  function getAntecedente(nome) {
    const all = [...document.querySelectorAll('.dx-row')];
    const row = all.find(r => !r.id && r.querySelector('.dx-nome')?.textContent.includes(nome));
    if (!row) return '—';
    const sim = row.querySelector('.rp.sel-sim');
    const nao = row.querySelector('.rp.sel-nao');
    if (!sim && !nao) return '—';
    if (nao) return 'Não';
    const det = row.querySelector('.dx-detail input, .dx-detail textarea');
    const v = det?.value?.trim();
    return 'Sim' + (v ? ' – '+v : '');
  }

  // médico — hipótese (dx-row com id)
  function gdx(rowId) {
    const r = document.getElementById(rowId);
    if (!r) return '—';
    const sim = r.querySelector('.rp.sel-sim');
    const nao = r.querySelector('.rp.sel-nao');
    if (!sim && !nao) return '—';
    if (nao) return 'Não';
    const det = r.querySelector('.dx-detail input, .dx-detail textarea');
    const v = det?.value?.trim();
    return 'Sim' + (v ? ' – '+v : '');
  }

  // médico — escalas
  function gsc(id) { const s=document.querySelector('#'+id+' .scale-btn.sel'); return s?s.textContent+'/4':'—'; }
  // médico — pills
  function gv(id)  { const s=document.querySelector('#'+id+' .pill.sel'); return s?s.getAttribute('data-val'):'—'; }
  function gvs(id) { const ss=[...document.querySelectorAll('#'+id+' .pill.sel')]; return ss.length?ss.map(s=>s.getAttribute('data-val')).join(', '):'—'; }

  // ═══════════════════════════════════════════════════
  // PÁGINA 1 — QUESTIONÁRIO DO PACIENTE
  // ═══════════════════════════════════════════════════
  cabecalho();
  const nomePac = document.getElementById('mp-nome').textContent;
  const horaPac = document.getElementById('mp-hora').textContent;
  pacHeader(nomePac, horaPac);

  // identificação
  secHead('IDENTIFICAÇÃO DO PACIENTE');
  bloco([
    ['Nome',           ptxt('p-nome')||nomePac],
    ['Idade',          ptxt('p-idade') !== '—' ? ptxt('p-idade')+' anos' : '—'],
    ['Profissão',      ptxt('p-prof')],
    ['Data',           ptxt('p-data')],
    ['Convênio',       pv('pg-conv') + (ptxt('p-conv-qual')!=='—' ? ' – '+ptxt('p-conv-qual') : '')],
    ['Como nos conheceu', pvs('pg-conheceu')],
  ]);

  secHead('1. QUEIXA PRINCIPAL');
  bloco([
    ['Tipo de queixa',   pvs('pg-queixa')],
    ['Tempo do problema',ptxt('p-tempo')],
    ['Fios por dia',     ptxt('p-fios')],
    ['Evolução',         pv('pg-prog')],
    ['Queda onde ocorre',getQueda()],
  ]);

  secHead('3. ALTERAÇÕES NO COURO CABELUDO');
  bloco([['Alterações', pvs('pg-couro')]]);

  secHead('4–5. CRISES E TRATAMENTOS ANTERIORES');
  bloco([
    ['Outras crises anteriores', pv('pg-crise') + (ptxt('p-crise-q')!=='—' ? ' – '+ptxt('p-crise-q') : '')],
    ['Já fez tratamento',        pv('pg-tratou') + (ptxt('p-trat-q')!=='—' ? ' – '+ptxt('p-trat-q') : '')],
    ['Tipos de tratamento',      pvs('pg-trattipos')],
  ]);

  secHead('6–9. HÁBITOS CAPILARES');
  bloco([
    ['Medicação em uso',    pv('pg-med') + (ptxt('p-med-q')!=='—' ? ' – '+ptxt('p-med-q') : '')],
    ['Frequência lavagem',  pv('pg-lav')],
    ['Química no cabelo',   pv('pg-quim') + (pvs('pg-quimtipo')!=='—' ? ' – '+pvs('pg-quimtipo') : '') + (ptxt('p-quim-freq')!=='—' ? ' ('+ptxt('p-quim-freq')+')' : '')],
    ['Últimos 4 meses',     ptxt('p-quim-4m')],
    ['Chapinha / Escova',   pv('pg-chap') + (ptxt('p-chap-freq')!=='—' ? ' – '+ptxt('p-chap-freq') : '')],
    ['Alongamento',         pv('pg-along') + (ptxt('p-along-t')!=='—' ? ' – '+ptxt('p-along-t') : '')],
  ]);

  secHead('10. HISTÓRICO FAMILIAR DE CALVÍCIE');
  bloco([['Histórico familiar', getFamiliar()]]);

  // ═══════════════════════════════════════════════════
  // PÁGINA 2 — ANAMNESE DO MÉDICO
  // ═══════════════════════════════════════════════════
  doc.addPage(); y = 15;
  cabecalho();
  pacHeader(nomePac, horaPac + ' · Anamnese médica');

  secHead('QUEIXA PRINCIPAL — REGISTRO MÉDICO');
  bloco([['Queixa (médico)', ptxt('m-queixa')]]);

  secHead('ANTECEDENTES PESSOAIS');
  bloco([
    ['1. Doenças Cardíacas',        getAntecedente('Cardíacas')],
    ['2. Doenças Renais',           getAntecedente('Renais')],
    ['3. Doenças Cancerígenas',     getAntecedente('Cancerígenas')],
    ['4. Doenças Neurológicas',     getAntecedente('Neurológicas')],
    ['5. Doenças Hematológicas',    getAntecedente('Hematológicas')],
    ['6. Doenças Autoimunes',       getAntecedente('Autoimunes')],
    ['7. Alergia a Medicamentos',   getAntecedente('Alergia')],
    ['8. Internações / Cirurgias',  getAntecedente('Internações')],
    ['9. Medicamentos em uso',      ptxt('m-meds')],
  ]);

  secHead('PARA MULHERES');
  bloco([
    ['1. Doenças Ginecológicas', getAntecedente('Ginecológicas')],
    ['2. Ciclo menstrual',       gv('pg-ciclo')],
    ['3. SOP / Fluxo',          gv('pg-sop') + (ptxt('m-fluxo')!=='—' ? ' – '+ptxt('m-fluxo') : '')],
    ['4. Método de prevenção',  gvs('pg-prev')],
    ['Quer engravidar',         gv('pg-eng')],
    ['5. Tem filhos',           gv('pg-filhos')],
  ]);

  secHead('HÁBITOS E ESTILO DE VIDA');
  bloco([
    ['6. Alimentação',         gvs('pg-alim')],
    ['Água (litros/dia)',      ptxt('m-agua')],
    ['7. Peso últimos meses',  gv('pg-peso')],
    ['8. Atividade física',    gv('pg-atv')],
    ['9. Hábito intestinal',   gv('pg-int')],
    ['10. Ant. familiares',    gvs('pg-antfam') + (ptxt('m-antfam-outras')!=='—' ? ' / '+ptxt('m-antfam-outras') : '')],
  ]);

  // ═══════════════════════════════════════════════════
  // PÁGINA 3 — TRICOSCOPIA + HIPÓTESE + TRATAMENTO
  // ═══════════════════════════════════════════════════
  doc.addPage(); y = 15;
  cabecalho();
  pacHeader(nomePac, horaPac + ' · Tricoscopia e conduta');

  secHead('TRICOSCOPIA DIGITAL');
  bloco([
    ['1. Teste de tração',       gv('pg-trac')],
    ['2. Haste',                 gv('pg-haste')],
    ['3. Miniaturização fios',   gv('pg-mini')],
    ['4. Descamação',            gv('pg-desc')],
    ['Hiperemia',                gsc('sc-hip')],
    ['Oleosidade',               gsc('sc-ole')],
    ['Crescimento fios',         gsc('sc-cres')],
    ['Pelos cadavéricos/falhas', gvs('pg-outros-trico')],
    ['Lesões / observações',     ptxt('t-obs')],
  ]);

  secHead('HIPÓTESE DIAGNÓSTICA');
  bloco([
    ['AGG',                  gdx('dr-agg')],
    ['Alopecia Areata',      gdx('dr-aa')],
    ['Alopecia Cicatricial', gdx('dr-ac')],
    ['Dermatite Seborreica', gdx('dr-ds')],
    ['Eflúvio',              gdx('dr-ef')],
    ['Outras hipóteses',     ptxt('dx-outras')],
  ]);

  secHead('TRATAMENTO PROPOSTO');
  blocoVerde(ptxt('m-trat'));

  // assinaturas
  checkPage(30);
  y += 4;
  doc.setDrawColor(180,180,180); doc.setLineWidth(0.4);
  doc.line(PX, y+10, 90, y+10);
  doc.line(120, y+10, W-PX, y+10);
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(140,140,140);
  doc.text('Assinatura do médico', PX, y+16);
  doc.text('Assinatura do paciente', 120, y+16);
  y += 24;

  // rodapé todas as páginas
  const total = doc.getNumberOfPages();
  for (let i=1; i<=total; i++) {
    doc.setPage(i);
    doc.setFontSize(7); doc.setTextColor(170,170,170);
    doc.text('TricoMaster · Medicina Capilar · Documento gerado eletronicamente · '+new Date().toLocaleString('pt-BR')+' · Página '+i+' de '+total, W/2, 291, {align:'center'});
  }

  doc.save('prontuario_'+nomePac.replace(/ /g,'_')+'.pdf');
  document.getElementById('pdf-loader').style.display = 'none';
  showToast('PDF gerado — '+total+' páginas!');
}

async function loadJsPDF() {
  if (window.jspdf) return;
  await new Promise((res,rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
}


// ── controle de acesso médico ─────────────────────────
const SENHA_MEDICO = '1234'; // altere aqui
let medicoAutenticado = false;

function pedirSenha() {
  if (medicoAutenticado) { switchTab('med'); return; }
  document.getElementById('modal-senha').style.display = 'flex';
  document.getElementById('input-senha').value = '';
  document.getElementById('senha-erro').textContent = '';
  setTimeout(() => document.getElementById('input-senha').focus(), 100);
}

function confirmarSenha() {
  const v = document.getElementById('input-senha').value;
  if (v === SENHA_MEDICO) {
    medicoAutenticado = true;
    fecharSenha();
    switchTab('med');
  } else {
    document.getElementById('senha-erro').textContent = 'Senha incorreta. Tente novamente.';
    document.getElementById('input-senha').value = '';
    document.getElementById('input-senha').focus();
  }
}

function fecharSenha() {
  document.getElementById('modal-senha').style.display = 'none';
}

// fecha modal clicando fora
document.getElementById('modal-senha').addEventListener('click', function(e) {
  if (e.target === this) fecharSenha();
});

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
</script>
</body>
</html>

// ─── ESTADO ──────────────────────────────────────────────────────────────────

let appData = {
    config: { nome:'TricoMaster Medicina Capilar', logoUrl:'', tel:'(11) 2091.7855', wpp:'(11) 93073.1230', end1:'Rua Emílio Mallet, 1166', end2:'Rua Conselheiro Saraiva, 306 / Sala 115' },
    avulsos: [],
    kits: [],
    protocolos: [],
    orcamentos: [],
    medicos: [],  // { id, nome, crm }
};

let ui = {
    userId: null, userDocRef: null,
    perfil: 'admin',            // 'admin' | 'medico'
    viewAtiva: 'orcamentos',
    tabProduto: 'avulso',
    modalTipo: 'avulso',
    modalOrcTipo: 'avulso',
    orcTab: 'protocolo',        // 'protocolo' | 'itens'
    protoTab: 'fases',          // 'fases' | 'avulso'
    faseEditandoId: null,
    orcFaseEditandoId: null,
    kitEmEdicao: [],
    protocoloEmEdicao: null,
    orcamentoEmEdicao: null,
    // paginação
    orcPage: 1, orcSearch: '',
    protoPage: 1, protoSearch: '',
    avulsoPage: 1, avulsoSearch: '',
    kitPage: 1, kitSearch: '',
    PER_PAGE: 10,
};

const app = {};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

app.fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(isNaN(v)?0:v);
app.uid = () => { try { return db.collection('_').doc().id; } catch(e) { return 'l'+Date.now()+Math.random().toString(36).slice(2,6); } };
app.el  = id => document.getElementById(id);
app.val = id => { const e=app.el(id); return e?e.value:''; };
app.setVal = (id,v) => { const e=app.el(id); if(e) e.value = v??''; };
app.show = (id, flex=false) => { const e=app.el(id); if(e) e.style.display=flex?'flex':'block'; };
app.hide = id => { const e=app.el(id); if(e) e.style.display='none'; };

app.toast = (msg, type='ok') => {
    const t = app.el('toast');
    t.textContent = msg;
    t.className = `toast ${type}`;
    t.classList.add('show');
    clearTimeout(app._toastTimer);
    app._toastTimer = setTimeout(()=>t.classList.remove('show'), 3000);
};

app.paginate = (lista, page, perPage) => {
    const total = lista.length;
    const pages = Math.max(1, Math.ceil(total/perPage));
    const p = Math.min(Math.max(1,page), pages);
    return { items: lista.slice((p-1)*perPage, p*perPage), page:p, pages, total };
};

app.renderPag = (containerId, page, pages, total, onPrev, onNext) => {
    const c = app.el(containerId);
    if (!c) return;
    if (pages <= 1) { c.style.display='none'; return; }
    c.style.display = 'flex';
    c.innerHTML = `
        <span>${total} item${total!==1?'s':''}</span>
        <div class="pag-btns">
            <button class="pag-btn" onclick="${onPrev}" ${page<=1?'disabled':''}>‹ Anterior</button>
            <span style="padding:4px 10px;font-size:13px;color:#555;">Pág ${page}/${pages}</span>
            <button class="pag-btn" onclick="${onNext}" ${page>=pages?'disabled':''}>Próximo ›</button>
        </div>`;
};

// ─── FIREBASE / LOCAL ─────────────────────────────────────────────────────────

app.init = () => {
    // Capitalizar primeira letra de cada palavra em inputs de texto
    document.addEventListener('input', e => {
        const el = e.target;
        if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') return;
        if (['number','date','email','password','search'].includes(el.type)) return;
        if (!el.classList.contains('input-std')) return;
        const pos = el.selectionStart;
        el.value = el.value.replace(/(?:^|\s)\S/g, c => c.toUpperCase());
        try { el.setSelectionRange(pos, pos); } catch(_) {}
    });
    app.el('login-form').addEventListener('submit', app.handleLogin);

    auth.onAuthStateChanged(async user => {
        if (user) {
            ui.userId = user.uid;
            ui.userDocRef = db.collection('clinicas_v7').doc(user.uid);
            app.hide('login-view');
            app.show('loading-view', true);
            await app.loadPerfil(user.uid);
            await app.loadData();
            app.hide('loading-view');
            app.el('app-view').classList.add('visible');
            app.aplicarRestricaoPerfil();
            app.navigate('orcamentos');
        } else {
            app.show('login-view', true);
            app.hide('loading-view');
            app.el('app-view').classList.remove('visible');
        }
    });
};

app.handleLogin = e => {
    e.preventDefault();
    const btn = app.el('btn-login'), err = app.el('login-error');
    err.style.display = 'none'; btn.disabled = true; btn.textContent = 'Entrando...';
    auth.signInWithEmailAndPassword(app.val('login-email'), app.val('login-password'))
        .catch(() => { err.textContent='E-mail ou senha inválidos.'; err.style.display='block'; btn.disabled=false; btn.textContent='Entrar'; });
};

app.handleLogout = () => {
    if (confirm('Sair do sistema?')) auth.signOut();
};

// ─── PERFIL / RESTRIÇÃO ──────────────────────────────────────────────────────

app.loadPerfil = async (uid) => {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            ui.perfil = doc.data().perfil || 'medico';
        } else {
            // Primeiro acesso: cria como admin (só o primeiro usuário)
            // Para outros usuários, crie manualmente no console do Firebase
            ui.perfil = 'admin';
        }
    } catch(e) {
        console.warn('Erro ao carregar perfil, assumindo médico por segurança.');
        ui.perfil = 'medico';
    }
};

app.aplicarRestricaoPerfil = () => {
    const isMedico = ui.perfil === 'medico';
    // Esconder itens do menu que médico não pode acessar
    ['nav-protocolos', 'nav-produtos', 'nav-config'].forEach(id => {
        const el = app.el(id);
        if (el) el.style.display = isMedico ? 'none' : '';
    });
    // Médico não pode navegar para outras seções
    if (isMedico) {
        // Sobrescrever navigate para bloquear
        const _navigate = app.navigate.bind(app);
        app.navigate = (view) => {
            if (view !== 'orcamentos') {
                app.toast('Acesso restrito.', 'err');
                return;
            }
            _navigate(view);
        };
    }
};


app.loadData = async () => {
    try {
        const doc = await ui.userDocRef.get();
        if (doc.exists) {
            const d = doc.data();
            appData = { ...appData, ...d, config: { ...appData.config, ...(d.config || {}) } };
        } else {
            // Primeiro acesso: cria documento com dados padrão
            await ui.userDocRef.set(appData);
        }
    } catch(e) {
        console.error('Erro ao carregar:', e);
        app.toast('Erro ao carregar dados.', 'err');
    }
};

app.save = async col => {
    if (!ui.userDocRef) return;
    try {
        // set com merge garante que funciona mesmo se o campo não existia antes
        await ui.userDocRef.set({ [col]: appData[col] }, { merge: true });
    } catch(e) {
        console.error('Erro ao salvar:', e);
        app.toast('Erro ao salvar. Verifique as regras do Firestore.', 'err');
    }
};

app.saveConfig = async () => {
    appData.config = {
        nome: app.val('conf-nome'), logoUrl: app.val('conf-logo'),
        tel: app.val('conf-tel'), wpp: app.val('conf-wpp'),
        end1: app.val('conf-end1'), end2: app.val('conf-end2')
    };
    if (!ui.userDocRef) return;
    try {
        await ui.userDocRef.set({ config: appData.config }, { merge: true });
        app.toast('Configurações salvas!');
    } catch(e) {
        console.error('Erro ao salvar config:', e);
        app.toast('Erro ao salvar configurações.', 'err');
    }
};

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────

app.navigate = view => {
    ui.viewAtiva = view;
    document.querySelectorAll('main > section').forEach(s => s.style.display='none');
    app.show(`view-${view}`);
    // Sidebar desktop
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const ni = app.el(`nav-${view}`); if(ni) ni.classList.add('active');
    // Bottom nav mobile
    document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
    const bni = app.el(`bnav-${view}`); if(bni) bni.classList.add('active');

    if (view==='orcamentos') app.renderOrcamentoList();
    if (view==='protocolos') app.renderProtocoloList();
    if (view==='produtos') { app.renderAvulsos(); app.renderKits(); app.switchProdutoTab(ui.tabProduto); }
    if (view==='config') app.populateConfig();
};

// ─── AVULSOS ─────────────────────────────────────────────────────────────────

app.renderAvulsos = () => {
    const q = (app.val('avulso-search')||'').toLowerCase();
    const lista = appData.avulsos.filter(a=>a.nome.toLowerCase().includes(q)).sort((a,b)=>a.nome.localeCompare(b.nome));
    const {items,page,pages,total} = app.paginate(lista, ui.avulsoPage, ui.PER_PAGE);
    ui.avulsoPage = page;
    const empty=app.el('avulso-empty'), table=app.el('avulso-table');
    if (lista.length===0) { empty.style.display='block'; table.style.display='none'; app.hide('avulso-pag'); return; }
    empty.style.display='none'; table.style.display='table';
    app.el('avulso-tbody').innerHTML = items.map(a=>`
        <tr>
            <td><span style="font-weight:500;">${a.nome}</span></td>
            <td style="text-align:right;font-weight:700;color:#013425;">${app.fmt(a.valor)}</td>
            <td style="text-align:center;">
                <div style="display:flex;justify-content:center;gap:2px;">
                    <button onclick="app.editAvulso('${a.id}')" class="btn-icon" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onclick="app.deleteAvulso('${a.id}')" class="btn-icon btn-danger" title="Excluir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
                </div>
            </td>
        </tr>`).join('');
    app.renderPag('avulso-pag', page, pages, total, "app.avulsoPagePrev()", "app.avulsoPageNext()");
};
app.avulsoPagePrev = () => { ui.avulsoPage--; app.renderAvulsos(); };
app.avulsoPageNext = () => { ui.avulsoPage++; app.renderAvulsos(); };

app.saveAvulso = async () => {
    const id=app.val('avulso-id'), nome=app.val('avulso-nome').trim(), valor=parseFloat(app.val('avulso-valor'));
    if (!nome) return app.toast('Informe o nome.','err');
    if (isNaN(valor)||valor<0) return app.toast('Valor inválido.','err');
    const obj={id:id||app.uid(),nome,valor};
    if(id){ const i=appData.avulsos.findIndex(a=>a.id===id); if(i>=0) appData.avulsos[i]=obj; } else appData.avulsos.push(obj);
    app.resetAvulsoForm(); app.renderAvulsos(); await app.save('avulsos'); app.toast('Procedimento salvo!');
};
app.editAvulso = id => { const a=appData.avulsos.find(x=>x.id===id); if(!a) return; app.setVal('avulso-id',a.id); app.setVal('avulso-nome',a.nome); app.setVal('avulso-valor',a.valor); app.el('avulso-form-title').textContent='Editando'; app.el('avulso-cancel-btn').style.display='inline-flex'; };
app.deleteAvulso = async id => { if(!confirm('Excluir procedimento?')) return; appData.avulsos=appData.avulsos.filter(a=>a.id!==id); app.renderAvulsos(); await app.save('avulsos'); app.toast('Excluído.'); };
app.resetAvulsoForm = () => { app.setVal('avulso-id',''); app.setVal('avulso-nome',''); app.setVal('avulso-valor',''); app.el('avulso-form-title').textContent='Novo Procedimento'; app.el('avulso-cancel-btn').style.display='none'; };

// ─── KITS ─────────────────────────────────────────────────────────────────────

app.switchProdutoTab = tab => {
    ui.tabProduto=tab;
    const isA=tab==='avulso';
    app.el('tab-avulso').style.display=isA?'grid':'none';
    app.el('tab-kit').style.display=isA?'none':'grid';
    const bA=app.el('tab-btn-avulso'),bK=app.el('tab-btn-kit');
    bA.style.background=isA?'#fff':'transparent'; bA.style.color=isA?'#013425':'#888'; bA.style.boxShadow=isA?'0 1px 4px rgba(0,0,0,0.1)':'none';
    bK.style.background=!isA?'#fff':'transparent'; bK.style.color=!isA?'#013425':'#888'; bK.style.boxShadow=!isA?'0 1px 4px rgba(0,0,0,0.1)':'none';
    if(!isA) app.populateKitSelect();
};

app.populateKitSelect = () => {
    app.el('kit-proc-select').innerHTML='<option value="">Selecione...</option>'+
        [...appData.avulsos].sort((a,b)=>a.nome.localeCompare(b.nome)).map(a=>`<option value="${a.id}">${a.nome} — ${app.fmt(a.valor)}</option>`).join('');
};

app.addProcToKit = () => {
    const id=app.val('kit-proc-select'), qtd=parseInt(app.val('kit-proc-qtd'))||1;
    if(!id) return app.toast('Selecione um procedimento.','err');
    const av=appData.avulsos.find(a=>a.id===id); if(!av) return;
    const ex=ui.kitEmEdicao.find(i=>i.avulsoId===id);
    if(ex) ex.qtd+=qtd; else ui.kitEmEdicao.push({avulsoId:id,nome:av.nome,qtd,valorUnit:av.valor});
    app.setVal('kit-proc-qtd',1); app.setVal('kit-proc-select',''); app.renderKitItensForm();
};

app.renderKitItensForm = () => {
    const lista=app.el('kit-itens-list');
    const orig=ui.kitEmEdicao.reduce((s,i)=>s+i.valorUnit*i.qtd,0);
    lista.innerHTML=ui.kitEmEdicao.length===0?'<p style="font-size:13px;color:#bbb;text-align:center;padding:6px;">Nenhum item</p>':
        ui.kitEmEdicao.map((item,idx)=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:#f9fafb;border-radius:8px;border:1px solid #eee;margin-bottom:5px;">
                <span style="font-size:13px;font-weight:500;">${item.qtd}x ${item.nome} <span style="color:#888;">${app.fmt(item.valorUnit*item.qtd)}</span></span>
                <div style="display:flex;gap:3px;">
                    <button onclick="app.chgKitQtd(${idx},-1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">−</button>
                    <button onclick="app.chgKitQtd(${idx},1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">+</button>
                    <button onclick="app.removeKitItem(${idx})" class="btn-icon btn-danger"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                </div>
            </div>`).join('');
    app.el('kit-valor-original').textContent=app.fmt(orig);
    app.recalcKit();
};

app.chgKitQtd=(idx,d)=>{ ui.kitEmEdicao[idx].qtd=Math.max(1,ui.kitEmEdicao[idx].qtd+d); app.renderKitItensForm(); };
app.removeKitItem=idx=>{ ui.kitEmEdicao.splice(idx,1); app.renderKitItensForm(); };

app.recalcKit=()=>{
    const orig=ui.kitEmEdicao.reduce((s,i)=>s+i.valorUnit*i.qtd,0);
    const p=parseFloat(app.val('kit-desc-perc'))||0, dv=p>0?orig*p/100:parseFloat(app.val('kit-desc-valor'))||0;
    app.el('kit-valor-final').textContent=app.fmt(Math.max(0,orig-dv));
};
app.calcKitByPerc=()=>{ const o=ui.kitEmEdicao.reduce((s,i)=>s+i.valorUnit*i.qtd,0); app.setVal('kit-desc-valor',(o*((parseFloat(app.val('kit-desc-perc'))||0)/100)).toFixed(2)); app.recalcKit(); };
app.calcKitByValor=()=>{ const o=ui.kitEmEdicao.reduce((s,i)=>s+i.valorUnit*i.qtd,0); app.setVal('kit-desc-perc',o>0?((parseFloat(app.val('kit-desc-valor'))||0)/o*100).toFixed(1):0); app.recalcKit(); };

app.saveKit = async () => {
    const id=app.val('kit-id'), nome=app.val('kit-nome').trim();
    if(!nome) return app.toast('Informe o nome.','err');
    if(!ui.kitEmEdicao.length) return app.toast('Adicione ao menos um item.','err');
    const orig=ui.kitEmEdicao.reduce((s,i)=>s+i.valorUnit*i.qtd,0);
    const dp=parseFloat(app.val('kit-desc-perc'))||0, dv=parseFloat(app.val('kit-desc-valor'))||0;
    const vf=Math.max(0,orig-(dp>0?orig*dp/100:dv));
    const kit={id:id||app.uid(),nome,itens:[...ui.kitEmEdicao],valorOriginal:orig,descPerc:dp,descValor:dv,valorFinal:vf};
    if(id){ const i=appData.kits.findIndex(k=>k.id===id); if(i>=0)appData.kits[i]=kit; } else appData.kits.push(kit);
    app.resetKitForm(); app.renderKits(); await app.save('kits'); app.toast('Kit salvo!');
};

app.editKit = id => {
    const k=appData.kits.find(x=>x.id===id); if(!k) return;
    app.setVal('kit-id',k.id); app.setVal('kit-nome',k.nome);
    ui.kitEmEdicao=k.itens.map(i=>({...i}));
    app.setVal('kit-desc-perc',k.descPerc||''); app.setVal('kit-desc-valor',k.descValor||'');
    app.el('kit-form-title').textContent='Editando Kit'; app.el('kit-cancel-btn').style.display='inline-flex';
    app.populateKitSelect(); app.renderKitItensForm(); app.switchProdutoTab('kit');
};
app.deleteKit = async id => {
    if(!confirm('Excluir kit?')) return;
    appData.kits=appData.kits.filter(k=>k.id!==id); app.renderKits(); await app.save('kits'); app.toast('Excluído.');
};
app.resetKitForm = () => {
    app.setVal('kit-id',''); app.setVal('kit-nome',''); app.setVal('kit-desc-perc',''); app.setVal('kit-desc-valor','');
    ui.kitEmEdicao=[]; app.el('kit-form-title').textContent='Novo Kit'; app.el('kit-cancel-btn').style.display='none';
    app.renderKitItensForm();
};

app.renderKits = () => {
    const q=(app.val('kit-search')||'').toLowerCase();
    const lista=appData.kits.filter(k=>k.nome.toLowerCase().includes(q)).sort((a,b)=>a.nome.localeCompare(b.nome));
    const {items,page,pages,total}=app.paginate(lista,ui.kitPage,ui.PER_PAGE);
    ui.kitPage=page;
    const empty=app.el('kit-empty'), lista_el=app.el('kit-lista');
    if(lista.length===0){ empty.style.display='block'; lista_el.innerHTML=''; app.hide('kit-pag'); return; }
    empty.style.display='none';
    lista_el.innerHTML=`
        <table class="data-table">
            <thead><tr>
                <th>Nome</th>
                <th>Itens</th>
                <th style="text-align:right;">Valor</th>
                <th style="text-align:center;width:80px;">Ações</th>
            </tr></thead>
            <tbody>${items.map(k=>`
                <tr>
                    <td style="font-weight:600;color:#013425;white-space:nowrap;">${k.nome}</td>
                    <td style="font-size:12px;color:#888;">${k.itens.map(i=>`${i.qtd}x ${i.nome}`).join(' · ')}</td>
                    <td style="text-align:right;white-space:nowrap;">
                        ${k.descPerc>0||k.descValor>0?`<span style="font-size:11px;color:#bbb;text-decoration:line-through;display:block;">${app.fmt(k.valorOriginal)}</span>`:''}
                        <span style="font-weight:700;color:#C5A365;">${app.fmt(k.valorFinal)}</span>
                        ${k.descPerc>0?`<span class="pill pill-gold" style="display:block;margin-top:2px;">${k.descPerc.toFixed(1)}% off</span>`:''}
                    </td>
                    <td style="text-align:center;">
                        <div style="display:flex;justify-content:center;gap:2px;">
                            <button onclick="app.editKit('${k.id}')" class="btn-icon" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                            <button onclick="app.deleteKit('${k.id}')" class="btn-icon btn-danger" title="Excluir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>
                        </div>
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>`;
    app.renderPag('kit-pag',page,pages,total,"app.kitPagePrev()","app.kitPageNext()");
};
app.kitPagePrev=()=>{ ui.kitPage--; app.renderKits(); };
app.kitPageNext=()=>{ ui.kitPage++; app.renderKits(); };

// ─── PROTOCOLOS ──────────────────────────────────────────────────────────────

app.renderProtocoloList = () => {
    app.show('proto-list-view'); app.hide('proto-editor-view');
    const q=(app.val('proto-search')||'').toLowerCase();
    const lista=appData.protocolos.filter(p=>p.nome.toLowerCase().includes(q)).sort((a,b)=>a.nome.localeCompare(b.nome));
    const {items,page,pages,total}=app.paginate(lista,ui.protoPage,ui.PER_PAGE);
    ui.protoPage=page;
    const empty=app.el('proto-empty'), lista_el=app.el('proto-lista');
    if(lista.length===0){ empty.style.display='block'; lista_el.innerHTML=''; app.hide('proto-pag'); return; }
    empty.style.display='none';
    lista_el.innerHTML=items.map(p=>`
        <div style="padding:14px 18px;border-bottom:1px solid #f5f5f5;display:flex;align-items:center;justify-content:space-between;">
            <div>
                <p style="font-weight:700;color:#013425;font-size:14px;">${p.nome}</p>
                <p style="font-size:12px;color:#888;margin-top:2px;">${p.fases.length} fase(s) · <strong style="color:#C5A365;">${app.fmt(p.valorFinal)}</strong></p>
            </div>
            <div style="display:flex;gap:4px;">
                <button onclick="app.editProtocolo('${p.id}')" class="btn-icon" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button onclick="app.copiarProtocolo('${p.id}')" class="btn-icon btn-gold" title="Copiar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button onclick="app.deleteProtocolo('${p.id}')" class="btn-icon btn-danger" title="Excluir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg></button>
            </div>
        </div>`).join('');
    app.renderPag('proto-pag',page,pages,total,"app.protoPagePrev()","app.protoPageNext()");
};
app.protoPagePrev=()=>{ ui.protoPage--; app.renderProtocoloList(); };
app.protoPageNext=()=>{ ui.protoPage++; app.renderProtocoloList(); };

app.novoProtocolo = () => {
    ui.protocoloEmEdicao={id:null,nome:'',desc:'',indicacao:'',beneficios:'',fases:[],descPerc:0,descValor:0,valorBruto:0,valorFinal:0};
    ui.protoTab = 'fases'; // sempre inicia em fases
    app.abrirEditorProtocolo('Novo Protocolo');
};
app.editProtocolo = id => { const p=appData.protocolos.find(x=>x.id===id); if(!p) return; ui.protocoloEmEdicao=JSON.parse(JSON.stringify(p)); app.abrirEditorProtocolo('Editando Protocolo'); };
app.copiarProtocolo = id => {
    const p=appData.protocolos.find(x=>x.id===id); if(!p) return;
    ui.protocoloEmEdicao=JSON.parse(JSON.stringify(p));
    ui.protocoloEmEdicao.id=null;
    ui.protocoloEmEdicao.nome='Cópia de '+p.nome;
    app.abrirEditorProtocolo('Copiando Protocolo');
};
app.deleteProtocolo = async id => { if(!confirm('Excluir protocolo?')) return; appData.protocolos=appData.protocolos.filter(p=>p.id!==id); app.renderProtocoloList(); await app.save('protocolos'); app.toast('Excluído.'); };
app.voltarProtocoloList = () => app.renderProtocoloList();

app.switchProtoTab = (tab) => {
    ui.protoTab = tab;
    const isFases = tab === 'fases';
    const btnF = app.el('proto-tab-fases-btn'), btnA = app.el('proto-tab-avulso-btn');
    const panelF = app.el('proto-panel-fases'), panelA = app.el('proto-panel-avulso');
    if (!btnF) return;
    btnF.style.background = isFases ? '#fff' : 'transparent';
    btnF.style.color = isFases ? '#013425' : '#888';
    btnF.style.boxShadow = isFases ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
    btnA.style.background = !isFases ? '#fff' : 'transparent';
    btnA.style.color = !isFases ? '#013425' : '#888';
    btnA.style.boxShadow = !isFases ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
    if (panelF) panelF.style.display = isFases ? 'block' : 'none';
    if (panelA) panelA.style.display = !isFases ? 'block' : 'none';
    app.renderFases();
};

// Modo itens avulsos no protocolo: usa fase oculta livre
app.openModalProtoItemAvulso = () => {
    if (!ui.protocoloEmEdicao.fases) ui.protocoloEmEdicao.fases = [];
    let faseAvulsa = ui.protocoloEmEdicao.fases.find(f => f.livre);
    if (!faseAvulsa) {
        faseAvulsa = { id: app.uid(), nome: 'Itens Avulsos', itens: [], livre: true };
        ui.protocoloEmEdicao.fases.push(faseAvulsa);
    }
    app.openModalFaseItem(faseAvulsa.id);
};

app.abrirEditorProtocolo = titulo => {
    app.hide('proto-list-view'); app.show('proto-editor-view');
    app.el('proto-editor-titulo').textContent=titulo;
    const p=ui.protocoloEmEdicao;
    app.setVal('pe-nome',p.nome); app.setVal('pe-desc',p.desc||''); app.setVal('pe-indicacao',p.indicacao||''); app.setVal('pe-beneficios',p.beneficios||'');
    app.setVal('pe-desc-perc',p.descPerc||''); app.setVal('pe-desc-valor',p.descValor||'');
    // Definir tab: se tem fase livre sem fases normais → itens avulsos
    const temFaseNormal = p.fases.some(f => !f.livre);
    const temFaseLivre = p.fases.some(f => f.livre);
    const tabInicial = (!temFaseNormal && temFaseLivre) ? 'avulso' : 'fases';
    ui.protoTab = tabInicial;
    app.switchProtoTab(tabInicial);
};

app.adicionarFase = () => {
    const num=ui.protocoloEmEdicao.fases.length+1;
    ui.protocoloEmEdicao.fases.push({id:app.uid(),nome:`Fase ${num}`,itens:[]});
    app.renderFases();
};

app.renderFases = () => {
    const c = app.el('pe-fases-lista');
    const fases = ui.protocoloEmEdicao.fases;

    // MODO ITENS AVULSOS — lista plana sem cabeçalho de fase
    if (ui.protoTab === 'avulso') {
        const faseLivre = fases.find(f => f.livre);
        const itens = faseLivre ? faseLivre.itens : [];
        if (itens.length === 0) { c.innerHTML = ''; app.atualizarResumoProto(); return; }
        const total = itens.reduce((s,i) => s + i.valorUnit * i.qtd, 0);
        c.innerHTML = `
            <div style="border-top:1px solid #f0f0f0;padding-top:12px;margin-top:4px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                    <span style="font-size:12px;font-weight:700;color:#013425;">${itens.length} item(s)</span>
                    <span style="font-size:13px;font-weight:700;color:#C5A365;">${app.fmt(total)}</span>
                </div>
                ${itens.map((item,ii) => `
                    <div class="item-row is-normal">
                        <div style="flex:1;font-size:13px;">
                            <strong>${item.qtd}x</strong> ${item.nome}
                            ${item.tipo==='kit'?'<span class="pill pill-gold">Kit</span>':''}
                            <span style="color:#888;">${app.fmt(item.valorUnit*item.qtd)}</span>
                        </div>
                        <div style="display:flex;gap:3px;">
                            <button onclick="app.chgFaseItemAvulso(${ii},-1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">−</button>
                            <button onclick="app.chgFaseItemAvulso(${ii},1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">+</button>
                            <button onclick="app.removeFaseItemAvulso(${ii})" class="btn-icon btn-danger"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                    </div>`).join('')}
            </div>`;
        app.atualizarResumoProto();
        return;
    }

    // MODO FASES — exibe fases com cabeçalho (ignora fases livres)
    const fasesNormais = fases.filter(f => !f.livre);
    if (!fasesNormais.length) { c.innerHTML = '<div class="empty-state" style="padding:20px;">Nenhuma fase adicionada</div>'; app.atualizarResumoProto(); return; }
    c.innerHTML = fasesNormais.map((fase, fi) => {
        const sub = fase.itens.reduce((s,i) => s + i.valorUnit * i.qtd, 0);
        const itensHtml = fase.itens.length === 0
            ? '<p style="font-size:12px;color:#bbb;font-style:italic;">Sem itens</p>'
            : fase.itens.map((item,ii) => `
                <div class="item-row is-normal">
                    <div style="flex:1;font-size:13px;"><strong>${item.qtd}x</strong> ${item.nome}${item.tipo==='kit'?' <span class="pill pill-gold">Kit</span>':''} <span style="color:#888;">${app.fmt(item.valorUnit*item.qtd)}</span></div>
                    <div style="display:flex;gap:3px;">
                        <button onclick="app.chgFaseQtd('${fase.id}',${ii},-1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">−</button>
                        <button onclick="app.chgFaseQtd('${fase.id}',${ii},1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">+</button>
                        <button onclick="app.removeFaseItem('${fase.id}',${ii})" class="btn-icon btn-danger"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                </div>`).join('');
        return `
            <div class="fase-block">
                <div class="fase-header">
                    <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
                        <span style="background:rgba(197,163,101,0.25);color:#C5A365;border-radius:5px;padding:1px 9px;font-size:12px;font-weight:700;flex-shrink:0;">${fi+1}</span>
                        <input type="text" value="${fase.nome}" onchange="app.renameFase('${fase.id}',this.value)" style="background:transparent;border:none;color:#fff;font-weight:700;font-size:13px;outline:none;flex:1;min-width:0;">
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                        <span style="color:#C5A365;font-size:13px;font-weight:700;">${app.fmt(sub)}</span>
                        <button onclick="app.openModalFaseItem('${fase.id}')" style="background:rgba(197,163,101,0.2);border:none;color:#C5A365;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer;">+ Item</button>
                        <button onclick="app.deleteFase('${fase.id}')" class="btn-icon btn-danger" style="color:rgba(255,255,255,0.4);"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
                    </div>
                </div>
                <div class="fase-body">${itensHtml}</div>
            </div>`;
    }).join('');
    app.atualizarResumoProto();
};

app.renameFase=(faseId,nome)=>{ const f=ui.protocoloEmEdicao.fases.find(x=>x.id===faseId); if(f) f.nome=nome; };
app.deleteFase=faseId=>{ if(!confirm('Excluir fase?')) return; ui.protocoloEmEdicao.fases=ui.protocoloEmEdicao.fases.filter(f=>f.id!==faseId); app.renderFases(); };
app.chgFaseQtd=(faseId,ii,d)=>{ const f=ui.protocoloEmEdicao.fases.find(x=>x.id===faseId); if(f) f.itens[ii].qtd=Math.max(1,f.itens[ii].qtd+d); app.renderFases(); };
app.removeFaseItem=(faseId,ii)=>{ const f=ui.protocoloEmEdicao.fases.find(x=>x.id===faseId); if(f) f.itens.splice(ii,1); app.renderFases(); };
// Helpers modo avulso no protocolo
app.chgFaseItemAvulso=(ii,d)=>{ const f=ui.protocoloEmEdicao.fases.find(x=>x.livre); if(f) f.itens[ii].qtd=Math.max(1,f.itens[ii].qtd+d); app.renderFases(); };
app.removeFaseItemAvulso=ii=>{ const f=ui.protocoloEmEdicao.fases.find(x=>x.livre); if(f){ f.itens.splice(ii,1); app.renderFases(); } };

app.atualizarResumoProto = () => {
    const fases=ui.protocoloEmEdicao.fases;
    const bruto=fases.reduce((s,f)=>s+f.itens.reduce((ss,i)=>ss+i.valorUnit*i.qtd,0),0);
    app.el('pe-total-bruto').textContent=app.fmt(bruto);
    app.el('pe-resumo-fases').innerHTML=fases.length===0?'<span style="color:#5a8a77;">Sem fases</span>':
        fases.map((f,i)=>{const s=f.itens.reduce((ss,ii)=>ss+ii.valorUnit*ii.qtd,0); return `<div style="display:flex;justify-content:space-between;margin-bottom:3px;"><span>Fase ${i+1}: ${f.nome}</span><span style="color:#fff;font-weight:600;">${app.fmt(s)}</span></div>`;}).join('');
    const dp=parseFloat(app.val('pe-desc-perc'))||0, dv=dp>0?bruto*dp/100:parseFloat(app.val('pe-desc-valor'))||0;
    app.el('pe-total-final').textContent=app.fmt(Math.max(0,bruto-dv));
};

app.calcProtoByPerc=()=>{ const b=ui.protocoloEmEdicao.fases.reduce((s,f)=>s+f.itens.reduce((ss,i)=>ss+i.valorUnit*i.qtd,0),0); app.setVal('pe-desc-valor',(b*(parseFloat(app.val('pe-desc-perc'))||0)/100).toFixed(2)); app.atualizarResumoProto(); };
app.calcProtoByValor=()=>{ const b=ui.protocoloEmEdicao.fases.reduce((s,f)=>s+f.itens.reduce((ss,i)=>ss+i.valorUnit*i.qtd,0),0); app.setVal('pe-desc-perc',b>0?((parseFloat(app.val('pe-desc-valor'))||0)/b*100).toFixed(1):0); app.atualizarResumoProto(); };

app.saveProtocolo = async () => {
    const nome=app.val('pe-nome').trim(); if(!nome) return app.toast('Informe o nome.','err');
    const p=ui.protocoloEmEdicao;
    p.nome=nome; p.desc=app.val('pe-desc'); p.indicacao=app.val('pe-indicacao'); p.beneficios=app.val('pe-beneficios');
    p.descPerc=parseFloat(app.val('pe-desc-perc'))||0; p.descValor=parseFloat(app.val('pe-desc-valor'))||0;
    p.valorBruto=p.fases.reduce((s,f)=>s+f.itens.reduce((ss,i)=>ss+i.valorUnit*i.qtd,0),0);
    const dv=p.descPerc>0?p.valorBruto*p.descPerc/100:p.descValor;
    p.valorFinal=Math.max(0,p.valorBruto-dv);
    const obj={...p,id:p.id||app.uid()};
    if(p.id){ const i=appData.protocolos.findIndex(x=>x.id===p.id); if(i>=0) appData.protocolos[i]=obj; } else appData.protocolos.push(obj);
    await app.save('protocolos'); app.toast('Protocolo salvo!'); app.renderProtocoloList();
};

// ─── MODAL FASE ITEM (protocolo editor) ──────────────────────────────────────

app.openModalFaseItem = faseId => {
    ui.faseEditandoId=faseId;
    const f=ui.protocoloEmEdicao.fases.find(x=>x.id===faseId);
    app.el('modal-fase-titulo').textContent=`Adicionar Item — ${f?f.nome:''}`;
    app.switchModalTipo(ui.modalTipo);
    app.setVal('modal-item-qtd',1);
    app.show('modal-fase-item','flex');
};
app.closeModalFaseItem=()=>app.hide('modal-fase-item');

app.switchModalTipo=tipo=>{
    ui.modalTipo=tipo; const isA=tipo==='avulso';
    const bA=app.el('modal-tipo-avulso'),bK=app.el('modal-tipo-kit');
    bA.style.background=isA?'#013425':'#fff'; bA.style.color=isA?'#fff':'#888'; bA.style.borderColor=isA?'#013425':'#ddd';
    bK.style.background=!isA?'#013425':'#fff'; bK.style.color=!isA?'#fff':'#888'; bK.style.borderColor=!isA?'#013425':'#ddd';
    const sel=app.el('modal-item-select');
    sel.innerHTML='<option value="">Selecione...</option>'+
        (isA?[...appData.avulsos].sort((a,b)=>a.nome.localeCompare(b.nome)).map(a=>`<option value="${a.id}">${a.nome} — ${app.fmt(a.valor)}</option>`)
            :[...appData.kits].sort((a,b)=>a.nome.localeCompare(b.nome)).map(k=>`<option value="${k.id}">${k.nome} — ${app.fmt(k.valorFinal)}</option>`)).join('');
};

app.confirmarAddItemFase=()=>{
    const faseId=ui.faseEditandoId, refId=app.val('modal-item-select'), qtd=parseInt(app.val('modal-item-qtd'))||1;
    if(!refId) return app.toast('Selecione um item.','err');
    const fase=ui.protocoloEmEdicao.fases.find(f=>f.id===faseId); if(!fase) return;
    const tipo=ui.modalTipo;
    let nome='',valorUnit=0;
    if(tipo==='avulso'){ const a=appData.avulsos.find(x=>x.id===refId); if(!a) return; nome=a.nome; valorUnit=a.valor; }
    else { const k=appData.kits.find(x=>x.id===refId); if(!k) return; nome=k.nome; valorUnit=k.valorFinal; }
    const ex=fase.itens.find(i=>i.refId===refId&&i.tipo===tipo);
    if(ex) ex.qtd+=qtd; else fase.itens.push({refId,nome,qtd,valorUnit,tipo});
    app.closeModalFaseItem(); app.renderFases();
};

// ─── ORÇAMENTOS ──────────────────────────────────────────────────────────────

app.renderOrcamentoList = () => {
    app.show('orc-list-view'); app.hide('orc-editor-view');
    const q=(app.val('orc-search')||'').toLowerCase();
    const lista=appData.orcamentos
        .filter(o=>(o.paciente||'').toLowerCase().includes(q)||(o.medico||'').toLowerCase().includes(q)||(o.protocoloNome||'').toLowerCase().includes(q))
        .sort((a,b)=>new Date(b.data)-new Date(a.data));
    const {items,page,pages,total}=app.paginate(lista,ui.orcPage,ui.PER_PAGE);
    ui.orcPage=page;
    const empty=app.el('orc-empty'), table=app.el('orc-table');
    if(lista.length===0){ empty.style.display='block'; table.style.display='none'; app.hide('orc-pag'); return; }
    empty.style.display='none'; table.style.display='table';
    app.el('orc-tbody').innerHTML=items.map(o=>`
        <tr>
            <td class="col-hide-sm" style="font-size:12px;color:#aaa;">${o.id}</td>
            <td class="col-hide-sm">${new Date(o.data+'T12:00:00').toLocaleDateString('pt-BR')}</td>
            <td style="font-weight:500;">${o.paciente}</td>
            <td class="col-hide-sm" style="font-size:13px;color:#555;">${o.protocoloNome||'—'}</td>
            <td class="col-hide-sm" style="font-size:13px;color:#555;">${o.medico}</td>
            <td style="text-align:right;font-weight:700;color:#013425;">${app.fmt(o.valorAvista)}</td>
            <td style="text-align:center;">
                <div style="display:flex;justify-content:center;gap:3px;">
                    <button onclick="app.abrirImpressao('${o.id}')" class="btn-icon" title="Imprimir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
                    <button onclick="app.editOrcamento('${o.id}')" class="btn-icon" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onclick="app.deleteOrcamento('${o.id}')" class="btn-icon btn-danger" title="Excluir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
                </div>
            </td>
        </tr>`).join('');
    app.renderPag('orc-pag',page,pages,total,"app.orcPagePrev()","app.orcPageNext()");
};
app.orcPagePrev=()=>{ ui.orcPage--; app.renderOrcamentoList(); };
app.orcPageNext=()=>{ ui.orcPage++; app.renderOrcamentoList(); };

app.novoOrcamento = () => {
    ui.orcamentoEmEdicao={id:null,paciente:'',medicoId:'',medico:'',crm:'',data:new Date().toISOString().slice(0,10),protocoloId:null,protocoloNome:'',fases:[],valorBruto:0,valorCortesias:0,valorProtocolo:0,descAvista:0,descParcelado:0,numParcelas:1,valorAvista:0,valorParcelado:0};
    ui.orcTab = 'protocolo'; // sempre inicia em protocolo
    app.abrirEditorOrcamento('Novo Orçamento');
};

app.editOrcamento = id => {
    const o=appData.orcamentos.find(x=>x.id===id); if(!o) return;
    ui.orcamentoEmEdicao=JSON.parse(JSON.stringify(o));
    if(!ui.orcamentoEmEdicao.fases) ui.orcamentoEmEdicao.fases=[];
    // detectar tab: se tem só fase livre → itens avulsos
    const temFaseNormal = ui.orcamentoEmEdicao.fases.some(f=>!f.livre);
    const temFaseLivre  = ui.orcamentoEmEdicao.fases.some(f=>f.livre);
    ui.orcTab = (!temFaseNormal && temFaseLivre) ? 'itens' : 'protocolo';
    app.abrirEditorOrcamento(`Editando #${id}`);
};

app.deleteOrcamento = async id => {
    if(!confirm('Excluir orçamento?')) return;
    appData.orcamentos=appData.orcamentos.filter(o=>o.id!==id);
    app.renderOrcamentoList(); await app.save('orcamentos'); app.toast('Excluído.');
};

app.voltarOrcamentoList = () => app.renderOrcamentoList();

app.switchOrcTab = (tab) => {
    ui.orcTab = tab;
    const isProto = tab === 'protocolo';
    const btnP = app.el('orc-tab-proto-btn'), btnI = app.el('orc-tab-itens-btn');
    const panelP = app.el('orc-panel-protocolo'), panelI = app.el('orc-panel-itens');
    if (!btnP || !btnI) return;
    btnP.style.background = isProto ? '#fff' : 'transparent';
    btnP.style.color = isProto ? '#013425' : '#888';
    btnP.style.boxShadow = isProto ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
    btnI.style.background = !isProto ? '#fff' : 'transparent';
    btnI.style.color = !isProto ? '#013425' : '#888';
    btnI.style.boxShadow = !isProto ? '0 1px 3px rgba(0,0,0,0.1)' : 'none';
    if (panelP) panelP.style.display = isProto ? 'block' : 'none';
    if (panelI) panelI.style.display = !isProto ? 'block' : 'none';
    app.renderOrcFases();
};

app.addOrcFaseLivre = () => {
    if (!ui.orcamentoEmEdicao.fases) ui.orcamentoEmEdicao.fases = [];
    const num = ui.orcamentoEmEdicao.fases.length + 1;
    ui.orcamentoEmEdicao.fases.push({ id: app.uid(), nome: `Fase ${num}`, itens: [], livre: true });
    app.renderOrcFases();
};

// Modo itens livres: garante fase oculta e abre modal
app.openModalOrcItemLivre = () => {
    if (!ui.orcamentoEmEdicao.fases) ui.orcamentoEmEdicao.fases = [];
    let faseLivre = ui.orcamentoEmEdicao.fases.find(f => f.livre);
    if (!faseLivre) {
        faseLivre = { id: app.uid(), nome: 'Itens Avulsos', itens: [], livre: true };
        ui.orcamentoEmEdicao.fases.push(faseLivre);
    }
    app.openModalOrcItem(faseLivre.id);
};

app.abrirEditorOrcamento = titulo => {
    app.hide('orc-list-view'); app.show('orc-editor-view');
    app.el('orc-editor-titulo').textContent=titulo;
    const o=ui.orcamentoEmEdicao;
    app.setVal('orc-paciente',o.paciente);
    app.setVal('orc-crm',o.crm); app.setVal('orc-data',o.data);
    app.setVal('orc-desc-avista',o.descAvista||''); app.setVal('orc-desc-parcelado',o.descParcelado||'');
    app.setVal('orc-parcelas',o.numParcelas||1);
    // Popular select de médicos
    const selMed=app.el('orc-medico');
    if(selMed && selMed.tagName==='SELECT'){
        selMed.innerHTML='<option value="">— Selecione o médico —</option>'+
            [...appData.medicos].sort((a,b)=>a.nome.localeCompare(b.nome))
                .map(m=>`<option value="${m.id}" data-crm="${m.crm}">${m.nome} — ${m.crm}</option>`).join('');
        selMed.value=o.medicoId||'';
        selMed.onchange=()=>{
            const opt=selMed.options[selMed.selectedIndex];
            app.setVal('orc-crm', opt?opt.dataset.crm||'':'');
        };
        if(o.medicoId){ const opt=selMed.querySelector(`option[value="${o.medicoId}"]`); if(opt) app.setVal('orc-crm',opt.dataset.crm||''); }
    }
    // Popular select de protocolos
    const sel=app.el('orc-protocolo-select');
    sel.innerHTML='<option value="">— Selecione um protocolo —</option>'+
        [...appData.protocolos].sort((a,b)=>a.nome.localeCompare(b.nome))
            .map(p=>`<option value="${p.id}">${p.nome} — ${app.fmt(p.valorFinal)}</option>`).join('');
    sel.value=o.protocoloId||'';
    // Tab inicial: itens livres se tem fases sem protocolo, protocolo caso contrário
    const tabInicial = (!o.protocoloId && o.fases && o.fases.length > 0) ? 'itens' : 'protocolo';
    ui.orcTab = tabInicial;
    app.switchOrcTab(tabInicial);
    app.renderOrcFases();
    app.calcOrcTotais();
};

app.selecionarProtocoloOrc = () => {
    const protId=app.val('orc-protocolo-select');
    if(!protId){
        // Limpar apenas as fases que vieram do protocolo anterior, manter fases livres
        ui.orcamentoEmEdicao.protocoloId=null;
        ui.orcamentoEmEdicao.protocoloNome='';
        ui.orcamentoEmEdicao.fases=(ui.orcamentoEmEdicao.fases||[]).filter(f=>f.livre);
        app.renderOrcFases(); app.calcOrcTotais(); return;
    }
    const p=appData.protocolos.find(x=>x.id===protId); if(!p) return;
    // Manter fases livres existentes, substituir apenas as do protocolo
    const fasesLivres=(ui.orcamentoEmEdicao.fases||[]).filter(f=>f.livre);
    const fasesProto=JSON.parse(JSON.stringify(p.fases)).map(f=>({
        ...f, livre:false, itens:f.itens.map(i=>({...i,cortesia:false}))
    }));
    ui.orcamentoEmEdicao.protocoloId=p.id;
    ui.orcamentoEmEdicao.protocoloNome=p.nome;
    ui.orcamentoEmEdicao.fases=[...fasesProto, ...fasesLivres];
    app.renderOrcFases(); app.calcOrcTotais();
};

app.renderOrcFases = () => {
    const cont = app.el('orc-fases-editor');
    const fases = ui.orcamentoEmEdicao.fases || [];

    // MODO ITENS LIVRES — exibe lista plana sem cabeçalho de fase
    if (ui.orcTab === 'itens') {
        const faseLivre = fases.find(f => f.livre);
        const itens = faseLivre ? faseLivre.itens : [];
        if (itens.length === 0) { cont.innerHTML = ''; app.calcOrcTotais(); return; }
        const fi = fases.indexOf(faseLivre);
        const total = itens.reduce((s,i) => s + (i.cortesia ? 0 : i.valorUnit * i.qtd), 0);
        cont.innerHTML = `
            <div style="border-top:1px solid #f0f0f0;padding-top:12px;margin-top:4px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                    <span style="font-size:12px;font-weight:700;color:#013425;">${itens.length} item(s) adicionado(s)</span>
                    <span style="font-size:13px;font-weight:700;color:#C5A365;">${app.fmt(total)}</span>
                </div>
                ${itens.map((item,ii) => `
                    <div class="item-row ${item.cortesia?'is-cortesia':'is-normal'}">
                        <div style="flex:1;font-size:13px;">
                            <strong>${item.qtd}x</strong> ${item.nome}
                            ${item.tipo==='kit'?'<span class="pill pill-gold">Kit</span>':''}
                            ${item.cortesia?'<span class="pill pill-orange">Cortesia</span>':''}
                            <span style="color:${item.cortesia?'#f97316':'#888'};">${item.cortesia?'R$ 0,00':app.fmt(item.valorUnit*item.qtd)}</span>
                        </div>
                        <div style="display:flex;gap:3px;">
                            <button onclick="app.chgOrcItemQtd(${fi},${ii},-1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">−</button>
                            <button onclick="app.chgOrcItemQtd(${fi},${ii},1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">+</button>
                            <button onclick="app.toggleCortesia(${fi},${ii})" class="btn-icon btn-cortesia" title="${item.cortesia?'Remover cortesia':'Cortesia'}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
                            <button onclick="app.removeOrcItem(${fi},${ii})" class="btn-icon btn-danger"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                        </div>
                    </div>`).join('')}
            </div>`;
        app.calcOrcTotais();
        return;
    }

    // MODO PROTOCOLO — exibe fases com cabeçalho
    const fasesProto = fases.filter(f => !f.livre);
    if (!fasesProto.length) { cont.innerHTML = ''; app.calcOrcTotais(); return; }
    cont.innerHTML = `<div style="border-top:1px solid #f0f0f0;padding-top:14px;margin-top:4px;">` +
    fasesProto.map((fase, fi) => {
        const faseIdxGlobal = fases.indexOf(fase);
        const sub = fase.itens.reduce((s,i) => s + (i.cortesia ? 0 : i.valorUnit * i.qtd), 0);
        const itensHtml = fase.itens.length === 0
            ? '<p style="font-size:12px;color:#bbb;font-style:italic;padding:4px 0;">Sem itens</p>'
            : fase.itens.map((item,ii) => `
                <div class="item-row ${item.cortesia?'is-cortesia':'is-normal'}">
                    <div style="flex:1;font-size:13px;">
                        <strong>${item.qtd}x</strong> ${item.nome}
                        ${item.tipo==='kit'?'<span class="pill pill-gold">Kit</span>':''}
                        ${item.cortesia?'<span class="pill pill-orange">Cortesia</span>':''}
                        <span style="color:${item.cortesia?'#f97316':'#888'};">${item.cortesia?'R$ 0,00':app.fmt(item.valorUnit*item.qtd)}</span>
                    </div>
                    <div style="display:flex;gap:3px;">
                        <button onclick="app.chgOrcItemQtd(${faseIdxGlobal},${ii},-1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">−</button>
                        <button onclick="app.chgOrcItemQtd(${faseIdxGlobal},${ii},1)" class="btn-icon" style="width:24px;height:24px;border:1px solid #eee;border-radius:5px;">+</button>
                        <button onclick="app.toggleCortesia(${faseIdxGlobal},${ii})" class="btn-icon btn-cortesia" title="${item.cortesia?'Remover cortesia':'Cortesia'}"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
                        <button onclick="app.removeOrcItem(${faseIdxGlobal},${ii})" class="btn-icon btn-danger"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
                    </div>
                </div>`).join('');
        return `
            <div class="fase-block" style="margin-bottom:10px;">
                <div class="fase-header">
                    <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;">
                        <span style="background:rgba(197,163,101,0.25);color:#C5A365;border-radius:5px;padding:1px 9px;font-size:12px;font-weight:700;flex-shrink:0;">${fi+1}</span>
                        <span style="color:#fff;font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${fase.nome}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                        <span style="color:#C5A365;font-size:13px;font-weight:700;">${app.fmt(sub)}</span>
                        <button onclick="app.openModalOrcItem('${fase.id}')" style="background:rgba(197,163,101,0.2);border:none;color:#C5A365;border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer;">+ Item</button>
                        <button onclick="app.removeOrcFase(${faseIdxGlobal})" class="btn-icon btn-danger" style="color:rgba(255,255,255,0.4);"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
                    </div>
                </div>
                <div class="fase-body">${itensHtml}</div>
            </div>`;
    }).join('') + '</div>';
    app.calcOrcTotais();
};

app.chgOrcItemQtd=(fi,ii,d)=>{ const f=ui.orcamentoEmEdicao.fases[fi]; if(f) f.itens[ii].qtd=Math.max(1,f.itens[ii].qtd+d); app.renderOrcFases(); };
app.removeOrcItem=(fi,ii)=>{ const f=ui.orcamentoEmEdicao.fases[fi]; if(f){ f.itens.splice(ii,1); app.renderOrcFases(); } };
app.removeOrcFase=fi=>{ if(!confirm('Excluir esta fase do orçamento?')) return; ui.orcamentoEmEdicao.fases.splice(fi,1); app.renderOrcFases(); };
app.toggleCortesia=(fi,ii)=>{ const f=ui.orcamentoEmEdicao.fases[fi]; if(f){ f.itens[ii].cortesia=!f.itens[ii].cortesia; app.renderOrcFases(); } };

app.calcOrcTotais = () => {
    const fases=ui.orcamentoEmEdicao.fases||[];
    let bruto=0, cortesias=0;
    fases.forEach(f=>f.itens.forEach(i=>{ const v=i.valorUnit*i.qtd; bruto+=v; if(i.cortesia) cortesias+=v; }));
    const base=bruto-cortesias;
    const dAv=parseFloat(app.val('orc-desc-avista'))||0;
    const dPar=parseFloat(app.val('orc-desc-parcelado'))||0;
    const parc=parseInt(app.val('orc-parcelas'))||1;
    const avista=base*(1-dAv/100);
    const parcelado=base*(1-dPar/100);
    const parcelaVal=parcelado/parc;
    app.el('orc-val-bruto').textContent=app.fmt(bruto);
    app.el('orc-val-cortesia').textContent='- '+app.fmt(cortesias);
    app.el('orc-val-proto').textContent=app.fmt(base);
    app.el('orc-val-avista').textContent=app.fmt(avista);
    app.el('orc-val-parcelado').textContent=parc>1?`${app.fmt(parcelado)} (${parc}x ${app.fmt(parcelaVal)})`:app.fmt(parcelado);
    // guardar no estado
    ui.orcamentoEmEdicao.valorBruto=bruto; ui.orcamentoEmEdicao.valorCortesias=cortesias;
    ui.orcamentoEmEdicao.valorProtocolo=base; ui.orcamentoEmEdicao.descAvista=dAv;
    ui.orcamentoEmEdicao.descParcelado=dPar; ui.orcamentoEmEdicao.numParcelas=parc;
    ui.orcamentoEmEdicao.valorAvista=avista; ui.orcamentoEmEdicao.valorParcelado=parcelado;
};

// MODAL ORC ITEM
app.openModalOrcItem = faseId => {
    ui.orcFaseEditandoId = faseId;
    if (!faseId) {
        // Adicionar nova fase
        const num=(ui.orcamentoEmEdicao.fases||[]).length+1;
        if(!ui.orcamentoEmEdicao.fases) ui.orcamentoEmEdicao.fases=[];
        ui.orcamentoEmEdicao.fases.push({id:app.uid(),nome:`Fase ${num}`,itens:[]});
        app.renderOrcFases(); return;
    }
    const f=(ui.orcamentoEmEdicao.fases||[]).find(x=>x.id===faseId);
    app.el('modal-orc-item-titulo').textContent=`Adicionar — ${f?f.nome:''}`;
    app.switchModalOrcTipo(ui.modalOrcTipo);
    app.setVal('modal-orc-qtd',1);
    app.show('modal-orc-item','flex');
};
app.closeModalOrcItem=()=>app.hide('modal-orc-item');

app.switchModalOrcTipo=tipo=>{
    ui.modalOrcTipo=tipo; const isA=tipo==='avulso';
    const bA=app.el('modal-orc-tipo-avulso'),bK=app.el('modal-orc-tipo-kit');
    bA.style.background=isA?'#013425':'#fff'; bA.style.color=isA?'#fff':'#888'; bA.style.borderColor=isA?'#013425':'#ddd';
    bK.style.background=!isA?'#013425':'#fff'; bK.style.color=!isA?'#fff':'#888'; bK.style.borderColor=!isA?'#013425':'#ddd';
    app.el('modal-orc-select').innerHTML='<option value="">Selecione...</option>'+
        (isA?[...appData.avulsos].sort((a,b)=>a.nome.localeCompare(b.nome)).map(a=>`<option value="${a.id}">${a.nome} — ${app.fmt(a.valor)}</option>`)
            :[...appData.kits].sort((a,b)=>a.nome.localeCompare(b.nome)).map(k=>`<option value="${k.id}">${k.nome} — ${app.fmt(k.valorFinal)}</option>`)).join('');
};

app.confirmarAddItemOrc=()=>{
    const faseId=ui.orcFaseEditandoId, refId=app.val('modal-orc-select'), qtd=parseInt(app.val('modal-orc-qtd'))||1;
    if(!refId) return app.toast('Selecione um item.','err');
    const fase=(ui.orcamentoEmEdicao.fases||[]).find(f=>f.id===faseId); if(!fase) return;
    const tipo=ui.modalOrcTipo;
    let nome='',valorUnit=0;
    if(tipo==='avulso'){ const a=appData.avulsos.find(x=>x.id===refId); if(!a) return; nome=a.nome; valorUnit=a.valor; }
    else { const k=appData.kits.find(x=>x.id===refId); if(!k) return; nome=k.nome; valorUnit=k.valorFinal; }
    fase.itens.push({refId,nome,qtd,valorUnit,tipo,cortesia:false});
    app.closeModalOrcItem(); app.renderOrcFases();
};

app.saveOrcamento = async () => {
    const pac=app.val('orc-paciente').trim();
    if(!pac) return app.toast('Informe o paciente.','err');
    // pegar médico do select ou input
    const selMed=app.el('orc-medico');
    let medicoId='', medicoNome='', medicoCrm=app.val('orc-crm');
    if(selMed && selMed.tagName==='SELECT'){
        medicoId=selMed.value;
        const opt=selMed.options[selMed.selectedIndex];
        medicoNome=opt&&medicoId?opt.textContent.split(' — ')[0]:'';
        medicoCrm=opt&&medicoId?opt.dataset.crm||'':'';
        if(!medicoId) return app.toast('Selecione o médico.','err');
    } else {
        medicoNome=app.val('orc-medico').trim();
        if(!medicoNome) return app.toast('Informe o médico.','err');
    }
    app.calcOrcTotais();
    const o=ui.orcamentoEmEdicao;
    const obj={...o, id:o.id||app.gerarIdOrc(), paciente:pac, medicoId, medico:medicoNome, crm:medicoCrm, data:app.val('orc-data')};
    if(o.id){ const i=appData.orcamentos.findIndex(x=>x.id===o.id); if(i>=0) appData.orcamentos[i]=obj; } else appData.orcamentos.push(obj);
    await app.save('orcamentos'); app.toast('Orçamento salvo!'); app.renderOrcamentoList();
};

app.gerarIdOrc=()=>{ const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'),pref=`${y}.${m}.${day}`; const ex=appData.orcamentos.filter(o=>o.id&&o.id.startsWith(pref)).map(o=>parseInt(o.id.split('-')[1])||0); return `${pref}-${String(ex.length>0?Math.max(...ex)+1:1).padStart(2,'0')}`; };

// ─── IMPRESSÃO ────────────────────────────────────────────────────────────────

app.abrirImpressao = orcId => {
    try {
    const orc=appData.orcamentos.find(o=>o.id===orcId); if(!orc) return app.toast('Orçamento não encontrado.','err');
    const cfg=appData.config;
    // [5] Logo 25% maior: max-height 55→69px, max-width 150→188px
    const logoH=cfg.logoUrl?`<img src="${cfg.logoUrl}" style="max-height:69px;max-width:188px;object-fit:contain;" alt="Logo">`:`<strong style="font-size:18px;color:#013425;">${cfg.nome}</strong>`;
    const hInfo=`<strong>${cfg.nome}</strong><br>${cfg.end1}<br>${cfg.end2}<br>Tel: ${cfg.tel} · WhatsApp: ${cfg.wpp}`;
    const fmtData=new Date(orc.data+'T12:00:00').toLocaleDateString('pt-BR');

    // Protocolo original — para desc/indicacao/beneficios e fallback de fases
    const protoOrig=orc.protocoloId?appData.protocolos.find(p=>p.id===orc.protocoloId):null;
    const descricao=protoOrig&&protoOrig.desc?protoOrig.desc:'';
    const indicacao=protoOrig&&protoOrig.indicacao?protoOrig.indicacao:'';
    const beneficios=protoOrig&&protoOrig.beneficios?protoOrig.beneficios:'';

    // Se o orçamento não tem fases salvas (criado antes da v7),
    // usar as fases do protocolo original como fallback
    let fases = orc.fases || [];
    if (fases.length === 0 && protoOrig && protoOrig.fases && protoOrig.fases.length > 0) {
        fases = JSON.parse(JSON.stringify(protoOrig.fases)).map(f => ({
            ...f, livre: false, itens: f.itens.map(i => ({...i, cortesia: false}))
        }));
    }

    const parc = orc.numParcelas || 1;
    const parcVal = (orc.valorParcelado || 0) / parc;
    const liquido = (orc.valorBruto || 0) - (orc.valorCortesias || 0);

    let fasesHtml='', tabelaRows='';
    const fasesNormais = fases.filter(f => !f.livre);
    const faseAvulsa  = fases.find(f => f.livre);

    // Fases do protocolo
    fasesNormais.forEach((fase, fi) => {
        const sub = fase.itens.reduce((s,i) => s + (i.cortesia ? 0 : i.valorUnit * i.qtd), 0);
        const itensHtml = fase.itens.map(item => {
            let kitInlineHtml = '';
            if (item.tipo === 'kit') {
                const kit = appData.kits.find(k => k.id === item.refId);
                if (kit && kit.itens) {
                    const partes = kit.itens.map(ki => `${ki.qtd * item.qtd}x ${ki.nome}`).join(' · ');
                    kitInlineHtml = `<span style="font-size:11px;color:#888;margin-left:6px;">↳ ${partes}</span>`;
                }
            }
            return `
                <div class="p-item">
                    <div style="flex:1;">
                        <span>${item.qtd||1}x ${item.nome}</span>
                        ${kitInlineHtml}
                    </div>
                    <span style="font-weight:600;white-space:nowrap;margin-left:8px;">${item.cortesia?'Cortesia':app.fmt(item.valorUnit*item.qtd)}</span>
                </div>`;
        }).join('');
        fasesHtml += `<div class="p-fase"><div class="p-fase-h"><span>Fase ${fi+1} — ${fase.nome}</span><span>${app.fmt(sub)}</span></div><div class="p-fase-b">${itensHtml||'<p style="font-size:12px;color:#bbb;">Sem itens</p>'}</div></div>`;
        tabelaRows += `<tr>
            <td>
                <strong>Fase ${fi+1} — ${fase.nome}</strong>
                <div style="font-size:11px;color:#666;margin-top:3px;">
                    ${fase.itens.map(item => item.tipo==='kit' ? item.nome : `${item.qtd||1}x ${item.nome}`).join(' · ')}
                </div>
            </td>
            <td style="text-align:right;vertical-align:top;">${app.fmt(sub)}</td>
        </tr>`;
    });

    // Itens avulsos (sem fases)
    if (faseAvulsa && faseAvulsa.itens.length > 0) {
        const sub = faseAvulsa.itens.reduce((s,i) => s + (i.cortesia ? 0 : i.valorUnit * i.qtd), 0);
        const itensHtml = faseAvulsa.itens.map(item => {
            let kitInlineHtml = '';
            if (item.tipo === 'kit') {
                const kit = appData.kits.find(k => k.id === item.refId);
                if (kit && kit.itens) {
                    const partes = kit.itens.map(ki => `${ki.qtd * item.qtd}x ${ki.nome}`).join(' · ');
                    kitInlineHtml = `<span style="font-size:11px;color:#888;margin-left:6px;">↳ ${partes}</span>`;
                }
            }
            return `
                <div class="p-item">
                    <div style="flex:1;">
                        <span>${item.qtd||1}x ${item.nome}</span>
                        ${kitInlineHtml}
                    </div>
                    <span style="font-weight:600;white-space:nowrap;margin-left:8px;">${item.cortesia?'Cortesia':app.fmt(item.valorUnit*item.qtd)}</span>
                </div>`;
        }).join('');
        fasesHtml += `<div class="p-fase"><div class="p-fase-h"><span>Itens do Tratamento</span><span>${app.fmt(sub)}</span></div><div class="p-fase-b">${itensHtml}</div></div>`;
        tabelaRows += `<tr>
            <td>
                <strong>Itens do Tratamento</strong>
                <div style="font-size:11px;color:#666;margin-top:3px;">
                    ${faseAvulsa.itens.map(item => item.tipo==='kit' ? item.nome : `${item.qtd||1}x ${item.nome}`).join(' · ')}
                </div>
            </td>
            <td style="text-align:right;vertical-align:top;">${app.fmt(sub)}</td>
        </tr>`;
    }

    const html=`
    <div class="print-page page-break">
        <div class="p-header"><div>${logoH}</div><div class="p-hinfo">${hInfo}</div></div>
        <hr class="p-div">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:14px 0;">
            <div><div style="margin-bottom:8px;"><p class="p-label">Paciente</p><p style="font-size:14px;font-weight:700;color:#013425;">${orc.paciente}</p></div><div><p class="p-label">Médico(a)</p><p style="font-size:13px;font-weight:600;color:#013425;">${orc.medico}</p></div></div>
            <div style="text-align:right;"><div style="margin-bottom:8px;"><p class="p-label">Data</p><p style="font-size:14px;font-weight:700;color:#013425;">${fmtData}</p></div><div><p class="p-label">CRM</p><p style="font-size:13px;font-weight:600;">${orc.crm||'—'}</p></div></div>
        </div>
        <hr class="p-gdiv">
        <div style="margin:14px 0 10px;">
            <p class="p-label">Protocolo de Tratamento</p>
            <h1 style="font-size:22px;font-weight:700;color:#013425;margin-bottom:6px;">${orc.protocoloNome||'Proposta de Tratamento'}</h1>
            ${descricao?`<p style="font-size:13px;color:#555;line-height:1.6;">${descricao}</p>`:''}
        </div>
        ${indicacao?`
        <div style="margin-bottom:12px;">
            <p class="p-label">Indicação</p>
            <div style="background:#f9fafb;border-left:3px solid #C5A365;padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:#444;line-height:1.6;">${indicacao}</div>
        </div>`:''}
        ${beneficios?`
        <div style="margin-bottom:12px;">
            <p class="p-label">Benefícios do Tratamento</p>
            <div style="background:#f9fafb;border-left:3px solid #013425;padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:#444;line-height:1.6;">${beneficios}</div>
        </div>`:''}
    </div>

    <div class="print-page page-break">
        <div class="p-header"><div>${logoH}</div><div class="p-hinfo">${hInfo}</div></div>
        <hr class="p-div">
        <p class="p-label" style="margin-bottom:10px;">Composição do Protocolo</p>
        ${fasesHtml||'<p style="font-size:13px;color:#bbb;">Nenhuma fase.</p>'}
        <div class="p-total">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#a3b8b1;margin-bottom:4px;"><span>Total bruto:</span><span style="color:#fff;">${app.fmt(orc.valorBruto||0)}</span></div>
            ${(orc.valorCortesias||0)>0?`<div style="display:flex;justify-content:space-between;font-size:13px;color:#a3b8b1;margin-bottom:4px;"><span>Cortesias:</span><span style="color:#fdba74;">- ${app.fmt(orc.valorCortesias)}</span></div>`:''}
            ${(orc.valorCortesias||0)>0?`<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1);"><span style="color:#fff;font-weight:600;">Valor líquido:</span><span style="color:#fff;font-weight:700;">${app.fmt(liquido)}</span></div>`:'<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:8px 0;">'}
            <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px;margin-top:8px;"><span style="color:#C5A365;font-weight:600;">À Vista${orc.descAvista>0?` (${orc.descAvista}% off)`:''}:</span><span style="color:#fff;font-weight:700;font-size:17px;">${app.fmt(orc.valorAvista)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px;">
                <span style="color:#C5A365;font-weight:600;">Parcelado${orc.descParcelado>0?` (${orc.descParcelado}% off)`:''}:</span>
                <span style="color:#fff;font-weight:600;">${app.fmt(orc.valorParcelado)}${parc>1?` <span style="color:#a3b8b1;">(${parc}x ${app.fmt(parcVal)})</span>`:''}</span>
            </div>
        </div>
    </div>

    <div class="print-page">
        <!-- [3] Cabeçalho completo na página de resumo -->
        <div class="p-header"><div>${logoH}</div><div class="p-hinfo">${hInfo}</div></div>
        <hr class="p-div">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;">
            <div><div style="margin-bottom:6px;"><p class="p-label">Paciente</p><p style="font-size:13px;font-weight:700;color:#013425;">${orc.paciente}</p></div><div><p class="p-label">Médico(a)</p><p style="font-size:13px;font-weight:600;color:#013425;">${orc.medico}</p></div></div>
            <div style="text-align:right;"><div style="margin-bottom:6px;"><p class="p-label">Data</p><p style="font-size:13px;font-weight:700;color:#013425;">${fmtData}</p></div><div><p class="p-label">CRM</p><p style="font-size:13px;font-weight:600;">${orc.crm||'—'}</p></div></div>
        </div>
        <hr class="p-gdiv">
        <div style="text-align:center;padding:14px 0 20px;">
            <p style="font-size:18px;font-weight:700;color:#013425;margin-bottom:8px;">Investir no Tratamento é Investir em Você</p>
            <p style="font-size:13px;color:#666;max-width:500px;margin:0 auto;line-height:1.7;">Cada protocolo TricoMaster é desenvolvido exclusivamente para as suas necessidades, combinando tecnologia de ponta com atendimento personalizado.</p>
        </div>
        <hr class="p-gdiv">
        <table class="p-ctable">
            <thead><tr><th>Fase</th><th style="text-align:right;">Valor</th></tr></thead>
            <tbody>${tabelaRows}<tr style="background:#f9fafb;font-weight:700;"><td>Total</td><td style="text-align:right;color:#013425;">${app.fmt(orc.valorProtocolo||0)}</td></tr></tbody>
        </table>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px;">
            <div style="text-align:center;padding:18px 16px;background:#013425;border-radius:10px;">
                <p style="font-size:10px;color:#C5A365;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Valor à Vista</p>
                <p style="font-size:24px;font-weight:700;color:#fff;">${app.fmt(orc.valorAvista)}</p>
                ${orc.descAvista>0?`<p style="font-size:11px;color:#a3b8b1;margin-top:4px;">${orc.descAvista}% de desconto</p>`:''}
            </div>
            <div style="text-align:center;padding:18px 16px;background:#013425;border-radius:10px;">
                <p style="font-size:10px;color:#C5A365;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Parcelado</p>
                <p style="font-size:24px;font-weight:700;color:#fff;">${app.fmt(orc.valorParcelado)}</p>
                ${parc>1?`<p style="font-size:13px;color:#a3b8b1;margin-top:4px;">${parc}x ${app.fmt(parcVal)}</p>`:''}
                ${orc.descParcelado>0?`<p style="font-size:11px;color:#a3b8b1;">${orc.descParcelado}% de desconto</p>`:''}
            </div>
        </div>
        <div style="text-align:center;margin-top:30px;padding-top:16px;border-top:1px solid #eee;">
            <!-- [4] Proposta válida por 7 dias -->
            <p style="font-size:12px;color:#aaa;">Proposta válida por 7 dias · ${cfg.nome}</p>
            <p style="font-size:12px;color:#aaa;margin-top:3px;">Tel: ${cfg.tel} · WhatsApp: ${cfg.wpp}</p>
        </div>
    </div>`;

    app.el('print-content').innerHTML=html;
    app.show('print-view');
    } catch(e) {
        console.error('Erro na impressão:', e);
        app.toast('Erro ao gerar impressão: ' + e.message, 'err');
    }
};

app.fecharImpressao=()=>app.hide('print-view');

// ─── CONFIG ───────────────────────────────────────────────────────────────────

app.populateConfig=()=>{
    const c=appData.config;
    app.setVal('conf-nome',c.nome); app.setVal('conf-logo',c.logoUrl); app.setVal('conf-tel',c.tel);
    app.setVal('conf-wpp',c.wpp); app.setVal('conf-end1',c.end1); app.setVal('conf-end2',c.end2);
    app.renderMedicos();
};

// ─── MÉDICOS ──────────────────────────────────────────────────────────────────

app.renderMedicos = () => {
    const lista=app.el('medicos-lista'), empty=app.el('medicos-empty');
    if(!appData.medicos.length){ lista.innerHTML=''; empty.style.display='block'; return; }
    empty.style.display='none';
    lista.innerHTML=[...appData.medicos].sort((a,b)=>a.nome.localeCompare(b.nome)).map(m=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#f9fafb;border-radius:8px;border:1px solid #eee;">
            <div>
                <p style="font-weight:600;font-size:13px;color:#013425;">${m.nome}</p>
                <p style="font-size:12px;color:#888;">${m.crm}</p>
            </div>
            <div style="display:flex;gap:4px;">
                <button onclick="app.editMedico('${m.id}')" class="btn-icon" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button onclick="app.deleteMedico('${m.id}')" class="btn-icon btn-danger" title="Excluir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
            </div>
        </div>`).join('');
};

app.saveMedico = async () => {
    const id=app.val('medico-edit-id'), nome=app.val('medico-nome').trim(), crm=app.val('medico-crm').trim();
    if(!nome) return app.toast('Informe o nome do médico.','err');
    if(!crm) return app.toast('Informe o CRM.','err');
    const obj={id:id||app.uid(),nome,crm};
    if(id){ const i=appData.medicos.findIndex(m=>m.id===id); if(i>=0) appData.medicos[i]=obj; } else appData.medicos.push(obj);
    app.resetMedicoForm(); app.renderMedicos(); await app.save('medicos'); app.toast('Médico salvo!');
};

app.editMedico = id => {
    const m=appData.medicos.find(x=>x.id===id); if(!m) return;
    app.setVal('medico-edit-id',m.id); app.setVal('medico-nome',m.nome); app.setVal('medico-crm',m.crm);
    app.el('medico-cancel-btn').style.display='inline-flex';
};

app.deleteMedico = async id => {
    if(!confirm('Excluir médico?')) return;
    appData.medicos=appData.medicos.filter(m=>m.id!==id);
    app.renderMedicos(); await app.save('medicos'); app.toast('Médico excluído.');
};

app.resetMedicoForm = () => {
    app.setVal('medico-edit-id',''); app.setVal('medico-nome',''); app.setVal('medico-crm','');
    app.el('medico-cancel-btn').style.display='none';
};

// ─── BOOT ─────────────────────────────────────────────────────────────────────
window.app=app;
document.addEventListener('DOMContentLoaded', app.init);
