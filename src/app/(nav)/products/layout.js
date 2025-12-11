export const metadata = {
  title: 'Products',
  description: 'Browse our wide selection of premium electronics at DepxTech. Find smartphones, laptops, headphones, gaming gear, smart home devices and more. Search and filter products to find exactly what you need.',
  keywords: [
    'electronics',
    'products',
    'smartphones',
    'laptops',
    'headphones',
    'gaming',
    'smart home',
    'accessories',
    'depxtech',
    'buy electronics',
    'online store',
  ],
  openGraph: {
    title: 'Products | DepxTech',
    description: 'Browse our wide selection of premium electronics at DepxTech.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function ProductsLayout({ children }) {
  return children
}
