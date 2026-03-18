/*
 * RxTricoMaster — Receituário Médico Digital v2.0
 * - Medicamentos: apenas nome, dosagem, unidade
 * - Posologias padrão gerenciadas em Configurações
 * - Fórmulas: posologia e observação são da fórmula (não por medicamento)
 * - Receitas: mesma lógica
 * - Impressão simplificada
 */

// ─── ESTADO ───────────────────────────────────────────────────────────────────

let appData = {
    config: { nome:'Clínica Médica', logoUrl:'', tel:'', wpp:'', end1:'', end2:'', cnpj:'' },
    medicamentos: [],  // { id, nome, dosagemQtd, dosagemUnidade }
    posologias: [],    // { id, texto }
    formulas: [],      // { id, nome, desc, posologia, obs, medicamentos:[{id,refId,nome,dosagemQtd,dosagemUnidade}] }
    receitas: [],      // { id, paciente, medicoId, medico, crm, especialidade, data, diagnostico, posologia, obs, medicamentos:[...] }
    medicos: [],       // { id, nome, crm, especialidade, assinatura }
};

let ui = {
    userId: null, userDocRef: null,
    viewAtiva: 'receitas',
    recPage: 1, recSearch: '',
    formPage: 1, formSearch: '',
    medPage: 1, medSearch: '',
    PER_PAGE: 10,
};

let receitaEmEdicao = null;
let formulaEmEdicao = null;
let modalContexto   = 'receita';

const app = {};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

app.uid    = () => { try { return db.collection('_').doc().id; } catch(e) { return 'l'+Date.now()+Math.random().toString(36).slice(2,8); } };
app.el     = id => document.getElementById(id);
app.val    = id => { const e=app.el(id); return e?e.value:''; };
app.setVal = (id,v) => { const e=app.el(id); if(e) e.value = v??''; };
app.show   = (id, flex=false) => { const e=app.el(id); if(e) e.style.display=flex?'flex':'block'; };
app.hide   = id => { const e=app.el(id); if(e) e.style.display='none'; };

app.toast = (msg, type='ok') => {
    const t=app.el('toast'); t.textContent=msg; t.className=`toast ${type}`; t.classList.add('show');
    clearTimeout(app._toastTimer); app._toastTimer=setTimeout(()=>t.classList.remove('show'),3000);
};

app.paginate = (lista, page, perPage) => {
    const total=lista.length, pages=Math.max(1,Math.ceil(total/perPage));
    const p=Math.min(Math.max(1,page),pages);
    return { items:lista.slice((p-1)*perPage,p*perPage), page:p, pages, total };
};

app.renderPag = (containerId, page, pages, total, onPrev, onNext) => {
    const c=app.el(containerId); if(!c) return;
    if(pages<=1){ c.style.display='none'; return; }
    c.style.display='flex';
    c.innerHTML=`<span>${total} item${total!==1?'s':''}</span><div class="pag-btns"><button class="pag-btn" onclick="${onPrev}" ${page<=1?'disabled':''}>&#8249; Anterior</button><span style="padding:4px 10px;font-size:13px;color:#555;">Pág ${page}/${pages}</span><button class="pag-btn" onclick="${onNext}" ${page>=pages?'disabled':''}>Próximo &#8250;</button></div>`;
};

app.fmtDosagem = (qtd, unidade) => {
    if(!qtd && !unidade) return '';
    return unidade ? `${qtd} ${unidade}` : qtd;
};

// Title-case helper para campos de texto
app.toTitleCase = str => str ? str.replace(/\b\w/g, c => c.toUpperCase()) : str;

// Toggle campo livre Forma de Uso (receita)
app.onFormaUsoChange = () => {
    const v = app.val('rec-forma-uso');
    const wrap = app.el('rec-forma-uso-livre-wrap');
    if(wrap) wrap.style.display = v === 'livre' ? 'block' : 'none';
};

// Toggle campo livre Apresentação (fórmula)
app.onFormApresentacaoChange = () => {
    const v = app.val('form-apresentacao');
    const wrap = app.el('form-apresentacao-livre-wrap');
    if(wrap) wrap.style.display = v === 'livre' ? 'block' : 'none';
};

// Toggle campo livre Apresentação (receita)
app.onRecApresentacaoChange = () => {
    const v = app.val('rec-apresentacao');
    const wrap = app.el('rec-apresentacao-livre-wrap');
    if(wrap) wrap.style.display = v === 'livre' ? 'block' : 'none';
};

// Retorna texto de Forma de Uso da receita
app._getFormaUsoTexto = () => {
    const v = app.val('rec-forma-uso');
    if(v === 'livre') return app.val('rec-forma-uso-livre').trim();
    const labels = {oral:'Via Oral',topica:'Uso Tópico',injetavel:'Via Injetável',sublingual:'Via Sublingual',inalatoria:'Via Inalatória',oftalmico:'Uso Oftálmico',nasal:'Uso Nasal',retal:'Uso Retal',vaginal:'Uso Vaginal'};
    return labels[v] || '';
};

// Retorna texto de Apresentação da fórmula
app._getApresentacaoTexto = () => {
    const v = app.val('form-apresentacao');
    if(v === 'livre') return app.toTitleCase(app.val('form-apresentacao-livre').trim());
    return v || '';
};

// Retorna texto de Apresentação da receita
app._getRecApresentacaoTexto = () => {
    const v = app.val('rec-apresentacao');
    if(v === 'livre') return app.toTitleCase(app.val('rec-apresentacao-livre').trim());
    return v || '';
};

// ─── FIREBASE ─────────────────────────────────────────────────────────────────

app.init = () => {
    app.el('login-form').addEventListener('submit', app.handleLogin);
    auth.onAuthStateChanged(async user => {
        if(user){
            ui.userId=user.uid;
            ui.userDocRef=db.collection('rxmaster_v1').doc(user.uid);
            app.hide('login-view'); app.show('loading-view',true);
            await app.loadData();
            app.hide('loading-view'); app.show('app-view',true);
            app.navigate('receitas');
        } else {
            app.show('login-view',true); app.hide('loading-view'); app.hide('app-view');
        }
    });
};

app.handleLogin = e => {
    e.preventDefault();
    const btn=app.el('btn-login'), err=app.el('login-error');
    err.style.display='none'; btn.disabled=true; btn.textContent='Entrando...';
    auth.signInWithEmailAndPassword(app.val('login-email'),app.val('login-password'))
        .catch(()=>{ err.textContent='E-mail ou senha inválidos.'; err.style.display='block'; btn.disabled=false; btn.textContent='Entrar'; });
};

app.handleLogout = () => { if(confirm('Sair do sistema?')) auth.signOut(); };

app.loadData = async () => {
    try {
        const doc=await ui.userDocRef.get();
        if(doc.exists){
            const d=doc.data();
            appData={...appData,...d,config:{...appData.config,...(d.config||{})}};
            if(!appData.posologias) appData.posologias=[];
        } else {
            await ui.userDocRef.set(appData);
        }
    } catch(e){ console.error(e); app.toast('Erro ao carregar dados.','err'); }
};

app.save = async col => {
    if(!ui.userDocRef) return;
    try { await ui.userDocRef.set({[col]:appData[col]},{merge:true}); }
    catch(e){ console.error(e); app.toast('Erro ao salvar.','err'); }
};

// ─── NAVEGAÇÃO ────────────────────────────────────────────────────────────────

app.navigate = view => {
    ui.viewAtiva=view;
    document.querySelectorAll('main > section').forEach(s=>s.style.display='none');
    app.show(`view-${view}`);
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    const ni=app.el(`nav-${view}`); if(ni) ni.classList.add('active');
    if(view==='receitas')     app.renderReceitaList();
    if(view==='formulas')     app.renderFormulaList();
    if(view==='medicamentos') app.renderMedicamentos();
    if(view==='config')       app.populateConfig();
};

// ─── MEDICAMENTOS (nome, dosagem, unidade) ────────────────────────────────────

app.renderMedicamentos = () => {
    const q=(app.val('med-search')||'').toLowerCase();
    const lista=appData.medicamentos.filter(m=>m.nome.toLowerCase().includes(q)).sort((a,b)=>a.nome.localeCompare(b.nome));
    const {items,page,pages,total}=app.paginate(lista,ui.medPage,ui.PER_PAGE);
    ui.medPage=page;
    const empty=app.el('med-empty'), table=app.el('med-table');
    if(!lista.length){ empty.style.display='block'; table.style.display='none'; app.hide('med-pag'); return; }
    empty.style.display='none'; table.style.display='table';
    app.el('med-tbody').innerHTML=items.map(m=>`
        <tr>
            <td><span style="font-weight:600;color:#013425;">${m.nome}</span></td>
            <td><span class="pill pill-gold">${app.fmtDosagem(m.dosagemQtd,m.dosagemUnidade)||'—'}</span></td>
            <td style="text-align:center;">
                <div style="display:flex;justify-content:center;gap:2px;">
                    <button onclick="app.editMedicamento('${m.id}')" class="btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onclick="app.deleteMedicamento('${m.id}')" class="btn-icon btn-danger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
                </div>
            </td>
        </tr>`).join('');
    app.renderPag('med-pag',page,pages,total,"app.medPagePrev()","app.medPageNext()");
};
app.medPagePrev=()=>{ ui.medPage--; app.renderMedicamentos(); };
app.medPageNext=()=>{ ui.medPage++; app.renderMedicamentos(); };

app.saveMedicamento = async () => {
    const id=app.val('med-id'), nome=app.toTitleCase(app.val('med-nome').trim());
    if(!nome) return app.toast('Informe o nome do medicamento.','err');
    const obj={id:id||app.uid(),nome,dosagemQtd:app.val('med-dosagem-qtd').trim(),dosagemUnidade:app.val('med-dosagem-unidade')};
    if(id){ const i=appData.medicamentos.findIndex(m=>m.id===id); if(i>=0) appData.medicamentos[i]=obj; } else appData.medicamentos.push(obj);
    app.resetMedForm(); app.renderMedicamentos(); await app.save('medicamentos'); app.toast('Medicamento salvo!');
};

app.editMedicamento = id => {
    const m=appData.medicamentos.find(x=>x.id===id); if(!m) return;
    app.setVal('med-id',m.id); app.setVal('med-nome',m.nome);
    app.setVal('med-dosagem-qtd',m.dosagemQtd||''); app.setVal('med-dosagem-unidade',m.dosagemUnidade||'mg');
    app.el('med-form-title').textContent='Editando Medicamento';
    app.el('med-cancel-btn').style.display='inline-flex';
};

app.deleteMedicamento = async id => {
    if(!confirm('Excluir medicamento?')) return;
    appData.medicamentos=appData.medicamentos.filter(m=>m.id!==id);
    app.renderMedicamentos(); await app.save('medicamentos'); app.toast('Excluído.');
};

app.resetMedForm = () => {
    ['med-id','med-nome','med-dosagem-qtd'].forEach(id=>app.setVal(id,''));
    app.setVal('med-dosagem-unidade','mg');
    app.el('med-form-title').textContent='Novo Medicamento';
    app.el('med-cancel-btn').style.display='none';
};

// ─── POSOLOGIAS PADRÃO ────────────────────────────────────────────────────────

app.renderPosologias = () => {
    const lista=app.el('posologias-lista'), empty=app.el('posologias-empty');
    if(!appData.posologias||!appData.posologias.length){ lista.innerHTML=''; empty.style.display='block'; return; }
    empty.style.display='none';
    lista.innerHTML=[...appData.posologias].map(p=>`
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;padding:10px 12px;background:#f9fafb;border-radius:8px;border:1px solid #eee;margin-bottom:6px;">
            <p style="font-size:13px;color:#333;flex:1;margin:0;line-height:1.6;">${p.texto}</p>
            <div style="display:flex;gap:4px;flex-shrink:0;">
                <button onclick="app.editPosologia('${p.id}')" class="btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button onclick="app.deletePosologia('${p.id}')" class="btn-icon btn-danger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
            </div>
        </div>`).join('');
};

app.savePosologia = async () => {
    const id=app.val('posologia-edit-id'), texto=app.val('posologia-texto').trim();
    if(!texto) return app.toast('Informe o texto da posologia.','err');
    const obj={id:id||app.uid(),texto};
    if(id){ const i=appData.posologias.findIndex(p=>p.id===id); if(i>=0) appData.posologias[i]=obj; } else appData.posologias.push(obj);
    app.resetPosologiaForm(); app.renderPosologias(); await app.save('posologias'); app.toast('Posologia salva!');
};

app.editPosologia = id => {
    const p=appData.posologias.find(x=>x.id===id); if(!p) return;
    app.setVal('posologia-edit-id',p.id); app.setVal('posologia-texto',p.texto);
    app.el('posologia-cancel-btn').style.display='inline-flex';
};

app.deletePosologia = async id => {
    if(!confirm('Excluir posologia?')) return;
    appData.posologias=appData.posologias.filter(p=>p.id!==id);
    app.renderPosologias(); await app.save('posologias'); app.toast('Posologia excluída.');
};

app.resetPosologiaForm = () => {
    app.setVal('posologia-edit-id',''); app.setVal('posologia-texto','');
    app.el('posologia-cancel-btn').style.display='none';
};

app._popularSelectPosologia = (selectId) => {
    const sel=app.el(selectId); if(!sel) return;
    sel.innerHTML='<option value="">— Inserir posologia padrão —</option>'+
        (appData.posologias||[]).map(p=>`<option value="${p.id}">${p.texto.length>70?p.texto.slice(0,70)+'…':p.texto}</option>`).join('');
};

// ─── MODAL ADD MEDICAMENTO ────────────────────────────────────────────────────

app.abrirModalAddMed = (contexto) => {
    modalContexto=contexto||'receita';
    app.el('modal-add-med-titulo').textContent=modalContexto==='receita'?'Adicionar Medicamento à Receita':'Adicionar Medicamento à Fórmula';
    const sel=app.el('modal-med-select');
    sel.innerHTML='<option value="">— Selecione ou preencha manualmente —</option>'+
        [...appData.medicamentos].sort((a,b)=>a.nome.localeCompare(b.nome))
            .map(m=>`<option value="${m.id}" data-qtd="${m.dosagemQtd||''}" data-un="${m.dosagemUnidade||'mg'}">${m.nome}${m.dosagemQtd?' — '+app.fmtDosagem(m.dosagemQtd,m.dosagemUnidade):''}</option>`).join('');
    app.setVal('modal-med-select',''); app.setVal('modal-med-nome','');
    app.setVal('modal-med-dosagem-qtd',''); app.setVal('modal-med-dosagem-unidade','mg');
    app.setVal('modal-med-posologia','');
    // Mostrar campo de posologia por medicamento somente na receita
    const wrap=app.el('modal-posologia-med-wrap');
    if(wrap) wrap.style.display=modalContexto==='receita'?'block':'none';
    // Popular select de posologias no modal
    app._popularSelectPosologia('modal-posologia-select');
    app.show('modal-add-med','flex');
};

app.onModalPosologiaSelect = () => {
    const id=app.val('modal-posologia-select'); if(!id) return;
    const p=appData.posologias.find(x=>x.id===id); if(!p) return;
    const atual=app.val('modal-med-posologia').trim();
    app.setVal('modal-med-posologia',atual?atual+'\n'+p.texto:p.texto);
    app.setVal('modal-posologia-select','');
};

app.onModalMedSelect = () => {
    const sel=app.el('modal-med-select'), id=sel.value; if(!id) return;
    const opt=sel.options[sel.selectedIndex];
    app.setVal('modal-med-nome',opt.textContent.split(' — ')[0]);
    app.setVal('modal-med-dosagem-qtd',opt.dataset.qtd||'');
    app.setVal('modal-med-dosagem-unidade',opt.dataset.un||'mg');
};

app.fecharModalAddMed = () => app.hide('modal-add-med');

app.confirmarAddMed = () => {
    const nome=app.toTitleCase(app.val('modal-med-nome').trim());
    if(!nome) return app.toast('Informe o nome do medicamento.','err');
    const posologiaMed = modalContexto==='receita' ? app.val('modal-med-posologia').trim() : '';
    const item={id:app.uid(),refId:app.val('modal-med-select')||null,nome,
        dosagemQtd:app.val('modal-med-dosagem-qtd').trim(),dosagemUnidade:app.val('modal-med-dosagem-unidade'),
        posologiaMed};
    if(modalContexto==='receita'){
        if(!receitaEmEdicao.medicamentos) receitaEmEdicao.medicamentos=[];
        receitaEmEdicao.medicamentos.push(item); app.renderReceitaMeds();
    } else {
        if(!formulaEmEdicao.medicamentos) formulaEmEdicao.medicamentos=[];
        formulaEmEdicao.medicamentos.push(item); app.renderFormulaMeds();
    }
    app.fecharModalAddMed();
};

// ─── RENDER MEDS ─────────────────────────────────────────────────────────────

app.renderReceitaMeds = () => {
    const lista=receitaEmEdicao.medicamentos||[];
    const c=app.el('rec-meds-lista');
    const resumo=app.el('rec-resumo-meds');
    const totalEl=app.el('rec-total-itens');
    if(totalEl) totalEl.textContent=lista.length;
    if(!lista.length){
        c.innerHTML='<div class="empty-state" style="padding:24px;border:1.5px dashed #e0e7e3;border-radius:10px;color:#bbb;">Nenhum medicamento adicionado</div>';
        if(resumo) resumo.innerHTML='<span style="color:#5a8a77;">Nenhum medicamento</span>';
        return;
    }
    if(resumo) resumo.innerHTML=lista.map((m,i)=>`
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
            <span>${i+1}. ${m.nome}</span>
            <span style="color:#C5A365;font-size:12px;">${app.fmtDosagem(m.dosagemQtd,m.dosagemUnidade)||''}</span>
        </div>`).join('');
    c.innerHTML=lista.map((m,i)=>`
        <div style="background:#f9fafb;border-radius:8px;border:1px solid #eee;margin-bottom:6px;overflow:hidden;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;">
                <div>
                    <span style="font-weight:600;font-size:14px;color:#013425;">${m.nome}</span>
                    ${m.dosagemQtd?`<span class="pill pill-gold" style="margin-left:8px;">${app.fmtDosagem(m.dosagemQtd,m.dosagemUnidade)}</span>`:''}
                </div>
                <button onclick="app.removeRecMed(${i})" class="btn-icon btn-danger"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            ${m.posologiaMed?`<div style="padding:6px 14px 10px;font-size:12px;color:#666;border-top:1px solid #eee;"><strong style="color:#C5A365;font-size:10px;text-transform:uppercase;letter-spacing:0.04em;">Posologia específica: </strong>${m.posologiaMed}</div>`:''}
        </div>`).join('');
};
app.removeRecMed = i => { receitaEmEdicao.medicamentos.splice(i,1); app.renderReceitaMeds(); };

app.renderFormulaMeds = () => {
    const lista=formulaEmEdicao.medicamentos||[];
    const c=app.el('form-meds-lista');
    if(!lista.length){
        c.innerHTML='<div class="empty-state" style="padding:24px;border:1.5px dashed #e0e7e3;border-radius:10px;color:#bbb;">Nenhum medicamento adicionado</div>';
        return;
    }
    c.innerHTML=lista.map((m,i)=>`
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#f9fafb;border-radius:8px;border:1px solid #eee;margin-bottom:6px;">
            <div>
                <span style="font-weight:600;font-size:14px;color:#013425;">${m.nome}</span>
                ${m.dosagemQtd?`<span class="pill pill-gold" style="margin-left:8px;">${app.fmtDosagem(m.dosagemQtd,m.dosagemUnidade)}</span>`:''}
            </div>
            <button onclick="app.removeFormulaMed(${i})" class="btn-icon btn-danger"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        </div>`).join('');
};
app.removeFormulaMed = i => { formulaEmEdicao.medicamentos.splice(i,1); app.renderFormulaMeds(); };

// ─── FÓRMULAS ─────────────────────────────────────────────────────────────────

app.renderFormulaList = () => {
    app.show('form-list-view'); app.hide('form-editor-view');
    const q=(app.val('form-search')||'').toLowerCase();
    const lista=appData.formulas.filter(f=>(f.nome||'').toLowerCase().includes(q)).sort((a,b)=>a.nome.localeCompare(b.nome));
    const {items,page,pages,total}=app.paginate(lista,ui.formPage,ui.PER_PAGE);
    ui.formPage=page;
    const empty=app.el('form-empty'), listaEl=app.el('form-lista');
    if(!lista.length){ empty.style.display='block'; listaEl.innerHTML=''; app.hide('form-pag'); return; }
    empty.style.display='none';
    listaEl.innerHTML=items.map(f=>`
        <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #f0f0f0;">
            <div style="flex:1;min-width:0;">
                <p style="font-weight:600;font-size:14px;color:#013425;">${f.nome}</p>
                <p style="font-size:12px;color:#888;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${f.medicamentos?.length
                        ? f.medicamentos.map(m=>m.nome).join(' · ')
                        : '<em>Sem medicamentos</em>'}
                </p>
                ${(f.apresentacao||f.desc)?`<p style="font-size:11px;color:#aaa;margin-top:2px;">${[f.apresentacao,f.desc].filter(Boolean).join(' · ')}</p>`:''}
            </div>
            <div style="display:flex;gap:4px;flex-shrink:0;margin-left:12px;">
                <button onclick="app.editFormula('${f.id}')" class="btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button onclick="app.copyFormula('${f.id}')" class="btn-icon btn-gold" title="Duplicar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
                <button onclick="app.deleteFormula('${f.id}')" class="btn-icon btn-danger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
            </div>
        </div>`).join('');
    app.renderPag('form-pag',page,pages,total,"app.formPagePrev()","app.formPageNext()");
};
app.formPagePrev=()=>{ ui.formPage--; app.renderFormulaList(); };
app.formPageNext=()=>{ ui.formPage++; app.renderFormulaList(); };

app.novaFormula = () => {
    formulaEmEdicao={id:null,nome:'',desc:'',apresentacao:'',posologia:'',obs:'',medicamentos:[]};
    app.hide('form-list-view'); app.show('form-editor-view');
    app.el('form-editor-titulo').textContent='Nova Fórmula';
    app.setVal('form-nome',''); app.setVal('form-desc','');
    app.setVal('form-apresentacao',''); app.setVal('form-apresentacao-livre','');
    const w=app.el('form-apresentacao-livre-wrap'); if(w) w.style.display='none';
    app.setVal('form-posologia',''); app.setVal('form-obs','');
    app._popularSelectPosologia('form-posologia-select');
    app.renderFormulaMeds();
};

app.editFormula = id => {
    const f=appData.formulas.find(x=>x.id===id); if(!f) return;
    formulaEmEdicao=JSON.parse(JSON.stringify(f));
    app.hide('form-list-view'); app.show('form-editor-view');
    app.el('form-editor-titulo').textContent='Editando Fórmula';
    app.setVal('form-nome',f.nome); app.setVal('form-desc',f.desc||'');
    // Apresentação
    const apres = f.apresentacao||'';
    const apresOpts = ['Cápsula','Comprimido','Frasco','Sachê','Creme','Gel','Pomada','Solução','Ampola','Spray','Gotas','Adesivo'];
    if(apresOpts.includes(apres)){
        app.setVal('form-apresentacao',apres); app.setVal('form-apresentacao-livre','');
        const w=app.el('form-apresentacao-livre-wrap'); if(w) w.style.display='none';
    } else if(apres){
        app.setVal('form-apresentacao','livre'); app.setVal('form-apresentacao-livre',apres);
        const w=app.el('form-apresentacao-livre-wrap'); if(w) w.style.display='block';
    } else {
        app.setVal('form-apresentacao',''); app.setVal('form-apresentacao-livre','');
        const w=app.el('form-apresentacao-livre-wrap'); if(w) w.style.display='none';
    }
    app.setVal('form-posologia',f.posologia||''); app.setVal('form-obs',f.obs||'');
    app._popularSelectPosologia('form-posologia-select');
    app.renderFormulaMeds();
};

app.voltarFormulaList = () => app.renderFormulaList();

app.copyFormula = id => {
    const f=appData.formulas.find(x=>x.id===id); if(!f) return;
    const copia=JSON.parse(JSON.stringify(f)); copia.id=app.uid(); copia.nome=copia.nome+' (cópia)';
    appData.formulas.push(copia); app.save('formulas'); app.renderFormulaList(); app.toast('Fórmula duplicada!');
};

app.deleteFormula = async id => {
    if(!confirm('Excluir fórmula?')) return;
    appData.formulas=appData.formulas.filter(f=>f.id!==id);
    app.renderFormulaList(); await app.save('formulas'); app.toast('Excluído.');
};

app.onFormPosologiaSelect = () => {
    const id=app.val('form-posologia-select'); if(!id) return;
    const p=appData.posologias.find(x=>x.id===id); if(!p) return;
    const atual=app.val('form-posologia').trim();
    app.setVal('form-posologia',atual?atual+'\n'+p.texto:p.texto);
    app.setVal('form-posologia-select','');
};

app.saveFormula = async () => {
    const nome=app.toTitleCase(app.val('form-nome').trim());
    if(!nome) return app.toast('Informe o nome da fórmula.','err');
    formulaEmEdicao.nome=nome; formulaEmEdicao.desc=app.val('form-desc').trim();
    formulaEmEdicao.apresentacao=app._getApresentacaoTexto();
    formulaEmEdicao.posologia=app.val('form-posologia').trim();
    formulaEmEdicao.obs=app.val('form-obs').trim();
    const obj={...formulaEmEdicao,id:formulaEmEdicao.id||app.uid()};
    if(formulaEmEdicao.id){ const i=appData.formulas.findIndex(x=>x.id===formulaEmEdicao.id); if(i>=0) appData.formulas[i]=obj; } else appData.formulas.push(obj);
    await app.save('formulas'); app.toast('Fórmula salva!'); app.renderFormulaList();
};

// ─── RECEITAS ─────────────────────────────────────────────────────────────────

app.renderReceitaList = () => {
    app.show('rec-list-view'); app.hide('rec-editor-view');
    const q=(app.val('rec-search')||'').toLowerCase();
    const lista=appData.receitas
        .filter(r=>(r.paciente||'').toLowerCase().includes(q)||(r.medico||'').toLowerCase().includes(q))
        .sort((a,b)=>new Date(b.data)-new Date(a.data));
    const {items,page,pages,total}=app.paginate(lista,ui.recPage,ui.PER_PAGE);
    ui.recPage=page;
    const empty=app.el('rec-empty'), table=app.el('rec-table');
    if(!lista.length){ empty.style.display='block'; table.style.display='none'; app.hide('rec-pag'); return; }
    empty.style.display='none'; table.style.display='table';
    app.el('rec-tbody').innerHTML=items.map(r=>`
        <tr>
            <td style="font-size:12px;color:#aaa;">${r.id}</td>
            <td>${new Date(r.data+'T12:00:00').toLocaleDateString('pt-BR')}</td>
            <td style="font-weight:500;">${r.paciente}</td>
            <td style="font-size:13px;color:#013425;font-weight:500;">${r.medico||'—'}</td>
            <td style="font-size:12px;color:#888;">${r.crm||'—'}</td>
            <td style="text-align:center;">
                <div style="display:flex;justify-content:center;gap:3px;">
                    <button onclick="app.imprimirReceita('${r.id}')" class="btn-icon" title="Imprimir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
                    <button onclick="app.editReceita('${r.id}')" class="btn-icon" title="Editar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                    <button onclick="app.deleteReceita('${r.id}')" class="btn-icon btn-danger" title="Excluir"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
                </div>
            </td>
        </tr>`).join('');
    app.renderPag('rec-pag',page,pages,total,"app.recPagePrev()","app.recPageNext()");
};
app.recPagePrev=()=>{ ui.recPage--; app.renderReceitaList(); };
app.recPageNext=()=>{ ui.recPage++; app.renderReceitaList(); };

app.novaReceita = () => {
    receitaEmEdicao={id:null,paciente:'',medicoId:'',medico:'',crm:'',especialidade:'',data:new Date().toISOString().slice(0,10),diagnostico:'',formaUso:'oral',formaUsoLivre:'',apresentacao:'',apresentacaoLivre:'',posologia:'',obs:'',medicamentos:[]};
    app.abrirEditorReceita('Nova Receita');
};

app.editReceita = id => {
    const r=appData.receitas.find(x=>x.id===id); if(!r) return;
    receitaEmEdicao=JSON.parse(JSON.stringify(r));
    app.abrirEditorReceita(`Editando #${id}`);
};

app.deleteReceita = async id => {
    if(!confirm('Excluir receita?')) return;
    appData.receitas=appData.receitas.filter(r=>r.id!==id);
    app.renderReceitaList(); await app.save('receitas'); app.toast('Excluída.');
};

app.voltarReceitaList = () => app.renderReceitaList();

app.abrirEditorReceita = titulo => {
    app.hide('rec-list-view'); app.show('rec-editor-view');
    app.el('rec-editor-titulo').textContent=titulo;
    const r=receitaEmEdicao;
    app.setVal('rec-paciente',r.paciente);
    app.setVal('rec-data',r.data);
    app.setVal('rec-diagnostico',r.diagnostico||'');
    app.setVal('rec-posologia',r.posologia||'');
    app.setVal('rec-obs',r.obs||'');

    // Forma de uso
    const formaUso = r.formaUso || 'oral';
    app.setVal('rec-forma-uso', formaUso);
    app.setVal('rec-forma-uso-livre', r.formaUsoLivre||'');
    const wFU=app.el('rec-forma-uso-livre-wrap');
    if(wFU) wFU.style.display = formaUso==='livre' ? 'block' : 'none';

    // Apresentação
    const apres = r.apresentacao||'';
    const apresOpts = ['Cápsula','Comprimido','Frasco','Sachê','Creme','Gel','Pomada','Solução','Ampola','Spray','Gotas','Adesivo'];
    if(apresOpts.includes(apres)){
        app.setVal('rec-apresentacao', apres); app.setVal('rec-apresentacao-livre','');
        const wA=app.el('rec-apresentacao-livre-wrap'); if(wA) wA.style.display='none';
    } else if(apres){
        app.setVal('rec-apresentacao','livre'); app.setVal('rec-apresentacao-livre', apres);
        const wA=app.el('rec-apresentacao-livre-wrap'); if(wA) wA.style.display='block';
    } else {
        app.setVal('rec-apresentacao',''); app.setVal('rec-apresentacao-livre','');
        const wA=app.el('rec-apresentacao-livre-wrap'); if(wA) wA.style.display='none';
    }

    const selMed=app.el('rec-medico');
    selMed.innerHTML='<option value="">— Selecione o médico —</option>'+
        [...appData.medicos].sort((a,b)=>a.nome.localeCompare(b.nome))
            .map(m=>`<option value="${m.id}" data-crm="${m.crm}" data-esp="${m.especialidade||''}">${m.nome}${m.crm?' — '+m.crm:''}</option>`).join('');
    selMed.value=r.medicoId||'';
    selMed.onchange=()=>{ const opt=selMed.options[selMed.selectedIndex]; app.setVal('rec-crm',opt?opt.dataset.crm||'':''); };
    if(r.medicoId){ const opt=selMed.querySelector(`option[value="${r.medicoId}"]`); if(opt) app.setVal('rec-crm',opt.dataset.crm||''); }

    const selForm=app.el('rec-formula-select');
    selForm.innerHTML='<option value="">📋 Usar Fórmula...</option>'+
        [...appData.formulas].sort((a,b)=>a.nome.localeCompare(b.nome))
            .map(f=>`<option value="${f.id}">${f.nome}</option>`).join('');

    app._popularSelectPosologia('rec-posologia-select');
    app.setVal('rec-posologia-select','');

    const btnImp=app.el('btn-imprimir-rec');
    if(btnImp) btnImp.style.display=r.id?'inline-flex':'none';

    app.renderReceitaMeds();
};

app.onRecPosologiaSelect = () => {
    const id=app.val('rec-posologia-select'); if(!id) return;
    const p=appData.posologias.find(x=>x.id===id); if(!p) return;
    const atual=app.val('rec-posologia').trim();
    app.setVal('rec-posologia',atual?atual+'\n'+p.texto:p.texto);
    app.setVal('rec-posologia-select','');
};

app.carregarFormula = () => {
    const id=app.val('rec-formula-select'); if(!id) return;
    const f=appData.formulas.find(x=>x.id===id); if(!f) return;
    if(receitaEmEdicao.medicamentos?.length>0){
        if(!confirm('Carregar esta fórmula substituirá os medicamentos atuais. Continuar?')){
            app.setVal('rec-formula-select',''); return;
        }
    }
    receitaEmEdicao.medicamentos=JSON.parse(JSON.stringify(f.medicamentos||[])).map(m=>({...m,id:app.uid()}));
    if(f.posologia) app.setVal('rec-posologia', f.posologia);
    if(f.obs)       app.setVal('rec-obs', f.obs);
    // Puxar apresentação da fórmula para a receita
    if(f.apresentacao){
        const apresOpts=['Cápsula','Comprimido','Frasco','Sachê','Creme','Gel','Pomada','Solução','Ampola','Spray','Gotas','Adesivo'];
        if(apresOpts.includes(f.apresentacao)){
            app.setVal('rec-apresentacao', f.apresentacao);
            app.setVal('rec-apresentacao-livre','');
            const w=app.el('rec-apresentacao-livre-wrap'); if(w) w.style.display='none';
        } else {
            app.setVal('rec-apresentacao','livre');
            app.setVal('rec-apresentacao-livre', f.apresentacao);
            const w=app.el('rec-apresentacao-livre-wrap'); if(w) w.style.display='block';
        }
    }
    app.renderReceitaMeds();
    app.toast(`Fórmula "${f.nome}" carregada!`);
};

app.saveReceita = async () => {
    const pac=app.toTitleCase(app.val('rec-paciente').trim());
    if(!pac) return app.toast('Informe o nome do paciente.','err');
    const selMed=app.el('rec-medico'), medicoId=selMed.value;
    if(!medicoId) return app.toast('Selecione o médico.','err');
    if(!receitaEmEdicao.medicamentos?.length) return app.toast('Adicione pelo menos um medicamento.','err');
    const opt=selMed.options[selMed.selectedIndex];
    const obj={
        ...receitaEmEdicao,
        id:receitaEmEdicao.id||app.gerarIdRec(),
        paciente:pac, medicoId,
        medico:opt?opt.textContent.split(' — ')[0]:'',
        crm:opt?opt.dataset.crm||'':'',
        especialidade:opt?opt.dataset.esp||'':'',
        data:app.val('rec-data'),
        diagnostico:app.val('rec-diagnostico').trim(),
        formaUso:app.val('rec-forma-uso'),
        formaUsoLivre:app.val('rec-forma-uso-livre').trim(),
        apresentacao:app._getRecApresentacaoTexto(),
        posologia:app.val('rec-posologia').trim(),
        obs:app.val('rec-obs').trim()
    };
    if(receitaEmEdicao.id){ const i=appData.receitas.findIndex(x=>x.id===receitaEmEdicao.id); if(i>=0) appData.receitas[i]=obj; } else appData.receitas.push(obj);
    receitaEmEdicao=obj;
    await app.save('receitas'); app.toast('Receita salva!');
    const btnImp=app.el('btn-imprimir-rec'); if(btnImp) btnImp.style.display='inline-flex';
};

app.gerarIdRec = () => {
    const d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0'),pref=`RX${y}.${m}.${day}`;
    const ex=appData.receitas.filter(r=>r.id&&r.id.startsWith(pref)).map(r=>parseInt(r.id.split('-')[1])||0);
    return `${pref}-${String(ex.length>0?Math.max(...ex)+1:1).padStart(3,'0')}`;
};

// ─── IMPRESSÃO ────────────────────────────────────────────────────────────────

app.imprimirReceita = recId => {
    const rec=recId?appData.receitas.find(r=>r.id===recId):receitaEmEdicao;
    if(!rec) return app.toast('Receita não encontrada.','err');

    const cfg=appData.config;
    // Logo 30% maior, alinhado pela borda inferior com o texto
    const logoH=cfg.logoUrl
        ?`<img src="${cfg.logoUrl}" style="max-height:85px;max-width:234px;object-fit:contain;display:block;" alt="Logo">`
        :`<strong style="font-size:22px;color:#000;font-family:'Inter',sans-serif;">${cfg.nome}</strong>`;

    const hInfo=[
        cfg.end1||'',cfg.end2||'',
        (cfg.tel||cfg.wpp)?`Tel: ${cfg.tel}${cfg.wpp?' · WhatsApp: '+cfg.wpp:''}`: '',
        cfg.cnpj?`CNPJ: ${cfg.cnpj}`:''
    ].filter(Boolean).join('<br>');

    const fmtData=new Date(rec.data+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
    const medicoObj=appData.medicos.find(m=>m.id===rec.medicoId);
    const medicoNome=rec.medico||(medicoObj?medicoObj.nome:'');
    const medicoCrm=rec.crm||(medicoObj?medicoObj.crm:'');
    const medicoEsp=rec.especialidade||(medicoObj?medicoObj.especialidade||'':'');

    // Forma de uso (antes dos medicamentos)
    const formaUsoLabels = {oral:'Via Oral',topica:'Uso Tópico',injetavel:'Via Injetável',sublingual:'Via Sublingual',inalatoria:'Via Inalatória',oftalmico:'Uso Oftálmico',nasal:'Uso Nasal',retal:'Uso Retal',vaginal:'Uso Vaginal'};
    const formaUsoTexto = rec.formaUso === 'livre'
        ? (rec.formaUsoLivre||'')
        : (formaUsoLabels[rec.formaUso] || '');

    const formaUsoHtml = formaUsoTexto ? `
        <div style="margin-bottom:14px;">
            <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#000;">${formaUsoTexto}</span>
        </div>` : '';

    // Apresentação (após medicamentos)
    const apresentacaoTexto = rec.apresentacao || '';
    const apresentacaoHtml = apresentacaoTexto ? `
        <div style="margin-top:16px;">
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#000;margin-bottom:6px;">Apresentação</p>
            <div style="font-size:13px;color:#000;">${apresentacaoTexto}</div>
        </div>` : '';

    // Medicamentos: nome + dosagem. Se tiver posologia específica, mostrar abaixo do nome
    const medsHtml=(rec.medicamentos||[]).map(m=>`
        <div style="padding:6px 0;border-bottom:1px solid #ddd;">
            <div style="display:flex;align-items:baseline;gap:10px;">
                <span style="font-size:14px;font-weight:700;color:#000;">${m.nome}</span>
                ${m.dosagemQtd?`<span style="font-size:13px;color:#000;">${app.fmtDosagem(m.dosagemQtd,m.dosagemUnidade)}</span>`:''}
            </div>
            ${m.posologiaMed?`<div style="font-size:12px;color:#000;margin-top:3px;padding-left:4px;">${m.posologiaMed}</div>`:''}
        </div>`).join('');

    // Posologia geral — só exibe se existir
    const posologiaHtml=rec.posologia?`
        <div style="margin-top:18px;">
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#000;margin-bottom:8px;">Posologia</p>
            <div style="font-size:13px;color:#000;line-height:1.9;white-space:pre-line;">${rec.posologia}</div>
        </div>`:'';

    // Observação geral
    const obsHtml=rec.obs?`
        <div style="margin-top:14px;padding:10px 14px;border:1px solid #aaa;border-radius:4px;">
            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#000;margin-bottom:4px;">Observações</p>
            <p style="font-size:13px;color:#000;line-height:1.7;white-space:pre-line;margin:0;">${rec.obs}</p>
        </div>`:'';

    const html=`
    <div class="print-page">
        <div class="print-body">
            <!-- Cabeçalho: logo à esquerda, endereço à direita, alinhados pela borda inferior -->
            <div class="p-header">
                <div style="display:flex;align-items:flex-end;">${logoH}</div>
                <div style="text-align:right;display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;">
                    <strong style="font-size:13px;color:#000;display:block;margin-bottom:3px;">${cfg.nome}</strong>
                    <span class="p-hinfo">${hInfo}</span>
                </div>
            </div>
            <hr class="p-div">

            <!-- Paciente -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:14px 0;">
                <div>
                    <p class="p-label">Paciente</p>
                    <p style="font-size:16px;font-weight:700;color:#000;margin:0;">${rec.paciente}</p>
                    ${rec.diagnostico?`<p style="font-size:12px;color:#000;margin-top:4px;">${rec.diagnostico}</p>`:''}
                </div>
                <div style="text-align:right;">
                    <p class="p-label">Data</p>
                    <p style="font-size:13px;font-weight:600;color:#000;margin:0;">${fmtData}</p>
                </div>
            </div>
            <hr class="p-gdiv">

            <!-- Título -->
            <div style="text-align:center;margin:20px 0 22px;">
                <p style="font-size:18px;font-weight:700;color:#000;letter-spacing:0.1em;text-transform:uppercase;margin:0;">Receita Médica</p>
            </div>

            <!-- Medicamentos com forma de uso -->
            <div style="margin-bottom:4px;">
                ${formaUsoHtml}
                ${medsHtml||'<p style="font-size:13px;color:#000;">Nenhum medicamento.</p>'}
            </div>

            ${apresentacaoHtml}
            ${posologiaHtml}
            ${obsHtml}
        </div>

        <!-- Assinatura no final da página -->
        <div class="p-footer" style="text-align:center;">
            <p style="font-size:14px;font-weight:700;color:#000;margin:0;">${medicoNome}</p>
            ${medicoEsp?`<p style="font-size:12px;color:#000;margin:3px 0 0;">${medicoEsp}</p>`:''}
            <p style="font-size:12px;color:#000;margin:4px 0 0;font-weight:600;">${medicoCrm}</p>
        </div>
    </div>`;

    app.el('print-content').innerHTML=html;
    app.show('print-view');
};

app.fecharImpressao = () => app.hide('print-view');

// ─── CONFIG ───────────────────────────────────────────────────────────────────

app.populateConfig = () => {
    const c=appData.config;
    app.setVal('conf-nome',c.nome); app.setVal('conf-logo',c.logoUrl);
    app.setVal('conf-tel',c.tel);   app.setVal('conf-wpp',c.wpp);
    app.setVal('conf-end1',c.end1); app.setVal('conf-end2',c.end2);
    app.setVal('conf-cnpj',c.cnpj||'');
    app.renderMedicos();
    app.renderPosologias();
};

app.saveConfig = async () => {
    appData.config={nome:app.val('conf-nome'),logoUrl:app.val('conf-logo'),tel:app.val('conf-tel'),wpp:app.val('conf-wpp'),end1:app.val('conf-end1'),end2:app.val('conf-end2'),cnpj:app.val('conf-cnpj')};
    if(!ui.userDocRef) return;
    try { await ui.userDocRef.set({config:appData.config},{merge:true}); app.toast('Configurações salvas!'); }
    catch(e){ app.toast('Erro ao salvar configurações.','err'); }
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
                <p style="font-size:12px;color:#888;">${m.crm||''}${m.especialidade?' · '+m.especialidade:''}</p>
            </div>
            <div style="display:flex;gap:4px;">
                <button onclick="app.editMedico('${m.id}')" class="btn-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button onclick="app.deleteMedico('${m.id}')" class="btn-icon btn-danger"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>
            </div>
        </div>`).join('');
};

app.saveMedico = async () => {
    const id=app.val('medico-edit-id'), nome=app.toTitleCase(app.val('medico-nome').trim()), crm=app.val('medico-crm').trim().toUpperCase();
    if(!nome) return app.toast('Informe o nome do médico.','err');
    if(!crm)  return app.toast('Informe o CRM.','err');
    const obj={id:id||app.uid(),nome,crm,especialidade:app.toTitleCase(app.val('medico-especialidade').trim()),assinatura:app.val('medico-assinatura').trim()};
    if(id){ const i=appData.medicos.findIndex(m=>m.id===id); if(i>=0) appData.medicos[i]=obj; } else appData.medicos.push(obj);
    app.resetMedicoForm(); app.renderMedicos(); await app.save('medicos'); app.toast('Médico salvo!');
};

app.editMedico = id => {
    const m=appData.medicos.find(x=>x.id===id); if(!m) return;
    app.setVal('medico-edit-id',m.id); app.setVal('medico-nome',m.nome); app.setVal('medico-crm',m.crm);
    app.setVal('medico-especialidade',m.especialidade||''); app.setVal('medico-assinatura',m.assinatura||'');
    app.el('medico-cancel-btn').style.display='inline-flex';
};

app.deleteMedico = async id => {
    if(!confirm('Excluir médico?')) return;
    appData.medicos=appData.medicos.filter(m=>m.id!==id);
    app.renderMedicos(); await app.save('medicos'); app.toast('Médico excluído.');
};

app.resetMedicoForm = () => {
    ['medico-edit-id','medico-nome','medico-crm','medico-especialidade','medico-assinatura'].forEach(id=>app.setVal(id,''));
    app.el('medico-cancel-btn').style.display='none';
};

Object.defineProperty(app,'receitaEmEdicao',{get:()=>receitaEmEdicao});

// ─── BOOT ─────────────────────────────────────────────────────────────────────
window.app=app;
document.addEventListener('DOMContentLoaded',app.init);
