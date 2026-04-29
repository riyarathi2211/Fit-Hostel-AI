import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true
        },
        email:{
            type:String,
            required: true,
            unique: true        

        },
        password:{
            type:String,
            required: true 
        },
        age: { type: Number },
        gender: { type: String },
        weight: { type: Number },
        height: { type: Number },
        goal: { type: String },
        bmi: { type: Number },
    },
    {
        timestamps:true
    }
);
const User = mongoose.model("User",userSchema);
export default User;