import React, { useEffect, useState } from "react";
import {
  Trophy,
  Activity,
  Users,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Clock,
} from "lucide-react";

const NBA_SCOREBOARD_URL =
  `${import.meta.env.BASE_URL}data/scoreboard.json`;

const nav = [
  ["Scores", Activity],
  ["Players", Users],
  ["Standings", Trophy],
];

function formatGameStatus(game) {
  if (game.status?.short === 3) return "FINAL";

  if (game.status?.short === 2) {
    const period = game.periods?.current;

    return `${period ? `Q${period}` : "EN JUEGO"}${
      game.status?.clock ? ` · ${game.status.clock}` : ""
    }`;
  }

  return game.status?.long?.toUpperCase() || "PROGRAMADO";
}

function formatGameTime(game) {
  if (!game.date?.start) return "";

  return new Date(game.date.start).toLocaleTimeString(
    "es-ES",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function TeamLogo({ team, size = "small" }) {
  const sizeClasses =
    size === "large"
      ? "h-20 w-20"
      : "h-12 w-12";

  const imageClasses =
    size === "large"
      ? "h-16 w-16"
      : "h-10 w-10";

  return (
    <div
      className={`grid ${sizeClasses} flex-shrink-0 place-items-center rounded-2xl bg-white p-2`}
    >
      {team?.logo ? (
        <img
          src={team.logo}
          alt={team.name}
          className={`${imageClasses} object-contain`}
        />
      ) : (
        <span className="font-black text-slate-900">
          {team?.code}
        </span>
      )}
    </div>
  );
}

function TeamRow({ team, score, winner }) {
  return (
    <div className="flex items-center gap-3">
      <TeamLogo team={team} />

      <div className="min-w-0 flex-1">
        <div
          className={`truncate ${
            winner
              ? "font-black text-white"
              : "font-semibold text-slate-300"
          }`}
        >
          {team?.name}
        </div>

        <div className="text-xs text-slate-500">
          {team?.code}
        </div>
      </div>

      <span
        className={`text-2xl ${
          winner
            ? "font-black text-white"
            : "font-bold text-slate-400"
        }`}
      >
        {score?.points ?? "-"}
      </span>
    </div>
  );
}

function GameDetail({ game, onBack }) {
  const visitors = game.teams?.visitors;
  const home = game.teams?.home;

  const visitorsScore = game.scores?.visitors;
  const homeScore = game.scores?.home;

  const visitorsLines =
    visitorsScore?.linescore || [];

  const homeLines =
    homeScore?.linescore || [];

  const maxPeriods = Math.max(
    visitorsLines.length,
    homeLines.length,
    4
  );

  const periods = Array.from(
    { length: maxPeriods },
    (_, index) => index
  );

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/15"
      >
        <ArrowLeft size={18} />
        Partidos
      </button>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 px-5 py-6 text-center">
          <div className="text-sm font-black tracking-widest text-orange-100">
            {formatGameStatus(game)}
          </div>

          {game.status?.short !== 3 && (
            <div className="mt-1 text-sm text-orange-100">
              {formatGameTime(game)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-8 md:px-8">
          <div className="flex min-w-0 flex-col items-center text-center">
            <TeamLogo
              team={visitors}
              size="large"
            />

            <div className="mt-3 min-h-12 font-bold">
              {visitors?.name}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              VISITANTE
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <span className="text-4xl font-black sm:text-5xl">
              {visitorsScore?.points ?? "-"}
            </span>

            <span className="text-xl text-slate-600">
              -
            </span>

            <span className="text-4xl font-black sm:text-5xl">
              {homeScore?.points ?? "-"}
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-center text-center">
            <TeamLogo
              team={home}
              size="large"
            />

            <div className="mt-3 min-h-12 font-bold">
              {home?.name}
            </div>

            <div className="mt-1 text-xs text-slate-500">
              LOCAL
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 p-5">
          <h3 className="mb-4 text-lg font-black">
            Marcador por cuartos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-center">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th className="pb-3 text-left">
                    EQUIPO
                  </th>

                  {periods.map((period) => (
                    <th
                      key={period}
                      className="pb-3"
                    >
                      {period < 4
                        ? `Q${period + 1}`
                        : `OT${period - 3}`}
                    </th>
                  ))}

                  <th className="pb-3 text-orange-400">
                    TOTAL
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-white/10">
                  <td className="py-4 text-left font-black">
                    {visitors?.code}
                  </td>

                  {periods.map((period) => (
                    <td
                      key={period}
                      className="py-4"
                    >
                      {visitorsLines[period] ?? "-"}
                    </td>
                  ))}

                  <td className="py-4 font-black">
                    {visitorsScore?.points ?? "-"}
                  </td>
                </tr>

                <tr className="border-t border-white/10">
                  <td className="py-4 text-left font-black">
                    {home?.code}
                  </td>

                  {periods.map((period) => (
                    <td
                      key={period}
                      className="py-4"
                    >
                      {homeLines[period] ?? "-"}
                    </td>
                  ))}

                  <td className="py-4 font-black">
                    {homeScore?.points ?? "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-white/10 p-5">
          <h3 className="mb-4 text-lg font-black">
            Información
          </h3>

          <div className="space-y-4">
            {game.arena?.name && (
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-0.5 text-orange-400"
                />

                <div>
                  <div className="font-semibold">
                    {game.arena.name}
                  </div>

                  <div className="text-sm text-slate-500">
                    {game.arena.city}
                    {game.arena.state
                      ? `, ${game.arena.state}`
                      : ""}
                  </div>
                </div>
              </div>
            )}

            {game.date?.start && (
              <div className="flex items-start gap-3">
                <Clock
                  size={20}
                  className="mt-0.5 text-orange-400"
                />

                <div>
                  <div className="font-semibold">
                    Fecha y hora
                  </div>

                  <div className="text-sm text-slate-500">
                    {new Date(
                      game.date.start
                    ).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] =
    useState("Scores");

  const [games, setGames] =
    useState([]);

  const [gameDate, setGameDate] =
    useState("");

  const [selectedGame, setSelectedGame] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdate, setLastUpdate] =
    useState(null);

  async function loadGames(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${NBA_SCOREBOARD_URL}?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data.response)) {
        throw new Error(
          "Formato de datos NBA no válido"
        );
      }

      setGames(data.response);

      setGameDate(
        data.parameters?.date || ""
      );

      setLastUpdate(new Date());
    } catch (loadError) {
      console.error(loadError);

      setError(
        "No ha sido posible cargar los resultados NBA."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGames();

    const refreshInterval =
      window.setInterval(() => {
        loadGames(false);
      }, 60000);

    return () =>
      window.clearInterval(
        refreshInterval
      );
  }, []);

  function openGame(game) {
    setSelectedGame(game);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeGame() {
    setSelectedGame(null);
  }

  function changeTab(newTab) {
    setSelectedGame(null);
    setTab(newTab);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() =>
              changeTab("Scores")
            }
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
                onClick={() =>
                  changeTab(label)
                }
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
        {selectedGame ? (
          <GameDetail
            game={selectedGame}
            onBack={closeGame}
          />
        ) : (
          <>
            <section className="mb-8 rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-500 to-red-600 p-7 shadow-2xl md:p-10">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-orange-100">
                <CalendarDays size={16} />
                NBA Dashboard
              </div>

              <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                Resultados NBA.
              </h1>

              <p className="mt-4 max-w-2xl text-orange-50">
                Partidos, resultados y
                estadísticas en COURTSIDE.
              </p>
            </section>

            {tab === "Scores" && (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-orange-400">
                      SCOREBOARD
                    </p>

                    <h2 className="text-2xl font-bold">
                      Partidos
                    </h2>

                    {gameDate && (
                      <p className="mt-1 text-sm text-slate-400">
                        {gameDate}
                      </p>
                    )}

                    {lastUpdate && (
                      <p className="mt-1 text-xs text-slate-500">
                        Cargado a las{" "}
                        {lastUpdate.toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      loadGames()
                    }
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/15 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Actualizar
                  </button>
                </div>

                {loading && (
                  <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
                    Cargando partidos NBA...
                  </div>
                )}

                {!loading && error && (
                  <div className="flex items-center gap-3 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 text-red-200">
                    <AlertCircle size={20} />
                    {error}
                  </div>
                )}

                {!loading &&
                  !error &&
                  games.length === 0 && (
                    <div className="rounded-3xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">
                      No hay partidos NBA
                      disponibles para esta fecha.
                    </div>
                  )}

                {!loading &&
                  !error &&
                  games.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {games.map((game) => {
                        const visitorsPoints =
                          game.scores?.visitors
                            ?.points;

                        const homePoints =
                          game.scores?.home
                            ?.points;

                        const finished =
                          game.status?.short === 3;

                        const visitorsWinner =
                          finished &&
                          visitorsPoints >
                            homePoints;

                        const homeWinner =
                          finished &&
                          homePoints >
                            visitorsPoints;

                        return (
                          <button
                            key={game.id}
                            onClick={() =>
                              openGame(game)
                            }
                            className="rounded-3xl border border-white/10 bg-slate-900 p-5 text-left shadow-xl transition hover:border-orange-500/50 hover:bg-slate-800"
                          >
                            <div className="mb-5 flex items-start justify-between gap-4">
                              <div>
                                <div
                                  className={`text-xs font-bold ${
                                    game.status
                                      ?.short ===
                                    2
                                      ? "text-emerald-400"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {formatGameStatus(
                                    game
                                  )}
                                </div>

                                {game.status
                                  ?.short !==
                                  3 && (
                                  <div className="mt-1 text-xs text-slate-500">
                                    {formatGameTime(
                                      game
                                    )}
                                  </div>
                                )}
                              </div>

                              {game.status
                                ?.short ===
                                2 && (
                                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-bold text-emerald-400">
                                  ● LIVE
                                </span>
                              )}
                            </div>

                            <div className="space-y-4">
                              <TeamRow
                                team={
                                  game.teams
                                    ?.visitors
                                }
                                score={
                                  game.scores
                                    ?.visitors
                                }
                                winner={
                                  visitorsWinner
                                }
                              />

                              <TeamRow
                                team={
                                  game.teams
                                    ?.home
                                }
                                score={
                                  game.scores
                                    ?.home
                                }
                                winner={
                                  homeWinner
                                }
                              />
                            </div>

                            {game.arena?.name && (
                              <div className="mt-5 border-t border-white/10 pt-4">
                                <p className="truncate text-xs text-slate-500">
                                  {
                                    game.arena
                                      .name
                                  }
                                  {game.arena
                                    .city
                                    ? ` · ${game.arena.city}`
                                    : ""}
                                </p>
                              </div>
                            )}

                            <div className="mt-4 text-right text-xs font-bold text-orange-400">
                              Ver partido →
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
              </section>
            )}

            {tab === "Players" && (
              <section className="rounded-3xl border border-white/10 bg-slate-900 p-8">
                <p className="text-sm font-semibold text-orange-400">
                  PLAYERS
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  Jugadores
                </h2>

                <p className="mt-3 text-slate-400">
                  Próximamente: estadísticas
                  reales de jugadores.
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
                  Próximamente: clasificación
                  real de las conferencias Este
                  y Oeste.
                </p>
              </section>
            )}
          </>
        )}
      </main>

      {!selectedGame && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-white/10 bg-slate-950/95 p-2 backdrop-blur md:hidden">
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() =>
                changeTab(label)
              }
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
      )}

      <footer className="mx-auto max-w-7xl px-5 pb-24 pt-10 text-xs text-slate-500 md:pb-10">
        COURTSIDE · NBA Scores & Stats
      </footer>
    </div>
  );
}
