const { Post, Hashtag } = require("../models");

exports.afterUploadImage = (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
};

exports.uploadPost = async (req, res, next) => {
  try {
    // 게시글을 DB에 저장한다:
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    // 정규식으로 해시태그를 추출한다:
    const hashtags = req.body.content.match(/#[^\s#]*/g);
    if (hashtags) {
      // [findOrCreate, findOrCreate, findOrCreate]
      const result = await Promise.all(
        hashtags.map((tag) => {
          // [[모델, bool], [모델, bool], [모델, bool]]
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          });
        })
      );
      await post.addHashtags(result.map((r) => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
};
