import { useMenu } from "@/hooks/use-menu";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui-button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Menu() {
  const { data: menuItems, isLoading, error } = useMenu();

  const mains = menuItems?.filter(item => item.category === 'main') || [];
  const desserts = menuItems?.filter(item => item.category === 'dessert') || [];

  if (error) {
    return (
      <Layout title="menu" backTo="/">
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 px-6 text-center">
          <p className="text-red-400 font-medium">Unable to load menu.</p>
          <p className="text-zinc-500 text-sm">Please ensure the database is connected and initialized.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="menu" backTo="/">
      <div className="space-y-12 pb-24">
        {/* Mains Section */}
        <section className="space-y-6">
          <h2 className="text-zinc-500 uppercase tracking-widest text-xs font-bold pl-1">Menu Mains</h2>
          
          {isLoading ? (
            <div className="grid gap-6">
              {[1, 2].map((i) => <MenuSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid gap-8">
              {mains.map((item, idx) => (
                <MenuItemCard key={item.id} item={item} index={idx} />
              ))}
            </div>
          )}
        </section>

        {/* Desserts Section */}
        <section className="space-y-6">
          <h2 className="text-zinc-500 uppercase tracking-widest text-xs font-bold pl-1">Menu Desserts</h2>
          
          {isLoading ? (
            <div className="grid gap-6">
              <MenuSkeleton />
            </div>
          ) : (
            <div className="grid gap-8">
              {desserts.map((item, idx) => (
                <MenuItemCard key={item.id} item={item} index={idx} delay={0.2} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-40 pointer-events-none">
        <div className="max-w-md w-full pointer-events-auto">
          <Link href="/order">
            <Button className="w-full shadow-2xl shadow-white/10 text-xs tracking-widest uppercase">
              Start Order
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}

function MenuItemCard({ item, index, delay = 0 }: { item: any; index: number; delay?: number }) {
  const price = (item.price / 100).toFixed(2);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 + delay }}
      className="group relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/5"
    >
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-display font-medium leading-tight">{item.name}</h3>
          <span className="font-mono text-sm text-zinc-400">£{price}</span>
        </div>
        
        <Link href={`/menu/${item.id}`}>
          <Button variant="secondary" size="sm" className="w-full text-xs tracking-widest uppercase bg-black hover:bg-zinc-800 border border-zinc-800">
            Show More
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function MenuSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-2xl bg-zinc-900" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-2/3 bg-zinc-900" />
        <Skeleton className="h-4 w-full bg-zinc-900" />
      </div>
    </div>
  );
}
