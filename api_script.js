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

async function getData(apiUrl) {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

function updateDisplay(container, data) {
  container.innerHTML = ""; // Clear existing content

  for (let i = data.contents.length - 1; i >= 0; i--) {
    if (data.contents[i].class === "Image" || data.contents[i].class === "Text") {
      const divBlock = document.createElement("h2");
      divBlock.setAttribute("id", `newDiv_${i}`);
      divBlock.innerHTML = data.contents[i].title;
      container.appendChild(divBlock);

      const dateBlock = document.createElement("p");
      dateBlock.setAttribute("id", `newDate_${i}`);
      const parts = data.contents[i].connected_at.slice(0, 10).split("-");
      const rearrangedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
      dateBlock.innerHTML = rearrangedDate;
      container.appendChild(dateBlock);

      if (data.contents[i].class === "Image") {
        const imgBlock = document.createElement("img");
        imgBlock.setAttribute("id", `newImg_${i}`);
        imgBlock.src = data.contents[i].image.large.url;
        container.appendChild(imgBlock);
      } else if (data.contents[i].class === "Text") {
        const textBlock = document.createElement("p");
        textBlock.setAttribute("id", `newText_${i}`);
        textBlock.innerHTML = marked.parse(data.contents[i].content);
        container.appendChild(textBlock);
      }
    }
  }
}

async function updateData() {
  try {
    const timestamp = Date.now(); // Generate cache-busting timestamp
    
    for (let i = 0; i < apiUrls.length; i++) {
      const apiUrl = `${apiUrls[i]}&_=${timestamp}`; // Append timestamp to API URL
      const displayContainer = displayContainers[i];

      const data = await getData(apiUrl);
      updateDisplay(displayContainer, data);
    }
  } catch (error) {
    console.error(error);
  }
}

// Update the data initially
updateData();

// Periodically update the data every 10 seconds (adjust as needed)
setInterval(updateData, 10000);
