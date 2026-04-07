import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { 
  Heart, MessageCircle, Lock, Unlock, Plus, Image as ImageIcon, 
  LogOut, CheckCircle2, ShieldCheck, Headphones, LayoutDashboard, 
  ShoppingBag, User as UserIcon, Settings, Check, X, QrCode, Copy, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from './lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- Types ---
interface UserProfile { uid: string; displayName: string; email: string; photoURL: string; balance: number; role: 'user'|'admin'; createdAt: any; }
interface Post { id: string; content: string; imageUrl?: string; ownerUid: string; ownerName: string; ownerPhoto: string; likes: number; isPremium?: boolean; price?: number; createdAt: any; }

// --- Mock Data ---
const chartData = [
  { name: '01/04', volume: 400 }, { name: '02/04', volume: 300 }, { name: '03/04', volume: 550 },
  { name: '04/04', volume: 450 }, { name: '05/04', volume: 700 }, { name: '06/04', volume: 600 },
];

const mockOrders = [
  { id: '1', client: '@joao_silva', service: 'Pack Exclusivo VIP', value: 49.90, date: '06/04/2026', status: 'pending' },
  { id: '2', client: '@maria_clara', service: 'Vídeo Personalizado', value: 99.90, date: '05/04/2026', status: 'completed' },
];

// --- Components ---

const Navbar = ({ user, onOpenAuth, setActiveTab }: any) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-dark/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <span className="text-2xl font-display font-bold tracking-tight">Pack<span className="text-brand-pink">Zinhu</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
          <button onClick={() => setActiveTab('landing')} className="hover:text-white transition-colors">Início</button>
          <button onClick={() => setActiveTab('dashboard')} className="hover:text-white transition-colors">Serviços</button>
          <button onClick={() => setActiveTab('feed')} className="text-white font-bold px-4 py-2 rounded-lg border border-brand-pink shadow-[0_0_10px_rgba(255,64,129,0.3)] hover:shadow-[0_0_20px_rgba(255,64,129,0.5)] transition-all">
            Explorar Feed
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('profile')} className="flex items-center gap-2 hover:opacity-80">
              <img src={user.photoURL} alt="Profile" className="w-10 h-10 rounded-full border border-brand-purple" referrerPolicy="no-referrer" />
            </button>
            <button onClick={logout} className="p-2 text-white/60 hover:text-white"><LogOut size={20} /></button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={onOpenAuth} className="text-sm font-medium hover:text-brand-pink transition-colors">Entrar</button>
            <button onClick={onOpenAuth} className="bg-brand-purple px-6 py-2 rounded-lg text-sm font-bold hover:bg-brand-purple/80 transition-all shadow-lg">Cadastrar</button>
          </div>
        )}
      </div>
    </div>
  </nav>
);

const Landing = ({ setActiveTab }: any) => (
  <section className="pt-32 pb-20 px-4 min-h-screen flex flex-col items-center justify-center">
    <div className="max-w-4xl mx-auto text-center space-y-8">
      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[1.1]">
        VENDEU <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-purple to-brand-pink">95% do Valor é Seu !!</span><br />
        SEM Taxa de Saque.
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-white/60 max-w-2xl mx-auto">
        O PackZinhu Loja de Conteúdo exclusivo. Pagamento via PIX e acesso imediato.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap items-center justify-center gap-4">
        <button onClick={() => setActiveTab('dashboard')} className="bg-brand-pink px-8 py-4 rounded-lg font-bold text-lg shadow-[0_0_30px_rgba(255,64,129,0.5)] hover:scale-105 transition-all">
          Começar a Vender
        </button>
        <button onClick={() => setActiveTab('feed')} className="border border-brand-purple text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-brand-purple/10 transition-all">
          Explorar Feed
        </button>
        <button className="bg-white/5 backdrop-blur-md px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all text-white/80">
          Explorar Serviços
        </button>
      </motion.div>
      <div className="flex flex-wrap items-center justify-center gap-8 pt-12 text-sm font-medium text-white/60">
        <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> 95% do valor para você</div>
        <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-green-500" /> Pagamento seguro</div>
        <div className="flex items-center gap-2"><Headphones size={18} className="text-green-500" /> Suporte 24/7</div>
      </div>
    </div>
  </section>
);

const Feed = ({ posts, onCheckout }: any) => {
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-24 pb-20 px-4">
      {posts.map((post: Post) => (
        <div key={post.id} className="bg-bg-card rounded-2xl border border-brand-purple/30 overflow-hidden backdrop-blur-xl shadow-xl">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={post.ownerPhoto} alt={post.ownerName} className="w-12 h-12 rounded-full border-2 border-brand-purple" referrerPolicy="no-referrer" />
              <div>
                <h4 className="font-bold text-sm">{post.ownerName}</h4>
                <span className="text-[10px] text-white/40">@{post.ownerName.toLowerCase().replace(/\s/g, '')}_oficial</span>
              </div>
            </div>
            <button className="bg-brand-purple px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-brand-purple/80 transition-colors">Seguir</button>
          </div>
          
          <div className="relative group" onMouseEnter={() => setHoveredPost(post.id)} onMouseLeave={() => setHoveredPost(null)}>
            {post.isPremium ? (
              <>
                <img src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/800`} alt="Premium Content" className="w-full aspect-square object-cover blur-xl opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <Lock className="text-white/80 mb-4 drop-shadow-lg" size={64} />
                </div>
              </>
            ) : (
              <img src={post.imageUrl || `https://picsum.photos/seed/${post.id}/800/800`} alt="Content" className="w-full aspect-square object-cover" />
            )}
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center gap-6">
              <button className="group flex items-center gap-2 text-white/60 hover:text-brand-pink transition-colors relative cursor-pointer">
                <div className="absolute inset-0 bg-brand-pink/20 rounded-full scale-0 group-active:scale-150 transition-transform duration-300 opacity-0 group-active:opacity-100"></div>
                <Heart size={28} className={cn("transition-all", hoveredPost === post.id ? "fill-brand-pink text-brand-pink scale-110" : "")} />
                <span className="text-sm font-bold">{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors cursor-pointer">
                <MessageCircle size={28} />
                <span className="text-sm font-bold">12</span>
              </button>
            </div>
            <p className="text-sm leading-relaxed"><span className="font-bold mr-2">{post.ownerName}</span>{post.content}</p>
            
            {post.isPremium && (
              <button onClick={() => onCheckout(post)} className="w-full mt-4 bg-brand-pink py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-brand-pink/90 transition-all shadow-[0_0_15px_rgba(255,64,129,0.4)]">
                <Unlock size={20} />
                Desbloquear Conteúdo - R$ {post.price?.toFixed(2).replace('.', ',')}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const Dashboard = ({ user, onOpenCreate }: any) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto flex gap-8">
      <aside className="w-64 shrink-0 hidden lg:block">
        <div className="bg-bg-card rounded-2xl border border-white/5 p-4 space-y-2 sticky top-24">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-brand-purple/20 text-brand-purple font-bold"><LayoutDashboard size={20} /> Dashboard</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors"><ShoppingBag size={20} /> Vendas</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors"><Heart size={20} /> Compras</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors"><UserIcon size={20} /> Perfil</button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:bg-white/5 hover:text-white transition-colors"><Settings size={20} /> Configurações</button>
        </div>
      </aside>
      
      <main className="flex-1 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
            <p className="text-white/60 text-sm mb-2">Saldo Disponível (95%)</p>
            <h3 className="text-3xl font-bold text-brand-pink mb-4">R$ 1.240,50</h3>
            <button className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-bold transition-colors">Sacar via PIX</button>
          </div>
          <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
            <p className="text-white/60 text-sm mb-2">Vendas Totais</p>
            <h3 className="text-3xl font-bold">210</h3>
          </div>
          <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
            <p className="text-white/60 text-sm mb-2">Serviços Pendentes</p>
            <h3 className="text-3xl font-bold text-yellow-500">3</h3>
          </div>
          <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
            <p className="text-white/60 text-sm mb-2">Receita Mês</p>
            <h3 className="text-3xl font-bold text-brand-purple">R$ 3.450,00</h3>
          </div>
        </div>

        <div className="bg-bg-card rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Gestão de Serviços</h3>
            <button onClick={onOpenCreate} className="bg-brand-pink px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-brand-pink/80 transition-colors">
              <Plus size={16} /> Novo
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/60 text-sm">
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Serviço</th>
                  <th className="pb-3 font-medium">Valor</th>
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Status/Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-4 text-sm">{order.client}</td>
                    <td className="py-4 text-sm">{order.service}</td>
                    <td className="py-4 text-sm font-bold">R$ {order.value.toFixed(2).replace('.', ',')}</td>
                    <td className="py-4 text-sm text-white/60">{order.date}</td>
                    <td className="py-4">
                      {order.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button 
                            onMouseEnter={() => setHoveredAction('accept')}
                            onMouseLeave={() => setHoveredAction(null)}
                            className={cn("p-2 rounded-lg bg-green-500/20 text-green-500 transition-all", hoveredAction === 'accept' ? "shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-110" : "")}
                          >
                            <Check size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-colors"><X size={16} /></button>
                          <button className="text-xs text-white/60 hover:text-white underline ml-2">Ver Detalhes</button>
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-bold">Concluído</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-bg-card rounded-2xl border border-white/5 p-6 h-80">
          <h3 className="text-xl font-bold mb-6">Volume de Transações (30 dias)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1a1625', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} />
              <Bar dataKey="volume" fill="#7c4dff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  );
};

const Profile = ({ user }: any) => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className="pt-16 pb-20">
      <div className="h-64 w-full bg-gradient-to-r from-brand-purple to-brand-pink relative">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=creator"} alt="Profile" className="w-32 h-32 rounded-full border-4 border-bg-dark shadow-[0_0_20px_rgba(124,77,255,0.5)]" referrerPolicy="no-referrer" />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 pt-20 text-center space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">{user?.displayName || 'Criador Oficial'}</h1>
          <p className="text-white/60">@{user?.displayName?.toLowerCase().replace(/\s/g, '') || 'criador'}</p>
        </div>
        <p className="max-w-2xl mx-auto text-white/80">Criador de conteúdo digital exclusivo. Packs de fotos, vídeos personalizados e muito mais. Bem-vindo ao meu espaço VIP! ✨</p>
        
        <div className="flex justify-center gap-8 py-4 border-y border-white/5">
          <div><h4 className="text-2xl font-bold">5.4k</h4><p className="text-xs text-white/60 uppercase tracking-wider">Seguidores</p></div>
          <div><h4 className="text-2xl font-bold">210</h4><p className="text-xs text-white/60 uppercase tracking-wider">Vendas</p></div>
          <div><h4 className="text-2xl font-bold flex items-center justify-center gap-1">4.9<Star size={16} className="fill-yellow-500 text-yellow-500"/></h4><p className="text-xs text-white/60 uppercase tracking-wider">Avaliação</p></div>
        </div>

        <div className="flex justify-center gap-4">
          <button className="border border-brand-purple text-brand-purple px-8 py-2 rounded-lg font-bold hover:bg-brand-purple/10 transition-colors">Seguir</button>
          <button className="bg-white/10 text-white px-8 py-2 rounded-lg font-bold hover:bg-white/20 transition-colors">Mensagem</button>
        </div>

        <div className="grid grid-cols-3 gap-1 md:gap-4 pt-8">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="aspect-square relative group overflow-hidden rounded-lg cursor-pointer" onMouseEnter={() => setHoveredItem(i)} onMouseLeave={() => setHoveredItem(null)}>
              <img src={`https://picsum.photos/seed/pack${i}/400/400`} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 blur-sm" />
              <AnimatePresence>
                {hoveredItem === i && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-bg-dark/60 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Lock className="text-brand-pink mb-2" size={24} />
                    <span className="font-bold text-lg">R$ 49,90</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CreateModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-dark/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-bg-card w-full max-w-lg rounded-2xl p-8 border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-display font-bold mb-6">Nova Postagem / Serviço</h2>
        <div className="border-2 border-dashed border-white/20 rounded-xl h-40 flex flex-col items-center justify-center text-white/40 mb-6 hover:border-brand-pink/50 hover:text-brand-pink transition-colors cursor-pointer bg-black/20">
          <ImageIcon size={32} className="mb-2" />
          <p className="text-sm">Arraste e solte ou clique para enviar Mídia (Foto/Vídeo)</p>
        </div>
        <form className="space-y-4">
          <input placeholder="Título da Postagem" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple transition-colors" />
          <textarea placeholder="Descrição/Legenda" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 h-24 focus:outline-none focus:border-brand-purple transition-colors" />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Valor (deixe em branco para grátis)" type="number" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple transition-colors" />
            <input placeholder="Tags (separadas por vírgula)" className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-purple transition-colors" />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-white/20 py-3 rounded-lg font-bold hover:bg-white/5 transition-colors">Cancelar</button>
            <button type="button" onClick={onClose} className="flex-1 bg-brand-pink py-3 rounded-lg font-bold hover:bg-brand-pink/90 transition-colors shadow-[0_0_15px_rgba(255,64,129,0.4)]">Publicar Postagem</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CheckoutModal = ({ isOpen, onClose, post }: any) => {
  if (!isOpen || !post) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-dark/95 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-bg-card w-full max-w-md rounded-2xl p-8 border border-white/10 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-display font-bold">Checkout</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={24}/></button>
        </div>
        
        <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5">
          <h4 className="font-bold mb-1">Conteúdo Premium</h4>
          <p className="text-sm text-white/60 mb-4">Criador: {post.ownerName}</p>
          <div className="flex justify-between text-sm mb-2"><span className="text-white/60">Valor</span><span>R$ {post.price?.toFixed(2).replace('.', ',')}</span></div>
          <div className="flex justify-between text-sm mb-4 pb-4 border-b border-white/10"><span className="text-white/60">Taxas</span><span>R$ 0,00</span></div>
          <div className="flex justify-between font-bold text-lg"><span>Total a Pagar</span><span className="text-brand-pink">R$ {post.price?.toFixed(2).replace('.', ',')}</span></div>
        </div>

        <div className="text-center space-y-4">
          <h3 className="font-bold flex items-center justify-center gap-2"><QrCode className="text-[#32BCAD]" /> Pagamento via PIX</h3>
          <div className="bg-white p-4 rounded-xl inline-block">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pix-payload-mock`} alt="QR Code PIX" className="w-40 h-40" />
          </div>
          <button className="w-full border border-brand-purple text-brand-purple py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-brand-purple/10 transition-colors">
            <Copy size={18} /> Copiar Código PIX
          </button>
          <p className="text-sm text-brand-pink animate-pulse font-medium mt-4">Aguardando pagamento... Acesso imediato após confirmação</p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState<'landing'|'feed'|'dashboard'|'profile'>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [checkoutPost, setCheckoutPost] = useState<Post | null>(null);

  // Mock posts for the feed
  const mockPosts: Post[] = [
    { id: 'p1', content: 'Conteúdo exclusivo liberado apenas para assinantes premium! 🔥✨', ownerUid: '1', ownerName: 'PackZinhu Oficial', ownerPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=packzinhu', likes: 1200, isPremium: true, price: 29.90, createdAt: new Date() },
    { id: 'p2', content: 'Novo ensaio disponível na loja! Confiram o link na bio. 📸💖', ownerUid: '2', ownerName: 'Ana Silva', ownerPhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana', likes: 450, isPremium: false, createdAt: new Date() }
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-white font-sans selection:bg-brand-pink/30">
      <Navbar user={user} onOpenAuth={() => setIsAuthOpen(true)} setActiveTab={setActiveTab} />
      
      {activeTab === 'landing' && <Landing setActiveTab={setActiveTab} />}
      {activeTab === 'feed' && <Feed posts={mockPosts} onCheckout={setCheckoutPost} />}
      {activeTab === 'dashboard' && <Dashboard user={user} onOpenCreate={() => setIsCreateOpen(true)} />}
      {activeTab === 'profile' && <Profile user={user} />}

      <CreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <CheckoutModal isOpen={!!checkoutPost} onClose={() => setCheckoutPost(null)} post={checkoutPost} />
      
      {/* Auth Modal Mock */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg-dark/90 backdrop-blur-sm" onClick={() => setIsAuthOpen(false)}>
          <div className="bg-bg-card p-8 rounded-2xl border border-white/10 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">Entrar no PackZinhu</h2>
            <button onClick={() => { signInWithGoogle(); setIsAuthOpen(false); }} className="w-full bg-brand-purple py-3 rounded-lg font-bold hover:bg-brand-purple/90 transition-colors">
              Continuar com Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
