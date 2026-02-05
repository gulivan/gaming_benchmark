export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-20 px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-800/20 via-transparent to-transparent" />
      <div className="relative">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-4">
          Nerd Gaming
        </h1>
        <p className="text-lg sm:text-xl text-purple-200 max-w-2xl mx-auto">
          Classic games, reimagined for the browser. Pick a game and start playing!
        </p>
      </div>
    </section>
  );
}
