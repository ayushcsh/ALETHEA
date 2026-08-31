import Link from 'next/link'
import Image from 'next/image'
import styles from './Hero.module.css'

const Mainpageanimation = () => {
  return (
    <div className={`${styles.hero} relative flex w-full items-start justify-center overflow-hidden bg-black`}>
      <Image src="/images/hero-cloud-original.png" alt="Red-lit clouds over a mountain valley" fill priority sizes="100vw" className={styles.background} />
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.valleyGlow} aria-hidden="true" />

      <div className={`${styles.copy} relative z-10 flex w-full max-w-6xl flex-col items-center text-center text-white`}>
        <div className={styles.eyebrow}>Alethea AI · Learn without limits</div>
        <h1 className={`${styles.title} font-bebas font-bold`}>
          Take your PDFs <span className={styles.titleAccent}>anywhere.</span>
        </h1>
        <p className={styles.subtitle}>
          Summarize, annotate, and ask anything—without breaking your focus.
        </p>
        <Link href="/login" className={styles.getStarted}>Get started <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  )
}

export default Mainpageanimation
