import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { fadeUp } from "@/lib/motion";

type PageHeroProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  children?: React.ReactNode;
};

/** Shared inner-page header, using the same atmosphere as the homepage hero. */
const PageHero = ({ eyebrow, title, description, children }: PageHeroProps) => (
  <motion.section
    className="relative overflow-hidden bg-white pb-10 pt-20 md:pt-24"
    initial="hidden"
    animate="visible"
  >
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-[-8%] top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12),transparent_70%)]" />
      <div className="absolute right-[-6%] top-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.10),transparent_70%)]" />
    </div>

    <div className="container relative">
      <motion.div variants={fadeUp} className="max-w-3xl">
        <Badge
          variant="outline"
          className="rounded-full border-slate-200 bg-white px-4 py-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500"
        >
          {eyebrow}
        </Badge>
        <h1 className="mt-6 text-4xl font-bold leading-[1] tracking-[-0.04em] text-[#111827] md:text-5xl xl:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
      </motion.div>

      {children && (
        <motion.div variants={fadeUp} custom={0.1} className="mt-8">
          {children}
        </motion.div>
      )}
    </div>
  </motion.section>
);

export default PageHero;
