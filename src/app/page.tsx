import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { MoveRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-90"></div>
      
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float animation-delay-200"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float animation-delay-400"></div>
        <div className="absolute bottom-40 right-1/4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-float animation-delay-300"></div>
      </div>

      <header className="relative z-10 px-4 lg:px-6 h-20 flex items-center glass backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-b border-white/20 shadow-lg">
        <Link href="#" className="flex items-center justify-center group">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
            MedFlow
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link href="/auth/login" className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 hover:underline underline-offset-4">
            Connexion
          </Link>
          <Button asChild variant="outline" className="border-2 border-purple-300 hover:border-purple-500">
            <Link href="/auth/register">S'inscrire</Link>
          </Button>
        </nav>
      </header>
      
      <main className="flex-1 relative z-10">
        <section className="w-full py-32 md:py-40 lg:py-48">
          <div className="container px-4 md:px-6 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in-up">
                <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  La gestion de clinique,
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  réinventée.
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto animate-fade-in-up animation-delay-200 leading-relaxed">
                MedFlow est la solution tout-en-un pour digitaliser votre pratique médicale. 
                Gérez patients, rendez-vous et factures en toute simplicité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-400">
                <Button size="lg" asChild className="text-lg px-8 py-6 animate-pulse-glow">
                  <Link href="/auth/register" className="flex items-center">
                    Commencer gratuitement
                    <MoveRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 border-2">
                  <Link href="/auth/login">En savoir plus</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="relative z-10 flex items-center justify-center h-20 glass backdrop-blur-xl bg-white/80 dark:bg-gray-950/80 border-t border-white/20">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} MedFlow. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}
