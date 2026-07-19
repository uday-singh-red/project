import { Product } from "../models/product.model.js"

import { ApiError } from "../utils/ApiError.js"

import { asynHandler } from "../utils/asyncHandler.js"
import { uploadOnClodinary } from "../utils/cloudinary.js";
import { Shop } from "../models/shop.model.js";
import { User } from "../models/user.model.js";



const createProduct = asynHandler(async (req, res) => {

   console.log("product")

   const {
      name,
      description,
      category,
      price,
      discountedPrice,
      stock,

      isVeg,
      isVegan,
      isSpicy,
      isFeatured,
      isBestSeller,
      ingredients,
      allergens,
      

      preparationTime,

      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium
   } = req.body;

   console.log("hello")

   if (!name || !price) {

      throw new ApiError(
         400,
         "Name and price are required"
      );
   }

   // USER KI SHOP NIKALO

   let shopId;

   // Shopkeeper
   if(req.user.role === "shopkeeper"){

      const shop = await Shop.findOne({
         owner: req.user._id,
         status: "approved"
      });

      if(!shop){
         throw new ApiError(
            400,
            "Approved shop not found"
         );
      }

      shopId = shop._id;
   }

   // Admin
 else if(req.user.role === "admin"){

   const adminShop =
   await Shop.findOne({
      owner:req.user._id
   });

   if(!adminShop){
      throw new ApiError(
         400,
         "Admin shop not found"
      );
   }

   shopId = adminShop._id;
}

   // IMAGE

   const imageLocalPath =
      req.file?.path;

   if (!imageLocalPath) {

      throw new ApiError(
         400,
         "Product image required"
      );
   }

   console.log("image")

   const uploadedImage =
      await uploadOnClodinary(
         imageLocalPath
      );

   if (!uploadedImage) {

      throw new ApiError(
         500,
         "Image upload failed"
      );
   }

   // CREATE PRODUCT

      const productData = {

      name,
      description,
      category,
      price,
      discountedPrice,
      stock,

      images: [
         {
            url: uploadedImage.url
         }
      ],

      isVeg,
      isVegan,
      isSpicy,
      isFeatured,
      isBestSeller,

      ingredients:ingredients?
      ingredients.split(",").
      map(item=> item.trim())
      : [],
    

      allergens:allergens?
      allergens.split(",").
      map(item=> item.trim())
      : [],
    

      preparationTime,

      nutrition:{
         calories,
         protein,
         carbs,
         fat
      }
   };

     if(shopId){
      productData.shop = shopId;
   }

   const product =
   await Product.create(productData);

   console.log("create")

   return res.status(201).json({

      success: true,

      message:
      "Product created successfully",

      product

   });

});

const getAllProducts = asyncHandler(async (req, res) => {
   // 1. Query se page aur limit nikalein (aur default values set karein)
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 10;
   
   // Kitne products skip karne hain uski calculation
   const skip = (page - 1) * limit;

   const { shopId } = req.query;
   let filter = {};

   if (shopId) {
      filter.shop = shopId;
   } else {
      const admin = await User.findOne({ role: "admin" });
      if (!admin) {
         throw new ApiError(404, "Admin not found");
      }

      const adminShop = await Shop.findOne({ owner: admin._id });
      if (!adminShop) {
         throw new ApiError(404, "Admin shop not found");
      }

      filter.shop = adminShop._id;
   }

   // 2. Database query mein .skip() aur .limit() add karein
   const products = await Product.find(filter)
      .skip(skip)
      .limit(limit);

   return res.status(200).json({
      success: true,
      page, // Frontend ki checking ke liye page bhi bhej rahe hain
      products
   });
});


const getSingleProduct =asynHandler(async(req,res)=>{

   const product =await Product.findById(req.params.id)

  

   if(!product){

      throw new ApiError(
         404,
         "Product not found"
      )
   }


   return res.status(200)
   .json({
      success:true,
      product
   })
})

const updateProduct = async (req, res) => {

   try {

      const { id } = req.params;

      const product =
      await Product.findById(id);

      if (!product) {

         return res.status(404).json({
            success: false,
            message: "Product not found"
         });
      }

      const {
         name,
         description,
         category,
         price,
         discountedPrice,
         stock,

         isVeg,
         isVegan,
         isSpicy,
         isFeatured,
         isBestSeller,

         ingredients,
         allergens,

         preparationTime,

         calories,
         protein,
         carbs,
         fat
      } = req.body;

      // IMAGE UPDATE

      if(req.file){

         const uploadedImage =
         await uploadOnClodinary(
            req.file.path
         );

         if(uploadedImage){

            product.images = [
               {
                  url: uploadedImage.url,
                  publicId:
                  uploadedImage.public_id
               }
            ];
         }
      }

      product.name =
      name || product.name;

      product.description =
      description || product.description;

      product.category =
      category || product.category;

      product.price =
      price || product.price;

      product.discountedPrice =
      discountedPrice || product.discountedPrice;

      product.stock =
      stock || product.stock;

      product.isVeg =
      isVeg === "true";

      product.isVegan =
      isVegan === "true";

      product.isSpicy =
      isSpicy === "true";

      product.isFeatured =
      isFeatured === "true";

      product.isBestSeller =
      isBestSeller === "true";

      product.preparationTime =
      preparationTime || null;

      product.ingredients =
      ingredients
      ? ingredients
         .split(",")
         .map(item => item.trim())
         .filter(Boolean)
      : [];

      product.allergens =
      allergens
      ? allergens
         .split(",")
         .map(item => item.trim())
         .filter(Boolean)
      : [];

      product.nutrition = {

         calories:
         calories || null,

         protein:
         protein || null,

         carbs:
         carbs || null,

         fat:
         fat || null
      };

      await product.save();

      return res.status(200).json({

         success: true,

         message:
         "Product updated successfully",

         product
      });

   }

   catch(error){

      console.log(error);

      return res.status(500).json({

         success:false,

         message:
         "Server error"
      });
   }
};



export { createProduct , getAllProducts ,getSingleProduct,  updateProduct}