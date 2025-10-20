import "./style.css";
import songsJson from "./data/songs.json";

type Song = {
  number: string;
  title: string;
  subtitle?: string;
  artist: string;
  key: string;
  links: {
    lyrics?: string;
  } & Record<string, string>;
};

const songs = songsJson as Song[];

const list = document.getElementById("songList") as HTMLUListElement;
for (const song of songs) {
  const listItem = document.createElement("li");
  listItem.className = "song-item";
  listItem.style = `--number: "${song.number}";`;
  listItem.innerHTML = `
		<div class="song-header">
		  <span class="song-title">
				${song.title}
				${song.subtitle ? `<span class="song-subtitle"> (${song.subtitle})</span>` : ""}
			</span>
			<div class="song-key-div"><span class="song-key">Key: ${song.key}</span></div>
		</div>
		<div class="song-artist">by ${song.artist}</div>
		<div class="song-links">
			${Object.entries(song.links)
        .map(
          ([label, url]) =>
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`,
        )
        .join(" | ")}
		</div>
	`;
  list.appendChild(listItem);
}
