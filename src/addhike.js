import { db } from "./firebaseConfig.js";
import { onAuthReady } from "./authentication.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Remember the logged-in user so we can save their ID with the hike
let currentUser = null;

onAuthReady(function (user) {
  if (!user) {
    location.href = "index.html"; // Not logged in → go away
    return;
  }
  currentUser = user; // Logged in → remember them
});
// ---- (1) What to do when a file is chosen ----
function showPreview(event) {
  const file = event.target.files[0]; // the chosen file (or undefined)
  const preview = document.getElementById("imagePreview");
  if (file) {
    preview.src = URL.createObjectURL(file); // temporary link to the file on this computer
    preview.classList.remove("d-none");
  }
}

// ---- (2) Connect it: "file picker, when your file changes, run showPreview" ----
document.getElementById("imageInput").addEventListener("change", showPreview);
// ---- (1) What to do when the form is submitted ----
async function saveHike(event) {
  event.preventDefault(); // Stop the browser from reloading the page

  // 1. Collect the form values into ONE object (this becomes the Firestore document)
  const newHike = {
    name: document.getElementById("hikeNameInput").value,
    city: document.getElementById("cityInput").value,
    level: document.getElementById("levelInput").value,
    length: Number(document.getElementById("lengthInput").value), // store a number, not "10.5"
    details: document.getElementById("detailsInput").value,
    owner: currentUser.uid, // WHO added it
    ownerName: currentUser.displayName || currentUser.email,
    last_updated: serverTimestamp(), // WHEN it was added
  };
  const file = document.getElementById("imageInput").files[0]; // undefined if no photo chosen
  newHike.image = file ? await resizeImage(file) : ""; // base64 text, or empty string
  // Shrink a photo so its longest side is at most maxSize px,
  // then return it as a base64 text string ("data:image/jpeg;base64,....")
  try {
    await addDoc(collection(db, "hikes"), newHike);
    location.href = "main.html"; // 3. Go look at the new card
  } catch (error) {
    alert(`Error saving hike:\n${error.code || ""}\n${error.message || error}`);
  }
}
function resizeImage(file, maxSize = 600) {
  return new Promise(function (resolve, reject) {
    const img = new Image(); // an invisible <img>
    img.onload = function () {
      // runs once the photo is decoded
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7)); // JPEG at 70% quality, as text
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
// 2. Save it to the "hikes" collection

// ---- (2) Connect it: "form, when you are submitted, run saveHike" ----
document.getElementById("addHikeForm").addEventListener("submit", saveHike);
