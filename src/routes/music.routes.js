
const express = require("express");
const multer = require("multer");

const musicControllers = require("../controllers/music.controller");
const authMiddleware = require("../midddlewares/auth.middleware");
const authAdmin = require("../midddlewares/authAdmin");
const userMusicControllers = require("../controllers/userMusic.controller");

const router = express.Router();

// Multer: audio + cover image
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB per file
        files: 2
    }
});

// Upload music — Admin only
router.post(
    "/upload",
    authAdmin,
    upload.fields([
        { name: "music", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    musicControllers.createMusic
);

// Create album — Artist only
router.post(
    "/album",
    authMiddleware.authArtist,
    musicControllers.createAlbum
);

// Get all music — User only
router.get(
    "/",
    authMiddleware.authUser,
    musicControllers.getAllMusics
);

// Get all albums — User only
router.get(
    "/album",
    authMiddleware.authUser,
    musicControllers.getAllAlbums
);

// Get album by ID — User only
router.get(
    "/album/:albumId",
    authMiddleware.authUser,
    musicControllers.getAlbumById
);

// Liked songs
router.get(
    "/liked",
    authMiddleware.authUser,
    userMusicControllers.getLikedSongs
);

router.post(
    "/liked/:musicId",
    authMiddleware.authUser,
    userMusicControllers.likeSong
);

router.delete(
    "/liked/:musicId",
    authMiddleware.authUser,
    userMusicControllers.unlikeSong
);

// Recently played
router.get(
    "/recently-played",
    authMiddleware.authUser,
    userMusicControllers.getRecentlyPlayed
);

router.post(
    "/recently-played/:musicId",
    authMiddleware.authUser,
    userMusicControllers.addRecentlyPlayed
);

module.exports = router;
