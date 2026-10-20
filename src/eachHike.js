import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

// Get the hike ID from the URL
const params = new URL(window.location.href).searchParams;
const hikeId = params.get("docID");

// Fetch the hike and display its name and image
async function displayHikeInfo() {
  try {
    if (!hikeId) {
      throw new Error("No hike ID found in the URL.");
    }

    const hikeRef = doc(db, "hikes", hikeId);
    const hikeSnap = await getDoc(hikeRef);

    if (!hikeSnap.exists()) {
      throw new Error("Hike not found in Firestore.");
    }

    const hike = hikeSnap.data();
    const name = hike.name;
    const code = hike.code;

    // Display the hike name
    document.getElementById("hikeName").textContent = name;

    // Display the hike image
    const img = document.getElementById("hikeImage");
    img.src = `./images/${code}.jpg`;
    img.alt = `${name} image`;
  } catch (error) {
    console.error("Error loading hike:", error);
    document.getElementById("hikeName").textContent = "Error loading hike.";
  }
}

displayHikeInfo();
