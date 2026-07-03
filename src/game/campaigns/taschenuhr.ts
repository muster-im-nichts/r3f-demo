import type { Campaign } from '../types'

/**
 * Krimi: Die goldene Taschenuhr des Uhrmachermeisters Runge — heute ein
 * Museumsobjekt — wurde aus der Ratsvitrine gestohlen. Drei Spuren, die sich
 * kreuzen; ein Erfolgs-Ende, zwei Arten zu scheitern.
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
          'Eberswalde, am Abend. Ein Schrei vom Rathaus: Die goldene Taschenuhr des Uhrmachermeisters Runge ist aus der Vitrine verschwunden! Auf dem Marktplatz drängen sich die Leute. Du, {name}, stehst mittendrin — und irgendwer hier weiß mehr, als er sagt.',
        byEpoch: {
          '1760':
            'Eberswalde, anno 1760. Im Kerzenschein des Rathauses gähnt eine leere Vitrine: Die goldene Taschenuhr des Uhrmachermeisters Runge ist fort! Auf dem Markt flackern die Fackeln, die Leute tuscheln. Du, {name}, stehst mittendrin — und irgendwer hier weiß mehr, als er sagt.',
          '1860':
            'Eberswalde, 1860. Unter den neuen Gaslaternen läuft die Nachricht wie ein Feuer den Markt entlang: Die goldene Taschenuhr des Meisters Runge ist aus der Vitrine des Rathauses gestohlen! Du, {name}, stehst mittendrin — und irgendwer hier weiß mehr, als er sagt.',
          '1960':
            'Eberswalde, 1960. Vor dem Rathaus flackert eine müde Neonröhre, drinnen klafft eine leere Vitrine: Die goldene Taschenuhr des alten Runge — verschwunden! Auf dem Markt stehen die Leute in Grüppchen. Du, {name}, stehst mittendrin — und irgendwer hier weiß mehr, als er sagt.',
        },
      },
      speech: {
        default: 'Eine Uhr verschwindet nicht von allein …',
        byCharacter: {
          wilhelm: 'Meister Runges Uhr! Die kenne ich aus der Werkstatt …',
          lotte: 'Ich kenne jede Gasse. Der Dieb kommt nicht weit.',
        },
      },
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
        default:
          'Die alte Hanne beugt sich über ihre Körbe und senkt die Stimme: "Kurz vor dem Geschrei huschte einer am Brunnen vorbei. Gesicht hab ich keins gesehen — aber ein grünes Halstuch, das hatte er. Lief Richtung Fischergasse." Ein grünes Halstuch … das kommt dir bekannt vor.',
      },
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
      speech: {
        default: 'Der Junge zittert ja wie Espenlaub.',
      },
      options: [
        { label: 'Karl laut zur Rede stellen', target: 'verdacht' },
        { label: 'Dich unauffällig umsehen', target: 'hinweis' },
      ],
    },

    verdacht: {
      id: 'verdacht',
      scene: 'werkstatt',
      text: {
        default:
          '"DU warst das, Karl!" Der Junge fährt zusammen, Tränen in den Augen: "Ich hab sie nicht gestohlen! Ich schwöre!" Meister Runge poltert herein, stellt sich schützend vor seinen Lehrling und deutet zur Tür. Während ihr streitet, verrinnt kostbare Zeit — und wer auch immer die Uhr hat, gewinnt Vorsprung.',
      },
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
      speech: {
        default: 'Die Krähe … das klingt nicht nach feiner Gesellschaft.',
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
          'In der Wachstube brennt Licht. Der Wachhabende hört dir zu, verschränkt die Arme und schüttelt den Kopf: "Eine verschwundene Uhr, und weiter? Kein Täter, keine Spur, kein Beweis. Bring mir etwas Handfestes, dann rücken wir aus."',
        byEpoch: {
          '1760':
            'In der Wachstube brennt eine Talgkerze. Der Stadtwächter mustert dich unter seinem Dreispitz hervor: "Eine verschwundene Uhr, und weiter? Kein Täter, keine Spur, kein Beweis. Bring Er mir etwas Handfestes, dann rücken wir aus."',
          '1860':
            'In der Wachstube zischt eine Gaslampe. Der Gendarm zwirbelt seinen Schnurrbart: "Eine verschwundene Uhr, und weiter? Kein Täter, keine Spur, kein Beweis. Bringen Sie mir etwas Handfestes, dann rücken wir aus."',
          '1960':
            'In der Wachstube surrt eine Schreibmaschine. Der Volkspolizist blättert unbeeindruckt in einem Formular: "Eine verschwundene Uhr, und weiter? Kein Täter, keine Spur, kein Beweis. Bringen Sie mir was Handfestes, Genosse — dann fahren wir raus."',
        },
      },
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
          'Die Fischergasse liegt dunkel und feucht. Am alten Lagerhaus lehnt eine hagere Gestalt mit hochgeschlagenem Kragen — "die Krähe" nennen sie ihn am Hafen. Du drückst dich in einen Torbogen und hörst ihn krächzen: "Heute nacht die Übergabe. Der Junge bringt das Ding — und dann ist es fort aus der Stadt."',
        byEpoch: {
          '1760':
            'Die Fischergasse liegt stockdunkel, nur eine Öllampe schaukelt im Wind. Am alten Lagerhaus lehnt eine hagere Gestalt — "die Krähe" nennen sie ihn am Kanal. Du drückst dich in einen Torbogen und hörst ihn krächzen: "Heute nacht die Übergabe. Der Junge bringt das Ding — und dann ist es fort aus der Stadt."',
          '1860':
            'In der Fischergasse zischt eine einsame Gaslaterne. Am alten Lagerhaus lehnt eine hagere Gestalt — "die Krähe" nennen sie ihn am Güterbahnhof. Du drückst dich in einen Torbogen und hörst ihn krächzen: "Heute nacht die Übergabe. Der Junge bringt das Ding — und mit dem Frühzug ist es fort."',
          '1960':
            'In der Fischergasse flackert eine kaputte Neonreklame. Am alten Lagerhaus lehnt eine hagere Gestalt im Regenmantel — "die Krähe" nennen sie ihn am Bahnhof. Du drückst dich in einen Hauseingang und hörst ihn krächzen: "Heute nacht die Übergabe. Der Junge bringt das Ding — und dann geht es über die Grenze."',
        },
      },
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
        default:
          'Diesmal hört der Wachhabende genau hin, und sein Blick wird scharf. "Die Krähe also. Auf den warten wir schon lange." Er greift nach Laterne und Säbel. "Wir stellen ihm eine Falle am Lagerhaus. Aber nur, wenn alle ruhig bleiben — ein falscher Schritt, und er ist über alle Berge."',
        byEpoch: {
          '1760':
            'Diesmal hört der Stadtwächter genau hin, und sein Blick wird scharf. "Die Krähe also. Auf den warten wir seit dem Sommer." Er greift nach Hellebarde und Laterne. "Wir stellen ihm eine Falle am Lagerhaus. Aber nur, wenn Er ruhig bleibt — ein falscher Schritt, und der Vogel ist über alle Berge."',
          '1860':
            'Diesmal hört der Gendarm genau hin, und sein Blick wird scharf. "Die Krähe also. Der steht seit Monaten in meinen Akten." Er schnallt den Säbel um. "Wir stellen ihm eine Falle am Lagerhaus. Aber nur, wenn Sie ruhig bleiben — ein falscher Schritt, und der Vogel ist über alle Berge."',
          '1960':
            'Diesmal hört der Volkspolizist genau hin, und sein Blick wird scharf. "Die Krähe also. Den Namen kennen wir." Er greift nach Mantel und Taschenlampe. "Wir stellen ihm eine Falle am Lagerhaus. Aber nur, wenn Sie ruhig bleiben — ein falscher Schritt, und der Vogel ist über alle Berge."',
        },
      },
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
          'Mitternacht am Lagerhaus. Kaum bist du durch das Tor, fällt es hinter dir ins Schloss. Die Krähe tritt aus dem Dunkel, zwei Schatten neben ihm. "Sieh an. Kein Botenjunge." Er wiegt einen Knüppel in der Hand. "Und was machen wir jetzt mit dir?"',
      },
      speech: {
        default: 'Ruhig bleiben. Ganz ruhig bleiben …',
      },
      options: [
        { label: '"Karl schickt mich. Ich bin der neue Bote."', target: 'coup' },
        { label: 'Herumfahren und zur Tür rennen', target: 'ende-entkommen' },
      ],
    },

    coup: {
      id: 'coup',
      scene: 'finale',
      text: {
        default:
          'Die Krähe mustert dich lange. Dann ein heiseres Lachen: "Der Junge hat also doch Verstand — schickt jemanden mit Nerven." Er zieht ein Bündel aus dem Mantel und drückt es dir in die Hand. Durch das Tuch fühlst du kühles Gold: die Taschenuhr! "Bring sie zum Kahn am Kanal. Und kein Wort."',
      },
      options: [
        { label: 'Nicken, hinausgehen — und zur Wache rennen', target: 'ende-erfolg' },
        { label: 'Die Krähe jetzt auch noch festhalten', target: 'ende-entkommen' },
      ],
    },

    uebergabe: {
      id: 'uebergabe',
      scene: 'finale',
      text: {
        default:
          'Mitternacht. Ihr kauert hinter den Fässern am Lagerhaus, die Wache mit gelöschter Laterne neben dir. Schritte: Karl kommt mit gesenktem Kopf, das Bündel in der Hand. Aus dem Dunkel löst sich die Krähe. Die Übergabe beginnt — dein Herz schlägt bis zum Hals.',
      },
      speech: {
        default: 'Noch nicht … noch nicht … jetzt gleich!',
      },
      options: [
        { label: 'Das Signal geben, wenn die Uhr den Besitzer wechselt', target: 'ende-erfolg' },
        { label: 'Zu früh losstürmen', target: 'ende-entkommen' },
      ],
    },

    'ende-erfolg': {
      id: 'ende-erfolg',
      scene: 'finale',
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
