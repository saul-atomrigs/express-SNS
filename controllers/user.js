/**
 * req.user.id가 followerId,
 * req.params.id가 followingId
 */

const User = require("../models/user");

exports.follow = async (req, res, next) => {
  try {
    // 팔로우할 사용자를 DB에서 조회한다:
    const user = await User.findOne({ where: { id: req.user.id } });
    if (user) {
      // 현재 로그인한 사용자와 팔로우할 사용자의 관계를 지정한다:
      await user.addFollowing(parseInt(req.params.id, 10));
      res.send("success");
    } else {
      res.status(404).send("no user");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
