
"use client";

import { useUser } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, X, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminPanel() {
  const { transactions, adminAction } = useUser();
  const pendingTxs = transactions.filter(t => t.status === 'Pending');

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 text-destructive">
        <ShieldAlert className="h-8 w-8" />
        <div>
          <h1 className="text-2xl font-bold font-headline">Maalam Console</h1>
          <p className="text-sm text-muted-foreground">Admin Verification Panel for Manual Deposits</p>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingTxs.length === 0 ? (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-12 text-center text-muted-foreground">
              No pending verification requests at the moment.
            </CardContent>
          </Card>
        ) : (
          pendingTxs.map((tx) => (
            <Card key={tx.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{tx.id}</span>
                    <Badge variant="outline">{tx.date}</Badge>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    +{tx.amount.toLocaleString()} SYP
                  </p>
                  <p className="text-xs text-muted-foreground">Type: {tx.type}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => adminAction(tx.id, 'reject')}
                  >
                    <X className="h-4 w-4 mr-1" /> Deny
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => adminAction(tx.id, 'approve')}
                  >
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Variables</CardTitle>
          <CardDescription>Adjust global pricing multipliers (Simulated)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span>Al-Ragheb Sync Status:</span>
            <Badge className="bg-green-500">Operational</Badge>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Global Tax Rate:</span>
            <span className="font-mono">2.5%</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
