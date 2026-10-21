
const mongoose = require("mongoose");
const userMusicModel = require("../models/userMusic.model");
const musicModel = require("../models/music.model");

// GET LIKED SONGS

async function getLikedSongs(req, res) {
  try {
    const data = await userMusicModel
      .findOne({ user: req.user.id })
      .populate({
        path: "likedSongs",
        populate: {
          path: "artist",
          select: "username",
        },
      });

    return res.status(200).json({
      likedSongs: data?.likedSongs || [],
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// ADD SONG TO LIKED SONGS

async function likeSong(req, res) {
  try {
    const { musicId } = req.params;

    if (!mongoose.isValidObjectId(musicId)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    const musicExists = await musicModel.exists({ _id: musicId });

    if (!musicExists) {
      return res.status(404).json({ message: "Song not found" });
    }

    await userMusicModel.findOneAndUpdate(
      { user: req.user.id },
      { $addToSet: { likedSongs: musicId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: "Song liked successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// REMOVE SONG FROM LIKED SONGS

async function unlikeSong(req, res) {
  try {
    const { musicId } = req.params;

    if (!mongoose.isValidObjectId(musicId)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    await userMusicModel.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { likedSongs: musicId } }
    );

    return res.status(200).json({ message: "Song unliked successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// SAVE RECENTLY PLAYED SONG

async function addRecentlyPlayed(req, res) {
  try {
    const { musicId } = req.params;

    if (!mongoose.isValidObjectId(musicId)) {
      return res.status(400).json({ message: "Invalid song ID" });
    }

    const musicExists = await musicModel.exists({ _id: musicId });

    if (!musicExists) {
      return res.status(404).json({ message: "Song not found" });
    }

    await userMusicModel.findOneAndUpdate(
      { user: req.user.id },
      {
        $pull: { recentlyPlayed: { music: musicId } },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await userMusicModel.findOneAndUpdate(
      { user: req.user.id },
      {
        $push: {
          recentlyPlayed: {
            $each: [{ music: musicId, playedAt: new Date() }],
            $position: 0,
            $slice: 50,
          },
        },
      }
    );

    return res.status(200).json({
      message: "Recently played updated",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// GET RECENTLY PLAYED SONGS

async function getRecentlyPlayed(req, res) {
  try {
    const data = await userMusicModel
      .findOne({ user: req.user.id })
      .populate({
        path: "recentlyPlayed.music",
        populate: {
          path: "artist",
          select: "username",
        },
      });

    const recentlyPlayed = (data?.recentlyPlayed || [])
      .filter((item) => item.music)
      .map((item) => ({
        ...item.music.toObject(),
        playedAt: item.playedAt,
      }));

    return res.status(200).json({ recentlyPlayed });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getLikedSongs,
  likeSong,
  unlikeSong,
  addRecentlyPlayed,
  getRecentlyPlayed,
};
