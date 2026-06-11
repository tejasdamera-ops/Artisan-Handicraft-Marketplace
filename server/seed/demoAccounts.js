import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const password = "password123";

const placeholder = (name) => ({
  url: `https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80&sig=${encodeURIComponent(name)}`,
  publicId: ""
});

const upsertUser = async (email, data) => {
  let user = await User.findOne({ email }).select("+password");

  if (!user) {
    return User.create({ ...data, email, password });
  }

  user.name = data.name;
  user.role = data.role;
  user.address = data.address;
  user.shop = data.shop;
  user.password = password;
  await user.save();
  return user;
};

const upsertProduct = async (title, data) => {
  await Product.findOneAndUpdate({ title }, { ...data, title }, { upsert: true, new: true, runValidators: true });
};

const createDemoAccounts = async () => {
  await connectDB();

  const admin = await upsertUser("admin@artisan.test", {
    name: "Asha Admin",
    role: "admin"
  });

  await upsertUser("mira.buyer@artisan.test", {
    name: "Mira Buyer",
    role: "buyer",
    address: {
      line1: "12 Lotus Lane",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560001",
      country: "India",
      phone: "9999999999"
    }
  });

  await upsertUser("rohan.buyer@artisan.test", {
    name: "Rohan Buyer",
    role: "buyer",
    address: {
      line1: "44 Craft Street",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India",
      phone: "8888888888"
    }
  });

  const artisanA = await upsertUser("kabir@artisan.test", {
    name: "Kabir Pottery Studio",
    role: "artisan",
    shop: {
      name: "Kabir Pottery Studio",
      bio: "Wheel-thrown terracotta and glazed ceramics made in Jaipur.",
      location: "Jaipur, Rajasthan",
      profilePhoto: placeholder("kabir")
    }
  });

  const artisanB = await upsertUser("nila@artisan.test", {
    name: "Nila Looms",
    role: "artisan",
    shop: {
      name: "Nila Looms",
      bio: "Handwoven scarves and home textiles dyed with natural pigments.",
      location: "Kutch, Gujarat",
      profilePhoto: placeholder("nila")
    }
  });

  await Promise.all([
    upsertProduct("Blue Glazed Serving Bowl", {
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
    }),
    upsertProduct("Terracotta Tea Light Set", {
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
    }),
    upsertProduct("Block Printed Cotton Table Runner", {
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
    }),
    upsertProduct("Indigo Handwoven Cotton Scarf", {
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
    })
  ]);

  console.log("Demo accounts are ready.");
  console.log(`Admin: ${admin.email} / ${password}`);
  console.log(`Artisans: kabir@artisan.test, nila@artisan.test / ${password}`);
  console.log(`Buyers: mira.buyer@artisan.test, rohan.buyer@artisan.test / ${password}`);

  await mongoose.disconnect();
};

createDemoAccounts().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
