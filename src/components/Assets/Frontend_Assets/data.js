// Product images are now served from public folder
const PUBLIC_URL = process.env.PUBLIC_URL || "";

let data_product = [
  {
    id: 1,
    name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
    image: `${PUBLIC_URL}/product_1.png`,
    new_price: 50.0,
    old_price: 80.5,
  },
  {
    id: 2,
    name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
    image: `${PUBLIC_URL}/product_2.png`,
    new_price: 85.0,
    old_price: 120.5,
  },
  {
    id: 3,
    name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
    image: `${PUBLIC_URL}/product_3.png`,
    new_price: 60.0,
    old_price: 100.5,
  },
  {
    id: 4,
    name: "Striped Flutter Sleeve Overlap Collar Peplum Hem Blouse",
    image: `${PUBLIC_URL}/product_4.png`,
    new_price: 100.0,
    old_price: 150.0,
  },
];

export default data_product;
