import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; 
export const registerUser = async(req , res)=>{
    try{
        const {name , email , password} = req.body;
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message:"User already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt);
        const user = await User.create({
            name,
            email,
            password:hashedPassword
        });
        res.status(201).json({message:"User registered successfully",
             UserId: user._id

        });
    } catch (error) {
        res.status(500).json({message:error.message});

    }
}
export const loginUser = async(req , res)=>{
    try{
        const {email , password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});
        res.status(200).json({message:"Login successful", token, UserId: user._id});
    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.userId
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({
      message:"Server error", error: error.message
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId, // From your protect middleware
      { $set: req.body }, // Updates only the fields sent in the form
      { new: true } // Returns the updated document
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};
