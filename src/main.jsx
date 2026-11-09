import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import games from './games.json';
import './styles.css';

const paths = {
 grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
 heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
 search:'m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
 dice:'M5 2h14a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3ZM7 7h.01M17 7h.01M12 12h.01M7 17h.01M17 17h.01',
 people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
 clock:'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
 arrow:'M5 12h14m-6-6 6 6-6 6',
 close:'m6 6 12 12M6 18 18 6',
 chevron:'m9 5 7 7-7 7',
 book:'M4 3h6a3 3 0 0 1 3 3v15a4 4 0 0 0-4-2H3V3ZM13 6a3 3 0 0 1 3-3h5v16h-5a4 4 0 0 0-3 2',
 mountain:'m2 20 7-14 5 9 3-5 5 10H2Z',
 sun:'M12 2v2M12 20v2M2 12h2M20 12h2m-17-7 1.5 1.5m11 11L19 19m0-14-1.5 1.5m-11 11L5 19M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z'
};
function Icon({name,size=20,...props}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name]||paths.grid}/></svg>}
const categories=['Strategi','Äventyr','Co-op','Två spelare','Familj','Socialt'];
function App(){
 const [category,setCategory]=useState('Alla spel');
 const [query,setQuery]=useState('');const [players,setPlayers]=useState('');const [duration,setDuration]=useState('');const [sort,setSort]=useState('default');
 const [selected,setSelected]=useState(games[0].id); const [tab,setTab]=useState('Om spelet');const [modal,setModal]=useState(null);const detailsRef=useRef(null);const closeRef=useRef(null);const previousFocus=useRef(null);
 const [favorites,setFavorites]=useState(()=>{try{const value=JSON.parse(localStorage.getItem('spelhyllan-favorites')||'[]');return Array.isArray(value)?value.filter(id=>typeof id==='string'):[]}catch{return []}});
 useEffect(()=>{try{localStorage.setItem('spelhyllan-favorites',JSON.stringify(favorites))}catch{}},[favorites]);
 useEffect(()=>{if(!modal)return;previousFocus.current=document.activeElement;closeRef.current?.focus();const onKey=e=>{if(e.key==='Escape')setModal(null);if(e.key==='Tab'){e.preventDefault();closeRef.current?.focus()}};document.addEventListener('keydown',onKey);return()=>{document.removeEventListener('keydown',onKey);previousFocus.current?.focus()}},[modal]);
 let filtered=games.filter(g=>(category==='Alla spel'||(category==='Favoriter'?favorites.includes(g.id):g.category===category))&&`${g.title} ${g.edition} ${g.category}`.toLocaleLowerCase('sv').includes(query.toLocaleLowerCase('sv'))&&(!players||g.playersMin<=Number(players)&&g.playersMax>=Number(players))&&(!duration||g.minutes<=Number(duration)));
 if(sort==='name')filtered.sort((a,b)=>a.title.localeCompare(b.title,'sv'));if(sort==='time')filtered.sort((a,b)=>a.minutes-b.minutes);
 const game=filtered.find(g=>g.id===selected)||filtered[0];
 const tint=game?.tint||'#e9e4ed',accent=game?.accent||'#815467';
 const choose=g=>{setSelected(g.id);setTab('Om spelet');if(window.matchMedia('(max-width: 650px)').matches)requestAnimationFrame(()=>detailsRef.current?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}))};
 const toggleFavorite=id=>setFavorites(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
 const reset=()=>{setCategory('Alla spel');setQuery('');setPlayers('');setDuration('')};
 return <div className="app" style={{'--tint':tint,'--accent':accent}}>
  <aside className="sidebar">
   <a className="brand" href="#" onClick={e=>{e.preventDefault();reset()}}><span className="brand-mark"><Icon name="dice" size={24}/></span><span>spelhyllan<span className="brand-dot">.</span></span></a>
   <div className="owner"><span className="avatar">W</span><div><strong>Williams samling</strong><span>En värld av spelkvällar</span></div></div>
   <p className="nav-caption">BIBLIOTEK</p>
   <nav aria-label="Bibliotek">{[['Alla spel','grid',games.length],['Favoriter','heart',favorites.length]].map(([label,icon,count])=><button key={label} aria-label={`${label}, ${count} spel`} className={`nav-item ${category===label?'active':''}`} onClick={()=>setCategory(label)} aria-current={category===label?'page':undefined}><Icon name={icon}/><span>{label}</span><span className="count">{count}</span></button>)}</nav>
   <p className="nav-caption category-caption">UTFORSKA</p>
   <nav aria-label="Spelkategorier">{categories.map((c,i)=><button key={c} className={`nav-item category-item ${category===c?'active':''}`} aria-current={category===c?'page':undefined} onClick={()=>setCategory(c)}><span className={`category-dot dot-${i}`}/><span>{c}</span><span className="count">{games.filter(g=>g.category===c).length}</span></button>)}</nav>
   <div className="sidebar-bottom"><Icon name="sun" size={18}/><span>Lite mindre skärm.<br/><strong>Lite mer spelkväll.</strong></span></div>
  </aside>
  <main className="workspace">
   <header className="topbar"><div className="breadcrumb">Mitt bibliotek <Icon name="chevron" size={13}/><span>{category}</span></div><span className="demo-label"><span/> Förhandsversion</span></header>
   <div className="workspace-inner">
    <section className="page-heading"><div><p className="eyebrow">SAMLINGEN, PÅ ETT STÄLLE</p><h1>{category==='Alla spel'?'Nästa spelkväll börjar här.':category}</h1><p className="intro">Bläddra, upptäck och hitta något att samlas kring.</p></div><button className="random-button" disabled={!filtered.length} onClick={()=>choose(filtered[Math.floor(Math.random()*filtered.length)])}><Icon name="dice" size={18}/>Välj åt mig<Icon name="arrow" size={17}/></button></section>
    <div className="toolbar"><label className="search"><Icon name="search" size={19}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Sök efter ett spel…" aria-label="Sök efter ett spel"/>{query&&<button aria-label="Rensa sökning" onClick={()=>setQuery('')}><Icon name="close" size={15}/></button>}</label><div className="filters"><select className="mobile-category" aria-label="Välj spelkategori" value={category} onChange={e=>setCategory(e.target.value)}>{['Alla spel','Favoriter',...categories].map(c=><option key={c}>{c}</option>)}</select><select aria-label="Filtrera antal spelare" value={players} onChange={e=>setPlayers(e.target.value)}><option value="">Alla spelarantal</option>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n} spelare</option>)}</select><select aria-label="Filtrera speltid" value={duration} onChange={e=>setDuration(e.target.value)}><option value="">Alla speltider</option><option value="30">Upp till 30 min</option><option value="60">Upp till 60 min</option><option value="120">Upp till 120 min</option></select></div></div>
    <div className="collection-layout">
     <section className="collection" aria-label="Spelsamling"><div className="collection-heading"><p><strong>{filtered.length}</strong> spel att upptäcka</p><select value={sort} aria-label="Sortera spel" onChange={e=>setSort(e.target.value)}><option value="default">Samlingens ordning</option><option value="name">Namn A–Ö</option><option value="time">Kortast speltid</option></select></div>
      {filtered.length?<div className="game-grid">{filtered.map(g=><button key={g.id} className={`game-card ${game?.id===g.id?'selected':''}`} onClick={()=>choose(g)} aria-pressed={game?.id===g.id}><div className="cover-wrap"><img src={g.cover} alt={`Platshållaromslag för ${g.title}`} loading="lazy"/>{favorites.includes(g.id)&&<span className="card-heart"><Icon name="heart" size={14}/></span>}<span className="selected-indicator">Valt spel <Icon name="arrow" size={14}/></span></div><h2>{g.title}</h2><p>{g.edition||g.category}</p></button>)}</div>:<div className="empty"><Icon name="search" size={34}/><h2>Inga spel hittades</h2><p>Prova en annan sökning eller ta bort dina filter.</p><button onClick={reset}>Visa alla spel</button></div>}
      <p className="collection-footnote">En första titt på samlingen · Bilder och spelvärden är platshållare.</p>
     </section>
     {game&&<aside ref={detailsRef} className="details" aria-label="Information om valt spel" key={game.id}><div className="detail-hero"><img src={game.gallery[0]} alt={`Illustrerad platshållarbild för ${game.title}`}/><span className="hero-label">{game.category}</span><button className={`favorite-button ${favorites.includes(game.id)?'is-favorite':''}`} aria-label={favorites.includes(game.id)?'Ta bort från favoriter':'Lägg till i favoriter'} aria-pressed={favorites.includes(game.id)} onClick={()=>toggleFavorite(game.id)}><Icon name="heart" size={19}/></button><span className="hero-placeholder">PLATSHÅLLARBILD</span></div>
      <div className="detail-content"><p className="detail-edition">{game.edition||'UR WILLIAMS SAMLING'}</p><h2>{game.title}</h2><div className="stats"><div><Icon name="people"/><strong>{game.playersMin===game.playersMax?game.playersMin:`${game.playersMin}–${game.playersMax}`}</strong><span>spelare*</span></div><div><Icon name="clock"/><strong>{game.minutes} min</strong><span>speltid*</span></div><div><Icon name="mountain"/><strong>{game.weight.toFixed(1)} <small>/ 5</small></strong><span>svårighet*</span></div></div>
       <p className="data-note">* Exempelvärden – ersätts med verifierad speldata.</p>
       <div className="detail-tabs" role="tablist" aria-label="Spelinformation">{['Om spelet','Bilder'].map(t=><button key={t} role="tab" id={`tab-${t==='Bilder'?'images':'about'}`} aria-controls="detail-tab-panel" aria-selected={tab===t} onClick={()=>setTab(t)}>{t}{t==='Bilder'&&<span>2</span>}</button>)}</div>
       <div id="detail-tab-panel" role="tabpanel" aria-labelledby={`tab-${tab==='Bilder'?'images':'about'}`}>{tab==='Om spelet'?<div className="about"><p>{game.description}</p><div className="tags"><span>{game.category}</span><span>Brädspel</span></div><div className="preview-note"><Icon name="book" size={18}/><p>Här finns snart dina bilder, spelbeskrivningar och detaljer.</p></div></div>:<div className="gallery">{game.gallery.map((src,i)=><button key={src} onClick={()=>setModal({src,title:i===0?'Spelet uppdukat':'Komponenter'})}><img src={src} alt={`Platshållare: ${i===0?'spelet uppdukat':'komponenter'}`}/><span>{i===0?'Spelet uppdukat':'Komponenter'}<Icon name="arrow" size={15}/></span></button>)}</div>}</div>
      </div><div className="detail-footer"><span className="tiny-dot"/> I samlingen <span>#{String(games.indexOf(game)+1).padStart(3,'0')}</span></div>
     </aside>}
    </div>
   </div>
  </main>
  {modal&&<div className="modal-backdrop" onClick={()=>setModal(null)}><div className="modal" role="dialog" aria-modal="true" aria-label={modal.title} onClick={e=>e.stopPropagation()}><button ref={closeRef} onClick={()=>setModal(null)} aria-label="Stäng bild"><Icon name="close"/></button><img src={modal.src} alt={`Platshållare: ${modal.title}`}/><p>{modal.title} · Platshållarbild</p></div></div>}
 </div>
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
