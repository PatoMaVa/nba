import React, { useMemo, useState } from "react";
import {
  Search,
  Trophy,
  Activity,
  Users,
  CalendarDays,
} from "lucide-react";

const games = [
  {
    id: 1,
    away: "Lakers",
    awayAbbr: "LAL",
    awayScore: 112,
    home: "Warriors",
    homeAbbr: "GSW",
    homeScore: 118,
    status: "FINAL",
  },
  {
    id: 2,
    away: "Celtics",
    awayAbbr: "BOS",
    awayScore: 104,
    home: "Knicks",
    homeAbbr: "NYK",
    homeScore: 101,
    status: "FINAL",
  },
  {
    id: 3,
    away: "Nuggets",
    awayAbbr: "DEN",
    awayScore: 87,
    home: "Suns",
    homeAbbr: "PHX",
    homeScore: 91,
    status: "Q3 · 04:21",
  },
];

const players = [
  {
    name: "Nikola Jokic",
    team: "DEN",
    ppg: 29.4,
    rpg: 12.8,
    apg: 10.2,
  },
  {
    name: "Luka Doncic",
    team: "LAL",
    ppg: 31.1,
    rpg: 8.5,
    apg: 9.2,
  },
  {
    name: "Shai Gilgeous-Alexander",
    team: "OKC",
    ppg: 32.7,
    rpg: 5.1,
    apg: 6.4,
  },
  {
    name: "Giannis Antetokounmpo",
    team: "MIL",
    ppg: 30.8,
    rpg: 11.9,
    apg: 6.1,
  },
];

const nav = [
  ["Scores", Activity],
  ["Players", Users],
  ["Standings", Trophy],
];

export default function App() {
  const [tab, setTab] = useState("Scores");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      players.filter((player) =>
        `${player.name} ${player.team}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <button
            onClick={() => setTab("Scores")}
            className="flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500 font-black text-slate-950">
              NBA
            </div>

            <div className="text-left">
              <div className="text-lg font-black tracking-tight">
                COURTSIDE
              </div>
              <div className="text-xs text-slate-400">
                Scores & Stats
              </div>
            </div>
          </button>

          <nav className="hidden gap-2 md:flex">
            {nav.map(([label, Icon]) => (
              <button
                key={label}
                onClick={() => setTab(label)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${
                  tab === label
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">

        <section className="mb-8 rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-500 to-red-600 p-7 shadow-2xl md:p-10">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-orange-100">
            <CalendarDays size={16} />
            NBA Dashboard
          </div>

          <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
            Resultados, jugadores y estadísticas.
          </h1>

          <p className="mt-4 max-w-2xl text-orange-50">
            Resultados y estadísticas NBA en un único sitio.
          </p>
        </section>

        {tab === "Scores" && (
          <section>

            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-400">
                  SCOREBOARD
                </p>
                <h2 className="text-2xl font-bold">Partidos</h2>
              </div>

              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-400">
                ● LIVE
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">

              {games.map((game) => (
                <article
                  key={game.id}
                  className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl"
                >
                  <div className="mb-5 text-xs font-bold text-slate-400">
                    {game.status}
                  </div>

                  <div className="space-y-4">

                    {[
                      [game.awayAbbr, game.away, game.awayScore],
                      [game.homeAbbr, game.home, game.homeScore],
                    ].map(([abbr, name, score]) => (
                      <div
                        className="flex items-center gap-3"
                        key={abbr}
                      >
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-800 text-xs font-black">
                          {abbr}
                        </div>

                        <span className="flex-1 font-semibold">
                          {name}
                        </span>

                        <span className="text-2xl font-black">
                          {score}
                        </span>
                      </div>
                    ))}

                  </div>
                </article>
              ))}

            </div>
          </section>
        )}

        {tab === "Players" && (
          <section>

            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

              <div>
                <p className="text-sm font-semibold text-orange-400">
                  PLAYER STATS
                </p>
                <h2 className="text-2xl font-bold">Líderes</h2>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">

                <Search size={18} className="text-slate-400" />

                <input
                  className="w-64 bg-transparent outline-none"
                  placeholder="Buscar jugador o equipo"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />

              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10">

              <table className="w-full text-left">

                <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="p-4">Jugador</th>
                    <th>PTS</th>
                    <th>REB</th>
                    <th>AST</th>
                  </tr>
                </thead>

                <tbody>

                  {filtered.map((player) => (
                    <tr
                      key={player.name}
                      className="border-t border-white/10"
                    >
                      <td className="p-4">
                        <div className="font-bold">
                          {player.name}
                        </div>

                        <div className="text-xs text-slate-500">
                          {player.team}
                        </div>
                      </td>

                      <td className="font-bold">{player.ppg}</td>
                      <td>{player.rpg}</td>
                      <td>{player.apg}</td>
                    </tr>
                  ))}

                </tbody>
              </table>

            </div>
          </section>
        )}

        {tab === "Standings" && (
          <section className="rounded-3xl border border-white/10 bg-slate-900 p-8">

            <p className="text-sm font-semibold text-orange-400">
              STANDINGS
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Clasificación
            </h2>

            <p className="mt-3 text-slate-400">
              Próximamente: clasificación de las conferencias Este y Oeste.
            </p>

          </section>
        )}

      </main>

      <footer className="mx-auto max-w-7xl px-5 py-10 text-xs text-slate-500">
        NBA Scores & Stats
      </footer>

    </div>
  );
}
