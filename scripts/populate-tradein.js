import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE are required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const products = [
  // iPhone Models
  {
    title: "iPhone 16 Pro Max",
    des: "Latest iPhone with advanced A18 Pro chip, titanium design, and professional camera system",
    category: "Smartphones",
    brand: "Apple",
    series: "iPhone",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
    imgs: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-max-natural-titanium-pdp-image-position-1__USEN.jpg"],
    new_price: 800,
    good_price: 650,
    okay_price: 500,
    bad_price: 300,
    broken_price: 150,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "iPhone 16 Pro",
    des: "Premium iPhone with A18 Pro chip and advanced camera capabilities",
    category: "Smartphones",
    brand: "Apple",
    series: "iPhone",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
    imgs: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pro-natural-titanium-pdp-image-position-1__USEN.jpg"],
    new_price: 720,
    good_price: 580,
    okay_price: 450,
    bad_price: 270,
    broken_price: 130,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "iPhone 16",
    des: "Standard iPhone with A18 chip and excellent performance",
    category: "Smartphones",
    brand: "Apple",
    series: "iPhone",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
    imgs: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-16-pink-pdp-image-position-1__USEN.jpg"],
    new_price: 550,
    good_price: 450,
    okay_price: 350,
    bad_price: 200,
    broken_price: 100,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "iPhone 15 Pro Max",
    des: "Previous generation Pro Max with A17 Pro chip and titanium build",
    category: "Smartphones",
    brand: "Apple",
    series: "iPhone",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
    imgs: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-natural-titanium-pdp-image-position-1__USEN.jpg"],
    new_price: 650,
    good_price: 520,
    okay_price: 400,
    bad_price: 250,
    broken_price: 120,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "iPhone 14 Pro Max",
    des: "iPhone with A16 Bionic chip and Dynamic Island",
    category: "Smartphones",
    brand: "Apple",
    series: "iPhone",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
    imgs: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-max-deep-purple-pdp-image-position-1__USEN.jpg"],
    new_price: 500,
    good_price: 400,
    okay_price: 300,
    bad_price: 180,
    broken_price: 90,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "iPhone 13 Pro Max",
    des: "iPhone with A15 Bionic chip and ProRAW photography",
    category: "Smartphones",
    brand: "Apple",
    series: "iPhone",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
    imgs: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-pro-max-graphite-pdp-image-position-1a__USEN.jpg"],
    new_price: 400,
    good_price: 320,
    okay_price: 240,
    bad_price: 140,
    broken_price: 70,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "iPhone 12 Pro Max",
    des: "iPhone with A14 Bionic chip and LiDAR scanner",
    category: "Smartphones",
    brand: "Apple",
    series: "iPhone",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Apple-Logo.png",
    imgs: ["https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-12-pro-max-pacific-blue-pdp-image-position-1a__USEN.jpg"],
    new_price: 300,
    good_price: 240,
    okay_price: 180,
    bad_price: 100,
    broken_price: 50,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },

  // Google Pixel Models
  {
    title: "Google Pixel 9 Pro",
    des: "Latest Google Pixel with advanced AI features and Tensor G4 chip",
    category: "Smartphones",
    brand: "Google",
    series: "Pixel",
    brand_img: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    imgs: ["https://lh3.googleusercontent.com/ZrNeuKw7HbqpQELfWNlS6bpZqmXQSFdBnl4WrxJzJBo8vz6JQgD_6JX-FLy5O2wXZCw"],
    new_price: 600,
    good_price: 480,
    okay_price: 360,
    bad_price: 220,
    broken_price: 110,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "Google Pixel 8 Pro",
    des: "Google Pixel with Tensor G3 and advanced computational photography",
    category: "Smartphones",
    brand: "Google",
    series: "Pixel",
    brand_img: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    imgs: ["https://lh3.googleusercontent.com/ZrNeuKw7HbqpQELfWNlS6bpZqmXQSFdBnl4WrxJzJBo8vz6JQgD_6JX-FLy5O2wXZCw"],
    new_price: 450,
    good_price: 360,
    okay_price: 270,
    bad_price: 160,
    broken_price: 80,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "Google Pixel 7 Pro",
    des: "Google Pixel with Tensor G2 and excellent camera performance",
    category: "Smartphones",
    brand: "Google",
    series: "Pixel",
    brand_img: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    imgs: ["https://lh3.googleusercontent.com/ZrNeuKw7HbqpQELfWNlS6bpZqmXQSFdBnl4WrxJzJBo8vz6JQgD_6JX-FLy5O2wXZCw"],
    new_price: 350,
    good_price: 280,
    okay_price: 210,
    bad_price: 120,
    broken_price: 60,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },

  // Samsung Models
  {
    title: "Samsung Galaxy S24 Ultra",
    des: "Premium Samsung flagship with S Pen and advanced camera system",
    category: "Smartphones",
    brand: "Samsung",
    series: "Galaxy S",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo.png",
    imgs: ["https://images.samsung.com/is/image/samsung/p6pim/us/2401/gallery/us-galaxy-s24-ultra-s928-sm-s928bzkeuss-thumb-539573145"],
    new_price: 700,
    good_price: 560,
    okay_price: 420,
    bad_price: 250,
    broken_price: 125,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "Samsung Galaxy S23 Ultra",
    des: "Samsung flagship with 200MP camera and S Pen functionality",
    category: "Smartphones",
    brand: "Samsung",
    series: "Galaxy S",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo.png",
    imgs: ["https://images.samsung.com/is/image/samsung/p6pim/us/2302/gallery/us-galaxy-s23-ultra-s918-sm-s918bzkaxaa-thumb-534490692"],
    new_price: 550,
    good_price: 440,
    okay_price: 330,
    bad_price: 200,
    broken_price: 100,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  },
  {
    title: "Samsung Galaxy S22 Ultra",
    des: "Samsung Note-style flagship with integrated S Pen",
    category: "Smartphones",
    brand: "Samsung",
    series: "Galaxy S",
    brand_img: "https://logos-world.net/wp-content/uploads/2020/04/Samsung-Logo.png",
    imgs: ["https://images.samsung.com/is/image/samsung/p6pim/us/2202/gallery/us-galaxy-s22-ultra-s908-sm-s908bdraxaa-thumb-531425058"],
    new_price: 400,
    good_price: 320,
    okay_price: 240,
    bad_price: 140,
    broken_price: 70,
    new_def: "Perfect condition, no scratches, original packaging, all accessories included",
    good_def: "Minor cosmetic wear, fully functional, no screen damage",
    okay_def: "Noticeable wear, fully functional, may have minor screen scratches",
    bad_def: "Heavy wear, functional but may have screen cracks or hardware issues",
    broken_def: "Not functional, significant damage, parts only"
  }
]

async function populateDatabase() {
  console.log('Starting to populate database with tradable products...')
  
  for (const product of products) {
    try {
      const { data, error } = await supabase
        .from('tradable_products')
        .insert(product)
        .select()
        .single()

      if (error) {
        console.error(`Error inserting ${product.title}:`, error)
      } else {
        console.log(`✓ Successfully added: ${product.title}`)
      }
    } catch (err) {
      console.error(`Exception inserting ${product.title}:`, err)
    }
  }
  
  console.log('Database population completed!')
}

populateDatabase()