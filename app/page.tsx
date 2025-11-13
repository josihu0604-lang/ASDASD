export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">🌍 ZZIK LIVE</h1>
        <p className="text-xl mb-4">Location-based real-time experience platform</p>
        <div className="mt-8 space-y-2">
          <p>✅ 삼중 검증: GPS × QR × 영수증</p>
          <p>✅ 지도 기반 탐색</p>
          <p>✅ LIVE 릴스</p>
          <p>✅ Geohash5 프라이버시</p>
        </div>
        <div className="mt-12">
          <a 
            href="/api/health" 
            className="text-blue-500 hover:underline"
            target="_blank"
          >
            Health Check →
          </a>
        </div>
      </div>
    </main>
  );
}