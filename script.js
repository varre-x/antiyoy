const container = document.getElementById("container");
const lobby = document.getElementById("lobby");
const startDiv = document.getElementById("startDiv");
const playerList = document.getElementById("playerList");
const nameField = document.getElementById("nameField");
const joinBtn = document.getElementById("joinBtn");
const startBtn = document.getElementById("startBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const moneyDiv = document.getElementById("moneyDiv");
//unit and building buttons
const ubBtns = document.getElementsByClassName("ubBtn");

let playerKey = "6mfDmaq5Qhb2XJo0xcGShSJutmAIv-m9afLiGADbuEQ";
let username = "ss";
let selectedTool = null;
let fromCol = null;
let fromRow = null;

const keyMap = {
    "1": "farm",
    "2": "tower",
    "3": "fortress",
    "4": "peasant",
    "5": "spearman",
    "6": "baron",
    "7": "knight",
};


/*
TO DO:
- add player list to lobby ✅
- save playerkey and name to localstorage
- add surrender button
- win comditions
- scaling price for farms
- highlight hexes that unit can move to
- hightlight which color you are?
- message popups for errors nt: not enough money, not your turn, etc ✅
- ability to check everyones incomes by clicking on moneyDiv
- click numbers to select farm, fortress or units insead of clicking the image ✅
*/

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
    console.log(data);
    container.innerHTML = "";
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

async function loadMoney() {
    const data = await fetchData();
    let playerData = data.players;
    for (const player of playerData) {
        if (player.username === username) {
            document.getElementById("money").textContent = `${player.money}`;
            let income = player.income - player.upkeep;
            document.getElementById("income").textContent = `${income}/turn`;
        };
    };
};

function showError(text, x, y) {
    const el = document.createElement("div");
    el.className = "error-popup";
    el.textContent = text;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    document.body.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 1000);
}

//setInterval(loadHexMap, 2000);

//lobby buttons
joinBtn.addEventListener("click", async (e) => {
    const playerName = nameField.value.trim();
    const data = await fetchData();
    if (playerName !== "") {
        let player = document.createElement("li");
        player.textContent = playerName;
        player.classList.add("playerListItem");
        playerList.appendChild(player);
        
        lobby.classList.toggle("collapse");
        startDiv.classList.toggle("collapse");
        const joinResponse = await postData({
            "action": "join",
            "username": playerName
        });
        if (!joinResponse.ok) {
        showError(`${joinResponse.error}`, e.clientX, e.clientY);
        console.log(joinResponse.error);
        };
        playerKey = joinResponse.player_key;
        console.log(playerKey);
    }
});

startBtn.addEventListener("click", async (e) => {
    startDiv.classList.toggle("collapse");
    endTurnBtn.classList.toggle("collapse");
    for (const btn of ubBtns) {
        btn.classList.toggle("collapse");
    }
    moneyDiv.classList.toggle("collapse");
    const startResponse = await postData({
        "action": "start"
    });
    if (!startResponse.ok) {
        showError(`${startResponse.error}`, e.clientX, e.clientY);
        console.log(startResponse);
    }
    loadMoney();
    loadHexMap();
});

//ingame buttons
endTurnBtn.addEventListener("click", async (e) => {
    const endTurnResponse = await postData({
        "action": "end_turn",
        "player_key": playerKey
    });
    if (!endTurnResponse.ok) {
        showError(`${endTurnResponse.error}`, e.clientX, e.clientY);
        console.log(endTurnResponse);
    }
    loadMoney();
    loadHexMap();
});



for (const btn of ubBtns) {
    btn.onclick = () => {
        selectedTool = btn.dataset.tool;
        for (const b of ubBtns) {
            b.classList.remove("selected");
        }
        btn.classList.add("selected");
    };
};

document.addEventListener("keydown", (e) => {
    const tool = keyMap[e.key]; 
    if (!tool) return;
    selectedTool = tool;
    for (const btn of ubBtns) {
        if (btn.dataset.tool === tool) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    }
});

//hex clicking
document.body.addEventListener("click", async (e) => {
    const hex = e.target.closest(".hex");
    if (!hex) return;
    if (selectedTool === null) {
        if (fromCol === null && fromRow === null) {
            const col = Number(hex.dataset.col);
            const row = Number(hex.dataset.row);

            const data = await fetchData();
            const tiles = data.map;
            for (const tile of tiles) {
                if (tile.col === col && tile.row === row && tile.unit !== null) {
                    fromCol = col;
                    fromRow = row;
                    return;
                }
            }
            return;
        } else if (fromCol !== null && fromRow !== null) {
            const toCol = Number(hex.dataset.col);
            const toRow = Number(hex.dataset.row);
            const moveUnit = await postData({
                "action": "move",
                "player_key": playerKey,
                "from": {"col": fromCol, "row": fromRow},
                "to": {"col": toCol, "row": toRow}
            });
            if (!moveUnit.ok) {
                showError(`${moveUnit.error}`, e.clientX, e.clientY);
                console.log(moveUnit);
            };
            loadMoney();
            loadHexMap();
            fromCol = null;
            fromRow = null;
            return;
        };
    } else {
        const col = Number(hex.dataset.col);
        const row = Number(hex.dataset.row);
        const buyResponse = await postData({
            "action": "buy",
            "player_key": playerKey,
            "type": selectedTool,
            "hex": {"col": col, "row": row}
        });
        if (!buyResponse.ok) {
            showError(`${buyResponse.error}`, e.clientX, e.clientY);
            console.log(buyResponse);
        }
        
        for (const btn of ubBtns) {
            btn.classList.remove("selected");
        }
        selectedTool = null;    
        loadMoney();
        loadHexMap();
    };
});




//for testing
lobby.classList.toggle("collapse");
startDiv.classList.toggle("collapse");

startDiv.classList.toggle("collapse");
    endTurnBtn.classList.toggle("collapse");
    for (const btn of ubBtns) {
        btn.classList.toggle("collapse");
    }
    moneyDiv.classList.toggle("collapse");
loadHexMap();
loadMoney();
