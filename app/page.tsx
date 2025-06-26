import { FireworksBackground } from "@/components/animate-ui/backgrounds/fireworks";

export default function Home() {
  return (
    <main className="w-screen h-screen bg-black">
      <FireworksBackground
        className="absolute inset-0 flex items-center justify-center rounded-xl"
        fireworkSize={7}
        fireworkSpeed={7}
        particleSize={7}
        particleSpeed={7}
      />
    </main>
  );
}
