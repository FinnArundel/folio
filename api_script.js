const arenaUrls = [
  "https://www.are.na/finn-arundel/testing-grounds-board",
  "https://www.are.na/finn-arundel/testing-grounds-journal"
];

const apiUrl = "https://api.are.na/v2/channels/live";

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

async function getData() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data.contents;
}

function updateDisplay(container, newData) {
  container.innerHTML = ""; // Clear existing content

  for (let i = newData.length - 1; i >= 0; i--) {
    if (newData[i].class === "Image" || newData[i].class === "Text") {
      const divBlock = document.createElement("h2");
      divBlock.setAttribute("id", `newDiv_${i}`);
      divBlock.innerHTML = newData[i].title;
      container.appendChild(divBlock);

      const dateBlock = document.createElement("p");
      dateBlock.setAttribute("id", `newDate_${i}`);
      const parts = newData[i].connected_at.slice(0, 10).split("-");
      const rearrangedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
      dateBlock.innerHTML = rearrangedDate;
      container.appendChild(dateBlock);

      if (newData[i].class === "Image") {
        const imgBlock = document.createElement("img");
        imgBlock.setAttribute("id", `newImg_${i}`);
        imgBlock.src = newData[i].image.large.url;
        container.appendChild(imgBlock);
      } else if (newData[i].class === "Text") {
        const textBlock = document.createElement("p");
        textBlock.setAttribute("id", `newText_${i}`);
        textBlock.innerHTML = marked.parse(newData[i].content);
        container.appendChild(textBlock);
      }
    }
  }
}

async function updateData() {
  try {
    const newData = await getData();
    for (let i = 0; i < arenaUrls.length; i++) {
      const displayContainer = displayContainers[i];
      updateDisplay(displayContainer, newData);
    }
  } catch (error) {
    console.error(error);
  }
}

// Update the data initially
updateData();

// Connect to the Are.na Real-time API WebSocket
const socket = new WebSocket("wss://realtime.are.na/socket/websocket?vsn=2.0.0");

socket.addEventListener("open", () => {
  console.log("WebSocket connection established.");
});

socket.addEventListener("message", event => {
  const message = JSON.parse(event.data);
  if (message.event === "phx_reply") {
    console.log("Authentication successful.");
  } else if (message.event === "new_content") {
    console.log("New content received:", message.payload);
    const channelSlug = message.payload.source;
    const displayContainer = displayContainers.find(container => container.id.includes(channelSlug));
    if (displayContainer) {
      updateData();
    }
  }
});

socket.addEventListener("close", () => {
  console.log("WebSocket connection closed.");
});
