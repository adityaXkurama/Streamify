import FriendRequest from "../models/friend.models.js";
import User from "../models/User.models.js";

export async function getRecommendedUsers(req,res){
    try {
        const currentUserId = req.user._id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and:[
                {_id:{$ne:currentUserId}},
                {_id:{$nin:currentUser.friends}},
                {isOnboarded:true}
            ]
        })
        res.status(200).json({users:recommendedUsers})
    } catch (error) {
        console.error("Error fetching recommended users:",error);
        res.status(500).json({message:"Internal Server Error"})
        
    }
}
export async function getMyFriends(req,res){
    try {
        const user = await User.findById(req.user._id).populate("friends","fullName profilePic bio location learningLanguage nativeLanguage")

        res.status(200).json(user.friends)
        
    } catch (error) {
        console.error("Error fetching friends:",error);
        res.status(500).json({message:"Internal Server Error"})
    }
}

export async function sendFriendRequest(req,res) {
    try {
        const myId = req.user._id
        const {id:recipientId}= req.params;

        //prevent sending request to ourselves
        if(myId.toString()===recipientId){
            return res.status(400).json({message:"You cannot send friend request to yourself"})
        }

        const recipient = await User.findById(recipientId)
        if(!recipient){
            return res.status(404).json({message:"Recipient user not found"})
        }

        // check if user is already friends with recipient
        if(recipient.friends.includes(myId)){
            return res.status(400).json({message:"You are already friends with this user"})
        }

        // check if a friend request has already been sent
        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender:myId,recipient:recipientId},
                {senedr:recipientId,recipient:myId},
            ]
        })
        if(existingRequest){
            return res.status(400).json({message:"A friend request already exists between you and this user"})
        }
        const friendRequest = await FriendRequest.create({
            sender:myId,
            recipient:recipientId
        })

        res.status(201).json(friendRequest)

    } catch (error) {
        console.error("Error sending friend request:",error);
        res.status(500).json({message:"Internal Server Error"});
    }
} 

export async function acceptFriendRequest(req,res){
    try {
        const {id:requestId}= req.params;
        const friendRequest = await FriendRequest.findById(requestId);
        if(!friendRequest){
            return res.status(404).json({message:"Friend request not found"})
        }
        if(friendRequest.recipient.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"You are not authorized to accept this friend request"})
        }

        friendRequest.status="accepted";
        await friendRequest.save();

        //add each user to the others friends list
        await User.findByIdAndUpdate(friendRequest.sender,{
        $addToSet:{friends:friendRequest.recipient}
        })

        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{friends:friendRequest.sender}
        })
        
        res.status(200).json({message:"Friend request accepted"})

    } catch (error) {
        console.error("Error accepting friend request:",error);
        res.status(500).json({message:"Internal Server Error"});
        
    }
}

export async function getFriendRequests(req,res){
    try {
        const myId = req.user._id;
        const incomingRequests = await FriendRequest.find({
            recipient:myId,
            status:"pending"
        }).populate("sender","fullName profilePic learningLanguage nativeLanguage");

        const acceptedRequests = await FriendRequest.find({
            sender:myId,
            status:"accepted"
        }).populate("recipient","fullName profilePic learningLanguage nativeLanguage");

        res.status(200).json({incomingRequests,acceptedRequests})
    } catch (error) {
        console.error("Error in getFriendRequests controller:",error);
        res.status(500).json({message:"Internal Server Error"});
        
    }
}

export async function getOutgoingFriendRequests(req,res){
    try {
        const  outgoingRequests = await FriendRequest.find({
            sender:req.user._id,
            status:"pending"
        }).populate("recipient","fullName profilePic learningLanguage nativeLanguage");

        res.status(200).json({outgoingRequests})
    } catch (error) {
        console.error("Error in getOutgoingFriendRequests controller:",error);
        res.status(500).json({message:"Internal Server Error"});
        
    }
}