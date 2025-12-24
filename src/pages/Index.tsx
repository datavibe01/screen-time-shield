import { Clock, Download, Chrome, Bell, BarChart3, Timer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const features = [
    {
      icon: <Timer className="w-6 h-6" />,
      title: "Real-Time Tracking",
      description: "See time counting live on the extension badge as you browse"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Smart Reminders",
      description: "Get notified at 15, 30, 45 min or set custom intervals"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Usage Analytics",
      description: "View top sites and daily stats in a beautiful popup"
    }
  ];

  const steps = [
    "Download/Export the project from Lovable",
    "Open chrome://extensions in your browser",
    "Enable 'Developer mode' (top right toggle)",
    "Click 'Load unpacked' and select the chrome-extension folder",
    "Pin the extension to your toolbar for easy access"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Chrome className="w-4 h-4" />
              <span className="text-sm font-medium">Chrome Extension</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Focus Time
              <span className="text-primary"> Tracker</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
              Track your screen time on every website, see live counts on the extension badge, 
              and get gentle reminders to take breaks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                <Download className="w-5 h-5" />
                Download Extension
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Clock className="w-5 h-5" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Stay Focused
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="bg-card border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Beautiful & Functional Design
              </h2>
              <p className="text-muted-foreground mb-6">
                The popup shows your daily screen time at a glance with a sleek dark interface. 
                See which sites you spend the most time on and configure reminders to match your workflow.
              </p>
              <ul className="space-y-3">
                {[
                  "Live badge shows time (changes color as time increases)",
                  "Top 5 most visited sites with time breakdown",
                  "Customizable reminder intervals",
                  "Full-page overlay for break reminders"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8 flex items-center justify-center">
              <div className="bg-background rounded-lg shadow-2xl p-4 max-w-[320px]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Focus Tracker</span>
                </div>
                <div className="bg-primary rounded-xl p-5 text-center mb-4">
                  <p className="text-xs text-primary-foreground/80 mb-1">Today's Screen Time</p>
                  <p className="text-3xl font-bold text-primary-foreground">2h 34m</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold">8</p>
                    <p className="text-xs text-muted-foreground">Sites</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-lg font-semibold">19m</p>
                    <p className="text-xs text-muted-foreground">Avg/Site</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {["youtube.com", "github.com", "twitter.com"].map((site, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                      <span className="text-sm">{site}</span>
                      <span className="text-xs text-primary font-medium">{45 - i * 12}m</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            How to Install
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Since this is a custom extension, you'll need to load it manually in Chrome. 
            It only takes a minute!
          </p>
          
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex gap-4 items-start bg-card rounded-lg p-4 border border-border/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-foreground pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Focus Time Tracker • Built with Lovable</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
