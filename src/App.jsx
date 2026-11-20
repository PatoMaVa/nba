import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, Trophy, BarChart3, Flag, CircleHelp, CalendarDays,
  RefreshCw, AlertCircle, ArrowLeft, Search, DollarSign,
  TrendingUp, ArrowDownWideNarrow, ArrowUpNarrowWide,
  CheckCircle2, XCircle, RotateCcw, GraduationCap, Star, Shield,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL;
const URLS = {
  games: `${BASE}data/scoreboard.json`,
  boxScores: `${BASE}data/player-stats.json`,
  standings: `${BASE}data/standings.json`,
  seasonStats: `${BASE}data/season-player-stats.json`,
  salaries: `${BASE}data/player-salaries.json`,
  quiz: `${BASE}data/quiz-questions.json`,
};

const NBA_TEAM_IDS = {
  ATL:1610612737,BOS:1610612738,BKN:1610612751,CHA:1610612766,CHI:1610612741,CLE:1610612739,
  DAL:1610612742,DEN:1610612743,DET:1610612765,GSW:1610612744,HOU:1610612745,IND:1610612754,
  LAC:1610612746,LAL:1610612747,MEM:1610612763,MIA:1610612748,MIL:1610612749,MIN:1610612750,
  NOP:1610612740,NYK:1610612752,OKC:1610612760,ORL:1610612753,PHI:1610612755,PHX:1610612756,
  POR:1610612757,SAC:1610612758,SAS:1610612759,TOR:1610612761,UTA:1610612762,WAS:1610612764,
};
const EAST = new Set(["ATL","BOS","BKN","CHA","CHI","CLE","DET","IND","MIA","MIL","NYK","ORL","PHI","TOR","WAS"]);
const SPANISH = ["Santi Aldama","Sergio De Larrea","Hugo Gonzalez","Aday Mara","Baba Miller"];
const NAV = [
  ["Scores",Activity,"Partidos"],["Standings",Trophy,"Clasif."],["Players",BarChart3,"Jugadores"],
  ["Spanish",Flag,"Españoles"],["Quiz",CircleHelp,"Quiz"],
];
const STAT_CATEGORIES = [
  ["points_pg","PTS","Puntos por partido"],["rebounds_pg","REB","Rebotes por partido"],
  ["assists_pg","AST","Asistencias por partido"],["steals_pg","ROB","Robos por partido"],
  ["blocks_pg","TAP","Tapones por partido"],["three_point_makes_pg","3PT","Triples por partido"],
  ["field_goal_pct","TC%","Porcentaje de campo",true],["three_point_pct","3PT%","Porcentaje de triples",true],
  ["free_throw_pct","TL%","Porcentaje de tiros libres",true],["ts_pct","TS%","True Shooting",true],
].map(([key,label,title,percentage])=>({key,label,title,percentage}));
const SALARY_CATEGORIES = [
  ["costPerPoint","$/PTS","Coste por punto"],["costPerRebound","$/REB","Coste por rebote"],
  ["costPerAssist","$/AST","Coste por asistencia"],["costPerSteal","$/ROB","Coste por robo"],
  ["costPerBlock","$/TAP","Coste por tapón"],
].map(([key,label,title])=>({key,label,title}));

function normalize(v=""){return String(v).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9\s]/g,"").replace(/\s+/g," ").trim()}
function playerName(p){return `${p?.firstname||""} ${p?.lastname||""}`.trim()}
function reversedName(p){return `${p?.lastname||""} ${p?.firstname||""}`.trim()}
function isSpanish(n){const x=normalize(n);return SPANISH.some(s=>{const a=s.split(" ");return x===normalize(s)||x===normalize(`${a.slice(1).join(" ")} ${a[0]}`)})}
function logo(code){const id=NBA_TEAM_IDS[code];return id?`https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`:""}
function num(v,d=1){return v===null||v===undefined||!Number.isFinite(Number(v))?"-":Number(v).toLocaleString("es-ES",{minimumFractionDigits:d,maximumFractionDigits:d})}
function pct(v){return v===null||v===undefined||!Number.isFinite(Number(v))?"-":`${num(Number(v)*100,1)}%`}
function money(v,compact=false){if(!Number.isFinite(Number(v)))return "-";return new Intl.NumberFormat("es-ES",{style:"currency",currency:"USD",notation:compact?"compact":"standard",maximumFractionDigits:compact?1:0}).format(v)}
function divide(a,b){a=Number(a||0);b=Number(b||0);return b>0?a/b:null}
function status(game){if(game.status?.short===3)return "FINAL";if(game.status?.short===2)return `${game.periods?.current?`Q${game.periods.current}`:"EN JUEGO"}${game.status?.clock?` · ${game.status.clock}`:""}`;return game.status?.long?.toUpperCase()||"PROGRAMADO"}
function top(){requestAnimationFrame(()=>window.scrollTo(0,0))}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

function Logo({code,name,size="normal"}){const [bad,setBad]=useState(false);useEffect(()=>setBad(false),[code]);const big=size==="large";return <div className={`grid ${big?"h-16 w-16":"h-10 w-10"} flex-shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm`}>{logo(code)&&!bad?<img src={logo(code)} alt={name||code} className={`${big?"h-13 w-13":"h-8 w-8"} object-contain`} onError={()=>setBad(true)}/>:<span className="text-xs font-black">{code||"NBA"}</span>}</div>}
function Stat({label,value,featured=false}){return <div className={`rounded-2xl p-3 text-center ${featured?"bg-orange-50":"bg-slate-100"}`}><div className={`text-xl font-black ${featured?"text-orange-600":"text-slate-950"}`}>{value}</div><div className="mt-1 text-[9px] font-bold uppercase text-slate-400">{label}</div></div>}
function Loading({text="Cargando..."}){return <div className="rounded-3xl bg-slate-100 p-8 text-center text-sm text-slate-500">{text}</div>}
function ErrorBox({text}){return <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700"><AlertCircle size={19}/>{text}</div>}
function TeamRow({team,score}){return <div className="flex items-center gap-3"><Logo code={team?.code} name={team?.name}/><div className="min-w-0 flex-1"><div className="truncate font-bold">{team?.name}</div><div className="text-xs text-slate-400">{team?.code}</div></div><div className="text-2xl font-black">{score?.points??"-"}</div></div>}

function mergePlayers(stats,salaries){const byKey=new Map(),byName=new Map();salaries.forEach(s=>{const n=normalize(s.player_name);byKey.set(`${n}|${s.team||""}`,s);byName.set(n,s)});return stats.map(p=>{const salary=Number((byKey.get(`${normalize(p.player_name)}|${p.team||""}`)||byName.get(normalize(p.player_name)))?.salary||0);const g=Number(p.games_played||0);return {...p,salary:salary||null,minutes_pg:divide(p.minutes,g),steals_pg:divide(p.steals,g),blocks_pg:divide(p.blocks,g),turnovers_pg:divide(p.turnovers,g),three_point_makes_pg:divide(p.three_point_makes,g),costPerPoint:salary?divide(salary,p.points):null,costPerRebound:salary?divide(salary,p.rebounds):null,costPerAssist:salary?divide(salary,p.assists):null,costPerSteal:salary?divide(salary,p.steals):null,costPerBlock:salary?divide(salary,p.blocks):null}})}
function findSeason(box,players){if(!box)return null;const names=[normalize(playerName(box.player)),normalize(reversedName(box.player))];return players.find(p=>p.team===box.team?.code&&names.includes(normalize(p.player_name)))||players.find(p=>names.includes(normalize(p.player_name)))||null}

function PlayerDetail({player,onBack}){return <section><button onClick={onBack} className="mb-5 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"><ArrowLeft size={18}/>Volver</button><article className="overflow-hidden rounded-3xl border bg-white shadow-lg"><div className="bg-gradient-to-br from-orange-500 to-red-500 p-5 text-white"><div className="flex items-center gap-4"><Logo code={player.team} name={player.player_name} size="large"/><div><h1 className="text-2xl font-black">{player.player_name}</h1><p className="mt-1 text-sm text-orange-100">{player.team} · {player.position||"-"}</p></div></div></div><div className="p-5"><p className="mb-3 text-xs font-bold uppercase text-orange-600">Temporada 2026-27</p><div className="grid grid-cols-2 gap-3"><Stat label="PJ" value={player.games_played}/><Stat label="MIN" value={num(player.minutes_pg)}/><Stat label="PTS" value={num(player.points_pg)} featured/><Stat label="REB" value={num(player.rebounds_pg)}/><Stat label="AST" value={num(player.assists_pg)}/><Stat label="ROB" value={num(player.steals_pg)}/><Stat label="TAP" value={num(player.blocks_pg)}/><Stat label="TS%" value={pct(player.ts_pct)}/></div></div>{player.salary&&<div className="border-t p-5"><div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white"><div className="text-xs text-slate-300">Salario anual</div><div className="mt-1 text-2xl font-black">{money(player.salary)}</div></div><div className="grid grid-cols-2 gap-3"><Stat label="$/PTS" value={money(player.costPerPoint)}/><Stat label="$/REB" value={money(player.costPerRebound)}/><Stat label="$/AST" value={money(player.costPerAssist)}/></div></div>}</article></section>}

function Players({players,onSelect}){const [mode,setMode]=useState("stats"),[stat,setStat]=useState("points_pg"),[sal,setSal]=useState("costPerPoint"),[dir,setDir]=useState("desc"),[search,setSearch]=useState("");const cats=mode==="stats"?STAT_CATEGORIES:SALARY_CATEGORIES;const cat=cats.find(c=>c.key===(mode==="stats"?stat:sal))||cats[0];const ranked=useMemo(()=>players.filter(p=>{const v=Number(p[cat.key]);return (!search||normalize(p.player_name).includes(normalize(search))||normalize(p.team).includes(normalize(search)))&&Number.isFinite(v)&&(mode!=="salary"||(p.salary&&v>0))}).sort((a,b)=>(dir==="asc"?1:-1)*(Number(a[cat.key])-Number(b[cat.key]))),[players,cat,dir,mode,search]);const val=p=>mode==="salary"?money(p[cat.key],true):cat.percentage?pct(p[cat.key]):num(p[cat.key]);return <section><p className="text-xs font-semibold text-orange-600">TEMPORADA 2026-27</p><h2 className="text-xl font-black">Ranking de jugadores</h2><div className="my-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1"><button onClick={()=>{setMode("stats");setDir("desc")}} className={`rounded-xl py-2 text-xs font-bold ${mode==="stats"?"bg-white shadow-sm":"text-slate-500"}`}><span className="flex items-center justify-center gap-1"><TrendingUp size={15}/>Estadísticas</span></button><button onClick={()=>{setMode("salary");setDir("asc")}} className={`rounded-xl py-2 text-xs font-bold ${mode==="salary"?"bg-white shadow-sm":"text-slate-500"}`}><span className="flex items-center justify-center gap-1"><DollarSign size={15}/>Coste salarial</span></button></div><div className="mb-4 flex gap-2 overflow-x-auto">{cats.map(c=><button key={c.key} onClick={()=>mode==="stats"?setStat(c.key):setSal(c.key)} className={`flex-shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${cat.key===c.key?"bg-orange-500 text-white":"bg-slate-100 text-slate-600"}`}>{c.label}</button>)}</div><div className="mb-4 grid grid-cols-2 rounded-2xl border p-1"><button onClick={()=>setDir("desc")} className={`flex items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold ${dir==="desc"?"bg-slate-950 text-white":"text-slate-500"}`}><ArrowDownWideNarrow size={15}/>Mayor a menor</button><button onClick={()=>setDir("asc")} className={`flex items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold ${dir==="asc"?"bg-slate-950 text-white":"text-slate-500"}`}><ArrowUpNarrowWide size={15}/>Menor a mayor</button></div><div className="relative mb-4"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar jugador o equipo" className="w-full rounded-2xl border py-3 pl-10 pr-4 text-sm"/></div><div className="overflow-hidden rounded-2xl border"><div className="grid grid-cols-[30px_minmax(0,1fr)_74px] bg-slate-100 px-3 py-2 text-[9px] font-bold uppercase text-slate-500"><div>#</div><div>Jugador</div><div className="text-right">{cat.label}</div></div>{ranked.slice(0,100).map((p,i)=><button key={`${p.player_name}-${p.team}`} onClick={()=>onSelect(p)} className="grid w-full grid-cols-[30px_minmax(0,1fr)_74px] items-center border-t px-3 py-3 text-left"><div className="text-xs font-black text-slate-400">{i+1}</div><div className="flex min-w-0 items-center gap-2"><Logo code={p.team}/><div className="min-w-0"><div className="text-xs font-bold">{p.player_name}</div><div className="text-[9px] text-slate-400">{p.team} · {p.games_played} PJ</div></div></div><div className="text-right text-xs font-black text-orange-600">{val(p)}</div></button>)}</div></section>}

function Standings({standings}){const [conf,setConf]=useState("East");const rows=[...standings].filter(t=>conf==="East"?EAST.has(t.team):!EAST.has(t.team)).sort((a,b)=>Number(b.win_pct)-Number(a.win_pct));return <section><p className="text-xs font-semibold text-orange-600">TEMPORADA 2026-27</p><h2 className="mb-4 text-xl font-black">Clasificación</h2><div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">{["East","West"].map(x=><button key={x} onClick={()=>setConf(x)} className={`rounded-xl py-2 font-bold ${conf===x?"bg-white shadow-sm":"text-slate-500"}`}>{x==="East"?"Este":"Oeste"}</button>)}</div><div className="overflow-hidden rounded-2xl border"><div className="grid grid-cols-[28px_minmax(0,1fr)_28px_28px_48px] bg-slate-100 px-2 py-2 text-[9px] font-bold text-slate-500"><div>#</div><div>Equipo</div><div>V</div><div>D</div><div className="text-right">%</div></div>{rows.map((t,i)=><div key={t.team} className="grid grid-cols-[28px_minmax(0,1fr)_28px_28px_48px] items-center border-t px-2 py-3"><div className="text-xs font-black text-slate-400">{i+1}</div><div className="flex items-center gap-2"><Logo code={t.team}/><div className="truncate text-xs font-bold">{t.team_name}</div></div><div>{t.wins}</div><div>{t.losses}</div><div className="text-right font-bold">{Number(t.win_pct).toFixed(3).replace(/^0/,"")}</div></div>)}</div></section>}

function Scores({games,onOpen,refresh,date}){return <section><div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-black">Partidos</h2><p className="text-xs text-slate-400">{date}</p></div><button onClick={refresh} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"><RefreshCw size={14}/>Actualizar</button></div><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{games.map(g=><button key={g.id} onClick={()=>onOpen(g)} className="rounded-3xl border p-5 text-left shadow-sm"><div className="mb-4 text-xs font-bold text-slate-500">{status(g)}</div><div className="space-y-4"><TeamRow team={g.teams?.visitors} score={g.scores?.visitors}/><TeamRow team={g.teams?.home} score={g.scores?.home}/></div><div className="mt-4 text-right text-xs font-bold text-orange-600">Ver partido →</div></button>)}</div></section>}


function GameDetail({game,stats,onBack}){const visitors=game.teams?.visitors,home=game.teams?.home;const renderTeam=team=>{const rows=stats.filter(x=>x.team?.id===team?.id).sort((a,b)=>Number(b.min||0)-Number(a.min||0));return <div><div className="mb-3 flex items-center gap-3"><Logo code={team?.code} name={team?.name}/><div className="font-black">{team?.name}</div></div><div className="overflow-hidden rounded-2xl border"><div className="grid grid-cols-[minmax(120px,1fr)_38px_38px_38px] bg-slate-100 px-2 py-2 text-[9px] font-bold text-slate-500"><div>JUGADOR</div><div>PTS</div><div>REB</div><div>AST</div></div>{rows.map(r=><div key={r.player?.id} className="grid grid-cols-[minmax(120px,1fr)_38px_38px_38px] border-t px-2 py-3 text-xs"><div className="font-bold">{playerName(r.player)}</div><div className="font-black text-orange-600">{r.points??0}</div><div>{r.totReb??0}</div><div>{r.assists??0}</div></div>)}</div></div>};return <section><button onClick={onBack} className="mb-5 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"><ArrowLeft size={18}/>Partidos</button><article className="overflow-hidden rounded-3xl border shadow-lg"><div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 text-center font-black text-white">{status(game)}</div><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-5"><div className="flex flex-col items-center text-center"><Logo code={visitors?.code} size="large"/><div className="mt-2 text-xs font-bold">{visitors?.name}</div></div><div className="flex gap-2 text-3xl font-black"><span>{game.scores?.visitors?.points??"-"}</span><span>-</span><span>{game.scores?.home?.points??"-"}</span></div><div className="flex flex-col items-center text-center"><Logo code={home?.code} size="large"/><div className="mt-2 text-xs font-bold">{home?.name}</div></div></div><div className="space-y-7 border-t p-4">{stats.length?<> {renderTeam(visitors)} {renderTeam(home)} </>:<Loading text="Las estadísticas todavía no están disponibles."/>}</div></article></section>}

function SpanishView({players,daily}){const season=players.filter(p=>isSpanish(p.player_name));return <section><p className="text-xs font-semibold text-orange-600">ÚLTIMA JORNADA</p><h2 className="text-xl font-black">Actuaciones españolas</h2><div className="mt-4 space-y-4">{daily.length?daily.map(s=><article key={`${s.game?.id}-${s.player?.id}`} className="rounded-3xl border border-orange-200 bg-orange-50/40 p-5"><div className="mb-4 flex items-center gap-3"><Logo code={s.team?.code}/><div><h3 className="font-black">{playerName(s.player)}</h3><p className="text-xs text-slate-500">{s.team?.name}</p></div></div><div className="grid grid-cols-4 gap-2"><Stat label="MIN" value={s.min??"-"}/><Stat label="PTS" value={s.points??0} featured/><Stat label="REB" value={s.totReb??0}/><Stat label="AST" value={s.assists??0}/></div></article>):<Loading text="Sin actuaciones españolas disponibles."/>}</div><div className="mb-4 mt-8"><p className="text-xs font-semibold text-orange-600">TEMPORADA 2026-27</p><h2 className="text-xl font-black">Promedios</h2></div><div className="space-y-4">{season.map(p=><article key={`${p.player_name}-${p.team}`} className="rounded-3xl border p-5"><div className="mb-4 flex items-center gap-3"><Logo code={p.team}/><div><h3 className="font-black">{p.player_name}</h3><p className="text-xs text-slate-500">{p.team}</p></div></div><div className="grid grid-cols-4 gap-2"><Stat label="PJ" value={p.games_played}/><Stat label="PTS" value={num(p.points_pg)} featured/><Stat label="REB" value={num(p.rebounds_pg)}/><Stat label="AST" value={num(p.assists_pg)}/></div></article>)}</div></section>}

function normalizeQuizLevel(value = "") {
  const level = normalize(value).replace(/\s+/g, "-");

  if (["rookie", "facil", "easy", "sencilla", "sencillo", "basico", "basic"].includes(level)) {
    return "rookie";
  }

  if (["professional", "profesional", "media", "medio", "dificil", "hard"].includes(level)) {
    return "professional";
  }

  if (["all-star", "allstar", "master", "experto", "expert", "elite"].includes(level)) {
    return "all-star";
  }

  return level;
}

function questionLevel(question) {
  return normalizeQuizLevel(
    question?.level ||
    question?.difficulty ||
    question?.nivel ||
    question?.dificultad ||
    ""
  );
}

const LEVELS = [
  {key:"rookie",title:"Rookie",icon:GraduationCap,color:"emerald",text:"Jugadores, equipos, posiciones, alturas y récords conocidos."},
  {key:"professional",title:"Profesional",icon:Shield,color:"orange",text:"Estadísticas históricas, comparaciones y carreras completas."},
  {key:"all-star",title:"All-Star",icon:Star,color:"violet",text:"Marcas exactas, identificación estadística y datos para especialistas."},
];
function Quiz({questions}){const [level,setLevel]=useState(null),[game,setGame]=useState([]),[index,setIndex]=useState(0),[answer,setAnswer]=useState(null),[score,setScore]=useState(0),[finished,setFinished]=useState(false);function start(chosen=level){const pool=questions.filter(q=>questionLevel(q)===chosen);if(!pool.length){setLevel(null);setGame([]);return}setLevel(chosen);setGame(shuffle(pool).slice(0,Math.min(10,pool.length)));setIndex(0);setAnswer(null);setScore(0);setFinished(false);top()}function changeLevel(){setLevel(null);setGame([]);setFinished(false);setAnswer(null);top()}if(!questions.length)return <ErrorBox text="No se han podido cargar las preguntas. Comprueba que public/data/quiz-questions.json existe y contiene questions o response."/>;if(!level)return <section><div className="mb-5 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 p-6 text-white"><p className="text-xs font-black uppercase tracking-widest text-orange-100">QUIZ ÑBA</p><h2 className="mt-2 text-3xl font-black">Elige tu nivel</h2><p className="mt-2 text-sm text-orange-50">Cada partida contiene 10 preguntas diferentes.</p></div><div className="space-y-3">{LEVELS.map(({key,title,icon:Icon,text})=><button key={key} onClick={()=>start(key)} className="flex w-full items-center gap-4 rounded-3xl border bg-white p-5 text-left shadow-sm"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white"><Icon size={23}/></div><div><h3 className="text-lg font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{text}</p><p className="mt-1 text-[10px] font-bold uppercase text-orange-600">{questions.filter(q=>questionLevel(q)===key).length} preguntas disponibles</p></div></button>)}</div></section>;if(finished){const percent=Math.round(score/game.length*100);const title=score===10?"🏆 Partido perfecto":score>=8?"⭐ Nivel MVP":score>=6?"🔥 Gran partido":"🏀 Sigue entrenando";return <section><div className="rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 p-7 text-center text-white"><p className="text-xs font-bold uppercase tracking-widest text-orange-100">Resultado · {LEVELS.find(x=>x.key===level)?.title}</p><div className="mt-4 text-6xl font-black">{score}/{game.length}</div><div className="mt-2 text-xl font-black">{percent}%</div><h2 className="mt-5 text-2xl font-black">{title}</h2></div><button onClick={()=>start(level)} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 font-black text-white"><RotateCcw size={18}/>Jugar otra vez</button><button onClick={changeLevel} className="mt-3 w-full rounded-2xl border py-4 font-black">Cambiar nivel</button></section>}const q=game[index];if(!q)return <Loading text="Preparando partida..."/>;const answered=answer!==null,correct=answer===q.correctAnswer;function choose(i){if(answered)return;setAnswer(i);if(i===q.correctAnswer)setScore(s=>s+1)}function next(){if(index===game.length-1){setFinished(true);top()}else{setIndex(i=>i+1);setAnswer(null);top()}}return <section><div className="mb-5"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase text-orange-600">{LEVELS.find(x=>x.key===level)?.title}</p><h2 className="text-xl font-black">Pregunta {index+1} de {game.length}</h2></div><div className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white">{score} aciertos</div></div><div className="mt-4 flex gap-1">{game.map((_,i)=><div key={i} className={`h-1.5 flex-1 rounded-full ${i<index?"bg-orange-500":i===index?"bg-slate-950":"bg-slate-200"}`}/>)}</div></div><article className="rounded-3xl border bg-white p-5 shadow-sm"><div className="mb-4 flex gap-2"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase text-orange-600">{q.category||"NBA"}</span></div><h3 className="mb-6 text-xl font-black leading-7">{q.question}</h3><div className="space-y-3">{q.options.map((option,i)=>{let cls="border-slate-200 bg-white";if(answered&&i===q.correctAnswer)cls="border-emerald-500 bg-emerald-50 text-emerald-800";else if(answered&&i===answer)cls="border-red-400 bg-red-50 text-red-700";return <button key={i} disabled={answered} onClick={()=>choose(i)} className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left text-sm font-bold ${cls}`}><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs">{String.fromCharCode(65+i)}</span><span className="flex-1">{option}</span>{answered&&i===q.correctAnswer&&<CheckCircle2 size={20}/>} {answered&&i===answer&&i!==q.correctAnswer&&<XCircle size={20}/>}</button>})}</div>{answered&&<div className={`mt-5 rounded-2xl p-4 ${correct?"bg-emerald-50":"bg-red-50"}`}><div className={`font-black ${correct?"text-emerald-700":"text-red-700"}`}>{correct?"✓ Correcto":"✕ Incorrecto"}</div><p className="mt-2 text-sm text-slate-600">{q.explanation}</p></div>}{answered&&<button onClick={next} className="mt-5 w-full rounded-2xl bg-slate-950 py-3.5 font-black text-white">{index===game.length-1?"Ver resultado":"Siguiente pregunta"}</button>}</article></section>}

export default function App(){const [tab,setTab]=useState("Scores"),[games,setGames]=useState([]),[date,setDate]=useState(""),[standings,setStandings]=useState([]),[season,setSeason]=useState([]),[salaries,setSalaries]=useState([]),[boxes,setBoxes]=useState({}),[questions,setQuestions]=useState([]),[selected,setSelected]=useState(null),[selectedGame,setSelectedGame]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");async function json(url){const r=await fetch(`${url}?t=${Date.now()}`,{cache:"no-store"});if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json()}async function load(){
  setLoading(true);
  setError("");

  try {
    const [g,b,st,se,sa]=await Promise.all([
      json(URLS.games),
      json(URLS.boxScores),
      json(URLS.standings),
      json(URLS.seasonStats),
      json(URLS.salaries),
    ]);

    setGames(Array.isArray(g.response)?g.response:[]);
    setDate(g.parameters?.date||"");
    setBoxes(b.games||{});
    setStandings(Array.isArray(st.response)?st.response:[]);
    setSeason(Array.isArray(se.response)?se.response:[]);
    setSalaries(Array.isArray(sa.response)?sa.response:[]);
  } catch(e) {
    console.error(e);
    setError("No ha sido posible cargar todos los datos.");
  }

  try {
    const q=await json(URLS.quiz);
    const quizItems=Array.isArray(q)
      ? q
      : Array.isArray(q.questions)
      ? q.questions
      : Array.isArray(q.response)
      ? q.response
      : [];

    setQuestions(quizItems);
  } catch(e) {
    console.error("No se ha podido cargar quiz-questions.json",e);
    setQuestions([]);
  } finally {
    setLoading(false);
  }
}useEffect(()=>{load()},[]);const players=useMemo(()=>mergePlayers(season,salaries),[season,salaries]);const daily=useMemo(()=>Object.values(boxes).flatMap(x=>x?.response||[]).filter(s=>isSpanish(playerName(s.player))||isSpanish(reversedName(s.player))),[boxes]);function change(next){setTab(next);setSelected(null);setSelectedGame(null);top()}const selectedGameStats=selectedGame?(boxes[String(selectedGame.id)]?.response||[]):[];return <div className="min-h-screen bg-white text-slate-950"><header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur" style={{paddingTop:"env(safe-area-inset-top)"}}><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
  <button onClick={()=>change("Scores")} className="flex flex-shrink-0 items-center gap-3">
    <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-sm font-black text-white">ÑBA</div>
    <div className="text-left">
      <div className="font-black">ÑBA</div>
      <div className="text-[10px] text-slate-500">Tu app de baloncesto</div>
    </div>
  </button>

  <nav className="hidden items-center gap-1 md:flex">
    {NAV.map(([key,Icon,label])=>(
      <button
        key={key}
        onClick={()=>change(key)}
        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${tab===key?"bg-slate-950 text-white":"text-slate-600 hover:bg-slate-100"}`}
      >
        <Icon size={16}/>
        <span>{label==="Clasif."?"Clasificación":label}</span>
      </button>
    ))}
  </nav>
</div></header><main className="mx-auto max-w-7xl px-4 py-5 pb-28">{selectedGame?<GameDetail game={selectedGame} stats={selectedGameStats} onBack={()=>{setSelectedGame(null);top()}}/>:selected?<PlayerDetail player={selected} onBack={()=>{setSelected(null);top()}}/>:<>{tab!=="Quiz"&&<section className="mb-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 px-5 py-4 text-white"><div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase"><CalendarDays size={14}/>ÑBA</div><h1 className="text-2xl font-black">Baloncesto con Ñ.</h1><p className="mt-1 text-xs text-orange-50">Resultados, clasificación, rankings, españoles y Quiz.</p></section>}{loading&&tab!=="Quiz"?<Loading text="Cargando ÑBA..."/>:error&&tab!=="Quiz"?<ErrorBox text={error}/>:tab==="Scores"?<Scores games={games} date={date} refresh={load} onOpen={g=>{setSelectedGame(g);top()}}/>:tab==="Standings"?<Standings standings={standings}/>:tab==="Players"?<Players players={players} onSelect={setSelected}/>:tab==="Spanish"?<SpanishView players={players} daily={daily}/>:<Quiz questions={questions}/>}</>}</main>{!selected&&!selectedGame&&<nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t bg-white/95 px-1 pt-2 backdrop-blur md:hidden" style={{paddingBottom:"calc(0.5rem + env(safe-area-inset-bottom))"}}>{NAV.map(([key,Icon,label])=><button key={key} onClick={()=>change(key)} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[8px] ${tab===key?"bg-slate-950 text-white":"text-slate-500"}`}><Icon size={17}/><span className="truncate">{label}</span></button>)}</nav>}</div>}
