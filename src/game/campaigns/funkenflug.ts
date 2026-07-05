import type { Campaign } from '../types'

/**
 * Heldengeschichte 1860: Funken aus dem Schlot der Abendlok setzen den
 * Kornspeicher am Bahnhof in Brand — und der Wind steht zur Stadt. Eimer
 * allein reichen nicht; es braucht die alte Feuerspritze aus der Mühle,
 * einen geflickten Schlauch und einen kühlen Kopf.
 *
 * Struktur:
 *   intro → { markt, allein }        allein → { markt, ende-brand }
 *   markt → { muehle, kette }        kette → { muehle, ende-brand }
 *   muehle → { einsatz, platzt }     platzt → { einsatz, ende-brand }
 *   einsatz → { ende-held, ende-brand }
 */
export const funkenflug: Campaign = {
  id: 'funkenflug',
  title: 'Funkenflug',
  genre: 'helden',
  start: 'f-intro',
  nodes: {
    'f-intro': {
      id: 'f-intro',
      scene: 'bahnhof',
      text: {
        default:
          'Eberswalde, 1860. Die Abendlok stampft aus dem Bahnhof, und ihr Schlot spuckt eine Garbe glühender Funken in den Wind. Einer davon bleibt im Schindeldach des alten Kornspeichers hängen. Erst glimmt es nur — dann leckt eine erste Flamme ins Dunkel. Der Wind steht zur Stadt, {name}. Und außer dir hat es noch niemand gesehen.',
      },
      speech: {
        default: 'Das Dach! Es brennt — und der Wind dreht zur Stadt!',
      },
      options: [
        { label: 'Zum Markt rennen und Alarm schlagen', target: 'f-markt' },
        { label: 'Sofort allein mit dem Eimer löschen', target: 'f-allein' },
      ],
    },

    'f-allein': {
      id: 'f-allein',
      scene: 'bahnhof',
      text: {
        default:
          'Du reißt den Eimer vom Brunnenhaken und schleuderst Wasser aufs Dach — ein Zischen, mehr nicht. Für jeden gelöschten Funken tanzen zwei neue über die Schindeln. Die Flamme frisst sich am First entlang, und deine Arme brennen schon jetzt. Allein hältst du das keine Viertelstunde.',
        byCharacter: {
          lotte:
            'Du reißt den Eimer vom Brunnenhaken und rennst, so schnell nur du rennen kannst — doch selbst dir läuft das Feuer davon. Für jeden gelöschten Funken tanzen zwei neue über die Schindeln. Die Flamme frisst sich am First entlang. Allein hältst du das keine Viertelstunde.',
        },
      },
      speech: {
        default: 'Ein Eimer gegen ein Dach — das wird nichts.',
      },
      options: [
        { label: 'Zum Markt — es braucht viele Hände', target: 'f-markt' },
        { label: 'Stur weiterschöpfen', target: 'f-ende-brand' },
      ],
    },

    'f-markt': {
      id: 'f-markt',
      scene: 'marktplatz',
      text: {
        default:
          '"Feuer! Feuer am Speicher!" Dein Ruf hallt über den Markt, Läden schlagen auf, Stiefel poltern. Der alte Müller packt dich am Ärmel: "Eimer haben wir genug — aber gegen ein Dach hilft nur Druck. In meiner Mühle steht die alte Handdruckspritze der Stadt!" Er hebt den Finger. "Nur ihr Schlauch, der ist seit Jahren brüchig."',
      },
      options: [
        { label: 'Die Spritze aus der Mühle holen', target: 'f-muehle' },
        { label: 'Erst eine Eimerkette zum Kanal stellen', target: 'f-kette' },
      ],
    },

    'f-kette': {
      id: 'f-kette',
      scene: 'kanal',
      text: {
        default:
          'Vom Kanal bis zum Speicher steht nun Hand an Hand die Kette, Eimer fliegen von Arm zu Arm. Doch bis das Wasser vorn ankommt, ist die halbe Ladung verschwappt — und der Wind trägt die Funken höher, als je ein Eimer reicht. Vom Ende der Kette ruft der Müller: "Die Spritze, {name}! Ohne Druck verlieren wir das Dach!"',
      },
      options: [
        { label: 'Zur Mühle — die Spritze holen', target: 'f-muehle' },
        { label: 'Weiter schöpfen und hoffen', target: 'f-ende-brand' },
      ],
    },

    'f-muehle': {
      id: 'f-muehle',
      scene: 'muehle',
      text: {
        default:
          'In der Mühle, unter Mehlsäcken und Plane: die alte Handdruckspritze, Messing stumpf, aber der Kolben läuft. Nur der Lederschlauch ist rissig wie altes Brot. Der Müller wirft dir einen Topf zu: "Pech vom Dachdecker. Und dort das Segeltuch. Damit hält der Schlauch — wenn du dir die Zeit nimmst, ihn zu wickeln."',
      },
      speech: {
        default: 'Pech und Segeltuch … das kann halten!',
        byCharacter: {
          wilhelm: 'Ruhige Hände braucht das jetzt. Die habe ich.',
        },
      },
      options: [
        { label: 'Den Schlauch sorgfältig flicken', target: 'f-einsatz' },
        { label: 'Keine Zeit! Sofort losfahren', target: 'f-platzt' },
      ],
    },

    'f-platzt': {
      id: 'f-platzt',
      scene: 'bahnhof',
      text: {
        default:
          'Ihr rollt die Spritze an den Speicher, die Kette füllt den Kessel, vier Mann werfen sich auf die Schwengel — und beim ersten vollen Druck platzt der brüchige Schlauch mit einem nassen Knall. Wasser klatscht ins Pflaster statt in die Flammen. Der Müller flucht. Neben dir liegen noch immer Pech und Segeltuch im Karren.',
      },
      options: [
        { label: 'Jetzt flicken — richtig und mit Ruhe', target: 'f-einsatz' },
        { label: 'Aufgeben und nur noch mit Eimern retten', target: 'f-ende-brand' },
      ],
    },

    'f-einsatz': {
      id: 'f-einsatz',
      scene: 'bahnhof',
      text: {
        default:
          'Der geflickte Schlauch hält. Die Kette füllt den Kessel, die Schwengel gehen auf und nieder, und endlich springt ein harter Wasserstrahl übers Dach. Der Müller schreit gegen das Feuer an: "Wohin zuerst, {name}? Sag es — du hast es kommen sehen!" Der Wind treibt die Funkengarbe genau auf die Dächer der Nachbarhäuser zu.',
      },
      options: [
        { label: 'Zuerst die Nachbardächer nass halten', target: 'f-ende-held' },
        { label: 'Alles Wasser mitten in die Flammen', target: 'f-ende-brand' },
      ],
    },

    'f-ende-held': {
      id: 'f-ende-held',
      scene: 'bahnhof',
      text: {
        default:
          'Ihr wässert die Dächer im Windschatten, und die Funken verlöschen zischend auf nassen Schindeln, ehe sie fassen können. Eingekreist von tropfnassem Holz frisst sich das Feuer am Speicher fest — und verhungert dort. Als der Morgen graut, raucht nur noch ein schwarzer Dachstuhl, doch die Stadt steht. Der Müller drückt dir die rußige Hand: "Nicht das Feuer gelöscht, sondern der Stadt den Weg verstellt. So macht das ein kluger Kopf, {name}."',
      },
      ending: 'success',
    },

    'f-ende-brand': {
      id: 'f-ende-brand',
      scene: 'bahnhof',
      text: {
        default:
          'Es reicht nicht. Der Wind hebt eine Garbe Funken über eure Köpfe hinweg auf das nächste Dach, dann auf das übernächste. Die Nacht wird hell und heiß, und ihr rettet, was zu tragen ist — Menschen, Vieh, Bündel. Am Morgen zieht sich eine schwarze Narbe vom Bahnhof bis an den Markt. Eberswalde wird sie noch lange sehen. Und du auch.',
      },
      ending: 'failure',
    },
  },
}
