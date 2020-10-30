let db;
const req = indexedDB.open("budget", 1);

// Checks if update is needed
req.onupgradeneeded = function(event) {
  event.target.result.createObjectStore("pending", { autoIncrement: true });
};

// An a succesful request, if the navigator is online then start the checkDB function.
req.onsuccess = function(event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDB();
  }
};

// After an unsuccesful request, concole log the error.
req.onerror = function(event) {
  console.log("Error: " + event.target.errorCode);
};

// Save record function saves the record offline. This function is used in index.js on line #139
function saveRecord(rec) {
  db.transaction(["pending"], "readwrite").objectStore("pending").add(rec);
}

// When a request is succesful or when the user is online, this function will take the data saved locally and send it to the database via API request.
function checkDB() {
  const getAll = db.transaction(["pending"], "readwrite").objectStore("pending").getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      }).then(response => response.json()).then(() => {
        db.transaction(["pending"], "readwrite").objectStore("pending").clear();
      });
    }
  };
}

// Event listener that checks if the user is online
window.addEventListener("online", checkDB);
