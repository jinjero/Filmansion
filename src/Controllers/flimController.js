import Flim from "../Models/Flim";
import User from "../Models/User";
import Comment from "../Models/Comment";

export const home = async (req, res) => {
  const flims = await Flim.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", flims });
};

export const search = async (req, res) => {
  const { keyword } = req.query;
  let flims = [];
  if (keyword) {
    flims = await Flim.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  }
  return res.render("search", { pageTitle: "Search", flims });
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  try {
    const newFlim = await Flim.create({
      title,
      description,
      hashtags: Flim.formatHashtags(hashtags),
      fileUrl: video[0].location,
      thumbUrl: thumb[0].location,
      owner: _id,
    });
    const user = await User.findById(_id);
    user.flims.push(newFlim._id);
    user.save();
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(400).render("upload", {
      pageTitle: "Upload",
      errorMessage: error._message,
    });
  }
};

export const watchFlim = async (req, res) => {
  const { id } = req.params;
  const flim = await Flim.findById(id).populate("owner").populate("comments");
  if (!flim) {
    return res.status(404).render("404", { pageTitle: "Flim not found" });
  }
  return res.render("watch", { pageTitle: `${flim.title}`, flim });
};

export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const flim = await Flim.findById(id);
  if (!flim) {
    return res.status(404).render("404", { pageTitle: "Flim not found" });
  }
  if (String(flim.owner) !== String(_id)) {
    req.flash("error", "Not Authorized");
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit "${flim.title}"`, flim });
};

export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;
  const flim = await Flim.exists({ _id: id });
  if (!flim) {
    return res.status(404).render("404", { pageTitle: "Flim not found" });
  }
  if (String(flim.owner) !== String(_id)) {
    req.flash("error", "You're Not the Owner of the Video");
    return res.status(403).redirect("/");
  }
  await Flim.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Flim.formatHashtags(hashtags),
  });
  req.flash("success", "Changes Saved");
  return res.redirect("/");
};

export const deleteFlim = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const flim = await Flim.findById(id);
  if (!flim) {
    return res.status(404).render("404", { pageTitle: "Flim not found" });
  }
  if (String(flim.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  await Flim.deleteOne({ _id: id });
  return res.redirect("/");
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const flim = await Flim.findById(id);
  if (!flim) {
    return res.sendStatus(404);
  }
  flim.meta.views = flim.meta.views + 1;
  await flim.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const flim = await Flim.findById(id);
  if (!flim) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    flim: id,
  });
  flim.comments.push(comment._id);
  flim.save();
  return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { commentId },
  } = req;
  const comment = await Comment.findById(commentId).populate("owner");
  const flimId = comment.flim;
  if (String(_id) !== String(comment.owner._id)) {
    return res.sendStatus(404);
  }
  const flim = await Flim.findById(flimId);
  if (!flim) {
    return res.sendStatus(404);
  }

  flim.comments.splice(flim.comments.indexOf(commentId), 1);
  await flim.save();
  await Comment.findByIdAndDelete(commentId);

  return res.sendStatus(200);
};
