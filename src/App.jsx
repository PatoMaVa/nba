import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Flag,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Clock,
} from "lucide-react";

const NBA_SCOREBOARD_URL =
  `${import.meta.env.BASE_URL}data/scoreboard.json`;

const PLAYER_STATS_URL =
  `${import.meta.env.BASE_URL}data/player-stats.json`;
const NBA_TEAM_IDS = {
  ATL: 1610612737,
  BOS: 1610612738,
  BKN: 1610612751,
  CHA: 1610612766,
  CHI: 1610612741,
  CLE: 1610612739,
  DAL: 1610612742,
  DEN: 1610612743,
  DET: 1610612765,
  GSW: 1610612744,
  HOU: 1610612745,
  IND: 1610612754,
  LAC: 1610612746,
  LAL: 1610612747,
  MEM: 1610612763,
  MIA: 1610612748,
  MIL: 1610612749,
  MIN: 1610612750,
  NOP: 1610612740,
  NYK: 1610612752,
  OKC: 1610612760,
  ORL: 1610612753,
  PHI: 1610612755,
  PHX: 1610612756,
  POR: 1610612757,
  SAC: 1610612758,
  SAS: 1610612759,
  TOR: 1610612761,
  UTA: 1610612762,
  WAS: 1610612764,
};

function getTeamLogo(team) {
  const teamId =
    NBA_TEAM_IDS[team?.code];

  if (!teamId) {
    return team?.logo || "";
  }

  return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
}

const nav = [
  ["Scores", Activity],
  ["Spanish", Flag],
];

const SPANISH_PLAYERS = [
  {
    firstname: "Santi",
    lastname: "Aldama",
  },
  {
    firstname: "Sergio",
    lastname: "De Larrea",
  },
  {
    firstname: "Hugo",
    lastname: "Gonzalez",
  },
  {
    firstname: "Aday",
    lastname: "Mara",
  },
  {
    firstname: "Baba",
    lastname: "Miller",
  },
];

function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function findSpanishPlayer(player) {
  const firstname =
    normalizeText(player?.firstname);

  const lastname =
    normalizeText(player?.lastname);

  return SPANISH_PLAYERS.find(
    (spanishPlayer) => {
      const spanishFirstname =
        normalizeText(
          spanishPlayer.firstname
        );

      const spanishLastname =
        normalizeText(
          spanishPlayer.lastname
        );

      const normalOrder =
        firstname === spanishFirstname &&
        lastname === spanishLastname;

      const reversedOrder =
        firstname === spanishLastname &&
        lastname === spanishFirstname;

      return normalOrder || reversedOrder;
    }
  );
}

function isSpanishPlayer(player) {
  return Boolean(
    findSpanishPlayer(player)
  );
}

function getSpanishPlayerDisplayName(
  player
) {
  const matchedPlayer =
    findSpanishPlayer(player);

  if (matchedPlayer) {
    return `${matchedPlayer.firstname} ${matchedPlayer.lastname}`;
  }

  return `${player?.firstname || ""} ${
    player?.lastname || ""
  }`.trim();
}

function formatGameStatus(game) {
  if (game.status?.short === 3) {
    return "FINAL";
  }

  if (game.status?.short === 2) {
    const period =
      game.periods?.current;

    return `${period ? `Q${period}` : "EN JUEGO"}${
      game.status?.clock
        ? ` · ${game.status.clock}`
        : ""
    }`;
  }

  return (
    game.status?.long?.toUpperCase() ||
    "PROGRAMADO"
  );
}

function formatGameTime(game) {
  if (!game.date?.start) {
    return "";
  }

  return new Date(
    game.date.start
  ).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamLogo({
  team,
  size = "small",
}) {
  const [logoError, setLogoError] =
    useState(false);

  const containerSize =
    size === "large"
      ? "h-20 w-20"
      : "h-12 w-12";

  const imageSize =
    size === "large"
      ? "h-16 w-16"
      : "h-10 w-10";

  const logoUrl =
    getTeamLogo(team);

  useEffect(() => {
    setLogoError(false);
  }, [team?.code]);

  return (
    <div
      className={`grid ${containerSize} flex-shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm`}
    >
      {logoUrl && !logoError ? (
        <img
          src={logoUrl}
          alt={team?.name || team?.code || "NBA"}
          className={`${imageSize} object-contain`}
          loading="lazy"
          onError={() =>
            setLogoError(true)
          }
        />
      ) : (
        <span className="text-sm font-black text-slate-900">
          {team?.code || "NBA"}
        </span>
      )}
    </div>
  );
}

function TeamRow({
  team,
  score,
  winner,
}) {
  return (
    <div className="flex items-center gap-3">
      <TeamLogo team={team} />

      <div className="min-w-0 flex-1">
        <div
          className={`truncate ${
            winner
              ? "font-black text-slate-950"
              : "font-semibold text-slate-700"
          }`}
        >
          {team?.name}
        </div>

        <div className="text-xs text-slate-400">
          {team?.code}
        </div>
      </div>

      <span
        className={`text-2xl ${
          winner
            ? "font-black text-slate-950"
            : "font-bold text-slate-500"
        }`}
      >
        {score?.points ?? "-"}
      </span>
    </div>
  );
}

function PlayerStatsTable({
  team,
  playerStats,
}) {
  const teamPlayers =
    playerStats
      .filter(
        (stat) =>
          stat.team?.id === team?.id
      )
      .sort((a, b) => {
        const minutesA =
          Number(a.min || 0);

        const minutesB =
          Number(b.min || 0);

        return minutesB - minutesA;
      });

  if (teamPlayers.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <TeamLogo team={team} />

        <div>
          <div className="font-black text-slate-950">
            {team?.name}
          </div>

          <div className="text-xs text-slate-400">
            {teamPlayers.length} jugadores
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] text-right text-sm">
          <thead className="bg-slate-100 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3 text-left">
                Jugador
              </th>

              <th className="p-3">
                MIN
              </th>

              <th className="p-3 text-orange-600">
                PTS
              </th>

              <th className="p-3">
                REB
              </th>

              <th className="p-3">
                AST
              </th>

              <th className="p-3">
                ROB
              </th>

              <th className="p-3">
                TAP
              </th>

              <th className="p-3">
                TC
              </th>

              <th className="p-3">
                3PT
              </th>

              <th className="p-3">
                TL
              </th>

              <th className="p-3">
                PERD
              </th>

              <th className="p-3">
                FALT
              </th>

              <th className="p-3">
                +/-
              </th>
            </tr>
          </thead>

          <tbody className="text-slate-700">
            {teamPlayers.map(
              (stat) => (
                <tr
                  key={
                    stat.player?.id
                  }
                  className="border-t border-slate-200"
                >
                  <td className="whitespace-nowrap p-3 text-left">
                    <div className="font-bold text-slate-950">
                      {
                        stat.player
                          ?.firstname
                      }{" "}
                      {
                        stat.player
                          ?.lastname
                      }
                    </div>

                    <div className="text-xs text-slate-400">
                      {stat.pos || "-"}
                    </div>
                  </td>

                  <td className="p-3">
                    {stat.min ?? "-"}
                  </td>

                  <td className="p-3 font-black text-orange-600">
                    {stat.points ?? 0}
                  </td>

                  <td className="p-3">
                    {stat.totReb ?? 0}
                  </td>

                  <td className="p-3">
                    {stat.assists ?? 0}
                  </td>

                  <td className="p-3">
                    {stat.steals ?? 0}
                  </td>

                  <td className="p-3">
                    {stat.blocks ?? 0}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {stat.fgm ?? 0}/
                    {stat.fga ?? 0}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {stat.tpm ?? 0}/
                    {stat.tpa ?? 0}
                  </td>

                  <td className="whitespace-nowrap p-3">
                    {stat.ftm ?? 0}/
                    {stat.fta ?? 0}
                  </td>

                  <td className="p-3">
                    {stat.turnovers ?? 0}
                  </td>

                  <td className="p-3">
                    {stat.pFouls ?? 0}
                  </td>

                  <td
                    className={`p-3 font-semibold ${
                      String(
                        stat.plusMinus ||
                          ""
                      ).startsWith("+")
                        ? "text-emerald-600"
                        : String(
                            stat.plusMinus ||
                              ""
                          ).startsWith("-")
                        ? "text-red-600"
                        : "text-slate-500"
                    }`}
                  >
                    {stat.plusMinus ?? "-"}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SpanishPerformanceCard({
  stat,
}) {
  const playerName =
    getSpanishPlayerDisplayName(
      stat.player
    );

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <TeamLogo team={stat.team} />

        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-slate-950">
            {playerName}
          </h3>

          <p className="text-sm text-slate-500">
            {stat.team?.name}

            {stat.pos
              ? ` · ${stat.pos}`
              : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          [
            "MIN",
            stat.min ?? "-",
          ],
          [
            "PTS",
            stat.points ?? 0,
          ],
          [
            "REB",
            stat.totReb ?? 0,
          ],
          [
            "AST",
            stat.assists ?? 0,
          ],
        ].map(
          ([label, value]) => (
            <div
              key={label}
              className="rounded-2xl bg-slate-100 p-3 text-center"
            >
              <div className="text-xl font-black text-slate-950">
                {value}
              </div>

              <div className="mt-1 text-[10px] font-bold text-slate-400">
                {label}
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl border border-slate-200 p-2">
          <strong className="text-slate-950">
            {stat.fgm ?? 0}/
            {stat.fga ?? 0}
          </strong>

          <div className="text-xs text-slate-400">
            TC
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-2">
          <strong className="text-slate-950">
            {stat.tpm ?? 0}/
            {stat.tpa ?? 0}
          </strong>

          <div className="text-xs text-slate-400">
            3PT
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-2">
          <strong
            className={
              String(
                stat.plusMinus || ""
              ).startsWith("+")
                ? "text-emerald-600"
                : String(
                    stat.plusMinus || ""
                  ).startsWith("-")
                ? "text-red-600"
                : "text-slate-950"
            }
          >
            {stat.plusMinus ?? "-"}
          </strong>

          <div className="text-xs text-slate-400">
            +/-
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-200 pt-4 text-center">
        {[
          [
            "ROB",
            stat.steals ?? 0,
          ],
          [
            "TAP",
            stat.blocks ?? 0,
          ],
          [
            "PERD",
            stat.turnovers ?? 0,
          ],
          [
            "FALT",
            stat.pFouls ?? 0,
          ],
        ].map(
          ([label, value]) => (
            <div key={label}>
              <div className="font-black text-slate-950">
                {value}
              </div>

              <div className="text-[10px] font-bold text-slate-400">
                {label}
              </div>
            </div>
          )
        )}
      </div>
    </article>
  );
}

function GameDetail({
  game,
  onBack,
  playerStats,
  statsLoading,
  statsError,
}) {
  const visitors =
    game.teams?.visitors;

  const home =
    game.teams?.home;

  const visitorsScore =
    game.scores?.visitors;

  const homeScore =
    game.scores?.home;

  const visitorsLines =
    visitorsScore?.linescore ||
    [];

  const homeLines =
    homeScore?.linescore ||
    [];

  const maxPeriods =
    Math.max(
      visitorsLines.length,
      homeLines.length,
      4
    );

  const periods =
    Array.from(
      {
        length: maxPeriods,
      },
      (_, index) => index
    );

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
      >
        <ArrowLeft size={18} />
        Partidos
      </button>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 px-5 py-6 text-center">
          <div className="text-sm font-black tracking-widest text-white">
            {formatGameStatus(
              game
            )}
          </div>

          {game.status?.short !==
            3 && (
            <div className="mt-1 text-sm text-orange-100">
              {formatGameTime(
                game
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-8 md:px-8">
          <div className="flex min-w-0 flex-col items-center text-center">
            <TeamLogo
              team={visitors}
              size="large"
            />

            <div className="mt-3 min-h-12 font-bold text-slate-950">
              {visitors?.name}
            </div>

            <div className="mt-1 text-xs text-slate-400">
              VISITANTE
            </div>
          </div>

          <div className="flex items-center gap-3 px-1">
            <span className="text-4xl font-black text-slate-950 sm:text-5xl">
              {visitorsScore?.points ??
                "-"}
            </span>

            <span className="text-xl text-slate-300">
              -
            </span>

            <span className="text-4xl font-black text-slate-950 sm:text-5xl">
              {homeScore?.points ??
                "-"}
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-center text-center">
            <TeamLogo
              team={home}
              size="large"
            />

            <div className="mt-3 min-h-12 font-bold text-slate-950">
              {home?.name}
            </div>

            <div className="mt-1 text-xs text-slate-400">
              LOCAL
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <h3 className="mb-4 text-lg font-black text-slate-950">
            Marcador por cuartos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-center text-slate-700">
              <thead>
                <tr className="text-xs text-slate-400">
                  <th className="pb-3 text-left">
                    EQUIPO
                  </th>

                  {periods.map(
                    (period) => (
                      <th
                        key={period}
                        className="pb-3"
                      >
                        {period < 4
                          ? `Q${
                              period +
                              1
                            }`
                          : `OT${
                              period -
                              3
                            }`}
                      </th>
                    )
                  )}

                  <th className="pb-3 text-orange-600">
                    TOTAL
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="py-4 text-left font-black text-slate-950">
                    {visitors?.code}
                  </td>

                  {periods.map(
                    (period) => (
                      <td
                        key={period}
                        className="py-4"
                      >
                        {visitorsLines[
                          period
                        ] ?? "-"}
                      </td>
                    )
                  )}

                  <td className="py-4 font-black text-slate-950">
                    {visitorsScore?.points ??
                      "-"}
                  </td>
                </tr>

                <tr className="border-t border-slate-200">
                  <td className="py-4 text-left font-black text-slate-950">
                    {home?.code}
                  </td>

                  {periods.map(
                    (period) => (
                      <td
                        key={period}
                        className="py-4"
                      >
                        {homeLines[
                          period
                        ] ?? "-"}
                      </td>
                    )
                  )}

                  <td className="py-4 font-black text-slate-950">
                    {homeScore?.points ??
                      "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <h3 className="mb-4 text-lg font-black text-slate-950">
            Información
          </h3>

          <div className="space-y-4">
            {game.arena?.name && (
              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-0.5 text-orange-500"
                />

                <div>
                  <div className="font-semibold text-slate-950">
                    {
                      game.arena
                        .name
                    }
                  </div>

                  <div className="text-sm text-slate-500">
                    {
                      game.arena
                        .city
                    }

                    {game.arena
                      .state
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
                  className="mt-0.5 text-orange-500"
                />

                <div>
                  <div className="font-semibold text-slate-950">
                    Fecha y hora
                  </div>

                  <div className="text-sm text-slate-500">
                    {new Date(
                      game.date
                        .start
                    ).toLocaleString(
                      "es-ES",
                      {
                        day: "2-digit",
                        month:
                          "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute:
                          "2-digit",
                      }
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <div className="mb-5">
            <p className="text-sm font-semibold text-orange-600">
              BOX SCORE
            </p>

            <h3 className="text-xl font-black text-slate-950">
              Estadísticas del partido
            </h3>
          </div>

          {statsLoading && (
            <div className="rounded-2xl bg-slate-100 p-6 text-center text-sm text-slate-500">
              Cargando estadísticas...
            </div>
          )}

          {!statsLoading &&
            statsError && (
              <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                <AlertCircle
                  size={19}
                />

                {statsError}
              </div>
            )}

          {!statsLoading &&
            !statsError &&
            playerStats.length ===
              0 && (
              <div className="rounded-2xl bg-slate-100 p-6 text-center text-sm text-slate-500">
                Estadísticas individuales todavía no disponibles para este partido.
              </div>
            )}

          {!statsLoading &&
            !statsError &&
            playerStats.length >
              0 && (
              <div className="space-y-8">
                <PlayerStatsTable
                  team={
                    visitors
                  }
                  playerStats={
                    playerStats
                  }
                />

                <PlayerStatsTable
                  team={home}
                  playerStats={
                    playerStats
                  }
                />
              </div>
            )}
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

  const [
    gameDate,
    setGameDate,
  ] =
    useState("");

  const [
    selectedGame,
    setSelectedGame,
  ] =
    useState(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    lastUpdate,
    setLastUpdate,
  ] =
    useState(null);

  const [
    playerStats,
    setPlayerStats,
  ] =
    useState([]);

  const [
    statsLoading,
    setStatsLoading,
  ] =
    useState(false);

  const [
    statsError,
    setStatsError,
  ] =
    useState("");

  const [
    allPlayerStats,
    setAllPlayerStats,
  ] =
    useState([]);

  const [
    spanishLoading,
    setSpanishLoading,
  ] =
    useState(true);

  const [
    spanishError,
    setSpanishError,
  ] =
    useState("");

  async function loadGames(
    showLoader = true
  ) {
    if (showLoader) {
      setLoading(true);
    }

    setError("");

    try {
      const response =
        await fetch(
          `${NBA_SCOREBOARD_URL}?t=${Date.now()}`,
          {
            cache:
              "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${
            response.status
          }`
        );
      }

      const data =
        await response.json();

      if (
        !Array.isArray(
          data.response
        )
      ) {
        throw new Error(
          "Formato de datos NBA no válido"
        );
      }

      setGames(
        data.response
      );

      setGameDate(
        data.parameters
          ?.date || ""
      );

      setLastUpdate(
        new Date()
      );
    } catch (loadError) {
      console.error(
        loadError
      );

      setError(
        "No ha sido posible cargar los resultados NBA."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAllPlayerStats(
    showLoader = true
  ) {
    if (showLoader) {
      setSpanishLoading(
        true
      );
    }

    setSpanishError("");

    try {
      const response =
        await fetch(
          `${PLAYER_STATS_URL}?t=${Date.now()}`,
          {
            cache:
              "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${
            response.status
          }`
        );
      }

      const data =
        await response.json();

      const gamesData =
        data.games || {};

      const stats =
        Object.values(
          gamesData
        ).flatMap(
          (game) =>
            Array.isArray(
              game?.response
            )
              ? game.response
              : []
        );

      setAllPlayerStats(
        stats
      );
    } catch (
      loadError
    ) {
      console.error(
        "Error cargando actuaciones españolas:",
        loadError
      );

      setAllPlayerStats(
        []
      );

      setSpanishError(
        "No ha sido posible cargar las actuaciones de los jugadores españoles."
      );
    } finally {
      setSpanishLoading(
        false
      );
    }
  }

  useEffect(() => {
    loadGames();
    loadAllPlayerStats();

    const refreshInterval =
      window.setInterval(
        () => {
          loadGames(false);

          loadAllPlayerStats(
            false
          );
        },
        60000
      );

    return () => {
      window.clearInterval(
        refreshInterval
      );
    };
  }, []);

  const spanishPerformances =
    useMemo(() => {
      return allPlayerStats
        .filter(
          (stat) =>
            isSpanishPlayer(
              stat.player
            )
        )
        .sort((a, b) => {
          const pointsDifference =
            Number(
              b.points ||
                0
            ) -
            Number(
              a.points ||
                0
            );

          if (
            pointsDifference !==
            0
          ) {
            return pointsDifference;
          }

          return (
            Number(
              b.min || 0
            ) -
            Number(
              a.min || 0
            )
          );
        });
    }, [allPlayerStats]);

  async function openGame(
    game
  ) {
    setSelectedGame(
      game
    );

    setPlayerStats([]);

    setStatsError("");

    setStatsLoading(
      true
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    try {
      const response =
        await fetch(
          `${PLAYER_STATS_URL}?t=${Date.now()}`,
          {
            cache:
              "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${
            response.status
          }`
        );
      }

      const data =
        await response.json();

      const gameStatistics =
        data.games?.[
          String(game.id)
        ];

      setPlayerStats(
        Array.isArray(
          gameStatistics
            ?.response
        )
          ? gameStatistics.response
          : []
      );
    } catch (
      statsLoadError
    ) {
      console.error(
        "Error cargando estadísticas:",
        statsLoadError
      );

      setPlayerStats([]);

      setStatsError(
        "No ha sido posible cargar las estadísticas del partido."
      );
    } finally {
      setStatsLoading(
        false
      );
    }
  }

  function closeGame() {
    setSelectedGame(null);

    setPlayerStats([]);

    setStatsError("");

    setStatsLoading(
      false
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function changeTab(
    newTab
  ) {
    setSelectedGame(null);

    setPlayerStats([]);

    setStatsError("");

    setTab(newTab);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function refreshCurrentSection() {
    if (
      tab === "Spanish"
    ) {
      loadAllPlayerStats();
    } else {
      loadGames();
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <button
            onClick={() =>
              changeTab(
                "Scores"
              )
            }
            className="flex items-center gap-3"
          >
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500 font-black text-white">
              ÑBA
            </div>

            <div className="text-left">
              <div className="text-lg font-black tracking-tight text-slate-950">
                ÑBA
              </div>

              <div className="text-xs text-slate-500">
                Resultados y españoles
              </div>
            </div>
          </button>

          <nav className="hidden gap-2 md:flex">
            {nav.map(
              ([
                label,
                Icon,
              ]) => (
                <button
                  key={
                    label
                  }
                  onClick={() =>
                    changeTab(
                      label
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm ${
                    tab ===
                    label
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Icon
                    size={
                      16
                    }
                  />

                  {label ===
                  "Scores"
                    ? "Partidos"
                    : "Españoles"}
                </button>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        {selectedGame ? (
          <GameDetail
            game={
              selectedGame
            }
            onBack={
              closeGame
            }
            playerStats={
              playerStats
            }
            statsLoading={
              statsLoading
            }
            statsError={
              statsError
            }
          />
        ) : (
          <>
            <section className="mb-8 rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-500 to-red-500 p-7 text-white shadow-lg md:p-10">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-orange-100">
                <CalendarDays
                  size={16}
                />
                ÑBA
              </div>

              <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                Baloncesto con Ñ.
              </h1>

              <p className="mt-4 max-w-2xl text-orange-50">
                Partidos NBA y actuaciones de los jugadores españoles.
              </p>
            </section>

            {tab ===
              "Scores" && (
              <section>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-orange-600">
                      SCOREBOARD
                    </p>

                    <h2 className="text-2xl font-bold text-slate-950">
                      Partidos
                    </h2>

                    {gameDate && (
                      <p className="mt-1 text-sm text-slate-500">
                        {
                          gameDate
                        }
                      </p>
                    )}

                    {lastUpdate && (
                      <p className="mt-1 text-xs text-slate-400">
                        Cargado a las{" "}
                        {lastUpdate.toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute:
                              "2-digit",
                          }
                        )}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={
                      refreshCurrentSection
                    }
                    disabled={
                      loading
                    }
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={
                        16
                      }
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
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                    Cargando partidos NBA...
                  </div>
                )}

                {!loading &&
                  error && (
                    <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
                      <AlertCircle
                        size={
                          20
                        }
                      />
                      {
                        error
                      }
                    </div>
                  )}

                {!loading &&
                  !error &&
                  games.length ===
                    0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                      No hay partidos NBA disponibles para esta fecha.
                    </div>
                  )}

                {!loading &&
                  !error &&
                  games.length >
                    0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {games.map(
                        (
                          game
                        ) => {
                          const visitorsPoints =
                            game
                              .scores
                              ?.visitors
                              ?.points;

                          const homePoints =
                            game
                              .scores
                              ?.home
                              ?.points;

                          const finished =
                            game
                              .status
                              ?.short ===
                            3;

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
                              key={
                                game.id
                              }
                              onClick={() =>
                                openGame(
                                  game
                                )
                              }
                              className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-orange-300 hover:shadow-md"
                            >
                              <div className="mb-5 flex items-start justify-between gap-4">
                                <div>
                                  <div
                                    className={`text-xs font-bold ${
                                      game
                                        .status
                                        ?.short ===
                                      2
                                        ? "text-emerald-600"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    {formatGameStatus(
                                      game
                                    )}
                                  </div>

                                  {game
                                    .status
                                    ?.short !==
                                    3 && (
                                    <div className="mt-1 text-xs text-slate-400">
                                      {formatGameTime(
                                        game
                                      )}
                                    </div>
                                  )}
                                </div>

                                {game
                                  .status
                                  ?.short ===
                                  2 && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                                    ● LIVE
                                  </span>
                                )}
                              </div>

                              <div className="space-y-4">
                                <TeamRow
                                  team={
                                    game
                                      .teams
                                      ?.visitors
                                  }
                                  score={
                                    game
                                      .scores
                                      ?.visitors
                                  }
                                  winner={
                                    visitorsWinner
                                  }
                                />

                                <TeamRow
                                  team={
                                    game
                                      .teams
                                      ?.home
                                  }
                                  score={
                                    game
                                      .scores
                                      ?.home
                                  }
                                  winner={
                                    homeWinner
                                  }
                                />
                              </div>

                              {game
                                .arena
                                ?.name && (
                                <div className="mt-5 border-t border-slate-200 pt-4">
                                  <p className="truncate text-xs text-slate-400">
                                    {
                                      game
                                        .arena
                                        .name
                                    }

                                    {game
                                      .arena
                                      .city
                                      ? ` · ${game.arena.city}`
                                      : ""}
                                  </p>
                                </div>
                              )}

                              <div className="mt-4 text-right text-xs font-bold text-orange-600">
                                Ver partido →
                              </div>
                            </button>
                          );
                        }
                      )}
                    </div>
                  )}
              </section>
            )}

            {tab ===
              "Spanish" && (
              <section>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-orange-600">
                      ÑBA
                    </p>

                    <h2 className="text-2xl font-black text-slate-950">
                      Españoles en la NBA
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Actuaciones registradas en los box scores disponibles del día.
                    </p>
                  </div>

                  <button
                    onClick={
                      refreshCurrentSection
                    }
                    disabled={
                      spanishLoading
                    }
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={
                        16
                      }
                      className={
                        spanishLoading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Actualizar
                  </button>
                </div>

                {spanishLoading && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                    Cargando actuaciones...
                  </div>
                )}

                {!spanishLoading &&
                  spanishError && (
                    <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700">
                      <AlertCircle
                        size={
                          20
                        }
                      />

                      {
                        spanishError
                      }
                    </div>
                  )}

                {!spanishLoading &&
                  !spanishError &&
                  spanishPerformances.length ===
                    0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                      <Flag
                        size={
                          32
                        }
                        className="mx-auto mb-3 text-orange-500"
                      />

                      <h3 className="font-black text-slate-950">
                        Sin actuaciones españolas
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Ningún jugador español aparece en los box scores disponibles del día.
                      </p>
                    </div>
                  )}

                {!spanishLoading &&
                  !spanishError &&
                  spanishPerformances.length >
                    0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {spanishPerformances.map(
                        (
                          stat
                        ) => (
                          <SpanishPerformanceCard
                            key={`${stat.game?.id}-${stat.player?.id}`}
                            stat={
                              stat
                            }
                          />
                        )
                      )}
                    </div>
                  )}
              </section>
            )}
          </>
        )}
      </main>

      {!selectedGame && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-2 border-t border-slate-200 bg-white/95 p-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur md:hidden">
          {nav.map(
            ([
              label,
              Icon,
            ]) => (
              <button
                key={
                  label
                }
                onClick={() =>
                  changeTab(
                    label
                  )
                }
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs ${
                  tab ===
                  label
                    ? "bg-slate-950 text-white"
                    : "text-slate-500"
                }`}
              >
                <Icon
                  size={
                    19
                  }
                />

                {label ===
                "Scores"
                  ? "Partidos"
                  : "Españoles"}
              </button>
            )
          )}
        </nav>
      )}

      <footer className="mx-auto max-w-7xl px-5 pb-24 pt-10 text-xs text-slate-400 md:pb-10">
        ÑBA · Resultados y jugadores españoles
      </footer>
    </div>
  );
}
