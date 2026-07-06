import type { Campaign } from '../types'

/**
 * Heldengeschichte 1960: Klirrender Frostwinter — der Kohlenkahn für Schule
 * und Kindergarten friert hundert Meter vor der Entladestelle im Finowkanal
 * fest. Das Eis ist zu dick zum Brechen und zu dünn für schweres Gerät.
 * Die Lösung: Last verteilen statt Gewalt.
 *
 * Struktur:
 *   intro → { hacken, fabrik, markt }   hacken → { fabrik, ende-frost }
 *   fabrik → { muehle, markt }          markt → { muehle, einbruch }
 *   muehle → { umladen, markt }         einbruch → { muehle, ende-frost }
 *   umladen → { ende-held, ende-eis }
 */
export const eisfahrt: Campaign = {
  id: 'eisfahrt',
  title: 'Kohle auf dem Eis',
  genre: 'helden',
  start: 'e-intro',
  nodes: {
    'e-intro': {
      id: 'e-intro',
      cast: ['schiffer'],
      scene: 'kanal',
      text: {
        default:
          'Eberswalde, 1960, der kälteste Winter seit Jahren. Der Finowkanal liegt starr unter grauem Eis — und mittendrin, hundert Meter vor der Entladestelle, steckt der Kohlenkahn fest. Seine Ladung soll Schule und Kindergarten heizen, doch die Öfen dort sind schon heute Morgen kalt geblieben. Der Schiffer steht ratlos an der Reling. Alle Augen gehen zu dir, {name}.',
      },
      speech: {
        default: 'Die Kohle ist zum Greifen nah. Und doch nicht.',
      },
      options: [
        { label: 'Mit Hacken eine Fahrrinne schlagen', target: 'e-hacken' },
        { label: 'Im Kranwerk um Rat fragen', target: 'e-fabrik' },
        { label: 'Auf dem Markt Leute zusammentrommeln', target: 'e-markt' },
      ],
    },

    'e-hacken': {
      id: 'e-hacken',
      cast: ['schiffer'],
      scene: 'kanal',
      text: {
        default:
          'Ihr schlagt zu, dass die Splitter fliegen — doch das Eis ist eine Handbreit dick, und nach einer Stunde habt ihr kaum zehn Meter geschafft. Dann kracht es: Neben dem Kahn bricht ein Mann bis zur Hüfte ein und wird fluchend herausgezogen. So geht es nicht weiter — zu langsam, zu gefährlich, zu kalt.',
      },
      speech: {
        default: 'Gegen dieses Eis gewinnt keine Hacke.',
      },
      options: [
        { label: 'Im Kranwerk um Rat fragen', target: 'e-fabrik' },
        { label: 'Verbissen weiterhacken', target: 'e-ende-frost' },
      ],
    },

    'e-fabrik': {
      id: 'e-fabrik',
      scene: 'fabrik',
      text: {
        default:
          'Der Brigadier hört zu und wischt sich die Hände am Lappen ab. "Brechen? Vergiss es. Und unser Autokran wiegt zwölf Tonnen — der bricht euch ein, ehe er am Ufer steht." Er tippt dir an die Brust. "Aber Eis trägt, wenn man die Last verteilt. Bohlen als Laufstege, viele kleine Fuhren mit Schlitten. Holz hat die alte Mühle, Schlitten hat halb Eberswalde."',
      },
      speech: {
        default: 'Die Last verteilen — nicht das Eis besiegen!',
      },
      options: [
        { label: 'Bohlen aus der Mühle holen', target: 'e-muehle' },
        { label: 'Am Markt die Schlittenkette sammeln', target: 'e-markt' },
      ],
    },

    'e-markt': {
      id: 'e-markt',
      scene: 'marktplatz',
      text: {
        default:
          'Es spricht sich schneller herum als jede Durchsage: Die Schule friert. Binnen einer halben Stunde stehen sie auf dem Markt — Rentner mit Rodelschlitten, Kinder mit Handwagen, die Kioskfrau mit Thermoskannen. Eine ganze Schlittenkette wartet auf das Kommando. Nur: Aufs blanke Eis darf sich damit noch niemand wagen.',
      },
      options: [
        { label: 'Erst Bohlen aus der Mühle holen', target: 'e-muehle' },
        { label: 'Ohne Laufstege aufs Eis — es wird schon halten', target: 'e-einbruch' },
      ],
    },

    'e-einbruch': {
      id: 'e-einbruch',
      scene: 'kanal',
      text: {
        default:
          'Der erste Schlitten rollt an — und keine zwanzig Meter weit. Mit einem Knall wie ein Peitschenhieb reißt das Eis, der Schlitten kippt, ein Junge rutscht ins schwarze Wasser und wird im letzten Moment an der Jacke gepackt. Zitternd und triefend sitzt er am Ufer. Das war die Warnung. Eine zweite gibt das Eis nicht.',
      },
      speech: {
        default: 'Nie wieder ohne Stege. Nie wieder.',
      },
      options: [
        { label: 'Jetzt doch: Bohlen aus der Mühle', target: 'e-muehle' },
        { label: 'Abbrechen — zu gefährlich', target: 'e-ende-frost' },
      ],
    },

    'e-muehle': {
      id: 'e-muehle',
      scene: 'muehle',
      text: {
        default:
          'Der Müller versteht sofort und stemmt schon das Tor auf: Im Gebälk lagern Bohlen, breit und trocken, dazu Seile und zwei Leitern. "Nehmt alles", sagt er nur. "Und legt die Stege doppelt, wo der Kahn liegt — dort drückt die Last am meisten." Arm um Arm wandern die Bretter auf die Schultern der Träger.',
      },
      options: [
        { label: 'Zum Kanal — Stege legen und umladen', target: 'e-umladen' },
        { label: 'Erst noch die Schlittenkette vom Markt holen', target: 'e-markt' },
      ],
    },

    'e-umladen': {
      id: 'e-umladen',
      cast: ['schiffer'],
      scene: 'kanal',
      text: {
        default:
          'Die Bohlen liegen wie Schienen über dem Eis, doppelt am Kahn, und die Schlittenkette steht bereit bis hinauf zur Straße. Der Schiffer reicht den ersten Sack über die Bordwand. Jetzt liegt es an deinem Kommando, {name}: Wie fahren die Schlitten?',
      },
      options: [
        { label: 'Kleine Fuhren, mit Abstand, im Takt', target: 'e-ende-held' },
        { label: 'Voll beladen — schnell, ehe es dunkel wird', target: 'e-ende-eis' },
      ],
    },

    'e-ende-held': {
      id: 'e-ende-held',
      cast: ['schiffer', 'brigadier'],
      scene: 'kanal',
      text: {
        default:
          'Schlitten um Schlitten gleitet über die Bohlen, halb beladen, drei Meter Abstand, im ruhigen Takt deiner Zurufe. Das Eis knirscht — und trägt. Als die Laternen angehen, rollt die letzte Fuhre an Land, und noch am Abend werden die Öfen von Schule und Kindergarten angeheizt. Der Brigadier steht am Ufer und nickt dir zu: "Last verteilen. Manche lernen das nie. Du, {name}, hast es an einem Tag begriffen."',
      },
      ending: 'success',
    },

    'e-ende-eis': {
      id: 'e-ende-eis',
      scene: 'kanal',
      text: {
        default:
          'Die ersten schweren Fuhren gehen gut — dann senkt sich unter dem vierten Schlitten der Steg, Wasser quillt schwarz zwischen den Bohlen hervor, und mit einem langen Seufzer bricht die Bahn. Die Kohle des halben Kahns rutscht polternd ins Wasser, die Menschen retten sich ans Ufer. Es wird Tage dauern, neue Stege zu legen. Tage, in denen die Öfen kalt bleiben.',
      },
      ending: 'failure',
    },

    'e-ende-frost': {
      id: 'e-ende-frost',
      scene: 'kanal',
      text: {
        default:
          'Der Abend kommt, und mit ihm sinkt das Thermometer noch tiefer. Der Kahn bleibt, wo er ist — ein schwarzer Strich im weißen Eis. Am nächsten Morgen bleibt die Schule geschlossen, die Kinder frieren zu Hause, und am Kanal steht der Schiffer und wartet auf Tauwetter, das so bald nicht kommt. Manchmal verliert man nicht gegen Menschen, sondern gegen den Winter. Heute war so ein Tag.',
      },
      ending: 'failure',
    },
  },
}
