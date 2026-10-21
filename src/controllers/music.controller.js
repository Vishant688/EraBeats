
const musicModel = require("../models/music.model");
const { uploadFile } = require("../services/storage.service");
const jwt = require("jsonwebtoken");
const albumModel = require("../models/album.model");

// CREATE MUSIC — Admin only
async function createMusic(req, res) {
    try {
        const title = req.body.title || req.body.Title;
        const artistName = req.body.artistName || "";

        // Files received from Multer upload.fields()
        const musicFile = req.files?.music?.[0];
        const coverFile = req.files?.coverImage?.[0];

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Music title is required",
            });
        }

        if (!musicFile) {
            return res.status(400).json({
                message: "Music audio file is required",
            });
        }

        if (!coverFile) {
            return res.status(400).json({
                message: "Cover image is required",
            });
        }

        // Check audio file type
        if (!musicFile.mimetype.startsWith("audio/")) {
            return res.status(400).json({
                message: "Please upload a valid audio file",
            });
        }

        // Check cover image type
        if (!coverFile.mimetype.startsWith("image/")) {
            return res.status(400).json({
                message: "Please upload a valid cover image",
            });
        }

        // Upload audio to ImageKit
        const audioResult = await uploadFile(
            musicFile.buffer.toString("base64"),
            "music"
        );

        // Upload cover image to ImageKit
        const coverResult = await uploadFile(
            coverFile.buffer.toString("base64"),
            "cover"
        );

        if (!audioResult?.url || !coverResult?.url) {
            return res.status(500).json({
                message: "Audio or cover image upload failed",
            });
        }

        // Save song details in MongoDB
        const music = await musicModel.create({
            uri: audioResult.url,
            title: title.trim(),
            artist: req.user.id,
            artistName: artistName.trim(),
            coverImage: coverResult.url,
        });

        return res.status(201).json({
            message: "Music and cover image uploaded successfully",
            music,
        });
    } catch (err) {
        console.error("Create music error:", err);

        return res.status(500).json({
            message: "Music upload failed",
            error: err.message,
        });
    }
}

// CREATE ALBUM — Artist only
async function createAlbum(req, res) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "artist") {
            return res.status(403).json({
                message: "You don't have access to create an album",
            });
        }

        const { title, musics } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "Album title is required",
            });
        }

        const album = await albumModel.create({
            title,
            artist: decoded.id,
            musics: musics || [],
        });

        return res.status(201).json({
            message: "Album created successfully",
            album,
        });
    } catch (err) {
        console.error("Create album error:", err.message);

        return res.status(401).json({
            message: "Unauthorized",
        });
    }
}

// GET ALL MUSIC
async function getAllMusics(req, res) {
    try {
        const musics = await musicModel
            .find()
            .populate("artist", "username email");

        return res.status(200).json({
            message: "Music fetched successfully",
            musics,
        });
    } catch (err) {
        console.error("Fetch music error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch music",
        });
    }
}

// GET ALL ALBUMS
async function getAllAlbums(req, res) {
    try {
        const albums = await albumModel
            .find()
            .select("title artist")
            .populate("artist", "username email");

        return res.status(200).json({
            message: "Albums fetched successfully",
            albums,
        });
    } catch (err) {
        console.error("Fetch albums error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch albums",
        });
    }
}

// GET ALBUM BY ID
async function getAlbumById(req, res) {
    try {
        const album = await albumModel
            .findById(req.params.albumId)
            .populate("artist", "username email")
            .populate("musics");

        if (!album) {
            return res.status(404).json({
                message: "Album not found",
            });
        }

        return res.status(200).json({
            message: "Album fetched successfully",
            album,
        });
    } catch (err) {
        console.error("Fetch album error:", err.message);

        return res.status(500).json({
            message: "Failed to fetch album",
        });
    }
}

module.exports = {
    createMusic,
    createAlbum,
    getAllMusics,
    getAllAlbums,
    getAlbumById,
};
