const fallbackKnowledge = {company:{name:'True North Engineering',hours:'Monday to Friday, 8am to 6pm'},services:[],faqs:[]};

export async function initChatWidget(){
  const toggle=document.querySelector('.chat-toggle'), widget=document.querySelector('#chat-widget'), close=widget?.querySelector('[data-chat-close]'), form=widget?.querySelector('.chat-form'), input=form?.querySelector('input'), log=widget?.querySelector('.chat-log');
  if(!toggle||!widget||!form||!input||!log) return;
  let knowledge=fallbackKnowledge, state={projectType:'',area:'',stage:0};
  const knowledgePromise=fetch('assets/data/knowledge.json').then(response=>response.ok?response.json():fallbackKnowledge).then(data=>{knowledge=data;}).catch(()=>{});
  const addMessage=(text,type='bot',actions=[])=>{const message=document.createElement('div');message.className='chat-message '+type;message.textContent=text;log.append(message);if(actions.length){const row=document.createElement('div');row.className='chat-actions';actions.forEach(action=>{const button=document.createElement('button');button.type='button';button.textContent=action.label;button.addEventListener('click',()=>{if(action.href){document.querySelector(action.href)?.scrollIntoView({behavior:'smooth'});setOpen(false);}else send(action.label);});row.append(button);});log.append(row);}log.scrollTop=log.scrollHeight;};
  const setOpen=open=>{widget.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open&&!log.children.length)addMessage('Hi, I am the True North sales engineer. I can help you choose a service, understand the process or prepare the details for a quote.','bot',[{label:'Choose a service'},{label:'Start a quote'},{label:'View projects',href:'#projects'}]);if(open)window.setTimeout(()=>input.focus(),80);};
  const normalize=value=>value.toLowerCase().replace(/[^\w\s]/g,' ');
  const findService=value=>knowledge.services.find(service=>service.keywords.some(keyword=>normalize(value).includes(normalize(keyword))));
  const findFaq=value=>knowledge.faqs.find(faq=>faq.keywords.some(keyword=>normalize(value).includes(normalize(keyword))));
  const extractArea=value=>{const match=value.replace(/,/g,'').match(/(\d{3,7})\s*(sq\s*ft|square feet|sqft|ft2)?/i);return match?match[1]:'';};
  const isQuote=value=>/quote|estimate|price|cost|proposal|quotation|budget|free quote/i.test(value);

  function qualify(value){
    const area=extractArea(value);if(area)state.area=area;
    const service=findService(value);if(service)state.projectType=service.name;
    if(service && !state.area && /need|want|install|design|project|quote/i.test(value)){state.stage=2;return 'Great. Approximately how large is the building or area in square feet?';}
    if(service && state.area && state.stage===0){state.stage=3;return 'For '+service.name+' covering approximately '+state.area+' sq ft, is this new construction, a renovation or an existing system that needs improvement?';}
    if(state.stage===1){state.projectType=value;state.stage=2;return 'Thanks. Approximately how large is the building or area in square feet?';}
    if(state.stage===2&&state.area){state.stage=3;return 'Got it. Is this new construction, a renovation or an existing system that needs improvement?';}
    if(state.stage===3){state.stage=4;return 'Thanks. What city and area is the project in?';}
    if(state.stage===4){state.stage=5;return 'That gives us a useful starting brief: '+(state.projectType||'MEP work')+(state.area?' for approximately '+state.area+' sq ft':'')+' in '+value+'. Please share your name, email and message in the quote form and our team can review it within 24 hours.';}
    if(isQuote(value)&&!state.projectType){state.stage=1;return 'Absolutely. What type of project are you planning: HVAC, mechanical, electrical, plumbing/firefighting or another MEP requirement?';}
    if(isQuote(value)&&state.projectType&&!state.area){state.stage=2;return 'For a useful preliminary scope, approximately how many square feet is the building or area?';}
    return '';
  }
  function answer(value){
    const lower=normalize(value), qualified=qualify(value);if(qualified)return {text:qualified,actions:state.stage>=5?[{label:'Open quote form',href:'#contact'},{label:'View projects',href:'#projects'}]:[]};
    if(/hours|open|available|when/i.test(lower))return {text:'Our usual office hours are '+knowledge.company.hours+'. You can submit a request at any time and the team can follow up during office hours.',actions:[{label:'Open quote form',href:'#contact'}]};
    const faq=findFaq(value);if(faq)return {text:faq.answer,actions:[{label:'Ask about a service'},{label:'Open quote form',href:'#contact'}]};
    const service=findService(value);if(service)return {text:service.name+': '+service.description+' '+service.recommendation,actions:[{label:'Start a quote'},{label:'View projects',href:'#projects'}]};
    if(/who are|about|company|true north/i.test(lower))return {text:knowledge.company.name+' is a Karachi-based MEP contracting company serving residential, commercial, healthcare and industrial projects. The team supports coordination, installation, testing and handover.'};
    if(/project|process|how do you work|steps/i.test(lower))return {text:'The usual process is: understand the brief, review drawings or site conditions, coordinate the scope, prepare a proposal, execute with site controls, then test, commission and support handover.',actions:[{label:'View services',href:'#services'},{label:'Request a quote',href:'#contact'}]};
    if(/recommend|better air|air quality|ventilation/i.test(lower))return {text:'You may be interested in HVAC Design and Installation, Mechanical Engineering, Ventilation Systems and an Energy Efficiency Review. The right combination depends on building use, occupancy and existing conditions.',actions:[{label:'Start a quote'},{label:'View services',href:'#services'}]};
    return {text:'I can help with True North services, project requirements, timelines, coverage, engineering questions and quote preparation. Tell me what you are building and I will ask the useful next question.',actions:[{label:'Choose a service'},{label:'Start a quote'}]};
  }
  function send(value){if(!value)return;addMessage(value,'user');const result=answer(value);window.setTimeout(()=>addMessage(result.text,'bot',result.actions),180);}
  toggle.addEventListener('click',()=>setOpen(widget.hidden));close?.addEventListener('click',()=>{setOpen(false);toggle.focus();});
  widget.querySelectorAll('[data-chat-prompt]').forEach(button=>button.addEventListener('click',()=>send(button.dataset.chatPrompt||'')));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!widget.hidden){setOpen(false);toggle.focus();}});
  form.addEventListener('submit',event=>{event.preventDefault();const value=input.value.trim();if(!value)return;send(value);input.value='';});
}
