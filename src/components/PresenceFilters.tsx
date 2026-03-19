import "../styles/teams.css";

type Props = {
  active: string;
  setFilter: (value: string) => void;
};

export default function PresenceFilters({ active, setFilter }: Props) {

  const filters = [
    "all",
    "office",
    "remote",
    "client",
    "offline"
  ];

  return (
    <div className="presence-filters">

      {filters.map((filter) => (

        <button
          key={filter}
          onClick={() => setFilter(filter)}
          className={
            active === filter
              ? "presence-filter active"
              : "presence-filter"
          }
        >

          {filter}

        </button>

      ))}

    </div>
  );
}