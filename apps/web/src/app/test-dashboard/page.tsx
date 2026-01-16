"use client";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Plus, TrendingUp, PieChart, Award } from "lucide-react";

export default function TestDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Test Dashboard</h1>
          <p className="text-white/60 mt-1">
            Testing sidebar layout issue - Tailwind v4 proper config
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
          <Plus className="h-4 w-4 mr-2" />
          New Portfolio
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 bg-black/40 border-white/10 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <CardTitle className="text-emerald-400 text-sm font-medium">
                Total Net Worth
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-white">$125,000.00</span>
              <span className="flex items-center text-sm text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.04%
              </span>
            </div>
            <p className="text-sm text-white/40 mt-2">
              +$2,500.00 in the last 24 hours
            </p>

            <div className="mt-6 h-48 flex items-end gap-1">
              {[40, 35, 50, 45, 60, 55, 70].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-indigo-600/50 to-indigo-400/30 rounded-t"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-indigo-400" />
                <CardTitle className="text-white text-sm font-medium">
                  Allocation
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <span className="text-white/40 text-sm">MIX</span>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { name: "Stocks", pct: "45%", color: "bg-emerald-500" },
                  { name: "Crypto", pct: "35%", color: "bg-indigo-500" },
                  { name: "Cash", pct: "20%", color: "bg-amber-500" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${item.color}`} />
                      <span className="text-sm text-white/60">{item.name}</span>
                    </div>
                    <span className="text-sm text-white">{item.pct}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <CardTitle className="text-white text-sm font-medium">
                    Top Performer
                  </CardTitle>
                </div>
                <span className="text-xs text-white/40">24h</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">Tech Portfolio</p>
                  <p className="text-xs text-white/40">Portfolio</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-3">+5.32%</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Your Portfolios</h2>
        <Button variant="ghost" className="text-white/60 hover:text-white">
          View All
        </Button>
      </div>
    </div>
  );
}
