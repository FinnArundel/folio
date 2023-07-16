const arenaUrls = [
    "https://www.are.na/finn-arundel/testing-grounds-board",
    "https://www.are.na/finn-arundel/testing-grounds-journal"
  ];
  
  const apiUrls = arenaUrls.map(url => `https://api.are.na/v2/channels/${url.split("/").pop()}?per=20`);
  
// Create main container
const mainContainer = document.createElement("div");
mainContainer.setAttribute("id", "mainContainer"); 
document.body.appendChild(mainContainer);

// Create an array to store display containers
const displayContainers = [];

// Create display containers and append them to the main container
for (let i = 0; i < arenaUrls.length; i++) {
  const displayContainer = document.createElement("div");
  const containerId = `displayContainer_${i}`; // Generate unique ID
  displayContainer.setAttribute("id", containerId); // Assign the ID to the container
  displayContainer.style.width = "50%";
  displayContainers.push(displayContainer);
  mainContainer.appendChild(displayContainer);
}

async function getData(apiUrl, displayContainer) {
  const response = await fetch(apiUrl);
  const data = await response.json();

    displayContainer.innerHTML = ""; // Clear existing content
  
    for (let i = data.contents.length - 1; i >= 0; i--) {
      if (data.contents[i].class === "Image" || data.contents[i].class === "Text") {
        const divBlock = document.createElement("h2");
        divBlock.setAttribute("id", `newDiv_${i}`);
        divBlock.innerHTML = data.contents[i].title;
        displayContainer.appendChild(divBlock);
  
        const dateBlock = document.createElement("p");
        dateBlock.setAttribute("id", `newDate_${i}`);
        const parts = data.contents[i].connected_at.slice(0, 10).split("-");
        const rearrangedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
        dateBlock.innerHTML = rearrangedDate;
        displayContainer.appendChild(dateBlock);
  
        if (data.contents[i].class === "Image") {
          const imgBlock = document.createElement("img");
          imgBlock.setAttribute("id", `newImg_${i}`);
          imgBlock.src = data.contents[i].image.large.url;
          displayContainer.appendChild(imgBlock);
        } else if (data.contents[i].class === "Text") {
          const textBlock = document.createElement("p");
          textBlock.setAttribute("id", `newText_${i}`);
          textBlock.innerHTML = marked.parse(data.contents[i].content);
          displayContainer.appendChild(textBlock);
        }
      }
    }
  }
  
async function updateData() {
  for (let i = 0; i < apiUrls.length; i++) {
    await getData(apiUrls[i], displayContainers[i])
      .catch(error => {
        console.error(error);
      });
  }
}

async function updateData(apiUrl, displayContainer) {
  await getData(apiUrl, displayContainer).catch(error => {
    console.error(error);
  });
}

function connectToWebSocket() {
  const accessToken = "SRvnWY-ZFtAZM68Li5TrXv0PNzbGkFosR2fNQj_NGow"; // Replace with your Are.na access token
  const socket = new WebSocket(`wss://realtime.are.na/socket/websocket?vsn=2.0&access_token=${accessToken}`);

  socket.onopen = () => {
    console.log("WebSocket connection established");
    for (let i = 0; i < apiUrls.length; i++) {
      const channelIdentifier = `channel:${apiUrls[i].split("/").pop()}`;
      socket.send(JSON.stringify({ topic: channelIdentifier, event: "phx_join" }));
    }
  };

  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.event === "content_created") {
      const channelIdentifier = message.payload.channel.identifier;
      const index = apiUrls.findIndex(url => url.includes(channelIdentifier));
      if (index !== -1) {
        const apiUrl = apiUrls[index];
        const displayContainer = displayContainers[index];
        updateData(apiUrl, displayContainer);
      }
    }
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };
}

// Initialize the WebSocket connection and update data initially
connectToWebSocket();
for (let i = 0; i < apiUrls.length; i++) {
  updateData(apiUrls[i], displayContainers[i]);
}
