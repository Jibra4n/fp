import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMenu, useCreateOrder } from "@/hooks/use-menu";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";

export default function OrderPage() {
  const [, setLocation] = useLocation();
  const { data: menuItems, error } = useMenu();
  const { mutate: createOrder, isPending, isSuccess } = useCreateOrder();

  const [mainId, setMainId] = useState<string>("");
  const [mainQty, setMainQty] = useState<string>("1");
  const [dessertId, setDessertId] = useState<string>("");
  const [dessertQty, setDessertQty] = useState<string>("0");
  const [pickupDate, setPickupDate] = useState<string>("");

  const mains = menuItems?.filter(item => item.category === 'main') || [];
  const desserts = menuItems?.filter(item => item.category === 'dessert') || [];

  const calculateTotal = () => {
    let total = 0;
    if (mainId) {
      const item = mains.find(i => i.id.toString() === mainId);
      if (item) total += item.price * parseInt(mainQty);
    }
    if (dessertId) {
      const item = desserts.find(i => i.id.toString() === dessertId);
      if (item) total += item.price * parseInt(dessertQty);
    }
    return total;
  };

  if (error) {
    return (
      <Layout title="order" showBack backTo="/menu">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 px-6 text-center">
          <p className="text-red-400 font-medium">Unable to load menu.</p>
          <p className="text-zinc-500 text-sm">Please ensure the database is connected and initialized.</p>
        </div>
      </Layout>
    );
  }

  const handleSubmit = () => {
    if (!mainId || !pickupDate) return;

    createOrder({
      mainItemId: parseInt(mainId),
      mainQuantity: parseInt(mainQty),
      dessertItemId: dessertId ? parseInt(dessertId) : null,
      dessertQuantity: dessertId ? parseInt(dessertQty) : 0,
      pickupDate,
      totalPrice: calculateTotal(),
    }, {
      onSuccess: () => {
        setTimeout(() => setLocation("/"), 2000);
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-green-400"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-display mb-2">Order Confirmed</h1>
          <p className="text-zinc-400">See you at pickup!</p>
        </div>
      </div>
    );
  }

  // Generate pickup dates (Next 3 days)
  const dates = [1, 2, 3].map(d => {
    const date = addDays(new Date(), d);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: d === 1 ? 'Tomorrow' : format(date, 'EEEE, MMM do')
    };
  });

  return (
    <Layout title="order" showBack backTo="/menu">
      <div className="space-y-10 pb-32">
        
        {/* Main Selection */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold block">Main Meal</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={mainId} onValueChange={setMainId}>
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl">
                  <SelectValue placeholder="Select Main..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {mains.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Select value={mainQty} onValueChange={setMainQty}>
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white min-w-[4rem]">
                  {[1,2,3,4,5].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Dessert Selection */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold block">Dessert (Optional)</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={dessertId} onValueChange={(val) => {
                setDessertId(val);
                if (val && dessertQty === "0") setDessertQty("1");
              }}>
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl">
                  <SelectValue placeholder="Select Dessert..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {desserts.map(item => (
                    <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Select value={dessertQty} onValueChange={setDessertQty} disabled={!dessertId}>
                <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl disabled:opacity-30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white min-w-[4rem]">
                  {[0,1,2,3,4,5].map(n => (
                    <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-4">
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold block">When</label>
          <Select value={pickupDate} onValueChange={setPickupDate}>
            <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-white h-12 rounded-xl">
              <SelectValue placeholder="Select Pickup Date..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
              {dates.map(date => (
                <SelectItem key={date.value} value={date.value}>{date.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total */}
        <div className="pt-8 border-t border-white/5 flex justify-between items-end">
           <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold pb-1">Order Total</span>
           <span className="text-3xl font-display font-bold">£{(calculateTotal() / 100).toFixed(2)}</span>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-40">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <Link href="/menu">
            <Button variant="secondary" className="w-full">
              Back
            </Button>
          </Link>
          <Button 
            className="w-full" 
            disabled={!mainId || !pickupDate || isPending}
            onClick={handleSubmit}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Order"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
