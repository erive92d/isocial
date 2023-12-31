// import user model
const User = require("../models/User")
const Post = require("../models/Post")
// import sign token function from auth
const { signToken } = require("../utils/auth");


module.exports = {
  //get all users
  async allUsers(req, res) {
    const getUsers = await User.find({});
    res.json(getUsers);
  },
  async getSingleUser({ user = null, params }, res) {
    console.log(params);
    const foundUser = await User.findOne({
      $or: [
        { _id: user ? user._id : params.userId },
        { username: params.username },
      ],
    });

    if (!foundUser) {
      return res
        .status(400)
        .json({ message: "Cannot find a user with this id!" });
    }
    console.log(foundUser);
    res.json(foundUser);
  },

  async querySingleUserPosts({ params }, res) {
    console.log(params)
    const postFound = await Post.find(
      {
        authorId: params.userId
      }
    )
    console.log(postFound)

    res.json(postFound)
  },

  async queryUserWithName({ params }, res) {
    console.log
    try {
      const userFound = await User.find({
        name: params.userN
        // { username: params.name },
      }
      )


      if (!userFound) {
        return "No user found"
      }
      return res.json(userFound)

    } catch (error) {
      console.log(error)
    }

  },

  async login({ body }, res) {
    // console.log(body)
    const user = await User.findOne({
      username: body.username
    })

    console.log(user, "@@@@@@")
    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(body.password);
    if (!correctPw) {
      return res.status(420).json({ message: "Wrong password!" });
    }

    // res.json(user)

    const token = signToken(user);

    if (!token) {
      return
    }

    res.json({ token, user });
  },
  async createUser({ body }, res) {

    const newUser = {
      ...body,
      name: body.name.toLowerCase()
    }

    try {
      const user = await User.create(newUser);

      if (!user) {
        return res.status(400).json({ message: "Something is wrong!" });
      }

      const token = signToken(user);
      res.json({ token, user });
    } catch (error) {
      console.log(error)
      return res.status(560).json(error);
    }
  },

  async queryPosts(req, res) {
    const allPosts = await Post.find({})

    res.json(allPosts)
  },

  async queryOnePost({ params }, res) {
    console.log(params)
    const onePost = await Post.find(
      {
        _id: params.postId
      }
    )

    console.log(onePost)
    if (!onePost) {
      return "Post not found"
    }

    return res.json(onePost)

  },
  async createPost({ user, body }, res) {

    const author = await User.find(
      { _id: user._id }
    )
    const newPost = await Post.create(
      {
        postText: body.postText,
        postAuthor: author
      }
    )

    try {
      const userPost = await User.findOneAndUpdate(
        {
          _id: user._id
        },
        {
          $addToSet: { post: newPost }
        },
        {
          new: true
        }
      )

      return res.json(userPost)
    } catch (error) {
      console.error(error)
    }



  },
  async addComment({ user, body, params }, res) {
    console.log(params, "params")
    console.log(body)
    try {
      const author = await User.find(
        {
          _id: user._id
        }
      )
      const newComment = {
        commentText: body.commentText,
        commentAuthor: author
      }
      if (!author) {
        return res.status(400).json({ message: "Invalid user" })
      }

      if (!newComment) {
        return res.status(400).json({ message: "Could not send comment" })
      }
      console.log(newComment)

      const updatedPost = await Post.findOneAndUpdate(
        {
          _id: params.postId
        },
        {
          $addToSet: { comments: newComment }
        },
        {
          new: true
        }
      )

      console.log(updatedPost.comments)

      return res.json(updatedPost)

    } catch (error) {
      console.error(error)
    }

    console.log(comment, "comment")
  }



};
