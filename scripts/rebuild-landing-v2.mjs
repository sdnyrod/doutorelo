import fs from 'node:fs';

const path = '/home/ubuntu/saude-integrativa-ia-dev/client/src/pages/Home.tsx';
let source = fs.readFileSync(path, 'utf8');

function replaceBetween(input, startMarker, endMarker, replacement) {
  const start = input.indexOf(startMarker);
  if (start === -1) throw new Error(`Start marker not found: ${startMarker}`);
  const end = input.indexOf(endMarker, start);
  if (end === -1) throw new Error(`End marker not found: ${endMarker}`);
  return input.slice(0, start) + replacement + input.slice(end);
}

const shellReturn = `return (\n    <div className="min-h-screen overflow-hidden bg-[#06110f] pb-32 text-[#f7fff8]">\n      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_16%_8%,rgba(67,255,187,0.18),transparent_28rem),radial-gradient(circle_at_84%_0%,rgba(255,184,107,0.14),transparent_30rem),linear-gradient(180deg,#06110f_0%,#0a1715_45%,#102019_100%)]" />\n      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.22] [background-image:linear-gradient(rgba(209,255,226,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(209,255,226,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />\n\n      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#06110f]/72 backdrop-blur-2xl">\n        <div className="container flex h-20 items-center justify-between gap-3 py-3">\n          <button onClick={() => setTab("home")} className="group flex items-center gap-3 text-left" aria-label="Voltar ao observatório do cuidado">\n            <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.35rem] border border-emerald-200/20 bg-emerald-300/10 text-emerald-100 shadow-[0_0_50px_rgba(69,255,190,0.16)] transition-transform duration-300 group-hover:scale-105">\n              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.34),transparent_55%)]" />\n              <Leaf className="relative h-5 w-5" />\n            </span>\n            <span className="leading-tight">\n              <span className="block text-sm font-black tracking-[-0.02em] text-white">Doutor·Elo</span>\n              <span className="block text-[11px] font-medium text-emerald-100/58">observatório vivo de cuidado</span>\n            </span>\n          </button>\n          <div className="flex items-center gap-2">\n            <Badge variant="secondary" className="hidden rounded-full border border-emerald-200/15 bg-emerald-300/10 px-3 py-1 text-emerald-100 sm:inline-flex">\n              <Sparkles className="mr-1 h-3.5 w-3.5" /> Cuidado com mais clareza\n            </Badge>\n            <Button\n              variant="outline"\n              size="sm"\n              className="rounded-full border-white/15 bg-white/8 text-white shadow-sm backdrop-blur-xl hover:bg-white/14 hover:text-white"\n              onClick={() => {\n                if (isAuthenticated) toast.info(`Sessão ativa: ${user?.name ?? "usuário"}`);\n                else window.location.href = getLoginUrl();\n              }}\n              disabled={loading}\n            >\n              <UserRound className="mr-1.5 h-4 w-4" />\n              {isAuthenticated ? "Conta" : "Entrar"}\n            </Button>\n          </div>\n        </div>\n      </header>\n\n      <main className="container relative z-10 max-w-full overflow-x-clip pt-5">\n        <HeroCockpit\n          consentComplete={consentComplete}\n          onStartTriage={() => setTab("triage")}\n          onOpenDoctors={() => setTab("doctors")}\n        />\n\n        <section className="mt-7">\n          {tab === "home" && <HomePanel onStartTriage={() => setTab("triage")} onOpenDoctors={() => setTab("doctors")} />}\n          {tab === "triage" && (\n            <TriagePanel\n              consent={consent}\n              draftConsent={draftConsent}\n              setDraftConsent={setDraftConsent}\n              acceptConsent={acceptConsent}\n              messages={messages}\n              triageInput={triageInput}\n              setTriageInput={setTriageInput}\n              sendTriage={sendTriage}\n              triagePending={evaluateTriage.isPending}\n            />\n          )}\n          {tab === "doctors" && <DoctorsPanel onRequestAppointment={requestAppointment} />}\n          {tab === "feed" && <FeedPanel />}\n          {tab === "market" && <MarketplacePanel cart={cart} onAdd={addToCart} />}\n        </section>\n      </main>\n\n      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#06110f]/86 px-0 pt-2 shadow-[0_-18px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl thumb-safe-bottom lg:static lg:inset-auto lg:z-auto lg:mt-8 lg:border-0 lg:bg-transparent lg:pt-0 lg:shadow-none lg:backdrop-blur-none">\n        <div className="mx-0 grid w-screen max-w-none grid-cols-5 gap-0 rounded-t-[1.85rem] border border-white/12 bg-white/[0.07] p-1 sm:mx-auto sm:w-[calc(100vw-1rem)] sm:max-w-[23rem] sm:gap-1 sm:rounded-[1.85rem] sm:p-1.5 lg:w-full lg:max-w-[34rem] lg:rounded-[1.85rem] lg:shadow-[0_18px_60px_rgba(0,0,0,0.24)]">\n          <BottomNavButton active={tab === "home"} label="Início" icon={HomeIcon} onClick={() => setTab("home")} />\n          <BottomNavButton active={tab === "triage"} label="IA" icon={MessageCircleHeart} onClick={() => setTab("triage")} />\n          <BottomNavButton active={tab === "doctors"} label="Médicos" icon={Stethoscope} onClick={() => setTab("doctors")} />\n          <BottomNavButton active={tab === "feed"} label="Saber" icon={BookOpen} onClick={() => setTab("feed")} />\n          <BottomNavButton active={tab === "market"} label="Rituais" icon={ShoppingBag} onClick={() => setTab("market")} />\n        </div>\n      </nav>\n    </div>\n  );\n}`;

source = replaceBetween(source, 'return (\n    <div className="min-h-screen overflow-hidden pb-32 text-foreground">', '\n}\n\nconst v4HeroDensityContract', shellReturn + '\n\nconst v4HeroDensityContract');

const hero = `function HeroCockpit({ consentComplete, onStartTriage, onOpenDoctors }: { consentComplete: boolean; onStartTriage: () => void; onOpenDoctors: () => void }) {
  return (
    <section className="alien-hero relative min-h-[calc(100vh-7.5rem)] overflow-hidden rounded-[2.4rem] border border-emerald-200/14 bg-[#07120f]/82 px-5 py-8 shadow-[0_40px_160px_rgba(0,0,0,0.44)] backdrop-blur-2xl sm:px-8 sm:py-12 lg:px-12" data-v6-landing-signature="observatorio-vivo-cuidado">
      <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_62%_34%,rgba(89,255,190,0.16),transparent_24rem),radial-gradient(circle_at_88%_78%,rgba(255,170,94,0.12),transparent_25rem),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_42%)]" />
      <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-emerald-300/10 blur-[80px]" />
      <div className="absolute -right-24 bottom-8 h-80 w-80 rounded-full bg-amber-300/10 blur-[90px]" />

      <div className="relative z-10 grid min-w-0 gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-4xl">
          <Badge className="mb-6 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-4 py-1.5 text-emerald-100 hover:bg-emerald-300/10">Seu próximo passo com mais clareza.</Badge>
          <h1 className="max-w-5xl text-balance font-serif text-[4rem] leading-[0.82] tracking-[-0.07em] text-[#f8fff8] sm:text-[6.6rem] lg:text-[7.9rem]">
            O cuidado ganha outra dimensão quando alguém entende o todo.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-emerald-50/72 sm:text-xl" data-v6-hero-support="human-premium">
            Doutor·Elo aproxima sintomas, exames, rotina e orientação profissional em uma experiência de saúde mais clara, contínua e responsável.
          </p>
          <div className="mt-9 grid gap-3 text-sm text-emerald-50/74 sm:grid-cols-3">
            <HeroProof label="Menos ruído na cabeça" />
            <HeroProof label="Mais clareza para conversar" />
            <HeroProof label="Um caminho possível agora" />
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row" aria-label="Ações principais da primeira dobra">
            <Button size="lg" className="h-14 rounded-[1.35rem] bg-[#d9ff8f] px-7 text-base font-black text-[#0a1711] shadow-[0_0_70px_rgba(217,255,143,0.24)] hover:bg-[#ecffbd]" onClick={onStartTriage}>
              Conhecer a experiência <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 rounded-[1.35rem] border-white/18 bg-white/8 px-7 text-base font-semibold text-white backdrop-blur-xl hover:bg-white/14 hover:text-white" onClick={onOpenDoctors}>
              Ver como o elo funciona
            </Button>
          </div>
          <p className="mt-6 max-w-xl text-xs leading-6 text-emerald-50/50">
            {consentComplete ? "Privacidade confirmada para continuar a conversa." : "Você autoriza antes de compartilhar dados de saúde. A experiência apoia clareza e vínculo; não substitui avaliação profissional."}
          </p>
        </div>

        <aside className="relative mx-auto flex w-full max-w-[42rem] items-center justify-center py-6 lg:py-14" aria-label="Mapa vivo do cuidado integrativo">
          <div className="care-orbit relative aspect-square w-full max-w-[36rem] rounded-full border border-emerald-100/10 bg-[radial-gradient(circle,rgba(69,255,190,0.12),transparent_34%,rgba(255,255,255,0.035)_35%,transparent_36%)] shadow-[inset_0_0_90px_rgba(87,255,199,0.08),0_0_120px_rgba(0,0,0,0.38)]">
            <div className="absolute inset-[8%] rounded-full border border-dashed border-emerald-100/16" />
            <div className="absolute inset-[22%] rounded-full border border-emerald-100/12" />
            <div className="absolute inset-[35%] rounded-full border border-amber-100/12" />
            <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100/20 bg-[#09201a]/92 shadow-[0_0_90px_rgba(87,255,199,0.28)]">
              <HeartPulse className="h-9 w-9 text-[#d9ff8f]" />
            </div>
            <OrbitalNode className="left-[8%] top-[34%]" title="rotina" text="sono, energia e hábitos" icon={Moon} />
            <OrbitalNode className="right-[4%] top-[22%]" title="exames" text="contexto para conversar" icon={ClipboardCheck} />
            <OrbitalNode className="bottom-[9%] left-[30%]" title="profissional" text="decisão com vínculo" icon={Stethoscope} />
            <OrbitalNode className="bottom-[24%] right-[10%]" title="próximo passo" text="clareza sem pressa" icon={ShieldCheck} />
            <div className="absolute left-[13%] top-[14%] h-2 w-2 rounded-full bg-[#d9ff8f] shadow-[0_0_30px_8px_rgba(217,255,143,0.35)]" />
            <div className="absolute right-[22%] top-[58%] h-1.5 w-1.5 rounded-full bg-emerald-200 shadow-[0_0_24px_7px_rgba(167,255,219,0.34)]" />
            <svg className="absolute inset-x-[12%] bottom-[44%] h-16 w-3/4 text-[#d9ff8f]/70" viewBox="0 0 520 96" fill="none" aria-hidden="true">
              <path d="M4 58 C72 58 78 18 118 18 C161 18 160 76 205 76 C252 76 249 30 292 30 C337 30 342 62 380 62 C421 62 422 42 516 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="8 12" />
            </svg>
          </div>
          <div className="absolute left-0 top-4 max-w-[15rem] rounded-[1.6rem] border border-white/12 bg-white/[0.08] p-4 text-sm text-emerald-50/78 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d9ff8f]">Observatório</p>
            <p className="mt-2 font-semibold leading-5 text-white">A saúde não acontece em abas separadas.</p>
          </div>
          <div className="absolute bottom-2 right-0 max-w-[16rem] rounded-[1.6rem] border border-amber-100/14 bg-[#20170a]/50 p-4 text-sm text-amber-50/76 shadow-[0_20px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-100">Apoio seguro</p>
            <p className="mt-2 leading-5">IA para ampliar contexto. Cuidado humano para decidir caminhos.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function HeroProof({ label }: { label: string }) {
  return (
    <div className="rounded-full border border-white/12 bg-white/[0.06] px-4 py-3 backdrop-blur-xl">
      <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-[#d9ff8f] shadow-[0_0_18px_rgba(217,255,143,0.5)]" />
      {label}
    </div>
  );
}

function OrbitalNode({ className, title, text, icon: Icon }: { className: string; title: string; text: string; icon: LucideIcon }) {
  return (
    <div className={cn("absolute w-[9.4rem] rounded-[1.4rem] border border-white/12 bg-[#07120f]/70 p-3 text-left shadow-[0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl", className)}>
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-300/12 text-[#d9ff8f]"><Icon className="h-4 w-4" /></div>
      <p className="text-sm font-black text-white">{title}</p>
      <p className="mt-1 text-xs leading-4 text-emerald-50/58">{text}</p>
    </div>
  );
}

`;

source = replaceBetween(source, 'function HeroCockpit({ consentComplete, onStartTriage, onOpenDoctors }', 'function Metric(', hero + 'function Metric(');

const homePanel = `function HomePanel({ onStartTriage, onOpenDoctors }: { onStartTriage: () => void; onOpenDoctors: () => void }) {
  return (
    <div className="space-y-7 text-white">
      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-white/10 bg-white/[0.07] text-white shadow-[0_30px_110px_rgba(0,0,0,0.30)] backdrop-blur-2xl">
          <CardContent className="relative overflow-hidden p-6 sm:p-8">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-300/12 blur-[80px]" />
            <Badge className="mb-5 rounded-full border border-emerald-200/16 bg-emerald-300/10 px-3 py-1 text-emerald-100 hover:bg-emerald-300/10">A verdade humana</Badge>
            <h2 className="max-w-3xl font-serif text-5xl leading-[0.9] tracking-[-0.055em] text-white sm:text-6xl">A saúde não acontece em abas separadas.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/68">
              Ela aparece no exame guardado, na consulta rápida, na dor que volta, na rotina que muda, na pergunta que ficou para depois. O Doutor·Elo nasce para costurar esse contexto sem transformar cuidado em atendimento automático.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <StoryMetric value="01" label="clareza para a pessoa" />
              <StoryMetric value="02" label="contexto para o profissional" />
              <StoryMetric value="03" label="continuidade para o cuidado" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-white/10 bg-[#d9ff8f] text-[#07120f] shadow-[0_30px_110px_rgba(217,255,143,0.16)]">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#31523d]">Entre a dúvida e a decisão</p>
            <h3 className="mt-3 font-serif text-5xl leading-[0.88] tracking-[-0.055em]">existe um elo.</h3>
            <p className="mt-5 text-base leading-7 text-[#1f382b]/82">
              Uma camada de inteligência que organiza a conversa, preserva nuance e ajuda cada pessoa a chegar melhor preparada ao próximo passo de cuidado.
            </p>
            <div className="mt-7 space-y-3">
              {weeklyRituals.map((ritual) => <RitualStep key={ritual.title} ritual={ritual} />)}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[#0a1715]/82 p-5 shadow-[0_34px_130px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-8" data-v6-product-console="continuity-instrument">
        <div className="absolute inset-0 opacity-60 [background:linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:36px_36px]" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <Badge className="mb-5 rounded-full border border-amber-100/18 bg-amber-200/10 px-3 py-1 text-amber-100 hover:bg-amber-200/10">Acompanhamento claro</Badge>
            <h2 className="font-serif text-5xl leading-[0.9] tracking-[-0.055em] text-white sm:text-6xl">Um painel para perceber o que mudou.</h2>
            <p className="mt-5 text-base leading-8 text-emerald-50/66">
              Não é sobre colecionar dados. É sobre perceber relações: o que mudou, o que se repete, o que merece atenção e o que precisa ser levado para uma conversa clínica.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-[1.2rem] bg-[#d9ff8f] px-5 font-black text-[#07120f] hover:bg-[#ecffbd]" onClick={onStartTriage}>Começar pela conversa</Button>
              <Button variant="outline" className="h-12 rounded-[1.2rem] border-white/16 bg-white/8 px-5 text-white hover:bg-white/14 hover:text-white" onClick={onOpenDoctors}>Encontrar médicos</Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ConsoleTile icon={MessageCircleHeart} title="Conversa" text="A pessoa conta do próprio jeito, com privacidade e sem pressa." />
            <ConsoleTile icon={ClipboardCheck} title="Contexto" text="Rotina, exames e dúvidas viram uma síntese mais útil." />
            <ConsoleTile icon={Brain} title="IA com limite" text="Apoio para clarear caminhos, sem substituir avaliação profissional." />
            <ConsoleTile icon={HeartHandshake} title="Vínculo" text="O próximo passo considera rede médica, acompanhamento e continuidade." />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <ExperienceTile icon={Waves} title="Presença" text="Uma interface que respira, cria profundidade e evita o ruído típico de produto genérico." />
        <ExperienceTile icon={ShieldCheck} title="Responsabilidade" text="A experiência deixa claro o papel da IA e preserva a decisão clínica no lugar certo." />
        <ExperienceTile icon={Sparkles} title="Encantamento" text="Design sensorial, português brasileiro natural e uma narrativa que merece ser lembrada." />
      </section>

      <section className="rounded-[2.4rem] border border-white/10 bg-white/[0.07] p-6 text-center shadow-[0_30px_110px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-10">
        <p className="mx-auto max-w-4xl font-serif text-5xl leading-[0.9] tracking-[-0.055em] text-white sm:text-6xl">Se o cuidado precisa ser integrativo, a experiência também precisa ser.</p>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-emerald-50/66">Conheça uma forma mais inteligente, sensível e brasileira de aproximar tecnologia e saúde.</p>
      </section>
    </div>
  );
}

function StoryMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
      <p className="font-serif text-4xl text-[#d9ff8f]">{value}</p>
      <p className="mt-2 text-sm font-semibold leading-5 text-emerald-50/72">{label}</p>
    </div>
  );
}

function ConsoleTile({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.075] p-5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:border-[#d9ff8f]/35">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d9ff8f]/12 text-[#d9ff8f]"><Icon className="h-5 w-5" /></div>
      <p className="text-lg font-black">{title}</p>
      <p className="mt-2 text-sm leading-6 text-emerald-50/64">{text}</p>
    </div>
  );
}

function EditorialHeroVariant({ onStartTriage, onOpenDoctors }: { onStartTriage: () => void; onOpenDoctors: () => void }) {
  return null;
}

function RitualStep({ ritual }: { ritual: { day: string; title: string; status: string; icon: LucideIcon } }) {
  const Icon = ritual.icon;
  return (
    <div className="flex items-start gap-3 rounded-[1.35rem] bg-[#07120f]/10 p-3 ring-1 ring-[#07120f]/10">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#07120f]/12 text-[#07120f]"><Icon className="h-5 w-5" /></div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#31523d]/74">{ritual.day} · {ritual.status}</p>
        <p className="mt-1 text-sm font-black leading-5 text-[#07120f]">{ritual.title}</p>
      </div>
    </div>
  );
}

`;

source = replaceBetween(source, 'function HomePanel({ onStartTriage, onOpenDoctors }', 'function TriagePanel(', homePanel + 'function TriagePanel(');

fs.writeFileSync(path, source);
