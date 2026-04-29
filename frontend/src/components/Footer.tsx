import { Leaf, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="relative bg-gradient-hero/50 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </span>
              <span className="font-display text-lg font-bold">
                AgriSense<span className="text-gradient-fresh">AI</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
              Built with Hybrid AI + Retrieval-Augmented Knowledge — empowering farmers with instant, evidence-backed crop diagnosis.
            </p>
            <div className="mt-5 flex gap-2">
              {[Twitter, Github, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full bg-card border border-border/50 hover:border-primary/40 hover:shadow-soft transition-smooth"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-display font-bold text-sm mb-4">Product</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#diagnosis" className="hover:text-foreground transition-smooth">Diagnosis</a></li>
              <li><a href="#features" className="hover:text-foreground transition-smooth">Features</a></li>
              <li><a href="#about" className="hover:text-foreground transition-smooth">About</a></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-sm mb-4">Contact</p>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>hello@agrisense.ai</li>
              <li>+1 (555) 010-1234</li>
              <li>Bengaluru · San Francisco</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-wrap gap-2 justify-between text-xs text-muted-foreground">
          <p>© 2025 AgriSense AI. All rights reserved.</p>
          <p>Built with Hybrid AI + Retrieval-Augmented Knowledge</p>
        </div>
      </div>
    </footer>
  );
}
