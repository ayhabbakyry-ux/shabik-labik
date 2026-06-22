
"use client";

import { useState } from "react";
import { PlusCircle, Wallet, Send, Landmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function WalletCard() {
  const { userBalance, requestDeposit } = useUser();
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDeposit = () => {
    if (!amount || isNaN(Number(amount))) return;
    requestDeposit(Number(amount));
    setOpen(false);
    setAmount("");
    toast({
      title: "Deposit Submitted",
      description: "Admin will verify your payment notification shortly.",
    });
  };

  return (
    <Card className="bg-primary text-white border-none shadow-xl overflow-hidden relative">
      <div className="absolute top-[-20px] right-[-20px] opacity-10">
        <Wallet className="h-40 w-40" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="space-y-1">
          <p className="text-primary-foreground/70 text-sm font-medium">Available Balance</p>
          <h2 className="text-4xl font-bold tracking-tight">
            {userBalance.toLocaleString()} <span className="text-xl font-normal opacity-70">SYP</span>
          </h2>
        </div>

        <div className="flex gap-3 mt-8">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="w-full shadow-lg">
                <PlusCircle className="mr-2 h-4 w-4" /> Deposit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Wallet Recharge</DialogTitle>
                <DialogDescription>
                  Transfer funds to one of our accounts and submit the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /> Sham Cash</span>
                    <span className="font-bold">57394</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Send className="h-4 w-4 text-primary" /> Syriatel Cash</span>
                    <span className="font-bold">0964659123</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><Send className="h-4 w-4 text-primary" /> MTN Cash</span>
                    <span className="font-bold">0955123456</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount to Charge (SYP)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="e.g. 50000" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleDeposit} className="w-full">Submit Transfer Notification</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
