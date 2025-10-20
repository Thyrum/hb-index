import "./style.css";
import songsJson from "./data/songs.json";

type Song = {
  number: number;
  key: string;
  opwekking?: string;
  origin?: string;
  ccli?: string;
  ichthus_oud?: string;
  ichthus_nieuw?: string;
  themes: string[];
  bible_verses: string[];
  versions: {
    number: string;
    title: string;
    subtitle?: string;
    lyricist?: string;
    composer?: string;
    original_title?: string;
    original_author?: string;
    copyright?: string;
    language?: string;
    first_line: string;
    links?: {
      lyrics?: string;
    } & Record<string, string>;
  }[];
};

const songs = songsJson as Song[];

const list = document.getElementById("song-list") as HTMLUListElement;
for (const song of songs) {
  for (const version of song.versions) {
    const listItem = document.createElement("li");
    const numberSpan = document.createElement("span");
    numberSpan.className = "song-number";
    numberSpan.textContent = version.number;
    listItem.appendChild(numberSpan);
    const songContent = document.createElement("div");
    songContent.className = "song-content";
    songContent.innerHTML = `
		<div class="song-header">
			<span class="song-title">${version.title}</span>
				${version.subtitle ? `<br/><span class="song-subtitle"> ${version.subtitle}</span>` : ""}
		</div>
		<div class="song-artist">van ${version.lyricist}</div>
		${
      version.links
        ? `
		<div class="song-links">
			${Object.entries(version.links)
        .map(
          ([label, url]) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`,
        )
        .join(" | ")}
		</div>`
        : ""
    }
	`;
    listItem.appendChild(songContent);
    list.appendChild(listItem);
  }
}
