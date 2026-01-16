"use client";

import { motion, type Variants } from "framer-motion";
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  ShieldCheck,
  Zap,
  Smartphone,
  ArrowUpRight,
  Sparkles,
  Globe,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "All-in-One Dashboard",
    description:
      "Connect brokerage accounts, crypto wallets, and bank accounts in one unified view. Never switch between apps again.",
    gradient: "from-emerald-500 to-cyan-500",
    size: "large", // spans 2 columns
  },
  {
    icon: LineChart,
    title: "Advanced Analytics",
    description: "Visualize your net worth growth, asset allocation, and performance metrics.",
    gradient: "from-purple-500 to-pink-500",
    size: "normal",
  },
  {
    icon: Wallet,
    title: "Crypto Integration",
    description: "Direct integration with major blockchains. Track DeFi positions and NFTs.",
    gradient: "from-orange-500 to-amber-500",
    size: "normal",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Insights",
    description:
      "Get personalized recommendations and automated portfolio rebalancing alerts based on market conditions.",
    gradient: "from-cyan-500 to-blue-500",
    size: "large",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Level Security",
    description: "256-bit encryption, SOC 2 certified. Your data is safe and we never sell it.",
    gradient: "from-emerald-500 to-teal-500",
    size: "normal",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Prices update in real-time. Always know your exact net worth down to the penny.",
    gradient: "from-yellow-500 to-orange-500",
    size: "normal",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description:
      "Track assets in any currency with automatic conversion and consolidated reporting globally.",
    gradient: "from-blue-500 to-indigo-500",
    size: "large",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description:
      "Beautiful responsive design with native-like experience. Check your portfolio anywhere, anytime.",
    gradient: "from-pink-500 to-rose-500",
    size: "large",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(255,255,255) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-400 mb-6">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Powerful Features</span>
          </div>

          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              grow your wealth
            </span>
          </h2>

          <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
            Powerful tools designed for modern investors. Stocks, crypto, or real estate —
            we&apos;ve got you covered.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isLarge = feature.size === "large";

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`
                  group relative p-6 md:p-8 rounded-2xl 
                  border border-white/5 bg-zinc-900/50 
                  hover:bg-zinc-900/80 hover:border-white/10
                  transition-all duration-300 cursor-pointer
                  ${isLarge ? "lg:col-span-2" : ""}
                `}
                whileHover={{ y: -4 }}
              >
                {/* Gradient glow on hover */}
                <div
                  className={`
                    absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 
                    transition-opacity duration-500 -z-10 blur-2xl
                    bg-gradient-to-br ${feature.gradient}
                  `}
                />

                {/* Icon with gradient background */}
                <div
                  className={`
                    inline-flex h-12 w-12 items-center justify-center rounded-xl 
                    bg-gradient-to-br ${feature.gradient} 
                    mb-6 shadow-lg
                  `}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3
                      className="text-xl font-semibold text-white mb-3 group-hover:text-white transition-colors"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                      {feature.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <ArrowUpRight className="h-5 w-5 text-zinc-600 group-hover:text-emerald-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0 mt-1" />
                </div>

                {/* Bottom highlight line */}
                <div
                  className={`
                    absolute bottom-0 left-6 right-6 h-px 
                    bg-gradient-to-r ${feature.gradient} 
                    opacity-0 group-hover:opacity-50 transition-opacity duration-300
                  `}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Security Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-zinc-500"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
            <Lock className="h-4 w-4 text-emerald-500" />
            <span>SOC 2 Type II Certified</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>256-bit Encryption</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/5">
            <Globe className="h-4 w-4 text-emerald-500" />
            <span>GDPR Compliant</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
