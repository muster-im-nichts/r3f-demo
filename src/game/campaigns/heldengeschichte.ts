import type { Campaign } from '../types'

/**
 * Heldengeschichte (Minimal-Kampagne): Sturmnacht am Finowkanal — das Wehr
 * klemmt, das Wasser steigt. Kreativer Lösungsweg statt roher Kraft.
 */
export const hochwasser: Campaign = {
  id: 'hochwasser',
  title: 'Die Nacht des Hochwassers',
  genre: 'helden',
  start: 'h-intro',
  nodes: {
    'h-intro': {
      id: 'h-intro',
      scene: 'kanal',
      text: {
        default:
          'Sturm über Eberswalde. Der Regen peitscht, und der Finowkanal steigt Handbreit um Handbreit. Am Wehr heult das Wasser — die Tore klemmen, und wenn sie nicht bald öffnen, steht bis zum Morgen die halbe Innenstadt unter Wasser. Außer dir, {name}, ist niemand wach.',
      },
      speech: {
        default: 'Das Wasser wartet auf niemanden.',
      },
      options: [
        { label: 'Sofort zum Wehr laufen', target: 'h-wehr' },
        { label: 'Erst auf dem Markt Leute wecken', target: 'h-markt' },
      ],
    },

    'h-wehr': {
      id: 'h-wehr',
      scene: 'kanal',
      text: {
        default:
          'Am Wehr das Unglück: Die eiserne Kurbel, mit der man die Tore hebt, ist glatt abgebrochen. Der Stumpf ist zu kurz zum Greifen, das Tor zu schwer für zwei Hände. Gegenüber, am dunklen Ufer, ragt die alte Mühle auf — dort gibt es Werkzeug, Balken, Flaschenzüge.',
      },
      options: [
        { label: 'Zur Mühle — Werkzeug holen', target: 'h-muehle' },
        { label: 'Es mit bloßen Händen versuchen', target: 'h-kraft' },
      ],
    },

    'h-markt': {
      id: 'h-markt',
      scene: 'marktplatz',
      text: {
        default:
          'Du trommelst gegen Fensterläden. Verschlafene Gesichter erscheinen, jemand flucht über die Uhrzeit — aber als das Wort "Hochwasser" fällt, kommen sie doch heraus. Der alte Müller stapft heran und knurrt: "Reden hilft nichts. Was brauchst du: Hände oder Werkzeug?"',
      },
      options: [
        { label: '"Werkzeug! Zur Mühle!"', target: 'h-muehle' },
        { label: 'Allein zurück zum Wehr rennen', target: 'h-wehr' },
      ],
    },

    'h-muehle': {
      id: 'h-muehle',
      scene: 'muehle',
      text: {
        default:
          'In der Mühle riecht es nach Mehl und altem Holz. Zwischen Balken und Säcken findest du, was du brauchst: eine lange Hebestange — und, unter einer Plane, einen schweren Flaschenzug samt Tauwerk. Der Müller nickt: "Der Flaschenzug hebt dir das Tor, wenn du ihn richtig ansetzt. Die Stange allein … das wird ein Kampf."',
      },
      options: [
        { label: 'Den Flaschenzug zum Wehr schleppen', target: 'h-plan' },
        { label: 'Nur die Stange nehmen und hebeln', target: 'h-kraft' },
      ],
    },

    'h-kraft': {
      id: 'h-kraft',
      scene: 'kanal',
      text: {
        default:
          'Du stemmst dich mit aller Kraft gegen das Tor. Es knirscht, hebt sich einen Fingerbreit — und schlägt zurück. Der Schmerz fährt dir durch die Hände, und das Wasser leckt schon über die Uferkante. Rohe Kraft allein reicht hier nicht. Vom Ufer ruft der Müllerjunge: "Soll ich den Flaschenzug holen?!"',
      },
      speech: {
        default: 'Mit dem Kopf, nicht mit den Knochen!',
      },
      options: [
        { label: '"Ja! Lauf, so schnell du kannst!"', target: 'h-plan' },
        { label: 'Aufgeben und die Unterstadt warnen', target: 'h-ende-flut' },
      ],
    },

    'h-plan': {
      id: 'h-plan',
      scene: 'kanal',
      text: {
        default:
          'Ihr schlagt den Flaschenzug in den Querbalken über dem Wehr, das Tau knarrt, Hände greifen ineinander. "Und — zieht!" Zentimeter um Zentimeter hebt sich das Tor. Darunter drängt das Wasser wie ein lebendiges Tier. Jetzt bloß die Nerven behalten.',
      },
      options: [
        { label: 'Das Tor langsam und gleichmäßig öffnen', target: 'h-ende-held' },
        { label: 'Alles auf einmal hochreißen', target: 'h-ende-flut' },
      ],
    },

    'h-ende-held': {
      id: 'h-ende-held',
      scene: 'kanal',
      text: {
        default:
          'Das Wasser schießt gurgelnd durch das offene Wehr und verliert sich flussabwärts in der Nacht. Der Pegel sinkt, Zentimeter um Zentimeter, und mit dem ersten Morgengrau steht fest: Die Stadt ist trocken geblieben. Der Müller legt dir die Hand auf die Schulter: "Nicht die stärksten Arme haben die Stadt gerettet, {name}. Der klügste Kopf war es."',
      },
      ending: 'success',
    },

    'h-ende-flut': {
      id: 'h-ende-flut',
      scene: 'kanal',
      text: {
        default:
          'Es reicht nicht. Mit einem dumpfen Grollen tritt der Kanal über die Ufer, und das Wasser wälzt sich durch die Gassen der Unterstadt. Ihr rettet, was zu retten ist — Menschen, Vieh, ein paar Möbel. Am Morgen glitzert die Innenstadt wie ein trüber See. Eberswalde wird diese Nacht nicht vergessen. Und du auch nicht.',
      },
      ending: 'failure',
    },
  },
}
