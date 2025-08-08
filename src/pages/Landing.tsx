import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Plane } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-8 items-center justify-center px-4 z-10"
      >
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Plane className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Chennai Airport
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                Flight Information Display System
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Professional flight management and display system for airport operations
          </p>
        </div>

        <Button asChild size="lg" className="hover-scale">
          <Link to="/auth">Sign In</Link>
        </Button>
      </motion.div>
    </AuroraBackground>
  );
};

export default Landing;