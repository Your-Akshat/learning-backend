import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const registerUser = asyncHandler( async (req, res) => {
    // fetch details from frontend
    // validate fields
    // check if user exists
    // check for images, check avatar
    // upload images on cloudinary
    // create user object - entry in db
    // remove password and refresh token from response
    // check for user creation
    // return response

    const {fullName, userName, email, password} = req.body

    if([fullName, userName, email, password].some((field) => field.trim() === "")){
        throw new ApiError(400, "Fields are required");
    }

    const existingUser = User.findOne({
        $or: [{email}, {userName}]
    })

    if(existingUser){
        throw new ApiError(409, "User with userName or email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar is required");
    }

    const user = await User.create({
        userName: userName,
        email: email,
        password: password,
        fullName: fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = User.findById(user._id).select("-password -refreshToken") // removes fields given with '-' in select()

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})

export {registerUser}