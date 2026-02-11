'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import {
  Leaf,
  Recycle,
  Droplets,
  Wind,
  Zap,
  TreePine,
  Globe2,
  Factory,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
}

export default function SustainabilityPage() {
  const t = useTranslations('sustainability')

  const impactStats = [
    { Icon: Recycle, value: t('stat1Value'), label: t('stat1Label'), description: t('stat1Desc') },
    { Icon: Wind, value: t('stat2Value'), label: t('stat2Label'), description: t('stat2Desc') },
    { Icon: Droplets, value: t('stat3Value'), label: t('stat3Label'), description: t('stat3Desc') },
    { Icon: TreePine, value: t('stat4Value'), label: t('stat4Label'), description: t('stat4Desc') },
  ]

  const deviceImpact = [
    { device: t('smartphone'), co2: '70 kg', water: '13,000 L', minerals: '60+ kg' },
    { device: t('laptop'), co2: '300 kg', water: '50,000 L', minerals: '190+ kg' },
    { device: t('tablet'), co2: '100 kg', water: '20,000 L', minerals: '80+ kg' },
  ]

  const principles = [
    { Icon: Recycle, title: t('principle1Title'), description: t('principle1Desc') },
    { Icon: Factory, title: t('principle2Title'), description: t('principle2Desc') },
    { Icon: Zap, title: t('principle3Title'), description: t('principle3Desc') },
    { Icon: Globe2, title: t('principle4Title'), description: t('principle4Desc') },
  ]

  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-emerald-50 dark:bg-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold mb-6">
              <Leaf className="size-4" />
              {t('badge')}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground leading-tight">
              {t('heading')}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              {t('subheading')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('impactHeading')}
            </h2>
            <p className="text-muted-foreground">
              {t('impactSubheading')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {impactStats.map((stat) => (
              <motion.div
                key={stat.label}
                className="bg-card rounded-2xl p-4 sm:p-6 border border-border text-center"
                variants={staggerItem}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="size-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.Icon className="size-7 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-2">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-16 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                {t('problemHeading')}
              </h2>
              <p className="text-background/70 text-lg mb-6">
                {t('problemDesc')}
              </p>
              <motion.ul
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[t('problemStat1'), t('problemStat2'), t('problemStat3')].map((text, i) => (
                  <motion.li key={i} className="flex items-start gap-3" variants={staggerItem}>
                    <CheckCircle2 className="size-5 text-emerald-400 flex-shrink-0 mt-1" />
                    <span className="text-background/70">{text}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            <motion.div
              className="bg-background/10 rounded-2xl p-6"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-bold mb-4">{t('manufacturingImpact')}</h3>
              <div className="space-y-4">
                {deviceImpact.map((item) => (
                  <div key={item.device} className="bg-background/10 rounded-xl p-4">
                    <p className="font-bold mb-2">{item.device}</p>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                      <div>
                        <p className="text-background/50">CO2</p>
                        <p className="text-emerald-400 font-medium">{item.co2}</p>
                      </div>
                      <div>
                        <p className="text-background/50">Water</p>
                        <p className="text-emerald-400 font-medium">{item.water}</p>
                      </div>
                      <div>
                        <p className="text-background/50">Minerals</p>
                        <p className="text-emerald-400 font-medium">{item.minerals}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Our Principles */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('principlesHeading')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('principlesSubheading')}
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {principles.map((principle) => (
              <motion.div
                key={principle.title}
                className="flex gap-3 sm:gap-4 p-4 sm:p-6 bg-card rounded-2xl border border-border"
                variants={staggerItem}
                whileHover={{ y: -2 }}
              >
                <div className="flex-shrink-0">
                  <div className="size-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                    <principle.Icon className="size-6 text-emerald-500" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('certificationsHeading')}
            </h2>
            <p className="text-muted-foreground">
              {t('certificationsSubheading')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-3 gap-3 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { code: t('cert1Code'), name: t('cert1Name'), desc: t('cert1Desc') },
              { code: t('cert2Code'), name: t('cert2Name'), desc: t('cert2Desc') },
              { code: t('cert3Code'), name: t('cert3Name'), desc: t('cert3Desc') },
            ].map((cert) => (
              <motion.div
                key={cert.code}
                className="text-center p-3 sm:p-6 bg-muted/50 rounded-2xl"
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
              >
                <div className="text-4xl font-bold text-primary mb-2">{cert.code}</div>
                <p className="text-sm font-medium text-foreground mb-1">{cert.name}</p>
                <p className="text-xs text-muted-foreground">{cert.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-emerald-600 rounded-3xl p-6 sm:p-8 lg:p-12 text-center"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Leaf className="size-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {t('ctaHeading')}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              {t('ctaSubheading')}
            </p>
            <Link
              href="/trade"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 font-bold py-4 px-8 rounded-xl hover:bg-white/90 transition-colors"
            >
              {t('ctaButton')} <ArrowRight className="size-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
