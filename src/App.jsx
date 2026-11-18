import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Trophy,
  BarChart3,
  Flag,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  UserRound,
  Search,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL;

const URLS = {
  games: `${BASE}data/scoreboard.json`,
  boxScores: `${BASE}data/player-stats.json`,
  standings: `${BASE}data/standings.json`,
  seasonStats: `${BASE}data/season-player-stats.json`,
  salaries: `${BASE}data/player-salaries.json`,
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
];

const STAT_CATEGORIES = [
  {
    key: "points_pg",
    label: "PTS",
    title: "Puntos por partido",
    decimals: 1,
  },
  {
    key: "rebounds_pg",
    label: "REB",
    title: "Rebotes por partido",
    decimals: 1,
  },
  {
    key: "assists_pg",
    label: "AST",
    title: "Asistencias por partido",
    decimals: 1,
  },
  {
    key: "steals_pg",
    label: "ROB",
    title: "Robos por partido",
    decimals: 1,
  },
  {
    key: "blocks_pg",
    label: "TAP",
    title: "Tapones por partido",
    decimals: 1,
  },
  {
    key: "three_point_makes_pg",
    label: "3PT",
    title: "Triples anotados por partido",
    decimals: 1,
  },
  {
    key: "field_goal_pct",
    label: "TC%",
    title: "Porcentaje de tiros de campo",
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
    label: "€/PTS",
    title: "Coste por punto",
  },
  {
    key: "costPerRebound",
    label: "€/REB",
    title: "Coste por rebote",
  },
  {
    key: "costPerAssist",
    label: "€/AST",
    title: "Coste por asistencia",
  },
  {
    key: "costPerSteal",
    label: "€/ROB",
    title: "Coste por robo",
  },
  {
    key: "costPerBlock",
    label: "€/TAP",
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

function playerName(player) {
  return `${player?.firstname || ""} ${player?.lastname || ""}`.trim();
}

function teamLogo(code) {
  const id = NBA_TEAM_IDS[code];

  return id
    ? `https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg`
    : "";
}

function number(value, decimals = 1) {
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

function percent(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "-";
  }

  return `${number(Number(value) * 100, 1)}%`;
}

function money(value) {
  if (!Number.isFinite(Number(value))) {
    return "-";
  }

  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function compactMoney(value) {
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

function safeDivide(a, b) {
  const numerator = Number(a || 0);
  const denominator = Number(b || 0);

  if (denominator <= 0) {
    return null;
  }

  return numerator / denominator;
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

function scrollTop() {
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
}

function Logo({ code, name, size = "normal" }) {
  const [error, setError] = useState(false);
  const url = teamLogo(code);

  useEffect(() => {
    setError(false);
  }, [code]);

  const box =
    size === "large" ? "h-16 w-16" : "h-10 w-10";

  const image =
    size === "large" ? "h-13 w-13" : "h-8 w-8";

  return (
    <div
      className={`grid ${box} flex-shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm`}
    >
      {url && !error ? (
        <img
          src={url}
          alt={name || code}
          className={`${image} object-contain`}
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-xs font-black">{code}</span>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  featured = false,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl p-3 text-center ${
        featured ? "bg-orange-50" : "bg-slate-100"
      } ${className}`}
    >
      <div
        className={`text-xl font-black ${
          featured ? "text-orange-600" : "text-slate-950"
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

function Loading({ text = "Cargando..." }) {
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

function TeamRow({ team, score }) {
  return (
    <div className="flex items-center gap-3">
      <Logo
        code={team?.code}
        name={team?.name}
      />

      <div className="min-w-0 flex-1">
        <div className="truncate font-bold">{team?.name}</div>
        <div className="text-xs text-slate-400">{team?.code}</div>
      </div>

      <div className="text-2xl font-black">
        {score?.points ?? "-"}
      </div>
    </div>
  );
}

function mergeSeasonStatsAndSalaries(stats, salaries) {
  const salaryByNameAndTeam = new Map();
  const salaryByName = new Map();

  salaries.forEach((salary) => {
    const name = normalizeText(salary.player_name);
    const team = salary.team || "";

    salaryByNameAndTeam.set(`${name}|${team}`, salary);
    salaryByName.set(name, salary);
  });

  return stats.map((player) => {
    const name = normalizeText(player.player_name);
    const team = player.team || "";

    const salaryRecord =
      salaryByNameAndTeam.get(`${name}|${team}`) ||
      salaryByName.get(name) ||
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
      costPerPoint: safeDivide(salary, player.points),
      costPerRebound: safeDivide(salary, player.rebounds),
      costPerAssist: safeDivide(salary, player.assists),
      costPerSteal: safeDivide(salary, player.steals),
      costPerBlock: safeDivide(salary, player.blocks),
    };
  });
}

function SeasonPlayerDetail({ player, onBack }) {
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
              value={number(player.minutes_pg)}
            />
            <StatBox
              label="Puntos"
              value={number(player.points_pg)}
              featured
            />
            <StatBox
              label="Rebotes"
              value={number(player.rebounds_pg)}
            />
            <StatBox
              label="Asistencias"
              value={number(player.assists_pg)}
            />
            <StatBox
              label="Robos"
              value={number(player.steals_pg)}
            />
            <StatBox
              label="Tapones"
              value={number(player.blocks_pg)}
            />
            <StatBox
              label="Pérdidas"
              value={number(player.turnovers_pg)}
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
              value={percent(player.field_goal_pct)}
            />
            <StatBox
              label="3PT"
              value={percent(player.three_point_pct)}
            />
            <StatBox
              label="TL"
              value={percent(player.free_throw_pct)}
            />
            <StatBox
              label="True Shooting"
              value={percent(player.ts_pct)}
            />
            <StatBox
              label="Uso"
              value={percent(player.usage_rate)}
            />
            <StatBox
              label="Rating neto"
              value={number(player.net_rating)}
            />
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <p className="mb-3 text-xs font-bold uppercase text-orange-600">
            Salario y coste por producción
          </p>

          {player.salary ? (
            <>
              <div className="mb-4 rounded-2xl bg-slate-950 p-4 text-white">
                <div className="text-xs text-slate-300">
                  Salario anual
                </div>
                <div className="mt-1 text-2xl font-black">
                  {money(player.salary)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="Coste/punto"
                  value={money(player.costPerPoint)}
                />
                <StatBox
                  label="Coste/rebote"
                  value={money(player.costPerRebound)}
                />
                <StatBox
                  label="Coste/asistencia"
                  value={money(player.costPerAssist)}
                />
                <StatBox
                  label="Coste/robo"
                  value={money(player.costPerSteal)}
                />
                <StatBox
                  label="Coste/tapón"
                  value={money(player.costPerBlock)}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              No se ha encontrado el salario del jugador.
            </p>
          )}
        </div>

        <p className="border-t border-slate-200 p-5 text-[10px] text-slate-400">
          Estadísticas: BoxScore Lab · CC BY 4.0. Salarios:
          Basketball-Reference.
        </p>
      </article>
    </section>
  );
}

function PlayersView({
  players,
  loading,
  error,
  onSelect,
}) {
  const [mode, setMode] = useState("stats");
  const [statCategory, setStatCategory] =
    useState("points_pg");
  const [salaryCategory, setSalaryCategory] =
    useState("costPerPoint");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(50);

  const category =
    mode === "stats"
      ? STAT_CATEGORIES.find(
          (item) => item.key === statCategory
        )
      : SALARY_CATEGORIES.find(
          (item) => item.key === salaryCategory
        );

  const rankedPlayers = useMemo(() => {
    const searchText = normalizeText(search);

    return players
      .filter((player) => {
        const matchesSearch =
          !searchText ||
          normalizeText(player.player_name).includes(searchText) ||
          normalizeText(player.team).includes(searchText);

        if (!matchesSearch) {
          return false;
        }

        const value = player[category.key];

        if (!Number.isFinite(Number(value))) {
          return false;
        }

        if (mode === "salary") {
          return (
            Number(player.salary || 0) > 0 &&
            Number(value) > 0
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (mode === "salary") {
          return Number(a[category.key]) - Number(b[category.key]);
        }

        return Number(b[category.key]) - Number(a[category.key]);
      });
  }, [players, search, category, mode]);

  function displayValue(player) {
    const value = player[category.key];

    if (mode === "salary") {
      return compactMoney(value);
    }

    if (category.percentage) {
      return percent(value);
    }

    return number(value, category.decimals ?? 1);
  }

  return (
    <section>
      <div className="mb-4">
        <p className="text-xs font-semibold text-orange-600">
          TEMPORADA 2026-27
        </p>

        <h2 className="text-xl font-black">
          Ranking de jugadores
        </h2>
      </div>

      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <button
          onClick={() => {
            setMode("stats");
            setLimit(50);
          }}
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
          onClick={() => {
            setMode("salary");
            setLimit(50);
          }}
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
        {(mode === "stats"
          ? STAT_CATEGORIES
          : SALARY_CATEGORIES
        ).map((item) => (
          <button
            key={item.key}
            onClick={() => {
              if (mode === "stats") {
                setStatCategory(item.key);
              } else {
                setSalaryCategory(item.key);
              }

              setLimit(50);
            }}
            className={`flex-shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${
              category.key === item.key
                ? "bg-orange-500 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setLimit(50);
          }}
          placeholder="Buscar jugador o equipo"
          className="w-full rounded-2xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400"
        />
      </div>

      <div className="mb-3 rounded-2xl bg-orange-50 p-3">
        <div className="text-xs font-bold text-orange-700">
          {category.title}
        </div>

        {mode === "salary" && (
          <div className="mt-1 text-[10px] text-orange-600">
            Menor coste por unidad = mejor posición. Se calcula con
            salario anual dividido por el total acumulado.
          </div>
        )}
      </div>

      {loading && <Loading text="Cargando jugadores..." />}

      {!loading && error && <ErrorBox text={error} />}

      {!loading && !error && (
        <>
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
              .map((player, index) => (
                <button
                  key={`${player.player_name}-${player.team}`}
                  onClick={() => onSelect(player)}
                  className="grid w-full grid-cols-[30px_minmax(0,1fr)_74px] items-center border-t border-slate-200 px-3 py-3 text-left active:bg-orange-50"
                >
                  <div className="text-xs font-black text-slate-400">
                    {index + 1}
                  </div>

                  <div className="flex min-w-0 items-center gap-2">
                    <Logo
                      code={player.team}
                      name={player.player_name}
                    />

                    <div className="min-w-0">
                      <div className="whitespace-normal text-xs font-bold leading-4">
                        {player.player_name}
                      </div>

                      <div className="mt-0.5 text-[9px] text-slate-400">
                        {player.team} · {player.position || "-"} ·{" "}
                        {player.games_played} PJ
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs font-black text-orange-600">
                    {displayValue(player)}
                  </div>
                </button>
              ))}
          </div>

          {limit < rankedPlayers.length && (
            <button
              onClick={() => setLimit((current) => current + 50)}
              className="mt-4 w-full rounded-2xl bg-slate-950 py-3 text-sm font-bold text-white"
            >
              Mostrar 50 más
            </button>
          )}

          <p className="mt-4 text-[10px] text-slate-400">
            Estadísticas: BoxScore Lab · CC BY 4.0. Salarios:
            Basketball-Reference.
          </p>
        </>
      )}
    </section>
  );
}

function StandingsView({ standings, loading, error }) {
  const [conference, setConference] = useState("East");

  const teams = useMemo(() => {
    return standings
      .filter((team) =>
        conference === "East"
          ? EAST_TEAMS.has(team.team)
          : !EAST_TEAMS.has(team.team)
      )
      .sort(
        (a, b) =>
          Number(b.win_pct || 0) - Number(a.win_pct || 0) ||
          Number(b.wins || 0) - Number(a.wins || 0)
      );
  }, [standings, conference]);

  return (
    <section>
      <p className="text-xs font-semibold text-orange-600">
        TEMPORADA 2026-27
      </p>

      <h2 className="mb-4 text-xl font-black">
        Clasificación
      </h2>

      <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        {[
          ["East", "Este"],
          ["West", "Oeste"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setConference(key)}
            className={`rounded-xl py-2 text-sm font-bold ${
              conference === key
                ? "bg-white shadow-sm"
                : "text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <Loading text="Cargando clasificación..." />}
      {!loading && error && <ErrorBox text={error} />}

      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <div className="grid grid-cols-[28px_minmax(0,1fr)_28px_28px_48px] bg-slate-100 px-2 py-2 text-[9px] font-bold uppercase text-slate-500">
            <div>#</div>
            <div>Equipo</div>
            <div className="text-center">V</div>
            <div className="text-center">D</div>
            <div className="text-right">%</div>
          </div>

          {teams.map((team, index) => (
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
                <Logo code={team.team} name={team.team_name} />

                <div className="min-w-0">
                  <div className="truncate text-xs font-bold">
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

              <div className="text-center text-xs">
                {team.losses}
              </div>

              <div className="text-right text-xs font-bold">
                {Number(team.win_pct).toFixed(3).replace(/^0/, "")}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PlayerBoxScore({
  team,
  stats,
  onSelect,
}) {
  const players = stats
    .filter((stat) => stat.team?.id === team?.id)
    .sort((a, b) => Number(b.min || 0) - Number(a.min || 0));

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Logo code={team?.code} name={team?.name} />
        <div>
          <div className="font-black">{team?.name}</div>
          <div className="text-xs text-slate-400">
            {players.length} jugadores
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[minmax(125px,1fr)_34px_36px_36px_36px] bg-slate-100 px-2 py-2 text-[9px] font-bold text-slate-500">
          <div>JUGADOR</div>
          <div className="text-center">MIN</div>
          <div className="text-center text-orange-600">PTS</div>
          <div className="text-center">REB</div>
          <div className="text-center">AST</div>
        </div>

        {players.map((stat) => (
          <button
            key={stat.player?.id}
            onClick={() => onSelect(stat)}
            className="grid w-full grid-cols-[minmax(125px,1fr)_34px_36px_36px_36px] items-center border-t border-slate-200 px-2 py-3 text-left"
          >
            <div className="pr-1 text-[13px] font-bold leading-4">
              {playerName(stat.player)}
            </div>
            <div className="text-center text-xs">{stat.min ?? "-"}</div>
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
        ))}
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
  const visitors = game.teams?.visitors;
  const home = game.teams?.home;

  return (
    <section>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
      >
        <ArrowLeft size={18} />
        Partidos
      </button>

      <article className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 text-center text-sm font-black text-white">
          {formatGameStatus(game)}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-5">
          <div className="flex flex-col items-center text-center">
            <Logo
              code={visitors?.code}
              name={visitors?.name}
              size="large"
            />
            <div className="mt-2 text-xs font-bold">{visitors?.name}</div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-3xl font-black">
              {game.scores?.visitors?.points ?? "-"}
            </span>
            <span className="text-slate-300">-</span>
            <span className="text-3xl font-black">
              {game.scores?.home?.points ?? "-"}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <Logo
              code={home?.code}
              name={home?.name}
              size="large"
            />
            <div className="mt-2 text-xs font-bold">{home?.name}</div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <h3 className="mb-4 text-lg font-black">
            Estadísticas del partido
          </h3>

          {loading && <Loading text="Cargando estadísticas..." />}
          {!loading && error && <ErrorBox text={error} />}

          {!loading && !error && stats.length > 0 && (
            <div className="space-y-7">
              <PlayerBoxScore
                team={visitors}
                stats={stats}
                onSelect={onPlayer}
              />

              <PlayerBoxScore
                team={home}
                stats={stats}
                onSelect={onPlayer}
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
  game,
  onBack,
}) {
  return (
    <section>
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
      >
        <ArrowLeft size={18} />
        Volver al partido
      </button>

      <article className="overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 p-5 text-white">
          <h1 className="text-2xl font-black">
            {playerName(stat.player)}
          </h1>
          <p className="mt-1 text-sm text-orange-100">
            {stat.team?.name} · {stat.pos || "-"}
          </p>
        </div>

        <div className="p-5">
          <p className="mb-3 text-xs font-bold uppercase text-orange-600">
            Este partido
          </p>

          <div className="grid grid-cols-2 gap-3">
            <StatBox label="MIN" value={stat.min ?? "-"} />
            <StatBox label="PTS" value={stat.points ?? 0} featured />
            <StatBox label="REB" value={stat.totReb ?? 0} />
            <StatBox label="AST" value={stat.assists ?? 0} />
            <StatBox label="ROB" value={stat.steals ?? 0} />
            <StatBox label="TAP" value={stat.blocks ?? 0} />
            <StatBox label="PERD" value={stat.turnovers ?? 0} />
            <StatBox label="+/-" value={stat.plusMinus ?? "-"} />
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
                value={seasonPlayer.games_played}
              />
              <StatBox
                label="MIN"
                value={number(seasonPlayer.minutes_pg)}
              />
              <StatBox
                label="PTS"
                value={number(seasonPlayer.points_pg)}
                featured
              />
              <StatBox
                label="REB"
                value={number(seasonPlayer.rebounds_pg)}
              />
              <StatBox
                label="AST"
                value={number(seasonPlayer.assists_pg)}
              />
              <StatBox
                label="ROB"
                value={number(seasonPlayer.steals_pg)}
              />
              <StatBox
                label="TAP"
                value={number(seasonPlayer.blocks_pg)}
              />
              <StatBox
                label="TS%"
                value={percent(seasonPlayer.ts_pct)}
              />
            </div>

            {seasonPlayer.salary && (
              <button
                onClick={() => {}}
                className="mt-4 w-full rounded-2xl bg-slate-950 p-4 text-left text-white"
              >
                <div className="text-xs text-slate-300">Salario anual</div>
                <div className="mt-1 text-xl font-black">
                  {money(seasonPlayer.salary)}
                </div>
              </button>
            )}
          </div>
        )}
      </article>
    </section>
  );
}

function SpanishView({ players }) {
  const spanish = players.filter((player) => {
    const name = normalizeText(player.player_name);

    return SPANISH_PLAYERS.some(
      (spanishName) => normalizeText(spanishName) === name
    );
  });

  return (
    <section>
      <p className="text-xs font-semibold text-orange-600">
        TEMPORADA 2026-27
      </p>

      <h2 className="mb-4 text-xl font-black">
        Españoles en la NBA
      </h2>

      <div className="space-y-4">
        {spanish.map((player) => (
          <article
            key={`${player.player_name}-${player.team}`}
            className="rounded-3xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <Logo code={player.team} name={player.player_name} />

              <div>
                <h3 className="font-black">{player.player_name}</h3>
                <p className="text-xs text-slate-500">
                  {player.team} · {player.position || "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <StatBox label="PJ" value={player.games_played} />
              <StatBox
                label="PTS"
                value={number(player.points_pg)}
                featured
              />
              <StatBox
                label="REB"
                value={number(player.rebounds_pg)}
              />
              <StatBox
                label="AST"
                value={number(player.assists_pg)}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState("Scores");
  const [games, setGames] = useState([]);
  const [gameDate, setGameDate] = useState("");
  const [standings, setStandings] = useState([]);
  const [seasonStats, setSeasonStats] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [boxScoreFile, setBoxScoreFile] = useState({});

  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedBoxPlayer, setSelectedBoxPlayer] = useState(null);
  const [selectedSeasonPlayer, setSelectedSeasonPlayer] = useState(null);

  const [gameStats, setGameStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameStatsLoading, setGameStatsLoading] = useState(false);
  const [error, setError] = useState("");
  const [gameStatsError, setGameStatsError] = useState("");

  async function getJson(url) {
    const response = await fetch(`${url}?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
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
        getJson(URLS.boxScores),
        getJson(URLS.standings),
        getJson(URLS.seasonStats),
        getJson(URLS.salaries),
      ]);

      setGames(
        Array.isArray(gamesData.response)
          ? gamesData.response
          : []
      );

      setGameDate(gamesData.parameters?.date || "");
      setBoxScoreFile(boxScoresData.games || {});

      setStandings(
        Array.isArray(standingsData.response)
          ? standingsData.response
          : []
      );

      setSeasonStats(
        Array.isArray(seasonData.response)
          ? seasonData.response
          : []
      );

      setSalaries(
        Array.isArray(salariesData.response)
          ? salariesData.response
          : []
      );
    } catch (loadError) {
      console.error(loadError);
      setError("No ha sido posible cargar todos los datos.");
    } finally {
      setLoading(false);
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
  }, [selectedGame, selectedBoxPlayer, selectedSeasonPlayer]);

  const enrichedPlayers = useMemo(
    () => mergeSeasonStatsAndSalaries(seasonStats, salaries),
    [seasonStats, salaries]
  );

  const boxPlayerSeason = useMemo(() => {
    if (!selectedBoxPlayer) {
      return null;
    }

    const normal = normalizeText(
      playerName(selectedBoxPlayer.player)
    );

    const reversed = normalizeText(
      `${selectedBoxPlayer.player?.lastname || ""} ${
        selectedBoxPlayer.player?.firstname || ""
      }`
    );

    const team = selectedBoxPlayer.team?.code;

    return (
      enrichedPlayers.find(
        (player) =>
          player.team === team &&
          [normal, reversed].includes(
            normalizeText(player.player_name)
          )
      ) ||
      enrichedPlayers.find((player) =>
        [normal, reversed].includes(
          normalizeText(player.player_name)
        )
      ) ||
      null
    );
  }, [selectedBoxPlayer, enrichedPlayers]);

  function openGame(game) {
    setSelectedGame(game);
    setSelectedBoxPlayer(null);
    setGameStatsError("");
    setGameStatsLoading(true);

    const saved = boxScoreFile[String(game.id)];

    if (Array.isArray(saved?.response)) {
      setGameStats(saved.response);
      setGameStatsLoading(false);
      return;
    }

    setGameStats([]);
    setGameStatsLoading(false);
    setGameStatsError(
      "Las estadísticas de este partido todavía no están disponibles."
    );
  }

  function changeTab(nextTab) {
    setTab(nextTab);
    setSelectedGame(null);
    setSelectedBoxPlayer(null);
    setSelectedSeasonPlayer(null);
    scrollTop();
  }

  const showMainNavigation =
    !selectedGame &&
    !selectedBoxPlayer &&
    !selectedSeasonPlayer;

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"
        style={{
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => changeTab("Scores")}
            className="flex items-center gap-3"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-500 text-sm font-black text-white">
              ÑBA
            </div>

            <div className="text-left">
              <div className="font-black">ÑBA</div>
              <div className="text-[10px] text-slate-500">
                Tu app de baloncesto
              </div>
            </div>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5">
        {selectedSeasonPlayer ? (
          <SeasonPlayerDetail
            player={selectedSeasonPlayer}
            onBack={() => {
              setSelectedSeasonPlayer(null);
              scrollTop();
            }}
          />
        ) : selectedBoxPlayer && selectedGame ? (
          <GamePlayerDetail
            stat={selectedBoxPlayer}
            seasonPlayer={boxPlayerSeason}
            game={selectedGame}
            onBack={() => {
              setSelectedBoxPlayer(null);
              scrollTop();
            }}
          />
        ) : selectedGame ? (
          <GameDetail
            game={selectedGame}
            stats={gameStats}
            loading={gameStatsLoading}
            error={gameStatsError}
            onBack={() => {
              setSelectedGame(null);
              setGameStats([]);
              scrollTop();
            }}
            onPlayer={setSelectedBoxPlayer}
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
                Resultados, clasificaciones, rankings y salarios.
              </p>
            </section>

            {loading && <Loading text="Cargando ÑBA..." />}
            {!loading && error && <ErrorBox text={error} />}

            {!loading && !error && tab === "Scores" && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <h2 className="text-xl font-black">Partidos</h2>
                    <p className="text-xs text-slate-400">
                      {gameDate}
                    </p>
                  </div>

                  <button
                    onClick={loadEverything}
                    className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs"
                  >
                    <RefreshCw size={14} />
                    Actualizar
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {games.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => openGame(game)}
                      className="rounded-3xl border border-slate-200 p-5 text-left shadow-sm"
                    >
                      <div className="mb-4 text-xs font-bold text-slate-500">
                        {formatGameStatus(game)}
                      </div>

                      <div className="space-y-4">
                        <TeamRow
                          team={game.teams?.visitors}
                          score={game.scores?.visitors}
                        />
                        <TeamRow
                          team={game.teams?.home}
                          score={game.scores?.home}
                        />
                      </div>

                      <div className="mt-4 text-right text-xs font-bold text-orange-600">
                        Ver partido →
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {!loading && !error && tab === "Standings" && (
              <StandingsView
                standings={standings}
                loading={false}
                error=""
              />
            )}

            {!loading && !error && tab === "Players" && (
              <PlayersView
                players={enrichedPlayers}
                loading={false}
                error=""
                onSelect={setSelectedSeasonPlayer}
              />
            )}

            {!loading && !error && tab === "Spanish" && (
              <SpanishView players={enrichedPlayers} />
            )}
          </>
        )}
      </main>

      {showMainNavigation && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-1 pt-2 backdrop-blur md:hidden"
          style={{
            paddingBottom:
              "calc(0.5rem + env(safe-area-inset-bottom))",
          }}
        >
          {NAV.map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => changeTab(key)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[9px] ${
                tab === key
                  ? "bg-slate-950 text-white"
                  : "text-slate-500"
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
      )}

      <footer className="px-5 pb-24 pt-8 text-[10px] text-slate-400">
        ÑBA · BoxScore Lab CC BY 4.0 · Basketball-Reference
      </footer>
    </div>
  );
}
