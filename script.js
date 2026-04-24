const container = document.getElementById("container");
const lobby = document.getElementById("lobby");
const startDiv = document.getElementById("startDiv");
const playerList = document.getElementById("playerList");
const nameField = document.getElementById("nameField");
const joinBtn = document.getElementById("joinBtn");
const startBtn = document.getElementById("startBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
//units and buildings
const ubBtns = document.getElementsByClassName("ubBtn");

let playerKey = "6mfDmaq5Qhb2XJo0xcGShSJutmAIv-m9afLiGADbuEQ";

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
    const result = await response.json();
    
    return result;
}


async function loadHexMap() {
    const data = await fetchData();
    container.innerHTML = "";
    //console.log(data);
    const tiles = data.map

    for (const tile of tiles) {
        if (tile.type !== "impassable") {
            const hex = document.createElement("img");
            hex.src = `https://tinkr.tech/${tile.image}`;
            hex.classList.add("hex");
            hex.style.left = `${tile.x}px`;
            hex.style.top = `${tile.y}px`;
            hex.dataset.col = tile.col;
            hex.dataset.row = tile.row;
            container.appendChild(hex);

            if (tile.building === "tree") {
                const tree = document.createElement("img");
                tree.src = `https://tinkr.tech/sdb_apps/antiyoy/images/${tile.building}.svg`;
                tree.classList.add("tree");
                tree.style.left = `${tile.x}px`;
                tree.style.top = `${tile.y}px`;
                tree.dataset.col = tile.col;
                tree.dataset.row = tile.row;
                container.appendChild(tree);    
            } else if (tile.building !== null) {
                const building = document.createElement("img");
                building.src = `https://tinkr.tech/sdb_apps/antiyoy/images/building_${tile.building}.svg`;
                building.classList.add("building");
                building.style.left = `${tile.x}px`;
                building.style.top = `${tile.y}px`;
                building.dataset.col = tile.col;
                building.dataset.row = tile.row;
                container.appendChild(building);
            }

            if (tile.unit !== null) {
                const unit = document.createElement("img");
                unit.src = `https://tinkr.tech/sdb_apps/antiyoy/images/unit_${tile.unit}.svg`;
                unit.classList.add("unit");
                unit.style.left = `${tile.x}px`;
                unit.style.top = `${tile.y}px`;
                container.appendChild(unit);
            }
        }
        
    }
    return;
};

//setInterval(loadHexMap, 2000);

loadHexMap();

//lobby buttons
joinBtn.addEventListener("click", async () => {
    const playerName = nameField.value.trim();
    const data = await fetchData();
    if (playerName !== "") {
        lobby.classList.toggle("collapse");
        startDiv.classList.toggle("collapse");
        const joinResponse = await postData({
            "action": "join",
            "username": playerName
        });
        playerKey = joinResponse.player_key;
        console.log(playerKey);
    }
});

startBtn.addEventListener("click", async () => {
    startDiv.classList.toggle("collapse");
    endTurnBtn.classList.toggle("collapse");
    for (const btn of ubBtns) {
        btn.classList.toggle("collapse");
    }
    await postData({
        "action": "start"
    });
    loadHexMap();
});

//ingame buttons
endTurnBtn.addEventListener("click", () => {
    postData({
        "action": "end_turn",
        "player_key": playerKey
    });
    loadHexMap();
});

let selectedTool = null;

for (const btn of ubBtns) {
    btn.onclick = () => {
        selectedTool = btn.dataset.tool;
        for (const b of ubBtns) {
            b.classList.remove("selected");
        }
        btn.classList.add("selected");
    };
};

document.body.addEventListener("click", async (e) => {
    const hex = e.target.closest(".hex");
    if (!hex) return;

    if (!selectedTool) return;

    const col = Number(hex.dataset.col);
    const row = Number(hex.dataset.row);

    await postData({
        "action": "buy",
        "player_key": playerKey,
        "type": selectedTool,
        "hex": {"col": col, "row": row}
    });
    for (const btn of ubBtns) {
        btn.classList.remove("selected");
    }
    selectedTool = null;
    loadHexMap();
});


//for testing
    startDiv.classList.toggle("collapse");
    endTurnBtn.classList.toggle("collapse");
    for (const btn of ubBtns) {
        btn.classList.toggle("collapse");
    }

async function mm(){
    const data = await fetchData();
    data.players.add("Nelson");
    data.current_player = "Nelson";
}