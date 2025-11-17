import "./style.css";

import { songs, themeMap } from "./songs_data";
import { createGroup, songToListItem } from "./song_html";

const groupBySelect = document.getElementById(
  "group-by-select",
) as HTMLSelectElement;

type GroupBy = "none" | "theme" | "bible-book";

const songLists: { [key in GroupBy]: HTMLUListElement } = {
  none: document.getElementById("song-list") as HTMLUListElement,
  theme: document.getElementById("song-list-theme") as HTMLUListElement,
  "bible-book": document.getElementById(
    "song-list-bible-book",
  ) as HTMLUListElement,
};

groupBySelect.onchange = function () {
  const selectedValue = groupBySelect.value as GroupBy;
  for (const key in songLists) {
    const list = songLists[key as GroupBy];
    if (key === selectedValue) {
      list.style.display = "block";
    } else {
      list.style.display = "none";
    }
  }
};

for (const song of songs) {
  for (const version of song.versions) {
    songLists["none"].appendChild(songToListItem(song, version));
  }
}

async function loadGroupedByLists() {
  for (const { theme, numbers } of themeMap) {
    const themeSongs: HTMLLIElement[] = [];
    for (const songNumber of numbers) {
      const song = songs[songNumber - 1];
      if (song) {
        for (const version of song.versions) {
          themeSongs.push(songToListItem(song, version));
        }
      }
    }
    songLists["theme"].appendChild(createGroup(theme, themeSongs));
  }
}
void loadGroupedByLists();

function expandSongFromHash() {
  if (window.location.hash) {
    const songNumber = window.location.hash.substring(1);
    const songElement = document.getElementById(`song-${songNumber}`);
    if (songElement && !songElement.classList.contains("expanded")) {
      songElement.click();
      songElement.scrollIntoView({ behavior: "smooth" });
    }
  }
}

window.addEventListener("hashchange", expandSongFromHash);
window.onload = expandSongFromHash;

const scrollButton = document.getElementById(
  "scroll-to-top-btn",
) as HTMLButtonElement;
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

scrollButton.onclick = scrollToTop;
window.onscroll = function () {
  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    scrollButton.classList.add("show");
  } else {
    scrollButton.classList.remove("show");
  }
};
