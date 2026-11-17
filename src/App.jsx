import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Trophy,
  Activity,
  Users,
  CalendarDays,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const NBA_SCOREBOARD_URL =
  "https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json";

const players = [
  { name: "Nikola Jokic", team: "DEN", ppg: 29.4, rpg: 12.8, apg: 10.2 },
  { name: "Luka Doncic", team: "LAL", ppg: 31.1, rpg: 8.5, apg: 9.2 },
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

function formatGameStatus(game) {
  if (game.gameStatus === 3) {
    return "FINAL";
  }

  if (game.gameStatus === 2) {
    const clock = game.gameClock
      ?.replace("PT", "")
      .replace("M", ":")
      .replace("S", "");

    return `Q${game.period}${clock ? ` · ${clock}` : ""}`;
  }

  if (game.gameStatus === 1) {
    return game.gameStatusText || "PROGRAMADO";
  }

  return game.gameStatusText || "SIN ESTADO";
}

function TeamRow({ team }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-800 text-xs font-black">
        {team.teamTricode}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">
          {team.teamCity} {team.teamName}
        </div>

        <div className="text-xs text-slate-500">
          {team.wins}-{team.losses}
        </div>
      </div>

      <span className="text-2xl font-black">
        {team.score ?? "-"}
      </span>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Scores");
  const [query, setQuery] = useState("");
  const [games, setGames] = useState([]);
  const [gameDate, setGameDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);

  async function loadGames(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(NBA_SCOREBOARD_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setGames(data.scoreboard?.games || []);
      setGameDate(data.scoreboard?.gameDate || "");
      setLastUpdate(new Date());
    } catch (loadError) {
      console.error(loadError);

      setError(
        "No ha sido posible obtener los resultados de NBA.com."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();

    const refreshInterval = window.setInterval(() => {
      loadGames(false);
    }, 60000);

    return () => window.clearInterval(refreshInterval);
  }, []);

  const filteredPlayers = useMemo(
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
            Resultados NBA en directo.
          </h1>

          <p className="mt-4 max-w-2xl text-orange-50">
            Marcadores obtenidos automáticamente desde NBA.com.
          </p>
        </section>

        {tab === "Scores" && (
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-orange-400">
                  SCOREBOARD
                </p>

                <h2 className="text-2xl font-bold">
                  Partidos {gameDate && `· ${gameDate}`}
                </h2>

                {lastUpdate && (
                  <p className="mt-1 text-xs text-slate-500">
                    Actualizado a las{" "}
                    {lastUpdate.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              <button
                onClick={() => loadGames()}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Actualizar
              </button>
            </div>

            {loading && (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
                Cargando partidos reales…
              </div>
            )}

            {!loading && error && (
              <div className="flex items-center gap-3 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {!loading && !error && games.length === 0 && (
              <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
                No hay partidos NBA programados para hoy.
              </div>
            )}

            {!loading && !error && games.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => (
                  <article
                    key={game.gameId}
                    className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          game.gameStatus === 2
                            ? "text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {formatGameStatus(game)}
                      </span>

                      {game.gameStatus === 2 && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">
                          ● LIVE
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <TeamRow team={game.awayTeam} />
                      <TeamRow team={game.homeTeam} />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "Players" && (
          <section>
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-400">
                  PLAYER STATS
                </p>
                <h2 className="text-2xl font-bold">
                  Líderes
                </h2>
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
                  {filteredPlayers.map((player) => (
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

            <p className="mt-3 text-xs text-amber-400">
              Los datos de jugadores siguen siendo provisionales.
            </p>
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
              Próximamente: clasificación real de las conferencias Este y Oeste.
            </p>
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-white/10 bg-slate-950/95 p-2 backdrop-blur md:hidden">
        {nav.map(([label, Icon]) => (
          <button
            key={label}
            onClick={() => setTab(label)}
            className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs ${
              tab === label
                ? "bg-white text-slate-950"
                : "text-slate-400"
            }`}
          >
            <Icon size={19} />
            {label}
          </button>
        ))}
      </nav>

      <footer className="mx-auto max-w-7xl px-5 pb-24 pt-10 text-xs text-slate-500 md:pb-10">
        NBA Scores & Stats
      </footer>
    </div>
  );
}
