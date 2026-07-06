import type { Campaign } from '../types'

/**
 * Krimi 1860: Die Lohnkasse der Eisenbahngesellschaft verschwindet aus dem
 * Nachtzug von Berlin — am Zahltag der Streckenarbeiter. Der Kohlenstaub
 * verrät am Ende mehr als jeder Zeuge.
 *
 * Struktur:
 *   intro → { schaffner, spur, wache }
 *   schaffner → { gasse, wache }     spur → { gasse, wache }
 *   wache → { gasse, schaffner }     gasse → { lager, verstaerkung, ende-blamiert }
 *   verstaerkung → { zugriff, lager }
 *   lager → { ende-entwischt, zugriff }
 *   zugriff → { ende-erfolg, ende-beweis }
 */
export const nachtzug: Campaign = {
  id: 'nachtzug',
  title: 'Die Lohnkasse aus dem Nachtzug',
  genre: 'krimi',
  start: 'n-intro',
  nodes: {
    'n-intro': {
      id: 'n-intro',
      scene: 'bahnhof',
      text: {
        default:
          'Eberswalde, 1860. Zischend kommt der Nachtzug aus Berlin zum Stehen, Dampf wabert über den Bahnsteig. Dann der Aufschrei aus dem Packwagen: Die eiserne Lohnkasse der Eisenbahngesellschaft ist fort — und morgen ist Zahltag für hundert Streckenarbeiter! Du, {name}, stehst als Erste von allen am offenen Wagen.',
        byCharacter: {
          wilhelm:
            'Eberswalde, 1860. Zischend kommt der Nachtzug aus Berlin zum Stehen, Dampf wabert über den Bahnsteig. Dann der Aufschrei aus dem Packwagen: Die eiserne Lohnkasse der Eisenbahngesellschaft ist fort — und morgen ist Zahltag für hundert Streckenarbeiter! Du, {name}, stehst als Erster von allen am offenen Wagen.',
        },
      },
      options: [
        { label: 'Den Schaffner befragen', target: 'n-schaffner' },
        { label: 'Den Bahnsteig absuchen', target: 'n-spur' },
        { label: 'Zur Wachstube laufen', target: 'n-wache' },
      ],
    },

    'n-schaffner': {
      id: 'n-schaffner',
      scene: 'bahnhof',
      text: {
        default: 'Der Schaffner dreht seine Mütze in den Händen.',
      },
      dialog: [
        {
          by: 'schaffner',
          line: {
            default:
              'Bei der Ausfahrt in Bernau war die Kasse noch da, ich schwöre es! Nur der Heizer war zwischendurch hinten im Packwagen — Kohlen holen, sagte er.',
          },
        },
        { by: 'narrator', line: { default: 'Er stockt.' } },
        {
          by: 'schaffner',
          line: {
            default:
              'Und eben, beim Halt … da ist ein Mann mit einer schweren Reisetasche Richtung Fischergasse davon. Gebückt lief er, wie unter Eisenlast.',
          },
        },
      ],
      options: [
        { label: 'Dem Mann in die Gasse folgen', target: 'n-gasse' },
        { label: 'Erst die Wache verständigen', target: 'n-wache' },
      ],
    },

    'n-spur': {
      id: 'n-spur',
      scene: 'bahnhof',
      text: {
        default:
          'Du gehst den Bahnsteig ab, Laterne in der Hand. Da: schwarze Fußabdrücke, fein wie Ruß — Kohlenstaub, wie ihn nur einer an den Stiefeln hat, der im Tender arbeitet. Die Spur führt vom Packwagen zur Sperre. Daneben liegt ein zerknüllter Handschuh, schwarz verschmiert. Wer immer die Kasse trug, kam vom Führerstand.',
      },
      options: [
        { label: 'Der Spur in die Stadt folgen', target: 'n-gasse' },
        { label: 'Den Fund der Wache melden', target: 'n-wache' },
      ],
    },

    'n-wache': {
      id: 'n-wache',
      cast: ['wachtmeister'],
      scene: 'wachstube',
      text: {
        default: 'In der Wachstube gähnt der Wachtmeister hinter seinem Pult.',
      },
      dialog: [
        {
          by: 'wachtmeister',
          line: { default: 'Die Eisenbahn und ihre Kassen — das ist Sache der Gesellschaft, nicht meine.' },
        },
        { by: 'narrator', line: { default: 'Er beugt sich vor.' } },
        {
          by: 'wachtmeister',
          line: {
            default:
              'Aber bring mir den Dieb samt Beute, dann sperre ich ihn ein. Vorher rühre ich keinen Stiefel. Verdächtigungen hatte ich diese Woche schon genug.',
          },
        },
      ],
      options: [
        { label: 'Allein in die Fischergasse', target: 'n-gasse' },
        { label: 'Den Schaffner ins Verhör nehmen', target: 'n-schaffner' },
      ],
    },

    'n-gasse': {
      id: 'n-gasse',
      scene: 'gasse',
      text: {
        default: 'In der Fischergasse hockt die Krähe auf einer Kiste und schnitzt an einem Span.',
      },
      dialog: [
        {
          by: 'kraehe',
          line: { default: 'Einen gebückten Mann suchst du? Mit schwarzer Tasche und schwarzen Händen?' },
        },
        {
          by: 'narrator',
          line: { default: 'Sie grinst schief und streckt die Hand aus — erst eine Münze, dann Worte.' },
        },
        {
          by: 'kraehe',
          line: {
            default:
              'Ins alte Lagerhaus am Wasser ist er. Vor kaum einer Viertelstunde. Und er hat zweimal über die Schulter geschaut.',
          },
        },
      ],
      options: [
        { label: 'Allein zum Lagerhaus schleichen', target: 'n-lager' },
        { label: 'Den Wachtmeister als Verstärkung holen', target: 'n-verstaerkung' },
        { label: 'Die Krähe als Diebin beschuldigen', target: 'n-ende-blamiert' },
      ],
    },

    'n-verstaerkung': {
      id: 'n-verstaerkung',
      cast: ['wachtmeister'],
      scene: 'wachstube',
      text: {
        default: 'Der Wachtmeister schnallt sich den Säbel um, plötzlich hellwach.',
      },
      dialog: [
        {
          by: 'wachtmeister',
          line: { default: 'Das Lagerhaus, sagst du? Und Kohlenstaub-Spuren? Der Heizer also. Gut kombiniert.' },
        },
        { by: 'narrator', line: { default: 'Er nimmt die Laterne vom Haken.' } },
        {
          by: 'wachtmeister',
          line: {
            default:
              'Aber im Lagerhaus gibt es zwei Tore. Wenn wir hineinpoltern, ist er durch das andere hinaus. Wie machen wir es?',
          },
        },
      ],
      options: [
        { label: 'Gemeinsam beide Tore besetzen', target: 'n-zugriff' },
        { label: 'Doch lieber allein vorschleichen', target: 'n-lager' },
      ],
    },

    'n-lager': {
      id: 'n-lager',
      cast: ['heizer'],
      scene: 'finale',
      text: {
        default:
          'Im Lagerhaus brennt eine einzelne Kerze. Zwischen Kisten kniet der Heizer und wuchtet die Lohnkasse in ein Fass — die Hände schwarz bis zu den Ellenbogen. Noch hat er dich nicht bemerkt. Die Kasse ist schwer, das Fass fast verschlossen. Ein falscher Laut, und er ist gewarnt.',
      },
      options: [
        { label: 'Ihn laut zur Rede stellen', target: 'n-ende-entwischt' },
        { label: 'Leise das Tor verkeilen, dann die Wache holen', target: 'n-zugriff' },
      ],
    },

    'n-zugriff': {
      id: 'n-zugriff',
      cast: ['wachtmeister', 'heizer'],
      scene: 'finale',
      text: {
        default:
          'Der Wachtmeister tritt durch das große Tor, du bewachst das kleine. Der Heizer fährt herum, hebt die Hände.',
      },
      dialog: [
        { by: 'heizer', line: { default: 'Ich habe nichts! Durchsucht mich doch!' } },
        {
          by: 'narrator',
          line: {
            default:
              'Tatsächlich: Die Kasse ist nirgends zu sehen, die Fässer stehen zu Dutzenden in der Halle. Der Wachtmeister sieht dich fragend an — ohne Beute kein Beweis.',
          },
        },
      ],
      options: [
        { label: 'Das Fass mit den schwarzen Fingerspuren öffnen', target: 'n-ende-erfolg' },
        { label: 'Ihn einfach abführen lassen', target: 'n-ende-beweis' },
      ],
    },

    'n-ende-erfolg': {
      id: 'n-ende-erfolg',
      cast: ['wachtmeister', 'heizer'],
      scene: 'finale',
      text: {
        default:
          'Du gehst die Fassreihe entlang und deutest auf das eine: Auf dem hellen Holz prangen rußschwarze Handabdrücke. Der Deckel springt auf — darin die eiserne Lohnkasse. Der Heizer sackt in sich zusammen. Am Morgen bekommen hundert Streckenarbeiter ihren Lohn auf die Hand, und der Wachtmeister brummt: "Kohlenstaub lügt nicht. Gut gesehen, {name}."',
      },
      ending: 'success',
    },

    'n-ende-entwischt': {
      id: 'n-ende-entwischt',
      scene: 'finale',
      text: {
        default:
          '"Halt! Im Namen—" Weiter kommst du nicht. Der Heizer wirft die Kerze um, Dunkelheit schluckt die Halle, und während du zwischen den Kisten tastest, schlägt irgendwo das zweite Tor. Als die Wache endlich eintrifft, sind Mann und Kasse fort — nur ein Fass steht offen und leer. Am Zahltag warten hundert Arbeiter vergeblich.',
      },
      ending: 'failure',
    },

    'n-ende-beweis': {
      id: 'n-ende-beweis',
      scene: 'finale',
      text: {
        default:
          'Der Wachtmeister nimmt den Heizer mit — doch schon am nächsten Mittag ist er wieder frei: keine Kasse, kein Beweis, kein Urteil. Irgendwo zwischen hundert Fässern wartet das Lohngeld auf einen, der nachts zurückkommt. "Fast", sagt der Wachtmeister und zuckt die Achseln. Aber "fast" zahlt keinen Arbeiterlohn.',
      },
      ending: 'failure',
    },

    'n-ende-blamiert': {
      id: 'n-ende-blamiert',
      scene: 'gasse',
      text: {
        default:
          'Die Krähe springt auf, und ihre Stimme schallt durch die ganze Gasse: "Hört alle her! Da beschuldigt man Leute, die nur auf einer Kiste sitzen!" Fenster öffnen sich, Gelächter fällt auf dich herab. Als du dich endlich losgemacht hast, ist im Lagerhaus längst niemand mehr — und die Lohnkasse über alle Berge.',
      },
      ending: 'failure',
    },
  },
}
