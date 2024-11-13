"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function Filter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeFliter = searchParams.get("capacity") ?? "all";

  function handleFilter(fliter) {
    const params = new URLSearchParams(searchParams);
    params.set("capacity", fliter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="border border-primary-800 flex">
      <Button
        filter="all"
        handleFilter={handleFilter}
        activeFliter={activeFliter}
      >
        All cabins
      </Button>
      <Button
        filter="small"
        handleFilter={handleFilter}
        activeFliter={activeFliter}
      >
        2&mdash; 4 guests
      </Button>
      <Button
        filter="medium"
        handleFilter={handleFilter}
        activeFliter={activeFliter}
      >
        4&mdash; 7 guests
      </Button>

      <Button
        filter="large"
        handleFilter={handleFilter}
        activeFliter={activeFliter}
      >
        8&mdash; 12 guests
      </Button>
    </div>
  );
}

function Button({ filter, handleFilter, activeFliter, children }) {
  return (
    <button
      className={`px-5 py-2 hover:bg-primary-700 ${
        filter === activeFliter ? "bg-primary-700 text-primary-50" : ""
      }`}
      onClick={() => handleFilter(filter)}
    >
      {children}
    </button>
  );
}

export default Filter;
