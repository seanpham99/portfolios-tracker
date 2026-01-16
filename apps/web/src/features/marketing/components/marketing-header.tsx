"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { TrendingUp, Menu, X } from "lucide-react";
import { useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
];

export function MarketingHeader() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  return (
    <>
      {/* Floating Pill Navigation */}
      <header
        className={cn(
          "fixed top-4 left-4 right-4 z-50 mx-auto max-w-6xl transition-all duration-300",
          isScrolled ? "top-4" : "top-6"
        )}
      >
        <nav
          className={cn(
            "flex items-center justify-between rounded-full border px-4 py-2 md:px-6 md:py-3 transition-all duration-300",
            isScrolled
              ? "border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl"
              : "border-white/5 bg-white/5 backdrop-blur-md"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-2 transition-transform duration-300 group-hover:scale-105">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-lg font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Portfolio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 rounded-full hover:bg-white/5 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-zinc-300 hover:text-white hover:bg-white/5 rounded-full cursor-pointer"
              >
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-full px-6 font-medium shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 cursor-pointer">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-2 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-4"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-white/10 my-2" />
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-center text-zinc-300 hover:text-white rounded-xl cursor-pointer"
                  >
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl font-medium cursor-pointer">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
