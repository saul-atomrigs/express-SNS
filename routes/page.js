const express = require("express");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const {
  renderProfile,
  renderJoin,
  renderMain,
  renderHashtag,
} = require("../controllers/page");

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  // 팔로잉/팔로워 숫자와 팔로우 버튼을 표시하기 위해 추가:
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;
  res.locals.followerIdList = req.user
    ? req.user.Followings.map((f) => f.id)
    : [];
  next();
});

// router.get("/profile", isLoggedIn, renderProfile);
router.get("/profile", (req, res) => {
  res.render("profile", { title: "내 정보 - NodeBird" });
});

// router.get("/join", isNotLoggedIn, renderJoin);
router.get("/join", (req, res) => {
  res.render("join", { title: "회원가입 - NodeBird" });
});

router.get("/", (req, res, next) => {
  const twits = [];
  res.render("main", {
    title: "NodeBird",
    twits,
  });
});

// render.get("/hashtag", renderHashtag);
router.get("/hashtag", async (req, res, next) => {
  // 쿼리스트링으로 해시태그를 받아온다:
  const query = req.query.hashtag;
  // 해시태그값이 없으면 메인페이지로 리다이렉트한다:
  if (!query) {
    return res.redirect("/");
  }

  try {
    // DB에서 해당 해시태그가 존재하는지 확인한다:
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    // 해시태그가 존재하면 해당 해시태그를 가진 게시글을 조회한다:
    if (hashtag) {
      // 가져올 때는 include를 통해 작성자 정보를 합친다:
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }

    // 조회 후 메인페이지를 렌더링하면서 전체 게시글 대신 조회된 게시글만 twits에 넣어서 렌더링한다:
    return res.render("main", {
      title: `${query} | NodeBird`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;
