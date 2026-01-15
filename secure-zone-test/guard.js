// secure-zone-test/guard.js
(function() {
    const ticket = sessionStorage.getItem("authTicket");

    // If no ticket is found, kick them back to login
    if (!ticket) {
        alert("Security Alert: No access token found. Please login.");
        // Go back to the root folder premium.html
        window.location.href = "../premium.html";
    }
})();
