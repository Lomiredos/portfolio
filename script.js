

function showSection(id) {
    document.querySelectorAll("section").forEach(function(section) {
        section.style.display = "none";
    });
    document.querySelector("#" + id).style.display = "block";
} 