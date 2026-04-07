const text = document.getElementsByClassName("text")[0];
const container = document.getElementById("container");

async function loadHexMap() {
    const response = await fetch('https://tinkr.tech/sdb/antiyoy/antiyoyDB', {
        method: 'GET'
    });
    data = await response.json();
    console.log(data);
    const tiles = data.map

    for (const tile of tiles) {
        if (tile.type !== "impassable") {
            const hex = document.createElement("img");
            hex.src = `https://tinkr.tech/${tile.image}`;
            hex.classList.add("hex");
            hex.style.left = `${tile.x}px`;
            hex.style.top = `${tile.y}px`;

            container.appendChild(hex);
        } 
    }
    return;
};

loadHexMap();