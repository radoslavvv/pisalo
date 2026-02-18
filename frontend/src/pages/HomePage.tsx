import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import HeroSection from '../components/home/HeroSection'
import GameModeGrid from '../components/home/GameModeGrid'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <GameModeGrid />
      </main>
      <Footer />
    </>
  )
}
