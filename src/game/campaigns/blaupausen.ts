import type { Campaign } from '../types'

/**
 * Krimi 1960: Im Kranwerk verschwinden über Nacht die Blaupausen des neuen
 * Hafenkrans — drei Tage vor der Abnahme. Ein Kassenzettel, ein nervöser
 * Neuer und ein altes Lagerhaus voller Ölpapier.
 *
 * Struktur:
 *   intro → { werkbank, waechter, meldung }
 *   werkbank → { markt, meldung }    waechter → { gasse, markt }
 *   meldung → { markt, gasse }       markt → { gasse, zeuge }
 *   gasse → { lager, zeuge, ende-blamiert }
 *   zeuge → { zugriff, lager }       lager → { ende-zerrissen, zugriff }
 *   zugriff → { ende-erfolg, ende-zerrissen }
 */
export const blaupausen: Campaign = {
  id: 'blaupausen',
  title: 'Die verschwundenen Blaupausen',
  genre: 'krimi',
  start: 'b-intro',
  nodes: {
    'b-intro': {
      id: 'b-intro',
      scene: 'fabrik',
      text: {
        default:
          'Eberswalde, 1960. Im Kranwerk riecht es nach Öl und kaltem Kaffee, die Neonröhren summen. Im Zeichensaal klafft der Planschrank offen: Die Blaupausen des neuen Hafenkrans sind weg — drei Tage vor der Abnahme! Der Brigadier knallt seine Mütze auf den Tisch: "Ohne die Pläne steht hier alles still. {name}, du hast die besten Augen im Werk. Finde sie."',
      },
      speech: {
        default: 'Ein Planschrank öffnet sich nicht von allein …',
      },
      options: [
        { label: 'Die Werkbank des Neuen ansehen', target: 'b-werkbank' },
        { label: 'Den Nachtwächter befragen', target: 'b-waechter' },
        { label: 'Den Diebstahl auf der Wache melden', target: 'b-meldung' },
      ],
    },

    'b-werkbank': {
      id: 'b-werkbank',
      scene: 'fabrik',
      text: {
        default:
          'An der Werkbank des Neuen liegt alles ordentlich — zu ordentlich. Unter dem Schraubstock: ein Bogen Durchschlagpapier, hauchdünn, wie man es zum Abpausen nimmt. Und im Papierkorb ein zerknüllter Kassenzettel vom Konsum am Markt: zwei Brausen, gestern Abend, kurz vor Ladenschluss. Wer kauft zwei Brausen, wenn er allein ist?',
      },
      speech: {
        default: 'Zwei Brausen. Er hat sich mit jemandem getroffen.',
      },
      options: [
        { label: 'Im Konsum am Markt nachfragen', target: 'b-markt' },
        { label: 'Den Fund der Wache zeigen', target: 'b-meldung' },
      ],
    },

    'b-waechter': {
      id: 'b-waechter',
      scene: 'fabrik',
      text: {
        default:
          'Der Nachtwächter kratzt sich unter der Mütze. "Gegen Mitternacht war im Zeichensaal noch Licht. Dachte, einer macht Überstunden — bei dem Termindruck." Er senkt die Stimme. "Beim Rundgang um eins war das Licht aus. Aber am Tor ist mir einer entgegen, Aktentasche unterm Arm, Kragen hoch. Richtung Fischergasse. Gegrüßt hat er nicht."',
      },
      options: [
        { label: 'In die Fischergasse gehen', target: 'b-gasse' },
        { label: 'Erst am Markt herumfragen', target: 'b-markt' },
      ],
    },

    'b-meldung': {
      id: 'b-meldung',
      scene: 'wachstube',
      text: {
        default:
          'Der Abschnittsbevollmächtigte klappt sein Notizbuch auf und wieder zu. "Verschwundene Pläne, so so. Und Verdächtige? Beweise?" Er schiebt die Brille hoch. "Bring mir etwas in die Hand, Genosse {name} — einen Namen, einen Ort, ein Blatt Papier. Vorher kann ich nur Protokoll schreiben, und davon wird kein Kran gebaut."',
      },
      options: [
        { label: 'Am Markt der Kassenzettel-Spur nachgehen', target: 'b-markt' },
        { label: 'In der Fischergasse nach dem Mann suchen', target: 'b-gasse' },
      ],
    },

    'b-markt': {
      id: 'b-markt',
      scene: 'marktplatz',
      text: {
        default:
          'Am Kiosk winkt dich Hanne heran, noch ehe du fragst. "Der Neue aus dem Kranwerk? Kommt jeden Abend, kauft zwei Brausen und trifft sich mit einem Städter in der Fischergasse. Gestern hatten sie es eilig." Sie beugt sich vor. "Der Städter trug eine Rolle unterm Arm. So lang." Sie spreizt die Arme weiter, als jeder Plan sein müsste.',
      },
      options: [
        { label: 'Sofort in die Fischergasse', target: 'b-gasse' },
        { label: 'Den Brigadier als Zeugen dazuholen', target: 'b-zeuge' },
      ],
    },

    'b-gasse': {
      id: 'b-gasse',
      scene: 'gasse',
      text: {
        default:
          'In der Fischergasse lehnt die Krähe im Torbogen, als hätte sie auf dich gewartet. "Suchst den mit der Aktentasche, was?" Für ein Päckchen Kaugummi rückt sie heraus: "Im alten Lagerhaus am Wasser hocken sie. Seit heute früh. Einer pinselt, einer paust — riechen kannst du das Ölpapier bis hier." Sie grinst. "Aber die Tür quietscht. Sag nicht, ich hätte dich nicht gewarnt."',
      },
      options: [
        { label: 'Allein zum Lagerhaus schleichen', target: 'b-lager' },
        { label: 'Erst den Brigadier holen — Zeugen!', target: 'b-zeuge' },
        { label: 'Die Krähe als Komplizin beschuldigen', target: 'b-ende-blamiert' },
      ],
    },

    'b-zeuge': {
      id: 'b-zeuge',
      scene: 'fabrik',
      text: {
        default:
          'Der Brigadier hört zu, ohne dich zu unterbrechen — Durchschlagpapier, zwei Brausen, das Lagerhaus. Dann nickt er einmal, kurz und schwer. "Gut gearbeitet, {name}. Aber merk dir: Es zählt nur, was wir schwarz auf weiß zurückholen. Die Originale zuerst, dann der Mann." Er greift nach seiner Jacke. "Wie gehen wir rein?"',
      },
      options: [
        { label: 'Gemeinsam und leise, beide Ausgänge', target: 'b-zugriff' },
        { label: 'Du gehst allein vor, er wartet draußen', target: 'b-lager' },
      ],
    },

    'b-lager': {
      id: 'b-lager',
      scene: 'finale',
      text: {
        default:
          'Durch den Türspalt siehst du sie: Auf zwei Böcken liegen deine Blaupausen ausgerollt, dahinter der Neue, der Bogen um Bogen auf Ölpapier abpaust. Neben ihm der Städter — und neben dem ein eiserner Ofen, in dem schon Feuer knistert. Wenn die beiden erschrecken, sind die Originale schneller im Ofen, als du "Halt" rufen kannst.',
      },
      speech: {
        default: 'Der Ofen. Sie würden alles verbrennen …',
      },
      options: [
        { label: 'Hineinplatzen und sie zur Rede stellen', target: 'b-ende-zerrissen' },
        { label: 'Lautlos zurück und den Zugriff vorbereiten', target: 'b-zugriff' },
      ],
    },

    'b-zugriff': {
      id: 'b-zugriff',
      scene: 'finale',
      text: {
        default:
          'Ihr wartet, bis der Städter zum Wasserholen hinaustritt — der Brigadier stellt sich ihm draußen in den Weg. Drinnen sitzt der Neue allein zwischen Plänen und Ofen. Jetzt entscheidet eine Sekunde: Er hat dich gehört und greift schon nach dem Papierstapel.',
      },
      options: [
        { label: 'Dich zwischen ihn und den Ofen stellen', target: 'b-ende-erfolg' },
        { label: 'Ihn am Kragen packen', target: 'b-ende-zerrissen' },
      ],
    },

    'b-ende-erfolg': {
      id: 'b-ende-erfolg',
      scene: 'finale',
      text: {
        default:
          'Du bist schneller: Ein Schritt, und du stehst vor der Ofenklappe, die Arme verschränkt. Der Neue erstarrt mit dem Stapel in der Hand — und lässt ihn sinken. Der Brigadier führt draußen den Städter herein, der Abschnittsbevollmächtigte bekommt seinen Namen, seinen Ort und sein Blatt Papier. Drei Tage später hebt der neue Hafenkran zum ersten Mal — pünktlich zur Abnahme. "Beste Augen im Werk", sagt der Brigadier. "Hab ich doch gesagt, {name}."',
      },
      ending: 'success',
    },

    'b-ende-zerrissen': {
      id: 'b-ende-zerrissen',
      scene: 'finale',
      text: {
        default:
          'Zu laut, zu schnell. Der Neue fegt die Blaupausen vom Bock und stopft sie mit beiden Händen in den Ofen — das Feuer schlägt hell auf, und was du herausreißt, zerfällt dir schwarz zwischen den Fingern. Die beiden werden gefasst, ja. Aber im Zeichensaal beginnen sie am Morgen von vorn, Strich für Strich, und die Abnahme platzt. Gerechtigkeit gab es. Einen Kran nicht.',
      },
      ending: 'failure',
    },

    'b-ende-blamiert': {
      id: 'b-ende-blamiert',
      scene: 'gasse',
      text: {
        default:
          'Die Krähe legt den Kopf schief — und dann lacht sie, laut und schallend, dass es von den Wänden springt. "Ich? ICH?" Türen öffnen sich, Nachbarn lehnen sich heraus, und du stehst mitten im Spott. Bis du dich freigeredet hast, ist das Lagerhaus leer, das Ölpapier fort und von den Blaupausen bleibt nur Asche im kalten Ofen.',
      },
      ending: 'failure',
    },
  },
}
