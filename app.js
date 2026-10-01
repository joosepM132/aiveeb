'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const icon = name => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const fmt = number => Number(number || 0).toLocaleString('en-US');
  const dateYear = date => date == null ? null : new Date(Number(date)).getUTCFullYear();
  const dateLabel = record => record.date != null ? new Date(record.date).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric',timeZone:'UTC' }) : record.year ? String(record.year) : 'Sinking date not recorded';
  const validCoords = r => Number.isFinite(r.lon) && Number.isFinite(r.lat) && Math.abs(r.lon) <= 180 && Math.abs(r.lat) <= 90 && !(r.lon === 0 && r.lat === 0);
  const modes = {
    aviation: { title:'Aviation incidents', description:'A century of flight. The moments that changed its course.', icon:'plane', min:1908, max:2019, start:1950, accent:'#dd683e', legend:'Recorded incident', scale:'Size = fatalities', source:'Historical aviation archive', metric:'mapped incidents', secondary:'Lives lost onboard', severity:'INCIDENT SEVERITY', options:[['all','All incidents'],['fatal','Fatal incidents'],['100','100+ fatalities'],['300','300+ fatalities'],['nonfatal','No fatalities reported']] },
    wrecks: { title:'Shipwrecks', description:'Beneath the surface, another world of history waits.', icon:'ship', min:1800, max:2025, start:1800, accent:'#48868b', legend:'Recorded wreck', scale:'Size = depth', source:'NOAA AWOIS Â· Featured wrecks', metric:'mapped wreck records', secondary:'Known depths', severity:'WRECK DEPTH', options:[['all','All recorded depths'],['shallow','Shallow Â· under 30 m'],['medium','30â€“200 m'],['deep','Deep Â· over 200 m'],['unknown','Depth unrecorded']] },
    earthquakes: { title:'Seismic events', description:'When the ground moves, the whole planet feels it.', icon:'quake', min:1900, max:2025, start:1950, accent:'#967344', legend:'Earthquake epicenter', scale:'Size = magnitude', source:'USGS Earthquake Catalog', metric:'mapped earthquakes', secondary:'Strongest magnitude', severity:'MAGNITUDE', options:[['all','All events Â· M 7.0+'],['7','M 7.0â€“7.9'],['8','M 8.0â€“8.9'],['9','M 9.0+']] }
  };
  const featuredWrecks = [
    { id:'titanic',name:'RMS Titanic',year:1912,date:Date.UTC(1912,3,15),lat:41.7325,lon:-49.9469,depth:3800,location:'North Atlantic Ocean',summary:'The White Star liner sank after striking an iceberg on its maiden voyage. Discovered in 1985, its two main sections rest far beneath the North Atlantic.',url:'https://www.noaa.gov/office-of-general-counsel/gc-international-section/rms-titanic-history-and-significance',featured:true },
    { id:'endurance',name:'Endurance',year:1915,date:Date.UTC(1915,10,21),lat:-68.6522,lon:-52.3375,depth:3008,location:'Weddell Sea, Antarctica',summary:'Shackletonâ€™s expedition ship was crushed by Antarctic pack ice. Its wreck was located in 2022, remarkably preserved in the cold depths of the Weddell Sea.',url:'https://www.dlr.de/en/latest/news/2022/01/20220310_shipwreck-of-the-endurance-found',featured:true },
    { id:'britannic',name:'HMHS Britannic',year:1916,date:Date.UTC(1916,10,21),lat:37.7019,lon:24.2839,depth:120,location:'Kea Channel, Aegean Sea',summary:'Titanicâ€™s sister ship served as a hospital ship during the First World War. A mine ended its service in the Aegean; the wreck now lies on its side.',url:'https://en.wikipedia.org/wiki/HMHS_Britannic',featured:true },
    { id:'fitzgerald',name:'SS Edmund Fitzgerald',year:1975,date:Date.UTC(1975,10,10),lat:46.9983,lon:-85.1092,depth:161.5,location:'Lake Superior, North America',summary:'The Great Lakes freighter was lost in a severe November storm. Its wreck lies in two main sections beneath Lake Superior, where all 29 crew members were lost.',url:'https://ssedmundfitzgerald.org/the-ship',featured:true },
    { id:'estonia',name:'MS Estonia',year:1994,date:Date.UTC(1994,8,28),lat:59.3833,lon:21.6833,depth:80,location:'Baltic Sea, near UtÃ¶',summary:'The passenger ferry sank during a storm on the Tallinnâ€“Stockholm route. The wreck remains a protected maritime grave in the Baltic Sea.',url:'https://en.wikipedia.org/wiki/MS_Estonia',featured:true }
  ];
  const datasets = {
    aviation:(window.ATLAS_AVIATION || []).map(r => ({ ...r, mode:'aviation',year:dateYear(r.date),name:[r.operator || r.aircraft || 'Unidentified aircraft',r.flight && r.flight !== '-' ? r.flight : ''].filter(Boolean).join(' '),lon:r.lon == null ? null : Number(r.lon),lat:r.lat == null ? null : Number(r.lat) })),
    wrecks:[...featuredWrecks,...(window.ATLAS_WRECKS || [])].map(r => ({...r,mode:'wrecks',year:Number(r.year) || null,name:r.featured ? r.name : (r.name && !['WRECK','UNKNOWN','UNIDENTIFIED','UNNAMED'].includes(r.name.toUpperCase()) ? r.name : 'Unidentified wreck') + ' Â· ' + r.id.slice(1),location:r.location || (r.lat >= 24 && r.lat <= 50 && r.lon >= -90 && r.lon <= -60 ? 'U.S. Atlantic coastal waters' : 'NOAA coastal survey record'),lon:Number(r.lon),lat:Number(r.lat)})),
    earthquakes:(window.ATLAS_EARTHQUAKES || []).map(r => ({...r,mode:'earthquakes',year:dateYear(r.date),location:r.name,name:'M ' + Number(r.magnitude).toFixed(1) + ' Â· ' + (r.name || 'Recorded earthquake')}))
  };
  // These prominent incidents have manually checked coordinates instead of the archive's automated place geocodes.
  for (const r of datasets.aviation) {
    if (/Japan Air Lines|Japan Airlines/i.test(r.operator || '') && String(r.flight) === '123' && r.year === 1985) { r.lon=138.693; r.lat=36.002; r.name='Japan Airlines 123'; r.featured=true; r.checked=true; }
    if (/Fort Myer, Virginia/i.test(r.location || '') && r.year === 1908) { r.lon=-77.073; r.lat=38.879; r.checked=true; }
    if (/Tenerife/i.test(r.location || '') && r.year === 1977) { r.lon=-16.341; r.lat=28.482; r.checked=true; r.featured=true; }
    if (/Lockerbie/i.test(r.location || '') && r.year === 1988) { r.lon=-3.359; r.lat=55.123; r.checked=true; r.featured=true; }
  }
  const state={mode:'aviation',start:1950,end:2019,region:'world',severity:'all',unknown:true,selected:null,filtered:[],playing:false,playTimer:null};
  let width=900,height=520,projection,path,zoom,currentTransform=d3.zoomIdentity;
  const svg=d3.select('#world-map'), mapGroup=d3.select('#map-transform');
  const regions={
    northAmerica:{bounds:[-170,8,-50,80],center:[-100,42],zoom:2},
    southAmerica:{bounds:[-85,-60,-30,13],center:[-60,-20],zoom:2.2},
    europe:{bounds:[-25,34,60,72],center:[15,52],zoom:3},
    africa:{bounds:[-20,-38,55,36],center:[18,0],zoom:2.3},
    asia:{bounds:[25,-12,180,80],center:[100,35],zoom:1.8},
    oceania:{bounds:[110,-55,180,5],center:[140,-23],zoom:2.3}
  };
  function regionMatches(r) {
    if (state.region==='world') return true;
    const [w,s,e,n]=regions[state.region].bounds;
    return validCoords(r) && r.lon>=w && r.lon<=e && r.lat>=s && r.lat<=n;
  }
  function severityMatches(r) {
    const f=state.severity;
    if(f==='all') return true;
    if(state.mode==='aviation') {
      if(f==='fatal') return r.fatalities>0;
      if(f==='nonfatal') return r.fatalities===0;
      return r.fatalities>=Number(f);
    }
    if(state.mode==='wrecks') {
      if(f==='unknown') return r.depth==null;
      if(r.depth==null) return false;
      return f==='shallow' ? r.depth<30 : f==='medium' ? r.depth>=30 && r.depth<=200 : r.depth>200;
    }
    return Math.floor(r.magnitude)===Number(f);
  }
  function dateMatches(r) { return r.year ? r.year>=state.start && r.year<=state.end : state.mode==='wrecks' && state.unknown; }
  function radius(r) {
    if(r.mode==='aviation') return Math.max(2,Math.min(7,1.4+Math.sqrt(Math.max(0,r.fatalities || 0))*.27));
    if(r.mode==='wrecks') return r.featured ? 6 : Math.max(2,Math.min(5,1.8+Math.sqrt(r.depth || 0)*.22));
    return 2.3+(r.magnitude-7)*2;
  }
  function setupMap() {
    width=$('map-stage').clientWidth; height=$('map-stage').clientHeight;
    svg.attr('viewBox','0 0 '+width+' '+height);
    projection=d3.geoNaturalEarth1().fitExtent([[12,45],[width-12,height-35]],{type:'Sphere'}).rotate([-8,0]);
    path=d3.geoPath(projection);
    d3.select('#countries').selectAll('path').data(window.ATLAS_WORLD.features.filter(f=>f.properties.name!=='Antarctica')).join('path').attr('class','country').attr('d',path);
    d3.select('#graticule').selectAll('path').data([d3.geoGraticule().step([30,30])()]).join('path').attr('class','graticule-line').attr('d',path);
    const labels=[
      ['NORTH AMERICA',-105,42,'continent-label'],['SOUTH AMERICA',-61,-20,'continent-label'],['EUROPE',18,54,'continent-label'],
      ['AFRICA',17,6,'continent-label'],['ASIA',100,43,'continent-label'],['OCEANIA',139,-23,'continent-label'],
      ['North Atlantic',-37,29,'ocean-label'],['South Atlantic',-23,-24,'ocean-label'],['Indian Ocean',77,-29,'ocean-label'],['Pacific Ocean',-139,0,'ocean-label']
    ];
    d3.select('#map-labels').selectAll('text').data(labels).join('text').text(d=>d[0]).attr('class',d=>d[3]).attr('x',d=>projection([d[1],d[2]])[0]).attr('y',d=>projection([d[1],d[2]])[1]);
    if(!zoom) {
      zoom=d3.zoom().scaleExtent([1,9]).filter(event=>!event.target.closest('.marker') && (!event.ctrlKey || event.type==='wheel') && !event.button).on('zoom',event=>{
        currentTransform=event.transform;
        mapGroup.attr('transform',event.transform);
        d3.select('#markers').selectAll('circle').attr('r',d=>radius(d)/event.transform.k);
        renderSelection();
        $('map-tooltip').hidden=true;
      });
      svg.call(zoom).on('dblclick.zoom',null);
    }
    zoom.extent([[0,0],[width,height]]).translateExtent([[-width,-height],[width*2,height*2]]);
    svg.call(zoom.transform,d3.zoomIdentity);
    renderPoints();
  }
  function renderPoints() {
    const markers=d3.select('#markers').selectAll('circle').data(state.filtered,d=>d.id).join('circle').attr('class','marker')
      .attr('cx',d=>projection([d.lon,d.lat])[0]).attr('cy',d=>projection([d.lon,d.lat])[1])
      .attr('r',d=>radius(d)/currentTransform.k).attr('aria-label',d=>d.name+', '+(d.year || 'undated')).attr('role','button').attr('tabindex',(d,i)=>i>=Math.max(0,state.filtered.length-20)?0:-1)
      .on('click',(event,d)=>{event.stopPropagation();selectRecord(d);}).on('keydown',(event,d)=>{if(event.key==='Enter' || event.key===' '){event.preventDefault();selectRecord(d);}})
      .on('pointerenter',(event,d)=>showTooltip(event,d)).on('pointermove',(event,d)=>showTooltip(event,d)).on('pointerleave',()=>{$('map-tooltip').hidden=true;});
    markers.order();
    renderSelection();
  }
  function showTooltip(event,r) {
    const box=$('map-stage').getBoundingClientRect();
    const tip=$('map-tooltip');
    tip.innerHTML=esc(r.name)+'<small>'+esc(r.location || '')+' Â· '+esc(r.year || 'Undated')+'</small>';
    tip.hidden=false;
    tip.style.left=Math.min(width-tip.offsetWidth-10,Math.max(10,event.clientX-box.left+14))+'px';
    tip.style.top=Math.max(8,Math.min(height-tip.offsetHeight-10,event.clientY-box.top-40))+'px';
  }
  function renderSelection() {
    const r=state.selected;
    const visible=r && state.filtered.some(x=>x.id===r.id);
    const group=d3.select('#selected-marker');
    group.selectAll('circle').remove();
    if(!visible) return;
    const [x,y]=projection([r.lon,r.lat]),k=currentTransform.k;
    group.append('circle').attr('class','selection-ring').attr('cx',x).attr('cy',y).attr('r',15/k);
    group.append('circle').attr('class','selection-ring').attr('cx',x).attr('cy',y).attr('r',23/k).attr('opacity',.3);
    group.append('circle').attr('class','selection-dot').attr('cx',x).attr('cy',y).attr('r',6/k);
  }
  function update() {
    const config=modes[state.mode];
    const candidates=datasets[state.mode].filter(r=>regionMatches(r) && severityMatches(r));
    state.filtered=candidates.filter(r=>dateMatches(r) && validCoords(r)).sort((a,b)=>radius(a)-radius(b));
    $('visible-count').textContent=fmt(state.filtered.length);
    $('stat-main-label').textContent=config.metric;
    $('secondary-label').textContent=config.secondary;
    $('secondary-value').textContent=state.mode==='aviation' ? fmt(state.filtered.reduce((sum,r)=>sum+(r.fatalities || 0),0)) : state.mode==='wrecks' ? fmt(state.filtered.filter(r=>r.depth!=null).length)+' records' : state.filtered.length ? 'M '+Math.max(...state.filtered.map(r=>r.magnitude)).toFixed(1) : 'â€”';
    ['year-start','range-start'].forEach(id=>$(id).value=state.start);
    ['year-end','range-end'].forEach(id=>$(id).value=state.end);
    $('map-date').textContent=state.start+' â€” '+state.end;
    $('timeline-range').textContent=state.start+' â€” '+state.end;
    $('map-empty').hidden=state.filtered.length>0;
    if(state.selected && !state.filtered.some(r=>r.id===state.selected.id)) closeRecord();
    const counts=new Map();
    for(const r of candidates) if(r.year>=config.min && r.year<=config.max) counts.set(r.year,(counts.get(r.year)||0)+1);
    const maximum=Math.max(1,...counts.values());
    $('histogram').innerHTML=Array.from({length:config.max-config.min+1},(_,i)=>{
      const year=config.min+i;
      return '<span class="bar '+(year>=state.start && year<=state.end?'in-range':'')+'" style="--height:'+Math.max(3,(counts.get(year)||0)/maximum*100)+'%" title="'+year+': '+(counts.get(year)||0)+' records"></span>';
    }).join('');
    const left=(state.start-config.min)/(config.max-config.min)*100;
    const right=(state.end-config.min)/(config.max-config.min)*100;
    const ranges=document.querySelector('.range-controls');
    ranges.style.setProperty('--range-width',(right-left)+'%');
    // The background position is converted from CSS's free-space percentage to a pixel position.
    ranges.style.backgroundPosition=(ranges.clientWidth*left/100)+'px 0';
    if(projection) renderPoints();
    const geoMissing=candidates.filter(r=>dateMatches(r) && !validCoords(r)).length;
    $('visible-count').title=geoMissing ? fmt(geoMissing)+' additional records have no mapped coordinates; find them in archive search.' : 'All matching records have coordinates.';
  }
  function closeRecord() {state.selected=null;$('record-card').hidden=true;$('map-hint').hidden=false;renderSelection();}
  function selectRecord(r,focusMap=false) {
    state.selected=r;$('map-tooltip').hidden=true;$('map-hint').hidden=true;
    let left,right,leftLabel,rightLabel;
    if(r.mode==='aviation') {left=r.fatalities==null?'â€”':fmt(r.fatalities);right=r.aboard==null?'â€”':esc(r.aboard);leftLabel='Lives lost onboard';rightLabel='People onboard';}
    else if(r.mode==='wrecks') {left=r.depth==null?'â€”':fmt(r.depth)+' m';right=r.year || 'â€”';leftLabel=r.featured?'Seafloor depth':'Charted clearance';rightLabel='Year lost';}
    else {left='M '+Number(r.magnitude).toFixed(1);right=fmt(r.depth)+' km';leftLabel='Magnitude';rightLabel='Hypocenter depth';}
    const source=r.url || (r.mode==='aviation' ? 'https://services1.arcgis.com/4ezfu5dIwH83BUNL/ArcGIS/rest/services/Airplane_Crashes_and_Fatalities/FeatureServer' : 'https://www.nauticalcharts.noaa.gov/data/wrecks-and-obstructions.html');
    const summary=r.summary || 'This earthquake is part of the USGS global catalog of magnitude 7 and greater events. Its epicenter marks the surface location; the hypocenter depth describes where the rupture began below it.';
    const coordinateNote=!validCoords(r) ? 'Location is not mapped in this archive.' : r.mode==='aviation' ? (r.checked?'Location manually checked.':'Archive location is automatically geocoded and approximate; geocoding errors may remain.') : r.mode==='wrecks' && !r.featured ? 'Charted clearance is water above the wreck, not necessarily seafloor depth. This historical survey record is not for navigation.' : 'Coordinates and depths are approximate.';
    $('record-card').innerHTML='<div class="record-top"><span class="eyebrow">'+esc(modes[r.mode].title)+' / RECORD</span><button class="icon-button" id="close-record" aria-label="Close record">'+icon('close')+'</button></div><h3>'+esc(r.name)+'</h3><div class="record-location">'+esc(r.location)+'</div><div class="record-date">'+esc(dateLabel(r))+'</div><div class="record-numbers"><div><strong>'+left+'</strong><span>'+leftLabel+'</span></div><div><strong>'+right+'</strong><span>'+rightLabel+'</span></div></div>'+
      (r.mode==='wrecks' && r.depth!=null?'<div class="depth-vis"><span>SURFACE</span><i></i><span>'+esc(r.depth)+' m</span></div>':'')+
      '<p class="record-summary">'+esc(summary)+'</p>'+
      (r.aircraft?'<div class="record-meta">AIRCRAFT Â· '+esc(r.aircraft)+'</div>':'')+
      (r.route?'<div class="record-meta">ROUTE Â· '+esc(r.route)+'</div>':'')+
      '<div class="record-meta">'+coordinateNote+'</div><a class="record-source" href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">Explore the source '+icon('arrow')+'</a>';
    $('record-card').hidden=false;
    $('close-record').onclick=closeRecord;
    renderSelection();
    if(focusMap && validCoords(r)) {
      const [x,y]=projection([r.lon,r.lat]);const k=state.region==='world'?1.7:regions[state.region].zoom;
      svg.transition().duration(600).call(zoom.transform,d3.zoomIdentity.translate(width*.4-x*k,height*.46-y*k).scale(k));
    }
  }
  function stopPlay() {
    state.playing=false;clearInterval(state.playTimer);
    $('play-timeline').innerHTML='<svg class="icon" viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z"/></svg>';
    $('play-timeline').setAttribute('aria-label','Play timeline');
  }
  function setMode(mode) {
    stopPlay();closeRecord();state.mode=mode;
    const config=modes[mode];state.start=config.start;state.end=config.max;state.severity='all';state.region='world';
    document.documentElement.style.setProperty('--accent',config.accent);
    document.querySelectorAll('.map-tab').forEach(button=>{const active=button.dataset.mode===mode;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));});
    $('layer-title').textContent=config.title;$('layer-description').textContent=config.description;
    $('severity-label').textContent=config.severity;$('severity').innerHTML=config.options.map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join('');
    $('region').value='world';$('unknown-label').hidden=mode!=='wrecks';$('include-unknown').checked=true;state.unknown=true;
    $('map-caption').textContent=config.title.toUpperCase();$('map-source').textContent=config.source;
    $('legend-title').textContent=config.legend;$('legend-scale').textContent=config.scale;
    ['year-start','year-end','range-start','range-end'].forEach(id=>{ $(id).min=config.min;$(id).max=config.max; });
    const ticks=[config.min,...Array.from({length:5},(_,i)=>Math.round((config.min+(config.max-config.min)*(i+1)/6)/10)*10),config.max];
    $('timeline-ticks').innerHTML=[...new Set(ticks)].map(year=>'<span>'+year+'</span>').join('');
    update();if(zoom) svg.transition().duration(400).call(zoom.transform,d3.zoomIdentity);
  }
  function showRecordFromArchive(r) {
    if(state.mode!==r.mode) setMode(r.mode);
    stopPlay();state.region='world';state.severity='all';state.unknown=true;
    $('region').value='world';$('severity').value='all';$('include-unknown').checked=true;
    if(r.year) {
      const config=modes[r.mode];
      state.start=Math.max(config.min,Math.min(state.start,r.year));state.end=Math.min(config.max,Math.max(state.end,r.year));
    }
    update();
    document.querySelectorAll('dialog[open]').forEach(d=>d.close());
    if(validCoords(r)) selectRecord(r,true);
    else {selectRecord(r);toast('This archive record has no mapped coordinates.');}
    $('map-stage').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function toast(message){$('toast').textContent=message;$('toast').hidden=false;setTimeout(()=>$('toast').hidden=true,4000);}
  function storyRecords(){
    const air=datasets.aviation;
    const japan=air.find(r=>r.name==='Japan Airlines 123');
    const tenerife=air.find(r=>r.year===1977 && /Tenerife/i.test(r.location || '') && r.fatalities>=500);
    const alaska=datasets.earthquakes.find(r=>r.year===1964 && r.magnitude>=9);
    return [japan,tenerife,featuredWrecks.map(x=>datasets.wrecks.find(r=>r.id===x.id))[0],datasets.wrecks.find(r=>r.id==='endurance'),datasets.wrecks.find(r=>r.id==='estonia'),alaska].filter(Boolean);
  }
  const allRecords=Object.values(datasets).flat();
  function resultsMarkup(records){return records.map(r=>'<button class="result-row" data-record="'+esc(r.id)+'" data-collection="'+r.mode+'"><span>'+icon(modes[r.mode].icon)+'</span><span class="result-text"><strong>'+esc(r.name)+'</strong><small>'+esc(r.location || '')+' Â· '+esc(r.year || 'Undated')+' Â· '+esc(modes[r.mode].title)+'</small></span>'+icon('arrow')+'</button>').join('');}
  function bindRecordButtons(container){container.querySelectorAll('[data-record]').forEach(button=>button.onclick=()=>{const r=datasets[button.dataset.collection].find(x=>x.id===button.dataset.record);if(r)showRecordFromArchive(r);});}
  function renderSearch() {
    const q=$('archive-search').value.toLocaleLowerCase().trim();
    const matches=q ? allRecords.filter(r=>[r.name,r.location,r.operator,r.aircraft,r.flight,r.year,r.summary?.slice(0,300)].filter(x=>x!=null).join(' ').toLocaleLowerCase().includes(q)) : storyRecords();
    $('search-meta').textContent=q ? fmt(matches.length)+' matching records Â· showing '+Math.min(60,matches.length) : 'A few places to start. Search every collection, regardless of map filters.';
    $('search-results').innerHTML=matches.length ? resultsMarkup(matches.slice(0,60)) : '<p class="record-summary">No records found. Try a place, year, operator, or ship name.</p>';
    bindRecordButtons($('search-results'));
  }
  function openSearch() {renderSearch();$('search-dialog').showModal();setTimeout(()=>$('archive-search').focus(),50);}
  function openStories() {
    $('info-content').innerHTML='<h2>Every point. A human story.</h2><p>A few moments that changed how we travel, explore, and understand our planet. Open a story to find its place on the map.</p><div class="story-list">'+resultsMarkup(storyRecords())+'</div>';
    bindRecordButtons($('info-content'));$('info-dialog').showModal();
  }
  function openAbout() {
    $('info-content').innerHTML='<h2>History leaves a mark.</h2><p>Fallen Atlas is an independent, interactive map room for the curious. Follow the marks that extraordinary events have left on our shared planetâ€”from a century of aviation to the quiet history beneath the sea.</p><p>Every dot represents a real archive record. Adjust a date range, look closer at a region, or search across collections. The timelines show counts of records, not measures of travel risk.</p><h3>Explore with perspective</h3><p>These events involve real people and communities. The atlas presents records for historical understanding. Its collections have different time periods and reporting practices, so their totals should not be directly compared.</p><button class="result-row" id="about-sources"><span>'+icon('info')+'</span><span class="result-text"><strong>Data sources & coverage</strong><small>Where the records come from, and what they tell us.</small></span>'+icon('arrow')+'</button>';
    $('about-sources').onclick=openSources;if(!$('info-dialog').open)$('info-dialog').showModal();
  }
  function openSources() {
    const noCoords=datasets.aviation.filter(r=>!validCoords(r)).length;
    const minAir=Math.min(...datasets.aviation.map(r=>r.year).filter(Boolean));const maxAir=Math.max(...datasets.aviation.map(r=>r.year).filter(Boolean));
    $('info-content').innerHTML='<h2>A transparent atlas.</h2><p>All records and geography are bundled locally. This is a historical snapshot, not a live feed or a complete register of every accident or wreck.</p><h3>Aviation archive</h3><span class="coverage-tag">'+fmt(datasets.aviation.length)+' records Â· '+minAir+'â€“'+maxAir+'</span><p>The historical â€œAirplane Crashes and Fatalities Since 1908â€ collection, published as a <a href="https://services1.arcgis.com/4ezfu5dIwH83BUNL/ArcGIS/rest/services/Airplane_Crashes_and_Fatalities/FeatureServer" target="_blank" rel="noopener">geocoded ArcGIS archive</a>. It includes civil and military incidents and is not a complete worldwide accident census. Most positions are automated place-name geocodes; errors may remain. '+fmt(noCoords)+' records lack usable coordinates and are available through search. Fatality totals count people onboard; ground deaths are separate in the original source.</p><h3>Shipwrecks</h3><span class="coverage-tag">'+fmt(datasets.wrecks.length-5)+' historical coastal records + 5 featured wrecks</span><p>The <a href="https://services5.arcgis.com/HDRa0B57OVrv2E1q/ArcGIS/rest/services/Wrecks_and_Obstructions/FeatureServer" target="_blank" rel="noopener">NOAA AWOIS archive mirror</a> covers primarily U.S. coastal waters. AWOIS has been retired and is <a href="https://www.nauticalcharts.noaa.gov/data/wrecks-and-obstructions.html" target="_blank" rel="noopener">no longer updated by NOAA</a>. Some unidentified or historically reported wrecks may remain unverified. Survey depths are converted to meters from recorded feet or fathoms and indicate clearance above a wreck, not its height or necessarily the seabed. Zero or missing depth is shown as unknown. Undated records can be toggled independently of the date range. Featured wrecks report approximate seafloor depths and link to their individual sources.</p><h3>Seismic events</h3><span class="coverage-tag">'+fmt(datasets.earthquakes.length)+' earthquakes Â· 1900â€“2025 Â· M 7.0+</span><p>All matching events returned by the <a href="https://earthquake.usgs.gov/earthquakes/search/" target="_blank" rel="noopener">USGS Earthquake Catalog</a> for 1 January 1900 through 31 December 2025, with minimum magnitude 7.0. Earlier reporting is less complete. Coordinates are epicenters; depth is hypocenter depth in kilometers. Source estimates can be revised after this snapshot.</p><h3>Geography & imagery</h3><p>Country boundaries: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a>. Projection: Natural Earth, rendered locally with D3. Photograph: <a href="https://unsplash.com/photos/7KLa-xLbSXA" target="_blank" rel="noopener">Unsplash</a>. Boundaries are presented for geographic context. This atlas is not for navigation.</p>';
    if(!$('info-dialog').open)$('info-dialog').showModal();
  }
  document.querySelectorAll('.map-tab').forEach(button=>button.onclick=()=>setMode(button.dataset.mode));
  document.querySelector('.map-tabs').addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const buttons=[...document.querySelectorAll('.map-tab')];let index=buttons.indexOf(document.activeElement);
    index=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:2))%3;
    buttons[index].focus();setMode(buttons[index].dataset.mode);
  });
  $('region').onchange=()=>{
    state.region=$('region').value;update();
    if(state.region==='world')svg.transition().duration(600).call(zoom.transform,d3.zoomIdentity);
    else {const region=regions[state.region],p=projection(region.center),k=region.zoom;svg.transition().duration(600).call(zoom.transform,d3.zoomIdentity.translate(width*.47-p[0]*k,height*.48-p[1]*k).scale(k));}
  };
  $('severity').onchange=()=>{state.severity=$('severity').value;update();};
  $('include-unknown').onchange=()=>{state.unknown=$('include-unknown').checked;update();};
  function setYear(kind,value) {
    stopPlay();const config=modes[state.mode],number=Math.max(config.min,Math.min(config.max,Math.round(Number(value))));
    if(!Number.isFinite(number))return;
    if(kind==='start')state.start=Math.min(number,state.end);else state.end=Math.max(number,state.start);
    update();
  }
  ['year-start','range-start'].forEach(id=>$(id).addEventListener(id.startsWith('range')?'input':'change',event=>setYear('start',event.target.value)));
  ['year-end','range-end'].forEach(id=>$(id).addEventListener(id.startsWith('range')?'input':'change',event=>setYear('end',event.target.value)));
  $('reset-filters').onclick=$('empty-reset').onclick=()=>setMode(state.mode);
  $('zoom-in').onclick=()=>svg.transition().duration(250).call(zoom.scaleBy,1.5);
  $('zoom-out').onclick=()=>svg.transition().duration(250).call(zoom.scaleBy,1/1.5);
  $('reset-view').onclick=()=>svg.transition().duration(500).call(zoom.transform,d3.zoomIdentity);
  $('world-map').addEventListener('keydown',event=>{if(event.key==='+' || event.key==='=')$('zoom-in').click();else if(event.key==='-')$('zoom-out').click();else if(event.key==='0')$('reset-view').click();else if(event.key==='Escape')closeRecord();});
  $('play-timeline').onclick=()=>{
    if(state.playing){stopPlay();return;}
    const config=modes[state.mode];state.playing=true;
    if(state.end>=config.max)state.end=state.start;
    $('play-timeline').innerHTML='<svg class="icon" viewBox="0 0 24 24"><path d="M7 5h3v14H7ZM14 5h3v14h-3Z"/></svg>';
    $('play-timeline').setAttribute('aria-label','Pause timeline');update();
    state.playTimer=setInterval(()=>{state.end=Math.min(config.max,state.end+1);update();if(state.end>=config.max)stopPlay();},220);
  };
  $('search-button').onclick=openSearch;$('archive-search').addEventListener('input',renderSearch);
  ['stories-button','story-promo'].forEach(id=>$(id).onclick=openStories);
  ['about-button','footer-about'].forEach(id=>$(id).onclick=openAbout);
  $('sources-button').onclick=openSources;
  document.querySelectorAll('.close-dialog').forEach(button=>button.onclick=()=>button.closest('dialog').close());
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom)dialog.close();}}));
  document.addEventListener('keydown',event=>{if(event.key==='/' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName) && !document.querySelector('dialog[open]')){event.preventDefault();openSearch();}if(event.key==='Escape')closeRecord();});
  $('air-count').textContent=fmt(datasets.aviation.length);$('wreck-count').textContent=fmt(datasets.wrecks.length);$('quake-count').textContent=fmt(datasets.earthquakes.length);
  setMode('aviation');setupMap();
  const featured=datasets.aviation.find(r=>r.name==='Japan Airlines 123');
  if(featured && window.innerWidth >= 800)selectRecord(featured);
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{setupMap();update();},150);});
  // A small read-only interface makes browser-based verification possible without a build system.
  window.FallenAtlas={getState:()=>({...state,filtered:state.filtered.length,selected:state.selected?.id}),getCounts:()=>Object.fromEntries(Object.entries(datasets).map(([key,rows])=>[key,rows.length]))};
})();
