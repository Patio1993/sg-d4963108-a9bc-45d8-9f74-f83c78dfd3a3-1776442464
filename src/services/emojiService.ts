export const emojiService = {
  getFoodEmoji(foodName: string): string {
    const name = foodName.toLowerCase();

    // Ovocie
    if (name.includes("jablk")) return "🍎";
    if (name.includes("hruš")) return "🍐";
    if (name.includes("banán")) return "🍌";
    if (name.includes("pomaranč")) return "🍊";
    if (name.includes("citrón")) return "🍋";
    if (name.includes("jahod")) return "🍓";
    if (name.includes("čučor")) return "🍇";
    if (name.includes("hrozn")) return "🍇";
    if (name.includes("broskyň")) return "🍑";
    if (name.includes("čerešň")) return "🍒";
    if (name.includes("višň")) return "🍒";
    if (name.includes("melón")) return "🍉";
    if (name.includes("ananás")) return "🍍";
    if (name.includes("kiwi")) return "🥝";
    if (name.includes("mang")) return "🥭";
    if (name.includes("avokád")) return "🥑";

    // Zelenina
    if (name.includes("rajč")) return "🍅";
    if (name.includes("paradaj")) return "🍅";
    if (name.includes("uhorka")) return "🥒";
    if (name.includes("paprik")) return "🌶️";
    if (name.includes("mrkva")) return "🥕";
    if (name.includes("kukuric")) return "🌽";
    if (name.includes("brokolica")) return "🥦";
    if (name.includes("karfiol")) return "🥦";
    if (name.includes("šalát")) return "🥗";
    if (name.includes("kapusta")) return "🥬";
    if (name.includes("zeler")) return "🥬";
    if (name.includes("cibuľ")) return "🧅";
    if (name.includes("cesnak")) return "🧄";
    if (name.includes("zemiaky") || name.includes("zemiakov")) return "🥔";
    if (name.includes("baklažán")) return "🍆";

    // Mäso a ryby
    if (name.includes("kura") || name.includes("kur")) return "🍗";
    if (name.includes("hovädz")) return "🥩";
    if (name.includes("bravč")) return "🥓";
    if (name.includes("ryb")) return "🐟";
    if (name.includes("tuniak")) return "🐟";
    if (name.includes("losos")) return "🐟";
    if (name.includes("krevet")) return "🦐";
    if (name.includes("vajc") || name.includes("vajíč")) return "🥚";

    // Mliečne výrobky
    if (name.includes("mlieko")) return "🥛";
    if (name.includes("jogurt")) return "🥛";
    if (name.includes("syr")) return "🧀";
    if (name.includes("maslo")) return "🧈";
    if (name.includes("smotana")) return "🥛";

    // Pečivo a obilniny
    if (name.includes("chlieb")) return "🍞";
    if (name.includes("rožok")) return "🥐";
    if (name.includes("croissant")) return "🥐";
    if (name.includes("bageta")) return "🥖";
    if (name.includes("ryža")) return "🍚";
    if (name.includes("cestov")) return "🍝";
    if (name.includes("špagety")) return "🍝";
    if (name.includes("pizza")) return "🍕";
    if (name.includes("burger")) return "🍔";
    if (name.includes("hot dog")) return "🌭";
    if (name.includes("sendvič")) return "🥪";

    // Sladkosti
    if (name.includes("čokolád")) return "🍫";
    if (name.includes("torta")) return "🍰";
    if (name.includes("koláč")) return "🍰";
    if (name.includes("palacinky")) return "🥞";
    if (name.includes("zmrzlin")) return "🍦";
    if (name.includes("donut")) return "🍩";
    if (name.includes("cookie")) return "🍪";
    if (name.includes("sušienky")) return "🍪";
    if (name.includes("med")) return "🍯";
    if (name.includes("džem")) return "🍯";

    // Nápoje
    if (name.includes("káva")) return "☕";
    if (name.includes("čaj")) return "🍵";
    if (name.includes("voda")) return "💧";
    if (name.includes("džús")) return "🧃";
    if (name.includes("víno")) return "🍷";
    if (name.includes("pivo")) return "🍺";
    if (name.includes("coca")) return "🥤";
    if (name.includes("cola")) return "🥤";

    // Oriešky a semená
    if (name.includes("orech") || name.includes("oriešk")) return "🥜";
    if (name.includes("mandle")) return "🥜";

    // Jedlá
    if (name.includes("polievka")) return "🍲";
    if (name.includes("guláš")) return "🍲";
    if (name.includes("rizoto")) return "🍛";
    if (name.includes("sushi")) return "🍣";
    if (name.includes("steak")) return "🥩";
    if (name.includes("špenát")) return "🥬";

    // Default
    return "🍽️";
  },
};