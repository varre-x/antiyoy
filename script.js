const container = document.getElementById("container");
const lobby = document.getElementById("lobby");
const startDiv = document.getElementById("startDiv");
const playerList = document.getElementById("playerList");
const nameField = document.getElementById("nameField");
const joinBtn = document.getElementById("joinBtn");
const startBtn = document.getElementById("startBtn");

async function fetchData() {
    const response = await fetch('https://tinkr.tech/sdb/antiyoy/antiyoyDB', {
        method: 'GET'
    });
    return await response.json();
}

async function postData(data) {
    const response = await fetch('https://tinkr.tech/sdb/antiyoy/antiyoyDB', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    console.log(response);
    return await response.json();
}


async function loadHexMap() {
    const data = await fetchData();
    container.innerHTML = "";
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

            if (tile.building === "tree") {
                const tree = document.createElement("img");
                tree.src = `https://tinkr.tech//sdb_apps/antiyoy/images/tree.svg`;
                tree.classList.add("tree");
                tree.style.left = `${tile.x}px`;
                tree.style.top = `${tile.y}px`;
                container.appendChild(tree);    
            } 
        }
        
    }
    return;
};

async function mm(){
    const data = await fetchData();
    data.players.add("Nelson");
    data.current_player = "Nelson";

}


//setInterval(loadHexMap, 2000);

loadHexMap();

joinBtn.addEventListener("click", () => {
    const playerName = nameField.value.trim();
    const data = fetchData();
    if (playerName !== "") {
        lobby.classList.toggle("invisible");
        startDiv.classList.toggle("invisible");
        postData({
            "action": "join",
            "username": playerName
        });
    }
});

startBtn.addEventListener("click", () => {
    startDiv.classList.toggle("invisible");
    postData({
        "action": "start"
    });
    loadHexMap();
});