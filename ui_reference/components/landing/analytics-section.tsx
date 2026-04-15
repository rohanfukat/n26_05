"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

const areaData = [
  { name: "Jan", complaints: 2400, resolved: 2100 },
  { name: "Feb", complaints: 1398, resolved: 1300 },
  { name: "Mar", complaints: 9800, resolved: 9200 },
  { name: "Apr", complaints: 3908, resolved: 3700 },
  { name: "May", complaints: 4800, resolved: 4600 },
  { name: "Jun", complaints: 3800, resolved: 3700 },
  { name: "Jul", complaints: 4300, resolved: 4200 },
]

const barData = [
  { category: "Water", count: 4000 },
  { category: "Roads", count: 3000 },
  { category: "Power", count: 2000 },
  { category: "Sanitation", count: 2780 },
  { category: "Healthcare", count: 1890 },
]

const pieData = [
  { name: "Resolved", value: 65 },
  { name: "In Progress", value: 25 },
  { name: "Pending", value: 10 },
]

const tabs = ["Overview", "Categories", "Regions", "Timeline"]

export function AnalyticsSection() {
  const [activeTab, setActiveTab] = useState("Overview")

  return (
    <section id="analytics" className="py-24 lg:py-32 bg-card/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12"
        >
          <div>
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Analytics
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground text-balance">
              Real-time insights at your fingertips
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Monitor complaint trends, track resolution rates, and identify problem areas 
              with our powerful analytics dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 p-6 rounded-2xl border border-border bg-background"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Complaint Volume</h3>
                <p className="text-sm text-muted-foreground">Complaints vs Resolutions</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-chart-1" />
                <span className="text-foreground font-medium">+12.5%</span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 0%, 98%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 0%, 98%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 0%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 0%, 55%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(0, 0%, 45%)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(0, 0%, 45%)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Area
                    type="monotone"
                    dataKey="complaints"
                    stroke="hsl(0, 0%, 98%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorComplaints)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    stroke="hsl(0, 0%, 55%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorResolved)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-foreground" />
                <span className="text-sm text-muted-foreground">Complaints</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span className="text-sm text-muted-foreground">Resolved</span>
              </div>
            </div>
          </motion.div>

          {/* Side Stats */}
          <div className="space-y-6">
            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-6 rounded-2xl border border-border bg-background"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Status Distribution</h3>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? "hsl(0, 0%, 98%)" : index === 1 ? "hsl(0, 0%, 55%)" : "hsl(0, 0%, 35%)"}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: index === 0 ? "hsl(0, 0%, 98%)" : index === 1 ? "hsl(0, 0%, 55%)" : "hsl(0, 0%, 35%)" }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-6 rounded-2xl border border-border bg-background"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Avg Resolution Time</span>
                  <span className="font-semibold text-foreground flex items-center gap-2">
                    4.2 days
                    <TrendingDown className="w-4 h-4 text-chart-1" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Citizen Satisfaction</span>
                  <span className="font-semibold text-foreground">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Cases</span>
                  <span className="font-semibold text-foreground">1,234</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Categories Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 p-6 rounded-2xl border border-border bg-background"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Complaints by Category</h3>
              <p className="text-sm text-muted-foreground">Top 5 categories this month</p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis 
                  type="number" 
                  stroke="hsl(0, 0%, 45%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="category" 
                  stroke="hsl(0, 0%, 45%)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(0, 0%, 98%)" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
