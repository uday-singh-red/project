
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"

const userSchema = new Schema  (
    {

        username:{
            type: String,
            required: true,
            lowercase:true,
            index:true,
            trim:true,
            unique:true
        },

         email:{
            type: String,
            required: true,
            lowercase:true,
            trim:true,
        },
        
         fullname:{
            type: String,
            required: true,
            trim:true,
        },

        avatar:{
            type:String,
            required: true
        },

        coverimage:{
            type:String
        },

        watchhistory: [
            {
                type: Schema.Types.ObjectId,
                ref:"video"
            }
        ],

        password:{
            type:String,
            required:[true,'posword is mendatory']
        },

        referstoken:{
            type:String
        },

        
    
    },

    {
            timestamps:true
        }
)

        userSchema.pre("save", async function (next) {
            if (!this.isModified("password")) return next();

            this.password = await bcrypt.hash(this.password, 10);
            next();
        });
     
        userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
     };

     userSchema.methods.generateAccessToken= function(){
       return jwt.sign(
            
            {
            _id : this._id,
            _email: this.email,
            _username: this.username,
            _fullname: this.fullname
           },

           process.env.ACCESS_TOKEN_SECRET,
           {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
           }

        );
     }

     userSchema.methods.generateRefreshToken= function(){
        return jwt.sign(
            
            {
            _id : this._id,
            
           },

           process.env.REFRESH_TOKEN_SECRET,
           {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
           }

        );
     }

export const User= mongoose.model('User', userSchema)