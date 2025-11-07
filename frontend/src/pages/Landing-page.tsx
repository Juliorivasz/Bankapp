import Hero from "../components/sections/Hero"
import Stats from "../components/sections/Stats"
import Features from "../components/sections/Features"
import CTA from "../components/sections/CTA"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Stats />
      <Features />
      <CTA />
    </div>
  )
}
