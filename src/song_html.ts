import type { Song, Version } from "./songs_data";

function detailRow(label: string, value: string | undefined): string {
  if (!value) return "";
  return `<tr><td>${label}</td><td>${value}</td></tr>`;
}

function songToDetails(song: Song, version: Version) {
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

export function songToListItem(song: Song, version: Version): HTMLLIElement {
  const listItem = document.createElement("li");
  listItem.className = "song-item";
  listItem.id = `song-${version.number}`;
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
		${songToDetails(song, version)}
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
  return listItem;
}

export function createGroup(
  name: string,
  children: HTMLLIElement[],
): HTMLLIElement {
  const element = document.createElement("li");
  element.textContent = name;
  const list = document.createElement("ul");
  for (const child of children) {
    list.appendChild(child);
  }
  element.appendChild(list);
  return element;
}
