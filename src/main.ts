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

function detailRow(label: string, value: string | undefined): string {
  if (!value) return "";
  return `<tr><td>${label}</td><td>${value}</td></tr>`;
}

function getSongDetailsTable(song: Song, version: Song["versions"][0]): string {
  let details = "<table>";
  details += detailRow("Eerste regel", version.first_line);
  details += detailRow("Toonsoort", song.key);
  details += detailRow(
    "Thema's",
    song.themes.map((item) => item.toLowerCase()).join(", "),
  );
  details += detailRow("Bijbelteksten", song.bible_verses.join(", "));
  details += detailRow("Oorspr. titel", version.original_title);
  details += detailRow("Oorspr. auteur", version.original_author);
  details += detailRow("Copyright", version.copyright);
  details += "</table>";
  return details;
}

const list = document.getElementById("song-list") as HTMLUListElement;
for (const song of songs) {
  for (const version of song.versions) {
    const listItem = document.createElement("li");
    listItem.className = "song-item";
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
		<div class="song-details">
		${getSongDetailsTable(song, version)}
		</div>
	`;
    listItem.onclick = function () {
      (this as HTMLLIElement).classList.toggle("expanded");
      const details = (this as HTMLLIElement).querySelector(
        ".song-details",
      ) as HTMLDivElement;
      if (details.style.maxHeight) {
        details.style.maxHeight = "";
      } else {
        details.style.maxHeight = details.scrollHeight + "px";
      }
    };
    listItem.appendChild(songContent);
    list.appendChild(listItem);
  }
}
