const { prisma } = require("../prisma/prisma-client");

const FollowController = {
  followUser: async (req, res) => {
    const { followingId } = req.body;
    const userId = req.user.userId;

    if (!followingId) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }
    if (followingId === userId) {
      return res.status(400).json({ error: "Вы не можете подписаться на себя" });
    }
    try {
      //поиск - подписан ли я уже на пользователя
      const existingFollow = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (existingFollow) {
        return res.status(400).json({ error: "Подписка уже существует" });
      }

      await prisma.follows.create({
        data: {
          follower: { connect: { id: userId } },
          following: { connect: { id: followingId } },
        },
      });

      res.status(201).json({ message: "Подписка успешна создана" });
    } catch (error) {
      console.error("Follow error", error);
      return res.status(500).json({ error: "Internal follow error" });
    }
  },
  unfollowUser: async (req, res) => {
    const { followingId } = req.body; // от кого мы отписываемся
    const userId = req.user.userId;

    try {
      const follows = await prisma.follows.findFirst({
        where: {
          AND: [{ followerId: userId }, { followingId }],
        },
      });

      if (!follows) {
        return res.status(404).json({ error: "Вы не подписаны на этого пользователя" });
      }

      await prisma.follows.delete({ where: { id: follows.id } });

      res.status(201).json({ message: "Вы отписались" });
    } catch (error) {
      console.error("Unfollow error", error);
      return res.status(500).json({ error: "Internal follow error" });
    }
  },
};

module.exports = FollowController;
