import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const placeholder = (name) => ({
  url: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80&sig=${encodeURIComponent(name)}`,
  publicId: ""
});

const seed = async () => {
  await connectDB();
  await Promise.all([
    Order.deleteMany(),
    Product.deleteMany(),
    Review.deleteMany(),
    Message.deleteMany(),
    Notification.deleteMany(),
    User.deleteMany()
  ]);

  const [admin, buyerA, buyerB, artisanA, artisanB] = await User.create([
    {
      name: "Asha Admin",
      email: "admin@artisan.test",
      password: "password123",
      role: "admin"
    },
    {
      name: "Mira Buyer",
      email: "mira.buyer@artisan.test",
      password: "password123",
      role: "buyer",
      address: {
        line1: "12 Lotus Lane",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560001",
        country: "India",
        phone: "9999999999"
      }
    },
    {
      name: "Rohan Buyer",
      email: "rohan.buyer@artisan.test",
      password: "password123",
      role: "buyer",
      address: {
        line1: "44 Craft Street",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
        phone: "8888888888"
      }
    },
    {
      name: "Kabir Pottery Studio",
      email: "kabir@artisan.test",
      password: "password123",
      role: "artisan",
      shop: {
        name: "Kabir Pottery Studio",
        bio: "Wheel-thrown terracotta and glazed ceramics made in Jaipur.",
        location: "Jaipur, Rajasthan",
        profilePhoto: placeholder("kabir")
      }
    },
    {
      name: "Nila Looms",
      email: "nila@artisan.test",
      password: "password123",
      role: "artisan",
      shop: {
        name: "Nila Looms",
        bio: "Handwoven scarves and home textiles dyed with natural pigments.",
        location: "Kutch, Gujarat",
        profilePhoto: placeholder("nila")
      }
    }
  ]);

  await Product.create([
    {
      title: "Blue Glazed Serving Bowl",
      description: "Hand-thrown ceramic bowl with cobalt glaze and food-safe finish.",
      price: 1850,
      category: "Pottery",
      stock: 18,
      region: "Rajasthan",
      materials: ["ceramic", "cobalt glaze"],
      artisanId: artisanA._id,
      isApproved: true,
      approvalStatus: "approved",
      images: [placeholder("bowl")],
      ratings: { average: 4.8, count: 12 }
    },
    {
      title: "Terracotta Tea Light Set",
      description: "Set of four carved tea light holders with warm natural finish.",
      price: 780,
      category: "Home Decor",
      stock: 40,
      region: "Rajasthan",
      materials: ["terracotta"],
      artisanId: artisanA._id,
      isApproved: true,
      approvalStatus: "approved",
      images: [placeholder("tealight")],
      ratings: { average: 4.5, count: 7 }
    },
    {
      title: "Block Printed Cotton Table Runner",
      description: "Natural cotton table runner printed by hand with carved wooden blocks.",
      price: 1290,
      category: "Textiles",
      stock: 24,
      region: "Gujarat",
      materials: ["cotton", "natural dye"],
      artisanId: artisanB._id,
      isApproved: true,
      approvalStatus: "approved",
      images: [placeholder("runner")],
      ratings: { average: 4.6, count: 9 }
    },
    {
      title: "Indigo Handwoven Cotton Scarf",
      description: "Soft handwoven scarf dyed with natural indigo and finished with tassels.",
      price: 1650,
      category: "Textiles",
      stock: 16,
      region: "Gujarat",
      materials: ["cotton", "natural indigo dye"],
      artisanId: artisanB._id,
      isApproved: true,
      approvalStatus: "approved",
      images: [placeholder("indigo-scarf")],
      ratings: { average: 4.7, count: 11 }
    }
  ]);

  console.log("Seed complete.");
  console.log("Admin: admin@artisan.test / password123");
  console.log("Buyers: mira.buyer@artisan.test, rohan.buyer@artisan.test / password123");
  console.log("Artisans: kabir@artisan.test, nila@artisan.test / password123");
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
