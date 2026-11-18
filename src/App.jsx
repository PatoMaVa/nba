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
  ChevronRight,
  UserRound,
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
        normalizeText(spanishPlayer.firstname);

      const spanishLastname =
        normalizeText(spanishPlayer.lastname);

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

function getSpanishPlayerDisplayName(player) {
  const matchedPlayer =
    findSpanishPlayer(player);

  if (matchedPlayer) {
    return `${matchedPlayer.firstname} ${matchedPlayer.lastname}`;
  }

  return `${player?.firstname || ""} ${
    player?.lastname || ""
  }`.trim();
}

function getPlayerDisplayName(player) {
  return `${player?.firstname || ""} ${
    player?.lastname || ""
  }`.trim();
}

function getTeamLogo(team) {
  const teamId =
    NBA_TEAM_IDS[team?.code];

  if (!teamId) {
    return team?.logo || "";
  }

  return `https://cdn.nba.com/logos/nba/${teamId}/primary/L/logo.svg`;
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

function formatGameDate(game) {
  if (!game.date?.start) {
    return "";
  }

  return new Date(
    game.date.start
  ).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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
      ? "h-16 w-16 sm:h-20 sm:w-20"
      : "h-11 w-11";

  const imageSize =
    size === "large"
      ? "h-12 w-12 sm:h-16 sm:w-16"
      : "h-9 w-9";

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
        <span className="text-xs font-black text-slate-900">
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

function StatBox({
  label,
  value,
  featured = false,
  valueClassName = "",
}) {
  return (
    <div
      className={`rounded-2xl p-3 text-center ${
        featured
          ? "bg-orange-50"
          : "bg-slate-100"
      }`}
    >
      <div
        className={`text-xl font-black ${
          featured
            ? "text-orange-600"
            : "text-slate-950"
        } ${valueClassName}`}
      >
        {value}
      </div>

      <div className="mt-1 text-[10px] font-bold uppercase text-slate-400">
        {label}
      </div>
    </div>
  );
}

function PlayerStatsTable({
  team,
  playerStats,
  onSelectPlayer,
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[minmax(0,1fr)_40px_42px_42px_42px_22px] items-center gap-1 bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase text-slate-500">
          <div>Jugador</div>
          <div className="text-center">MIN</div>
          <div className="text-center text-orange-600">PTS</div>
          <div className="text-center">REB</div>
          <div className="text-center">AST</div>
          <div />
        </div>

        <div>
          {teamPlayers.map(
            (stat) => (
              <button
                key={stat.player?.id}
                type="button"
                onClick={() =>
                  onSelectPlayer(stat)
                }
                className="grid w-full grid-cols-[minmax(0,1fr)_40px_42px_42px_42px_22px] items-center gap-1 border-t border-slate-200 px-3 py-3 text-left transition active:bg-orange-50 sm:hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-950">
                    {getPlayerDisplayName(
                      stat.player
                    )}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    {stat.pos || "-"}
                  </div>
                </div>

                <div className="text-center text-sm text-slate-600">
                  {stat.min ?? "-"}
                </div>

                <div className="text-center text-sm font-black text-orange-600">
                  {stat.points ?? 0}
                </div>

                <div className="text-center text-sm text-slate-700">
                  {stat.totReb ?? 0}
                </div>

                <div className="text-center text-sm text-slate-700">
                  {stat.assists ?? 0}
                </div>

                <ChevronRight
                  size={17}
                  className="text-slate-300"
                />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerDetail({
  stat,
  game,
  onBack,
}) {
  const playerName =
    getPlayerDisplayName(
      stat.player
    );

  const plusMinus =
    stat.plusMinus ?? "-";

  const plusMinusClass =
    String(plusMinus).startsWith("+")
      ? "text-emerald-600"
      : String(plusMinus).startsWith("-")
      ? "text-red-600"
      : "text-slate-950";

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition active:bg-slate-100"
      >
        <ArrowLeft size={18} />
        Volver al partido
      </button>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 px-5 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-white/20">
              <UserRound size={30} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-black">
                {playerName}
              </h1>

              <p className="mt-1 text-sm text-orange-100">
                {stat.team?.name}
                {stat.pos
                  ? ` · ${stat.pos}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <TeamLogo
              team={stat.team}
            />

            <div>
              <p className="font-bold text-slate-950">
                {game.teams?.visitors?.name}
                {" vs "}
                {game.teams?.home?.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formatGameDate(game)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-600">
            Estadísticas principales
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox
              label="Minutos"
              value={stat.min ?? "-"}
            />

            <StatBox
              label="Puntos"
              value={stat.points ?? 0}
              featured
            />

            <StatBox
              label="Rebotes"
              value={stat.totReb ?? 0}
            />

            <StatBox
              label="Asistencias"
              value={stat.assists ?? 0}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-600">
            Tiro
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatBox
              label="Tiros de campo"
              value={`${stat.fgm ?? 0}/${stat.fga ?? 0}`}
            />

            <StatBox
              label="% de campo"
              value={`${stat.fgp ?? 0}%`}
            />

            <StatBox
              label="Triples"
              value={`${stat.tpm ?? 0}/${stat.tpa ?? 0}`}
            />

            <StatBox
              label="% de triples"
              value={`${stat.tpp ?? 0}%`}
            />

            <StatBox
              label="Tiros libres"
              value={`${stat.ftm ?? 0}/${stat.fta ?? 0}`}
            />

            <StatBox
              label="% tiros libres"
              value={`${stat.ftp ?? 0}%`}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-600">
            Otros datos
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox
              label="Rebotes ofensivos"
              value={stat.offReb ?? 0}
            />

            <StatBox
              label="Rebotes defensivos"
              value={stat.defReb ?? 0}
            />

            <StatBox
              label="Robos"
              value={stat.steals ?? 0}
            />

            <StatBox
              label="Tapones"
              value={stat.blocks ?? 0}
            />

            <StatBox
              label="Pérdidas"
              value={stat.turnovers ?? 0}
            />

            <StatBox
              label="Faltas"
              value={stat.pFouls ?? 0}
            />

            <StatBox
              label="+/-"
              value={plusMinus}
              valueClassName={plusMinusClass}
            />
          </div>
        </div>
      </article>
    </section>
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
        <StatBox
          label="MIN"
          value={stat.min ?? "-"}
        />

        <StatBox
          label="PTS"
          value={stat.points ?? 0}
          featured
        />

        <StatBox
          label="REB"
          value={stat.totReb ?? 0}
        />

        <StatBox
          label="AST"
          value={stat.assists ?? 0}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-xl border border-slate-200 p-2">
          <strong>
            {stat.fgm ?? 0}/{stat.fga ?? 0}
          </strong>
          <div className="text-xs text-slate-400">TC</div>
        </div>

        <div className="rounded-xl border border-slate-200 p-2">
          <strong>
            {stat.tpm ?? 0}/{stat.tpa ?? 0}
          </strong>
          <div className="text-xs text-slate-400">3PT</div>
        </div>

        <div className="rounded-xl border border-slate-200 p-2">
          <strong>
            {stat.plusMinus ?? "-"}
          </strong>
          <div className="text-xs text-slate-400">+/-</div>
        </div>
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
  onSelectPlayer,
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
        className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition active:bg-slate-100"
      >
        <ArrowLeft size={18} />
        Partidos
      </button>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 px-4 py-4 text-center sm:px-5 sm:py-5">
          <div className="text-sm font-black tracking-widest text-white">
            {formatGameStatus(game)}
          </div>

          {game.status?.short !== 3 && (
            <div className="mt-1 text-xs text-orange-100">
              {formatGameTime(game)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-6 sm:gap-4 sm:px-8">
          <div className="flex min-w-0 flex-col items-center text-center">
            <TeamLogo
              team={visitors}
              size="large"
            />

            <div className="mt-2 line-clamp-2 min-h-10 text-sm font-bold text-slate-950 sm:text-base">
              {visitors?.name}
            </div>

            <div className="mt-1 text-[10px] text-slate-400">
              VISITANTE
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-950 sm:text-5xl">
              {visitorsScore?.points ?? "-"}
            </span>

            <span className="text-lg text-slate-300">
              -
            </span>

            <span className="text-3xl font-black text-slate-950 sm:text-5xl">
              {homeScore?.points ?? "-"}
            </span>
          </div>

          <div className="flex min-w-0 flex-col items-center text-center">
            <TeamLogo
              team={home}
              size="large"
            />

            <div className="mt-2 line-clamp-2 min-h-10 text-sm font-bold text-slate-950 sm:text-base">
              {home?.name}
            </div>

            <div className="mt-1 text-[10px] text-slate-400">
              LOCAL
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-5">
          <h3 className="mb-3 text-base font-black text-slate-950 sm:text-lg">
            Marcador por cuartos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-center text-sm text-slate-700">
              <thead>
                <tr className="text-[10px] text-slate-400">
                  <th className="pb-2 text-left">
                    EQUIPO
                  </th>

                  {periods.map((period) => (
                    <th
                      key={period}
                      className="pb-2"
                    >
                      {period < 4
                        ? `Q${period + 1}`
                        : `OT${period - 3}`}
                    </th>
                  ))}

                  <th className="pb-2 text-orange-600">
                    TOTAL
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t border-slate-200">
                  <td className="py-3 text-left font-black">
                    {visitors?.code}
                  </td>

                  {periods.map((period) => (
                    <td key={period}>
                      {visitorsLines[period] ?? "-"}
                    </td>
                  ))}

                  <td className="font-black">
                    {visitorsScore?.points ?? "-"}
                  </td>
                </tr>

                <tr className="border-t border-slate-200">
                  <td className="py-3 text-left font-black">
                    {home?.code}
                  </td>

                  {periods.map((period) => (
                    <td key={period}>
                      {homeLines[period] ?? "-"}
                    </td>
                  ))}

                  <td className="font-black">
                    {homeScore?.points ?? "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-5">
          <h3 className="mb-3 text-base font-black text-slate-950 sm:text-lg">
            Información
          </h3>

          <div className="space-y-3">
            {game.arena?.name && (
              <div className="flex items-start gap-3">
                <MapPin
                  size={19}
                  className="mt-0.5 flex-shrink-0 text-orange-500"
                />

                <div>
                  <div className="text-sm font-semibold">
                    {game.arena.name}
                  </div>

                  <div className="text-xs text-slate-500">
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
                  size={19}
                  className="mt-0.5 flex-shrink-0 text-orange-500"
                />

                <div>
                  <div className="text-sm font-semibold">
                    Fecha y hora
                  </div>

                  <div className="text-xs text-slate-500">
                    {formatGameDate(game)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4 sm:p-5">
          <div className="mb-4">
            <p className="text-xs font-semibold text-orange-600">
              BOX SCORE
            </p>

            <h3 className="text-lg font-black text-slate-950 sm:text-xl">
              Estadísticas del partido
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Pulsa un jugador para ver todos los detalles.
            </p>
          </div>

          {statsLoading && (
            <div className="rounded-2xl bg-slate-100 p-6 text-center text-sm text-slate-500">
              Cargando estadísticas...
            </div>
          )}

          {!statsLoading && statsError && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle size={19} />
              {statsError}
            </div>
          )}

          {!statsLoading &&
            !statsError &&
            playerStats.length === 0 && (
              <div className="rounded-2xl bg-slate-100 p-6 text-center text-sm text-slate-500">
                Estadísticas individuales todavía no disponibles.
              </div>
            )}

          {!statsLoading &&
            !statsError &&
            playerStats.length > 0 && (
              <div className="space-y-7">
                <PlayerStatsTable
                  team={visitors}
                  playerStats={playerStats}
                  onSelectPlayer={onSelectPlayer}
                />

                <PlayerStatsTable
                  team={home}
                  playerStats={playerStats}
                  onSelectPlayer={onSelectPlayer}
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

  const [gameDate, setGameDate] =
    useState("");

  const [selectedGame, setSelectedGame] =
    useState(null);

  const [selectedPlayer, setSelectedPlayer] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdate, setLastUpdate] =
    useState(null);

  const [playerStats, setPlayerStats] =
    useState([]);

  const [statsLoading, setStatsLoading] =
    useState(false);

  const [statsError, setStatsError] =
    useState("");

  const [allPlayerStats, setAllPlayerStats] =
    useState([]);

  const [spanishLoading, setSpanishLoading] =
    useState(true);

  const [spanishError, setSpanishError] =
    useState("");

  async function loadGames(
    showLoader = true
  ) {
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

      const data =
        await response.json();

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

  async function loadAllPlayerStats(
    showLoader = true
  ) {
    if (showLoader) {
      setSpanishLoading(true);
    }

    setSpanishError("");

    try {
      const response = await fetch(
        `${PLAYER_STATS_URL}?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      const gamesData =
        data.games || {};

      const stats =
        Object.values(gamesData).flatMap(
          (game) =>
            Array.isArray(game?.response)
              ? game.response
              : []
        );

      setAllPlayerStats(stats);
    } catch (loadError) {
      console.error(loadError);

      setAllPlayerStats([]);

      setSpanishError(
        "No ha sido posible cargar las actuaciones españolas."
      );
    } finally {
      setSpanishLoading(false);
    }
  }

  useEffect(() => {
    loadGames();
    loadAllPlayerStats();

    const refreshInterval =
      window.setInterval(() => {
        loadGames(false);
        loadAllPlayerStats(false);
      }, 60000);

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
        .sort(
          (a, b) =>
            Number(b.points || 0) -
            Number(a.points || 0)
        );
    }, [allPlayerStats]);

  async function openGame(game) {
    setSelectedGame(game);
    setSelectedPlayer(null);
    setPlayerStats([]);
    setStatsError("");
    setStatsLoading(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    try {
      const response = await fetch(
        `${PLAYER_STATS_URL}?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      const gameStatistics =
        data.games?.[String(game.id)];

      setPlayerStats(
        Array.isArray(
          gameStatistics?.response
        )
          ? gameStatistics.response
          : []
      );
    } catch (statsLoadError) {
      console.error(statsLoadError);

      setStatsError(
        "No ha sido posible cargar las estadísticas."
      );
    } finally {
      setStatsLoading(false);
    }
  }

  function openPlayer(stat) {
    setSelectedPlayer(stat);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closePlayer() {
    setSelectedPlayer(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeGame() {
    setSelectedGame(null);
    setSelectedPlayer(null);
    setPlayerStats([]);
    setStatsError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function changeTab(newTab) {
    setSelectedGame(null);
    setSelectedPlayer(null);
    setPlayerStats([]);
    setTab(newTab);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const showBottomNav =
    !selectedGame &&
    !selectedPlayer;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-5">
          <button
            onClick={() =>
              changeTab("Scores")
            }
            className="flex items-center gap-3"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-sm font-black text-white">
              ÑBA
            </div>

            <div className="text-left">
              <div className="text-base font-black tracking-tight">
                ÑBA
              </div>

              <div className="text-[10px] text-slate-500">
                Resultados y españoles
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
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                {label === "Scores"
                  ? "Partidos"
                  : "Españoles"}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-5 sm:py-8">
        {selectedPlayer &&
        selectedGame ? (
          <PlayerDetail
            stat={selectedPlayer}
            game={selectedGame}
            onBack={closePlayer}
          />
        ) : selectedGame ? (
          <GameDetail
            game={selectedGame}
            onBack={closeGame}
            playerStats={playerStats}
            statsLoading={statsLoading}
            statsError={statsError}
            onSelectPlayer={openPlayer}
          />
        ) : (
          <>
            <section className="mb-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 px-5 py-4 text-white shadow-md sm:mb-8 sm:p-8">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-orange-100">
                <CalendarDays size={14} />
                ÑBA
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-5xl">
                Baloncesto con Ñ.
              </h1>

              <p className="mt-1 text-xs text-orange-50 sm:mt-3 sm:text-base">
                Partidos NBA y actuaciones españolas.
              </p>
            </section>

            {tab === "Scores" && (
              <section>
                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-orange-600">
                      SCOREBOARD
                    </p>

                    <h2 className="text-xl font-bold">
                      Partidos
                    </h2>

                    <p className="text-xs text-slate-400">
                      {gameDate}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      loadGames()
                    }
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <RefreshCw
                      size={15}
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
                  <div className="rounded-3xl bg-slate-100 p-8 text-center text-sm text-slate-500">
                    Cargando partidos...
                  </div>
                )}

                {!loading && error && (
                  <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {!loading &&
                  !error &&
                  games.length === 0 && (
                    <div className="rounded-3xl bg-slate-100 p-8 text-center text-sm text-slate-500">
                      No hay partidos disponibles.
                    </div>
                  )}

                {!loading &&
                  !error &&
                  games.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {games.map((game) => {
                        const visitorPoints =
                          game.scores?.visitors?.points;

                        const homePoints =
                          game.scores?.home?.points;

                        const finished =
                          game.status?.short === 3;

                        return (
                          <button
                            key={game.id}
                            onClick={() =>
                              openGame(game)
                            }
                            className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm active:bg-orange-50"
                          >
                            <div className="mb-4 text-xs font-bold text-slate-500">
                              {formatGameStatus(game)}
                            </div>

                            <div className="space-y-4">
                              <TeamRow
                                team={game.teams?.visitors}
                                score={game.scores?.visitors}
                                winner={
                                  finished &&
                                  visitorPoints > homePoints
                                }
                              />

                              <TeamRow
                                team={game.teams?.home}
                                score={game.scores?.home}
                                winner={
                                  finished &&
                                  homePoints > visitorPoints
                                }
                              />
                            </div>

                            <div className="mt-4 text-right text-xs font-bold text-orange-600">
                              Ver partido →
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
              </section>
            )}

            {tab === "Spanish" && (
              <section>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-orange-600">
                    ÑBA
                  </p>

                  <h2 className="text-xl font-black">
                    Españoles en la NBA
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Actuaciones disponibles del día.
                  </p>
                </div>

                {spanishLoading && (
                  <div className="rounded-3xl bg-slate-100 p-8 text-center text-sm text-slate-500">
                    Cargando actuaciones...
                  </div>
                )}

                {!spanishLoading &&
                  spanishError && (
                    <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
                      {spanishError}
                    </div>
                  )}

                {!spanishLoading &&
                  !spanishError &&
                  spanishPerformances.length === 0 && (
                    <div className="rounded-3xl bg-slate-100 p-8 text-center">
                      <Flag
                        size={30}
                        className="mx-auto mb-3 text-orange-500"
                      />

                      <p className="text-sm font-bold">
                        Sin actuaciones españolas
                      </p>
                    </div>
                  )}

                {!spanishLoading &&
                  !spanishError &&
                  spanishPerformances.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {spanishPerformances.map(
                        (stat) => (
                          <SpanishPerformanceCard
                            key={`${stat.game?.id}-${stat.player?.id}`}
                            stat={stat}
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

      {showBottomNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-2 border-t border-slate-200 bg-white/95 px-2 pt-2 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur md:hidden"
          style={{
            paddingBottom:
              "calc(0.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {nav.map(([label, Icon]) => (
            <button
              key={label}
              onClick={() =>
                changeTab(label)
              }
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-xs ${
                tab === label
                  ? "bg-slate-950 text-white"
                  : "text-slate-500"
              }`}
            >
              <Icon size={19} />

              {label === "Scores"
                ? "Partidos"
                : "Españoles"}
            </button>
          ))}
        </nav>
      )}

      <footer className="mx-auto max-w-7xl px-5 pb-24 pt-8 text-xs text-slate-400">
        ÑBA · Resultados y jugadores españoles
      </footer>
    </div>
  );
}
