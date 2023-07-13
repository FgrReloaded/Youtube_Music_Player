// Code Started

console.clear()
// Getting all the elements
let searchItem = document.getElementById('searchItem');
let searchBtn = document.getElementById('searchBtn');
let cardParent = document.getElementById('cardParent');
let searchResTitle = document.getElementById('searchResTitle');
let loading = document.getElementById('loading');
let loadMore = document.getElementById('loadMore');
let data = localStorage.getItem("songs")



// Declaring the variables
let songs = {};
let player;
let nextPage;
let songUrl;
let getSongs;

// Setting up the songs dictionary
if (data) {
    songs = JSON.parse(data)
} else {
    songs = {}
}
// Initializing the API key
let apiKey = "Your Api Key";

// Initializing the player
const { Player } = window.Shikwasa

// Function to start the player
const startPlayer = (title, artist, cover, src, e) => {
    const player = new Player({
        container: () => document.querySelector('.controller'),
        audio: {
            title,
            artist,
            cover,
            src,
        },
    })
    player.on('play', () => {
        e.src = '/images/pause.png';
    })
    player.on('pause', () => {
        e.src = '/images/play.png';
    })

    return player
}

// Function to handle Play and Pause of the songs
const handlePlayPause = async (event) => {
    let currentSong;
    let playerLoading = document.getElementsByClassName('playerLoading');
    let playPauseClass = document.getElementsByClassName('playPause');

    for (let i = 0; i < playerLoading.length; i++) {
        if (event.target == playPauseClass[i]) {
            currentSong = playerLoading[i];
            break;
        }
    }

    for (let i = 0; i < playPauseClass.length; i++) {
        if (event.target != playPauseClass[i]) {
            playPauseClass[i].src = '/images/play.png';
        }
    }
    let title = event.target.getAttribute('title').split("-").join(" ");
    title = title.split("  ").join("-")
    let artist = event.target.getAttribute('artist').split("-").join(" ");
    let cover = event.target.getAttribute('cover');
    let src = event.target.getAttribute('song');

    songUrl = `https://www.youtube.com/watch?v=${src}`

    // download the song if not downloaded
    if (!songs[src]) {
        currentSong.classList.remove('hidden');
        event.target.classList.add('hidden')
        console.log("new")
        let download = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url: songUrl,
                title: title
            })
        })
        // get the file
        const blob = await download.blob();

        // create a new blob url with that file
        const blobUrl = URL.createObjectURL(blob);

        currentSong.classList.add('hidden');
        event.target.classList.remove('hidden')
        // save this blob url with its id in songs dictionary
        songs[src] = blobUrl;
        localStorage.setItem("songs", JSON.stringify(songs))
    }
    if (event.target.src.includes('play')) {
        event.target.src = '/images/pause.png';
        player = startPlayer(title, artist, cover, songs[src], event.target);
        player.play()
    } else {
        event.target.src = '/images/play.png';
        player.toggle()
    }
}

// Function to load more results
loadMore.addEventListener('click', async () => {
    nextPage = ""
    loadMore.classList.add('hidden');
    loading.classList.remove('hidden');
    let searchValue = searchItem.value;
    searchValue = searchValue.replace(/ /g, '+');
    getSongs = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&type=video&part=snippet&maxResults=10&q=${searchValue}&pageToken=${nextPage}`)
    const result = await getSongs.json();
    nextPage = result.nextPageToken;
    loading.classList.add('hidden');
    loadMore.classList.remove('hidden');
    showResult(result.items, true);
})


// Function to search the songs
searchBtn.addEventListener('click', async () => {
    loadMore.classList.add('hidden')
    searchResTitle.classList.add("hidden")
    cardParent.innerHTML = '';
    loading.classList.remove('hidden');
    let searchValue = searchItem.value;
    searchValue = searchValue.replace(/ /g, '+');
    try {
        getSongs = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&type=video&part=snippet&maxResults=10&q=${searchValue}`)
        const result = await getSongs.json();
        nextPage = result.nextPageToken;
        searchResTitle.classList.remove('hidden');
        loading.classList.add('hidden');
        loadMore.classList.remove('hidden');
        showResult(result.items);
    } catch (error) {
        console.error(error);
    }
})

// Function to show the result on the screen
const showResult = (data, nextItem) => {
    if (!nextItem) {
        cardParent.innerHTML = '';
    }
    data.forEach(element => {
        let card = `
        <div class="pt-6">
        <div class="flow-root bg-light relative rounded-lg px-4 pb-8">
            <div class="-mt-6 card">
                <div class="flex items-center justify-center">
                    <span class="p-3 rounded-md shadow-lg">
                        <img src=${element.snippet.thumbnails.medium.url}
                            width="200" height="200" alt="" />
                    </span>
                </div>
                <div class="text-center p-5 justify-center items-center">
                    <h3 class="mt-2 text-lg text-center font-medium text-primary tracking-tight">
                        ${element.snippet.title.substring(0, 40)}...
                    </h3>
                    <span class="mt-2 mb-4 max-w-xs text-sm text-secondary block">
                       ${element.snippet.channelTitle}
                    </span>
                    <img onclick='handlePlayPause(event)' title=${element.snippet.title.split(" ").join("-")} artist=${element.snippet.channelTitle.split(" ").join("-")}  cover=${element.snippet.thumbnails.default.url}  song=${element.id.videoId} class="mt-5 text-sm playPause text-active" src="/images/play.png" />
                    <div class="lds-ellipsis hidden playerLoading">
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
        `
        cardParent.innerHTML += card;
    });
}
