import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Trophy,
  BarChart3,
  Flag,
  CircleHelp,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Search,
  DollarSign,
  TrendingUp,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CheckCircle2,
  XCircle,
  RotateCcw,
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

const SPANISH_PLAYERS = [
  "Santi Aldama",
  "Sergio De Larrea",
  "Hugo Gonzalez",
  "Aday Mara",
  "Baba Miller",
];

const NAV = [
  ["Scores", Activity, "Partidos"],
  ["Standings", Trophy, "Clasificación"],
  ["Players", BarChart3, "Jugadores"],
  ["Spanish", Flag, "Españoles"],
  ["Quiz", CircleHelp, "Quiz"],
];

const STAT_CATEGORIES = [
  {
    key: "points_pg",
    label: "PTS",
    title: "Puntos por partido",
  },
  {
    key: "rebounds_pg",
    label: "REB",
    title: "Rebotes por partido",
  },
  {
    key: "assists_pg",
    label: "AST",
    title: "Asistencias por partido",
  },
  {
    key: "steals_pg",
    label: "ROB",
    title: "Robos por partido",
  },
  {
    key: "blocks_pg",
    label: "TAP",
    title: "Tapones por partido",
  },
  {
    key: "three_point_makes_pg",
    label: "3PT",
    title: "Triples anotados por partido",
  },
  {
    key: "field_goal_pct",
    label: "TC%",
    title: "Porcentaje de tiros de campo",
    percentage: true,
  },
  {
    key: "three_point_pct",
    label: "3PT%",
    title: "Porcentaje de triples",
    percentage: true,
  },
  {
    key: "free_throw_pct",
    label: "TL%",
    title: "Porcentaje de tiros libres",
    percentage: true,
  },
  {
    key: "ts_pct",
    label: "TS%",
    title: "True Shooting",
    percentage: true,
  },
];

const SALARY_CATEGORIES = [
  {
    key: "costPerPoint",
    label: "$/PTS",
    title: "Coste por punto",
  },
  {
    key: "costPerRebound",
    label: "$/REB",
    title: "Coste por rebote",
  },
  {
    key: "costPerAssist",
    label: "$/AST",
    title: "Coste por asistencia",
  },
  {
    key: "costPerSteal",
    label: "$/ROB",
    title: "Coste por robo",
  },
  {
    key: "costPerBlock",
    label: "$/TAP",
    title: "Coste por tapón",
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

function boxPlayerName(player) {
  return `${player?.firstname || ""} ${
    player?.lastname || ""
  }`.trim();
}

function reversedBoxPlayerName(player) {
  return `${player?.lastname || ""} ${
    player?.firstname || ""
  }`.trim();
}

function isSpanishName(name) {
  const normalized = normalizeText(name);

  return SPANISH_PLAYERS.some((spanishName) => {
    const parts = spanishName.split(" ");
    const reverse = `${parts.slice(1).join(" ")} ${parts[0]}`;

    return (
      normalized === normalizeText(spanishName) ||
      normalized === normalizeText(reverse)
    );
  });
}

function canonicalSpanishName(player) {
  const normal = normalizeText(boxPlayerName(player));
  const reverse = normalizeText(reversedBoxPlayerName(player));

  return (
    SPANISH_PLAYERS.find((name) => {
      const expected = normalizeText(name);
      return expected === normal || expected === reverse;
    }) || boxPlayerName(player)
  );
}

function teamLogo(code) {
  const id = NBA_TEAM_IDS[code];

  return id
    ? `https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`
    : "";
}

function formatNumber(value, decimals = 1) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "-";
  }

  return Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatPercentage(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "-";
  }

  return `${formatNumber(Number(value) * 100, 1)}%`;
}

function formatMoney(value) {
  if (!Number.isFinite(Number(value))) {
    return "-";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactMoney(value) {
  if (!Number.isFinite(Number(value))) {
    return "-";
  }

  return new Intl.NumberFormat("es-ES", {
    notation: "compact",
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
  }).format(value);
}

function safeDivide(numerator, denominator) {
  const first = Number(numerator || 0);
  const second = Number(denominator || 0);

  if (second <= 0) {
    return null;
  }

  return first / second;
}

function formatGameStatus(game) {
  if (game.status?.short === 3) {
    return "FINAL";
  }

  if (game.status?.short === 2) {
    const quarter = game.periods?.current;

    return `${quarter ? `Q${quarter}` : "EN JUEGO"}${
      game.status?.clock ? ` · ${game.status.clock}` : ""
    }`;
  }

  return game.status?.long?.toUpperCase() || "PROGRAMADO";
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scrollTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function Logo({
  code,
  name,
  size = "normal",
}) {
  const [logoError, setLogoError] = useState(false);
  const url = teamLogo(code);

  useEffect(() => {
    setLogoError(false);
  }, [code]);

  const boxClass =
    size === "large"
      ? "h-16 w-16"
      : "h-10 w-10";

  const imageClass =
    size === "large"
      ? "h-13 w-13"
      : "h-8 w-8";

  return (
    <div
      className={`grid ${boxClass} flex-shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm`}
    >
      {url && !logoError ? (
        <img
          src={url}
          alt={name || code}
          className={`${imageClass} object-contain`}
          onError={() => setLogoError(true)}
        />
      ) : (
        <span className="text-xs font-black">
          {code || "NBA"}
        </span>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  featured = false,
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
        }`}
      >
        {value}
      </div>

      <div className="mt-1 text-[9px] font-bold uppercase text-slate-400">
        {label}
      </div>
    </div>
  );
}

function Loading({
  text = "Cargando...",
}) {
  return (
    <div className="rounded-3xl bg-slate-100 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function ErrorBox({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-5 text-sm text-red-700">
      <AlertCircle size={19} />
      {text}
    </div>
  );
}

function TeamRow({
  team,
  score,
}) {
  return (
    <div className="flex flex-shrink-0 items-center gap-3">
      <Logo
        code={team?.code}
        name={team?.name}
      />

      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">
          {team?.name}
        </div>

        <div className="text-xs text-slate-400">
          {team?.code}
        </div>
      </div>

      <div className="text-2xl font-black">
        {score?.points ?? "-"}
      </div>
    </div>
  );
}

function mergeSeasonStatsAndSalaries(
  stats,
  salaries
) {
  const salaryByPlayerAndTeam = new Map();
  const salaryByPlayer = new Map();

  salaries.forEach((salary) => {
    const name = normalizeText(salary.player_name);
    const team = salary.team || "";

    salaryByPlayerAndTeam.set(
      `${name}|${team}`,
      salary
    );

    salaryByPlayer.set(name, salary);
  });

  return stats.map((player) => {
    const name = normalizeText(player.player_name);
    const team = player.team || "";

    const salaryRecord =
      salaryByPlayerAndTeam.get(`${name}|${team}`) ||
      salaryByPlayer.get(name) ||
      null;

    const salary = Number(salaryRecord?.salary || 0);
    const games = Number(player.games_played || 0);

    return {
      ...player,
      salary: salary || null,
      minutes_pg: safeDivide(player.minutes, games),
      steals_pg: safeDivide(player.steals, games),
      blocks_pg: safeDivide(player.blocks, games),
      turnovers_pg: safeDivide(player.turnovers, games),
      three_point_makes_pg: safeDivide(
        player.three_point_makes,
        games
      ),
      costPerPoint: salary
        ? safeDivide(salary, player.points)
        : null,
      costPerRebound: salary
        ? safeDivide(salary, player.rebounds)
        : null,
      costPerAssist: salary
        ? safeDivide(salary, player.assists)
        : null,
      costPerSteal: salary
        ? safeDivide(salary, player.steals)
        : null,
      costPerBlock: salary
        ? safeDivide(salary, player.blocks)
        : null,
    };
  });
}

function findSeasonPlayerForBoxScore(
  boxScore,
  seasonPlayers
) {
  if (!boxScore) {
    return null;
  }

  const normal = normalizeText(
    boxPlayerName(boxScore.player)
  );

  const reverse = normalizeText(
    reversedBoxPlayerName(boxScore.player)
  );

  const team = boxScore.team?.code;

  return (
    seasonPlayers.find(
      (player) =>
        player.team === team &&
        [normal, reverse].includes(
          normalizeText(player.player_name)
        )
    ) ||
    seasonPlayers.find((player) =>
      [normal, reverse].includes(
        normalizeText(player.player_name)
      )
    ) ||
    null
  );
}

function SeasonPlayerDetail({
  player,
  onBack,
}) {
  if (!player) {
    return null;
  }

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
      >
        <ArrowLeft size={18} />
        Volver
      </button>

      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-5 text-white">
          <div className="flex items-center gap-4">
            <Logo
              code={player.team}
              name={player.player_name}
              size="large"
            />

            <div className="min-w-0">
              <h1 className="text-2xl font-black">
                {player.player_name}
              </h1>

              <p className="mt-1 text-sm text-orange-100">
                {player.team} · {player.position || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="mb-3 text-xs font-bold uppercase text-orange-600">
            Temporada 2026-27
          </p>

          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="Partidos"
              value={player.games_played}
            />
            <StatBox
              label="Minutos"
              value={formatNumber(player.minutes_pg)}
            />
            <StatBox
              label="Puntos"
              value={formatNumber(player.points_pg)}
              featured
            />
            <StatBox
              label="Rebotes"
              value={formatNumber(player.rebounds_pg)}
            />
            <StatBox
              label="Asistencias"
              value={formatNumber(player.assists_pg)}
            />
            <StatBox
              label="Robos"
              value={formatNumber(player.steals_pg)}
            />
            <StatBox
              label="Tapones"
              value={formatNumber(player.blocks_pg)}
            />
            <StatBox
              label="Pérdidas"
              value={formatNumber(player.turnovers_pg)}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <p className="mb-3 text-xs font-bold uppercase text-orange-600">
            Porcentajes
          </p>

          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="TC"
              value={formatPercentage(
                player.field_goal_pct
              )}
            />
            <StatBox
              label="3PT"
              value={formatPercentage(
                player.three_point_pct
              )}
            />
            <StatBox
              label="TL"
              value={formatPercentage(
                player.free_throw_pct
              )}
            />
            <StatBox
              label="True Shooting"
              value={formatPercentage(
                player.ts_pct
              )}
            />
            <StatBox
              label="Uso"
              value={formatPercentage(
                player.usage_rate
              )}
            />
            <StatBox
              label="Rating neto"
              value={formatNumber(player.net_rating)}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <p className="mb-3 text-xs font-bold uppercase text-orange-600">
            Salario y coste
          </p>

          {player.salary ? (
            <>
              <div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white">
                <div className="text-xs text-slate-300">
                  Salario anual
                </div>

                <div className="mt-1 text-2xl font-black">
                  {formatMoney(player.salary)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Coste/punto"
                  value={formatMoney(player.costPerPoint)}
                />
                <StatBox
                  label="Coste/rebote"
                  value={formatMoney(player.costPerRebound)}
                />
                <StatBox
                  label="Coste/asistencia"
                  value={formatMoney(player.costPerAssist)}
                />
                <StatBox
                  label="Coste/robo"
                  value={formatMoney(player.costPerSteal)}
                />
                <StatBox
                  label="Coste/tapón"
                  value={formatMoney(player.costPerBlock)}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No se ha encontrado el salario del jugador.
            </p>
          )}
        </div>
      </article>
    </section>
  );
}

function PlayersView({
  players,
  onSelect,
}) {
  const [mode, setMode] = useState("stats");
  const [statCategory, setStatCategory] =
    useState("points_pg");
  const [salaryCategory, setSalaryCategory] =
    useState("costPerPoint");
  const [sortDirection, setSortDirection] =
    useState("desc");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);

  const categories =
    mode === "stats"
      ? STAT_CATEGORIES
      : SALARY_CATEGORIES;

  const selectedKey =
    mode === "stats"
      ? statCategory
      : salaryCategory;

  const category =
    categories.find(
      (item) => item.key === selectedKey
    ) || categories[0];

  const rankedPlayers = useMemo(() => {
    const searchValue =
      normalizeText(search);

    return players
      .filter((player) => {
        const matchesSearch =
          !searchValue ||
          normalizeText(player.player_name).includes(
            searchValue
          ) ||
          normalizeText(player.team).includes(
            searchValue
          );

        if (!matchesSearch) {
          return false;
        }

        const value =
          Number(player[category.key]);

        if (!Number.isFinite(value)) {
          return false;
        }

        if (mode === "salary") {
          return (
            Number(player.salary || 0) > 0 &&
            value > 0
          );
        }

        return true;
      })
      .sort((first, second) => {
        const firstValue =
          Number(first[category.key]);

        const secondValue =
          Number(second[category.key]);

        if (sortDirection === "asc") {
          return (
            firstValue - secondValue ||
            String(first.player_name).localeCompare(
              String(second.player_name),
              "es"
            )
          );
        }

        return (
          secondValue - firstValue ||
          String(first.player_name).localeCompare(
            String(second.player_name),
            "es"
          )
        );
      });
  }, [
    players,
    search,
    category,
    mode,
    sortDirection,
  ]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setLimit(50);

    if (nextMode === "stats") {
      setSortDirection("desc");
    } else {
      setSortDirection("asc");
    }
  }

  function changeCategory(key) {
    if (mode === "stats") {
      setStatCategory(key);
    } else {
      setSalaryCategory(key);
    }

    setLimit(50);
  }

  function displayValue(player) {
    const value =
      player[category.key];

    if (mode === "salary") {
      return formatCompactMoney(
        value
      );
    }

    if (category.percentage) {
      return formatPercentage(
        value
      );
    }

    return formatNumber(value);
  }

  const ascending =
    sortDirection === "asc";

  return (
    <section>
      <p className="text-xs font-semibold text-orange-600">
        TEMPORADA 2026-27
      </p>

      <h2 className="text-xl font-black">
        Ranking de jugadores
      </h2>

      <div className="my-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <button
          onClick={() =>
            changeMode("stats")
          }
          className={`rounded-xl py-2 text-xs font-bold ${
            mode === "stats"
              ? "bg-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <TrendingUp size={15} />
            Estadísticas
          </span>
        </button>

        <button
          onClick={() =>
            changeMode("salary")
          }
          className={`rounded-xl py-2 text-xs font-bold ${
            mode === "salary"
              ? "bg-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          <span className="flex items-center justify-center gap-1">
            <DollarSign size={15} />
            Coste salarial
          </span>
        </button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {categories.map(
          (item) => (
            <button
              key={item.key}
              onClick={() =>
                changeCategory(
                  item.key
                )
              }
              className={`flex-shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${
                category.key ===
                item.key
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.label}
            </button>
          )
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1">
        <button
          onClick={() => {
            setSortDirection(
              "desc"
            );
            setLimit(50);
          }}
          className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold ${
            !ascending
              ? "bg-slate-950 text-white"
              : "text-slate-500"
          }`}
        >
          <ArrowDownWideNarrow
            size={15}
          />
          Mayor a menor
        </button>

        <button
          onClick={() => {
            setSortDirection(
              "asc"
            );
            setLimit(50);
          }}
          className={`flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold ${
            ascending
              ? "bg-slate-950 text-white"
              : "text-slate-500"
          }`}
        >
          <ArrowUpNarrowWide
            size={15}
          />
          Menor a mayor
        </button>
      </div>

      <div className="relative mb-4">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(event) => {
            setSearch(
              event.target.value
            );
            setLimit(50);
          }}
          placeholder="Buscar jugador o equipo"
          className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400"
        />
      </div>

      <div className="mb-3 rounded-2xl bg-orange-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-orange-700">
              {category.title}
            </div>

            <div className="mt-1 text-[10px] text-orange-600">
              Orden:{" "}
              <strong>
                {ascending
                  ? "menor a mayor"
                  : "mayor a menor"}
              </strong>
            </div>
          </div>

          {ascending ? (
            <ArrowUpNarrowWide
              size={20}
              className="text-orange-600"
            />
          ) : (
            <ArrowDownWideNarrow
              size={20}
              className="text-orange-600"
            />
          )}
        </div>

        {mode === "salary" && (
          <div className="mt-2 text-[10px] text-orange-600">
            En eficiencia salarial, ordenar de menor a mayor
            muestra primero a los jugadores con menor coste por
            unidad estadística.
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[30px_minmax(0,1fr)_74px] bg-slate-100 px-3 py-2 text-[9px] font-bold uppercase text-slate-500">
          <div>#</div>
          <div>Jugador</div>
          <div className="text-right">
            {category.label}
          </div>
        </div>

        {rankedPlayers
          .slice(0, limit)
          .map(
            (
              player,
              index
            ) => (
              <button
                key={`${player.player_name}-${player.team}`}
                onClick={() =>
                  onSelect(player)
                }
                className="grid w-full grid-cols-[30px_minmax(0,1fr)_74px] items-center border-t border-slate-200 px-3 py-3 text-left active:bg-orange-50"
              >
                <div className="text-xs font-black text-slate-400">
                  {index + 1}
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <Logo
                    code={
                      player.team
                    }
                    name={
                      player.player_name
                    }
                  />

                  <div className="min-w-0">
                    <div className="whitespace-normal text-xs font-bold leading-4">
                      {
                        player.player_name
                      }
                    </div>

                    <div className="mt-0.5 text-[9px] text-slate-400">
                      {player.team} ·{" "}
                      {player.position ||
                        "-"}{" "}
                      ·{" "}
                      {
                        player.games_played
                      }{" "}
                      PJ
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs font-black text-orange-600">
                  {displayValue(
                    player
                  )}
                </div>
              </button>
            )
          )}
      </div>

      {rankedPlayers.length === 0 && (
        <div className="rounded-b-2xl bg-slate-100 p-8 text-center text-sm text-slate-500">
          No hay jugadores que cumplan los filtros seleccionados.
        </div>
      )}

      {limit <
        rankedPlayers.length && (
        <button
          onClick={() =>
            setLimit(
              (current) =>
                current + 50
            )
          }
          className="mt-4 w-full rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white"
        >
          Mostrar 50 más
        </button>
      )}
    </section>
  );
}

function StandingsView({
  standings,
}) {
  const [
    conference,
    setConference,
  ] = useState("East");

  const teams =
    useMemo(() => {
      return standings
        .filter(
          (team) =>
            conference ===
            "East"
              ? EAST_TEAMS.has(
                  team.team
                )
              : !EAST_TEAMS.has(
                  team.team
                )
        )
        .sort(
          (a, b) =>
            Number(
              b.win_pct || 0
            ) -
              Number(
                a.win_pct || 0
              ) ||
            Number(
              b.wins || 0
            ) -
              Number(
                a.wins || 0
              )
        );
    }, [
      standings,
      conference,
    ]);

  return (
    <section>
      <p className="text-xs font-semibold text-orange-600">
        TEMPORADA 2026-27
      </p>

      <h2 className="mb-4 text-xl font-black">
        Clasificación
      </h2>

      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <button
          onClick={() =>
            setConference(
              "East"
            )
          }
          className={`rounded-xl py-2 text-sm font-bold ${
            conference ===
            "East"
              ? "bg-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          Este
        </button>

        <button
          onClick={() =>
            setConference(
              "West"
            )
          }
          className={`rounded-xl py-2 text-sm font-bold ${
            conference ===
            "West"
              ? "bg-white shadow-sm"
              : "text-slate-500"
          }`}
        >
          Oeste
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[28px_minmax(0,1fr)_28px_28px_48px] bg-slate-100 px-2 py-2 text-[9px] font-bold uppercase text-slate-500">
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
          (team, index) => (
            <div
              key={team.team}
              className={`grid grid-cols-[28px_minmax(0,1fr)_28px_28px_48px] items-center border-t border-slate-200 px-2 py-3 ${
                index < 6
                  ? "border-l-4 border-l-emerald-500"
                  : index < 10
                  ? "border-l-4 border-l-orange-400"
                  : "border-l-4 border-l-slate-200"
              }`}
            >
              <div className="text-xs font-black text-slate-400">
                {index + 1}
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <Logo
                  code={team.team}
                  name={
                    team.team_name
                  }
                />

                <div className="min-w-0">
                  <div className="truncate text-xs font-bold">
                    {
                      team.team_name
                    }
                  </div>

                  <div className="text-[9px] text-slate-400">
                    {team.team}
                  </div>
                </div>
              </div>

              <div className="text-center text-xs font-bold">
                {team.wins}
              </div>

              <div className="text-center text-xs">
                {team.losses}
              </div>

              <div className="text-right text-xs font-bold">
                {Number(
                  team.win_pct
                )
                  .toFixed(3)
                  .replace(
                    /^0/,
                    ""
                  )}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

function PlayerBoxScore({
  team,
  stats,
  onSelect,
}) {
  const players =
    stats
      .filter(
        (stat) =>
          stat.team?.id ===
          team?.id
      )
      .sort(
        (a, b) =>
          Number(
            b.min || 0
          ) -
          Number(
            a.min || 0
          )
      );

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Logo
          code={team?.code}
          name={team?.name}
        />

        <div>
          <div className="font-black">
            {team?.name}
          </div>

          <div className="text-xs text-slate-400">
            {players.length} jugadores
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[minmax(125px,1fr)_34px_36px_36px_36px] bg-slate-100 px-2 py-2 text-[9px] font-bold text-slate-500">
          <div>JUGADOR</div>
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

        {players.map(
          (stat) => (
            <button
              key={
                stat.player?.id
              }
              onClick={() =>
                onSelect(stat)
              }
              className="grid w-full grid-cols-[minmax(125px,1fr)_34px_36px_36px_36px] items-center border-t border-slate-200 px-2 py-3 text-left"
            >
              <div className="pr-1 text-[13px] font-bold leading-4">
                {boxPlayerName(
                  stat.player
                )}
              </div>

              <div className="text-center text-xs">
                {stat.min ?? "-"}
              </div>

              <div className="text-center text-xs font-black text-orange-600">
                {stat.points ?? 0}
              </div>

              <div className="text-center text-xs">
                {stat.totReb ?? 0}
              </div>

              <div className="text-center text-xs">
                {stat.assists ?? 0}
              </div>
            </button>
          )
        )}
      </div>
    </div>
  );
}

function GameDetail({
  game,
  stats,
  loading,
  error,
  onBack,
  onPlayer,
}) {
  const visitors =
    game.teams?.visitors;

  const home =
    game.teams?.home;

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
      >
        <ArrowLeft size={18} />
        Partidos
      </button>

      <article className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 text-center text-sm font-black text-white">
          {formatGameStatus(
            game
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-5">
          <div className="flex flex-col items-center text-center">
            <Logo
              code={
                visitors?.code
              }
              name={
                visitors?.name
              }
              size="large"
            />

            <div className="mt-2 text-xs font-bold">
              {visitors?.name}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-black">
              {game.scores
                ?.visitors
                ?.points ?? "-"}
            </span>

            <span className="text-slate-300">
              -
            </span>

            <span className="text-3xl font-black">
              {game.scores
                ?.home
                ?.points ?? "-"}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <Logo
              code={home?.code}
              name={home?.name}
              size="large"
            />

            <div className="mt-2 text-xs font-bold">
              {home?.name}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <h3 className="mb-4 text-lg font-black">
            Estadísticas del partido
          </h3>

          {loading && (
            <Loading text="Cargando estadísticas..." />
          )}

          {!loading &&
            error && (
              <ErrorBox
                text={error}
              />
            )}

          {!loading &&
            !error &&
            stats.length >
              0 && (
              <div className="space-y-7">
                <PlayerBoxScore
                  team={visitors}
                  stats={stats}
                  onSelect={
                    onPlayer
                  }
                />

                <PlayerBoxScore
                  team={home}
                  stats={stats}
                  onSelect={
                    onPlayer
                  }
                />
              </div>
            )}
        </div>
      </article>
    </section>
  );
}

function GamePlayerDetail({
  stat,
  seasonPlayer,
  onBack,
}) {
  return (
    <section>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
      >
        <ArrowLeft size={18} />
        Volver al partido
      </button>

      <article className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-5 text-white">
          <h1 className="text-2xl font-black">
            {boxPlayerName(
              stat.player
            )}
          </h1>

          <p className="mt-1 text-sm text-orange-100">
            {stat.team?.name} ·{" "}
            {stat.pos || "-"}
          </p>
        </div>

        <div className="p-5">
          <p className="mb-3 text-xs font-bold uppercase text-orange-600">
            Este partido
          </p>

          <div className="grid grid-cols-2 gap-3">
            <StatBox
              label="MIN"
              value={
                stat.min ?? "-"
              }
            />

            <StatBox
              label="PTS"
              value={
                stat.points ?? 0
              }
              featured
            />

            <StatBox
              label="REB"
              value={
                stat.totReb ?? 0
              }
            />

            <StatBox
              label="AST"
              value={
                stat.assists ?? 0
              }
            />

            <StatBox
              label="ROB"
              value={
                stat.steals ?? 0
              }
            />

            <StatBox
              label="TAP"
              value={
                stat.blocks ?? 0
              }
            />

            <StatBox
              label="PERD"
              value={
                stat.turnovers ?? 0
              }
            />

            <StatBox
              label="+/-"
              value={
                stat.plusMinus ??
                "-"
              }
            />
          </div>
        </div>

        {seasonPlayer && (
          <div className="border-t border-slate-200 p-5">
            <p className="mb-3 text-xs font-bold uppercase text-orange-600">
              Temporada 2026-27
            </p>

            <div className="grid grid-cols-2 gap-3">
              <StatBox
                label="PJ"
                value={
                  seasonPlayer.games_played
                }
              />

              <StatBox
                label="MIN"
                value={formatNumber(
                  seasonPlayer.minutes_pg
                )}
              />

              <StatBox
                label="PTS"
                value={formatNumber(
                  seasonPlayer.points_pg
                )}
                featured
              />

              <StatBox
                label="REB"
                value={formatNumber(
                  seasonPlayer.rebounds_pg
                )}
              />

              <StatBox
                label="AST"
                value={formatNumber(
                  seasonPlayer.assists_pg
                )}
              />

              <StatBox
                label="ROB"
                value={formatNumber(
                  seasonPlayer.steals_pg
                )}
              />

              <StatBox
                label="TAP"
                value={formatNumber(
                  seasonPlayer.blocks_pg
                )}
              />

              <StatBox
                label="TS%"
                value={formatPercentage(
                  seasonPlayer.ts_pct
                )}
              />
            </div>
          </div>
        )}
      </article>
    </section>
  );
}

function SpanishDailyCard({
  performance,
  game,
  seasonPlayer,
  onOpenGame,
}) {
  const canonicalName =
    canonicalSpanishName(
      performance.player
    );

  const opponent = game
    ? game.teams?.visitors
        ?.id ===
      performance.team?.id
      ? game.teams?.home
      : game.teams
          ?.visitors
    : null;

  return (
    <article className="rounded-3xl border border-orange-200 bg-orange-50/40 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <Logo
          code={
            performance.team?.code
          }
          name={
            performance.team?.name
          }
        />

        <div className="min-w-0">
          <h3 className="font-black">
            {canonicalName}
          </h3>

          <p className="text-xs text-slate-500">
            {
              performance.team
                ?.name
            }
            {opponent
              ? ` vs ${opponent.name}`
              : ""}
          </p>

          {game && (
            <p className="mt-0.5 text-[10px] text-slate-400">
              {formatGameStatus(
                game
              )}
              {" · "}
              {formatDate(
                game.date?.start
              )}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatBox
          label="MIN"
          value={
            performance.min ??
            "-"
          }
        />

        <StatBox
          label="PTS"
          value={
            performance.points ??
            0
          }
          featured
        />

        <StatBox
          label="REB"
          value={
            performance.totReb ??
            0
          }
        />

        <StatBox
          label="AST"
          value={
            performance.assists ??
            0
          }
        />
      </div>

      {game && (
        <button
          onClick={() =>
            onOpenGame(game)
          }
          className="mt-4 w-full rounded-2xl bg-orange-500 py-2.5 text-xs font-bold text-white"
        >
          Ver partido completo
        </button>
      )}

      {seasonPlayer && (
        <div className="mt-4 border-t border-orange-200 pt-3 text-[10px] text-slate-500">
          Temporada:{" "}
          <strong>
            {formatNumber(
              seasonPlayer.points_pg
            )}{" "}
            PTS
          </strong>
          {" · "}
          {formatNumber(
            seasonPlayer.rebounds_pg
          )}{" "}
          REB
          {" · "}
          {formatNumber(
            seasonPlayer.assists_pg
          )}{" "}
          AST
        </div>
      )}
    </article>
  );
}

function SpanishSeasonCard({
  player,
  onSelect,
}) {
  return (
    <button
      onClick={() =>
        onSelect(player)
      }
      className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm"
    >
      <div className="mb-4 flex items-center gap-3">
        <Logo
          code={player.team}
          name={
            player.player_name
          }
        />

        <div>
          <h3 className="font-black">
            {player.player_name}
          </h3>

          <p className="text-xs text-slate-500">
            {player.team} ·{" "}
            {player.position ||
              "-"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <StatBox
          label="PJ"
          value={
            player.games_played
          }
        />

        <StatBox
          label="PTS"
          value={formatNumber(
            player.points_pg
          )}
          featured
        />

        <StatBox
          label="REB"
          value={formatNumber(
            player.rebounds_pg
          )}
        />

        <StatBox
          label="AST"
          value={formatNumber(
            player.assists_pg
          )}
        />
      </div>
    </button>
  );
}

function SpanishView({
  seasonPlayers,
  dailyPerformances,
  games,
  onOpenGame,
  onSelectSeasonPlayer,
}) {
  const dailyItems =
    dailyPerformances
      .map(
        (performance) => {
          const game =
            games.find(
              (item) =>
                String(
                  item.id
                ) ===
                String(
                  performance
                    .game?.id
                )
            ) || null;

          const seasonPlayer =
            findSeasonPlayerForBoxScore(
              performance,
              seasonPlayers
            );

          return {
            performance,
            game,
            seasonPlayer,
          };
        }
      )
      .sort(
        (a, b) =>
          Number(
            b.performance
              .points || 0
          ) -
          Number(
            a.performance
              .points || 0
          )
      );

  const spanishSeasonPlayers =
    seasonPlayers
      .filter(
        (player) =>
          isSpanishName(
            player.player_name
          )
      )
      .sort(
        (a, b) =>
          Number(
            b.points_pg || 0
          ) -
          Number(
            a.points_pg || 0
          )
      );

  return (
    <section>
      <p className="text-xs font-semibold text-orange-600">
        ÚLTIMA JORNADA
      </p>

      <h2 className="text-xl font-black">
        Actuaciones españolas
      </h2>

      <div className="mt-4 space-y-4">
        {dailyItems.length >
        0 ? (
          dailyItems.map(
            ({
              performance,
              game,
              seasonPlayer,
            }) => (
              <SpanishDailyCard
                key={`${performance.game?.id}-${performance.player?.id}`}
                performance={
                  performance
                }
                game={game}
                seasonPlayer={
                  seasonPlayer
                }
                onOpenGame={
                  onOpenGame
                }
              />
            )
          )
        ) : (
          <div className="rounded-3xl bg-slate-100 p-8 text-center">
            <Flag
              size={30}
              className="mx-auto mb-3 text-orange-500"
            />

            <p className="font-bold">
              Sin actuaciones españolas
            </p>
          </div>
        )}
      </div>

      <div className="mb-4 mt-8">
        <p className="text-xs font-semibold text-orange-600">
          TEMPORADA 2026-27
        </p>

        <h2 className="text-xl font-black">
          Promedios de temporada
        </h2>
      </div>

      <div className="space-y-4">
        {spanishSeasonPlayers.map(
          (player) => (
            <SpanishSeasonCard
              key={`${player.player_name}-${player.team}`}
              player={player}
              onSelect={
                onSelectSeasonPlayer
              }
            />
          )
        )}
      </div>
    </section>
  );
}


function Quiz({ questions }) {
  const [game, setGame] = useState([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  function start() {
    const mixed = [...questions];
    for (let i = mixed.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
    }
    setGame(mixed.slice(0, Math.min(10, mixed.length)));
    setIndex(0);
    setAnswer(null);
    setScore(0);
    setFinished(false);
    scrollTop();
  }

  useEffect(() => {
    if (questions.length) start();
  }, [questions]);

  if (!questions.length) return <ErrorBox text="No se han podido cargar las preguntas del Quiz." />;
  if (!game.length) return <Loading text="Preparando Quiz..." />;

  if (finished) {
    return <section><div className="rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 p-7 text-center text-white"><p className="text-xs font-bold uppercase tracking-widest text-orange-100">Resultado</p><div className="mt-4 text-6xl font-black">{score}/{game.length}</div><div className="mt-2 text-xl font-black">{Math.round(score/game.length*100)}%</div></div><button onClick={start} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-4 font-black text-white"><RotateCcw size={18}/>Jugar otra vez</button></section>;
  }

  const q = game[index];
  const answered = answer !== null;
  const correct = answer === q.correctAnswer;
  function choose(i) { if (answered) return; setAnswer(i); if (i === q.correctAnswer) setScore(s => s + 1); }
  function next() { if (index === game.length - 1) { setFinished(true); scrollTop(); } else { setIndex(i => i + 1); setAnswer(null); scrollTop(); } }

  return <section><div className="mb-5"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase text-orange-600">QUIZ ÑBA</p><h2 className="text-xl font-black">Pregunta {index+1} de {game.length}</h2></div><div className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white">{score} aciertos</div></div><div className="mt-4 flex gap-1">{game.map((_,i)=><div key={i} className={`h-1.5 flex-1 rounded-full ${i<index?"bg-orange-500":i===index?"bg-slate-950":"bg-slate-200"}`}/>)}</div></div><article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex gap-2"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase text-orange-600">{q.category||"NBA"}</span></div><h3 className="mb-6 text-xl font-black leading-7">{q.question}</h3><div className="space-y-3">{q.options.map((option,i)=>{let cls="border-slate-200 bg-white";if(answered&&i===q.correctAnswer)cls="border-emerald-500 bg-emerald-50 text-emerald-800";else if(answered&&i===answer)cls="border-red-400 bg-red-50 text-red-700";return <button key={i} disabled={answered} onClick={()=>choose(i)} className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left text-sm font-bold ${cls}`}><span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs">{String.fromCharCode(65+i)}</span><span className="flex-1">{option}</span>{answered&&i===q.correctAnswer&&<CheckCircle2 size={20}/>} {answered&&i===answer&&i!==q.correctAnswer&&<XCircle size={20}/>}</button>})}</div>{answered&&<div className={`mt-5 rounded-2xl p-4 ${correct?"bg-emerald-50":"bg-red-50"}`}><div className={`font-black ${correct?"text-emerald-700":"text-red-700"}`}>{correct?"✓ Correcto":"✕ Incorrecto"}</div>{q.explanation&&<p className="mt-2 text-sm text-slate-600">{q.explanation}</p>}</div>}{answered&&<button onClick={next} className="mt-5 w-full rounded-2xl bg-slate-950 py-3.5 font-black text-white">{index===game.length-1?"Ver resultado":"Siguiente pregunta"}</button>}</article></section>;
}

export default function App() {
  const [tab, setTab] =
    useState("Scores");

  const [games, setGames] =
    useState([]);

  const [
    gameDate,
    setGameDate,
  ] = useState("");

  const [
    standings,
    setStandings,
  ] = useState([]);

  const [
    seasonStats,
    setSeasonStats,
  ] = useState([]);

  const [
    salaries,
    setSalaries,
  ] = useState([]);

  const [
    boxScoreFile,
    setBoxScoreFile,
  ] = useState({});

  const [
    selectedGame,
    setSelectedGame,
  ] = useState(null);

  const [
    selectedBoxPlayer,
    setSelectedBoxPlayer,
  ] = useState(null);

  const [
    selectedSeasonPlayer,
    setSelectedSeasonPlayer,
  ] = useState(null);

  const [
    gameStats,
    setGameStats,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [questions, setQuestions] =
    useState([]);

  const [
    gameStatsLoading,
    setGameStatsLoading,
  ] = useState(false);

  const [
    gameStatsError,
    setGameStatsError,
  ] = useState("");

  async function getJson(
    url
  ) {
    const response =
      await fetch(
        `${url}?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return response.json();
  }

  async function loadEverything() {
    setLoading(true);
    setError("");

    try {
      const [
        gamesData,
        boxScoresData,
        standingsData,
        seasonData,
        salariesData,
      ] = await Promise.all([
        getJson(URLS.games),
        getJson(
          URLS.boxScores
        ),
        getJson(
          URLS.standings
        ),
        getJson(
          URLS.seasonStats
        ),
        getJson(
          URLS.salaries
        ),
      ]);

      setGames(
        Array.isArray(
          gamesData.response
        )
          ? gamesData.response
          : []
      );

      setGameDate(
        gamesData.parameters
          ?.date || ""
      );

      setBoxScoreFile(
        boxScoresData.games ||
          {}
      );

      setStandings(
        Array.isArray(
          standingsData.response
        )
          ? standingsData.response
          : []
      );

      setSeasonStats(
        Array.isArray(
          seasonData.response
        )
          ? seasonData.response
          : []
      );

      setSalaries(
        Array.isArray(
          salariesData.response
        )
          ? salariesData.response
          : []
      );
    } catch (loadError) {
      console.error(
        loadError
      );

      setError(
        "No ha sido posible cargar todos los datos."
      );
    } finally {
      setLoading(false);
    }

    try {
      const quizData = await getJson(URLS.quiz);
      setQuestions(Array.isArray(quizData) ? quizData : Array.isArray(quizData.questions) ? quizData.questions : Array.isArray(quizData.response) ? quizData.response : []);
    } catch (quizError) {
      console.error("No se ha podido cargar quiz-questions.json", quizError);
      setQuestions([]);
    }
  }

  useEffect(() => {
    loadEverything();
  }, []);

  useEffect(() => {
    if (
      selectedGame ||
      selectedBoxPlayer ||
      selectedSeasonPlayer
    ) {
      scrollTop();
    }
  }, [
    selectedGame,
    selectedBoxPlayer,
    selectedSeasonPlayer,
  ]);

  const enrichedPlayers =
    useMemo(
      () =>
        mergeSeasonStatsAndSalaries(
          seasonStats,
          salaries
        ),
      [
        seasonStats,
        salaries,
      ]
    );

  const spanishDailyPerformances =
    useMemo(() => {
      return Object.values(
        boxScoreFile
      )
        .flatMap(
          (gameData) =>
            Array.isArray(
              gameData?.response
            )
              ? gameData.response
              : []
        )
        .filter(
          (stat) =>
            isSpanishName(
              boxPlayerName(
                stat.player
              )
            ) ||
            isSpanishName(
              reversedBoxPlayerName(
                stat.player
              )
            )
        );
    }, [boxScoreFile]);

  const boxPlayerSeason =
    useMemo(
      () =>
        findSeasonPlayerForBoxScore(
          selectedBoxPlayer,
          enrichedPlayers
        ),
      [
        selectedBoxPlayer,
        enrichedPlayers,
      ]
    );

  function openGame(game) {
    setSelectedGame(game);
    setSelectedBoxPlayer(
      null
    );

    setGameStatsError("");
    setGameStatsLoading(
      true
    );

    const savedGame =
      boxScoreFile[
        String(game.id)
      ];

    if (
      Array.isArray(
        savedGame?.response
      )
    ) {
      setGameStats(
        savedGame.response
      );

      setGameStatsLoading(
        false
      );

      return;
    }

    setGameStats([]);
    setGameStatsLoading(
      false
    );

    setGameStatsError(
      "Las estadísticas de este partido todavía no están disponibles."
    );
  }

  function changeTab(
    nextTab
  ) {
    setTab(nextTab);
    setSelectedGame(null);
    setSelectedBoxPlayer(
      null
    );
    setSelectedSeasonPlayer(
      null
    );
    scrollTop();
  }

  const showNavigation =
    !selectedGame &&
    !selectedBoxPlayer &&
    !selectedSeasonPlayer;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"
        style={{
          paddingTop:
            "env(safe-area-inset-top)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <button
            onClick={() =>
              changeTab(
                "Scores"
              )
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
                Tu app de baloncesto
              </div>
            </div>
          </button>

          {showNavigation && (
            <nav className="hidden items-center gap-1 md:flex">
              {NAV.map(([key, Icon, label]) => (
                <button key={key} onClick={() => changeTab(key)} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${tab === key ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
                  <Icon size={16}/><span>{label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        {selectedSeasonPlayer ? (
          <SeasonPlayerDetail
            player={
              selectedSeasonPlayer
            }
            onBack={() => {
              setSelectedSeasonPlayer(
                null
              );
              scrollTop();
            }}
          />
        ) : selectedBoxPlayer &&
          selectedGame ? (
          <GamePlayerDetail
            stat={
              selectedBoxPlayer
            }
            seasonPlayer={
              boxPlayerSeason
            }
            onBack={() => {
              setSelectedBoxPlayer(
                null
              );
              scrollTop();
            }}
          />
        ) : selectedGame ? (
          <GameDetail
            game={selectedGame}
            stats={gameStats}
            loading={
              gameStatsLoading
            }
            error={
              gameStatsError
            }
            onBack={() => {
              setSelectedGame(
                null
              );
              setGameStats([]);
              scrollTop();
            }}
            onPlayer={
              setSelectedBoxPlayer
            }
          />
        ) : (
          <>
            <section className="mb-6 rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 px-5 py-4 text-white">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase">
                <CalendarDays
                  size={14}
                />
                ÑBA
              </div>

              <h1 className="text-2xl font-black">
                Baloncesto con Ñ.
              </h1>

              <p className="mt-1 text-xs text-orange-50">
                Resultados, clasificación, rankings y españoles.
              </p>
            </section>

            {loading && (
              <Loading text="Cargando ÑBA..." />
            )}

            {!loading &&
              error && (
                <ErrorBox
                  text={error}
                />
              )}

            {!loading &&
              !error &&
              tab ===
                "Scores" && (
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
                      onClick={
                        loadEverything
                      }
                      className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
                    >
                      <RefreshCw
                        size={14}
                      />
                      Actualizar
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {games.map(
                      (game) => (
                        <button
                          key={
                            game.id
                          }
                          onClick={() =>
                            openGame(
                              game
                            )
                          }
                          className="rounded-3xl border border-slate-200 p-5 text-left shadow-sm"
                        >
                          <div className="mb-4 text-xs font-bold text-slate-500">
                            {formatGameStatus(
                              game
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
                            />
                          </div>

                          <div className="mt-4 text-right text-xs font-bold text-orange-600">
                            Ver partido →
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </section>
              )}

            {!loading &&
              !error &&
              tab ===
                "Standings" && (
                <StandingsView
                  standings={
                    standings
                  }
                />
              )}

            {!loading &&
              !error &&
              tab ===
                "Players" && (
                <PlayersView
                  players={
                    enrichedPlayers
                  }
                  onSelect={
                    setSelectedSeasonPlayer
                  }
                />
              )}

            {!loading &&
              !error &&
              tab ===
                "Spanish" && (
                <SpanishView
                  seasonPlayers={
                    enrichedPlayers
                  }
                  dailyPerformances={
                    spanishDailyPerformances
                  }
                  games={games}
                  onOpenGame={
                    openGame
                  }
                  onSelectSeasonPlayer={
                    setSelectedSeasonPlayer
                  }
                />
              )}

            {tab === "Quiz" && <Quiz questions={questions} />}
          </>
        )}
      </main>

      {showNavigation && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pt-2 backdrop-blur md:hidden"
          style={{
            paddingBottom:
              "calc(0.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {NAV.map(
            ([
              key,
              Icon,
              label,
            ]) => (
              <button
                key={key}
                onClick={() =>
                  changeTab(key)
                }
                className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] ${
                  tab === key
                    ? "bg-slate-950 text-white"
                    : "text-slate-500"
                }`}
              >
                <Icon
                  size={17}
                />
                {label}
              </button>
            )
          )}
        </nav>
      )}

      <footer className="px-5 pb-24 pt-8 text-[10px] text-slate-400">
        ÑBA · BoxScore Lab CC BY 4.0 · Basketball-Reference
      </footer>
    </div>
  );
}
