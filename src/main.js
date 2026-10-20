import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";

// Import the file that has the authentication helper function we want to use.
// The function we want to use is called "onAuthReady" which returns the login state
import { onAuthReady } from "/src/authentication.js";

function showName() {
  // Pass a CALLBACK function to run when Firebase finishes checking login status
  onAuthReady(function (user) {
    // Firebase passes the user object (or null)
    if (user) {
      // User is logged in
      const name = user.displayName || user.email; // Use email if name is missing
      document.getElementById("name-goes-here").textContent = name + "!";
    } else {
      // User is NOT logged in
      location.href = "index.html"; // Redirect to login page
    }
  });
}

showName();
// Function to read the quote of the day from Firestore
function readQuote(day) {
  const quoteDocRef = doc(db, "quotes", day); // Get a reference to the document

  onSnapshot(
    quoteDocRef,
    (docSnap) => {
      // Listen for real-time updates
      if (docSnap.exists()) {
        //Document existence check
        document.getElementById("quote-goes-here").textContent =
          docSnap.data().quote;
      } else {
        console.log("No such document!");
      }
    },
    (error) => {
      //Listener/system error
      console.error("Error listening to document: ", error);
    },
  );
}

readQuote("tuesday"); // Call the function with the desired day (e.g., "monday", "tuesday", etc.)
