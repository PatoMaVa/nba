import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Trophy,
  Flag,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  MapPin,
  Clock,
  UserRound,
} from "lucide-react";

const NBA_SCOREBOARD_URL =
  `${import.meta.env.BASE_URL}data/scoreboard.json`;

const PLAYER_STATS_URL =
  `${import.meta.env.BASE_URL}data/player-stats.json`;

const STANDINGS_URL =
  `${import.meta.env.BASE_URL}data/standings.json`;

const SEASON_PLAYER_STATS_URL =
  `${import.meta.env.BASE_URL}data/season-player-stats.json`;

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

const EAST_TEAMS = new Set([
  "ATL",
  "BOS",
  "BKN",
  "CHA",
  "CHI",
  "CLE",
  "DET",
  "IND",
  "MIA",
  "MIL",
  "NYK",
  "ORL",
  "PHI",
  "TOR",
  "WAS",
]);

const nav = [
  ["Scores", Activity],
  ["Standings", Trophy],
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
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findSpanishPlayer(player) {
  const firstname = normalizeText(
    player?.firstname
  );

  const lastname = normalizeText(
    player?.lastname
  );

  return SPANISH_PLAYERS.find(
    (spanishPlayer) => {
      const expectedFirstname =
        normalizeText(
          spanishPlayer.firstname
        );

      const expectedLastname =
        normalizeText(
          spanishPlayer.lastname
        );

      const normalOrder =
        firstname === expectedFirstname &&
        lastname === expectedLastname;

      const reversedOrder =
        firstname === expectedLastname &&
        lastname === expectedFirstname;

      return normalOrder || reversedOrder;
    }
  );
}

function isSpanishPlayer(player) {
  return Boolean(
    findSpanishPlayer(player)
  );
}

function isSpanishSeasonPlayer(player) {
  const normalizedName =
    normalizeText(player?.player_name);

  return SPANISH_PLAYERS.some(
    (spanishPlayer) => {
      const expectedName =
        normalizeText(
          `${spanishPlayer.firstname} ${spanishPlayer.lastname}`
        );

      const reversedName =
        normalizeText(
          `${spanishPlayer.lastname} ${spanishPlayer.firstname}`
        );

      return (
        normalizedName === expectedName ||
        normalizedName === reversedName
      );
    }
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

function getStandingsTeamLogo(teamCode) {
  const teamId =
    NBA_TEAM_IDS[teamCode];

  if (!teamId) {
    return "";
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

function formatDecimal(value, decimals = 1) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "-";
  }

  return Number(value).toLocaleString(
    "es-ES",
    {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }
  );
}

function formatPercentage(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "-";
  }

  return `${formatDecimal(
    Number(value) * 100,
    1
  )}%`;
}

function formatRecordPercentage(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "-";
  }

  return Number(value).toFixed(3).replace(
    /^0/,
    ""
  );
}

function getMinutesPerGame(player) {
  const games =
    Number(player?.games_played || 0);

  const minutes =
    Number(player?.minutes || 0);

  if (!games) {
    return 0;
  }

  return minutes / games;
}

function getPerGame(total, games) {
  const gamesPlayed =
    Number(games || 0);

  if (!gamesPlayed) {
    return 0;
  }

  return Number(total || 0) / gamesPlayed;
}

function findSeasonPlayer(
  stat,
  seasonPlayerStats
) {
  const playerName =
    normalizeText(
      getPlayerDisplayName(
        stat?.player
      )
    );

  const reversedPlayerName =
    normalizeText(
      `${stat?.player?.lastname || ""} ${
        stat?.player?.firstname || ""
      }`
    );

  const teamCode =
    stat?.team?.code;

  const sameTeamMatches =
    seasonPlayerStats.filter(
      (seasonPlayer) =>
        seasonPlayer?.team === teamCode
    );

  const matchedPlayer =
    sameTeamMatches.find(
      (seasonPlayer) => {
        const seasonName =
          normalizeText(
            seasonPlayer?.player_name
          );

        return (
          seasonName === playerName ||
          seasonName ===
            reversedPlayerName
        );
      }
    );

  if (matchedPlayer) {
    return matchedPlayer;
  }

  return seasonPlayerStats.find(
    (seasonPlayer) => {
      const seasonName =
        normalizeText(
          seasonPlayer?.player_name
        );

      return (
        seasonName === playerName ||
        seasonName ===
          reversedPlayerName
      );
    }
  );
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
          alt={
            team?.name ||
            team?.code ||
            "NBA"
          }
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
      .sort(
        (a, b) =>
          Number(b.min || 0) -
          Number(a.min || 0)
      );

  if (teamPlayers.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <TeamLogo team={team} />

        <div className="min-w-0">
          <div className="font-black text-slate-950">
            {team?.name}
          </div>

          <div className="text-xs text-slate-400">
            {teamPlayers.length} jugadores
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[minmax(130px,1fr)_34px_36px_36px_36px] items-center gap-1 bg-slate-100 px-2 py-2 text-[9px] font-bold uppercase text-slate-500 sm:grid-cols-[minmax(180px,1fr)_50px_50px_50px_50px]">
          <div>Jugador</div>
          <div className="text-center">
            MIN
          </div>
          <div className="text-center text-orange-600">
            PTS
          </div>
          <div className="text-center">
            REB
          </div>
          <div className="text-center">
            AST
          </div>
        </div>

        {teamPlayers.map(
          (stat) => (
            <button
              key={stat.player?.id}
              type="button"
              onClick={() =>
                onSelectPlayer(stat)
              }
              className="grid w-full grid-cols-[minmax(130px,1fr)_34px_36px_36px_36px] items-center gap-1 border-t border-slate-200 px-2 py-3 text-left transition active:bg-orange-50 sm:grid-cols-[minmax(180px,1fr)_50px_50px_50px_50px]"
            >
              <div className="min-w-0 pr-1">
                <div className="whitespace-normal break-words text-[13px] font-bold leading-[1.15rem] text-slate-950">
                  {getPlayerDisplayName(
                    stat.player
                  )}
                </div>

                <div className="mt-1 text-[9px] text-slate-400">
                  {stat.pos || "-"}
                </div>
              </div>

              <div className="text-center text-xs text-slate-600">
                {stat.min ?? "-"}
              </div>

              <div className="text-center text-xs font-black text-orange-600">
                {stat.points ?? 0}
              </div>

              <div className="text-center text-xs text-slate-700">
                {stat.totReb ?? 0}
              </div>

              <div className="text-center text-xs text-slate-700">
                {stat.assists ?? 0}
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function SeasonStatsSection({
  seasonPlayer,
}) {
  if (!seasonPlayer) {
    return (
      <div className="border-t border-slate-200 p-5">
        <p className="text-xs font-bold uppercase text-orange-600">
          Temporada 2026-27
        </p>

        <p className="mt-3 text-sm text-slate-500">
          No se han encontrado estadísticas globales de temporada para este jugador.
        </p>
      </div>
    );
  }

  const games =
    Number(
      seasonPlayer.games_played || 0
    );

  const stealsPerGame =
    getPerGame(
      seasonPlayer.steals,
      games
    );

  const blocksPerGame =
    getPerGame(
      seasonPlayer.blocks,
      games
    );

  const turnoversPerGame =
    getPerGame(
      seasonPlayer.turnovers,
      games
    );

  const netRating =
    Number(
      seasonPlayer.net_rating || 0
    );

  return (
    <div className="border-t border-slate-200 p-5">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
          Temporada 2026-27
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Promedios y datos acumulados
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBox
          label="Partidos"
          value={games}
        />

        <StatBox
          label="Minutos"
          value={formatDecimal(
            getMinutesPerGame(
              seasonPlayer
            )
          )}
        />

        <StatBox
          label="Puntos"
          value={formatDecimal(
            seasonPlayer.points_pg
          )}
          featured
        />

        <StatBox
          label="Rebotes"
          value={formatDecimal(
            seasonPlayer.rebounds_pg
          )}
        />

        <StatBox
          label="Asistencias"
          value={formatDecimal(
            seasonPlayer.assists_pg
          )}
        />

        <StatBox
          label="Robos"
          value={formatDecimal(
            stealsPerGame
          )}
        />

        <StatBox
          label="Tapones"
          value={formatDecimal(
            blocksPerGame
          )}
        />

        <StatBox
          label="Pérdidas"
          value={formatDecimal(
            turnoversPerGame
          )}
        />
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-orange-600">
          Porcentajes y métricas
        </p>

        <div className="grid grid-cols-2 gap-3">
          <StatBox
            label="TC"
            value={formatPercentage(
              seasonPlayer.field_goal_pct
            )}
          />

          <StatBox
            label="3PT"
            value={formatPercentage(
              seasonPlayer.three_point_pct
            )}
          />

          <StatBox
            label="TL"
            value={formatPercentage(
              seasonPlayer.free_throw_pct
            )}
          />

          <StatBox
            label="True shooting"
            value={formatPercentage(
              seasonPlayer.ts_pct
            )}
          />

          <StatBox
            label="Uso"
            value={formatPercentage(
              seasonPlayer.usage_rate
            )}
          />

          <StatBox
            label="Rating neto"
            value={
              netRating > 0
                ? `+${formatDecimal(
                    netRating
                  )}`
                : formatDecimal(
                    netRating
                  )
            }
            valueClassName={
              netRating > 0
                ? "text-emerald-600"
                : netRating < 0
                ? "text-red-600"
                : ""
            }
          />
        </div>
      </div>

      <p className="mt-5 text-[10px] text-slate-400">
        Datos de temporada: BoxScore Lab · CC BY 4.0
      </p>
    </div>
  );
}

function PlayerDetail({
  stat,
  game,
  seasonPlayer,
  onBack,
}) {
  const playerName =
    getPlayerDisplayName(
      stat.player
    );

  const plusMinus =
    stat.plusMinus ?? "-";

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
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
              <h1 className="text-2xl font-black">
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
            Este partido
          </p>

          <div className="grid grid-cols-2 gap-3">
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
            Tiro del partido
          </p>

          <div className="grid grid-cols-2 gap-3">
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
            Otros datos del partido
          </p>

          <div className="grid grid-cols-2 gap-3">
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
              valueClassName={
                String(
                  plusMinus
                ).startsWith("+")
                  ? "text-emerald-600"
                  : String(
                      plusMinus
                    ).startsWith("-")
                  ? "text-red-600"
                  : ""
              }
            />
          </div>
        </div>

        <SeasonStatsSection
          seasonPlayer={seasonPlayer}
        />
      </article>
    </section>
  );
}

function StandingsTable({
  title,
  teams,
}) {
  return (
    <div>
      <h3 className="mb-3 text-lg font-black text-slate-950">
        {title}
      </h3>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[26px_minmax(0,1fr)_30px_30px_48px] items-center gap-1 bg-slate-100 px-2 py-2 text-[9px] font-bold uppercase text-slate-500">
          <div>#</div>
          <div>Equipo</div>
          <div className="text-center">
            V
          </div>
          <div className="text-center">
            D
          </div>
          <div className="text-right">
            %
          </div>
        </div>

        {teams.map(
          (team, index) => {
            const rank =
              index + 1;

            const zoneClass =
              rank <= 6
                ? "border-l-4 border-l-emerald-500"
                : rank <= 10
                ? "border-l-4 border-l-orange-400"
                : "border-l-4 border-l-slate-200";

            return (
              <div
                key={team.team}
                className={`grid grid-cols-[26px_minmax(0,1fr)_30px_30px_48px] items-center gap-1 border-t border-slate-200 px-2 py-3 ${zoneClass}`}
              >
                <div className="text-xs font-black text-slate-500">
                  {rank}
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <div className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-white p-1">
                    <img
                      src={getStandingsTeamLogo(
                        team.team
                      )}
                      alt={team.team_name}
                      className="h-7 w-7 object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-950">
                      {team.team_name}
                    </div>

                    <div className="text-[9px] text-slate-400">
                      {team.team}
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs font-bold">
                  {team.wins}
                </div>

                <div className="text-center text-xs text-slate-600">
                  {team.losses}
                </div>

                <div className="text-right text-xs font-bold">
                  {formatRecordPercentage(
                    team.win_pct
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function StandingsView({
  standings,
  loading,
  error,
  onRefresh,
}) {
  const [conference, setConference] =
    useState("East");

  const eastTeams =
    standings
      .filter(
        (team) =>
          EAST_TEAMS.has(
            team.team
          )
      )
      .sort(
        (a, b) =>
          Number(b.win_pct || 0) -
            Number(a.win_pct || 0) ||
          Number(b.wins || 0) -
            Number(a.wins || 0)
      );

  const westTeams =
    standings
      .filter(
        (team) =>
          !EAST_TEAMS.has(
            team.team
          )
      )
      .sort(
        (a, b) =>
          Number(b.win_pct || 0) -
            Number(a.win_pct || 0) ||
          Number(b.wins || 0) -
            Number(a.wins || 0)
      );

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-orange-600">
            TEMPORADA 2026-27
          </p>

          <h2 className="text-xl font-black">
            Clasificación
          </h2>
        </div>

        <button
          onClick={onRefresh}
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

      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <button
          onClick={() =>
            setConference("East")
          }
          className={`rounded-xl py-2 text-sm font-bold ${
            conference === "East"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Este
        </button>

        <button
          onClick={() =>
            setConference("West")
          }
          className={`rounded-xl py-2 text-sm font-bold ${
            conference === "West"
              ? "bg-white text-slate-950 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Oeste
        </button>
      </div>

      {loading && (
        <div className="rounded-3xl bg-slate-100 p-8 text-center text-sm text-slate-500">
          Cargando clasificación...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-3xl bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        standings.length > 0 && (
          <StandingsTable
            title={
              conference === "East"
                ? "Conferencia Este"
                : "Conferencia Oeste"
            }
            teams={
              conference === "East"
                ? eastTeams
                : westTeams
            }
          />
        )}

      <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Playoffs 1-6
        </span>

        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-400" />
          Play-In 7-10
        </span>
      </div>

      <p className="mt-4 text-[10px] text-slate-400">
        Datos de temporada: BoxScore Lab · CC BY 4.0
      </p>
    </section>
  );
}

function SpanishPerformanceCard({
  stat,
  seasonPlayer,
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <TeamLogo
          team={stat.team}
        />

        <div>
          <h3 className="text-lg font-black">
            {getSpanishPlayerDisplayName(
              stat.player
            )}
          </h3>

          <p className="text-sm text-slate-500">
            {stat.team?.name}
          </p>
        </div>
      </div>

      <p className="mb-2 text-[10px] font-bold uppercase text-orange-600">
        Último partido disponible
      </p>

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

      {seasonPlayer && (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <p className="mb-2 text-[10px] font-bold uppercase text-orange-600">
            Temporada 2026-27
          </p>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-black">
                {seasonPlayer.games_played}
              </div>
              <div className="text-[9px] text-slate-400">
                PJ
              </div>
            </div>

            <div>
              <div className="font-black">
                {formatDecimal(
                  seasonPlayer.points_pg
                )}
              </div>
              <div className="text-[9px] text-slate-400">
                PTS
              </div>
            </div>

            <div>
              <div className="font-black">
                {formatDecimal(
                  seasonPlayer.rebounds_pg
                )}
              </div>
              <div className="text-[9px] text-slate-400">
                REB
              </div>
            </div>

            <div>
              <div className="font-black">
                {formatDecimal(
                  seasonPlayer.assists_pg
                )}
              </div>
              <div className="text-[9px] text-slate-400">
                AST
              </div>
            </div>
          </div>
        </div>
      )}
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
        className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
      >
        <ArrowLeft size={18} />
        Partidos
      </button>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 px-4 py-4 text-center">
          <div className="text-sm font-black tracking-widest text-white">
            {formatGameStatus(game)}
          </div>

          {game.status?.short !== 3 && (
            <div className="mt-1 text-xs text-orange-100">
              {formatGameTime(game)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-6">
          <div className="flex flex-col items-center text-center">
            <TeamLogo
              team={visitors}
              size="large"
            />

            <div className="mt-2 text-sm font-bold">
              {visitors?.name}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-black">
              {visitorsScore?.points ?? "-"}
            </span>

            <span className="text-slate-300">
              -
            </span>

            <span className="text-3xl font-black">
              {homeScore?.points ?? "-"}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <TeamLogo
              team={home}
              size="large"
            />

            <div className="mt-2 text-sm font-bold">
              {home?.name}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <h3 className="mb-3 font-black">
            Marcador por cuartos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[340px] text-center text-sm">
              <thead>
                <tr className="text-[10px] text-slate-400">
                  <th className="text-left">
                    EQ.
                  </th>

                  {periods.map(
                    (period) => (
                      <th key={period}>
                        {period < 4
                          ? `Q${period + 1}`
                          : `OT${period - 3}`}
                      </th>
                    )
                  )}

                  <th>TOT</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="py-3 text-left font-black">
                    {visitors?.code}
                  </td>

                  {periods.map(
                    (period) => (
                      <td key={period}>
                        {visitorsLines[
                          period
                        ] ?? "-"}
                      </td>
                    )
                  )}

                  <td className="font-black">
                    {visitorsScore?.points ?? "-"}
                  </td>
                </tr>

                <tr className="border-t">
                  <td className="py-3 text-left font-black">
                    {home?.code}
                  </td>

                  {periods.map(
                    (period) => (
                      <td key={period}>
                        {homeLines[
                          period
                        ] ?? "-"}
                      </td>
                    )
                  )}

                  <td className="font-black">
                    {homeScore?.points ?? "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <h3 className="mb-4 text-lg font-black">
            Estadísticas del partido
          </h3>

          <p className="mb-4 text-xs text-slate-500">
            Pulsa en un jugador para ver el detalle del partido y de la temporada.
          </p>

          {statsLoading && (
            <div className="p-5 text-center text-sm text-slate-500">
              Cargando estadísticas...
            </div>
          )}

          {statsError && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700">
              {statsError}
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

  const [standings, setStandings] =
    useState([]);

  const [standingsLoading, setStandingsLoading] =
    useState(true);

  const [standingsError, setStandingsError] =
    useState("");

  const [seasonPlayerStats, setSeasonPlayerStats] =
    useState([]);

  async function loadGames() {
    setLoading(true);

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

      setGames(
        Array.isArray(data.response)
          ? data.response
          : []
      );

      setGameDate(
        data.parameters?.date || ""
      );

      setError("");
    } catch (loadError) {
      console.error(loadError);

      setError(
        "No ha sido posible cargar los partidos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadBoxScores() {
    setSpanishLoading(true);

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

      const stats =
        Object.values(
          data.games || {}
        ).flatMap(
          (game) =>
            Array.isArray(game?.response)
              ? game.response
              : []
        );

      setAllPlayerStats(stats);
      setSpanishError("");
    } catch (loadError) {
      console.error(loadError);

      setSpanishError(
        "No ha sido posible cargar las actuaciones españolas."
      );
    } finally {
      setSpanishLoading(false);
    }
  }

  async function loadStandings() {
    setStandingsLoading(true);

    try {
      const response = await fetch(
        `${STANDINGS_URL}?t=${Date.now()}`,
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

      setStandings(
        Array.isArray(data.response)
          ? data.response
          : []
      );

      setStandingsError("");
    } catch (loadError) {
      console.error(loadError);

      setStandingsError(
        "No ha sido posible cargar la clasificación."
      );
    } finally {
      setStandingsLoading(false);
    }
  }

  async function loadSeasonPlayerStats() {
    try {
      const response = await fetch(
        `${SEASON_PLAYER_STATS_URL}?t=${Date.now()}`,
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

      setSeasonPlayerStats(
        Array.isArray(data.response)
          ? data.response
          : []
      );
    } catch (loadError) {
      console.error(
        "No ha sido posible cargar las estadísticas de temporada.",
        loadError
      );

      setSeasonPlayerStats([]);
    }
  }

  useEffect(() => {
    loadGames();
    loadBoxScores();
    loadStandings();
    loadSeasonPlayerStats();
  }, []);

  useEffect(() => {
    if (
      selectedPlayer ||
      selectedGame
    ) {
      window.requestAnimationFrame(
        () => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      );
    }
  }, [
    selectedPlayer,
    selectedGame,
  ]);

  const spanishPerformances =
    useMemo(
      () =>
        allPlayerStats.filter(
          (stat) =>
            isSpanishPlayer(
              stat.player
            )
        ),
      [allPlayerStats]
    );

  const spanishSeasonPlayers =
    useMemo(
      () =>
        seasonPlayerStats.filter(
          (player) =>
            isSpanishSeasonPlayer(
              player
            )
        ),
      [seasonPlayerStats]
    );

  const selectedSeasonPlayer =
    useMemo(() => {
      if (!selectedPlayer) {
        return null;
      }

      return findSeasonPlayer(
        selectedPlayer,
        seasonPlayerStats
      );
    }, [
      selectedPlayer,
      seasonPlayerStats,
    ]);

  async function openGame(game) {
    setSelectedGame(game);
    setSelectedPlayer(null);
    setStatsLoading(true);
    setStatsError("");

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
        data.games?.[
          String(game.id)
        ];

      setPlayerStats(
        Array.isArray(
          gameStatistics?.response
        )
          ? gameStatistics.response
          : []
      );
    } catch (loadError) {
      console.error(loadError);

      setStatsError(
        "No ha sido posible cargar las estadísticas."
      );
    } finally {
      setStatsLoading(false);
    }
  }

  function openPlayer(stat) {
    setSelectedPlayer(stat);
  }

  function closePlayer() {
    setSelectedPlayer(null);
  }

  function closeGame() {
    setSelectedGame(null);
    setSelectedPlayer(null);
    setPlayerStats([]);
  }

  function changeTab(newTab) {
    setSelectedGame(null);
    setSelectedPlayer(null);
    setPlayerStats([]);
    setTab(newTab);

    window.scrollTo(0, 0);
  }

  function getSpanishSeasonPlayer(
    stat
  ) {
    const matchedSpanishPlayer =
      findSpanishPlayer(
        stat.player
      );

    if (!matchedSpanishPlayer) {
      return null;
    }

    const expectedName =
      normalizeText(
        `${matchedSpanishPlayer.firstname} ${matchedSpanishPlayer.lastname}`
      );

    const reversedName =
      normalizeText(
        `${matchedSpanishPlayer.lastname} ${matchedSpanishPlayer.firstname}`
      );

    return (
      spanishSeasonPlayers.find(
        (player) => {
          const playerName =
            normalizeText(
              player.player_name
            );

          return (
            (
              playerName ===
                expectedName ||
              playerName ===
                reversedName
            ) &&
            player.team ===
              stat.team?.code
          );
        }
      ) ||
      spanishSeasonPlayers.find(
        (player) => {
          const playerName =
            normalizeText(
              player.player_name
            );

          return (
            playerName ===
              expectedName ||
            playerName ===
              reversedName
          );
        }
      )
    );
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
        <div className="flex items-center px-4 py-3">
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
              <div className="font-black">
                ÑBA
              </div>

              <div className="text-[10px] text-slate-500">
                Resultados, clasificación y españoles
              </div>
            </div>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        {selectedPlayer &&
        selectedGame ? (
          <PlayerDetail
            stat={selectedPlayer}
            game={selectedGame}
            seasonPlayer={
              selectedSeasonPlayer
            }
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
            <section className="mb-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 px-5 py-4 text-white">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase">
                <CalendarDays size={14} />
                ÑBA
              </div>

              <h1 className="text-2xl font-black">
                Baloncesto con Ñ.
              </h1>

              <p className="mt-1 text-xs text-orange-50">
                Partidos, clasificación y actuaciones españolas.
              </p>
            </section>

            {tab === "Scores" && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-black">
                      Partidos
                    </h2>

                    <p className="text-xs text-slate-400">
                      {gameDate}
                    </p>
                  </div>

                  <button
                    onClick={loadGames}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
                  >
                    <RefreshCw
                      size={14}
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
                  <div className="p-8 text-center">
                    Cargando...
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-red-700">
                    {error}
                  </div>
                )}

                {!loading &&
                  games.map(
                    (game) => {
                      const visitorsPoints =
                        game.scores
                          ?.visitors
                          ?.points;

                      const homePoints =
                        game.scores
                          ?.home
                          ?.points;

                      const finished =
                        game.status
                          ?.short === 3;

                      return (
                        <button
                          key={game.id}
                          onClick={() =>
                            openGame(game)
                          }
                          className="mb-4 w-full rounded-3xl border border-slate-200 p-5 text-left shadow-sm"
                        >
                          <div className="mb-4 text-xs font-bold text-slate-500">
                            {formatGameStatus(
                              game
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
                                finished &&
                                visitorsPoints >
                                  homePoints
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
                                finished &&
                                homePoints >
                                  visitorsPoints
                              }
                            />
                          </div>

                          <div className="mt-4 text-right text-xs font-bold text-orange-600">
                            Ver partido →
                          </div>
                        </button>
                      );
                    }
                  )}
              </section>
            )}

            {tab === "Standings" && (
              <StandingsView
                standings={standings}
                loading={
                  standingsLoading
                }
                error={
                  standingsError
                }
                onRefresh={
                  loadStandings
                }
              />
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
                    Actuación disponible y promedios de temporada.
                  </p>
                </div>

                {spanishLoading && (
                  <div className="p-8 text-center">
                    Cargando...
                  </div>
                )}

                {spanishError && (
                  <div className="rounded-xl bg-red-50 p-4 text-red-700">
                    {spanishError}
                  </div>
                )}

                {!spanishLoading &&
                  !spanishError &&
                  spanishPerformances.length === 0 && (
                    <div className="rounded-3xl bg-slate-100 p-8 text-center">
                      No hay actuaciones españolas disponibles.
                    </div>
                  )}

                <div className="space-y-4">
                  {spanishPerformances.map(
                    (stat) => (
                      <SpanishPerformanceCard
                        key={`${stat.game?.id}-${stat.player?.id}`}
                        stat={stat}
                        seasonPlayer={getSpanishSeasonPlayer(
                          stat
                        )}
                      />
                    )
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {showBottomNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-slate-200 bg-white/95 px-2 pt-2 md:hidden"
          style={{
            paddingBottom:
              "calc(0.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {nav.map(
            ([label, Icon]) => {
              const visibleLabel =
                label === "Scores"
                  ? "Partidos"
                  : label ===
                    "Standings"
                  ? "Clasificación"
                  : "Españoles";

              return (
                <button
                  key={label}
                  onClick={() =>
                    changeTab(label)
                  }
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] ${
                    tab === label
                      ? "bg-slate-950 text-white"
                      : "text-slate-500"
                  }`}
                >
                  <Icon size={18} />

                  {visibleLabel}
                </button>
              );
            }
          )}
        </nav>
      )}

      <footer className="px-5 pb-24 pt-8 text-xs text-slate-400">
        ÑBA · Datos de temporada: BoxScore Lab · CC BY 4.0
      </footer>
    </div>
  );
}
