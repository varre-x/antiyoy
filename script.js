const container = document.getElementById("container");
const lobby = document.getElementById("lobby");
const startDiv = document.getElementById("startDiv");
const playerList = document.getElementById("playerList");
const nameField = document.getElementById("nameField");
const joinBtn = document.getElementById("joinBtn");
const startBtn = document.getElementById("startBtn");
const endTurnBtn = document.getElementById("endTurnBtn");
const moneyDiv = document.getElementById("moneyDiv");
//menu
const menu = document.getElementById("menu");
const ffBtn = document.getElementById("ffBtn");
const resumeBtn = document.getElementById("resumeBtn");
//unit and building buttons
const ubBtns = document.getElementsByClassName("ubBtn");

let playerKey = null;
let username = null;

let selectedTool = null;
let fromCol = null;
let fromRow = null;
let errorText = null;

loadPlayerListInterval = setInterval(loadPlayerList, 2000);
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
- bug - when you join you can see other players✅ 
- save playerkey and name to localstorage
- add surrender button
- win comditions
- scaling price for farms
- highlight hexes that unit can move to?
- hightlight which color you are?
- message popups for errors nt: not enough money, not your turn, etc ✅
- ability to check everyones incomes by clicking on moneyDiv
- click numbers to select farm, fortress or units insead of clicking the image ✅
- green border on moneyDiv when its your turn
- income animations above farms when you get income
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    const result = await response.json();
    
    return result;
}

async function loadHexMap() {
    const data = await fetchData();
    /* console.log(data); */
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

async function loadPlayerList() {
    playerList.innerHTML = "";
    const data = await fetchData();
    const players = data.players;
    for (const player of players) {
        let playerLi = document.createElement("li");
        playerLi.textContent = player.username;
        playerLi.classList.add("playerListItem");
        playerList.appendChild(playerLi);
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

//capitalize first letter of string
function cFLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

//remember player
if (localStorage.getItem("playerKey") && localStorage.getItem("username")) {
    playerKey = localStorage.getItem("playerKey");
    username = localStorage.getItem("username");
    lobby.classList.toggle("collapse");
    startDiv.classList.toggle("collapse");
    loadPlayerList();

    fetchData().then(data => { 
        if (data.phase === "playing") {
            startDiv.classList.toggle("collapse");
            endTurnBtn.classList.toggle("collapse");
            for (const btn of ubBtns) {
                btn.classList.toggle("collapse");
            };
            moneyDiv.classList.toggle("collapse");
            container.classList.remove("collapse");
            loadHexMap();
            loadMoney();
            loadHexMapInterval = setInterval(loadHexMap, 2000);
            loadMoneyInterval = setInterval(loadMoney, 2000);
        };
    });
};

//if 1 person starts all start
if (joinBtn.classList.contains("collapse")) {
    fetchData().then(data => {
        if (data.phase === "playing") {
            startDiv.classList.add("collapse");
            lobby.classList.add("collapse");
            moneyDiv.classList.remove("collapse");
            ubBtns.classList.remove("collapse");
            container.classList.remove("collapse");
        }
    });
};

//lobby buttons
joinBtn.addEventListener("click", async (e) => {
    const playerName = nameField.value.trim();
    const data = await fetchData();
    if (playerName !== "") {
        const joinResponse = await postData({
            "action": "join",
            "username": playerName
        });
        if (!joinResponse.ok && joinResponse.error !== undefined) {
            errorText = cFLetter(joinResponse.error.replace(/_/g, " "));
            showError(`${errorText}`, e.clientX, e.clientY);
            console.log(joinResponse.error);
            errorText = null;
            return;
        } else {
            loadPlayerList();
            lobby.classList.toggle("collapse");
            startDiv.classList.toggle("collapse");
        };
        localStorage.setItem("playerKey", joinResponse.player_key);
        localStorage.setItem("username", playerName);
        playerKey = joinResponse.player_key;
        username = playerName;
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
    if (!startResponse.ok && startResponse.error !== undefined) {
        errorText = cFLetter(startResponse.error.replace(/_/g, " "));
        showError(`${errorText}`, e.clientX, e.clientY);
        console.log(startResponse);
        errorText = null;
    }
    loadMoney();
    loadHexMap();
    container.classList.toggle("collapse");
    loadHexMapInterval = setInterval(loadHexMap, 2000);
    loadMoneyInterval = setInterval(loadMoney, 2000);
});

//ingame buttons
endTurnBtn.addEventListener("click", async (e) => {
    const endTurnResponse = await postData({
        "action": "end_turn",
        "player_key": playerKey
    });
    if (!endTurnResponse.ok && endTurnResponse.error !== undefined) {
        errorText = cFLetter(endTurnResponse.error.replace(/_/g, " "));
        showError(`${errorText}`, e.clientX, e.clientY);
        console.log(endTurnResponse);
        errorText = null;
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
    if (!hex) {
        fromCol = null;
        fromRow = null;
        return;
    }
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
            if (!moveUnit.ok && moveUnit.error !== undefined) {
                errorText = cFLetter(moveUnit.error.replace(/_/g, " "));
                showError(`${errorText}`, e.clientX, e.clientY);
                console.log(moveUnit);
                errorText = null;
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
        if (!buyResponse.ok && buyResponse.error !== undefined) {
            errorText = cFLetter(buyResponse.error.replace(/_/g, " "));
            showError(`${errorText}`, e.clientX, e.clientY);
            console.log(buyResponse);
            errorText = null;
        }
        
        for (const btn of ubBtns) {
            btn.classList.remove("selected");
        }
        selectedTool = null;    
        loadMoney();
        loadHexMap();
    };
});

//menu buttons
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        menu.classList.toggle("collapse");
    }
});

resumeBtn.addEventListener("click", () => {
    menu.classList.toggle("collapse");
});

ffBtn.addEventListener("click", async (e) => {
    const ffResponse = await postData({
        "action": "surrender",
        "player_key": playerKey
    });
    if (!ffResponse.ok && ffResponse.error !== undefined) {
        errorText = cFLetter(ffResponse.error.replace(/_/g, " "));
        showError(`${errorText}`, e.clientX, e.clientY);
        console.log(ffResponse);
        errorText = null;
    } else {
        localStorage.clear();
        location.reload();
    }
});

async function winHandler() {
    const data = await fetchData();
    if (data.phase === "lobby") {
        lobby.classList.remove("collapse");
        moneyDiv.classList.add("collapse");
        ubBtns.classList.add("collapse");
        container.classList.add("collapse");
        localStorage.clear();
        location.reload();
        return "ok";
    } else {
        return "no";
    }

};

//win handling
fetchData().then(data => {
    if (data.phase === "playing") {
        winInterval = setInterval(winHandler(), 2000)
        if (winHandler().catch === "ok") {
            clearInterval(winInterval);
        }
    }
});




//for testing
/* lobby.classList.toggle("collapse");
startDiv.classList.toggle("collapse");

startDiv.classList.toggle("collapse");
    endTurnBtn.classList.toggle("collapse");
    for (const btn of ubBtns) {
        btn.classList.toggle("collapse");
    }
    moneyDiv.classList.toggle("collapse");
loadHexMap();
loadMoney(); */
/* localStorage.clear();
location.reload(); */

/* console.log(localStorage.getItem("playerKey"));
console.log(localStorage.getItem("username")); */

