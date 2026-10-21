
const mongoose = require("mongoose");

const userMusicSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },

    likedSongs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "music",
      },
    ],

    recentlyPlayed: [
      {
        music: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "music",
          required: true,
        },
        playedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("userMusic", userMusicSchema);
