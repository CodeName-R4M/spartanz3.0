import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/hero/hero-section'
import { StatsSection } from '@/components/sections/stats-section'
import { FeaturedEvents } from '@/components/sections/featured-events'
import { AboutSection } from '@/components/sections/about-section'
import { TimelineSection } from '@/components/sections/timeline-section'
import { TeamsPreview } from '@/components/sections/teams-preview'
import { SponsorsSection } from '@/components/sections/sponsors-section'
import { FinalCta } from '@/components/sections/final-cta'

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturedEvents />
      <AboutSection />
      <TimelineSection />
      <TeamsPreview />
      <SponsorsSection />
      <FinalCta />
      <Footer />
    </main>
  )
}
