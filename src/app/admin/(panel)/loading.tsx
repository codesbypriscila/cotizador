/** Skeleton shown while an admin page loads. */
export default function AdminLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-[1200px] animate-pulse flex-col gap-5 px-5 pt-5 md:px-8 lg:px-10 lg:pt-8"
      aria-busy="true"
      aria-label="Cargando"
    >
      <div className="h-9 w-48 rounded-xl bg-chip" />
      <div className="h-[52px] w-full max-w-md rounded-full bg-chip" />
      <div className="flex gap-2">
        {[80, 96, 88, 72].map((w) => (
          <div key={w} className="h-11 rounded-full bg-chip" style={{ width: w }} />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card h-[148px]" />
        ))}
      </div>
    </div>
  );
}
