
import { Shop } from "../models/shop.model.js";
import { ApiError } from "../utils/apiError.js";
import { asynHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnClodinary } from "../utils/cloudinary.js";

const createShop = asynHandler(async (req, res) => {

   const {
      shopName,
      description,
      phone,
      email,
      address
   } = req.body || {};

   if (!shopName) {
      throw new ApiError(
         400,
         "Shop name is required"
      );
   }

   const existingShop =
      await Shop.findOne({
         owner: req.user._id,
      });

   if (existingShop) {
      throw new ApiError(
         400,
         "You already have a shop"
      );
   }

   // FILES

   const shopLogoLocalPath =
      req.files?.shopLogo?.[0]?.path;

   const shopBannerLocalPath =
      req.files?.shopBanner?.[0]?.path;

   let shopLogoUrl = "";
   let shopBannerUrl = "";

   if (shopLogoLocalPath) {

      const shopLogo =
         await uploadOnClodinary(
            shopLogoLocalPath
         );

      shopLogoUrl =
         shopLogo?.url || "";
   }

   if (shopBannerLocalPath) {

      const shopBanner =
         await uploadOnClodinary(
            shopBannerLocalPath
         );

      shopBannerUrl =
         shopBanner?.url || "";
   }

   const shop = await Shop.create({

      shopName,
      description,
      phone,
      email,
      address,

      shopLogo: shopLogoUrl,
      shopBanner: shopBannerUrl,

      owner: req.user._id,

      status: "pending",
   });

   return res.status(201).
   json({
      success: true,
      message:
         "Shop created successfully. Waiting for approval.",
      shop,
   });
});

const approveShop = async (req, res) => {

   const shop =
      await Shop.findById(
         req.params.id
      );

   if (!shop) {
      return res.status(404).json({
         success: false,
         message: "Shop not found"
      });
   }

   shop.status = "approved";

   await shop.save();

   await User.findByIdAndUpdate(
      shop.owner,
      {
         role: "shopkeeper"
      }
   );

   res.status(200).json({
      success: true,
      message: "Shop approved"
   });
};

const getPendingShops = async (req, res) => {

   const shops =
      await Shop.find({
         status: "pending"
      })
         .populate(
            "owner",
            "fullname email avatar"
         );

   res.status(200).json({
      success: true,
      shops
   });
};

const rejectShop = async (req, res) => {

   const shop =
      await Shop.findById(
         req.params.id
      );

   if (!shop) {

      return res.status(404).json({
         success: false,
         message: "Shop not found"
      });
   }

   await Shop.findByIdAndDelete(
      req.params.id
   );

   res.status(200).json({
      success: true,
      message:
         "Shop request rejected"
   });
};

const getAllShops = asynHandler(async (req, res) => {

const shops = await Shop.find({
   status: "approved",
   isActive: true
})
.populate("owner", "fullname avatar role");

   return res.status(200).json({
      success: true,
      shops
   });

});

const getSingleShop = asynHandler(async (req, res) => {

   
const { id } = req.params;

const shop = await Shop.findOne({
   _id: req.params.id,
   status: "approved",
   isActive: true
})
.populate("owner", "fullname avatar email role");

   if (!shop) {
      throw new ApiError(
         404,
         "Shop not found"
      );
   }


   return res.status(200).json({
      success: true,
      shop
   });

});

export {
   createShop,
   approveShop,
   getPendingShops,
   rejectShop,
   getAllShops,
   getSingleShop
};

