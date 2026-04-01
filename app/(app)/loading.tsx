export default function InternalLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]"
        />
      ))}
      <div className="col-span-full h-[480px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.03]" />
    </div>
  );
}
