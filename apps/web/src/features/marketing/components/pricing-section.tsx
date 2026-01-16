"use client";

import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    description: "Perfect for getting started",
    price: { monthly: 0, yearly: 0 },
    icon: Sparkles,
    gradient: "from-zinc-500 to-zinc-600",
    features: [
      "Up to 3 connected accounts",
      "Basic portfolio tracking",
      "Daily price updates",
      "Net worth dashboard",
      "Email support",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Pro",
    description: "For serious investors",
    price: { monthly: 12, yearly: 9 },
    icon: Zap,
    gradient: "from-emerald-500 to-cyan-500",
    features: [
      "Unlimited connected accounts",
      "Real-time price updates",
      "Advanced analytics & charts",
      "AI-powered insights",
      "Multi-currency support",
      "Priority support",
      "Export to CSV/PDF",
    ],
    cta: "Start 14-day Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For teams & advisors",
    price: { monthly: 49, yearly: 39 },
    icon: Crown,
    gradient: "from-purple-500 to-pink-500",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Client portfolio management",
      "White-label reports",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "SSO & advanced security",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-zinc-400 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Simple, transparent pricing</span>
          </div>

          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Choose your{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              plan
            </span>
          </h2>

          <p className="text-zinc-400 max-w-2xl mx-auto text-lg mb-10">
            Start free and upgrade as you grow. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-zinc-900 border border-white/10 relative">
            {/* Sliding Pill */}
            <div className="relative flex items-center">
              <button
                onClick={() => setIsYearly(false)}
                className={`
                  relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300
                  ${!isYearly ? "text-black" : "text-zinc-400 hover:text-white"}
                `}
              >
                {!isYearly && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`
                  relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 flex items-center gap-2
                  ${isYearly ? "text-black" : "text-zinc-400 hover:text-white"}
                `}
              >
                {isYearly && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-white rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                Yearly
                <span
                  className={`text-xs px-2 py-0.5 rounded-full transition-colors ${isYearly ? "bg-emerald-500 text-white" : "bg-zinc-800 text-emerald-400"}`}
                >
                  Save 25%
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.price.yearly : plan.price.monthly;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`
                  relative group cursor-pointer
                  ${plan.popular ? "md:-mt-4 md:mb-4" : ""}
                `}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div
                  className={`
                    h-full p-6 md:p-8 rounded-2xl border transition-all duration-300
                    ${
                      plan.popular
                        ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/10 to-transparent"
                        : "border-white/5 bg-zinc-900/50 hover:border-white/10 hover:bg-zinc-900/80"
                    }
                  `}
                >
                  {/* Plan icon */}
                  <div
                    className={`
                      inline-flex h-12 w-12 items-center justify-center rounded-xl 
                      bg-gradient-to-br ${plan.gradient} mb-6 shadow-lg
                    `}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Plan name & description */}
                  <h3
                    className="text-2xl font-bold text-white mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {plan.name}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span
                        className="text-4xl md:text-5xl font-bold text-white"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        ${price}
                      </span>
                      {price > 0 && <span className="text-zinc-500 text-sm">/month</span>}
                    </div>
                    {isYearly && price > 0 && (
                      <p className="text-zinc-500 text-xs mt-1">
                        Billed annually (${price * 12}/year)
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={plan.name === "Enterprise" ? "/contact" : "/signup"}
                    className="block mb-8"
                  >
                    <Button
                      className={`
                        w-full h-12 rounded-xl font-medium transition-all duration-300 cursor-pointer
                        ${
                          plan.popular
                            ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                            : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                        }
                      `}
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 text-sm">
                        <Check
                          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.popular ? "text-emerald-400" : "text-zinc-500"}`}
                        />
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-zinc-500 text-sm mt-12"
        >
          All plans include SSL encryption, 99.9% uptime SLA, and 24/7 monitoring.
          <br />
          Need a custom plan?{" "}
          <Link href="/contact" className="text-emerald-400 hover:underline cursor-pointer">
            Contact us
          </Link>
        </motion.p>
      </div>
    </section>
  );
}
