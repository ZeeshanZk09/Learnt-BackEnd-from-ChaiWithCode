import { asyncHandler } from "./../utils/requestHandler.js";
import ApiError from "./../utils/ApiError.js";
import { User } from "./../models/user.model.js";
import { uploadFile } from "./../utils/Cloudinary.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend

  const { username, email, fullName, password } = req.body;
  console.log("email: ", email);

  // validation - not empty

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user alr exists: username, email

  const existingUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(
      409,
      `User with ${email} or ${username} already exists.`
    );
  }

  // check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required.");
  }

  // upload them to cloudinary, avatar

  let avatar;
  let coverImage;

  if (avatarLocalPath) {
    avatar = await uploadFile(avatarLocalPath);
  }
  if (coverImageLocalPath) {
    coverImage = await uploadFile(coverImageLocalPath);
  }

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required.");
  }

  // create user object - create entry in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token field in response

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user.");
  }

  // return res

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created Successfully"));
});

export { registerUser };
