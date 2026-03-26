/*
 * TricoMaster Manager v7.0
 * Melhorias: ordem menu, copiar protocolo, editor de itens no orçamento,
 * cortesia, search + paginação, kits expandidos na impressão,
 * parcelado com total, médico padrão em config.
 */

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
