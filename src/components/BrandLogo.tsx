import logo from '../logo/Designer.png'

type Props = {
  /** Tailwind size classes, e.g. "w-36 h-36". The logo is square. */
  className?: string
}

/** The Frosted Corner logo (storefront, name, and "Sweet Moments Together" tagline). */
export default function BrandLogo({ className = 'w-40 h-40' }: Props) {
  return (
    <img
      src={logo}
      alt="Frosted Corner – Sweet Moments Together"
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  )
}
