/* ----- audio core ----- */
const audio = new Audio();

const playerFooter = document.getElementById("audio-player");

const progressContainer = document.getElementById("progressContainer");
const progressBar       = document.getElementById("progressBar");
const currentTimeEl     = document.getElementById("currentTime");
const totalTimeEl       = document.getElementById("totalTime");

const albumArt  = document.getElementById("albumArt");
const songTitle = document.getElementById("songTitle");
const albumTitle= document.getElementById("albumTitle");

const playPauseBtn = document.getElementById("playPause");
const stopBtn = document.getElementById("stop");
const playIcon  = document.getElementById("playIcon");
const pauseIcon = document.getElementById("pauseIcon");

const dropdownToggle = document.getElementById("dropdownToggle");
const dropdownMenu   = document.getElementById("dropdownMenu");
const dropdownChevron= document.getElementById("dropdownChevron");
const versionImage   = document.getElementById("versionImage");
const versionLabel   = document.getElementById("versionLabel");

const chevron = document.getElementById("dropdownChevron");

let audioVersions = [];      // [{name, mp3, ogg}]
let currentVersionIndex = 0; // which is playing now

let currentSongId = null; // keeps track of which song is currently loaded

const download = document.getElementById("AudioBtn");


function stopPlayer() {
    audio.pause();
    audio.currentTime = 0.0000001;
    pauseIcon.classList.add("hidden");
    playIcon.classList.remove("hidden");
}

function chevron_closer(chevron) {
    if (dropdownMenu.classList.contains("visible")) {
        chevron.classList.add("fa-chevron-up");
        chevron.classList.remove("fa-chevron-down");
    } else {
        chevron.classList.add("fa-chevron-down");
        chevron.classList.remove("fa-chevron-up");
    }
};

function closeVersionDropdown() {
    dropdownMenu.classList.remove("visible");
    chevron_closer(chevron);
    dropdownToggle.classList.remove("open")
}

/* ----- helpers ----- */
function getVersionImage(name){
    const n=(name||"").toLowerCase();
    const img = document.getElementById("versionImage");

    if(n.includes("vocal")) {
        img.classList.add("vocal");
        img.classList.remove("backing");
        img.classList.remove("other");
        return "img/audio-type/vocal.png";
    } else if (n.includes("instrumental")) {
        img.classList.add("backing");
        img.classList.remove("vocal");
        img.classList.remove("other");
        return "img/audio-type/instrumental.png";
    } else {
        img.classList.add("other");
        img.classList.remove("vocal");
        img.classList.remove("backing");
        return "img/audio-type/other.png";
    }
}

function fmt(sec) { 
    if(isNaN(sec)) 
        return "0:00"; 
        const m=Math.floor(sec/60), s=Math.floor(sec%60); 
        return `${m}:${s.toString().padStart(2,"0")}`;
    }

function updateDropdownLabel(name){
    versionLabel.textContent = name || "Version";
    versionImage.src = getVersionImage(name);
    versionImage.alt = name || "Audio type";
}

/* ----- dropdown build ----- */
function buildDropdownMenu(){
    dropdownMenu.innerHTML = `
        ${audioVersions.map((v,i)=>`
            
        <button class="version-btn" data-index="${i}">
            <div class="left">
            <img class="audio-type-icon" src="${getVersionImage(v.name)}" alt="${v.name}">
            <span>${v.name}</span>
            </div>
            <i class="fa-solid fa-download download-icon" data-index="${i}" title="Download ${v.name}"></i>
        </button><hr>
        `).join("")}
        <button id="downloadAll" class="version-btn">
        <div class="left"><i class="fa-solid fa-file-zipper downloadAllZip"></i><span>Download All (ZIP)</span></div>
        </button>
    `;

    // per-version download (name: "Song (Version).mp3")
    dropdownMenu.querySelectorAll(".download-icon").forEach(icon=>{
        icon.addEventListener("click", async e=>{
            e.stopPropagation();
            const i = parseInt(icon.dataset.index,10);
            await downloadAudioVersion(i);
        });
    });

    // switch version
    dropdownMenu.querySelectorAll("button[data-index]").forEach(btn=>{
        btn.addEventListener("click", e=>{
            const i=parseInt(e.currentTarget.dataset.index,10);
            currentVersionIndex=i;
            loadAudioVersion(i, /* isSameSong = */ true);
            closeVersionDropdown()
        });
    });

    // zip all
    dropdownMenu.querySelector("#downloadAll").addEventListener("click", downloadAllAsZip);
}

/* ----- downloads ----- */
async function downloadAudioVersion(index) {
    const v = audioVersions[index];
    const cleanTitle = songTitle.textContent.trim().replace(/[\\/:*?"<>|]/g,"");
    const fileName = `${cleanTitle} (${v.name}).mp3`;
    const res = await fetch(v.mp3);
    if(!res.ok) throw new Error("Fetch failed");
    const blob = await res.blob();
    saveAs(blob,fileName);
}

async function downloadAllAsZip(){
    if(!audioVersions.length) return;
    const zip = new JSZip();
    const cleanTitle = songTitle.textContent.trim().replace(/[\\/:*?"<>|]/g,"") || "Audio";
    for(const v of audioVersions) {
        const res = await fetch(v.mp3);
        const blob = await res.blob();
        zip.file(`${cleanTitle} (${v.name}).mp3`, blob);
    }
    const out = await zip.generateAsync({type:"blob"});
    saveAs(out, `${cleanTitle} MP3s.zip`);
}



/* ----- loading & playback ----- */
function loadAudioVersion(index, isSameSong) {
    // store current playback position and state
    const currentTime = audio.currentTime;
    const wasPlaying = !audio.paused;

    const v = audioVersions[index];
    if (!v) return;

    audio.src = v.mp3;    // prefer mp3; you can swap to ogg if needed

    if (isSameSong) {
        audio.addEventListener("loadedmetadata", function resumePlayback() {
            // if song length is shorter, clamp time
            audio.currentTime = Math.min(currentTime, audio.duration || currentTime);
            if (wasPlaying) {audio.play();}
            // remove this listener so it doesn’t stack
            audio.removeEventListener("loadedmetadata", resumePlayback);
        });
    } else {
        stopPlayer();
    }

    updateDropdownLabel(v.name);
}





async function loadSong(id) {
    const res = await fetch(`./json/songs/${id}.json`);   // expects your shape
    const data = await res.json();
    const song = data.data.song;

    // map versions to local paths
    audioVersions = (song.audios || []).map(a=>({
        name: a.infoName,
        mp3: `./resources/audio/mp3/file_audio_${a.id}.mp3`,
        ogg: `./resources/audio/ogg/file_audio_${a.id}.ogg`
    }));

    // titles/art
    songTitle.textContent  = song.infoName || "Unknown Song";
    albumTitle.textContent = (song.esongbooks?.[0]?.infoName) || "";
    albumArt.src           = song.albumArt || (song.esongbooks?.[0]?.albumArt) || "img/artwork-missing.jpg";

    buildDropdownMenu();

      // 🆕 build the lyrics pages
//   buildLyrics(song, id);

    playerFooter.classList.remove("hidden");    

    currentVersionIndex = 0;
    // loadAudioVersion(currentVersionIndex);
    updateDropdownLabel(audioVersions[currentVersionIndex].name);
    loadAudioVersion(0, /* isSameSong = */ false);
    
}

/* ----- UI events ----- */
playPauseBtn.addEventListener("click", ()=>{
    if(audio.paused){ 
        audio.play();  
        playIcon.classList.add("hidden"); 
        pauseIcon.classList.remove("hidden"); 
    }
    else { 
        audio.pause(); 
        pauseIcon.classList.add("hidden"); 
        playIcon.classList.remove("hidden"); 
    }
});


stopBtn.addEventListener("click", () => {
    stopPlayer()
});


audio.addEventListener("timeupdate", ()=>{
    if(!isNaN(audio.duration)){
        progressBar.style.width = `${(audio.currentTime / audio.duration)*100}%`;
        currentTimeEl.textContent = fmt(audio.currentTime);
        totalTimeEl.textContent   = fmt(audio.duration);
    }
    // updateLyrics(audio.currentTime);
});


audio.addEventListener("ended", ()=>{
    pauseIcon.classList.add("hidden"); 
    playIcon.classList.remove("hidden");
    audio.currentTime = 0;
});

progressContainer.addEventListener("click", (e)=>{
    const rect = progressContainer.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if(!isNaN(audio.duration)) audio.currentTime = ratio * audio.duration;
});

/* dropdown open/close */
dropdownToggle.addEventListener("click", ()=>{
    dropdownMenu.classList.toggle("visible");
    chevron_closer(chevron);
    if (dropdownMenu.classList.contains("visible")) {
        dropdownToggle.classList.add("open");
    } else {
        dropdownToggle.classList.remove("open")
    }
});

document.addEventListener("click", (e)=>{
    if(!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)){
        closeVersionDropdown()
    }
});

/* ----- example: load a song by query param ?song=10 ----- */
// document.querySelectorAll(".play-btn").forEach(btn => {
//     btn.addEventListener("click", () => {
//         sondId = document.getElementById("AudioBtn")
//         loadSong(songId);
//     });
// });



document.addEventListener("click", e => {
    const btn = e.target.closest(".play-btn");
    if (!btn) return;

    const songId = btn.dataset.song;
    if (!songId) return;

    document.getElementById('addSong').setAttribute("onclick", `addSongToExportDocument(${songId});`);

    // (`onclick="addSongToExportDocument(${songId});"`)

    // show the player (if hidden)
    //   document.getElementById("audioPlayerBar").style.display = "block";

    // load and play the song
    loadSong(songId);
});


const audioDownload = document.getElementById("AudioDownloadBtn");

audioDownload.addEventListener('click', e => {
    let btn = e.target.closest(".about_dropdown");
    let id = btn.dataset.song;
    downloadAudio(id);
})


async function downloadAudio(id) {
    const res = await fetch(`./json/songs/${id}.json`);   // expects your shape
    const data = await res.json();
    const downloadSong = data.data.song;

    versionsDownload = (downloadSong.audios || []).map(a=>({
        name: a.infoName,
        mp3: `./resources/audio/mp3/file_audio_${a.id}.mp3`,
        ogg: `./resources/audio/ogg/file_audio_${a.id}.ogg`
    }));

    let downloadSongTitle = data.data.song.infoNameExtractable

    if(!versionsDownload.length) return;
    
    const zip = new JSZip();
    const cleanTitle = downloadSongTitle.trim().replace(/[\\/:*?"<>|]/g,"") || "Audio";
    for(const v of versionsDownload) {
        const res = await fetch(v.mp3);
        const blob = await res.blob();
        zip.file(`${cleanTitle} (${v.name}).mp3`, blob);
    }

    const out = await zip.generateAsync({type:"blob"});
    saveAs(out, `${cleanTitle} MP3s.zip`);
}



// -- PLAYER CLOSER -- //

const exitButton = document.getElementById("exit-button") 

exitButton.addEventListener("click", e =>{
    stopPlayer()
    playerFooter.classList.add("hidden")
});








// const pdfDownload = document.getElementById("PDFDownloadBtn");

// pdfDownload.addEventListener('click', e => {
//     let btn = e.target.closest(".about_dropdown");
//     let id = btn.dataset.song;
//     downloadPDF(id);
// })

// async function downloadPDF(id) {
//     const res = await fetch(`./json/${id}.json`);   // expects your shape
//     const data = await res.json();
//     const downloadSong = data.data.song;

//     const pdfs = [];
//     if (downloadSong.fileLyrics) pdfs.push({ name: "Lyrics", path: `./resources/pdfs/lyrics/file_lyrics_${id}.pdf` });
//     if (downloadSong.fileScore)  pdfs.push({ name: "Score",  path: `./resources/pdfs/score/file_score_${id}.pdf` });
//     if (downloadSong.fileInfo)   pdfs.push({ name: "Info", path: `./resources/pdfs/activity/file_info_${id}.pdf` });

//     let downloadSongTitle = data.data.song.infoNameExtractable;

//     const zip = new JSZip();

//     for (const pdf of pdfs) {
//         const res = await fetch(pdf.path);
//         if (res.ok) {
//             const blob = await res.blob();
//             zip.file(`${downloadSongTitle} ${pdf.name}.pdf`, blob);
//         } else {
//             console.warn(`Missing PDF: ${pdf.name}`);
//             alert(`No file found for ${downloadSongTitle} ${pdf.name}`);
//         }
//     }

//     const zipOut = await zip.generateAsync({ type: "blob" });
//     saveAs(zipOut, `${downloadSongTitle} PDFs.zip`);

// }




// if (v.mp3) {
//      
// 
// 
// }


// /* -------------------- LYRICS SYSTEM -------------------- */

// const lyricsStage = document.getElementById("lyricsStage");
// const lyricsBackdrop = document.getElementById("lyricsBackdrop");
// const lyricsContainer = document.getElementById("lyricsContainer");

// let lyricsData = null;
// let phraseTiming = [];
// let currentPageIndex = -1;

// function buildLyrics(song, songId) {
//   lyricsData = song.pages || [];
//   lyricsContainer.innerHTML = "";
//   phraseTiming = [];

//   // set background
// //   const localBackdrop = `./resources/images/file_large_${songId}.jpg`;
// //   lyricsBackdrop.style.backgroundImage = `url('${localBackdrop}')`;

//   lyricsData.forEach((page, pageIndex) => {
//     const pageDiv = document.createElement("div");
//     pageDiv.className = "lyrics-page";
//     pageDiv.dataset.pageIndex = pageIndex;

//     // styling from song JSON
//     pageDiv.style.fontFamily = song.styleBodyFont;
//     // chnage to 32 in full screen
//     pageDiv.style.fontSize = (song.styleBodySize || 30) + "px"; 
//     // 1.4
//     pageDiv.style.lineHeight = song.styleBodyLeading || 1;
//     pageDiv.style.margin = `${song.styleMarginTop}px ${song.styleMarginRight}px ${song.styleMarginBottom}px ${song.styleMarginLeft}px`;

//     (page.groups || []).forEach(group => {
//       const groupDiv = document.createElement("div");
//       groupDiv.classList.add("lyrics-group");

//       if (group.infoName?.trim()) {
//         const label = document.createElement("div");
//         label.className = "group-label";
//         label.textContent = group.infoName;
//         groupDiv.appendChild(label);
//       }

//       (group.lines || []).forEach(line => {
//         const lineDiv = document.createElement("div");
//         lineDiv.className = "lyrics-line";

//         (line.phrases || []).forEach(phrase => {
//           const span = document.createElement("span");
//           span.className = "lyrics-phrase";
//           span.innerHTML = phrase.content;
//           span.dataset.start = phrase.milliseconds / 1000;
//           span.dataset.end = phrase.hide ? phrase.hide / 1000 : null;

//           lineDiv.appendChild(span);
//           lineDiv.append(" ");

//           phraseTiming.push({
//             el: span,
//             start: phrase.milliseconds / 1000,
//             end: phrase.hide ? phrase.hide / 1000 : null,
//             pageIndex
//           });
//         });

//         groupDiv.appendChild(lineDiv);
//       });

//       pageDiv.appendChild(groupDiv);
//     });

//     lyricsContainer.appendChild(pageDiv);
//   });
// }

// function updateLyrics(time) {
//   if (!lyricsData) return;

//   // Detect current page
//   const newPageIndex = lyricsData.findIndex(
//     p => time * 1000 >= p.millisecondsStart && time * 1000 < p.millisecondsStop
//   );

//   if (newPageIndex !== currentPageIndex) {
//     currentPageIndex = newPageIndex;
//     document.querySelectorAll(".lyrics-page").forEach(p => p.classList.remove("active"));
//     const active = document.querySelector(`.lyrics-page[data-page-index="${newPageIndex}"]`);
//     if (active) active.classList.add("active");
//   }

//   // Highlight current phrase
//   phraseTiming.forEach(p => {
//     const active = time >= p.start && (!p.end || time < p.end);
//     p.el.classList.toggle("highlight", active);
//   });

  


// }


// // Allow clicking a phrase to jump to its time
// lyricsContainer.addEventListener("click", e => {
//   const phrase = e.target.closest(".lyrics-phrase");
//   if (phrase && phrase.dataset.start) {
//     audio.currentTime = parseFloat(phrase.dataset.start);
//   }
// });

// /* -------------------------------------------------------- */
