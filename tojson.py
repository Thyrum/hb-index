#!/usr/bin/env python3

import untangle
import sys
import re
import string
import json


bible_sort_dict = {
    "Genesis": 0,
    "Exodus": 1,
    "Leviticus": 2,
    "Numeri": 3,
    "Deuteronomium": 4,
    "Jozua": 5,
    "Richteren": 6,
    "Ruth": 7,
    "1 Samuël": 8,
    "2 Samuël": 9,
    "1 Koningen": 10,
    "2 Koningen": 11,
    "1 Kronieken": 12,
    "2 Kronieken": 13,
    "Ezra": 14,
    "Nehemia": 15,
    "Esther": 16,
    "Job": 17,
    "Psalm": 18,
    "Spreuken": 19,
    "Prediker": 20,
    "Hooglied": 21,
    "Jesaja": 22,
    "Jeremia": 23,
    "Klaagliederen": 24,
    "Ezechiël": 25,
    "Daniël": 26,
    "Hosea": 27,
    "Joël": 28,
    "Amos": 29,
    "Obadja": 30,
    "Jona": 31,
    "Micha": 32,
    "Nahum": 33,
    "Habakuk": 34,
    "Sefanja": 35,
    "Haggaï": 36,
    "Zacharia": 37,
    "Maleachi": 38,
    "Matteüs": 39,
    "Mattheüs": 39,
    "Markus": 40,
    "Marcus": 40,
    "Lucas": 41,
    "Johannes": 42,
    "Handelingen": 43,
    "Romeinen": 44,
    "1 Korinthiërs": 45,
    "1 Korintiërs": 45,
    "2 Korinthiërs": 46,
    "2 Korintiërs": 46,
    "Galaten": 47,
    "Efeziërs": 48,
    "Filippenzen": 49,
    "Kolossenzen": 50,
    "1 Tessalonicenzen": 51,
    "2 Tessalonicenzen": 52,
    "1 Timotheüs": 53,
    "1 Timoteüs": 53,
    "2 Timotheüs": 54,
    "2 Timoteüs": 54,
    "Titus": 55,
    "Filemon": 56,
    "Hebreeën": 57,
    "Jakobus": 58,
    "1 Petrus": 59,
    "2 Petrus": 60,
    "1 Johannes": 61,
    "2 Johannes": 62,
    "3 Johannes": 63,
    "Judas": 64,
    "Openbaring": 65,
}

def bibleverseToKey(verse):
    match = re.match(r"(\d* ?[^\s:]+) (\d*)(?::|$)(\d*)-?(\d*)", verse)
    book = match.group(1)
    chapter = int('0'+match.group(2))
    startVerse = int('0'+match.group(3))
    endVerse = int('0'+match.group(4))

    total = 0
    total += bible_sort_dict[book] * 1000000000
    total += chapter * 1000000
    total += startVerse * 1000
    total += endVerse
    return total

def versionToDict(xml_version, removeContent = True):
    result = {
        "title": xml_version.Info.Titel.cdata,
        "subtitle": xml_version.Info.SubTitel.cdata,
        "lyricist": xml_version.Info.TekstAuteur.cdata,
        "composer": xml_version.Info.MuziekComponist.cdata,
        "original_title": xml_version.Info.OorspronkelijkeTitel.cdata,
        "original_author": xml_version.Info.OorspronkelijkeAuteur.cdata,
        "copyright": xml_version.Info.Copyright.cdata,
        "language": xml_version.Taal.cdata,
    }
    # Remove empty strings from result
    for key in list(result.keys()):
        if result[key] == '':
            del result[key]
    # find the first text line
    content = xml_version.ChordPro.cdata.splitlines()
    i=0
    while len(content[i]) == 0 or (content[i][0] == '{' and content[i][-1] == '}'):
        i += 1
    first_line = content[i]

    # Remove any leftover tags
    first_line = re.sub(r'{.*?}', '', first_line)
    # Remove all chords, not including surrounding whitespace
    first_line = re.sub(r'\[.*?\]', '', first_line)
    # Remove all `-` surrounded by at least one space
    first_line = re.sub(r'\s+-\s*|\s*=\s+', '', first_line)
    # Reduce any whitespace to a single space
    first_line = re.sub(r'[^\S\r\n]+', r' ', first_line)

    result['first_line'] = first_line.strip(string.punctuation+string.whitespace)

    if not removeContent:
        result['content'] = xml_version.ChordPro.cdata + '\n'
    return result

def songToDict(xml_song, removeContent = True):
    result = {
        "number": int(xml_song.LiedNummer.cdata),
        "key": xml_song.Toonsoort.cdata,
        "opwekking": xml_song.AlgemeneInfo.HerkomstInfo.Opwekking.cdata,
        "origin": xml_song.AlgemeneInfo.HerkomstInfo.Herkomst.cdata,
        "ccli": xml_song.AlgemeneInfo.CCLI.cdata,
        "ichthus_oud": xml_song.AlgemeneInfo.HerkomstInfo.IchthusOud.cdata,
        "ichthus_nieuw": xml_song.AlgemeneInfo.HerkomstInfo.IchthusNieuw.cdata,
        "themes": xml_song.AlgemeneInfo.Themas.cdata.split(", "),
        "bible_verses": xml_song.AlgemeneInfo.Bijbelteksten.cdata.split(", "),
    }
    # Remove empty strings from result
    for key in list(result.keys()):
        if result[key] == '':
            del result[key]

    if result["themes"] == [""]:
        result["themes"] = []
    if result["bible_verses"] == [""]:
        result["bible_verses"] = []
    result["versions"] = [versionToDict(version) for version in xml_song.TaalVersie];
    if len(result["versions"]) == 1:
        result["versions"][0]["number"] = str(result["number"])
    else:
        for index, version in enumerate(result["versions"]):
            version["number"] = str(result["number"]) + chr(ord('A')+index)
    return result

def songsToDict(xml_songs, removeContent = True):
    return [songToDict(xml_song) for xml_song in xml_songs.Bundel.BundelSong]


class Song:
    """
    Initialize song using a python object reflecting the `xml` object.
    The python object should be obtained using `untangle.parse`
    """

    def __init__(self, xml_song):

        self.versions = {}

def tupleSort(item1, item2):
    if item1[0] < item2[0] or (item1[0] == item2[0] and item1[1] < item2[1]):
        return -1
    elif item1 != item2:
        return 1
    else:
        return 0

def stripped(input):
    return input.lower().translate(str.maketrans('', '', string.punctuation)).strip()

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Please call using')
        print(sys.argv[0], '<xml-file>')
        exit()

    obj = untangle.parse(sys.argv[1])
    songsDict = songsToDict(obj)
    print(json.dumps(songsDict, ensure_ascii=False))
