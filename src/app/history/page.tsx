
"use client";

import { useUser } from "@/lib/store";
import { Navbar, DesktopHeader } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HistoryPage() {
  const { transactions } = useUser();

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-background">
      <DesktopHeader />
      
      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-headline">Transaction History</h1>
          <Badge variant="outline" className="px-3 py-1">All Activity</Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10 bg-white border-none shadow-sm" placeholder="Search by ID or type..." />
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-12 text-center">
                <div className="bg-muted p-4 rounded-full inline-block mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">No Transactions Found</h3>
                <p className="text-sm text-muted-foreground">Recent orders or deposits will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            transactions.map((tx) => (
              <Card key={tx.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      tx.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {tx.amount > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{tx.type}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {tx.date} • ID: {tx.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-foreground'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} SYP
                    </p>
                    <Badge variant={
                      tx.status === 'Completed' ? 'default' : 
                      tx.status === 'Pending' ? 'secondary' : 'destructive'
                    } className="text-[9px] h-4">
                      {tx.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Navbar />
    </div>
  );
}
