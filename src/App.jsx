import React, { useEffect, useMemo, useState } from "react";
// App.jsx corregido: la clasificación debe respetar conference_position.
// NOTA: El contenido fuente completo del App.jsx no está disponible en el contexto actual.
// Sustituye en tu App.jsx actual la función Standings por la siguiente implementación.

function Standings({ standings }) {
  const [conf, setConf] = useState("East");

  const rows = useMemo(() => {
    return [...standings]
      .filter((team) => {
        if (team.conference) return team.conference === conf;
        return conf === "East" ? EAST.has(team.team) : !EAST.has(team.team);
      })
      .sort(
        (a, b) =>
          Number(a.conference_position) - Number(b.conference_position)
      );
  }, [standings, conf]);

  return (
    <section>
      <p className="text-xs font-semibold text-orange-600">TEMPORADA 2026-27</p>
      <h2 className="mb-4 text-xl font-black">Clasificación</h2>

      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        {["East", "West"].map((x) => (
          <button
            key={x}
            onClick={() => setConf(x)}
            className={`rounded-xl py-2 font-bold ${
              conf === x ? "bg-white shadow-sm" : "text-slate-500"
            }`}
          >
            {x === "East" ? "Este" : "Oeste"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <div className="grid grid-cols-[28px_minmax(0,1fr)_28px_28px_48px] bg-slate-100 px-2 py-2 text-[9px] font-bold text-slate-500">
          <div>#</div><div>Equipo</div><div>V</div><div>D</div><div className="text-right">%</div>
        </div>

        {rows.map((t) => (
          <div key={t.team} className="grid grid-cols-[28px_minmax(0,1fr)_28px_28px_48px] items-center border-t px-2 py-3">
            <div className="text-xs font-black text-slate-400">{t.conference_position}</div>
            <div className="flex min-w-0 items-center gap-2">
              <Logo code={t.team} name={t.team_name} />
              <div className="truncate text-xs font-bold">{t.team_name}</div>
            </div>
            <div>{t.wins}</div>
            <div>{t.losses}</div>
            <div className="text-right font-bold">
              {Number(t.win_pct).toFixed(3).replace(/^0/, "")}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
