async function addSongData(songId) {
    if (currentDocument.songs.some(s => String(s.id) === String(songId))) return;
    const res = await fetch(`./json/songs/${songId}.json`);
    if (!res.ok) {
        console.warn("Could not load song export JSON for", songId);
        return;
    }
    const json = await res.json();
    const song = json.data.song;

    const clouds = song.clouds || [];
    const audios = song.audios || [];
    const pages = song.pages || [];
    const esongbooks = song.esongbooks || [];

    const songData = {
        id: song.id,
        tempo: song.tempo,
        infoName: song.infoName,
        infoNameExtractable: song.infoNameExtractable,
        infoAuthor: song.infoAuthor,
        infoCopyright: song.infoCopyright,
        infoCopyrightFormatted: song.infoCopyrightFormatted,
        infoCCLI: song.infoCCLI,
        infoAge: song.infoAge,
        infoCategory: song.infoCategory,
        keywords: song.keywords,
        overrideButtonInfo: song.overrideButtonInfo,
        overrideButtonLyrics: song.overrideButtonLyrics,
        overrideButtonScore: song.overrideButtonScore,
        showButtonExtract: song.showButtonExtract,
        showButtonInfo: song.showButtonInfo,
        showButtonLyrics: song.showButtonLyrics,
        showButtonScore: song.showButtonScore,
        styleBodyFont: song.styleBodyFont,
        styleBodyLeading: song.styleBodyLeading,
        styleBodySize: song.styleBodySize,
        styleTitleCol: song.styleTitleCol,
        styleTitleFont: song.styleTitleFont,
        styleTitleSize: song.styleTitleSize,
        styleCol1Highlighted: song.styleCol1Highlighted,
        styleCol1Unhighlighted: song.styleCol1Unhighlighted,
        styleCol2Highlighted: song.styleCol2Highlighted,
        styleCol2Unhighlighted: song.styleCol2Unhighlighted,
        styleCol3Highlighted: song.styleCol3Highlighted,
        styleCol3Unhighlighted: song.styleCol3Unhighlighted,
        styleCol4Highlighted: song.styleCol4Highlighted,
        styleCol4Unhighlighted: song.styleCol4Unhighlighted,
        styleCol5Highlighted: song.styleCol5Highlighted,
        styleCol5Unhighlighted: song.styleCol5Unhighlighted,
        styleMarginLeft: song.styleMarginLeft,
        styleMarginRight: song.styleMarginRight,
        styleMarginTop: song.styleMarginTop,
        styleMarginBottom: song.styleMarginBottom,
        fileBackground: song.fileBackground ? cleanURL(song.fileBackground) : "",
        fileBackgroundMD5: song.fileBackgroundMD5,
        fileBackgroundSize: song.fileBackgroundSize,
        fileLarge: song.fileLarge ? cleanURL(song.fileLarge) : "",
        fileLargeMD5: song.fileLargeMD5,
        fileLargeSize: song.fileLargeSize,
        fileInfo: song.fileInfo ? cleanURL(song.fileInfo) : "",
        fileInfoMD5: song.fileInfoMD5,
        fileInfoSize: song.fileInfoSize,
        fileLyrics: song.fileLyrics ? cleanURL(song.fileLyrics) : "",
        fileLyricsMD5: song.fileLyricsMD5,
        fileLyricsSize: song.fileLyricsSize,
        fileScore: song.fileScore ? cleanURL(song.fileScore) : "",
        fileScoreMD5: song.fileScoreMD5,
        fileScoreSize: song.fileScoreSize,
        audios: [],
        clouds: [],
        pages: [],
        esongbooks: []
    };

    for (const cloud of clouds) {
        songData.clouds.push({
            id: cloud.id,
            filename: cloud.filename ? cleanURL(cloud.filename) : "",
            filename_md5: cloud.filename_md5,
            filename_size: cloud.filename_size
        });
    }

    for (const audio of audios) {
        songData.audios.push({
            id: audio.id,
            isDefault: audio.isDefault,
            isExtractable: audio.isExtractable,
            isVisible: audio.isVisible ?? true,
            type: audio.type,
            tempo: audio.tempo,
            infoName: audio.infoName,
            infoNameExtractable: audio.infoNameExtractable,
            infoArtist: audio.infoArtist,
            infoCopyright: audio.infoCopyright,
            infoISRC: audio.infoISRC,
            millisecondsLength: audio.millisecondsLength,

            files: {
                mp3: audio.files?.mp3 ? cleanURL(audio.files.mp3) : "",
                ogg: audio.files?.ogg ? cleanURL(audio.files.ogg) : ""
            },

            file_md5s: {
                mp3: audio.file_md5s?.mp3 || "",
                ogg: audio.file_md5s?.ogg || ""
            },

            file_sizes: {
                mp3: audio.file_sizes?.mp3 || 0,
                ogg: audio.file_sizes?.ogg || 0
            }
        })
    }

    for (const page of pages) {

        const pageObj = {
            id: page.id,
            infoHeader: page.infoHeader ?? "",
            infoHeaderBasicOverride: page.infoHeaderBasicOverride ?? "",
            infoFooter1: page.infoFooter1 ?? "",
            infoFooter2: page.infoFooter2 ?? "",
            showPageHeader: page.showPageHeader ?? true,
            showPageFooter: page.showPageFooter ?? true,
            millisecondsStart: page.millisecondsStart ?? 0,
            millisecondsStop: page.millisecondsStop ?? 0,
            styleBodyLeading: page.styleBodyLeading ?? 0,
            styleBodySize: page.styleBodySize ?? 0,
            // cloudPosX: page.cloudPosX ?? -1,
            // cloudPosY: page.cloudPosY ?? -1,

            clouds: []
        };

        const pageClouds = page.clouds || [];
        const pageCloudIds = new Set(pageClouds.map(c => String(c.id)));

        // PAGE CLOUDS – create cloud{ID}PosX/Y for *every* song cloud
        for (const songCloud of songData.clouds) {
            const cloudId = String(songCloud.id);
            const appearsOnThisPage = pageCloudIds.has(cloudId);

            // If cloud is on this page, use page cloudPosX/Y, otherwise -1/-1
            const posX = appearsOnThisPage ? (page.cloudPosX ?? -1) : -1;
            const posY = appearsOnThisPage ? (page.cloudPosY ?? -1) : -1;

            pageObj[`cloud${cloudId}PosX`] = posX;
            pageObj[`cloud${cloudId}PosY`] = posY;
        }

        pageObj.groups = [];

        // GROUPS
        for (const group of (page.groups || [])) {

            const groupObj = {
                id: group.id,
                infoName: group.infoName ?? "",
                styleGroupIndex: group.styleGroupIndex ?? 1,
                styleGroupCol: group.styleGroupCol ?? "unhighlighted",
                styleColIndex: group.styleColIndex ?? 1,
                stylePadding: group.stylePadding ?? 0,
                lines: []
            };

            // LINES
            for (const line of (group.lines || [])) {

                const lineObj = {
                    id: line.id,
                    splitLineNumber: line.splitLineNumber ?? 0,
                    phrases: []
                };

                // PHRASES
                for (const phrase of (line.phrases || [])) {

                    lineObj.phrases.push({
                        id: phrase.id,
                        content: phrase.content ?? "",
                        milliseconds: phrase.milliseconds ?? 0,
                        hide: phrase.hide ?? 0,
                        isClickable: phrase.isClickable ?? true,
                        isHighlightable: phrase.isHighlightable ?? true,
                        splitLineNumber: phrase.splitLineNumber ?? 0
                    });
                }

                groupObj.lines.push(lineObj);
            }

            pageObj.groups.push(groupObj);
        }

        songData.pages.push(pageObj);
    }

    for (const esongbook of esongbooks) {
        songData.esongbooks.push({
            id: esongbook.id,
            infoName: esongbook.infoName
        })
    }

    return songData;
}

// Global-ish state for the thing you're building up:
const currentDocument = {
    name: "Untitled Singchronize",
    songs: [],          // array of full song objects from ./json/<id>.json
    // songbook: false,    // set true when doing a whole eSongbook
    // esongbookData: null // optional later, for full eSongbook exports
};

function setDocumentName(name) {
    currentDocument.name = name || "Untitled Singchronize";
}

const esongbook = {
    name: "Songbook",
    songs: [],
    esongbooks: []
}

async function addSongToDocument(songId) {
    const data = await addSongData(songId);
    if (data) currentDocument.songs.push(data);

    console.log(JSON.parse(JSON.stringify(currentDocument)));
}

function removeSongFromDocument(songId) {
    currentDocument.songs = currentDocument.songs.filter(
        s => String(s.id) !== String(songId)
    );
}

function clearDocument() {
    currentDocument.songs = [];
    currentDocument.name = "Singchronize Document";
    currentDocument.songbook = false;
    currentDocument.esongbookData = null;
}

function targetMD5(input) {
    const hash = CryptoJS.MD5(input).toString();
    return hash
}

// async function md5FromFile(url) {
//     const response = await fetch(url);
//     const blob = await response.blob();

//     const arrayBuffer = await blob.arrayBuffer();

//     // Convert ArrayBuffer → WordArray for CryptoJS
//     const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);

//     return CryptoJS.MD5(wordArray).toString();
// }

// async function fileSize(url) {
//     const res = await fetch(url);
//     const blob = await res.blob();
//     return blob.size;
// }

function cleanURL(url) {
    const PREFIX = "https://www.outoftheark.co.uk/library/";

    // 1. Remove prefix if it exists
    if (url.startsWith(PREFIX)) {
        url = url.slice(PREFIX.length);
    }

    // 2. Remove ?access_token=... if present
    // Use URL API safely — but only if it's a full URL
    try {
        const u = new URL(url, window.location.origin);
        u.searchParams.delete("access_token");
        u.searchParams.delete("sharelink_uuid");
        url = u.pathname + u.search + u.hash;

        if (url.startsWith("/")) {
            url = url.slice(1);
        }
    } catch {
        // If it's *not* a full URL (e.g. "songs/lyrics/0/..."), ignore
    }

    return url;
}

async function getImageMeta(imageFileLarge, localPath) {
    // If JSON says "no image", skip hashing entirely
    if (!imageFileLarge || imageFileLarge.trim() === "") {
        return { md5: "", size: 0 };
    }

    try {
        const res = await fetch(localPath);

        if (!res.ok) {
            // JSON says image exists, but file does not → still return blanks
            return { md5: "", size: 0 };
        }

        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);

        return {
            md5: CryptoJS.MD5(wordArray).toString(),
            size: blob.size
        };
    } catch (e) {
        // Any error = return blank meta
        return { md5: "", size: 0 };
    }
}


async function exportSingchronizeSongbook(songbookID) {
    const res = await fetch(`./json/songbooks/${songbookID}.json`);
    if (!res.ok) {
        console.warn("Could not export eSongbook:", songId);
        return;
    }

    const json = await res.json();
    const songbook = json.data.esongbook;

    const songArray = songbook.songs || [];
    const songData = []

    const resources = songbook.resources || [];

    const imageFileLargePath = `./resources/images/large/file_large_${songbook.id}.jpg`;
    const imageFileMediumPath = `./resources/images/medium/file_medium_${songbook.id}.jpg`;

    const { md5: largeMD5, size: largeSize } = await getImageMeta(songbook.imageFileLarge, imageFileLargePath);
    const { md5: mediumMD5, size: mediumSize } = await getImageMeta(songbook.imageFileMedium, imageFileMediumPath);

    songbookData = {
        id: songbook.id,
        infoName: songbook.infoName,
        infoNameExtractable: songbook.infoName,
        infoAuthor: songbook.infoAuthor,
        infoCategory: songbook.infoCategory,
        imageFileLarge: songbook.imageFileLarge ? cleanURL(songbook.imageFileLarge) : "",
        imageFileLargeMD5: largeMD5,// call file's MD5 here
        imageFileLargeSize: largeSize,
        imageFileMedium: songbook.imageFileMedium ? cleanURL(songbook.imageFileMedium) : "",
        imageFileMediumMD5: mediumMD5,
        imageFileMediumSize: mediumSize,
        resources: [],
        tracks: []
    }

    for (const song of songArray) {
        const songId = song.id;

        songbookData.tracks.push({
            trackNumber: song.pivot.ordering,
            songId: songId
        })

        const data = await addSongData(songId);
        songData.push(data)
    }

    for (const resource of resources) {
        songbookData.resources.push({
            id: resource.id,
            type: resource.type,
            title: resource.title,
            linkURL: resource.linkUrl,
            PDFFile: resource.pdfFile ? cleanURL(resource.pdfFile) : "",
            PDFFileMD5: resource.pdfFileMd5,
            PDFFileSize: resource.pdfFileSize,
            SFXFile: resource.sfxFile ? cleanURL(resource.sfxFile) : "",
            SFXFileMD5: resource.sfxFileMd5,
            SFXFileSize: resource.sfxFileSize
        })
    }

    esongbook.songs.push(songData);
    esongbook.esongbooks.push(songbookData);


    console.log(JSON.parse(JSON.stringify(esongbook)));

    await exportEsongbookZipFromGlobal();
}


async function exportEsongbookZipFromGlobal() {
    if (!esongbook.songs.length || !esongbook.esongbooks.length) {
        alert("No eSongbook data to export.");
        return;
    }

    const doc = {
        name: esongbook.name || "eSongbook",
        songs: esongbook.songs[0] || null,
        songbook: true,
        esongbookData: esongbook.esongbooks[0] || null
    };

    // console.log(doc.songs)

    await exportSingchronizeDocument(doc);

    // Clear eSongbook so nothing else leaks into the next export
    esongbook.songs = [];
    esongbook.esongbooks = [];
}




async function exportSingchronizeDocument(doc) {
    if (!doc.songs || !doc.songs.length) {
        alert("No songs in this Singchronize document to export.");
        return;
    }

    let docName;

    const isSongbook = doc.songbook && doc.esongbookData;

    // 
    if (isSongbook) {
        docName = doc.esongbookData.infoNameExtractable || doc.esongbookData.infoName || "Singchronize";
    } else if (!isSongbook) {
        docName = prompt('Please enter a document title to export:') || "Singchronize";
    }

    const zip = new JSZip();

    // 1) Singchronize.exe in root (optional, if present)
    try {
        const exeRes = await fetch('./resources/singchronize/Singchronize.exe');
        if (exeRes.ok) {
            const exeBlob = await exeRes.blob();
            zip.file('Singchronize.exe', exeBlob);
        } else {
            console.warn("Singchronize.exe not found – skipping");
        }
    } catch (e) {
        console.warn("Error fetching Singchronize.exe", e);
    }

    // 2) Distributed images in /Distributed (cover + splash)
    // (You can adjust the paths to whatever you actually use)
    async function addIfExists(src, target) {
        try {
            const r = await fetch(src);
            if (!r.ok) {
                console.warn("Missing file, skipping:", src);
                return false;
            }
            const b = await r.blob();
            zip.file(target, b);
            return true;
        } catch (e) {
            console.warn("Error fetching", src, e);
            return false;
        }
    }


    if (isSongbook) {
        // Cover
        if (!await addIfExists(
            `./resources/images/large/file_large_${doc.esongbookData.id}.jpg`,
            'Singchronize PDFs/.Temp/Distributed/imCover.jpg'
        )) {
            await addIfExists(
                './resources/images/large/file_large_0.jpg',
                'Singchronize PDFs/.Temp/Distributed/imCover.jpg'
            );
        }

        // Splash
        if (!await addIfExists(
            `./resources/images/splash/file_splash_${doc.esongbookData.id}.jpg`,
            'Singchronize PDFs/.Temp/Distributed/imSplash.jpg'
        )) {
            await addIfExists(
                './resources/images/splash/file_splash_0.jpg',
                'Singchronize PDFs/.Temp/Distributed/imSplash.jpg'
            );
        }
    } else {
        await addIfExists(
            './resources/images/large/file_large_0.jpg',
            'Singchronize PDFs/.Temp/Distributed/imCover.jpg'
        );
        await addIfExists(
            './resources/images/splash/file_splash_0.jpg',
            'Singchronize PDFs/.Temp/Distributed/imSplash.jpg'
        );
    }


    await addIfExists('./resources/singchronize/guide.pdf', 'Singchronize PDFs/.Temp/Distributed/guide.pdf');
    await addIfExists('./resources/singchronize/extraction.pdf', 'Singchronize PDFs/.Temp/Distributed/extraction.pdf');
    await addIfExists('./resources/singchronize/terms.pdf', 'Singchronize PDFs/.Temp/Distributed/terms.pdf');

    await addIfExists('./resources/singchronize/install1.png', 'Singchronize PDFs/.Temp/Distributed/install1.png');
    await addIfExists('./resources/singchronize/install2.png', 'Singchronize PDFs/.Temp/Distributed/install2.png');

    await addIfExists('./resources/singchronize/exit/exit0.png', 'Singchronize PDFs/.Temp/Distributed/exit0.png');
    await addIfExists('./resources/singchronize/exit/exit1.png', 'Singchronize PDFs/.Temp/Distributed/exit1.png');
    await addIfExists('./resources/singchronize/exit/exit2.png', 'Singchronize PDFs/.Temp/Distributed/exit2.png');
    await addIfExists('./resources/singchronize/exit/exit3.png', 'Singchronize PDFs/.Temp/Distributed/exit3.png');

    // 3) .Temp/config.json (fixed contents you gave)
    const configJson = {
        "settingMode": "Distributed",
        "settingSessionId": null,
        "settingURLBase": null,
        "settingDevice": null,
        "settingUserEMailHash": null,
        "settingUserWoskey": null
    };
    zip.file('Singchronize PDFs/.Temp/config.json', JSON.stringify(configJson, null, 4));

    // 4) .Temp/distributed.json (minimal variant)
    const distributedJson = buildDistributedJsonForDoc(doc, docName);
    zip.file('Singchronize PDFs/.Temp/distributed.json', JSON.stringify(distributedJson, null, 4));

    // 5) .Temp/songs.json built from the songs in this document
    const songsJson = buildSongsJsonFromDoc(doc, docName);

    // 1) Turn the whole structure into text
    let songsJsonText = JSON.stringify(songsJson, null, 4);

    // 2) Replace EVERY "/" in the file text with literal "\\/\/"
    //
    // '\\\\\\/' in JS source = characters: backslash, backslash, slash  (\\/)
    //
    // So this makes the FILE contain: \\\/
    songsJsonText = songsJsonText.replace(/\//g, '\\\\\\/');

    // 3) Write that exact text into the zip
    zip.file('Singchronize PDFs/.Temp/songs.json', songsJsonText);
    // 6) Add all the song assets (PDFs, images, audio) using your existing pattern
    const files = [];

    for (const song of doc.songs) {
        // PDFs
        if (song.fileLyrics) {
            files.push({
                src: `./resources/pdfs/lyrics/file_lyrics_${song.id}.pdf`,
                target: `Singchronize PDFs/file_song_lyrics_${song.id}_${targetMD5(song.fileLyrics)}.pdf` //MD5 of fileLyrics string
            });
        }

        if (song.fileScore) {
            files.push({
                src: `./resources/pdfs/score/file_score_${song.id}.pdf`,
                target: `Singchronize PDFs/file_song_score_${song.id}_${targetMD5(song.fileScore)}.pdf`
            });
        }

        if (song.fileInfo) {
            files.push({
                src: `./resources/pdfs/activity/file_info_${song.id}.pdf`,
                target: `Singchronize PDFs/file_song_info_${song.id}_${targetMD5(song.fileInfo)}.pdf`
            });
        }

        // Artwork
        if (song.fileLarge) {
            files.push({
                src: `./resources/images/file_large_${song.id}.jpg`,
                target: `Singchronize PDFs/.Temp/file_song_large_${song.id}_${targetMD5(song.fileLarge)}.jpg`
            });
        }

        if (song.fileBackground) {
            files.push({
                src: `./resources/images/file_background_${song.id}.jpg`,
                target: `Singchronize PDFs/.Temp/file_song_background_${song.id}_${targetMD5(song.fileBackground)}.jpg`
            });
        }

        (song.clouds || []).forEach(cloud => {
            if (!cloud.filename) return;
            files.push({
                src: `./resources/clouds/file_cloud_${cloud.id}.png`,
                target: `Singchronize PDFs/.Temp/file_cloud_${cloud.id}_${targetMD5(cloud.filename)}.png`
            });
        });

        (song.audios || []).forEach(audio => {
            const mp3Target = audio.files && audio.files.mp3;
            if (!mp3Target) return;

            files.push({
                src: `./resources/audio/mp3/file_audio_${audio.id}.mp3`,
                target: `Singchronize PDFs/.Temp/file_audio_${audio.id}_${targetMD5(mp3Target)}.dat`
            });
        });
    }

    // Extra: eSongbook-level resources (PDF / DOCX / SFX)
    if (isSongbook && Array.isArray(doc.esongbookData.resources)) {
        for (const res of doc.esongbookData.resources) {
            // type = 'pdf' -> include PDF + DOCX
            if (res.type === "pdf") {
                // PDF
                let ext = "pdf";
                if (res.PDFFile) {
                    const lower = res.PDFFile.toLowerCase();
                    if (lower.endsWith(".docx")) ext = "docx";
                    else if (lower.endsWith(".pdf")) ext = "pdf";
                }

                // Only add ONE file: either .pdf or .docx
                files.push({
                    src: `./resources/resources/file_resource_${res.id}.${ext}`,
                    target: `Singchronize PDFs/.Temp/Distributed/file_resource_${res.id}_${targetMD5(res.PDFFile || "")}.${ext}`
                });
            }

            // type = 'sfx' -> include ZIP
            if (res.type === "sfx") {
                files.push({
                    src: `./resources/resources/file_resource_${res.id}.zip`,
                    target: `Singchronize PDFs/.Temp/Distributed/file_resource_${res.id}_${targetMD5(res.SFXFile || "")}.zip`
                });
            }
        }
    }


    for (const file of files) {
        await addIfExists(file.src, file.target);
    }


    // To create the list.pdf of the songs
    if (window.jspdf && doc.songs && doc.songs.length) {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        // Header: use the same export title the user typed
        const headerTitle = docName;
        pdf.setFontSize(18);
        pdf.text(headerTitle, 10, 15);

        // Table headers
        pdf.setFontSize(12);

        // Helper to get the song title like your renderList() does
        const getSongTitle = (song) =>
            song.name || song.infoName || `Song ${song.id}`;

        let listSongs = doc.songs;

        if (isSongbook) {
            const trackMap = new Map();
            for (const t of doc.esongbookData.tracks) {
                if (t && t.songId != null && t.trackNumber != null) {
                    trackMap.set(String(t.songId), t.trackNumber);
                }
            }

            listSongs = [...doc.songs].sort((a, b) => {
                const ta = trackMap.get(String(a.id)) ?? 999999;
                const tb = trackMap.get(String(b.id)) ?? 999999;
                return ta - tb;
            });
        }


        const rows = listSongs.map(song => {
            // eSongbooks: combine names into one string
            let songbookName = "";
            if (song.esongbooks && song.esongbooks.length > 0) {
                songbookName = song.esongbooks
                    .map(sb => sb.infoName || "")
                    .join(", ");
            }

            // CCLI – adjust property name if yours is different
            const ccli = song.infoCCLI || song.ccli || "";

            return [
                String(song.id || ""),
                getSongTitle(song) || "",
                String(ccli),
                songbookName
            ];
        });



        // AutoTable handles borders & wrapping for us
        pdf.autoTable({
            head: [['ID', 'Title', 'CCLI', 'eSongbook']],
            body: rows,
            startY: 25,
            theme: 'grid',
            styles: {
                overflow: 'linebreak',   // wrap long text to new lines
                cellWidth: 'wrap',       // column width adjusts/wraps
                fontSize: 10
            },
            headStyles: {
                // you can tweak font/size here if you like
                fillColor: [0, 0, 0], // header background (DodgerBlue)
                textColor: 255,
                fontStyle: 'bold'
            },
            columnStyles: {
                // ID – narrow
                0: { cellWidth: 15 },

                // Title – wider
                1: { cellWidth: 75 },

                // eSongbook – medium
                2: { cellWidth: 25 },

                // CCLI – small
                3: { cellWidth: 50 }
            }
        });


        // Get PDF as binary and add to the zip
        const pdfArrayBuffer = pdf.output("arraybuffer");
        zip.file("Singchronize PDFs/.Temp/Distributed/list.pdf", pdfArrayBuffer);
    }


    // 7) Final ZIP and download
    const exportName = (docName).replace(/[\\/:*?"<>|]/g, '');
    const blob = await zip.generateAsync({ type: "blob" });

    if (window.saveAs) {
        saveAs(blob, `${exportName}.zip`);
    } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${exportName}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }
}

function buildDistributedJsonForDoc(doc, docName) {
    const isSongbook = doc.songbook && doc.esongbookData;
    // doc.songbook && doc.esongbookData ? (doc.esongbookData.resources || []) : 
    const distributedData = {
        songbook: true,
        title: docName,
        installFolder: docName,
        installTitle: `Install ${docName}`,
        installText: "Words on Screen – powered by Singchronize technology.",
        installImage1: "install1.png",
        installImage2: "install2.png",
        imageCover: "imCover.jpg",
        imageSplash: "imSplash.jpg",
        colorOut: "0x6B7234",
        colorOver: "0x51581A",
        extraction: "extraction.pdf",
        guide: "guide.pdf",
        list: "list.pdf",
        terms: "terms.pdf",

        // For now, blank if not a songbook – exactly as you wanted
        menu: [],
        exit: [
            {
                "url": "http:\/\/www.outoftheark.co.uk\/songs-for-every-assembly.html", 
                "path": "exit0.png" 
            }, { "url": "http:\/\/www.outoftheark.co.uk\/songs-for-every-season.html", "path": "exit1.png" }, { "url": "http:\/\/www.outoftheark.co.uk\/sing-christmas.html", "path": "exit2.png" }, { "url": "http:\/\/www.outoftheark.co.uk\/diy-nativity.html", "path": "exit3.png" }] // you can wire this up later if you want
    };

    if (isSongbook) {
        for (const res of doc.esongbookData.resources) {
            if (res.type === "pdf") {
                let ext = "pdf";
                if (res.PDFFile) {
                    const lower = res.PDFFile.toLowerCase();
                    if (lower.endsWith(".docx")) ext = "docx";
                    else if (lower.endsWith(".pdf")) ext = "pdf";
                }

                distributedData.menu.push({
                    type: res.type,
                    title: res.title,
                    path: `file_resource_${res.id}_${targetMD5(res.PDFFile)}.${ext}`
                })
            }

            if (res.type === "sfx") {
                distributedData.menu.push({
                    type: res.type,
                    title: res.title,
                    path: `file_resource_${res.id}_${targetMD5(res.SFXFile)}.zip`
                })
            }

            if (res.type === "link") {
                distributedData.menu.push({
                    type: res.type,
                    title: res.title,
                    url: res.linkURL
                })
            }



        }

    }

    return distributedData
}

function encodeSongData(song) {
    // Start with normal JSON
    let s = `${JSON.stringify(song)}`;

    // // 1) Turn "/" into "\/"
    // s = s.replace(/\//g, "\\/");

    // 2) Turn "<" and ">" into HTML entities
    s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    return s;
}

function buildSongsJsonFromDoc(doc) {
    let songsArray;

    const isSongbook = doc.songbook && doc.esongbookData;

    if (isSongbook) {
        const tracks = doc.esongbookData.tracks;

        // Map songId -> trackNumber
        const trackMap = new Map();
        tracks.forEach(t => {
            if (t && t.songId != null) {
                trackMap.set(String(t.songId), t.trackNumber);
            }
        });

        // 1) Songs in the order specified by tracks[]
        const orderedFromTracks = tracks
            .map(t => doc.songs.find(s => String(s.id) === String(t.songId)))
            .filter(Boolean); // ignore tracks with no matching song

        // 2) Any extra songs not mentioned in tracks[]
        const extraSongs = doc.songs.filter(
            s => !trackMap.has(String(s.id))
        );

        const allSongs = [...orderedFromTracks, ...extraSongs];

        songsArray = allSongs.map((song, index) => ({
            data: encodeSongData(song),
            signature: "",
            // Prefer explicit trackNumber from tracks[], fallback to index+1
            trackNumber: trackMap.get(String(song.id)) ?? (index + 1),
            extractingPermitted: true
        }));
    } else {
        songsArray = doc.songs.map((song, index) => ({
            data: encodeSongData(song), // this is already the big JSON string you pasted
            signature: "",   // fine to leave blank for your own exports
            trackNumber: index + 1,
            extractingPermitted: true
        }));
    }
    return {
        singchronizeLibrary: {
            protocol: "1",
            message: "",
            songs: songsArray,
            // For now, no esongbooks unless you're doing a full songbook export
            esongbooks: [],
            playlists: [],
            categoryNames: "" // you can copy in real strings later if needed
        }
    };
}





function initExportDocumentPanel() {
    const panel = document.querySelector(".export-doc-panel");
    const list = panel.querySelector(".export-doc-list");
    const clearBtn = panel.querySelector(".export-doc-clear");
    const closeBtn = panel.querySelector(".export-doc-close");
    const exportBtn = panel.querySelector(".export-doc-export");
    const countSpan = panel.querySelector(".export-doc-count");

    // You’ll probably replace this with your real list of songs later
    let exportSongs = [];

    // --- rendering ---

    function renderList() {
        // Build view straight from currentDocument.songs
        exportSongs = currentDocument.songs.map((song) => ({
            id: song.id,
            title: song.infoName || song.infoNameExtractable || `Song ${song.id}` || 'No song name or ID',
            meta: song.infoCategory || "" // or duration text etc. later
        }));

        list.innerHTML = "";

        if (exportSongs.length === 0) {
            list.innerHTML = `
      <li class="export-doc-item export-doc-item--empty">
        <span>No songs in this document yet.</span>
      </li>
    `;
            countSpan.textContent = "No songs in document";
            return;
        }

        exportSongs.forEach(song => {
            const li = document.createElement("li");
            li.className = "export-doc-item";
            li.dataset.songId = song.id;

            li.innerHTML = `
      <div class="export-doc-item-info">
        <span class="export-doc-title">${song.title}</span>
        <span class="export-doc-meta">ID ${song.id} · ${song.meta}</span>
      </div>
      <button class="export-doc-remove" type="button">Remove</button>
    `;

            list.appendChild(li);
        });

        countSpan.textContent =
            exportSongs.length === 1
                ? "1 song in document"
                : `${exportSongs.length} songs in document`;
    }


    // --- events ---

    // Remove (event delegation)
    list.addEventListener("click", (e) => {
        const btn = e.target.closest(".export-doc-remove");
        if (!btn) return;

        const li = btn.closest(".export-doc-item");
        const id = li.dataset.songId;
        removeSongFromDocument(id);
        renderList();
    });

    // Clear all
    clearBtn.addEventListener("click", () => {
        clearDocument();
        renderList();
    });

    // Close panel (just hide it for now)
    closeBtn.addEventListener("click", () => {
        panel.classList.remove("is-open");
        panel.style.display = "none"; // or toggle a CSS class instead
    });

    // Export button – hook into your existing export logic later
    exportBtn.addEventListener("click", () => {
        // e.g. call exportSingchronizeDocument(exportSongs)
        exportSingchronizeDocument(currentDocument);
    });

    // Optional: expose a helper so other code can add songs to the document
    window.addSongToExportDocument = async function (song) {
        // song.id is the Singchronize song id (same as your JSON export filename)
        await addSongToDocument(song);
        renderList();
        panel.style.display = "";
        panel.classList.add("is-open");
    };

    window.exportSongbook = async function (songbook) {
        await exportSingchronizeSongbook(songbook);

    }

    // Initial render (empty)
    renderList();
}


