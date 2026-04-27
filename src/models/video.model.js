import mongoose, {Schema} from "mongoose";
import mongooseAggreagatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema= new Schema(
    {
         videofile:{
            type: String,
            required:true
         },
         thembnail:{
            type: String,
            required:true
         },
         title:{
            type: String,
            required:true
         },
          description:{
            type: String,
            required:true
         },
         duration:{
            type:Number,
            required:true
         },
         views:{
            type:Number,
           defoult:0
         },
         isPublished:{
            type:Boolean,
            defoult:true
         },

         owner:{
            type:Schema.Types.ObjectId,
            ref:'User'
         }

    }, {timestamps: true})

    videoSchema.plugin(mongooseAggreagatePaginate)

    

    export const Video= mongoose.model('Video', videoSchema)

