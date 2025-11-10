import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.models.js";
import jwt from "jsonwebtoken";

const signup = async (req, res) => {
    
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 charactersssss" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.status(400).json({message:"Email already exists, Please use a different email"})
    }

    const idx = Math.floor(Math.random()*100)+1;
    const randomAvatar =`https://avatar.iran.liara.run/public/${idx}.png`

    const newUser = await User.create({
        email,
        fullName,
        password,
        profilePic: randomAvatar 
    })

    //TODO: create a user in the stream as well
    try {
      await upsertStreamUser({
      id:newUser._id.toString(),
      name:newUser.fullName,
      image:newUser.profilePic || "",
    });
    console.log(`Stream User created for ${newUser.fullName}`)
    } catch (error) {
      console.log("Error creating Stream user: ",error);
    }



    const token = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET_KEY, {expiresIn:'7d'})

    res.cookie("jwt",token,{
      maxAge:7*24*60*60*1000,
      httpOnly:true,
      sameSite:"strict",
      secure:process.env.NODE_ENV==="production"
    })

    res.status(201).json({success:true, user:newUser})


  } catch (error) {
    console.log("Error during user signup:", error);
    res.status(500).json({ message: "Internal Server error" });
  }
};

const login = async (req, res) => {
  try {
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({message:"All fields are required"})
    }

    const user = await User.findOne({email})
    if(!user){
      return res.status(400).json({message:"Invalid email or password"})
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if(!isPasswordCorrect){
      return res.status(400).json({message:"Invalid email or password"})
    }

    const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'7d'})

    res.cookie("jwt",token,{
      maxAge:7*24*60*60*1000,
      httpOnly:true,
      sameSite:"strict",
      secure:process.env.NODE_ENV==="production"
    })

    return res.status(200).json({success:true,user})

  } catch (error) {
    console.log("Error during user login:", error);
    res.status(500).json({ message: "Internal Server error" });
    
  }
};

const logout = async (req, res) => {
  res.clearCookie("jwt")
  res.status(200).json({message:"Logged out successfully"})
};

const onboard =async(req,res)=>{
  try {
    const userId = req.user._id;
    const {fullName,bio,nativeLanguage, learningLanguage,location}=req.body;
    if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location){
      return res.status(400).json({
        message:"All fields are required",
        missingFields:[
          !fullName && "fullName",
          !bio && "bio",
          !nativeLanguage && "nativeLanguage",
          !learningLanguage && "learningLanguage",
          !location && "location",
        ].filter(Boolean),
      })
    }
    const updatedUser = await User.findByIdAndUpdate(userId,{
      ...req.body,
      isOnboarded:true,
    },{new:true})

    if(!updatedUser){
      return res.status(404).json({message:"User not found"})
    }

    //TODO: update the user info in stream as well
    try {
      await upsertStreamUser({
        id:updatedUser._id.toString(),
        name:updatedUser.fullName,
        image:updatedUser.profilePic || "",
      })
      console.log(`Stream user updated after onboarding: ${updatedUser.fullName}`);
      
    } catch (error) {
      console.error("Error updating Stream user:",error);
      
    }

    return res.status(200).json({success:true,user:updatedUser})
    
  } catch (error) {
    console.error("Error during onboarding:",error);
    return res.status(500).json({message:"Internal Server Error"});
    
  }
}

export { signup, login, logout,onboard };
