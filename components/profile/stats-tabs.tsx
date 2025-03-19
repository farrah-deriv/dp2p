"use client"

import type React from "react"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface StatsTabsProps {
  children: React.ReactNode
}

export default function StatsTabs({ children }: StatsTabsProps) {
  const [activeTab, setActiveTab] = useState("stats")

  const tabs = [
    { id: "stats", label: "Stats" },
    { id: "payment", label: "Payment methods" },
    { id: "ads", label: "Ad details" },
    { id: "counterparties", label: "My counterparties" },
  ]

  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList className="grid grid-cols-4 w-full">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="stats" className="p-4 border rounded-b-lg">
        {children}
      </TabsContent>
      <TabsContent value="payment" className="p-4 border rounded-b-lg">
        Payment methods content
      </TabsContent>
      <TabsContent value="ads" className="p-4 border rounded-b-lg">
        Ad details content
      </TabsContent>
      <TabsContent value="counterparties" className="p-4 border rounded-b-lg">
        My counterparties content
      </TabsContent>
    </Tabs>
  )
}

