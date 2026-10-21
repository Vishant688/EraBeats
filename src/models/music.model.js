
const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
    {
        uri: {
            type: String,
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },

        // Artist / singer name
        artistName: {
            type: String,
            required: false,
            trim: true,
        },

        // Song cover image URL from ImageKit
        coverImage: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const musicModel = mongoose.model("music", musicSchema);

module.exports = musicModel;
