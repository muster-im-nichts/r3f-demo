import type { Campaign } from '../types'

/**
 * Krimi 1760: Die goldene Taschenuhr des Uhrmachermeisters Runge — heute ein
 * Museumsobjekt — wurde aus der Ratsvitrine gestohlen. Drei Spuren, die sich
 * kreuzen; ein Erfolgs-Ende, zwei Arten zu scheitern.
 *
 * Referenz-Kampagne für das Drehbuch-Format: Erzähltext (`text`) plus
 * `dialog`-Zeilen mit Sprechern — Sprecher betreten die Bühne auf ihr
 * Stichwort, `cast` setzt die Grundbesetzung eines Knotens.
 *
 * Struktur (Runden ≈ Tiefe):
 *   intro → { zeugin, werkstatt1, wache1 }
 *   zeugin → { gasse1, werkstatt1 }        werkstatt1 → { verdacht, hinweis }
 *   wache1 → { werkstatt1, zeugin }        verdacht → { ende-blamiert, gasse1 }
 *   hinweis → { wache2, falle }            gasse1 → { ende-entkommen, wache2, falle }
 *   wache2 → { uebergabe, falle }          falle → { coup, ende-entkommen }
 *   coup → { ende-erfolg, ende-entkommen } uebergabe → { ende-erfolg, ende-entkommen }
 */
export const taschenuhr: Campaign = {
  id: 'taschenuhr',
  title: 'Die gestohlene Taschenuhr',
  genre: 'krimi',
  start: 'intro',
  nodes: {
    intro: {
      id: 'intro',
      scene: 'marktplatz',
      text: {
        default:
          'Eberswalde, anno 1760. Im Kerzenschein des Rathauses gähnt eine leere Vitrine: Die goldene Taschenuhr des Uhrmachermeisters Runge ist fort! Auf dem Markt flackern die Fackeln, die Leute tuscheln. Du, {name}, stehst mittendrin — und irgendwer hier weiß mehr, als er sagt.',
      },
      dialog: [
        {
          by: 'runge',
          line: {
            default:
              'Meine Uhr! Vierzig Jahre habe ich sie gehütet, und nun ist sie fort! Hilf mir, {name} — du hast Augen im Kopf, ich habe nur noch Tränen darin.',
          },
        },
      ],
      options: [
        { label: 'Die alte Hanne am Marktstand befragen', target: 'zeugin' },
        { label: 'Zur Uhrmacherwerkstatt gehen', target: 'werkstatt1' },
        { label: 'Die Wache alarmieren', target: 'wache1' },
      ],
    },

    zeugin: {
      id: 'zeugin',
      scene: 'marktplatz',
      text: {
        default: 'Die alte Hanne beugt sich über ihre Körbe und senkt die Stimme.',
      },
      dialog: [
        {
          by: 'hanne',
          line: {
            default:
              'Kurz vor dem Geschrei huschte einer am Brunnen vorbei. Gesicht hab ich keins gesehen — aber ein grünes Halstuch, das hatte er. Lief Richtung Fischergasse.',
          },
        },
        {
          by: 'narrator',
          line: { default: 'Ein grünes Halstuch … das kommt dir bekannt vor.' },
        },
      ],
      options: [
        { label: 'Sofort in die Fischergasse folgen', target: 'gasse1' },
        { label: 'Ein grünes Tuch trägt doch der Uhrmacherlehrling!', target: 'werkstatt1' },
      ],
    },

    werkstatt1: {
      id: 'werkstatt1',
      scene: 'werkstatt',
      text: {
        default:
          'In der Werkstatt riecht es nach Öl und Messing. Der Lehrjunge Karl steht blass zwischen den Werkbänken und wischt sich die Hände ab, obwohl sie längst sauber sind. Am Haken neben der Tür: ein grünes Halstuch. Auf der Werkbank glänzen frische Kratzspuren — hier wurde hastig etwas aufgebrochen.',
        byCharacter: {
          wilhelm:
            'Deine eigene Werkstatt — und doch stimmt hier etwas nicht. Der Lehrjunge Karl weicht deinem Blick aus. Am Haken neben der Tür: sein grünes Halstuch. Und auf deiner Werkbank Kratzspuren, die gestern noch nicht da waren. Hier wurde hastig etwas aufgebrochen.',
        },
      },
      dialog: [
        {
          by: 'karl',
          line: {
            default: 'Ich … ich hab nichts gesehen. Wirklich nicht. Warum schaut ihr mich alle so an?',
          },
        },
      ],
      options: [
        { label: 'Karl laut zur Rede stellen', target: 'verdacht' },
        { label: 'Dich unauffällig umsehen', target: 'hinweis' },
      ],
    },

    verdacht: {
      id: 'verdacht',
      scene: 'werkstatt',
      text: {
        default: 'Du baust dich vor dem Lehrjungen auf, und deine Stimme hallt durch die Werkstatt.',
      },
      dialog: [
        { by: 'player', line: { default: 'DU warst das, Karl! Das Halstuch, die Kratzspuren — gib es zu!' } },
        {
          by: 'narrator',
          line: { default: 'Der Junge fährt zusammen, Tränen in den Augen.' },
        },
        { by: 'karl', line: { default: 'Ich hab sie nicht gestohlen! Ich schwöre!' } },
        {
          by: 'runge',
          line: {
            default: 'Was geht hier vor?! Wer meinen Lehrjungen beschuldigt, beschuldigt mich. Hinaus!',
          },
        },
        {
          by: 'narrator',
          line: {
            default:
              'Während ihr streitet, verrinnt kostbare Zeit — und wer auch immer die Uhr hat, gewinnt Vorsprung.',
          },
        },
      ],
      options: [
        { label: 'Karl trotzdem zur Wache schleppen', target: 'ende-blamiert' },
        { label: 'Dich entschuldigen und die Fischergasse absuchen', target: 'gasse1' },
      ],
    },

    hinweis: {
      id: 'hinweis',
      scene: 'werkstatt',
      text: {
        default:
          'Während Karl zur Straße starrt, gleitet dein Blick über die Werkbank. Unter einem Lappen: ein zerknüllter Zettel. "Heute nacht. Fischergasse, altes Lagerhaus. Bring es der Krähe — oder dein Meister erfährt von deinen Schulden." Karl hat die Uhr nicht gestohlen. Er wird erpresst, sie zu übergeben.',
      },
      options: [
        { label: 'Mit dem Zettel zur Wache laufen', target: 'wache2' },
        { label: 'Allein zum Treffpunkt schleichen', target: 'falle' },
      ],
    },

    wache1: {
      id: 'wache1',
      scene: 'wachstube',
      text: {
        default:
          'In der Wachstube brennt eine Talgkerze. Der Stadtwächter mustert dich unter seinem Dreispitz hervor.',
      },
      dialog: [
        {
          by: 'wache',
          line: {
            default:
              'Eine verschwundene Uhr, und weiter? Kein Täter, keine Spur, kein Beweis. Bring Er mir etwas Handfestes, dann rücken wir aus.',
          },
        },
      ],
      options: [
        { label: 'Die Uhrmacherwerkstatt durchsuchen', target: 'werkstatt1' },
        { label: 'Auf dem Markt nach Zeugen fragen', target: 'zeugin' },
      ],
    },

    gasse1: {
      id: 'gasse1',
      scene: 'gasse',
      text: {
        default:
          'Die Fischergasse liegt stockdunkel, nur eine Öllampe schaukelt im Wind. Am alten Lagerhaus lehnt eine hagere Gestalt — "die Krähe" nennen sie ihn am Kanal. Du drückst dich in einen Torbogen und hörst ihn krächzen.',
      },
      dialog: [
        {
          by: 'kraehe',
          line: {
            default: 'Heute nacht die Übergabe. Der Junge bringt das Ding — und dann ist es fort aus der Stadt.',
          },
        },
      ],
      options: [
        { label: 'Sofort aus dem Schatten springen', target: 'ende-entkommen' },
        { label: 'Leise die Wache holen', target: 'wache2' },
        { label: 'Versteckt bleiben und die Übergabe abwarten', target: 'falle' },
      ],
    },

    wache2: {
      id: 'wache2',
      scene: 'wachstube',
      text: {
        default: 'Diesmal hört der Stadtwächter genau hin, und sein Blick wird scharf.',
      },
      dialog: [
        { by: 'wache', line: { default: 'Die Krähe also. Auf den warten wir seit dem Sommer.' } },
        { by: 'narrator', line: { default: 'Er greift nach Hellebarde und Laterne.' } },
        {
          by: 'wache',
          line: {
            default:
              'Wir stellen ihm eine Falle am Lagerhaus. Aber nur, wenn Er ruhig bleibt — ein falscher Schritt, und der Vogel ist über alle Berge.',
          },
        },
      ],
      options: [
        { label: 'Gemeinsam die Falle stellen', target: 'uebergabe' },
        { label: 'Doch allein vorpreschen, bevor die Wache da ist', target: 'falle' },
      ],
    },

    falle: {
      id: 'falle',
      scene: 'finale',
      text: {
        default:
          'Mitternacht am Lagerhaus. Kaum bist du durch das Tor, fällt es hinter dir ins Schloss. Die Krähe tritt aus dem Dunkel, zwei Schatten neben ihm.',
      },
      dialog: [
        { by: 'kraehe', line: { default: 'Sieh an. Kein Botenjunge.' } },
        { by: 'narrator', line: { default: 'Er wiegt einen Knüppel in der Hand.' } },
        { by: 'kraehe', line: { default: 'Und was machen wir jetzt mit dir?' } },
      ],
      options: [
        { label: '"Karl schickt mich. Ich bin der neue Bote."', target: 'coup' },
        { label: 'Herumfahren und zur Tür rennen', target: 'ende-entkommen' },
      ],
    },

    coup: {
      id: 'coup',
      scene: 'finale',
      text: {
        default: 'Die Krähe mustert dich lange. Dann ein heiseres Lachen.',
      },
      dialog: [
        { by: 'player', line: { default: 'Karl schickt mich. Ich bin der neue Bote.' } },
        {
          by: 'kraehe',
          line: { default: 'Der Junge hat also doch Verstand — schickt jemanden mit Nerven.' },
        },
        {
          by: 'narrator',
          line: {
            default:
              'Er zieht ein Bündel aus dem Mantel und drückt es dir in die Hand. Durch das Tuch fühlst du kühles Gold: die Taschenuhr!',
          },
        },
        { by: 'kraehe', line: { default: 'Bring sie zum Kahn am Kanal. Und kein Wort.' } },
      ],
      options: [
        { label: 'Nicken, hinausgehen — und zur Wache rennen', target: 'ende-erfolg' },
        { label: 'Die Krähe jetzt auch noch festhalten', target: 'ende-entkommen' },
      ],
    },

    uebergabe: {
      id: 'uebergabe',
      scene: 'finale',
      cast: ['wache', 'karl', 'kraehe'],
      text: {
        default:
          'Mitternacht. Ihr kauert hinter den Fässern am Lagerhaus, die Wache mit gelöschter Laterne neben dir. Schritte: Karl kommt mit gesenktem Kopf, das Bündel in der Hand. Aus dem Dunkel löst sich die Krähe. Die Übergabe beginnt — dein Herz schlägt bis zum Hals.',
      },
      options: [
        { label: 'Das Signal geben, wenn die Uhr den Besitzer wechselt', target: 'ende-erfolg' },
        { label: 'Zu früh losstürmen', target: 'ende-entkommen' },
      ],
    },

    'ende-erfolg': {
      id: 'ende-erfolg',
      scene: 'finale',
      cast: ['wache', 'kraehe', 'runge'],
      text: {
        default:
          'Zugriff! Die Wache packt die Krähe am Kragen, das Bündel wechselt ein letztes Mal den Besitzer — zurück in ehrliche Hände. Meister Runge drückt die Taschenuhr an sich, und Karl ist von aller Schuld befreit: Er wurde erpresst und hat es als Erster gestanden. Auf dem Marktplatz erzählt man sich noch Jahre später, wie {name} in einer einzigen Nacht den Fall der goldenen Taschenuhr gelöst hat.',
      },
      ending: 'success',
    },

    'ende-entkommen': {
      id: 'ende-entkommen',
      scene: 'gasse',
      text: {
        default:
          'Ein Schatten, ein Sprung, das Poltern leerer Fässer — und fort. Die Krähe kennt jeden Winkel der Stadt, und als die Wache endlich mit Laternen anrückt, findet sie nur noch dich und die leere Nacht. Die goldene Taschenuhr bleibt verschwunden. Vielleicht taucht sie eines Tages wieder auf … in einer anderen Geschichte.',
      },
      ending: 'failure',
    },

    'ende-blamiert': {
      id: 'ende-blamiert',
      scene: 'wachstube',
      text: {
        default:
          'Der Wachhabende hört sich deine Anschuldigung an, sieht den schluchzenden Karl, dann dich — und lässt den Jungen laufen. "Ohne Beweise wird hier niemand eingesperrt." Während du dich rechtfertigst, verlässt irgendwo am Kanal ein Kahn die Stadt. An Bord, in ein Tuch gewickelt: eine goldene Taschenuhr. Der wahre Dieb wurde nie gefasst.',
      },
      ending: 'failure',
    },
  },
}
