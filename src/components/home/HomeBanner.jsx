'use client'

import Image from 'next/image'
import Link from 'next/link'

export function HomeBanner() {
  // TODO: Replace src with actual banner image URL
  // TODO: Replace href with actual link destination
  const bannerSrc = '/banner-placeholder.svg'
  const bannerHref = '/trade'

  return (
    <section className="w-full">
      <Link href={bannerHref} className="block relative w-full aspect-[4/1] sm:aspect-[5/1] md:aspect-[6/1]">
        <Image
          src={bannerSrc}
          alt="Promotional Banner"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </Link>
    </section>
  )
}
