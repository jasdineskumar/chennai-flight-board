import { motion } from "framer-motion";
import { useEffect } from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plane, Clock, Monitor, ShieldCheck, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

const sampleDomestic = [
  { flight: "AI 342", to: "Mumbai", time: "12:30", gate: "A4", status: "On Time" },
  { flight: "6E 982", to: "Delhi", time: "12:45", gate: "B2", status: "Boarding" },
  { flight: "SG 210", to: "Bengaluru", time: "13:05", gate: "C1", status: "Delayed" },
];

const sampleInternational = [
  { flight: "SQ 529", to: "Singapore", time: "12:10", gate: "I3", status: "On Time" },
  { flight: "EK 547", to: "Dubai", time: "12:40", gate: "I6", status: "Boarding" },
  { flight: "QR 529", to: "Doha", time: "13:20", gate: "I1", status: "On Time" },
];

const Landing = () => {
  useEffect(() => {
    document.title = "Chennai Airport FIDS – Real-time Flight Display";
    const desc = document.querySelector('meta[name="description"]') || document.createElement("meta");
    desc.setAttribute("name", "description");
    desc.setAttribute("content", "Minimal, fast, and beautiful FIDS with aurora background, TV display, pagination, and real-time updates.");
    document.head.appendChild(desc);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    canonical.setAttribute("href", window.location.origin + "/");
    document.head.appendChild(canonical);
  }, []);

  const DemoTable = ({ data }: { data: typeof sampleDomestic }) => (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="grid grid-cols-5 px-4 py-2 text-sm text-muted-foreground bg-muted/40">
        <span>Flight</span>
        <span>Destination</span>
        <span>Time</span>
        <span>Gate</span>
        <span>Status</span>
      </div>
      <div className="divide-y divide-border bg-card">
        {data.map((r, i) => (
          <div key={i} className="grid grid-cols-5 px-4 py-3 text-sm animate-fade-in">
            <span className="font-medium text-foreground">{r.flight}</span>
            <span className="text-foreground">{r.to}</span>
            <span className="text-foreground">{r.time}</span>
            <span className="text-foreground">{r.gate}</span>
            <span className="text-foreground">{r.status}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="relative flex flex-col items-center justify-center px-4 z-10 w-full"
      >
        {/* Hero */}
        <header className="text-center space-y-4 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Plane className="h-10 w-10 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              Chennai Airport FIDS
            </h1>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            A modern Flight Information Display System with TV‑ready layouts, smart pagination, and real‑time updates.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button asChild size="lg" className="hover-scale">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="hover-scale">
              <Link to="/display">View TV Display</Link>
            </Button>
          </div>
        </header>

        {/* Feature cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full max-w-5xl mb-8">
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Real‑time Updates</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Keep passengers informed with instant status changes and refresh.
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center gap-3">
              <Monitor className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">TV / Kiosk Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Optimized layouts for large screens with auto cycling.
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center gap-3">
              <LayoutGrid className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Smart Pagination</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Show more flights per screen and rotate through batches.
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardHeader className="flex flex-row items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Secure Access</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Supabase authentication with protected dashboards.
            </CardContent>
          </Card>
        </section>

        {/* Spotlight carousel */}
        <section className="w-full max-w-5xl mb-8">
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Spotlight</CardTitle>
                <CardDescription>Swipe through quick highlights</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Carousel opts={{ loop: true }}>
                <CarouselContent>
                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-4">
                      <div className="rounded-lg border border-border p-6 hover-scale animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Live Status</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Instant updates with minimal latency.</p>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-4">
                      <div className="rounded-lg border border-border p-6 hover-scale animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                          <Monitor className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">TV Mode</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Crystal-clear layouts for big screens.</p>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-4">
                      <div className="rounded-lg border border-border p-6 hover-scale animate-fade-in">
                        <div className="flex items-center gap-3 mb-2">
                          <ShieldCheck className="h-5 w-5 text-primary" />
                          <h3 className="font-medium">Secure Access</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">RLS + RBAC with Supabase Auth.</p>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <div className="flex items-center justify-end gap-2 mt-4">
                  <CarouselPrevious />
                  <CarouselNext />
                </div>
              </Carousel>
            </CardContent>
          </Card>
        </section>

        {/* Product demo */}
        <section className="w-full max-w-5xl">
          <Card className="backdrop-blur-sm bg-card/80 border-border/50">
            <CardHeader className="flex items-start justify-between gap-4">
              <div>
                <CardTitle>Product Demo</CardTitle>
                <CardDescription>Preview Domestic vs International departures</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="domestic" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="domestic">Domestic</TabsTrigger>
                  <TabsTrigger value="international">International</TabsTrigger>
                </TabsList>
                <TabsContent value="domestic">
                  <DemoTable data={sampleDomestic} />
                </TabsContent>
                <TabsContent value="international">
                  <DemoTable data={sampleInternational} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </motion.div>
    </AuroraBackground>
  );
};

export default Landing;
