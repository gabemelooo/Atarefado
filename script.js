const $=s=>document.querySelector(s),K='atarefado:v1';
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const todayISO=()=>iso(new Date()),plus=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);const fmt=v=>v.split('-').reverse().join('/'),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ST={pending:'Pendente',doing:'Em andamento',done:'Concluída'},PRI={low:'Baixa',med:'Média',high:'Alta'},PO={high:0,med:1,low:2};
const FIL=[['all','Todas'],['pending','Pendentes'],['doing','Em andamento'],['done','Concluídas'],['late','Atrasadas']];
const SORTS=[['none','Nenhum'],['date','Data'],['name','Nome'],['pri','Prioridade'],['cat','Lista']];
const IC={x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',edit:'<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',del:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>'};
const defaults=()=>({name:'Gabriel',theme:'auto',accent:'couro',size:'normal',anim:true,hideDone:false,h24:true,week:0,sort:'none',photo:'',cats:['Pessoal','Trabalho','Faculdade'],tasks:[
 {id:'a1',title:'Entregar trabalho de Engenharia de Software',desc:'Diagramas UML e relatório final.',date:plus(2),status:'doing',cat:'Faculdade',pri:'high'},
 {id:'a2',title:'Revisar currículo',desc:'Atualizar projetos e links.',date:todayISO(),status:'pending',cat:'Pessoal',pri:'med'},
 {id:'a3',title:'Estudar JavaScript',desc:'',date:plus(-1),status:'pending',cat:'Faculdade',pri:'med'},
 {id:'a4',title:'Organizar planilha da semana',desc:'',date:plus(4),status:'done',cat:'Trabalho',pri:'low'}]});
let S=defaults();try{const o=JSON.parse(localStorage.getItem(K));if(o&&Array.isArray(o.tasks))S={...S,...o}}catch(e){}
S.tasks.forEach(t=>t.pri=t.pri||'med');
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
let ui={cat:'all',status:'all',day:null,q:'',view:new Date(),edit:null,del:null};
const late=t=>t.status!=='done'&&t.date<todayISO();
const validDate=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T00:00:00');return !isNaN(d)&&iso(d)===v&&d.getFullYear()>=2000&&d.getFullYear()<=2100};
const base=()=>{const q=ui.q.trim().toLowerCase();return S.tasks.filter(t=>(ui.cat==='all'||t.cat===ui.cat)&&(!S.hideDone||t.status!=='done')&&(!q||(t.title+' '+t.desc).toLowerCase().includes(q))&&(ui.status==='all'||(ui.status==='late'?late(t):t.status===ui.status)))};
function apply(){const d=document.documentElement.dataset;d.theme=S.theme==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):S.theme;d.accent=S.accent;d.size=S.size;d.anim=S.anim?'on':'off';
 $('#pimg').hidden=!S.photo;$('#pico').style.display=S.photo?'none':'';if(S.photo)$('#pimg').src=S.photo}
function header(){const n=new Date(),h=n.getHours(),g=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
 $('#mon').textContent=n.toLocaleDateString('pt-BR',{month:'short'}).replace('.','');$('#dnum').textContent=n.getDate();
 $('#when').textContent=cap(n.toLocaleDateString('pt-BR',{weekday:'long'}))+' · '+n.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',hour12:!S.h24});
 $('#greet').textContent=g+(S.name?', '+S.name:'')+'.';
 const hoje=S.tasks.filter(t=>t.date===todayISO()&&t.status!=='done').length,at=S.tasks.filter(late).length;
 $('#sub').textContent='Muito atarefado hoje? '+(hoje?`${hoje} tarefa${hoje>1?'s':''} para hoje`:'Nada pendente para hoje')+(at?` e ${at} atrasada${at>1?'s':''}.`:'.')}
function renderCats(){$('#cats').innerHTML=[['all','Todas'],...S.cats.map(c=>[c,c])].map(([k,l])=>`<div class="cat ${ui.cat===k?'on':''}"><button class="cn" data-c="${esc(k)}">${esc(l)}<small>${S.tasks.filter(t=>k==='all'||t.cat===k).length}</small></button>${k!=='all'&&S.cats.length>1?`<button class="cx" data-x="${esc(k)}" aria-label="Excluir lista ${esc(l)}">${IC.x}</button>`:''}</div>`).join('');
 $('#fCat').innerHTML=S.cats.map(c=>`<option>${esc(c)}</option>`).join('')}
function renderList(anim){let l=base();if(ui.day)l=l.filter(t=>t.date===ui.day);
 const cmp={none:()=>0,date:(a,b)=>a.date.localeCompare(b.date),name:(a,b)=>a.title.localeCompare(b.title,'pt-BR'),pri:(a,b)=>PO[a.pri]-PO[b.pri],cat:(a,b)=>a.cat.localeCompare(b.cat,'pt-BR')}[S.sort];
 l.sort((a,b)=>(a.status==='done')-(b.status==='done')||cmp(a,b));
 $('#list').innerHTML=l.length?l.map((t,i)=>`<li class="task ${t.status==='done'?'done':''} ${anim?'in':''}" style="--i:${i}" data-id="${t.id}"><input type="checkbox" class="ck" data-a="chk" ${t.status==='done'?'checked':''} aria-label="Concluir tarefa"><div class="tb"><small class="${late(t)?'late':''}">${fmt(t.date)}${late(t)?' · atrasada':''}</small><b>${esc(t.title)}</b>${t.desc?`<p>${esc(t.desc)}</p>`:''}</div><div class="side-r"><span>#${esc(t.cat)}</span><span>${PRI[t.pri]}${t.status==='doing'?' · em andamento':''}</span><div class="acts"><button data-a="edit" aria-label="Editar">${IC.edit}</button><button data-a="del" aria-label="Excluir">${IC.del}</button></div></div></li>`).join(''):`<li class="empty">${S.tasks.length?'Nenhuma tarefa com esses filtros.':'Sua lista está vazia. Adicione a primeira tarefa.'}</li>`}
function renderSide(){const v=ui.view,y=v.getFullYear(),m=v.getMonth(),w=S.week,first=(new Date(y,m,1).getDay()-w+7)%7,n=new Date(y,m+1,0).getDate(),by={};
 base().forEach(t=>(by[t.date]=by[t.date]||[]).push(t));
 $('#mt').textContent=cap(v.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));
 $('#wk').innerHTML=[...'DSTQQSS'.slice(w),...'DSTQQSS'.slice(0,w)].map(c=>`<span>${c}</span>`).join('');
 let h='';for(let i=0;i<first;i++)h+='<i></i>';
 for(let d=1;d<=n;d++){const k=iso(new Date(y,m,d)),a=by[k]||[];h+=`<button class="day ${a.length?'has':''} ${a.some(late)?'late':''} ${k===todayISO()?'today':''} ${k===ui.day?'sel':''}" data-d="${k}" aria-label="${d}, ${a.length} tarefas">${d}</button>`}
 $('#days').innerHTML=h;
 $('#filters').innerHTML=FIL.map(([k,l])=>`<button data-s="${k}" class="${ui.status===k?'on':''}">${l}</button>`).join('');
 $('#sorts').innerHTML=SORTS.map(([k,l])=>`<button data-o="${k}" class="${S.sort===k?'on':''}">${l}</button>`).join('')}
function render(a=true){apply();header();renderCats();renderList(a);renderSide()}
const sv=()=>{save();render(false)};

// tarefas
function openTask(id,title){const t=S.tasks.find(x=>x.id===id);ui.edit=t?id:null;
 $('#taskTitle').textContent=t?'Editar tarefa':'Nova tarefa';
 $('#fTitle').value=t?t.title:(title||'');$('#fDesc').value=t?t.desc:'';$('#fDate').value=t?t.date:(ui.day||todayISO());
 $('#fPri').value=t?t.pri:'med';$('#fStatus').value=t?t.status:'pending';$('#fCat').value=t?t.cat:(ui.cat!=='all'?ui.cat:S.cats[0]);
 $('#eTitle').textContent=$('#eDate').textContent='';$('#taskDlg').showModal();$('#fTitle').focus()}
$('#taskForm').addEventListener('submit',e=>{e.preventDefault();
 const title=$('#fTitle').value.trim(),date=$('#fDate').value,ok1=!!title,ok2=validDate(date);
 $('#eTitle').textContent=ok1?'':'Informe o título da tarefa.';$('#eDate').textContent=ok2?'':'Escolha uma data válida.';
 if(!ok1||!ok2)return;
 const d={title,desc:$('#fDesc').value.trim(),date,pri:$('#fPri').value,status:$('#fStatus').value,cat:$('#fCat').value};
 if(ui.edit)Object.assign(S.tasks.find(t=>t.id===ui.edit),d);else S.tasks.push({id:Date.now().toString(36),...d});
 $('#taskDlg').close();$('#qt').value='';sv()});
$('#quick').onsubmit=e=>{e.preventDefault();const title=$('#qt').value.trim();
 $('#qe').textContent=title?'':'Informe o título da tarefa.';if(!title)return;
 S.tasks.push({id:Date.now().toString(36),title,desc:'',date:ui.day||todayISO(),status:'pending',cat:ui.cat!=='all'?ui.cat:S.cats[0],pri:'med'});$('#qt').value='';sv()};
$('#qt').oninput=()=>$('#qe').textContent='';
$('#more').onclick=()=>openTask(null,$('#qt').value.trim());
$('#list').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const li=b.closest('li'),id=li.dataset.id,t=S.tasks.find(x=>x.id===id);
 if(b.dataset.a==='chk'){t.status=b.checked?'done':'pending';li.classList.toggle('done',b.checked);save();setTimeout(()=>render(false),350)}
 if(b.dataset.a==='edit')openTask(id);
 if(b.dataset.a==='del'){ui.del=id;$('#delTxt').textContent=`"${t.title}" será removida.`;$('#delDlg').showModal()}});
$('#delDlg').addEventListener('close',()=>{const d=$('#delDlg');if(d.returnValue==='yes'){const li=$(`#list [data-id="${ui.del}"]`);S.tasks=S.tasks.filter(t=>t.id!==ui.del);save();if(li&&S.anim){li.classList.add('out');setTimeout(()=>render(false),200)}else render(false)}d.returnValue=''});

// listas, filtros, calendário
$('#q').oninput=e=>{ui.q=e.target.value;renderList(false);renderSide()};
$('#cats').onclick=e=>{const x=e.target.closest('[data-x]'),b=e.target.closest('[data-c]');
 if(x){const c=x.dataset.x;S.cats=S.cats.filter(k=>k!==c);S.tasks.forEach(t=>{if(t.cat===c)t.cat=S.cats[0]});if(ui.cat===c)ui.cat='all';sv()}
 else if(b){ui.cat=b.dataset.c;render()}};
$('#newBtn').onclick=()=>{$('#newBtn').hidden=true;$('#catForm').hidden=false;$('#catIn').focus()};
$('#catForm').onsubmit=e=>{e.preventDefault();const n=$('#catIn').value.trim();if(n&&!S.cats.some(c=>c.toLowerCase()===n.toLowerCase()))S.cats.push(n);
 $('#catIn').value='';$('#catForm').hidden=true;$('#newBtn').hidden=false;sv()};
$('#days').onclick=e=>{const b=e.target.closest('[data-d]');if(b){ui.day=ui.day===b.dataset.d?null:b.dataset.d;renderList(true);renderSide()}};
$('#filters').onclick=e=>{const b=e.target.closest('[data-s]');if(b){ui.status=b.dataset.s;renderList(true);renderSide()}};
$('#sorts').onclick=e=>{const b=e.target.closest('[data-o]');if(b){S.sort=b.dataset.o;save();renderList(true);renderSide()}};
$('#showAll').onclick=()=>{ui.day=null;ui.status='all';ui.q='';$('#q').value='';render()};
$('#prev').onclick=()=>{ui.view=new Date(ui.view.getFullYear(),ui.view.getMonth()-1,1);renderSide()};
$('#next').onclick=()=>{ui.view=new Date(ui.view.getFullYear(),ui.view.getMonth()+1,1);renderSide()};

// tema, configurações, perfil
$('#themeBtn').onclick=()=>{S.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';sv()};
const mark=()=>document.querySelectorAll('#sAcc button').forEach(b=>b.classList.toggle('on',b.dataset.ac===S.accent));
$('#setBtn').onclick=()=>{$('#sTheme').value=S.theme;$('#sSize').value=S.size;$('#sWeek').value=S.week;$('#sH24').checked=S.h24;$('#sHide').checked=S.hideDone;$('#sAnim').checked=S.anim;
 $('#reset').dataset.sure='';$('#reset').textContent='Apagar todos os dados';mark();$('#setDlg').showModal()};
$('#sTheme').onchange=e=>{S.theme=e.target.value;sv()};$('#sSize').onchange=e=>{S.size=e.target.value;sv()};
$('#sWeek').onchange=e=>{S.week=+e.target.value;sv()};$('#sH24').onchange=e=>{S.h24=e.target.checked;sv()};
$('#sHide').onchange=e=>{S.hideDone=e.target.checked;sv()};$('#sAnim').onchange=e=>{S.anim=e.target.checked;sv()};
$('#sAcc').onclick=e=>{const b=e.target.closest('[data-ac]');if(b){S.accent=b.dataset.ac;sv();mark()}};
$('#rmPhoto').onclick=()=>{S.photo='';sv()};
$('#reset').onclick=e=>{if(e.target.dataset.sure){S=defaults();ui.cat='all';save();$('#setDlg').close();render()}else{e.target.dataset.sure='1';e.target.textContent='Clique de novo para confirmar'}};
function avatar(){$('#avImg').hidden=!S.photo;if(S.photo)$('#avImg').src=S.photo;$('#avLet').textContent=S.photo?'':(S.name||'?')[0].toUpperCase()}
$('#profBtn').onclick=()=>{$('#pName').value=S.name;avatar();$('#stats').textContent=`${S.tasks.length} tarefas · ${S.tasks.filter(t=>t.status==='done').length} concluídas`;$('#profDlg').showModal()};
$('#avatar').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#avFile').click()}};
$('#avFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const img=new Image(),u=URL.createObjectURL(f);
 img.onload=()=>{const s=Math.min(img.width,img.height),c=document.createElement('canvas');c.width=c.height=160;
  c.getContext('2d').drawImage(img,(img.width-s)/2,(img.height-s)/2,s,s,0,0,160,160);S.photo=c.toDataURL('image/jpeg',.85);URL.revokeObjectURL(u);sv();avatar()};
 img.onerror=()=>URL.revokeObjectURL(u);img.src=u;e.target.value=''};
$('#profForm').onsubmit=e=>{e.preventDefault();S.name=$('#pName').value.trim();$('#profDlg').close();sv()};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
render();setInterval(header,30000);
